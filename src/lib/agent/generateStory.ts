import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type { CaseStudyPhase, Chunk, DocumentType, EmotionKey, EvidenceGrade, Storyline } from "@/lib/types";
import { getSystemPrompt } from "@/lib/agent/systemPrompts";

const MODEL_CASCADE = ["gemini-flash-latest", "gemini-flash-lite-latest"];
const MAX_RETRIES_PER_MODEL = 2;

const CASE_STUDY_PHASES = ["domain", "customer", "problem", "solution", "impact"] as const;

const CHUNK_PROPERTIES = {
  order: { type: Type.INTEGER, description: "1-based position of this chunk in the story." },
  title: { type: Type.STRING, description: "Short heading for this chunk, 3-8 words." },
  narrativeText: {
    type: Type.STRING,
    description: "2-5 sentences of narration for this chunk, written to be read aloud.",
  },
  emotion: {
    type: Type.STRING,
    enum: ["neutral", "confused", "thinking", "idea", "solution", "happy"],
    description:
      "The narrative beat this chunk represents, used to pick a matching avatar expression: " +
      "'confused' = describes a problem/struggle/challenge; 'thinking' = reflective, weighing options; " +
      "'idea' = a breakthrough, insight, or decision point; 'solution' = implementing a fix/strategy/plan; " +
      "'happy' = a positive outcome, success, or achievement; 'neutral' = introductory/factual content " +
      "that isn't any of the above. Pick the single best fit for this specific chunk.",
  },
} satisfies Record<string, Schema>;

const STORYLINE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, compelling title for the overall story." },
    chunks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: CHUNK_PROPERTIES,
        required: ["order", "title", "narrativeText", "emotion"],
      },
    },
  },
  required: ["title", "chunks"],
};

// Adds the case-study-arc tagging (phase/impactScore/evidenceGrade) that the
// `layout-binding:case-study` agent needs to fit this storyline into a
// template later — see caseStudyTemplateContract.ts for the slots it feeds.
// partNumber is deliberately NOT one of the model's fields (see toStoryline)
// — it's fully derivable from phase + order.
//
// IMPORTANT: never add `minItems`/`maxItems` to the `chunks` array below.
// Gemini's structured-output validator throws a flat, useless 400
// INVALID_ARGUMENT once an array-size bound is combined with this many
// properties/enums and a target above roughly 20-30 items — confirmed
// empirically (identical request, only minItems/maxItems changed) and not
// worth chasing further since it's an undocumented, seemingly non-linear
// internal limit. Exact target-count enforcement is done in code instead —
// see consolidateToTargetCount below — by generating unconstrained (which
// reliably scales past 150 chunks) and deterministically merging down to the
// user's requested count afterward.
const CASE_STUDY_STORYLINE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, compelling title for the overall story." },
    chunks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ...CHUNK_PROPERTIES,
          phase: {
            type: Type.STRING,
            enum: [...CASE_STUDY_PHASES],
            description:
              "Which of the five case-study sections this chunk belongs to: 'domain' (the industry/business " +
              "domain), 'customer' (who the customer is and what they do), 'problem' (a challenge faced), " +
              "'solution' (an approach delivered), 'impact' (a resulting change). A document with many " +
              "distinct problem/solution/impact scenarios (e.g. one per slide) should produce one chunk per " +
              "scenario per phase — there is no fixed count; let the document's actual content decide how many.",
          },
          impactScore: {
            type: Type.INTEGER,
            description:
              "1-10: how central this chunk is to the case study, based only on the weight the document " +
              "itself gives it (repeated emphasis, specific figures, a stated turning point) — not your own opinion.",
          },
          evidenceGrade: {
            type: Type.STRING,
            enum: ["verified", "claimed", "none"],
            description:
              "Grade of this chunk's central claim: 'verified' if it states a specific measurable fact with " +
              "clear support (a number, a named metric, a dated event); 'claimed' if it asserts a fact the " +
              "document states but without that specificity; 'none' if the chunk doesn't assert a specific fact.",
          },
        },
        required: ["order", "title", "narrativeText", "emotion", "phase", "impactScore", "evidenceGrade"],
      },
    },
  },
  required: ["title", "chunks"],
};

