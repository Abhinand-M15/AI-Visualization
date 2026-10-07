import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { requireUser, unauthorizedResponse, type AppUser } from "@/lib/auth/session";
import { missingApiKeyResponse } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";
import { fillPrompt, getDomain, getPrompt, type Domain } from "@/lib/domains";
import { getImageGeneratorFor, type ImageGenerator } from "@/lib/imageGen/types";
import { extensionForMime } from "@/lib/imageGen/http";
import { backupAfterUpload } from "@/lib/backupAfterUpload";
import { SCENE_IMAGES_BUCKET, sceneImageUrl } from "@/lib/storageUrls";

/** Two generations (one per gender) run in parallel; each has its own timeout + one retry. */
export const maxDuration = 300;

const GENDERS = ["male", "female"] as const;
type Gender = (typeof GENDERS)[number];

/** A "pending" row younger than this is treated as another request still generating it. */
const PENDING_FRESH_MS = 6 * 60 * 1000;

const NOT_MIGRATED_CODES = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

function isNotMigrated(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code && NOT_MIGRATED_CODES.has(error.code)) return true;
  return /schema cache|does not exist/i.test(error.message ?? "");
}

interface AvatarRow {
  id: string;
  gender: Gender;
  image_path: string | null;
  status: "pending" | "ready" | "failed";
  created_at: string;
}

const ROW_COLUMNS = "id, gender, image_path, status, created_at";

interface AvatarDto {
  /** domain_avatars.id; the avatar id used in selections is `domain:<id>`. */
  id: string;
  gender: Gender;
  imageUrl: string | null;
  status: AvatarRow["status"];
}

function toDto(row: AvatarRow): AvatarDto {
  return {
    id: row.id,
    gender: row.gender,
    imageUrl: row.status === "ready" && row.image_path ? sceneImageUrl(row.image_path) : null,
    status: row.status,
  };
}

async function readRows(domainId: string): Promise<AvatarRow[] | null> {
  const { data, error } = await getSupabase().from("domain_avatars").select(ROW_COLUMNS).eq("domain_id", domainId);
  if (error) {
    if (isNotMigrated(error)) return null;
    throw new Error(`Could not read avatars: ${error.message}`);
  }
  const rows = (data ?? []) as AvatarRow[];
  return rows.sort((a, b) => GENDERS.indexOf(a.gender) - GENDERS.indexOf(b.gender));
}

/**
 * Claims the right to generate this avatar so concurrent first uses don't both spend money.
 * Returns the row id when claimed, or null when someone else is (recently) on it.
 */
async function claim(
  domainId: string,
  gender: Gender,
  existing: AvatarRow | undefined,
  retryFailed: boolean
): Promise<string | null> {
  const supabase = getSupabase();
  const nowIso = new Date().toISOString();
  if (!existing) {
    const { data, error } = await supabase
      .from("domain_avatars")
      .insert({ domain_id: domainId, gender, status: "pending", created_at: nowIso })
      .select("id")
      .maybeSingle();
    if (error) {
      if (error.code === "23505") return null; // lost the race
      throw new Error(`Could not start avatar: ${error.message}`);
    }
    return (data as { id: string } | null)?.id ?? null;
  }
  if (existing.status === "ready") return null;
  if (existing.status === "failed" && !retryFailed) return null;
  if (existing.status === "pending" && Date.now() - new Date(existing.created_at).getTime() < PENDING_FRESH_MS) {
    return null;
  }
  // Take over a failed (retry requested) or stale pending row, compare-and-set on status + created_at.
  const { data, error } = await supabase
    .from("domain_avatars")
    .update({ status: "pending", created_at: nowIso })
    .eq("id", existing.id)
    .eq("status", existing.status)
    .eq("created_at", existing.created_at)
    .select("id");
  if (error) throw new Error(`Could not start avatar: ${error.message}`);
  return data && data.length > 0 ? existing.id : null;
}

async function markFailed(rowId: string): Promise<void> {
  try {
    await getSupabase().from("domain_avatars").update({ status: "failed" }).eq("id", rowId);
  } catch (error) {
    console.error("could not mark avatar failed:", error);
  }
}

async function generateOne(opts: {
  user: AppUser | null;
  domain: Domain;
  gender: Gender;
  rowId: string;
  prompt: string;
  generator: ImageGenerator;
}): Promise<void> {
  const { user, domain, gender, rowId, prompt, generator } = opts;
  try {
    const image = await generator.generate({ prompt, aspect: "1:1" });
    const ext = extensionForMime(image.mimeType);
    const path = `domains/${domain.id}/${gender}.${ext}`;
    const supabase = getSupabase();
    const upload = await supabase.storage
      .from(SCENE_IMAGES_BUCKET)
      .upload(path, image.data, { contentType: image.mimeType, upsert: true });
    if (upload.error) throw new Error(`Upload failed: ${upload.error.message}`);
    const { error } = await supabase
      .from("domain_avatars")
      .update({ status: "ready", image_path: path })
      .eq("id", rowId);
    if (error) throw new Error(`Could not save avatar: ${error.message}`);
    backupAfterUpload({
      bucket: SCENE_IMAGES_BUCKET,
      path,
      folder: domain.slug,
      fileName: `${gender}.${ext}`,
      contentType: image.mimeType,
      record: { table: "domain_avatars", match: { id: rowId } },
    });
    await logActivity(user, null, "domain.avatar_generated", { domainId: domain.id, gender, avatarId: rowId });
  } catch (error) {
    console.error(`domain avatar (${domain.slug}/${gender}) failed:`, error instanceof Error ? error.message : error);
    await markFailed(rowId);
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const url = new URL(request.url);
    const generate = url.searchParams.get("generate") !== "0";
    const retry = url.searchParams.get("retry") === "1";

    const domain = await getDomain(id);
    if (!domain) return NextResponse.json({ avatars: [] });

    let rows = await readRows(domain.id);
    if (rows === null) return NextResponse.json({ avatars: [] });

    if (generate) {
      const todo = GENDERS.filter((gender) => {
        const row = rows!.find((r) => r.gender === gender);
        if (!row) return true;
        if (row.status === "ready") return false;
        if (row.status === "failed") return retry;
        return Date.now() - new Date(row.created_at).getTime() >= PENDING_FRESH_MS;
      });

      const template = todo.length > 0 ? await getPrompt("avatar_character") : null;
      if (todo.length > 0 && template) {
        // Throws MissingApiKeyError before anything is claimed, so no stuck rows are left behind.
        const generator = await getImageGeneratorFor(user);
        const jobs: Promise<void>[] = [];
        for (const gender of todo) {
          const existing = rows.find((r) => r.gender === gender);
          const rowId = await claim(domain.id, gender, existing, retry);
          if (!rowId) continue;
          const prompt = fillPrompt(template, {
            gender,
            domain_name: domain.name,
            outfit_description: domain.outfitDescription,
          });
          jobs.push(generateOne({ user, domain, gender, rowId, prompt, generator }));
        }
        await Promise.all(jobs);
        rows = (await readRows(domain.id)) ?? [];
      }
    }

    return NextResponse.json({ avatars: rows.map(toDto) });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    const missingKey = missingApiKeyResponse(error);
    if (missingKey) return missingKey;
    console.error("domain avatars failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
