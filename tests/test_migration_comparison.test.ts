import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { MARKDOWN_ENGINE_PACKAGE, scanMarkdown } from "../src/markdowntrace/markdown/index.js";
import {
  checkGeneratedSidecarArtifact,
  EntityRegistry,
  loadRegistry,
  type RegistryEdge,
  type RegistryEntity,
} from "../src/markdowntrace/registry/index.js";
import { deriveGraphFromRegistry, type TraceGraph } from "../src/markdowntrace/graph/index.js";
import {
  compareMigrationPair,
  MIGRATION_COMPARISON_DIMENSIONS,
  normalizeMetadataEntries,
  normalizeMigrationComparison,
  type MigrationApprovedIntentionalDelta,
  type MigrationComparisonDimension,
  type MigrationComparisonReport,
  type MigrationComparisonReportInput,
  type MigrationComparisonSideInput,
  type MigrationGeneratedMetadata,
  type MigrationValidationInput,
} from "../src/markdowntrace/migration/index.js";
import {
  validate,
  type ValidationFinding,
  type ValidationResult,
} from "../src/markdowntrace/validation/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const selectedFixtureDirectory = "fixtures/r1-link-backed-entity-syntax";
const selectedDocumentPath = `${selectedFixtureDirectory}/minimal-link-backed-execution-spec.md`;
const selectedManualRegistryPath =
  `${selectedFixtureDirectory}/minimal-link-backed-manual-registry.yaml`;
const selectedTypeProfilePath = `${selectedFixtureDirectory}/minimal-type-profile.yaml`;
const selectedGeneratedSidecarPath =
  `${selectedFixtureDirectory}/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml`;

