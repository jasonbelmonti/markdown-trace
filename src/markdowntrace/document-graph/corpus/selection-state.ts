import type { CorpusSelection } from "./contracts.js";
import { freeze } from "../value.js";

const issued = new WeakSet<CorpusSelection>();

export function issueCorpusSelection<T extends object>(data: T): T {
  const selection = freeze(structuredClone(data)) as T & CorpusSelection;
  issued.add(selection);
  return selection;
}

export const isIssuedCorpusSelection = (value: unknown): value is CorpusSelection =>
  value !== null && typeof value === "object" && issued.has(value as CorpusSelection);
