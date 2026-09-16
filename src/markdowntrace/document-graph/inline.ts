import type { EngineNode } from "@jasonbelmonti/markdown-engine";
import { Coordinates } from "./coordinates.js";
import type { Atom, Extraction } from "./extraction-model.js";
import { AnalysisFailure } from "./value.js";
import { traceDestination } from "./trace-destination.js";

export function sourceRange(node: EngineNode, coordinates: Coordinates) {
  const start = node.source?.range.start.offset,
    end = node.source?.range.end.offset;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start! < 0 ||
    end! < start! ||
    end! > coordinates.text.length ||
    coordinates.text.slice(start, end) !== node.source?.text
  ) {
    throw new AnalysisFailure(
      "source-map-unavailable",
      `Missing or inconsistent source map for ${node.type}`,
    );
  }
  return coordinates.range(start!, end!);
}
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
  coordinates: Coordinates,
  output: Extraction,
  destinations: ReadonlyMap<string, string>,
): Atom[] {
  const atoms: Atom[] = [];
  let leaf = 0;
  function visit(child: EngineNode) {
    const range = sourceRange(child, coordinates),
      start = range.start.offset,
      end = range.end.offset;
    const raw = coordinates.text.slice(start, end);
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
          ...("value" in meaning ? { token: meaning.value } : {}),
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
        ...(child.type === "inlineCode" ? { code: child.text ?? "" } : {}),
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