describe("migration comparison contract", () => {
  it("normalizes every required comparison dimension in a stable dimension order", () => {
    const normalized = normalizeMigrationComparison({
      manual: sideInput("manual"),
      generated: sideInput("generated", generatedMetadata()),
    });

    expect(normalized.dimensions.map((dimension) => dimension.dimension)).toEqual(
      MIGRATION_COMPARISON_DIMENSIONS,
    );
    expect(
      normalized.dimensions.map((dimension) =>
        dimension.snapshots.map((snapshot) => snapshot.side),
      ),
    ).toEqual([
      ["manual", "generated"],
      ["manual", "generated"],
      ["manual", "generated"],
      ["manual", "generated"],
    ]);
    expect(
      normalized.dimensions.find((dimension) => dimension.dimension === "metadata")?.snapshots[0]
        ?.entries,
    ).toEqual([
      {
        path: "generated.present",
        value: false,
      },
    ]);
  });

  it("uses deterministic ordering for registry, graph, metadata, and validation entries", () => {
    const normalized = normalizeMigrationComparison({
      manual: sideInput("manual", undefined, "reversed"),
      generated: sideInput("generated", generatedMetadata(), "reversed"),
    });
    const normalizedAgain = normalizeMigrationComparison({
      manual: sideInput("manual", undefined, "ordered"),
      generated: sideInput("generated", generatedMetadata(), "ordered"),
    });

    expect(normalized).toEqual(normalizedAgain);
  });

  it("normalizes without mutating source objects", () => {
    const registry = registryFixture("reversed");
    const graph = graphFixture("reversed");
    const validation = validationFixture("reversed");

    normalizeMigrationComparison({
      manual: {
        registry,
        graph,
        validation,
      },
      generated: {
        registry,
        graph,
        metadata: generatedMetadata(),
        validation,
      },
    });

    expect(registry.entities.map((entity) => entity.id)).toEqual(["exec.wp.1", "exec.con.1"]);
    expect(registry.edges.map((edge) => `${edge.source}->${edge.target}`)).toEqual([
      "exec.wp.1->exec.con.1",
      "exec.con.1->exec.wp.1",
    ]);
    expect(graph.nodes.map((node) => node.id)).toEqual(["exec.wp.1", "exec.con.1"]);
    expect(validation.result.findings.map((finding) => finding.category)).toEqual([
      "missing_reference",
      "missing_edge_target",
    ]);
  });

  it("represents generated metadata presence and type profile absence explicitly", () => {
    expect(
      normalizeMetadataEntries({ ...generatedMetadata(), typeProfile: undefined }),
    ).toContainEqual({
      path: "generated.typeProfile.present",
      value: false,
    });
  });

  it("uses unambiguous sort keys for external references and duplicate range boundaries", () => {
    const normalized = normalizeMigrationComparison({
      manual: {
        registry: ambiguousRegistryFixture("reversed"),
        graph: graphFixture("reversed"),
        validation: validationFixture("reversed"),
      },
      generated: {
        registry: ambiguousRegistryFixture("ordered"),
        graph: graphFixture("ordered"),
        metadata: generatedMetadata(),
        validation: validationFixture("ordered"),
      },
    });
    const normalizedAgain = normalizeMigrationComparison({
      manual: {
        registry: ambiguousRegistryFixture("ordered"),
        graph: graphFixture("ordered"),
        validation: validationFixture("ordered"),
      },
      generated: {
        registry: ambiguousRegistryFixture("reversed"),
        graph: graphFixture("reversed"),
        metadata: generatedMetadata(),
        validation: validationFixture("reversed"),
      },
    });

    expect(normalized).toEqual(normalizedAgain);
  });

  it("uses complete sort keys for graph entries and nullable finding fields", () => {
    const normalized = normalizeMigrationComparison({
      manual: {
        registry: registryFixture("ordered"),
        graph: ambiguousGraphFixture("reversed"),
        validation: ambiguousValidationFixture("reversed", "manual"),
      },
      generated: {
        registry: registryFixture("reversed"),
        graph: ambiguousGraphFixture("ordered"),
        metadata: generatedMetadata(),
        validation: ambiguousValidationFixture("ordered", "generated"),
      },
    });
    const normalizedAgain = normalizeMigrationComparison({
      manual: {
        registry: registryFixture("reversed"),
        graph: ambiguousGraphFixture("ordered"),
        validation: ambiguousValidationFixture("ordered", "manual"),
      },
      generated: {
        registry: registryFixture("ordered"),
        graph: ambiguousGraphFixture("reversed"),
        metadata: generatedMetadata(),
        validation: ambiguousValidationFixture("reversed", "generated"),
      },
    });

    expect(normalized).toEqual(normalizedAgain);
  });

  it("builds an equivalent report when all normalized dimensions match", () => {
    const report = compareMigrationPair({
      documentPath: "fixtures/migration-test.md",
      manualRegistryPath: "fixtures/manual.yaml",
      generatedSidecarPath: "fixtures/generated.yaml",
      authorityState: "yaml-authoritative",
      manual: sideInput("manual"),
      generated: sideInput("manual"),
    });

    expect(report.exitCode).toBe(0);
    expect(report.dimensions).toEqual(
      MIGRATION_COMPARISON_DIMENSIONS.map((dimension) => ({
        dimension,
        status: "equivalent",
        deltas: [],
      })),
    );
  });

  for (const dimension of MIGRATION_COMPARISON_DIMENSIONS) {
    it(`classifies approved ${dimension} drift as intentional`, () => {
      const { delta, generated, manual } = singleDimensionDrift(dimension);
      const rationale = `Approved ${dimension} drift for deterministic classification coverage.`;
      const report = compareMigrationPair({
        documentPath: "fixtures/migration-test.md",
        manualRegistryPath: "fixtures/manual.yaml",
        generatedSidecarPath: "fixtures/generated.yaml",
        authorityState: "yaml-authoritative",
        approvedIntentionalDeltas: [
          {
            dimension,
            ...delta,
            rationale,
          },
        ],
        manual,
        generated,
      });

      expect(report.exitCode).toBe(0);
      expect(dimensionResult(report, dimension)).toMatchObject({
        status: "intentional",
        deltas: [expect.objectContaining({ ...delta, rationale })],
      });
    });
  }

  for (const dimension of MIGRATION_COMPARISON_DIMENSIONS) {
    it(`classifies unexplained ${dimension} drift as blocking`, () => {
      const { delta, generated, manual } = singleDimensionDrift(dimension);
      const report = compareMigrationPair({
        documentPath: "fixtures/migration-test.md",
        manualRegistryPath: "fixtures/manual.yaml",
        generatedSidecarPath: "fixtures/generated.yaml",
        authorityState: "yaml-authoritative",
        manual,
        generated,
      });

      expect(report.exitCode).toBe(1);
      expect(dimensionResult(report, dimension)).toMatchObject({
        status: "blocking",
        deltas: [expect.objectContaining(delta)],
      });
    });
  }

  it("keeps generated metadata absence blocking outside yaml-authoritative state", () => {
    const checkedMetadata = generatedMetadata();
    const report = compareMigrationPair({
      documentPath: "fixtures/migration-test.md",
      manualRegistryPath: "fixtures/manual.yaml",
      generatedSidecarPath: "fixtures/generated.yaml",
      authorityState: "generated-authoritative",
      generatedMetadataCheck: {
        valid: true,
        metadata: checkedMetadata,
      },
      manual: sideInput("manual"),
      generated: sideInput("manual", checkedMetadata),
    });

    expect(report.exitCode).toBe(1);
    expect(dimensionResult(report, "metadata")).toMatchObject({
      status: "blocking",
      deltas: expect.arrayContaining([
        expect.objectContaining({
          path: "generated.present",
          expected: false,
          actual: true,
        }),
      ]),
    });
  });

  it("does not allow generic approvals to bypass the metadata absence authority guard", () => {
    const checkedMetadata = generatedMetadata();
    const report = compareMigrationPair({
      documentPath: "fixtures/migration-test.md",
      manualRegistryPath: "fixtures/manual.yaml",
      generatedSidecarPath: "fixtures/generated.yaml",
      authorityState: "generated-authoritative",
      approvedIntentionalDeltas: generatedMetadataAbsenceApprovals(checkedMetadata),
      generatedMetadataCheck: {
        valid: true,
        metadata: checkedMetadata,
      },
      manual: sideInput("manual"),
      generated: sideInput("manual", checkedMetadata),
    });

    expect(report.exitCode).toBe(1);
    expect(dimensionResult(report, "metadata")).toMatchObject({
      status: "blocking",
    });
  });

  it("classifies generated metadata that differs from the checked sidecar as blocking", () => {
    const checkedMetadata = generatedMetadata();
    const checkedTypeProfile = checkedMetadata.typeProfile;

    if (checkedTypeProfile === undefined) {
      throw new Error("generated metadata fixture must include type profile metadata");
    }

    const driftedMetadata: MigrationGeneratedMetadata = {
      ...checkedMetadata,
      source: {
        ...checkedMetadata.source,
        documentSha256: "unsupported-source-drift",
      },
      typeProfile: {
        ...checkedTypeProfile,
        pathSha256: "unsupported-profile-path-drift",
      },
      generator: {
        ...checkedMetadata.generator,
        packageVersion: "unsupported-version-drift",
        command: "unsupported-command-drift",
      },
    };
    const report = compareMigrationPair({
      documentPath: "fixtures/migration-test.md",
      manualRegistryPath: "fixtures/manual.yaml",
      generatedSidecarPath: "fixtures/generated.yaml",
      authorityState: "yaml-authoritative",
      generatedMetadataCheck: {
        valid: true,
        metadata: checkedMetadata,
      },
      manual: sideInput("manual"),
      generated: sideInput("manual", driftedMetadata),
    });

    expect(report.exitCode).toBe(1);
    expect(
      report.dimensions.find((dimension) => dimension.dimension === "metadata"),
    ).toMatchObject({
      status: "blocking",
      deltas: expect.arrayContaining([
        expect.objectContaining({
          path: "generated.source.documentSha256",
          actual: "unsupported-source-drift",
        }),
        expect.objectContaining({
          path: "generated.typeProfile.pathSha256",
          actual: "unsupported-profile-path-drift",
        }),
        expect.objectContaining({
          path: "generated.generator.command",
          actual: "unsupported-command-drift",
        }),
      ]),
    });
  });

  it("produces the first selected same-document parity report", async () => {
    const report = await selectedFixtureComparisonReport();

    expect(report).toMatchObject({
      documentPath: selectedDocumentPath,
      manualRegistryPath: selectedManualRegistryPath,
      generatedSidecarPath: selectedGeneratedSidecarPath,
      exitCode: 0,
    });
    expect(report.dimensions.map((dimension) => dimension.dimension)).toEqual(
      MIGRATION_COMPARISON_DIMENSIONS,
    );
    expect(report.dimensions.map(({ dimension, status }) => [dimension, status])).toEqual([
      ["registry", "equivalent"],
      ["graph", "equivalent"],
      ["metadata", "intentional"],
      ["validation", "equivalent"],
    ]);
    expect(
      report.dimensions.find((dimension) => dimension.dimension === "metadata")?.deltas,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "generated.present",
          expected: false,
          actual: true,
        }),
        expect.objectContaining({
          path: "generated.humanEditable",
          expected: { kind: "missing" },
          actual: false,
        }),
      ]),
    );
  });
});

