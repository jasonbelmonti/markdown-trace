import type { GraphSnapshot } from "../contracts/analysis.js";

/**
 * Render an analyzer-produced snapshot (including a JSON round trip) as Mermaid.
 * This presentation adapter does not parse source, validate policy, or admit
 * arbitrary JSON. Nodes and relationships retain snapshot order.
 */
export function exportMermaid(snapshot: GraphSnapshot): string {
  return renderMermaid(snapshot, {
    direction: "LR",
    metadata: `Extraction: ${snapshot.coverage}<br/>Diagnostics: ${snapshot.diagnostics.length}; exclusions: ${snapshot.exclusions.length}<br/>Policy not evaluated`,
  });
}

/** Internal presentation options; facts and uncertainty always come from the snapshot. */
export function renderMermaid(snapshot: GraphSnapshot, presentation: {
  direction: "LR" | "TD";
  metadata?: string;
  labels?: ReadonlyMap<string, string>;
}): string {
  const nodes = new Map<string, string>();
  const occurrences = new Map(snapshot.occurrences.map((item) => [item.id, item]));
  const lines = [
    `flowchart ${presentation.direction}`,
  ];
  if (presentation.metadata) lines.push(`  graphStatus["${presentation.metadata}"]:::metadata`);

  snapshot.identifiers.forEach((record, index) => {
    const node = `n${index}`;
    nodes.set(record.identifier, node);
    const notes: string[] = [];
    if (record.entityKind === null) notes.push("unknown kind");
    if (record.definition.status === "missing") notes.push("missing definition");
    if (record.definition.status === "duplicate")
      notes.push(`duplicate definitions: ${record.definition.occurrenceIds.length}`);
    const suffix = notes.length ? ` (${notes.join("; ")})` : "";
    const style = record.definition.status === "resolved" ? "" : ":::unresolved";
    const title = presentation.labels?.get(record.identifier);
    const description = title && title !== record.identifier ? `<br/>${label(title)}` : "";
    lines.push(`  ${node}["${label(record.identifier + suffix)}${description}"]${style}`);
  });

  snapshot.relationships.forEach((relationship, index) => {
    let source: string;
    if (relationship.source.status === "owned") {
      source = nodes.get(relationship.source.identifier)!;
    } else {
      // One synthetic source per reference preserves uncertainty and multiplicity.
      source = `u${index}`;
      const position = occurrences.get(relationship.occurrenceId)!.range.start;
      const location = `${position.line}:${position.column}`;
      const description = relationship.source.status === "unowned"
        ? `Unowned reference at ${location}`
        : `Ambiguous owner at ${location}; candidates: ${relationship.source.declarationIds
          .map((id) => occurrences.get(id)!.identifier).join(", ")}`;
      lines.push(`  ${source}["${label(description)}"]:::unresolved`);
    }
    lines.push(`  ${source} -->|"${label(relationship.kind)}"| ${nodes.get(relationship.target)!}`);
  });

  lines.push(
    "  classDef metadata fill:#eef2ff,stroke:#6366f1,color:#111827",
    "  classDef unresolved fill:#fff7ed,stroke:#c2410c,color:#111827",
  );
  return lines.join("\n") + "\n";
}

// Keep presentation text literal; Mermaid uses #decimal; for entity escaping.
function label(text: string): string {
  return text.replace(/[&<>"#|`\\\r\n]/g, (character) => `#${character.charCodeAt(0)};`);
}
