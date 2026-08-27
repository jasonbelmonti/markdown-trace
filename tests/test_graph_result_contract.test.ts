import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stringify } from "yaml";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EXECUTION_SPEC_FIRST_SLICE_PROFILE } from "../src/markdowntrace/graph-profile/index.js";
import {
  validateGraphDocument,
  type GraphArtifactFamily,
  type GraphDiagnostic,
  type GraphValidationEvidenceAnchor,
  type GraphValidationHashes,
  type GraphValidationNode,
  type GraphValidationOperationalDiagnostic,
  type GraphValidationOperationalResult,
  type GraphValidationOperationalStage,
  type GraphValidationProfileDescriptor,
  type GraphValidationRelationship,
  type GraphValidationRelationshipClass,
  type GraphValidationResult,
  type GraphValidationRunResult,
  type GraphValidationRuntimeMetadata,
  type GraphValidationSourceDescriptor,
  type GraphValidationSourcePosition,
  type GraphValidationSourceRange,
  type GraphValidationSummary,
  type RequiredPathResult,
  type ValidateGraphDocumentOptions,
} from "../src/markdowntrace/public.js";

const extractionControl = vi.hoisted(() => ({ failureMessage: null as string | null }));

vi.mock("../src/markdowntrace/trace-evidence/index.js", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("../src/markdowntrace/trace-evidence/index.js")
  >();

  return {
    ...actual,
    extractTraceEvidence: (
      ...args: Parameters<typeof actual.extractTraceEvidence>
    ): ReturnType<typeof actual.extractTraceEvidence> => {
      if (extractionControl.failureMessage !== null) {
        throw new Error(extractionControl.failureMessage);
      }

      return actual.extractTraceEvidence(...args);
    },
  };
});

type PublicContractClosure = {
  artifactFamily: GraphArtifactFamily;
  diagnostic: GraphDiagnostic;
  evidenceAnchor: GraphValidationEvidenceAnchor;
  hashes: GraphValidationHashes;
  node: GraphValidationNode;
  operationalDiagnostic: GraphValidationOperationalDiagnostic;
  operationalResult: GraphValidationOperationalResult;
  operationalStage: GraphValidationOperationalStage;
  options: ValidateGraphDocumentOptions;
  profile: GraphValidationProfileDescriptor;
  relationship: GraphValidationRelationship;
  relationshipClass: GraphValidationRelationshipClass;
  requiredPath: RequiredPathResult;
  result: GraphValidationResult;
  runResult: GraphValidationRunResult;
  runtime: GraphValidationRuntimeMetadata;
  source: GraphValidationSourceDescriptor;
  sourcePosition: GraphValidationSourcePosition;
  sourceRange: GraphValidationSourceRange;
  summary: GraphValidationSummary;
};

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
const temporaryDirectories: string[] = [];

