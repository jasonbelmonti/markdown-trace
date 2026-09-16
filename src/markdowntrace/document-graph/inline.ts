import type { EngineNode } from "@jasonbelmonti/markdown-engine";
import type { Atom, Extraction } from "./extraction-model.js";
import { sourceRange } from "./source-range.js";
import { traceDestination } from "./trace-destination.js";

const transparent = new Set([
  "emphasis",
  "strong",
  "delete",
  "link",
  "linkReference",
]);
const literals = new Set(["html", "image", "imageReference"]);
export function inlineAtoms(
  node: EngineNode,
  text: string,
  output: Extraction,
  destinations: ReadonlyMap<string, string>,
): Atom[] {
  const atoms: Atom[] = [];
  let leaf = 0;
  function visit(child: EngineNode) {
    const range = sourceRange(child, text),
      start = range.start.offset,
      end = range.end.offset;
    const raw = text.slice(start, end);
    if (child.type === "link" || child.type === "linkReference") {
      const destination = destinations.get(child.target?.id ?? "");
      const meaning =
        destination === undefined ? null : traceDestination(destination);
      if (meaning) {
        atoms.push({
          char: "\ufffc",
          start,
          end,
          leaf: leaf++,
          ...("value" in meaning
            ? { token: { ...meaning.value, range } }
            : {}),
        });
        if ("error" in meaning)
          output.diagnostics.push({
            code: "markdown-trace.language.malformed-link",
            severity: "error",
            message: meaning.error,
            identifiers: [],
            sourceRanges: [range],
          });
        return;
      }
    }
    if (child.type === "text") {
      let offset = start;
      for (const char of raw) {
        atoms.push({ char, start: offset, end: offset + char.length, leaf });
        offset += char.length;
      }
      leaf++;
    } else if (
      transparent.has(child.type) &&
      !(child.type === "link" && (raw.startsWith("<") || !raw.startsWith("[")))
    ) {
      for (const nested of child.children ?? []) visit(nested);
    } else if (child.type === "break") {
      atoms.push({ char: "\n", start, end, leaf: leaf++ });
    } else {
      atoms.push({
        char: "\ufffc",
        start,
        end,
        leaf: leaf++,
        ...(child.type === "inlineCode"
          ? { code: { text: child.text ?? "", range } }
          : {}),
      });
      if (child.type !== "inlineCode")
        output.exclusions.push({ range, reason: `literal-${child.type}` });
      if (
        !literals.has(child.type) &&
        child.type !== "inlineCode" &&
        child.type !== "link"
      ) {
        output.diagnostics.push({
          code: "markdown-trace.language.unsupported-node",
          severity: "error",
          message: `Unsupported inline node: ${child.type}`,
          identifiers: [],
          sourceRanges: [range],
        });
      }
    }
  }
  for (const child of node.children ?? []) visit(child);
  return atoms;
}
