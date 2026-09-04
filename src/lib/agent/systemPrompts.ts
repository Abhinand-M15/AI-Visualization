import { getSupabase } from "@/lib/db";
import type { DocumentType } from "@/lib/types";

/**
 * Prompts live in the `system_prompts` table so they can be edited/versioned
 * without a code deploy. Falls back to the given constant on any failure
 * (Supabase not configured yet, table not migrated, no active row, network
 * blip) so story generation keeps working even before that table exists.
 */
export async function getSystemPrompt(key: string, fallback: string): Promise<string> {
  try {
    const { data, error } = await getSupabase()
      .from("system_prompts")
      .select("content")
      .eq("key", key)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return fallback;
    return (data as { content: string }).content;
  } catch {
    return fallback;
  }
}

/**
 * Layout-binding-stage prompts are keyed per document type
 * ("layout-binding:case-study", "layout-binding:brd", ...) rather than one
 * global prompt, since each document type's template contract and narrative
 * arc differ. Unlike `getSystemPrompt`, there's no hardcoded fallback here —
 * a document type with no seeded row simply has no layout-binding prompt yet
 * (returns null), which is a real, expected state until that type's prompt
 * is written and seeded.
 *
 * NOT called from any pipeline route yet. The layout-binding stage itself
 * (a per-template slot contract, and a storyline schema carrying the
 * impactScore/evidenceGrade/partNumber fields this prompt expects) doesn't
 * exist in the app yet — this just makes the per-document-type prompt
 * available in the DB, ready for that stage to be wired up later.
 */
export async function getLayoutBindingPrompt(documentType: DocumentType): Promise<string | null> {
  try {
    const { data, error } = await getSupabase()
      .from("system_prompts")
      .select("content")
      .eq("key", `layout-binding:${documentType}`)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return (data as { content: string }).content;
  } catch {
    return null;
  }
}
