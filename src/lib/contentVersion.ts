/**
 * "What's live vs. what's saved" for a project, shared by the API routes and
 * the UI (pure, no server imports, so it runs identically in both).
 *
 * Unpublished changes: the publish route stores contentFingerprint(project)
 * in projects.payload.publication when a deploy succeeds. A project has
 * unpublished changes when the fingerprint of its saved state differs from
 * that stored one. The fingerprint covers exactly what the published site is
 * built from (title, template, avatars, voice, and either the chapters or the
 * bound case-study sections, with their narration), so anything else (e.g. a
 * diagnostics list, timestamps) never raises a false "unpublished changes".
 *
 * Stale narration: audio is tied to the text it was generated from. Saving a
 * text change drops that item's audio and flags it outdated; audio generated
 * in a different voice than the one now selected also counts as outdated.
 * narrationState() is what both the publish dialog and the generate-audio
 * routes' `onlyMissing` use, so everything "not ok" is regenerated on publish.
 */
import type { CaseStudyBinding, Chunk, Project } from "@/lib/types";
import { flattenCaseStudySections } from "@/lib/caseStudySections";

/** Bump when the fingerprint's shape changes; older stored hashes then fall back to timestamps. */
const FINGERPRINT_VERSION = "v1";

/** JSON with sorted keys; null/undefined object members are dropped (jsonb and JSON disagree on them). */
function stableStringify(value: unknown): string {
  if (value === undefined || value === null) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const members = Object.keys(record)
    .filter((key) => record[key] !== undefined && record[key] !== null)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
  return `{${members.join(",")}}`;
}

/** cyrb53: a fast, well-distributed 53-bit string hash (not cryptographic; collisions only cause a missed badge). */
function hashString(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
}

/** Everything the published site is rendered from, hashed. Stable across server and browser. */
export function contentFingerprint(project: Project): string {
  const binding = project.caseStudyBinding;
  const usesBinding = project.documentType === "case-study" && Boolean(binding?.slots);
  const shape = {
    title: project.title,
    documentType: project.documentType,
    template: project.selectedTemplateId,
    avatars: project.selectedAvatarIds ?? [],
    voice: project.selectedVoice,
    // Company logo: its public URL, only when set (stableStringify drops undefined,
    // so a project without a logo hashes exactly as before this field existed).
    logo: project.logoUrl,
    content: usesBinding
      ? {
          slots: binding?.slots,
          sectionAudio: binding?.sectionAudio,
          sectionAudioVoice: binding?.sectionAudioVoice,
          sectionVideo: binding?.sectionVideo,
        }
      : {
          chunks: project.chunks.map((chunk) => ({
            id: chunk.id,
            order: chunk.order,
            title: chunk.title,
            narrativeText: chunk.narrativeText,
            emotion: chunk.emotion,
            audioUrl: chunk.audioUrl,
            audioVoice: chunk.audioVoice,
            // Scene image: the public URL of a ready image (it carries ?v=<updated_at>, so a
            // regenerated image changes it). Absent for chapters without one, which keeps
            // those hashes unchanged. imageStatus is deliberately not fingerprinted: only
            // ready images reach the published site.
            imageUrl: chunk.imageUrl,
          })),
        },
  };
  return `${FINGERPRINT_VERSION}:${hashString(stableStringify(shape))}`;
}

export type PublishStateKey = "draft" | "publishing" | "failed" | "published" | "changed";

/** Display registry for every publish state (label + tone), in filter order. */
export const PUBLISH_STATES: { key: PublishStateKey; label: string; tone: "neutral" | "info" | "danger" | "success" | "warning" }[] = [
  { key: "draft", label: "Draft", tone: "neutral" },
  { key: "published", label: "Published", tone: "success" },
  { key: "changed", label: "Published with unpublished changes", tone: "warning" },
  { key: "publishing", label: "Publishing", tone: "info" },
  { key: "failed", label: "Failed", tone: "danger" },
];

