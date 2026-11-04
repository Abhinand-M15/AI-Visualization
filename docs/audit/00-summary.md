# 00 · Audit summary and fix plan: Story Site Generator

| | |
|---|---|
| Date | 04 Nov 2026 |
| Code audited | `master` @ `71ac7d0` (next deploy candidate) |
| Live | `9953fe6`, deployed 08 Oct 2026 (per `HANDOFF.md`; local branch `live-08-oct-2026`). Nearly every High/Critical finding below also applies to live. |
| Reports | [01 UI](01-ui-audit.md) · [02 UX](02-ux-audit.md) · [03 Architecture](03-architecture-audit.md) · [04 Security](04-security-audit.md) |
| Method | Code reading, plus local `next dev` with no `.env.local` (DB pages show error states), build/typecheck/lint/`npm audit`, and read-only requests to public live URLs. Nothing was signed into, deployed, or written to Supabase. Database-side findings come from the repo SQL and must be checked in the live Supabase dashboard. |

## Totals

| Audit | Critical | High | Medium | Low/Info | Total |
|---|---|---|---|---|---|
| UI | 1 | 5 | 12 | 12 | 30 |
| UX | 1 | 9 | 9 | 7 | 26 |
| Architecture | 1 | 7 | see report | see report | 26 |
| Security | 1 | 6 | 7 | 9 | 23 |

Build and `tsc --noEmit` pass. `npm run lint` fails (22 errors: 9 from the generated `public/themes/showcase/showcase.js`, 13 legacy). No tests or CI exist.

## Phase 0: fix on the live system now (no code deploy needed)

These protect today's live app and need only Supabase SQL or token changes. Owner approval required for each.

1. **Turn on RLS for `system_prompts`, `agents`, `skills`** (SEC-01). Today the public anon key can insert an active system prompt that changes story generation for every user. Confirm in the dashboard first.
2. **Fix the `projects` policies** (SEC-02, AR-02): drop the `owner_id is null` branch and add `to authenticated`; assign the 3 legacy projects to the owner.
3. **Review RLS on every other table and bucket** while in the dashboard.
4. **Rotate the tokens that were pasted into chat** (security report, rotation checklist). The live app publishes with the deploy-time Vercel token, so rotate and redeploy together.

## Phase 1: must fix before the next deploy

| # | Fix | Findings | Effort |
|---|---|---|---|
| 1 | Upgrade `next` to 16.4.5+ and add `sharp@^0.35.5` as a direct dependency | AR-01, SEC-05/06/07 | S |
| 2 | Validate chunks server-side (id format, no `/` or `..`), one safe storage-path helper, ignore client `imageUrl`, escape `<audio src>` | SEC-03, SEC-04, SEC-08, SEC-21 | M |
| 3 | Auth fails closed in production (`AUTH_ENABLED` missing → refuse), bind dev to 127.0.0.1 | SEC-05, AR-04 | S |
| 4 | Only accept server-verified logo paths; never send SVG to `sharp` unsanitised | SEC-07 | S |
| 5 | Close or gate sign-up (invite list or allowed email domain) and fix the "check your email" message | SEC-10, AR-03, UX (signup copy) | S |
| 6 | Publish: refuse to overwrite a Vercel project the app did not create | SEC-09 | S |
| 7 | Published sites readable without audio (copy Voyage's approach) | UI-01 | S |
| 8 | Don't lose the `/new` draft on a failed Regenerate/Save; warn before leaving with unsaved work | UX-01, UX-04 | S–M |
| 9 | Publish stuck in "Publishing" after a timeout: stale-lock expiry | UX-03 | S |
| 10 | Audio job must not overwrite chapter edits made while it runs | UX-02 | M |
| 11 | Deploy from a clean commit (deploy script uploads the working tree; record the SHA) | AR-08 | S |

## Phase 2: next sprint

- **Abuse and cost limits:** per-user quotas and rate limits on publish, images and TTS (SEC-11, AR-03); zip-bomb limits on DOCX/PPTX/XLSX (SEC-12); a separate Vercel account and token for published sites (SEC-13); security headers and CSP (SEC-14).
- **Environments:** a second free Supabase project for dev so laptops never touch production (AR-04).
- **Published-site durability:** narration loads from the public bucket, so regenerating or deleting a project changes or breaks live sites (AR-05). Bundle or version the audio at publish time.
- **Migration 005 and Cloudflare images:** upgrade deps → apply 005 → add Cloudflare keys → one test story (AR-06). Master does not depend on 005.
- **UX:** Showcase shouldn't require an avatar (UX-05), friendly errors with a route to Settings for bad keys (UX-06), voice preview without saving (UX-07), block publish when audio is incomplete (UX-09), restructure the overloaded project page (UX-11).
- **UI:** keep app chrome out of the preview (UI-02), Lunar title overflow on phones (UI-03), visible focus rings (UI-04), light-mode dark flash, `prefers-reduced-motion`, same font in preview and published, shared design tokens.
- **Quality:** a minimal test suite and CI (build, typecheck, lint, audit); ignore the generated showcase bundle in ESLint.

## Decision needed from the owner

- **Branding (UI-05):** every case study gets a fixed WarpDrive "Company" paragraph and sites publish to `warpdrive-*.vercel.app`. That conflicts with D-011 (no WarpDrive branding in Scotty work) if this tool is used for Scotty implementations.
- Who may sign up (invite-only vs email domain).
- Whether to run Phase 0 on the live database now, ahead of any code changes.

## Housekeeping

`docs/audit/` is untracked. `scripts/deploy-studio.mjs` uploads the working tree, so commit or move it before any deploy.
