import { createHash } from "node:crypto";
import type {
  Diagnostic,
  OperationError,
  Outcome,
} from "./contracts/source.js";

export const identifierPattern = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;
export const slugPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const sha256 = (text: string): string =>
  createHash("sha256").update(text).digest("hex");
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
export function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
export function failure(
  code: OperationError["code"],
  message: string,
  diagnostics: Diagnostic[] = [],
): Outcome<never> {
  return freeze({ ok: false, error: { code, message, diagnostics } });
}
export class AnalysisFailure extends Error {
  constructor(
    readonly code: OperationError["code"],
    message: string,
  ) {
    super(message);
  }
}
