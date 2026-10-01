"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/projects";

interface KeyStatus {
  provider: string;
  hasKey: boolean;
  hint: string | null;
  updatedAt: string | null;
}

type Notice = { kind: "ok" | "error"; text: string } | null;

const buttonBase =
  "rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export function ApiKeysSection({ authEnabled, onboarding }: { authEnabled: boolean; onboarding: boolean }) {
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [loading, setLoading] = useState(authEnabled);
  const [keyInput, setKeyInput] = useState("");
  const [busy, setBusy] = useState<"save" | "test" | "delete" | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!authEnabled) return;
    fetch("/api/settings/keys", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load your keys.");
        setStatus((data.keys as KeyStatus[]).find((k) => k.provider === "gemini") ?? null);
      })
      .catch((error) =>
        setNotice({ kind: "error", text: error instanceof Error ? error.message : "Failed to load your keys." })
      )
      .finally(() => setLoading(false));
  }, [authEnabled]);

  async function handleSave() {
    setBusy("save");
    setNotice(null);
    try {
      const res = await fetch("/api/settings/keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "gemini", key: keyInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save the key.");
      setStatus(data.key as KeyStatus);
      setKeyInput("");
      setNotice({ kind: "ok", text: "Key saved." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Failed to save the key." });
    } finally {
      setBusy(null);
    }
  }

  async function handleTest() {
    setBusy("test");
    setNotice(null);
    try {
      const res = await fetch("/api/settings/keys/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // An unsaved key in the field is tested as typed; otherwise the saved one.
        body: JSON.stringify({ provider: "gemini", ...(keyInput.trim() ? { key: keyInput } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed.");
      setNotice({ kind: data.ok ? "ok" : "error", text: data.message });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Test failed." });
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete your saved Gemini key? You won't be able to generate stories until you add one again.")) {
      return;
    }
    setBusy("delete");
    setNotice(null);
    try {
      const res = await fetch("/api/settings/keys?provider=gemini", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete the key.");
      setStatus((current) => (current ? { ...current, hasKey: false, hint: null, updatedAt: null } : current));
      setNotice({ kind: "ok", text: "Key deleted." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Failed to delete the key." });
    } finally {
      setBusy(null);
    }
  }

  const hasKey = Boolean(status?.hasKey);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-white/[0.03] dark:backdrop-blur-sm">
      <div>
        <h2 className="text-lg font-semibold">API keys</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Your key is stored encrypted and is only ever shown as its last four characters.
        </p>
      </div>

      {!authEnabled ? (
        <p className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
          Accounts are turned off on this server, so stories use the server&apos;s own GEMINI_API_KEY and there&apos;s
          nothing to set here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label htmlFor="gemini-key" className="text-sm font-medium">
              Gemini API key
            </label>
            <span className="text-xs text-neutral-500">
              {loading
                ? "Loading…"
                : hasKey
                  ? `Saved key ${status?.hint ?? ""}${status?.updatedAt ? ` · last updated ${formatDate(status.updatedAt, true)}` : ""}`
                  : "No key saved yet"}
            </span>
          </div>
          <input
            id="gemini-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={keyInput}
            onChange={(event) => setKeyInput(event.target.value)}
            placeholder={hasKey ? "Paste a new key to replace the saved one" : "Paste your Gemini API key"}
            disabled={busy !== null}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm focus:border-violet-400 focus:outline-none dark:border-neutral-700 dark:bg-black/30"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy !== null || !keyInput.trim()}
              className={`${buttonBase} bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200`}
            >
              {busy === "save" ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={busy !== null || (!keyInput.trim() && !hasKey)}
              className={`${buttonBase} border border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-white/10`}
            >
              {busy === "test" ? "Testing…" : "Test"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy !== null || !hasKey}
              className={`${buttonBase} text-red-600 hover:bg-red-50 dark:hover:bg-red-950`}
            >
              {busy === "delete" ? "Deleting…" : "Delete"}
            </button>
          </div>
          {notice && (
            <p className={`text-sm ${notice.kind === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
              {notice.text}
            </p>
          )}
          {onboarding && hasKey && (
            <Link
              href="/new"
              className="self-start rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-neutral-950"
            >
              Create your first story
            </Link>
          )}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-violet-600 underline underline-offset-2 dark:text-violet-300"
        >
          Get a key
        </a>
        <p className="mt-1">1. Open Google AI Studio, sign in with a Google account and click &ldquo;Create API key&rdquo;.</p>
        <p>2. Copy the key, paste it above, click Save, then Test to check it works.</p>
      </div>
    </section>
  );
}
