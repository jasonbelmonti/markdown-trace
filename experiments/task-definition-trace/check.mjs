import { analyzeDocument, validateGraph } from "@jasonbelmonti/markdown-trace/experimental/graph";

export function unwrap(result) {
  if (!result.ok) throw Object.assign(new Error(result.error.message), { code: result.error.code });
  return result.value;
}
export function checkTask(text, documentId, profile) {
  const analysis = unwrap(analyzeDocument({ text, documentId }, profile, { maxSourceUtf8Bytes: 2_000_000, maxOccurrences: 50_000 }));
  return { analysis, result: unwrap(validateGraph(analysis, profile)) };
}
