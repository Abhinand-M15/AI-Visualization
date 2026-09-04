import JSZip from "jszip";
import { PDFParse } from "pdf-parse";

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
  } finally {
    await parser.destroy();
  }
}

async function parsePptx(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = Number(a.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      const numB = Number(b.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      return numA - numB;
    });

  const slideTexts: string[] = [];
  for (const [index, fileName] of slideFiles.entries()) {
    const xml = await zip.files[fileName].async("text");
    const runs = extractTagText(xml, "a:t");
    if (runs.length > 0) {
      slideTexts.push(`--- Slide ${index + 1} ---\n${runs.join("\n")}`);
    }
  }
  return slideTexts.join("\n\n");
}

async function parseXlsx(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const chunks: string[] = [];

  const sharedStringsFile = zip.files["xl/sharedStrings.xml"];
  if (sharedStringsFile) {
    const xml = await sharedStringsFile.async("text");
    chunks.push(...extractTagText(xml, "t"));
  }

  const sheetFiles = Object.keys(zip.files).filter((name) =>
    /^xl\/worksheets\/sheet\d+\.xml$/.test(name)
  );
  for (const fileName of sheetFiles) {
    const xml = await zip.files[fileName].async("text");
    chunks.push(...extractTagText(xml, "t"));
  }

  return chunks.join("\n");
}

export async function parseDocument(fileName: string, buffer: Buffer): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return parsePdf(buffer);
  if (lower.endsWith(".pptx")) return parsePptx(buffer);
  if (lower.endsWith(".xlsx")) return parseXlsx(buffer);
  throw new Error(`Unsupported file type: ${fileName}. Only .pdf, .pptx, and .xlsx are supported.`);
}
