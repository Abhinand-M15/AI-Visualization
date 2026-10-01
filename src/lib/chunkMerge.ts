import type { Chunk } from "@/lib/types";
/** Story fields a client may set on a chunk; audio fields are server-owned. */
const CLIENT_CHUNK_FIELDS = ["emotion", "phase", "impactScore", "evidenceGrade"] as const;

/**
 * Merges the submitted chapter list with the stored one. Audio is taken from
 * the stored chunk while its narration text is unchanged, and dropped (and
 * flagged outdated) once it changes, so a save never keeps narration that no
 * longer matches the text, and never loses narration that still does.
 */
export function mergeChunks(submitted: unknown[], previousChunks: Chunk[]) {
  const previousById = new Map(previousChunks.map((chunk) => [chunk.id, chunk]));
  const seen = new Set<string>();
  const partNumbers = new Map<string, number>();
  let textChanged = false;

  const chunks: Chunk[] = submitted.map((entry, index) => {
    const raw = entry as Record<string, unknown>;
    // Unknown or duplicate ids (e.g. a new chapter, or an AI revision reusing a
    // deleted chapter's id) get a fresh one.
    const rawId = typeof raw.id === "string" && raw.id.trim() ? raw.id : "";
    const id = rawId && !seen.has(rawId) ? rawId : crypto.randomUUID();
    seen.add(id);
    const previous = previousById.get(id);
    const title = raw.title as string;
    const narrativeText = raw.narrativeText as string;
    const narrationChanged = !previous || previous.narrativeText !== narrativeText;
    const changed = !previous || previous.title !== title || narrationChanged;
    if (changed) textChanged = true;

    const chunk: Chunk = {
      id,
      order: index + 1,
      title,
      narrativeText,
      userEdited: previous ? (changed ? true : previous.userEdited ?? false) : raw.userEdited === true,
    };
    for (const field of CLIENT_CHUNK_FIELDS) {
      const value = raw[field] ?? previous?.[field];
      if (value !== undefined && value !== null) (chunk as unknown as Record<string, unknown>)[field] = value;
    }
    if (chunk.phase) {
      const part = (partNumbers.get(chunk.phase) ?? 0) + 1;
      partNumbers.set(chunk.phase, part);
      chunk.partNumber = part;
    }

    if (previous && !narrationChanged) {
      if (previous.audioUrl) chunk.audioUrl = previous.audioUrl;
      if (previous.audioDurationSec !== undefined) chunk.audioDurationSec = previous.audioDurationSec;
      if (previous.audioVoice) chunk.audioVoice = previous.audioVoice;
      if (previous.narrationOutdated) chunk.narrationOutdated = true;
    } else if (previous && (previous.audioUrl || previous.narrationOutdated)) {
      chunk.narrationOutdated = true;
    }
    return chunk;
  });

  const structureChanged =
    chunks.length !== previousChunks.length || chunks.some((chunk, index) => chunk.id !== previousChunks[index]?.id);
  const removed = previousChunks.filter((chunk) => !seen.has(chunk.id));
  return { chunks, textChanged, structureChanged, removed };
}
