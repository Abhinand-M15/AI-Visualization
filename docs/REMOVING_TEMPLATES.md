# Hiding or removing a template

`src/lib/templates.ts` is the single source of truth for which templates exist. The template
picker, the preview page, the select and publish routes and `renderStaticSite` all ask it
(`isTemplateAvailable(id)` / `listTemplates()`), so nothing else needs touching to switch one off.

A project whose stored template is hidden or gone is never published with a different look:
the publish route answers 400 "That template is no longer available. Pick another template.",
the preview page shows the same sentence, and the project page, library card and publish
dialog show an amber "Template no longer available: choose another". Already-published sites
are static files and keep working. Case studies publish their own layout and are not blocked.
Nothing here writes to the database; the owner just picks another template on the project.

## 1. Hide a template (reversible, one line)

Either set `enabled: false` on its entry in `TEMPLATES` (`src/lib/templates.ts`):

```ts
{ id: "airlock", name: "Airlock", description: "...", enabled: false },
```

or, without a code change, set the env var and restart the server:

```
DISABLED_TEMPLATES=airlock,lunar
```

Remove the line (or the id) to bring it back.

## 2. Delete a template completely

Worked example: the removal of `editorial`, `clarity` and `cinematic`. For a template `<id>`:

1. `src/lib/templates.ts`: delete its entry from `TEMPLATES`.
2. `src/components/templates/index.ts`: delete its import and its `TEMPLATE_COMPONENTS` line.
3. Delete its component file(s) in `src/components/templates/` (here `EditorialTemplate.tsx`,
   `ClarityTemplate.tsx`, `CinematicTemplate.tsx`) plus anything only it used.
4. `src/lib/publish/staticSite.ts`: delete its `render<Id>` function, the `case "<id>":` in
   `renderStaticSiteBody`, and any CSS/JS constants only it used (here `AVATAR_VIDEO_IN_VIEW_JS`
   and the `narrationSkipVideo` switch). Keep anything the other templates or the case-study
   layout share. A template with its own site module (Voyage: `voyageSite.ts`, `voyageCss.ts`,
   `voyageMusic.ts`; Showcase: `showcaseSite.ts`, `showcase*.ts`, `public/themes/showcase`)
   also loses those files.
5. `src/lib/chapterLayout.ts`: delete its entry in `CHAPTER_THEMES` (here the editorial,
   clarity and cinematic entries; the case-study layout's light look was kept as `light`).
6. `src/lib/narrationDock.ts`: delete its entry in `NARRATION_DOCK_THEMES` if it had its own.
7. Search the codebase for the id and the name, case-insensitively, in `src/`, `docs/` and
   `README.md`, and fix every hit:
   `grep -rniE "<id>|<name>" src docs README.md`
8. Run `npx tsc --noEmit`, `npx eslint` on the changed files and `npm run build`.

Projects that still store the deleted id keep working as described above: they show the amber
notice until a new template is picked. No migration is needed.
