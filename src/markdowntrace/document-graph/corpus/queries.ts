import type { DocumentAnalysis, IdentifierRecord } from "../contracts/analysis.js";
import type { ReferenceQuery } from "../contracts/query.js";
import { freeze, identifierPattern, slugPattern } from "../value.js";
import type {
  CorpusCaptureSummary,
  CorpusLookupResult,
  CorpusOutcome,
  CorpusReference,
  CorpusReferencePage,
  DocumentCorpus,
  QualifiedEntity,
} from "./contracts.js";
import { corpusState, entityKey } from "./state.js";

const exactMatch = (pattern: RegExp, value: string): boolean => {
  const match = pattern.exec(value);
  return !!match && match[0] === value;
};
const dataRecord = (value: unknown, allowed: readonly string[]): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype &&
  Reflect.ownKeys(value).every((key) => typeof key === "string" && allowed.includes(key) &&
    Object.getOwnPropertyDescriptor(value, key)?.enumerable === true &&
    "value" in Object.getOwnPropertyDescriptor(value, key)!);
const validEntity = (value: unknown): value is QualifiedEntity =>
  dataRecord(value, ["analysisId", "identifier"]) &&
  typeof value.analysisId === "string" && exactMatch(/^[0-9a-f]{64}$/, value.analysisId) &&
  typeof value.identifier === "string" && exactMatch(identifierPattern, value.identifier);
const bad = <T>(message: string): CorpusOutcome<T> => freeze({
  ok: false as const,
  error: { code: "invalid-input" as const, message, diagnostics: [] },
});
const lookup = (
  corpusId: string,
  entity: QualifiedEntity,
  analyses: ReadonlyMap<string, DocumentAnalysis>,
  records: ReadonlyMap<string, ReadonlyMap<string, IdentifierRecord>>,
  captures: ReadonlyMap<string, CorpusCaptureSummary>,
  incoming: ReadonlyMap<string, readonly CorpusReference[]>,
): CorpusLookupResult => {
  const analysis = analyses.get(entity.analysisId);
  return {
    corpusId,
    entity: { analysisId: entity.analysisId, identifier: entity.identifier },
    capture: structuredClone(captures.get(entity.analysisId) ?? null),
    record: structuredClone(records.get(entity.analysisId)?.get(entity.identifier) ?? null),
    definitions: structuredClone(analysis?.snapshot.occurrences.filter((occurrence) =>
      occurrence.identifier === entity.identifier && occurrence.role === "definition") ?? []),
    referenceCount: incoming.get(entityKey(entity.analysisId, entity.identifier))?.length ?? 0,
  };
};

function queryReferences(
  direction: "incoming" | "outgoing",
  corpus: DocumentCorpus,
  entity: QualifiedEntity,
  query: ReferenceQuery,
): CorpusOutcome<CorpusReferencePage> {
  const state = corpusState(corpus);
  if (!state || !validEntity(entity) || !dataRecord(query, ["offset", "limit", "relations"]))
    return bad("Invalid corpus reference query");
  const { offset = 0, limit = 100, relations } = query;
  if (!Number.isSafeInteger(offset) || (offset as number) < 0 ||
      !Number.isSafeInteger(limit) || (limit as number) < 1 || (limit as number) > 1000 ||
      (relations !== undefined && (!Array.isArray(relations) ||
        Reflect.ownKeys(relations).length !== relations.length + 1 ||
        Reflect.ownKeys(relations).filter((key) => key !== "length").some((key, index) =>
          key !== String(index) || Object.getOwnPropertyDescriptor(relations, key)?.enumerable !== true ||
          !Object.getOwnPropertyDescriptor(relations, key) || !("value" in Object.getOwnPropertyDescriptor(relations, key)!)
        ) || relations.some((relation) => typeof relation !== "string" || !exactMatch(slugPattern, relation)))))
    return bad("Invalid reference filter or pagination bounds");

  const index = direction === "incoming" ? state.incoming : state.outgoing;
  const all = index.get(entityKey(entity.analysisId, entity.identifier)) ?? [];
  const selected = relations === undefined ? all : all.filter((reference) => relations.includes(reference.relationship.kind));
  const actualOffset = offset as number, actualLimit = limit as number;
  const page = selected.slice(actualOffset, actualOffset + actualLimit);
  return freeze({
    ok: true,
    value: {
      ...lookup(corpus.snapshot.corpusId, entity, state.analyses, state.records, state.captures, state.incoming),
      items: structuredClone(page),
      offset: actualOffset,
      limit: actualLimit,
      totalMatches: selected.length,
      nextOffset: actualOffset + actualLimit < selected.length ? actualOffset + actualLimit : null,
    },
  });
}

export function lookupCorpusIdentifier(corpus: DocumentCorpus, entity: QualifiedEntity): CorpusOutcome<CorpusLookupResult> {
  const state = corpusState(corpus);
  if (!state || !validEntity(entity)) return bad("Expected an issued corpus and canonical qualified identifier");
  return freeze({
    ok: true,
    value: lookup(corpus.snapshot.corpusId, entity, state.analyses, state.records, state.captures, state.incoming),
  });
}

export const findCorpusIncoming = (
  corpus: DocumentCorpus,
  entity: QualifiedEntity,
  query: ReferenceQuery = {},
): CorpusOutcome<CorpusReferencePage> => queryReferences("incoming", corpus, entity, query);

export const findCorpusOutgoing = (
  corpus: DocumentCorpus,
  entity: QualifiedEntity,
  query: ReferenceQuery = {},
): CorpusOutcome<CorpusReferencePage> => queryReferences("outgoing", corpus, entity, query);
