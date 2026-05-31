import path from "node:path";

import { deriveGraphFromRegistry } from "../graph/index.js";
import { scanMarkdown } from "../markdown/index.js";
import {
  checkGeneratedSidecarArtifact,
  loadRegistry,
  type EntityRegistry,
  type GeneratedSidecarDriftDiagnostic,
} from "../registry/index.js";
import { validate } from "../validation/index.js";
import { compareMigrationPair } from "./compare.js";
import type {
  MigrationApprovedIntentionalDelta,
  MigrationAuthorityState,
  MigrationComparisonReport,
  MigrationGeneratedMetadataCheck,
  MigrationValidationInput,
} from "./model.js";

export const MIGRATION_CHECK_STEPS = [
  "yaml-compatibility",
  "generated-sidecar",
  "comparison",
] as const;

export const MIGRATION_CHECK_STATUSES = ["passed", "failed", "skipped"] as const;

export type MigrationCheckStep = (typeof MIGRATION_CHECK_STEPS)[number];
export type MigrationCheckStatus = (typeof MIGRATION_CHECK_STATUSES)[number];

export interface MigrationCheckInput {
  readonly repoRoot: string;
  readonly documentPath: string;
  readonly manualRegistryPath: string;
  readonly typeProfilePath?: string;
  readonly authorityState?: MigrationAuthorityState;
  readonly approvedIntentionalDeltas?: readonly MigrationApprovedIntentionalDelta[];
}

export interface MigrationCheckStepResult {
  readonly step: MigrationCheckStep;
  readonly status: MigrationCheckStatus;
  readonly exitCode: number;
  readonly message: string;
  readonly diagnostics: readonly string[];
}

export interface MigrationCheckInputs {
  readonly repoRoot: string;
  readonly documentPath: string;
  readonly manualRegistryPath: string;
  readonly generatedSidecarPath?: string;
  readonly typeProfilePath?: string;
  readonly authorityState: MigrationAuthorityState;
}

export interface MigrationCheckResult {
  readonly valid: boolean;
  readonly exitCode: 0 | 1;
  readonly inputs: MigrationCheckInputs;
  readonly steps: readonly MigrationCheckStepResult[];
  readonly manualValidation?: MigrationValidationInput;
  readonly generatedValidation?: MigrationValidationInput;
  readonly generatedSidecarDiagnostics: readonly GeneratedSidecarDriftDiagnostic[];
  readonly comparisonReport?: MigrationComparisonReport;
}

interface NormalizedMigrationCheckInput {
  readonly repoRoot: string;
  readonly documentPath: string;
  readonly documentAbsolutePath: string;
  readonly manualRegistryPath: string;
  readonly manualRegistryAbsolutePath: string;
  readonly typeProfilePath?: string;
  readonly authorityState: MigrationAuthorityState;
  readonly approvedIntentionalDeltas?: readonly MigrationApprovedIntentionalDelta[];
}

interface RegistryValidationSide {
  readonly registry: EntityRegistry;
  readonly validation: MigrationValidationInput;
}

export async function runMigrationCheck(
  input: MigrationCheckInput,
): Promise<MigrationCheckResult> {
  const normalizedInput = normalizeMigrationCheckInput(input);
  const manual = await loadAndValidateManualRegistry(normalizedInput);
  const sidecar = await runGeneratedSidecarCheck(normalizedInput);
  const steps: MigrationCheckStepResult[] = [manual.step, sidecar.step];

  let generatedValidation: MigrationValidationInput | undefined;
  let comparisonReport: MigrationComparisonReport | undefined;

  if (manual.valid && manual.side !== undefined && sidecar.valid) {
    const comparison = await runComparisonCheck(normalizedInput, manual.side, sidecar);
    steps.push(comparison.step);
    generatedValidation = comparison.generatedValidation;
    comparisonReport = comparison.report;
  } else {
    steps.push(
      skippedStep("comparison", "Comparison skipped because prerequisite checks failed."),
    );
  }

  const valid = steps.every((step) => step.status === "passed");

  return {
    valid,
    exitCode: valid ? 0 : 1,
    inputs: {
      repoRoot: normalizedInput.repoRoot,
      documentPath: normalizedInput.documentPath,
      manualRegistryPath: normalizedInput.manualRegistryPath,
      generatedSidecarPath: sidecar.generatedSidecarPath,
      ...(normalizedInput.typeProfilePath === undefined
        ? {}
        : { typeProfilePath: normalizedInput.typeProfilePath }),
      authorityState: normalizedInput.authorityState,
    },
    steps,
    manualValidation: manual.side?.validation,
    generatedValidation,
    generatedSidecarDiagnostics: sidecar.diagnostics,
    comparisonReport,
  };
}

async function loadAndValidateManualRegistry(
  input: NormalizedMigrationCheckInput,
): Promise<{
  readonly step: MigrationCheckStepResult;
  readonly valid: boolean;
  readonly side?: RegistryValidationSide;
}> {
  try {
    const side = await loadAndValidateRegistry(
      input.manualRegistryAbsolutePath,
      input.documentAbsolutePath,
    );

    const valid = side.validation.exitCode === 0;

    return {
      side,
      valid,
      step:
        valid
          ? passedStep("yaml-compatibility", "Manual YAML registry validation passed.")
          : failedStep("yaml-compatibility", "Manual YAML registry validation failed."),
    };
  } catch (error) {
    return {
      valid: false,
      step: failedStep("yaml-compatibility", "Manual YAML registry validation failed.", [
        errorMessage(error),
      ]),
    };
  }
}

