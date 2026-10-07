/**
 * Builds the two files the published Showcase site loads:
 *
 *   public/themes/showcase/showcase.js   the Showcase template (React + three.js + lenis)
 *                                        bundled into one browser script (IIFE)
 *   public/themes/showcase/showcase.css  the Tailwind utility classes the template uses,
 *                                        plus the two bundled font faces
 *
 * Run `npm run build:showcase` after changing anything under
 * src/components/templates/showcase/, src/lib/showcase.ts or src/lib/showcaseCss.ts,
 * and commit the output: publishing reads these files and needs no build step.
 */
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "themes", "showcase");
await mkdir(outDir, { recursive: true });

// ---- script -----------------------------------------------------------------
await build({
  entryPoints: [path.join(root, "src/components/templates/showcase/standalone.tsx")],
  outfile: path.join(outDir, "showcase.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2019"],
  minify: true,
  legalComments: "none",
  jsx: "automatic",
  tsconfig: path.join(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
  // The narration helpers import gsap only for a scroll tween this template never
  // uses; a stub keeps the published script about 70 KB lighter.
  alias: { gsap: path.join(root, "scripts/gsap-stub.mjs") },
});

// ---- styles -----------------------------------------------------------------
const fonts = `
@font-face{font-family:"Hanken Grotesk";font-style:normal;font-weight:400 500;font-display:swap;src:url("fonts/hanken-grotesk-latin.woff2") format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:400;font-display:swap;src:url("fonts/ibm-plex-mono-400-latin.woff2") format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:500;font-display:swap;src:url("fonts/ibm-plex-mono-500-latin.woff2") format("woff2")}
.sc-root{--sc-font-sans:"Hanken Grotesk",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;--sc-font-mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
`;
const input = `@import "tailwindcss" source(none);\n@source "../src/components/templates/showcase";\n${fonts}`;
const from = path.join(root, "scripts", "showcase-input.css");
const result = await postcss([tailwind({ optimize: { minify: true } })]).process(input, { from, to: path.join(outDir, "showcase.css") });
await writeFile(path.join(outDir, "showcase.css"), result.css);

for (const file of ["showcase.js", "showcase.css"]) {
  const info = await stat(path.join(outDir, file));
  console.log(`${file}: ${(info.size / 1024).toFixed(1)} KB`);
}
