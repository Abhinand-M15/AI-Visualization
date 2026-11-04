import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { decryptSecret, encryptSecret, isKeyProvider, keyHint } from "@/lib/userKeys";

// A throw-away secret generated per test run; never a real KEY_ENCRYPTION_SECRET.
const SECRET = randomBytes(32).toString("base64");
const OTHER_SECRET = randomBytes(32).toString("base64");
const API_KEY = "AIzaSy-test-not-a-real-key-1234";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("encryptSecret / decryptSecret (AES-256-GCM)", () => {
  it("round-trips with the same secret and aad", () => {
    const payload = encryptSecret(API_KEY, "user-1:gemini", SECRET);
    expect(decryptSecret(payload, "user-1:gemini", SECRET)).toBe(API_KEY);
  });

  it("round-trips unicode and empty aad", () => {
    const payload = encryptSecret("ключ-🔑", undefined, SECRET);
    expect(decryptSecret(payload, undefined, SECRET)).toBe("ключ-🔑");
  });

  it("reads the secret from KEY_ENCRYPTION_SECRET when none is passed", () => {
    vi.stubEnv("KEY_ENCRYPTION_SECRET", SECRET);
    const payload = encryptSecret(API_KEY, "u:gemini");
    expect(decryptSecret(payload, "u:gemini", SECRET)).toBe(API_KEY);
  });

  it("uses the versioned v1 format and never contains the plaintext", () => {
    const payload = encryptSecret(API_KEY, "user-1:gemini", SECRET);
    const parts = payload.split(":");
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe("v1");
    expect(Buffer.from(parts[1], "base64")).toHaveLength(12);
    expect(Buffer.from(parts[2], "base64")).toHaveLength(16);
    expect(payload).not.toContain(API_KEY);
    expect(Buffer.from(parts[3], "base64").toString("utf8")).not.toContain(API_KEY);
  });

  it("uses a fresh IV every time", () => {
    const a = encryptSecret(API_KEY, "x", SECRET);
    const b = encryptSecret(API_KEY, "x", SECRET);
    expect(a).not.toBe(b);
    expect(a.split(":")[1]).not.toBe(b.split(":")[1]);
  });

  it("fails with another user's aad (ciphertext copied between rows)", () => {
    const payload = encryptSecret(API_KEY, "user-1:gemini", SECRET);
    expect(() => decryptSecret(payload, "user-2:gemini", SECRET)).toThrow();
    expect(() => decryptSecret(payload, "user-1:openai", SECRET)).toThrow();
    expect(() => decryptSecret(payload, undefined, SECRET)).toThrow();
  });

  it("fails with the wrong secret, without leaking crypto internals", () => {
    const payload = encryptSecret(API_KEY, "u", SECRET);
    expect(() => decryptSecret(payload, "u", OTHER_SECRET)).toThrow(/could not be decrypted/i);
  });

  it("detects tampering with the ciphertext or the tag", () => {
    const payload = encryptSecret(API_KEY, "u", SECRET);
    const [v, iv, tag, ct] = payload.split(":");
    const flip = (b64: string) => {
      const buf = Buffer.from(b64, "base64");
      buf[0] ^= 0x01;
      return buf.toString("base64");
    };
    expect(() => decryptSecret([v, iv, tag, flip(ct)].join(":"), "u", SECRET)).toThrow();
    expect(() => decryptSecret([v, iv, flip(tag), ct].join(":"), "u", SECRET)).toThrow();
    expect(() => decryptSecret([v, flip(iv), tag, ct].join(":"), "u", SECRET)).toThrow();
  });

  it.each(["", "garbage", "v2:a:b:c", "v1:a:b", "v1:AAAA:AAAA:AAAA"])("rejects malformed payload %j", (payload) => {
    expect(() => decryptSecret(payload, "u", SECRET)).toThrow();
  });

  it("refuses a missing or wrong-length secret", () => {
    vi.stubEnv("KEY_ENCRYPTION_SECRET", "");
    expect(() => encryptSecret(API_KEY)).toThrow(/KEY_ENCRYPTION_SECRET/);
    expect(() => encryptSecret(API_KEY, undefined, randomBytes(16).toString("base64"))).toThrow(/32/);
  });
});

describe("keyHint / isKeyProvider", () => {
  it("shows only the last four characters", () => {
    expect(keyHint(`  ${API_KEY}  `)).toBe("…1234");
    expect(keyHint("abcd")).toBe("…");
    expect(keyHint(API_KEY)).not.toContain(API_KEY.slice(0, -4));
  });

  it("knows the providers", () => {
    expect(isKeyProvider("gemini")).toBe(true);
    expect(isKeyProvider("openai")).toBe(true);
    expect(isKeyProvider("cloudflare")).toBe(false);
    expect(isKeyProvider(undefined)).toBe(false);
  });
});
