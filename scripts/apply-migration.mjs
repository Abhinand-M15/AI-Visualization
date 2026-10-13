// Applies one SQL migration file to the Supabase project through the Management API.
//
// Usage (PowerShell):  $env:SB_PAT = "<supabase access token>"; node scripts/apply-migration.mjs db/migrations/005_lead_sheet_prompts.sql
// Usage (bash):        SB_PAT=<supabase access token> node scripts/apply-migration.mjs db/migrations/005_lead_sheet_prompts.sql
//
// Notes:
//  - Only run this when the owner says to apply a migration. It changes the production database.
//  - Create the token at Supabase -> Account -> Access Tokens; revoke it afterwards.
//  - The project ref is the part of SUPABASE_URL before ".supabase.co" (override with SUPABASE_REF).
//  - Migrations are idempotent (safe to run twice) but 004 and 005 overwrite stored prompts, see their headers.
import { readFileSync } from "node:fs";

const file = process.argv[2];
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

const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${pat}`, "content-type": "application/json" },
  body: JSON.stringify({ query: readFileSync(file, "utf8") }),
});
const text = await r.text();
console.log(r.ok ? "applied" : "FAILED", r.status, r.ok ? "" : text.slice(0, 500));
process.exit(r.ok ? 0 : 1);