type FixtureOrder = "ordered" | "reversed";

type IntentionalDeltaExpectation = Omit<
  MigrationApprovedIntentionalDelta,
  "dimension" | "rationale"
>;

interface SingleDimensionDrift {
  readonly delta: IntentionalDeltaExpectation;
  readonly generated: MigrationComparisonSideInput;
  readonly manual: MigrationComparisonSideInput;
}

function sideInput(
  side: "manual" | "generated",
  metadata?: MigrationGeneratedMetadata,
  order: FixtureOrder = "ordered",
): MigrationComparisonSideInput {
  return {
    registry: registryFixture(order),
    graph: graphFixture(order),
    ...(metadata === undefined ? {} : { metadata }),
    validation: validationFixture(order, side),
  };
}

function singleDimensionDrift(dimension: MigrationComparisonDimension): SingleDimensionDrift {
  switch (dimension) {
    case "registry":
      return registryDimensionDrift();
    case "graph":
      return graphDimensionDrift();
    case "metadata":
      return metadataDimensionDrift();
    case "validation":
      return validationDimensionDrift();
  }
}

function registryDimensionDrift(): SingleDimensionDrift {
  const generated = sideInput("manual");

  return {
    delta: {
      path: "document.title",
      expected: "Migration Test",
      actual: "Generated Migration Test",
    },
    manual: sideInput("manual"),
    generated: {
      ...generated,
      registry: new EntityRegistry({
        registryVersion: generated.registry.registryVersion,
        document: {
          ...generated.registry.document,
          title: "Generated Migration Test",
        },
        entities: generated.registry.entities,
        edges: generated.registry.edges,
        externalRefs: generated.registry.externalRefs,
      }),
    },
  };
}

