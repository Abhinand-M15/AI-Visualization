# Accounts, bring-your-own-key and hosted publishing: shared plan

This file is the contract that the parallel agents build against. Do not change it without asking the lead.

## Product flow
1. The user opens the hosted app link. If they aren't signed in, they're sent to **Sign up / Log in**.
2. **Sign up** asks for email (used as the username), display name and password. Supabase sends a confirmation email. **Forgot password** sends a reset link, which opens **Set new password**.
3. After the first sign-in, the user lands on **Settings → API keys** and must save a **Gemini API key** (bring your own key) before creating anything. A "Get a key" link goes to Google AI Studio. The key is stored encrypted, shown only as a masked hint (…abcd), and can be tested, replaced or deleted.
4. The user uploads a document. The file goes straight from the browser to Supabase Storage (this avoids Vercel's ~4.5 MB request-body limit). Then chunks are generated with *their* key. Every step is recorded: who did it and when.
5. On **Publish**, they type a subdomain. It's checked for availability. Any chapter missing narration gets its narration (TTS) generated first. The static site is deployed to Vercel and the public URL is saved and shown. Published sites have no link back to the app, are not indexed by search engines, and show only that one case study.

## Feature flag (critical)
`AUTH_ENABLED=1` switches on login, ownership filtering and every write to the new columns and tables. It also means `db/migrations/002_accounts.sql` has been applied. **While it is off, the app must behave exactly as it does today** (the owner's current local workflow must keep working). Use `authEnabled()` / `requireUser()` from `src/lib/auth/session.ts`.

Route pattern:
```ts
const user = await requireUser();            // null when auth is off, throws 401 when on and signed out
let q = supabase.from("projects").select(...).eq("id", id);
if (user) q = q.eq("owner_id", user.id);     // ownership only when auth is on
...
catch (e) { const r = unauthorizedResponse(e); if (r) return r; ... }
```

## Database additions (`db/migrations/002_accounts.sql`, written by the data agent, NOT applied by any agent)
- `projects`: already has `owner_id`. Add `created_by uuid`, `updated_by uuid`, `subdomain text unique` (lowercase), `published_at timestamptz`, `published_by uuid`.
- `user_api_keys` (`user_id uuid references auth.users on delete cascade`, `provider text` ('gemini'…), `encrypted_key text`, `key_hint text`, `created_at`, `updated_at`, primary key (`user_id`, `provider`)). RLS on, **no** policies: only the service role reads it.
- `documents` (`id uuid pk`, `owner_id`, `project_id` references projects on delete set null, `file_name`, `mime_type`, `size_bytes bigint`, `storage_path`, `uploaded_at`).
- `publications` (`id uuid pk`, `project_id` references projects on delete cascade, `subdomain`, `url`, `deployment_id`, `template_id`, `published_by uuid`, `published_at timestamptz default now()`).
- `activity_log` (`id bigserial pk`, `user_id uuid`, `project_id uuid`, `action text` (`project.created`, `chunks.generated`, `story.revised`, `audio.generated`, `project.published`, `keys.updated`…), `details jsonb`, `created_at timestamptz default now()`).
- A private storage bucket `documents` (path `<user_id>/<uuid>-<filename>`).
- `profiles`: add `display_name text` if missing.

## Environment variables (new)
- `AUTH_ENABLED`: `1` to enable (default off).
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: browser auth client.
- `KEY_ENCRYPTION_SECRET`: 32-byte base64 secret for AES-256-GCM encryption of user API keys.
- `PUBLISH_BASE_DOMAIN`: optional (e.g. `stories.example.com`). If unset, sites publish at `<subdomain>.vercel.app`.
- `APP_BASE_URL`: the hosted app's own URL (already exists).
- `TTS_PROVIDER`: `edge` (in-process, default) | `server` (the existing external TTS server).

## File ownership (agents must not edit files owned by another agent)
- **A, auth:** `src/lib/auth/**` (implements `getCurrentUser` in session.ts, keeping the exports), `src/proxy.ts` (or whatever Next 16 names middleware; read the docs), `src/app/(auth)/**` or `src/app/login`, `signup`, `forgot-password`, `reset-password`, `src/app/auth/**` (callback, sign-out), `src/components/UserMenu.tsx`, and a one-line include in `src/app/layout.tsx`.
- **B, data, keys and ownership:** `db/migrations/**`, `src/lib/userKeys.ts`, `src/lib/activity.ts`, `src/app/settings/**`, `src/app/api/settings/**`, `src/app/api/uploads/**`, `src/app/page.tsx`, `src/app/new/page.tsx`, `src/lib/store.ts`, `src/lib/projects.ts`, `src/lib/parseDocument.ts`, and **every** route under `src/app/api/**` except the publish route and the new subdomain route.
- **C, publish:** `src/app/api/projects/[id]/publish/route.ts`, `src/app/api/subdomains/**`, `src/lib/publish/vercel.ts`, `src/lib/publish/local.ts`, `src/lib/subdomain.ts`, `src/components/PublishDialog.tsx`, and only the publish-button area of `src/app/projects/[id]/page.tsx`.
- **D, TTS and hosting:** `src/lib/tts.ts` (+ `src/lib/tts/**`), `package.json` / `package-lock.json` (D is the only agent allowed to install a package), `docs/DEPLOYMENT.md`, `vercel.json` (for the generator app itself).
- **Off limits to all four** (another agent is editing them right now): `src/components/templates/**`, `src/components/ui/**`, `src/lib/publish/staticSite.ts`, `src/lib/publish/voyageSite.ts`, `src/lib/voyage*.ts`, `src/lib/narration*.ts`, `src/lib/useNarrationAutoScroll.ts`, `src/app/tmp-*`, `src/app/api/tmp-*`.

## Rules for every agent
- Read `AGENTS.md` and the relevant `node_modules/next/dist/docs/` guide first (Next 16 has breaking changes).
- **Nothing outward-facing:** no Vercel deploys, no calls to `/publish`, no database or Supabase changes (don't apply migrations, don't create buckets or users), no emails. Code and SQL files only.
- Never print or copy secrets from `.env.local`. Add new variable names to `.env.local.example` only (append a clearly-headed section; if two agents need it, append, don't rewrite).
- A dev server runs on `:3000`; don't start another and don't delete `.next`. Don't run `npm run build` (the lead runs it at the end); use `npx tsc --noEmit` and `npx eslint <your files>`, and judge only errors in your own files, since others are editing in parallel.
- Match the surrounding code style. Delete any temporary test files you create.
- Finish with a short report: files changed, how it works, what you verified, what you couldn't, risks, and anything the owner must set up.
