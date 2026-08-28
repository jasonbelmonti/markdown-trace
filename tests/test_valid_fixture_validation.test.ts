import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { MARKDOWN_ENGINE_PACKAGE_VERSION } from "../src/markdowntrace/generated/release-metadata.js";
import { scanMarkdown } from "../src/markdowntrace/markdown/index.js";
import { EntityRegistry, loadRegistry } from "../src/markdowntrace/registry/index.js";
import { validate } from "../src/markdowntrace/validation/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(
  repoRoot,
  "fixtures/r0-document-local-registry/entity-registry.yaml",
);
const documentPath = path.join(repoRoot, "fixtures/r0-document-local-registry/execution-spec.md");

describe("validate", () => {
  it("returns a deterministic passing result with 0 findings for the valid fixture", async () => {
    const registry = await loadRegistry(registryPath);
    const adapterFacts = await scanMarkdown(documentPath, registry);
    const firstResult = validate(registry, adapterFacts);
    const secondResult = validate(registry, adapterFacts);

    expect(firstResult).toEqual(secondResult);
    expect(firstResult.valid).toBe(true);
    expect(firstResult.findings).toEqual([]);
    expect(firstResult.summary).toEqual({
      entities: registry.entities.length,
      definitionsResolved: registry.entities.length,
      expectedReferencesResolved: 12,
      expectedRangesResolved: 1,
      edgesResolved: registry.edges.length,
      findings: 0,
    });
    expect(firstResult.metadata.enginePackage.version).toBe(MARKDOWN_ENGINE_PACKAGE_VERSION);
    expect(firstResult.metadata.documentVersion).toBe("1.0.0");
  });

  it("does not expand range labels without explicit bounded range syntax", async () => {
    const registry = await loadRegistry(registryPath);
    const documentText = await readFile(documentPath, "utf8");
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-range-"));

    try {
      const temporaryPath = path.join(temporaryDirectory, "execution-spec.md");
      await writeFile(
        temporaryPath,
        documentText.replace("CON-1 through CON-3", "CON-1 and CON-3"),
        "utf8",
      );

      const adapterFacts = await scanMarkdown(temporaryPath, registry);
      const result = validate(registry, adapterFacts);

      expect(adapterFacts.rangeReferences).toEqual([]);
      expect(result.valid).toBe(false);
      expect(result.findings).toEqual([
        expect.objectContaining({
          category: "missing_expected_range",
          entityId: "exec.wp.1",
          label: "CON-1..CON-3",
        }),
        expect.objectContaining({
          category: "missing_expected_reference",
          entityId: "exec.wp.1",
          label: "CON-2",
        }),
      ]);
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it("reports unregistered entity-like labels from registered label families", async () => {
    const registry = await loadRegistry(registryPath);
    const documentText = await readFile(documentPath, "utf8");
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-label-"));

    try {
      const temporaryPath = path.join(temporaryDirectory, "execution-spec.md");
      await writeFile(
        temporaryPath,
        documentText.replace(
          "### WP-1: Create fixture family, YAML registry shape, and test scaffolding",
          "### WP-1: Create fixture family, YAML registry shape, and test scaffolding\n\nThis references WP-99.",
        ),
        "utf8",
      );

      const adapterFacts = await scanMarkdown(temporaryPath, registry);
      const result = validate(registry, adapterFacts);

      expect(adapterFacts.labelReferences).toContainEqual(
        expect.objectContaining({
          sourceEntityId: "exec.wp.1",
          label: "WP-99",
        }),
      );
      expect(result.findings).toContainEqual(
        expect.objectContaining({
          category: "missing_reference",
          entityId: "exec.wp.1",
          label: "WP-99",
        }),
      );
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it("reports unregistered expected labels declared by the registry", async () => {
    const registry = await loadRegistry(registryPath);
    const registryWithStaleExpectedLabel = new EntityRegistry({
      registryVersion: registry.registryVersion,
      document: registry.document,
      entities: registry.entities.map((entity) =>
        entity.id === "exec.wp.1"
          ? {
              ...entity,
              expectedReferences: {
                ...entity.expectedReferences,
                labels: [...entity.expectedReferences.labels, "VAL-99"],
              },
            }
          : entity,
      ),
      edges: registry.edges,
      externalRefs: registry.externalRefs,
    });

    const adapterFacts = await scanMarkdown(documentPath, registryWithStaleExpectedLabel);
    const result = validate(registryWithStaleExpectedLabel, adapterFacts);

    expect(result.valid).toBe(false);
    expect(result.summary.expectedReferencesResolved).toBe(12);
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        category: "missing_reference",
        entityId: "exec.wp.1",
        label: "VAL-99",
      }),
    );
  });

  it("preserves unmatched range syntax for incomplete range validation", async () => {
    const registry = await loadRegistry(registryPath);
    const documentText = await readFile(documentPath, "utf8");
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-range-"));

    try {
      const temporaryPath = path.join(temporaryDirectory, "execution-spec.md");
      await writeFile(
        temporaryPath,
        documentText.replace("CON-1 through CON-3", "CON-1 through CON-4"),
        "utf8",
      );

      const adapterFacts = await scanMarkdown(temporaryPath, registry);
      const result = validate(registry, adapterFacts);

      expect(adapterFacts.rangeReferences).toContainEqual(
        expect.objectContaining({
          sourceEntityId: "exec.wp.1",
          start: "CON-1",
          end: "CON-4",
          declared: false,
          expandsTo: [],
        }),
      );
      expect(result.findings).toContainEqual(
        expect.objectContaining({
          category: "incomplete_range",
          entityId: "exec.wp.1",
          label: "CON-4",
        }),
      );
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it("reports missing interior labels inside declared bounded ranges", async () => {
    const registry = await loadRegistry(registryPath);
    const sourceEntity = registry.entitiesById.get("exec.wp.1");
    const sourceRange = sourceEntity?.expectedReferences.ranges[0];

    if (sourceRange === undefined) {
      throw new Error("exec.wp.1 fixture range is required for this regression");
    }

    const rangeWithMissingInterior = {
      ...sourceRange,
      expandsTo: ["CON-1", "CON-2", "CON-99", "CON-3"],
    };
    const registryWithIncompleteRange = new EntityRegistry({
      registryVersion: registry.registryVersion,
      document: registry.document,
      entities: registry.entities.map((entity) =>
        entity.id === "exec.wp.1"
          ? {
              ...entity,
              expectedReferences: {
                ...entity.expectedReferences,
                ranges: [rangeWithMissingInterior],
              },
            }
          : entity,
      ),
      edges: registry.edges,
      externalRefs: registry.externalRefs,
    });

    const adapterFacts = await scanMarkdown(documentPath, registryWithIncompleteRange);
    const result = validate(registryWithIncompleteRange, adapterFacts);

    expect(adapterFacts.rangeReferences).toContainEqual(
      expect.objectContaining({
        sourceEntityId: "exec.wp.1",
        start: "CON-1",
        end: "CON-3",
        declared: true,
        expandsTo: ["CON-1", "CON-2", "CON-99", "CON-3"],
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.summary.expectedRangesResolved).toBe(0);
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        category: "incomplete_range",
        entityId: "exec.wp.1",
        label: "CON-99",
      }),
    );
    expect(result.findings).not.toContainEqual(
      expect.objectContaining({
        category: "missing_expected_range",
        entityId: "exec.wp.1",
        label: "CON-1..CON-3",
      }),
    );
  });

  it("counts resolved edges by edge instead of missing endpoint findings", async () => {
    const registry = await loadRegistry(registryPath);
    const adapterFacts = await scanMarkdown(documentPath, registry);
    const registryWithBrokenEdge = new EntityRegistry({
      registryVersion: registry.registryVersion,
      document: registry.document,
      entities: registry.entities,
      edges: [
        ...registry.edges,
        {
          source: "exec.missing.source",
          relationship: "blocks",
          target: "exec.missing.target",
        },
      ],
      externalRefs: registry.externalRefs,
    });

    const result = validate(registryWithBrokenEdge, adapterFacts);

    expect(result.summary.edgesResolved).toBe(registry.edges.length);
    expect(result.findings).toEqual([
      expect.objectContaining({
        category: "missing_edge_target",
        entityId: "exec.missing.source",
      }),
      expect.objectContaining({
        category: "missing_edge_target",
        entityId: "exec.missing.target",
      }),
    ]);
  });
});
