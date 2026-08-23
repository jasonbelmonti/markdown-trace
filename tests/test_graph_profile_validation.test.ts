import { describe, expect, it } from "vitest";

import {
  EXECUTION_SPEC_FIRST_SLICE_PROFILE,
  validateGraphProfile,
} from "../src/markdowntrace/graph-profile/index.js";

describe("graph profile structural validation", () => {
  it("accepts and deeply freezes the relationship-path profile", () => {
    const result = validateGraphProfile(EXECUTION_SPEC_FIRST_SLICE_PROFILE);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.profile)).toBe(true);
    expect(Object.isFrozen(result.profile.requiredPaths)).toBe(true);
    expect(Object.isFrozen(result.profile.requiredPaths[0]?.steps)).toBe(true);
  });

  it("accepts a generic matrix-row requirement alongside relationship paths", () => {
    const profile = structuredClone(EXECUTION_SPEC_FIRST_SLICE_PROFILE) as unknown as {
      requiredPaths: unknown[];
    };
    profile.requiredPaths.push({
      pathId: "exec.matrix_row_minimum",
      sourceFamilies: ["OBJ"],
      sourceSelector: {
        families: ["OBJ"],
        roles: ["matrix_coverage"],
        excludedTableRoleIds: [],
      },
      steps: [],
      alternativeSteps: [],
      rowRequirements: [
        {
          sourceFamilies: ["OBJ"],
          requiredTargetFamilies: ["WP", "VAL", "EVD"],
        },
      ],
      severity: "error",
      diagnosticCode: "markdown-trace.graph.missing_matrix_coverage",
    });

    const result = validateGraphProfile(profile);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const matrixPath = result.profile.requiredPaths[1];
      expect(matrixPath?.diagnosticCode).toBe("markdown-trace.graph.missing_matrix_coverage");
      if (matrixPath?.diagnosticCode === "markdown-trace.graph.missing_matrix_coverage") {
        expect(Object.isFrozen(matrixPath)).toBe(true);
        expect(Object.isFrozen(matrixPath.rowRequirements)).toBe(true);
        expect(Object.isFrozen(matrixPath.rowRequirements[0])).toBe(true);
      }
    }
  });

  it("returns a frozen schema diagnostic for an invalid matrix path", () => {
    const profile = structuredClone(EXECUTION_SPEC_FIRST_SLICE_PROFILE) as unknown as {
      requiredPaths: unknown[];
    };
    profile.requiredPaths.push({
      pathId: "exec.matrix_row_minimum",
      sourceFamilies: ["OBJ"],
      sourceSelector: {
        families: ["OBJ"],
        roles: ["matrix_coverage"],
        excludedTableRoleIds: [],
      },
      steps: [{ relationshipClass: "objective_implemented_by", targetFamilies: ["WP"] }],
      alternativeSteps: [],
      rowRequirements: [
        { sourceFamilies: ["OBJ"], requiredTargetFamilies: ["WP", "VAL", "EVD"] },
      ],
      severity: "error",
      diagnosticCode: "markdown-trace.graph.missing_matrix_coverage",
    });

    const result = validateGraphProfile(profile);

    expect(result.ok).toBe(false);
    expect(Object.isFrozen(result)).toBe(true);
    if (!result.ok) {
      expect(Object.isFrozen(result.diagnostics)).toBe(true);
      expect(Object.isFrozen(result.diagnostics[0])).toBe(true);
      expect(result.diagnostics[0]?.message).toContain("requiredPaths[1].steps must be an empty list");
    }
  });

  it("accepts an in-memory design profile without fixture-family coupling", () => {
    const result = validateGraphProfile(designProfile());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.profile.artifactFamily).toBe("design-spec");
      expect(result.profile.idFamilies.map(({ family }) => family)).toEqual([
        "REQ", "FUNC", "TECH", "ACC", "VAL",
      ]);
      expect(Object.isFrozen(result.profile.relationshipClasses)).toBe(true);
    }
  });

  it.each(invalidProfiles)("rejects %s with a stable frozen schema diagnostic", (
    _name,
    mutate,
    expectedMessage,
  ) => {
    const profile = executionProfile();
    mutate(profile);

    const result = validateGraphProfile(profile);

    expectProfileError(result, expectedMessage);
  });
});

