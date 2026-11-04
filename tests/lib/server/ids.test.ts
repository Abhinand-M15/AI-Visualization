import { describe, expect, it } from "vitest";
import {
  UnsafePathError,
  caseStudyStorageId,
  chunkAudioPath,
  chunkVideoPath,
  isSafeSegment,
  isValidChunkId,
  isValidProjectId,
  storagePath,
  storagePathOrNull,
} from "@/lib/server/ids";

const TRAVERSAL = ["..", ".", "../x", "a/b", "a\\b", "%2e%2e", "a..b", "", "a b", "a?b", "a#b", "<x>", "x".repeat(200)];

describe("id formats", () => {
  it.each(["chunk-3", "3f2a6c1e-8a1b-4b0c-9d5e-1234567890ab", "case-study-problem-0"])("accepts chunk id %s", (id) => {
    expect(isValidChunkId(id)).toBe(true);
  });

  it.each(["", "Chunk-3", "a/b", "..", "a.b", `x"><script>`, "x".repeat(65)])("rejects chunk id %j", (id) => {
    expect(isValidChunkId(id)).toBe(false);
  });

  it("rejects non-strings", () => {
    expect(isValidChunkId(3)).toBe(false);
    expect(isValidChunkId(null)).toBe(false);
    expect(isValidProjectId({})).toBe(false);
  });

  it("accepts UUID and legacy project ids, rejects path characters", () => {
    expect(isValidProjectId("100f2b13-d59e-4166-8eeb-cfde93e4ee2b")).toBe(true);
    expect(isValidProjectId("legacy_Project-1")).toBe(true);
    for (const bad of ["../p", "p/q", "p.q", ""]) expect(isValidProjectId(bad)).toBe(false);
  });
});

describe("storagePath", () => {
  it("joins safe segments", () => {
    expect(storagePath("p1", "chunk-1.mp3")).toBe("p1/chunk-1.mp3");
    expect(isSafeSegment("logo.v2.png")).toBe(true);
  });

  it.each(TRAVERSAL)("refuses segment %j", (segment) => {
    expect(isSafeSegment(segment)).toBe(false);
    expect(() => storagePath("p1", segment)).toThrow(UnsafePathError);
    expect(storagePathOrNull("p1", segment)).toBeNull();
  });

  it("refuses no segments", () => {
    expect(() => storagePath()).toThrow(UnsafePathError);
  });

  it("builds narration and video paths only from valid ids", () => {
    expect(chunkAudioPath("p1", "chunk-1")).toBe("p1/chunk-1.mp3");
    expect(chunkVideoPath("p1", "chunk-1")).toBe("p1/chunk-1.mp4");
    expect(() => chunkAudioPath("p1", "../other/chunk")).toThrow(UnsafePathError);
    expect(() => chunkAudioPath("../p2", "chunk-1")).toThrow(UnsafePathError);
    expect(() => chunkVideoPath("p1", "a/b")).toThrow(UnsafePathError);
  });

  it("maps case-study section keys to storage ids", () => {
    expect(caseStudyStorageId("problem-0")).toBe("case-study-problem-0");
    expect(() => caseStudyStorageId("../x")).toThrow(UnsafePathError);
  });
});
