import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { getSupabase } from "@/lib/db";
import { getPublishBaseDomain } from "@/lib/publish/vercel";
import { getPublishNamePrefix, maxNameLength } from "@/lib/subdomain";
import { isValidProjectId } from "@/lib/server/ids";
import { checkSubdomainAvailability } from "../availability";

/**
 * GET /api/subdomains/check                          → { baseDomain, prefix, suffix, maxLength }
 * GET /api/subdomains/check?name=acme&projectId=<id> → { available, status, reason, url }
 *
 * Read-only. The first form lets the client show the right suffix without a
 * NEXT_PUBLIC variable; the second is the live availability check. The
 * projectId only counts when it is the caller's own project (otherwise the
 * check runs as for a new story).
 */
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const params = new URL(request.url).searchParams;
    const name = params.get("name");
    const baseDomain = getPublishBaseDomain();

    if (name === null) {
      const prefix = getPublishNamePrefix();
      return NextResponse.json({
        baseDomain,
        prefix,
        suffix: `.${baseDomain ?? "vercel.app"}`,
        maxLength: maxNameLength(prefix),
      });
    }

    let projectId: string | null = null;
    const rawProjectId = params.get("projectId");
    if (isValidProjectId(rawProjectId)) {
      let query = getSupabase().from("projects").select("id").eq("id", rawProjectId);
      if (user) query = query.eq("owner_id", user.id);
      const { data } = await query.maybeSingle();
      if (data) projectId = rawProjectId;
    }

    const result = await checkSubdomainAvailability(name, { projectId, userId: user?.id ?? null });
    return NextResponse.json(result);
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("subdomain check failed:", error);
    return NextResponse.json(
      {
        available: false,
        status: "unknown",
        reason: "Couldn't check this address right now. Try again.",
        url: null,
      },
      { status: 502 }
    );
  }
}
