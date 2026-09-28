import { resolve } from "node:path";
import {
  produceProjection, verifyProjection,
  type ProjectionOutcome, type ProjectionPacket, type ProjectionVerification,
} from "../index.js";
import { parseProjectionCommandOptions } from "./options.js";
import {
  createProjectionFileReader, decodeProjectionUtf8, loadProjectionInput,
  parseProjectionPacket,
  type CommandInputError, type ProjectionFileReader,
} from "./manifest.js";

interface CommandError extends Error {
  readonly code?: string;
  readonly diagnostics?: readonly unknown[];
}

function jsonError(error: unknown): string {
  const failure = error as CommandError;
  return JSON.stringify({
    valid: false,
    code: failure?.code ?? "runtime-error",
    message: failure?.message ?? String(error),
    diagnostics: failure?.diagnostics ?? [],
  });
}

function operationFailure<T>(outcome: ProjectionOutcome<T>): T {
  if (outcome.ok) return outcome.value;
  const failure = new Error(outcome.error.message) as CommandInputError;
  Object.assign(failure, { code: outcome.error.code, diagnostics: outcome.error.diagnostics });
  throw failure;
}

function packetLimit(input: { readonly limits: { readonly maxPacketUtf8Bytes: number } }): number {
  const limit = input?.limits?.maxPacketUtf8Bytes;
  if (!Number.isSafeInteger(limit) || limit < 0) {
    const error = new Error("maxPacketUtf8Bytes must be a nonnegative safe integer.") as CommandInputError;
    Object.assign(error, { code: "invalid-input" });
    throw error;
  }
  return limit;
}

async function readPacket(path: string, reader: ProjectionFileReader, maxBytes: number): Promise<unknown> {
  const bytes = await reader(resolve(path));
  if (bytes.byteLength > maxBytes) {
    const error = new Error("Packet file exceeds maxPacketUtf8Bytes.") as CommandInputError;
    Object.assign(error, { code: "resource-limit" });
    throw error;
  }
  const text = decodeProjectionUtf8(bytes, "Projection packet");
  return parseProjectionPacket(text);
}

/** Projection-only transport adapter; all obligation decisions stay in the public API. */
export async function runProjectionCommand(
  args: string[],
  io: { stdout: (text: string) => void; stderr: (text: string) => void },
): Promise<number> {
  try {
    const options = parseProjectionCommandOptions(args);
    const reader = createProjectionFileReader();
    const input = await loadProjectionInput(options.manifestPath, reader);
    let output: ProjectionPacket | ProjectionVerification;
    let exitCode: number;
    if (options.packetPath === undefined) {
      const packet = operationFailure(produceProjection(input));
      output = packet;
      exitCode = packet.policyStatus === "satisfied" ? 0 : 1;
    } else {
      const packet = await readPacket(options.packetPath, reader, packetLimit(input));
      const verification = operationFailure(verifyProjection(input, packet));
      output = verification;
      exitCode = verification.status === "pass" ? 0 : 1;
    }
    const encoded = JSON.stringify(output);
    if (typeof encoded !== "string") throw new Error("Projection result is not JSON serializable.");
    if (options.packetPath === undefined && Buffer.byteLength(encoded, "utf8") > packetLimit(input)) {
      const error = new Error("Produced packet exceeds maxPacketUtf8Bytes.") as CommandInputError;
      Object.assign(error, { code: "resource-limit" });
      throw error;
    }
    io.stdout(encoded);
    return exitCode;
  } catch (error) {
    io.stderr(jsonError(error));
    return 2;
  }
}
