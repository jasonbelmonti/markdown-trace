import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { documentCommandHelp, parseDocumentOptions } from "./command-options.js";
import { documentRuntimeInfo } from "./runtime-identity.js";
import { exportHtml } from "./export/html.js";
import {
  analyzeDocument, compileValidationProfile, exportMermaid,
  findIncoming, findOutgoing, lookupIdentifier, validateGraph, traverseGraph, extractContext,
  type Outcome,
} from "./index.js";

function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw Object.assign(new Error(result.error.message), result.error);
  return result.value;
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
    const flags = parseDocumentOptions(args);
    if (flags.help) { io.stdout(documentCommandHelp); return 0; }
    const profile = value(compileValidationProfile(await readFile(flags.profile!, "utf8")));
    const documentId = resolve(flags.file!);
    const analysis = value(analyzeDocument(
      { documentId, text: await readFile(documentId, "utf8") }, profile,
      { maxSourceUtf8Bytes: 2_000_000, maxOccurrences: 50_000 },
    ));
    const validation = value(validateGraph(analysis, profile));
    switch (flags.format) {
      case "context": {
        const { query, budget } = flags.context!;
        const selection = value(traverseGraph(analysis, query));
        const context = value(extractContext(analysis, { selection, budget }));
        io.stdout(json({ validation, context }));
        break;
      }
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