type MutableRecord = Record<string, unknown>;

const invalidProfiles: readonly [
  string,
  (profile: MutableRecord) => void,
  string,
][] = [
  ["a missing root field", (profile) => delete profile.schemaVersion, "schemaVersion must be"],
  ["an unsupported field", (profile) => { profile.unexpectedField = true; }, "root contains unsupported field"],
  ["an unsupported artifact-family token", (profile) => { profile.artifactFamily = "unsupported"; }, "artifactFamily must be one of"],
  ["an invalid family regular expression", (profile) => { entries(profile, "idFamilies")[0]!.labelPattern = "["; }, "idFamilies[0].labelPattern must be a valid regular expression"],
  ["a duplicate ID family", (profile) => entries(profile, "idFamilies").push(structuredClone(entries(profile, "idFamilies")[0]!)), "idFamilies.family must not contain duplicates"],
  ["an incompatible repeated-ID policy", (profile) => { mapping(mapping(profile, "definitionPolicies"), "repeatedIdPolicy").OBJ = "mention_only"; }, "definitionPolicies.repeatedIdPolicy.OBJ conflicts"],
  ["an invalid required-path discriminator", (profile) => { entries(profile, "requiredPaths")[0]!.diagnosticCode = "unknown"; }, "requiredPaths[0].diagnosticCode must be one of"],
  ["a mismatched diagnostic action mapping", (profile) => { entries(profile, "diagnosticRules")[0]!.repairActionKinds = ["fix_graph_profile"]; }, "diagnosticRules[0].repairActionKinds must match"],
  ["a dangling relationship family", (profile) => { entries(profile, "relationshipClasses")[0]!.targetFamilies = ["UNKNOWN"]; }, "relationshipClasses[0].targetFamilies references unknown family"],
  ["a dangling table-role relationship", (profile) => { entries(profile, "tableRoles")[0]!.relationshipClass = "matrix_coverage"; }, "tableRoles[0].relationshipClass must reference"],
  ["a dangling path table-role reference", (profile) => { mapping(entries(profile, "requiredPaths")[0]!, "sourceSelector").excludedTableRoleIds = ["missing-role"]; }, "requiredPaths[0].sourceSelector.excludedTableRoleIds references"],
  ["a matrix target family that is not declared", (profile) => { entries(profile, "requiredPaths").push(matrixPath("OBJ", ["UNKNOWN"])); }, "requiredPaths[1].rowRequirements[0].requiredTargetFamilies references unknown family"],
  ["a matrix source family outside the selected path", (profile) => { entries(profile, "requiredPaths").push(matrixPath("WP")); }, "requiredPaths[1].rowRequirements[0].sourceFamilies family WP is not selected"],
];

function executionProfile(): MutableRecord {
  return structuredClone(EXECUTION_SPEC_FIRST_SLICE_PROFILE) as unknown as MutableRecord;
}

