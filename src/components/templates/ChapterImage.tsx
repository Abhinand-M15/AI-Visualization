/**
 * A chapter's 16:9 scene image, for the React templates. Each template passes the
 * className that fits its own avatar slot (sizing/rounding only; no text styles).
 */
export function ChapterImage({ src, className }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" className={className} />
  );
}
