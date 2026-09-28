import { describe, expect, it } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { analyzeDocument, compileValidationProfile } from "../src/markdowntrace/document-graph/index.js";
import { compileProjectionPolicy, produceProjection, verifyProjection } from "../src/markdowntrace/document-graph/projection/index.js";
import type { EdgeEvidence, ProjectionInput, ProjectionPacket, ProjectionPolicyInput } from "../src/markdowntrace/document-graph/projection/contracts.js";
import { sha256 } from "../src/markdowntrace/document-graph/value.js";
import { corpusInput, corpusPolicy, corpusPolicyJson, planText, taskAText, taskBText } from "./projection-policy/corpus/fixture.js";
import { corpusOracle } from "./projection-policy/corpus/oracle.js";

const produced = (input: ProjectionInput): ProjectionPacket => {
  const result = produceProjection(input);
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};
const verification = (input: ProjectionInput, packet: unknown) => {
  const result = verifyProjection(input, packet);
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};
const restored = (packet: ProjectionPacket): ProjectionPacket => JSON.parse(JSON.stringify(packet)) as ProjectionPacket;
const sourceText = (packet: ProjectionPacket, alias: string) => packet.parts.filter(part => part.source === alias).map(part => part.text).join("\n");
const original = { plan: planText, "task-a": taskAText };
const expectedRange = (source: string, text: string) => {
  const start = source.indexOf(text);
  if (start < 0 || source.indexOf(text, start + 1) >= 0) throw new Error("Oracle excerpt is not unique in its original source.");
  return [start, start + text.length];
};

