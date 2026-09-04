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
];

export function getTemplateById(id: string): TemplateInfo | undefined {
  return TEMPLATES.find((template) => template.id === id);
}
