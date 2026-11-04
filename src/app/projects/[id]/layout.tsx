import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Edit story" };

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return children;
}
