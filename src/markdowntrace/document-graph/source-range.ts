import type {
  EngineNode,
  SourceRange as EngineSourceRange,
} from "@jasonbelmonti/markdown-engine";
import type { SourceRange } from "./contracts/source.js";
import { AnalysisFailure } from "./value.js";

// Keep Engine's positions; Trace requires offsets in addition to lines/columns.
export function copyEngineRange(
  range: EngineSourceRange | undefined,
): SourceRange | undefined {
  if (!range) return undefined;
  const start = range.start.offset,
    end = range.end.offset;
  if (typeof start !== "number" || typeof end !== "number") return undefined;
  return {
    start: { ...range.start, offset: start },
    end: { ...range.end, offset: end },
  };
}

export function sourceRange(node: EngineNode, text: string): SourceRange {
  const range = copyEngineRange(node.source?.range);
  if (
    !range ||
    !Number.isSafeInteger(range.start.offset) ||
    !Number.isSafeInteger(range.end.offset) ||
    range.start.offset < 0 ||
    range.end.offset < range.start.offset ||
    range.end.offset > text.length ||
    text.slice(range.start.offset, range.end.offset) !== node.source?.text
  ) {
    throw new AnalysisFailure(
      "source-map-unavailable",
      `Missing or inconsistent source map for ${node.type}`,
    );
  }
  return range;
}
