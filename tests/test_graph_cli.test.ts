import { readFileSync } from "node:fs";
import {
  access,
  chmod,
  copyFile,
  link,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { MARKDOWN_TRACE_PACKAGE_VERSION } from "../src/markdowntrace/generated/release-metadata.js";
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
  it("reports the stable package version with no additional output", async () => {
    await expect(runCli(["--version"])).resolves.toEqual({
      exitCode: 0,
      stdout: `${MARKDOWN_TRACE_PACKAGE_VERSION}\n`,
      stderr: "",
    });
  });

  it("classifies the stable and experimental command surfaces in package help", async () => {
    const result = await runCli(["--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Stable commands:\n  graph-validate");
    expect(result.stdout).toContain("Experimental commands (0.x):\n  validate");
    expect(result.stdout).toContain("\n  derive ");
    expect(result.stdout).toContain("\n  derive-sidecar ");
    expect(result.stdout).toContain("\n  migration-check ");
  });

  it("emits deterministic JSON and writes the complete requested output on pass", async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const outputPath = path.join(temporaryDirectory, "graph-validation.json");
    const originalDocument = await readFile(positiveDocument, "utf8");
    const originalProfile = await readFile(validProfile, "utf8");
    await writeFile(outputPath, "prior destination bytes", "utf8");
    let outputObservedAtStdout: string | undefined;
    const first = await runCli(
      [
        "graph-validate",
        "--file",
        positiveDocument,
        "--profile",
        validProfile,
        "--output",
        outputPath,
        "--format",
        "json",
      ],
      {
        onStdout: () => {
          outputObservedAtStdout = readFileSync(outputPath, "utf8");
        },
      },
    );
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
    expect(outputObservedAtStdout).toBe(first.stdout);
    expect(await readdir(temporaryDirectory)).toEqual(["graph-validation.json"]);
    expect(await readFile(positiveDocument, "utf8")).toBe(originalDocument);
    expect(await readFile(validProfile, "utf8")).toBe(originalProfile);
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
    const temporaryDirectory = await createTemporaryDirectory();
    const outputPath = path.join(temporaryDirectory, "graph-validation.json");
    const result = await runCli([
      "graph-validate",
      "--file",
      negativeDocument,
      "--profile",
      validProfile,
      "--output",
      outputPath,
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
    expect(await readFile(outputPath, "utf8")).toBe(result.stdout);
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

  it("routes unreadable documents as operational JSON without creating output", async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const outputPath = path.join(temporaryDirectory, "should-not-exist.json");
    const result = await runCli([
      "graph-validate",
      "--file",
      path.join(temporaryDirectory, "missing.md"),
      "--profile",
      validProfile,
      "--output",
      outputPath,
    ]);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(JSON.parse(result.stderr)).toMatchObject({
      schemaVersion: "markdown-trace.graph-validation-result.v1",
      status: "operational-error",
      diagnostics: [{ stage: "document-read" }],
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

    const documentHardLink = path.join(temporaryDirectory, "document-hard-link.md");
    await link(documentPath, documentHardLink);
    const hardLinkResult = await runCli([
      "graph-validate",
      "--file",
      documentPath,
      "--profile",
      profilePath,
      "--output",
      documentHardLink,
    ]);

    expect(hardLinkResult.exitCode).toBe(2);
    expect(hardLinkResult.stdout).toBe("");
    expect(hardLinkResult.stderr).toContain(
      "graph-validate output path aliases input path",
    );
    expect(await readFile(documentPath, "utf8")).toBe(originalDocument);
    expect(await readFile(documentHardLink, "utf8")).toBe(originalDocument);
    expect(await readFile(profilePath, "utf8")).toBe(originalProfile);
  });

  it("preserves a prior destination and suppresses stdout when persistence fails", async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const outputPath = path.join(temporaryDirectory, "graph-validation.json");
    const priorOutput = "prior destination bytes\n";
    await writeFile(outputPath, priorOutput, "utf8");
    await chmod(temporaryDirectory, 0o500);

    let result: Awaited<ReturnType<typeof runCli>>;

    try {
      result = await runCli([
        "graph-validate",
        "--file",
        positiveDocument,
        "--profile",
        validProfile,
        "--output",
        outputPath,
      ]);
    } finally {
      await chmod(temporaryDirectory, 0o700);
    }

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).not.toContain(
      '"schemaVersion":"markdown-trace.graph-validation-result.v1"',
    );
    expect(() => JSON.parse(result.stderr)).toThrow();
    expect(await readFile(outputPath, "utf8")).toBe(priorOutput);
    expect(await readdir(temporaryDirectory)).toEqual(["graph-validation.json"]);
  });

  it("routes output-directory failures as human-readable transport errors", async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const blockingPath = path.join(temporaryDirectory, "not-a-directory");
    await writeFile(blockingPath, "blocking file", "utf8");
    const result = await runCli([
      "graph-validate",
      "--file",
      positiveDocument,
      "--profile",
      validProfile,
      "--output",
      path.join(blockingPath, "graph-validation.json"),
    ]);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(() => JSON.parse(result.stderr)).toThrow();
    expect(await readFile(blockingPath, "utf8")).toBe("blocking file");
  });

  it("routes missing flags and unsupported options as invocation prose", async () => {
    const missingFlag = await runCli([
      "graph-validate",
      "--file",
      positiveDocument,
    ]);
    const unsupportedOption = await runCli([
      "graph-validate",
      "--file",
      positiveDocument,
      "--profile",
      validProfile,
      "--unexpected",
      "value",
    ]);

    for (const result of [missingFlag, unsupportedOption]) {
      expect(result.exitCode).toBe(2);
      expect(result.stdout).toBe("");
      expect(() => JSON.parse(result.stderr)).toThrow();
    }

    expect(missingFlag.stderr).toContain("Usage: markdown-trace");
    expect(unsupportedOption.stderr).toBe("unknown argument --unexpected\n");
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

interface RunCliOptions {
  readonly onStdout?: (text: string) => void;
}

async function runCli(args: readonly string[], options: RunCliOptions = {}): Promise<{
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCode = await main([...args], {
    cwd: repoRoot,
    stdout: (text) => {
      options.onStdout?.(text);
      stdout.push(text);
    },
    stderr: (text) => stderr.push(text),
  });

  return { exitCode, stdout: stdout.join(""), stderr: stderr.join("") };
}

async function createTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "markdown-trace-graph-cli-"));
  temporaryDirectories.push(directory);
  return directory;
}
