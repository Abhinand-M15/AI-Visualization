/**
 * Allowlist SVG sanitiser (pure, no dependencies). Logos are served from a
 * public bucket and may be opened directly, so anything that can run script or
 * fetch a remote resource is removed. It fails closed: input it cannot parse
 * cleanly throws SvgSanitizeError and the caller deletes the object.
 *
 * Removed: <script>, <foreignObject>, <style> (unless it only holds plain
 * rules), animation elements, any element not on the allowlist (with its
 * subtree), comments, processing instructions, DOCTYPE; on* attributes, any
 * href / xlink:href other than "#id" (or a base64 PNG/JPEG/GIF/WebP data URL on
 * <image>), src, url() references other than url(#id), javascript:/vbscript:/data:
 * values, unknown entities.
 */
export class SvgSanitizeError extends Error {}

const ELEMENTS = [
  "svg", "g", "defs", "symbol", "use", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
  "text", "tspan", "textPath", "title", "desc", "linearGradient", "radialGradient", "stop", "clipPath", "mask",
  "pattern", "marker", "image", "switch", "filter", "style",
  "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting",
  "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR",
  "feGaussianBlur", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting",
  "feSpotLight", "feTile", "feTurbulence",
];
const ALLOWED = new Map(ELEMENTS.map((e) => [e.toLowerCase(), e]));

/** Elements whose body is raw text (not tokenised) when dropped or kept. */
const RAW_TEXT = new Set(["script", "style"]);

const MAX_DEPTH = 100;
const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";
const SAFE_DATA_IMAGE = /^data:image\/(?:png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=\s]+$/i;

const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** Decodes the five XML entities and numeric references; unknown entities fail closed. */
function decodeEntities(s: string): string {
  if (/&(?!(?:#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);)/.test(s)) throw new SvgSanitizeError("Stray ampersand");
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g, (_m, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code < 0x20 && ![9, 10, 13].includes(code) || code > 0x10ffff) {
        throw new SvgSanitizeError("Invalid character reference");
      }
      return String.fromCodePoint(code);
    }
    const v = NAMED_ENTITIES[body];
    if (v === undefined) throw new SvgSanitizeError(`Unsupported entity &${body};`);
    return v;
  });
}

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SQUASH = new RegExp("[\u0000-\u0020\u007f-\u009f\u200b-\u200f\u2028\u2029\ufeff]+", "g");

/** Normalised form used to spot schemes hidden by whitespace / control characters. */
function squash(v: string): string {

  return v.replace(SQUASH, "").toLowerCase();
}

