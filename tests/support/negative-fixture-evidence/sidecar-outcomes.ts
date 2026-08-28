import { readFile } from "node:fs/promises";

import { expect } from "vitest";

import { MARKDOWN_ENGINE_PACKAGE_VERSION } from "../../../src/markdowntrace/generated/release-metadata.js";
import { scanMarkdown } from "../../../src/markdowntrace/markdown/index.js";
import { EntityRegistry } from "../../../src/markdowntrace/registry/index.js";
import { validate, type ValidationFinding } from "../../../src/markdowntrace/validation/index.js";
import type { VariantOutcome } from "./model.js";
import { documentPath } from "./paths.js";
import { replaceRequired, withTemporaryFile } from "./temp-files.js";

export async function missingRegisteredDefinitionOutcome(
  registry: EntityRegistry,
): Promise<VariantOutcome> {
  const documentText = await readFile(documentPath, "utf8");
  const mutatedDocument = replaceRequired(
    documentText,
    "\n### VAL-1: Registry schema inspection\n",
    "\n",
  );
  const { findings } = await validateDocumentText(registry, mutatedDocument);

  expect(findings).toContainEqual(
    expect.objectContaining({
      category: "missing_registered_definition",
      entityId: "exec.val.1",
      label: "VAL-1",
    }),
  );

  return {
    name: "missing-registered-definition",
    proofSurface: "sidecar validation",
    expectedOutcome: "`missing_registered_definition` finding",
    actualOutcome: "`missing_registered_definition` for `exec.val.1` / `VAL-1`",
    status: "FAIL",
    findings,
  };
}

export async function missingReferenceOutcome(
  registry: EntityRegistry,
): Promise<VariantOutcome> {
  const documentText = await readFile(documentPath, "utf8");
  const mutatedDocument = replaceRequired(
    documentText,
    "WP-1 establishes the fixture family and sidecar registry for VAL-1. It depends\n",
    "WP-1 establishes the fixture family and sidecar registry for VAL-1. It references WP-99. It depends\n",
  );
  const { findings } = await validateDocumentText(registry, mutatedDocument);

  expect(findings).toContainEqual(
    expect.objectContaining({
      category: "missing_reference",
      entityId: "exec.wp.1",
      label: "WP-99",
    }),
  );

  return {
    name: "missing-reference",
    proofSurface: "sidecar validation",
    expectedOutcome: "`missing_reference` finding",
    actualOutcome: "`missing_reference` for `exec.wp.1` / `WP-99`",
    status: "FAIL",
    findings,
  };
}

export async function missingEdgeTargetOutcome(
  registry: EntityRegistry,
): Promise<VariantOutcome> {
  const adapterFacts = await scanMarkdown(documentPath, registry);
  const registryWithBrokenEdge = new EntityRegistry({
    registryVersion: registry.registryVersion,
    document: registry.document,
    entities: registry.entities,
    edges: [
      ...registry.edges,
      {
        source: "exec.wp.1",
        relationship: "blocks",
        target: "exec.wp.99",
      },
    ],
    externalRefs: registry.externalRefs,
  });
  const result = validate(registryWithBrokenEdge, adapterFacts);

  expect(result.findings).toContainEqual(
    expect.objectContaining({
      category: "missing_edge_target",
      entityId: "exec.wp.99",
      edgeRelationship: "blocks",
    }),
  );

  return {
    name: "missing-edge-target",
    proofSurface: "sidecar validation",
    expectedOutcome: "`missing_edge_target` finding",
    actualOutcome: "`missing_edge_target` for absent edge target `exec.wp.99`",
    status: "FAIL",
    findings: result.findings,
  };
}

export async function incompleteBoundedRangeOutcome(
  registry: EntityRegistry,
): Promise<VariantOutcome> {
  const documentText = await readFile(documentPath, "utf8");
  const mutatedDocument = replaceRequired(
    documentText,
    "CON-1 through CON-3",
    "CON-1 through CON-4",
  );
  const { findings } = await validateDocumentText(registry, mutatedDocument);

  expect(findings).toContainEqual(
    expect.objectContaining({
      category: "incomplete_range",
      entityId: "exec.wp.1",
      label: "CON-4",
    }),
  );

  return {
    name: "incomplete-bounded-range",
    proofSurface: "sidecar validation",
    expectedOutcome: "`incomplete_range` finding",
    actualOutcome: "`incomplete_range` for `exec.wp.1` / `CON-4`",
    status: "FAIL",
    findings,
  };
}

async function validateDocumentText(
  registry: EntityRegistry,
  documentText: string,
): Promise<{ readonly findings: readonly ValidationFinding[] }> {
  return await withTemporaryFile(
    "negative-document-",
    "execution-spec.md",
    documentText,
    async (file) => {
      const adapterFacts = await scanMarkdown(file, registry);
      const result = validate(registry, adapterFacts);

      expect(result.valid).toBe(false);
      expect(result.metadata.enginePackage.version).toBe(MARKDOWN_ENGINE_PACKAGE_VERSION);
      expect(result.metadata.documentVersion).toBe("1.0.0");

      return { findings: result.findings };
    },
  );
}