export function publishStateInfo(key: PublishStateKey) {
  return PUBLISH_STATES.find((state) => state.key === key) ?? PUBLISH_STATES[0];
}

/** Optional timestamps (list/detail API) used only as a fallback when no fingerprint was recorded. */
type WithTimestamps = Project & { updatedAt?: string; publishedAt?: string };

/**
 * True/false when it can be decided, null when unknown (a site published
 * before fingerprints existed, with no published_at to compare against).
 */
export function hasUnpublishedChanges(project: WithTimestamps): boolean | null {
  const stored = project.publication?.contentHash;
  if (stored && stored.startsWith(`${FINGERPRINT_VERSION}:`)) {
    return stored !== contentFingerprint(project);
  }
  // Fallback (accounts on): anything saved more than a moment after the last publish.
  if (project.updatedAt && project.publishedAt) {
    const updated = Date.parse(project.updatedAt);
    const published = Date.parse(project.publishedAt);
    if (!Number.isNaN(updated) && !Number.isNaN(published)) return updated - published > 2000;
  }
  return null;
}

export function getPublishState(project: WithTimestamps): PublishStateKey {
  if (project.publishStatus === "publishing") return "publishing";
  if (project.publishStatus === "failed") return "failed";
  if (project.publishStatus !== "published" || !project.publishedUrl) return "draft";
  return hasUnpublishedChanges(project) ? "changed" : "published";
}

export type NarrationState = "ok" | "missing" | "outdated";

/**
 * - missing: never narrated.
 * - outdated: its text changed after narration (audio dropped on save), or
 *   the audio is in a different voice than `voice`.
 * Audio from before voices were tracked (no audioVoice) is treated as ok.
 */
export function narrationState(
  item: { audioUrl?: string; audioVoice?: string; outdated?: boolean },
  voice?: string
): NarrationState {
  if (!item.audioUrl) return item.outdated ? "outdated" : "missing";
  if (voice && item.audioVoice && item.audioVoice !== voice) return "outdated";
  return "ok";
}

export function chunkNarrationState(chunk: Chunk, voice?: string): NarrationState {
  return narrationState(
    { audioUrl: chunk.audioUrl, audioVoice: chunk.audioVoice, outdated: chunk.narrationOutdated },
    voice
  );
}

export function sectionNarrationState(binding: CaseStudyBinding, key: string, voice?: string): NarrationState {
  return narrationState(
    {
      audioUrl: binding.sectionAudio?.[key],
      audioVoice: binding.sectionAudioVoice?.[key],
      outdated: binding.outdatedSections?.includes(key),
    },
    voice
  );
}

export interface NarrationSummary {
  /** Which narration the published site uses: bound case-study sections or plain chapters. */
  kind: "case-study" | "chunks";
  total: number;
  /** Ids (chunk ids or section keys) that need narration generated before publishing. */
  needed: string[];
  missing: number;
  outdated: number;
}

/** Narration status of whatever the published site will play. */
export function summarizeNarration(project: Project, voice?: string): NarrationSummary {
  const binding = project.caseStudyBinding;
  const entries: { id: string; state: NarrationState }[] =
    project.documentType === "case-study" && binding?.slots
      ? flattenCaseStudySections(binding.slots).map((section) => ({
          id: section.key,
          state: sectionNarrationState(binding, section.key, voice),
        }))
      : project.chunks.map((chunk) => ({ id: chunk.id, state: chunkNarrationState(chunk, voice) }));
  const needed = entries.filter((entry) => entry.state !== "ok");
  return {
    kind: project.documentType === "case-study" && binding?.slots ? "case-study" : "chunks",
    total: entries.length,
    needed: needed.map((entry) => entry.id),
    missing: needed.filter((entry) => entry.state === "missing").length,
    outdated: needed.filter((entry) => entry.state === "outdated").length,
  };
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
