import { NextResponse } from "next/server";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { getSupabase } from "@/lib/db";
import {
  PROJECT_SELECT_COLUMNS,
  rowToProject,
  updatedByFields,
  type ProjectPayload,
  type ProjectRow,
} from "@/lib/projects";
import { contentFingerprint } from "@/lib/contentVersion";
import type { PublicationRecord } from "@/lib/types";
import { AVATARS, avatarVideoFallbackUrl } from "@/lib/avatars";
import { VOYAGE_ASSET_ROOT, voyageAssetPaths, type VoyageMood } from "@/lib/voyage";
import { showcaseAssetPaths } from "@/lib/showcase";
import { LUNAR_MOON_TEXTURE_PUBLIC_PATH, renderStaticSite } from "@/lib/publish/staticSite";
import { deployToVercelDetailed, getPublishBaseDomain, type DeployFile } from "@/lib/publish/vercel";
import { publishLocally } from "@/lib/publish/local";
import { authEnabled, requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import { getPublishNamePrefix, siteLabel, stripNamePrefix, validateSubdomain } from "@/lib/subdomain";
import { checkSubdomainAvailability } from "@/app/api/subdomains/availability";

// Uploading a bundle (avatar videos/models) and waiting for Vercel to mark the
// deployment READY can take well over the default function timeout.
export const maxDuration = 300;

const VOYAGE_MOODS: VoyageMood[] = ["calm", "tense", "bright"];

/**
 * Base URL the running app serves /public from. On Vercel the public folder
 * is served by the CDN and isn't guaranteed to exist on the function's
 * filesystem, so assets missing from disk are fetched from here instead.
 */
function assetBaseUrl(requestOrigin: string): string {
  return (process.env.APP_BASE_URL || requestOrigin).replace(/\/+$/, "");
}

function publicAssetUrl(baseUrl: string, relativePath: string): string {
  return `${baseUrl}/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

async function readPublicAsset(relativePath: string, baseUrl: string): Promise<Buffer> {
  try {
    return await readFile(path.join(process.cwd(), "public", relativePath));
  } catch {
    const res = await fetch(publicAssetUrl(baseUrl, relativePath), { cache: "no-store" });
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
      const res = await fetch(publicAssetUrl(baseUrl, relativePath), { method: "HEAD", cache: "no-store" });
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

function sanitizeProjectName(id: string): string {
  return `story-${id.replace(/[^a-z0-9]/gi, "").slice(0, 16).toLowerCase()}`;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = getSupabase();
  let user: Awaited<ReturnType<typeof requireUser>> = null;
  let projectVerified = false;

  try {
    user = await requireUser();

    // Body is optional ({ subdomain?: string }); old callers POST with no body.
    // `subdomain` is the name part only; the Vercel project / host label is
    // PUBLISH_NAME_PREFIX + name (e.g. warpdrive-acme-hr.vercel.app).
    const namePrefix = getPublishNamePrefix();
    const body = (await request.json().catch(() => ({}))) as { subdomain?: unknown };
    let subdomain: string | undefined;
    if (body && typeof body.subdomain === "string" && body.subdomain.trim()) {
      const validation = validateSubdomain(stripNamePrefix(body.subdomain.trim().toLowerCase(), namePrefix), namePrefix);
      if (!validation.ok) return NextResponse.json({ error: validation.reason }, { status: 400 });
      subdomain = validation.value;
    }

    let query = supabase.from("projects").select(PROJECT_SELECT_COLUMNS).eq("id", id);
    if (user) query = query.eq("owner_id", user.id);
    const { data: existing, error: fetchError } = await query.maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    projectVerified = true;

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
    const isCaseStudy = project.documentType === "case-study";

    // Case-study projects always publish their bound layout (see
    // renderStaticSite) rather than picking one of the generic chunk-based
    // templates, so a template selection isn't required for them — a
    // generated layout is, since there's nothing to publish without one.
    if (isCaseStudy && !project.caseStudyBinding?.slots) {
      return NextResponse.json(
        { error: "Generate the case study layout before publishing." },
        { status: 400 }
      );
    }
    if (!isCaseStudy && !project.selectedTemplateId) {
      return NextResponse.json({ error: "Select a template before publishing." }, { status: 400 });
    }
    if (!project.selectedAvatarIds || project.selectedAvatarIds.length === 0) {
      return NextResponse.json({ error: "Select at least one avatar before publishing." }, { status: 400 });
    }

    const deployingToVercel = Boolean(process.env.VERCEL_TOKEN);

    // Authoritative availability re-check (the dialog's live check is advisory).
    if (deployingToVercel && subdomain) {
      const availability = await checkSubdomainAvailability(subdomain, { projectId: id });
      if (!availability.available) {
        return NextResponse.json(
          { error: availability.reason },
          { status: availability.status === "unknown" ? 503 : 409 }
        );
      }
    }

    await supabase.from("projects").update({ status: "publishing" }).eq("id", id);

    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) throw new Error("SUPABASE_URL is not set.");
    const baseUrl = assetBaseUrl(new URL(request.url).origin);

    const selectedAvatars = project.selectedAvatarIds
      .map((avatarId) => AVATARS.find((avatar) => avatar.id === avatarId))
      .filter((avatar): avatar is (typeof AVATARS)[number] => Boolean(avatar));

    // Upload every emotion pose for each selected avatar — small files, and simpler
    // than computing exactly which emotions this story's chunks actually use.
    // The GLB model (when the avatar has one) rides along the same way, so the
    // published bundle's AVATAR3D_INIT_JS script can fetch it client-side.
    const avatarImagePaths = Array.from(
      new Set(selectedAvatars.flatMap((avatar) => Object.values(avatar.emotions)))
    );
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
          : project.selectedTemplateId === "showcase"
            ? showcaseAssetPaths()
            : [];
    const avatarDeployFiles: DeployFile[] = await Promise.all(
      [...avatarImagePaths, ...avatarModelPaths, ...avatarVideoPaths, ...themeAssetPaths].map(async (assetUrl) => {
        const relativePath = assetUrl.replace(/^\//, "");
        const fileBuffer = await readPublicAsset(relativePath, baseUrl);
        return { file: relativePath, data: fileBuffer.toString("base64"), encoding: "base64" as const };
      })
    );

    const html = renderStaticSite(project, selectedAvatars, supabaseUrl, { voyage: { customMusic: voyageMusic } });
    const files: DeployFile[] = [
      { file: "index.html", data: Buffer.from(html, "utf-8").toString("base64"), encoding: "base64" },
      ...avatarDeployFiles,
    ];

    // Hosting for now: localhost, until a VERCEL_TOKEN is provided (see memory
    // note "Publish hosting: localhost for now" — this switch is intentional,
    // not a placeholder to "finish" — real deployment activates automatically
    // once the token is set, no code change needed.
    //
    // With a subdomain the Vercel project is named <prefix><name> (which yields
    // <prefix><name>.vercel.app, or <prefix><name>.<PUBLISH_BASE_DOMAIN> when
    // configured); without one the
    // legacy story-<id> project name is kept. Changing the subdomain deploys a
    // new Vercel project; the old one is left in place (not deleted).
    let publishedUrl: string;
    let deploymentId: string | null = null;
    if (deployingToVercel) {
      const baseDomain = getPublishBaseDomain();
      const projectName = subdomain ? siteLabel(subdomain, namePrefix) : sanitizeProjectName(id);
      const result = await deployToVercelDetailed(projectName, files, {
        customDomain: subdomain && baseDomain ? `${projectName}.${baseDomain}` : undefined,
      });
      publishedUrl = result.url;
      deploymentId = result.deploymentId;
    } else {
      publishedUrl = await publishLocally(id, files, new URL(request.url).origin);
    }

    const now = new Date().toISOString();

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
    const publication: PublicationRecord = { contentHash: contentFingerprint(project), publishedAt: now };

    const accountFields: Record<string, string> = user
      ? {
          ...updatedByFields(user),
          published_at: now,
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
        updated_at: now,
        ...accountFields,
      })
      .eq("id", id);
    if (user) updateQuery = updateQuery.eq("owner_id", user.id);
    const { data: updated, error: updateError } = await updateQuery.select(PROJECT_SELECT_COLUMNS).single();

    if (updateError) {
      if (updateError.code === "23505") {
        throw new Error("Another story claimed this address a moment ago. Choose a different address.");
      }
      throw new Error(updateError.message);
    }

    if (user && authEnabled()) {
      const { error: pubError } = await supabase.from("publications").insert({
        project_id: id,
        subdomain: deployingToVercel ? (subdomain ?? null) : null,
        url: publishedUrl,
        deployment_id: deploymentId,
        template_id: isCaseStudy ? "case-study" : (project.selectedTemplateId ?? null),
        published_by: user.id,
        published_at: now,
      });
      if (pubError) console.error("publications insert failed:", pubError.message);
      await logActivity(user, id, "project.published", {
        url: publishedUrl,
        subdomain: subdomain ?? null,
        previousSubdomain: previousSubdomain && previousSubdomain !== subdomain ? previousSubdomain : null,
        deploymentId,
        target: deployingToVercel ? "vercel" : "local",
      });
    }

    return NextResponse.json({ project: rowToProject(updated as unknown as ProjectRow), url: publishedUrl });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("publish failed:", error);
    if (projectVerified) {
      let failQuery = supabase.from("projects").update({ status: "failed" }).eq("id", id);
      if (user) failQuery = failQuery.eq("owner_id", user.id);
      await failQuery;
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
