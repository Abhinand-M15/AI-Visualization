# Hosting the generator app on Vercel

Last updated: 04 Nov 2026 (sections 3, 4, 5, 9 to 12 revised after the 04 Nov 2026 audit, `docs/audit/`)

This guide hosts the whole generator app (Story Site Generator) on Vercel, including text-to-speech, with no separate server. The target setup:

| What | Value |
| --- | --- |
| Vercel project | `warpdrive-studio` |
| App URL | https://warpdrive-studio.vercel.app |
| Plan | Hobby (internal/testing use only, not commercial) |
| Published sites | `https://warpdrive-<name>.vercel.app` (one Vercel project per site, created by the publish route) |
| Auth email | Supabase's built-in sender (low hourly limit, see Limits); email confirmation is off |
| Databases | Production Supabase project (ref in `HANDOFF.md`) used only by Vercel; a separate free dev project for laptops (section 9) |
| How it is deployed | `scripts/deploy-studio.mjs` uploads one git commit through the Vercel API (no Git integration), section 10 |

## 1. How text-to-speech works when hosted

`src/lib/tts.ts` chooses a provider with `TTS_PROVIDER`:

- `edge` (default when `TTS_SERVER_URL` is not set): runs inside the Next.js route itself using the `msedge-tts` package. It opens an outbound secure WebSocket to Microsoft's Edge "read aloud" service (`speech.platform.bing.com`), the same service the Python `edge-tts` server used. Same voice names (e.g. `en-AU-WilliamMultilingualNeural`), same output: 24 kHz, 48 kbit/s, mono mp3. Long text is split into pieces of up to 2,000 characters at sentence boundaries and the mp3s are joined. Each piece has a 60 s timeout and 3 attempts with backoff. The voice list is cached in memory for 24 hours.
- `server` (default when `TTS_SERVER_URL` is set): the old external server (`text-to-voice/server/server.py`) over HTTP with `TTS_API_KEY`. This keeps the local setup working unchanged. It cannot be used from Vercel unless that server is on a public URL.

On Vercel, leave `TTS_SERVER_URL` and `TTS_API_KEY` unset (or set `TTS_PROVIDER=edge` explicitly).

Vercel Node.js functions have full Node.js API coverage and can open outbound TCP/TLS connections, so the outbound WebSocket works. `msedge-tts` is listed in `serverExternalPackages` in `next.config.ts` so it and `ws` are loaded with native `require` rather than bundled.

Measured from this laptop on 30 Sep 2026 (in-process, `edge` provider): a 6 s clip took about 2.8 s to generate, and a 2,550-character passage (2 pieces, 132 s of audio) took about 41 s. Roughly **60 characters of narration per second of function time**, per request in flight.

## 2. Before you start

1. A Vercel account on the Hobby plan (see Limits: Hobby is for non-commercial use).
2. The Supabase project the app already uses (URL, service-role key, anon key).
3. If accounts are on: `db/migrations/002_accounts.sql` applied in the Supabase SQL editor (creates the tables and the private `documents` bucket). The owner applies this; no agent does.
4. A clean, committed checkout of `master` on the laptop that deploys. The app is deployed by `scripts/deploy-studio.mjs` (section 10), which uploads the files of one commit through the Vercel API; there is no Git integration.

## 3. Create the Vercel project

`scripts/deploy-studio.mjs` creates the project `warpdrive-studio` on its first run if it does not exist, sets the environment variables and deploys. The dashboard steps below are only needed to check or adjust project settings (or for a manual setup without the script):

1. Vercel dashboard, **Add New... > Project** (only if the script has not created it).
2. **Project Name**: `warpdrive-studio` (this gives `warpdrive-studio.vercel.app`).
3. **Framework Preset**: Next.js (auto-detected). Root directory: the app folder (`AI-Visualization`) if the repository contains more than this app.
4. Build and output settings: leave the defaults (`next build`, install with `npm install`). Node.js version: 22.x or 24.x (Project Settings > Build and Deployment).
5. **Fluid compute**: leave it on (the default for new projects). It gives every function a 300 s default and maximum duration on Hobby.
6. **Function region**: Project Settings > Functions > Function Region. Choose the region closest to the Supabase project's region (Supabase dashboard > Project Settings > General). The default is `iad1` (Washington, D.C.). Every chunk upload and database call crosses this link, so matching them matters.
7. Environment variables from section 4: the deploy script sets them from `.env.deploy.local`; add any others by hand **before** the deploy (or redeploy after adding them).
8. Deploy with the script (section 10).

