import type { Chunk, Project } from "@/lib/types";
import type { Avatar } from "@/lib/avatars";
import { SHOWCASE_ASSET_ROOT, buildShowcaseStory } from "@/lib/showcase";
import { SHOWCASE_CSS } from "@/lib/showcaseCss";

/**
 * Published (static HTML) version of the Showcase template. Unlike the other
 * published templates this page has no hand-written client script: it embeds the
 * story as JSON and loads one prebuilt browser script, themes/showcase/showcase.js
 * (the same React component the in-app preview renders, bundled with
 * `npm run build:showcase`), plus its stylesheet. The publish route copies those
 * files, the fonts and the UI sounds into the deploy bundle (showcaseAssetPaths).
 *
 * Scene images and the company logo are shown from the deploy bundle (relative paths
 * the publish route has already put in `chunk.imageUrl` and `project.logoUrl`); the
 * header draws the logo itself, so renderStaticSite does not inject it a second time.
 *
 * The page links to nothing outside itself: no CDN scripts, no web fonts, no
 * link back to the generator. Narration audio is the only cross-origin request
 * (the Supabase public URLs).
 */

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** JSON for an inline <script type="application/json"> — `<` is escaped so the
 *  data can never close the tag or open a comment, and U+2028/2029 can't break a parser. */
function inlineJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");
}

/** Strips the leading slash so the path works as a relative reference inside the deploy bundle. */
const bundlePath = (path: string) => path.replace(/^\//, "");

function chunkAudioUrl(supabaseUrl: string, projectId: string, chunk: Chunk): string | undefined {
  if (!chunk.audioUrl) return undefined;
  return `${supabaseUrl}/storage/v1/object/public/chunk-audio/${projectId}/${chunk.id}.mp3`;
}

const PAGE_CSS = `
html,body{margin:0;background:#f0f1fa;}
`;

export function renderShowcase(project: Project, avatars: Avatar[], supabaseUrl: string): string {
  const story = buildShowcaseStory({
    title: project.title,
    chunks: project.chunks,
    avatars,
    audioUrl: (chunk) => chunkAudioUrl(supabaseUrl, project.id, chunk),
    assetUrl: bundlePath,
    assetBase: bundlePath(SHOWCASE_ASSET_ROOT),
    // chunk.imageUrl and project.logoUrl are already bundle-relative (the publish route bundles them)
    logoUrl: project.logoUrl,
  });
  const base = bundlePath(SHOWCASE_ASSET_ROOT);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(project.title)}</title>
<link rel="stylesheet" href="${base}/showcase.css" />
<style>${PAGE_CSS}${SHOWCASE_CSS}</style>
</head>
<body>
<div id="showcase-root"></div>
<noscript><p style="padding:40px;font-family:sans-serif">This story needs JavaScript to play.</p></noscript>
<script type="application/json" id="showcase-data">${inlineJson(story)}</script>
<script src="${base}/showcase.js"></script>
</body>
</html>`;
}
