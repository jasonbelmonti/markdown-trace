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
    const profile = executionProfile();
    entries(profile, "requiredPaths").push(matrixPath());

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
    const profile = executionProfile();
    const path = matrixPath();
    path.steps = [{ relationshipClass: "objective_implemented_by", targetFamilies: ["WP"] }];
    entries(profile, "requiredPaths").push(path);

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

  it.each(invalidProfiles)("rejects $name with a stable frozen schema diagnostic", ({
    mutate,
    expectedMessage,
  }) => {
    const profile = executionProfile();
    mutate(profile);

    const result = validateGraphProfile(profile);

    expectProfileError(result, expectedMessage);
  });
});

type MutableRecord = Record<string, unknown>;

interface InvalidProfileCase {
  readonly name: string;
  readonly mutate: (profile: MutableRecord) => void;
  readonly expectedMessage: string;
}

const invalidProfiles: readonly InvalidProfileCase[] = [
  {
    name: "a missing root field",
    mutate: (profile) => delete profile.schemaVersion,
    expectedMessage: "schemaVersion must be",
  },
  {
    name: "an unsupported field",
    mutate: (profile) => {
      profile.unexpectedField = true;
    },
    expectedMessage: "root contains unsupported field",
  },
  {
    name: "an unsupported artifact-family token",
    mutate: (profile) => {
      profile.artifactFamily = "unsupported";
    },
    expectedMessage: "artifactFamily must be one of",
  },
  {
    name: "an invalid family regular expression",
    mutate: (profile) => {
      entries(profile, "idFamilies")[0]!.labelPattern = "[";
    },
    expectedMessage: "idFamilies[0].labelPattern must be a valid regular expression",
  },
  {
    name: "a duplicate ID family",
    mutate: (profile) => {
      entries(profile, "idFamilies").push(
        structuredClone(entries(profile, "idFamilies")[0]!),
      );
    },
    expectedMessage: "idFamilies.family must not contain duplicates",
  },
  {
    name: "an incompatible repeated-ID policy",
    mutate: (profile) => {
      mapping(mapping(profile, "definitionPolicies"), "repeatedIdPolicy").OBJ = "mention_only";
    },
    expectedMessage: "definitionPolicies.repeatedIdPolicy.OBJ conflicts",
  },
  {
    name: "an invalid required-path discriminator",
    mutate: (profile) => {
      entries(profile, "requiredPaths")[0]!.diagnosticCode = "unknown";
    },
    expectedMessage: "requiredPaths[0].diagnosticCode must be one of",
  },
  {
    name: "a mismatched diagnostic action mapping",
    mutate: (profile) => {
      entries(profile, "diagnosticRules")[0]!.repairActionKinds = ["fix_graph_profile"];
    },
    expectedMessage: "diagnosticRules[0].repairActionKinds must match",
  },
  {
    name: "a dangling relationship family",
    mutate: (profile) => {
      entries(profile, "relationshipClasses")[0]!.targetFamilies = ["UNKNOWN"];
    },
    expectedMessage: "relationshipClasses[0].targetFamilies references unknown family",
  },
  {
    name: "a dangling table-role relationship",
    mutate: (profile) => {
      entries(profile, "tableRoles")[0]!.relationshipClass = "matrix_coverage";
    },
    expectedMessage: "tableRoles[0].relationshipClass must reference",
  },
  {
    name: "a dangling path table-role reference",
    mutate: (profile) => {
      mapping(entries(profile, "requiredPaths")[0]!, "sourceSelector").excludedTableRoleIds = [
        "missing-role",
      ];
    },
    expectedMessage: "requiredPaths[0].sourceSelector.excludedTableRoleIds references",
  },
  {
    name: "a matrix target family that is not declared",
    mutate: (profile) => {
      entries(profile, "requiredPaths").push(matrixPath("OBJ", ["UNKNOWN"]));
    },
    expectedMessage:
      "requiredPaths[1].rowRequirements[0].requiredTargetFamilies references unknown family",
  },
  {
    name: "a matrix source family outside the selected path",
    mutate: (profile) => {
      entries(profile, "requiredPaths").push(matrixPath("WP"));
    },
    expectedMessage:
      "requiredPaths[1].rowRequirements[0].sourceFamilies family WP is not selected",
  },
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
  sourceFamily = "OBJ",
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
