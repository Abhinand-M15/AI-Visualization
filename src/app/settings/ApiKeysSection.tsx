"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { formatDate } from "@/lib/projects";
import { Button, buttonClass, cardClass, fieldClass } from "@/components/ui/button";
import { errorMessage, requestJson } from "@/components/apiError";

interface KeyStatus {
  provider: string;
  hasKey: boolean;
  hint: string | null;
  updatedAt: string | null;
}

type Notice = { kind: "ok" | "error"; text: string } | null;
type ProviderId = "gemini" | "openai";

const OK_TEXT = "text-emerald-800 dark:text-emerald-300";
const ERROR_TEXT = "text-red-700 dark:text-red-300";

const PROVIDERS: Record<ProviderId, { label: string; keyUrl: string; steps: [string, string]; deleteWarning: string }> = {
  gemini: {
    label: "Gemini",
    keyUrl: "https://aistudio.google.com/apikey",
    steps: [
      "1. Open Google AI Studio, sign in with a Google account and click “Create API key”.",
      "2. Copy the key, paste it above and click Save. It is tested straight away.",
    ],
    deleteWarning: "Delete your saved Gemini key? You won't be able to generate stories until you add one again.",
  },
  openai: {
    label: "OpenAI",
    keyUrl: "https://platform.openai.com/api-keys",
    steps: [
      "1. Open the OpenAI platform, sign in and click “Create new secret key”.",
      "2. Copy the key (it is only shown once), paste it above and click Save. It is tested straight away.",
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

  /** Tests the saved key (or `typed`, when given) and shows the result. */
  async function runTest(typed?: string): Promise<void> {
    const data = await requestJson<{ ok: boolean; message: string }>(
      "/api/settings/keys/test",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, ...(typed?.trim() ? { key: typed } : {}) }),
      },
      "The key couldn't be tested."
    );
    setNotice({ kind: data.ok ? "ok" : "error", text: data.message });
  }

  /** Save, then test the saved key straight away so a typo shows up now, not at generation time (UX-22). */
  async function handleSave(event?: FormEvent) {
    event?.preventDefault();
    if (!keyInput.trim() || busy) return;
    setBusy("save");
    setNotice(null);
    try {
      const data = await requestJson<{ key: KeyStatus }>(
        "/api/settings/keys",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, key: keyInput }),
        },
        "The key couldn't be saved."
      );
      onStatus(() => data.key);
      setKeyInput("");
      setNotice({ kind: "ok", text: "Key saved. Testing it…" });
      setBusy("test");
      try {
        await runTest();
      } catch (error) {
        setNotice({ kind: "error", text: `Key saved, but the test couldn't run: ${errorMessage(error, "try Test again.")}` });
      }
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error, "The key couldn't be saved.") });
    } finally {
      setBusy(null);
    }
  }

  async function handleTest() {
    setBusy("test");
    setNotice(null);
    try {
      // An unsaved key in the field is tested as typed; otherwise the saved one.
      await runTest(keyInput);
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error, "The key couldn't be tested.") });
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm(meta.deleteWarning)) return;
    setBusy("delete");
    setNotice(null);
    try {
      await requestJson(`/api/settings/keys?provider=${provider}`, { method: "DELETE" }, "The key couldn't be deleted.");
      onStatus((current) => (current ? { ...current, hasKey: false, hint: null, updatedAt: null } : current));
      setNotice({ kind: "ok", text: "Key deleted." });
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error, "The key couldn't be deleted.") });
    } finally {
      setBusy(null);
    }
  }

  const hasKey = Boolean(status?.hasKey);

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3" aria-labelledby={`${inputId}-label`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label id={`${inputId}-label`} htmlFor={inputId} className="text-sm font-semibold">
          {meta.label} API key
        </label>
        <span className="text-xs text-muted-foreground">
          {loading
            ? "Loading…"
            : hasKey
              ? `Saved key ${status?.hint ?? ""}${status?.updatedAt ? ` · last updated ${formatDate(status.updatedAt, true)}` : ""}`
              : "No key saved yet"}
        </span>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input
        id={inputId}
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={keyInput}
        onChange={(event) => setKeyInput(event.target.value)}
        placeholder={hasKey ? "Paste a new key to replace the saved one" : `Paste your ${meta.label} API key`}
        disabled={busy !== null}
        className={`${fieldClass} font-mono`}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={busy !== null || !keyInput.trim()}>
          {busy === "save" ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" onClick={handleTest} disabled={busy !== null || (!keyInput.trim() && !hasKey)}>
          {busy === "test" ? "Testing…" : "Test"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={busy !== null || !hasKey}
          className="text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          {busy === "delete" ? "Deleting…" : "Delete"}
        </Button>
      </div>
      {notice && (
        <p role={notice.kind === "error" ? "alert" : "status"} className={`text-sm ${notice.kind === "ok" ? OK_TEXT : ERROR_TEXT}`}>
          {notice.text}
        </p>
      )}
      {showOnboardingLink && hasKey && (
        <Link href="/new" className={buttonClass("primary", "md", "self-start")}>
          Create your first story
        </Link>
      )}
      <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-700 dark:border-white/15 dark:text-indigo-100">
        <a
          href={meta.keyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded font-medium text-violet-700 underline underline-offset-2 dark:text-violet-300"
        >
          Get a key<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <p className="mt-1">{meta.steps[0]}</p>
        <p>{meta.steps[1]}</p>
      </div>
    </form>
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
      await requestJson(
        "/api/settings/image-provider",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: next }),
        },
        "Your choice couldn't be saved."
      );
      setNotice({ kind: "ok", text: "Image provider saved." });
    } catch (error) {
      setProvider(previous);
      setNotice({ kind: "error", text: errorMessage(error, "Your choice couldn't be saved.") });
    } finally {
      setBusy(false);
    }
  }

  const options: { id: ProviderId; title: string; note: string }[] = [
    {
      id: "gemini",
      title: "Gemini",
      note: "Uses the Gemini key above. Image generation needs a Gemini key with billing turned on; free keys can only write text.",
    },
    {
      id: "openai",
      title: "OpenAI",
      note: "Needs your own OpenAI key below. OpenAI bills image generation to your OpenAI account, usually at a higher price per image.",
    },
  ];

  return (
    <fieldset
      className="flex flex-col gap-3 border-t border-neutral-200 pt-4 dark:border-white/10"
      disabled={!loaded || busy}
    >
      <legend className="text-sm font-semibold">Image provider</legend>
      <p className="text-sm text-muted-foreground">Which service draws the avatars and scene images for your stories.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm ${
              provider === option.id
                ? "border-violet-500 bg-violet-50 dark:border-violet-400/70 dark:bg-violet-500/15"
                : "border-neutral-300 dark:border-white/15"
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              <input
                type="radio"
                name="image-provider"
                value={option.id}
                checked={provider === option.id}
                onChange={() => choose(option.id)}
                className="accent-violet-600"
              />
              {option.title}
            </span>
            <span className="text-xs text-muted-foreground">{option.note}</span>
          </label>
        ))}
      </div>
      {provider === "openai" && !openAiReady && (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          OpenAI is selected but no OpenAI key is saved yet. Add one below, or images will not be generated.
        </p>
      )}
      {notice && (
        <p role={notice.kind === "error" ? "alert" : "status"} className={`text-sm ${notice.kind === "ok" ? OK_TEXT : ERROR_TEXT}`}>
          {notice.text}
        </p>
      )}
    </fieldset>
  );
}

