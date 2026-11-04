"use client";

import { use, useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { CaseStudyLayoutPage } from "@/components/CaseStudyLayoutPage";
import { PreviewBar, PreviewMessage } from "@/components/PreviewBar";
import { errorMessage, requestJson } from "@/components/apiError";

export default function CaseStudyPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestJson<{ project: Project }>(`/api/projects/${id}`, { cache: "no-store" }, "This story couldn't be loaded.")
      .then((data) => setProject(data.project))
      .catch((err) => setError(errorMessage(err, "This story couldn't be loaded.")));
  }, [id]);

  if (error) {
    return (
      <PreviewMessage projectId={id} tone="error">
        {error} Reload the page to try again.
      </PreviewMessage>
    );
  }

  if (!project) return <PreviewMessage projectId={id}>Loading the preview…</PreviewMessage>;

  if (!project.caseStudyBinding) {
    return (
      <PreviewMessage projectId={id}>
        Make the case study layout on the project page first (step 1), then reload this preview.
      </PreviewMessage>
    );
  }

  return (
    <div>
      <PreviewBar projectId={id} />
      <CaseStudyLayoutPage title={project.title} slots={project.caseStudyBinding.slots} />
    </div>
  );
}
