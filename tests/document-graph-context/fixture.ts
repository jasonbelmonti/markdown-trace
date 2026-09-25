import { readFileSync } from "node:fs";
import {
  analyzeDocument,
  compileProfile,
  extractContext,
  traverseGraph,
  type ContextBudget,
  type DocumentAnalysis,
  type GraphSelection,
  type Outcome,
  type SourceRange,
  type TraversalQuery,
} from "../../src/markdowntrace/document-graph/index.js";

export function value<T>(outcome: Outcome<T>): T {
  if (!outcome.ok) throw new Error(JSON.stringify(outcome.error));
  return outcome.value;
}

export const profile = value(compileProfile(JSON.parse(
  readFileSync("fixtures/document-graph/profile.json", "utf8"),
)));
export const limits = { maxSourceUtf8Bytes: 100_000, maxOccurrences: 100 };
export const declaration = (id: string) => `[${id}](ctx://trace/entity/${id}?role=definition)`;
export const reference = (id: string, kind = "references") =>
  `[${id}](ctx://trace/entity/${id}?rel=${kind})`;

export function analyze(text: string, documentId = "context-proof.md"): DocumentAnalysis {
  return value(analyzeDocument({ documentId, text }, profile, limits));
}

export function select(
  analysis: DocumentAnalysis,
  roots: string[],
  overrides: Partial<TraversalQuery> = {},
): GraphSelection {
  return value(traverseGraph(analysis, {
    roots: roots as [string, ...string[]], direction: "outgoing", maxDepth: 0,
    maxNodes: roots.length, ...overrides,
  }));
}

export const generous: ContextBudget = { maxUtf8Bytes: 100_000, maxFragments: 100 };
export function project(
  analysis: DocumentAnalysis,
  selection: GraphSelection,
  budget: ContextBudget = generous,
) {
  return value(extractContext(analysis, { selection, budget }));
}

/** Locate a hand-written expected excerpt in the original fixture, never in the result. */
export function expectedRange(source: string, excerpt: string): SourceRange {
  const offset = source.indexOf(excerpt);
  if (offset < 0 || source.indexOf(excerpt, offset + 1) >= 0)
    throw new Error(`Expected exactly one occurrence of ${JSON.stringify(excerpt)}`);
  const position = (at: number) => {
    const before = source.slice(0, at);
    const lines = before.split(/\r\n|\r|\n/);
    return { offset: at, line: lines.length, column: lines.at(-1)!.length + 1 };
  };
  return { start: position(offset), end: position(offset + excerpt.length) };
}
