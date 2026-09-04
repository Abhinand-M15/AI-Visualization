import type { EmotionKey } from "@/lib/types";

/**
 * A single narratable moment in the published case-study experience —
 * flattened from the layout-binding agent's `slots` object (Company/Domain/
 * Customer/Problem/Solution/Impact) into the same {title, body, emotion}
 * shape the existing chunk-based templates already know how to render with
 * an avatar + narration audio. Shared between the React template (live
 * preview) and the static-site renderer (published output) so both stay in
 * sync with exactly one flattening implementation.
 */
export interface CaseStudySection {
  /** Stable, URL-safe id — also used as the audio storage/path key. */
  key: string;
  sectionLabel: string;
  title: string;
  body: string;
  emotion: EmotionKey;
}

const SECTION_EMOTION: Record<string, EmotionKey> = {
  company: "neutral",
  domain: "neutral",
  customer: "neutral",
  problem: "confused",
  solution: "solution",
  impact: "happy",
};

const SINGLE_SECTIONS: { key: "company" | "domain" | "customer"; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "domain", label: "Domain" },
  { key: "customer", label: "Customer" },
];

const LIST_SECTIONS: { key: "problem" | "solution" | "impact"; label: string }[] = [
  { key: "problem", label: "Problem" },
  { key: "solution", label: "Solution" },
  { key: "impact", label: "Impact" },
];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is Record<string, unknown> => Boolean(asRecord(entry)));
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/**
 * Walks the fixed Company → Domain → Customer → Problem → Solution → Impact
 * order, skipping any slot the binding agent resolved to null/empty (RULE 5)
 * — a missing section here means the source genuinely had nothing for it,
 * not a bug.
 */
export function flattenCaseStudySections(slots: Record<string, unknown> | null): CaseStudySection[] {
  if (!slots) return [];
  const sections: CaseStudySection[] = [];

  for (const { key, label } of SINGLE_SECTIONS) {
    const record = asRecord(slots[key]);
    const body = asText(record?.body);
    if (!body) continue;
    sections.push({
      key,
      sectionLabel: label,
      title: asText(record?.name) ?? label,
      body,
      emotion: SECTION_EMOTION[key],
    });
  }

  for (const { key, label } of LIST_SECTIONS) {
    const items = asArray(slots[key]);
    items.forEach((item, index) => {
      const body = asText(item.body);
      if (!body) return;
      sections.push({
        key: `${key}-${index}`,
        sectionLabel: label,
        title: asText(item.title) ?? `${label} ${index + 1}`,
        body,
        emotion: SECTION_EMOTION[key],
      });
    });
  }

  return sections;
}
