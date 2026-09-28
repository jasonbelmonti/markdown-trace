import { sha256, freeze } from "../value.js";
import type {
  EntityRef, ProjectionOutcome, ProjectionPolicy, ProjectionPolicyInput,
  ProjectionRule, Selection,
} from "./contracts.js";
import { issueProjectionPolicy } from "./policy-state.js";
import { JsonAdmissionError, hasLoneSurrogate, parseStrictJson, projectionFailure } from "./json.js";

const aliasPattern = /^(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?![\s\S])/;
const idPattern = /^(?:[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?![\s\S])/;
const slugPattern = /^(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?![\s\S])/;
type Data = Record<string, unknown>;
class PolicyError extends Error { constructor(message: string, readonly unsupported = false) { super(message); } }
const fail = (message: string): never => { throw new PolicyError(message); };

function object(value: unknown, keys: readonly string[], field: string): Data {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${field}: expected an object`);
  const record = value as Data;
  if (Object.keys(record).some(key => !keys.includes(key)) || keys.some(key => !Object.hasOwn(record, key)))
    fail(`${field}: missing or unknown field`);
  return record;
}
function array(value: unknown, field: string, nonempty = false): unknown[] {
  if (!Array.isArray(value) || (nonempty && value.length === 0) || Object.keys(value).length !== value.length || Object.keys(value).some((key, i) => key !== String(i)))
    fail(`${field}: expected ${nonempty ? "a nonempty " : "a "}dense array`);
  return value as unknown[];
}
function text(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim() || value.includes("\0") || hasLoneSurrogate(value)) fail(`${field}: expected nonblank valid text`);
  return value as string;
}
function name(value: unknown, field: string, pattern = aliasPattern): string {
  const candidate = text(value, field);
  if (!pattern.test(candidate)) fail(`${field}: invalid name`);
  return candidate;
}
function bound(value: unknown, field: string, positive = false): number {
  if (!Number.isSafeInteger(value) || (value as number) < (positive ? 1 : 0)) fail(`${field}: expected a ${positive ? "positive" : "nonnegative"} safe integer`);
  return value as number;
}
function unique(values: readonly string[], field: string): void {
  if (new Set(values).size !== values.length) fail(`${field}: duplicate value`);
}
function entity(value: unknown, field: string): EntityRef {
  const row = object(value, ["source", "identifier"], field);
  return { source: name(row.source, `${field}.source`), identifier: name(row.identifier, `${field}.identifier`, idPattern) };
}
function range(value: unknown, field: string): Selection {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${field}.select: expected an object`);
  const kind = (value as Data).kind;
  if (kind === "document") {
    object(value, ["kind"], `${field}.select`);
    return { kind: "document" };
  }
  if (kind === "section") {
    object(value, ["kind", "path"], `${field}.select`);
    const path = array((value as Data).path, `${field}.select.path`, true).map((part, i) => text(part, `${field}.select.path[${i}]`));
    return { kind: "section", path: path as [string, ...string[]] };
  }
  if (kind === "block") {
    object(value, ["kind", "range"], `${field}.select`);
    const sourceRange = object((value as Data).range, ["start", "end"], `${field}.select.range`);
    const position = (input: unknown, name: string) => {
      const point = object(input, ["offset", "line", "column"], `${field}.select.range.${name}`);
      return {
        offset: bound(point.offset, `${field}.select.range.${name}.offset`),
        line: bound(point.line, `${field}.select.range.${name}.line`, true),
        column: bound(point.column, `${field}.select.range.${name}.column`, true),
      };
    };
    const start = position(sourceRange.start, "start"), end = position(sourceRange.end, "end");
    if (end.offset < start.offset) fail(`${field}.select.range: end precedes start`);
    return { kind: "block", range: { start, end } };
  }
  return fail(`${field}.select.kind: unsupported source selector`);
}

