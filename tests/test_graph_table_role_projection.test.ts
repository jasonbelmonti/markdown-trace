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

const multiSegmentProjectionProfile: GraphProfile = {
  ...EXECUTION_SPEC_FIRST_SLICE_PROFILE,
  idFamilies: [
    { family: "EP-SRC", labelPattern: "^EP-SRC-[0-9]+$", policy: "primary_definition" },
    { family: "EP-OUT", labelPattern: "^EP-OUT-[0-9]+$", policy: "primary_definition" },
  ],
  definitionPolicies: {
    primaryColumns: ["Source ID", "Outcome ID"],
    supplementalColumns: [],
    repeatedIdPolicy: {
      "EP-SRC": "single_primary_with_references",
      "EP-OUT": "single_primary_with_references",
    },
  },
  tableRoles: [
    {
      selectorId: "projection.source_to_outcome",
      match: { headingIncludes: [], requiredColumns: ["Source ID", "Outcome IDs"] },
      sourceFamilies: ["EP-SRC"],
      sourceColumns: ["Source ID"],
      targetColumns: ["Outcome IDs"],
      role: "coverage_reference",
      effects: ["create_relationships"],
      relationshipClass: "objective_implemented_by",
      relationshipDirection: "source-to-target",
    },
  ],
  relationshipClasses: [
    {
      class: "objective_implemented_by",
      sourceFamilies: ["EP-SRC"],
      targetFamilies: ["EP-OUT"],
      direction: "source-to-target",
      acceptedEvidenceBases: ["in-memory multi-segment table"],
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

  it("resolves multi-segment labels only through declared profile families", () => {
    const evidence = extractTraceEvidence(
      `| Source ID | Outcome IDs |
| --- | --- |
| EP-SRC-1 | EP-OUT-1, EP-UNKNOWN-1 |

| Outcome ID |
| --- |
| EP-OUT-1 |

| Source ID | Outcome IDs |
| --- | --- |
| EP-UNKNOWN-2 | EP-UNKNOWN-3 |
`,
      multiSegmentProjectionProfile,
    );

    expect(evidence.definitions.map(({ label, family }) => ({ label, family }))).toEqual([
      { label: "EP-SRC-1", family: "EP-SRC" },
      { label: "EP-OUT-1", family: "EP-OUT" },
    ]);
    expect(evidence.candidateEdges).toEqual([
      expect.objectContaining({
        fromLabel: "EP-SRC-1",
        toLabel: "EP-OUT-1",
        relationshipClass: "objective_implemented_by",
      }),
    ]);
  });
});
