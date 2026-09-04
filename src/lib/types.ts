export type DocumentType = "case-study" | "brd" | "other";

/**
 * Narrative "beat" of a chunk, used to pick a matching avatar expression.
 * - confused: describes a problem, struggle, or challenge
 * - thinking: reflective/analytical — weighing options, evaluating
 * - idea: a breakthrough, insight, or decision point
 * - solution: describes implementing a fix, strategy, or plan
 * - happy: a positive outcome, success, or achievement
 * - neutral: introductory/factual content that isn't one of the above
 */
export type EmotionKey = "neutral" | "confused" | "thinking" | "idea" | "solution" | "happy";

/**
 * The fixed case-study section structure (see the `layout-binding:case-study`
 * system prompt's RULE 12, v2). Only populated for chunks of a `documentType:
 * "case-study"` project — the layout-binding step routes each chunk into the
 * template slot matching its phase. Generation targets an exact count per
 * phase (1 domain, 1 customer, 2 problem, 3 solution, 2 impact — 9 chunks
 * total); "company" is a 10th section but is injected directly from fixed
 * context rather than derived from the document, so it isn't a chunk phase.
 */
export type CaseStudyPhase = "domain" | "customer" | "problem" | "solution" | "impact";

/**
 * How well-supported a chunk's central claim is in the source document —
 * carried (never upgraded) into the bound layout per the binding prompt's
 * RULE 4. "none" means the chunk doesn't assert a specific factual claim.
 */
export type EvidenceGrade = "verified" | "claimed" | "none";

export interface Chunk {
  id: string;
  order: number;
  title: string;
  narrativeText: string;
  /** Narrative beat for this chunk — drives which avatar expression is shown. */
  emotion?: EmotionKey;
  /** Set once Phase 2 (voice) generates audio for this chunk. */
  audioUrl?: string;
  audioDurationSec?: number;
  /** True once the user has hand-edited this chunk; revisions must preserve it verbatim. */
  userEdited?: boolean;
  /** Case-study-only fields (see CaseStudyPhase) — undefined for other document types. */
  phase?: CaseStudyPhase;
  /** 1-based position of this chunk within its own phase (resets per phase). */
  partNumber?: number;
  /** 1-10: how central this chunk is to the case study, per the document's own emphasis. */
  impactScore?: number;
  evidenceGrade?: EvidenceGrade;
}

export interface Storyline {
  title: string;
  chunks: Chunk[];
}

export type PublishStatus = "draft" | "publishing" | "published" | "failed";

export interface CaseStudyDiagnostic {
  slotId: string;
  issue: "unsupported" | "under_min" | "dropped_entries" | "hard_compression";
  detail: string;
}

/**
 * Output of the `layout-binding:case-study` agent: the storyline's chunks
 * fitted into a template's slot contract. `slots` is null only when RULE 11
 * (malformed/contradictory input) fired — a real bind with everything
 * unsupported still returns an object of all-null slot values, not this.
 */
export interface CaseStudyBinding {
  templateContractId: string;
  slots: Record<string, unknown> | null;
  diagnostics: CaseStudyDiagnostic[];
  boundAt: string;
  /**
   * Narration audio per flattened section (see caseStudySections.ts), keyed
   * by CaseStudySection.key (e.g. "company", "domain", "problem-0"). Set by
   * /generate-case-study-audio — separate from Chunk.audioUrl because bound
   * slot text can differ from the original chunk text (RULE 1 allows
   * rephrasing/compression), and "company" has no backing chunk at all.
   */
  sectionAudio?: Record<string, string>;
}

export interface Project {
  id: string;
  title: string;
  documentType: DocumentType;
  sourceFileName?: string;
  chunks: Chunk[];
  selectedVoice?: string;
  selectedAvatarIds?: string[];
  selectedTemplateId?: string;
  publishStatus: PublishStatus;
  publishedUrl?: string;
  createdAt: string;
  /** Set once the case-study layout-binding step has run (see /bind-case-study). */
  caseStudyBinding?: CaseStudyBinding | null;
}

export const ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".pptx", ".xlsx"] as const;
