// Deploys the CURRENT COMMIT (git HEAD) of this repository to the Vercel project "warpdrive-studio"
// (creates the project if needed), syncs its environment variables from the PRODUCTION env file, records the
// commit SHA on the deployment, and waits until the deployment is ready.
//
// Usage (PowerShell):   $env:VC_TOKEN = "<vercel token>"; node scripts/deploy-studio.mjs
// Usage (bash):         VC_TOKEN=<vercel token> node scripts/deploy-studio.mjs
// Options:              --allow-dirty   deploy even with uncommitted or untracked files
//                                       (HEAD is still what is deployed; local changes are NOT)
//
// Notes:
//  - Only run this when the owner says to deploy. It publishes to production.
//  - What is uploaded is exactly the files of HEAD, read from git (like `git archive HEAD`), never
//    the working tree. So uncommitted edits can never ship by accident, and every deployment maps
//    to one commit. The script refuses to run when the working tree has uncommitted changes or
//    untracked files, unless --allow-dirty is passed.
//  - The commit SHA is stored as deployment meta (gitCommitSha, visible in the Vercel API and
//    used to find the deployment to roll back to) and as the APP_COMMIT_SHA env var of the app.
//  - The previous production deployment is printed before deploying, for Instant Rollback.
//  - The Vercel token is read from VC_TOKEN and is never written anywhere except as the app's own
//    VERCEL_TOKEN setting on the project (the app uses it to publish story sites).
//  - Production values come from .env.deploy.local (or the file named by DEPLOY_ENV_FILE), falling back
//    to .env.local for older setups. Since local development uses a separate dev database
//    (docs/DEPLOYMENT.md section 9), .env.local holds DEV values and .env.deploy.local holds the
//    production ones. Deploying warpdrive-studio refuses to run when that file's SUPABASE_URL is not
//    the production project (ref in SUPABASE_PROD_REF, default from HANDOFF.md), so dev values can
//    never be copied into production. Values are never printed. .env* files are never uploaded.
//  - Set VC_PROJECT to deploy somewhere else (default warpdrive-studio), SRC_DIR to deploy another checkout.
//  - Pre-deploy checklist and rollback: docs/DEPLOYMENT.md section 10.
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join, relative, resolve } from "node:path";

const args = new Set(process.argv.slice(2));
const ALLOW_DIRTY = args.has("--allow-dirty");
for (const arg of args) {
  if (arg !== "--allow-dirty") throw new Error(`Unknown option ${arg}. The only option is --allow-dirty.`);
}

