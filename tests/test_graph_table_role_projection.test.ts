import { describe, expect, it } from "vitest";

import {
  EXECUTION_SPEC_FIRST_SLICE_PROFILE,
  type GraphProfile,
} from "../src/markdowntrace/graph-profile/index.js";
import { extractTraceEvidence } from "../src/markdowntrace/trace-evidence/index.js";

const projectionProfile: GraphProfile = {
  ...EXECUTION_SPEC_FIRST_SLICE_PROFILE,
  tableRoles: [
    {
      selectorId: "projection.objective_to_work",
      match: {
        headingIncludes: [],
        requiredColumns: ["ID", "Objective Reference", "Work Package"],
      },
      sourceFamilies: ["OBJ"],
      sourceColumns: ["Objective Reference"],
      targetColumns: ["Work Package"],
      role: "coverage_reference",
      effects: ["create_relationships", "create_coverage_rows"],
      relationshipClass: "objective_implemented_by",
      relationshipDirection: "source-to-target",
    },
  ],
};

describe("generic graph table-role projection", () => {
  it("projects declared cross-column relationships independently of the primary definition", () => {
    const evidence = extractTraceEvidence(
      `| ID | objective reference | Work Package | Notes |
| --- | --- | --- | --- |
| WP-1 | OBJ-1 | WP-2 | OBJ-2 and WP-3 |
`,
      projectionProfile,
    );

    expect(evidence.definitions.map((definition) => definition.label)).toEqual(["WP-1"]);
    expect(evidence.candidateEdges).toEqual([
      expect.objectContaining({
        fromLabel: "OBJ-1",
        toLabel: "WP-2",
        relationshipClass: "objective_implemented_by",
        rawEvidenceAnchor: expect.objectContaining({
          columnHeader: "Work Package",
        }),
      }),
    ]);
  });

  it("does not require the relationship row to define a primary ID", () => {
    const evidence = extractTraceEvidence(
      `| ID | objective reference | Work Package |
| --- | --- | --- |
|  | OBJ-1 | WP-2 |
`,
      projectionProfile,
    );

    expect(evidence.definitions).toEqual([]);
    expect(evidence.candidateEdges).toEqual([
      expect.objectContaining({
        fromLabel: "OBJ-1",
        toLabel: "WP-2",
        relationshipClass: "objective_implemented_by",
      }),
    ]);
  });

  it("requires every declared column before projecting an edge and remains deterministic", () => {
    const markdown = `| ID | Objective Reference | Other |
| --- | --- | --- |
| WP-1 | OBJ-1 | WP-2 |
`;

    const firstEvidence = extractTraceEvidence(markdown, projectionProfile);
    const secondEvidence = extractTraceEvidence(markdown, projectionProfile);

    expect(firstEvidence.definitions.map((definition) => definition.label)).toEqual(["WP-1"]);
    expect(firstEvidence.candidateEdges).toEqual([]);
    expect(JSON.stringify(secondEvidence)).toBe(JSON.stringify(firstEvidence));
  });
});
