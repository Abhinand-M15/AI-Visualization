import { GoogleGenAI } from "@google/genai";
import type { CaseStudyDiagnostic, Chunk } from "@/lib/types";
import { getLayoutBindingPrompt } from "@/lib/agent/systemPrompts";
import {
  CASE_STUDY_COMPANY_SLOT,
  CASE_STUDY_TEMPLATE_CONTRACT,
  CASE_STUDY_TEMPLATE_CONTRACT_ID,
} from "@/lib/agent/caseStudyTemplateContract";

const MODEL_CASCADE = ["gemini-flash-latest", "gemini-flash-lite-latest"];
const MAX_RETRIES_PER_MODEL = 2;

export interface CaseStudyBindResult {
  templateContractId: string;
  slots: Record<string, unknown> | null;
  diagnostics: CaseStudyDiagnostic[];
}

interface RawBindResponse {
  slots: Record<string, unknown> | null;
  diagnostics: CaseStudyDiagnostic[];
}

function isRawBindResponse(value: unknown): value is RawBindResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const slotsOk = v.slots === null || (typeof v.slots === "object" && !Array.isArray(v.slots));
  return slotsOk && Array.isArray(v.diagnostics);
}

/**
 * Turns a case-study project's phase-tagged chunks into the STORYLINE_JSON
 * shape the `layout-binding:case-study` prompt expects: a flat list of
 * "parts" (its term for a beat), not the app's own Chunk/Storyline shape —
 * the binding agent never sees id/audioUrl/userEdited, only what RULE 1
 * allows it to draw facts from.
 */
function toStorylineJson(title: string, chunks: Chunk[]) {
  return {
    title,
    parts: chunks
      .filter((chunk) => chunk.phase)
      .map((chunk) => ({
        partNumber: chunk.partNumber ?? chunk.order,
        phase: chunk.phase,
        title: chunk.title,
        text: chunk.narrativeText,
        impactScore: chunk.impactScore ?? null,
        evidenceGrade: chunk.evidenceGrade === "none" ? null : chunk.evidenceGrade ?? null,
      })),
  };
}

export async function bindCaseStudyLayout(
  title: string,
  chunks: Chunk[],
  apiKey?: string
): Promise<CaseStudyBindResult> {
  const promptTemplate = await getLayoutBindingPrompt("case-study");
  if (!promptTemplate) {
    throw new Error(
      "No active 'layout-binding:case-study' prompt found in system_prompts — seed it before binding."
    );
  }

  const filledPrompt = promptTemplate
    .replace("{{TEMPLATE_CONTRACT}}", JSON.stringify(CASE_STUDY_TEMPLATE_CONTRACT, null, 2))
    .replace("{{STORYLINE_JSON}}", JSON.stringify(toStorylineJson(title, chunks), null, 2));

  const key = apiKey ?? process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set. Add it to .env.local (see .env.local.example).");
  }
  const ai = new GoogleGenAI({ apiKey: key });

  let lastError: unknown;
  for (const model of MODEL_CASCADE) {
    for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: "Produce the JSON output now, following the rules and format given exactly.",
          config: {
            systemInstruction: filledPrompt,
            responseMimeType: "application/json",
          },
        });
        const text = response.text;
        if (!text) throw new Error("Empty response from Gemini");
        const parsed: unknown = JSON.parse(text);
        if (!isRawBindResponse(parsed)) {
          throw new Error("Layout-binding response did not match the required {slots, diagnostics} shape.");
        }
        // "company" describes Warp Drive itself, not anything in the customer's
        // document — it's never sent to the LLM (see caseStudyTemplateContract.ts)
        // and is merged in here from fixed, pre-verified content instead.
        return {
          templateContractId: CASE_STUDY_TEMPLATE_CONTRACT_ID,
          slots: parsed.slots && { company: CASE_STUDY_COMPANY_SLOT, ...parsed.slots },
          diagnostics: parsed.diagnostics,
        };
      } catch (error) {
        lastError = error;
        const delayMs = 500 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw new Error(
    `Case-study layout binding failed after trying all models: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}
