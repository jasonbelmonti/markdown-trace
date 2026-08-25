import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  graphProfileHash,
  loadGraphProfile,
  type GraphProfileDiagnosticStage,
  type GraphProfileResult,
} from "../src/markdowntrace/graph-profile/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = path.join(repoRoot, "fixtures/profile-aware-graph-validation/profiles");
const fixtureNames = [
  "valid-execution-spec.yaml",
  "valid-design-spec.yaml",
  "malformed-profile.yaml",
] as const;
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe("loadGraphProfile", () => {
  it("loads both contract fixture families into deeply immutable profiles with stable hashes", async () => {
    const beforeFixtureHashes = await fixtureHashes();
    const executionResult = await loadFixture("valid-execution-spec.yaml");
    const designResult = await loadFixture("valid-design-spec.yaml");
    const execution = requireProfile(executionResult);
    const design = requireProfile(designResult);

    expect(execution.profileId).toBe("markdown-trace.execution-spec.contract-fixture");
    expect(execution.artifactFamily).toBe("execution-spec");
    expect(design.profileId).toBe("markdown-trace.design-spec.contract-fixture");
    expect(design.artifactFamily).toBe("design-spec");
    expect(Object.isFrozen(executionResult)).toBe(true);
    expect(Object.isFrozen(designResult)).toBe(true);
    expect(Object.isFrozen(execution)).toBe(true);
    expect(Object.isFrozen(execution.idFamilies)).toBe(true);
    expect(Object.isFrozen(execution.definitionPolicies)).toBe(true);
    expect(Object.isFrozen(execution.definitionPolicies.repeatedIdPolicy)).toBe(true);
    expect(Object.isFrozen(design.requiredPaths[0]?.steps)).toBe(true);
    expect(graphProfileHash(execution)).toHaveLength(64);
    expect(graphProfileHash(execution)).toBe(
      graphProfileHash(requireProfile(await loadFixture("valid-execution-spec.yaml"))),
    );
    expect(await fixtureHashes()).toEqual(beforeFixtureHashes);
  });

  it("returns frozen schema failures for malformed fixture data", async () => {
    const fixturePath = path.join(fixtureRoot, "malformed-profile.yaml");

    const result = await loadGraphProfile(fixturePath);

    expectProfileFailure(result, "schema", "unsupported field unexpectedField");
    if (!result.ok) {
      expect(result.diagnostics[0]?.source).toBe(fixturePath);
    }
  });

  it("contains unreadable paths as frozen read failures", async () => {
    const directory = await temporaryDirectory();
    const missingPath = path.join(directory, "missing.yaml");

    expectProfileFailure(await loadGraphProfile(missingPath), "read", "cannot be read");
    expectProfileFailure(await loadGraphProfile(directory), "read", "cannot be read");
  });

  it("contains invalid and multi-document YAML as frozen YAML failures", async () => {
    const directory = await temporaryDirectory();
    const invalidPath = path.join(directory, "invalid.yaml");
    const multiplePath = path.join(directory, "multiple.yaml");
    await writeFile(invalidPath, "schemaVersion: [unterminated\n", "utf8");
    await writeFile(multiplePath, "---\nschemaVersion: first\n---\nschemaVersion: second\n", "utf8");

    expectProfileFailure(await loadGraphProfile(invalidPath), "yaml", "contains invalid YAML");
    expectProfileFailure(
      await loadGraphProfile(multiplePath),
      "yaml",
      "must contain exactly one YAML document",
    );
  });
});

async function loadFixture(name: (typeof fixtureNames)[number]): Promise<GraphProfileResult> {
  return loadGraphProfile(path.join(fixtureRoot, name));
}

function requireProfile(result: GraphProfileResult) {
  if (!result.ok) {
    throw new Error(result.diagnostics.map(({ message }) => message).join("\n"));
  }
  return result.profile;
}

function expectProfileFailure(
  result: GraphProfileResult,
  stage: GraphProfileDiagnosticStage,
  message: string,
): void {
  expect(result.ok).toBe(false);
  expect(Object.isFrozen(result)).toBe(true);
  if (result.ok) {
    return;
  }
  expect(Object.isFrozen(result.diagnostics)).toBe(true);
  expect(Object.isFrozen(result.diagnostics[0])).toBe(true);
  expect(Object.isFrozen(result.diagnostics[0]?.affectedIds)).toBe(true);
  expect(result.diagnostics[0]).toMatchObject({
    code: "markdown-trace.graph.profile_error",
    stage,
    message: expect.stringContaining(message),
  });
}

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "markdown-trace-graph-profile-"));
  temporaryDirectories.push(directory);
  return directory;
}

async function fixtureHashes(): Promise<readonly string[]> {
  return Promise.all(
    fixtureNames.map(async (name) =>
      createHash("sha256").update(await readFile(path.join(fixtureRoot, name))).digest("hex")
    ),
  );
}
