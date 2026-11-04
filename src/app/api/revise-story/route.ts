import { NextResponse } from "next/server";
import { reviseStory } from "@/lib/agent/generateStory";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/types";
import { requireUser } from "@/lib/auth/session";
import { getGeminiKeyFor } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";
import { apiErrorResponse } from "@/lib/server/errors";
import { cleanStoryTitle, validateClientChunks } from "@/lib/server/chunks";
import { requireQuota } from "@/lib/server/quota";

const MAX_FEEDBACK_LENGTH = 5_000;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const storyline = (body.storyline ?? null) as Record<string, unknown> | null;

    // The same validation as saving a project (SEC-21): story fields only, capped sizes.
    const chunks = validateClientChunks(storyline?.chunks);
    const title = cleanStoryTitle(storyline?.title) ?? "Untitled story";
    if (!chunks.ok) {
      return NextResponse.json({ error: chunks.error, code: "bad_request" }, { status: 400 });
    }
    const feedbackText = typeof body.feedbackText === "string" ? body.feedbackText.slice(0, MAX_FEEDBACK_LENGTH) : undefined;
    const documentType =
      typeof body.documentType === "string" && DOCUMENT_TYPES.some((type) => type.value === body.documentType)
        ? (body.documentType as DocumentType)
        : undefined;

    // Auth on: always the signed-in user's own saved key. Auth off: unchanged
    // (an explicit apiKey in the body, else GEMINI_API_KEY from the env).
    const apiKey = user ? await getGeminiKeyFor(user) : typeof body.apiKey === "string" ? body.apiKey : undefined;
    await requireQuota(user, "generation");
    const previous = {
      title,
      chunks: chunks.chunks.map((chunk, index) => ({ ...chunk, id: chunk.id ?? `chunk-${index + 1}`, order: index + 1 })),
    };
    const revised = await reviseStory(previous, feedbackText, documentType, apiKey);
    await logActivity(user, null, "story.revised", {
      title: revised.title,
      chunkCount: revised.chunks.length,
      hasFeedback: Boolean(feedbackText?.trim()),
    });
    return NextResponse.json({ storyline: revised });
  } catch (error) {
    return apiErrorResponse(error, "revise-story");
  }
}