function parseRule(value: unknown, i: number): ProjectionRule {
  const at = `rules[${i}]`;
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${at}: expected a rule`);
  const op = (value as Data).op;
  if (op === "source") {
    const row = object(value, ["id", "op", "requirement", "source", "select"], at);
    if (row.requirement !== "required" && row.requirement !== "optional") fail(`${at}.requirement: unsupported value`);
    return { id: name(row.id, `${at}.id`), op, requirement: row.requirement as "required" | "optional", source: name(row.source, `${at}.source`), select: range(row.select, at) };
  }
  if (op === "entities") {
    const row = object(value, ["id", "op", "requirement", "entities"], at);
    if (row.requirement !== "required" && row.requirement !== "optional") fail(`${at}.requirement: unsupported value`);
    const entities = array(row.entities, `${at}.entities`, true).map((item, n) => entity(item, `${at}.entities[${n}]`));
    const normalized = [...new Map(entities.map(item => [`${item.source}\0${item.identifier}`, item])).values()]
      .sort((a, b) => (a.source < b.source ? -1 : a.source > b.source ? 1 : a.identifier < b.identifier ? -1 : a.identifier > b.identifier ? 1 : 0));
    return { id: name(row.id, `${at}.id`), op, requirement: row.requirement as "required" | "optional", entities: normalized as [EntityRef, ...EntityRef[]] };
  }
  if (op === "expand") {
    const row = object(value, ["id", "op", "requirement", "from", "mode", "direction", "relations", "subjectKinds", "minSubjects", "minNeighbors", "maxDepth", "maxNodes"], at);
    if (row.requirement !== "required" && row.requirement !== "optional") fail(`${at}.requirement: unsupported value`);
    if (row.mode !== "step" && row.mode !== "closure") fail(`${at}.mode: unsupported value`);
    if (row.direction !== "incoming" && row.direction !== "outgoing" && row.direction !== "both") fail(`${at}.direction: unsupported value`);
    const relations = array(row.relations, `${at}.relations`, true).map((v, n) => name(v, `${at}.relations[${n}]`, slugPattern));
    const kinds = array(row.subjectKinds, `${at}.subjectKinds`, true).map((v, n) => name(v, `${at}.subjectKinds[${n}]`));
    unique(relations, `${at}.relations`); unique(kinds, `${at}.subjectKinds`);
    const maxDepth = bound(row.maxDepth, `${at}.maxDepth`);
    if (row.mode === "step" && maxDepth !== 1) fail(`${at}.maxDepth: step mode requires depth one`);
    return {
      id: name(row.id, `${at}.id`), op, requirement: row.requirement as "required" | "optional",
      from: text(row.from, `${at}.from`), mode: row.mode as "step" | "closure", direction: row.direction as "incoming" | "outgoing" | "both",
      relations: relations as [string, ...string[]], subjectKinds: kinds as [string, ...string[]],
      minSubjects: bound(row.minSubjects, `${at}.minSubjects`),
      minNeighbors: bound(row.minNeighbors, `${at}.minNeighbors`), maxDepth,
      maxNodes: bound(row.maxNodes, `${at}.maxNodes`),
    };
  }
  if (op === undefined || typeof op !== "string") fail(`${at}.op: missing operator`);
  return fail(`${at}.op: unsupported operator ${op}`);
}

function compileInput(value: unknown): ProjectionPolicyInput {
  if (value && typeof value === "object" && !Array.isArray(value) &&
      Object.hasOwn(value, "schemaVersion") && (value as Data).schemaVersion !== "markdown-trace.projection-policy.v1")
    throw new PolicyError("schemaVersion: unsupported projection policy version", true);
  const root = object(value, ["schemaVersion", "policyId", "revision", "sources", "rules", "validationGates"], "policy");
  const sources = array(root.sources, "sources", true).map((v, i) => name(v, `sources[${i}]`)).sort();
  unique(sources, "sources");
  const rules = array(root.rules, "rules", true).map(parseRule);
  for (const rule of rules) if (rule.op === "entities")
    for (const item of rule.entities) if (!sources.includes(item.source)) fail(`rules.${rule.id}: unknown source ${item.source}`);
  const ruleIds = rules.map(rule => rule.id);
  unique(ruleIds, "rules.id");
  if (ruleIds.includes("roots")) fail("rules.id: roots is reserved");
  if (!rules.some(rule => rule.requirement === "required")) fail("rules: at least one required rule is required");
  const gateRows = array(root.validationGates, "validationGates", true).map((gate, i) => {
    const row = object(gate, ["source", "rules"], `validationGates[${i}]`);
    const source = name(row.source, `validationGates[${i}].source`);
    let selected: "all" | [string, ...string[]];
    if (row.rules === "all") selected = "all";
    else {
      const ids = array(row.rules, `validationGates[${i}].rules`, true).map((id, n) => text(id, `validationGates[${i}].rules[${n}]`));
      unique(ids, `validationGates[${i}].rules`);
      selected = ids as [string, ...string[]];
    }
    return { source, rules: selected };
  });
  const gateSources = gateRows.map(gate => gate.source);
  unique(gateSources, "validationGates.source");
  if (gateSources.length !== sources.length || sources.some(source => !gateSources.includes(source)))
    fail("validationGates: require exactly one gate for every declared source");
  for (const gate of gateRows)
    if (!sources.includes(gate.source)) fail(`validationGates: undeclared source ${gate.source}`);
  const entityRules = new Map<string, "required" | "optional">();
  const seenRules = new Map<string, ProjectionRule>();
  for (const rule of rules) {
    if (rule.op === "source" && !sources.includes(rule.source)) fail(`rules.${rule.id}: unknown source ${rule.source}`);
    if (rule.op === "entities" || rule.op === "expand") entityRules.set(rule.id, rule.requirement);
    seenRules.set(rule.id, rule);
  }
  for (const rule of rules) if (rule.op === "expand") {
    if (rule.from !== "roots") {
      const previous = seenRules.get(rule.from);
      if (!previous) return fail(`rules.${rule.id}.from: expected roots or an earlier entity-producing rule`);
      if (previous.op !== "entities" && previous.op !== "expand") return fail(`rules.${rule.id}.from: expected roots or an earlier entity-producing rule`);
      if (rules.indexOf(previous) >= rules.indexOf(rule)) fail(`rules.${rule.id}.from: rule must be declared earlier`);
      if (rule.requirement === "required" && (previous.requirement !== "required" || entityRules.get(previous.id) !== "required"))
        fail(`rules.${rule.id}.from: required expansion needs an earlier required entity rule`);
    }
  }
  for (const gate of gateRows) if (gate.rules !== "all")
    for (const id of gate.rules) if (!id.trim()) fail("validationGates.rules: expected existing profile rule names");

  return freeze({
    schemaVersion: root.schemaVersion as ProjectionPolicyInput["schemaVersion"],
    policyId: name(root.policyId, "policyId", slugPattern), revision: text(root.revision, "revision"),
    sources: sources as [string, ...string[]], rules: rules as [ProjectionRule, ...ProjectionRule[]],
    validationGates: gateRows,
  });
}

export function compileProjectionPolicy(json: string): ProjectionOutcome<ProjectionPolicy> {
  try {
    const parsed = parseStrictJson(json);
    const input = compileInput(parsed);
    const identity = freeze({ schemaVersion: input.schemaVersion, policyId: input.policyId, revision: input.revision, sha256: sha256(json) });
    const policy = freeze({ identity }) as ProjectionPolicy;
    issueProjectionPolicy(policy, { raw: json, input });
    return freeze({ ok: true, value: policy });
  } catch (error) {
    if (error instanceof PolicyError)
      return projectionFailure(error.unsupported ? "unsupported-version" : "invalid-policy", error.message);
    if (error instanceof JsonAdmissionError)
      return projectionFailure("invalid-policy", error.message);
    throw error;
  }
}