async function runGeneratedSidecarCheck(
  input: NormalizedMigrationCheckInput,
): Promise<{
  readonly step: MigrationCheckStepResult;
  readonly valid: boolean;
  readonly generatedSidecarPath?: string;
  readonly generatedSidecarAbsolutePath?: string;
  readonly generatedMetadataCheck?: MigrationGeneratedMetadataCheck;
  readonly diagnostics: readonly GeneratedSidecarDriftDiagnostic[];
}> {
  try {
    const result = await checkGeneratedSidecarArtifact({
      repoRoot: input.repoRoot,
      documentPath: input.documentPath,
      typeProfilePath: input.typeProfilePath,
    });
    const diagnostics = result.diagnostics;

    return {
      valid: result.valid,
      generatedSidecarPath: result.artifactRelativePath,
      generatedSidecarAbsolutePath: result.artifactPath,
      generatedMetadataCheck: {
        valid: result.valid,
        metadata: result.artifact.generated,
      },
      diagnostics,
      step: result.valid
        ? passedStep("generated-sidecar", "Generated sidecar check passed.")
        : failedStep(
            "generated-sidecar",
            "Generated sidecar check failed.",
            diagnostics.map((diagnostic) => diagnostic.message),
          ),
    };
  } catch (error) {
    return {
      valid: false,
      diagnostics: [],
      step: failedStep("generated-sidecar", "Generated sidecar check failed.", [
        errorMessage(error),
      ]),
    };
  }
}

async function runComparisonCheck(
  input: NormalizedMigrationCheckInput,
  manual: RegistryValidationSide,
  sidecar: {
    readonly generatedSidecarPath?: string;
    readonly generatedSidecarAbsolutePath?: string;
    readonly generatedMetadataCheck?: MigrationGeneratedMetadataCheck;
  },
): Promise<{
  readonly step: MigrationCheckStepResult;
  readonly generatedValidation?: MigrationValidationInput;
  readonly report?: MigrationComparisonReport;
}> {
  if (
    sidecar.generatedSidecarPath === undefined ||
    sidecar.generatedSidecarAbsolutePath === undefined ||
    sidecar.generatedMetadataCheck === undefined
  ) {
    return {
      step: skippedStep(
        "comparison",
        "Comparison skipped because generated sidecar output is unavailable.",
      ),
    };
  }

  try {
    const generated = await loadAndValidateRegistry(
      sidecar.generatedSidecarAbsolutePath,
      input.documentAbsolutePath,
    );
    const report = compareMigrationPair({
      documentPath: input.documentPath,
      manualRegistryPath: input.manualRegistryPath,
      generatedSidecarPath: sidecar.generatedSidecarPath,
      authorityState: input.authorityState,
      approvedIntentionalDeltas: input.approvedIntentionalDeltas,
      generatedMetadataCheck: sidecar.generatedMetadataCheck,
      manual: {
        registry: manual.registry,
        graph: deriveGraphFromRegistry(manual.registry),
        validation: manual.validation,
      },
      generated: {
        registry: generated.registry,
        graph: deriveGraphFromRegistry(generated.registry),
        metadata: sidecar.generatedMetadataCheck.metadata,
        validation: generated.validation,
      },
    });

    return {
      report,
      generatedValidation: generated.validation,
      step:
        report.exitCode === 0
          ? passedStep("comparison", "Migration comparison passed.")
          : failedStep("comparison", "Migration comparison reported blocking drift."),
    };
  } catch (error) {
    return {
      step: failedStep("comparison", "Migration comparison failed.", [errorMessage(error)]),
    };
  }
}

async function loadAndValidateRegistry(
  registryPath: string,
  documentPath: string,
): Promise<RegistryValidationSide> {
  const registry = await loadRegistry(registryPath);
  const validationResult = validate(registry, await scanMarkdown(documentPath, registry));

  return {
    registry,
    validation: {
      exitCode: validationResult.valid ? 0 : 1,
      result: validationResult,
    },
  };
}

function normalizeMigrationCheckInput(
  input: MigrationCheckInput,
): NormalizedMigrationCheckInput {
  const repoRoot = path.resolve(input.repoRoot);
  const documentAbsolutePath = path.resolve(repoRoot, input.documentPath);
  const manualRegistryAbsolutePath = path.resolve(repoRoot, input.manualRegistryPath);

  return {
    repoRoot,
    documentPath: repoRelativePath(repoRoot, documentAbsolutePath, "document path"),
    documentAbsolutePath,
    manualRegistryPath: repoRelativePath(
      repoRoot,
      manualRegistryAbsolutePath,
      "manual registry path",
    ),
    manualRegistryAbsolutePath,
    ...(input.typeProfilePath === undefined
      ? {}
      : {
          typeProfilePath: repoRelativePath(
            repoRoot,
            path.resolve(repoRoot, input.typeProfilePath),
            "type profile path",
          ),
        }),
    authorityState: input.authorityState ?? "yaml-authoritative",
    approvedIntentionalDeltas: input.approvedIntentionalDeltas,
  };
}

function passedStep(step: MigrationCheckStep, message: string): MigrationCheckStepResult {
  return {
    step,
    status: "passed",
    exitCode: 0,
    message,
    diagnostics: [],
  };
}

function failedStep(
  step: MigrationCheckStep,
  message: string,
  diagnostics: readonly string[] = [],
): MigrationCheckStepResult {
  return {
    step,
    status: "failed",
    exitCode: 1,
    message,
    diagnostics,
  };
}

function skippedStep(step: MigrationCheckStep, message: string): MigrationCheckStepResult {
  return {
    step,
    status: "skipped",
    exitCode: 0,
    message,
    diagnostics: [],
  };
}

function repoRelativePath(repoRoot: string, targetPath: string, label: string): string {
  const relativePath = path.relative(repoRoot, targetPath);

  if (
    relativePath === "" ||
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`${label} must be inside the repository root`);
  }

  return relativePath.split(path.sep).join("/");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
