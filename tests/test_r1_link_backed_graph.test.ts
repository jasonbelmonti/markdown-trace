import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { deriveGraphFromMarkdown } from "../src/markdowntrace/graph/index.js";
import {
  DERIVED_EDGE_RELATIONSHIP,
  deriveRegistryResultFromMarkdown,
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
});
