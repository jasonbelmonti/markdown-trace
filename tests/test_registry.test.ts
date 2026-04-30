import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";
import { parse } from "yaml";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureFamily = "r0-document-local-registry";
const fixtureDocument = `fixtures/${fixtureFamily}/execution-spec.md`;
const fixtureRegistry = `fixtures/${fixtureFamily}/entity-registry.yaml`;
const variantInventory = "tests/fixtures/registry-variants.yaml";

interface RegistryDocument {
  path: string;
  fixtureFamily: string;
}

interface RegistryEntity {
  id: string;
  label: string;
  type: string;
  defines: {
    kind: string;
    text: string;
  };
}

interface RegistryEdge {
  from: string;
  to: string;
  relationship: string;
}

interface ExternalRef {
  key: string;
  relatedEntity: string;
  system: string;
  role: string;
}

interface Registry {
  document: RegistryDocument;
  entities: RegistryEntity[];
  edges: RegistryEdge[];
  externalRefs: ExternalRef[];
}

interface VariantMutation {
  target: string;
  operation: string;
  selector?: string;
  from?: string;
  to?: string;
  absentLabels?: string[];
  id?: string;
}

interface RegistryVariant {
  name: string;
  category: string;
  expectedFinding: unknown;
  sourceRequirement: string;
  mutation: VariantMutation;
}

interface VariantInventory {
  baseDocument: string;
  baseRegistry: string;
  variants: RegistryVariant[];
}

async function loadYaml<T>(relativePath: string): Promise<T> {
  const text = await readFile(path.join(repoRoot, relativePath), "utf8");
  return parse(text) as T;
}

describe("registry fixtures", () => {
  let registry: Registry;
  let documentText: string;
  let variants: VariantInventory;

  beforeAll(async () => {
    [registry, documentText, variants] = await Promise.all([
      loadYaml<Registry>(fixtureRegistry),
      readFile(path.join(repoRoot, fixtureDocument), "utf8"),
      loadYaml<VariantInventory>(variantInventory),
    ]);
  });

  it("points the registry at the existing fixture document", async () => {
    const document = registry.document;

    expect(document.path).toBe(fixtureDocument);
    const documentStats = await stat(path.join(repoRoot, document.path));
    expect(documentStats.isFile()).toBe(true);
    expect(document.fixtureFamily).toBe(fixtureFamily);
  });

  it("VAL-1 registry shape separates identity, label, type, and definitions", () => {
    expect(registry.document).toEqual(expect.any(Object));
    expect(registry.entities).toEqual(expect.any(Array));
    expect(registry.edges).toEqual(expect.any(Array));
    expect(registry.externalRefs).toEqual(expect.any(Array));

    for (const entity of registry.entities) {
      expect(entity.id).toMatch(/^[a-z]+(?:\.[a-z0-9]+)+$/);
      expect(entity.label).toMatch(/^[A-Z]+-\d+$/);
      expect(entity.id).not.toBe(entity.label);
      expect(entity.type).toMatch(/^[a-z]+(?:_[a-z]+)*$/);
      expect(entity.defines.kind).toBe("heading");
      expect(documentText).toContain(entity.defines.text);
    }
  });

  it("base registry has unique canonical IDs and labels", () => {
    const canonicalIds = registry.entities.map((entity) => entity.id);
    const labels = registry.entities.map((entity) => entity.label);

    expect(new Set(canonicalIds).size).toBe(canonicalIds.length);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("declared edges use canonical IDs and resolve to registered entities", () => {
    const canonicalIds = new Set(registry.entities.map((entity) => entity.id));

    for (const edge of registry.edges) {
      expect(canonicalIds.has(edge.from)).toBe(true);
      expect(canonicalIds.has(edge.to)).toBe(true);
      expect(edge.relationship).toMatch(/^[a-z]+(?:_[a-z]+)*$/);
      expect(edge.from).not.toMatch(/^[A-Z]+-\d+$/);
      expect(edge.to).not.toMatch(/^[A-Z]+-\d+$/);
    }
  });

  it("keeps external refs separate from document entities", () => {
    const entityLabels = new Set(registry.entities.map((entity) => entity.label));
    const canonicalIds = new Set(registry.entities.map((entity) => entity.id));
    const issueLikeTokens = new Set(documentText.match(/\b[A-Z]+-\d+\b/g) ?? []);

    for (const externalRef of registry.externalRefs) {
      expect(canonicalIds.has(externalRef.relatedEntity)).toBe(true);
      expect(entityLabels.has(externalRef.key)).toBe(false);
      expect(externalRef).toHaveProperty("system");
      expect(externalRef).toHaveProperty("role");
    }

    expect(issueLikeTokens.has("BEL-858")).toBe(true);
    expect(entityLabels.has("BEL-858")).toBe(false);
  });

  it("variant inventory covers required negative categories", () => {
    const expectedCategories = [
      "missing-registered-definition",
      "duplicate-canonical-id",
      "duplicate-label",
      "missing-reference",
      "missing-edge-target",
      "incomplete-bounded-range",
    ];
    const actualCategories = new Set(variants.variants.map((variant) => variant.category));

    expect(variants.baseDocument).toBe(fixtureDocument);
    expect(variants.baseRegistry).toBe(fixtureRegistry);

    for (const category of expectedCategories) {
      expect(actualCategories.has(category)).toBe(true);
    }
  });

  it("incomplete range variant does not remove registered entities", () => {
    const matchingVariants = variants.variants.filter(
      (variant) => variant.name === "incomplete-bounded-range",
    );
    expect(matchingVariants).toHaveLength(1);

    const mutation = matchingVariants[0].mutation;
    const entityLabels = new Set(registry.entities.map((entity) => entity.label));

    expect(mutation.target).toBe("document");
    expect(mutation.operation).toBe("replace_reference");
    expect(mutation).not.toHaveProperty("id");
    const { selector, from, to, absentLabels } = mutation;

    expect(typeof selector).toBe("string");
    expect(typeof from).toBe("string");
    expect(typeof to).toBe("string");
    expect(Array.isArray(absentLabels)).toBe(true);

    if (
      typeof selector !== "string" ||
      typeof from !== "string" ||
      typeof to !== "string" ||
      !Array.isArray(absentLabels)
    ) {
      throw new Error("incomplete-bounded-range mutation is missing required fields");
    }

    expect(documentText).toContain(selector);
    expect(documentText).toContain(from);
    expect(documentText).not.toContain(to);

    for (const absentLabel of absentLabels) {
      expect(entityLabels.has(absentLabel)).toBe(false);
    }
  });

  it("variant inventory declares expected findings and mutations", () => {
    for (const variant of variants.variants) {
      expect(variant).toHaveProperty("expectedFinding");
      expect(variant).toHaveProperty("sourceRequirement");
      expect(variant).toHaveProperty("mutation");
      expect(variant.mutation).toHaveProperty("target");
      expect(variant.mutation).toHaveProperty("operation");
    }
  });
});