describe("qualified corpus projection", () => {
  it("normalizes source and expectation permutations, selects A and preserves the plan's local failure", () => {
    const input = corpusInput();
    const packet = produced(input);
    expect(packet.policyStatus).toBe("satisfied");
    expect(packet.requiredSetComplete).toBe(true);
    expect(packet.identity.sources.map(source => source.alias)).toEqual(["plan", "task-a", "task-b"]);
    expect(packet.validation.find(row => row.source === "plan")?.report.status).toBe("fail");
    expect(packet.validation.find(row => row.source === "plan")?.report.diagnostics).toContainEqual(expect.objectContaining({
      ruleId: "builtin.integrity", code: "trace-validation.identity-invalid", identifier: "REQ-1",
    }));
    expect(packet.obligations.filter(item => item.requirement === "required").map(item => item.id)).toEqual(corpusOracle.obligationIds);
    expect(packet.parts.map(part => ({ source: part.source, text: part.text,
      offsets: [part.range.start.offset, part.range.end.offset] }))).toEqual(corpusOracle.parts.map(part => ({
      ...part, offsets: expectedRange(original[part.source], part.text),
    })));
    expect(packet.parts.map(part => part.reasons.map(reason => [reason.obligationId, reason.role])))
      .toEqual(corpusOracle.reasons);
    expect(sourceText(packet, "task-a")).not.toContain(corpusOracle.excluded);
    expect(packet.parts.some(part => part.source === "task-b")).toBe(false);
    expect(packet.rules.find(rule => rule.ruleId === "acceptance")?.entities).toEqual([{ source: "task-a", identifier: "REQ-1" }]);
    expect(packet.rules.find(rule => rule.ruleId === "dependencies")?.entities).toEqual([{ source: "task-a", identifier: "CON-1" }]);
    expect(verification(input, restored(packet)).status).toBe("pass");
    const permuted: ProjectionInput = { ...input, sources: [...input.sources].reverse() as unknown as ProjectionInput["sources"],
      expected: { ...input.expected, sources: [...input.expected.sources].reverse() } };
    expect(produced(permuted)).toEqual(packet);
    expect(verification(permuted, restored(packet)).status).toBe("pass");
    expect(planText).toContain("Implements [Task A criterion]");
    expect(taskAText).toContain("Task A constraint is mandatory.");
    expect(taskBText).toContain("colliding criterion");
  });

  it("deduplicates identical bindings after raw admission and retains conflicting intent", () => {
    const input = corpusInput();
    const original = produced(input);
    const repeated: ProjectionInput = { ...input, bindings: [input.bindings[0], input.bindings[0]] };
    expect(produced(repeated)).toEqual(original);
    expect(produced(repeated).request.bindings).toHaveLength(1);
    expect(verification(repeated, restored(original)).status).toBe("pass");
    const rawLimited: ProjectionInput = { ...repeated, limits: { ...repeated.limits,
      corpus: { ...repeated.limits.corpus, maxBindings: 1 } } };
    expect(produceProjection(rawLimited)).toMatchObject({ ok: false, error: { code: "resource-limit" } });
    const taskB = input.expected.sources.find(row => row.alias === "task-b")!;
    const conflicting: ProjectionInput = { ...input, bindings: [input.bindings[0], {
      source: input.bindings[0].source, target: { analysisId: taskB.pin.analysisId, identifier: "REQ-1" },
    }] };
    const rejected = produced(conflicting);
    expect(rejected.policyStatus).toBe("unsatisfied");
    expect(rejected.parts).toEqual([]);
    expect(rejected.diagnostics.some(item => item.code === "unresolved-edge")).toBe(true);
  });

  it("rejects source-coverage and binding defects, then passes the restored original", () => {
    const originalInput = corpusInput(), original = produced(originalInput);
    const defects = [
      { text: taskAText.replace("[Criterion A](ctx://trace/entity/REQ-1?role=definition)", "Criterion A"), code: "validation-gate" },
      { text: taskAText.replace("## Scope\n\nOnly Task A is assigned.\n\n", ""), code: "missing-selector" },
      { text: taskAText.replace("## Scope\n\nOnly Task A is assigned.\n\n", "## Scope\n\nOnly Task A is assigned.\n\n## Scope\n\nRepeated heading.\n\n"), code: "ambiguous-selector" },
      { text: taskAText.replace("Requires [Task A constraint](ctx://trace/entity/CON-1?rel=requires).", "No relation is declared."), code: "min-neighbors" },
    ];
    for (const defect of defects) {
      const repinned = corpusInput({ "task-a": defect.text });
      // A changed capture also needs the plan's explicit binding reissued.
      const result = produced(repinned);
      expect(result.policyStatus).toBe("unsatisfied");
      expect(result.parts).toEqual([]);
      expect(result.diagnostics.some(item => item.code === defect.code)).toBe(true);
    }
    const broken: ProjectionInput = { ...originalInput, bindings: [] };
    const brokenPacket = produced(broken);
    expect(brokenPacket.policyStatus).toBe("unsatisfied");
    expect(brokenPacket.parts).toEqual([]);
    expect(brokenPacket.diagnostics.some(item => item.code === "unresolved-edge" || item.code === "min-neighbors")).toBe(true);
    expect(verification(originalInput, restored(original)).status).toBe("pass");
  });

  it("reports ambiguous entity ownership when a required explicit entity shares its heading", () => {
    const text = taskAText.replace("[Constraint A](ctx://trace/entity/CON-1?role=definition)",
      "[Constraint A](ctx://trace/entity/CON-1?role=definition) [Other](ctx://trace/entity/CON-2?role=definition)");
    const base = corpusInput({ "task-a": text });
    const amended: ProjectionPolicyInput = { ...corpusPolicy, rules: [
      { id: "explicit-constraint", op: "entities", requirement: "required",
        entities: [{ source: "task-a", identifier: "CON-1" }] },
      ...corpusPolicy.rules,
    ] };
    const compiled = compileProjectionPolicy(JSON.stringify(amended));
    if (!compiled.ok) throw new Error(compiled.error.message);
    const input: ProjectionInput = { ...base, policy: compiled.value,
      expected: { ...base.expected, policy: compiled.value.identity } };
    const packet = produced(input);
    expect(packet.policyStatus).toBe("unsatisfied");
    expect(packet.parts).toEqual([]);
    expect(packet.diagnostics.some(item => item.code === "ambiguous-ownership" && item.ruleId === "explicit-constraint")).toBe(true);
  });

  it("treats trusted source, profile, policy, root, binding and runtime edits as stale or failed", () => {
    const input = corpusInput(), packet = produced(input);
    const profileChanged: ProjectionInput = { ...input, sources: input.sources.map(source => source.alias === "task-a"
      ? { ...source, validationProfileJson: `${source.validationProfileJson} ` } : source) as unknown as ProjectionInput["sources"] };
    const mutations: ProjectionInput[] = [
      { ...input, sources: input.sources.map(source => source.alias === "task-a" ? { ...source, text: `${source.text} ` } : source) as unknown as ProjectionInput["sources"] },
      profileChanged,
      { ...input, expected: { ...input.expected, sources: input.expected.sources.map(source => source.alias === "task-a"
        ? { ...source, revision: "r2" } : source) } },
      { ...input, expected: { ...input.expected, producer: { ...input.expected.producer, analyzerVersion: "changed" } } },
      { ...input, roots: [{ source: "task-b", identifier: "REQ-1" }] },
      { ...input, bindings: [] },
    ];
    for (const changed of mutations) expect(verification(changed, restored(packet)).status).not.toBe("pass");
    const altered = restored(packet);
    (altered.request.bindings as unknown[]).length = 0;
    expect(verification(input, altered).status).toBe("fail");
    const changedPolicy: ProjectionPolicyInput = { ...corpusPolicy,
      rules: [{ ...corpusPolicy.rules[0], requirement: "optional" }, ...corpusPolicy.rules.slice(1)] as ProjectionPolicyInput["rules"] };
    const compiled = compileProjectionPolicy(JSON.stringify(changedPolicy));
    if (!compiled.ok) throw new Error(compiled.error.message);
    const policyInput = { ...input, policy: compiled.value, expected: { ...input.expected, policy: compiled.value.identity } };
    expect(verification(policyInput, restored(packet)).status).not.toBe("pass");
    expect(sha256(corpusPolicyJson)).toBe(input.expected.policy.sha256);
  });
});

