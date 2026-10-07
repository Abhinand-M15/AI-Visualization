/**
 * Google Drive backup via a service account. Owned by stage S5c (docs/DOMAINS_PLAN.md).
 *
 * Reads the object from Supabase Storage (bucket/path) and uploads it to
 * <DRIVE_FOLDER_ID>/<folder>/<fileName>. NEVER throws. "skipped" when
 * GOOGLE_SERVICE_ACCOUNT_JSON / DRIVE_FOLDER_ID are not set (or the JSON is unusable).
 *
 * No dependencies: the service-account JWT is signed with Node's crypto (RS256) and exchanged
 * for an access token at the token endpoint, then Drive API v3 is called with plain fetch.
 * Credentials, tokens and key material are never logged.
 */
import crypto from "node:crypto";
import { getSupabase } from "@/lib/db";

export interface DriveBackupResult {
  status: "done" | "skipped" | "failed";
  fileId?: string;
}

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const DEFAULT_TOKEN_URI = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
const FOLDER_MIME = "application/vnd.google-apps.folder";

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 4000;
const TOTAL_BUDGET_MS = 45_000;
const MAX_NAME_LENGTH = 120;

interface ServiceAccount {
  clientEmail: string;
  privateKey: string;
  tokenUri: string;
}

class DriveHttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// ---------- credentials ----------

let parsedCache: { raw: string; account: ServiceAccount | null } | null = null;

