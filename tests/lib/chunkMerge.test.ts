import { describe, expect, it } from "vitest";
import { mergeChunks } from "@/lib/chunkMerge";
import type { Chunk } from "@/lib/types";

function stored(overrides: Partial<Chunk> & Pick<Chunk, "id">): Chunk {
  return {
    order: 1,
    title: `Title ${overrides.id}`,
    narrativeText: `Text ${overrides.id}`,
    ...overrides,
  };
}

const narrated = (id: string, order: number): Chunk =>
  stored({
    id,
    order,
    audioUrl: `https://example.test/${id}.mp3`,
    audioDurationSec: 12,
    audioVoice: "en-AU-WilliamMultilingualNeural",
  });

describe("mergeChunks", () => {
  it("keeps audio when nothing changed and reports no change", () => {
    const previous = [narrated("a", 1), narrated("b", 2)];
    const submitted = previous.map(({ id, title, narrativeText }) => ({ id, title, narrativeText }));
    const result = mergeChunks(submitted, previous);

    expect(result.textChanged).toBe(false);
    expect(result.structureChanged).toBe(false);
    expect(result.removed).toEqual([]);
    expect(result.chunks.map((c) => c.audioUrl)).toEqual(previous.map((c) => c.audioUrl));
    expect(result.chunks[0].audioDurationSec).toBe(12);
    expect(result.chunks[0].audioVoice).toBe("en-AU-WilliamMultilingualNeural");
    expect(result.chunks.every((c) => !c.narrationOutdated)).toBe(true);
  });

  it("drops audio and flags it outdated when the narration text changes", () => {
    const previous = [narrated("a", 1)];
    const result = mergeChunks([{ id: "a", title: "Title a", narrativeText: "New text" }], previous);

    expect(result.textChanged).toBe(true);
    expect(result.chunks[0].audioUrl).toBeUndefined();
    expect(result.chunks[0].audioDurationSec).toBeUndefined();
    expect(result.chunks[0].narrationOutdated).toBe(true);
    expect(result.chunks[0].userEdited).toBe(true);
  });

  it("keeps audio when only the title changes, but marks the chunk edited", () => {
    const previous = [narrated("a", 1)];
    const result = mergeChunks([{ id: "a", title: "Renamed", narrativeText: "Text a" }], previous);

    expect(result.textChanged).toBe(true);
    expect(result.chunks[0].audioUrl).toBe(previous[0].audioUrl);
    expect(result.chunks[0].userEdited).toBe(true);
  });

  it("never trusts client-sent audio fields", () => {
    const previous = [stored({ id: "a" })];
    const result = mergeChunks(
      [
        {
          id: "a",
          title: "Title a",
          narrativeText: "Text a",
          audioUrl: "https://evil.example/x.mp3",
          audioVoice: "x",
          narrationOutdated: false,
        },
        { id: "new-one", title: "New", narrativeText: "New", audioUrl: "javascript:alert(1)" },
      ],
      previous
    );

    for (const chunk of result.chunks) {
      expect(chunk.audioUrl).toBeUndefined();
      expect(chunk.audioVoice).toBeUndefined();
    }
  });

  it("does not copy unknown client fields onto the chunk", () => {
    const result = mergeChunks(
      [{ id: "a", title: "T", narrativeText: "N", imageUrl: "https://evil.example/i.png", isAdmin: true }],
      []
    );
    const chunk = result.chunks[0] as unknown as Record<string, unknown>;
    expect(chunk.isAdmin).toBeUndefined();
    expect(chunk.imageUrl).toBeUndefined();
  });

  it("gives duplicate and missing ids a fresh id", () => {
    const result = mergeChunks(
      [
        { id: "a", title: "1", narrativeText: "1" },
        { id: "a", title: "2", narrativeText: "2" },
        { title: "3", narrativeText: "3" },
        { id: "   ", title: "4", narrativeText: "4" },
      ],
      []
    );
    const ids = result.chunks.map((c) => c.id);
    expect(ids[0]).toBe("a");
    expect(new Set(ids).size).toBe(4);
    for (const id of ids.slice(1)) expect(id).not.toBe("a");
  });

  it("replaces ids that could escape a storage path or break HTML", () => {
    const result = mergeChunks(
      [
        { id: "../other-project/chunk-1", title: "1", narrativeText: "1" },
        { id: `c1"><script>alert(1)</script>`, title: "2", narrativeText: "2" },
        { id: "a/b", title: "3", narrativeText: "3" },
      ],
      []
    );
    for (const chunk of result.chunks) expect(chunk.id).toMatch(/^[a-z0-9-]{1,64}$/);
  });

  it("renumbers order and reports structure changes and removals", () => {
    const previous = [narrated("a", 1), narrated("b", 2), narrated("c", 3)];
    const result = mergeChunks(
      [
        { id: "c", title: "Title c", narrativeText: "Text c" },
        { id: "a", title: "Title a", narrativeText: "Text a" },
      ],
      previous
    );

    expect(result.chunks.map((c) => [c.id, c.order])).toEqual([
      ["c", 1],
      ["a", 2],
    ]);
    expect(result.structureChanged).toBe(true);
    expect(result.removed.map((c) => c.id)).toEqual(["b"]);
    // Reordering alone keeps the audio of unchanged text.
    expect(result.chunks[0].audioUrl).toBe(previous[2].audioUrl);
  });

  it("numbers case-study parts per phase", () => {
    const result = mergeChunks(
      [
        { id: "1", title: "a", narrativeText: "a", phase: "problem" },
        { id: "2", title: "b", narrativeText: "b", phase: "solution" },
        { id: "3", title: "c", narrativeText: "c", phase: "problem" },
      ],
      []
    );
    expect(result.chunks.map((c) => c.partNumber)).toEqual([1, 1, 2]);
  });

  it("keeps the outdated flag of an unchanged chunk that has no audio", () => {
    const previous = [stored({ id: "a", narrationOutdated: true })];
    const result = mergeChunks([{ id: "a", title: "Title a", narrativeText: "Text a" }], previous);
    expect(result.chunks[0].narrationOutdated).toBe(true);
  });
});
