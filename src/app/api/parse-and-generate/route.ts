import { NextResponse } from "next/server";
import { parseDocument } from "@/lib/parseDocument";
import { generateStory } from "@/lib/agent/generateStory";
import { ACCEPTED_DOCUMENT_EXTENSIONS, type DocumentType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const documentType = formData.get("documentType");
    const apiKey = formData.get("apiKey");
    const targetChunkCountRaw = formData.get("targetChunkCount");
    const targetChunkCount =
      typeof targetChunkCountRaw === "string" && targetChunkCountRaw.trim() !== ""
        ? Number(targetChunkCountRaw)
        : undefined;
    if (targetChunkCount !== undefined && (!Number.isInteger(targetChunkCount) || targetChunkCount < 1 || targetChunkCount > 200)) {
      return NextResponse.json({ error: "targetChunkCount must be a whole number between 1 and 200." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing 'file' in form data." }, { status: 400 });
    }
    if (typeof documentType !== "string") {
      return NextResponse.json({ error: "Missing 'documentType' in form data." }, { status: 400 });
    }

    const lowerName = file.name.toLowerCase();
    if (!ACCEPTED_DOCUMENT_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
      return NextResponse.json(
        { error: `Unsupported file type. Accepted: ${ACCEPTED_DOCUMENT_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const documentText = await parseDocument(file.name, buffer);

    if (!documentText.trim()) {
      return NextResponse.json(
        { error: "No text could be extracted from this document." },
        { status: 422 }
      );
    }

    const storyline = await generateStory(
      documentText,
      documentType as DocumentType,
      typeof apiKey === "string" && apiKey ? apiKey : undefined,
      targetChunkCount
    );

    return NextResponse.json({ storyline, sourceFileName: file.name });
  } catch (error) {
    console.error("parse-and-generate failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