const FALLBACK_GENERATE_SYSTEM_PROMPT = `You turn a business document into a narrated story broken into chunks.

Rules:
- Only use facts that are literally present in the source document. Never invent people, numbers, or events.
- Break the story into as many chunks as the document's content naturally supports — favor more, shorter chunks over fewer, longer ones. Most documents should yield somewhere between 6 and 14 chunks; let the actual content decide, don't force a fixed count.
- Each chunk's narrativeText must be no more than 80 words — aim for 70-80 words, written in a natural, spoken-narration tone (this text will later be converted to speech) — not bullet points, not a dry summary. Stay under the limit; don't pad to reach it.
- Order chunks so the story reads coherently start to finish (chronological or logical progression through the document).
- The overall title should be short and compelling, grounded in the document's actual subject.
- Tag each chunk with the single narrative-beat "emotion" that best fits it: "confused" for a problem/struggle/challenge, "thinking" for reflective/evaluating content, "idea" for a breakthrough or decision point, "solution" for implementing a fix/strategy/plan, "happy" for a positive outcome or success, "neutral" for introductory/factual content that isn't any of those. Most real stories use several different tags across their chunks — don't tag everything "neutral".`;

const FALLBACK_REVISE_SYSTEM_PROMPT = `You revise an existing narrated story (broken into chunks) based on user feedback.

Rules:
- Any chunk marked "userEdited: true" in the input MUST be returned completely unchanged — copy its title, narrativeText, and emotion verbatim, do not paraphrase or "improve" it.
- Apply the user's feedback only to the chunks it's relevant to. If feedback references a specific chunk (e.g. "chunk 3" or a quoted phrase), change only that chunk unless the feedback clearly applies more broadly.
- If no feedback is given, make no changes beyond what's necessary to keep the story coherent after any prior edits.
- Keep the same total number and order of chunks unless the feedback explicitly asks to add, remove, split, or reorder chunks.
- Stay grounded in the original document's facts — never invent new information not present in the prior storyline.
- Every chunk (including unchanged ones) must keep a valid "emotion" tag: "confused", "thinking", "idea", "solution", "happy", or "neutral" — re-evaluate it for any chunk whose text actually changed.`;

const FALLBACK_CASE_STUDY_GENERATE_SYSTEM_PROMPT = `You turn a business case-study document into a narrated story broken into chunks, each tagged with which part of the case-study arc it belongs to.

Rules:
- Only use facts that are literally present in the source document. Never invent people, numbers, or events.
- Break the story into as many chunks as the document's content naturally supports — there is no fixed or target count. A dense document (e.g. a 50-slide deck where each slide presents its own challenge, its own solution, and its own measurable impact) should produce a separate problem/solution/impact chunk for EVERY such scenario the document presents — do not compress multiple distinct scenarios into one chunk, and do not cap how many chunks you produce. A short document should produce only as many chunks as it actually supports.
- Every chunk belongs to exactly one of five sections — domain, customer, problem, solution, impact (see phase tagging below). domain and customer are usually one chunk each (the overall industry, the overall customer), but produce more than one of either if the document genuinely describes multiple domains or multiple customers. problem/solution/impact each get one chunk per distinct instance the document presents.
- Each chunk's narrativeText must be no more than 80 words — aim for 70-80 words, written in a natural, spoken-narration tone (this text will later be converted to speech) — not bullet points, not a dry summary. Stay under the limit; don't pad to reach it. If a scenario genuinely needs more room, split it into an additional chunk rather than writing a longer one.
- Order chunks so the story reads coherently start to finish: domain, then customer, then each problem/solution/impact scenario in the order the document presents them (grouping a scenario's problem, solution, and impact together if the document does).
- The overall title should be short and compelling, grounded in the document's actual subject.
- Tag each chunk with the single narrative-beat "emotion" that best fits it: "confused" for a problem/struggle/challenge, "thinking" for reflective/evaluating content, "idea" for a breakthrough or decision point, "solution" for implementing a fix/strategy/plan, "happy" for a positive outcome or success, "neutral" for introductory/factual content that isn't any of those.

Case-study-specific tagging (required, in addition to the above):
- Tag each chunk with its "phase": "domain", "customer", "problem", "solution", or "impact". Order chunks within a phase in the sequence they should appear — their 1-based position within the phase is derived from this order automatically, you don't tag it yourself.
- "impactScore": an integer 1-10 rating how central/important this chunk is to the overall case study, based only on how much weight the document itself gives it (repeated emphasis, specific figures, being the stated turning point) — not your own opinion of what should matter.
- "evidenceGrade": "verified" if the chunk states a specific measurable fact or figure with clear support in the document (a number, a named metric, a dated event); "claimed" if the chunk makes a factual assertion the document states but without that level of specificity or support; "none" if the chunk is narrative/context and doesn't assert a specific fact (e.g. describing who the customer is). Grade only the chunk's central claim, not incidental details.`;

