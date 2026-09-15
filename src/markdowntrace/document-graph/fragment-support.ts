import type { SourceFragment } from "./contracts/analysis.js";
import type { Block } from "./extraction-model.js";
import { Coordinates } from "./coordinates.js";

// Capture support using Engine block boundaries. Context projection is a separate API.
export function attachSupport(
  fragments: SourceFragment[],
  blocks: Block[],
  text: string,
): SourceFragment[] {
  const coordinates = new Coordinates(text);
  const headings = blocks
    .filter((b) => b.node.type === "heading")
    .map((block) => ({
      block,
      end:
        blocks.find(
          (b) =>
            b.node.type === "heading" &&
            b.container === block.container &&
            b.range.start.offset > block.range.start.offset &&
            Number(b.node.attributes?.depth) <=
              Number(block.node.attributes?.depth),
        )?.range.start.offset ??
        block.container?.range.end.offset ??
        text.length,
    }));
  const tableSupport = new Map<Block["parent"], string[]>(),
    delimiters: SourceFragment[] = [];
  for (const header of blocks.filter((b) => b.header)) {
    const table = header.parent!;
    const next = blocks.find((b) => b.parent === table && b !== header);
    let start = header.range.end.offset,
      end = next?.range.start.offset ?? table.range.end.offset;
    while (start < end && /[\r\n]/.test(text[start])) start++;
    while (end > start && /[\r\n]/.test(text[end - 1])) end--;
    const ids = [header.id];
    if (end > start) {
      const id = `S${delimiters.length + 1}`;
      delimiters.push({
        id,
        range: coordinates.range(start, end),
        owner: { status: "unowned" },
        structure: "other",
        requiredContext: [],
      });
      ids.push(id);
    }
    tableSupport.set(table, ids);
  }
  return [
    ...fragments.map((fragment, i) => {
      const block = blocks[i];
      const support = headings
        .filter(
          (h) =>
            h.block !== block &&
            h.block.range.start.offset < block.range.start.offset &&
            h.end >= block.range.end.offset,
        )
        .map((h) => h.block.id);
      if (block.node.type === "tableRow")
        support.push(
          ...(tableSupport.get(block.parent) ?? []).filter(
            (id) => id !== block.id,
          ),
        );
      let start = fragment.range.start.offset;
      if (
        block.parent &&
        ["listItem", "blockquote"].includes(block.parent.node.type)
      )
        start = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      return {
        ...fragment,
        range: coordinates.range(start, fragment.range.end.offset),
        requiredContext: [...new Set(support)],
      };
    }),
    ...delimiters,
  ].sort((a, b) => a.range.start.offset - b.range.start.offset);
}
