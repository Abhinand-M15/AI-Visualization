import { createHash } from "node:crypto";

export interface DeployFile {
  file: string;
  data: string;
  encoding?: "base64";
}

interface VercelDeploymentResponse {
  id: string;
  url: string;
  readyState: string;
  alias?: string[];
  aliasAssigned?: boolean;
}

export interface DeployResult {
  /** Public URL visitors should use (custom domain, else the production alias). */
  url: string;
  deploymentId: string;
  projectName: string;
}

export interface DeployOptions {
  /**
   * Full custom hostname (`<subdomain>.<PUBLISH_BASE_DOMAIN>`) to attach to
   * the Vercel project after the deployment is READY. Omit for `.vercel.app`.
   */
  customDomain?: string;
}

const API = "https://api.vercel.com";

function getConfig() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error("VERCEL_TOKEN is not set. Add it to .env.local (see .env.local.example).");
  }
  return { token, teamId: process.env.VERCEL_TEAM_ID };
}

function withTeam(url: string, teamId?: string) {
  return teamId ? `${url}${url.includes("?") ? "&" : "?"}teamId=${teamId}` : url;
}

// ---------------------------------------------------------------------------
// Files every published bundle carries, added here (not in staticSite.ts) so
// they apply to every deployment regardless of template.
// ---------------------------------------------------------------------------

/**
 * Vercel reads vercel.json from the uploaded files of a file-based
 * deployment. Published sites must never be indexed and must not be
 * frameable by other origins. No Content-Security-Policy: templates pull
 * scripts/fonts from CDNs and audio from Supabase, and a wrong CSP would
 * silently break playback.
 */
const SITE_VERCEL_JSON = {
  cleanUrls: true,
  trailingSlash: false,
  headers: [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      ],
    },
  ],
};

const SITE_ROBOTS_TXT = "User-agent: *\nDisallow: /\n";

