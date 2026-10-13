# Setting this project up on a new laptop

For the owner and for the AI assistant on that laptop. Written 13 Oct 2026. The full project context is in `HANDOFF.md`; this file is only the setup procedure and the prompt to give the AI.

## For the owner (5 minutes)

1. **Install the tools** on the new laptop: Git, Node.js 20 or newer (24 was used), and your AI assistant (signed in).
2. **Copy your `.env.local`** to the new laptop by USB stick or a password manager. It holds the real secrets and is deliberately NOT in GitHub (the repository is public). A prepared copy for this move was left on the old laptop at `C:\Users\Admin\Desktop\env-transfer\.env.local`; delete that copy once you have moved it. Never email it or paste it into a chat or GitHub.
   - `KEY_ENCRYPTION_SECRET` in that file cannot be recreated. It decrypts the API keys your users saved in the live app, and Vercel stores it hidden. If it is lost, every saved user key stops working and users must enter theirs again.
3. **Give the AI the prompt below.** Paste it as it is.
4. **Work from the local copy.** Development happens there at `http://localhost:3000`. The live app at `https://warpdrive-studio.vercel.app` only changes when you say "push" and then "deploy".

Working on two laptops: pull before you start, and push before you switch laptops, so they do not conflict.

## The prompt for the AI (copy everything inside the box)

```text
You are taking over an existing project that I will keep developing with you: the "Story Site Generator" (live app: warpdrive-studio). I am the owner. It is not a finished product. Do everything below in order, then report back.

1. Get the code
- Clone https://github.com/Abhinand-M15/AI-Visualization.git (branch master) into a NEW folder called AI-Visualization inside my user folder or Documents (if that folder already exists and is not empty, clone into AI-Visualization-new instead). Open it.
- Read HANDOFF.md completely, then AGENTS.md. HANDOFF.md is the full context: what the product is, setup, database, code map, my rules, what earlier sub-agents did, current status and next steps. Follow its section 0 ("Instructions to the AI") at all times.

2. Install
- Check that Node.js 20 or newer and npm are installed. If not, install them and tell me.
- Run npm install in the project folder.

3. The settings file .env.local
- It is NOT in GitHub (that is intended) but I already copied it onto this laptop. Find a file named exactly .env.local: look first in the project root, then in my Desktop, Downloads, Documents, any folder named env-transfer, and any USB drive. Match by file NAME only. Do not open or read it to search.
- Move or copy it into the project root as .env.local. If you cannot find it, stop and ask me where it is. Never create one with made-up values.
- Never print, quote, log, summarise or commit any value from it, anywhere, including in your messages to me.
- Check that .gitignore covers .env.local.
- Show me only the setting NAMES and whether each is set or empty (never the values). KEY_ENCRYPTION_SECRET must be set; if it is empty, stop and tell me, because it cannot be recreated (it must match production).
- TTS_PROVIDER should be edge. AUTH_ENABLED should stay unset for local runs. VERCEL_TOKEN, CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN may be empty for now.

4. Verify the setup
- Run npm run build first, then npx tsc --noEmit (on a fresh clone the type-check only passes after the build). Both must pass. If something fails, fix the cause or tell me exactly what failed.
- Start the app with npm run dev, open http://localhost:3000 and confirm the home page loads and my projects are listed (they come from the shared Supabase database).

5. How we work from now on
- Development happens in this local copy. I try changes at http://localhost:3000.
- At the START of every session run git pull first, so you never work on old code. I also use another laptop, so changes may have been pushed from there.
- Only commit and push when I tell you to. Pushing to GitHub and deploying to Vercel are two separate steps and each needs my explicit go-ahead at that moment (deploying uses scripts/deploy-studio.mjs, see HANDOFF.md section 10).
- Before you say something is done, run npm run build and npx tsc --noEmit and tell me the result. After a push, update HANDOFF.md section 13 (status) so the next session, on either laptop, has the truth.
- When you make a decision or find an important fact, add it to HANDOFF.md so it is not lost.

6. Rules you must follow (also in HANDOFF.md)
- Do nothing live unless I say so at that moment: no database migrations, no Vercel deploys, no publishing sites, no git push, no creating or using tokens. Prepare first, then ask me.
- Everything must be free. Do not add or suggest paid APIs.
- Never put secrets in the repository or in chat.
- The local app and the live app share the same Supabase database. Do not experiment on my real projects.
- Use the dd MMM yyyy date format (for example 13 Oct 2026). Keep the approved template text sizes listed in HANDOFF.md.
- Tell me plainly what you verified and what you could not verify. Never claim something works if it was only type-checked.

7. Report back to me, in this order
- Setup result: install, build, type-check, app loads, with any error shown.
- A 10-line summary of the project and its current state, taken from HANDOFF.md section 13.
- The open items in order, then ask me which to start with. They are: (a) create the free Cloudflare account for image generation, (b) apply database migration 005, (c) test one story with the four-scenes-per-image generation and tune the prompts in docs/IMAGE_PROMPTS.md.
Do not start any of those until I choose one.
```

## The same steps by hand (if you do not use an AI for setup)

```bash
git clone https://github.com/Abhinand-M15/AI-Visualization.git
cd AI-Visualization
npm install
# put your .env.local in this folder (see above), then:
npm run build
npx tsc --noEmit
npm run dev        # http://localhost:3000
```

Expected: install, build and type-check pass; the home page loads and lists projects from the shared Supabase database. If `npx tsc --noEmit` fails with "Cannot find name 'LayoutProps'", run `npm run build` first.

## What works right after setup, and what does not

- Works: the app, project editing, text generation (free Gemini key), voices (in-process Edge voices), previewing every template.
- Needs more: cartoon image generation needs the free Cloudflare account details in `.env.local` (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`) and database migration 005 applied; publishing from this laptop needs a new `VERCEL_TOKEN`.