function graphDimensionDrift(): SingleDimensionDrift {
  const generated = sideInput("manual");

  return {
    delta: {
      path: "nodes.0.label",
      expected: "CON-1",
      actual: "CON-DRIFT",
    },
    manual: sideInput("manual"),
    generated: {
      ...generated,
      graph: {
        ...generated.graph,
        nodes: generated.graph.nodes.map((node) =>
          node.id === "exec.con.1" ? { ...node, label: "CON-DRIFT" } : node,
        ),
      },
    },
  };
}

function metadataDimensionDrift(): SingleDimensionDrift {
  const manualMetadata = generatedMetadata();
  const generatedMetadataValue: MigrationGeneratedMetadata = {
    ...manualMetadata,
    generator: {
      ...manualMetadata.generator,
      packageVersion: "0.2.0",
    },
  };

  return {
    delta: {
      path: "generated.generator.packageVersion",
      expected: "0.1.0",
      actual: "0.2.0",
    },
    manual: sideInput("manual", manualMetadata),
    generated: sideInput("manual", generatedMetadataValue),
  };
}

function validationDimensionDrift(): SingleDimensionDrift {
  const generated = sideInput("manual");

  return {
    delta: {
      path: "exitCode",
      expected: 1,
      actual: 0,
    },
    manual: sideInput("manual"),
    generated: {
      ...generated,
      validation: {
        ...generated.validation,
        exitCode: 0,
      },
    },
  };
}

function dimensionResult(
  report: MigrationComparisonReport,
  dimension: MigrationComparisonDimension,
): MigrationComparisonReport["dimensions"][number] {
  const result = report.dimensions.find((entry) => entry.dimension === dimension);

  if (result === undefined) {
    throw new Error(`missing ${dimension} result`);
  }

  return result;
}

function generatedMetadataAbsenceApprovals(
  metadata: MigrationGeneratedMetadata,
): readonly MigrationApprovedIntentionalDelta[] {
  return normalizeMetadataEntries(metadata).map((entry) => ({
    dimension: "metadata",
    path: entry.path,
    expected: entry.path === "generated.present" ? false : ({ kind: "missing" } as const),
    actual: entry.value,
    rationale: "Unsafe generic metadata absence approval.",
  }));
}

