import { createRoot } from "react-dom/client";
import type { ShowcaseStory } from "@/lib/showcase";
import { ShowcaseApp } from "./ShowcaseApp";

/**
 * Entry point of the published site's prebuilt script (public/themes/showcase/
 * showcase.js, built by `npm run build:showcase`). The static page embeds the
 * story as JSON in #showcase-data and mounts the template into #showcase-root.
 */
const dataEl = document.getElementById("showcase-data");
const rootEl = document.getElementById("showcase-root");
if (dataEl && rootEl) {
  const story = JSON.parse(dataEl.textContent ?? "{}") as ShowcaseStory;
  createRoot(rootEl).render(<ShowcaseApp story={story} />);
}