const FALLBACK_CASE_STUDY_REVISE_SYSTEM_PROMPT = `You revise an existing narrated case-study story (broken into phase-tagged chunks) based on user feedback.

Rules:
- Any chunk marked "userEdited: true" in the input MUST be returned completely unchanged — copy its title, narrativeText, emotion, phase, impactScore, and evidenceGrade verbatim, do not paraphrase or "improve" it.
- Apply the user's feedback only to the chunks it's relevant to. If feedback references a specific chunk (e.g. "chunk 3" or a quoted phrase), change only that chunk unless the feedback clearly applies more broadly.
- If no feedback is given, make no changes beyond what's necessary to keep the story coherent after any prior edits.
- Keep the same total number and order of chunks unless the feedback explicitly asks to add, remove, split, or reorder chunks — there is no fixed or target chunk count; a dense document's chunk count can be large and that's expected, not something to trim.
- Stay grounded in the original document's facts — never invent new information not present in the prior storyline.
- Every chunk (including unchanged ones) must keep a valid "emotion" tag, as before.
- Every chunk (including unchanged ones) must keep a valid "phase" tag (one of: domain, customer, problem, solution, impact), an "impactScore" (1-10), and an "evidenceGrade" ("verified", "claimed", or "none") — re-evaluate these only for chunks whose text actually changed; otherwise carry them over unchanged.`;

interface GeminiStorylineResponse {
  title: string;
  chunks: Array<{
    order: number;
    title: string;
    narrativeText: string;
    emotion: EmotionKey;
    // Typed loosely here on purpose — JSON.parse doesn't actually verify the
    // enum constraint at the type level, so we validate defensively below via
    // coercePhase/coerceEvidenceGrade rather than trusting the cast.
    phase?: string;
    impactScore?: number;
    evidenceGrade?: string;
  }>;
}

// Prompt instructions alone don't reliably hold a model to a hard word
// count — this is the actual guarantee. Applied to every chunk except ones
// marked userEdited, since those must be preserved verbatim regardless of
// length (see the revise system prompts' rules on that).
const MAX_NARRATIVE_WORDS = 80;

function capWords(text: string, maxWords: number): string {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);
  if (words.length <= maxWords) return trimmed;
  const truncated = words.slice(0, maxWords).join(" ");
  // Prefer ending on a real sentence boundary within the limit so a
  // truncated chunk still reads as a complete thought rather than stopping
  // mid-sentence — but only if that boundary isn't so early it throws away
  // most of the content.
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf("! "),
    truncated.lastIndexOf("? ")
  );
  if (lastSentenceEnd > truncated.length * 0.5) {
    return truncated.slice(0, lastSentenceEnd + 1);
  }
  return /[.!?]$/.test(truncated) ? truncated : `${truncated}.`;
}

