import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { documentQueries, normalize, parse } from "@jasonbelmonti/markdown-engine";

import { sortByRangeStart } from "./collections.mjs";
import { nodePathIndex } from "./document-context.mjs";
import { formatDiagnostics, formatSection, formatTable } from "./formatters.mjs";
import { collectRawIdOccurrences } from "./raw-id-occurrences.mjs";
import { buildCandidateTraceFacts } from "./trace-facts.mjs";
import { traceLinkOccurrence } from "./trace-link-occurrences.mjs";
import { parseTraceUrl } from "./trace-urls.mjs";

const SCRIPT_VERSION = "markdown-trace.r0.private-extractor.v1";

export async function extractTraceEvidence(documentPath) {
  const absolutePath = path.resolve(documentPath);
  const markdown = await readFile(absolutePath, "utf8");
  const parsed = parse(markdown, { path: displayPath(absolutePath) });
  const normalized = normalize(parsed.parsed);
  const document = normalized.document;
  const allNodes = documentQueries.nodes(document);
  const sections = sortByRangeStart(documentQueries.sections(document));
  const tables = sortByRangeStart(documentQueries.tables(document));
  const linkReferences = sortByRangeStart(documentQueries.linkReferences(document));
  const textSpans = sortByRangeStart(documentQueries.textSpans(document)).filter(
    (span) => span.target?.nodeType === "text",
  );
  const nodeByPath = nodePathIndex(allNodes);
  const tableCells = tables.flatMap((table, tableIndex) =>
    table.cells.map((cell) => ({ table, tableIndex, cell })),
  );
  const traceLinks = linkReferences
    .filter((link) => link.url !== undefined && parseTraceUrl(link.url) !== undefined)
    .map((link, index) =>
      traceLinkOccurrence({
        index,
        link,
        nodeByPath,
        sections,
        tableCells,
      }),
    );
  const rawIdOccurrences = collectRawIdOccurrences({
    sections,
    tableCells,
    textSpans,
    traceLinks,
  });
  const candidateTraceFacts = buildCandidateTraceFacts({ rawIdOccurrences, tables, traceLinks });

  return {
    schema: "markdown-trace.r0.trace-evidence.v1",
    extractor: {
      scriptVersion: SCRIPT_VERSION,
      publicEngineApis: ["parse", "normalize", "documentQueries"],
      outputContract: "private-r0-evidence",
    },
    source: {
      path: displayPath(absolutePath),
      absolutePath,
      sha256: sha256(markdown),
      bytes: Buffer.byteLength(markdown, "utf8"),
      lines: lineCount(markdown),
    },
    document: {
      version: document.version,
      path: document.path,
      diagnostics: [
        ...formatDiagnostics("parse", parsed.diagnostics),
        ...formatDiagnostics("normalize", normalized.diagnostics),
      ],
    },
    summary: {
      sectionCount: sections.length,
      tableCount: tables.length,
      traceLinkCount: traceLinks.length,
      rawIdOccurrenceCount: rawIdOccurrences.length,
      primaryDefinitionCount: candidateTraceFacts.primaryDefinitions.length,
      nonAuthoritativeCandidateCount:
        candidateTraceFacts.nonAuthoritativeEntityCandidates.length,
      entityReferenceCount: candidateTraceFacts.entityReferences.length,
      rangeReferenceCount: candidateTraceFacts.rangeReferences.length,
      candidateEdgeCount: candidateTraceFacts.candidateEdges.length,
      diagnosticHintCount: candidateTraceFacts.diagnosticHints.length,
    },
    sections: sections.map((section) => formatSection(section)),
    tables: tables.map((table, tableIndex) => formatTable(table, tableIndex, sections)),
    rawIdOccurrences,
    traceLinks,
    candidateTraceFacts,
  };
}

function displayPath(absolutePath) {
  const relativePath = path.relative(process.cwd(), absolutePath);

  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }

  return absolutePath;
}

function lineCount(text) {
  return text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}
