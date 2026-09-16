import type { EngineNode } from "@jasonbelmonti/markdown-engine";
import { Coordinates } from "./coordinates.js";
import type { Atom, Extraction, Token } from "./extraction-model.js";
import { inlineAtoms, sourceRange } from "./inline.js";
import { identifierPattern } from "./value.js";

const wordChar = (char: string) => /^[\p{L}\p{N}\p{M}_-]$/u.test(char);
const characterReference =
  /&(?:[A-Za-z][A-Za-z0-9]*|#[0-9]+|#[xX][0-9A-Fa-f]+);/y;
export function scanInline(
  node: EngineNode,
  coordinates: Coordinates,
  output: Extraction,
  destinations: ReadonlyMap<string, string>,
): Token[] {
  const atoms = inlineAtoms(node, coordinates, output, destinations),
    tokens: Token[] = [];
  const text = coordinates.text,
    container = sourceRange(node, coordinates);
  const exclude = (start: number, end: number, reason: string) =>
    output.exclusions.push({ range: coordinates.range(start, end), reason });
  const emit = (identifier: string, start: number, end: number) =>
    tokens.push({
      identifier,
      start,
      end,
      role: "reference",
      kind: "references",
    });
  for (let i = 0; i < atoms.length; ) {
    const atom = atoms[i];
    if (atom.token) {
      tokens.push({ ...atom.token, start: atom.start, end: atom.end });
      i++;
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
