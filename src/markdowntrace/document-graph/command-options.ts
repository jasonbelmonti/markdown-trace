import { parseArgs } from "node:util";
import type { ContextBudget } from "./contracts/context.js";
import type { TraversalQuery } from "./contracts/query.js";

export const documentCommandHelp = `Usage: markdown-trace-document --file document.md --profile profile.json [options]

Experimental document-wide Trace validation and source context projection.
The profile must use markdown-trace.validation-profile.experimental.v1.
No default vocabulary. Context roots require unique ctx:// definitions.

--format report|graph|query|context|mermaid|html  Default: report
--identifier ID                     Required for query
--direction incoming|outgoing|both  Query: incoming (both forbidden); context: outgoing
--offset N --limit N                Query page; defaults: 0, 100; limit <= 1000
--root ID                          Context root; repeat for multiple roots (required)
--relation KIND                    Context edge filter; repeat (default: all relations)
--max-depth N --max-nodes N         Context traversal limits (both required)
--max-utf8-bytes N --max-fragments N Context source budgets (both required)
--runtime-info                     Standalone runtime identity (no other arguments)
--help, -h                          Show this help

Report: validation JSON. Graph: { validation, graph } JSON.
Query: { validation, lookup, references } JSON, including pagination and ranges.
Context: { validation, context } JSON with exact source parts, provenance,
selection boundaries and omissions. Limits are nonnegative safe integers;
max-nodes must cover all distinct roots. Zero budgets may omit all context.
Byte/fragment budgets count source parts, not the serialized JSON or tokens.
Exit 0 does not certify complete context: inspect boundaries and omissions.
Mermaid: diagram on stdout, validation JSON on stderr (also on pass).
HTML: one visual report on stdout; its diagram loads Mermaid from a pinned CDN.
Exit 0: validation passed; 1: failed or indeterminate; 2: invocation/runtime error.
Invalid graphs remain available. An ID absent from a query returns a null record;
an unresolved context root is an error. Validation failures retain available context.
Limits: 2,000,000 UTF-8 source bytes and 50,000 occurrences.
Reads local inputs; writes only stdout/stderr. Structural and semantic checks
belong to the document authoring workflow. No source edits or URI fetching.
`;

const contextLimits = ["max-depth", "max-nodes", "max-utf8-bytes", "max-fragments"] as const;

function integer(name: string, raw: string | undefined): number {
  if (raw === undefined || !/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)))
    throw new Error(`Context requires --${name} as a nonnegative safe integer.`);
  return Number(raw);
}

export function parseDocumentOptions(args: string[]) {
  const { values } = parseArgs({ args, options: {
    file: { type: "string" }, profile: { type: "string" },
    format: { type: "string", default: "report" },
    identifier: { type: "string" }, direction: { type: "string" },
    offset: { type: "string" }, limit: { type: "string" },
    root: { type: "string", multiple: true }, relation: { type: "string", multiple: true },
    "max-depth": { type: "string" }, "max-nodes": { type: "string" },
    "max-utf8-bytes": { type: "string" }, "max-fragments": { type: "string" },
    help: { type: "boolean", short: "h" },
  } });
  let context: { query: TraversalQuery; budget: ContextBudget } | undefined;
  if (values.help) return { ...values, context };
  if (!values.file || !values.profile)
    throw new Error("Both --file and --profile are required; use --help.");
  if (!["report", "graph", "query", "context", "mermaid", "html"].includes(values.format))
    throw new Error("Unknown --format; use --help.");
  if (values.format !== "context" &&
      [values.root, values.relation, ...contextLimits.map(name => values[name])].some(v => v !== undefined))
    throw new Error("Roots, relation filters and context limits require --format context.");
  if (values.format !== "query" &&
      [values.identifier, values.offset, values.limit].some(v => v !== undefined))
    throw new Error("Identifier and pagination options require --format query.");
  if (values.format === "query") {
    if (!values.identifier) throw new Error("Query requires --identifier.");
    if (values.direction && !["incoming", "outgoing"].includes(values.direction))
      throw new Error("Query direction must be incoming or outgoing.");
  } else if (values.format === "context") {
    if (!values.root?.length) throw new Error("Context requires at least one --root.");
    const direction = values.direction ?? "outgoing";
    if (direction !== "incoming" && direction !== "outgoing" && direction !== "both")
      throw new Error("Context direction must be incoming, outgoing or both.");
    context = {
      query: {
        roots: values.root as [string, ...string[]], direction,
        ...(values.relation === undefined ? {} : { relations: values.relation }),
        maxDepth: integer("max-depth", values["max-depth"]),
        maxNodes: integer("max-nodes", values["max-nodes"]),
      },
      budget: {
        maxUtf8Bytes: integer("max-utf8-bytes", values["max-utf8-bytes"]),
        maxFragments: integer("max-fragments", values["max-fragments"]),
      },
    };
  } else if (values.direction !== undefined) {
    throw new Error("Direction requires --format query or context.");
  }
  return { ...values, context };
}
