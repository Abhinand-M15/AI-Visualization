/**
 * Public URLs for the public Storage buckets added in
 * db/migrations/003_domains_images.sql, built from SUPABASE_URL the same way as
 * the chunk-audio URLs. Server-side only (reads SUPABASE_URL).
 */
export const SCENE_IMAGES_BUCKET = "scene-images";
export const COMPANY_LOGOS_BUCKET = "company-logos";

function publicUrl(bucket: string, path: string): string {
  const base = process.env.SUPABASE_URL;
  if (!base) throw new Error("SUPABASE_URL is not set.");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${encoded}`;
}

/** Public URL of an object in the scene-images bucket (chapter images and domain avatars). */
export function sceneImageUrl(path: string): string {
  return publicUrl(SCENE_IMAGES_BUCKET, path);
}

/** Public URL of an object in the company-logos bucket. */
export function logoUrl(path: string): string {
  return publicUrl(COMPANY_LOGOS_BUCKET, path);
}
