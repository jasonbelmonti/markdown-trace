import type {
  AnalysisSummary,
  DocumentAnalysis,
} from "./contracts/analysis.js";
import type {
  LookupResult,
  ReferencePage,
  ReferenceQuery,
} from "./contracts/query.js";
import type { Outcome } from "./contracts/source.js";
import { analysisState } from "./analysis-state.js";
import { failure, freeze, identifierPattern, slugPattern } from "./value.js";

const summary = (analysis: DocumentAnalysis): AnalysisSummary => ({
  analysisId: analysis.snapshot.analysisId,
  coverage: analysis.snapshot.coverage,
  diagnosticCount: analysis.snapshot.diagnostics.length,
});
export function lookupIdentifier(
  analysis: DocumentAnalysis,
  identifier: string,
): Outcome<LookupResult> {
  const state = analysisState(analysis);
  if (
    !state ||
    typeof identifier !== "string" ||
    !identifierPattern.test(identifier)
  )
    return failure(
      "invalid-input",
      "Expected an issued analysis and canonical identifier",
    );
  return freeze({
    ok: true,
    value: {
      ...summary(analysis),
      record: state.identifiers.get(identifier) ?? null,
      definitions: analysis.snapshot.occurrences.filter(
        (o) => o.identifier === identifier && o.role === "definition",
      ),
      referenceCount: state.incoming.get(identifier)?.length ?? 0,
    },
  });
}
function references(
  direction: "incoming" | "outgoing",
  analysis: DocumentAnalysis,
  identifier: string,
  query: ReferenceQuery,
): Outcome<ReferencePage> {
  const state = analysisState(analysis);
  if (
    !state ||
    typeof identifier !== "string" ||
    !identifierPattern.test(identifier) ||
    !query ||
    typeof query !== "object" ||
    Array.isArray(query) ||
    Object.keys(query).some(
      (k) => !["offset", "limit", "relations"].includes(k),
    )
  )
    return failure("invalid-input", "Invalid reference query");
  const { offset = 0, limit = 100, relations } = query;
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 1000 ||
    (relations !== undefined &&
      (!Array.isArray(relations) ||
        Object.keys(relations).length !== relations.length ||
        Object.keys(relations).some((key, i) => key !== String(i)) ||
        relations.some((r) => typeof r !== "string" || !slugPattern.test(r))))
  ) {
    return failure(
      "invalid-input",
      "Invalid reference filter or pagination bounds",
    );
  }
  const all = state[direction].get(identifier) ?? [],
    selected =
      relations === undefined
        ? all
        : all.filter((m) => relations.includes(m.relationship.kind));
  return freeze({
    ok: true,
    value: {
      ...summary(analysis),
      identifier,
      record: state.identifiers.get(identifier) ?? null,
      items: selected.slice(offset, offset + limit),
      offset,
      limit,
      totalMatches: selected.length,
      nextOffset: offset + limit < selected.length ? offset + limit : null,
    },
  });
}
export const findIncoming = (
  analysis: DocumentAnalysis,
  identifier: string,
  query: ReferenceQuery = {},
): Outcome<ReferencePage> =>
  references("incoming", analysis, identifier, query);
export const findOutgoing = (
  analysis: DocumentAnalysis,
  identifier: string,
  query: ReferenceQuery = {},
): Outcome<ReferencePage> =>
  references("outgoing", analysis, identifier, query);
