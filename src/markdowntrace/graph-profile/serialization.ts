import { createHash } from "node:crypto";

import type {
  GraphArtifactFamily,
  GraphMatrixCoverageRequiredPath,
  GraphProfile,
  GraphRequiredPath,
} from "./model.js";

export function serializeGraphProfile(
  profile: GraphProfile<GraphArtifactFamily>,
): string {
  return JSON.stringify(semanticGraphProfile(profile));
}

export function graphProfileHash(profile: GraphProfile<GraphArtifactFamily>): string {
  return createHash("sha256").update(serializeGraphProfile(profile)).digest("hex");
}

function semanticGraphProfile(profile: GraphProfile<GraphArtifactFamily>): unknown {
  return {
    schemaVersion: profile.schemaVersion,
    profileId: profile.profileId,
    artifactFamily: profile.artifactFamily,
    profileVersion: profile.profileVersion,
    idFamilies: profile.idFamilies.map(({ family, labelPattern, policy }) => ({
      family,
      labelPattern,
      policy,
    })),
    definitionPolicies: {
      primaryColumns: profile.definitionPolicies.primaryColumns,
      supplementalColumns: profile.definitionPolicies.supplementalColumns,
      repeatedIdPolicy: Object.fromEntries(
        Object.entries(profile.definitionPolicies.repeatedIdPolicy)
          .sort(([left], [right]) => compareStrings(left, right)),
      ),
    },
    tableRoles: profile.tableRoles.map((role) => ({
      selectorId: role.selectorId,
      match: {
        headingIncludes: role.match.headingIncludes,
        requiredColumns: role.match.requiredColumns,
      },
      sourceFamilies: role.sourceFamilies,
      sourceColumns: role.sourceColumns,
      targetColumns: role.targetColumns,
      role: role.role,
      effects: role.effects,
      relationshipClass: role.relationshipClass,
      relationshipDirection: role.relationshipDirection,
    })),
    rangePolicy: {
      syntax: profile.rangePolicy.syntax,
      sameFamilyOnly: profile.rangePolicy.sameFamilyOnly,
      requireDefinedEndpoints: profile.rangePolicy.requireDefinedEndpoints,
      endpointRoles: profile.rangePolicy.endpointRoles,
      diagnosticCode: profile.rangePolicy.diagnosticCode,
    },
    matrixSemantics: {
      authority: profile.matrixSemantics.authority,
      rowRole: profile.matrixSemantics.rowRole,
      firstColumnMaySourceRelationships:
        profile.matrixSemantics.firstColumnMaySourceRelationships,
      definitionsFromCells: profile.matrixSemantics.definitionsFromCells,
    },
    relationshipClasses: profile.relationshipClasses.map((relationship) => ({
      class: relationship.class,
      sourceFamilies: relationship.sourceFamilies,
      targetFamilies: relationship.targetFamilies,
      direction: relationship.direction,
      acceptedEvidenceBases: relationship.acceptedEvidenceBases,
    })),
    requiredPaths: profile.requiredPaths.map(semanticRequiredPath),
    diagnosticRules: profile.diagnosticRules.map((rule) => ({
      code: rule.code,
      severity: rule.severity,
      blocking: rule.blocking,
      repairActionKinds: rule.repairActionKinds,
    })),
    serialization: {
      ordering: {
        definitions: profile.serialization.ordering.definitions,
        coverageRows: profile.serialization.ordering.coverageRows,
        ranges: profile.serialization.ordering.ranges,
        relationships: profile.serialization.ordering.relationships,
        diagnostics: profile.serialization.ordering.diagnostics,
        repairActions: profile.serialization.ordering.repairActions,
      },
    },
  };
}

function semanticRequiredPath(path: GraphRequiredPath): unknown {
  return {
    pathId: path.pathId,
    sourceFamilies: path.sourceFamilies,
    sourceSelector: {
      families: path.sourceSelector.families,
      roles: path.sourceSelector.roles,
      excludedTableRoleIds: path.sourceSelector.excludedTableRoleIds,
    },
    steps: path.steps.map((step) => ({
      relationshipClass: step.relationshipClass,
      targetFamilies: step.targetFamilies,
    })),
    alternativeSteps: path.alternativeSteps.map((steps) =>
      steps.map((step) => ({
        relationshipClass: step.relationshipClass,
        targetFamilies: step.targetFamilies,
      })),
    ),
    ...(isMatrixRequiredPath(path)
      ? {
          rowRequirements: path.rowRequirements.map((requirement) => ({
            sourceFamilies: requirement.sourceFamilies,
            requiredTargetFamilies: requirement.requiredTargetFamilies,
          })),
        }
      : {}),
    severity: path.severity,
    diagnosticCode: path.diagnosticCode,
  };
}

function isMatrixRequiredPath(
  path: GraphRequiredPath,
): path is GraphMatrixCoverageRequiredPath {
  return path.diagnosticCode === "markdown-trace.graph.missing_matrix_coverage";
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
