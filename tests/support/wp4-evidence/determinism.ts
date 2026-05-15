import {
  deriveCommand,
  runDeriveCommand,
  runValidateCommand,
  sha256,
  validateCommand,
} from "./command-runner.js";
import type {
  CommandRun,
  DeterminismEvidence,
  RepeatedCommandEvidence,
} from "./model.js";
import { displayDocumentPath } from "./paths.js";
import { readValidationMetadata } from "./validation-metadata.js";

const repeatCount = 3;

export async function collectDeterminismEvidence(): Promise<DeterminismEvidence> {
  const metadata = await readValidationMetadata();

  return {
    ...metadata,
    commands: [
      await repeatCommand({
        pathName: "sidecar validation",
        command: validateCommand,
        coverage: "sidecar validation",
        run: runValidateCommand,
      }),
      await repeatCommand({
        pathName: "derived registry generation",
        command: deriveCommand,
        coverage: "derived registry generation",
        run: runDeriveCommand,
      }),
    ],
  };
}

async function repeatCommand(input: {
  readonly pathName: string;
  readonly command: string;
  readonly coverage: string;
  readonly run: () => Promise<CommandRun>;
}): Promise<RepeatedCommandEvidence> {
  const runs = [];

  for (let index = 0; index < repeatCount; index += 1) {
    runs.push(await input.run());
  }

  const outputs = runs.map((run) => run.stdout);

  return {
    pathName: input.pathName,
    command: input.command,
    inputFixture: displayDocumentPath,
    coverage: input.coverage,
    runs,
    outputHashes: outputs.map(sha256),
    identicalOrderedOutputs: outputs.every((output) => output === outputs[0]),
  };
}