const TOKEN = process.env.VC_TOKEN;
if (!TOKEN) throw new Error("Set VC_TOKEN to a Vercel access token first.");
const SRC = resolve(process.env.SRC_DIR || process.cwd());
const NAME = process.env.VC_PROJECT || "warpdrive-studio";
const API = "https://api.vercel.com";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** dd MMM yyyy (house date format), e.g. 04 Nov 2026. */
const fmtDate = (d) => `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const J = { Authorization: `Bearer ${TOKEN}`, "content-type": "application/json" };

// 0. git: clean tree, commit SHA, file list of HEAD
function git(gitArgs, options = {}) {
  return execFileSync("git", gitArgs, { cwd: SRC, maxBuffer: 1024 * 1024 * 1024, ...options });
}
const gitText = (gitArgs) => git(gitArgs, { encoding: "utf8" }).trim();

let commitSha;
try {
  commitSha = gitText(["rev-parse", "HEAD"]);
} catch {
  throw new Error(`${SRC} is not a git checkout with a commit. Deploys are made from a commit.`);
}
const shortSha = commitSha.slice(0, 7);
const branch = gitText(["rev-parse", "--abbrev-ref", "HEAD"]);
const subject = gitText(["log", "-1", "--format=%s"]);
const status = gitText(["status", "--porcelain=v1", "--untracked-files=all"]);
const dirty = status.length > 0;

if (dirty) {
  const lines = status.split("\n");
  console.log(`Working tree is not clean (${lines.length} changed or untracked files):`);
  for (const line of lines.slice(0, 20)) console.log("  " + line);
  if (lines.length > 20) console.log(`  ... and ${lines.length - 20} more`);
  if (!ALLOW_DIRTY) {
    console.log("Refusing to deploy. Commit (or stash) the changes first, or pass --allow-dirty to deploy HEAD anyway.");
    process.exit(1);
  }
  console.log("--allow-dirty: deploying HEAD only; the changes above are NOT included.");
}

// Local refs only (no fetch): warn when this is not master or master has not been pushed.
if (branch !== "master") console.log(`Warning: deploying branch "${branch}", not master.`);
try {
  const upstream = gitText(["rev-parse", "origin/master"]);
  if (upstream !== commitSha) console.log("Warning: HEAD is not the same commit as origin/master (as last fetched). Push first?");
} catch {
  console.log("Warning: origin/master not found locally; cannot check that this commit is pushed.");
}

console.log(`Deploying commit ${commitSha} (${branch}): ${subject}`);

// Tracked files of HEAD: "<mode> <type> <sha>\t<path>", NUL-separated.
const SKIP_FILE = (path) => {
  const name = path.split("/").pop();
  return (name.startsWith(".env") && name !== ".env.local.example") || path.startsWith("public/published/");
};
const tree = git(["ls-tree", "-r", "-z", "--full-tree", commitSha], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
  .map((entry) => {
    const tab = entry.indexOf("\t");
    const [mode, type, blob] = entry.slice(0, tab).split(" ");
    return { mode, type, blob, path: entry.slice(tab + 1) };
  });
const entries = [];
for (const entry of tree) {
  if (entry.type !== "blob") { console.log("skip (not a file):", entry.path); continue; }
  if (entry.mode === "120000") { console.log("skip (symlink):", entry.path); continue; }
  if (SKIP_FILE(entry.path)) { console.log("skip (excluded):", entry.path); continue; }
  entries.push(entry);
}
if (entries.length === 0) throw new Error("HEAD has no files to deploy.");

// Production env values (names only are ever printed).
const PROD_PROJECT = "warpdrive-studio";
const PROD_REF = (process.env.SUPABASE_PROD_REF || "tykmwaqszlisqxdnlbjv").trim().toLowerCase();
const envFile = process.env.DEPLOY_ENV_FILE
  ? resolve(SRC, process.env.DEPLOY_ENV_FILE)
  : existsSync(join(SRC, ".env.deploy.local"))
    ? join(SRC, ".env.deploy.local")
    : join(SRC, ".env.local");
if (!existsSync(envFile)) throw new Error(`Env file not found: ${envFile}`);
console.log("env values from:", relative(SRC, envFile));
const env = Object.fromEntries(
  readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).trim()];
    }),
);

const envRef = /^https?:\/\/([a-z0-9]+)\.supabase\.(co|in)\b/i.exec(env.SUPABASE_URL || "")?.[1]?.toLowerCase();
if (NAME === PROD_PROJECT && envRef !== PROD_REF) {
  console.log(
    `Refusing to deploy ${NAME}: SUPABASE_URL in ${envFile} is ${envRef ? `project ${envRef}` : "missing"}, ` +
      `not the production project. Put the production values in .env.deploy.local (docs/DEPLOYMENT.md section 9).`,
  );
  process.exit(1);
}

async function call(method, path, body) {
  const r = await fetch(API + path, { method, headers: J, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  let j;
  try { j = JSON.parse(t); } catch { j = { raw: t }; }
  return { status: r.status, ok: r.ok, j };
}

// 1. project
let p = await call("GET", `/v9/projects/${NAME}`);
if (p.status === 404) {
  p = await call("POST", "/v10/projects", { name: NAME, framework: "nextjs" });
  console.log("project create:", p.status);
} else console.log("project exists:", p.status);
if (!p.ok) { console.log(JSON.stringify(p.j).slice(0, 300)); process.exit(1); }
const projectId = p.j.id;

// 1b. the current production deployment (the one to roll back to if this deploy goes wrong)
try {
  const prev = await call("GET", `/v6/deployments?projectId=${encodeURIComponent(projectId)}&target=production&state=READY&limit=1`);
  const last = prev.ok ? prev.j.deployments?.[0] : undefined;
  if (last) {
    const when = fmtDate(new Date(last.created));
    console.log(
      `previous production deployment (for Instant Rollback): ${last.uid} https://${last.url} created ${when}` +
        ` commit ${last.meta?.gitCommitSha || "unknown (deployed before SHAs were recorded)"}`,
    );
  } else console.log("previous production deployment: none found", prev.ok ? "" : prev.status);
} catch (e) {
  console.log("previous production deployment: lookup failed", e?.message || e);
}

