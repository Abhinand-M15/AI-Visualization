# HANDOFF: complete context for the Story Site Generator ("warpdrive-studio")

Written for the next AI assistant (and human) who continues this project on a new laptop. Last updated 13 Oct 2026.
Read this file first, then `AGENTS.md` (Next.js 16 has breaking changes), then the docs listed in section 14.

No secrets are in this repository or in this file. Every secret is named, with where to get it (section 4).

---

## 0. Instructions to the AI that picks this up

1. Read this whole file and `AGENTS.md`. Before writing Next.js code, read the matching guide in `node_modules/next/dist/docs/`.
2. Do the setup in section 3 and prove it works (`npx tsc --noEmit`, `npm run build`) before changing anything.
3. **Live actions only when the owner says so, at that moment:** applying database migrations, deploying to Vercel, publishing a site, pushing to GitHub, using or creating tokens. Prepare everything, then ask. Earlier approval does not carry over to a new action. (The owner was explicit about this on 30 Sep 2026.)
4. **Never print, log or commit secrets.** Do not read `.env.local` out loud. The owner pasted several tokens into chat over time; treat all of them as compromised and ask for fresh ones when needed, then suggest revoking them.
5. **Everything must be free.** The owner's company will not pay for any API key (decided 08 Oct 2026). Do not introduce paid services. Gemini image models do not work on the free tier (quota 0), so images use Cloudflare Workers AI's free plan (section 8).
6. Do not hard-code domains or image prompts in code. They live in the database (tables `domains`, `prompt_templates`).
7. Use the **dd MMM yyyy** date format (for example 13 Oct 2026) in anything shown to people. Keep the approved template text sizes: title 28px, headings 18px, body 15 to 18px.
8. Say plainly what was verified and what was not. Do not claim a feature works if it was only type-checked.
9. Be careful with a hidden browser pane: in the Claude desktop in-app browser, `requestAnimationFrame` and CSS transitions barely run, so animation smoothness cannot be judged there. Use a normal visible browser for that.

---

## 1. What this product is

A web app that turns an uploaded business document (PDF, PPTX, XLSX, DOCX, TXT or MD) into a narrated, chapter-based "story site" for pitching to companies. Flow:

1. A signed-in user uploads a document and picks a document type (and, for the domain feature, an industry domain and an optional company logo).
2. Gemini splits it into chapters (and, for the document type "case-study", binds it to a fixed case-study layout of sections: Company, Domain, Customer, Problem, Solution, Impact).
3. The user picks avatar(s), a template, and a voice. Narration audio is generated (Microsoft Edge voices).
4. For the Showcase template, AI cartoon scene images are generated, with one fixed lead character (section 8).
5. The user publishes. The app deploys a static site to Vercel at `https://warpdrive-<name>.vercel.app` (a separate Vercel project per site). Published sites have no link back to the app, are not indexed by search engines and show a single case study.

Internal and testing use only (Vercel Hobby plan is fine). Each user brings their own Gemini key (Settings page).

---

## 2. Where everything lives (names only)

| Thing | Value |
|---|---|
| GitHub repo | `Abhinand-M15/AI-Visualization`, default branch `master` |
| Backup branch | `backup/master-23-sep-2026` (the code as it was before accounts, on 23 Sep 2026) |
| Live app | `https://warpdrive-studio.vercel.app` (Vercel project `warpdrive-studio`, team scope "warpdrive") |
| Published story sites | `https://warpdrive-<name>.vercel.app`, plus older ones named `story-<id>.vercel.app` |
| Supabase project ref | `tykmwaqszlisqxdnlbjv` (database, auth, storage). Auth site URL is the live app URL. Email confirmation is off (no email is sent). |
| Supabase Storage buckets | `chunk-audio` (public), `chunk-video`, `documents` (private), `scene-images` (public), `company-logos` (public) |
| Google Drive folder (backup, not set up yet) | `1TF9XfZVJfAssdmlmYxuKZe2FybR_G0AC` (needs a service account, see `docs/DRIVE_SETUP.md`) |
| Supabase account used | The owner's PERSONAL account (not the office account). The owner could not sign in to the office-linked GitHub for it, so sign in with the personal login or an incognito window. |

---

## 3. Setting it up on a new laptop

