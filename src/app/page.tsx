"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";
import { PublishDialog } from "@/components/PublishDialog";
import { PublishStateBadge } from "@/components/PublishStateBadge";
import { formatDate, type ProjectSummary } from "@/lib/projects";
import { TEMPLATE_UNAVAILABLE_NOTICE, getTemplateById } from "@/lib/templates";
import { useAvailableTemplates } from "@/lib/useAvailableTemplates";
import { documentTypeLabel, type Project } from "@/lib/types";
import {
  PUBLISH_STATES,
  getPublishState,
  plural,
  summarizeNarration,
  type PublishStateKey,
} from "@/lib/contentVersion";
import { useApiKeyGate } from "@/app/settings/useApiKeyGate";

type SortKey = "updated" | "created" | "title";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "updated", label: "Last updated" },
  { key: "created", label: "Date created" },
  { key: "title", label: "Title (A-Z)" },
];

/** Template shown in the library: a case study without a template renders its own layout. */
function templateLabel(project: ProjectSummary): string {
  const template = project.selectedTemplateId ? getTemplateById(project.selectedTemplateId) : undefined;
  if (template) return template.name;
  if (project.selectedTemplateId) return project.selectedTemplateId;
  return project.documentType === "case-study" ? "Case study layout" : "No template yet";
}

const secondaryButton =
  "inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100 dark:hover:bg-white/10";

