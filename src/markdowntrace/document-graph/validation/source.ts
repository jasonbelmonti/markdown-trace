import type { SourceRange as EngineSourceRange } from "@jasonbelmonti/markdown-engine";
import type { SourceRange } from "../contracts/source.js";
import { copyEngineRange } from "../source-range.js";
import { AnalysisFailure } from "../value.js";

export function requiredRange(
  range: EngineSourceRange | undefined,
): SourceRange {
  const captured = copyEngineRange(range);
  if (
    !captured ||
    !Number.isSafeInteger(captured.start.offset) ||
    !Number.isSafeInteger(captured.end.offset)
  )
    throw new AnalysisFailure(
      "source-map-unavailable",
      "Validation requires Engine source offsets.",
    );
  return captured;
}
export const contains = (outer: SourceRange, inner: SourceRange): boolean =>
  outer.start.offset <= inner.start.offset &&
  inner.end.offset <= outer.end.offset;