function coercePhase(value: string | undefined): CaseStudyPhase | undefined {
  return CASE_STUDY_PHASES.includes(value as CaseStudyPhase) ? (value as CaseStudyPhase) : undefined;
}

function coerceEvidenceGrade(value: string | undefined): EvidenceGrade | undefined {
  return value === "verified" || value === "claimed" || value === "none" ? value : undefined;
}

function toStoryline(raw: GeminiStorylineResponse, previousChunks?: Chunk[]): Storyline {
  const sorted = [...raw.chunks].sort((a, b) => a.order - b.order);
  // partNumber isn't asked of the model (see CASE_STUDY_STORYLINE_SCHEMA) —
  // it's just "1st, 2nd, 3rd... chunk seen so far within this phase", fully
  // derivable from the phase-sorted order here.
  const partNumberByPhase = new Map<CaseStudyPhase, number>();
  return {
    title: raw.title,
    chunks: sorted.map((chunk, index) => {
      const previous = previousChunks?.[index];
      const phase = coercePhase(chunk.phase) ?? previous?.phase;
      const partNumber = phase ? (partNumberByPhase.get(phase) ?? 0) + 1 : undefined;
      if (phase && partNumber) partNumberByPhase.set(phase, partNumber);
      return {
        id: previous?.id ?? `chunk-${index + 1}`,
        order: index + 1,
        title: chunk.title,
        narrativeText: previous?.userEdited ? chunk.narrativeText : capWords(chunk.narrativeText, MAX_NARRATIVE_WORDS),
        emotion: chunk.emotion ?? "neutral",
        userEdited: previous?.userEdited ?? false,
        phase,
        partNumber,
        impactScore: chunk.impactScore ?? previous?.impactScore,
        evidenceGrade: coerceEvidenceGrade(chunk.evidenceGrade) ?? previous?.evidenceGrade,
      };
    }),
  };
}

function mergeTwoChunks(a: Chunk, b: Chunk): Chunk {
  return {
    ...a,
    title: a.title,
    narrativeText: `${a.narrativeText} ${b.narrativeText}`.trim(),
    impactScore:
      a.impactScore === undefined && b.impactScore === undefined
        ? undefined
        : Math.max(a.impactScore ?? 0, b.impactScore ?? 0),
    evidenceGrade:
      EVIDENCE_GRADE_RANK[a.evidenceGrade ?? "none"] >= EVIDENCE_GRADE_RANK[b.evidenceGrade ?? "none"]
        ? a.evidenceGrade
        : b.evidenceGrade,
  };
}

const EVIDENCE_GRADE_RANK: Record<EvidenceGrade, number> = { verified: 2, claimed: 1, none: 0 };

function mergeChunkGroup(group: Chunk[]): Chunk {
  return group.reduce((a, b) => mergeTwoChunks(a, b));
}

/** Splits `items` into `bucketCount` contiguous, near-equal-size groups (never empty unless items.length < bucketCount). */
function bucketize<T>(items: T[], bucketCount: number): T[][] {
  const buckets: T[][] = [];
  for (let i = 0; i < bucketCount; i++) {
    const start = Math.floor((i * items.length) / bucketCount);
    const end = Math.floor(((i + 1) * items.length) / bucketCount);
    buckets.push(items.slice(start, end));
  }
  return buckets.filter((bucket) => bucket.length > 0);
}

/**
 * Splits `budget` across `sizes` proportionally (each nonzero size gets at
 * least 1), using the largest-remainder method so the shares sum to exactly
 * `budget` instead of drifting from rounding.
 */
