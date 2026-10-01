import { NextResponse } from "next/server";
import { reviseStory } from "@/lib/agent/generateStory";
import type { DocumentType, Storyline } from "@/lib/types";
import { requireUser, unauthorizedResponse } from "@/lib/auth/session";
import { getGeminiKeyFor, missingApiKeyResponse } from "@/lib/userKeys";
import { logActivity } from "@/lib/activity";

interface ReviseRequestBody {
  storyline: Storyline;
  feedbackText?: string;
  documentType?: DocumentType;
  apiKey?: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as Partial<ReviseRequestBody>;

    if (!body.storyline || !Array.isArray(body.storyline.chunks)) {
      return NextResponse.json({ error: "Missing or invalid 'storyline' in request body." }, { status: 400 });
    }

    // Auth on: always the signed-in user's own saved key. Auth off: unchanged
    // (an explicit apiKey in the body, else GEMINI_API_KEY from the env).
    const apiKey = user ? await getGeminiKeyFor(user) : body.apiKey;
    const revised = await reviseStory(body.storyline, body.feedbackText, body.documentType, apiKey);
    await logActivity(user, null, "story.revised", {
      title: revised.title,
      chunkCount: revised.chunks.length,
      hasFeedback: Boolean(body.feedbackText?.trim()),
    });
    return NextResponse.json({ storyline: revised });
  } catch (error) {
    const handled = unauthorizedResponse(error) ?? missingApiKeyResponse(error);
    if (handled) return handled;
    console.error("revise-story failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
