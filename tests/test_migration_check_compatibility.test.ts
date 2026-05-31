import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  collectMigrationCheckCompatibilityEvidence,
  evidencePath,
} from "./support/migration-check-compatibility/collect.js";
import { formatMigrationCheckCompatibilityReport } from "./support/migration-check-compatibility/report.js";

describe("migration check compatibility evidence", () => {
  it("records R3 EVD-4 and R3 EVD-5 for YAML compatibility and sidecar byte stability", async () => {
    const evidence = await collectMigrationCheckCompatibilityEvidence();
    const report = formatMigrationCheckCompatibilityReport(evidence);

    expect(report).toBe(await readFile(evidencePath, "utf8"));
    expect(evidence.yamlCompatibility.status).toBe("PASS");
    expect(evidence.migrationCheckCompatibility.status).toBe("PASS");
    expect(evidence.sidecarByteStability.status).toBe("PASS");
    expect(evidence.sidecarByteStability.bytesStable).toBe(true);
  });
});
