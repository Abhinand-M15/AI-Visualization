/**
 * Shared, framework-free pieces for the two things every template can show next
 * to the story: the company logo and a chapter's scene image. The React
 * previews (StoryLogo.tsx, the templates) and the static HTML generators in
 * src/lib/publish/* all take their markup and CSS from here, so there is one
 * place to change.
 *
 * MOVING THE LOGO: edit STORY_LOGO only (position, size, plate). The owner will
 * specify the final position later.
 */

/** Position, size and look of the company logo. The only thing to edit to move it. */
export const STORY_LOGO = {
  /** CSS offsets of the fixed logo box; unset sides are omitted. Default: top-left. */
  position: { top: "16px", left: "16px" } as Partial<Record<"top" | "left" | "right" | "bottom", string>>,
  maxHeight: "44px",
  maxWidth: "160px",
  /** Below the narration dock (40) and the sound gate (50). */
  zIndex: 30,
  /** Light plate so any logo stays readable on dark and light templates. */
  plate: "rgba(255,255,255,.9)",
  padding: "6px 10px",
  radius: "10px",
};

const positionCss = Object.entries(STORY_LOGO.position)
  .map(([side, value]) => `${side}:${value};`)
  .join("");

export const STORY_LOGO_CSS =
  `.story-logo{position:fixed;${positionCss}z-index:${STORY_LOGO.zIndex};display:flex;align-items:center;` +
  `padding:${STORY_LOGO.padding};border-radius:${STORY_LOGO.radius};background:${STORY_LOGO.plate};` +
  `box-shadow:0 2px 10px rgba(0,0,0,.18);pointer-events:none;}` +
  `.story-logo img{display:block;max-height:${STORY_LOGO.maxHeight};max-width:${STORY_LOGO.maxWidth};width:auto;height:auto;object-fit:contain;}`;

function escapeAttr(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Logo markup for the static sites. `logoUrl` is a bundle-relative path or an absolute URL. */
export function storyLogoHtml(logoUrl: string): string {
  return `<div class="story-logo"><img src="${escapeAttr(logoUrl)}" alt="" /></div>`;
}

/**
 * Adds the logo to a finished static page: its CSS before </head> and its markup
 * right after <body>. Returns the page untouched when there is no logo.
 */
export function injectStoryLogo(html: string, logoUrl: string | undefined): string {
  if (!logoUrl) return html;
  const withCss = html.includes("</head>") ? html.replace("</head>", () => `<style>${STORY_LOGO_CSS}</style>\n</head>`) : html;
  return withCss.replace(/<body[^>]*>/, (open) => `${open}\n${storyLogoHtml(logoUrl)}`);
}

/** Scene images are 16:9 cartoon pictures; the shared chapter layout (src/lib/chapterLayout.ts) frames them, this just makes the <img> fill its frame. */
export const CHAPTER_IMAGE_CSS = `.chapter-img{display:block;width:100%;height:100%;object-fit:cover;}`;

/** Static-site markup of a chapter's scene image. */
export function chapterImageHtml(imageUrl: string, className = "chapter-img"): string {
  return `<img class="${className}" src="${escapeAttr(imageUrl)}" alt="" loading="lazy" decoding="async" />`;
}