function allocateProportionally(sizes: number[], budget: number): number[] {
  const total = sizes.reduce((a, b) => a + b, 0);
  if (total === 0) return sizes.map(() => 0);
  const raw = sizes.map((size) => (size / total) * budget);
  const shares = raw.map((r, i) => (sizes[i] > 0 ? Math.max(1, Math.floor(r)) : 0));
  let assigned = shares.reduce((a, b) => a + b, 0);
  const byRemainder = raw
    .map((r, i) => ({ i, remainder: r - Math.floor(r) }))
    .sort((a, b) => b.remainder - a.remainder);
  for (const { i } of byRemainder) {
    if (assigned >= budget) break;
    if (sizes[i] > shares[i]) {
      shares[i]++;
      assigned++;
    }
  }
  return shares;
}

/**
 * Deterministically merges chunks down to exactly `target`, never calling
 * the model again. Generation itself is always unconstrained (see
 * CASE_STUDY_STORYLINE_SCHEMA's comment) — this is what actually enforces
 * the user's requested chunk count. Chunks are bucketed into `target`
 * contiguous, evenly-sized groups (not repeatedly merged pair-by-pair —
 * that greedy approach kept re-picking the same neighborhood and piling
 * dozens of chunks into one, confirmed by testing against a 50-scenario
 * document) and each bucket is folded into a single chunk. No-op if the
 * document didn't naturally produce more than `target` chunks.
 */
function consolidateChunks(chunks: Chunk[], target: number): Chunk[] {
  const sorted = [...chunks].sort((a, b) => a.order - b.order);
  if (sorted.length <= target) return sorted;
  return bucketize(sorted, target).map(mergeChunkGroup);
}

/**
 * Same idea as consolidateChunks, but domain/customer (near-always singular
 * "who is this about" chunks, not a series of interchangeable scenarios) are
 * never merged — only problem/solution/impact are, with the remaining
 * target budget split across those three phases proportional to how many
 * scenarios each originally had (see allocateProportionally), then each
 * phase's chunks are evenly bucketed and folded exactly like
 * consolidateChunks.
 */
function consolidateCaseStudyChunks(chunks: Chunk[], target: number): Chunk[] {
  if (chunks.length <= target) return chunks;

  const byPhase = new Map<CaseStudyPhase | "unphased", Chunk[]>();
  for (const chunk of chunks) {
    const key = chunk.phase ?? "unphased";
    const group = byPhase.get(key) ?? [];
    group.push(chunk);
    byPhase.set(key, group);
  }
  for (const group of byPhase.values()) {
    group.sort((a, b) => (a.partNumber ?? a.order) - (b.partNumber ?? b.order));
  }

  const domain = byPhase.get("domain") ?? [];
  const customer = byPhase.get("customer") ?? [];
  const unphased = byPhase.get("unphased") ?? [];
  const fixedCount = domain.length + customer.length + unphased.length;

  const psiPhases: CaseStudyPhase[] = ["problem", "solution", "impact"];
  const psiGroups = psiPhases.map((phase) => byPhase.get(phase) ?? []);
  const activePsiPhaseCount = psiGroups.filter((group) => group.length > 0).length;
  // Guarantee at least one chunk per phase that actually has content, even if
  // that means the final total slightly exceeds `target` for an unreasonably
  // low request — never drop a whole phase (e.g. all of "impact") just to
  // hit the number exactly.
  const psiBudget = Math.max(activePsiPhaseCount, target - fixedCount);
  const phaseTargets = allocateProportionally(
    psiGroups.map((group) => group.length),
    psiBudget
  );

  const mergedPsiByPhase = psiGroups.map((group, i) => {
    const phaseTarget = Math.min(phaseTargets[i], group.length);
    const merged = group.length <= phaseTarget || phaseTarget === 0 ? group : bucketize(group, phaseTarget).map(mergeChunkGroup);
    return merged.map((chunk, index) => ({ ...chunk, partNumber: index + 1 }));
  });

  return [...domain, ...customer, ...mergedPsiByPhase.flat(), ...unphased];
}

function renumber(title: string, chunks: Chunk[]): Storyline {
  return {
    title,
    chunks: chunks.map((chunk, index) => ({ ...chunk, id: `chunk-${index + 1}`, order: index + 1 })),
  };
}

