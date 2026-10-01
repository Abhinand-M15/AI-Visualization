/**
 * Content for the Lunar theme's hero — the LunarGravityCard from the prompt
 * (components/ui/lunar-gravity-card.tsx), filled with the project's own title
 * and a one-line description instead of the card's demo copy. Shared by the
 * in-app preview and the published static site so both render the same text.
 */

/** Splits the title like the card's default ("Lunar" / "Gravity."): every
 *  word but the last in solid white, the last word in the gradient style. */
export function lunarHeroTitleParts(title: string): { lead: string; accent: string } {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return { lead: "", accent: words[0] ?? "" };
  return { lead: words.slice(0, -1).join(" "), accent: words[words.length - 1] };
}

/** The card's title is 4.5rem/5.5rem, sized for a one-word pair like "Lunar
 *  Gravity."; a full project title at that size overflows the card, so longer
 *  titles step down in size while keeping the same styling. */
export function lunarHeroTitleSize(title: string): { mobile: string; desktop: string } {
  const length = title.trim().length;
  if (length <= 16) return { mobile: "4.5rem", desktop: "5.5rem" };
  if (length <= 28) return { mobile: "3.25rem", desktop: "4rem" };
  if (length <= 48) return { mobile: "2.5rem", desktop: "3rem" };
  return { mobile: "2rem", desktop: "2.5rem" };
}

/** First sentence of the story's opening text, capped to roughly one line of
 *  the card's 340px description column. */
export function lunarHeroDescription(openingText: string | undefined): string {
  const text = (openingText ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const firstSentence = text.match(/^.+?[.!?](\s|$)/)?.[0].trim() ?? text;
  if (firstSentence.length <= 160) return firstSentence;
  const cut = firstSentence.slice(0, 157);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