export default function HomePage() {
  useApiKeyGate();
  const searchId = useId();
  const statusId = useId();
  const sortId = useId();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PublishStateKey | "all">("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [publishingProjectId, setPublishingProjectId] = useState<string | null>(null);
  const { isAvailable: isTemplateAvailable } = useAvailableTemplates();

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProjects(data.projects);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load your case studies."));
  }, []);

  const rows = useMemo(() => {
    if (!projects) return [];
    const needle = query.trim().toLowerCase();
    const withState = projects.map((project) => ({ project, state: getPublishState(project) }));
    const filtered = withState.filter(
      ({ project, state }) =>
        (!needle || project.title.toLowerCase().includes(needle)) && (statusFilter === "all" || state === statusFilter)
    );
    const time = (value?: string) => (value ? Date.parse(value) || 0 : 0);
    return filtered.sort((a, b) => {
      if (sort === "title") return a.project.title.localeCompare(b.project.title, undefined, { sensitivity: "base" });
      if (sort === "created") return time(b.project.createdAt) - time(a.project.createdAt);
      return (
        time(b.project.updatedAt ?? b.project.createdAt) - time(a.project.updatedAt ?? a.project.createdAt)
      );
    });
  }, [projects, query, statusFilter, sort]);

  const publishingProject = projects?.find((project) => project.id === publishingProjectId) ?? null;

  async function handleDelete(project: ProjectSummary) {
    setDeleteError(null);
    setDeletingId(project.id);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      setProjects((current) => current?.filter((p) => p.id !== project.id) ?? current);
      setConfirmDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopy(project: ProjectSummary) {
    if (!project.publishedUrl) return;
    try {
      await navigator.clipboard.writeText(project.publishedUrl);
      setCopiedId(project.id);
      window.setTimeout(() => setCopiedId((current) => (current === project.id ? null : current)), 2000);
    } catch {
      setDeleteError("Couldn't copy automatically. Open the site and copy the address from the browser.");
    }
  }

  // Fresher project from the publish dialog (narration generated, published).
  function applyProjectUpdate(next: Project) {
    setProjects(
      (current) =>
        current?.map((project) =>
          project.id === next.id
            ? {
                ...project,
                ...next,
                updatedAt: new Date().toISOString(),
                publishedAt: next.publication?.publishedAt ?? project.publishedAt,
              }
            : project
        ) ?? current
    );
  }

  const hasFilters = query.trim() !== "" || statusFilter !== "all";

  return (
    <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-16 pt-20 sm:px-6">
      <SpaceBackdrop />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">My case studies</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-indigo-200/60">
            Everything you&apos;ve built. Edit a story, then publish the update to its live site.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/settings"
            className="rounded-full px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/10"
          >
            Settings
          </Link>
          <Link
            href="/new"
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            New story
          </Link>
        </div>
      </header>

      {projects !== null && projects.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-sm sm:flex-row sm:items-center">
          <label htmlFor={searchId} className="sr-only">
            Search by title
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title"
            className="min-w-0 flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-indigo-200/30 dark:focus:border-violet-400/60"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <label htmlFor={statusId} className="sr-only">
              Filter by status
            </label>
            <select
              id={statusId}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as PublishStateKey | "all")}
              className="min-w-0 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white"
            >
              <option value="all">All statuses</option>
              {PUBLISH_STATES.map((state) => (
                <option key={state.key} value={state.key}>
                  {state.label}
                </option>
              ))}
            </select>
            <label htmlFor={sortId} className="sr-only">
              Sort by
            </label>
            <select
              id={sortId}
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="min-w-0 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-3" aria-live="polite">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {deleteError && <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>}
        {!error && projects === null && (
          <p className="text-sm text-neutral-500 dark:text-indigo-200/60">Loading your case studies…</p>
        )}

        {projects !== null && projects.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-white/15 dark:bg-white/[0.03] dark:backdrop-blur-sm">
            <p className="text-base font-medium">No case studies yet</p>
            <p className="max-w-sm text-sm text-neutral-500 dark:text-indigo-200/60">
              Upload a document and the agent turns it into a narrated story you can edit and publish.
            </p>
            <Link
              href="/new"
              className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-[0_0_24px_rgba(139,92,246,0.4)] transition hover:brightness-110"
            >
              Create your first story
            </Link>
          </div>
        )}

        {projects !== null && projects.length > 0 && (
          <p className="text-xs text-neutral-500 dark:text-indigo-200/60">
            {hasFilters ? `${rows.length} of ${plural(projects.length, "case study", "case studies")}` : plural(projects.length, "case study", "case studies")}
          </p>
        )}

        {projects !== null && projects.length > 0 && rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500 dark:border-white/15 dark:bg-white/[0.03] dark:text-indigo-200/60">
            No case studies match.{" "}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
              }}
              className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
            >
              Clear filters
            </button>
          </div>
        )}

        {rows.map(({ project, state }) => {
          const narration = summarizeNarration(project, project.selectedVoice);
          const confirming = confirmDeleteId === project.id;
          return (
            <article
              key={project.id}
              className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-neutral-300 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_40px_rgba(99,102,241,0.06)] dark:backdrop-blur-sm dark:hover:border-white/20 sm:p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-semibold leading-snug">
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                      {project.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-indigo-200/60">
                    {documentTypeLabel(project.documentType)} · {templateLabel(project)} ·{" "}
                    {plural(project.chunks.length, "chapter")}
                  </p>
                  {project.documentType !== "case-study" &&
                    project.selectedTemplateId &&
                    !isTemplateAvailable(project.selectedTemplateId) && (
                      <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">{TEMPLATE_UNAVAILABLE_NOTICE}</p>
                    )}
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-indigo-200/60">
                    Created {formatDate(project.createdAt)}
                    {" · "}
                    {project.publishedAt
                      ? `Last published ${formatDate(project.publishedAt)}`
                      : project.publishedUrl
                        ? "Published"
                        : "Not published yet"}
                  </p>
                </div>
                <div className="self-start">
                  <PublishStateBadge state={state} />
                </div>
              </div>

              {project.publishedUrl && (
                <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 dark:bg-black/20">
                  <a
                    href={project.publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                    title={project.publishedUrl}
                  >
                    {project.publishedUrl}
                  </a>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => handleCopy(project)} className={secondaryButton}>
                      {copiedId === project.id ? "Copied" : "Copy"}
                    </button>
                    <a href={project.publishedUrl} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                      Open ↗
                    </a>
                  </div>
                </div>
              )}

              {narration.outdated > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Narration needs updating for {plural(narration.outdated, "chapter")}.
                </p>
              )}

              {confirming ? (
                <div
                  role="alertdialog"
                  aria-label={`Delete ${project.title}`}
                  className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    Delete this case study and its narration? This can&apos;t be undone.
                    {project.publishedUrl && " The live site stays online until it is removed from the hosting account."}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={deletingId === project.id}
                      className={secondaryButton}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(project)}
                      disabled={deletingId === project.id}
                      className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
                    >
                      {deletingId === project.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    Edit
                  </Link>
                  <Link href={`/projects/${project.id}/preview`} target="_blank" className={secondaryButton}>
                    Preview
                  </Link>
                  {project.publishedUrl && (
                    <button
                      type="button"
                      onClick={() => setPublishingProjectId(project.id)}
                      disabled={state === "publishing"}
                      aria-haspopup="dialog"
                      className={
                        state === "changed"
                          ? "rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition hover:brightness-110 disabled:opacity-40"
                          : secondaryButton
                      }
                    >
                      {state === "changed" ? "Publish update" : "Republish"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setConfirmDeleteId(project.id);
                    }}
                    className="ml-auto rounded-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {publishingProject && (
        <PublishDialog
          project={publishingProject}
          voice={publishingProject.selectedVoice ?? ""}
          onClose={() => setPublishingProjectId(null)}
          onProjectUpdate={applyProjectUpdate}
        />
      )}
    </main>
  );
}
