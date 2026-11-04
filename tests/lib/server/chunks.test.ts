import { describe, expect, it } from "vitest";
import {
  MAX_CHUNKS,
  MAX_CHUNK_TEXT_LENGTH,
  MAX_STORY_TITLE_LENGTH,
  cleanStoryTitle,
  validateClientChunks,
} from "@/lib/server/chunks";

describe("validateClientChunks", () => {
  it("keeps only story fields and drops server-owned ones", () => {
    const result = validateClientChunks([
      {
        id: "chunk-1",
        title: "One",
        narrativeText: "Text",
        emotion: "happy",
        phase: "problem",
        impactScore: 7,
        evidenceGrade: "verified",
        userEdited: true,
        audioUrl: "https://evil.example/a.mp3",
        audioVoice: "x",
        imageUrl: "javascript:alert(1)",
        imageStatus: "ready",
        order: 99,
        partNumber: 5,
        isAdmin: true,
      },
    ]);
    expect(result).toEqual({
      ok: true,
      chunks: [
        {
          id: "chunk-1",
          title: "One",
          narrativeText: "Text",
          emotion: "happy",
          phase: "problem",
          impactScore: 7,
          evidenceGrade: "verified",
          userEdited: true,
        },
      ],
    });
  });

  it("drops invalid ids so the server assigns fresh ones", () => {
    const result = validateClientChunks([
      { id: "../other/x", title: "a", narrativeText: "a" },
      { id: `x"><script>`, title: "b", narrativeText: "b" },
      { id: 42, title: "c", narrativeText: "c" },
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) for (const chunk of result.chunks) expect(chunk.id).toBeUndefined();
  });

  it("drops unknown enum values and clamps the impact score", () => {
    const result = validateClientChunks([
      { title: "a", narrativeText: "a", emotion: "evil", phase: "nope", evidenceGrade: "maybe", impactScore: 99 },
      { title: "b", narrativeText: "b", impactScore: -4 },
      { title: "c", narrativeText: "c", impactScore: Number.NaN },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.chunks[0]).toEqual({ title: "a", narrativeText: "a", impactScore: 10 });
    expect(result.chunks[1].impactScore).toBe(1);
    expect(result.chunks[2].impactScore).toBeUndefined();
  });

  it("strips control characters but keeps tabs and newlines", () => {
    const result = validateClientChunks([{ title: "T\u0000i\u0007tle", narrativeText: "a\tb\nc\u001Bd\u007F" }]);
    expect(result.ok && result.chunks[0]).toEqual({ title: "Title", narrativeText: "a\tb\ncd" });
  });

  it.each([
    ["not an array", { title: "a" }],
    ["empty", []],
    ["a non-object", ["text"]],
    ["an array entry", [[1]]],
    ["no title", [{ narrativeText: "a" }]],
    ["non-string text", [{ title: "a", narrativeText: 5 }]],
    ["text too long", [{ title: "a", narrativeText: "x".repeat(MAX_CHUNK_TEXT_LENGTH + 1) }]],
    ["too many chapters", Array.from({ length: MAX_CHUNKS + 1 }, () => ({ title: "a", narrativeText: "a" }))],
  ])("rejects %s", (_label, raw) => {
    const result = validateClientChunks(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeTruthy();
  });

  it("allows an empty list only when asked", () => {
    expect(validateClientChunks([], { allowEmpty: true })).toEqual({ ok: true, chunks: [] });
  });
});

describe("cleanStoryTitle", () => {
  it("trims and validates", () => {
    expect(cleanStoryTitle("  My story \u0000 ")).toBe("My story");
    expect(cleanStoryTitle("   ")).toBeNull();
    expect(cleanStoryTitle(5)).toBeNull();
    expect(cleanStoryTitle("x".repeat(MAX_STORY_TITLE_LENGTH + 1))).toBeNull();
  });
});
