import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { getPublishBaseDomain } from "@/lib/publish/vercel";
import { getPublishNamePrefix, maxNameLength } from "@/lib/subdomain";
import { checkSubdomainAvailability } from "../availability";

/**
 * GET /api/subdomains/check                          → { baseDomain, prefix, suffix, maxLength }
 * GET /api/subdomains/check?name=acme&projectId=<id> → { available, status, reason, url }
 *
 * Read-only. The first form lets the client show the right suffix without a
 * NEXT_PUBLIC variable; the second is the live availability check.
 */
export async function GET(request: Request) {
  try {
    await requireUser();
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

    const result = await checkSubdomainAvailability(name, { projectId: params.get("projectId") });
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
