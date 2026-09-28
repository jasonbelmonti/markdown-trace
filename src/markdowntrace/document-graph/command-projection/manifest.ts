import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  compileProjectionPolicy,
  type ProjectionInput, type ProjectionManifest,
} from "../index.js";

export interface CommandInputError extends Error {
  readonly code: string;
  readonly diagnostics?: readonly unknown[];
}

function failure(code: string, message: string, diagnostics?: readonly unknown[]): CommandInputError {
  return Object.assign(new Error(message), { code, ...(diagnostics ? { diagnostics } : {}) });
}

function preflightDuplicateKeys(text: string): void {
  let cursor = 0;
  const whitespace = () => { while (/[\u0020\u0009\u000a\u000d]/.test(text[cursor] ?? "")) cursor++; };
  const string = (): string => {
    const start = cursor;
    if (text[cursor] !== '"') throw new SyntaxError(`Expected a JSON string at offset ${cursor}.`);
    cursor++;
    while (cursor < text.length) {
      const character = text[cursor++];
      if (character === '"') return JSON.parse(text.slice(start, cursor)) as string;
      if (character === "\\") cursor++;
    }
    throw new SyntaxError(`Unterminated JSON string at offset ${start}.`);
  };
  const value = (depth: number): void => {
    if (depth > 256) throw new SyntaxError("JSON nesting exceeds the command decoder limit.");
    whitespace();
    const current = text[cursor];
    if (current === '"') { string(); return; }
    if (current === "{") {
      cursor++;
      whitespace();
      if (text[cursor] === "}") { cursor++; return; }
      const keys = new Set<string>();
      while (cursor < text.length) {
        whitespace();
        const key = string();
        if (keys.has(key)) throw new SyntaxError(`Duplicate JSON object key ${JSON.stringify(key)}.`);
        keys.add(key);
        whitespace();
        if (text[cursor++] !== ":") throw new SyntaxError(`Expected ':' after JSON key at offset ${cursor - 1}.`);
        value(depth + 1);
        whitespace();
        const delimiter = text[cursor++];
        if (delimiter === "}") return;
        if (delimiter !== ",") throw new SyntaxError(`Expected ',' or '}' at offset ${cursor - 1}.`);
      }
      throw new SyntaxError("Unterminated JSON object.");
    }
    if (current === "[") {
      cursor++;
      whitespace();
      if (text[cursor] === "]") { cursor++; return; }
      while (cursor < text.length) {
        value(depth + 1);
        whitespace();
        const delimiter = text[cursor++];
        if (delimiter === "]") return;
        if (delimiter !== ",") throw new SyntaxError(`Expected ',' or ']' at offset ${cursor - 1}.`);
      }
      throw new SyntaxError("Unterminated JSON array.");
    }
    const rest = text.slice(cursor);
    const literal = /^(?:true|false|null)/.exec(rest)?.[0];
    if (literal) { cursor += literal.length; return; }
    const number = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(rest)?.[0];
    if (number) { cursor += number.length; return; }
    throw new SyntaxError(`Invalid JSON value at offset ${cursor}.`);
  };
  value(0);
  whitespace();
  if (cursor !== text.length) throw new SyntaxError(`Unexpected JSON data at offset ${cursor}.`);
  // Native parsing remains the syntax and value authority after duplicate-key preflight.
  JSON.parse(text);
}

export function decodeProjectionUtf8(bytes: Uint8Array, name: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw failure("invalid-utf8", `${name} is not valid UTF-8.`);
  }
}

function parseConfiguredJson(text: string, name: string): unknown {
  try {
    preflightDuplicateKeys(text);
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw failure("invalid-input", `${name} is invalid JSON: ${(error as Error).message}`);
  }
}

