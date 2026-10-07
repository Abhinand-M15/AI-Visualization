# Domains, generated avatars and scene images, logos, Drive backup: shared contract

This file is the contract that the parallel stage agents build against. Do not change it without asking the coordinator. The approved plan is `C:\Users\Admin\.claude\plans\mighty-gliding-fox.md`. Stage 6 (new layout) is out of scope.

## Product flow
1. On the upload page the user picks an industry **domain** (dropdown, loaded from the database) and optionally uploads a **company logo**.
2. The story is generated with the domain's wording (`story_domain_guidance` filled with the domain). The project stores `domain_id` and `logo_path`.
3. On the project page the user picks an avatar. `DomainAvatarPicker` shows the domain's two avatars (male, female; generated once on first use with the user's image key, then reused), followed by the existing static avatars. A chosen domain avatar is recorded as `domain:<domain_avatars.id>` in `selectedAvatarIds` and in `projects.domain_avatar_id`.
4. Once a domain avatar is chosen, `SceneImagesPanel` (with `autoStart`) generates one cartoon scene image per chapter, using the avatar image as the reference so the character stays the same. Failures fall back to the avatar and can be retried; any chapter can be regenerated.
5. Templates (React preview and published static sites) show the chapter `imageUrl` when present (else the avatar, exactly as today) and the company logo through one shared `StoryLogo` element. Published sites contain no link back to the app.
6. Every generated avatar, scene image and uploaded logo is also copied to Google Drive in the background (`<domain or project>/<file>`), if credentials exist.

## Feature flag and graceful degradation (critical)
- `AUTH_ENABLED` off: everything works exactly as today. `requireUser()` returns null; the image provider is `gemini` and its key is `GEMINI_API_KEY` from the environment (via `userKeys.ts`, same as `getGeminiKeyFor`); `logActivity` is a no-op. OpenAI image generation needs auth on (keys live in `user_api_keys`); with auth off use Gemini.
- Migration 003 **not applied** (tables or columns missing): the app must not crash and must look unchanged:
  - `listDomains()` returns `[]`; `GET /api/domains` returns `{ domains: [] }`; the dropdown is hidden when the list is empty.
  - `getDomain()` / `getPrompt()` return null; story generation skips the domain guidance.
  - Project reads/writes must not select or write `domain_id`, `domain_avatar_id`, `logo_path` unless needed; if a query on those columns or on `chapter_images` errors with a missing table/column, retry without them or treat as "none". Treat PostgREST errors with codes `42P01`, `42703`, `PGRST204`, `PGRST205` (and messages mentioning the table/column) as "not migrated".
  - No images are generated, no logo/domain UI is shown, scene panel and logo control render nothing.
  - Never add new **required** request fields. `domainId`, `logoPath` are optional everywhere.
- New UI that needs the migration is hidden or disabled when the data it needs is absent; it never throws into the page.
- Routes use `requireUser()` / `unauthorizedResponse`, keys via `userKeys.ts`, activity via `logActivity`.

## Tables (see `db/migrations/003_domains_images.sql`; NOT applied by any agent)
- `domains` (`id uuid`, `slug`, `name`, `outfit_description`, `story_guidance`, `sort_order`, `active`, `created_at`). Public read.
- `domain_avatars` (`id uuid`, `domain_id`, `gender` 'male'|'female', `image_path` (in `scene-images`), `status` 'pending'|'ready'|'failed', `drive_status`, `created_at`; unique (`domain_id`, `gender`)). Public read.
- `prompt_templates` (`key` pk, `body`, `version`, `updated_at`). RLS on, no policies: service role only. Keys: `avatar_character`, `chapter_scene`, `story_domain_guidance`.
- `chapter_images` (`project_id` TEXT, `chunk_id` TEXT, `image_path`, `status` 'pending'|'ready'|'failed', `prompt_used`, `provider`, `drive_status`, `error`, `created_at`, `updated_at`; pk (`project_id`, `chunk_id`)). Service role only.
- `projects`: `domain_id uuid`, `domain_avatar_id uuid`, `logo_path text`. (`projects.id` is TEXT.)
- `profiles.image_provider` 'gemini'|'openai', default 'gemini'.
- Buckets (public read): `scene-images` (paths: `domains/<domainId>/<gender>.<ext>` for avatars, `<projectId>/<chunkId>.<ext>` for scenes), `company-logos` (paths: `<userId or "anon">/<uuid>.<ext>`).

Prompt placeholders (filled with `fillPrompt`, unknown ones become empty):
- `avatar_character`: `{{gender}}`, `{{domain_name}}`, `{{outfit_description}}`
- `chapter_scene`: `{{domain_name}}`, `{{outfit_description}}`, `{{avatar_description}}`, `{{chapter_title}}`, `{{chapter_text}}`, `{{story_title}}`
- `story_domain_guidance`: `{{domain_name}}`, `{{story_guidance}}`

Do not hard-code domains or prompts in code. If a prompt row is missing, skip that feature (no images / no guidance) rather than invent text.

