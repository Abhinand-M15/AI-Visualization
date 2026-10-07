"use server";

import type { Avatar } from "@/lib/avatars";
import { resolveAvatars } from "@/lib/domainAvatars";

/**
 * Resolves the non-static selected avatar ids (domain avatars) for the preview.
 * resolveAvatars reads the database, so the client-side preview page reaches it
 * through this server action. Only public avatar data (ids, names, image URLs)
 * is returned; any failure resolves to nothing so the preview just omits them.
 */
export async function resolvePreviewAvatars(ids: string[]): Promise<Avatar[]> {
  const clean = (Array.isArray(ids) ? ids : []).filter((id): id is string => typeof id === "string").slice(0, 8);
  if (clean.length === 0) return [];
  try {
    return await resolveAvatars(clean);
  } catch {
    return [];
  }
}
