import type { CorpusCaptureSummary, QualifiedEntity } from "./contracts.js";

export const cmp = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
export const captureTuple = (a: CorpusCaptureSummary) => [a.source.documentId, a.source.sha256, a.analysisId] as const;
export const compareCapture = (a: CorpusCaptureSummary, b: CorpusCaptureSummary): number =>
  cmp(a.source.documentId, b.source.documentId) || cmp(a.source.sha256, b.source.sha256) || cmp(a.analysisId, b.analysisId);
export const compareEntity = (a: QualifiedEntity, b: QualifiedEntity, captures: ReadonlyMap<string, CorpusCaptureSummary>): number => {
  const ac = captures.get(a.analysisId), bc = captures.get(b.analysisId);
  if (ac && bc) return compareCapture(ac, bc) || cmp(a.identifier, b.identifier);
  if (ac) return -1;
  if (bc) return 1;
  return cmp(a.analysisId, b.analysisId) || cmp(a.identifier, b.identifier);
};
