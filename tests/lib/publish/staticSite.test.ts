import { describe, expect, it } from "vitest";
import { TemplateUnavailableError, renderStaticSite } from "@/lib/publish/staticSite";
import {
  chapterImageHtml,
  escapeHtml,
  injectStoryLogo,
  safeUrl,
  storagePublicUrl,
  storyLogoHtml,
} from "@/components/templates/storyMedia";
import type { Chunk, Project } from "@/lib/types";

const SUPABASE = "https://abc.supabase.co";
const XSS_TITLE = `</title><script>alert("title")</script>`;
const XSS_TEXT = `<img src=x onerror=alert('text')> & "quotes"`;

function project(templateId: string, overrides: Partial<Project> = {}): Project {
  const chunks: Chunk[] = [
    { id: "c1", order: 1, title: `<b>Chapter</b> "one"`, narrativeText: XSS_TEXT, audioUrl: "https://x.test/c1.mp3" },
    { id: "c2", order: 2, title: "Two", narrativeText: "Plain text." },
  ];
  return {
    id: "proj-1",
    title: XSS_TITLE,
    documentType: "other",
    chunks,
    selectedVoice: "v1",
    selectedAvatarIds: [],
    selectedTemplateId: templateId,
    publishStatus: "draft",
    createdAt: "2026-10-01T00:00:00Z",
    ...overrides,
  };
}

const TEMPLATES = ["space", "lunar", "airlock", "voyage", "showcase"];

describe("renderStaticSite escapes user content", () => {
  it.each(TEMPLATES)("%s: title and chapter text never become markup", (templateId) => {
    const html = renderStaticSite(project(templateId), [], SUPABASE);
    expect(html.startsWith("<!doctype html>") || html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).not.toContain(`<script>alert("title")</script>`);
    expect(html).not.toContain(`<img src=x onerror=alert('text')>`);
    expect(html).not.toContain("<b>Chapter</b>");
    // The page <title> holds the escaped text, closed exactly once.
    const titleTag = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? "";
    expect(titleTag).not.toContain("<");
  });

  it("case-study layout escapes its bound sections", () => {
    const html = renderStaticSite(
      project("space", {
        documentType: "case-study",
        caseStudyBinding: {
          templateContractId: "case-study-v1",
          slots: {
            company: { name: XSS_TITLE, body: XSS_TEXT },
            problem: { name: "Problem", body: XSS_TEXT },
          },
          diagnostics: [],
          boundAt: "2026-10-01T00:00:00Z",
        },
      }),
      [],
      SUPABASE
    );
    expect(html).not.toContain(`<script>alert("title")</script>`);
    expect(html).not.toContain(`<img src=x onerror=alert('text')>`);
  });

  it("audio src cannot break out of its attribute (SEC-21)", () => {
    const evilId = `c1"><script>alert("audio")</script>`;
    const p = project("space");
    p.chunks[0] = { ...p.chunks[0], id: evilId };
    let html = "";
    try {
      html = renderStaticSite(p, [], SUPABASE);
    } catch {
      // Refusing to render an invalid chunk id is also acceptable.
      return;
    }
    expect(html).not.toContain(`<script>alert("audio")</script>`);
  });

  it("logo URL is attribute-escaped", () => {
    const html = renderStaticSite(project("space", { logoUrl: `logo.png"><script>alert("logo")</script>` }), [], SUPABASE);
    expect(html).not.toContain(`<script>alert("logo")</script>`);
  });

  it("refuses an unknown template instead of falling back", () => {
    expect(() => renderStaticSite(project("does-not-exist"), [], SUPABASE)).toThrow(TemplateUnavailableError);
  });
});

describe("storyMedia helpers", () => {
  it("escapeHtml escapes text and attribute values", () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe("&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
  });

  it("safeUrl allows https, local http and bundle paths only", () => {
    expect(safeUrl("https://abc.supabase.co/storage/v1/object/public/x.png")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/x.png"
    );
    expect(safeUrl("images/chapter-1.jpg")).toBe("images/chapter-1.jpg");
    expect(safeUrl("http://localhost:3000/x.png")).toBe("http://localhost:3000/x.png");
    for (const bad of [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "data:image/svg+xml,<svg onload=alert(1)>",
      "vbscript:x",
      "//evil.example/x.png",
      "http://evil.example/x.png",
      `x.png" onerror="alert(1)`,
      "x.png'><script>",
      "a b.png",
      "",
      null,
      undefined,
    ]) {
      expect(safeUrl(bad), String(bad)).toBe("");
    }
  });

  it("storagePublicUrl percent-encodes every segment", () => {
    expect(storagePublicUrl("https://abc.supabase.co/", "chunk-audio", "p1", `c1"><x>.mp3`)).toBe(
      "https://abc.supabase.co/storage/v1/object/public/chunk-audio/p1/c1%22%3E%3Cx%3E.mp3"
    );
    expect(storagePublicUrl("https://abc.supabase.co", "chunk-audio", "../p2", "a/b.mp3")).not.toMatch(/\/\.\.\/|a\/b/);
  });

  it("image and logo markup escape values and drop unsafe URLs", () => {
    expect(chapterImageHtml("img/a&b.png")).toContain(`src="img/a&amp;b.png"`);
    expect(chapterImageHtml(`x" onerror="alert(1)`)).not.toContain("onerror");
    expect(chapterImageHtml("javascript:alert(1)")).not.toContain("javascript:");
    expect(storyLogoHtml(`x" onerror="alert(1)`)).not.toContain("onerror");
    expect(storyLogoHtml("logos/acme.png")).toContain(`src="logos/acme.png"`);
  });

  it("injects the logo once, after <body>, and leaves pages without a (safe) logo untouched", () => {
    const page = "<html><head></head><body class='x'><main></main></body></html>";
    expect(injectStoryLogo(page, undefined)).toBe(page);
    expect(injectStoryLogo(page, "javascript:alert(1)")).toBe(page);
    const withLogo = injectStoryLogo(page, "logo.png");
    expect(withLogo.match(/class="story-logo"/g)).toHaveLength(1);
    expect(withLogo.indexOf(`class="story-logo"`)).toBeGreaterThan(withLogo.indexOf("<body"));
    expect(withLogo).toContain("</style>\n</head>");
  });
});
