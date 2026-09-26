import type { CorpusOutcome, CorpusSelection, DocumentCorpus } from "./contracts.js";
import { corpusState } from "./state.js";
import { freeze } from "../value.js";
import { isIssuedCorpusSelection } from "./selection-state.js";

const error = <T>(code: "invalid-input" | "invalid-selection" | "stale-selection", message: string): CorpusOutcome<T> =>
  freeze({ ok: false as const, error: { code, message, diagnostics: [] } });

export function checkCorpusSelection(corpus: DocumentCorpus, selection: CorpusSelection): CorpusOutcome<CorpusSelection> {
  if (!corpusState(corpus)) return error("invalid-input", "Expected an issued corpus");
  if (!isIssuedCorpusSelection(selection)) return error("invalid-selection", "Expected an issued corpus selection");
  if (selection.corpusId !== corpus.snapshot.corpusId) return error("stale-selection", "Selection belongs to a different corpus");
  return freeze({ ok: true as const, value: selection });
}
