import type { CorpusReference } from "../corpus/contracts.js";
import type { CapturedProjectionInput } from "./capture.js";
import type { EdgeEvidence, EntityRef, ProjectionDiagnostic, ProjectionRule, RuleEvaluation } from "./contracts.js";

type ExpandRule = Extract<ProjectionRule, { op: "expand" }>;
const cmp = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
export const compareEntityRef = (a: EntityRef, b: EntityRef) => cmp(a.source, b.source) || cmp(a.identifier, b.identifier);
const key = (entity: EntityRef) => `${entity.source}\0${entity.identifier}`;
const same = (a: EntityRef, b: EntityRef) => a.source === b.source && a.identifier === b.identifier;
const diagnostic = (code: ProjectionDiagnostic["code"], ruleId: string, entity: EntityRef | null, message: string): ProjectionDiagnostic =>
  ({ code, ruleId, source: entity?.source ?? null, entity, range: null, message });

interface Incident { readonly reference: CorpusReference; readonly neighbor: EntityRef | null }

function incidentReferences(subject: EntityRef, rule: ExpandRule, captured: CapturedProjectionInput): Incident[] {
  const aliases = new Map(captured.sources.map(source => [source.analysis.snapshot.analysisId, source.alias]));
  const matches: Incident[] = [];
  for (const reference of captured.corpus.snapshot.references) {
    if (!rule.relations.includes(reference.relationship.kind)) continue;
    const from = reference.source && aliases.has(reference.source.analysisId)
      ? { source: aliases.get(reference.source.analysisId)!, identifier: reference.source.identifier } : null;
    const target = reference.resolution.status === "resolved" && aliases.has(reference.resolution.target.analysisId)
      ? { source: aliases.get(reference.resolution.target.analysisId)!, identifier: reference.resolution.target.identifier } : null;
    const possibleTargets = reference.targets.flatMap(item => aliases.has(item.analysisId)
      ? [{ source: aliases.get(item.analysisId)!, identifier: item.identifier }] : []);
    const possibleOwners = reference.relationship.source.status === "ambiguous"
      ? reference.relationship.source.declarationIds.flatMap(id => {
        const source = captured.sources.find(row => row.analysis.snapshot.analysisId === reference.evidence.analysisId);
        const occurrence = source?.analysis.snapshot.occurrences.find(row => row.id === id);
        return occurrence && source ? [{ source: source.alias, identifier: occurrence.identifier }] : [];
      }) : [];
    const outgoing = rule.direction !== "incoming" && (from && same(from, subject) || possibleOwners.some(owner => same(owner, subject)));
    const incoming = rule.direction !== "outgoing" && (target && same(target, subject) || possibleTargets.some(candidate => same(candidate, subject)));
    if (!outgoing && !incoming) continue;
    if (outgoing) matches.push({ reference, neighbor: reference.resolution.status === "resolved" && from && same(from, subject) ? target : null });
    if (incoming && !(outgoing && target && same(target, subject) && from && same(from, subject)))
      matches.push({ reference, neighbor: reference.resolution.status === "resolved" && target && same(target, subject) ? from : null });
  }
  return matches.sort((a, b) =>
    cmp(aliases.get(a.reference.evidence.analysisId) ?? "", aliases.get(b.reference.evidence.analysisId) ?? "") ||
    a.reference.occurrence.range.start.offset - b.reference.occurrence.range.start.offset ||
    a.reference.occurrence.range.end.offset - b.reference.occurrence.range.end.offset ||
    cmp(a.reference.occurrence.id, b.reference.occurrence.id) ||
    cmp(a.reference.relationship.id, b.reference.relationship.id));
}

