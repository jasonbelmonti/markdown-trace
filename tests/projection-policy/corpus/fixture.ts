import { readFileSync } from "node:fs";
import { analyzeDocument, compileValidationProfile } from "../../../src/markdowntrace/document-graph/index.js";
import { compileProjectionPolicy } from "../../../src/markdowntrace/document-graph/projection/index.js";
import type { ProjectionInput, ProjectionPolicyInput } from "../../../src/markdowntrace/document-graph/projection/contracts.js";
import { sha256 } from "../../../src/markdowntrace/document-graph/value.js";

const dir = "tests/projection-policy/corpus/";
export const planText = readFileSync(`${dir}plan.md`, "utf8");
export const taskAText = readFileSync(`${dir}task-a.md`, "utf8");
export const taskBText = readFileSync(`${dir}task-b.md`, "utf8");

const interpretation = {
  language: "markdown-trace.identity.draft2",
  entityKinds: [
    { name: "work", prefixes: ["WP"] },
    { name: "criterion", prefixes: ["REQ"] },
    { name: "constraint", prefixes: ["CON"] },
  ],
};
const declarations = (id: string, kind: string, section: string) => ({
  id, op: "declarations", kinds: [kind], select: { target: "node", nodeType: "heading", section },
  minSelections: 1, min: 1, max: 1, matchText: false, exclusive: true,
});
const references = (id: string, relation: string, section: string) => ({
  id, op: "references", relation, select: { target: "node", nodeType: "paragraph", section },
  minSelections: 1, min: 1, max: 1, matchText: false, exclusive: true,
});
const profile = (profileId: string, minEntities: number, rules: unknown[]) => JSON.stringify({
  schemaVersion: "markdown-trace.validation-profile.experimental.v1", profileId, interpretation,
  validation: {
    minEntities,
    allowedRelations: [
      { kind: "implements", from: ["work"], to: ["criterion"] },
      { kind: "requires", from: ["criterion"], to: ["constraint"] },
    ],
    rules,
  },
});
export const planProfile = profile("corpus-plan", 1, [
  declarations("plan-work", "work", "Plan action"),
  references("plan-reference", "implements", "Plan action"),
]);
export const taskAProfile = profile("corpus-task-a", 2, [
  declarations("a-criterion", "criterion", "Criterion A"),
  declarations("a-constraint", "constraint", "Constraint A"),
  references("a-requires", "requires", "Criterion A"),
]);
export const taskBProfile = profile("corpus-task-b", 1, [
  declarations("b-criterion", "criterion", "Criterion B"),
]);

export const corpusPolicy: ProjectionPolicyInput = {
  schemaVersion: "markdown-trace.projection-policy.v1", policyId: "corpus-assignment", revision: "1",
  sources: ["task-b", "plan", "task-a"],
  validationGates: [
    { source: "plan", rules: ["plan-work", "plan-reference"] },
    { source: "task-a", rules: "all" },
    { source: "task-b", rules: ["b-criterion"] },
  ],
  rules: [
    { id: "scope", op: "source", requirement: "required", source: "task-a", select: { kind: "section", path: ["Task A", "Scope"] } },
    { id: "authority", op: "source", requirement: "required", source: "task-a", select: { kind: "section", path: ["Task A", "Authority"] } },
    { id: "constraints", op: "source", requirement: "required", source: "task-a", select: { kind: "section", path: ["Task A", "Constraints"] } },
    { id: "review", op: "source", requirement: "required", source: "task-a", select: { kind: "section", path: ["Task A", "Review Boundary"] } },
    { id: "acceptance", op: "expand", requirement: "required", from: "roots", mode: "step", direction: "outgoing",
      relations: ["implements"], subjectKinds: ["work"], minSubjects: 1, minNeighbors: 1, maxDepth: 1, maxNodes: 8 },
    { id: "dependencies", op: "expand", requirement: "required", from: "acceptance", mode: "closure", direction: "outgoing",
      relations: ["requires"], subjectKinds: ["criterion"], minSubjects: 1, minNeighbors: 1, maxDepth: 4, maxNodes: 8 },
  ],
};
export const corpusPolicyJson = JSON.stringify(corpusPolicy);

type CorpusSource = ProjectionInput["sources"][number];
export function corpusInput(overrides: Partial<Record<"plan" | "task-a" | "task-b", string>> = {}): ProjectionInput {
  const compiledPolicy = compileProjectionPolicy(corpusPolicyJson);
  if (!compiledPolicy.ok) throw new Error(compiledPolicy.error.message);
  const texts = { plan: overrides.plan ?? planText, "task-a": overrides["task-a"] ?? taskAText, "task-b": overrides["task-b"] ?? taskBText };
  const profiles = { plan: planProfile, "task-a": taskAProfile, "task-b": taskBProfile };
  const sourceRows = (["plan", "task-a", "task-b"] as const).map(alias => ({
    alias, revision: "r1", documentId: `${alias}.md`, text: texts[alias], validationProfileJson: profiles[alias],
  }));
  const analyzed = sourceRows.map(source => {
    const profile = compileValidationProfile(source.validationProfileJson);
    if (!profile.ok) throw new Error(profile.error.message);
    const analysis = analyzeDocument({ documentId: source.documentId, text: source.text }, profile.value,
      { maxSourceUtf8Bytes: 10_000, maxOccurrences: 100 });
    if (!analysis.ok) throw new Error(analysis.error.message);
    return { source, profile: profile.value, analysis: analysis.value };
  });
  const plan = analyzed[0], taskA = analyzed[1];
  const binding = { source: { analysisId: plan.analysis.snapshot.analysisId, occurrenceId: "O2" },
    target: { analysisId: taskA.analysis.snapshot.analysisId, identifier: "REQ-1" } };
  const expectedSources = analyzed.map(({ source, profile, analysis }) => ({
    alias: source.alias, revision: source.revision,
    pin: { analysisId: analysis.snapshot.analysisId, source: analysis.snapshot.source },
    profileFileSha256: sha256(source.validationProfileJson),
    interpretationHash: profile.interpretationHash, validationHash: profile.validationHash,
  }));
  return {
    assignmentId: "task-a-assignment", roots: [{ source: "plan", identifier: "WP-1" }],
    sources: [sourceRows[2], sourceRows[0], sourceRows[1]] as [CorpusSource, CorpusSource, CorpusSource],
    bindings: [binding], policy: compiledPolicy.value,
    expected: {
      policy: compiledPolicy.value.identity,
      producer: { packageVersion: "0.1.1", analyzerVersion: "0.1.0-experimental.3", parserVersion: "3.6.0", algorithmVersion: "markdown-trace.projection-algorithm.v1" },
      sources: [expectedSources[1], expectedSources[2], expectedSources[0]],
    },
    budget: { maxUtf8Bytes: 10_000, maxFragments: 100 },
    limits: { analysis: { maxSourceUtf8Bytes: 10_000, maxOccurrences: 100 },
      corpus: { maxCaptures: 3, maxBindings: 3, maxSourceUtf8Bytes: 30_000 },
      maxRuleEntityVisits: 100, maxPacketUtf8Bytes: 200_000 },
  };
}
