import { sectionContextForRange } from "./document-context.mjs";

export function formatDiagnostics(stage, diagnostics) {
  return diagnostics.map((diagnostic) => ({
    stage,
    code: diagnostic.code,
    severity: diagnostic.severity,
    message: diagnostic.message,
    sourceRange: formatRange(diagnostic.sourceRange),
  }));
}

export function formatRange(sourceRange) {
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

export function formatSection(section) {
  return {
    targetId: section.target.id,
    headingTargetId: section.headingTarget.id,
    parentSectionTargetId: section.parentSection?.id,
    depth: section.depth,
    title: section.title,
    headingRange: formatRange(section.headingTarget.sourceRange),
    bodyTargetIds: section.bodyTargets.map((target) => target.id),
    childSectionTargetIds: section.childSections.map((target) => target.id),
  };
}

export function formatTable(table, tableIndex, sections) {
  return {
    tableIndex,
    targetId: table.target.id,
    sourceRange: formatRange(table.target.sourceRange),
    sectionContext: sectionContextForRange(sections, table.target.sourceRange),
    cells: table.cells.map((cell) => ({
      rowIndex: cell.rowIndex,
      columnIndex: cell.columnIndex,
      header: cell.header,
      text: cell.text,
      sourceRange: formatRange(cell.sourceRange),
      target: formatTarget(cell.target),
    })),
  };
}

export function formatTarget(target) {
  if (target === undefined) {
    return undefined;
  }

  return {
    kind: target.kind,
    id: target.id,
    path: target.path,
    nodeType: target.nodeType,
  };
}
