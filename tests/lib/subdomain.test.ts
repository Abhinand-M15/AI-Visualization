import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PUBLISH_NAME_PREFIX,
  getPublishNamePrefix,
  maxNameLength,
  normalizeSubdomain,
  siteLabel,
  stripNamePrefix,
  subdomainFromUrl,
  suggestSubdomain,
  validateSubdomain,
} from "@/lib/subdomain";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("validateSubdomain", () => {
  it.each(["acme-hr", "abc", "a1b2c3", "acme-corp-2026"])("accepts %s", (name) => {
    expect(validateSubdomain(name)).toEqual({ ok: true, value: name });
  });

  it("lowercases and trims, but never rewrites otherwise", () => {
    expect(validateSubdomain("  Acme-HR ")).toEqual({ ok: true, value: "acme-hr" });
  });

  it.each([
    ["", "empty"],
    ["ab", "too short"],
    ["acme_hr", "underscore"],
    ["acme.hr", "dot (would create a nested host)"],
    ["acme hr", "space"],
    ["-acme", "leading hyphen"],
    ["acme-", "trailing hyphen"],
    ["ac--me", "double hyphen"],
    ["acme/../x", "path characters"],
    ["<script>", "markup"],
    ["ácme", "non-ASCII"],
  ])("rejects %j (%s)", (name) => {
    const result = validateSubdomain(name);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBeTruthy();
  });

  it.each(["www", "api", "admin", "login", "vercel", "warpdrive", "supabase"])("rejects reserved name %s", (name) => {
    expect(validateSubdomain(name).ok).toBe(false);
  });

  it("keeps prefix + name within a 63-character DNS label", () => {
    const max = maxNameLength(PUBLISH_NAME_PREFIX);
    expect(PUBLISH_NAME_PREFIX.length + max).toBeLessThanOrEqual(63);
    expect(validateSubdomain("a".repeat(max)).ok).toBe(true);
    expect(validateSubdomain("a".repeat(max + 1)).ok).toBe(false);
  });

  it("shrinks the maximum length for a long prefix", () => {
    const prefix = "a-very-long-prefix-of-thirty-chars-";
    const max = maxNameLength(prefix);
    expect(prefix.length + max).toBeLessThanOrEqual(63);
    expect(validateSubdomain("b".repeat(max + 1), prefix).ok).toBe(false);
  });
});

describe("normalizeSubdomain", () => {
  it("turns free text into name shape", () => {
    expect(normalizeSubdomain("Acme Corp: Cloud Migration!")).toBe("acme-corp-cloud-migration");
    expect(normalizeSubdomain("  --Héllo   Wörld--  ")).toBe("hello-world");
    expect(normalizeSubdomain("a/../b")).toBe("a-b");
  });
});

describe("stripNamePrefix", () => {
  it("removes a pasted prefix, repeatedly", () => {
    expect(stripNamePrefix("warpdrive-warpdrive-acme")).toBe("acme");
    expect(stripNamePrefix("acme")).toBe("acme");
    expect(stripNamePrefix("acme", "")).toBe("acme");
  });
});

describe("suggestSubdomain", () => {
  it("always returns a valid name", () => {
    for (const title of [
      "Acme Corp: Cloud Migration!",
      "",
      "a",
      "www",
      "!!!",
      "warpdrive-acme",
      "A very long project title that goes on and on well past the DNS label limit for sure",
    ]) {
      const suggestion = suggestSubdomain(title);
      expect(validateSubdomain(suggestion).ok, `${title} -> ${suggestion}`).toBe(true);
    }
  });

  it("derives the name from the title", () => {
    expect(suggestSubdomain("Acme Corp: Cloud Migration!")).toBe("acme-corp-cloud-migration");
    expect(suggestSubdomain("")).toBe("my-story");
  });
});

describe("subdomainFromUrl", () => {
  it("extracts the name from a published URL", () => {
    expect(subdomainFromUrl("https://warpdrive-acme-hr.vercel.app", ".vercel.app")).toBe("acme-hr");
    expect(subdomainFromUrl("https://WARPDRIVE-ACME.vercel.app/x?y", ".vercel.app")).toBe("acme");
  });

  it("returns null for anything else", () => {
    expect(subdomainFromUrl(undefined, ".vercel.app")).toBeNull();
    expect(subdomainFromUrl("not a url", ".vercel.app")).toBeNull();
    expect(subdomainFromUrl("https://story-123.vercel.app", ".vercel.app")).toBeNull();
    expect(subdomainFromUrl("https://warpdrive-acme.evil.com", ".vercel.app")).toBeNull();
    expect(subdomainFromUrl("http://localhost:3000/published/abc/", ".vercel.app")).toBeNull();
  });
});

describe("getPublishNamePrefix / siteLabel", () => {
  it("defaults to warpdrive-", () => {
    vi.stubEnv("PUBLISH_NAME_PREFIX", undefined);
    expect(getPublishNamePrefix()).toBe(PUBLISH_NAME_PREFIX);
    expect(siteLabel("acme")).toBe(`${PUBLISH_NAME_PREFIX}acme`);
  });

  it("accepts a valid override and an empty one", () => {
    vi.stubEnv("PUBLISH_NAME_PREFIX", " Story- ");
    expect(getPublishNamePrefix()).toBe("story-");
    vi.stubEnv("PUBLISH_NAME_PREFIX", "");
    expect(getPublishNamePrefix()).toBe("");
  });

  it.each(["bad prefix", "a..b", "x--", "-lead", "UPPER_CASE!", "x".repeat(40)])(
    "falls back to the default for an invalid override %j",
    (value) => {
      vi.stubEnv("PUBLISH_NAME_PREFIX", value);
      expect(getPublishNamePrefix()).toBe(PUBLISH_NAME_PREFIX);
    }
  );
});
