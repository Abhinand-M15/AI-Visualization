import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/server/errors";
import { requireUser } from "@/lib/auth/session";
import { listTemplates } from "@/lib/templates";

/**
 * GET /api/templates → { templates: [{ id, name, description }] }
 *
 * The templates that can be picked and published right now (registry entries
 * that are enabled and not listed in DISABLED_TEMPLATES). The client reads this
 * because DISABLED_TEMPLATES is a server-side variable. Read-only.
 */
export async function GET() {
  try {
    await requireUser();
    return NextResponse.json({ templates: listTemplates() });
  } catch (error) {
    return apiErrorResponse(error, "list templates");
  }
}
