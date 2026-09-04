import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
import { PROJECT_SELECT_COLUMNS, rowToProject, type ProjectRow } from "@/lib/projects";

interface SelectBody {
  selectedAvatarIds?: string[];
  selectedTemplateId?: string;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as SelectBody;

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.selectedAvatarIds) update.selected_avatar_ids = body.selectedAvatarIds;
    if (body.selectedTemplateId) update.selected_template_id = body.selectedTemplateId;

    const { data, error } = await getSupabase()
      .from("projects")
      .update(update)
      .eq("id", id)
      .select(PROJECT_SELECT_COLUMNS)
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ project: rowToProject(data as unknown as ProjectRow) });
  } catch (error) {
    console.error("update selection failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
