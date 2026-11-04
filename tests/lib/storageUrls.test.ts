import { afterEach, describe, expect, it, vi } from "vitest";
import { COMPANY_LOGOS_BUCKET, SCENE_IMAGES_BUCKET, logoUrl, sceneImageUrl } from "@/lib/storageUrls";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("storage public URLs", () => {
  it("builds public bucket URLs from SUPABASE_URL", () => {
    vi.stubEnv("SUPABASE_URL", "https://abc.supabase.co/");
    expect(sceneImageUrl("p1/chapter-1.webp")).toBe(
      `https://abc.supabase.co/storage/v1/object/public/${SCENE_IMAGES_BUCKET}/p1/chapter-1.webp`
    );
    expect(logoUrl("u1/logo.png")).toBe(`https://abc.supabase.co/storage/v1/object/public/${COMPANY_LOGOS_BUCKET}/u1/logo.png`);
  });

  it("percent-encodes each path segment, so a segment cannot inject query, fragment or markup", () => {
    vi.stubEnv("SUPABASE_URL", "https://abc.supabase.co");
    const url = sceneImageUrl('p1/a b?x=1#y"<z>.png');
    expect(url).toBe(
      `https://abc.supabase.co/storage/v1/object/public/${SCENE_IMAGES_BUCKET}/p1/a%20b%3Fx%3D1%23y%22%3Cz%3E.png`
    );
    expect(new URL(url).search).toBe("");
    expect(new URL(url).hash).toBe("");
  });

  it("throws when SUPABASE_URL is not set", () => {
    vi.stubEnv("SUPABASE_URL", undefined);
    expect(() => sceneImageUrl("p1/x.png")).toThrow(/SUPABASE_URL/);
  });
});
