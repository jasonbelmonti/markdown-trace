import { access, copyFile, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  main,
  validateGraphDocument,
  type GraphValidationRunResult,
} from "../src/markdowntrace/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = path.join(repoRoot, "fixtures/profile-aware-graph-validation");
const positiveDocument = path.join(
  fixtureRoot,
  "first-slice/positive-execution-spec.md",
);
const negativeDocument = path.join(
  fixtureRoot,
  "first-slice/missing-required-path.md",
);
const validProfile = path.join(fixtureRoot, "profiles/valid-execution-spec.yaml");
const malformedProfile = path.join(fixtureRoot, "profiles/malformed-profile.yaml");
const designProfile = path.join(fixtureRoot, "profiles/valid-design-spec.yaml");
const directValidationDocument = path.join(
  fixtureRoot,
  "design-spec/direct-validation-path.md",
);
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe("file-backed graph validation API", () => {
  it("loads the profile, extracts evidence, and returns the public result envelope", async () => {
    const result: GraphValidationRunResult = await validateGraphDocument({
      documentPath: positiveDocument,
      profilePath: validProfile,
    });

    expect(result).toMatchObject({
      schemaVersion: "markdown-trace.graph-validation-result.v1",
      status: "pass",
      source: { path: positiveDocument },
      profile: {
        path: validProfile,
        profileId: "markdown-trace.execution-spec.contract-fixture",
        artifactFamily: "execution-spec",
      },
      summary: {
        nodes: 4,
        relationships: 3,
        requiredPaths: 1,
        satisfiedRequiredPaths: 1,
        diagnostics: 0,
      },
    });
  });

  it("returns graph failures as normal validation results", async () => {
    const result = await validateGraphDocument({
      documentPath: negativeDocument,
      profilePath: validProfile,
    });

    expect(result.status).toBe("fail");
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "markdown-trace.graph.missing_required_path",
        profileRuleId: "exec.objective_to_evidence",
        blocking: true,
      }),
    ]);
  });

  it("satisfies a required path through a declared relationship alternative", async () => {
    const result = await validateGraphDocument({
      documentPath: directValidationDocument,
      profilePath: designProfile,
    });

    expect(result.status).toBe("pass");
    expect(result.requiredPathResults).toEqual([
      {
        pathId: "design.requirement_to_validation",
        sourceId: "REQ-1",
        status: "satisfied",
        nodeIds: ["REQ-1", "VAL-1"],
        relationshipClasses: ["requirement_validated_by"],
      },
    ]);
  });

  it("contains malformed profiles and unreadable documents as operational results", async () => {
    const profileFailure = await validateGraphDocument({
      documentPath: positiveDocument,
      profilePath: malformedProfile,
    });
    const missingDocument = path.join(repoRoot, "missing-graph-document.md");
    const documentFailure = await validateGraphDocument({
      documentPath: missingDocument,
      profilePath: validProfile,
    });

    expect(profileFailure).toMatchObject({
      schemaVersion: "markdown-trace.graph-validation-result.v1",
      status: "operational-error",
      source: { path: positiveDocument, sha256: null, lineCount: null },
      profile: { path: malformedProfile, profileId: null, sha256: null },
      diagnostics: [
        {
          code: "markdown-trace.graph.profile_error",
          stage: "profile-load",
          blocking: true,
          sourceRanges: [],
        },
      ],
    });
    expect(documentFailure).toMatchObject({
      schemaVersion: "markdown-trace.graph-validation-result.v1",
      status: "operational-error",
      source: { path: missingDocument, sha256: null, lineCount: null },
      profile: {
        path: validProfile,
        profileId: "markdown-trace.execution-spec.contract-fixture",
        artifactFamily: "execution-spec",
        sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
      diagnostics: [
        {
          code: "markdown-trace.graph.operational_error",
          stage: "document-read",
          source: missingDocument,
          blocking: true,
        },
      ],
    });
  });
});

