import { NextResponse } from "next/server";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { getSupabase } from "@/lib/db";
import {
  isMissingSchemaError,
  PROJECT_SELECT_COLUMNS,
  rowToProject,
  selectWithDomainColumns,
  updatedByFields,
  type ProjectPayload,
  type ProjectRow,
} from "@/lib/projects";
import { contentFingerprint, PUBLISHING_STALE_MS, summarizeNarration } from "@/lib/contentVersion";
import type { CaseStudyBinding, Chunk, Project, PublicationRecord } from "@/lib/types";
import { AVATARS, avatarVideoFallbackUrl, type Avatar } from "@/lib/avatars";
import { resolveAvatars } from "@/lib/domainAvatars";
import { COMPANY_LOGOS_BUCKET, SCENE_IMAGES_BUCKET } from "@/lib/storageUrls";
import { VOYAGE_ASSET_ROOT, voyageAssetPaths, type VoyageMood } from "@/lib/voyage";
import { caseStudySectionsAsChunks, flattenCaseStudySections, sectionKeyFromChunkId } from "@/lib/caseStudySections";
import { showcaseAssetPaths } from "@/lib/showcase";
import { LUNAR_MOON_TEXTURE_PUBLIC_PATH, renderStaticSite } from "@/lib/publish/staticSite";
import { TEMPLATE_UNAVAILABLE_MESSAGE, isTemplateAvailable } from "@/lib/templates";
import { deployToVercelDetailed, getPublishBaseDomain, publishTokenConfigured, type DeployFile } from "@/lib/publish/vercel";
import { publishLocally } from "@/lib/publish/local";
import { authEnabled, isProductionRuntime, requireUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import { getPublishNamePrefix, siteLabel, stripNamePrefix, validateSubdomain } from "@/lib/subdomain";
import { checkSubdomainAvailability } from "@/app/api/subdomains/availability";
import { apiErrorResponse, HttpError, notConfigured, toProviderError } from "@/lib/server/errors";
import { requireQuota } from "@/lib/server/quota";
import { caseStudyStorageId, isValidChunkId, isValidProjectId, storagePathOrNull } from "@/lib/server/ids";
import { appBaseUrl } from "@/lib/server/appUrl";
import { cleanLogoBytes, logoExtension, rasterizeLogo } from "@/lib/server/logos";
import { recordSiteName, siteOwnership } from "@/lib/server/siteNames";

// Uploading a bundle (avatar videos/models) and waiting for Vercel to mark the
// deployment READY can take well over the default function timeout.
export const maxDuration = 300;

const VOYAGE_MOODS: VoyageMood[] = ["calm", "tense", "bright"];
const AUDIO_BUCKET = "chunk-audio";
const VIDEO_BUCKET = "chunk-video";

/**
 * The renderers build narration URLs as `${base}/storage/v1/object/public/chunk-audio/<projectId>/<id>.mp3`
 * (and chunk-video for section videos). Publishing passes "." as that base and bundles every file at
 * the same relative path, so a published site is a self-contained snapshot (AR-05): regenerating or
 * deleting narration later never changes or breaks it, and listeners never use Supabase egress.
 */
const BUNDLE_MEDIA_BASE = ".";
const bundledMediaFile = (bucket: string, objectPath: string) => `storage/v1/object/public/${bucket}/${objectPath}`;

function publicAssetUrl(baseUrl: string, relativePath: string): string {
  return `${baseUrl}/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

async function readPublicAsset(relativePath: string, baseUrl: string): Promise<Buffer> {
  try {
    return await readFile(path.join(process.cwd(), "public", relativePath));
  } catch {
    const res = await fetch(publicAssetUrl(baseUrl, relativePath), { cache: "no-store", redirect: "error" });
    if (!res.ok) throw new Error(`Asset ${relativePath} is missing (not on disk, and ${res.status} from the app URL).`);
    return Buffer.from(await res.arrayBuffer());
  }
}

async function publicAssetExists(relativePath: string, baseUrl: string): Promise<boolean> {
  try {
    await access(path.join(process.cwd(), "public", relativePath));
    return true;
  } catch {
    try {
      const res = await fetch(publicAssetUrl(baseUrl, relativePath), { method: "HEAD", cache: "no-store", redirect: "error" });
      return res.ok;
    } catch {
      return false;
    }
  }
}

async function findVoyageMusic(baseUrl: string): Promise<Partial<Record<VoyageMood, string>>> {
  const found: Partial<Record<VoyageMood, string>> = {};
  for (const mood of VOYAGE_MOODS) {
    const publicPath = `${VOYAGE_ASSET_ROOT}/audio/${mood}.mp3`;
    // No own track for this mood → the generated bed is used.
    if (await publicAssetExists(publicPath.replace(/^\//, ""), baseUrl)) found[mood] = publicPath;
  }
  return found;
}

// ---------------------------------------------------------------------------
// Bundling Supabase Storage objects (domain avatars, scene images, logo, narration).
// Everything is read with the storage API by object path; no URL that came from
// a client is ever fetched (SEC-04).
// ---------------------------------------------------------------------------

type Supa = ReturnType<typeof getSupabase>;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function imageExtension(contentType: string | null, objectPath: string): string {
  const fromType = IMAGE_EXTENSIONS[(contentType ?? "").split(";")[0].trim().toLowerCase()];
  if (fromType) return fromType;
  const fromPath = /\.([a-z0-9]{2,5})$/i.exec(objectPath)?.[1]?.toLowerCase();
  return fromPath && Object.values(IMAGE_EXTENSIONS).includes(fromPath) ? fromPath : "png";
}

function safeFileStem(value: string): string {
  return value.replace(/[^a-z0-9_-]/gi, "-").slice(0, 60) || "file";
}

async function downloadObject(supabase: Supa, bucket: string, objectPath: string): Promise<{ bytes: Buffer; type: string } | null> {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(objectPath);
    if (error || !data) return null;
    const bytes = Buffer.from(await data.arrayBuffer());
    return bytes.length > 0 ? { bytes, type: data.type ?? "" } : null;
  } catch {
    return null;
  }
}

/** Downloads a raster image object and adds it under `<folder>/<stem>.<ext>`; null when it can't. */
async function bundleStorageImage(
  supabase: Supa,
  bucket: string,
  objectPath: string,
  folder: string,
  stem: string,
  files: DeployFile[]
): Promise<string | null> {
  const object = await downloadObject(supabase, bucket, objectPath);
  if (!object) {
    console.warn(`publish: could not bundle ${folder} image ${stem}`);
    return null;
  }
  const ext = imageExtension(object.type, objectPath);
  const file = `${folder}/${safeFileStem(stem)}.${ext}`;
  files.push({ file, data: object.bytes.toString("base64"), encoding: "base64" });
  return file;
}

/** Runs `task` over `items` a few at a time, keeping order. */
async function mapInBatches<T, R>(items: T[], size: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(task))));
  return out;
}

/** The scene-images object path behind one of our own public URLs, or null for anything else. */
function sceneImageObjectPath(url: string | undefined): string | null {
  const base = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  if (!url || !base) return null;
  const prefix = `${base}/storage/v1/object/public/${SCENE_IMAGES_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  const objectPath = url.slice(prefix.length).split(/[?#]/)[0].split("/").map(decodeURIComponent);
  return storagePathOrNull(...objectPath);
}

/** Generated (domain) avatars carry public Storage URLs; bundle them and point the avatar at the bundled file. */
async function bundleDomainAvatars(supabase: Supa, avatars: Avatar[], files: DeployFile[]): Promise<Avatar[]> {
  return mapInBatches(avatars, 2, async (avatar) => {
    const urls = Array.from(new Set([avatar.imageUrl, ...Object.values(avatar.emotions)].filter((u): u is string => /^https?:\/\//i.test(u ?? ""))));
    if (urls.length === 0) return avatar;
    const bundled = new Map<string, string>();
    for (const [i, url] of urls.entries()) {
      const objectPath = sceneImageObjectPath(url);
      if (!objectPath) continue;
      const file = await bundleStorageImage(supabase, SCENE_IMAGES_BUCKET, objectPath, "story-avatars", `${avatar.id.replace(/^domain:/, "")}-${i}`, files);
      if (file) bundled.set(url, file);
    }
    const swap = (url: string | undefined) => (url && bundled.get(url)) || url;
    return {
      ...avatar,
      imageUrl: swap(avatar.imageUrl) ?? avatar.imageUrl,
      emotions: Object.fromEntries(Object.entries(avatar.emotions).map(([key, url]) => [key, swap(url)])) as Avatar["emotions"],
    };
  });
}

/**
 * Chapters with a ready scene image get it bundled and `imageUrl` set to the
 * relative path. The image is read from chapter_images.image_path only, never
 * from the chunk's imageUrl (SEC-04). Chapters without one fall back to the
 * avatar exactly as before. Without migration 003 nothing changes.
 */
async function bundleSceneImages(supabase: Supa, projectId: string, chunks: Chunk[], files: DeployFile[]): Promise<Chunk[]> {
  const pathByChunk = new Map<string, string>();
  try {
    const { data, error } = await supabase
      .from("chapter_images")
      .select("chunk_id, image_path, status")
      .eq("project_id", projectId)
      .eq("status", "ready");
    if (error) {
      if (!isMissingSchemaError(error)) console.warn("publish: reading chapter_images failed:", error.message);
    } else {
      for (const row of (data ?? []) as { chunk_id: string; image_path: string | null }[]) {
        const objectPath = row.image_path ? storagePathOrNull(...row.image_path.split("/")) : null;
        if (objectPath) pathByChunk.set(row.chunk_id, objectPath);
      }
    }
  } catch (error) {
    console.warn("publish: reading chapter_images failed:", error instanceof Error ? error.message : error);
  }

  return mapInBatches(chunks, 4, async (chunk) => {
    const withoutImage = { ...chunk, imageUrl: undefined, imageStatus: undefined };
    const objectPath = pathByChunk.get(chunk.id);
    if (!objectPath) return withoutImage;
    const file = await bundleStorageImage(supabase, SCENE_IMAGES_BUCKET, objectPath, "scene-images", chunk.id, files);
    return file ? { ...chunk, imageUrl: file } : withoutImage;
  });
}

/**
 * The company logo bundled as `logo/logo.<ext>`. An SVG is sanitised and rasterised to
 * PNG first, so no active content ever reaches a published site (SEC-07, SEC-08).
 */
async function bundleLogo(supabase: Supa, logoPath: string, files: DeployFile[]): Promise<string | undefined> {
  const ext = logoExtension(logoPath);
  if (!ext) return undefined;
  const object = await downloadObject(supabase, COMPANY_LOGOS_BUCKET, logoPath);
  if (!object) return undefined;
  if (ext === ".svg") {
    const png = await rasterizeLogo(object.bytes, ext);
    if (!png) return undefined;
    files.push({ file: "logo/logo.png", data: png.toString("base64"), encoding: "base64" });
    return "logo/logo.png";
  }
  const cleaned = cleanLogoBytes(ext, object.bytes);
  if (!cleaned.ok) return undefined;
  const file = `logo/logo${ext === ".jpeg" ? ".jpg" : ext}`;
  files.push({ file, data: Buffer.from(cleaned.bytes).toString("base64"), encoding: "base64" });
  return file;
}

interface MediaBundle {
  /** Chunks / sections whose narration could not be copied (their audio is dropped from the site). */
  missingAudio: string[];
  chunks: Chunk[];
  binding: CaseStudyBinding | null | undefined;
}

/**
 * Copies every narration mp3 (and section video) the site plays into the bundle (AR-05).
 * Narration that cannot be read is removed from the site's data and reported.
 */
async function bundleNarration(supabase: Supa, project: Project, usesSections: boolean, files: DeployFile[]): Promise<MediaBundle> {
  const missingAudio: string[] = [];
  const addMedia = async (bucket: string, storageId: string, ext: "mp3" | "mp4", contentLabel: string): Promise<boolean> => {
    if (!isValidChunkId(storageId)) return false;
    const objectPath = `${project.id}/${storageId}.${ext}`;
    const object = await downloadObject(supabase, bucket, objectPath);
    if (!object) {
      console.warn(`publish: could not bundle ${contentLabel} ${storageId}`);
      return false;
    }
    files.push({ file: bundledMediaFile(bucket, objectPath), data: object.bytes.toString("base64"), encoding: "base64" });
    return true;
  };

  if (usesSections && project.caseStudyBinding?.slots) {
    const binding = project.caseStudyBinding;
    const sectionAudio = { ...binding.sectionAudio };
    const sectionVideo = { ...binding.sectionVideo };
    const keys = flattenCaseStudySections(binding.slots).map((section) => section.key);
    await mapInBatches(keys, 4, async (key) => {
      if (sectionAudio[key] && !(await addMedia(AUDIO_BUCKET, caseStudyStorageId(key), "mp3", "narration"))) {
        delete sectionAudio[key];
        missingAudio.push(key);
      }
      if (sectionVideo[key] && !(await addMedia(VIDEO_BUCKET, caseStudyStorageId(key), "mp4", "video"))) {
        delete sectionVideo[key];
      }
    });
    return { missingAudio, chunks: project.chunks, binding: { ...binding, sectionAudio, sectionVideo } };
  }

  const chunks = await mapInBatches(project.chunks, 4, async (chunk) => {
    if (!chunk.audioUrl) return chunk;
    if (await addMedia(AUDIO_BUCKET, chunk.id, "mp3", "narration")) return chunk;
    missingAudio.push(chunk.id);
    return { ...chunk, audioUrl: undefined };
  });
  return { missingAudio, chunks, binding: project.caseStudyBinding };
}

function sanitizeProjectName(id: string): string {
  return `story-${id.replace(/[^a-z0-9]/gi, "").slice(0, 16).toLowerCase()}`;
}

/** Ids (chunk ids or section keys) the site would play without narration. */
function chaptersWithoutAudio(project: Project): { ids: string[]; total: number } {
  const summary = summarizeNarration(project, project.selectedVoice);
  if (summary.kind === "case-study") {
    const audio = project.caseStudyBinding?.sectionAudio ?? {};
    return { ids: summary.needed.filter((key) => !audio[key]), total: summary.total };
  }
  const withAudio = new Set(project.chunks.filter((chunk) => chunk.audioUrl).map((chunk) => chunk.id));
  return { ids: summary.needed.filter((id) => !withAudio.has(id)), total: summary.total };
}

function narrationIncomplete(ids: string[], total: number): HttpError {
  return new HttpError(
    409,
    "narration_incomplete",
    `${ids.length} of ${total} chapters have no narration yet. Generate the missing narration, or publish without it.`,
    { missing: ids, total }
  );
}

/**
 * POST /api/projects/[id]/publish
 * Body (all optional): { subdomain?: string, allowMissingAudio?: boolean }
 *
 * Errors (JSON { error, code, ... }):
 *  - 409 narration_incomplete { missing: string[], total }: chapters (or case-study sections)
 *    have no narration; send allowMissingAudio: true to publish them silent (UX-09).
 *  - 409 publish_in_progress: another publish of this story started less than 6 minutes ago.
 *  - 409 site_name_taken / 503 (availability unknown): address problems.
 *  - 429 quota_exceeded: daily publish or new-address limit.
 *  - 503 not_configured: publishing is not set up on this server.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = getSupabase();
  let user: Awaited<ReturnType<typeof requireUser>> = null;
  let claimed = false;
  let previousStatus: Project["publishStatus"] = "draft";

  try {
    user = await requireUser();
    if (!isValidProjectId(id)) return NextResponse.json({ error: "Project not found.", code: "not_found" }, { status: 404 });

    // Body is optional; old callers POST with no body.
    // `subdomain` is the name part only; the Vercel project / host label is
    // PUBLISH_NAME_PREFIX + name (e.g. warpdrive-acme-hr.vercel.app).
    const namePrefix = getPublishNamePrefix();
    const body = (await request.json().catch(() => ({}))) as { subdomain?: unknown; allowMissingAudio?: unknown } | null;
    const allowMissingAudio = body?.allowMissingAudio === true;
    let subdomain: string | undefined;
    if (body && typeof body.subdomain === "string" && body.subdomain.trim()) {
      const validation = validateSubdomain(stripNamePrefix(body.subdomain.trim().toLowerCase(), namePrefix), namePrefix);
      if (!validation.ok) return NextResponse.json({ error: validation.reason, code: "bad_request" }, { status: 400 });
      subdomain = validation.value;
    }

    // Includes domain_id / domain_avatar_id / logo_path once migration 003 is applied (falls back without them).
    const { data: existing, error: fetchError } = await selectWithDomainColumns(`${PROJECT_SELECT_COLUMNS}, updated_at`, (columns) => {
      let query = supabase.from("projects").select(columns).eq("id", id);
      if (user) query = query.eq("owner_id", user.id);
      return query.maybeSingle();
    });

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) {
      return NextResponse.json({ error: "Project not found.", code: "not_found" }, { status: 404 });
    }

    // The subdomain column only exists once the accounts migration is applied
    // (AUTH_ENABLED=1). Republishing without a new subdomain reuses it.
    let previousSubdomain: string | null = null;
    if (authEnabled()) {
      const { data: row, error: subError } = await supabase.from("projects").select("subdomain").eq("id", id).maybeSingle();
      if (subError) throw new Error(subError.message);
      previousSubdomain = (row as { subdomain?: string | null } | null)?.subdomain ?? null;
      if (!subdomain && previousSubdomain) subdomain = previousSubdomain;
    }

    const project = rowToProject(existing as unknown as ProjectRow);
    previousStatus = project.publishStatus;
    const isCaseStudy = project.documentType === "case-study";
    const isShowcase = project.selectedTemplateId === "showcase";

    // Case-study projects always publish their bound layout (see
    // renderStaticSite) rather than picking one of the generic chunk-based
    // templates, so a template selection isn't required for them — a
    // generated layout is, since there's nothing to publish without one.
    if (isCaseStudy && !project.caseStudyBinding?.slots) {
      throw new HttpError(400, "bad_request", "Generate the case study layout before publishing.");
    }
    if (!isCaseStudy && !project.selectedTemplateId) {
      throw new HttpError(400, "bad_request", "Select a template before publishing.");
    }
    // A template that was removed or hidden since it was picked never publishes
    // with a surprise look (case studies publish their own layout, see above).
    if (!isCaseStudy && !isTemplateAvailable(project.selectedTemplateId)) {
      throw new HttpError(400, "bad_request", TEMPLATE_UNAVAILABLE_MESSAGE);
    }
    // Showcase draws its own fixed lead character, so it needs no avatar (UX-05).
    if (!isShowcase && (!project.selectedAvatarIds || project.selectedAvatarIds.length === 0)) {
      throw new HttpError(400, "bad_request", "Select at least one avatar before publishing.");
    }

    // Chapters with no narration at all: refuse unless the caller says so (UX-09).
    const silent = chaptersWithoutAudio(project);
    if (silent.ids.length > 0 && !allowMissingAudio) throw narrationIncomplete(silent.ids, silent.total);

    const deployingToVercel = publishTokenConfigured();
    if (!deployingToVercel && isProductionRuntime()) throw notConfigured("Publishing");

    // Authoritative availability re-check (the dialog's live check is advisory), incl. who owns the address (SEC-09).
    let newAddress = false;
    if (deployingToVercel && subdomain) {
      const availability = await checkSubdomainAvailability(subdomain, { projectId: id, userId: user?.id ?? null });
      if (!availability.available) {
        throw new HttpError(availability.status === "unknown" ? 503 : 409, availability.status === "unknown" ? "provider_error" : "site_name_taken", availability.reason);
      }
      newAddress = (await siteOwnership(subdomain, id, user?.id ?? null)) !== "this_project";
    }

    // Per-user limits on the shared hosting account (SEC-11).
    await requireQuota(user, "publish");
    if (newAddress) await requireQuota(user, "new_site");

    // Claim: one publish per story at a time. A "publishing" state older than
    // PUBLISHING_STALE_MS is a run Vercel killed at 300 s and may be taken over (UX-03, AR-12).
    const now = new Date();
    const staleBefore = new Date(now.getTime() - PUBLISHING_STALE_MS).toISOString();
    let claimQuery = supabase
      .from("projects")
      .update({ status: "publishing", updated_at: now.toISOString() })
      .eq("id", id)
      .or(`status.neq.publishing,updated_at.lt.${staleBefore}`);
    if (user) claimQuery = claimQuery.eq("owner_id", user.id);
    const { data: claimRows, error: claimError } = await claimQuery.select("id");
    if (claimError) throw new Error(claimError.message);
    if (!claimRows || claimRows.length === 0) {
      throw new HttpError(409, "publish_in_progress", "This story is already being published. Wait for it to finish (at most a few minutes).");
    }
    claimed = true;

    const baseUrl = appBaseUrl(new URL(request.url).origin);

    // Static ids resolve from AVATARS, domain ids from the database (resolveAvatars); order is kept.
    const avatarIds = project.selectedAvatarIds ?? [];
    const resolvedAvatars = await resolveAvatars(avatarIds).catch((error) => {
      console.warn("publish: resolving avatars failed:", error instanceof Error ? error.message : error);
      return [] as Avatar[];
    });
    const resolvedAvatarList = avatarIds
      .map((avatarId) => resolvedAvatars.find((avatar) => avatar.id === avatarId) ?? AVATARS.find((avatar) => avatar.id === avatarId))
      .filter((avatar): avatar is Avatar => Boolean(avatar));

    // Generated avatars, scene images, the logo and the narration live in Supabase Storage; they are
    // copied into the deploy bundle so the published site is self-contained. A failed image download
    // never fails the publish.
    const storageFiles: DeployFile[] = [];
    const selectedAvatars = await bundleDomainAvatars(supabase, resolvedAvatarList, storageFiles);

    const usesSections = isCaseStudy && Boolean(project.caseStudyBinding?.slots);
    const media = await bundleNarration(supabase, project, usesSections, storageFiles);
    if (media.missingAudio.length > 0 && !allowMissingAudio) {
      throw narrationIncomplete(media.missingAudio, silent.total);
    }

    // Case studies on Showcase show their sections as chapters, so the scene images are bundled per
    // section (ids `case-study-<key>`) and handed to the renderer as sectionImages. Other case studies have none.
    const showcaseCaseStudy = isCaseStudy && isShowcase;
    let sectionImages: Project["sectionImages"];
    if (showcaseCaseStudy) {
      const sectionChunks = caseStudySectionsAsChunks(flattenCaseStudySections(project.caseStudyBinding?.slots ?? null), undefined);
      const bundledSections = await bundleSceneImages(supabase, id, sectionChunks, storageFiles);
      for (const chunk of bundledSections) {
        const key = sectionKeyFromChunkId(chunk.id);
        if (key && chunk.imageUrl) (sectionImages ??= {})[key] = { imageUrl: chunk.imageUrl, imageStatus: "ready" };
      }
    }
    const bundledChunks = isCaseStudy ? media.chunks : await bundleSceneImages(supabase, id, media.chunks, storageFiles);
    const rowLogoPath = (existing as unknown as ProjectRow).logo_path;
    const bundledLogo = rowLogoPath ? await bundleLogo(supabase, rowLogoPath, storageFiles) : undefined;

    // Upload every emotion pose for each selected avatar — small files, and simpler
    // than computing exactly which emotions this story's chunks actually use.
    // The GLB model (when the avatar has one) rides along the same way, so the
    // published bundle's AVATAR3D_INIT_JS script can fetch it client-side.
    const avatarImagePaths = Array.from(new Set(selectedAvatars.flatMap((avatar) => Object.values(avatar.emotions))))
      .filter((assetUrl): assetUrl is string => typeof assetUrl === "string" && assetUrl.startsWith("/"));
    // A model is only shipped for avatars without a video — a video, when
    // present, is what every template shows (see avatarBoxHtml).
    const avatarModelPaths = Array.from(
      new Set(
        selectedAvatars
          .filter((avatar) => !avatar.videoUrls || avatar.videoUrls.length === 0)
          .map((avatar) => avatar.modelUrl)
          .filter((url): url is string => Boolean(url))
      )
    );
    const avatarVideoPaths = Array.from(
      new Set(
        selectedAvatars.flatMap((avatar) =>
          (avatar.videoUrls ?? []).flatMap((url) => [url, avatarVideoFallbackUrl(url)].filter((u): u is string => Boolean(u)))
        )
      )
    );
    const isVoyage = project.selectedTemplateId === "voyage";
    // Optional own music: public/themes/voyage/audio/{calm,tense,bright}.mp3 replace
    // the generated beds for those moods.
    const voyageMusic = isVoyage ? await findVoyageMusic(baseUrl) : {};
    const themeAssetPaths =
      project.selectedTemplateId === "lunar"
        ? [LUNAR_MOON_TEXTURE_PUBLIC_PATH]
        : isVoyage
          ? [...voyageAssetPaths(), ...Object.values(voyageMusic)]
          : isShowcase
            ? showcaseAssetPaths()
            : [];
    const avatarDeployFiles: DeployFile[] = await Promise.all(
      [...avatarImagePaths, ...avatarModelPaths, ...avatarVideoPaths, ...themeAssetPaths]
        .filter((assetUrl) => assetUrl.startsWith("/") && !assetUrl.includes(".."))
        .map(async (assetUrl) => {
          const relativePath = assetUrl.replace(/^\//, "");
          const fileBuffer = await readPublicAsset(relativePath, baseUrl);
          return { file: relativePath, data: fileBuffer.toString("base64"), encoding: "base64" as const };
        })
    );

    const siteProject: Project = {
      ...project,
      chunks: bundledChunks,
      caseStudyBinding: media.binding,
      logoUrl: bundledLogo,
      ...(sectionImages ? { sectionImages } : {}),
    };
    const html = renderStaticSite(siteProject, selectedAvatars, BUNDLE_MEDIA_BASE, { voyage: { customMusic: voyageMusic } });
    const files: DeployFile[] = [
      { file: "index.html", data: Buffer.from(html, "utf-8").toString("base64"), encoding: "base64" },
      ...avatarDeployFiles,
      ...storageFiles,
    ];

    // Hosting: Vercel when a publishing token is set; otherwise (local development
    // only) the site is written to public/published/<id>/ on this machine.
    //
    // With a subdomain the Vercel project is named <prefix><name> (which yields
    // <prefix><name>.vercel.app, or <prefix><name>.<PUBLISH_BASE_DOMAIN> when
    // configured); without one the legacy story-<id> project name is kept.
    // Changing the subdomain deploys a new Vercel project; the old one is left
    // in place (not deleted) and stays recorded for this story in site_names.
    let publishedUrl: string;
    let deploymentId: string | null = null;
    let vercelProjectName: string | null = null;
    if (deployingToVercel) {
      const baseDomain = getPublishBaseDomain();
      vercelProjectName = subdomain ? siteLabel(subdomain, namePrefix) : sanitizeProjectName(id);
      try {
        const result = await deployToVercelDetailed(vercelProjectName, files, {
          customDomain: subdomain && baseDomain ? `${vercelProjectName}.${baseDomain}` : undefined,
        });
        publishedUrl = result.url;
        deploymentId = result.deploymentId;
      } catch (error) {
        console.error("publish: deploy failed:", error);
        const classified = toProviderError(error, "vercel");
        // Messages from attachProjectDomain are already written for people.
        if (error instanceof Error && /^The address |was added to the Vercel project but is not verified/.test(error.message)) {
          throw new HttpError(409, "site_name_taken", error.message.replace(/PUBLISH_BASE_DOMAIN/g, "the publishing domain"));
        }
        throw classified;
      }
    } else {
      publishedUrl = await publishLocally(id, files, new URL(request.url).origin);
    }

    const publishedAt = new Date().toISOString();

    // Record what just went live (see src/lib/contentVersion.ts): the
    // fingerprint of the project as rendered above, merged into a fresh read of
    // the payload so an edit saved while the deploy ran is neither lost nor
    // mistaken for published (its fingerprint won't match).
    let freshQuery = supabase.from("projects").select("payload").eq("id", id);
    if (user) freshQuery = freshQuery.eq("owner_id", user.id);
    const { data: freshRow, error: freshError } = await freshQuery.maybeSingle();
    if (freshError) throw new Error(freshError.message);
    const freshPayload = ((freshRow as { payload?: ProjectPayload } | null)?.payload ??
      (existing as unknown as ProjectRow).payload) as ProjectPayload;
    const publication: PublicationRecord = { contentHash: contentFingerprint(project), publishedAt };

    const accountFields: Record<string, string> = user
      ? {
          ...updatedByFields(user),
          published_at: publishedAt,
          published_by: user.id,
          ...(deployingToVercel && subdomain ? { subdomain } : {}),
        }
      : {};

    let updateQuery = supabase
      .from("projects")
      .update({
        status: "published",
        published_url: publishedUrl,
        payload: { ...freshPayload, publication },
        updated_at: publishedAt,
        ...accountFields,
      })
      .eq("id", id);
    if (user) updateQuery = updateQuery.eq("owner_id", user.id);
    const { data: updated, error: updateError } = await updateQuery.select(PROJECT_SELECT_COLUMNS).single();

    if (updateError) {
      if (updateError.code === "23505") {
        throw new HttpError(409, "site_name_taken", "Another story claimed this address a moment ago. Choose a different address.");
      }
      throw new Error(updateError.message);
    }
    claimed = false;

    if (deployingToVercel && subdomain && vercelProjectName) {
      await recordSiteName(subdomain, id, user?.id ?? null, vercelProjectName);
    }

    if (user && authEnabled()) {
      const { error: pubError } = await supabase.from("publications").insert({
        project_id: id,
        subdomain: deployingToVercel ? (subdomain ?? null) : null,
        url: publishedUrl,
        deployment_id: deploymentId,
        template_id: isCaseStudy ? "case-study" : (project.selectedTemplateId ?? null),
        published_by: user.id,
        published_at: publishedAt,
      });
      if (pubError) console.error("publications insert failed:", pubError.message);
      await logActivity(user, id, "project.published", {
        url: publishedUrl,
        subdomain: subdomain ?? null,
        previousSubdomain: previousSubdomain && previousSubdomain !== subdomain ? previousSubdomain : null,
        deploymentId,
        target: deployingToVercel ? "vercel" : "local",
        silentChapters: media.missingAudio.length > 0 ? media.missingAudio : silent.ids.length > 0 ? silent.ids : undefined,
      });
    }

    return NextResponse.json({ project: rowToProject(updated as unknown as ProjectRow), url: publishedUrl });
  } catch (error) {
    if (claimed) {
      // A refused request (4xx) puts the previous state back; a real failure marks it failed.
      const restore = error instanceof HttpError && error.status < 500 ? previousStatus : "failed";
      let resetQuery = supabase.from("projects").update({ status: restore === "publishing" ? "failed" : restore }).eq("id", id);
      if (user) resetQuery = resetQuery.eq("owner_id", user.id);
      await Promise.resolve(resetQuery).catch(() => undefined);
    }
    return apiErrorResponse(error, "publish");
  }
}
