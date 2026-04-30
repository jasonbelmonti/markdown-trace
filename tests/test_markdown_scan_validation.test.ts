import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
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
const wp1Heading =
  "### WP-1: Create fixture family, YAML registry shape, and test scaffolding";

async function withTemporaryDocument<T>(
  text: string,
  callback: (temporaryPath: string) => Promise<T>,
): Promise<T> {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "spec-trace-markdown-"));

  try {
    const temporaryPath = path.join(temporaryDirectory, "execution-spec.md");
    await writeFile(temporaryPath, text, "utf8");
    return await callback(temporaryPath);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

async function withTemporaryFixture<T>(
  registryText: string,
  documentText: string,
  callback: (paths: { registryPath: string; documentPath: string }) => Promise<T>,
): Promise<T> {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "spec-trace-fixture-"));

  try {
    const temporaryRegistryPath = path.join(temporaryDirectory, "entity-registry.yaml");
    const temporaryDocumentPath = path.join(temporaryDirectory, "execution-spec.md");
    await writeFile(temporaryRegistryPath, registryText, "utf8");
    await writeFile(temporaryDocumentPath, documentText, "utf8");

    return await callback({
      registryPath: temporaryRegistryPath,
      documentPath: temporaryDocumentPath,
    });
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

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

  it("keeps nested headings inside their parent entity section", async () => {
    const registry = await loadRegistry(registryPath);
    const documentText = await readFile(documentPath, "utf8");
    const mutatedDocumentText = documentText.replace(
      wp1Heading,
      `${wp1Heading}\n\n#### Notes`,
    );

    await withTemporaryDocument(mutatedDocumentText, async (temporaryPath) => {
      const scanFacts = await scanMarkdown(temporaryPath, registry);
      const result = validate(registry, scanFacts);

      expect(
        scanFacts.references.some(
          (reference) =>
            reference.sourceEntityId === "exec.wp.1" && reference.label === "WP-2",
        ),
      ).toBe(true);
      expect(scanFacts.ranges).toContainEqual(
        expect.objectContaining({
          sourceEntityId: "exec.wp.1",
          labelFamily: "CON",
          start: "CON-1",
          end: "CON-3",
        }),
      );
      expect(result.status).toBe("passed");
    });
  });

  it("treats indented ATX headings as section boundaries", async () => {
    const registryText = `registryVersion: spec-trace.test.v0
document:
  id: spec-trace.test
  title: Indented heading boundary fixture
  path: execution-spec.md
  fixtureFamily: test
  sourceDocs:
    - execution-spec.md
entities:
  - id: exec.wp.1
    label: WP-1
    type: work_package
    defines:
      kind: heading
      text: "### WP-1: First work package"
    expectedReferences:
      labels:
        - WP-3
  - id: exec.wp.2
    label: WP-2
    type: work_package
    defines:
      kind: heading
      text: "   ### WP-2: Second work package"
    expectedReferences:
      labels:
        - WP-3
  - id: exec.wp.3
    label: WP-3
    type: work_package
    defines:
      kind: heading
      text: "### WP-3: Third work package"
edges: []
`;
    const documentText = `# Indented heading boundary fixture

### WP-1: First work package

WP-1 has no downstream package reference here.

   ### WP-2: Second work package

WP-2 references WP-3.

### WP-3: Third work package
`;

    await withTemporaryFixture(
      registryText,
      documentText,
      async ({ registryPath: temporaryRegistryPath, documentPath: temporaryDocumentPath }) => {
        const registry = await loadRegistry(temporaryRegistryPath);
        const scanFacts = await scanMarkdown(temporaryDocumentPath, registry);
        const result = validate(registry, scanFacts);

        expect(
          scanFacts.references.some(
            (reference) =>
              reference.sourceEntityId === "exec.wp.1" && reference.label === "WP-3",
          ),
        ).toBe(false);
        expect(scanFacts.references).toContainEqual(
          expect.objectContaining({
            sourceEntityId: "exec.wp.2",
            label: "WP-3",
          }),
        );
        expect(result.findings).toContainEqual(
          expect.objectContaining({
            category: "missing-reference",
            entityId: "exec.wp.1",
            label: "WP-3",
          }),
        );
      },
    );
  });

  it("preserves zero-padded range labels during validation", async () => {
    const registryText = `registryVersion: spec-trace.test.v0
document:
  id: spec-trace.test
  title: Zero padded range fixture
  path: execution-spec.md
  fixtureFamily: test
  sourceDocs:
    - execution-spec.md
entities:
  - id: exec.con.1
    label: CON-01
    type: constraint
    defines:
      kind: heading
      text: "### CON-01: First constraint"
  - id: exec.con.2
    label: CON-02
    type: constraint
    defines:
      kind: heading
      text: "### CON-02: Second constraint"
  - id: exec.con.3
    label: CON-03
    type: constraint
    defines:
      kind: heading
      text: "### CON-03: Third constraint"
  - id: exec.wp.1
    label: WP-01
    type: work_package
    defines:
      kind: heading
      text: "### WP-01: Padded range owner"
    expectedReferences:
      ranges:
        - labelFamily: CON
          start: CON-01
          end: CON-03
          expandsTo:
            - CON-01
            - CON-02
            - CON-03
edges: []
`;
    const documentText = `# Zero padded range fixture

### CON-01: First constraint

### CON-02: Second constraint

### CON-03: Third constraint

### WP-01: Padded range owner

WP-01 references CON-01 through CON-03.
`;

    await withTemporaryFixture(
      registryText,
      documentText,
      async ({ registryPath: temporaryRegistryPath, documentPath: temporaryDocumentPath }) => {
        const registry = await loadRegistry(temporaryRegistryPath);
        const scanFacts = await scanMarkdown(temporaryDocumentPath, registry);
        const result = validate(registry, scanFacts);

        expect(scanFacts.ranges).toContainEqual(
          expect.objectContaining({
            sourceEntityId: "exec.wp.1",
            labelFamily: "CON",
            start: "CON-01",
            end: "CON-03",
            expandsTo: ["CON-01", "CON-02", "CON-03"],
          }),
        );
        expect(result.status).toBe("passed");
      },
    );
  });

  it("reports unregistered labels from registered label families", async () => {
    const registry = await loadRegistry(registryPath);
    const documentText = await readFile(documentPath, "utf8");
    const mutatedDocumentText = documentText.replace(
      wp1Heading,
      `${wp1Heading}\n\nWP-1 also references WP-99.`,
    );

    await withTemporaryDocument(mutatedDocumentText, async (temporaryPath) => {
      const scanFacts = await scanMarkdown(temporaryPath, registry);
      const result = validate(registry, scanFacts);

      expect(scanFacts.references).toContainEqual(
        expect.objectContaining({
          sourceEntityId: "exec.wp.1",
          label: "WP-99",
        }),
      );
      expect(
        scanFacts.references.find(
          (reference) =>
            reference.sourceEntityId === "exec.wp.1" && reference.label === "WP-99",
        ),
      ).not.toHaveProperty("targetEntityId");
      expect(scanFacts.ignoredIssueKeys).not.toContainEqual(
        expect.objectContaining({ key: "WP-99" }),
      );
      expect(result.status).toBe("failed");
      expect(result.findings).toContainEqual(
        expect.objectContaining({
          category: "missing-reference",
          entityId: "exec.wp.1",
          label: "WP-99",
        }),
      );
    });
  });
});
