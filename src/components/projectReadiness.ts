import type { Project } from "@/lib/types";
import { PUBLISHING_STALE_MS } from "@/lib/contentVersion";

/**
 * What a story still needs before it can be previewed or published, shared by
 * the library and the project page so both say the same thing.
 */

/** Showcase draws one fixed lead character in every scene, so it needs no avatar (UX-05). */
export function usesLeadCharacter(project: Pick<Project, "selectedTemplateId">, isTemplateAvailable: (id?: string) => boolean): boolean {
  return project.selectedTemplateId === "showcase" && isTemplateAvailable(project.selectedTemplateId);
}

export interface Readiness {
  /** Things to do before Preview works, in step order (empty = ready). */
  previewBlockers: string[];
  /** Everything Preview needs, plus what Publish needs on top (empty = ready). */
  publishBlockers: string[];
  needsAvatar: boolean;
  hasAvatar: boolean;
  hasTemplate: boolean;
  hasLayout: boolean;
}

export function projectReadiness(
  project: Pick<Project, "documentType" | "selectedTemplateId" | "selectedAvatarIds" | "caseStudyBinding">,
  isTemplateAvailable: (id?: string) => boolean
): Readiness {
  const isCaseStudy = project.documentType === "case-study";
  const hasTemplate = Boolean(project.selectedTemplateId) && isTemplateAvailable(project.selectedTemplateId);
  const needsAvatar = !usesLeadCharacter(project, isTemplateAvailable);
  const hasAvatar = (project.selectedAvatarIds ?? []).length > 0;
  const hasLayout = Boolean(project.caseStudyBinding?.slots);

  const previewBlockers: string[] = [];
  if (isCaseStudy && !hasLayout) previewBlockers.push("Generate the case study layout");
  // Case studies publish their own layout, so a template is optional for them.
  if (!isCaseStudy && !hasTemplate) previewBlockers.push("Choose a template");
  if (needsAvatar && !hasAvatar) previewBlockers.push("Choose an avatar");

  return {
    previewBlockers,
    publishBlockers: [...previewBlockers],
    needsAvatar,
    hasAvatar,
    hasTemplate,
    hasLayout,
  };
}

/** A publish normally finishes in 1 to 2 minutes; the server stops it at 5 and lets a new one take over after this. */
export const PUBLISH_STUCK_AFTER_MS = PUBLISHING_STALE_MS;

/**
 * True when a "publishing" state is old enough that the publish must have
 * died without resetting it (UX-03). The publish route sets updated_at when a
 * publish starts, so updatedAt is the start time (publishStartedAt is used if
 * the server ever sends it). Same rule as the server's stale-lock takeover.
 */
export function publishLooksStuck(
  project: Pick<Project, "publishStatus"> & { updatedAt?: string; publishStartedAt?: string },
  now: number
): boolean {
  if (project.publishStatus !== "publishing") return false;
  const since = Date.parse(project.publishStartedAt ?? project.updatedAt ?? "");
  if (Number.isNaN(since)) return true;
  return now - since > PUBLISH_STUCK_AFTER_MS;
}
