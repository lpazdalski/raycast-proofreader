import { diffArrays } from "diff";

export type Change = { from: string; to: string };

const GREEN = "#2ea043";
const FONT_SIZE = 14;
const FALLBACK_CHAR_WIDTH = 8.2;

// Advance widths of the macOS system font at FONT_SIZE, semibold, measured with AppKit and rounded to 0.5 px.
// textLength stretches the glyphs to the image width, so a wrong width shows as spread-out or squeezed letters.
const CHAR_WIDTHS = new Map<string, number>(
  (
    [
      ["ijîï", 3.5],
      ["Il|", 4],
      ["!',./:;\\‘’ł", 4.5],
      ["()[]frt{}", 5.5],
      ["*-•", 6.5],
      ["1`“”", 7],
      ['"?sxzśźż', 7.5],
      ["7FJLacekvyąćęŁéèêëàâäç", 8],
      ["2E_ghnopqu–ńóĘôöùûüñÉ", 8.5],
      ["#$+034569<=>PSTZ^bd~£ŚŹŻß", 9],
      ["8BKRVY€", 9.5],
      ["&ACDXĄĆÀÄ", 10],
      ["GHNUŃÜ", 10.5],
      ["OQÓÖ", 11],
      ["w", 11.5],
      ["Mm—…", 12.5],
      ["@", 13],
      ["%W", 14],
    ] as const
  ).flatMap(([chars, width]) => [...chars].map((c): [string, number] => [c, width])),
);

const charWidth = (c: string) =>
  CHAR_WIDTHS.get(c) ?? (c.codePointAt(0)! > 0xffff ? FONT_SIZE * 1.25 : FALLBACK_CHAR_WIDTH);

const textWidth = (word: string) => [...word].reduce((sum, c) => sum + charWidth(c), 0);

const tokenize = (text: string) => text.split(/(\s+)/).filter(Boolean);

const normalizeQuotes = (text: string) => text.replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"');

const escapeXml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);

export function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_~[\]#<>|]/g, "\\$&");
}

const ASCENT = Math.round(FONT_SIZE * 1.05);

function descent(word: string): number {
  if (/[gjpqyçąęţş()[\]{}|/]/.test(word)) return Math.round(FONT_SIZE * 0.21);
  if (/[,;Q_@$]/.test(word)) return Math.round(FONT_SIZE * 0.14);
  return 0;
}

// Raycast markdown has no text colour, so added words are drawn as inline SVG images.
// Raycast sits an image's bottom edge on the text baseline, so any space below the glyphs lifts the word;
// only words with descenders get that space.
function greenWord(word: string): string {
  const glyphs = textWidth(word);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(glyphs) + 2}" height="${ASCENT + descent(word)}">` +
    `<text x="1" y="${ASCENT}" font-family="-apple-system, system-ui, sans-serif" font-size="${FONT_SIZE}" ` +
    `font-weight="600" fill="${GREEN}" textLength="${glyphs}" lengthAdjust="spacingAndGlyphs">${escapeXml(word)}</text></svg>`;
  return `![](data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")})`;
}

const markAdded = (value: string) => value.replace(/\S+/g, greenWord);

function wrap(value: string, marker: string): string {
  const m = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!m || !m[2]) return value;
  return `${m[1]}${marker}${escapeMarkdown(m[2])}${marker}${m[3]}`;
}

// Emphasis markers cannot span a blank line, so each line of a change is marked on its own.
function markRemoved(value: string): string {
  return value
    .split(/(\s*\n\s*)/)
    .map((part, i) => (i % 2 ? part : wrap(part, "~~")))
    .join("");
}

// Diffing whole whitespace-separated words keeps every marker next to whitespace or a line edge;
// a marker squeezed between punctuation (`~~"~~**“**`) is not parsed as emphasis and renders literally.
// Models swap straight and curly quotes at will, so quote style alone is not a change and the
// original's quotes are kept in the corrected text.
export function proofreadDiff(original: string, fixed: string): { text: string; markdown: string; changes: Change[] } {
  const originalTokens = tokenize(original);
  const parts = diffArrays(originalTokens, tokenize(fixed), {
    comparator: (a, b) => normalizeQuotes(a) === normalizeQuotes(b),
  });

  let text = "";
  let markdown = "";
  const changes: Change[] = [];
  let group: Change | undefined;
  const flush = () => {
    if (group) changes.push({ from: group.from.trim(), to: group.to.trim() });
    group = undefined;
  };
  let originalIndex = 0;
  for (const { value, added, removed } of parts) {
    const chunk = value.join("");
    if (added) {
      text += chunk;
      if (markdown && !/\s$/.test(markdown)) markdown += " ";
      markdown += markAdded(chunk);
      group = { from: group?.from ?? "", to: (group?.to ?? "") + chunk };
    } else if (removed) {
      originalIndex += value.length;
      markdown += markRemoved(chunk);
      group = { from: (group?.from ?? "") + chunk, to: group?.to ?? "" };
    } else {
      const kept = originalTokens.slice(originalIndex, (originalIndex += value.length)).join("");
      text += kept;
      markdown += escapeMarkdown(kept);
      if (group && !kept.trim()) group = { from: group.from + kept, to: group.to + kept };
      else flush();
    }
  }
  flush();
  return { text, markdown: markdown.replace(/\n/g, "  \n"), changes };
}
