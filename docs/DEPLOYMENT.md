# Hosting the generator app on Vercel

Last updated: 30 Sep 2026

This guide hosts the whole generator app (Story Site Generator) on Vercel, including text-to-speech, with no separate server. The target setup:

| What | Value |
| --- | --- |
| Vercel project | `warpdrive-studio` |
| App URL | https://warpdrive-studio.vercel.app |
| Plan | Hobby (internal/testing use only, not commercial) |
| Published sites | `https://warpdrive-<name>.vercel.app` (one Vercel project per site, created by the publish route) |
| Auth email | Supabase's built-in sender (low hourly limit, see Limits) |

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
4. The project code in a Git repository (GitHub, GitLab or Bitbucket) that Vercel can import. Alternatively deploy with the Vercel CLI (`vercel --prod`) from the project folder.

## 3. Create the Vercel project

1. Vercel dashboard, **Add New... > Project**, import the repository.
2. **Project Name**: `warpdrive-studio` (this gives `warpdrive-studio.vercel.app`).
3. **Framework Preset**: Next.js (auto-detected). Root directory: the app folder (`AI-Visualization`) if the repository contains more than this app.
4. Build and output settings: leave the defaults (`next build`, install with `npm install`). Node.js version: 22.x or 24.x (Project Settings > Build and Deployment).
5. **Fluid compute**: leave it on (the default for new projects). It gives every function a 300 s default and maximum duration on Hobby.
6. **Function region**: Project Settings > Functions > Function Region. Choose the region closest to the Supabase project's region (Supabase dashboard > Project Settings > General). The default is `iad1` (Washington, D.C.). Every chunk upload and database call crosses this link, so matching them matters.
7. Add the environment variables from section 4 **before** the first deploy (or redeploy after adding them).
8. Deploy.

No `vercel.json` is needed: the defaults (300 s, Hobby's maximum) already cover the long routes, and the publish route sets its own `maxDuration = 300`. Setting a `maxDuration` above 300 on Hobby makes the deployment fail.

## 4. Environment variables

Set these in Project Settings > Environment Variables for **Production** (and Preview if you use preview deployments). `NEXT_PUBLIC_*` values are inlined into the browser bundle at build time, so redeploy after changing them. Mark secrets as **Sensitive**.

| Variable | Required | Value for warpdrive-studio | Notes |
| --- | --- | --- | --- |
| `SUPABASE_URL` | Yes | Supabase Project URL | Server only. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | service_role key | Server only. Sensitive. Never expose to the browser. |
| `NEXT_PUBLIC_SUPABASE_URL` | With accounts | Same Project URL | Browser auth client. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | With accounts | anon / publishable key | Browser auth client. Never the service_role key. |
| `AUTH_ENABLED` | Recommended `1` | `1` | Turns on sign-in, ownership and bring-your-own-key. Requires migration 002. Without it, anyone with the URL can use the app and the owner's `GEMINI_API_KEY`. |
| `KEY_ENCRYPTION_SECRET` | With accounts | 32 random bytes, base64 | Encrypts saved user API keys. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Keep it stable: changing it makes saved keys unreadable. Sensitive. |
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
3. Authentication > Sign In / Providers > Email: keep **Confirm email** on.
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

## 9. Checklist

- [ ] Migration `db/migrations/002_accounts.sql` applied (if `AUTH_ENABLED=1`).
- [ ] Vercel project `warpdrive-studio` created, Framework Next.js, Fluid compute on.
- [ ] Function region set next to the Supabase region.
- [ ] Environment variables set (section 4): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AUTH_ENABLED=1`, `KEY_ENCRYPTION_SECRET`, `APP_BASE_URL=https://warpdrive-studio.vercel.app`, `VERCEL_TOKEN` (+ `VERCEL_TEAM_ID` if a team), `TTS_PROVIDER=edge`; `TTS_SERVER_URL` / `TTS_API_KEY` **not** set; Wav2Lip vars only if a public server exists.
- [ ] Supabase Site URL `https://warpdrive-studio.vercel.app` and Redirect URLs (`https://warpdrive-studio.vercel.app/**`, `/auth/callback`, localhost) saved.
- [ ] Deployed; build log clean.
- [ ] Sign up, confirm the email, sign in, save a Gemini key (Settings > API keys).
- [ ] Voices load on a project page (`/api/voices`) and a voice preview plays.
- [ ] Upload a small document, generate chunks, generate narration, listen to one chunk.
- [ ] Publish with a test name; `https://warpdrive-<name>.vercel.app` opens and plays narration.
- [ ] Check the Vercel function logs for timeouts (504) on `generate-audio` / `publish`.
- [ ] Before any client/commercial use: move to Pro and add an official BYOK TTS provider.
