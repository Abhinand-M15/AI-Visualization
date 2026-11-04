import type { NextConfig } from "next";

/*
 * Security headers for the app (SEC-14). The CSP is the "without nonces" variant from
 * node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md: Next.js and the
 * theme-init snippet in app/layout.tsx need inline scripts, so script-src keeps
 * 'unsafe-inline'; everything else is limited to the hosts the app really loads:
 *   - Supabase (auth, signed uploads, narration audio, scene images, logos)
 *   - cdn.jsdelivr.net, cdn.21st.dev (3D hero assets and textures in the previews)
 *   - raw.githack.com (drei Environment presets), www.gstatic.com (drei's Draco decoder, wasm + blob worker)
 * Published story sites are separate Vercel projects with their own headers (src/lib/publish/vercel.ts);
 * the local stand-in under /published/ only gets the basic headers below.
 */
const isDev = process.env.NODE_ENV === "development";

function supabaseOrigins(): string[] {
  const origins = ["https://*.supabase.co", "wss://*.supabase.co"];
  for (const raw of [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL]) {
    if (!raw) continue;
    try {
      const url = new URL(raw);
      origins.push(url.origin, `${url.protocol === "http:" ? "ws" : "wss"}://${url.host}`);
    } catch {
      // ignore a malformed value; the wildcard above still applies
    }
  }
  return Array.from(new Set(origins));
}

const supabase = supabaseOrigins();
const assetHosts = ["https://cdn.jsdelivr.net", "https://cdn.21st.dev", "https://raw.githack.com"];

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${[...supabase.filter((o) => o.startsWith("http")), ...assetHosts].join(" ")}`,
  "font-src 'self' data:",
  `media-src 'self' data: blob: ${supabase.filter((o) => o.startsWith("http")).join(" ")}`,
  `connect-src 'self' ${[...supabase, ...assetHosts, "https://www.gstatic.com"].join(" ")}${isDev ? " ws: http://localhost:* http://127.0.0.1:*" : ""}`,
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The app does not use next/image; turning the optimiser off removes the
  // /_next/image endpoint and its advisories from the attack surface (SEC-06).
  images: { unoptimized: true },
  async headers() {
    return [
      {
        // Every app page and API route, except the local publish stand-in.
        source: "/:path((?!published/).*)",
        headers: [
          ...baseSecurityHeaders,
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/published/:path*",
        headers: [...baseSecurityHeaders, { key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
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
