/**
 * OpenAI image generation: /v1/images/generations, or /v1/images/edits (multipart, image[])
 * when reference image(s) are given (several image[] parts, in order). Reads data[0].b64_json.
 */
import type { ImageGenerator } from "./types";
import { openaiImageModel } from "./constants";
import { ImageGenerationError, collectReferences, errorDetail, extensionForMime, fetchWithRetry } from "./http";

type GenerateOpts = Parameters<ImageGenerator["generate"]>[0];

/** Sizes every gpt-image model accepts; 16:9 and 3:4 map to the nearest landscape/portrait one. */
export function openaiSize(aspect: GenerateOpts["aspect"]): string {
  switch (aspect) {
    case "16:9":
      return "1536x1024";
    case "3:4":
      return "1024x1536";
    default:
      return "1024x1024";
  }
}

interface OpenAIImageResponse {
  data?: { b64_json?: string }[];
  output_format?: string;
}

export function parseOpenAIResponse(body: OpenAIImageResponse): { mimeType: string; data: Buffer } {
  const b64 = body.data?.[0]?.b64_json;
  if (!b64) throw new ImageGenerationError("OpenAI returned no image.");
  const fmt = (body.output_format ?? "png").toLowerCase();
  const mimeType = fmt === "jpeg" || fmt === "jpg" ? "image/jpeg" : fmt === "webp" ? "image/webp" : "image/png";
  return { mimeType, data: Buffer.from(b64, "base64") };
}

export function createOpenAIImageGenerator(apiKey: string): ImageGenerator {
  return {
    async generate(opts) {
      const model = openaiImageModel();
      const size = openaiSize(opts.aspect);
      const refs = collectReferences(opts);
      const url = `https://api.openai.com/v1/images/${refs.length > 0 ? "edits" : "generations"}`;
      const res = await fetchWithRetry("OpenAI", url, (): RequestInit => {
        if (refs.length > 0) {
          const form = new FormData();
          form.set("model", model);
          form.set("prompt", opts.prompt);
          form.set("size", size);
          refs.forEach((ref, index) => {
            form.append(
              "image[]",
              new Blob([new Uint8Array(ref.data)], { type: ref.mimeType }),
              `reference-${index + 1}.${extensionForMime(ref.mimeType)}`
            );
          });
          return { method: "POST", headers: { authorization: `Bearer ${apiKey}` }, body: form };
        }
        return {
          method: "POST",
          headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
          body: JSON.stringify({ model, prompt: opts.prompt, size }),
        };
      });
      if (!res.ok) {
        const { message, code } = await errorDetail(res);
        if (code === "moderation_blocked" || code === "content_policy_violation") {
          throw new ImageGenerationError(
            `OpenAI's safety system declined this image${message ? `: ${message}` : "."}`,
            res.status
          );
        }
        if (res.status === 401 || res.status === 403) {
          throw new ImageGenerationError(
            `OpenAI rejected the API key or the model: ${message || `HTTP ${res.status}`}`,
            res.status
          );
        }
        throw new ImageGenerationError(
          `OpenAI image generation failed (HTTP ${res.status})${message ? `: ${message}` : ""}`,
          res.status
        );
      }
      return parseOpenAIResponse((await res.json()) as OpenAIImageResponse);
    },
  };
}
