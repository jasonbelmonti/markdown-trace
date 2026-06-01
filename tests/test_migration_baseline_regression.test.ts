import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  baselineRegressionEvidence,
  missingBaselineRegressionCommands,
  requiredBaselineRegressionCommands,
} from "./support/migration/baseline-regression/model.js";
import { formatBaselineRegressionReport } from "./support/migration/baseline-regression/report.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidencePath = path.join(
  repoRoot,
  "docs/evidence/r3-baseline-regression-suite-status.md",
);

describe("migration baseline regression evidence", () => {
  it("records R3 EVD-9 with every BEL-1240 baseline command", async () => {
    const report = formatBaselineRegressionReport(baselineRegressionEvidence);

    expect(report).toBe(await readFile(evidencePath, "utf8"));
    expect(baselineRegressionEvidence.evidenceId).toBe("R3-EVD-9");
    expect(baselineRegressionEvidence.validationCheckpoint).toBe("VAL-9");
    expect(baselineRegressionEvidence.issue).toBe("BEL-1240");
    expect(baselineRegressionEvidence.status).toBe("PASS");
    expect(
      baselineRegressionEvidence.commands.map((row) => row.command),
    ).toEqual(requiredBaselineRegressionCommands);
    expect(
      baselineRegressionEvidence.commands.every(
        (row) => row.status === "PASS" && row.observedEvidence.length > 0,
      ),
    ).toBe(true);
  });

  it("treats any omitted baseline command as an MS-3 blocker", () => {
    const commands = requiredBaselineRegressionCommands
      .filter((command) => command !== "npm run migration:check")
      .map((command) => ({ command }));

    expect(missingBaselineRegressionCommands(commands)).toEqual([
      "npm run migration:check",
    ]);
  });
});
