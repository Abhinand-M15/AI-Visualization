// Deploys THIS folder to the Vercel project "warpdrive-studio" (creates the project if needed),
// syncs its environment variables from .env.local, and waits until the deployment is ready.
//
// Usage (PowerShell):   $env:VC_TOKEN = "<vercel token>"; node scripts/deploy-studio.mjs
// Usage (bash):         VC_TOKEN=<vercel token> node scripts/deploy-studio.mjs
//
// Notes:
//  - Only run this when the owner says to deploy. It publishes to production.
//  - The Vercel token is read from VC_TOKEN and is never written anywhere except as the app's own
//    VERCEL_TOKEN setting on the project (the app uses it to publish story sites).
//  - Secrets come from .env.local (never printed). Files such as node_modules, .next and .env* are not uploaded.
//  - Set VC_PROJECT to deploy somewhere else (default warpdrive-studio).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, resolve } from "node:path";

const TOKEN = process.env.VC_TOKEN;
if (!TOKEN) throw new Error("Set VC_TOKEN to a Vercel access token first.");
const SRC = resolve(process.env.SRC_DIR || process.cwd());
const NAME = process.env.VC_PROJECT || "warpdrive-studio";
const API = "https://api.vercel.com";
const J = { Authorization: `Bearer ${TOKEN}`, "content-type": "application/json" };

const env = Object.fromEntries(
  readFileSync(join(SRC, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).trim()];
    }),
);

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
];
for (const [key, value, type] of vars) {
  if (!value) { console.log("skip (empty):", key); continue; }
  const r = await call("POST", `/v10/projects/${projectId}/env?upsert=true`, { key, value, type, target: ["production", "preview"] });
  console.log("env", key, r.status, r.ok ? "ok" : JSON.stringify(r.j).slice(0, 200));
}

// 3. upload files (skipping build output, dependencies and secrets)
const SKIP_DIRS = new Set([".git", "node_modules", ".next", ".vercel", "published"]);
const SKIP_FILES = (n) => n.startsWith(".env") && n !== ".env.local.example" || n === "tsconfig.tsbuildinfo" || n === "next-env.d.ts";
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const f = join(d, n);
    if (statSync(f).isDirectory()) {
      if (!SKIP_DIRS.has(n) || (n === "published" && !f.endsWith(join("public", "published")))) walk(f);
    } else if (!SKIP_FILES(n)) files.push(f);
  }
})(SRC);
const list = [];
let uploaded = 0;
for (const f of files) {
  const buf = readFileSync(f);
  const sha = createHash("sha1").update(buf).digest("hex");
  const rel = relative(SRC, f).replace(/\\/g, "/");
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
console.log("uploaded files:", uploaded);

// 4. deploy and wait
const d = await call("POST", "/v13/deployments?skipAutoDetectionConfirmation=1", {
  name: NAME, project: NAME, target: "production", files: list, projectSettings: { framework: "nextjs" },
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
    process.exit(s.j.readyState === "READY" ? 0 : 1);
  }
}