export function ApiKeysSection({
  authEnabled,
  onboarding,
  sharedImages = false,
}: {
  authEnabled: boolean;
  onboarding: boolean;
  /** The server's shared free image service is set up: no image choice to make (UX-15). */
  sharedImages?: boolean;
}) {
  const [statuses, setStatuses] = useState<Record<ProviderId, KeyStatus | null>>({ gemini: null, openai: null });
  const [loading, setLoading] = useState(authEnabled);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!authEnabled) return;
    requestJson<{ keys: KeyStatus[] }>("/api/settings/keys", { cache: "no-store" }, "Your keys couldn't be loaded.")
      .then((data) => {
        const keys = data.keys;
        setStatuses({
          gemini: keys.find((k) => k.provider === "gemini") ?? null,
          openai: keys.find((k) => k.provider === "openai") ?? null,
        });
      })
      .catch((error) => setLoadError(errorMessage(error, "Your keys couldn't be loaded. Reload the page to try again.")))
      .finally(() => setLoading(false));
  }, [authEnabled]);

  function updater(provider: ProviderId) {
    return (update: (current: KeyStatus | null) => KeyStatus | null) =>
      setStatuses((current) => ({ ...current, [provider]: update(current[provider]) }));
  }

  return (
    <section aria-labelledby="api-keys-heading" className={`${cardClass} flex flex-col gap-5 p-5 sm:p-6`}>
      <div>
        <h2 id="api-keys-heading" className="text-section font-semibold">
          API keys
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your keys are stored encrypted and are only ever shown as their last four characters.
        </p>
      </div>

      {!authEnabled ? (
        <p className="rounded-xl bg-neutral-100 p-4 text-sm text-neutral-700 dark:bg-white/5 dark:text-indigo-100">
          Accounts are turned off on this server, so stories use the server&apos;s own Gemini key and there&apos;s
          nothing to set here.
        </p>
      ) : (
        <>
          {loadError && (
            <p role="alert" className={`text-sm ${ERROR_TEXT}`}>
              {loadError}
            </p>
          )}
          <ProviderKeyField
            provider="gemini"
            status={statuses.gemini}
            loading={loading}
            onStatus={updater("gemini")}
            showOnboardingLink={onboarding}
            hint="Required. Stories are written with this key."
          />
          {sharedImages ? (
            <p className="border-t border-neutral-200 pt-4 text-sm text-neutral-700 dark:border-white/10 dark:text-indigo-100">
              <span className="font-semibold">Images:</span> avatars and scene images are made with the app&apos;s shared
              free image service, so there is no image key to add.
            </p>
          ) : (
            <>
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
        </>
      )}
    </section>
  );
}
