import type {
  Occurrence,
  Owner,
  SourceFragment,
} from "./contracts/analysis.js";
import type { Block } from "./extraction-model.js";

interface Scope {
  start: number;
  end: number;
  priority: number;
  declarations: Occurrence[];
}
export function assignOwners(
  blocks: Block[],
  occurrences: Occurrence[],
  sourceLength: number,
): SourceFragment[] {
  const scopes: Scope[] = [];
  for (const block of blocks) {
    const declarations = occurrences.filter(
      (o) => o.fragmentId === block.id && o.role === "definition",
    );
    if (!declarations.length) continue;
    let range = block.range,
      priority = block.depth * 10 + 9;
    if (block.node.type === "heading") {
      const level = Number(block.node.attributes?.depth);
      const next = blocks.find(
        (b) =>
          b.node.type === "heading" &&
          b.container === block.container &&
          b.range.start.offset > range.start.offset &&
          Number(b.node.attributes?.depth) <= level,
      );
      const end =
        next?.range.start.offset ??
        block.container?.range.end.offset ??
        sourceLength;
      scopes.push({
        start: range.start.offset,
        end,
        priority: block.depth * 10 + level,
        declarations,
      });
      continue;
    }
    if (
      block.node.type === "paragraph" &&
      block.parent?.node.type === "listItem" &&
      block.parent.node.children?.[0] === block.node
    ) {
      range = block.parent.range;
      priority = block.parent.depth * 10 + 9;
    }
    scopes.push({
      start: range.start.offset,
      end: range.end.offset,
      priority,
      declarations,
    });
  }
  function owner(block: Block): Owner {
    if (block.header && !block.tokens.length) return { status: "unowned" };
    const scope = scopes
      .filter(
        (s) =>
          s.start <= block.range.start.offset &&
          s.end >= block.range.end.offset,
      )
      .sort((a, b) => b.priority - a.priority)[0];
    if (!scope) return { status: "unowned" };
    const declarations = scope.declarations;
    if (declarations.length > 1)
      return {
        status: "ambiguous",
        declarationIds: declarations.map((d) => d.id) as [
          string,
          string,
          ...string[],
        ],
      };
    return {
      status: "owned",
      identifier: declarations[0].identifier,
      declarationId: declarations[0].id,
    };
  }
  return blocks.map((block) => ({
    id: block.id,
    range: block.range,
    owner: owner(block),
    structure:
      block.node.type === "heading"
        ? "heading"
        : block.node.type === "tableRow"
          ? "table-row"
          : block.node.type === "paragraph"
            ? "paragraph"
            : block.node.type === "code"
              ? "code"
              : "other",
    requiredContext: [],
  }));
}