Prerequisites: Git, Node.js 20 or newer (24 was used), npm. Windows 11 or macOS. No GPU needed.

```bash
git clone https://github.com/Abhinand-M15/AI-Visualization.git
cd AI-Visualization
npm install
cp .env.local.example .env.local        # Windows PowerShell: Copy-Item .env.local.example .env.local
# fill in .env.local (section 4), then:
npm run dev                             # http://localhost:3000
```

Verify the setup (all must pass):

```bash
npx tsc --noEmit
npm run build
```

Notes:
- `npm run lint` shows about 13 old errors in untouched legacy files (`AudioPlayer`, `ThemeProvider`, `AvatarDisplay`, `avatar-3d`, `lunar-gravity-card`, `reactive-mouth-overlay`, `case-study-preview`). They predate this work and do not block the build. Do not chase them unless you are editing those files.
- Do not run `npm run build` while `next dev` is running if you can avoid it: the build can briefly corrupt the dev server's generated type files (delete nothing, just restart the dev server).
- With `AUTH_ENABLED` unset, the app runs with no sign-in and uses `GEMINI_API_KEY` from `.env.local`. The local app and the live app share the SAME Supabase database and storage, so local actions write real data. Do not experiment on the owner's real projects.
- Text-to-speech: leave `TTS_SERVER_URL` unset and set `TTS_PROVIDER=edge` to use the in-process Edge voices (no separate server). The old local setup used a custom edge-tts server on port 5050 (`TTS_SERVER_URL`, `TTS_API_KEY`); it is only needed with `TTS_PROVIDER=server`.
- The "Showcase" template ships as a prebuilt bundle in `public/themes/showcase/`. After changing anything under `src/components/templates/showcase/`, `src/lib/showcase.ts` or `src/lib/showcaseCss.ts`, run `npm run build:showcase` and commit the rebuilt files, or published sites will not match the preview.

---

## 4. Environment variables (`.env.local`, and the same names on the Vercel project)

