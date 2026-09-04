"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { CaseStudyLayoutPage } from "@/components/CaseStudyLayoutPage";

export default function CaseStudyPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProject(data.project);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load project."));
  }, [id]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-neutral-500">Loading…</p>
      </main>
    );
  }

  if (!project.caseStudyBinding) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href={`/projects/${id}`} className="text-sm text-neutral-500 hover:underline">
          ← Back to project
        </Link>
        <p className="mt-6 text-sm text-neutral-600">
          Run "Generate case study layout" on the project page first, then come back here to preview.
        </p>
      </main>
    );
  }

  return (
    <div>
      <div className="fixed left-4 top-4 z-50">
        <Link
          href={`/projects/${id}`}
          className="rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur hover:bg-black/80"
        >
          ← Back to project
        </Link>
      </div>
      <CaseStudyLayoutPage title={project.title} slots={project.caseStudyBinding.slots} />
    </div>
  );
}