function registryFixture(order: FixtureOrder): EntityRegistry {
  const entities = orderedByFixtureOrder(
    [
      entityFixture("exec.con.1", "CON-1", "constraint", []),
      entityFixture("exec.wp.1", "WP-1", "work_package", ["CON-1"]),
    ],
    order,
  );
  const edges = orderedByFixtureOrder<RegistryEdge>(
    [
      {
        source: "exec.con.1",
        relationship: "referenced_by",
        target: "exec.wp.1",
      },
      {
        source: "exec.wp.1",
        relationship: "references",
        target: "exec.con.1",
      },
    ],
    order,
  );

  return new EntityRegistry({
    registryVersion: "migration-test.v0",
    document: {
      id: "migration.test",
      title: "Migration Test",
      path: "fixtures/migration-test.md",
      fixtureFamily: "migration",
      sourceDocs: orderedByFixtureOrder(["docs/b.md", "docs/a.md"], order),
    },
    entities,
    edges,
    externalRefs: orderedByFixtureOrder(
      [
        {
          system: "github",
          key: "abc123",
          relatedEntity: "exec.con.1",
          role: "source_commit",
        },
        {
          system: "linear",
          key: "BEL-1231",
          relatedEntity: "exec.wp.1",
          role: "task_of_record",
        },
      ],
      order,
    ),
  });
}

function ambiguousRegistryFixture(order: FixtureOrder): EntityRegistry {
  return new EntityRegistry({
    registryVersion: "migration-test.v0",
    document: {
      id: "migration.test",
      title: "Migration Test",
      path: "fixtures/migration-test.md",
      fixtureFamily: "migration",
      sourceDocs: [],
    },
    entities: [
      {
        ...entityFixture("exec.wp.1", "WP-1", "work_package", ["CON-1"]),
        expectedReferences: {
          labels: ["CON-1"],
          ranges: orderedByFixtureOrder(
            [
              {
                labelFamily: "CON",
                start: "CON-1",
                end: "CON-2",
                expandsTo: ["CON-1"],
              },
              {
                labelFamily: "CON",
                start: "CON-1",
                end: "CON-2",
                expandsTo: ["CON-1", "CON-2"],
              },
            ],
            order,
          ),
        },
      },
      entityFixture("exec.con.1", "CON-1", "constraint", []),
    ],
    edges: [],
    externalRefs: orderedByFixtureOrder(
      [
        {
          system: "linear",
          key: "BEL-1231",
          relatedEntity: "a:b",
          role: "c",
        },
        {
          system: "linear",
          key: "BEL-1231",
          relatedEntity: "a",
          role: "b:c",
        },
      ],
      order,
    ),
  });
}

function entityFixture(
  id: string,
  label: string,
  type: string,
  expectedLabels: readonly string[],
): RegistryEntity {
  return {
    id,
    label,
    type,
    defines: {
      kind: "heading",
      text: `### ${label}: ${type}`,
    },
    expectedReferences: {
      labels: expectedLabels,
      ranges:
        expectedLabels.length === 0
          ? []
          : [
              {
                labelFamily: "CON",
                start: "CON-1",
                end: "CON-2",
                expandsTo: ["CON-2", "CON-1"],
              },
            ],
    },
  };
}

function graphFixture(order: FixtureOrder): TraceGraph {
  return {
    nodes: orderedByFixtureOrder(
      [
        {
          id: "exec.con.1",
          label: "CON-1",
          type: "constraint",
        },
        {
          id: "exec.wp.1",
          label: "WP-1",
          type: "work_package",
        },
      ],
      order,
    ),
    edges: orderedByFixtureOrder(
      [
        {
          source: "exec.con.1",
          target: "exec.wp.1",
        },
        {
          source: "exec.wp.1",
          target: "exec.con.1",
        },
      ],
      order,
    ),
  };
}

function ambiguousGraphFixture(order: FixtureOrder): TraceGraph {
  return {
    nodes: orderedByFixtureOrder(
      [
        {
          id: "exec.duplicate",
          label: "CON-1",
          type: "constraint",
        },
        {
          id: "exec.duplicate",
          label: "WP-1",
          type: "work_package",
        },
      ],
      order,
    ),
    edges: orderedByFixtureOrder(
      [
        {
          source: "exec\u0000wp",
          target: "exec.con",
        },
        {
          source: "exec",
          target: "wp\u0000exec.con",
        },
      ],
      order,
    ),
  };
}

