"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import type { Chunk, Project } from "@/lib/types";
import { AVATARS, type Avatar } from "@/lib/avatars";
import { TEMPLATE_COMPONENTS } from "@/components/templates";
import CaseStudyTemplate from "@/components/templates/CaseStudyTemplate";
import { TEMPLATE_UNAVAILABLE_MESSAGE } from "@/lib/templates";
import { useAvailableTemplates } from "@/lib/useAvailableTemplates";
import { caseStudySectionsAsChunks, flattenCaseStudySections } from "@/lib/caseStudySections";
import { resolvePreviewAvatars } from "./actions";

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Non-static (domain) avatars, resolved on the server; null until resolved.
  const [extraAvatars, setExtraAvatars] = useState<Avatar[] | null>(null);
  const { isAvailable: isTemplateAvailable } = useAvailableTemplates();

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProject(data.project);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load project."));
  }, [id]);

  const otherAvatarIds = (project?.selectedAvatarIds ?? []).filter((avatarId) => !AVATARS.some((avatar) => avatar.id === avatarId));
  const otherKey = otherAvatarIds.join(",");
  useEffect(() => {
    if (!otherKey) return;
    let cancelled = false;
    resolvePreviewAvatars(otherKey.split(","))
      .then((resolved) => {
        if (!cancelled) setExtraAvatars(resolved);
      })
      .catch(() => {
        if (!cancelled) setExtraAvatars([]);
      });
    return () => {
      cancelled = true;
    };
  }, [otherKey]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!project || (otherKey && extraAvatars === null)) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-neutral-500">Loading…</p>
      </main>
    );
  }

  // Static ids resolve locally (unchanged); domain ids come from the server.
  const avatars = (project.selectedAvatarIds ?? [])
    .map((avatarId) => AVATARS.find((avatar) => avatar.id === avatarId) ?? (extraAvatars ?? []).find((avatar) => avatar.id === avatarId))
    .filter((avatar): avatar is Avatar => Boolean(avatar));

  const logoUrl = typeof project.logoUrl === "string" && project.logoUrl ? project.logoUrl : undefined;
  // Scene images only count when present and usable; otherwise the chapter shows its avatar as before.
  const chunks: Chunk[] = project.chunks.map((chunk) => {
    const usable = typeof chunk.imageUrl === "string" && chunk.imageUrl && (!chunk.imageStatus || chunk.imageStatus === "ready");
    return usable ? chunk : { ...chunk, imageUrl: undefined };
  });

  const isCaseStudy = project.documentType === "case-study";
  const caseStudySections = isCaseStudy ? flattenCaseStudySections(project.caseStudyBinding?.slots ?? null) : [];

  const backLink = (
    <div className={`fixed left-4 z-50 ${logoUrl ? "top-[76px]" : "top-4"}`}>
      <Link
        href={`/projects/${id}`}
        className="rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur hover:bg-black/80"
      >
        ← Back to project
      </Link>
    </div>
  );

  // Voyage and Showcase are chunk-based, so a case study shows its sections as their chapters.
  const chunkBasedCaseStudy =
    (project.selectedTemplateId === "voyage" || project.selectedTemplateId === "showcase") &&
    isTemplateAvailable(project.selectedTemplateId);
  if (isCaseStudy && chunkBasedCaseStudy && caseStudySections.length > 0 && avatars.length > 0) {
    const ChunkTemplate = TEMPLATE_COMPONENTS[project.selectedTemplateId as string];
    return (
      <div>
        {backLink}
        <ChunkTemplate
          title={project.title}
          chunks={caseStudySectionsAsChunks(caseStudySections, project.caseStudyBinding?.sectionAudio)}
          avatars={avatars}
          logoUrl={logoUrl}
        />
      </div>
    );
  }

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
          logoUrl={logoUrl}
          theme={
            (project.selectedTemplateId === "space" ||
              project.selectedTemplateId === "lunar" ||
              project.selectedTemplateId === "airlock") &&
            isTemplateAvailable(project.selectedTemplateId)
              ? project.selectedTemplateId
              : "light"
          }
        />
      </div>
    );
  }

  const templateGone = Boolean(project.selectedTemplateId) && !isTemplateAvailable(project.selectedTemplateId);
  if (templateGone) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href={`/projects/${id}`} className="text-sm text-neutral-500 hover:underline">
          ← Back to project
        </Link>
        <p className="mt-6 text-sm text-amber-700 dark:text-amber-300">{TEMPLATE_UNAVAILABLE_MESSAGE}</p>
      </main>
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
      <Template title={project.title} chunks={chunks} avatars={avatars} logoUrl={logoUrl} />
    </div>
  );
}
