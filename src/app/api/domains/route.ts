import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/server/errors";
import { requireUser } from "@/lib/auth/session";
import { listDomains } from "@/lib/domains";

/** GET -> { domains: [{ id, slug, name }] }  ([] when migration 003 isn't applied). */
export async function GET() {
  try {
    await requireUser();
    const domains = await listDomains();
    return NextResponse.json({ domains: domains.map(({ id, slug, name }) => ({ id, slug, name })) });
  } catch (error) {
    return apiErrorResponse(error, "list domains");
  }
}
