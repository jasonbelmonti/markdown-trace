import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  documentQueries,
  normalize,
  parse,
  type EngineDocument,
  type EngineLinkReference,
  type EngineNode,
  type EngineSection,
} from "@jasonbelmonti/markdown-engine";
import { describe, expect, it } from "vitest";

import {
  collectTraceEntityDefinitions,
  collectTraceEntityReferences,
  collectTraceRangeReferences,
} from "../src/markdowntrace/markdown/trace-links.js";
import { TYPE_PROFILE_VERSION } from "../src/markdowntrace/profiles/model.js";
import {
  DERIVED_EDGE_RELATIONSHIP,
  deriveRegistryResultFromMarkdownText,
} from "../src/markdowntrace/registry/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = path.join(
  repoRoot,
  "fixtures/r1-link-backed-entity-syntax/syntax-breadth-link-backed-execution-spec.md",
);

interface ParsedFixture {
  readonly document: EngineDocument;
  readonly headings: readonly EngineNode[];
  readonly sections: readonly EngineSection[];
  readonly linkReferences: readonly EngineLinkReference[];
}

describe("R1 ctx trace link facts", () => {
  it("collects reference-style heading definitions equivalent to inline heading definitions", () => {
    const { headings, sections, linkReferences } = parseFixture();
    const definitions = collectTraceEntityDefinitions(headings, sections, linkReferences);

    expect(definitions.map((definition) => [definition.canonicalId, definition.label, definition.type]))
      .toEqual([
        ["exec.con.2", "CON-2", "constraint"],
        ["exec.val.1", "VAL-1", "validation_checkpoint"],
        ["exec.val.2", "VAL-2", "validation_checkpoint"],
        ["exec.wp.2", "WP-2", "work_package"],
        ["exec.ms.1", "MS-1", undefined],
      ]);
    expect(definitions.find((definition) => definition.canonicalId === "exec.con.2"))
      .toMatchObject({
        headingText: "### [CON-2]: Reference-style constraint",
        sourceRange: { start: { line: 12, column: 5 } },
        definitionSourceRange: { start: { line: 36, column: 1 } },
      });
    expect(definitions.find((definition) => definition.canonicalId === "exec.val.1"))
      .toMatchObject({
        headingText:
          "### [VAL-1](ctx://trace/entity/exec.val.1?type=validation_checkpoint): First checkpoint",
        sourceRange: { start: { line: 16, column: 5 } },
      });
  });

  it("does not collect image references as heading definitions", () => {
    const parsed = parse(
      [
        "# Image Reference Fixture",
        "",
        "### ![IMG-1][IMG-1]: Image is not an entity link",
        "",
        "[IMG-1]: ctx://trace/entity/exec.img.1?type=work_package",
      ].join("\n"),
      { path: "image-reference-fixture.md" },
    );
    const normalized = normalize(parsed.parsed);

    expect(parsed.diagnostics).toEqual([]);
    expect(normalized.diagnostics).toEqual([]);
    expect(
      collectTraceEntityDefinitions(
        documentQueries.nodes(normalized.document, { type: "heading" }),
        documentQueries.sections(normalized.document),
        documentQueries.linkReferences(normalized.document),
      ),
    ).toEqual([]);
  });

  it("collects reference-style body references with source evidence and repeated type data", () => {
    const { document, headings, sections, linkReferences } = parseFixture();
    const definitions = collectTraceEntityDefinitions(headings, sections, linkReferences);
    const references = collectTraceEntityReferences(document, definitions);
    const workPackageReferences = references.filter(
      (reference) => reference.sourceCanonicalId === "exec.wp.2",
    );

    expect(workPackageReferences).toEqual([
      expect.objectContaining({
        canonicalId: "exec.con.2",
        label: "CON-2",
        type: "constraint",
        sourceRange: expect.objectContaining({
          start: expect.objectContaining({ line: 26, column: 17 }),
        }),
        definitionSourceRange: expect.objectContaining({
          start: expect.objectContaining({ line: 36, column: 1 }),
        }),
      }),
      expect.objectContaining({
        canonicalId: "exec.con.2",
        label: "CON-2 as work package",
        type: "work_package",
        sourceRange: expect.objectContaining({
          start: expect.objectContaining({ line: 28, column: 59 }),
        }),
      }),
    ]);
  });

  it("collects bounded range references using author-facing label endpoints", () => {
    const { document, headings, sections, linkReferences } = parseFixture();
    const definitions = collectTraceEntityDefinitions(headings, sections, linkReferences);
    const ranges = collectTraceRangeReferences(document, definitions);

    expect(ranges).toEqual([
      expect.objectContaining({
        sourceCanonicalId: "exec.wp.2",
        label: "VAL-1 through VAL-2",
        start: "VAL-1",
        end: "VAL-2",
        sourceRange: expect.objectContaining({
          start: expect.objectContaining({ line: 26, column: 36 }),
        }),
      }),
    ]);
  });

  it("retains missing definition type facts for deterministic validation", () => {
    const { headings, sections, linkReferences } = parseFixture();
    const definitions = collectTraceEntityDefinitions(headings, sections, linkReferences);

    expect(definitions.find((definition) => definition.canonicalId === "exec.ms.1"))
      .toMatchObject({
        label: "MS-1",
        type: undefined,
        sourceRange: { start: { line: 32, column: 5 } },
      });
  });

  it("does not convert plain issue keys into R1 entity facts", () => {
    const { document, headings, sections, linkReferences } = parseFixture();
    const definitions = collectTraceEntityDefinitions(headings, sections, linkReferences);
    const references = collectTraceEntityReferences(document, definitions);
    const ranges = collectTraceRangeReferences(document, definitions);
    const serializedFacts = JSON.stringify({ definitions, references, ranges });

    expect(serializedFacts).not.toContain("BEL-858");
  });

  it("derives registry references and ranges from reference-style ctx trace links", () => {
    const { registry, diagnostics } = deriveRegistryResultFromMarkdownText(
      [
        "# Syntax Breadth Registry Fixture",
        "",
        "### [CON-2]: Reference-style constraint",
        "",
        "CON-2 is a dependency.",
        "",
        "### [VAL-1](ctx://trace/entity/exec.val.1?type=validation_checkpoint): First checkpoint",
        "",
        "VAL-1 starts the range.",
        "",
        "### [VAL-2](ctx://trace/entity/exec.val.2?type=validation_checkpoint): Second checkpoint",
        "",
        "VAL-2 ends the range.",
        "",
        "### [WP-2]: Reference-style work package",
        "",
        "WP-2 depends on [CON-2] and covers [VAL-1 through VAL-2](ctx://trace/range/VAL-1/VAL-2).",
        "",
        "[CON-2]: ctx://trace/entity/exec.con.2?type=constraint",
        "[WP-2]: ctx://trace/entity/exec.wp.2?type=work_package",
      ].join("\n"),
      {
        documentPath: "syntax-breadth-registry.md",
        typeProfile: syntaxBreadthProfile,
      },
    );

    expect(diagnostics).toEqual([]);
    expect(registry.entities.map((entity) => [entity.id, entity.label, entity.type])).toEqual([
      ["exec.con.2", "CON-2", "constraint"],
      ["exec.val.1", "VAL-1", "validation_checkpoint"],
      ["exec.val.2", "VAL-2", "validation_checkpoint"],
      ["exec.wp.2", "WP-2", "work_package"],
    ]);
    expect(registry.entitiesById.get("exec.wp.2")?.expectedReferences).toEqual({
      labels: ["CON-2", "VAL-1", "VAL-2"],
      ranges: [
        {
          labelFamily: "VAL",
          start: "VAL-1",
          end: "VAL-2",
          expandsTo: ["VAL-1", "VAL-2"],
        },
      ],
    });
    expect(registry.edges).toEqual([
      {
        source: "exec.wp.2",
        relationship: DERIVED_EDGE_RELATIONSHIP,
        target: "exec.con.2",
      },
      {
        source: "exec.wp.2",
        relationship: DERIVED_EDGE_RELATIONSHIP,
        target: "exec.val.1",
      },
      {
        source: "exec.wp.2",
        relationship: DERIVED_EDGE_RELATIONSHIP,
        target: "exec.val.2",
      },
    ]);
  });

  it("rejects missing definition types on the derived-registry path", () => {
    expect(() =>
      deriveRegistryResultFromMarkdownText(
        [
          "# Missing Type Registry Fixture",
          "",
          "### [MS-1](ctx://trace/entity/exec.ms.1): Missing type evidence",
        ].join("\n"),
        {
          documentPath: "missing-type-registry.md",
          typeProfile: syntaxBreadthProfile,
        },
      ),
    ).toThrow("ctx://trace definition for 'exec.ms.1' must include a type");
  });

  it("rejects repeated reference type mismatches on the derived-registry path", () => {
    expect(() =>
      deriveRegistryResultFromMarkdownText(
        [
          "# Type Mismatch Registry Fixture",
          "",
          "### [CON-2]: Reference-style constraint",
          "",
          "CON-2 is a dependency.",
          "",
          "### [WP-2](ctx://trace/entity/exec.wp.2?type=work_package): Work package",
          "",
          "WP-2 repeats the wrong type for [CON-2](ctx://trace/entity/exec.con.2?type=work_package).",
          "",
          "[CON-2]: ctx://trace/entity/exec.con.2?type=constraint",
        ].join("\n"),
        {
          documentPath: "type-mismatch-registry.md",
          typeProfile: syntaxBreadthProfile,
        },
      ),
    ).toThrow(
      "type-mismatch-registry.md reference to 'exec.con.2' declares type 'work_package' but definition uses 'constraint'",
    );
  });
});

function parseFixture(): ParsedFixture {
  const markdown = readFileSync(fixturePath, "utf8");
  const parsed = parse(markdown, { path: fixturePath });
  const normalized = normalize(parsed.parsed);

  expect(parsed.diagnostics).toEqual([]);
  expect(normalized.diagnostics).toEqual([]);

  return {
    document: normalized.document,
    headings: documentQueries.nodes(normalized.document, { type: "heading" }),
    sections: documentQueries.sections(normalized.document),
    linkReferences: documentQueries.linkReferences(normalized.document),
  };
}

const syntaxBreadthProfile = {
  profileVersion: TYPE_PROFILE_VERSION,
  entityTypes: {
    constraint: {
      labelPrefixes: ["CON"],
      canonicalPattern: "^exec\\.con\\.\\d+$",
    },
    validation_checkpoint: {
      labelPrefixes: ["VAL"],
      canonicalPattern: "^exec\\.val\\.\\d+$",
    },
    work_package: {
      labelPrefixes: ["WP"],
      canonicalPattern: "^exec\\.wp\\.\\d+$",
    },
  },
} as const;
