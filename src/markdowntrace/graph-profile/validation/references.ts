import type {
  GraphArtifactFamily,
  GraphDiagnosticCode,
  GraphMatrixCoverageRequiredPath,
  GraphProfile,
  GraphRelationshipClass,
  GraphRelationshipDefinition,
  GraphRepairActionKind,
  GraphRequiredPathStep,
} from "../model.js";
import {
  DIAGNOSTIC_CODES,
  fail,
  requireFamilies,
  setKey,
  unique,
} from "./primitives.js";

const DIAGNOSTIC_REPAIR_ACTIONS: Readonly<
  Record<GraphDiagnosticCode, readonly GraphRepairActionKind[]>
> = {
  "markdown-trace.graph.unresolved_reference": ["define_missing_id", "remove_or_replace_reference"],
  "markdown-trace.graph.duplicate_primary_definition": ["deduplicate_primary_definition"],
  "markdown-trace.graph.invalid_range_endpoint": ["define_range_endpoint", "narrow_range"],
  "markdown-trace.graph.missing_matrix_coverage": ["add_matrix_coverage"],
  "markdown-trace.graph.missing_required_path": ["add_required_relationship_evidence"],
  "markdown-trace.graph.profile_error": ["fix_graph_profile"],
};

export function validateReferences(profile: GraphProfile<GraphArtifactFamily>): void {
  const families = new Set(profile.idFamilies.map(({ family }) => family));
  const relationships = new Map<GraphRelationshipClass, GraphRelationshipDefinition>(
    profile.relationshipClasses.map((relationship) => [relationship.class, relationship]),
  );
  const tableRoleIds = new Set(profile.tableRoles.map(({ selectorId }) => selectorId));
  const diagnosticCodes = new Set(profile.diagnosticRules.map(({ code }) => code));

  for (const [index, family] of profile.idFamilies.entries()) {
    const policy = profile.definitionPolicies.repeatedIdPolicy[family.family];
    const compatible =
      (family.policy === "primary_definition" &&
        (policy === "single_primary_with_references" || policy === "primary_with_supplemental_definition")) ||
      (family.policy === "supplemental_definition" && policy === "primary_with_supplemental_definition") ||
      (family.policy === "terminal_coverage_node" && policy === "terminal_coverage_node") ||
      (family.policy === "mention_only" && policy === "mention_only") ||
      (family.policy === "coverage_or_mention_only" &&
        (policy === "coverage_or_reference_only" || policy === "non_authoritative_table_candidate"));
    if (!compatible) {
      fail(`definitionPolicies.repeatedIdPolicy.${family.family}`, `conflicts with idFamilies[${index}].policy`);
    }
  }

  unique([...relationships.keys()], "relationshipClasses.class");
  unique([...tableRoleIds], "tableRoles.selectorId");
  unique(profile.requiredPaths.map(({ pathId }) => pathId), "requiredPaths.pathId");
  unique([...diagnosticCodes], "diagnosticRules.code");
  for (const code of DIAGNOSTIC_CODES) {
    if (!diagnosticCodes.has(code)) {
      fail("diagnosticRules", `must declare ${code}`);
    }
  }
  for (const [index, rule] of profile.diagnosticRules.entries()) {
    if (setKey(rule.repairActionKinds) !== setKey(DIAGNOSTIC_REPAIR_ACTIONS[rule.code])) {
      fail(`diagnosticRules[${index}].repairActionKinds`, `must match the repair actions for ${rule.code}`);
    }
  }

  for (const [index, relationship] of profile.relationshipClasses.entries()) {
    requireFamilies(relationship.sourceFamilies, families, `relationshipClasses[${index}].sourceFamilies`);
    requireFamilies(relationship.targetFamilies, families, `relationshipClasses[${index}].targetFamilies`);
  }
  for (const [index, role] of profile.tableRoles.entries()) {
    requireFamilies(role.sourceFamilies, families, `tableRoles[${index}].sourceFamilies`);
    const relationship = relationships.get(role.relationshipClass);
    if (relationship === undefined) {
      fail(`tableRoles[${index}].relationshipClass`, "must reference a declared relationship class");
    }
    if (!role.effects.includes("create_relationships")) {
      fail(`tableRoles[${index}].effects`, "must include create_relationships when relationshipClass is declared");
    }
    const expectedSources = role.relationshipDirection === "source-to-target"
      ? relationship.sourceFamilies
      : relationship.targetFamilies;
    for (const family of role.sourceFamilies) {
      if (!expectedSources.includes(family)) {
        fail(`tableRoles[${index}].sourceFamilies`, `family ${family} conflicts with ${role.relationshipDirection} normalization`);
      }
    }
  }
  for (const [index, path] of profile.requiredPaths.entries()) {
    requireFamilies(path.sourceFamilies, families, `requiredPaths[${index}].sourceFamilies`);
    requireFamilies(path.sourceSelector.families, families, `requiredPaths[${index}].sourceSelector.families`);
    if (setKey(path.sourceFamilies) !== setKey(path.sourceSelector.families)) {
      fail(`requiredPaths[${index}].sourceSelector.families`, "must match sourceFamilies");
    }
    for (const selectorId of path.sourceSelector.excludedTableRoleIds) {
      if (!tableRoleIds.has(selectorId)) {
        fail(`requiredPaths[${index}].sourceSelector.excludedTableRoleIds`, "references unknown table role");
      }
    }
    if (path.diagnosticCode === "markdown-trace.graph.missing_matrix_coverage") {
      validateMatrixCoverageRequirements(path, index, families);
    } else {
      validatePathSteps(path.steps, index, "steps", relationships, families);
      path.alternativeSteps.forEach((steps, alternativeIndex) =>
        validatePathSteps(steps, index, `alternativeSteps[${alternativeIndex}]`, relationships, families),
      );
    }
    if (!diagnosticCodes.has(path.diagnosticCode)) {
      fail(`requiredPaths[${index}].diagnosticCode`, "must reference a declared diagnostic rule");
    }
  }
}

