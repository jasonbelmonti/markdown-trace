import { readFile } from "node:fs/promises";

import type { EntityRegistry } from "../registry/index.js";
import { findDefinitions } from "./definitions.js";
import { findIgnoredIssueKeys } from "./issueKeys.js";
import { getSectionBody, toSourceLines } from "./lineScanning.js";
import { findRanges } from "./ranges.js";
import { findReferences } from "./references.js";
import type {
  MarkdownRangeFact,
  MarkdownReferenceFact,
  MarkdownScanFacts,
} from "./types.js";

export async function scanMarkdown(
  documentPath: string,
  registry: EntityRegistry,
): Promise<MarkdownScanFacts> {
  const text = await readFile(documentPath, "utf8");
  return scanMarkdownText(documentPath, text, registry);
}

function scanMarkdownText(
  documentPath: string,
  text: string,
  registry: EntityRegistry,
): MarkdownScanFacts {
  const lines = toSourceLines(text);
  const definitions = findDefinitions(lines, registry.entities);
  const references = new Array<MarkdownReferenceFact>();
  const ranges = new Array<MarkdownRangeFact>();
  const ignoredIssueKeys = findIgnoredIssueKeys(lines, registry);

  for (const definition of definitions) {
    const sectionLines = getSectionBody(lines, definition.line);

    references.push(...findReferences(sectionLines, definition, registry));
    ranges.push(...findRanges(sectionLines, definition));
  }

  return {
    documentPath,
    definitions,
    references,
    ranges,
    ignoredIssueKeys,
  };
}
