import type {
  GraphArtifactFamily,
  GraphDiagnosticRule,
  GraphEvidenceRole,
  GraphIdFamily,
  GraphIdFamilyPolicy,
  GraphMatrixCoverageRequiredPath,
  GraphProfile,
  GraphRelationshipClass,
  GraphRelationshipDefinition,
  GraphRelationshipRequiredPath,
  GraphRepeatedIdPolicy,
  GraphRepairActionKind,
  GraphRequiredPath,
  GraphRequiredPathStep,
  GraphTableEffect,
  GraphTableRole,
} from "../model.js";
import {
  ARTIFACT_FAMILIES,
  DIAGNOSTIC_CODES,
  EVIDENCE_ROLES,
  ID_FAMILY_POLICIES,
  RELATIONSHIP_CLASSES,
  REPAIR_ACTION_KINDS,
  REPEATED_ID_POLICIES,
  TABLE_EFFECTS,
  array,
  emptyArray,
  fail,
  literal,
  nonEmptyArray,
  record,
  string,
  stringList,
  token,
  tokenList,
  unique,
} from "./primitives.js";

export function parseGraphProfile(input: unknown): GraphProfile<GraphArtifactFamily> {
  const root = record(input, "root", [
    "schemaVersion", "profileId", "artifactFamily", "profileVersion", "idFamilies",
    "definitionPolicies", "tableRoles", "rangePolicy", "matrixSemantics",
    "relationshipClasses", "requiredPaths", "diagnosticRules", "serialization",
  ]);
  const idFamilies = nonEmptyArray(root.idFamilies, "idFamilies", parseIdFamily);
  unique(idFamilies.map(({ family }) => family), "idFamilies.family");
  return {
    schemaVersion: literal(root.schemaVersion, "markdown-trace.graph-profile.v1", "schemaVersion"),
    profileId: string(root.profileId, "profileId"),
    artifactFamily: token(root.artifactFamily, ARTIFACT_FAMILIES, "artifactFamily"),
    profileVersion: string(root.profileVersion, "profileVersion"),
    idFamilies,
    definitionPolicies: parseDefinitionPolicies(root.definitionPolicies, idFamilies),
    tableRoles: nonEmptyArray(root.tableRoles, "tableRoles", parseTableRole),
    rangePolicy: parseRangePolicy(root.rangePolicy),
    matrixSemantics: parseMatrixSemantics(root.matrixSemantics),
    relationshipClasses: nonEmptyArray(root.relationshipClasses, "relationshipClasses", parseRelationship),
    requiredPaths: nonEmptyArray(root.requiredPaths, "requiredPaths", parseRequiredPath),
    diagnosticRules: nonEmptyArray(root.diagnosticRules, "diagnosticRules", parseDiagnosticRule),
    serialization: parseSerialization(root.serialization),
  };
}

function parseIdFamily(value: unknown, path: string): GraphIdFamily {
  const item = record(value, path, ["family", "labelPattern", "policy"]);
  const family = string(item.family, `${path}.family`);
  if (!/^[A-Z][A-Z0-9]*$/.test(family)) {
    fail(`${path}.family`, "must be an uppercase identifier prefix");
  }
  const labelPattern = string(item.labelPattern, `${path}.labelPattern`);
  let pattern: RegExp;
  try {
    pattern = new RegExp(labelPattern);
  } catch {
    fail(`${path}.labelPattern`, "must be a valid regular expression");
  }
  if (!pattern.test(`${family}-1`)) {
    fail(`${path}.labelPattern`, `must match the declared family ${family}`);
  }
  return {
    family,
    labelPattern,
    policy: token(item.policy, ID_FAMILY_POLICIES, `${path}.policy`) as GraphIdFamilyPolicy,
  };
}

function parseDefinitionPolicies(
  value: unknown,
  idFamilies: readonly GraphIdFamily[],
): GraphProfile<GraphArtifactFamily>["definitionPolicies"] {
  const item = record(value, "definitionPolicies", [
    "primaryColumns", "supplementalColumns", "repeatedIdPolicy",
  ]);
  const policies = record(item.repeatedIdPolicy, "definitionPolicies.repeatedIdPolicy");
  const familyNames = idFamilies.map(({ family }) => family).sort();
  const policyNames = Object.keys(policies).sort();
  if (familyNames.join("\u0000") !== policyNames.join("\u0000")) {
    fail("definitionPolicies.repeatedIdPolicy", "must contain exactly one entry per ID family");
  }
  return {
    primaryColumns: stringList(item.primaryColumns, "definitionPolicies.primaryColumns"),
    supplementalColumns: stringList(item.supplementalColumns, "definitionPolicies.supplementalColumns", true),
    repeatedIdPolicy: Object.fromEntries(policyNames.map((family) => [
      family,
      token(policies[family], REPEATED_ID_POLICIES, `definitionPolicies.repeatedIdPolicy.${family}`),
    ])) as Readonly<Record<string, GraphRepeatedIdPolicy>>,
  };
}

