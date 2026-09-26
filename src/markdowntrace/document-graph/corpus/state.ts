import type { DocumentAnalysis, IdentifierRecord } from "../contracts/analysis.js";
import type { DocumentCorpus, CorpusCaptureSummary, CorpusReference } from "./contracts.js";

export interface CorpusState {
  analyses: ReadonlyMap<string, DocumentAnalysis>;
  records: ReadonlyMap<string, ReadonlyMap<string, IdentifierRecord>>;
  references: readonly CorpusReference[];
  captures: ReadonlyMap<string, CorpusCaptureSummary>;
  incoming: ReadonlyMap<string, readonly CorpusReference[]>;
  outgoing: ReadonlyMap<string, readonly CorpusReference[]>;
}
export const entityKey = (analysisId: string, identifier: string): string => `${analysisId}\0${identifier}`;
export function indexReferences(references: readonly CorpusReference[]): {
  incoming: Map<string, CorpusReference[]>;
  outgoing: Map<string, CorpusReference[]>;
} {
  const incoming = new Map<string, CorpusReference[]>(), outgoing = new Map<string, CorpusReference[]>();
  const append = (index: Map<string, CorpusReference[]>, key: string, reference: CorpusReference): void => {
    const items = index.get(key) ?? [];
    items.push(reference);
    index.set(key, items);
  };
  for (const reference of references) {
    if (reference.source) append(outgoing, entityKey(reference.source.analysisId, reference.source.identifier), reference);
    for (const target of reference.targets) append(incoming, entityKey(target.analysisId, target.identifier), reference);
  }
  return { incoming, outgoing };
}
const issued = new WeakMap<DocumentCorpus, CorpusState>();
export const registerCorpus = (corpus: DocumentCorpus, state: CorpusState): void => { issued.set(corpus, state); };
export const corpusState = (corpus: unknown): CorpusState | undefined => corpus !== null && typeof corpus === "object" ? issued.get(corpus as DocumentCorpus) : undefined;
