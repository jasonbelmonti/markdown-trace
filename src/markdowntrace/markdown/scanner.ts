import { readFile } from "node:fs/promises";

import {
  documentQueries,
  normalize,
  parse,
  type MarkdownDiagnostic,
} from "@jasonbelmonti/markdown-engine";

import type { EntityRegistry } from "../registry/index.js";
import { collectDefinitions } from "./definition-facts.js";
import {
  MARKDOWN_ENGINE_PACKAGE,
  type MarkdownAdapterDiagnostic,
  type MarkdownAdapterFacts,
} from "./model.js";
import { collectLabelReferences, collectRangeReferences } from "./reference-facts.js";

export async function scanMarkdown(
  path: string,
  registry: EntityRegistry,
): Promise<MarkdownAdapterFacts> {
  const markdown = await readFile(path, "utf8");
  const parsed = parse(markdown, { path });
  const normalized = normalize(parsed.parsed);
  const diagnostics = [
    ...toAdapterDiagnostics("parse", parsed.diagnostics),
    ...toAdapterDiagnostics("normalize", normalized.diagnostics),
  ];
  const sections = documentQueries.sections(normalized.document);
  const headings = documentQueries.nodes(normalized.document, { type: "heading" });
  const definitions = collectDefinitions(registry, headings, sections);

  return {
    metadata: {
      enginePackage: MARKDOWN_ENGINE_PACKAGE,
      documentVersion: normalized.document.version,
      sourcePath: path,
    },
    diagnostics,
    definitions,
    labelReferences: collectLabelReferences(registry, normalized.document, definitions),
    rangeReferences: collectRangeReferences(registry, normalized.document, definitions),
  };
}

function toAdapterDiagnostics(
  stage: MarkdownAdapterDiagnostic["stage"],
  diagnostics: readonly MarkdownDiagnostic[],
): readonly MarkdownAdapterDiagnostic[] {
  return diagnostics.map((diagnostic) => ({
    stage,
    code: diagnostic.code,
    message: diagnostic.message,
    severity: diagnostic.severity,
    sourceRange: diagnostic.sourceRange,
  }));
}
