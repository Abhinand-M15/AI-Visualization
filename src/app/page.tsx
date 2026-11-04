import type { Metadata } from "next";
import { LibraryPage } from "@/components/LibraryPage";
import { requireGeminiKeyOrOnboard } from "@/app/settings/keyGate";

export const metadata: Metadata = { title: "My stories" };

/** The library. The first-run key check runs here on the server, before anything renders (UX-26). */
export default async function HomePage() {
  await requireGeminiKeyOrOnboard();
  return <LibraryPage />;
}
