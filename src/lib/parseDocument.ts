import JSZip from "jszip";
import { PDFParse } from "pdf-parse";

/*
 * Zip-bomb limits for DOCX / PPTX / XLSX (SEC-12). A small crafted zip can
 * declare or inflate to many gigabytes and take the function (and every other
 * request on the same instance) down. Limits are checked on the declared
 * sizes before anything is inflated, and again while inflating, because
 * declared sizes can lie.
 */
const MAX_ZIP_ENTRIES = 2_000;
/** Total declared uncompressed size of all entries. */
const MAX_ZIP_TOTAL_BYTES = 200 * 1024 * 1024;
/** One XML part actually inflated. */
const MAX_ENTRY_BYTES = 50 * 1024 * 1024;
/** All parts this parser actually inflates, together. */
const MAX_INFLATED_BYTES = 100 * 1024 * 1024;
/** Declared compression ratio above which an entry is treated as a bomb. */
const MAX_COMPRESSION_RATIO = 200;
/** Extracted text handed to the model. */
export const MAX_DOCUMENT_TEXT_CHARS = 1_000_000;

/** A document the parser refuses (too big, a zip bomb, not readable). The message is safe to show. */
export class DocumentRejectedError extends Error {
  readonly status: number;
  constructor(message: string, status = 422) {
    super(message);
    this.name = "DocumentRejectedError";
    this.status = status;
  }
}

interface ZipEntryInternals {
  _data?: { uncompressedSize?: number; compressedSize?: number };
}

async function loadZip(buffer: Buffer): Promise<{ zip: JSZip; budget: { left: number } }> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    throw new DocumentRejectedError("This file could not be opened. Save it again from Office and retry.");
  }
  const entries = Object.values(zip.files);
  if (entries.length > MAX_ZIP_ENTRIES) {
    throw new DocumentRejectedError("This document has too many parts to read safely.", 413);
  }
  let total = 0;
  for (const entry of entries) {
    const data = (entry as unknown as ZipEntryInternals)._data;
    const size = Number(data?.uncompressedSize ?? 0);
    const compressed = Number(data?.compressedSize ?? 0);
    if (!Number.isFinite(size) || size < 0) throw new DocumentRejectedError("This document could not be read safely.");
    total += size;
    if (compressed > 0 && size / compressed > MAX_COMPRESSION_RATIO && size > 1024 * 1024) {
      throw new DocumentRejectedError("This document is compressed in a way that can't be read safely.", 413);
    }
  }
  if (total > MAX_ZIP_TOTAL_BYTES) throw new DocumentRejectedError("This document is too large once unpacked.", 413);
  return { zip, budget: { left: MAX_INFLATED_BYTES } };
}

/**
 * Inflates one entry as UTF-8 text while counting bytes, and stops as soon as
 * the entry or the whole document goes over its limit.
 */
function readEntryText(entry: JSZip.JSZipObject, budget: { left: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    const parts: Buffer[] = [];
    let size = 0;
    let settled = false;
    const stream = entry.nodeStream("nodebuffer");
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      const s = stream as unknown as { pause?: () => void; destroy?: () => void };
      s.pause?.();
      s.destroy?.();
      reject(error);
    };
    stream.on("data", (chunk: Buffer) => {
      size += chunk.length;
      budget.left -= chunk.length;
      if (size > MAX_ENTRY_BYTES || budget.left < 0) {
        fail(new DocumentRejectedError("This document is too large once unpacked.", 413));
        return;
      }
      parts.push(chunk);
    });
    stream.on("error", (error: Error) => fail(error instanceof DocumentRejectedError ? error : new DocumentRejectedError("This document could not be read.")));
    stream.on("end", () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(parts).toString("utf8"));
    });
  });
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function extractTagText(xml: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([^<]*)</${tag}>`, "g");
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    const text = decodeXmlEntities(match[1]).trim();
    if (text) matches.push(text);
  }
  return matches;
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    console.error("pdf parse failed:", error instanceof Error ? error.message : error);
    throw new DocumentRejectedError("This PDF could not be read. Save it again (or export it as PDF again) and retry.");
  } finally {
    await parser.destroy();
  }
}

async function parsePptx(buffer: Buffer): Promise<string> {
  const { zip, budget } = await loadZip(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = Number(a.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      const numB = Number(b.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      return numA - numB;
    });

  const slideTexts: string[] = [];
  for (const [index, fileName] of slideFiles.entries()) {
    const xml = await readEntryText(zip.files[fileName], budget);
    const runs = extractTagText(xml, "a:t");
    if (runs.length > 0) {
      slideTexts.push(`--- Slide ${index + 1} ---\n${runs.join("\n")}`);
    }
  }
  return slideTexts.join("\n\n");
}

async function parseXlsx(buffer: Buffer): Promise<string> {
  const { zip, budget } = await loadZip(buffer);
  const chunks: string[] = [];

  const sharedStringsFile = zip.files["xl/sharedStrings.xml"];
  if (sharedStringsFile) {
    const xml = await readEntryText(sharedStringsFile, budget);
    chunks.push(...extractTagText(xml, "t"));
  }

  const sheetFiles = Object.keys(zip.files).filter((name) =>
    /^xl\/worksheets\/sheet\d+\.xml$/.test(name)
  );
  for (const fileName of sheetFiles) {
    const xml = await readEntryText(zip.files[fileName], budget);
    chunks.push(...extractTagText(xml, "t"));
  }

  return chunks.join("\n");
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const { zip, budget } = await loadZip(buffer);
  const documentFile = zip.files["word/document.xml"];
  if (!documentFile) return "";
  const xml = await readEntryText(documentFile, budget);
  // One line per paragraph, runs within a paragraph joined as they appear.
  const paragraphs = xml.split(/<\/w:p>/);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const pattern = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let text = "";
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) text += decodeXmlEntities(match[1]);
    if (text.trim()) lines.push(text.trim());
  }
  return lines.join("\n");
}

export async function parseDocument(fileName: string, buffer: Buffer): Promise<string> {
  const text = await parseDocumentText(fileName, buffer);
  if (text.length > MAX_DOCUMENT_TEXT_CHARS) {
    throw new DocumentRejectedError(
      "This document has more text than one story can use (about 1 million characters). Split it into smaller documents.",
      413
    );
  }
  return text;
}

async function parseDocumentText(fileName: string, buffer: Buffer): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return parsePdf(buffer);
  if (lower.endsWith(".pptx")) return parsePptx(buffer);
  if (lower.endsWith(".xlsx")) return parseXlsx(buffer);
  if (lower.endsWith(".docx")) return parseDocx(buffer);
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return buffer.toString("utf8");
  throw new DocumentRejectedError("Unsupported file type. Use a .pdf, .pptx, .xlsx, .docx, .txt or .md file.", 400);
}
