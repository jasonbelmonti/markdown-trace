import type { SourceRange } from "../contracts/source.js";
import { entitySupport } from "../context/support.js";
import type { CapturedProjectionInput } from "./capture.js";
import type { EntityRef, Obligation, ProjectionDiagnostic, ProjectionPart, ProjectionRule, RuleEvaluation } from "./contracts.js";
import { compareEntityRef, expandRule } from "./expand.js";
import { selectSource } from "./source-select.js";
import { projectParts } from "./parts.js";

export interface ProjectionClaim {
  readonly source: string;
  readonly range: SourceRange;
  readonly obligationId: string;
  readonly role: ProjectionPart["reasons"][number]["role"];
}
export interface Candidate {
  readonly obligation: Obligation;
  readonly claims: readonly ProjectionClaim[];
}
export interface Requirements {
  readonly rules: readonly RuleEvaluation[];
  readonly candidates: readonly Candidate[];
  readonly diagnostics: readonly ProjectionDiagnostic[];
  readonly requiredSetComplete: boolean;
  readonly requiredHealthy: boolean;
}
const id = (ruleId: string, source: string, item: string) => JSON.stringify([ruleId, source, item]);
const diagnostic = (code: ProjectionDiagnostic["code"], ruleId: string | null, source: string | null,
  entity: EntityRef | null, message: string): ProjectionDiagnostic => ({ code, ruleId, source, entity, range: null, message });

function entityCandidate(captured: CapturedProjectionInput, ruleId: string, requirement: "required" | "optional", entity: EntityRef): Candidate {
  const source = captured.sources.find(row => row.alias === entity.source);
  const obligationId = id(ruleId, entity.source, entity.identifier);
  const support = source && entitySupport(source.analysis.snapshot, entity.identifier);
  if (!support || support.status === "missing") return {
    obligation: { id: obligationId, ruleId, requirement, source: entity.source, entity, ranges: [], status: "omitted", reasons: ["unresolved-entity"] }, claims: [],
  };
  if (support.status === "ambiguous") return {
    obligation: { id: obligationId, ruleId, requirement, source: entity.source, entity, ranges: [], status: "omitted", reasons: ["ambiguous-ownership"] }, claims: [],
  };
  return {
    obligation: { id: obligationId, ruleId, requirement, source: entity.source, entity,
      ranges: support.claims.map(claim => claim.range), status: "omitted", reasons: [] },
    claims: support.claims.map(claim => ({ source: entity.source, range: claim.range, obligationId, role: claim.role })),
  };
}

function sourceCandidate(captured: CapturedProjectionInput, rule: Extract<ProjectionRule, { op: "source" }>): Candidate {
  const source = captured.sources.find(row => row.alias === rule.source)!;
  const obligationId = id(rule.id, rule.source, rule.select.kind);
  const selected = selectSource(source, rule.select);
  if (!selected.ok) return {
    obligation: { id: obligationId, ruleId: rule.id, requirement: rule.requirement, source: rule.source,
      entity: null, ranges: [], status: "omitted", reasons: [selected.code] }, claims: [],
  };
  return {
    obligation: { id: obligationId, ruleId: rule.id, requirement: rule.requirement, source: rule.source,
      entity: null, ranges: selected.value.ranges.map(item => item.range), status: "omitted", reasons: [] },
    claims: selected.value.ranges.map(item => ({ source: rule.source, range: item.range, obligationId, role: item.role })),
  };
}

function gateDiagnostics(captured: CapturedProjectionInput): ProjectionDiagnostic[] {
  const diagnostics: ProjectionDiagnostic[] = [];
  for (const source of captured.sources) {
    if (source.analysis.snapshot.coverage !== "complete")
      diagnostics.push(diagnostic("partial-analysis", null, source.alias, null, `Analysis coverage for ${source.alias} is partial.`));
    const gate = captured.policy.validationGates.find(row => row.source === source.alias)!;
    const selected = gate.rules === "all" ? source.validation.rules : source.validation.rules.filter(row => gate.rules.includes(row.id));
    if (gate.rules === "all" && source.validation.status !== "pass")
      diagnostics.push(diagnostic("validation-gate", null, source.alias, null, `Validation report for ${source.alias} is ${source.validation.status}.`));
    for (const row of selected) if (row.status !== "pass")
      diagnostics.push(diagnostic("validation-gate", null, source.alias, null, `Validation rule ${row.id} is ${row.status}.`));
  }
  return diagnostics;
}

