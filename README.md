# Story Site Generator

Phase 1: upload a document (PDF, PPTX, or XLSX), have an AI agent turn it into a chunked, narrated story, review/edit chunks, and regenerate with feedback.
Phase 2: pick a voice, generate per-chunk narration audio, play it back inline.
Phase 3: pick an avatar (or both) and a template (Editorial, Clarity, Cinematic), preview the assembled site.
Phase 4: publish — bakes the selected template + chunks + audio + avatar into a static site and deploys it (localhost for now, or a real Vercel URL once `VERCEL_TOKEN` is set).
Phase 5: polish — edit chunks and regenerate-with-feedback after the initial save (not just before), delete a project (DB row + its audio files + any localhost-published copy), and a voice-preview button before committing to full audio generation. This closes out the original plan — see `.claude/plans` in the AI VIZUALIZATION repo for the full history.

## Setup

1. `npm install` (already done if you just cloned this).
2. Create a free project at [supabase.com](https://supabase.com).
3. In the Supabase SQL editor, run `db/schema.sql`.
4. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
5. Get a Vercel personal access token from [vercel.com/account/tokens](https://vercel.com/account/tokens) (only needed to actually publish).
6. Copy `.env.local.example` to `.env.local` and fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → `service_role` secret — not the anon key), `GEMINI_API_KEY`, `TTS_SERVER_URL`/`TTS_API_KEY`, and `VERCEL_TOKEN`.
7. Start the local TTS server (`text-to-voice/server` — see that project's own setup) so it's listening on `TTS_SERVER_URL`.
8. `npm run dev` and open [http://localhost:3100](http://localhost:3100).

## What's here

- `/` — dashboard listing saved projects, with delete.
- `/new` — upload a document, generate a chunked storyline, edit chunks, regenerate with feedback, save.
- `/projects/[id]` — preview a voice sample before picking it, generate/regenerate per-chunk narration audio, pick avatar(s) + template, edit chunk text and regenerate-with-feedback even after saving/publishing (editing a chunk's text clears its now-stale audio), preview, publish.
- `/projects/[id]/preview` — live in-app render of the assembled site (React versions of the templates).
- `src/lib/parseDocument.ts` — PDF/PPTX/XLSX → plain text.
- `src/lib/agent/generateStory.ts` — Gemini-based story generation + feedback-driven revision, prompts loaded from the `system_prompts` table with a hardcoded fallback.
- `src/lib/tts.ts` — client for the local openai-edge-tts server (voice list + speech generation). `/api/preview-voice` uses it to say a fixed sample line in a given voice, for auditioning before generating real narration.
- `src/lib/avatars.ts`, `src/lib/templates.ts` — the fixed avatar/template catalogs. Each avatar has a set of expression images (`public/avatars/avatar-1/{neutral,confused,thinking,idea,solution,happy}.png`, not every avatar has every expression) — Gemini tags each chunk with an `emotion` (see `EmotionKey` in `src/lib/types.ts`) during story generation, and every template picks that chunk's avatar image to match, falling back to the avatar's neutral pose if it has no image for that specific emotion.
- `src/components/templates/` — the React (in-app preview) versions of the three templates.
- `src/lib/publish/staticSite.ts` — plain HTML/CSS/vanilla-JS (GSAP via CDN) versions of the same three templates, used only at publish time so the deployed site has zero server dependency.
- `src/lib/publish/vercel.ts` — Vercel Deployments API client (create + poll until ready).
- `src/lib/db.ts`, `db/schema.sql` — Supabase (Postgres + Storage) persistence, accessed server-side with the service role key. Chunk audio lives in the public `chunk-audio` Storage bucket (permanent public URLs — needed since published sites have no backend to proxy through).
