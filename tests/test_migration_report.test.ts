import { describe, expect, it } from "vitest";

import {
  type MigrationComparisonDimension,
  type MigrationComparisonReport,
  type MigrationDelta,
  type MigrationDimensionResult,
  type MigrationDimensionStatus,
  type MigrationMissingValue,
} from "../src/markdowntrace/migration/index.js";
import { formatMigrationComparisonReport } from "../src/markdowntrace/reporting/index.js";

const MISSING = {
  kind: "missing",
} satisfies MigrationMissingValue;

describe("migration comparison report rendering", () => {
  it("renders equivalent reports with stable inputs, status summary, and no-delta sections", () => {
    const output = formatMigrationComparisonReport(
      report([
        equivalentDimension("registry"),
        equivalentDimension("graph"),
        equivalentDimension("metadata"),
        equivalentDimension("validation"),
      ]),
    );

    expect(output).toContain("# Migration Comparison Report");
    expect(output).toContain("| Document | `fixtures/migration-test.md` |");
    expect(output).toContain("| Manual registry | `fixtures/manual.yaml` |");
    expect(output).toContain("| Generated sidecar | `fixtures/generated.yaml` |");
    expect(output).toContain("| Exit code | `0` |");
    expect(output).toContain("| Equivalent dimensions | `4` |");
    expect(output).toContain("| Intentional dimensions | `0` |");
    expect(output).toContain("| Blocking dimensions | `0` |");
    expect(output).toContain("| `registry` | `equivalent` | `0` |");
    expect(output.match(/No deltas\./g)).toHaveLength(4);
  });

  it("renders intentional and blocking deltas with status, path, values, and rationale", () => {
    const output = formatMigrationComparisonReport(
      report([
        equivalentDimension("registry"),
        dimensionResult("metadata", "intentional", [
          {
            path: "generated.humanEditable",
            expected: MISSING,
            actual: false,
            rationale:
              "Manual YAML has no generated metadata while the sidecar remains checked evidence.",
          },
        ]),
        dimensionResult("validation", "blocking", [
          {
            path: "exitCode",
            expected: 0,
            actual: 1,
            rationale:
              "Manual and generated validation entries differ; unexplained drift blocks parity approval.",
          },
        ]),
      ]),
    );

    expect(output).toContain(
      "| `intentional` | `generated.humanEditable` | `<missing>` | `false` | Manual YAML has no generated metadata while the sidecar remains checked evidence. |",
    );
    expect(output).toContain(
      "| `blocking` | `exitCode` | `0` | `1` | Manual and generated validation entries differ; unexplained drift blocks parity approval. |",
    );
  });

  it("uses deterministic dimension and delta ordering while escaping table cells", () => {
    const output = formatMigrationComparisonReport(
      report([
        equivalentDimension("validation"),
        dimensionResult("metadata", "intentional", [
          {
            path: "generated.generator.command",
            expected: "markdown-trace derive-sidecar --document old.md",
            actual: "markdown-trace derive-sidecar --document new.md",
            rationale: "Approved profile-command delta | reviewer recorded.",
          },
        ]),
        dimensionResult("registry", "blocking", [
          blockingDelta("document.title.b", "Manual B", "Generated B"),
          blockingDelta("document.title.a", "Manual A", "Generated A"),
        ]),
        equivalentDimension("graph"),
      ]),
    );

    expect(output.indexOf("### Registry")).toBeLessThan(output.indexOf("### Graph"));
    expect(output.indexOf("### Graph")).toBeLessThan(output.indexOf("### Metadata"));
    expect(output.indexOf("### Metadata")).toBeLessThan(output.indexOf("### Validation"));
    expect(output.indexOf("`document.title.a`")).toBeLessThan(
      output.indexOf("`document.title.b`"),
    );
    expect(output).toContain("Approved profile-command delta \\| reviewer recorded.");
    expect(output).toContain(
      '| `blocking` | `document.title.a` | `"Manual A"` | `"Generated A"` | Registry drift is not approved. |',
    );
  });
});

function report(dimensions: readonly MigrationDimensionResult[]): MigrationComparisonReport {
  return {
    documentPath: "fixtures/migration-test.md",
    manualRegistryPath: "fixtures/manual.yaml",
    generatedSidecarPath: "fixtures/generated.yaml",
    dimensions,
    exitCode: dimensions.some((dimension) => dimension.status === "blocking") ? 1 : 0,
  };
}

function equivalentDimension(
  dimension: MigrationComparisonDimension,
): MigrationDimensionResult {
  return {
    dimension,
    status: "equivalent",
    deltas: [],
  };
}

function dimensionResult(
  dimension: MigrationComparisonDimension,
  status: MigrationDimensionStatus,
  deltas: readonly MigrationDelta[],
): MigrationDimensionResult {
  return {
    dimension,
    status,
    deltas,
  };
}

function blockingDelta(path: string, expected: string, actual: string): MigrationDelta {
  return {
    path,
    expected,
    actual,
    rationale: "Registry drift is not approved.",
  };
}
