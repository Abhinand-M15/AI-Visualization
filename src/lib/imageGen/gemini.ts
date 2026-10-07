/**
 * Gemini image generation via generateContent (responseModalities + imageConfig.aspectRatio).
 * The reference image goes in as an inline_data part before the text prompt.
 */
import type { ImageGenerator } from "./types";
import { geminiImageModel } from "./constants";
import { ImageGenerationError, errorDetail, fetchWithRetry } from "./http";

type GenerateOpts = Parameters<ImageGenerator["generate"]>[0];

/** Gemini supports all three of our aspects natively. */
export function geminiAspect(aspect: GenerateOpts["aspect"]): "16:9" | "1:1" | "3:4" {
  return aspect === "16:9" || aspect === "3:4" ? aspect : "1:1";
}

interface GeminiResponse {
  candidates?: {
    finishReason?: string;
    finishMessage?: string;
    content?: {
      parts?: {
        text?: string;
        inlineData?: { mimeType?: string; data?: string };
        inline_data?: { mime_type?: string; data?: string };
      }[];
    };
  }[];
  promptFeedback?: { blockReason?: string; blockReasonMessage?: string };
}

export function buildGeminiRequest(opts: GenerateOpts) {
  const parts: Record<string, unknown>[] = [];
  if (opts.referenceImage) {
    parts.push({
      inline_data: { mime_type: opts.referenceImage.mimeType, data: opts.referenceImage.data.toString("base64") },
    });
  }
  parts.push({ text: opts.prompt });
  return {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: geminiAspect(opts.aspect) },
    },
  };
}

export function parseGeminiResponse(body: GeminiResponse): { mimeType: string; data: Buffer } {
  if (body.promptFeedback?.blockReason) {
    const extra = body.promptFeedback.blockReasonMessage ? `: ${body.promptFeedback.blockReasonMessage}` : "";
    throw new ImageGenerationError(`Gemini declined this prompt (${body.promptFeedback.blockReason}${extra}).`);
  }
  const candidate = body.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  for (const part of parts) {
    const inline =
      part.inlineData ?? (part.inline_data ? { mimeType: part.inline_data.mime_type, data: part.inline_data.data } : undefined);
    if (inline?.data) {
      return { mimeType: inline.mimeType || "image/png", data: Buffer.from(inline.data, "base64") };
    }
  }
  const text = parts.map((p) => p.text).filter(Boolean).join(" ").trim();
  const reason = candidate?.finishReason;
  if (reason && reason !== "STOP") {
    const extra = candidate?.finishMessage ? `: ${candidate.finishMessage}` : "";
    throw new ImageGenerationError(`Gemini returned no image (${reason}${extra}).${text ? ` ${text.slice(0, 200)}` : ""}`);
  }
  throw new ImageGenerationError(`Gemini returned no image.${text ? ` It said: ${text.slice(0, 200)}` : ""}`);
}

export function createGeminiImageGenerator(apiKey: string): ImageGenerator {
  return {
    async generate(opts) {
      const model = geminiImageModel();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const payload = JSON.stringify(buildGeminiRequest(opts));
      const res = await fetchWithRetry("Gemini", url, () => ({
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: payload,
      }));
      if (!res.ok) {
        const { message } = await errorDetail(res);
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          throw new ImageGenerationError(`Gemini rejected the request: ${message || `HTTP ${res.status}`}`, res.status);
        }
        throw new ImageGenerationError(
          `Gemini image generation failed (HTTP ${res.status})${message ? `: ${message}` : ""}`,
          res.status
        );
      }
      return parseGeminiResponse((await res.json()) as GeminiResponse);
    },
  };
}
