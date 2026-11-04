// Applies one SQL migration file to the Supabase project through the Management API.
//
// Usage (PowerShell):  $env:SB_PAT = "<supabase access token>"; node scripts/apply-migration.mjs db/migrations/005_lead_sheet_prompts.sql
// Usage (bash):        SB_PAT=<supabase access token> node scripts/apply-migration.mjs db/migrations/005_lead_sheet_prompts.sql
// Production:          add --prod (required when the target is the production project), e.g.
//                      SB_PAT=<token> node scripts/apply-migration.mjs db/migrations/005_lead_sheet_prompts.sql --prod
//
// Notes:
//  - Only run this when the owner says to apply a migration. It changes the production database.
//  - Create the token at Supabase -> Account -> Access Tokens; revoke it afterwards.
//  - The project ref is the part of SUPABASE_URL before ".supabase.co" (override with SUPABASE_REF).
//  - Migrations are idempotent (safe to run twice) but 004 and 005 overwrite stored prompts, see their headers.
//  - Apply to the dev project first (the one in .env.local, see docs/DEPLOYMENT.md section 9), then to
//    production with --prod. The production ref defaults to the one in HANDOFF.md (override: SUPABASE_PROD_REF).
import { readFileSync } from "node:fs";

const PROD_REF = (process.env.SUPABASE_PROD_REF || "tykmwaqszlisqxdnlbjv").trim().toLowerCase();
const cli = process.argv.slice(2);
const PROD = cli.includes("--prod");
const file = cli.find((a) => !a.startsWith("--"));
if (!file) throw new Error("Pass the migration file, e.g. db/migrations/005_lead_sheet_prompts.sql");
const pat = process.env.SB_PAT;
if (!pat) throw new Error("Set SB_PAT to a Supabase access token first.");

let ref = process.env.SUPABASE_REF;
if (!ref) {
  const env = readFileSync(".env.local", "utf8");
  const url = /^SUPABASE_URL=(.*)$/m.exec(env)?.[1]?.trim() ?? "";
  ref = /^https:\/\/([a-z0-9]+)\.supabase\.co/.exec(url)?.[1];
}
if (!ref) throw new Error("Could not work out the project ref. Set SUPABASE_REF.");
const isProd = ref.toLowerCase() === PROD_REF;
if (isProd && !PROD) {
  throw new Error(
    `The target ${ref} is the PRODUCTION project. Apply the migration to the dev project first; ` +
      "when the owner has approved it for production, run again with --prod.",
  );
}
if (!isProd && PROD) throw new Error(`--prod was passed but the target ${ref} is not the production project (${PROD_REF}).`);
console.log(`Applying ${file} to ${isProd ? "PRODUCTION" : "non-production"} project ${ref}`);

const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${pat}`, "content-type": "application/json" },
  body: JSON.stringify({ query: readFileSync(file, "utf8") }),
});
const text = await r.text();
console.log(r.ok ? "applied" : "FAILED", r.status, r.ok ? "" : text.slice(0, 500));
process.exit(r.ok ? 0 : 1);
