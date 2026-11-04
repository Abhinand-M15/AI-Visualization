import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DeployFile } from "@/lib/publish/vercel";
import { isValidProjectId } from "@/lib/server/ids";

const DEFAULT_APP_BASE_URL = "http://localhost:3000";

/**
 * "Publish" locally: writes the rendered static site into public/published/<id>/
 * so it's served by this same running Next.js dev server. Used whenever no
 * Vercel publishing token is set, in local development only (the publish route
 * refuses it in production). This is a stand-in for a real external deploy,
 * not a replacement for it.
 *
 * `requestOrigin` (the actual incoming request's origin) is preferred over
 * APP_BASE_URL/DEFAULT_APP_BASE_URL — `next dev` doesn't always bind the same
 * port between runs (3000 is picked, then 3100, etc. depending on what else
 * is running), so a hardcoded fallback silently goes stale and produces a
 * published link nothing is listening on.
 *
 * The project id and every file path are checked (SEC-20): nothing is ever
 * written outside public/published/<id>/.
 */
export async function publishLocally(
  projectId: string,
  files: DeployFile[],
  requestOrigin?: string
): Promise<string> {
  if (!isValidProjectId(projectId)) throw new Error("Refusing to publish locally: invalid project id.");
  const dir = path.join(process.cwd(), "public", "published", projectId);
  await mkdir(dir, { recursive: true });

  for (const file of files) {
    const destination = path.resolve(dir, file.file);
    if (!destination.startsWith(dir + path.sep) || file.file.includes("\0")) {
      throw new Error("Refusing to publish locally: a file path leaves the site folder.");
    }
    const contents = file.encoding === "base64" ? Buffer.from(file.data, "base64") : Buffer.from(file.data, "utf-8");
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }

  const baseUrl = requestOrigin ?? process.env.APP_BASE_URL ?? DEFAULT_APP_BASE_URL;
  return `${baseUrl}/published/${projectId}/index.html`;
}
