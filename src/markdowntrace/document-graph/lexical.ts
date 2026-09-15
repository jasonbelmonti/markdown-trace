import type { EngineNode } from "@jasonbelmonti/markdown-engine";
import { Coordinates } from "./coordinates.js";
import type { Atom, Extraction, Token } from "./extraction-model.js";
import { inlineAtoms, sourceRange } from "./inline.js";
import { identifierPattern } from "./value.js";

const wordChar = (char: string) => /^[\p{L}\p{N}\p{M}_-]$/u.test(char);
const characterReference =
  /&(?:[A-Za-z][A-Za-z0-9]*|#[0-9]+|#[xX][0-9A-Fa-f]+);/y;
const marker =
  /^\{(?:(#)|([a-z][a-z0-9]*(?:-[a-z0-9]+)*):)([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)\}$/;
function escaped(text: string, offset: number): boolean {
  let count = 0;
  while (offset > 0 && text[--offset] === "\\") count++;
  return count % 2 === 1;
}
export function scanInline(
  node: EngineNode,
  coordinates: Coordinates,
  output: Extraction,
): Token[] {
  const atoms = inlineAtoms(node, coordinates, output),
    tokens: Token[] = [];
  const text = coordinates.text,
    container = sourceRange(node, coordinates);
  const exclude = (start: number, end: number, reason: string) =>
    output.exclusions.push({ range: coordinates.range(start, end), reason });
  const emit = (
    identifier: string,
    start: number,
    end: number,
    role: Token["role"] = "reference",
    kind = "references",
  ) => tokens.push({ identifier, start, end, role, kind });
  for (let i = 0; i < atoms.length;) {
    const atom = atoms[i];
    if (atom.char === "{") {
      let j = i + 1,
        depth = 1;
      for (; j < atoms.length; j++) {
        const a = atoms[j];
        if (
          a.char === "\n" ||
          a.char === "\r" ||
          /[\r\n]/.test(text.slice(atoms[j - 1].end, a.start)) ||
          (a.char === "\ufffc" && /[\r\n]/.test(text.slice(a.start, a.end)))
        )
          break;
        if (a.char === "\ufffc" || escaped(text, a.start)) continue;
        if (a.char === "{") depth++;
        if (a.char === "}" && --depth === 0) break;
      }
      const closed = depth === 0;
      const lineEnd = text.indexOf("\n", atom.start);
      let end = closed
        ? atoms[j].end
        : Math.min(container.end.offset, lineEnd < 0 ? text.length : lineEnd);
      if (!closed && text[end - 1] === "\r") end--;
      const group = atoms.slice(i, closed ? j + 1 : j);
      const view = group
        .slice(1)
        .map((a) => a.char)
        .join("");
      const raw = text.slice(atom.start, end),
        match = marker.exec(raw);
      if (escaped(text, atom.start))
        exclude(atom.start, end, "escaped-expression");
      else if (closed && match && group.every((a) => a.leaf === atom.leaf))
        emit(
          match[3],
          atom.start,
          end,
          match[1] ? "definition" : "reference",
          match[2] ?? "references",
        );
      else if (/^[ \t]*(?:#|[A-Za-z0-9_-]+[ \t]*:)/.test(view)) {
        output.diagnostics.push({
          code: "markdown-trace.language.malformed-expression",
          severity: "error",
          message: "Noncanonical identity expression",
          identifiers: [],
          sourceRanges: [coordinates.range(atom.start, end)],
        });
      } else exclude(atom.start, end, "literal-brace-group");
      i = closed ? j + 1 : j;
      continue;
    }
    if (atom.code !== undefined) {
      if (
        identifierPattern.test(atom.code) &&
        !/[\r\n]/.test(text.slice(atom.start, atom.end))
      )
        emit(atom.code, atom.start, atom.end);
      else exclude(atom.start, atom.end, "literal-inline-code");
      i++;
      continue;
    }
    if (!wordChar(atom.char) && atom.char !== "\\" && atom.char !== "&") {
      i++;
      continue;
    }
    const word: Atom[] = [];
    let spelling = "",
      encoded = false,
      j = i;
    while (j < atoms.length) {
      const a = atoms[j];
      if (wordChar(a.char) || a.char === "\\") {
        word.push(a);
        spelling += a.char;
        j++;
        continue;
      }
      if (a.char === "&") {
        characterReference.lastIndex = a.start;
        const entity = characterReference.exec(text)?.[0];
        if (
          entity &&
          a.start + entity.length <= container.end.offset &&
          atoms.slice(j, j + entity.length).every((b) => b.leaf === a.leaf)
        ) {
          word.push(...atoms.slice(j, j + entity.length));
          spelling += "\ufffd";
          encoded = true;
          j += entity.length;
          continue;
        }
      }
      break;
    }
    if (!word.length) {
      i++;
      continue;
    }
    const slashes = /^\\*/.exec(spelling)![0].length;
    const candidate = spelling.slice(slashes),
      content = word.slice(slashes);
    const contiguous =
      content.length > 0 && content.every((a) => a.leaf === content[0].leaf);
    if (
      !encoded &&
      slashes % 2 === 0 &&
      contiguous &&
      identifierPattern.test(candidate)
    ) {
      emit(candidate, content[0].start, content.at(-1)!.end);
    } else if (/[A-Z][A-Z0-9]*-/.test(spelling))
      exclude(word[0].start, word.at(-1)!.end, "noncanonical-or-escaped-word");
    i = j;
  }
  return tokens;
}
