import type { ViewerPayload } from "./contracts.js";

/** Preserve exact excerpts without repeating a large source fragment for every link. */
export function sourceEvidence(payload: ViewerPayload, fragmentId: string) {
  const context = payload.contexts[fragmentId];
  return { ...context, excerpt: payload.sourceText.slice(context.range.start.offset, context.range.end.offset) };
}
