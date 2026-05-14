import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";

import {
  EntityRegistry,
  loadRegistry,
  RegistryLoadError,
} from "../src/markdowntrace/registry/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(
  repoRoot,
  "fixtures/r0-document-local-registry/entity-registry.yaml",
);

async function readRawRegistry(): Promise<Record<string, unknown>> {
  return parse(await readFile(registryPath, "utf8")) as Record<string, unknown>;
}

async function withTemporaryRegistry<T>(
  fileName: string,
  text: string,
  callback: (temporaryPath: string) => Promise<T>,
): Promise<T> {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-registry-"));

  try {
    const temporaryPath = path.join(temporaryDirectory, fileName);
    await writeFile(temporaryPath, text, "utf8");
    return await callback(temporaryPath);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

function toRegistryInput(registry: EntityRegistry): ConstructorParameters<typeof EntityRegistry>[0] {
  return {
    registryVersion: registry.registryVersion,
    document: registry.document,
    entities: registry.entities,
    edges: registry.edges,
    externalRefs: registry.externalRefs,
  };
}

describe("loadRegistry", () => {
  it("preserves document metadata", async () => {
    const registry = await loadRegistry(registryPath);

    expect(registry.registryVersion).toBe("markdown-trace.r0.document-local-registry.v0");
    expect(registry.document.id).toBe("markdown-trace.r0.fixture.execution");
    expect(registry.document.path).toBe(
      "fixtures/r0-document-local-registry/execution-spec.md",
    );
    expect(registry.document.fixtureFamily).toBe("r0-document-local-registry");
    expect(registry.document.sourceDocs).toEqual([
      "docs/markdown-trace-r0-document-local-entity-registry.md",
      "docs/markdown-trace-e0-document-local-entity-registry-execution.md",
    ]);
  });

  it("preserves canonical IDs separately from display labels", async () => {
    const registry = await loadRegistry(registryPath);
    const entity = registry.entitiesById.get("exec.wp.1");

    expect(entity).toBeDefined();
    expect(entity?.id).toBe("exec.wp.1");
    expect(entity?.label).toBe("WP-1");
    expect(entity?.id).not.toBe(entity?.label);
    expect(registry.entitiesByLabel.get("WP-1")).toBe(entity);
  });

  it("preserves definitions and expected references", async () => {
    const registry = await loadRegistry(registryPath);
    const entity = registry.entitiesById.get("exec.wp.1");

    expect(entity?.defines).toEqual({
      kind: "heading",
      text: "### WP-1: Create fixture family, YAML registry shape, and test scaffolding",
    });
    expect(entity?.expectedReferences.labels).toEqual([
      "CON-1",
      "CON-2",
      "CON-3",
      "PKG-1",
      "PKG-4",
      "VAL-1",
      "EVD-1",
      "WP-2",
    ]);
    expect(entity?.expectedReferences.ranges).toEqual([
      {
        labelFamily: "CON",
        start: "CON-1",
        end: "CON-3",
        expandsTo: ["CON-1", "CON-2", "CON-3"],
      },
    ]);
  });

  it("preserves edges and external references", async () => {
    const registry = await loadRegistry(registryPath);

    expect(
      registry.edges.map((edge) => [edge.source, edge.relationship, edge.target]),
    ).toContainEqual(["exec.wp.1", "blocks", "exec.wp.2"]);
    expect(
      registry.externalRefs.map((externalRef) => [
        externalRef.system,
        externalRef.key,
        externalRef.relatedEntity,
        externalRef.role,
      ]),
    ).toContainEqual(["linear", "BEL-893", "exec.wp.1", "task_of_record"]);
  });

  it("accepts omitted external references", async () => {
    const rawRegistry = await readRawRegistry();
    delete rawRegistry.externalRefs;

    await withTemporaryRegistry(
      "registry-without-external-refs.yaml",
      stringify(rawRegistry),
      async (temporaryPath) => {
        const registry = await loadRegistry(temporaryPath);

        expect(registry.externalRefs).toEqual([]);
        expect(registry.entitiesById.has("exec.wp.1")).toBe(true);
      },
    );
  });

  it("rejects multiple YAML documents", async () => {
    const rawRegistry = await readRawRegistry();

    await withTemporaryRegistry(
      "multi-document-registry.yaml",
      `${stringify(rawRegistry)}---\nignored: true\n`,
      async (temporaryPath) => {
        await expect(loadRegistry(temporaryPath)).rejects.toThrow(
          /must contain exactly one YAML document/,
        );
      },
    );
  });

  it("wraps YAML syntax failures", async () => {
    await withTemporaryRegistry(
      "malformed-registry.yaml",
      "registryVersion: [unterminated\n",
      async (temporaryPath) => {
        await expect(loadRegistry(temporaryPath)).rejects.toThrow(/contains invalid YAML/);
      },
    );
  });

  it("wraps YAML materialization failures", async () => {
    await withTemporaryRegistry(
      "unresolved-alias-registry.yaml",
      "registryVersion: *missing\n",
      async (temporaryPath) => {
        await expect(loadRegistry(temporaryPath)).rejects.toThrow(RegistryLoadError);
        await expect(loadRegistry(temporaryPath)).rejects.toThrow(/contains invalid YAML/);
      },
    );
  });

  it("wraps unreadable file failures", async () => {
    const missingPath = path.join(os.tmpdir(), "markdown-trace-missing-registry.yaml");

    await expect(loadRegistry(missingPath)).rejects.toThrow(RegistryLoadError);
    await expect(loadRegistry(missingPath)).rejects.toThrow(/cannot be read/);
  });

  it("rejects whitespace-only text fields", async () => {
    const rawRegistry = await readRawRegistry();
    const entities = rawRegistry.entities as Record<string, unknown>[];
    entities[0].id = "   ";

    await withTemporaryRegistry(
      "whitespace-registry.yaml",
      stringify(rawRegistry),
      async (temporaryPath) => {
        await expect(loadRegistry(temporaryPath)).rejects.toThrow(
          /entities\[0\]\.id must be a non-empty string/,
        );
      },
    );
  });

  it("rejects duplicate canonical IDs", async () => {
    const rawRegistry = await readRawRegistry();
    const entities = rawRegistry.entities as Record<string, unknown>[];
    entities.push({ ...entities[0] });

    await withTemporaryRegistry(
      "duplicate-id-registry.yaml",
      stringify(rawRegistry),
      async (temporaryPath) => {
        await expect(loadRegistry(temporaryPath)).rejects.toThrow(
          /entities\[\]\.id contains duplicate value 'exec.con.1'/,
        );
      },
    );
  });

  it("rejects duplicate labels", async () => {
    const rawRegistry = await readRawRegistry();
    const entities = rawRegistry.entities as Record<string, unknown>[];
    entities.push({ ...entities[0], id: "exec.con.99" });

    await withTemporaryRegistry(
      "duplicate-label-registry.yaml",
      stringify(rawRegistry),
      async (temporaryPath) => {
        await expect(loadRegistry(temporaryPath)).rejects.toThrow(
          /entities\[\]\.label contains duplicate value 'CON-1'/,
        );
      },
    );
  });

  it("rejects direct construction with duplicate canonical IDs", async () => {
    const registry = await loadRegistry(registryPath);
    const input = toRegistryInput(registry);

    expect(
      () =>
        new EntityRegistry({
          ...input,
          entities: [...input.entities, { ...input.entities[0] }],
        }),
    ).toThrow(/entities\[\]\.id contains duplicate value 'exec.con.1'/);
  });

  it("rejects direct construction with duplicate labels", async () => {
    const registry = await loadRegistry(registryPath);
    const input = toRegistryInput(registry);

    expect(
      () =>
        new EntityRegistry({
          ...input,
          entities: [...input.entities, { ...input.entities[0], id: "exec.con.99" }],
        }),
    ).toThrow(/entities\[\]\.label contains duplicate value 'CON-1'/);
  });
});