/** CSS is allowed only when it holds no imports, escapes, scripts or external url(). */
function cssIsSafe(css: string): boolean {
  const c = css.replace(/\/\*[\s\S]*?\*\//g, "");
  if (/[\\@]|<|expression|javascript|vbscript|behavior|binding|-moz-|image-set|src\s*\(/i.test(c)) return false;
  const urls = c.match(/url\s*\(([^)]*)\)/gi) ?? [];
  return urls.every((u) => /^url\s*\(\s*(["']?)#[^"')\s]+\1\s*\)$/i.test(u));
}

function attributeValueIsSafe(name: string, tag: string, decoded: string): boolean {
  const sq = squash(decoded);
  if (/(javascript|vbscript|livescript):/.test(sq)) return false;
  if (name === "href" || name === "xlink:href") {
    if (decoded.trim().startsWith("#")) return true;
    return tag === "image" && SAFE_DATA_IMAGE.test(decoded.trim());
  }
  if (sq.startsWith("data:")) return false;
  const urls = decoded.match(/url\s*\([^)]*\)/gi) ?? [];
  if (!urls.every((u) => /^url\s*\(\s*(["']?)#[^"')\s]+\1\s*\)$/i.test(u))) return false;
  if (/@import|expression\s*\(/i.test(decoded)) return false;
  return true;
}

interface Attr {
  name: string;
  value: string;
}

function readAttributes(src: string, from: number, tag: string): { attrs: Attr[]; end: number; selfClose: boolean } {
  const attrs: Attr[] = [];
  const seen = new Set<string>();
  let i = from;
  for (;;) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (i >= src.length) throw new SvgSanitizeError(`Unterminated <${tag}> tag`);
    if (src[i] === ">") return { attrs, end: i + 1, selfClose: false };
    if (src[i] === "/") {
      if (src[i + 1] !== ">") throw new SvgSanitizeError(`Malformed <${tag}> tag`);
      return { attrs, end: i + 2, selfClose: true };
    }
    const nameMatch = /^[A-Za-z_:][-A-Za-z0-9_:.]*/.exec(src.slice(i, i + 200));
    if (!nameMatch) throw new SvgSanitizeError(`Malformed attribute in <${tag}>`);
    const name = nameMatch[0];
    i += name.length;
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== "=") throw new SvgSanitizeError(`Attribute without value in <${tag}>`);
    i++;
    while (i < src.length && /\s/.test(src[i])) i++;
    const q = src[i];
    if (q !== '"' && q !== "'") throw new SvgSanitizeError(`Unquoted attribute in <${tag}>`);
    const close = src.indexOf(q, i + 1);
    if (close === -1) throw new SvgSanitizeError(`Unterminated attribute in <${tag}>`);
    const raw = src.slice(i + 1, close);
    if (raw.includes("<")) throw new SvgSanitizeError(`Illegal "<" in attribute of <${tag}>`);
    i = close + 1;
    const key = name.toLowerCase();
    if (seen.has(key)) throw new SvgSanitizeError(`Duplicate attribute ${name}`);
    seen.add(key);
    attrs.push({ name, value: raw });
  }
}

/** Returns the cleaned SVG text, or throws SvgSanitizeError. */
export function sanitizeSvg(input: string): string {
  let src = input.replace(/^﻿/, "");
  if (src.includes("\u0000")) throw new SvgSanitizeError("NUL byte in SVG");
  if (/<!ENTITY/i.test(src)) throw new SvgSanitizeError("Entity declarations are not allowed");

  const out: string[] = [];
  const stack: string[] = []; // canonical names of kept open elements
  let skipDepth = 0; // >0 while inside a dropped element's subtree
  let rootSeen = false;
  let rootClosed = false;
  let i = 0;
  src = src.replace(/\r\n?/g, "\n");

  const unwrap = new Set(["a"]);
  const unwrapStack: string[] = []; // open unwrapped elements (tag removed, children kept)

  while (i < src.length) {
    const lt = src.indexOf("<", i);
    const textEnd = lt === -1 ? src.length : lt;
    if (textEnd > i) {
      const text = src.slice(i, textEnd);
      if (skipDepth === 0) {
        if (stack.length === 0 || rootClosed) {
          if (text.trim()) throw new SvgSanitizeError("Text outside the root element");
        } else {
          decodeEntities(text); // validates entities
          out.push(escapeTextPreserve(text));
        }
      }
      i = textEnd;
      if (lt === -1) break;
    }

    if (src.startsWith("<!--", i)) {
      const end = src.indexOf("-->", i + 4);
      if (end === -1) throw new SvgSanitizeError("Unterminated comment");
      i = end + 3;
      continue;
    }
    if (src.startsWith("<![CDATA[", i)) {
      const end = src.indexOf("]]>", i + 9);
      if (end === -1) throw new SvgSanitizeError("Unterminated CDATA");
      if (skipDepth === 0 && stack.length > 0 && !rootClosed) out.push(escapeText(src.slice(i + 9, end)));
      i = end + 3;
      continue;
    }
    if (src.startsWith("<?", i)) {
      const end = src.indexOf("?>", i + 2);
      if (end === -1) throw new SvgSanitizeError("Unterminated processing instruction");
      i = end + 2;
      continue;
    }
    if (src.startsWith("<!", i)) {
      if (!/^<!DOCTYPE/i.test(src.slice(i, i + 9)) || rootSeen) throw new SvgSanitizeError("Unexpected declaration");
      // Skip the DOCTYPE, honouring an internal subset in [...] and quotes.
      let j = i + 9;
      let bracket = 0;
      let quote = "";
      for (; j < src.length; j++) {
        const ch = src[j];
        if (quote) {
          if (ch === quote) quote = "";
        } else if (ch === '"' || ch === "'") quote = ch;
        else if (ch === "[") bracket++;
        else if (ch === "]") bracket--;
        else if (ch === ">" && bracket <= 0) break;
      }
      if (j >= src.length) throw new SvgSanitizeError("Unterminated DOCTYPE");
      i = j + 1;
      continue;
    }

    // Closing tag
    if (src[i + 1] === "/") {
      const m = /^<\/([A-Za-z_:][-A-Za-z0-9_:.]*)\s*>/.exec(src.slice(i, i + 300));
      if (!m) throw new SvgSanitizeError("Malformed closing tag");
      i += m[0].length;
      const lower = m[1].toLowerCase();
      if (skipDepth > 0) {
        skipDepth--;
        continue;
      }
      if (unwrapStack.length && unwrapStack[unwrapStack.length - 1] === lower && !ALLOWED.has(lower)) {
        unwrapStack.pop();
        continue;
      }
      const top = stack.pop();
      if (!top || top.toLowerCase() !== lower) throw new SvgSanitizeError(`Mismatched closing tag </${m[1]}>`);
      out.push(`</${top}>`);
      if (stack.length === 0) rootClosed = true;
      continue;
    }

    // Opening tag
    const nm = /^<([A-Za-z_:][-A-Za-z0-9_:.]*)/.exec(src.slice(i, i + 300));
    if (!nm) throw new SvgSanitizeError('Unexpected "<"');
    const rawName = nm[1];
    const lower = rawName.toLowerCase();
    const { attrs, end, selfClose } = readAttributes(src, i + nm[0].length, rawName);
    i = end;

    if (skipDepth > 0) {
      if (!selfClose) skipDepth++;
      continue;
    }
    if (rootClosed) throw new SvgSanitizeError("Content after the root element");

    const canonical = ALLOWED.get(lower);
    if (!rootSeen) {
      if (canonical !== "svg") throw new SvgSanitizeError("The root element must be <svg>");
      rootSeen = true;
    }

    if (RAW_TEXT.has(lower)) {
      // Raw-text body: find the matching close without tokenising it.
      let body = "";
      if (!selfClose) {
        const closeRe = new RegExp(`</${lower}\\s*>`, "i");
        const rest = src.slice(i);
        const m = closeRe.exec(rest);
        if (!m) throw new SvgSanitizeError(`Unterminated <${lower}>`);
        body = rest.slice(0, m.index);
        i += m.index + m[0].length;
      }
      if (lower === "style") {
        const css = body.replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "");
        if (cssIsSafe(css) && !rootClosed && stack.length > 0) {
          const t = readSafeAttrs(attrs, "style", true);
          out.push(`<style${t}>${escapeText(css)}</style>`);
        }
      }
      continue; // script bodies are dropped entirely
    }

    if (!canonical) {
      if (unwrap.has(lower)) {
        if (!selfClose) unwrapStack.push(lower);
        continue;
      }
      if (!selfClose) skipDepth++;
      continue;
    }

    if (stack.length >= MAX_DEPTH) throw new SvgSanitizeError("SVG is nested too deeply");
    const attrText = readSafeAttrs(attrs, canonical, false);
    if (selfClose) {
      out.push(`<${canonical}${attrText}/>`);
      if (canonical === "svg" && stack.length === 0) rootClosed = true;
    } else {
      out.push(`<${canonical}${attrText}>`);
      stack.push(canonical);
    }
  }

  if (skipDepth > 0 || stack.length > 0 || unwrapStack.length > 0) throw new SvgSanitizeError("Unclosed element");
  if (!rootSeen) throw new SvgSanitizeError("No <svg> element found");
  return out.join("");
}

/** Text content keeps its validated entities; only bare ">" is normalised. */
function escapeTextPreserve(text: string): string {
  return text.replace(/>/g, "&gt;");
}

function readSafeAttrs(attrs: Attr[], tag: string, isStyleTag: boolean): string {
  let result = "";
  for (const { name, value } of attrs) {
    const lname = name.toLowerCase();
    if (lname.startsWith("on")) continue;
    if (lname === "src" || lname === "srcset" || lname === "formaction" || lname === "action") continue;
    if (lname.startsWith("xmlns")) {
      const decodedNs = decodeEntities(value).trim();
      const ok =
        (lname === "xmlns" && decodedNs === SVG_NS) ||
        (lname === "xmlns:xlink" && decodedNs === XLINK_NS);
      if (ok) result += ` ${name}="${escapeAttr(decodedNs)}"`;
      continue;
    }
    if (lname.includes(":") && !["xlink:href", "xml:space", "xml:lang"].includes(lname)) continue;
    if (isStyleTag && lname !== "type" && lname !== "media") continue;
    const decoded = decodeEntities(value);
    if (lname === "style") {
      if (!cssIsSafe(decoded)) continue;
    } else if (!attributeValueIsSafe(lname, tag, decoded)) {
      continue;
    }
    result += ` ${name}="${escapeAttr(decoded)}"`;
  }
  return result;
}
