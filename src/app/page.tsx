"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";
import type { Project } from "@/lib/types";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProjects(data.projects);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load projects."));
  }, []);

  async function handleDelete(project: Project) {
    if (!window.confirm(`Delete "${project.title}"? This can't be undone.`)) return;
    setDeleteError(null);
    setDeletingId(project.id);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete project.");
      setProjects((current) => current?.filter((p) => p.id !== project.id) ?? current);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <SpaceBackdrop />
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Story Site Generator</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Upload a document, get back a narrated, chunked story.
          </p>
        </div>
        <Link
          href="/new"
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          New story
        </Link>
      </header>

      <section className="flex flex-col gap-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
        {!error && projects === null && <p className="text-sm text-neutral-500">Loading projects…</p>}
        {projects !== null && projects.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-white/[0.03] dark:backdrop-blur-sm">
            No stories yet. Click &ldquo;New story&rdquo; to upload your first document.
          </p>
        )}
        {projects?.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-400 dark:border-neutral-800 dark:bg-white/[0.03] dark:shadow-[0_0_40px_rgba(99,102,241,0.06)] dark:backdrop-blur-sm dark:hover:border-neutral-600"
          >
            <Link href={`/projects/${project.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">{project.title}</p>
              <p className="text-xs text-neutral-500">
                {project.chunks.length} chunks · {project.documentType} ·{" "}
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </Link>
            <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {project.publishStatus}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(project)}
              disabled={deletingId === project.id}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950"
            >
              {deletingId === project.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