function validateMatrixCoverageRequirements(
  path: GraphMatrixCoverageRequiredPath,
  pathIndex: number,
  families: ReadonlySet<string>,
): void {
  const requirementKeys = new Set<string>();
  for (const [index, requirement] of path.rowRequirements.entries()) {
    const requirementPath = `requiredPaths[${pathIndex}].rowRequirements[${index}]`;
    requireFamilies(requirement.sourceFamilies, families, `${requirementPath}.sourceFamilies`);
    requireFamilies(requirement.requiredTargetFamilies, families, `${requirementPath}.requiredTargetFamilies`);
    for (const family of requirement.sourceFamilies) {
      if (!path.sourceFamilies.includes(family)) {
        fail(`${requirementPath}.sourceFamilies`, `family ${family} is not selected by the required path`);
      }
    }
    const key = `${setKey(requirement.sourceFamilies)}\u0001${setKey(requirement.requiredTargetFamilies)}`;
    if (requirementKeys.has(key)) {
      fail(requirementPath, "must not duplicate another matrix row requirement");
    }
    requirementKeys.add(key);
  }
}

function validatePathSteps(
  steps: readonly GraphRequiredPathStep[],
  pathIndex: number,
  path: string,
  relationships: ReadonlyMap<GraphRelationshipClass, GraphRelationshipDefinition>,
  families: ReadonlySet<string>,
): void {
  for (const [index, step] of steps.entries()) {
    const relationship = relationships.get(step.relationshipClass);
    if (relationship === undefined) {
      fail(`requiredPaths[${pathIndex}].${path}[${index}].relationshipClass`, "must reference a declared relationship class");
    }
    requireFamilies(step.targetFamilies, families, `requiredPaths[${pathIndex}].${path}[${index}].targetFamilies`);
    for (const family of step.targetFamilies) {
      if (!relationship.targetFamilies.includes(family)) {
        fail(
          `requiredPaths[${pathIndex}].${path}[${index}].targetFamilies`,
          `family ${family} is not a target of ${step.relationshipClass}`,
        );
      }
    }
  }
}
