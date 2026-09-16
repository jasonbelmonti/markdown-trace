import {
  normalize,
  documentQueries,
  parse,
  type EngineNode,
} from "@jasonbelmonti/markdown-engine";
import { Coordinates } from "./coordinates.js";
import type { Extraction, NodeInfo } from "./extraction-model.js";
import { sourceRange } from "./inline.js";
import { scanInline } from "./lexical.js";
import { AnalysisFailure } from "./value.js";

const containers = new Set(["listItem", "blockquote"]);
const literalBlocks = new Set([
  "code",
  "html",
  "definition",
  "yaml",
  "toml",
  "thematicBreak",
]);
export function extract(
  text: string,
  documentId: string,
  maxOccurrences: number,
): Extraction {
  const coordinates = new Coordinates(text),
    parsed = parse(text, { path: documentId });
  const normalized = normalize(parsed.parsed),
    output: Extraction = { blocks: [], diagnostics: [], exclusions: [] };
  const destinations = new Map(
    documentQueries
      .linkReferences(normalized.document)
      .filter(
        (link) =>
          (link.kind === "link" || link.kind === "linkReference") &&
          link.url !== undefined,
      )
      .map((link) => [link.target.id, link.url!]),
  );
  let occurrences = 0;
  for (const d of [...parsed.diagnostics, ...normalized.diagnostics]) {
    const start = d.sourceRange?.start.offset,
      end = d.sourceRange?.end.offset;
    if (d.severity === "info") continue;
    const diagnostic = {
      code: d.code,
      severity: d.severity,
      message: d.message,
      identifiers: [],
      sourceRanges:
        typeof start === "number" && typeof end === "number"
          ? [coordinates.range(start, end)]
          : [],
    };
    if (
      !output.diagnostics.some(
        (old) => JSON.stringify(old) === JSON.stringify(diagnostic),
      )
    )
      output.diagnostics.push(diagnostic);
  }
  function visit(node: EngineNode, parent?: NodeInfo, container?: NodeInfo) {
    const info: NodeInfo = {
      node,
      range: sourceRange(node, coordinates),
      depth: (parent?.depth ?? 0) + 1,
      parent,
      container,
    };
    const inline = node.type === "heading" || node.type === "paragraph",
      row = node.type === "tableRow";
    if (inline || row || literalBlocks.has(node.type)) {
      const tokens = inline
        ? scanInline(node, coordinates, output, destinations)
        : row
          ? (node.children ?? []).flatMap((cell) =>
              scanInline(cell, coordinates, output, destinations),
            )
          : [];
      occurrences += tokens.length;
      if (occurrences > maxOccurrences)
        throw new AnalysisFailure(
          "analysis-limit",
          "Document exceeds maxOccurrences",
        );
      output.blocks.push({
        ...info,
        tokens,
        id: `F${output.blocks.length + 1}`,
        header: row && parent?.node.children?.[0] === node,
      });
      if (literalBlocks.has(node.type))
        output.exclusions.push({
          range: info.range,
          reason: `literal-${node.type}`,
        });
    } else if (
      ["list", "listItem", "blockquote", "table"].includes(node.type)
    ) {
      for (const child of node.children ?? [])
        visit(child, info, containers.has(node.type) ? info : container);
    } else {
      output.diagnostics.push({
        code: "markdown-trace.language.unsupported-node",
        severity: "error",
        message: `Unsupported block node: ${node.type}`,
        identifiers: [],
        sourceRanges: [info.range],
      });
      output.exclusions.push({
        range: info.range,
        reason: `unsupported-${node.type}`,
      });
    }
  }
  normalized.document.children.forEach((node) => visit(node));
  return output;
}
