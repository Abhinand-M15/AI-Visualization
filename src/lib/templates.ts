export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  /** Set to false to hide the template everywhere (picker, preview, publish) without deleting it. Default true. */
  enabled?: boolean;
}

/**
 * THE TEMPLATE REGISTRY: the single source of truth for which templates exist.
 * Hide one with `enabled: false` (or the DISABLED_TEMPLATES env var); delete one
 * by removing its entry here plus the files listed in docs/REMOVING_TEMPLATES.md.
 */
export const TEMPLATES: TemplateInfo[] = [
  {
    id: "space",
    name: "Space",
    description: "A living particle field drifts behind every section, reacting to the cursor with a magnetic swirl. Dark, atmospheric, glass-panel copy.",
  },
  {
    id: "lunar",
    name: "Lunar",
    description: "A real 3D moon orbited by a drifting asteroid belt sits behind every section. Cinematic, slow-turning, cool blue-cyan glass-panel copy.",
  },
  {
    id: "airlock",
    name: "Airlock",
    description: "Opens with a scroll-locked video hero — scrolling scrubs the footage forward and back until it finishes, then hands off into the narrated story below.",
  },
  {
    id: "voyage",
    name: "Voyage",
    description: "Pick a chapter from a wheel of planets, then scroll through it: layered parallax skies, a giant title, your avatar and two glass cards. Scroll past the end to fly to the next chapter.",
  },
  {
    id: "showcase",
    name: "Showcase",
    description: "A scroll-driven 3D portfolio: a hero of floating crosses, a morphing story card and a grid of chapter tiles that open into their own pages. Light, crisp, smooth-scrolled.",
  },
];

/** Ids switched off through DISABLED_TEMPLATES (comma-separated, optional). Read per call, so a restart is all it takes. */
function envDisabledIds(): Set<string> {
  const raw = typeof process !== "undefined" ? process.env?.DISABLED_TEMPLATES : undefined;
  return new Set(
    (raw ?? "")
      .split(",")
      .map((id) => id.trim().toLowerCase())
      .filter(Boolean)
  );
}

/** True when the id is in the registry, not `enabled: false` and not listed in DISABLED_TEMPLATES. */
export function isTemplateAvailable(id: string | null | undefined): boolean {
  if (!id) return false;
  const template = TEMPLATES.find((candidate) => candidate.id === id);
  if (!template || template.enabled === false) return false;
  return !envDisabledIds().has(id.toLowerCase());
}

/** The templates a user can pick or publish with, in registry order. */
export function listTemplates(): TemplateInfo[] {
  return TEMPLATES.filter((template) => isTemplateAvailable(template.id));
}

/** Registry lookup that ignores availability (names and descriptions). */
export function getTemplateById(id: string): TemplateInfo | undefined {
  return TEMPLATES.find((template) => template.id === id);
}

export const TEMPLATE_UNAVAILABLE_MESSAGE = "That template is no longer available. Pick another template.";
export const TEMPLATE_UNAVAILABLE_NOTICE = "Template no longer available: choose another";
