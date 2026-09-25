import type { GraphSelection } from "./contracts/query.js";
import { freeze } from "./value.js";

const issued = new WeakMap<GraphSelection, string>();

export function issueSelection<T extends { readonly analysisId: string }>(
  data: T,
): GraphSelection {
  const selection = freeze(data) as unknown as GraphSelection;
  issued.set(selection, data.analysisId);
  return selection;
}

export function issuedSelectionAnalysisId(value: unknown): string | undefined {
  return value !== null && typeof value === "object"
    ? issued.get(value as GraphSelection)
    : undefined;
}