| Variable | Needed for | Where to get it |
|---|---|---|
| `SUPABASE_URL` | everything | Supabase dashboard, Project Settings, API |
| `SUPABASE_SERVICE_ROLE_KEY` | server-side database and storage (secret) | same page, `service_role` key |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sign-in in the browser | same page, URL and `anon` key (never the service_role key) |
| `AUTH_ENABLED` | `1` = require sign-in (live app). Unset locally = open app | you choose |
| `KEY_ENCRYPTION_SECRET` | encrypts users' saved keys (AES-256-GCM). 32 random bytes, base64. **Must stay the same as production** if you want to read saved keys | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` for a NEW setup |
| `GEMINI_API_KEY` | only while `AUTH_ENABLED` is unset | https://aistudio.google.com/apikey (free tier works for text) |
| `APP_BASE_URL` | the live app's own URL (publish route fetches bundled assets from it, and the character image) | `https://warpdrive-studio.vercel.app` |
| `VERCEL_TOKEN`, `VERCEL_TEAM_ID` | the publish route creates one Vercel project per story site | Vercel, Account Settings, Tokens (no expiry). Leave the team id empty for a personal scope |
| `TTS_PROVIDER` | `edge` (in-process) or `server` | you choose |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` | FREE image generation (section 8) | free Cloudflare account; token from the "Workers AI" template |
| `GOOGLE_SERVICE_ACCOUNT_JSON`, `DRIVE_FOLDER_ID` | optional Drive backup of generated images | `docs/DRIVE_SETUP.md` |
| `PUBLISH_BASE_DOMAIN`, `PUBLISH_NAME_PREFIX` | optional publishing overrides (default prefix `warpdrive-`) | leave unset |
| `GEMINI_TEXT_MODEL`, `GEMINI_IMAGE_MODEL`, `OPENAI_IMAGE_MODEL`, `CLOUDFLARE_IMAGE_MODEL` | optional model overrides | model ids change often; override instead of editing code |
| `DISABLED_TEMPLATES` | optional comma list of template ids to hide | `docs/REMOVING_TEMPLATES.md` |
| `AUTH_PASSWORD_RESET` | `1` enables email password reset (needs email, which is not set up) | leave unset |

---

## 5. Database

Schema: `db/schema.sql` (base), then migrations in order. **All of 002 to 004 are already applied to the production Supabase project. 005 is written but NOT applied yet.**

| File | What it does | Applied |
|---|---|---|
| `db/schema.sql` | base tables (`projects`, `profiles`, storage) | yes |
| `db/migrations/002_accounts.sql` | accounts: `user_api_keys`, `documents`, `publications`, `activity_log`, project owner/subdomain columns, `documents` bucket | yes (30 Sep 2026) |
| `db/migrations/003_domains_images.sql` | `domains` (8 seeded industries), `domain_avatars`, `prompt_templates`, `chapter_images`, `projects.domain_id / domain_avatar_id / logo_path`, `profiles.image_provider`, buckets `scene-images` and `company-logos` | yes (07 Oct 2026) |
| `db/migrations/004_lead_character_prompts.sql` | `domains.logo_placement`, domain outfits and logo spots, prompts `lead_character_rules`, `scene_director`, `lead_scene_image`, `lead_logo_instruction` | yes (08 Oct 2026) |
| `db/migrations/005_lead_sheet_prompts.sql` | contact-sheet prompts `lead_sheet_rules`, `lead_sheet_director`, `lead_sheet_image`, `lead_sheet_logo`, plus `domains.outfit_sheet` | **NO, apply when the owner says** |

Apply one with a Supabase access token (Account, Access Tokens; revoke after):

```bash
SB_PAT=<token> node scripts/apply-migration.mjs db/migrations/005_lead_sheet_prompts.sql
```

Notes: `projects.id` is TEXT (not uuid), so every `project_id` column is TEXT. 004 and 005 overwrite the stored prompts when re-run (edits made in the Supabase table editor are lost), so re-run only to reset. `prompt_templates` has row-level security on and no policies: only the server (service role) can read it. Existing projects created before accounts have no `owner_id`, so with `AUTH_ENABLED=1` they are hidden until assigned (see the comment at the top of 002).

---

## 6. Code map

```
src/app/                      pages and API routes (App Router)
  page.tsx                    "My case studies" library (search, filter, status, edit, republish, delete)
  new/page.tsx                upload page (domain dropdown, logo upload)
  projects/[id]/page.tsx      project editor (chapters, voice, avatars, template, scene images, publish)
  projects/[id]/preview/      live preview of the chosen template
  settings/                   API keys (Gemini, OpenAI), image provider, change password
  (auth)/ + auth/             login, signup, reset, callback, sign-out
  api/projects/...            CRUD, select, generate-audio, generate-scene-images, publish, bind-case-study
  api/domains, api/logos, api/settings, api/subdomains, api/templates, api/uploads, api/voices
src/proxy.ts                  Next 16 "middleware" (session refresh; skips /api)
src/lib/
  auth/                       Supabase Auth wrappers; requireUser() returns null when AUTH_ENABLED is unset
  agent/                      generateStory.ts, bindCaseStudyLayout.ts (Gemini)
  imageGen/                   cloudflare.ts (free), gemini.ts, openai.ts, types.ts, constants.ts, http.ts
  leadCharacter.ts            lead-character pipeline: prompts, scene director, sheet batches
  sheetCrop.ts                crops a 2x2 sheet into 4 images (white-gutter detection)
  sceneImages.ts              chapter_images rows, per-section ids, status helpers
  domains.ts                  domains + stored prompts access, fillPrompt
  publish/                    staticSite.ts (static HTML renderers), voyageSite.ts, showcaseSite.ts, vercel.ts
  templates.ts                template registry (enabled flag, DISABLED_TEMPLATES)
  chapterLayout.ts            shared vertical chapter layout (React + static)
  narrationDock.ts            shared pause button + auto-scroll toggle
  contentVersion.ts           fingerprint for "unpublished changes" and narration state
  userKeys.ts                 encrypted per-user API keys
