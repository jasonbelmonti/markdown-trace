import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stringify } from "yaml";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EXECUTION_SPEC_FIRST_SLICE_PROFILE } from "../src/markdowntrace/graph-profile/index.js";
import type { GraphProfile } from "../src/markdowntrace/graph-profile/model.js";
import {
  graphProfileHash,
  serializeGraphProfile,
} from "../src/markdowntrace/graph-profile/serialization.js";
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
import type { TraceEvidenceResult } from "../src/markdowntrace/trace-evidence/model.js";
import {
  serializeTraceEvidence,
  traceEvidenceHash,
} from "../src/markdowntrace/trace-evidence/serialization.js";

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
    expect(result.hashes).toEqual({
      sourceSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      profileSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      traceEvidenceSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });

  it("uses uniform absolute descriptors for completed pass and fail results", async () => {
    for (const documentPath of [positiveDocument, negativeDocument]) {
      const result = await validateGraphDocument({ documentPath, profilePath: validProfile });

      expect(["pass", "fail"]).toContain(result.status);
      expect(result.source.path).toBe(documentPath);
      expect(result.profile.path).toBe(validProfile);
      expectDescriptorKeys(result);
      expect(result.hashes).toEqual({
        sourceSha256: result.source.sha256,
        profileSha256: result.profile.sha256,
        traceEvidenceSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      });
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
    expect(profileFailure.hashes).toEqual({
      sourceSha256: null,
      profileSha256: null,
      traceEvidenceSha256: null,
    });

    expectOperationalStage(documentFailure, "document-read");
    expect(documentFailure.source.path).toBe(missingDocument);
    expect(documentFailure.profile.path).toBe(validProfile);
    expectDescriptorKeys(documentFailure);
    expect(documentFailure.hashes).toEqual({
      sourceSha256: null,
      profileSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      traceEvidenceSha256: null,
    });
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
    expect(result.hashes).toEqual({
      sourceSha256: null,
      profileSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      traceEvidenceSha256: null,
    });
  });

  it("retains acquired source identity for evidence-extraction failures", async () => {
    extractionControl.failureMessage = "synthetic extraction boundary failure";
    const markdown = await readFile(positiveDocument, "utf8");
    const result = await validateGraphDocument({
      documentPath: positiveDocument,
      profilePath: validProfile,
    });

    expectOperationalStage(result, "evidence-extraction");
    expect(result.source).toEqual({
      path: positiveDocument,
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      lineCount: markdown.split(/\r\n|\r|\n/).length,
    });
    expect(result.profile.path).toBe(validProfile);
    expectDescriptorKeys(result);
    expect(result.hashes).toEqual({
      sourceSha256: createHash("sha256").update(markdown).digest("hex"),
      profileSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      traceEvidenceSha256: null,
    });
  });

  it("uses the normative semantic profile preimage and golden digest", () => {
    const profile = minimalProfile();
    const expectedPreimage = '{"schemaVersion":"markdown-trace.graph-profile.v1","profileId":"example.profile","artifactFamily":"execution-spec","profileVersion":"1.0.0","idFamilies":[],"definitionPolicies":{"primaryColumns":[],"supplementalColumns":[],"repeatedIdPolicy":{}},"tableRoles":[],"rangePolicy":{"syntax":"<FAMILY>-<n> through <FAMILY>-<m>","sameFamilyOnly":true,"requireDefinedEndpoints":true,"endpointRoles":["primary_definition"],"diagnosticCode":"markdown-trace.graph.invalid_range_endpoint"},"matrixSemantics":{"authority":"coverage-only","rowRole":"matrix_coverage","firstColumnMaySourceRelationships":true,"definitionsFromCells":false},"relationshipClasses":[],"requiredPaths":[],"diagnosticRules":[],"serialization":{"ordering":{"definitions":[],"coverageRows":[],"ranges":[],"relationships":[],"diagnostics":[],"repairActions":[]}}}';

    expect(serializeGraphProfile(profile)).toBe(expectedPreimage);
    expect(graphProfileHash(profile)).toBe(
      "4900a73ce81ec0910580ab2a8f97c2743e8d30cbfa8c07d42e9900bc101a76e3",
    );
  });

  it("uses the normative stable evidence preimage and golden digest", () => {
    const evidence = minimalEvidence();
    const expectedPreimage = '{"schemaVersion":"markdown-trace.trace-evidence.v1","authority":"trace-evidence","source":{"sha256":"source-hash","lineCount":1},"profile":{"profileId":"example.profile","artifactFamily":"execution-spec","profileVersion":"1.0.0","sha256":"profile-hash"},"definitions":[{"occurrenceId":"definition-0001","label":"OBJ-1","family":"OBJ","role":"primary_definition","sourceKind":"table_cell","sourceRange":{"start":{"line":1,"column":1,"offset":0},"end":{"line":1,"column":6,"offset":5}}}],"supplementalDefinitions":[],"coverageRows":[],"mentions":[],"ranges":[],"candidateEdges":[],"diagnostics":[]}';

    expect(serializeTraceEvidence(evidence)).toBe(expectedPreimage);
    expect(traceEvidenceHash(evidence)).toBe(
      "367f0f864d46210e4c0d07c32ba7fc51c84273dde4c82c16c5819c51285510dc",
    );
  });

  it("ignores object insertion order and non-semantic path/runtime/hash metadata", () => {
    const profile = {
      ...minimalProfile(),
      definitionPolicies: {
        primaryColumns: [],
        supplementalColumns: [],
        repeatedIdPolicy: {
          WP: "single_primary_with_references" as const,
          OBJ: "single_primary_with_references" as const,
        },
      },
    };
    const reorderedProfile = {
      ...Object.fromEntries(Object.entries(profile).reverse()),
      definitionPolicies: {
        repeatedIdPolicy: {
          OBJ: "single_primary_with_references",
          WP: "single_primary_with_references",
        },
        supplementalColumns: [],
        primaryColumns: [],
      },
    } as unknown as GraphProfile;
    const evidence = minimalEvidence();
    const reorderedEvidence = Object.fromEntries(
      Object.entries(evidence).reverse(),
    ) as unknown as TraceEvidenceResult;
    const relocatedEvidence: TraceEvidenceResult = {
      ...evidence,
      source: { ...evidence.source, path: "/another/location.md" },
      run: {
        packageVersion: "0.1.0",
        markdownEngineVersion: "2.0.0",
        runtimeVersion: "another-runtime",
      },
      hashes: {
        sourceSha256: "redundant-source-value",
        profileSha256: "redundant-profile-value",
      },
    };

    expect(graphProfileHash(reorderedProfile)).toBe(graphProfileHash(profile));
    expect(traceEvidenceHash(reorderedEvidence)).toBe(traceEvidenceHash(evidence));
    expect(traceEvidenceHash(relocatedEvidence)).toBe(traceEvidenceHash(evidence));
  });

  it("preserves declared array-order significance", () => {
    const profile = structuredClone(EXECUTION_SPEC_FIRST_SLICE_PROFILE);
    const reversedProfile = {
      ...profile,
      idFamilies: [...profile.idFamilies].reverse(),
    };
    const evidence = minimalEvidence();
    const secondDefinition = {
      ...evidence.definitions[0]!,
      occurrenceId: "definition-0002",
      label: "WP-1",
      family: "WP",
    };
    const forwardEvidence = {
      ...evidence,
      definitions: [evidence.definitions[0]!, secondDefinition],
    };
    const reversedEvidence = {
      ...forwardEvidence,
      definitions: [...forwardEvidence.definitions].reverse(),
    };

    expect(graphProfileHash(reversedProfile)).not.toBe(graphProfileHash(profile));
    expect(traceEvidenceHash(reversedEvidence)).not.toBe(
      traceEvidenceHash(forwardEvidence),
    );
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

function minimalProfile(): GraphProfile {
  return {
    schemaVersion: "markdown-trace.graph-profile.v1",
    profileId: "example.profile",
    artifactFamily: "execution-spec",
    profileVersion: "1.0.0",
    idFamilies: [],
    definitionPolicies: {
      primaryColumns: [],
      supplementalColumns: [],
      repeatedIdPolicy: {},
    },
    tableRoles: [],
    rangePolicy: {
      syntax: "<FAMILY>-<n> through <FAMILY>-<m>",
      sameFamilyOnly: true,
      requireDefinedEndpoints: true,
      endpointRoles: ["primary_definition"],
      diagnosticCode: "markdown-trace.graph.invalid_range_endpoint",
    },
    matrixSemantics: {
      authority: "coverage-only",
      rowRole: "matrix_coverage",
      firstColumnMaySourceRelationships: true,
      definitionsFromCells: false,
    },
    relationshipClasses: [],
    requiredPaths: [],
    diagnosticRules: [],
    serialization: {
      ordering: {
        definitions: [],
        coverageRows: [],
        ranges: [],
        relationships: [],
        diagnostics: [],
        repairActions: [],
      },
    },
  };
}

function minimalEvidence(): TraceEvidenceResult {
  return {
    schemaVersion: "markdown-trace.trace-evidence.v1",
    authority: "trace-evidence",
    source: {
      path: "/ignored/document.md",
      sha256: "source-hash",
      lineCount: 1,
    },
    profile: {
      profileId: "example.profile",
      artifactFamily: "execution-spec",
      profileVersion: "1.0.0",
      sha256: "profile-hash",
    },
    run: {
      packageVersion: "0.1.0",
      markdownEngineVersion: "2.0.0",
      runtimeVersion: "v22",
    },
    definitions: [
      {
        occurrenceId: "definition-0001",
        label: "OBJ-1",
        family: "OBJ",
        role: "primary_definition",
        sourceKind: "table_cell",
        sourceRange: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 6, offset: 5 },
        },
      },
    ],
    supplementalDefinitions: [],
    coverageRows: [],
    mentions: [],
    ranges: [],
    candidateEdges: [],
    diagnostics: [],
    hashes: {
      sourceSha256: "source-hash",
      profileSha256: "profile-hash",
    },
  };
}
