import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { loadRegistry, scanMarkdown, validate } from "../src/spectrace/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(
  repoRoot,
  "fixtures/r0-document-local-registry/entity-registry.yaml",
);
const documentPath = path.join(
  repoRoot,
  "fixtures/r0-document-local-registry/execution-spec.md",
);

describe("valid fixture scan and validation", () => {
  it("extracts registered heading definitions from the valid fixture", async () => {
    const registry = await loadRegistry(registryPath);
    const scanFacts = await scanMarkdown(documentPath, registry);

    expect(scanFacts.documentPath).toBe(documentPath);
    expect(
      scanFacts.definitions.map((definition) => [
        definition.entityId,
        definition.label,
        definition.kind,
        definition.text,
      ]),
    ).toEqual(
      registry.entities.map((entity) => [
        entity.id,
        entity.label,
        entity.defines.kind,
        entity.defines.text,
      ]),
    );
    expect(new Set(scanFacts.definitions.map((definition) => definition.line)).size).toBe(
      registry.entities.length,
    );
  });

  it("extracts registered references, bounded ranges, and ignored issue keys", async () => {
    const registry = await loadRegistry(registryPath);
    const scanFacts = await scanMarkdown(documentPath, registry);
    const wp1References = new Set(
      scanFacts.references
        .filter((reference) => reference.sourceEntityId === "exec.wp.1")
        .map((reference) => reference.label),
    );
    const wp1Ranges = scanFacts.ranges.filter(
      (range) => range.sourceEntityId === "exec.wp.1",
    );
    const wp1ReferencedLabels = new Set([
      ...wp1References,
      ...wp1Ranges.flatMap((range) => range.expandsTo),
    ]);

    expect(wp1Ranges).toContainEqual(
      expect.objectContaining({
        labelFamily: "CON",
        start: "CON-1",
        end: "CON-3",
        expandsTo: ["CON-1", "CON-2", "CON-3"],
      }),
    );
    for (const label of registry.entitiesById.get("exec.wp.1")?.expectedReferences
      .labels ?? []) {
      expect(wp1ReferencedLabels.has(label)).toBe(true);
    }
    expect(scanFacts.ignoredIssueKeys).toContainEqual(
      expect.objectContaining({ key: "BEL-858" }),
    );
    expect(
      scanFacts.ignoredIssueKeys.some((issueKey) =>
        registry.entitiesByLabel.has(issueKey.key),
      ),
    ).toBe(false);
  });

  it("validates the valid fixture with zero findings", async () => {
    const registry = await loadRegistry(registryPath);
    const scanFacts = await scanMarkdown(documentPath, registry);
    const result = validate(registry, scanFacts);

    expect(result).toEqual({
      status: "passed",
      findings: [],
      summary: {
        registeredEntityCount: registry.entities.length,
        scannedDefinitionCount: registry.entities.length,
        scannedReferenceCount: scanFacts.references.length,
        scannedRangeCount: scanFacts.ranges.length,
        findingCount: 0,
      },
    });
  });
});
