import { createHash } from "node:crypto";

import type { SourceRange } from "@jasonbelmonti/markdown-engine";

import type {
  GraphProfile,
  GraphRelationshipClass,
  GraphRequiredPath,
} from "../graph-profile/index.js";
import type { TraceEvidenceResult } from "../trace-evidence/index.js";
import type {
  GraphDiagnostic,
  GraphValidationNode,
  GraphValidationRelationship,
  GraphValidationResult,
  RequiredPathResult,
} from "./model.js";

interface EvaluatedPath {
  readonly result: RequiredPathResult;
  readonly diagnostic?: GraphDiagnostic;
}

interface EvaluatedStepSequence {
  readonly nodeIds: readonly string[];
  readonly relationshipClasses: readonly GraphRelationshipClass[];
  readonly missingRelationshipClass?: GraphRelationshipClass;
}

export function validateGraphEvidence(
  evidence: TraceEvidenceResult,
  profile: GraphProfile,
): GraphValidationResult {
  const nodes = projectNodes(evidence);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const relationships = projectRelationships(evidence, nodeById);
  const evaluatedPaths = profile.requiredPaths.flatMap((requiredPath) =>
    nodes
      .filter(
        (node) =>
          node.role === "primary_definition" &&
          requiredPath.sourceFamilies.includes(node.family),
      )
      .map((sourceNode) =>
        evaluateRequiredPath(requiredPath, sourceNode, relationships, nodeById),
      ),
  );
  const requiredPathResults = evaluatedPaths.map((evaluation) => evaluation.result);
  const diagnostics = evaluatedPaths
    .flatMap((evaluation) => (evaluation.diagnostic === undefined ? [] : [evaluation.diagnostic]))
    .sort(compareDiagnostic);
  const satisfiedRequiredPaths = requiredPathResults.filter(
    (pathResult) => pathResult.status === "satisfied",
  ).length;

  return {
    schemaVersion: "markdown-trace.graph-validation-result.v1",
    status: diagnostics.length === 0 ? "pass" : "fail",
    source: evidence.source,
    profile: evidence.profile,
    run: evidence.run,
    nodes,
    relationships,
    requiredPathResults,
    matrixCoverageResults: [],
    diagnostics,
    summary: {
      nodes: nodes.length,
      relationships: relationships.length,
      requiredPaths: requiredPathResults.length,
      satisfiedRequiredPaths,
      diagnostics: diagnostics.length,
    },
    hashes: {
      sourceSha256: evidence.hashes.sourceSha256,
      profileSha256: evidence.hashes.profileSha256,
      traceEvidenceSha256: sha256(JSON.stringify(evidence)),
    },
  };
}

function projectNodes(evidence: TraceEvidenceResult): readonly GraphValidationNode[] {
  return [...evidence.definitions, ...evidence.mentions]
    .filter(
      (occurrence) =>
        occurrence.role === "primary_definition" || occurrence.role === "terminal_coverage_node",
    )
    .map((occurrence) => ({
      id: occurrence.label,
      family: occurrence.family,
      authority: "trace-evidence" as const,
      role: occurrence.role as GraphValidationNode["role"],
      sourceRange: occurrence.sourceRange,
    }))
    .sort(compareNode);
}

function projectRelationships(
  evidence: TraceEvidenceResult,
  nodeById: ReadonlyMap<string, GraphValidationNode>,
): readonly GraphValidationRelationship[] {
  return evidence.candidateEdges
    .filter((edge) => nodeById.has(edge.fromLabel) && nodeById.has(edge.toLabel))
    .map((edge) => ({
      class: edge.relationshipClass,
      sourceId: edge.fromLabel,
      targetId: edge.toLabel,
      sourceRanges: uniqueRanges([
        nodeById.get(edge.fromLabel)?.sourceRange,
        edge.rawEvidenceAnchor.sourceRange,
      ]),
      rawEvidenceAnchors: [edge.rawEvidenceAnchor],
    }))
    .sort(compareRelationship);
}

