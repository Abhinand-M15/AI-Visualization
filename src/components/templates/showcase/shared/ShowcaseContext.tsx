"use client";

import { createContext, useContext } from "react";
import type { ShowcaseStory } from "@/lib/showcase";

/** Same shape the tile transition expects from a router. */
export interface ShowcaseRouter {
  /** `/` or `#/` goes to the home page; `#/chapter-N` opens a chapter. */
  push: (href: string, options?: { scroll?: boolean }) => void;
  prefetch: (href: string) => void;
}

export interface ShowcaseContextValue {
  story: ShowcaseStory;
  router: ShowcaseRouter;
}

const ShowcaseContext = createContext<ShowcaseContextValue | null>(null);

export const ShowcaseProvider = ShowcaseContext.Provider;

export function useShowcase(): ShowcaseContextValue {
  const value = useContext(ShowcaseContext);
  if (!value) throw new Error("useShowcase must be used inside the Showcase template.");
  return value;
}
