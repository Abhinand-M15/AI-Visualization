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
type ProviderId = "gemini" | "openai";

const buttonBase =
  "rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const PROVIDERS: Record<ProviderId, { label: string; keyUrl: string; steps: [string, string]; deleteWarning: string }> = {
  gemini: {
    label: "Gemini",
    keyUrl: "https://aistudio.google.com/apikey",
    steps: [
      "1. Open Google AI Studio, sign in with a Google account and click “Create API key”.",
      "2. Copy the key, paste it above, click Save, then Test to check it works.",
    ],
    deleteWarning: "Delete your saved Gemini key? You won't be able to generate stories until you add one again.",
  },
  openai: {
    label: "OpenAI",
    keyUrl: "https://platform.openai.com/api-keys",
    steps: [
      "1. Open the OpenAI platform, sign in and click “Create new secret key”.",
      "2. Copy the key (it is only shown once), paste it above, click Save, then Test.",
    ],
    deleteWarning: "Delete your saved OpenAI key? Images can't be generated with OpenAI until you add one again.",
  },
};

function ProviderKeyField({
  provider,
  status,
  loading,
  onStatus,
  showOnboardingLink,
  hint,
}: {
  provider: ProviderId;
  status: KeyStatus | null;
  loading: boolean;
  onStatus: (update: (current: KeyStatus | null) => KeyStatus | null) => void;
  showOnboardingLink?: boolean;
  hint?: string;
}) {
  const meta = PROVIDERS[provider];
  const [keyInput, setKeyInput] = useState("");
  const [busy, setBusy] = useState<"save" | "test" | "delete" | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const inputId = `${provider}-key`;

  async function handleSave() {
    setBusy("save");
    setNotice(null);
    try {
      const res = await fetch("/api/settings/keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key: keyInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save the key.");
      onStatus(() => data.key as KeyStatus);
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
        body: JSON.stringify({ provider, ...(keyInput.trim() ? { key: keyInput } : {}) }),
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
    if (!window.confirm(meta.deleteWarning)) return;
    setBusy("delete");
    setNotice(null);
    try {
      const res = await fetch(`/api/settings/keys?provider=${provider}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete the key.");
      onStatus((current) => (current ? { ...current, hasKey: false, hint: null, updatedAt: null } : current));
      setNotice({ kind: "ok", text: "Key deleted." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Failed to delete the key." });
    } finally {
      setBusy(null);
    }
  }

  const hasKey = Boolean(status?.hasKey);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium">
          {meta.label} API key
        </label>
        <span className="text-xs text-neutral-500">
          {loading
            ? "Loading…"
            : hasKey
              ? `Saved key ${status?.hint ?? ""}${status?.updatedAt ? ` · last updated ${formatDate(status.updatedAt, true)}` : ""}`
              : "No key saved yet"}
        </span>
      </div>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      <input
        id={inputId}
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={keyInput}
        onChange={(event) => setKeyInput(event.target.value)}
        placeholder={hasKey ? "Paste a new key to replace the saved one" : `Paste your ${meta.label} API key`}
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
      {showOnboardingLink && hasKey && (
        <Link
          href="/new"
          className="self-start rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-neutral-950"
        >
          Create your first story
        </Link>
      )}
      <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
        <a
          href={meta.keyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-violet-600 underline underline-offset-2 dark:text-violet-300"
        >
          Get a key
        </a>
        <p className="mt-1">{meta.steps[0]}</p>
        <p>{meta.steps[1]}</p>
      </div>
    </div>
  );
}

function ImageProviderChoice({ openAiReady }: { openAiReady: boolean }) {
  const [provider, setProvider] = useState<ProviderId>("gemini");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    fetch("/api/settings/image-provider", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load the image provider.");
        if (data.provider === "openai" || data.provider === "gemini") setProvider(data.provider);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function choose(next: ProviderId) {
    if (next === provider || busy) return;
    const previous = provider;
    setProvider(next);
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/settings/image-provider", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save your choice.");
      setNotice({ kind: "ok", text: "Image provider saved." });
    } catch (error) {
      setProvider(previous);
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Failed to save your choice." });
    } finally {
      setBusy(false);
    }
  }

  const options: { id: ProviderId; title: string; note: string }[] = [
    { id: "gemini", title: "Gemini", note: "Uses the Gemini key above. Nothing extra to set up." },
    {
      id: "openai",
      title: "OpenAI",
      note: "Needs your own OpenAI key below. OpenAI bills image generation to your OpenAI account, usually at a higher price per image.",
    },
  ];

  return (
    <fieldset
      className="flex flex-col gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800"
      disabled={!loaded || busy}
    >
      <legend className="text-sm font-medium">Image provider</legend>
      <p className="text-sm text-neutral-500">Which service draws the avatars and chapter images for your stories.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm ${
              provider === option.id
                ? "border-violet-400 bg-violet-50 dark:border-violet-400/50 dark:bg-violet-500/10"
                : "border-neutral-200 dark:border-neutral-700"
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              <input
                type="radio"
                name="image-provider"
                value={option.id}
                checked={provider === option.id}
                onChange={() => choose(option.id)}
              />
              {option.title}
            </span>
            <span className="text-xs text-neutral-500">{option.note}</span>
          </label>
        ))}
      </div>
      {provider === "openai" && !openAiReady && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          OpenAI is selected but no OpenAI key is saved yet. Add one below, or images will not be generated.
        </p>
      )}
      {notice && (
        <p className={`text-sm ${notice.kind === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
          {notice.text}
        </p>
      )}
    </fieldset>
  );
}

export function ApiKeysSection({ authEnabled, onboarding }: { authEnabled: boolean; onboarding: boolean }) {
  const [statuses, setStatuses] = useState<Record<ProviderId, KeyStatus | null>>({ gemini: null, openai: null });
  const [loading, setLoading] = useState(authEnabled);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!authEnabled) return;
    fetch("/api/settings/keys", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load your keys.");
        const keys = data.keys as KeyStatus[];
        setStatuses({
          gemini: keys.find((k) => k.provider === "gemini") ?? null,
          openai: keys.find((k) => k.provider === "openai") ?? null,
        });
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Failed to load your keys."))
      .finally(() => setLoading(false));
  }, [authEnabled]);

  function updater(provider: ProviderId) {
    return (update: (current: KeyStatus | null) => KeyStatus | null) =>
      setStatuses((current) => ({ ...current, [provider]: update(current[provider]) }));
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-white/[0.03] dark:backdrop-blur-sm">
      <div>
        <h2 className="text-lg font-semibold">API keys</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Your keys are stored encrypted and are only ever shown as their last four characters.
        </p>
      </div>

      {!authEnabled ? (
        <p className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
          Accounts are turned off on this server, so stories use the server&apos;s own GEMINI_API_KEY and there&apos;s
          nothing to set here.
        </p>
      ) : (
        <>
          {loadError && <p className="text-sm text-red-600">{loadError}</p>}
          <ProviderKeyField
            provider="gemini"
            status={statuses.gemini}
            loading={loading}
            onStatus={updater("gemini")}
            showOnboardingLink={onboarding}
            hint="Required. Stories are written with this key."
          />
          <ImageProviderChoice openAiReady={Boolean(statuses.openai?.hasKey)} />
          <ProviderKeyField
            provider="openai"
            status={statuses.openai}
            loading={loading}
            onStatus={updater("openai")}
            hint="Optional. Only needed if you choose OpenAI for images."
          />
        </>
      )}
    </section>
  );
}