function designProfile(): MutableRecord {
  const profile = executionProfile();
  profile.profileId = "in-memory.design-profile";
  profile.artifactFamily = "design-spec";
  profile.idFamilies = ["REQ", "FUNC", "TECH", "ACC", "VAL"].map((family) => ({
    family,
    labelPattern: `^${family}-[0-9]+$`,
    policy: "primary_definition",
  }));
  profile.definitionPolicies = {
    primaryColumns: ["ID"],
    supplementalColumns: [],
    repeatedIdPolicy: Object.fromEntries(
      ["REQ", "FUNC", "TECH", "ACC", "VAL"].map((family) => [
        family,
        "single_primary_with_references",
      ]),
    ),
  };
  profile.relationshipClasses = [
    relationship("requirement_realized_by_behavior", ["REQ"], ["FUNC"]),
    relationship("behavior_allocated_to_mechanism", ["FUNC"], ["TECH"]),
    relationship("requirement_validated_by", ["REQ"], ["VAL"]),
  ];
  profile.tableRoles = [
    tableRole("design.requirements", "REQ", "requirement_realized_by_behavior"),
    tableRole("design.behaviors", "FUNC", "behavior_allocated_to_mechanism"),
    tableRole("design.validation", "REQ", "requirement_validated_by"),
  ];
  profile.requiredPaths = [
    {
      pathId: "design.requirement_to_validation",
      sourceFamilies: ["REQ"],
      sourceSelector: { families: ["REQ"], roles: ["primary_definition"], excludedTableRoleIds: [] },
      steps: [
        { relationshipClass: "requirement_realized_by_behavior", targetFamilies: ["FUNC"] },
        { relationshipClass: "behavior_allocated_to_mechanism", targetFamilies: ["TECH"] },
      ],
      alternativeSteps: [],
      severity: "error",
      diagnosticCode: "markdown-trace.graph.missing_required_path",
    },
    {
      ...matrixPath("REQ"),
      pathId: "design.matrix_row_minimum",
      sourceFamilies: ["REQ"],
      sourceSelector: { families: ["REQ"], roles: ["matrix_coverage"], excludedTableRoleIds: [] },
      rowRequirements: [
        { sourceFamilies: ["REQ"], requiredTargetFamilies: ["FUNC", "TECH", "VAL"] },
      ],
    },
  ];
  return profile;
}

function matrixPath(
  sourceFamily: string,
  requiredTargetFamilies = ["WP", "VAL", "EVD"],
): MutableRecord {
  return {
    pathId: "exec.matrix_row_minimum",
    sourceFamilies: ["OBJ"],
    sourceSelector: { families: ["OBJ"], roles: ["matrix_coverage"], excludedTableRoleIds: [] },
    steps: [],
    alternativeSteps: [],
    rowRequirements: [{ sourceFamilies: [sourceFamily], requiredTargetFamilies }],
    severity: "error",
    diagnosticCode: "markdown-trace.graph.missing_matrix_coverage",
  };
}

function relationship(kind: string, sourceFamilies: string[], targetFamilies: string[]): MutableRecord {
  return { class: kind, sourceFamilies, targetFamilies, direction: "source-to-target", acceptedEvidenceBases: ["in-memory"] };
}

function tableRole(selectorId: string, sourceFamily: string, relationshipClass: string): MutableRecord {
  return {
    selectorId,
    match: { headingIncludes: [], requiredColumns: ["ID", "Target"] },
    sourceFamilies: [sourceFamily],
    sourceColumns: ["ID"],
    targetColumns: ["Target"],
    role: "coverage_reference",
    effects: ["create_relationships"],
    relationshipClass,
    relationshipDirection: "source-to-target",
  };
}

function entries(profile: MutableRecord, key: string): MutableRecord[] {
  return profile[key] as MutableRecord[];
}

function mapping(profile: MutableRecord, key: string): MutableRecord {
  return profile[key] as MutableRecord;
}

function expectProfileError(
  result: ReturnType<typeof validateGraphProfile>,
  expectedMessage: string,
): void {
  expect(result.ok).toBe(false);
  expect(Object.isFrozen(result)).toBe(true);
  if (!result.ok) {
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
    expect(Object.isFrozen(result.diagnostics[0])).toBe(true);
    expect(Object.isFrozen(result.diagnostics[0]?.affectedIds)).toBe(true);
    expect(result.diagnostics[0]?.code).toBe("markdown-trace.graph.profile_error");
    expect(result.diagnostics[0]?.stage).toBe("schema");
    expect(result.diagnostics[0]?.message).toContain(expectedMessage);
  }
}
