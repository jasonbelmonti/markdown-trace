import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  graphProfileHash,
  loadGraphProfile,
  type GraphProfile as RelationshipGraphProfile,
  type GraphProfileDiagnostic,
} from "../graph-profile/index.js";
import type {
  GraphArtifactFamily,
  GraphProfile as CompleteGraphProfile,
} from "../graph-profile/model.js";
import { runtimeMetadata } from "../runtime-metadata.js";
import { extractTraceEvidence } from "../trace-evidence/index.js";
import type {
  GraphValidationOperationalDiagnostic,
  GraphValidationOperationalResult,
  GraphValidationRunResult,
  ValidateGraphDocumentOptions,
} from "../public.js";
import { validateGraphEvidence } from "./validate.js";

export async function validateGraphDocument(
  options: ValidateGraphDocumentOptions,
): Promise<GraphValidationRunResult> {
  const resolvedOptions = resolveOptions(options);
  const profileResult = await loadGraphProfile(resolvedOptions.profilePath);

  if (!profileResult.ok) {
    return operationalResult(
      resolvedOptions,
      profileResult.diagnostics.map(profileDiagnostic),
    );
  }

  if (!isRelationshipGraphProfile(profileResult.profile)) {
    return operationalResult(
      resolvedOptions,
      [
        operationalDiagnostic(
          "profile-compatibility",
          `${resolvedOptions.profilePath} contains required-path rules that this validator does not support`,
          resolvedOptions.profilePath,
        ),
      ],
      profileResult.profile,
    );
  }

  let markdown: string;
  try {
    markdown = await readFile(resolvedOptions.documentPath, "utf8");
  } catch {
    return operationalResult(
      resolvedOptions,
      [
        operationalDiagnostic(
          "document-read",
          `${resolvedOptions.documentPath} cannot be read`,
          resolvedOptions.documentPath,
        ),
      ],
      profileResult.profile,
    );
  }

  try {
    const evidence = extractTraceEvidence(markdown, profileResult.profile, {
      sourcePath: resolvedOptions.documentPath,
    });

    return validateGraphEvidence(evidence, profileResult.profile, {
      profilePath: resolvedOptions.profilePath,
    });
  } catch (error) {
    return operationalResult(
      resolvedOptions,
      [
        operationalDiagnostic(
          "evidence-extraction",
          error instanceof Error ? error.message : String(error),
          resolvedOptions.documentPath,
        ),
      ],
      profileResult.profile,
    );
  }
}

function resolveOptions(
  options: ValidateGraphDocumentOptions,
): Required<ValidateGraphDocumentOptions> {
  const cwd = path.resolve(process.cwd(), options.cwd ?? ".");

  return {
    documentPath: path.resolve(cwd, options.documentPath),
    profilePath: path.resolve(cwd, options.profilePath),
    cwd,
  };
}

function profileDiagnostic(
  diagnostic: GraphProfileDiagnostic,
): GraphValidationOperationalDiagnostic {
  return {
    code: diagnostic.code,
    severity: diagnostic.severity,
    message: diagnostic.message,
    profileRuleId: diagnostic.profileRuleId,
    affectedIds: diagnostic.affectedIds,
    sourceRanges: [],
    blocking: diagnostic.blocking,
    stage: "profile-load",
    ...(diagnostic.source === undefined ? {} : { source: diagnostic.source }),
  };
}

function operationalDiagnostic(
  stage: Exclude<GraphValidationOperationalDiagnostic["stage"], "profile-load">,
  message: string,
  source: string,
): GraphValidationOperationalDiagnostic {
  return {
    code: "markdown-trace.graph.operational_error",
    severity: "error",
    message,
    profileRuleId: `graph-validation.${stage}`,
    affectedIds: [],
    sourceRanges: [],
    blocking: true,
    stage,
    source,
  };
}

function operationalResult(
  options: ValidateGraphDocumentOptions,
  diagnostics: readonly GraphValidationOperationalDiagnostic[],
  profile?: CompleteGraphProfile<GraphArtifactFamily>,
): GraphValidationOperationalResult {
  const profileSha256 = profile === undefined ? null : graphProfileHash(profile);

  return {
    schemaVersion: "markdown-trace.graph-validation-result.v1",
    status: "operational-error",
    source: {
      path: options.documentPath,
      sha256: null,
      lineCount: null,
    },
    profile: {
      path: options.profilePath,
      profileId: profile?.profileId ?? null,
      artifactFamily: profile?.artifactFamily ?? null,
      profileVersion: profile?.profileVersion ?? null,
      sha256: profileSha256,
    },
    run: runtimeMetadata(),
    nodes: [],
    relationships: [],
    requiredPathResults: [],
    matrixCoverageResults: [],
    diagnostics,
    summary: {
      nodes: 0,
      relationships: 0,
      requiredPaths: 0,
      satisfiedRequiredPaths: 0,
      diagnostics: diagnostics.length,
    },
    hashes: {
      sourceSha256: null,
      profileSha256,
      traceEvidenceSha256: null,
    },
  };
}

function isRelationshipGraphProfile(
  profile: CompleteGraphProfile<GraphArtifactFamily>,
): profile is RelationshipGraphProfile {
  return profile.requiredPaths.every(
    ({ diagnosticCode }) => diagnosticCode === "markdown-trace.graph.missing_required_path",
  );
}
