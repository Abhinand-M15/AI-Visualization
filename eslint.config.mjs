import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated output, never edited by hand:
    // - public/themes/showcase/showcase.js is the esbuild bundle from `npm run build:showcase`
    //   (its sources under src/ are linted); public/themes/** holds only built or static assets.
    "public/themes/**",
    // - sites written by the local publish fallback (src/lib/publish/local.ts).
    "public/published/**",
    // - test coverage reports.
    "coverage/**",
  ]),
]);

export default eslintConfig;
