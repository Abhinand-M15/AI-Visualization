export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "editorial",
    name: "Editorial",
    description: "Pinned avatar beside scrolling narration, one section per chunk. Calm and restrained, MERSI/Inversa-style.",
  },
  {
    id: "clarity",
    name: "Clarity",
    description: "Clean stacked cards, generous whitespace, subtle reveal on scroll. Stripe/Linear-style.",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Full-screen section per chunk with scroll-snap and a color shift each chunk. Big, immersive, one chunk at a time.",
  },
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
];

export function getTemplateById(id: string): TemplateInfo | undefined {
  return TEMPLATES.find((template) => template.id === id);
}
