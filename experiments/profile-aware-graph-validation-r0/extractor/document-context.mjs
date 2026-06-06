export function ancestorNodeKinds(target, nodeByPath) {
  return ancestorPathKeys(target)
    .map((key) => nodeByPath.get(key)?.type)
    .filter((kind) => kind !== undefined);
}

export function headingContextForTarget(nodeByPath, target) {
  for (const pathPart of ancestorPathKeys(target)) {
    const node = nodeByPath.get(pathPart);

    if (node?.type === "heading") {
      return {
        targetId: node.target?.id,
        text: node.text,
        sourceRange: formatRange(node.sourceRange),
      };
    }
  }

  return undefined;
}

export function nodePathIndex(nodes) {
  const index = new Map();

  for (const node of nodes) {
    if (Array.isArray(node.target?.path)) {
      index.set(node.target.path.join("."), node);
    }
  }

  return index;
}

export function sectionContextForRange(sections, sourceRange) {
  const offset = sourceRange?.start?.offset;

  if (offset === undefined) {
    return undefined;
  }

  const section = [...sections]
    .filter((candidate) => candidate.headingTarget.sourceRange?.start?.offset !== undefined)
    .filter((candidate) => candidate.headingTarget.sourceRange.start.offset <= offset)
    .at(-1);

  if (section === undefined) {
    return undefined;
  }

  return {
    targetId: section.target.id,
    headingTargetId: section.headingTarget.id,
    depth: section.depth,
    title: section.title,
  };
}

export function tableContextForCell(tableCells, tableIndex, cell) {
  const table = tableCells.find((candidate) => candidate.tableIndex === tableIndex)?.table;

  return {
    tableIndex,
    tableTargetId: table?.target.id,
    rowIndex: cell.rowIndex,
    columnIndex: cell.columnIndex,
    header: cell.header,
    columnHeader: table === undefined ? undefined : columnHeaderForCell(table, cell),
  };
}

export function tableContextForRange(tableCells, sourceRange) {
  const match = tableCells.find(({ cell }) => sourceRangeContains(cell.sourceRange, sourceRange));

  if (match === undefined) {
    return undefined;
  }

  return tableContextForCell(tableCells, match.tableIndex, match.cell);
}

export function columnHeaderForCell(table, cell) {
  return table.cells.find(
    (candidate) => candidate.header && candidate.columnIndex === cell.columnIndex,
  )?.text;
}

function ancestorPathKeys(target) {
  const pathParts = target?.path;

  if (!Array.isArray(pathParts)) {
    return [];
  }

  const keys = [];
  for (let length = pathParts.length; length >= 1; length -= 1) {
    keys.push(pathParts.slice(0, length).join("."));
  }
  return keys;
}

function sourceRangeContains(container, candidate) {
  const containerStart = container?.start?.offset;
  const containerEnd = container?.end?.offset;
  const candidateStart = candidate?.start?.offset;
  const candidateEnd = candidate?.end?.offset;

  return (
    containerStart !== undefined &&
    containerEnd !== undefined &&
    candidateStart !== undefined &&
    candidateEnd !== undefined &&
    candidateStart >= containerStart &&
    candidateEnd <= containerEnd
  );
}

function formatRange(sourceRange) {
  if (sourceRange === undefined) {
    return undefined;
  }

  return {
    start: {
      line: sourceRange.start.line,
      column: sourceRange.start.column,
      offset: sourceRange.start.offset,
    },
    end: {
      line: sourceRange.end.line,
      column: sourceRange.end.column,
      offset: sourceRange.end.offset,
    },
  };
}