const decl = (id: string) => `[${id}](ctx://trace/entity/${id}?role=definition)`;
const ref = (id: string) => `[${id}](ctx://trace/entity/${id}?rel=requires)`;
const microProfileJson = JSON.stringify({
  schemaVersion: "markdown-trace.validation-profile.experimental.v1", profileId: "incidence-cases",
  interpretation: { language: "markdown-trace.identity.draft2", entityKinds: [{ name: "requirement", prefixes: ["REQ"] }] },
  validation: { minEntities: 1, allowedRelations: [{ kind: "requires", from: ["requirement"], to: ["requirement"] }],
    rules: [{ id: "count", op: "entity-count", kinds: ["requirement"], min: 1, max: null }] },
});
function microInput(text: string, root: string, direction: "incoming" | "outgoing" | "both", mode: "step" | "closure", maxDepth: number): ProjectionInput {
  const policy: ProjectionPolicyInput = { schemaVersion: "markdown-trace.projection-policy.v1", policyId: "incidence", revision: "1",
    sources: ["micro"], validationGates: [{ source: "micro", rules: ["count"] }],
    rules: [{ id: "edges", op: "expand", requirement: "required", from: "roots", direction, mode,
      relations: ["requires"], subjectKinds: ["requirement"], minSubjects: 0, minNeighbors: 0,
      maxDepth, maxNodes: 10 }] };
  const compiledPolicy = compileProjectionPolicy(JSON.stringify(policy));
  const profile = compileValidationProfile(microProfileJson);
  if (!compiledPolicy.ok || !profile.ok) throw new Error("micro policy/profile did not compile");
  const analysis = analyzeDocument({ documentId: "micro.md", text }, profile.value,
    { maxSourceUtf8Bytes: 10_000, maxOccurrences: 100 });
  if (!analysis.ok) throw new Error(analysis.error.message);
  return {
    assignmentId: "incidence", roots: [{ source: "micro", identifier: root }],
    sources: [{ alias: "micro", revision: "1", documentId: "micro.md", text, validationProfileJson: microProfileJson }],
    bindings: [], policy: compiledPolicy.value,
    expected: { policy: compiledPolicy.value.identity,
      producer: { packageVersion: "0.1.1", analyzerVersion: "0.1.0-experimental.3", parserVersion: "3.6.0", algorithmVersion: "markdown-trace.projection-algorithm.v1" },
      sources: [{ alias: "micro", revision: "1", pin: { analysisId: analysis.value.snapshot.analysisId, source: analysis.value.snapshot.source },
        profileFileSha256: sha256(microProfileJson), interpretationHash: profile.value.interpretationHash,
        validationHash: profile.value.validationHash }] },
    budget: { maxUtf8Bytes: 10_000, maxFragments: 100 },
    limits: { analysis: { maxSourceUtf8Bytes: 10_000, maxOccurrences: 100 },
      corpus: { maxCaptures: 1, maxBindings: 0, maxSourceUtf8Bytes: 10_000 },
      maxRuleEntityVisits: 100, maxPacketUtf8Bytes: 200_000 },
  };
}
function edge(input: ProjectionInput, occurrenceId: string, relationshipId: string,
  from: string, to: string | null, depth: number): EdgeEvidence {
  const profile = compileValidationProfile(microProfileJson);
  if (!profile.ok) throw new Error(profile.error.message);
  const analysis = analyzeDocument({ documentId: "micro.md", text: input.sources[0].text }, profile.value, input.limits.analysis);
  if (!analysis.ok) throw new Error(analysis.error.message);
  const relationship = analysis.value.snapshot.relationships.find(row => row.id === relationshipId);
  expect(relationship?.occurrenceId).toBe(occurrenceId);
  expect(analysis.value.snapshot.occurrences.find(row => row.id === occurrenceId)?.role).toBe("reference");
  return { from: { source: "micro", identifier: from }, to: to === null ? null : { source: "micro", identifier: to },
    occurrence: { analysisId: analysis.value.snapshot.analysisId, occurrenceId }, relationshipId,
    relation: "requires", depth };
}