afterEach(async () => {
  extractionControl.failureMessage = null;
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe("public graph-validation DTO and descriptor contract", () => {
  it("owns a nameable, self-contained public DTO graph", async () => {
    const publicContract: PublicContractClosure | undefined = undefined;
    const publicSource = await readFile(
      path.join(repoRoot, "src/markdowntrace/public.ts"),
      "utf8",
    );

    expect(publicContract).toBeUndefined();
    expect(publicSource).not.toContain("@jasonbelmonti/markdown-engine");
    expect(publicSource).not.toContain("./graph-validation/model");
    expect(publicSource).not.toContain("./trace-evidence/");
    expect(publicSource).not.toContain("./graph-profile/");
  });

  it("preserves baseline literal guarantees for existing DTO consumers", () => {
    const compileCompatibilityContract = (result: GraphValidationRunResult): void => {
      const packageVersion: "0.1.0" = result.run.packageVersion;
      const markdownEngineVersion: "2.0.0" = result.run.markdownEngineVersion;

      if (result.status === "operational-error") {
        const nodeCount: 0 = result.summary.nodes;
        const relationshipCount: 0 = result.summary.relationships;
        const requiredPathCount: 0 = result.summary.requiredPaths;
        const satisfiedRequiredPathCount: 0 = result.summary.satisfiedRequiredPaths;

        void nodeCount;
        void relationshipCount;
        void requiredPathCount;
        void satisfiedRequiredPathCount;
      }

      void packageVersion;
      void markdownEngineVersion;
    };

    expect(compileCompatibilityContract).toBeTypeOf("function");
  });

  it("resolves relative inputs from explicit cwd without mutating process state", async () => {
    const cwdBefore = process.cwd();
    const result = await validateGraphDocument({
      cwd: repoRoot,
      documentPath: path.relative(repoRoot, positiveDocument),
      profilePath: path.relative(repoRoot, validProfile),
    });

    expect(process.cwd()).toBe(cwdBefore);
    expect(result.status).toBe("pass");
    expect(result.source.path).toBe(positiveDocument);
    expect(result.profile.path).toBe(validProfile);
    expectDescriptorKeys(result);
  });

  it("uses uniform absolute descriptors for completed pass and fail results", async () => {
    for (const documentPath of [positiveDocument, negativeDocument]) {
      const result = await validateGraphDocument({ documentPath, profilePath: validProfile });

      expect(["pass", "fail"]).toContain(result.status);
      expect(result.source.path).toBe(documentPath);
      expect(result.profile.path).toBe(validProfile);
      expectDescriptorKeys(result);
    }
  });

  it("uses uniform absolute descriptors for profile-load and document-read failures", async () => {
    const missingDocument = path.join(repoRoot, "missing-public-contract-document.md");
    const profileFailure = await validateGraphDocument({
      cwd: repoRoot,
      documentPath: path.relative(repoRoot, positiveDocument),
      profilePath: path.relative(repoRoot, malformedProfile),
    });
    const documentFailure = await validateGraphDocument({
      documentPath: missingDocument,
      profilePath: validProfile,
    });

    expectOperationalStage(profileFailure, "profile-load");
    expect(profileFailure.source.path).toBe(positiveDocument);
    expect(profileFailure.profile.path).toBe(malformedProfile);
    expectDescriptorKeys(profileFailure);

    expectOperationalStage(documentFailure, "document-read");
    expect(documentFailure.source.path).toBe(missingDocument);
    expect(documentFailure.profile.path).toBe(validProfile);
    expectDescriptorKeys(documentFailure);
  });

  it("uses uniform descriptors for profile-compatibility failures", async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const profilePath = path.join(temporaryDirectory, "matrix-profile.yaml");
    await writeFile(profilePath, stringify(matrixProfile()), "utf8");

    const result = await validateGraphDocument({
      documentPath: positiveDocument,
      profilePath,
    });

    expectOperationalStage(result, "profile-compatibility");
    expect(result.source.path).toBe(positiveDocument);
    expect(result.profile.path).toBe(profilePath);
    expectDescriptorKeys(result);
  });

  it("uses uniform descriptors for evidence-extraction failures", async () => {
    extractionControl.failureMessage = "synthetic extraction boundary failure";
    const result = await validateGraphDocument({
      documentPath: positiveDocument,
      profilePath: validProfile,
    });

    expectOperationalStage(result, "evidence-extraction");
    expect(result.source.path).toBe(positiveDocument);
    expect(result.profile.path).toBe(validProfile);
    expectDescriptorKeys(result);
  });
});

function expectOperationalStage(
  result: GraphValidationRunResult,
  stage: GraphValidationOperationalStage,
): asserts result is GraphValidationOperationalResult {
  expect(result.status).toBe("operational-error");
  expect(result.diagnostics[0]).toMatchObject({ stage });
}

function expectDescriptorKeys(result: GraphValidationRunResult): void {
  expect(Object.keys(result.source).sort()).toEqual(["lineCount", "path", "sha256"]);
  expect(Object.keys(result.profile).sort()).toEqual([
    "artifactFamily",
    "path",
    "profileId",
    "profileVersion",
    "sha256",
  ]);
}

function matrixProfile(): unknown {
  return {
    ...structuredClone(EXECUTION_SPEC_FIRST_SLICE_PROFILE),
    profileId: "markdown-trace.execution-spec.matrix-only-test",
    requiredPaths: [
      {
        pathId: "exec.matrix-only",
        sourceFamilies: ["OBJ"],
        sourceSelector: {
          families: ["OBJ"],
          roles: ["primary_definition"],
          excludedTableRoleIds: [],
        },
        steps: [],
        alternativeSteps: [],
        rowRequirements: [
          { sourceFamilies: ["OBJ"], requiredTargetFamilies: ["WP"] },
        ],
        severity: "error",
        diagnosticCode: "markdown-trace.graph.missing_matrix_coverage",
      },
    ],
  };
}

async function createTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "markdown-trace-result-contract-"));
  temporaryDirectories.push(directory);
  return directory;
}
