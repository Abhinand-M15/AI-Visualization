/**
 * Resolves selected avatar ids into the `Avatar` shape templates use. Owned by stage S3.
 *
 * Id scheme: static avatars keep their ids ("avatar-1"...); a domain avatar is
 * "domain:<domain_avatars.id>". Unknown/unresolvable ids are dropped. With the
 * domains tables missing, domain ids resolve to nothing and static ids still work.
 */
import { AVATARS, type Avatar } from "@/lib/avatars";
import { getSupabase } from "@/lib/db";
import { sceneImageUrl } from "@/lib/storageUrls";

export const DOMAIN_AVATAR_PREFIX = "domain:";

export function isDomainAvatarId(id: string): boolean {
  return id.startsWith(DOMAIN_AVATAR_PREFIX);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface AvatarRow {
  id: string;
  gender: string;
  image_path: string | null;
  status: string;
  domains?: { name?: string } | { name?: string }[] | null;
}

function domainNameOf(row: AvatarRow): string | undefined {
  const d = Array.isArray(row.domains) ? row.domains[0] : row.domains;
  return d?.name || undefined;
}

async function loadDomainAvatars(uuids: string[]): Promise<Map<string, Avatar>> {
  const found = new Map<string, Avatar>();
  if (uuids.length === 0) return found;
  try {
    const supabase = getSupabase();
    let rows: AvatarRow[] | null = null;
    const withName = await supabase
      .from("domain_avatars")
      .select("id, gender, image_path, status, domains(name)")
      .in("id", uuids);
    if (!withName.error) {
      rows = (withName.data ?? []) as unknown as AvatarRow[];
    } else {
      const plain = await supabase.from("domain_avatars").select("id, gender, image_path, status").in("id", uuids);
      if (!plain.error) rows = (plain.data ?? []) as unknown as AvatarRow[];
    }
    for (const row of rows ?? []) {
      if (row.status !== "ready" || !row.image_path) continue;
      const domainName = domainNameOf(row);
      const gender = row.gender === "female" ? "Female" : "Male";
      found.set(row.id, {
        id: `${DOMAIN_AVATAR_PREFIX}${row.id}`,
        name: domainName ? `${domainName} (${gender.toLowerCase()})` : `${gender} avatar`,
        imageUrl: sceneImageUrl(row.image_path),
        emotions: {},
      });
    }
  } catch (error) {
    console.error("resolve domain avatars failed:", error);
  }
  return found;
}

/** Static ids resolve via AVATARS; domain ids via domain_avatars (imageUrl = public URL, emotions = {}). Order preserved. */
export async function resolveAvatars(selectedIds: string[]): Promise<Avatar[]> {
  const uuids = selectedIds
    .filter(isDomainAvatarId)
    .map((id) => id.slice(DOMAIN_AVATAR_PREFIX.length))
    .filter((id) => UUID_RE.test(id));
  const domainAvatars = await loadDomainAvatars([...new Set(uuids)]);
  const result: Avatar[] = [];
  for (const id of selectedIds) {
    if (isDomainAvatarId(id)) {
      const avatar = domainAvatars.get(id.slice(DOMAIN_AVATAR_PREFIX.length));
      if (avatar) result.push(avatar);
    } else {
      const avatar = AVATARS.find((a) => a.id === id);
      if (avatar) result.push(avatar);
    }
  }
  return result;
}