function validationFixture(
  order: FixtureOrder,
  sourcePath = "manual",
): MigrationValidationInput {
  const findings = orderedByFixtureOrder<ValidationFinding>(
    [
      {
        category: "missing_edge_target",
        entityId: "exec.wp.1",
        edgeRelationship: "references",
        message: "Missing edge target.",
      },
      {
        category: "missing_reference",
        entityId: "exec.wp.1",
        label: "CON-99",
        message: "Missing reference.",
      },
    ],
    order,
  );
  const result: ValidationResult = {
    valid: false,
    metadata: {
      enginePackage: MARKDOWN_ENGINE_PACKAGE,
      documentVersion: "markdown-engine.document.v1",
      sourcePath,
    },
    findings,
    summary: {
      entities: 2,
      definitionsResolved: 2,
      expectedReferencesResolved: 1,
      expectedRangesResolved: 1,
      edgesResolved: 1,
      findings: findings.length,
    },
  };

  return {
    exitCode: 1,
    result,
  };
}

function ambiguousValidationFixture(
  order: FixtureOrder,
  sourcePath: string,
): MigrationValidationInput {
  const findings = orderedByFixtureOrder<ValidationFinding>(
    [
      {
        category: "missing_reference",
        label: "",
        message: "Ambiguous optional finding field.",
      },
      {
        category: "missing_reference",
        entityId: "",
        message: "Ambiguous optional finding field.",
      },
    ],
    order,
  );
  const result: ValidationResult = {
    valid: false,
    metadata: {
      enginePackage: MARKDOWN_ENGINE_PACKAGE,
      documentVersion: "markdown-engine.document.v1",
      sourcePath,
    },
    findings,
    summary: {
      entities: 2,
      definitionsResolved: 2,
      expectedReferencesResolved: 1,
      expectedRangesResolved: 1,
      edgesResolved: 1,
      findings: findings.length,
    },
  };

  return {
    exitCode: 1,
    result,
  };
}

function generatedMetadata(): MigrationGeneratedMetadata {
  return {
    artifactVersion: "markdown-trace.generated-sidecar.v0",
    artifactKind: "registry",
    reviewMarker: "generated-by-markdown-trace",
    humanEditable: false,
    source: {
      documentPath: "fixtures/migration-test.md",
      documentSha256: "source-hash",
    },
    typeProfile: {
      path: "fixtures/migration-profile.yaml",
      pathSha256: "profile-path-hash",
      contentSha256: "profile-content-hash",
      profileVersion: "markdown-trace.type-profile.v1",
    },
    generator: {
      packageName: "markdown-trace",
      packageVersion: "0.1.0",
      command:
        "markdown-trace derive-sidecar --document fixtures/migration-test.md --type-profile fixtures/migration-profile.yaml",
      serialization: "yaml-lf-final-newline-v0",
    },
  };
}

function orderedByFixtureOrder<T>(values: readonly T[], order: FixtureOrder): readonly T[] {
  return order === "ordered" ? [...values] : [...values].reverse();
}

async function selectedFixtureComparisonReport(): Promise<MigrationComparisonReport> {
  const [manualRegistry, generatedRegistry, generatedSidecarCheck] = await Promise.all([
    loadRegistry(path.join(repoRoot, selectedManualRegistryPath)),
    loadRegistry(path.join(repoRoot, selectedGeneratedSidecarPath)),
    checkGeneratedSidecarArtifact({
      repoRoot,
      documentPath: selectedDocumentPath,
      typeProfilePath: selectedTypeProfilePath,
    }),
  ]);

  expect(generatedSidecarCheck.valid).toBe(true);

  return compareMigrationPair({
    documentPath: selectedDocumentPath,
    manualRegistryPath: selectedManualRegistryPath,
    generatedSidecarPath: selectedGeneratedSidecarPath,
    authorityState: "yaml-authoritative",
    generatedMetadataCheck: {
      valid: generatedSidecarCheck.valid,
      metadata: generatedSidecarCheck.artifact.generated,
    },
    manual: await comparisonSideInput(manualRegistry),
    generated: {
      ...(await comparisonSideInput(generatedRegistry)),
      metadata: generatedSidecarCheck.artifact.generated,
    },
  });
}

async function comparisonSideInput(
  registry: EntityRegistry,
): Promise<MigrationComparisonReportInput["manual"]> {
  const result = validate(
    registry,
    await scanMarkdown(path.join(repoRoot, selectedDocumentPath), registry),
  );

  return {
    registry,
    graph: deriveGraphFromRegistry(registry),
    validation: {
      exitCode: result.valid ? 0 : 1,
      result,
    },
  };
}