export function resolveRequirements(captured: CapturedProjectionInput): Requirements {
  const rules: RuleEvaluation[] = [];
  const candidates: Candidate[] = [];
  const diagnostics = gateDiagnostics(captured);
  const visits = { count: 0 };
  const byRule = new Map<string, readonly EntityRef[]>();
  const roots = [...captured.input.roots].sort(compareEntityRef);
  byRule.set("roots", roots);
  const rootCandidates = roots.map(entity => entityCandidate(captured, "roots", "required", entity));
  candidates.push(...rootCandidates);
  const rootDiagnostics = rootCandidates.flatMap(candidate => candidate.obligation.reasons.map(code =>
    diagnostic(code, "roots", candidate.obligation.source, candidate.obligation.entity, `Root ${candidate.obligation.id} is unresolved.`)));
  diagnostics.push(...rootDiagnostics);
  rules.push({ ruleId: "roots", from: null, requirement: "required", status: rootDiagnostics.length ? "unresolved" : "resolved",
    entities: roots, evidence: [], frontier: [], subjects: 0, diagnostics: rootDiagnostics });

  const evaluate = (rule: ProjectionRule): void => {
    if (rule.op === "expand") {
      const evaluated = expandRule(rule, byRule.get(rule.from) ?? [], captured, visits);
      rules.push(evaluated);
      byRule.set(rule.id, evaluated.entities);
      diagnostics.push(...evaluated.diagnostics);
      candidates.push(...evaluated.entities.map(entity => entityCandidate(captured, rule.id, rule.requirement, entity)));
      return;
    }
    const selected = rule.op === "source" ? [sourceCandidate(captured, rule)] :
      rule.entities.map(entity => entityCandidate(captured, rule.id, rule.requirement, entity));
    candidates.push(...selected);
    const issues = selected.flatMap(candidate => candidate.obligation.reasons.map(code =>
      diagnostic(code, rule.id, candidate.obligation.source, candidate.obligation.entity, `Obligation ${candidate.obligation.id} is unresolved.`)));
    diagnostics.push(...issues);
    const entities = rule.op === "entities" ? [...rule.entities] : [];
    byRule.set(rule.id, entities);
    rules.push({ ruleId: rule.id, from: null, requirement: rule.requirement,
      status: issues.length ? "unresolved" : "resolved", entities, evidence: [], frontier: [], subjects: 0, diagnostics: issues });
  };

  for (const rule of captured.policy.rules.filter(rule => rule.requirement === "required")) evaluate(rule);
  const requiredHealthy = !diagnostics.length;
  const requiredSetComplete = !candidates.some(candidate => candidate.obligation.requirement === "required" && candidate.obligation.reasons.length) &&
    !diagnostics.some(item => ["depth-limit", "node-limit", "visit-limit", "unresolved-edge", "partial-analysis"].includes(item.code));
  const requiredUnion = requiredSetComplete ? projectParts(captured, candidates.flatMap(candidate => candidate.claims)) : null;
  const canEvaluateOptional = requiredHealthy && !!requiredUnion &&
    requiredUnion.utf8Bytes <= captured.input.budget.maxUtf8Bytes &&
    requiredUnion.parts.length <= captured.input.budget.maxFragments;
  for (const rule of captured.policy.rules.filter(rule => rule.requirement === "optional")) {
    if (!canEvaluateOptional) {
      const issue = diagnostic("required-admission-aborted", rule.id, null, null, "Required policy evaluation failed.");
      rules.push({ ruleId: rule.id, from: rule.op === "expand" ? rule.from : null, requirement: "optional",
        status: "skipped", entities: [], evidence: [], frontier: [], subjects: 0, diagnostics: [issue] });
    } else evaluate(rule);
  }
  return { rules, candidates, diagnostics, requiredSetComplete, requiredHealthy };
}
