import type { Chunk, EmotionKey } from "@/lib/types";

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
  /** Where this section lives in the bound slots: slots[slotId] or slots[slotId][index]. */
  slotId: string;
  index: number | null;
  /** The slot field its title is read from, or null when the slot has no title of its own. */
  titleField: "title" | "name" | null;
}

/** One user edit of a flattened section, addressed by CaseStudySection.key. */
export interface CaseStudySectionEdit {
  key: string;
  title?: string;
  body?: string;
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
/**
 * Sections as ordinary chunks, so any chunk-based template (Voyage, ...) can
 * show a case study. The chunk id is `case-study-<key>`, the same name the
 * section audio is stored under, so published audio URLs resolve unchanged.
 */
export function caseStudySectionsAsChunks(
  sections: CaseStudySection[],
  sectionAudio: Record<string, string> | undefined
): Chunk[] {
  return sections.map((section, index) => ({
    id: `case-study-${section.key}`,
    order: index + 1,
    title: section.title,
    narrativeText: section.body,
    emotion: section.emotion,
    ...(sectionAudio?.[section.key] ? { audioUrl: sectionAudio[section.key] } : {}),
  }));
}

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
      slotId: key,
      index: null,
      titleField: record && "name" in record ? "name" : null,
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
        slotId: key,
        index,
        titleField: "title" in item ? "title" : null,
      });
    });
  }

  return sections;
}

/**
 * Applies text edits to a copy of `slots`, addressing each edit through the
 * flattened section it came from (so the editor never needs to know slot
 * names). Edits for unknown keys are ignored. Returns the new slots and the
 * keys whose narrated text (body) actually changed.
 */
export function applyCaseStudySectionEdits(
  slots: Record<string, unknown>,
  edits: CaseStudySectionEdit[]
): { slots: Record<string, unknown>; changedKeys: string[]; bodyChangedKeys: string[] } {
  const next = JSON.parse(JSON.stringify(slots)) as Record<string, unknown>;
  const byKey = new Map(flattenCaseStudySections(slots).map((section) => [section.key, section]));
  const changedKeys = new Set<string>();
  const bodyChangedKeys = new Set<string>();

  for (const edit of edits) {
    const section = byKey.get(edit.key);
    if (!section) continue;
    const container = next[section.slotId];
    const record =
      section.index === null
        ? asRecord(container)
        : Array.isArray(container)
          ? asRecord(container[section.index])
          : null;
    if (!record) continue;

    if (typeof edit.body === "string" && edit.body !== section.body) {
      record.body = edit.body;
      changedKeys.add(section.key);
      bodyChangedKeys.add(section.key);
    }
    if (typeof edit.title === "string" && section.titleField && edit.title !== section.title) {
      const current = typeof record[section.titleField] === "string" ? record[section.titleField] : null;
      const value = edit.title.trim() ? edit.title : null;
      if (value !== current) {
        record[section.titleField] = value;
        changedKeys.add(section.key);
      }
    }
  }

  return { slots: next, changedKeys: [...changedKeys], bodyChangedKeys: [...bodyChangedKeys] };
}