src/components/templates/     React templates (Space, Lunar, Airlock, Voyage, CaseStudy, Showcase)
src/components/templates/showcase/   the Showcase template (cloned portfolio design, see section 9)
public/characters/lead.webp   the fixed lead character reference image (owner's image)
public/themes/                prebuilt/static assets for Voyage and Showcase
scripts/                      deploy-studio.mjs, apply-migration.mjs, build-showcase.mjs, generate-voyage-art.mjs
docs/                         plans and guides (section 14)
```

Key patterns:
- **Feature flag `AUTH_ENABLED`**: off = app behaves as the original single-user local tool. Every route uses `requireUser()` and filters by `owner_id` only when a user exists.
- **Graceful degradation**: if migrations 003 to 005 are missing, the new UI hides and nothing crashes.
- **Two render paths per template**: a React component (preview) and a static HTML renderer (published). They share code in `chapterLayout.ts`, `narrationDock.ts` and the voyage helpers. Change both when you change one.
- **Case studies** (`documentType: "case-study"`) normally publish their own fixed layout; with the Voyage or Showcase template selected their sections are turned into chapters (`caseStudySectionsAsChunks`, chunk id `case-study-<sectionKey>`).

---

## 7. Templates

Available: **Space, Lunar, Airlock, Voyage, Showcase** (plus the case-study layout, used automatically for case studies). **Editorial, Clarity and Cinematic were removed on 07 Oct 2026** (owner decision). Hide or remove any template with `docs/REMOVING_TEMPLATES.md` (one line: `enabled: false` in `src/lib/templates.ts`, or `DISABLED_TEMPLATES`).

- Non-Showcase templates use the shared vertical chapter layout: generated scene image(s) stacked vertically, with a text panel (narration text, "Next chapter" pill, "Key points" and "Up next" lists). Inspired by a reference recording the owner supplied (a horizontal-strip portfolio page), converted to vertical scrolling.
- **Showcase** is a clone of a scroll-driven 3D portfolio design (hero of floating crosses, morphing story card, tile grid, closing tunnel scene). Its chapter page was changed from a horizontal strip to a **vertical** page with the same animations (decided 08 Oct 2026). The owner said not to touch its animations or the original look.
- Every template has the shared narration dock: one themed pause button at bottom-right and an auto-scroll toggle (default ON) that moves to the next chapter when narration ends. The old per-section audio pause/rewind controls were removed on purpose.
- Voyage has generated planet art and a Web Audio music engine (`src/lib/voyageMusic.ts`).
- Jitter and performance fixes were applied to Space, Lunar, Airlock, Voyage and the case-study layout (07 Oct 2026). Showcase was only inspected (a list of 6 possible fixes was given to the owner, not applied).

---

## 8. Domains, the lead character and free image generation (newest work)

Owner's decision (08 Oct 2026), **Showcase only**: every chapter/section gets an AI cartoon scene image in which ONE FIXED CHARACTER is the lead (the owner's image, `public/characters/lead.webp`, a Pixar-style 3D young man). His outfit follows the project's domain (manufacturing: hard hat with the company logo on the helmet and a work outfit; healthcare: doctor with stethoscope; IT: full business suit as an IT manager; other domains similar) and the customer's uploaded logo is a second reference image placed where the domain says (`domains.logo_placement`). The logo also appears in the Showcase header.

Pipeline (`src/lib/leadCharacter.ts`, route `src/app/api/projects/[id]/generate-scene-images/route.ts`, panel `src/components/SceneImagesPanel.tsx` with `mode="lead"`, auto-starts for Showcase projects):
1. Sections (case study) or chapters are the targets, in display order.
2. **Contact sheet mode (built 13 Oct 2026, not yet deployed or tested with real output):** targets are batched four at a time. One text call (Gemini lite model first, 12 s per-model timeout) writes four short scenes; ONE image is generated as a 2x2 sheet of four 16:9 panels separated by white gutters; `sheetCrop.ts` detects the gutters and crops four 960x540 images, one per section. Leftovers (1 to 3) and single "Regenerate" use the one-image path. This cuts image calls by four and keeps the style consistent.
3. Stored prompts (database, `prompt_templates`, read-only from the app, tune them in the Supabase table editor and bump `version`): single mode `lead_character_rules`, `scene_director`, `lead_scene_image`, `lead_logo_instruction`; sheet mode `lead_sheet_rules`, `lead_sheet_director`, `lead_sheet_image`, `lead_sheet_logo`. Full text and tuning guide: `docs/IMAGE_PROMPTS.md`. The Cloudflare prompt is kept under about 1,900 characters because the free model's text encoder reads a limited length (layout and identity first).
4. Outfit per domain: `domains.outfit_description` (long) and `domains.outfit_sheet` (short, sheet mode).
5. Progress and errors per section are stored in `chapter_images` (statuses pending / ready / failed, error text). The panel has Generate missing, Retry failed and per-section Regenerate.

**Image provider (free-only rule):**
- All Gemini image models return HTTP 429 quota 0 on a free-tier key (tested on 08 Oct 2026). The default Gemini image model id was changed to `gemini-3.1-flash-image` for anyone who has billing, but the owner has none and will not pay.
- **Free option: Cloudflare Workers AI**, model `@cf/black-forest-labs/flux-2-klein-4b` (`src/lib/imageGen/cloudflare.ts`). Free plan: 10,000 "Neurons" per day, shared by everyone using the app; about 115 Neurons per single image, about 330 per 1920x1072 sheet, so roughly 8 stories a day. References go in as multipart `input_image_0..3`, each must be under 512 px (downscaled with `sharp`); the prompt's "image 1 / image 2" is renumbered to 0-based. When `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are set, every user generates through it (no personal image key).
- **Not yet done:** the owner has not created the free Cloudflare account, so the Cloudflare path has never produced a real image. Unknowns: whether FLUX.2 klein draws the white-gutter 2x2 layout reliably, keeps the character's face and the logo accurate, and follows the (compressed) prompt. Plan: create the account, run ONE test story with at least 5 chapters, read the server log lines `generate-scene-images (sheet): ... confidence ...`, tune prompts.
- The scene director (text) uses the user's Gemini key on the free text models: `gemini-flash-lite-latest` first (fast), then `gemini-flash-latest` (often 503 high demand). `gemini-2.5-flash` is no longer available to new keys.

Other pieces from the same wave (all built, mostly untested against real providers):
- Domain dropdown on the upload page (8 seeded domains: manufacturing, healthcare, education, it-technology, banking-finance, retail, logistics, real-estate), story wording follows the domain (stored prompt `story_domain_guidance`).
- Domain avatars (two per domain, male and female, generated once) with `DomainAvatarPicker`: used for non-Showcase templates (avatar mode). The Showcase lead-character mode does not need them.
- Company logo upload with SVG sanitising (`src/app/api/logos`), shown by `StoryLogo` (small, top-left by default; the owner will specify the final position later; Showcase shows it in its header).
- Optional Google Drive backup of generated images (`src/lib/driveBackup.ts`, needs a service account, not set up).

---

## 9. How the Showcase template came to be

The owner supplied a finished scroll-driven 3D portfolio template (built earlier in another Claude session at `C:\Users\Admin\Desktop\Projects\ai-website-cloner-template` on the old laptop; that folder is NOT in this repo and its research notes were deliberately not copied). An agent ported its design and behaviour into this app: React preview at `src/components/templates/showcase/` and a single prebuilt browser bundle `public/themes/showcase/showcase.js` (esbuild, `scripts/build-showcase.mjs`) for published sites. Stock photos, the original brand name, marketing copy, address, newsletter and Labs links were removed or replaced with generic text; scene tiles use generated abstract art unless a scene image exists. Fonts (Hanken Grotesk, IBM Plex Mono) are bundled under the OFL licence; five UI sounds under CC0 (Kenney), off by default. The owner's rule for clones: copy behaviour and design, write our own code, no copied brand assets.

---

## 10. Deploying (only when the owner says so)

Git is only used to store the code; **Vercel is deployed by uploading files through the Vercel API, not by a GitHub integration**. So "push to GitHub" and "deploy" are two separate steps.

```bash
# 1. push (use any normal git workflow, or the GitHub API with a token that has Contents read/write)
git push origin master

# 2. deploy the app (creates the project if needed, syncs env vars from .env.local, uploads, waits)
VC_TOKEN=<vercel token> node scripts/deploy-studio.mjs
```

Details:
- `scripts/deploy-studio.mjs` sets `AUTH_ENABLED=1`, `TTS_PROVIDER=edge`, `APP_BASE_URL`, and copies the Supabase, encryption, Cloudflare and Drive values from `.env.local`. It stores the Vercel token itself as the app's `VERCEL_TOKEN` setting, **so do not revoke the token you deploy with**; the live app uses it to publish sites. If you revoke it, publishing breaks until you deploy with a new one.
- Run `npx tsc --noEmit` and `npm run build` first. After a deploy, check `/login`, `/characters/lead.webp` and `/themes/showcase/showcase.js` return 200.
- Published sites: the publish route builds the static bundle and creates or updates a Vercel project named `warpdrive-<name>`. Republishing reuses the name; the older `story-<id>` sites keep their address when you choose "Keep the current address".
- More detail: `docs/DEPLOYMENT.md`.

---

## 11. History and what each sub-agent did

The work was done by the lead assistant plus parallel sub-agents with a shared contract document and strict file ownership (agents may not edit files another agent owns; the lead integrates). Agents never did anything outward-facing (no deploys, no database changes); the lead did those only on the owner's say-so.

Earlier sessions (before 30 Sep 2026): local setup of the app, Supabase and the custom edge-tts server; Vercel go-live of the first published sites; the Lunar theme; the Space and Lunar HR story sites.

| Date | Agent / wave | What it did |
|---|---|---|
| 30 Sep 2026 | Voyage template (lead) | Cloned a reference space-website design into the new "Voyage" template: planet wheel, parallax skies, music, deep links, React preview + static renderer |
| 30 Sep 2026 | Narration dock agent | One themed pause button, auto-scroll toggle (default on), removal of per-section pause/rewind in all templates, new "Key point" card for Voyage |
| 30 Sep 2026 | Agent A, auth | Sign-up, login, forgot/reset (hidden), sign-out, proxy, `UserMenu`, change password |
| 30 Sep 2026 | Agent B, data and keys | Migration 002, encrypted user keys, Settings, ownership on all routes, direct uploads, activity log |
| 30 Sep 2026 | Agent C, publish | Subdomain rules and check, `PublishDialog`, Vercel deploy helper, publications table |
| 30 Sep 2026 | Agent D, TTS and hosting | In-process Edge TTS (`msedge-tts`), `docs/DEPLOYMENT.md` |
| 30 Sep to 01 Oct 2026 | Library agent (stopped once by an org spend limit, then resumed) | "My case studies" home page, publish status and "unpublished changes", full editing, stale-narration marking, "Publish update" |
| 07 Oct 2026 | Coordinator plus S1 settings, S2 domain dropdown and story, S3 domain avatars and image providers, S4 chapter scene images, S5 templates and publishing, S5b company logo, S5c Drive backup | The domains / avatars / images / logo / Drive build (`docs/DOMAINS_PLAN.md`) |
| 07 Oct 2026 | Showcase agent | Ported the clone into the Showcase template (preview + static bundle) |
| 07 Oct 2026 | Layout agent (stopped by a usage limit once, resumed) | Shared vertical chapter layout for all templates except Showcase |
| 07 Oct 2026 | Cleanup and performance agent | Removed Editorial, Clarity, Cinematic; template registry; jitter and lag fixes |
| 08 Oct 2026 | Prompt-engineer agent | Wrote migration 004 and `docs/IMAGE_PROMPTS.md` (outfits, logo placement, scene director, image prompt) |
| 08 Oct 2026 | Lead-character backend agent | Lead mode in the scene-image route, multi-reference image generation, panel `mode="lead"` |
| 08 Oct 2026 | Showcase vertical-page agent | Vertical chapter page, scene images on tiles, logo in header, publish bundling |
| 08 Oct 2026 | Case-study images agent | Scene images per case-study section (ids `case-study-<key>`) in generation, preview, publish |
| 13 Oct 2026 | Contact-sheet agent | 4 scenes per image, `sheetCrop.ts`, migration 005, prompts for the free model |

The lead also did all integration, the migrations that were applied, every push and deploy, and diagnoses (for example: Vercel token expiry, Gemini free-tier quota, the scene director timeout).

---

## 12. Skills and tools used

- **Claude Skills:** none were invoked for this project. No custom slash commands or skills are required to continue.
- **Claude Code tools used heavily:** the Agent tool (general-purpose sub-agents in parallel with file ownership), plan mode (`AskUserQuestion` and `ExitPlanMode`) for the domains plan, the built-in browser pane (`preview_start`, `javascript_tool`, screenshots) for checking pages, WebSearch and WebFetch for provider docs, PowerShell for git, builds and API calls.
- **Services driven through their APIs:** GitHub (Contents API and git over HTTPS), Supabase Management API (run SQL, create tokens by the owner), Vercel REST API (deployments, projects, env), Cloudflare Workers AI (free images), Gemini API (text), Google Drive API (optional backup).
- **Where the previous assistant's own notes lived:** Claude Code's auto-memory on the old laptop (`C:\Users\Admin\.claude\projects\...\memory`). It does not travel with git. The important facts from it are all in this file; copy that folder across only if you want the raw notes.

---

## 13. Status on 13 Oct 2026

Done and live (commit `9953fe6` plus earlier on `master`; deployed 08 Oct 2026): accounts and your-own-key, subdomain publishing, library and editing, domains, domain avatars, logo upload, vertical layout for all templates except Showcase, template cleanup, Showcase vertical page, lead-character pipeline (single-image mode), migrations 002 to 004 applied.

Built locally and pushed to GitHub with this file, **not deployed**: scene-director timeout fix (lite model first), image default model change, Cloudflare free provider, contact-sheet generation and cropping, migration 005 file (not applied), the deploy and migration scripts, this handoff.

Open items, in the order the owner needs them:
1. **Create a free Cloudflare account**, take the Account ID and a "Workers AI" API token, put them in `.env.local` and on Vercel (`scripts/deploy-studio.mjs` copies them). Then test ONE story and judge the sheet and the character.
2. Apply migration 005 (only when the owner says), push is already done, then deploy.
3. Optional: Google Drive backup (service account, `docs/DRIVE_SETUP.md`) or skip it.
4. Optional: apply the 6 Showcase jitter fixes the inspection suggested (core ones: pause the 3D scenes off-screen, throttle the hero pointer handler, limit `will-change` and blur on the chapter pictures, rAF-wrap the resize handlers, cap pixel ratio on small screens).
5. Tell the assistant where the company logo should sit on non-Showcase templates (default: small, top-left; may overlap headers).
6. Local publishing from `localhost:3000` needs a valid `VERCEL_TOKEN` in `.env.local` (the old one expired).
7. Rotate or revoke every token that was pasted into chat. The live app depends on the most recent Vercel token (see section 10).
8. Existing owner projects were created before accounts: the 3 original ones have no `owner_id` and are hidden on the live app until assigned to the owner's account (SQL comment in 002). The HR case study (id `100f2b13-d59e-4166-8eeb-cfde93e4ee2b`) belongs to the owner's account and has a logo saved.

Known issues and limits:
- Never verified end to end: real image generation (any provider), the white-gutter sheet drawn by FLUX, Drive backup, the avatar-mode generation, `frameloop="demand"` on the 3D avatar (revert it in `src/components/ui/avatar-3d.tsx` if the avatar looks frozen after hover or drag), the Voyage "Next chapter" pill, narration highlighting with real audio inside the new layout, animation feel (never judged by eye).
- Opening a chapter deep link directly in the local dev preview of Showcase showed the home page (the published static page deep-links fine); probably the existing hydration and hash initial state, not isolated.
- The in-app browser may not draw screenshots; use `get_page_text`, DOM checks, or a normal browser.
- Image keys: users' Gemini keys on the free tier cannot make images; that is why Cloudflare is the plan.
- Free Cloudflare allowance is one daily pool for all users and resets at 00:00 UTC.

---

## 14. Documents in this repo

- `AGENTS.md`, `CLAUDE.md`: instructions for AI assistants (Next 16 warning; `CLAUDE.md` imports this file).
- `docs/ACCOUNTS_PLAN.md`: accounts, keys, uploads, publishing contract.
- `docs/DOMAINS_PLAN.md`: domains, avatars, scene images, logo contract.
- `docs/IMAGE_PROMPTS.md`: all stored prompts, placeholders, tuning, failure modes, test checklist.
- `docs/DEPLOYMENT.md`: hosting the app on Vercel (Hobby limits, TTS, env, Supabase URL settings).
- `docs/DRIVE_SETUP.md`: Google Drive backup setup in plain language.
- `docs/REMOVING_TEMPLATES.md`: hide or delete a template.
- `db/migrations/*.sql` and `db/schema.sql`: database.
- `scripts/`: `deploy-studio.mjs`, `apply-migration.mjs`, `build-showcase.mjs`, `generate-voyage-art.mjs`.
