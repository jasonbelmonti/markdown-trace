import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { documentRuntimeInfo } from "./runtime-identity.js";
import { exportHtml } from "./export/html.js";
import {
  analyzeDocument, compileValidationProfile, exportMermaid,
  findIncoming, findOutgoing, lookupIdentifier, validateGraph,
  type Outcome,
} from "./index.js";

const help = `Usage: markdown-trace-document --file document.md --profile profile.json [options]

Experimental document-wide Trace validation. The profile must use
markdown-trace.validation-profile.experimental.v1. No default vocabulary.

--format report|graph|query|mermaid|html  Default: report
--identifier ID                     Required for query
--direction incoming|outgoing       Query direction; default: incoming
--offset N --limit N                Query page; defaults: 0, 100; limit <= 1000
--runtime-info                     Standalone runtime identity (no other arguments)
--help, -h                          Show this help

Report: validation JSON. Graph: { validation, graph } JSON.
Query: { validation, lookup, references } JSON, including pagination and ranges.
Mermaid: diagram on stdout, validation JSON on stderr (also on pass).
HTML: one visual report on stdout; its diagram loads Mermaid from a pinned CDN.
Exit 0: validation passed; 1: failed or indeterminate; 2: invocation/runtime error.
Invalid graphs remain available. An ID absent from the graph returns a null record.
Limits: 2,000,000 UTF-8 source bytes and 50,000 occurrences.
Reads local inputs; writes only stdout/stderr. Structural and semantic checks
belong to the document authoring workflow. No source edits or URI fetching.
`;

function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw Object.assign(new Error(result.error.message), result.error);
  return result.value;
}

function options(args: string[]) {
  const { values } = parseArgs({ args, options: {
    file: { type: "string" }, profile: { type: "string" },
    format: { type: "string", default: "report" },
    identifier: { type: "string" }, direction: { type: "string" },
    offset: { type: "string" }, limit: { type: "string" },
    help: { type: "boolean", short: "h" },
  } });
  if (values.help) return values;
  if (!values.file || !values.profile)
    throw new Error("Both --file and --profile are required; use --help.");
  if (!["report", "graph", "query", "mermaid", "html"].includes(values.format))
    throw new Error("Unknown --format; use --help.");
  if (values.format === "query") {
    if (!values.identifier) throw new Error("Query requires --identifier.");
    if (values.direction && !["incoming", "outgoing"].includes(values.direction))
      throw new Error("Query direction must be incoming or outgoing.");
  } else if ([values.identifier, values.direction, values.offset, values.limit].some(v => v !== undefined)) {
    throw new Error("Identifier, direction and pagination options require --format query.");
  }
  return values;
}

/** Thin local command adapter; all graph decisions belong to the public API. */
export async function runDocumentCommand(
  args: string[],
  io: { stdout: (text: string) => void; stderr: (text: string) => void },
): Promise<number> {
  const json = (data: unknown) => JSON.stringify(data, null, 2) + "\n";
  try {
    if (args.includes("--runtime-info")) {
      if (args.length !== 1) throw new Error("--runtime-info must be used alone.");
      io.stdout(json(documentRuntimeInfo()));
      return 0;
    }
    const flags = options(args);
    if (flags.help) { io.stdout(help); return 0; }
    const profile = value(compileValidationProfile(await readFile(flags.profile!, "utf8")));
    const documentId = resolve(flags.file!);
    const analysis = value(analyzeDocument(
      { documentId, text: await readFile(documentId, "utf8") }, profile,
      { maxSourceUtf8Bytes: 2_000_000, maxOccurrences: 50_000 },
    ));
    const validation = value(validateGraph(analysis, profile));
    switch (flags.format) {
      case "html":
        io.stdout(exportHtml(analysis, validation));
        break;
      case "graph":
        io.stdout(json({ validation, graph: analysis.snapshot }));
        break;
      case "query": {
        const lookup = value(lookupIdentifier(analysis, flags.identifier!));
        const query = {
          offset: flags.offset === undefined ? 0 : Number(flags.offset),
          limit: flags.limit === undefined ? 100 : Number(flags.limit),
        };
        const references = value((flags.direction === "outgoing" ? findOutgoing : findIncoming)(
          analysis, flags.identifier!, query,
        ));
        io.stdout(json({ validation, lookup, references }));
        break;
      }
      case "mermaid":
        io.stderr(json(validation));
        io.stdout(exportMermaid(analysis.snapshot));
        break;
      default:
        io.stdout(json(validation));
    }
    return validation.valid ? 0 : 1;
  } catch (error) {
    const failure = error as { code?: string; message?: string; diagnostics?: unknown };
    io.stderr(json({ valid: false, code: failure.code ?? "runtime-error",
      message: failure.message ?? String(error), diagnostics: failure.diagnostics }));
    return 2;
  }
}
