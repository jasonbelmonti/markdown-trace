import { documentQueries, type EngineNode, type EngineSection } from "@jasonbelmonti/markdown-engine";
import type { SourceRange } from "../contracts/source.js";
import { capturedSource } from "../analysis-state.js";
import type { CapturedProjectionSource } from "./capture.js";
import type { ProjectionDiagnosticCode, Selection } from "./contracts.js";
import { Coordinates } from "../coordinates.js";

export interface SelectedSource {
  readonly ranges: readonly { range: SourceRange; role: "source-selection" | "heading" | "structural-support" }[];
}
export type SourceSelection =
  | { readonly ok: true; readonly value: SelectedSource }
  | { readonly ok: false; readonly code: ProjectionDiagnosticCode };

const same = (a: SourceRange, b: SourceRange) =>
  a.start.offset === b.start.offset && a.end.offset === b.end.offset &&
  a.start.line === b.start.line && a.start.column === b.start.column &&
  a.end.line === b.end.line && a.end.column === b.end.column;

/** Resolve exact Engine section ancestry and captured source offsets. */
export function selectSource(source: CapturedProjectionSource, select: Selection): SourceSelection {
  const capture = capturedSource(source.analysis);
  if (!capture) return { ok: false, code: "unsupported-source-range" };
  const { document, text } = capture;
  const coordinates = new Coordinates(text);
  if (select.kind === "document")
    return { ok: true, value: { ranges: [{ range: coordinates.range(0, text.length), role: "source-selection" }] } };
  if (select.kind === "section") {
    const sections = documentQueries.sections(document);
    const byId = new Map(sections.map(section => [section.target.id, section]));
    const path = (section: EngineSection): string[] => {
      const result: string[] = [section.title];
      let parent = section.parentSection && byId.get(section.parentSection.id);
      const seen = new Set<string>([section.target.id]);
      while (parent && !seen.has(parent.target.id)) {
        seen.add(parent.target.id);
        result.unshift(parent.title);
        parent = parent.parentSection && byId.get(parent.parentSection.id);
      }
      return result;
    };
    const matches = sections.filter(section => JSON.stringify(path(section)) === JSON.stringify(select.path));
    if (matches.length !== 1) return { ok: false, code: matches.length ? "ambiguous-selector" : "missing-selector" };
    const chosen = matches[0];
    const heading = documentQueries.sourceSlice(document, chosen.headingTarget);
    const start = heading?.range.start.offset;
    if (start === undefined || !Number.isSafeInteger(start))
      return { ok: false, code: "unsupported-source-range" };
    const later = sections.map(section => ({ section, offset: documentQueries.sourceSlice(document, section.headingTarget)?.range.start.offset }))
      .filter(row => row.offset !== undefined && row.offset > start && row.section.depth <= chosen.depth)
      .sort((a, b) => (a.offset as number) - (b.offset as number));
    const end = later[0]?.offset ?? text.length;
    if (!Number.isSafeInteger(end) || end < start) return { ok: false, code: "unsupported-source-range" };
    const ranges: SelectedSource["ranges"][number][] = [];
    let parent = chosen.parentSection && byId.get(chosen.parentSection.id);
    const seen = new Set<string>();
    while (parent && !seen.has(parent.target.id)) {
      seen.add(parent.target.id);
      const ancestor = documentQueries.sourceSlice(document, parent.headingTarget);
      if (!ancestor?.range.start.offset && ancestor?.range.start.offset !== 0)
        return { ok: false, code: "unsupported-source-range" };
      ranges.unshift({ range: coordinates.range(ancestor.range.start.offset!, ancestor.range.end.offset!), role: "heading" });
      parent = parent.parentSection && byId.get(parent.parentSection.id);
    }
    ranges.push({ range: coordinates.range(start, end), role: "source-selection" });
    return { ok: true, value: { ranges } };
  }
  const supported = new Set(["paragraph", "listItem", "blockquote", "table", "code"]);
  const matches: EngineNode[] = documentQueries.nodes(document).filter(node =>
    supported.has(node.type) && !!node.source?.range && same(node.source.range as SourceRange, select.range));
  if (matches.length !== 1) return { ok: false, code: matches.length ? "ambiguous-selector" : "missing-selector" };
  const node = matches[0];
  const fragments = source.analysis.snapshot.fragments;
  const selectedFragments = fragments.filter(fragment =>
    fragment.range.start.offset < select.range.end.offset && fragment.range.end.offset > select.range.start.offset);
  if (!selectedFragments.length) return { ok: false, code: "unsupported-source-range" };
  const ranges: SelectedSource["ranges"][number][] = [
    { range: select.range, role: "source-selection" },
    ...selectedFragments.map(fragment => ({ range: fragment.range, role: "source-selection" as const })),
  ];
  const byId = new Map(fragments.map(fragment => [fragment.id, fragment]));
  const visited = new Set<string>(selectedFragments.map(fragment => fragment.id));
  const addSupport = (id: string): boolean => {
    if (visited.has(id)) return true;
    visited.add(id);
    const fragment = byId.get(id);
    if (!fragment) return false;
    ranges.push({ range: fragment.range, role: fragment.structure === "heading" ? "heading" : "structural-support" });
    return fragment.requiredContext.every(addSupport);
  };
  if (!selectedFragments.every(fragment => fragment.requiredContext.every(addSupport)))
    return { ok: false, code: "unsupported-source-range" };
  void node;
  return { ok: true, value: { ranges } };
}
