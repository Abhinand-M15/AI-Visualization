"use client";

import { useEffect, useRef, useState } from "react";
import {
  LOGO_BUCKET,
  LOGO_EXTENSIONS,
  MAX_LOGO_BYTES,
  validateLogoMeta,
  type LogoTicket,
} from "@/app/api/logos/shared";

/**
 * Company logo picker (preview, replace, remove). Owned by stage S5b.
 * Upload flow: POST /api/logos (signed target) -> PUT the file straight to
 * Supabase Storage -> POST /api/logos/sanitize (SVG cleaning / image check).
 * The component renders nothing while the logo feature isn't available
 * (bucket missing because migration 003 hasn't been applied).
 */
export interface LogoUploadProps {
  /** Storage path in the company-logos bucket (null = no logo). */
  value: string | null;
  onChange(path: string | null): void;
}

export const LOGO_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg";

/** Public URL of a logo path, or null when NEXT_PUBLIC_SUPABASE_URL isn't available to the browser. */
export function logoPublicUrl(path: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/${LOGO_BUCKET}/${encoded}`;
}

/** Storage path of a public company-logos URL, or null if it isn't one. */
export function logoPathFromUrl(url: string): string | null {
  const marker = `/${LOGO_BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return null;
  try {
    return decodeURIComponent(url.slice(at + marker.length).split(/[?#]/)[0]);
  } catch {
    return null;
  }
}

let availability: Promise<boolean> | null = null;

/** Asks the server whether logo uploads can work (cached for the page's lifetime). */
export function checkLogoAvailable(): Promise<boolean> {
  if (!availability) {
    availability = fetch("/api/logos")
      .then((res) => (res.ok ? res.json() : { available: false }))
      .then((data: { available?: boolean }) => data.available === true)
      .catch(() => false);
  }
  return availability;
}

export function useLogoAvailable(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    void checkLogoAvailable().then((ok) => {
      if (alive) setAvailable(ok);
    });
    return () => {
      alive = false;
    };
  }, []);
  return available;
}

/** Friendly client-side check; returns a message or null. */
export function checkLogoFile(file: File): string | null {
  const invalid = validateLogoMeta(file.name, file.type, file.size);
  if (!invalid) return null;
  if (file.size > MAX_LOGO_BYTES) return "That logo is larger than 2 MB. Please choose a smaller file.";
  if (/does not match/.test(invalid.error)) return "That file doesn't look like a PNG, JPG, WebP or SVG image.";
  if (/Unsupported/.test(invalid.error)) return `Please choose a ${LOGO_EXTENSIONS.join(", ").replace(/\./g, "").toUpperCase()} file.`;
  return invalid.error;
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === "string" && data.error) return data.error;
  } catch {
    // keep the fallback
  }
  return fallback;
}

/**
 * Uploads one logo file and returns its verified storage path. Throws an Error
 * with a user-facing message. `projectId` is only used for the activity log.
 */
export async function uploadLogoFile(file: File, projectId?: string): Promise<string> {
  const problem = checkLogoFile(file);
  if (problem) throw new Error(problem);

  const ticketRes = await fetch("/api/logos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }),
  });
  if (!ticketRes.ok) throw new Error(await readError(ticketRes, "The logo can't be uploaded right now."));
  const ticket = (await ticketRes.json()) as LogoTicket;
  if (!ticket.path || !ticket.signedUrl) throw new Error("The logo can't be uploaded right now.");

  // Same request shape as supabase-js uploadToSignedUrl(): the token in the URL authorises it.
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", new Blob([file], { type: ticket.contentType }));
  const upload = await fetch(ticket.signedUrl, { method: "PUT", body });
  if (!upload.ok) {
    let message = `Upload failed (HTTP ${upload.status}).`;
    try {
      const data = await upload.json();
      if (data?.message || data?.error) message = `Upload failed: ${data.message || data.error}`;
    } catch {
      // keep the generic message
    }
    throw new Error(message);
  }

  const verify = await fetch("/api/logos/sanitize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: ticket.path, projectId }),
  });
  if (!verify.ok) throw new Error(await readError(verify, "The logo could not be verified."));
  return ticket.path;
}

/** Best-effort removal of an unused logo object (the server refuses if another project uses it). */
export async function removeLogoObject(path: string): Promise<void> {
  try {
    await fetch("/api/logos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
  } catch {
    // leaving an orphan object is harmless
  }
}

export const logoButtonClass =
  "rounded-full border border-neutral-200 bg-neutral-50 px-5 py-2.5 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10";

export default function LogoUpload({ value, onChange }: LogoUploadProps) {
  const available = useLogoAvailable();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    },
    [localPreview]
  );

  if (!available) return null;

  const remotePreview = value ? logoPublicUrl(value) : null;
  const preview = remotePreview ?? (value ? localPreview : null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const problem = checkLogoFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    try {
      const path = await uploadLogoFile(file);
      const previous = value;
      setLocalPreview(URL.createObjectURL(file));
      onChange(path);
      if (previous && previous !== path) void removeLogoObject(previous);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The logo can't be uploaded right now.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    const previous = value;
    setError(null);
    setLocalPreview(null);
    onChange(null);
    if (previous) void removeLogoObject(previous);
  }

  return (
    <div>
      <label className="mb-3 block text-lg font-medium text-neutral-700 dark:text-indigo-100">
        Company logo (optional)
      </label>
      <div className="flex flex-wrap items-center gap-4">
        {value && (
          <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 dark:border-white/10 dark:bg-white/90">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Company logo preview" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-center text-sm text-neutral-500">Logo uploaded</span>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={LOGO_ACCEPT}
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={logoButtonClass}>
          {busy ? "Uploading..." : value ? "Replace" : "Choose logo"}
        </button>
        {value && !busy && (
          <button type="button" onClick={handleRemove} className={logoButtonClass}>
            Remove
          </button>
        )}
      </div>
      <p className="mt-3 text-base text-neutral-500 dark:text-indigo-200/50">
        PNG, JPG, WebP or SVG, up to 2 MB. Shown on your published story.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-base text-red-600 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
