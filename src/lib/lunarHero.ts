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

/** Phone layout: the copy column is the viewport minus the hero padding (2 x 16px)
 *  and the card copy padding (2 x 40px). */
const MOBILE_COPY_GUTTER_PX = 112;
/** Average advance of one character of the bold, tightly tracked title, in em
 *  (measured: "Implementation" is about 6.7 x the font size). Rounded up for safety. */
const TITLE_EM_PER_CHAR = 0.52;

/** The card's title is 4.5rem/5.5rem, sized for a one-word pair like "Lunar
 *  Gravity."; a full project title at that size overflows the card, so longer
 *  titles step down in size while keeping the same styling. On phones the size
 *  is also capped so the longest word fits the copy column (it never wraps
 *  mid-word at 375px, UI-03). */
export function lunarHeroTitleSize(title: string): { mobile: string; desktop: string } {
  const length = title.trim().length;
  const base =
    length <= 16
      ? { mobile: "4.5rem", desktop: "5.5rem" }
      : length <= 28
        ? { mobile: "3.25rem", desktop: "4rem" }
        : length <= 48
          ? { mobile: "2.5rem", desktop: "3rem" }
          : { mobile: "2rem", desktop: "2.5rem" };
  const longestWord = Math.max(4, ...title.trim().split(/\s+/).map((word) => word.length));
  const fit = `calc((100vw - ${MOBILE_COPY_GUTTER_PX}px) / ${(longestWord * TITLE_EM_PER_CHAR).toFixed(2)})`;
  return { mobile: `min(${base.mobile}, ${fit})`, desktop: base.desktop };
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
