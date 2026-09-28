import type { ProjectionOutcome } from "./contracts.js";
import { freeze } from "../value.js";

export class JsonAdmissionError extends Error {
  constructor(message: string, readonly duplicateKey = false) { super(message); }
}

/** Native syntax validation plus an iterative scan of decoded keys per object. */
export function parseStrictJson(text: string): unknown {
  if (typeof text !== "string" || hasLoneSurrogate(text))
    throw new JsonAdmissionError("Expected well-formed JSON text.");
  let parsed: unknown;
  try { parsed = JSON.parse(text); }
  catch { throw new JsonAdmissionError("Malformed JSON text."); }

  const objects: Set<string>[] = [];
  for (let i = 0; i < text.length;) {
    const c = text[i++];
    if (c === "{") objects.push(new Set());
    else if (c === "}") objects.pop();
    else if (c === '"') {
      const start = i - 1;
      // Syntax is already valid; escaped quotes cannot end this string.
      while (text[i] !== '"') {
        if (text[i] === "\\") i++;
        i++;
      }
      const end = ++i;
      while (/[\u0009\u000a\u000d\u0020]/.test(text[i] ?? "")) i++;
      if (text[i] === ":") {
        const key = JSON.parse(text.slice(start, end)) as string;
        const keys = objects[objects.length - 1];
        if (keys.has(key))
          throw new JsonAdmissionError(`Duplicate JSON object key ${JSON.stringify(key)}.`, true);
        keys.add(key);
      }
    }
  }
  return parsed;
}

export function assertJsonData(root: unknown): void {
  const ancestors = new Set<object>();
  const pending: { value: unknown; leave: boolean }[] = [{ value: root, leave: false }];
  while (pending.length) {
    const { value, leave } = pending.pop()!;
    if (leave) { ancestors.delete(value as object); continue; }
    if (value === null || typeof value === "string" || typeof value === "boolean") {
      if (typeof value === "string" && hasLoneSurrogate(value)) throw new JsonAdmissionError("Strings must be valid Unicode.");
      continue;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new JsonAdmissionError("Numbers must be finite.");
      continue;
    }
    if (typeof value !== "object" || ancestors.has(value)) throw new JsonAdmissionError("Expected acyclic JSON data.");
    if (Array.isArray(value) ? Object.getPrototypeOf(value) !== Array.prototype : ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
      throw new JsonAdmissionError("Expected plain JSON data.");
    if (Object.getOwnPropertySymbols(value).length) throw new JsonAdmissionError("Symbol fields are unsupported.");
    const keys = Object.keys(value);
    if (Array.isArray(value) && (keys.length !== value.length || keys.some((key, n) => key !== String(n))))
      throw new JsonAdmissionError("Expected a dense JSON array.");
    ancestors.add(value);
    pending.push({ value, leave: true });
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
      if (Array.isArray(value) && key === "length") continue;
      if (!descriptor.enumerable || !("value" in descriptor)) throw new JsonAdmissionError("Accessors and hidden fields are unsupported.");
      if (Array.isArray(value) && !/^(?:0|[1-9]\d*)$/.test(key)) throw new JsonAdmissionError("Array has extra properties.");
      pending.push({ value: descriptor.value, leave: false });
    }
  }
}

export const hasLoneSurrogate = (text: string): boolean => /[\uD800-\uDFFF]/u.test(text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/gu, ""));

export function projectionFailure(
  code: "invalid-input" | "invalid-policy" | "unsupported-version" | "resource-limit" | "stale-input",
  message: string,
): ProjectionOutcome<never> {
  return freeze({ ok: false, error: { code, message, diagnostics: [] } });
}