## Environment variables (new; names only go in `.env.local.example`)
- `GOOGLE_SERVICE_ACCOUNT_JSON`: the service-account key JSON (one line). `DRIVE_FOLDER_ID`: the shared Drive folder. Both missing means backup is skipped silently.
- Optional model overrides: `GEMINI_IMAGE_MODEL`, `OPENAI_IMAGE_MODEL`. Defaults live in exactly one place inside `src/lib/imageGen/`.
- Existing: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` (auth off), `KEY_ENCRYPTION_SECRET`, `AUTH_ENABLED`.

## Shared signatures (stubs already exist; bodies are TODOs owned by the named stage)
- `src/lib/domains.ts` (S1): `type Domain { id; slug; name; outfitDescription; storyGuidance; sortOrder; active }`, `listDomains(): Promise<Domain[]>`, `getDomain(id): Promise<Domain|null>`, `getPrompt(key): Promise<string|null>`, `fillPrompt(template, vars): string`.
- `src/lib/imageGen/types.ts` (S3): `ImageProviderId = "gemini"|"openai"`, `ImageGenerator.generate({prompt, referenceImage?, aspect?})`, `getImageGeneratorFor(user): Promise<ImageGenerator>` (throws `MissingApiKeyError`, 412). S1 adds `"openai"` to `KEY_PROVIDERS` and an `getUserKey(userId, "openai")` path; S3 must only use the existing exports of `userKeys.ts` (`getUserKey`, `MissingApiKeyError`, `getGeminiKeyFor`, `missingApiKeyResponse`). S1 also adds `getImageProviderFor(userId): Promise<ImageProviderId>` and `setImageProviderFor(userId, id)` to `src/lib/userKeys.ts`; S3 calls `getImageProviderFor` (until S1 lands it, S3 may read `profiles.image_provider` directly in a tiny local helper and switch over afterwards).
- `src/lib/driveBackup.ts` (S5c): `backupToDrive({bucket, path, folder, fileName, contentType?}): Promise<{status:"done"|"skipped"|"failed"; fileId?}>`, never throws.
- `src/lib/backupAfterUpload.ts` (S5c, stub exists with the final signature): `backupAfterUpload({bucket, path, folder, fileName, contentType?, record?: {table: "chapter_images"|"domain_avatars", match}}): void`, fire-and-forget; writes the outcome to the row's `drive_status` when `record` is given. S3 and S4 call this right after the Supabase save (`void`-style, no await needed).
- `src/lib/storageUrls.ts` (done): `sceneImageUrl(path)`, `logoUrl(path)`, `SCENE_IMAGES_BUCKET`, `COMPANY_LOGOS_BUCKET`.
- `src/lib/domainAvatars.ts` (S3): `DOMAIN_AVATAR_PREFIX = "domain:"`, `isDomainAvatarId(id)`, `resolveAvatars(selectedIds): Promise<Avatar[]>` (static ids via `AVATARS`, domain ids via DB; order preserved; unresolvable ids dropped; domain avatars have `emotions: {}` and `imageUrl` = public URL).
- Types (done): `Chunk.imageUrl?`, `Chunk.imageStatus?`; `Project.domainId?`, `domainAvatarId?`, `logoUrl?`; `TemplateProps.logoUrl?`.
- Components (stubs with final props): `LogoUpload { value: string|null; onChange(path|null) }` (S5b), `ProjectLogoControl { projectId; logoUrl?; onChanged(logoUrl|undefined) }` (S5b), `DomainAvatarPicker { domainId; value: string|null; onSelect(avatarId) }` (S3), `SceneImagesPanel { projectId; autoStart?; onChanged?() }` (S4).

## HTTP surface
- `GET /api/domains` (S1): `{ domains: [{ id, slug, name }] }`, `{ domains: [] }` when not migrated. Needs no sign-in beyond `requireUser()`.
- `GET /api/domains/[id]/avatars` (S3): `{ avatars: [{ id, gender, imageUrl, status }] }`; generates a missing avatar on first use; 412 with `code: 'missing_api_key'` when the key is missing; `{ avatars: [] }` when not migrated. Optional `?generate=0` to read without generating.
- `POST /api/projects/[id]/generate-scene-images` (S4): body `{ onlyMissing?: boolean; retryFailed?: boolean; chunkId?: string }`; `maxDuration = 300`; one image at a time, saved per chapter in `chapter_images` and `chapter_images.status`; response `{ results: [{chunkId, status}], remaining: number }` so the client can call again until `remaining` is 0.
- `POST /api/logos` (S5b): body `{ fileName, contentType, size }` returning a signed direct-upload target `{ path, uploadUrl, token }` into `company-logos`; SVGs are sanitised server-side after upload by `POST /api/logos/sanitize` `{ path }` (S5b decides the exact shape; `LogoUpload` hides it behind `onChange(path)`).
- `POST /api/parse-and-generate` (S2): optional `domainId`, `logoPath` (also accepted in the existing request shape of that route).
- `PATCH /api/projects/[id]` accepts optional `logoPath: string|null` (coordinator adds this in integration).
- `PUT/GET /api/settings/image-provider` (S1): `{ provider: "gemini"|"openai" }`.
- Project payload (`GET /api/projects/[id]`, list, store) carries `domainId`, `domainAvatarId`, `logoUrl` and per-chunk `imageUrl` / `imageStatus` (derived server-side from storage paths with `storageUrls.ts`).

## Activity log actions (new)
`domain.avatar_generated`, `images.generated`, `image.regenerated`, `logo.updated`, `settings.image_provider_updated`. (`logActivity` accepts any string.)

## Storage rules
- Supabase Storage is primary; published sites load or bundle from it. Drive is a backup only: fire-and-forget after the Supabase save, never blocks or fails the action, status in `drive_status` (`done`|`skipped`|`failed`).
- Image bytes: avatars and scenes are saved with the generator's `mimeType` (extension from it: png/jpeg/webp).

## File ownership (agents must not edit files owned by another agent)
- **S1, settings and data access:** `src/lib/domains.ts`, `src/lib/userKeys.ts`, `src/app/settings/**`, `src/app/api/settings/**` (incl. the image-provider endpoint), `src/app/api/domains/route.ts` (`GET /api/domains`).
- **S2, domain dropdown and domain-aware story:** `src/app/new/page.tsx` (domain dropdown; renders `<LogoUpload>`; sends `domainId` and `logoPath`), `src/app/api/parse-and-generate/route.ts`, `src/lib/agent/generateStory.ts`, `src/lib/projects.ts`, `src/lib/store.ts` (keep the library agent's `buildPayload` logic).
- **S3, domain avatars:** `src/lib/imageGen/**`, `src/app/api/domains/[id]/avatars/route.ts`, `src/components/DomainAvatarPicker.tsx`, `src/lib/domainAvatars.ts`.
- **S4, chapter scene images:** `src/app/api/projects/[id]/generate-scene-images/route.ts`, `src/lib/sceneImages.ts`, `src/components/SceneImagesPanel.tsx`, `src/lib/contentVersion.ts`, `src/app/api/projects/[id]/select/route.ts` (only to store `domain_avatar_id`), `src/app/api/projects/[id]/route.ts` GET only (per-chunk `imageUrl`/`imageStatus` and `logoUrl`).
- **S5, templates and publishing:** `src/components/templates/**` (incl. `showcase/`), `src/lib/publish/staticSite.ts`, `voyageSite.ts`, `showcaseSite.ts`, `src/lib/voyage*.ts`, `src/lib/showcase*.ts`, `src/app/projects/[id]/preview/page.tsx`, `src/app/api/projects/[id]/publish/route.ts`. Rebuild with `npm run build:showcase` after changing Showcase code. Shared `StoryLogo` lives in `src/components/templates/StoryLogo.tsx` (small, fixed top-left by default; the owner will specify the final position later, so keep it in one place).
- **S5b, company logo:** `src/components/LogoUpload.tsx`, `src/app/api/logos/**`, `src/components/ProjectLogoControl.tsx`.
- **S5c, Drive backup:** `src/lib/driveBackup.ts`, `src/lib/backupAfterUpload.ts`, `docs/DRIVE_SETUP.md`.
- **Coordinator only (integration, step 3):** `src/app/projects/[id]/page.tsx` (wires `DomainAvatarPicker`, `SceneImagesPanel`, `ProjectLogoControl`), `PATCH` on `src/app/api/projects/[id]/route.ts` (`logoPath`), `src/lib/types.ts`, `src/lib/storageUrls.ts`, `src/components/templates/types.ts`, `db/migrations/003_domains_images.sql`, this document, `package.json`, `.env.local.example` (agents may append a headed section, never rewrite).
- If a stage needs a change in a file it does not own, it works around it or reports it; it does not edit it.

## Rules for every agent
- Read `AGENTS.md` and the relevant `node_modules/next/dist/docs/` guide first (Next 16 has breaking changes).
- **Nothing outward-facing:** no git push, no Vercel deploy or env changes, no calls to the publish route, no Supabase changes (do not apply the migration, do not create buckets, users or rows), no real image-generation or Drive calls, no emails. Code, SQL and docs only.
- Never read, print or copy `.env.local` or any token; never put secrets in code. Add new variable names to `.env.local.example` only (append a clearly headed section).
- The dev server on `:3000` uses the REAL Supabase project; do not write to the owner's 3 existing projects or any data (GET only). If a dev server isn't running, start it with the preview config named `ai-visualization`; do not start a second and do not delete `.next`. Verify DB-dependent code with in-memory mocks or unit checks (small TypeScript scripts run via jiti or tsx from the scratchpad) and delete temporary files, including temporary test pages.
- Graceful degradation is mandatory (see above).
- Match surrounding code style and the `dd MMM yyyy` date format for any date shown. Do not change approved text sizes in the templates.
- The in-app browser barely runs requestAnimationFrame and CSS transitions; verify with DOM and state checks.
- Use `npx tsc --noEmit` and `npx eslint <your files>`; judge only errors in your own files while others edit in parallel. Only the coordinator runs the full `npm run build`.
- Finish with a concise report: files changed, how it works, what was verified or not, risks, what the owner must set up.