// Deliberately contains no links or navigation (published sites must not
// point back at the generator app or anywhere else).
const SITE_404_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Page not found</title>
<style>
  :root { color-scheme: light dark; --bg: #f7f7fb; --fg: #17171f; --muted: #6b6b80; }
  @media (prefers-color-scheme: dark) { :root { --bg: #07070d; --fg: #eef0ff; --muted: #9ea3c7; } }
  html, body { height: 100%; margin: 0; }
  body { display: flex; align-items: center; justify-content: center; background: var(--bg); color: var(--fg);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 16px; }
  h1 { font-size: 1.5rem; margin: 0 0 8px; }
  p { margin: 0; color: var(--muted); line-height: 1.5; }
</style>
</head>
<body>
<main>
  <h1>This page doesn't exist</h1>
  <p>The address may be mistyped, or the page has moved.</p>
</main>
</body>
</html>
`;

function textFile(file: string, contents: string): DeployFile {
  return { file, data: Buffer.from(contents, "utf-8").toString("base64"), encoding: "base64" };
}

/** Adds vercel.json and robots.txt (always ours) and 404.html (unless the bundle has one). */
export function withSiteHardeningFiles(files: DeployFile[]): DeployFile[] {
  const ours = new Set(["vercel.json", "robots.txt"]);
  const kept = files.filter((file) => !ours.has(file.file));
  const extra: DeployFile[] = [
    textFile("vercel.json", JSON.stringify(SITE_VERCEL_JSON, null, 2)),
    textFile("robots.txt", SITE_ROBOTS_TXT),
  ];
  if (!kept.some((file) => file.file === "404.html")) extra.push(textFile("404.html", SITE_404_HTML));
  return [...kept, ...extra];
}

// ---------------------------------------------------------------------------
// Upload + deploy
// ---------------------------------------------------------------------------

// Inlining every file's base64 in the deployment request hits Vercel's 10mb
// request-body limit as soon as a bundle carries an avatar model or video, so
// each file is uploaded on its own first (keyed by SHA-1) and the deployment
// then references them by digest. Re-uploading an identical file is a no-op.
async function uploadFile(file: DeployFile, token: string, teamId?: string) {
  const buffer = file.encoding === "base64" ? Buffer.from(file.data, "base64") : Buffer.from(file.data, "utf-8");
  const sha = createHash("sha1").update(buffer).digest("hex");

  const res = await fetch(withTeam(`${API}/v2/files`, teamId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "Content-Length": String(buffer.length),
      "x-vercel-digest": sha,
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message: string } };
    throw new Error(`Vercel file upload failed for ${file.file}: ${body.error?.message ?? res.statusText}`);
  }

  return { file: file.file, sha, size: buffer.length };
}

/**
 * Attaches `domain` to the project (POST /v10/projects/{idOrName}/domains).
 * Must run after a successful production deployment (Vercel rejects it
 * otherwise). Once attached, Vercel serves it from the current production
 * deployment and every later one. "Already on this project" is success.
 */
async function attachProjectDomain(projectName: string, domain: string, token: string, teamId?: string) {
  const existing = await fetch(
    withTeam(`${API}/v9/projects/${encodeURIComponent(projectName)}/domains/${encodeURIComponent(domain)}`, teamId),
    { headers: { Authorization: `Bearer ${token}` } }
  );
  let verified: boolean | undefined;
  if (existing.ok) {
    verified = ((await existing.json()) as { verified?: boolean }).verified;
  } else {
    const res = await fetch(withTeam(`${API}/v10/projects/${encodeURIComponent(projectName)}/domains`, teamId), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: domain }),
    });
    const body = (await res.json().catch(() => ({}))) as { verified?: boolean; error?: { code?: string; message?: string } };
    if (!res.ok) {
      if (res.status === 409) {
        throw new Error(`The address ${domain} is already assigned to another Vercel project. Choose a different address.`);
      }
      throw new Error(`Attaching ${domain} failed: ${body.error?.message ?? res.statusText}`);
    }
    verified = body.verified;
  }
  if (verified === false) {
    throw new Error(
      `${domain} was added to the Vercel project but is not verified. Add the wildcard domain for PUBLISH_BASE_DOMAIN to the Vercel team (see the publish setup notes) and publish again.`
    );
  }
}

/**
 * Deploys `files` as the production deployment of Vercel project
 * `projectName` (created on first deploy). The project name decides the
 * production alias `<projectName>.vercel.app`, unless that global name is
 * already taken by someone else, in which case Vercel picks a suffixed alias;
 * the returned URL is whatever Vercel actually assigned.
 */
export async function deployToVercelDetailed(
  projectName: string,
  files: DeployFile[],
  options: DeployOptions = {}
): Promise<DeployResult> {
  const { token, teamId } = getConfig();

  const uploaded = await Promise.all(withSiteHardeningFiles(files).map((file) => uploadFile(file, token, teamId)));

  const createRes = await fetch(withTeam(`${API}/v13/deployments`, teamId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      files: uploaded,
      target: "production",
      // Marks deployments made by the story generator (see isStorySiteProject).
      meta: { storySite: "1" },
      // Required when this deploy creates the Vercel project. The bundle is
      // plain prebuilt static files, so no framework and no build step.
      projectSettings: { framework: null, buildCommand: null, installCommand: null, outputDirectory: null },
    }),
  });

  const created = (await createRes.json()) as VercelDeploymentResponse & { error?: { message: string } };
  if (!createRes.ok) {
    throw new Error(`Vercel deployment creation failed: ${created.error?.message ?? createRes.statusText}`);
  }

  const deploymentId = created.id;
  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusRes = await fetch(withTeam(`${API}/v13/deployments/${deploymentId}`, teamId), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const status = (await statusRes.json()) as VercelDeploymentResponse;

    // The per-deployment URL sits behind Vercel's default Deployment
    // Protection (visitors get a login wall); the production alias
    // (<project>.vercel.app) is the public one, so wait for it to be assigned.
    if (status.readyState === "READY" && (status.aliasAssigned || attempt === maxAttempts - 1)) {
      if (options.customDomain) {
        await attachProjectDomain(projectName, options.customDomain, token, teamId);
        return { url: `https://${options.customDomain}`, deploymentId, projectName };
      }
      const preferred = `${projectName}.vercel.app`;
      const alias = status.alias?.find((host) => host === preferred) ?? status.alias?.[0] ?? status.url;
      return { url: `https://${alias}`, deploymentId, projectName };
    }
    if (status.readyState === "ERROR" || status.readyState === "CANCELED") {
      throw new Error(`Vercel deployment failed with state: ${status.readyState}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Vercel deployment timed out waiting for READY state.");
}

/** Backwards-compatible wrapper: returns only the public URL. */
export async function deployToVercel(projectName: string, files: DeployFile[], options: DeployOptions = {}): Promise<string> {
  return (await deployToVercelDetailed(projectName, files, options)).url;
}

// ---------------------------------------------------------------------------
// Read-only lookups used by the subdomain availability check. None of these
// create or modify anything on Vercel.
// ---------------------------------------------------------------------------

/** PUBLISH_BASE_DOMAIN, cleaned up ("https://Stories.Example.com/" → "stories.example.com"), or null. */
export function getPublishBaseDomain(): string | null {
  const raw = process.env.PUBLISH_BASE_DOMAIN?.trim().toLowerCase();
  if (!raw) return null;
  const cleaned = raw.replace(/^[a-z]+:\/\//, "").replace(/\/.*$/, "").replace(/^\*?\.+/, "").replace(/\.+$/, "");
  return cleaned || null;
}

/** Hostname a site label (prefix + name, = Vercel project name) publishes at: `<label>.<base>` or `<label>.vercel.app`. */
export function siteHostFor(label: string): string {
  const base = getPublishBaseDomain();
  return `${label}.${base ?? "vercel.app"}`;
}

export interface VercelProjectInfo {
  id: string;
  name: string;
  framework: string | null;
  hasGitLink: boolean;
}

/** GET /v9/projects/{name}: the project with that name on our account/team, or null (404). */
export async function findVercelProject(name: string): Promise<VercelProjectInfo | null> {
  const { token, teamId } = getConfig();
  const res = await fetch(withTeam(`${API}/v9/projects/${encodeURIComponent(name)}`, teamId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Vercel project lookup failed (${res.status}).`);
  const body = (await res.json()) as { id: string; name: string; framework?: string | null; link?: unknown };
  return { id: body.id, name: body.name, framework: body.framework ?? null, hasGitLink: Boolean(body.link) };
}

/**
 * Story-site projects are created by deployToVercelDetailed with no framework
 * and no Git link. Anything else with the same name (e.g. the generator app
 * itself) must never be deployed over.
 */
export function isStorySiteProject(project: VercelProjectInfo): boolean {
  return !project.hasGitLink && project.framework === null;
}

/** GET /v4/aliases/{host}: which project on our account serves this host, or null (404 = not ours / not aliased). */
export async function findAliasProjectId(host: string): Promise<string | null> {
  const { token, teamId } = getConfig();
  const res = await fetch(withTeam(`${API}/v4/aliases/${encodeURIComponent(host)}`, teamId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Vercel alias lookup failed (${res.status}).`);
  const body = (await res.json()) as { projectId?: string | null };
  return body.projectId ?? "";
}

/** GET /v9/projects/{name}/domains/{domain}: whether the domain is already attached to that project. */
export async function projectHasDomain(projectName: string, domain: string): Promise<boolean> {
  const { token, teamId } = getConfig();
  const res = await fetch(
    withTeam(`${API}/v9/projects/${encodeURIComponent(projectName)}/domains/${encodeURIComponent(domain)}`, teamId),
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  return res.ok;
}

export type HostProbe = "free" | "in-use" | "unknown";

/**
 * HEAD https://<host>. Vercel answers an unclaimed host with 404 +
 * `x-vercel-error: DEPLOYMENT_NOT_FOUND`; any other answer (200, 3xx, 401
 * behind protection…) means some deployment already serves it.
 */
export async function probeHost(host: string): Promise<HostProbe> {
  try {
    const res = await fetch(`https://${host}/`, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (res.status === 404 && res.headers.get("x-vercel-error") === "DEPLOYMENT_NOT_FOUND") return "free";
    return "in-use";
  } catch {
    // DNS failure / timeout: can't tell.
    return "unknown";
  }
}
