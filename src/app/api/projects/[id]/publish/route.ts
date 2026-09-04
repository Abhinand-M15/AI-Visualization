import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSupabase } from "@/lib/db";
import { PROJECT_SELECT_COLUMNS, rowToProject, type ProjectRow } from "@/lib/projects";
import { AVATARS } from "@/lib/avatars";
import { renderStaticSite } from "@/lib/publish/staticSite";
import { deployToVercel, type DeployFile } from "@/lib/publish/vercel";
import { publishLocally } from "@/lib/publish/local";

function sanitizeProjectName(id: string): string {
  return `story-${id.replace(/[^a-z0-9]/gi, "").slice(0, 16).toLowerCase()}`;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = getSupabase();

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("projects")
      .select(PROJECT_SELECT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
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

    await supabase.from("projects").update({ status: "publishing" }).eq("id", id);

    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) throw new Error("SUPABASE_URL is not set.");

    const selectedAvatars = project.selectedAvatarIds
      .map((avatarId) => AVATARS.find((avatar) => avatar.id === avatarId))
      .filter((avatar): avatar is (typeof AVATARS)[number] => Boolean(avatar));

    // Upload every emotion pose for each selected avatar — small files, and simpler
    // than computing exactly which emotions this story's chunks actually use.
    const avatarImagePaths = Array.from(
      new Set(selectedAvatars.flatMap((avatar) => Object.values(avatar.emotions)))
    );
    const avatarDeployFiles: DeployFile[] = await Promise.all(
      avatarImagePaths.map(async (imageUrl) => {
        const relativePath = imageUrl.replace(/^\//, "");
        const fileBuffer = await readFile(path.join(process.cwd(), "public", relativePath));
        return { file: relativePath, data: fileBuffer.toString("base64"), encoding: "base64" as const };
      })
    );

    const html = renderStaticSite(project, selectedAvatars, supabaseUrl);
    const files: DeployFile[] = [
      { file: "index.html", data: Buffer.from(html, "utf-8").toString("base64"), encoding: "base64" },
      ...avatarDeployFiles,
    ];

    // Hosting for now: localhost, until a VERCEL_TOKEN is provided (see memory
    // note "Publish hosting: localhost for now" — this switch is intentional,
    // not a placeholder to "finish" — real deployment activates automatically
    // once the token is set, no code change needed.
    const publishedUrl = process.env.VERCEL_TOKEN
      ? await deployToVercel(sanitizeProjectName(id), files)
      : await publishLocally(id, files, new URL(request.url).origin);

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update({ status: "published", published_url: publishedUrl, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(PROJECT_SELECT_COLUMNS)
      .single();

    if (updateError) throw new Error(updateError.message);
    return NextResponse.json({ project: rowToProject(updated as unknown as ProjectRow) });
  } catch (error) {
    console.error("publish failed:", error);
    await supabase.from("projects").update({ status: "failed" }).eq("id", id);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
