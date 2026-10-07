import { STORY_LOGO_CSS } from "./storyMedia";

/**
 * The company logo, shared by every template. Fixed to the viewport (top-left by
 * default); position and size live in STORY_LOGO (storyMedia.ts) so they can be
 * moved in one place. Renders nothing without a logo.
 */
export function StoryLogo({ logoUrl }: { logoUrl?: string }) {
  if (!logoUrl) return null;
  return (
    <>
      <style>{STORY_LOGO_CSS}</style>
      <div className="story-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" />
      </div>
    </>
  );
}