// 2. environment variables (secret ones are stored as "sensitive"). Empty values are skipped.
const appUrl = `https://${NAME}.vercel.app`;
const vars = [
  ["SUPABASE_URL", env.SUPABASE_URL, "plain"],
  ["SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY, "sensitive"],
  ["NEXT_PUBLIC_SUPABASE_URL", env.NEXT_PUBLIC_SUPABASE_URL, "plain"],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "plain"],
  ["KEY_ENCRYPTION_SECRET", env.KEY_ENCRYPTION_SECRET, "sensitive"],
  ["VERCEL_TOKEN", TOKEN, "sensitive"], // the app publishes story sites with this token: do not revoke it
  ["APP_BASE_URL", appUrl, "plain"],
  ["AUTH_ENABLED", "1", "plain"],
  ["TTS_PROVIDER", "edge", "plain"],
  ["CLOUDFLARE_ACCOUNT_ID", env.CLOUDFLARE_ACCOUNT_ID, "plain"],
  ["CLOUDFLARE_API_TOKEN", env.CLOUDFLARE_API_TOKEN, "sensitive"],
  ["GOOGLE_SERVICE_ACCOUNT_JSON", env.GOOGLE_SERVICE_ACCOUNT_JSON, "sensitive"],
  ["DRIVE_FOLDER_ID", env.DRIVE_FOLDER_ID, "plain"],
  // Who may create an account (src/lib/auth/signupPolicy.ts). Both unset = sign-up closed.
  ["SIGNUP_ALLOWED_EMAIL_DOMAINS", env.SIGNUP_ALLOWED_EMAIL_DOMAINS, "plain"],
  ["SIGNUP_ALLOWED_EMAILS", env.SIGNUP_ALLOWED_EMAILS, "sensitive"],
  ["AUTH_ENFORCE_ALLOWLIST", env.AUTH_ENFORCE_ALLOWLIST, "plain"],
  // Which commit is live (readable by the app, e.g. for a health or about endpoint).
  ["APP_COMMIT_SHA", commitSha, "plain"],
];
for (const [key, value, type] of vars) {
  if (!value) { console.log("skip (empty):", key); continue; }
  const r = await call("POST", `/v10/projects/${projectId}/env?upsert=true`, { key, value, type, target: ["production", "preview"] });
  console.log("env", key, r.status, r.ok ? "ok" : JSON.stringify(r.j).slice(0, 200));
}

// 3. upload the files of HEAD (read from git, not from the working tree)
const list = [];
let uploaded = 0;
for (const entry of entries) {
  const buf = git(["cat-file", "blob", entry.blob]);
  const sha = createHash("sha1").update(buf).digest("hex");
  const rel = entry.path;
  list.push({ file: rel, sha, size: buf.length });
  let ok = false;
  for (let attempt = 1; attempt <= 5 && !ok; attempt++) {
    try {
      const r = await fetch(`${API}/v2/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/octet-stream", "x-vercel-digest": sha, "Content-Length": String(buf.length) },
        body: buf,
      });
      if (r.ok || r.status === 409) ok = true;
      else console.log("upload retry", rel, r.status, "attempt", attempt);
    } catch (e) {
      console.log("upload network retry", rel, "attempt", attempt, e?.cause?.code || e?.message);
    }
    if (!ok) await new Promise((res) => setTimeout(res, 1500 * attempt));
  }
  if (!ok) { console.log("upload failed for", rel); process.exit(1); }
  uploaded++;
}
console.log("uploaded files:", uploaded, "from commit", shortSha);

// 4. deploy and wait
const d = await call("POST", "/v13/deployments?skipAutoDetectionConfirmation=1", {
  name: NAME,
  project: NAME,
  target: "production",
  files: list,
  projectSettings: { framework: "nextjs" },
  meta: {
    gitCommitSha: commitSha,
    gitCommitRef: branch,
    gitCommitMessage: subject.slice(0, 200),
    gitDirty: dirty ? "1" : "0",
    deployedWith: "scripts/deploy-studio.mjs",
  },
});
console.log("deployment:", d.status, d.ok ? `${d.j.id} ${d.j.url} state=${d.j.readyState}` : JSON.stringify(d.j).slice(0, 500));
if (!d.ok) process.exit(1);
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 10000));
  const s = await call("GET", `/v13/deployments/${d.j.id}`);
  console.log("state:", s.j.readyState);
  if (["READY", "ERROR", "CANCELED"].includes(s.j.readyState)) {
    console.log("aliases:", (s.j.alias || []).join(", "));
    if (s.j.readyState === "ERROR") console.log("error:", JSON.stringify(s.j.errorMessage || s.j.error || "").slice(0, 300));
    console.log(`commit: ${commitSha}${dirty ? " (working tree had local changes, not deployed)" : ""}`);
    if (s.j.readyState === "READY") {
      console.log(`Next: tag it, e.g.  git tag deploy-${fmtDate(new Date()).replace(/ /g, "-")} ${shortSha}`);
    }
    process.exit(s.j.readyState === "READY" ? 0 : 1);
  }
}
console.log(`commit: ${commitSha} (deployment still not ready after 10 minutes; check the Vercel dashboard)`);
process.exit(1);
