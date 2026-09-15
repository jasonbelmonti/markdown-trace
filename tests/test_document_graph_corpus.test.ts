import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileProfile,
  findIncoming,
  findOutgoing,
  lookupIdentifier,
  type Outcome,
  type Owner,
} from "../src/markdowntrace/document-graph/index.js";
import { profileInput } from "../docs/design/document-graph-api/examples/profile.js";

const base = resolve("docs/design/document-graph-api/examples/corpus");
const annotations = ["language", "scenarios"]
  .flatMap((dir) =>
    readdirSync(resolve(base, dir))
      .filter((f) => f.endsWith(".expected.json"))
      .map((f) => JSON.parse(readFileSync(resolve(base, dir, f), "utf8"))),
  )
  .filter((a) => !a.annotationRef);
function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}
const profile = value(compileProfile(profileInput));

describe("document-wide extraction against independently reviewed source annotations", () => {
  it.each(annotations)("$caseId: $source.file", (annotation) => {
    const text = readFileSync(resolve(base, annotation.source.file), "utf8");
    const analysis = value(
      analyzeDocument({ documentId: annotation.source.file, text }, profile, {
        maxSourceUtf8Bytes: 100_000,
        maxOccurrences: 10_000,
      }),
    );
    const graph = analysis.snapshot;
    const expectedOccurrences = new Map<string, any>(
      annotation.occurrences.map((o: any) => [o.id, o]),
    );
    const actualOccurrences = new Map(graph.occurrences.map((o) => [o.id, o]));
    const ownerOffsets = (owner: Owner) =>
      owner.status === "unowned"
        ? []
        : (owner.status === "owned"
            ? [owner.declarationId]
            : owner.declarationIds
          ).map((id) => actualOccurrences.get(id)!.range.start.offset);
    expect(graph.source.sha256).toBe(annotation.source.sha256);
    expect(graph.coverage).toBe(annotation.coverage);
    expect(
      graph.occurrences.map(({ identifier, role, range }) => ({
        identifier,
        role,
        range,
      })),
    ).toEqual(
      annotation.occurrences.map(({ identifier, role, range }: any) => ({
        identifier,
        role,
        range,
      })),
    );
    expect(
      graph.identifiers.map((i) => ({
        identifier: i.identifier,
        entityKind: i.entityKind,
        definitionStatus: i.definition.status,
      })),
    ).toEqual(
      annotation.identifiers.map(
        ({ identifier, entityKind, definitionStatus }: any) => ({
          identifier,
          entityKind,
          definitionStatus,
        }),
      ),
    );
    const edgeFact = (r: (typeof graph.relationships)[number]) => ({
      kind: r.kind,
      target: r.target,
      offset: actualOccurrences.get(r.occurrenceId)!.range.start.offset,
      owners: ownerOffsets(r.source),
    });
    const expectedEdges = annotation.relationships.map((r: any) => ({
      kind: r.kind,
      target: r.target,
      offset: expectedOccurrences.get(r.occurrenceId).range.start.offset,
      owners: r.owners.map(
        (id: string) => expectedOccurrences.get(id).range.start.offset,
      ),
    }));
    expect(graph.relationships.map(edgeFact)).toEqual(expectedEdges);
    expect(
      graph.diagnostics
        .filter(
          (d) => d.code === "markdown-trace.language.malformed-expression",
        )
        .map((d) => d.sourceRanges[0]),
    ).toEqual(annotation.languageDiagnostics.map((d: any) => d.range));
    const fragments = new Map(graph.fragments.map((f) => [f.id, f]));
    const checkSupport = (id: string, ancestors = new Set<string>()) => {
      expect(ancestors.has(id)).toBe(false);
      const fragment = fragments.get(id)!;
      expect(fragment).toBeDefined();
      for (const dependency of fragment.requiredContext)
        checkSupport(dependency, new Set(ancestors).add(id));
    };
    for (const fragment of graph.fragments) checkSupport(fragment.id);
    for (const occurrence of graph.occurrences) {
      const fragment = fragments.get(occurrence.fragmentId)!;
      expect(fragment.range.start.offset).toBeLessThanOrEqual(
        occurrence.range.start.offset,
      );
      expect(fragment.range.end.offset).toBeGreaterThanOrEqual(
        occurrence.range.end.offset,
      );
      expect(
        graph.exclusions.some(
          (e) =>
            e.range.start.offset < occurrence.range.end.offset &&
            e.range.end.offset > occurrence.range.start.offset,
        ),
      ).toBe(false);
    }
    for (const identifier of graph.identifiers.map((i) => i.identifier)) {
      const lookup = value(lookupIdentifier(analysis, identifier));
      expect(lookup.referenceCount).toBe(
        expectedEdges.filter((e: any) => e.target === identifier).length,
      );
      const incoming = value(findIncoming(analysis, identifier));
      expect(incoming.items.map((m) => edgeFact(m.relationship))).toEqual(
        expectedEdges.filter((e: any) => e.target === identifier),
      );
      const outgoing = value(findOutgoing(analysis, identifier));
      const declarationOffsets = annotation.occurrences
        .filter(
          (o: any) => o.role === "definition" && o.identifier === identifier,
        )
        .map((o: any) => o.range.start.offset);
      expect(outgoing.items.map((m) => edgeFact(m.relationship))).toEqual(
        expectedEdges.filter(
          (e: any) =>
            e.owners.length === 1 && declarationOffsets.includes(e.owners[0]),
        ),
      );
    }
  });
});
