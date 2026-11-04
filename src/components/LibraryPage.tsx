"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
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
import { Button, buttonClass, cardClass, fieldClass, pageSubtitleClass, pageTitleClass } from "@/components/ui/button";
import { EmptyState, ErrorState, InlineError, Skeleton } from "@/components/StateViews";
import { errorCode, errorMessage, requestJson } from "@/components/apiError";
import { projectReadiness, publishLooksStuck } from "@/components/projectReadiness";
import { useNow } from "@/components/useNow";

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

/** "My stories": every story the user built, with search, status, live link and publish. */
export function LibraryPage() {
  const searchId = useId();
  const statusId = useId();
  const sortId = useId();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [loadError, setLoadError] = useState<{ message: string; code?: string } | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PublishStateKey | "all">("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ projectId: string; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [takeDown, setTakeDown] = useState(false);
  const [pageNotice, setPageNotice] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  const [publishingProjectId, setPublishingProjectId] = useState<string | null>(null);
  const { isAvailable: isTemplateAvailable } = useAvailableTemplates();
  const now = useNow();
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const deleteButtons = useRef(new Map<string, HTMLButtonElement>());

  const load = useCallback(() => {
    setLoadError(null);
    requestJson<{ projects: ProjectSummary[] }>("/api/projects", { cache: "no-store" }, "Your stories couldn't be loaded.")
      .then((data) => setProjects(data.projects))
      .catch((err) => setLoadError({ message: errorMessage(err, "Your stories couldn't be loaded."), code: errorCode(err) }));
  }, []);

  useEffect(() => {
    // Deferred so the state updates in load() don't run synchronously in the effect body.
    void Promise.resolve().then(load);
  }, [load]);

  // Keyboard and screen-reader users land on the confirm's Cancel button (UX-21).
  useEffect(() => {
    if (confirmDeleteId) cancelRef.current?.focus();
  }, [confirmDeleteId]);

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

  function closeConfirm(projectId: string) {
    setConfirmDeleteId(null);
    // Back to the row's Delete button once it is rendered again.
    window.setTimeout(() => deleteButtons.current.get(projectId)?.focus(), 0);
  }

  async function handleDelete(project: ProjectSummary) {
    setRowError(null);
    setDeletingId(project.id);
    try {
      const wantsTakeDown = Boolean(project.publishedUrl) && takeDown;
      const reply = await requestJson<{ ok: boolean; siteTakenDown?: boolean | null }>(
        `/api/projects/${project.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wantsTakeDown ? { takeDownSite: true } : {}),
        },
        "The story couldn't be deleted."
      );
      setProjects((current) => current?.filter((p) => p.id !== project.id) ?? current);
      setConfirmDeleteId(null);
      setPageNotice(
        wantsTakeDown && reply.siteTakenDown === false
          ? { tone: "warning", text: `“${project.title}” was deleted, but its live site couldn't be taken down. Ask your admin to remove ${project.publishedUrl}.` }
          : {
              tone: "success",
              text: `“${project.title}” was deleted${wantsTakeDown && reply.siteTakenDown ? " and its live site was taken down" : ""}.`,
            }
      );
    } catch (err) {
      setRowError({ projectId: project.id, message: errorMessage(err, "The story couldn't be deleted.") });
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
      setRowError({
        projectId: project.id,
        message: "Couldn't copy automatically. Open the site and copy the address from the browser.",
      });
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
    <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-16 pt-2 sm:px-6">
      <SpaceBackdrop />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className={pageTitleClass}>My stories</h1>
          <p className={`mt-1 ${pageSubtitleClass}`}>
            Everything you&apos;ve built. Edit a story, then publish it or update its live site.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href="/settings" className={buttonClass("ghost", "md")}>
            Settings
          </Link>
          <Link href="/new" className={buttonClass("primary", "md")}>
            New story
          </Link>
        </div>
      </header>

      {projects !== null && projects.length > 0 && (
        <div className={`${cardClass} flex flex-col gap-3 p-3 sm:flex-row sm:items-center`}>
          <label htmlFor={searchId} className="sr-only">
            Search by title
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title"
            className={`${fieldClass} min-w-0 flex-1 rounded-full`}
          />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <label htmlFor={statusId} className="sr-only">
              Filter by status
            </label>
            <select
              id={statusId}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as PublishStateKey | "all")}
              className={`${fieldClass} min-w-0 rounded-full sm:w-auto`}
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
              className={`${fieldClass} min-w-0 rounded-full sm:w-auto`}
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

      <section className="flex flex-col gap-3" aria-label="Stories">
        {pageNotice && (
          <p
            role="status"
            className={
              pageNotice.tone === "success"
                ? "rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100"
                : "rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-100"
            }
          >
            {pageNotice.text}
          </p>
        )}
        {loadError && (
          <ErrorState title="Your stories couldn't be loaded" message={loadError.message} code={loadError.code} onRetry={load} />
        )}
        {!loadError && projects === null && <Skeleton lines={2} label="Loading your stories…" />}

        {projects !== null && projects.length === 0 && (
          <EmptyState
            title="No stories yet"
            description="Upload a document and the agent turns it into a narrated story you can edit and publish."
            action={
              <Link href="/new" className={buttonClass("primary", "md")}>
                Create your first story
              </Link>
            }
          />
        )}

        {projects !== null && projects.length > 0 && (
          <p className="text-xs text-muted-foreground" role="status">
            {hasFilters ? `${rows.length} of ${plural(projects.length, "story", "stories")}` : plural(projects.length, "story", "stories")}
          </p>
        )}

        {projects !== null && projects.length > 0 && rows.length === 0 && (
          <div className={`${cardClass} border-dashed p-8 text-center text-sm text-muted-foreground`}>
            No stories match.{" "}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
              }}
              className="rounded font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
            >
              Clear filters
            </button>
          </div>
        )}

        {rows.map(({ project, state }) => {
          const narration = summarizeNarration(project, project.selectedVoice);
          const confirming = confirmDeleteId === project.id;
          const stuck = publishLooksStuck(project, now);
          const ready = projectReadiness(project, isTemplateAvailable).publishBlockers.length === 0;
          const canPublish = (ready || Boolean(project.publishedUrl)) && (state !== "publishing" || stuck);
          const publishLabel = stuck
            ? "Retry publish"
            : state === "changed"
              ? "Publish update"
              : project.publishedUrl
                ? "Republish"
                : "Publish";
          return (
            <article key={project.id} className={`${cardClass} flex flex-col gap-3 p-4 transition-colors sm:p-5`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-semibold leading-snug">
                    <Link href={`/projects/${project.id}`} className="rounded hover:underline">
                      {project.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {documentTypeLabel(project.documentType)} · {templateLabel(project)} ·{" "}
                    {plural(project.chunks.length, "chapter")}
                  </p>
                  {project.documentType !== "case-study" &&
                    project.selectedTemplateId &&
                    !isTemplateAvailable(project.selectedTemplateId) && (
                      <p className="mt-1 text-xs font-medium text-amber-800 dark:text-amber-200">{TEMPLATE_UNAVAILABLE_NOTICE}</p>
                    )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
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
                    className="min-w-0 flex-1 truncate rounded text-xs font-medium text-emerald-800 hover:underline dark:text-emerald-300"
                    title={project.publishedUrl}
                  >
                    {project.publishedUrl}
                  </a>
                  <div className="flex shrink-0 gap-2">
                    <Button size="xs" onClick={() => handleCopy(project)}>
                      {copiedId === project.id ? "Copied" : "Copy"}
                    </Button>
                    <a href={project.publishedUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "xs")}>
                      Open<span className="sr-only"> the live site (new tab)</span>
                    </a>
                  </div>
                </div>
              )}

              {stuck && (
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Publishing seems stuck (it started a while ago and never finished). Retry to publish again.
                </p>
              )}
              {narration.outdated > 0 && (
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Narration needs updating for {plural(narration.outdated, narration.kind === "case-study" ? "section" : "chapter")}.
                </p>
              )}
              {rowError?.projectId === project.id && <InlineError>{rowError.message}</InlineError>}

              {confirming ? (
                <div
                  role="alertdialog"
                  aria-label={`Delete ${project.title}`}
                  aria-describedby={`delete-${project.id}-text`}
                  className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <span id={`delete-${project.id}-text`}>
                      Delete this story and its narration? This can&apos;t be undone.
                    </span>
                    {project.publishedUrl && (
                      <label className="flex cursor-pointer items-start gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={takeDown}
                          onChange={(event) => setTakeDown(event.target.checked)}
                          className="mt-0.5 accent-red-600"
                        />
                        <span>
                          Also take the live site down ({project.publishedUrl}). Otherwise it stays online.
                        </span>
                      </label>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      ref={cancelRef}
                      size="xs"
                      onClick={() => closeConfirm(project.id)}
                      disabled={deletingId === project.id}
                    >
                      Cancel
                    </Button>
                    <Button variant="danger" size="xs" onClick={() => handleDelete(project)} disabled={deletingId === project.id}>
                      {deletingId === project.id ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/projects/${project.id}`} className={buttonClass("primary", "xs")}>
                    Edit
                  </Link>
                  <Link href={`/projects/${project.id}/preview`} target="_blank" className={buttonClass("secondary", "xs")}>
                    Preview<span className="sr-only"> (new tab)</span>
                  </Link>
                  {canPublish && (
                    <Button
                      variant={state === "changed" || stuck || !project.publishedUrl ? "success" : "secondary"}
                      size="xs"
                      onClick={() => setPublishingProjectId(project.id)}
                      aria-haspopup="dialog"
                    >
                      {publishLabel}
                    </Button>
                  )}
                  {state === "publishing" && !stuck && (
                    <span className="text-xs text-muted-foreground" role="status">
                      Publishing…
                    </span>
                  )}
                  <button
                    type="button"
                    ref={(element) => {
                      if (element) deleteButtons.current.set(project.id, element);
                      else deleteButtons.current.delete(project.id);
                    }}
                    onClick={() => {
                      setRowError(null);
                      setPageNotice(null);
                      setTakeDown(false);
                      setConfirmDeleteId(project.id);
                    }}
                    className={buttonClass("ghost", "xs", "ml-auto text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10")}
                  >
                    Delete<span className="sr-only"> {project.title}</span>
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
