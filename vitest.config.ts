import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));
const serverOnlyStub = fileURLToPath(new URL("./tests/support/server-only.ts", import.meta.url));

// Unit tests for pure modules under src/lib. Run with `npm test` (or `npm run test:watch`).
// They need no .env.local, no network and no database.
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${src}/` },
      // `import "server-only"` throws outside a React Server Components bundle; tests run plain Node.
      { find: /^server-only$/, replacement: serverOnlyStub },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Tests must never see real secrets or reach real services.
    env: {
      SUPABASE_URL: "https://example-test.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "",
      KEY_ENCRYPTION_SECRET: "",
      VERCEL_TOKEN: "",
      GEMINI_API_KEY: "",
    },
  },
});
