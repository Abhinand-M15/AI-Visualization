# Story Site Generator

Turns an uploaded business document (PDF, PPTX, XLSX, DOCX, TXT or MD) into a narrated, chapter-based story site and publishes it as a static site on Vercel. Live app: `warpdrive-studio` (internal and testing use).

1. Upload a document; Gemini splits it into chapters (case studies are bound to a fixed Company / Domain / Customer / Problem / Solution / Impact layout).
2. Review and edit chapters, regenerate with feedback.
3. Pick a voice and generate narration (Microsoft Edge voices, in-process).
4. Pick avatars and a template (Space, Lunar, Airlock, Voyage, Showcase; see `docs/REMOVING_TEMPLATES.md`). Showcase gets AI scene images with one fixed lead character.
5. Publish: the template, chapters, audio and images are baked into a static site at `https://warpdrive-<name>.vercel.app`.

Full context, rules and status: **`HANDOFF.md`** (read it first) and `AGENTS.md` (Next.js 16 has breaking changes). Audit of 04 Nov 2026: `docs/audit/00-summary.md`.

## Setup

Prerequisites: Git, Node.js 20.9 or newer (24 is used locally and in CI), npm.

```bash
git clone https://github.com/Abhinand-M15/AI-Visualization.git
cd AI-Visualization
npm install
cp .env.local.example .env.local      # PowerShell: Copy-Item .env.local.example .env.local
```

Fill in `.env.local` (every variable is explained in `.env.local.example` and `HANDOFF.md` section 4). **Point it at the dev Supabase project, not production**: see `docs/DEPLOYMENT.md` section 9 for the one-time dev database setup. Never commit `.env.local` or `.env.deploy.local`; they are git-ignored.

```bash
npm run build        # run once on a fresh clone: it generates the route types tsc needs
npx tsc --noEmit
npm run dev          # http://localhost:3000 (bound to 127.0.0.1 only)
```

`npm run dev` first runs `scripts/check-dev-env.mjs`, which refuses to start when `.env.local` points at the production database with `AUTH_ENABLED` unset (override for one session: `ALLOW_PROD_DB=1 npm run dev`). To reach the dev server from another device on purpose, run `npx next dev -H 0.0.0.0` and remember the app is open to anyone on that network while `AUTH_ENABLED` is unset.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on `http://127.0.0.1:3000`, after the dev-database guard |
| `npm run build` / `npm start` | Production build / serve it locally |
| `npm run typecheck` | `tsc --noEmit` (after a build on a fresh clone) |
| `npm run lint` | ESLint (generated bundles in `public/themes/` are ignored) |
| `npm test` | Unit tests once (Vitest); `npm run test:watch` re-runs on change |
| `npm run check:env` | The dev-database guard on its own |
| `npm run build:showcase` | Rebuilds `public/themes/showcase/showcase.{js,css}` after changing the Showcase template sources; commit the output |
| `npm run check:showcase` | Rebuilds the Showcase bundle and fails if it differs from the committed one (used in CI) |
| `node scripts/apply-migration.mjs <file.sql>` | Applies a migration to the project in `.env.local` (dev); `--prod` is required for production. Owner approval only. |
| `node scripts/deploy-studio.mjs` | Deploys the current commit to Vercel (`VC_TOKEN` required, clean tree required). Owner approval only. See `docs/DEPLOYMENT.md` section 10. |

## Tests

Unit tests live in `tests/` (mirroring `src/`), run with Vitest in plain Node, and need no `.env.local`, network or database. `vitest.config.ts` maps the `@/` import alias and stubs `server-only`.

Covered today: subdomain rules (`src/lib/subdomain.ts`), chapter merging on save (`chunkMerge.ts`), publish fingerprints and narration state (`contentVersion.ts`), AES-256-GCM key encryption round-trip and tamper checks (`userKeys.ts`, with a throw-away secret), contact-sheet gutter detection and cropping (`sheetCrop.ts`, on generated images), Storage public URLs (`storageUrls.ts`), and HTML escaping of user content in the published static sites (`publish/staticSite.ts`, `storyMedia.ts`).

Add a test next to the module you change: `tests/lib/<module>.test.ts`. Keep tests pure: no real keys, no Supabase, no Vercel.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request: `npm ci`, build, type-check, lint, tests, `npm audit --omit=dev --audit-level=high`, and the Showcase bundle check. No secrets are needed. Deploying is a separate, manual step.

## Code map

- `src/app/`: pages (`/` library, `/new` upload, `/projects/[id]` editor and preview, `/settings`, auth pages) and API routes (`src/app/api/**`).
- `src/proxy.ts`: Next 16 "middleware" (session refresh).
- `src/lib/`: auth, Gemini agents (`agent/`), text-to-speech (`tts/`), image generation (`imageGen/`, `leadCharacter.ts`, `sheetCrop.ts`), publishing (`publish/`: static renderers and the Vercel client), shared pure helpers (`subdomain.ts`, `chunkMerge.ts`, `contentVersion.ts`, `storageUrls.ts`), encrypted user keys (`userKeys.ts`).
- `src/components/templates/`: React previews of each template; `src/lib/publish/*` renders the same templates to static HTML for publishing.
- `db/schema.sql`, `db/migrations/`: database (status of each migration in `HANDOFF.md` section 5).
- `scripts/`: deploy, migrations, Showcase bundle build, dev-database guard, Voyage art generation.
- `docs/`: deployment (`DEPLOYMENT.md`), plans, image prompts, Drive backup, template removal, audit reports.
