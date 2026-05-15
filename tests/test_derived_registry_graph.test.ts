import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  deriveGraphFromMarkdown,
  deriveGraphFromRegistry,
} from "../src/markdowntrace/graph/index.js";
import {
  DERIVED_EDGE_RELATIONSHIP,
  deriveRegistryFromMarkdown,
  deriveRegistryFromMarkdownText,
  deriveRegistryResultFromMarkdown,
  deriveRegistryResultFromMarkdownText,
} from "../src/markdowntrace/registry/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDocument = "fixtures/r0-document-local-registry/execution-spec.md";
const documentPath = path.join(repoRoot, fixtureDocument);

describe("derived registry and graph", () => {
  it("derives entities from entity-like headings without a sidecar registry", async () => {
    const registry = await deriveRegistryFromMarkdown(documentPath, {
      documentId: "markdown-trace.r0.fixture.execution",
      documentPath: fixtureDocument,
      namespace: "exec",
    });

    expect(registry.document).toMatchObject({
      id: "markdown-trace.r0.fixture.execution",
      title: "Markdown Trace R0 Fixture Execution Spec",
      path: fixtureDocument,
      fixtureFamily: "r0-document-local-registry",
    });
    expect(registry.entities.map((entity) => [entity.id, entity.label, entity.type])).toEqual([
      ["exec.con.1", "CON-1", "constraint"],
      ["exec.con.2", "CON-2", "constraint"],
      ["exec.con.3", "CON-3", "constraint"],
      ["exec.pkg.1", "PKG-1", "package_boundary"],
      ["exec.pkg.4", "PKG-4", "package_boundary"],
      ["exec.wp.1", "WP-1", "work_package"],
      ["exec.wp.2", "WP-2", "work_package"],
      ["exec.wp.3", "WP-3", "work_package"],
      ["exec.ms.1", "MS-1", "milestone"],
      ["exec.val.1", "VAL-1", "validation_checkpoint"],
      ["exec.val.2", "VAL-2", "validation_checkpoint"],
      ["exec.val.3", "VAL-3", "validation_checkpoint"],
      ["exec.evd.1", "EVD-1", "evidence_artifact"],
      ["exec.evd.2", "EVD-2", "evidence_artifact"],
    ]);
    expect(registry.entitiesByLabel.has("BEL-858")).toBe(false);
  });

  it("derives generic reference edges from labels and bounded ranges", async () => {
    const { registry, diagnostics } = await deriveRegistryResultFromMarkdown(documentPath, {
      documentPath: fixtureDocument,
      namespace: "exec",
    });
    const wp1 = registry.entitiesById.get("exec.wp.1");

    expect(diagnostics).toEqual([]);
    expect(wp1?.expectedReferences.labels).toEqual([
      "CON-1",
      "CON-2",
      "CON-3",
      "EVD-1",
      "PKG-1",
      "PKG-4",
      "VAL-1",
      "WP-2",
    ]);
    expect(wp1?.expectedReferences.ranges).toEqual([
      {
        labelFamily: "CON",
        start: "CON-1",
        end: "CON-3",
        expandsTo: ["CON-1", "CON-2", "CON-3"],
      },
    ]);
    expect(registry.edges).toContainEqual({
      source: "exec.wp.1",
      relationship: DERIVED_EDGE_RELATIONSHIP,
      target: "exec.con.2",
    });
    expect(registry.edges).not.toContainEqual({
      source: "exec.wp.1",
      relationship: DERIVED_EDGE_RELATIONSHIP,
      target: "exec.wp.1",
    });
  });

  it("derives interior references for bounded ranges beyond the fixture size", () => {
    const constraints = Array.from(
      { length: 201 },
      (_, index) => `### CON-${index + 1}: Constraint ${index + 1}\n`,
    ).join("\n");
    const registry = deriveRegistryFromMarkdownText(
      [
        "# Mission Plan",
        "",
        constraints,
        "### WP-1: Start",
        "",
        "WP-1 depends on CON-1 through CON-201.",
      ].join("\n"),
      { documentPath: "mission.md", namespace: "exec" },
    );
    const wp1 = registry.entitiesById.get("exec.wp.1");

    expect(wp1?.expectedReferences.ranges).toEqual([
      {
        labelFamily: "CON",
        start: "CON-1",
        end: "CON-201",
        expandsTo: Array.from({ length: 201 }, (_, index) => `CON-${index + 1}`),
      },
    ]);
    expect(wp1?.expectedReferences.labels).toHaveLength(201);
    expect(registry.edges).toContainEqual({
      source: "exec.wp.1",
      relationship: DERIVED_EDGE_RELATIONSHIP,
      target: "exec.con.2",
    });
    expect(registry.edges.filter((edge) => edge.source === "exec.wp.1")).toHaveLength(201);
  });

  it("bounds typo-sized range expansion to registered labels", () => {
    const registry = deriveRegistryFromMarkdownText(
      [
        "# Mission Plan",
        "",
        "### CON-1: First constraint",
        "",
        "### CON-2: Second constraint",
        "",
        "### CON-3: Third constraint",
        "",
        "### WP-1: Start",
        "",
        "WP-1 depends on CON-1 through CON-1000000000.",
      ].join("\n"),
      { documentPath: "mission.md", namespace: "exec" },
    );
    const wp1 = registry.entitiesById.get("exec.wp.1");

    expect(wp1?.expectedReferences.ranges).toEqual([
      {
        labelFamily: "CON",
        start: "CON-1",
        end: "CON-1000000000",
        expandsTo: ["CON-1", "CON-2", "CON-3"],
      },
    ]);
    expect(wp1?.expectedReferences.labels).toEqual([
      "CON-1",
      "CON-1000000000",
      "CON-2",
      "CON-3",
    ]);
    expect(registry.edges.filter((edge) => edge.source === "exec.wp.1")).toEqual([
      {
        source: "exec.wp.1",
        relationship: DERIVED_EDGE_RELATIONSHIP,
        target: "exec.con.1",
      },
      {
        source: "exec.wp.1",
        relationship: DERIVED_EDGE_RELATIONSHIP,
        target: "exec.con.2",
      },
      {
        source: "exec.wp.1",
        relationship: DERIVED_EDGE_RELATIONSHIP,
        target: "exec.con.3",
      },
    ]);
  });

  it("projects the derived registry into a relationship-agnostic graph", async () => {
    const { registry, graph, diagnostics } = await deriveGraphFromMarkdown(documentPath, {
      documentPath: fixtureDocument,
      namespace: "exec",
    });

    expect(diagnostics).toEqual([]);
    expect(graph).toEqual(deriveGraphFromRegistry(registry));
    expect(graph.nodes).toContainEqual({
      id: "exec.wp.1",
      label: "WP-1",
      type: "work_package",
    });
    expect(graph.edges).toContainEqual({
      source: "exec.wp.1",
      target: "exec.con.2",
    });
  });

  it("accepts document-local frontmatter metadata for derived registries", () => {
    const { registry, diagnostics } = deriveRegistryResultFromMarkdownText(
      [
        "---",
        "markdownTrace:",
        "  namespace: ops",
        "  documentId: ops.mission",
        "  title: Mission Plan",
        "  fixtureFamily: mission-fixture",
        "  sourceDocs:",
        "    - docs/source.md",
        "  entityTypes:",
        "    WP: mission_work",
        "    VAL: mission_gate",
        "  externalRefs:",
        "    - system: linear",
        "      key: BEL-1",
        "      relatedEntity: ops.wp.1",
        "      role: task_of_record",
        "---",
        "# Mission Plan",
        "",
        "### WP-1: Start",
        "",
        "WP-1 produces VAL-1.",
        "",
        "### VAL-1: Check",
      ].join("\n"),
      { documentPath: "mission.md" },
    );

    expect(diagnostics).toEqual([]);
    expect(registry.document).toEqual({
      id: "ops.mission",
      title: "Mission Plan",
      path: "mission.md",
      fixtureFamily: "mission-fixture",
      sourceDocs: ["docs/source.md"],
    });
    expect(registry.entities.map((entity) => [entity.id, entity.type])).toEqual([
      ["ops.wp.1", "mission_work"],
      ["ops.val.1", "mission_gate"],
    ]);
    expect(registry.externalRefs).toEqual([
      {
        system: "linear",
        key: "BEL-1",
        relatedEntity: "ops.wp.1",
        role: "task_of_record",
      },
    ]);
  });

  it("lets caller options override frontmatter entity type policy", () => {
    const registry = deriveRegistryFromMarkdownText(
      [
        "---",
        "markdownTrace:",
        "  namespace: ops",
        "  entityTypes:",
        "    WP: frontmatter_work",
        "---",
        "# Mission Plan",
        "",
        "### WP-1: Start",
      ].join("\n"),
      {
        documentPath: "mission.md",
        entityTypes: {
          WP: "option_work",
        },
      },
    );

    expect(registry.entitiesById.get("ops.wp.1")?.type).toBe("option_work");
  });

  it("rejects documents with error-severity parser diagnostics", () => {
    expect(() =>
      deriveRegistryResultFromMarkdownText(
        [
          "---",
          "markdownTrace: [unterminated",
          "---",
          "# Mission Plan",
          "",
          "### WP-1: Start",
        ].join("\n"),
        { documentPath: "mission.md" },
      ),
    ).toThrow(/mission\.md has parse diagnostic frontmatter\.yaml\.invalid/);
  });
});
