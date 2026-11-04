import { describe, expect, it } from "vitest";
import {
  chunkNarrationState,
  contentFingerprint,
  getPublishState,
  hasUnpublishedChanges,
  narrationState,
  plural,
  summarizeNarration,
} from "@/lib/contentVersion";
import type { Chunk, Project } from "@/lib/types";

function chunk(id: string, overrides: Partial<Chunk> = {}): Chunk {
  return { id, order: 1, title: `T ${id}`, narrativeText: `N ${id}`, ...overrides };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    title: "Story",
    documentType: "other",
    chunks: [chunk("a", { audioUrl: "https://x.test/a.mp3", audioVoice: "v1" }), chunk("b")],
    selectedVoice: "v1",
    selectedAvatarIds: ["avatar-1"],
    selectedTemplateId: "space",
    publishStatus: "draft",
    createdAt: "2026-10-01T00:00:00Z",
    ...overrides,
  };
}

describe("contentFingerprint", () => {
  it("is versioned and deterministic", () => {
    const fp = contentFingerprint(project());
    expect(fp).toMatch(/^v\d+:[0-9a-f]{14}$/);
    expect(contentFingerprint(project())).toBe(fp);
  });

  it("ignores key order and null/undefined members", () => {
    const a = project();
    const b = project({ chunks: a.chunks.map((c) => ({ ...c, emotion: undefined })) });
    expect(contentFingerprint(b)).toBe(contentFingerprint(a));
    const reordered = Object.fromEntries(Object.entries(a).reverse()) as unknown as Project;
    expect(contentFingerprint(reordered)).toBe(contentFingerprint(a));
  });

  it("changes when anything the published site shows changes", () => {
    const base = contentFingerprint(project());
    const variants: Partial<Project>[] = [
      { title: "Other" },
      { selectedTemplateId: "lunar" },
      { selectedVoice: "v2" },
      { selectedAvatarIds: ["avatar-2"] },
      { logoUrl: "logos/x.png" },
      { chunks: [chunk("a", { narrativeText: "changed" }), chunk("b")] },
      { chunks: [chunk("b"), chunk("a", { audioUrl: "https://x.test/a.mp3", audioVoice: "v1" })] },
      { chunks: [chunk("a", { audioUrl: "https://x.test/a.mp3", audioVoice: "v1" }), chunk("b", { imageUrl: "i.png" })] },
    ];
    for (const change of variants) {
      expect(contentFingerprint(project(change)), JSON.stringify(change)).not.toBe(base);
    }
  });

  it("ignores fields the site is not built from", () => {
    const base = contentFingerprint(project());
    expect(contentFingerprint(project({ createdAt: "2030-01-01T00:00:00Z", publishStatus: "failed" }))).toBe(base);
    expect(
      contentFingerprint(
        project({
          chunks: [
            chunk("a", { audioUrl: "https://x.test/a.mp3", audioVoice: "v1", imageStatus: "pending", audioDurationSec: 9 }),
            chunk("b"),
          ],
        })
      )
    ).toBe(base);
  });
});

describe("hasUnpublishedChanges / getPublishState", () => {
  it("compares with the stored fingerprint", () => {
    const p = project({ publishStatus: "published", publishedUrl: "https://warpdrive-x.vercel.app" });
    const published: Project = { ...p, publication: { contentHash: contentFingerprint(p), publishedAt: "2026-10-02T00:00:00Z" } };
    expect(hasUnpublishedChanges(published)).toBe(false);
    expect(getPublishState(published)).toBe("published");

    const edited = { ...published, title: "Edited" };
    expect(hasUnpublishedChanges(edited)).toBe(true);
    expect(getPublishState(edited)).toBe("changed");
  });

  it("falls back to timestamps, then to unknown", () => {
    const p = project();
    expect(hasUnpublishedChanges({ ...p, updatedAt: "2026-10-02T00:00:10Z", publishedAt: "2026-10-02T00:00:00Z" })).toBe(
      true
    );
    expect(hasUnpublishedChanges({ ...p, updatedAt: "2026-10-02T00:00:01Z", publishedAt: "2026-10-02T00:00:00Z" })).toBe(
      false
    );
    expect(hasUnpublishedChanges(p)).toBeNull();
  });

  it("maps the stored status", () => {
    expect(getPublishState(project({ publishStatus: "publishing" }))).toBe("publishing");
    expect(getPublishState(project({ publishStatus: "failed" }))).toBe("failed");
    expect(getPublishState(project({ publishStatus: "draft" }))).toBe("draft");
    // "published" without a URL is not really published.
    expect(getPublishState(project({ publishStatus: "published" }))).toBe("draft");
  });
});

describe("narration state", () => {
  it("classifies audio", () => {
    expect(narrationState({})).toBe("missing");
    expect(narrationState({ outdated: true })).toBe("outdated");
    expect(narrationState({ audioUrl: "u", audioVoice: "v1" }, "v2")).toBe("outdated");
    expect(narrationState({ audioUrl: "u", audioVoice: "v1" }, "v1")).toBe("ok");
    // Audio from before voices were tracked counts as ok.
    expect(narrationState({ audioUrl: "u" }, "v2")).toBe("ok");
    expect(chunkNarrationState(chunk("x", { narrationOutdated: true }))).toBe("outdated");
  });

  it("summarises what needs narrating before publish", () => {
    const summary = summarizeNarration(
      project({
        chunks: [
          chunk("a", { audioUrl: "u", audioVoice: "v1" }),
          chunk("b"),
          chunk("c", { narrationOutdated: true }),
          chunk("d", { audioUrl: "u", audioVoice: "old" }),
        ],
      }),
      "v1"
    );
    expect(summary).toEqual({ kind: "chunks", total: 4, needed: ["b", "c", "d"], missing: 1, outdated: 2 });
  });
});

describe("plural", () => {
  it("pluralises", () => {
    expect(plural(1, "chapter")).toBe("1 chapter");
    expect(plural(2, "chapter")).toBe("2 chapters");
    expect(plural(0, "story", "stories")).toBe("0 stories");
  });
});