function evaluateRequiredPath(
  requiredPath: GraphRequiredPath,
  sourceNode: GraphValidationNode,
  relationships: readonly GraphValidationRelationship[],
  nodeById: ReadonlyMap<string, GraphValidationNode>,
): EvaluatedPath {
  const primaryEvaluation = evaluateStepSequence(
    requiredPath.steps,
    sourceNode,
    relationships,
    nodeById,
  );
  const alternativeEvaluations = requiredPath.alternativeSteps.map((steps) =>
    evaluateStepSequence(steps, sourceNode, relationships, nodeById)
  );
  const evaluation = [primaryEvaluation, ...alternativeEvaluations].find(
    ({ missingRelationshipClass }) => missingRelationshipClass === undefined,
  ) ?? alternativeEvaluations.reduce(moreCompleteSequence, primaryEvaluation);
  const status = evaluation.missingRelationshipClass === undefined
    ? "satisfied"
    : "missing";
  const result: RequiredPathResult = {
    pathId: requiredPath.pathId,
    sourceId: sourceNode.id,
    status,
    nodeIds: evaluation.nodeIds,
    relationshipClasses: evaluation.relationshipClasses,
    ...(evaluation.missingRelationshipClass === undefined
      ? {}
      : { missingRelationshipClass: evaluation.missingRelationshipClass }),
  };

  if (evaluation.missingRelationshipClass === undefined) {
    return { result };
  }

  return {
    result,
    diagnostic: {
      code: requiredPath.diagnosticCode,
      severity: requiredPath.severity,
      message: `${sourceNode.id} is missing required relationship '${evaluation.missingRelationshipClass}' in path '${requiredPath.pathId}'.`,
      profileRuleId: requiredPath.pathId,
      affectedIds: evaluation.nodeIds,
      sourceRanges: uniqueRanges(
        evaluation.nodeIds.map((nodeId) => nodeById.get(nodeId)?.sourceRange),
      ),
      blocking: true,
    },
  };
}

function evaluateStepSequence(
  steps: GraphRequiredPath["steps"],
  sourceNode: GraphValidationNode,
  relationships: readonly GraphValidationRelationship[],
  nodeById: ReadonlyMap<string, GraphValidationNode>,
): EvaluatedStepSequence {
  let paths: readonly (readonly string[])[] = [[sourceNode.id]];
  const completedRelationships: GraphRelationshipClass[] = [];
  let missingRelationshipClass: GraphRelationshipClass | undefined;

  for (const step of steps) {
    const nextPaths = paths.flatMap((path) => {
      const tail = path.at(-1);

      return relationships
        .filter(
          (relationship) =>
            relationship.sourceId === tail &&
            relationship.class === step.relationshipClass &&
            step.targetFamilies.includes(nodeById.get(relationship.targetId)?.family ?? ""),
        )
        .map((relationship) => [...path, relationship.targetId]);
    });

    if (nextPaths.length === 0) {
      missingRelationshipClass = step.relationshipClass;
      break;
    }

    paths = nextPaths.sort(comparePath);
    completedRelationships.push(step.relationshipClass);
  }

  return {
    nodeIds: paths[0] ?? [sourceNode.id],
    relationshipClasses: completedRelationships,
    ...(missingRelationshipClass === undefined ? {} : { missingRelationshipClass }),
  };
}

function moreCompleteSequence(
  best: EvaluatedStepSequence,
  candidate: EvaluatedStepSequence,
): EvaluatedStepSequence {
  return candidate.relationshipClasses.length > best.relationshipClasses.length
    ? candidate
    : best;
}

function uniqueRanges(ranges: readonly (SourceRange | undefined)[]): readonly SourceRange[] {
  const byOffsets = new Map<string, SourceRange>();

  for (const range of ranges) {
    if (range !== undefined) {
      byOffsets.set(`${range.start.offset}:${range.end.offset}`, range);
    }
  }

  return [...byOffsets.values()].sort(
    (left, right) =>
      pointOffset(left.start.offset) - pointOffset(right.start.offset) ||
      pointOffset(left.end.offset) - pointOffset(right.end.offset),
  );
}

function compareNode(left: GraphValidationNode, right: GraphValidationNode): number {
  return (
    (left.sourceRange?.start.offset ?? Number.MAX_SAFE_INTEGER) -
      (right.sourceRange?.start.offset ?? Number.MAX_SAFE_INTEGER) ||
    left.id.localeCompare(right.id)
  );
}

function compareRelationship(
  left: GraphValidationRelationship,
  right: GraphValidationRelationship,
): number {
  return (
    left.sourceId.localeCompare(right.sourceId) ||
    left.class.localeCompare(right.class) ||
    left.targetId.localeCompare(right.targetId)
  );
}

function compareDiagnostic(left: GraphDiagnostic, right: GraphDiagnostic): number {
  return (
    (left.sourceRanges[0]?.start.offset ?? Number.MAX_SAFE_INTEGER) -
      (right.sourceRanges[0]?.start.offset ?? Number.MAX_SAFE_INTEGER) ||
    left.code.localeCompare(right.code) ||
    left.message.localeCompare(right.message)
  );
}

function comparePath(left: readonly string[], right: readonly string[]): number {
  return left.join("\u0000").localeCompare(right.join("\u0000"));
}

function pointOffset(offset: number | undefined): number {
  return offset ?? Number.MAX_SAFE_INTEGER;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
