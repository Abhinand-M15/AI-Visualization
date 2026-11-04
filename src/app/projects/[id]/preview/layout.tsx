import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Preview" };

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return children;
}