export function expandRule(rule: ExpandRule, seeds: readonly EntityRef[], captured: CapturedProjectionInput,
  visits: { count: number }): RuleEvaluation {
  const orderedSeeds = [...new Map(seeds.map(seed => [key(seed), seed])).values()].sort(compareEntityRef);
  const queue = orderedSeeds.map(entity => ({ entity, depth: 0 }));
  const known = new Set(orderedSeeds.map(key));
  const output = new Map<string, EntityRef>();
  const evidence: EdgeEvidence[] = [];
  const diagnostics: ProjectionDiagnostic[] = [];
  const frontier: EntityRef[] = [];
  let subjects = 0;
  let cursor = 0;
  if (known.size > rule.maxNodes) diagnostics.push(diagnostic("node-limit", rule.id, null, `Seed count exceeds maxNodes ${rule.maxNodes}.`));
  while (cursor < queue.length) {
    const depth = queue[cursor].depth;
    const level: typeof queue = [];
    while (cursor < queue.length && queue[cursor].depth === depth) level.push(queue[cursor++]);
    level.sort((a, b) => compareEntityRef(a.entity, b.entity));
    for (const { entity, depth: subjectDepth } of level) {
      if (visits.count >= captured.input.limits.maxRuleEntityVisits) {
        diagnostics.push(diagnostic("visit-limit", rule.id, entity, `Visit ceiling ${captured.input.limits.maxRuleEntityVisits} reached.`));
        frontier.push(entity);
        continue;
      }
      visits.count++;
      const source = captured.sources.find(row => row.alias === entity.source);
      const record = source?.analysis.snapshot.identifiers.find(row => row.identifier === entity.identifier);
      if (!record?.entityKind || record.definition.status !== "resolved") {
        diagnostics.push(diagnostic("unresolved-entity", rule.id, entity, "Subject has no unique known-kind definition."));
        continue;
      }
      if (!rule.subjectKinds.includes(record.entityKind)) continue;
      if (rule.mode === "step" && subjectDepth > 0) continue;
      subjects++;
      const neighbors = new Set<string>();
      for (const { reference, neighbor } of incidentReferences(entity, rule, captured)) {
        evidence.push({ from: entity, to: neighbor, occurrence: reference.evidence,
          relationshipId: reference.relationship.id, relation: reference.relationship.kind, depth: subjectDepth + 1 });
        if (!neighbor) {
          diagnostics.push(diagnostic("unresolved-edge", rule.id, entity,
            `Reference ${reference.evidence.analysisId}/${reference.evidence.occurrenceId} is ${reference.resolution.status === "unresolved" ? reference.resolution.reason : "unresolved"}.`));
          continue;
        }
        neighbors.add(key(neighbor));
        if (rule.mode === "step" || subjectDepth < rule.maxDepth) {
          if (!known.has(key(neighbor))) {
            if (known.size >= rule.maxNodes) {
              diagnostics.push(diagnostic("node-limit", rule.id, entity, `Node ceiling ${rule.maxNodes} reached.`));
              frontier.push(neighbor);
            } else {
              known.add(key(neighbor));
              output.set(key(neighbor), neighbor);
              if (rule.mode === "closure") queue.push({ entity: neighbor, depth: subjectDepth + 1 });
            }
          } else output.set(key(neighbor), neighbor);
        } else if (!known.has(key(neighbor))) {
          diagnostics.push(diagnostic("depth-limit", rule.id, entity, `Depth ceiling ${rule.maxDepth} has an unseen neighbor.`));
          frontier.push(neighbor);
        } else output.set(key(neighbor), neighbor);
      }
      if (neighbors.size < rule.minNeighbors)
        diagnostics.push(diagnostic("min-neighbors", rule.id, entity, `Expected ${rule.minNeighbors} distinct neighbors; found ${neighbors.size}.`));
    }
  }
  if (subjects < rule.minSubjects)
    diagnostics.push(diagnostic("min-subjects", rule.id, null, `Expected ${rule.minSubjects} subjects; found ${subjects}.`));
  const uniqueEvidence = new Map<string, EdgeEvidence>();
  for (const item of evidence) uniqueEvidence.set(`${key(item.from)}\0${item.occurrence.analysisId}\0${item.occurrence.occurrenceId}\0${item.relationshipId}`, item);
  const aliases = new Map(captured.sources.map(source => [source.analysis.snapshot.analysisId, source.alias]));
  const original = new Map(captured.corpus.snapshot.references.map(reference =>
    [`${reference.evidence.analysisId}\0${reference.evidence.occurrenceId}\0${reference.relationship.id}`, reference]));
  const orderedEvidence = [...uniqueEvidence.values()].sort((a, b) => a.depth - b.depth || compareEntityRef(a.from, b.from) ||
    cmp(aliases.get(a.occurrence.analysisId) ?? "", aliases.get(b.occurrence.analysisId) ?? "") ||
    (original.get(`${a.occurrence.analysisId}\0${a.occurrence.occurrenceId}\0${a.relationshipId}`)?.occurrence.range.start.offset ?? 0) -
    (original.get(`${b.occurrence.analysisId}\0${b.occurrence.occurrenceId}\0${b.relationshipId}`)?.occurrence.range.start.offset ?? 0) ||
    (original.get(`${a.occurrence.analysisId}\0${a.occurrence.occurrenceId}\0${a.relationshipId}`)?.occurrence.range.end.offset ?? 0) -
    (original.get(`${b.occurrence.analysisId}\0${b.occurrence.occurrenceId}\0${b.relationshipId}`)?.occurrence.range.end.offset ?? 0) ||
    cmp(a.occurrence.occurrenceId, b.occurrence.occurrenceId) || cmp(a.relationshipId, b.relationshipId));
  const limited = diagnostics.some(item => ["depth-limit", "node-limit", "visit-limit"].includes(item.code));
  return {
    ruleId: rule.id, from: rule.from, requirement: rule.requirement,
    status: limited ? "limited" : diagnostics.length ? "unresolved" : "resolved",
    entities: [...output.values()].sort(compareEntityRef), evidence: orderedEvidence,
    frontier: [...new Map(frontier.map(item => [key(item), item])).values()].sort(compareEntityRef),
    subjects, diagnostics,
  };
}