describe("seven independently authored incidence oracles", () => {
  const A = "REQ-1", B = "REQ-2", C = "REQ-3";
  const one = `# ${decl(A)}\n\n${ref(B)}\n\n# ${decl(B)}\n`;
  const cases = [
    { name: "incoming", text: one, root: B, direction: "incoming", mode: "step", maxDepth: 1,
      expected: [["O2", "R1", B, A, 1]] },
    { name: "both", text: one, root: A, direction: "both", mode: "closure", maxDepth: 3,
      expected: [["O2", "R1", A, B, 1], ["O2", "R1", B, A, 2]] },
    { name: "repeated", text: `# ${decl(A)}\n\n${ref(B)} ${ref(B)}\n\n# ${decl(B)}\n`, root: A,
      direction: "outgoing", mode: "step", maxDepth: 1,
      expected: [["O2", "R1", A, B, 1], ["O3", "R2", A, B, 1]] },
    { name: "cycle", text: `# ${decl(A)}\n\n${ref(B)}\n\n# ${decl(B)}\n\n${ref(A)}\n`, root: A,
      direction: "outgoing", mode: "closure", maxDepth: 3,
      expected: [["O2", "R1", A, B, 1], ["O4", "R2", B, A, 2]] },
    { name: "self loop", text: `# ${decl(A)}\n\n${ref(A)}\n`, root: A,
      direction: "both", mode: "closure", maxDepth: 3,
      expected: [["O2", "R1", A, A, 1]] },
    { name: "unresolved incoming owner", text: `# ${decl(A)} ${decl(C)}\n\n${ref(B)}\n\n# ${decl(B)}\n`, root: B,
      direction: "incoming", mode: "step", maxDepth: 1,
      expected: [["O3", "R1", B, null, 1]] },
    { name: "depth boundary", text: `# ${decl(A)}\n\n${ref(B)}\n\n# ${decl(B)}\n\n${ref(C)}\n\n# ${decl(C)}\n`, root: A,
      direction: "outgoing", mode: "closure", maxDepth: 1,
      expected: [["O2", "R1", A, B, 1], ["O4", "R2", B, C, 2]] },
  ] as const;
  for (const item of cases) it(item.name, () => {
    const input = microInput(item.text, item.root, item.direction, item.mode, item.maxDepth);
    const packet = produced(input);
    const expected = item.expected.map(([occurrenceId, relationshipId, from, to, depth]) =>
      edge(input, occurrenceId, relationshipId, from, to, depth));
    expect(packet.rules.find(rule => rule.ruleId === "edges")?.evidence).toEqual(expected);
    if (item.name === "unresolved incoming owner" || item.name === "depth boundary") {
      expect(packet.policyStatus).toBe("unsatisfied");
      expect(packet.parts).toEqual([]);
    } else expect(packet.policyStatus).toBe("satisfied");
    const damaged = restored(packet);
    const evidence = damaged.rules.find(rule => rule.ruleId === "edges")!.evidence as EdgeEvidence[];
    evidence[0] = { ...evidence[0], depth: evidence[0].depth + 1 };
    expect(verification(input, damaged).status).toBe("fail");
    const reversed = restored(packet);
    const reversedEvidence = reversed.rules.find(rule => rule.ruleId === "edges")!.evidence as EdgeEvidence[];
    reversedEvidence[0] = { ...reversedEvidence[0], from: { source: "micro", identifier: item.root === A ? B : A } };
    expect(verification(input, reversed).status).toBe("fail");
    const removed = restored(packet);
    (removed.rules.find(rule => rule.ruleId === "edges")!.evidence as EdgeEvidence[]).shift();
    expect(verification(input, removed).status).toBe("fail");
    if (expected.length > 1) {
      const reordered = restored(packet);
      (reordered.rules.find(rule => rule.ruleId === "edges")!.evidence as EdgeEvidence[]).reverse();
      expect(verification(input, reordered).status).toBe("fail");
    }
  });
});

const processPhase = process.env.PROJECTION_CORPUS_PHASE;
const processPacketPath = process.env.PROJECTION_CORPUS_PACKET;
it.skipIf(!processPhase || !processPacketPath)("recaptures and verifies corpus packets in separate processes", () => {
  const input = corpusInput();
  if (processPhase === "produce") {
    const packet = produced(input);
    expect(packet.policyStatus).toBe("satisfied");
    writeFileSync(processPacketPath!, JSON.stringify(packet));
    return;
  }
  const packet = JSON.parse(readFileSync(processPacketPath!, "utf8")) as ProjectionPacket;
  if (processPhase === "verify") {
    expect(verification(input, packet)).toMatchObject({ status: "pass", policyStatus: "satisfied" });
    return;
  }
  if (processPhase === "mutate") {
    const altered = restored(packet);
    (altered.rules.find(rule => rule.ruleId === "acceptance")!.evidence[0] as { depth: number }).depth++;
    expect(verification(input, altered).status).toBe("fail");
    expect(verification(input, packet).status).toBe("pass");
    return;
  }
  throw new Error(`Unknown corpus process phase: ${processPhase}`);
});
