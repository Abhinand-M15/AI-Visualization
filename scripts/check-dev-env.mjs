// Guard that runs before `npm run dev` (the "predev" script) and on `npm run check:env`.
//
// Local development should use a SEPARATE free Supabase project (the dev database), never the
// production one (audit finding AR-04): with AUTH_ENABLED unset the local app skips every owner
// filter, so a laptop pointed at production can read, change or delete any user's project.
//
// What it does (reads .env.local and .env.development.local the way Next does; prints names only,
// never values):
//  - SUPABASE_URL points at the production project and AUTH_ENABLED is not 1: refuses to start.
//    Set ALLOW_PROD_DB=1 (in .env.local or the shell) to override for one deliberate session.
//  - SUPABASE_URL points at production with AUTH_ENABLED=1: starts, with a warning.
//  - Anything else: starts silently (plus a note when SUPABASE_URL is missing).
//
// The production project ref defaults to the one in HANDOFF.md; override it with SUPABASE_PROD_REF.
// Setup of the dev project: docs/DEPLOYMENT.md section 9.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_PROD_REF = "tykmwaqszlisqxdnlbjv";

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2").trim();
  }
  return out;
}

const root = process.cwd();
// Same precedence as Next in development: shell > .env.development.local > .env.local.
const env = {
  ...readEnvFile(join(root, ".env.local")),
  ...readEnvFile(join(root, ".env.development.local")),
  ...Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined && v !== "")),
};

const prodRef = (env.SUPABASE_PROD_REF || DEFAULT_PROD_REF).trim().toLowerCase();
const refOf = (url) => /^https?:\/\/([a-z0-9]+)\.supabase\.(co|in)\b/i.exec(url || "")?.[1]?.toLowerCase();

const serverRef = refOf(env.SUPABASE_URL);
const browserRef = refOf(env.NEXT_PUBLIC_SUPABASE_URL);
const authOn = env.AUTH_ENABLED === "1";
const allowProd = env.ALLOW_PROD_DB === "1";

if (!env.SUPABASE_URL) {
  console.log("[check-dev-env] SUPABASE_URL is not set: pages that need the database will show errors. See .env.local.example.");
  process.exit(0);
}

if (serverRef && browserRef && serverRef !== browserRef) {
  console.log(
    "[check-dev-env] Warning: SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL point at different Supabase projects. " +
      "Sign-in and data would come from different databases."
  );
}

const onProd = serverRef === prodRef || browserRef === prodRef;
if (!onProd) process.exit(0);

const banner = (lines) => console.log(["", "=".repeat(78), ...lines.map((l) => "  " + l), "=".repeat(78), ""].join("\n"));

if (!authOn && !allowProd) {
  banner([
    "STOP: .env.local points local development at the PRODUCTION Supabase project,",
    "with AUTH_ENABLED unset. In that mode every owner check is skipped, so this",
    "laptop could read, change or delete any user's project (audit AR-04).",
    "",
    "Fix: create a second free Supabase project for development and put its",
    "SUPABASE_URL / keys in .env.local (docs/DEPLOYMENT.md section 9).",
    "",
    "Deliberate one-off override:  ALLOW_PROD_DB=1 npm run dev",
    "(PowerShell:  $env:ALLOW_PROD_DB = \"1\"; npm run dev)",
  ]);
  process.exit(1);
}

banner([
  "WARNING: local development is using the PRODUCTION Supabase project.",
  authOn ? "AUTH_ENABLED=1, so owner checks apply, but this is still real data." : "ALLOW_PROD_DB=1 is set: owner checks are OFF. Real data. Be careful.",
  "Prefer a separate dev project (docs/DEPLOYMENT.md section 9).",
]);
process.exit(0);
