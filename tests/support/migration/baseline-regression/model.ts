export type BaselineRegressionStatus = "PASS" | "FAIL";

export const requiredBaselineRegressionCommands = [
  "npm run typecheck",
  "npm test",
  "npm run build",
  "npm run validate:fixture",
  "npm run derive:fixture",
  "npm run migration:check",
  "git diff --check",
] as const;

export type BaselineRegressionCommand =
  (typeof requiredBaselineRegressionCommands)[number];

export interface BaselineRegressionCommandEvidence {
  readonly purpose: string;
  readonly command: BaselineRegressionCommand;
  readonly status: BaselineRegressionStatus;
  readonly observedEvidence: string;
}

export interface BaselineRegressionEvidence {
  readonly evidenceId: "R3-EVD-9";
  readonly validationCheckpoint: "VAL-9";
  readonly workPackage: "WP-4";
  readonly issue: "BEL-1240";
  readonly observedAt: string;
  readonly commands: readonly BaselineRegressionCommandEvidence[];
  readonly status: BaselineRegressionStatus;
}

const baselineRegressionCommands = [
  {
    purpose: "TypeScript validation",
    command: "npm run typecheck",
    status: "PASS",
    observedEvidence: "exit code 0",
  },
  {
    purpose: "Full local regression suite",
    command: "npm test",
    status: "PASS",
    observedEvidence: "exit code 0",
  },
  {
    purpose: "Build",
    command: "npm run build",
    status: "PASS",
    observedEvidence: "exit code 0",
  },
  {
    purpose: "R0 YAML compatibility baseline",
    command: "npm run validate:fixture",
    status: "PASS",
    observedEvidence: "exit code 0",
  },
  {
    purpose: "R0 derive compatibility baseline",
    command: "npm run derive:fixture",
    status: "PASS",
    observedEvidence: "exit code 0",
  },
  {
    purpose: "Passing migration command baseline",
    command: "npm run migration:check",
    status: "PASS",
    observedEvidence: "exit code 0",
  },
  {
    purpose: "Whitespace diff check",
    command: "git diff --check",
    status: "PASS",
    observedEvidence: "exit code 0",
  },
] as const satisfies readonly BaselineRegressionCommandEvidence[];

export const baselineRegressionEvidence: BaselineRegressionEvidence = {
  evidenceId: "R3-EVD-9",
  validationCheckpoint: "VAL-9",
  workPackage: "WP-4",
  issue: "BEL-1240",
  observedAt: "2026-06-01T01:48:28Z",
  commands: baselineRegressionCommands,
  status: baselineRegressionStatusForCommands(baselineRegressionCommands),
};

export function missingBaselineRegressionCommands(
  commands: readonly Pick<BaselineRegressionCommandEvidence, "command">[],
): BaselineRegressionCommand[] {
  const present = new Set(commands.map((row) => row.command));

  return requiredBaselineRegressionCommands.filter(
    (command) => !present.has(command),
  );
}

function baselineRegressionStatusForCommands(
  commands: readonly Pick<BaselineRegressionCommandEvidence, "status">[],
): BaselineRegressionStatus {
  return commands.every((row) => row.status === "PASS") ? "PASS" : "FAIL";
}
