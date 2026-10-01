import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse drives pdfjs-dist, which loads pdf.worker.mjs from its own
  // package directory at runtime. Bundling it moves the code into .next/
  // without that file ("Setting up fake worker failed: Cannot find module
  // ...pdf.worker.mjs"), so both are loaded with native Node require instead.
  //
  // msedge-tts (in-process text-to-speech, src/lib/tts/edge.ts) opens its
  // WebSocket with `ws`, whose optional native helpers (bufferutil,
  // utf-8-validate) are resolved at runtime and break when bundled, so it is
  // loaded natively too.
  //
  // On Vercel (Linux) pdfjs-dist loads @napi-rs/canvas, whose platform binary
  // is a dynamic require the file tracer misses; without it the whole route
  // fails to load (empty 500). It is external too, and its files are traced in
  // explicitly for the routes that read documents.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas", "msedge-tts"],
  outputFileTracingIncludes: {
    "/api/parse-and-generate": [
      "./node_modules/@napi-rs/**/*",
      "./node_modules/pdfjs-dist/legacy/build/**/*",
      "./node_modules/pdfjs-dist/build/**/*",
    ],
  },
};

export default nextConfig;
