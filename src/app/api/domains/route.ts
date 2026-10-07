import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { listDomains } from "@/lib/domains";

/** GET -> { domains: [{ id, slug, name }] }  ([] when migration 003 isn't applied). */
export async function GET() {
  try {
    await requireUser();
    const domains = await listDomains();
    return NextResponse.json({ domains: domains.map(({ id, slug, name }) => ({ id, slug, name })) });
  } catch (error) {
    const unauthorized = unauthorizedResponse(error);
    if (unauthorized) return unauthorized;
    console.error("list domains failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not load domains." }, { status: 500 });
  }
}
