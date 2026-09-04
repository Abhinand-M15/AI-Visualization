import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DeployFile } from "@/lib/publish/vercel";

const DEFAULT_APP_BASE_URL = "http://localhost:3000";

/**
 * "Publish" locally: writes the rendered static site into public/published/<id>/
 * so it's served by this same running Next.js dev server. Used whenever
 * VERCEL_TOKEN isn't set — see the publish route for the switch. This is a
 * stand-in for a real external deploy, not a replacement for it.
 *
 * `requestOrigin` (the actual incoming request's origin) is preferred over
 * APP_BASE_URL/DEFAULT_APP_BASE_URL — `next dev` doesn't always bind the same
 * port between runs (3000 is picked, then 3100, etc. depending on what else
 * is running), so a hardcoded fallback silently goes stale and produces a
 * published link nothing is listening on.
 */
export async function publishLocally(
  projectId: string,
  files: DeployFile[],
  requestOrigin?: string
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "published", projectId);
  await mkdir(dir, { recursive: true });

  for (const file of files) {
    const contents = file.encoding === "base64" ? Buffer.from(file.data, "base64") : Buffer.from(file.data, "utf-8");
    const destination = path.join(dir, file.file);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }

  const baseUrl = requestOrigin ?? process.env.APP_BASE_URL ?? DEFAULT_APP_BASE_URL;
  return `${baseUrl}/published/${projectId}/index.html`;
}