function parseTableRole(value: unknown, path: string): GraphTableRole {
  const item = record(value, path, [
    "selectorId", "match", "sourceFamilies", "sourceColumns", "targetColumns", "role",
    "effects", "relationshipClass", "relationshipDirection",
  ]);
  const match = record(item.match, `${path}.match`, ["headingIncludes", "requiredColumns"]);
  return {
    selectorId: string(item.selectorId, `${path}.selectorId`),
    match: {
      headingIncludes: stringList(match.headingIncludes, `${path}.match.headingIncludes`, true),
      requiredColumns: stringList(match.requiredColumns, `${path}.match.requiredColumns`),
    },
    sourceFamilies: stringList(item.sourceFamilies, `${path}.sourceFamilies`),
    sourceColumns: stringList(item.sourceColumns, `${path}.sourceColumns`),
    targetColumns: stringList(item.targetColumns, `${path}.targetColumns`),
    role: token(item.role, EVIDENCE_ROLES, `${path}.role`) as GraphEvidenceRole,
    effects: tokenList(item.effects, TABLE_EFFECTS, `${path}.effects`) as readonly GraphTableEffect[],
    relationshipClass: token(item.relationshipClass, RELATIONSHIP_CLASSES, `${path}.relationshipClass`) as GraphRelationshipClass,
    relationshipDirection: token(
      item.relationshipDirection,
      ["source-to-target", "target-to-source"] as const,
      `${path}.relationshipDirection`,
    ),
  };
}

function parseRangePolicy(value: unknown): GraphProfile<GraphArtifactFamily>["rangePolicy"] {
  const item = record(value, "rangePolicy", [
    "syntax", "sameFamilyOnly", "requireDefinedEndpoints", "endpointRoles", "diagnosticCode",
  ]);
  return {
    syntax: literal(item.syntax, "<FAMILY>-<n> through <FAMILY>-<m>", "rangePolicy.syntax"),
    sameFamilyOnly: literal(item.sameFamilyOnly, true, "rangePolicy.sameFamilyOnly"),
    requireDefinedEndpoints: literal(item.requireDefinedEndpoints, true, "rangePolicy.requireDefinedEndpoints"),
    endpointRoles: tokenList(
      item.endpointRoles,
      ["primary_definition", "supplemental_definition"] as const,
      "rangePolicy.endpointRoles",
    ),
    diagnosticCode: literal(
      item.diagnosticCode,
      "markdown-trace.graph.invalid_range_endpoint",
      "rangePolicy.diagnosticCode",
    ),
  };
}

function parseMatrixSemantics(value: unknown): GraphProfile<GraphArtifactFamily>["matrixSemantics"] {
  const item = record(value, "matrixSemantics", [
    "authority", "rowRole", "firstColumnMaySourceRelationships", "definitionsFromCells",
  ]);
  return {
    authority: literal(item.authority, "coverage-only", "matrixSemantics.authority"),
    rowRole: literal(item.rowRole, "matrix_coverage", "matrixSemantics.rowRole"),
    firstColumnMaySourceRelationships: literal(
      item.firstColumnMaySourceRelationships, true, "matrixSemantics.firstColumnMaySourceRelationships",
    ),
    definitionsFromCells: literal(item.definitionsFromCells, false, "matrixSemantics.definitionsFromCells"),
  };
}

function parseRelationship(value: unknown, path: string): GraphRelationshipDefinition {
  const item = record(value, path, [
    "class", "sourceFamilies", "targetFamilies", "direction", "acceptedEvidenceBases",
  ]);
  return {
    class: token(item.class, RELATIONSHIP_CLASSES, `${path}.class`) as GraphRelationshipClass,
    sourceFamilies: stringList(item.sourceFamilies, `${path}.sourceFamilies`),
    targetFamilies: stringList(item.targetFamilies, `${path}.targetFamilies`),
    direction: literal(item.direction, "source-to-target", `${path}.direction`),
    acceptedEvidenceBases: stringList(item.acceptedEvidenceBases, `${path}.acceptedEvidenceBases`),
  };
}

function parseRequiredPath(value: unknown, path: string): GraphRequiredPath {
  const input = record(value, path);
  const code = token(
    input.diagnosticCode,
    ["markdown-trace.graph.missing_required_path", "markdown-trace.graph.missing_matrix_coverage"] as const,
    `${path}.diagnosticCode`,
  );
  return code === "markdown-trace.graph.missing_matrix_coverage"
    ? parseMatrixCoverageRequiredPath(value, path)
    : parseRelationshipRequiredPath(value, path);
}

