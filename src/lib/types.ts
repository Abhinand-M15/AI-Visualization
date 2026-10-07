export type DocumentType = "case-study" | "brd" | "other";

/** Every document type with its display label (the upload page and the library read this). */
export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "case-study", label: "Case study" },
  { value: "brd", label: "BRD" },
  { value: "other", label: "Other" },
];

export function documentTypeLabel(value: DocumentType | string): string {
  return DOCUMENT_TYPES.find((type) => type.value === value)?.label ?? value;
}

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
  /** Voice the current audioUrl was generated with (unset on audio made before this was tracked). */
  audioVoice?: string;
  /**
   * The narration text changed after audio was generated, so that audio was
   * dropped. Distinguishes "needs updating" from "never narrated"; cleared
   * when new audio is generated.
   */
  narrationOutdated?: boolean;
  /** True once the user has hand-edited this chunk; revisions must preserve it verbatim. */
  userEdited?: boolean;
  /** Case-study-only fields (see CaseStudyPhase) — undefined for other document types. */
  phase?: CaseStudyPhase;
  /** 1-based position of this chunk within its own phase (resets per phase). */
  partNumber?: number;
  /** 1-10: how central this chunk is to the case study, per the document's own emphasis. */
  impactScore?: number;
  evidenceGrade?: EvidenceGrade;
  /**
   * Cartoon scene image for this chapter (public URL, derived server-side from
   * chapter_images.image_path; see src/lib/storageUrls.ts). Absent when there is none;
   * templates then fall back to the avatar as before.
   */
  imageUrl?: string;
  imageStatus?: "pending" | "ready" | "failed";
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
  /**
   * Wav2Lip-rendered avatar video per section, keyed identically to
   * sectionAudio. Set by /generate-case-study-avatar-video. Only populated
   * for the avatar/template combination that supports video mode (currently:
   * avatar-1 + Lunar theme). Falls back to the avatar's default looping
   * video when a section hasn't been generated yet.
   */
  sectionVideo?: Record<string, string>;
  /** Voice each sectionAudio entry was generated with, keyed like sectionAudio. */
  sectionAudioVoice?: Record<string, string>;
  /** Section keys whose text was edited after narration (their audio was dropped). */
  outdatedSections?: string[];
  /**
   * Set when the chapters were edited after this layout was generated: the
   * sections below no longer reflect the chapters until the layout is
   * regenerated (or the section text is edited directly).
   */
  chunksChangedAt?: string;
}

/**
 * What was last published, kept inside projects.payload so it works with and
 * without the accounts migration. `contentHash` is contentFingerprint() of the
 * project as published (see src/lib/contentVersion.ts).
 */
export interface PublicationRecord {
  contentHash: string;
  /** Null for a baseline inferred from a site published before this was recorded. */
  publishedAt: string | null;
  /** True when the baseline was inferred at the first edit after publishing, not recorded by a publish. */
  inferred?: boolean;
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
  /** Fingerprint of what was last published; compare with contentFingerprint(project). */
  publication?: PublicationRecord;
  /** Chosen industry domain (domains.id). Unset when the domains migration isn't applied. */
  domainId?: string;
  /** Chosen domain avatar (domain_avatars.id); selectedAvatarIds carries it as `domain:<id>`. */
  domainAvatarId?: string;
  /** Public URL of the company logo, derived server-side from projects.logo_path. */
  logoUrl?: string;
}

export const ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".pptx", ".xlsx"] as const;
