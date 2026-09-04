import { NextResponse } from "next/server";
import { reviseStory } from "@/lib/agent/generateStory";
import type { DocumentType, Storyline } from "@/lib/types";

interface ReviseRequestBody {
  storyline: Storyline;
  feedbackText?: string;
  documentType?: DocumentType;
  apiKey?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ReviseRequestBody>;

    if (!body.storyline || !Array.isArray(body.storyline.chunks)) {
      return NextResponse.json({ error: "Missing or invalid 'storyline' in request body." }, { status: 400 });
    }

    const revised = await reviseStory(body.storyline, body.feedbackText, body.documentType, body.apiKey);
    return NextResponse.json({ storyline: revised });
  } catch (error) {
    console.error("revise-story failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
