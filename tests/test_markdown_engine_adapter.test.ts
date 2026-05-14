import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { scanMarkdown } from "../src/markdowntrace/markdown/index.js";
import { loadRegistry } from "../src/markdowntrace/registry/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(
  repoRoot,
  "fixtures/r0-document-local-registry/entity-registry.yaml",
);
const documentPath = path.join(repoRoot, "fixtures/r0-document-local-registry/execution-spec.md");

describe("scanMarkdown", () => {
  it("adapts the valid fixture through Markdown Engine package-root APIs", async () => {
    const registry = await loadRegistry(registryPath);
    const facts = await scanMarkdown(documentPath, registry);

    expect(facts.metadata).toEqual({
      enginePackage: {
        name: "@jasonbelmonti/markdown-engine",
        version: "2.0.0",
      },
      documentVersion: "1.0.0",
      sourcePath: documentPath,
    });
    expect(facts.diagnostics).toEqual([]);
    expect(facts.definitions).toHaveLength(registry.entities.length);
    expect(facts.definitions.map((definition) => definition.entityId)).toEqual(
      registry.entities.map((entity) => entity.id),
    );
  });

  it("records deterministic label and range references from registered sections", async () => {
    const registry = await loadRegistry(registryPath);
    const facts = await scanMarkdown(documentPath, registry);
    const references = facts.labelReferences.map((reference) => [
      reference.sourceEntityId,
      reference.label,
    ]);

    expect(references).toContainEqual(["exec.wp.1", "CON-1"]);
    expect(references).toContainEqual(["exec.wp.1", "CON-3"]);
    expect(references).toContainEqual(["exec.wp.1", "PKG-1"]);
    expect(references).toContainEqual(["exec.wp.1", "PKG-4"]);
    expect(references).toContainEqual(["exec.wp.1", "VAL-1"]);
    expect(references).toContainEqual(["exec.wp.1", "EVD-1"]);
    expect(references).toContainEqual(["exec.wp.1", "WP-2"]);
    expect(references).not.toContainEqual(["exec.wp.1", "CON-2"]);
    expect(facts.rangeReferences).toEqual([
      expect.objectContaining({
        sourceEntityId: "exec.wp.1",
        labelFamily: "CON",
        start: "CON-1",
        end: "CON-3",
        expandsTo: ["CON-1", "CON-2", "CON-3"],
      }),
    ]);
  });
});
