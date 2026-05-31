import { access, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { runMigrationCheck } from "../src/markdowntrace/migration/check.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDirectory = "fixtures/r1-link-backed-entity-syntax";
const documentPath = `${fixtureDirectory}/minimal-link-backed-execution-spec.md`;
const manualRegistryPath = `${fixtureDirectory}/minimal-link-backed-manual-registry.yaml`;
const typeProfilePath = `${fixtureDirectory}/minimal-type-profile.yaml`;
const generatedSidecarPath =
  `${fixtureDirectory}/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml`;

describe("migration check orchestration core", () => {
  it("aggregates a passing same-document migration check without CLI coupling", async () => {
    const result = await runMigrationCheck({
      repoRoot,
      documentPath,
      manualRegistryPath,
      typeProfilePath,
    });

    expect(result).toMatchObject({
      valid: true,
      exitCode: 0,
      inputs: {
        documentPath,
        manualRegistryPath,
        generatedSidecarPath,
        typeProfilePath,
        authorityState: "yaml-authoritative",
      },
    });
    expect(result.steps.map(({ step, status }) => [step, status])).toEqual([
      ["yaml-compatibility", "passed"],
      ["generated-sidecar", "passed"],
      ["comparison", "passed"],
    ]);
    expect(result.comparisonReport).toMatchObject({
      exitCode: 0,
      dimensions: [
        { dimension: "registry", status: "equivalent" },
        { dimension: "graph", status: "equivalent" },
        { dimension: "metadata", status: "intentional" },
        { dimension: "validation", status: "equivalent" },
      ],
    });
  });

  it("fails missing generated sidecar checks without creating the missing artifact", async () => {
    const temporaryRepo = await preparedTemporaryRepo([manualRegistryPath]);
    const artifactPath = path.join(temporaryRepo.path, generatedSidecarPath);

    try {
      const result = await runMigrationCheck({
        repoRoot: temporaryRepo.path,
        documentPath,
        manualRegistryPath,
        typeProfilePath,
      });

      expect(result.valid).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.steps.map(({ step, status }) => [step, status])).toEqual([
        ["yaml-compatibility", "passed"],
        ["generated-sidecar", "failed"],
        ["comparison", "skipped"],
      ]);
      expect(result.generatedSidecarDiagnostics).toEqual([
        expect.objectContaining({ category: "missing_artifact" }),
      ]);
      await expect(access(artifactPath)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await temporaryRepo.remove();
    }
  });

  it("fails stale generated sidecar checks without rewriting stale bytes", async () => {
    const temporaryRepo = await preparedTemporaryRepo([
      manualRegistryPath,
      generatedSidecarPath,
    ]);
    const artifactPath = path.join(temporaryRepo.path, generatedSidecarPath);
    const staleBytes = `${await readFile(artifactPath, "utf8")}\n# stale local edit\n`;
    await writeFile(artifactPath, staleBytes, "utf8");

    try {
      const result = await runMigrationCheck({
        repoRoot: temporaryRepo.path,
        documentPath,
        manualRegistryPath,
        typeProfilePath,
      });

      expect(result.valid).toBe(false);
      expect(result.steps.map(({ step, status }) => [step, status])).toEqual([
        ["yaml-compatibility", "passed"],
        ["generated-sidecar", "failed"],
        ["comparison", "skipped"],
      ]);
      expect(result.generatedSidecarDiagnostics).toEqual([
        expect.objectContaining({ category: "content_mismatch" }),
      ]);
      await expect(readFile(artifactPath, "utf8")).resolves.toBe(staleBytes);
    } finally {
      await temporaryRepo.remove();
    }
  });

  it("returns a blocking comparison failure when checked generated output differs from manual YAML", async () => {
    const temporaryRepo = await preparedTemporaryRepo([
      manualRegistryPath,
      generatedSidecarPath,
    ]);
    const registryPath = path.join(temporaryRepo.path, manualRegistryPath);
    const driftedRegistry = (await readFile(registryPath, "utf8")).replace(
      "title: Minimal R1 Link-Backed Fixture",
      "title: Drifted Manual Fixture",
    );
    await writeFile(registryPath, driftedRegistry, "utf8");

    try {
      const result = await runMigrationCheck({
        repoRoot: temporaryRepo.path,
        documentPath,
        manualRegistryPath,
        typeProfilePath,
      });

      expect(result.valid).toBe(false);
      expect(result.steps.map(({ step, status }) => [step, status])).toEqual([
        ["yaml-compatibility", "passed"],
        ["generated-sidecar", "passed"],
        ["comparison", "failed"],
      ]);
      expect(result.comparisonReport).toMatchObject({
        exitCode: 1,
        dimensions: expect.arrayContaining([
          expect.objectContaining({
            dimension: "registry",
            status: "blocking",
            deltas: [
              expect.objectContaining({
                path: "document.title",
                expected: "Drifted Manual Fixture",
                actual: "Minimal R1 Link-Backed Fixture",
              }),
            ],
          }),
        ]),
      });
    } finally {
      await temporaryRepo.remove();
    }
  });

  it("skips comparison when the manual YAML registry is loadable but invalid", async () => {
    const temporaryRepo = await preparedTemporaryRepo([
      manualRegistryPath,
      generatedSidecarPath,
    ]);
    const registryPath = path.join(temporaryRepo.path, manualRegistryPath);
    const invalidRegistry = (await readFile(registryPath, "utf8")).replace(
      "        - CON-1",
      "        - CON-99",
    );
    await writeFile(registryPath, invalidRegistry, "utf8");

    try {
      const result = await runMigrationCheck({
        repoRoot: temporaryRepo.path,
        documentPath,
        manualRegistryPath,
        typeProfilePath,
      });

      expect(result.valid).toBe(false);
      expect(result.steps.map(({ step, status }) => [step, status])).toEqual([
        ["yaml-compatibility", "failed"],
        ["generated-sidecar", "passed"],
        ["comparison", "skipped"],
      ]);
      expect(result.manualValidation?.exitCode).toBe(1);
      expect(result.generatedValidation).toBeUndefined();
      expect(result.comparisonReport).toBeUndefined();
    } finally {
      await temporaryRepo.remove();
    }
  });
});

interface TemporaryRepo {
  readonly path: string;
  readonly remove: () => Promise<void>;
}

async function preparedTemporaryRepo(extraFiles: readonly string[]): Promise<TemporaryRepo> {
  const temporaryRoot = await mkdtempRepository();
  const files = [
    "package.json",
    documentPath,
    typeProfilePath,
    ...extraFiles,
  ];

  for (const file of files) {
    await copyRepoFile(temporaryRoot, file);
  }

  return {
    path: temporaryRoot,
    remove: async () => {
      await rm(temporaryRoot, { force: true, recursive: true });
    },
  };
}

async function mkdtempRepository(): Promise<string> {
  return await mkdtemp(path.join(os.tmpdir(), "markdown-trace-migration-check-"));
}

async function copyRepoFile(temporaryRoot: string, file: string): Promise<void> {
  const destination = path.join(temporaryRoot, file);

  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(repoRoot, file), destination);
}
