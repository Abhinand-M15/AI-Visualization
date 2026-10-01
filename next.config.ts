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
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "msedge-tts"],
};

export default nextConfig;
