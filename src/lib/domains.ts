/**
 * Domains (industries) and the prompt templates, both stored in the database
 * (db/migrations/003_domains_images.sql). Nothing is hard-coded here.
 *
 * CONTRACT: see docs/DOMAINS_PLAN.md. Owned by stage S1. Every function degrades
 * gracefully: when the tables don't exist yet (migration not applied)
 * listDomains() returns [] and getDomain()/getPrompt() return null. They never throw
 * because of a missing table or column.
 */
import { getSupabase } from "@/lib/db";

export interface Domain {
  id: string;
  slug: string;
  name: string;
  outfitDescription: string;
  storyGuidance: string;
  sortOrder: number;
  active: boolean;
}

const NOT_MIGRATED_CODES = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

/** True when a Supabase/PostgREST error only means "table or column not there (yet)". */
function isNotMigrated(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code && NOT_MIGRATED_CODES.has(error.code)) return true;
  return /schema cache|does not exist/i.test(error.message ?? "");
}

const DOMAIN_COLUMNS = "id, slug, name, outfit_description, story_guidance, sort_order, active";

interface DomainRow {
  id: string;
  slug: string;
  name: string;
  outfit_description: string | null;
  story_guidance: string | null;
  sort_order: number | null;
  active: boolean | null;
}

function toDomain(row: DomainRow): Domain {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    outfitDescription: row.outfit_description ?? "",
    storyGuidance: row.story_guidance ?? "",
    sortOrder: row.sort_order ?? 0,
    active: row.active ?? true,
  };
}

/** Active domains ordered by sort_order, then name. [] when the table is missing. */
export async function listDomains(): Promise<Domain[]> {
  const { data, error } = await getSupabase()
    .from("domains")
    .select(DOMAIN_COLUMNS)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    if (isNotMigrated(error)) return [];
    throw new Error(`Could not read domains: ${error.message}`);
  }
  return ((data ?? []) as DomainRow[]).map(toDomain);
}

/** One domain by id (active or not), or null when missing / table missing. */
export async function getDomain(id: string): Promise<Domain | null> {
  if (!id) return null;
  const { data, error } = await getSupabase().from("domains").select(DOMAIN_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    // A malformed uuid (22P02) can't match any domain either.
    if (isNotMigrated(error) || error.code === "22P02") return null;
    throw new Error(`Could not read domain: ${error.message}`);
  }
  return data ? toDomain(data as DomainRow) : null;
}

/** Prompt body by key ('avatar_character' | 'chapter_scene' | 'story_domain_guidance'). Service role; null when missing. */
export async function getPrompt(key: string): Promise<string | null> {
  const { data, error } = await getSupabase().from("prompt_templates").select("body").eq("key", key).maybeSingle();
  if (error) {
    if (isNotMigrated(error)) return null;
    throw new Error(`Could not read prompt: ${error.message}`);
  }
  const body = (data as { body: string | null } | null)?.body;
  return body && body.trim() ? body : null;
}

/** Replaces every {{name}} in `template` with vars[name]; unknown placeholders become "". */
export function fillPrompt(template: string, vars: Record<string, string | undefined>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? (vars[name] ?? "") : ""
  );
}