async function callGemini(
  systemInstruction: string,
  userContent: string,
  schema: Schema,
  apiKey?: string
): Promise<GeminiStorylineResponse> {
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
          contents: userContent,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
            maxOutputTokens: 65536,
          },
        });
        const text = response.text;
        if (!text) throw new Error("Empty response from Gemini");
        return JSON.parse(text) as GeminiStorylineResponse;
      } catch (error) {
        lastError = error;
        const delayMs = 500 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw new Error(
    `Story generation failed after trying all models: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

function targetChunkCountInstruction(targetChunkCount: number, isCaseStudy: boolean): string {
  if (!isCaseStudy) {
    return `\n\nTarget chunk count: aim for close to ${targetChunkCount} chunks total. If the document supports more distinct beats than that, that's fine — closely related ones will be merged together afterward, so lean toward including everything rather than dropping content. Don't invent content just to pad toward the count.`;
  }
  return `\n\nTarget chunk count: aim for close to ${targetChunkCount} chunks total across all five phases. domain and customer still get at least one chunk each. It's fine (expected, even) to produce more problem/solution/impact chunks than this if the document supports it — closely related scenarios will be merged together afterward, so favor covering every distinct scenario over trying to hit the number exactly yourself. Don't invent content just to pad toward the count.`;
}

export async function generateStory(
  documentText: string,
  documentType: DocumentType,
  apiKey?: string,
  targetChunkCount?: number
): Promise<Storyline> {
  const isCaseStudy = documentType === "case-study";
  const systemPrompt = await getSystemPrompt(
    isCaseStudy ? "story-generation:case-study" : "story-generation",
    isCaseStudy ? FALLBACK_CASE_STUDY_GENERATE_SYSTEM_PROMPT : FALLBACK_GENERATE_SYSTEM_PROMPT
  );
  const userContent = `Document type: ${documentType}\n\nDocument text:\n${documentText}${
    targetChunkCount ? targetChunkCountInstruction(targetChunkCount, isCaseStudy) : ""
  }`;
  // Always generated unconstrained (no minItems/maxItems — see
  // CASE_STUDY_STORYLINE_SCHEMA's comment on why) — targetChunkCount is
  // enforced afterward, deterministically, in code.
  const raw = await callGemini(
    systemPrompt,
    userContent,
    isCaseStudy ? CASE_STUDY_STORYLINE_SCHEMA : STORYLINE_SCHEMA,
    apiKey
  );
  const storyline = toStoryline(raw);
  if (!targetChunkCount || storyline.chunks.length <= targetChunkCount) return storyline;

  const consolidated = isCaseStudy
    ? consolidateCaseStudyChunks(storyline.chunks, targetChunkCount)
    : consolidateChunks(storyline.chunks, targetChunkCount);
  return renumber(storyline.title, consolidated);
}

export async function reviseStory(
  previousStoryline: Storyline,
  feedbackText: string | undefined,
  documentType: DocumentType | undefined,
  apiKey?: string
): Promise<Storyline> {
  const isCaseStudy = documentType === "case-study";
  const systemPrompt = await getSystemPrompt(
    isCaseStudy ? "story-revision:case-study" : "story-revision",
    isCaseStudy ? FALLBACK_CASE_STUDY_REVISE_SYSTEM_PROMPT : FALLBACK_REVISE_SYSTEM_PROMPT
  );
  const userContent = `Previous storyline (JSON):\n${JSON.stringify(
    previousStoryline
  )}\n\nUser feedback: ${feedbackText?.trim() || "(no specific feedback given — just keep edited chunks intact)"}`;
  const raw = await callGemini(
    systemPrompt,
    userContent,
    isCaseStudy ? CASE_STUDY_STORYLINE_SCHEMA : STORYLINE_SCHEMA,
    apiKey
  );
  return toStoryline(raw, previousStoryline.chunks);
}