/** Malformed packet bytes are passed to the public verifier as invalid data. */
export function parseProjectionPacket(text: string): unknown {
  try {
    preflightDuplicateKeys(text);
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function record(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw failure("invalid-input", "Projection manifest must be a JSON object.");
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[], label: string): void {
  const allowed = new Set(keys);
  const unexpected = Object.keys(value).filter(key => !allowed.has(key));
  if (unexpected.length) throw failure("invalid-input", `${label} has unsupported field(s): ${unexpected.join(", ")}.`);
}

function requiredPath(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0)
    throw failure("invalid-input", `${label} must be a nonempty path.`);
  return value;
}

export type ProjectionFileReader = (path: string) => Promise<Uint8Array>;

/** Create one path-keyed input reader shared across every file in a command. */
export function createProjectionFileReader(): ProjectionFileReader {
  const cache = new Map<string, Promise<Uint8Array>>();
  return (path: string): Promise<Uint8Array> => {
    const absolute = resolve(path);
    let pending = cache.get(absolute);
    if (!pending) {
      pending = readFile(absolute);
      cache.set(absolute, pending);
    }
    return pending;
  };
}

/** Load each explicit manifest/source/profile/policy file at most once per command. */
export async function loadProjectionInput(
  manifestPath: string,
  readOnce: ProjectionFileReader = createProjectionFileReader(),
): Promise<ProjectionInput> {
  const manifestAbsolute = resolve(manifestPath);
  const manifestText = decodeProjectionUtf8(await readOnce(manifestAbsolute), "Projection manifest");
  const parsedManifest = record(parseConfiguredJson(manifestText, "Projection manifest"));
  exactKeys(parsedManifest, ["schemaVersion", "assignmentId", "roots", "sources", "bindings", "policyFile", "expected", "budget", "limits"], "Projection manifest");
  if (parsedManifest.schemaVersion !== "markdown-trace.projection-manifest.v1")
    throw failure("unsupported-version", "Unsupported projection manifest schema version.");
  if (!Array.isArray(parsedManifest.sources) || parsedManifest.sources.length === 0)
    throw failure("invalid-input", "Projection manifest must declare at least one source.");

  const base = dirname(manifestAbsolute);
  const policyPath = resolve(base, requiredPath(parsedManifest.policyFile, "policyFile"));
  const policyJson = decodeProjectionUtf8(await readOnce(policyPath), "Projection policy");
  const policy = compileProjectionPolicy(policyJson);
  if (!policy.ok) throw failure(policy.error.code, policy.error.message, policy.error.diagnostics);

  const sources = await Promise.all(parsedManifest.sources.map(async (unknownSource, index) => {
    const source = record(unknownSource);
    exactKeys(source, ["alias", "revision", "documentId", "file", "profileFile"], `Source ${index}`);
    const sourcePath = resolve(base, requiredPath(source.file, `Source ${index} file`));
    const profilePath = resolve(base, requiredPath(source.profileFile, `Source ${index} profileFile`));
    const [sourceBytes, profileBytes] = await Promise.all([readOnce(sourcePath), readOnce(profilePath)]);
    const text = decodeProjectionUtf8(sourceBytes, `Source ${index}`);
    const validationProfileJson = decodeProjectionUtf8(profileBytes, `Source ${index} validation profile`);
    // Preserve raw bytes for the public compiler's identities while rejecting duplicate keys here.
    parseConfiguredJson(validationProfileJson, `Source ${index} validation profile`);
    return {
      alias: source.alias,
      revision: source.revision,
      documentId: source.documentId,
      text,
      validationProfileJson,
    };
  }));

  // Preserve the exact policy bytes used to issue its identity; the policy handle is public.
  const input = {
    assignmentId: parsedManifest.assignmentId,
    roots: parsedManifest.roots,
    sources,
    bindings: parsedManifest.bindings,
    policy: policy.value,
    expected: parsedManifest.expected,
    budget: parsedManifest.budget,
    limits: parsedManifest.limits,
  } as unknown as ProjectionInput;
  return input;
}

export type { ProjectionManifest };