function parseServiceAccount(raw: string | undefined): ServiceAccount | null {
  if (!raw) return null;
  if (parsedCache && parsedCache.raw === raw) return parsedCache.account;
  let account: ServiceAccount | null = null;
  try {
    let text = raw.trim();
    if (
      text.length > 1 &&
      ((text.startsWith("'") && text.endsWith("'")) || (text.startsWith('"') && text.endsWith('"') && !text.startsWith('{')))
    ) {
      text = text.slice(1, -1).trim();
    }
    if (!text.startsWith("{")) {
      text = Buffer.from(text, "base64").toString("utf8").trim();
    }
    const json = JSON.parse(text) as Record<string, unknown>;
    const email = typeof json.client_email === "string" ? json.client_email.trim() : "";
    let key = typeof json.private_key === "string" ? json.private_key : "";
    key = key.replace(/\\n/g, "\n").trim();
    if (email && key.includes("PRIVATE KEY")) {
      // Fail early if Node cannot read the key.
      crypto.createPrivateKey(key);
      const uri = typeof json.token_uri === "string" && json.token_uri.startsWith("https://") ? json.token_uri : DEFAULT_TOKEN_URI;
      account = { clientEmail: email, privateKey: key, tokenUri: uri };
    }
  } catch {
    account = null;
  }
  parsedCache = { raw, account };
  return account;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function buildSignedJwt(account: ServiceAccount, nowSec: number): string {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: account.clientEmail,
      scope: DRIVE_SCOPE,
      aud: account.tokenUri,
      iat: nowSec,
      exp: nowSec + 3600,
    }),
  );
  const unsigned = `${header}.${claims}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), account.privateKey);
  return `${unsigned}.${b64url(signature)}`;
}

// ---------- retry helpers ----------

let sleepImpl: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms));

function backoffMs(attempt: number): number {
  const exp = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** attempt);
  return Math.round(exp / 2 + Math.random() * (exp / 2));
}

function isRetryableStatus(status: number, bodyText: string): boolean {
  if (status === 429 || status >= 500) return true;
  return status === 403 && /rateLimitExceeded|userRateLimitExceeded/i.test(bodyText);
}

/** fetch with retries on network errors, 429 and 5xx. Returns an ok Response or throws DriveHttpError. */
async function fetchWithRetry(
  url: string,
  init: () => RequestInit,
  deadline: number,
): Promise<Response> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, init());
      if (res.ok) return res;
      const text = await res.text().catch(() => "");
      const err = new DriveHttpError(res.status, `HTTP ${res.status}`);
      if (!isRetryableStatus(res.status, text)) throw err;
      lastError = err;
    } catch (e) {
      if (e instanceof DriveHttpError && !isRetryableStatus(e.status, "")) throw e;
      lastError = e;
    }
    if (attempt === MAX_ATTEMPTS - 1) break;
    const wait = backoffMs(attempt);
    if (Date.now() + wait > deadline) break;
    await sleepImpl(wait);
  }
  throw lastError instanceof Error ? lastError : new Error("request failed");
}

// ---------- access token ----------

let tokenCache: { token: string; expiresAt: number; email: string } | null = null;
let tokenInflight: Promise<string> | null = null;

async function getAccessToken(account: ServiceAccount, deadline: number, force = false): Promise<string> {
  if (!force && tokenCache && tokenCache.email === account.clientEmail && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }
  if (tokenInflight) return tokenInflight;
  tokenInflight = (async () => {
    const assertion = buildSignedJwt(account, Math.floor(Date.now() / 1000));
    const res = await fetchWithRetry(
      account.tokenUri,
      () => ({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion,
        }).toString(),
      }),
      deadline,
    );
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) throw new Error("token response had no access_token");
    const ttl = typeof data.expires_in === "number" && data.expires_in > 0 ? data.expires_in : 3600;
    tokenCache = { token: data.access_token, expiresAt: Date.now() + ttl * 1000, email: account.clientEmail };
    return data.access_token;
  })().finally(() => {
    tokenInflight = null;
  });
  return tokenInflight;
}

/** Authorised Drive call; refreshes the token once on 401. */
async function driveCall(
  account: ServiceAccount,
  deadline: number,
  url: string,
  init: (token: string) => RequestInit,
): Promise<Response> {
  let token = await getAccessToken(account, deadline);
  try {
    return await fetchWithRetry(url, () => init(token), deadline);
  } catch (e) {
    if (e instanceof DriveHttpError && e.status === 401) {
      token = await getAccessToken(account, deadline, true);
      return fetchWithRetry(url, () => init(token), deadline);
    }
    throw e;
  }
}

// ---------- names ----------

function sanitizeName(name: string): string {
  let out = name.replace(/[\u0000-\u001f\u007f/\\]/g, "").trim();
  out = out.replace(/^\.+$/, "");
  if (out.length > MAX_NAME_LENGTH) out = out.slice(0, MAX_NAME_LENGTH).trim();
  return out;
}

function sanitizeFolderPath(folder: string): string[] {
  return folder
    .split(/[\\/]+/)
    .map(sanitizeName)
    .filter(Boolean);
}

function qEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// ---------- Drive operations ----------

const folderCache = new Map<string, Promise<string>>();

const COMMON_LIST_PARAMS = "supportsAllDrives=true&includeItemsFromAllDrives=true&corpora=allDrives&spaces=drive&pageSize=10";

async function findChild(
  account: ServiceAccount,
  deadline: number,
  parentId: string,
  name: string,
  folderOnly: boolean,
): Promise<string | null> {
  const q =
    `name = '${qEscape(name)}' and '${qEscape(parentId)}' in parents and trashed = false` +
    (folderOnly ? ` and mimeType = '${FOLDER_MIME}'` : ` and mimeType != '${FOLDER_MIME}'`);
  const url = `${DRIVE_API}?${COMMON_LIST_PARAMS}&fields=${encodeURIComponent("files(id,name)")}&q=${encodeURIComponent(q)}`;
  const res = await driveCall(account, deadline, url, (token) => ({
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  }));
  const data = (await res.json()) as { files?: { id?: string }[] };
  return data.files?.find((f) => typeof f.id === "string")?.id ?? null;
}

async function createFolder(account: ServiceAccount, deadline: number, parentId: string, name: string): Promise<string> {
  const res = await driveCall(account, deadline, `${DRIVE_API}?supportsAllDrives=true&fields=id`, (token) => ({
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
  }));
  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error("folder create returned no id");
  return data.id;
}

function ensureFolder(account: ServiceAccount, deadline: number, parentId: string, name: string): Promise<string> {
  const key = `${parentId}/${name}`;
  const cached = folderCache.get(key);
  if (cached) return cached;
  const p = (async () => {
    // Look up before creating so concurrent processes / earlier runs do not duplicate folders.
    const existing = await findChild(account, deadline, parentId, name, true);
    if (existing) return existing;
    return createFolder(account, deadline, parentId, name);
  })();
  folderCache.set(key, p);
  p.catch(() => {
    if (folderCache.get(key) === p) folderCache.delete(key);
  });
  return p;
}

async function ensureFolderPath(account: ServiceAccount, deadline: number, rootId: string, segments: string[]): Promise<string> {
  let parent = rootId;
  for (const seg of segments) parent = await ensureFolder(account, deadline, parent, seg);
  return parent;
}

function buildMultipart(metadata: object, data: Buffer, contentType: string): { body: Buffer; boundary: string } {
  const boundary = `wd_${crypto.randomBytes(12).toString("hex")}`;
  const head = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
  );
  const tail = Buffer.from(`\r\n--${boundary}--`);
  return { body: Buffer.concat([head, data, tail]), boundary };
}

async function uploadFile(
  account: ServiceAccount,
  deadline: number,
  folderId: string,
  fileName: string,
  data: Buffer,
  contentType: string,
): Promise<string> {
  const existingId = await findChild(account, deadline, folderId, fileName, false);
  const metadata = existingId ? { name: fileName } : { name: fileName, parents: [folderId] };
  const { body, boundary } = buildMultipart(metadata, data, contentType);
  const url = existingId
    ? `${DRIVE_UPLOAD}/${encodeURIComponent(existingId)}?uploadType=multipart&supportsAllDrives=true&fields=id`
    : `${DRIVE_UPLOAD}?uploadType=multipart&supportsAllDrives=true&fields=id`;
  const res = await driveCall(account, deadline, url, (token) => ({
    method: existingId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
      "Content-Length": String(body.length),
    },
    body: body as unknown as BodyInit,
  }));
  const json = (await res.json()) as { id?: string };
  return json.id ?? existingId ?? "";
}

// ---------- download from Supabase ----------

async function defaultDownload(bucket: string, path: string): Promise<{ data: Buffer; type?: string } | null> {
  const { data, error } = await getSupabase().storage.from(bucket).download(path);
  if (error || !data) return null;
  return { data: Buffer.from(await data.arrayBuffer()), type: data.type || undefined };
}

let downloadImpl = defaultDownload;

// ---------- public API ----------

export async function backupToDrive(opts: {
  bucket: string;
  path: string;
  folder: string;
  fileName: string;
  contentType?: string;
}): Promise<DriveBackupResult> {
  try {
    const rootId = process.env.DRIVE_FOLDER_ID?.trim();
    const account = parseServiceAccount(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    if (!rootId || !account) return { status: "skipped" };

    const file = await downloadImpl(opts.bucket, opts.path);
    if (!file) {
      console.error("[driveBackup] could not read object from storage", opts.bucket);
      return { status: "failed" };
    }
    const fileName = sanitizeName(opts.fileName) || "file";
    const segments = sanitizeFolderPath(opts.folder);
    const contentType = opts.contentType || file.type || "application/octet-stream";
    const deadline = Date.now() + TOTAL_BUDGET_MS;

    for (let pass = 0; pass < 2; pass++) {
      try {
        const folderId = await ensureFolderPath(account, deadline, rootId, segments);
        const fileId = await uploadFile(account, deadline, folderId, fileName, file.data, contentType);
        return fileId ? { status: "done", fileId } : { status: "done" };
      } catch (e) {
        // A cached folder may have been deleted in Drive: forget the cache and try once more.
        if (pass === 0 && e instanceof DriveHttpError && e.status === 404) {
          folderCache.clear();
          continue;
        }
        throw e;
      }
    }
    return { status: "failed" };
  } catch (e) {
    const detail = e instanceof DriveHttpError ? `HTTP ${e.status}` : e instanceof Error ? e.name : "error";
    console.error("[driveBackup] backup failed:", detail);
    return { status: "failed" };
  }
}

/** Test hooks only. Not part of the public contract. */
export const __driveBackupInternals = {
  parseServiceAccount,
  buildSignedJwt,
  sanitizeName,
  sanitizeFolderPath,
  qEscape,
  buildMultipart,
  reset(): void {
    parsedCache = null;
    tokenCache = null;
    tokenInflight = null;
    folderCache.clear();
  },
  setSleep(fn: (ms: number) => Promise<void>): void {
    sleepImpl = fn;
  },
  setDownload(fn: typeof defaultDownload): void {
    downloadImpl = fn;
  },
};
