"use client";

import { use, useEffect, useState } from "react";
import type { Chunk, Project } from "@/lib/types";
import { AVATARS, type Avatar } from "@/lib/avatars";
import { TEMPLATE_COMPONENTS } from "@/components/templates";
import CaseStudyTemplate from "@/components/templates/CaseStudyTemplate";
import { TEMPLATE_UNAVAILABLE_MESSAGE } from "@/lib/templates";
import { useAvailableTemplates } from "@/lib/useAvailableTemplates";
import { applySectionImages, caseStudySectionsAsChunks, flattenCaseStudySections } from "@/lib/caseStudySections";
import { resolvePreviewAvatars } from "./actions";
import { PreviewBar, PreviewMessage } from "@/components/PreviewBar";
import { errorMessage, requestJson } from "@/components/apiError";

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Non-static (domain) avatars, resolved on the server; null until resolved.
  const [extraAvatars, setExtraAvatars] = useState<Avatar[] | null>(null);
  const { isAvailable: isTemplateAvailable } = useAvailableTemplates();

  useEffect(() => {
    requestJson<{ project: Project }>(`/api/projects/${id}`, { cache: "no-store" }, "This story couldn't be loaded.")
      .then((data) => setProject(data.project))
      .catch((err) => setError(errorMessage(err, "This story couldn't be loaded.")));
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
      <PreviewMessage projectId={id} tone="error">
        {error} Reload the page to try again.
      </PreviewMessage>
    );
  }

  if (!project || (otherKey && extraAvatars === null)) {
    return <PreviewMessage projectId={id}>Loading the preview…</PreviewMessage>;
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

  const backLink = <PreviewBar projectId={id} />;
  // Showcase draws its own lead character, so it previews without an avatar (UX-05).
  const showcase = project.selectedTemplateId === "showcase" && isTemplateAvailable("showcase");
  const hasAvatars = avatars.length > 0 || showcase;

  // Voyage and Showcase are chunk-based, so a case study shows its sections as their chapters.
  const chunkBasedCaseStudy =
    (project.selectedTemplateId === "voyage" || project.selectedTemplateId === "showcase") &&
    isTemplateAvailable(project.selectedTemplateId);
  if (isCaseStudy && chunkBasedCaseStudy && caseStudySections.length > 0 && hasAvatars) {
    const ChunkTemplate = TEMPLATE_COMPONENTS[project.selectedTemplateId as string];
    return (
      <div>
        {backLink}
        <ChunkTemplate
          title={project.title}
          chunks={applySectionImages(
            caseStudySectionsAsChunks(caseStudySections, project.caseStudyBinding?.sectionAudio),
            project.sectionImages
          ).map((chunk) =>
            // Only ready images count; anything else shows the avatar as before.
            chunk.imageUrl && chunk.imageStatus !== "ready" ? { ...chunk, imageUrl: undefined } : chunk
          )}
          avatars={avatars}
          logoUrl={logoUrl}
        />
      </div>
    );
  }

  if (isCaseStudy) {
    if (caseStudySections.length === 0 || avatars.length === 0) {
      return (
        <PreviewMessage projectId={id}>
          {caseStudySections.length === 0
            ? "Make the case study layout on the project page first (step 1), then reload this preview."
            : "Choose an avatar on the project page first (step 2), then reload this preview."}
        </PreviewMessage>
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
    return <PreviewMessage projectId={id}>{TEMPLATE_UNAVAILABLE_MESSAGE}</PreviewMessage>;
  }

  const Template = project.selectedTemplateId ? TEMPLATE_COMPONENTS[project.selectedTemplateId] : undefined;

  if (!Template || !hasAvatars) {
    return (
      <PreviewMessage projectId={id}>
        {!Template
          ? "Choose a template on the project page first (step 2), then reload this preview."
          : "Choose an avatar on the project page first (step 2), then reload this preview."}
      </PreviewMessage>
    );
  }

  return (
    <div>
      {backLink}
      <Template title={project.title} chunks={chunks} avatars={avatars} logoUrl={logoUrl} />
    </div>
  );
}
