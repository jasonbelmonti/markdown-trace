import type { DocumentAnalysis } from "./contracts/analysis.js";
import type { ContextBundle, ContextRequest, ContextOmission } from "./contracts/context.js";
import type { Outcome } from "./contracts/source.js";
import { analysisState } from "./analysis-state.js";
import { buildEntityBundle } from "./context/bundles.js";
import { projectIntervals, type ContextClaim } from "./context/intervals.js";
import { issuedSelectionAnalysisId } from "./selection-state.js";
import { failure, freeze } from "./value.js";

function validRequest(value: unknown): value is ContextRequest {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const request = value as Record<string, unknown>;
  if (Object.keys(request).sort().join() !== "budget,selection") return false;
  const budget = request.budget;
  if (budget === null || typeof budget !== "object" || Array.isArray(budget)) return false;
  const fields = budget as Record<string, unknown>;
  return (
    Object.keys(fields).sort().join() === "maxFragments,maxUtf8Bytes" &&
    Number.isSafeInteger(fields.maxUtf8Bytes) &&
    (fields.maxUtf8Bytes as number) >= 0 &&
    Number.isSafeInteger(fields.maxFragments) &&
    (fields.maxFragments as number) >= 0
  );
}

/** Project only source captured by an issued analysis for an issued selection. */
export function extractContext(
  analysis: DocumentAnalysis,
  request: ContextRequest,
): Outcome<ContextBundle> {
  const state = analysisState(analysis);
  if (!state) return failure("invalid-input", "Expected an issued analysis");
  if (!validRequest(request))
    return failure("invalid-input", "Expected a context request with nonnegative safe-integer budgets");
  const selectionId = issuedSelectionAnalysisId(request.selection);
  if (selectionId === undefined)
    return failure("invalid-selection", "Expected an issued graph selection");
  const snapshot = analysis.snapshot;
  if (selectionId !== snapshot.analysisId)
    return failure("stale-selection", "Selection belongs to another analysis identity");

  const selection = request.selection;
  const selectionOrder = selection.nodes.map((node) => node.identifier);
  const includedIdentifiers: string[] = [];
  const omittedIdentifiers: ContextOmission[] = [];
  let admitted: ContextClaim[] = [];
  let projected = projectIntervals(state.text, admitted, selectionOrder);
  for (const identifier of selectionOrder) {
    const bundle = buildEntityBundle(snapshot, identifier);
    if (bundle.status === "ambiguous") {
      omittedIdentifiers.push(bundle.omission);
      continue;
    }
    const trial = projectIntervals(state.text, [...admitted, ...bundle.claims], selectionOrder);
    if (trial.usedUtf8Bytes > request.budget.maxUtf8Bytes) {
      omittedIdentifiers.push({ identifier, reason: "byte-budget" });
    } else if (trial.parts.length > request.budget.maxFragments) {
      omittedIdentifiers.push({ identifier, reason: "fragment-budget" });
    } else {
      admitted = [...admitted, ...bundle.claims];
      projected = trial;
      includedIdentifiers.push(identifier);
    }
  }

  const result: ContextBundle = {
    schemaVersion: "markdown-trace.document-context.v1",
    analysisId: snapshot.analysisId,
    coverage: snapshot.coverage,
    diagnosticCount: snapshot.diagnostics.length,
    source: snapshot.source,
    parts: projected.parts,
    includedIdentifiers,
    omittedIdentifiers,
    usedUtf8Bytes: projected.usedUtf8Bytes,
    selection: {
      query: selection.query,
      nodes: selection.nodes,
      boundary: selection.boundary,
    },
  };
  return freeze({ ok: true, value: result });
}
