/**
 * Server-only subdomain availability check, shared by the check route (live
 * feedback in PublishDialog) and the publish route (authoritative re-check
 * right before deploying). Read-only: it queries our DB and the Vercel REST
 * API but never creates or changes anything.
 *
 * Vercel endpoints used (https://vercel.com/docs/rest-api):
 *  - GET /v9/projects/{name}                 does a project with this name exist on our account/team?
 *  - GET /v9/projects/{name}/domains/{host}  is the custom host already attached to that project?
 *  - GET /v4/aliases/{host}                  which of our projects (if any) serves the custom host?
 *  - HEAD https://<label>.vercel.app         unclaimed hosts answer 404 + x-vercel-error: DEPLOYMENT_NOT_FOUND
 *                                             (.vercel.app names are global, first come first served)
 *
 * `name` is what the user typed (stored in projects.subdomain); the Vercel
 * project name and host label are PUBLISH_NAME_PREFIX + name (see subdomain.ts).
 *
 * Ownership (SEC-09): a Vercel project with this name is only "yours" when this
 * app's records (site_names, else publications) say this project published it,
 * or the same user did from a project that no longer exists. Any other project
 * on the hosting account, including old sites of other users and anything
 * deployed outside this app, is never deployed over.
 */
import { getSupabase } from "@/lib/db";
import { authEnabled } from "@/lib/auth/session";
import { getPublishNamePrefix, siteLabel, validateSubdomain } from "@/lib/subdomain";
import { siteOwnership } from "@/lib/server/siteNames";
import {
  publishTokenConfigured,
  findAliasProjectId,
  findVercelProject,
  getPublishBaseDomain,
  probeHost,
  projectHasDomain,
  siteHostFor,
} from "@/lib/publish/vercel";

const YOURS_REASON = "A site on your hosting account already uses this address. Publishing will replace it.";

export type AvailabilityStatus = "available" | "yours" | "taken" | "invalid" | "unknown";

export interface SubdomainAvailability {
  available: boolean;
  status: AvailabilityStatus;
  reason: string;
  url: string | null;
}

/** The hosted app's own `<name>.vercel.app` label, which must never be reused as a story site name. */
function appOwnLabel(): string | null {
  const base = process.env.APP_BASE_URL;
  if (!base) return null;
  try {
    const host = new URL(base).hostname.toLowerCase();
    return host.endsWith(".vercel.app") ? host.slice(0, -".vercel.app".length) : null;
  } catch {
    return null;
  }
}

export async function checkSubdomainAvailability(
  rawName: string,
  options: { projectId?: string | null; userId?: string | null } = {}
): Promise<SubdomainAvailability> {
  const prefix = getPublishNamePrefix();
  const validation = validateSubdomain(rawName, prefix);
  if (!validation.ok) {
    return { available: false, status: "invalid", reason: validation.reason, url: null };
  }
  const name = validation.value;
  const label = siteLabel(name, prefix);
  const host = siteHostFor(label);
  const url = `https://${host}`;

  if (label === appOwnLabel()) {
    return { available: false, status: "taken", reason: "That address is reserved. Try another.", url };
  }

  // 1. Another project in our DB already claimed it (column only exists when auth is on).
  if (authEnabled()) {
    let query = getSupabase().from("projects").select("id").eq("subdomain", name).limit(1);
    if (options.projectId) query = query.neq("id", options.projectId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (data && data.length > 0) {
      return { available: false, status: "taken", reason: "Another story already uses this address.", url };
    }
  }

  // 2. The permanent record of published addresses: an address another story or
  //    user published stays theirs, also after that story was deleted.
  const ownership = await siteOwnership(name, options.projectId ?? null, options.userId ?? null);
  if (ownership === "other") {
    return { available: false, status: "taken", reason: "Another story already used this address. Try another.", url };
  }

  // Local-only publishing (no token): nothing on Vercel to collide with.
  if (!publishTokenConfigured()) {
    return { available: true, status: "available", reason: "Available.", url };
  }

  // 3. A Vercel project with this name on our account is only ours to replace when
  //    our records say this story (or this user's deleted story) published it.
  const project = await findVercelProject(label);
  if (project && ownership === "unrecorded") {
    return {
      available: false,
      status: "taken",
      reason: "A site with this address already exists on the hosting account and was not published from this story. Try another.",
      url,
    };
  }

  const baseDomain = getPublishBaseDomain();
  if (baseDomain) {
    // 4a. Custom base domain: the full host must not be attached to a different project.
    if (project && (await projectHasDomain(project.name, host))) {
      return { available: true, status: "yours", reason: YOURS_REASON, url };
    }
    const aliasProjectId = await findAliasProjectId(host);
    if (aliasProjectId !== null && aliasProjectId !== project?.id) {
      return { available: false, status: "taken", reason: "This address is already in use.", url };
    }
    return project
      ? { available: true, status: "yours", reason: YOURS_REASON, url }
      : { available: true, status: "available", reason: "Available.", url };
  }

  // 4b. <label>.vercel.app. A project of ours with this name only owns the
  // alias if Vercel actually assigned it (a globally taken name gets a
  // suffixed alias instead), so confirm via the alias lookup.
  if (project && (await findAliasProjectId(host)) === project.id) {
    return { available: true, status: "yours", reason: YOURS_REASON, url };
  }
  const probe = await probeHost(host);
  if (probe === "free") {
    return project
      ? { available: true, status: "yours", reason: YOURS_REASON, url }
      : { available: true, status: "available", reason: "Available.", url };
  }
  if (probe === "in-use") {
    return { available: false, status: "taken", reason: "Someone else's site already uses this address.", url };
  }
  return { available: false, status: "unknown", reason: "Couldn't confirm this address right now. Try again.", url };
}