No `vercel.json` is needed: the defaults (300 s, Hobby's maximum) already cover the long routes, and the publish route sets its own `maxDuration = 300`. Setting a `maxDuration` above 300 on Hobby makes the deployment fail.

## 4. Environment variables

Set these in Project Settings > Environment Variables for **Production** (and Preview if you use preview deployments). `NEXT_PUBLIC_*` values are inlined into the browser bundle at build time, so redeploy after changing them. Mark secrets as **Sensitive**.

| Variable | Required | Value for warpdrive-studio | Notes |
| --- | --- | --- | --- |
| `SUPABASE_URL` | Yes | Supabase Project URL | Server only. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | service_role key | Server only. Sensitive. Never expose to the browser. |
| `NEXT_PUBLIC_SUPABASE_URL` | With accounts | Same Project URL | Browser auth client. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | With accounts | anon / publishable key | Browser auth client. Never the service_role key. |
| `AUTH_ENABLED` | **Yes** | `1` | Turns on sign-in, ownership and bring-your-own-key. Requires migration 002. On a production build or any Vercel deployment the app now fails closed when it is not `1` (`src/lib/auth/mode.ts`, audit SEC-05). Set by the deploy script. |
| `SIGNUP_ALLOWED_EMAIL_DOMAINS` | No | e.g. `example.com` | Comma list of email domains that may create an account (`src/lib/auth/signupPolicy.ts`). With this and `SIGNUP_ALLOWED_EMAILS` both unset, sign-up is closed and the admin adds users in Supabase. No confirmation email is sent, so anyone can type an address at an allowed domain: prefer exact addresses. Copied by the deploy script. |
| `SIGNUP_ALLOWED_EMAILS` | No | e.g. `a@example.com, b@example.com` | Comma list of exact addresses that may sign up. Copied by the deploy script (stored as Sensitive). |
| `AUTH_ENFORCE_ALLOWLIST` | No | leave unset, or `1` | `1` also refuses sign-in for existing accounts not on the lists above. Copied by the deploy script. |
| `APP_COMMIT_SHA` | Set automatically | the deployed commit | Written by the deploy script on every deploy; also stored as the deployment's `gitCommitSha` meta. Do not set by hand. |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` | For free images | Workers AI account id and token | When both are set every user generates images through the shared free pool. Apply migration 005 first (audit AR-06). Copied by the deploy script. |
| `KEY_ENCRYPTION_SECRET` | With accounts | 32 random bytes, base64 | Encrypts saved user API keys. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Keep the production value stable: changing it makes saved keys unreadable. The dev database (section 9) uses its own, different value. Sensitive. |
| `GEMINI_API_KEY` | Only if `AUTH_ENABLED` is off | Owner's key | With accounts on, each user's saved key is used. |
| `APP_BASE_URL` | Yes | `https://warpdrive-studio.vercel.app` | The app's own URL. The publish route fetches bundled assets from here when they are not on the function filesystem. No trailing slash. |
| `VERCEL_TOKEN` | Yes, to publish | A Vercel access token (Account Settings > Tokens) | Used by the publish route to create `warpdrive-<name>` projects and deployments. Without it the route falls back to writing into `public/`, which is read-only on Vercel. Sensitive. |
| `VERCEL_TEAM_ID` | If the token is for a team | Team ID | Leave empty for a personal (Hobby) account. |
| `PUBLISH_NAME_PREFIX` | No | leave unset | Default prefix is `warpdrive-`, giving `warpdrive-<name>.vercel.app`. |
| `PUBLISH_BASE_DOMAIN` | No | leave unset | Only for a custom wildcard domain (section 7). |
| `TTS_PROVIDER` | No | `edge` (or leave unset) | In-process Edge voices. |
| `TTS_SERVER_URL`, `TTS_API_KEY` | No | leave unset | Only for `TTS_PROVIDER=server`. If `TTS_SERVER_URL` is set and `TTS_PROVIDER` is not, the app tries the external server. |
| `WAV2LIP_SERVER_URL`, `WAV2LIP_API_KEY` | Optional | Public URL of a Wav2Lip server | Lip-synced avatar videos only. `localhost` is not reachable from Vercel (see Limits). |

## 5. Supabase settings for the hosted domain

Supabase dashboard > Authentication > URL Configuration:

1. **Site URL**: `https://warpdrive-studio.vercel.app`
2. **Redirect URLs** (add all):
   - `https://warpdrive-studio.vercel.app/**` (the app sends users to `/auth/callback?next=...`, for sign-up confirmation and password reset; the wildcard covers the query string)
   - `https://warpdrive-studio.vercel.app/auth/callback`
   - `http://localhost:3000/**` (keeps local development working)
   - Optional, for preview deployments: `https://warpdrive-studio-*.vercel.app/**`
3. Authentication > Sign In / Providers > Email: **Confirm email** is off on the live project (no email is sent; see HANDOFF section 2). Because of that, the sign-up allow-list (section 4) is what limits who gets in. Supabase's own sign-up endpoint is reachable with the public anon key, so for invite-only use also turn off **Allow new users to sign up** (Authentication > Sign In / Providers) and add users by hand (audit AR-03, SEC-10).
4. Authentication > Emails: the default templates work with the PKCE callback. If you edit them, keep the `{{ .ConfirmationURL }}` link (or use the token-hash form `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=...`).
5. Email sender: the built-in Supabase sender is used for now. It allows only about 2 auth emails per hour per project and may only deliver to addresses of your Supabase organisation's members. For more users, add custom SMTP (Authentication > SMTP Settings, e.g. Resend, SendGrid, Amazon SES), which raises the limit.

Storage: the private `documents` bucket (from migration 002) receives uploads straight from the browser, which avoids Vercel's 4.5 MB request-body limit. The existing `chunk-audio` bucket stores narration.

## 6. Long-running routes and the 300 s limit

With Fluid compute, every function has a 300 s default and maximum on Hobby (Pro: 300 s default, up to 800 s). A route that runs past it is stopped with a 504 (`FUNCTION_INVOCATION_TIMEOUT`); streamed responses count too.

| Route | What takes time | Fit on Hobby (300 s) |
| --- | --- | --- |
| `POST /api/parse-and-generate` | Parse the uploaded document, then Gemini story generation | Usually well under 300 s. Very large documents or slow Gemini responses are the risk. |
| `POST /api/revise-story` | One Gemini call | Fine. |
| `POST /api/projects/[id]/generate-audio` | One TTS call per chunk, 4 at a time, then a storage upload each; the project row is saved once at the end | About 60 characters/s per call in flight, so roughly 240 characters/s overall. A 100-chunk project with ~600-character chunks (60,000 characters) needs about 250 s: close to the limit. |
| `POST /api/projects/[id]/generate-case-study-audio` | Same pattern, per case-study section | Same as above. |
| `POST /api/projects/[id]/publish` | Render the site, upload files to Vercel, wait for READY | Sets `maxDuration = 300`. Fine. Missing narration is generated first by the Publish dialog calling `generate-audio` / `generate-case-study-audio` as a separate request, so it has its own 300 s budget. |
| `POST /api/projects/[id]/generate-case-study-avatar-video` | Calls the external Wav2Lip server | Depends entirely on that server. |
| `/api/voices`, `/api/preview-voice` | One short call | Fine (voices are cached per function instance). |

Advice for big projects on Hobby:

- Generate narration **before** publishing, in batches. `generate-audio` accepts `chunkIds`, so a large project can be done in several requests.
- If a `generate-audio` run times out, audio already uploaded stays in storage, but the project row is only saved at the end of the run, so those chunks will not show their audio yet. Run it again for the missing chunks. (A follow-up for the route owner: save progress incrementally or raise the concurrency for the `edge` provider.)
- On Pro, the long routes can be raised to up to 800 s with `export const maxDuration = 800` in the route file, or in a `vercel.json` `functions` block. Do not use both for the same route.

## 7. Domains

Nothing is needed for the defaults: the app is at `warpdrive-studio.vercel.app` and each published site gets `warpdrive-<name>.vercel.app` (the publish flow checks availability, since `.vercel.app` names are global).

Optional custom domains later:

- **App**: Project `warpdrive-studio` > Settings > Domains > add e.g. `studio.example.com`, then create the DNS record Vercel shows (CNAME to `cname.vercel-dns.com`, or an A record for an apex domain). Then update `APP_BASE_URL`, the Supabase Site URL and Redirect URLs to the new domain, and redeploy.
- **Published sites**: set `PUBLISH_BASE_DOMAIN=stories.example.com`, add the wildcard domain `*.stories.example.com` to the Vercel account/team (wildcards require Vercel's nameservers for that domain), and republish. Sites then publish at `warpdrive-<name>.stories.example.com`.

## 8. Limits and risks

- **Hobby plan is for non-commercial, personal use only** (Vercel fair-use terms). That is acceptable for the current internal/testing use. Any client or commercial use needs the Pro plan ($20 per member per month), which also allows 800 s functions, 4 GB memory and multiple regions.
- **Function timeouts**: 300 s on Hobby (section 6). Big narration runs are the most likely to hit it.
- **Request body limit**: 4.5 MB per request/response. Uploads go straight to Supabase Storage for this reason. Individual responses (e.g. a preview clip) are far smaller.
- **Edge read-aloud endpoint is unofficial**: it is the free service behind Microsoft Edge's "Read aloud". It has no SLA, is not licensed for commercial use, requires an Edge-like client signature (the `Sec-MS-GEC` token, which `msedge-tts` generates), and Microsoft has changed it before (Dec 2025 required an Edge user agent). It can break or rate-limit without notice, especially from shared cloud IP ranges such as Vercel's. It is acceptable for internal testing. **Follow-up recommendation**: add an official bring-your-own-key TTS provider (Azure AI Speech, which has the same neural voice names; OpenAI TTS; or ElevenLabs) as another `TTS_PROVIDER`, using the user's saved key like the Gemini key.
- **`msedge-tts` package**: MIT licence, actively maintained (v2.0.8 on 24 Sep 2026). If Microsoft changes the protocol, update the package (`npm update msedge-tts`). If it breaks in production, set `TTS_PROVIDER=server` with a publicly reachable TTS server as a stopgap.
- **Wav2Lip dependency**: lip-synced avatar videos need the Wav2Lip server, which currently runs on the owner's machine (`localhost:5060`). Vercel cannot reach it. Either host it on a public GPU machine with HTTPS and set `WAV2LIP_SERVER_URL` / `WAV2LIP_API_KEY`, expose it temporarily through a tunnel, or skip avatar video generation on the hosted app.
- **Local publish fallback**: without `VERCEL_TOKEN`, publishing writes into `public/published/`, which does not work on Vercel (read-only filesystem). Always set `VERCEL_TOKEN` on the hosted app.
- **Supabase built-in email**: about 2 emails per hour. Sign-ups and password resets beyond that fail until the hour resets. Add custom SMTP before inviting more users.
- **Security**: turn on `AUTH_ENABLED=1` before sharing the URL; otherwise the app is public and spends the owner's Gemini key and Vercel token.

## 9. A separate dev database (audit AR-04)

Until 04 Nov 2026 every laptop used the production Supabase project. With `AUTH_ENABLED` unset locally, every owner filter is skipped, so a laptop could read, change or delete any user's project, and migrations were tried on production first. Supabase's Free plan allows two active projects, so development gets its own, free.

**One-time setup (about 20 minutes):**

1. supabase.com, **New project** in the same organisation: name `warpdrive-studio-dev`, Free plan, same region as production. Save the database password in your password manager.
2. SQL editor of the **dev** project: run `db/schema.sql`, then `db/migrations/002_accounts.sql` to `005_lead_sheet_prompts.sql` in order. (Or `SB_PAT=<token> SUPABASE_REF=<dev ref> node scripts/apply-migration.mjs db/migrations/00N_....sql` for each.) Applying 005 here first is exactly the test production needs.
3. Storage: check the buckets exist with the same visibility as production: `chunk-audio`, `chunk-video`, `scene-images`, `company-logos` (public) and `documents` (private). Create any that are missing.
4. Authentication > URL Configuration: Site URL `http://localhost:3000`, Redirect URL `http://localhost:3000/**`. Turn **Confirm email** off. To test with `AUTH_ENABLED=1` locally, add a test user under Authentication > Users > Add user.
5. Split the env files on the laptop:
   - Copy today's `.env.local` (production values) to **`.env.deploy.local`**. Only the laptop that deploys needs it. Next.js never loads this file; only `scripts/deploy-studio.mjs` reads it, and git ignores it.
   - Edit **`.env.local`** to the dev project's `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and a **new** `KEY_ENCRYPTION_SECRET` (the dev database holds no production keys). Leave `VERCEL_TOKEN` empty unless you want to test publishing.
6. `npm run check:env` must print nothing alarming, then `npm run dev`.

**Guards that enforce it:**

| Guard | What it does |
| --- | --- |
| `scripts/check-dev-env.mjs` (runs before every `npm run dev`) | Refuses to start when `.env.local` points at the production project and `AUTH_ENABLED` is unset. Warns when it points at production with `AUTH_ENABLED=1`. Deliberate one-off override: `ALLOW_PROD_DB=1 npm run dev`. |
| `scripts/apply-migration.mjs` | Targets the project in `.env.local` (dev) by default. Refuses the production project unless `--prod` is passed. |
| `scripts/deploy-studio.mjs` | Reads production values from `.env.deploy.local` (falls back to `.env.local`) and refuses to deploy `warpdrive-studio` when that file's `SUPABASE_URL` is not the production project, so dev values can never reach production. |

The production project ref the guards compare against defaults to the one in `HANDOFF.md`; override it with `SUPABASE_PROD_REF`.

Notes: the dev project pauses after about a week without use (Free plan); resume it from the dashboard. `npm run dev` binds to `127.0.0.1` only, so the open local app is not reachable from the network (audit SEC-05). Optional later: a Vercel Preview environment pointed at the dev project.

## 10. Releasing: pre-deploy checklist, deploy, smoke test, rollback

From the architecture audit (`docs/audit/03-architecture-audit.md` section 6). Every live step (deploy, migration, token use, push) happens only when the owner says so at that moment (HANDOFF section 0, rule 3).

**Before the deploy**

- [ ] Dependencies patched: `npm audit --omit=dev --audit-level=high` is clean (`next` 16.4.5 or later, `sharp` 0.35.5 or later as a direct dependency; audit AR-01).
- [ ] Live database checked in the Supabase dashboard: RLS on for every table, `projects` policies owner-only with no `owner_id is null` branch (audit SEC-01, SEC-02, AR-02). Prepare a migration if not, and apply it to dev first.
- [ ] The commit is on `master`, pushed (`master` equals `origin/master`), and `git status` is clean. Note its SHA. The deploy script refuses a dirty tree and records the SHA itself.
- [ ] CI is green for that commit (GitHub Actions, `.github/workflows/ci.yml`): `npm ci`, build, `tsc --noEmit`, lint, tests, `npm audit`, Showcase bundle check. Or run them locally: `npm ci && npm run build && npx tsc --noEmit && npm run lint && npm test`.
- [ ] Image mode decided: (a) **without** Cloudflare credentials (images behave as before), or (b) **with** them, in which case apply migration 005 to production first (dev first, then `--prod`).
- [ ] Sign-up: `SIGNUP_ALLOWED_EMAIL_DOMAINS` / `SIGNUP_ALLOWED_EMAILS` decided (both unset = closed) and, for invite-only, Supabase **Allow new users to sign up** off (section 5).
- [ ] `.env.deploy.local` holds the production values: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `KEY_ENCRYPTION_SECRET` (unchanged production value), `CLOUDFLARE_*` only for option (b), optional sign-up lists. The script sets `AUTH_ENABLED=1`, `TTS_PROVIDER=edge`, `APP_BASE_URL` and `APP_COMMIT_SHA` itself. No `TTS_SERVER_URL`, no `GEMINI_API_KEY` on Vercel.
- [ ] The Vercel token you deploy with is fresh (not one pasted into chat) and you will keep it: the script stores it as the app's `VERCEL_TOKEN` for publishing.
- [ ] Function region matches the Supabase region (Project Settings > Functions).

**Deploy**

```bash
VC_TOKEN=<token> node scripts/deploy-studio.mjs          # PowerShell: $env:VC_TOKEN = "<token>"; node scripts/deploy-studio.mjs
```

The script: refuses a dirty tree or untracked files (`--allow-dirty` overrides, and even then only HEAD is uploaded), prints the current production deployment (id, URL, commit) for rollback, syncs env vars, uploads the files of HEAD read from git, deploys with meta `gitCommitSha`, waits for READY and prints the commit. Then tag it: `git tag deploy-dd-MMM-yyyy <sha>` (for example `deploy-04-Nov-2026`) and push the tag when the owner agrees.

**Smoke test (by hand, on https://warpdrive-studio.vercel.app)**

- [ ] `/login`, `/characters/lead.webp`, `/themes/showcase/showcase.js` return 200.
- [ ] Sign in, open a test project (never the owner's real ones); voices load; one voice preview plays.
- [ ] Generate narration for one chapter; it plays.
- [ ] Showcase test project: scene images start; with option (b) at least one sheet of four appears and is cropped cleanly; check `activity_log` for `images.generated`.
- [ ] Publish the test project to a throw-away name; the site opens, plays narration and shows its images.
- [ ] Vercel function logs: no 504 on `generate-audio`, `generate-scene-images` or `publish`.

**Rollback**

- [ ] If any smoke test fails: Vercel dashboard > `warpdrive-studio` > Deployments > the previous production deployment (the one the script printed; until a release with a recorded SHA exists, that is the deployment of commit **`9953fe6`**, deployed 08 Oct 2026, local branch `live-08-oct-2026`) > **Instant Rollback**. Migration 005 does not need reverting (the `9953fe6` code ignores it).
- [ ] Env vars are not rolled back by Instant Rollback. If the failed release added env vars the old code does not know (sign-up lists, `APP_COMMIT_SHA`), they are harmless; if it changed a value (for example `KEY_ENCRYPTION_SECRET` or the Supabase keys), put the old value back and redeploy.
- [ ] Record what happened and the live commit in `HANDOFF.md` section 13.

## 11. Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request, with no secrets: `npm ci`, `npm run build`, `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm audit --omit=dev --audit-level=high`, and `npm run check:showcase` (rebuilds the Showcase bundle and fails if the committed `public/themes/showcase/` differs from its sources). It does not deploy; deploying stays a manual, owner-approved step (section 10).

## 12. First-time setup checklist

- [ ] Migration `db/migrations/002_accounts.sql` applied (if `AUTH_ENABLED=1`).
- [ ] Vercel project `warpdrive-studio` created, Framework Next.js, Fluid compute on.
- [ ] Function region set next to the Supabase region.
- [ ] Separate dev database set up for laptops (section 9).
- [ ] Environment variables set (section 4): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AUTH_ENABLED=1`, `KEY_ENCRYPTION_SECRET`, `APP_BASE_URL=https://warpdrive-studio.vercel.app`, `VERCEL_TOKEN` (+ `VERCEL_TEAM_ID` if a team), `TTS_PROVIDER=edge`; `TTS_SERVER_URL` / `TTS_API_KEY` **not** set; Wav2Lip vars only if a public server exists.
- [ ] Supabase Site URL `https://warpdrive-studio.vercel.app` and Redirect URLs (`https://warpdrive-studio.vercel.app/**`, `/auth/callback`, localhost) saved.
- [ ] Deployed; build log clean.
- [ ] Sign up (with an allowed address, section 4) or add the user in Supabase, sign in, save a Gemini key (Settings > API keys).
- [ ] Voices load on a project page (`/api/voices`) and a voice preview plays.
- [ ] Upload a small document, generate chunks, generate narration, listen to one chunk.
- [ ] Publish with a test name; `https://warpdrive-<name>.vercel.app` opens and plays narration.
- [ ] Check the Vercel function logs for timeouts (504) on `generate-audio` / `publish`.
- [ ] Before any client/commercial use: move to Pro and add an official BYOK TTS provider.
