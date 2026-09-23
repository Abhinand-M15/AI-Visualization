"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { AVATARS } from "@/lib/avatars";
import { TEMPLATE_COMPONENTS } from "@/components/templates";
import CaseStudyTemplate from "@/components/templates/CaseStudyTemplate";
import { flattenCaseStudySections } from "@/lib/caseStudySections";

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
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

  const avatars = (project.selectedAvatarIds ?? [])
    .map((avatarId) => AVATARS.find((avatar) => avatar.id === avatarId))
    .filter((avatar): avatar is (typeof AVATARS)[number] => Boolean(avatar));

  const isCaseStudy = project.documentType === "case-study";
  const caseStudySections = isCaseStudy ? flattenCaseStudySections(project.caseStudyBinding?.slots ?? null) : [];

  const backLink = (
    <div className="fixed left-4 top-4 z-50">
      <Link
        href={`/projects/${id}`}
        className="rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur hover:bg-black/80"
      >
        ← Back to project
      </Link>
    </div>
  );

  if (isCaseStudy) {
    if (caseStudySections.length === 0 || avatars.length === 0) {
      return (
        <main className="mx-auto max-w-3xl px-6 py-16">
          <Link href={`/projects/${id}`} className="text-sm text-neutral-500 hover:underline">
            ← Back to project
          </Link>
          <p className="mt-6 text-sm text-neutral-600">
            Generate the case study layout and select at least one avatar on the project page first, then come back
            here to preview.
          </p>
        </main>
      );
    }

    return (
      <div>
        {backLink}
        <CaseStudyTemplate
          title={project.title}
          sections={caseStudySections}
          sectionAudio={project.caseStudyBinding?.sectionAudio ?? {}}
          sectionVideo={project.caseStudyBinding?.sectionVideo}
          avatars={avatars}
          theme={
            project.selectedTemplateId === "space" ||
            project.selectedTemplateId === "lunar" ||
            project.selectedTemplateId === "airlock"
              ? project.selectedTemplateId
              : "light"
          }
        />
      </div>
    );
  }

  const Template = project.selectedTemplateId ? TEMPLATE_COMPONENTS[project.selectedTemplateId] : undefined;

  if (!Template || avatars.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href={`/projects/${id}`} className="text-sm text-neutral-500 hover:underline">
          ← Back to project
        </Link>
        <p className="mt-6 text-sm text-neutral-600">
          Select at least one avatar and a template on the project page first, then come back here to preview.
        </p>
      </main>
    );
  }

  return (
    <div>
      {backLink}
      <Template title={project.title} chunks={project.chunks} avatars={avatars} />
    </div>
  );
}