describe("graph-validate CLI", () => {
  it("emits deterministic JSON and writes the complete requested output on pass", async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const outputPath = path.join(temporaryDirectory, "graph-validation.json");
    const first = await runCli([
      "graph-validate",
      "--file",
      positiveDocument,
      "--profile",
      validProfile,
      "--output",
      outputPath,
      "--format",
      "json",
    ]);
    const second = await runCli([
      "graph-validate",
      "--file",
      positiveDocument,
      "--profile",
      validProfile,
    ]);

    expect(first.exitCode).toBe(0);
    expect(first.stderr).toBe("");
    expect(JSON.parse(first.stdout)).toMatchObject({
      schemaVersion: "markdown-trace.graph-validation-result.v1",
      status: "pass",
    });
    expect(await readFile(outputPath, "utf8")).toBe(first.stdout);
    expect(second).toEqual({ exitCode: 0, stdout: first.stdout, stderr: "" });
  });

  it("serializes the same public result payload as the file-backed API", async () => {
    const apiResult = await validateGraphDocument({
      documentPath: positiveDocument,
      profilePath: validProfile,
    });
    const cliResult = await runCli([
      "graph-validate",
      "--file",
      positiveDocument,
      "--profile",
      validProfile,
    ]);

    expect(cliResult.exitCode).toBe(0);
    expect(JSON.parse(cliResult.stdout)).toEqual(apiResult);
  });

  it("uses exit 1 for blocking graph diagnostics", async () => {
    const result = await runCli([
      "graph-validate",
      "--file",
      negativeDocument,
      "--profile",
      validProfile,
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toMatchObject({
      schemaVersion: "markdown-trace.graph-validation-result.v1",
      status: "fail",
      diagnostics: [
        { code: "markdown-trace.graph.missing_required_path", blocking: true },
      ],
    });
  });

  it("uses exit 2 and avoids output artifacts for operational failures", async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const outputPath = path.join(temporaryDirectory, "should-not-exist.json");
    const result = await runCli([
      "graph-validate",
      "--file",
      positiveDocument,
      "--profile",
      malformedProfile,
      "--output",
      outputPath,
    ]);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(JSON.parse(result.stderr)).toMatchObject({
      schemaVersion: "markdown-trace.graph-validation-result.v1",
      status: "operational-error",
      diagnostics: [{ code: "markdown-trace.graph.profile_error" }],
    });
    await expect(access(outputPath)).rejects.toThrow();
  });

  it("rejects output paths that alias either input without modifying them", async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const documentPath = path.join(temporaryDirectory, "document.md");
    const profilePath = path.join(temporaryDirectory, "profile.yaml");
    await copyFile(positiveDocument, documentPath);
    await copyFile(validProfile, profilePath);
    const originalDocument = await readFile(documentPath, "utf8");
    const originalProfile = await readFile(profilePath, "utf8");

    for (const outputPath of [documentPath, profilePath]) {
      const result = await runCli([
        "graph-validate",
        "--file",
        documentPath,
        "--profile",
        profilePath,
        "--output",
        outputPath,
      ]);

      expect(result.exitCode).toBe(2);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("graph-validate output path aliases input path");
      expect(await readFile(documentPath, "utf8")).toBe(originalDocument);
      expect(await readFile(profilePath, "utf8")).toBe(originalProfile);
    }
  });

  it("rejects formats that are not yet part of the command contract", async () => {
    const result = await runCli([
      "graph-validate",
      "--file",
      positiveDocument,
      "--profile",
      validProfile,
      "--format",
      "markdown",
    ]);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe(
      "unsupported graph-validate format markdown; expected json\n",
    );
  });
});

async function runCli(args: readonly string[]): Promise<{
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCode = await main([...args], {
    cwd: repoRoot,
    stdout: (text) => stdout.push(text),
    stderr: (text) => stderr.push(text),
  });

  return { exitCode, stdout: stdout.join(""), stderr: stderr.join("") };
}

async function createTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "markdown-trace-graph-cli-"));
  temporaryDirectories.push(directory);
  return directory;
}
