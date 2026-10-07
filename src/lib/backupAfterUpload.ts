/**
 * Fire-and-forget Drive backup that other stages call right after saving a file to Supabase
 * Storage. Owned by stage S5c. Never throws, never blocks the caller (returns immediately).
 * When `record` is given, the outcome is written to that row's `drive_status` column
 * (errors writing it are ignored, e.g. when the migration isn't applied).
 *
 * Serverless caveat (Vercel): a plain background promise may be frozen or cut short once the
 * response has been sent. To make the backup survive, the work is registered with `after()` from
 * next/server (documented in node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md
 * as usable in Route Handlers; it keeps running for the route's max duration). When `after()` is
 * unavailable (called outside a request scope, e.g. scripts or tests) it throws synchronously;
 * that is caught and the work simply runs as a detached promise. Either way a failed or cut-short
 * backup only leaves drive_status unset/"failed"; the file is safe in Supabase Storage.
 */
import { after } from "next/server";
import { backupToDrive, type DriveBackupResult } from "@/lib/driveBackup";
import { getSupabase } from "@/lib/db";

export interface BackupAfterUploadOptions {
  bucket: string;
  path: string;
  folder: string;
  fileName: string;
  contentType?: string;
  record?: {
    table: "chapter_images" | "domain_avatars";
    /** Equality filters selecting the row, e.g. { project_id, chunk_id } or { id }. */
    match: Record<string, string>;
  };
}

async function run(opts: BackupAfterUploadOptions): Promise<void> {
  try {
    let result: DriveBackupResult;
    try {
      result = await backupToDrive({
        bucket: opts.bucket,
        path: opts.path,
        folder: opts.folder,
        fileName: opts.fileName,
        contentType: opts.contentType,
      });
    } catch {
      result = { status: "failed" };
    }
    if (opts.record) {
      try {
        await getSupabase()
          .from(opts.record.table)
          .update({ drive_status: result.status })
          .match(opts.record.match);
      } catch {
        // column/table may not exist; ignore
      }
    }
  } catch {
    // never propagate
  }
}

export function backupAfterUpload(opts: BackupAfterUploadOptions): void {
  try {
    try {
      after(() => run(opts));
      return;
    } catch {
      // outside a request scope (or after() unavailable): fall through to a detached promise
    }
    void run(opts).catch(() => {});
  } catch {
    // never throw
  }
}
