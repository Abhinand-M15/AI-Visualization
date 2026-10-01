import type { ReactNode } from "react";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";

/** Shared shell for /login, /signup, /forgot-password and /reset-password. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SpaceBackdrop />
      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 py-24 text-neutral-900 sm:px-6 dark:text-white">
        <div className="w-full max-w-md">
          <p className="mb-6 text-center text-sm font-medium tracking-wide text-neutral-500 dark:text-indigo-200/60">
            Story Site Generator
          </p>
          {children}
        </div>
      </main>
    </>
  );
}