function parseRelationshipRequiredPath(value: unknown, path: string): GraphRelationshipRequiredPath {
  const item = record(value, path, [
    "pathId", "sourceFamilies", "sourceSelector", "steps", "alternativeSteps", "severity", "diagnosticCode",
  ]);
  return {
    pathId: string(item.pathId, `${path}.pathId`),
    sourceFamilies: stringList(item.sourceFamilies, `${path}.sourceFamilies`),
    sourceSelector: parseRequiredPathSourceSelector(item.sourceSelector, path),
    steps: nonEmptyArray(item.steps, `${path}.steps`, parseRequiredPathStep),
    alternativeSteps: array(item.alternativeSteps, `${path}.alternativeSteps`, (steps, stepPath) =>
      nonEmptyArray(steps, stepPath, parseRequiredPathStep)),
    severity: literal(item.severity, "error", `${path}.severity`),
    diagnosticCode: literal(item.diagnosticCode, "markdown-trace.graph.missing_required_path", `${path}.diagnosticCode`),
  };
}

function parseMatrixCoverageRequiredPath(
  value: unknown,
  path: string,
): GraphMatrixCoverageRequiredPath {
  const item = record(value, path, [
    "pathId", "sourceFamilies", "sourceSelector", "steps", "alternativeSteps", "rowRequirements",
    "severity", "diagnosticCode",
  ]);
  return {
    pathId: string(item.pathId, `${path}.pathId`),
    sourceFamilies: stringList(item.sourceFamilies, `${path}.sourceFamilies`),
    sourceSelector: parseRequiredPathSourceSelector(item.sourceSelector, path),
    steps: emptyArray(item.steps, `${path}.steps`),
    alternativeSteps: emptyArray(item.alternativeSteps, `${path}.alternativeSteps`),
    rowRequirements: nonEmptyArray(item.rowRequirements, `${path}.rowRequirements`, parseMatrixCoverageRequirement),
    severity: literal(item.severity, "error", `${path}.severity`),
    diagnosticCode: literal(
      item.diagnosticCode, "markdown-trace.graph.missing_matrix_coverage", `${path}.diagnosticCode`,
    ),
  };
}

function parseRequiredPathSourceSelector(
  value: unknown,
  path: string,
): GraphRequiredPath["sourceSelector"] {
  const item = record(value, `${path}.sourceSelector`, ["families", "roles", "excludedTableRoleIds"]);
  return {
    families: stringList(item.families, `${path}.sourceSelector.families`),
    roles: tokenList(item.roles, EVIDENCE_ROLES, `${path}.sourceSelector.roles`) as readonly GraphEvidenceRole[],
    excludedTableRoleIds: stringList(item.excludedTableRoleIds, `${path}.sourceSelector.excludedTableRoleIds`, true),
  };
}

function parseMatrixCoverageRequirement(
  value: unknown,
  path: string,
): GraphMatrixCoverageRequiredPath["rowRequirements"][number] {
  const item = record(value, path, ["sourceFamilies", "requiredTargetFamilies"]);
  return {
    sourceFamilies: stringList(item.sourceFamilies, `${path}.sourceFamilies`),
    requiredTargetFamilies: stringList(item.requiredTargetFamilies, `${path}.requiredTargetFamilies`),
  };
}

function parseRequiredPathStep(value: unknown, path: string): GraphRequiredPathStep {
  const item = record(value, path, ["relationshipClass", "targetFamilies"]);
  return {
    relationshipClass: token(item.relationshipClass, RELATIONSHIP_CLASSES, `${path}.relationshipClass`) as GraphRelationshipClass,
    targetFamilies: stringList(item.targetFamilies, `${path}.targetFamilies`),
  };
}

function parseDiagnosticRule(value: unknown, path: string): GraphDiagnosticRule {
  const item = record(value, path, ["code", "severity", "blocking", "repairActionKinds"]);
  return {
    code: token(item.code, DIAGNOSTIC_CODES, `${path}.code`),
    severity: literal(item.severity, "error", `${path}.severity`),
    blocking: literal(item.blocking, true, `${path}.blocking`),
    repairActionKinds: tokenList(item.repairActionKinds, REPAIR_ACTION_KINDS, `${path}.repairActionKinds`) as readonly GraphRepairActionKind[],
  };
}

function parseSerialization(value: unknown): GraphProfile<GraphArtifactFamily>["serialization"] {
  const item = record(value, "serialization", ["ordering"]);
  const ordering = record(item.ordering, "serialization.ordering", [
    "definitions", "coverageRows", "ranges", "relationships", "diagnostics", "repairActions",
  ]);
  return {
    ordering: {
      definitions: stringList(ordering.definitions, "serialization.ordering.definitions"),
      coverageRows: stringList(ordering.coverageRows, "serialization.ordering.coverageRows"),
      ranges: stringList(ordering.ranges, "serialization.ordering.ranges"),
      relationships: stringList(ordering.relationships, "serialization.ordering.relationships"),
      diagnostics: stringList(ordering.diagnostics, "serialization.ordering.diagnostics"),
      repairActions: stringList(ordering.repairActions, "serialization.ordering.repairActions"),
    },
  };
}
