import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
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
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    return NextResponse.json({ error: "Could not load templates." }, { status: 500 });
  }
}
