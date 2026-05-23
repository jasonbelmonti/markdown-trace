import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  deriveGraphFromMarkdown,
  deriveGraphFromRegistry,
} from "../src/markdowntrace/graph/index.js";
import { TYPE_PROFILE_VERSION } from "../src/markdowntrace/profiles/model.js";
import {
  DERIVED_EDGE_RELATIONSHIP,
  deriveRegistryResultFromMarkdown,
  deriveRegistryResultFromMarkdownText,
} from "../src/markdowntrace/registry/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDocument = "fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md";
const profilePath = path.join(
  repoRoot,
  "fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml",
);
const documentPath = path.join(repoRoot, fixtureDocument);

describe("R1 link-backed registry and graph", () => {
  it("derives registry facts from a minimal ctx trace fixture and explicit type profile", async () => {
    const { registry, diagnostics } = await deriveRegistryResultFromMarkdown(documentPath, {
      documentPath: fixtureDocument,
      typeProfilePath: profilePath,
    });

    expect(diagnostics).toEqual([]);
    expect(registry.document).toMatchObject({
      id: "markdown-trace.r1.fixture.minimal-link-backed",
      title: "Minimal R1 Link-Backed Fixture",
      path: fixtureDocument,
      fixtureFamily: "r1-link-backed-entity-syntax",
    });
    expect(registry.entities.map((entity) => [entity.id, entity.label, entity.type])).toEqual([
      ["exec.con.1", "CON-1", "constraint"],
      ["exec.wp.1", "WP-1", "work_package"],
    ]);
    expect(registry.entitiesById.get("exec.wp.1")?.expectedReferences).toEqual({
      labels: ["CON-1"],
      ranges: [],
    });
    expect(registry.edges).toEqual([
      {
        source: "exec.wp.1",
        relationship: DERIVED_EDGE_RELATIONSHIP,
        target: "exec.con.1",
      },
    ]);
  });

  it("does not fall back to the R0 default entity type map for link-backed definitions", async () => {
    await expect(
      deriveRegistryResultFromMarkdown(documentPath, {
        documentPath: fixtureDocument,
        typeProfile: {
          profileVersion: "markdown-trace.type-profile.v1",
          entityTypes: {
            constraint: {
              labelPrefixes: ["CON"],
              canonicalPattern: "^exec\\.con\\.\\d+$",
            },
          },
        },
      }),
    ).rejects.toThrow("entity type 'work_package' is not declared by the active profile");
  });

  it("projects the minimal link-backed registry into a graph", async () => {
    const { graph, registry, diagnostics } = await deriveGraphFromMarkdown(documentPath, {
      documentPath: fixtureDocument,
      typeProfilePath: profilePath,
    });

    expect(diagnostics).toEqual([]);
    expect(graph).toEqual({
      nodes: registry.entities.map((entity) => ({
        id: entity.id,
        label: entity.label,
        type: entity.type,
      })),
      edges: [
        {
          source: "exec.wp.1",
          target: "exec.con.1",
        },
      ],
    });
  });

  it("derives graph facts for an R0-style link-backed reference and range parity case", () => {
    const { registry, diagnostics } = deriveLinkBackedRegistry(
      [
        "# Link-Backed R0 Parity Fixture",
        "",
        "### [CON-1](ctx://trace/entity/exec.con.1?type=constraint): First constraint",
        "",
        "### [CON-2](ctx://trace/entity/exec.con.2?type=constraint): Second constraint",
        "",
        "### [CON-3](ctx://trace/entity/exec.con.3?type=constraint): Third constraint",
        "",
        "### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Work package",
        "",
        "WP-1 depends on [CON-1](ctx://trace/entity/exec.con.1) and covers [CON-1 through CON-3](ctx://trace/range/CON-1/CON-3).",
      ],
      "link-backed-r0-parity.md",
    );

    expect(diagnostics).toEqual([]);
    expect(registry.entitiesById.get("exec.wp.1")?.expectedReferences).toEqual({
      labels: ["CON-1", "CON-2", "CON-3"],
      ranges: [
        {
          labelFamily: "CON",
          start: "CON-1",
          end: "CON-3",
          expandsTo: ["CON-1", "CON-2", "CON-3"],
        },
      ],
    });
    expect(deriveGraphFromRegistry(registry).edges).toEqual([
      {
        source: "exec.wp.1",
        target: "exec.con.1",
      },
      {
        source: "exec.wp.1",
        target: "exec.con.2",
      },
      {
        source: "exec.wp.1",
        target: "exec.con.3",
      },
    ]);
  });

  it("derives link-backed range facts for profiled hyphenated label prefixes", () => {
    const { registry, diagnostics } = deriveRegistryResultFromMarkdownText(
      [
        "# CODEFACTORY Range Fixture",
        "",
        "### [CF-COMP-1](ctx://trace/entity/codefactory.component.one?type=codefactory_component): First component",
        "",
        "CF-COMP-1 covers [CF-COMP-1 through CF-COMP-2](ctx://trace/range/CF-COMP-1/CF-COMP-2).",
        "",
        "### [CF-COMP-2](ctx://trace/entity/codefactory.component.two?type=codefactory_component): Second component",
      ].join("\n"),
      {
        documentPath: "codefactory-range.md",
        typeProfile: codefactoryComponentProfile,
      },
    );

    expect(diagnostics).toEqual([]);
    expect(
      registry.entitiesById.get("codefactory.component.one")?.expectedReferences,
    ).toEqual({
      labels: ["CF-COMP-2"],
      ranges: [
        {
          labelFamily: "CF-COMP",
          start: "CF-COMP-1",
          end: "CF-COMP-2",
          expandsTo: ["CF-COMP-1", "CF-COMP-2"],
        },
      ],
    });
    expect(deriveGraphFromRegistry(registry).edges).toEqual([
      {
        source: "codefactory.component.one",
        target: "codefactory.component.two",
      },
    ]);
  });

  it("rejects duplicate canonical ids for link-backed definitions deterministically", () => {
    expectLinkBackedDerivationError(
      [
        "# Duplicate Canonical Fixture",
        "",
        "### [CON-1](ctx://trace/entity/exec.con.1?type=constraint): First constraint",
        "",
        "### [CON-2](ctx://trace/entity/exec.con.1?type=constraint): Duplicate canonical id",
      ],
      "duplicate-canonical.md",
      "entities[].id contains duplicate value 'exec.con.1'",
    );
  });

  it("rejects duplicate labels for link-backed definitions deterministically", () => {
    expectLinkBackedDerivationError(
      [
        "# Duplicate Label Fixture",
        "",
        "### [CON-1](ctx://trace/entity/exec.con.1?type=constraint): First constraint",
        "",
        "### [CON-1](ctx://trace/entity/exec.con.2?type=constraint): Duplicate label",
      ],
      "duplicate-label.md",
      "entities[].label contains duplicate value 'CON-1'",
    );
  });

  it("rejects missing link-backed references before graph projection", () => {
    expectLinkBackedDerivationError(
      [
        "# Missing Reference Fixture",
        "",
        "### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Work package",
        "",
        "WP-1 depends on [CON-404](ctx://trace/entity/exec.con.404).",
      ],
      "missing-reference.md",
      "references unknown ctx://trace entity 'exec.con.404' (CON-404)",
    );
  });

  it("rejects incomplete link-backed ranges before graph projection", () => {
    expectLinkBackedDerivationError(
      [
        "# Incomplete Range Fixture",
        "",
        "### [CON-1](ctx://trace/entity/exec.con.1?type=constraint): First constraint",
        "",
        "### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Work package",
        "",
        "WP-1 covers [CON-1 through CON-2](ctx://trace/range/CON-1/CON-2).",
      ],
      "incomplete-range.md",
      "range endpoint 'CON-2' is not registered",
    );
  });

  it("rejects link-backed ranges with missing interior labels before graph projection", () => {
    expectLinkBackedDerivationError(
      [
        "# Interior Range Gap Fixture",
        "",
        "### [CON-1](ctx://trace/entity/exec.con.1?type=constraint): First constraint",
        "",
        "### [CON-3](ctx://trace/entity/exec.con.3?type=constraint): Third constraint",
        "",
        "### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Work package",
        "",
        "WP-1 covers [CON-1 through CON-3](ctx://trace/range/CON-1/CON-3).",
      ],
      "interior-range-gap.md",
      "range label 'CON-2' is not registered",
    );
  });
});

function deriveLinkBackedRegistry(markdownLines: readonly string[], documentPath: string) {
  return deriveRegistryResultFromMarkdownText(markdownLines.join("\n"), {
    documentPath,
    typeProfile: executionSpecProfile,
  });
}

function expectLinkBackedDerivationError(
  markdownLines: readonly string[],
  documentPath: string,
  message: string,
): void {
  expect(() => deriveLinkBackedRegistry(markdownLines, documentPath)).toThrow(message);
}

const executionSpecProfile = {
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

const codefactoryComponentProfile = {
  profileVersion: TYPE_PROFILE_VERSION,
  entityTypes: {
    codefactory_component: {
      labelPrefixes: ["CF-COMP"],
      canonicalPattern: "^codefactory\\.component\\.[a-z0-9.-]+$",
    },
  },
} as const;
