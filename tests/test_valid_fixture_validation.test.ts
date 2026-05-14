import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { scanMarkdown } from "../src/markdowntrace/markdown/index.js";
import { loadRegistry } from "../src/markdowntrace/registry/index.js";
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
    expect(firstResult.metadata.enginePackage.version).toBe("2.0.0");
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
});
