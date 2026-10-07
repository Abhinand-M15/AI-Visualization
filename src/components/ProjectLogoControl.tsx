"use client";

import { useRef, useState } from "react";
import {
  LOGO_ACCEPT,
  logoButtonClass,
  logoPathFromUrl,
  logoPublicUrl,
  removeLogoObject,
  uploadLogoFile,
  useLogoAvailable,
} from "@/components/LogoUpload";

/** Edit-page control to replace/remove the project's logo (PATCH /api/projects/[id] { logoPath }). Owned by stage S5b. */
export interface ProjectLogoControlProps {
  projectId: string;
  /** Current public logo URL, if any. */
  logoUrl?: string;
  /** Called after a successful change with the new public URL (undefined = removed). */
  onChanged(logoUrl: string | undefined): void;
}

async function patchLogo(projectId: string, logoPath: string | null): Promise<{ logoUrl?: string | null }> {
  let res: Response;
  try {
    res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoPath }),
    });
  } catch {
    throw new Error("Couldn't reach the server. Please try again.");
  }
  let data: Record<string, unknown> | null = null;
  try {
    data = await res.json();
  } catch {
    // body is optional
  }
  if (!res.ok) {
    const message = typeof data?.error === "string" ? data.error : null;
    throw new Error(message ?? (res.status === 404 || res.status === 405 ? "The logo can't be saved yet." : `Couldn't save the logo (HTTP ${res.status}).`));
  }
  const project = (data?.project ?? data) as { logoUrl?: unknown } | null;
  return { logoUrl: typeof project?.logoUrl === "string" ? project.logoUrl : project?.logoUrl === null ? null : undefined };
}

/** The project's logoUrl after a change: from the PATCH reply, else built from the path, else re-read. */
async function resolveLogoUrl(projectId: string, reply: string | null | undefined, path: string): Promise<string | undefined> {
  if (reply) return reply;
  const built = logoPublicUrl(path);
  if (built) return built;
  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
    if (res.ok) {
      const data = await res.json();
      const url = (data?.project ?? data)?.logoUrl;
      if (typeof url === "string" && url) return url;
    }
  } catch {
    // fall through
  }
  return undefined;
}

export default function ProjectLogoControl({ projectId, logoUrl, onChanged }: ProjectLogoControlProps) {
  const available = useLogoAvailable();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!available) return null;

  async function replace(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    let newPath: string | null = null;
    try {
      newPath = await uploadLogoFile(file, projectId);
      const reply = await patchLogo(projectId, newPath);
      const url = (await resolveLogoUrl(projectId, reply.logoUrl, newPath)) ?? URL.createObjectURL(file);
      const oldPath = logoUrl ? logoPathFromUrl(logoUrl) : null;
      onChanged(url);
      if (oldPath && oldPath !== newPath) void removeLogoObject(oldPath);
    } catch (e) {
      if (newPath) void removeLogoObject(newPath); // not saved on the project: don't leave an orphan
      setError(e instanceof Error ? e.message : "The logo can't be changed right now.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    setError(null);
    setBusy(true);
    try {
      await patchLogo(projectId, null);
      const oldPath = logoUrl ? logoPathFromUrl(logoUrl) : null;
      onChanged(undefined);
      if (oldPath) void removeLogoObject(oldPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The logo can't be removed right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="mb-3 text-lg font-medium text-neutral-700 dark:text-indigo-100">Company logo</p>
      <div className="flex flex-wrap items-center gap-4">
        {logoUrl && (
          <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 dark:border-white/10 dark:bg-white/90">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Company logo" className="max-h-full max-w-full object-contain" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={LOGO_ACCEPT}
          className="hidden"
          onChange={(e) => void replace(e.target.files?.[0])}
        />
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={logoButtonClass}>
          {busy ? "Working..." : logoUrl ? "Replace logo" : "Add logo"}
        </button>
        {logoUrl && !busy && (
          <button type="button" onClick={() => void remove()} className={logoButtonClass}>
            Remove
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-base text-red-600 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
