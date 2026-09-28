/** Compile-only contract example. No policy runtime exists at this path. */
import {
  compileProjectionPolicy, produceProjection, verifyProjection,
  type EdgeEvidence, type EntityRef, type ProjectionInput,
  type ProjectionOutcome, type ProjectionPolicyInput,
} from "./contracts.js";

const policy = {
  schemaVersion: "markdown-trace.projection-policy.v1",
  policyId: "task-worker-context",
  revision: "1",
  sources: ["task"],
  validationGates: [{ source: "task", rules: "all" }],
  rules: [
    { id: "scope", op: "source", requirement: "required", source: "task",
      select: { kind: "section", path: ["Task Scope"] } },
    { id: "authority", op: "source", requirement: "required", source: "task",
      select: { kind: "section", path: ["Source Authority"] } },
    { id: "constraints", op: "source", requirement: "required", source: "task",
      select: { kind: "section", path: ["Context / Constraints"] } },
    { id: "review", op: "source", requirement: "required", source: "task",
      select: { kind: "section", path: ["Review Boundary"] } },
    { id: "acceptance", op: "expand", requirement: "required", from: "roots",
      mode: "step", direction: "outgoing", relations: ["implements"],
      subjectKinds: ["work"], minSubjects: 1, minNeighbors: 1,
      maxDepth: 1, maxNodes: 20 },
    { id: "dependencies", op: "expand", requirement: "required", from: "acceptance",
      mode: "closure", direction: "outgoing", relations: ["requires"],
      subjectKinds: ["criterion"], minSubjects: 1, minNeighbors: 1,
      maxDepth: 8, maxNodes: 100 },
    { id: "background", op: "source", requirement: "optional", source: "task",
      select: { kind: "section", path: ["Background"] } },
  ],
} as const satisfies ProjectionPolicyInput;

function value<T>(outcome: ProjectionOutcome<T>): T {
  if (!outcome.ok) throw new Error(outcome.error.message);
  return outcome.value;
}

// The host supplies already trusted exact pins and the original full source/profile.
// It must set expected.policy to the digest of the exact JSON string below before
// calling; this example does not derive expectations from a produced packet.
export function example(trusted: Omit<ProjectionInput, "policy">) {
  const input: ProjectionInput = {
    ...trusted, policy: value(compileProjectionPolicy(JSON.stringify(policy))),
  };
  const packet = value(produceProjection(input));
  const restored: unknown = JSON.parse(JSON.stringify(packet));
  const verification = value(verifyProjection(input, restored));

  // These are expected runtime observations, not proof provided by compilation.
  const insufficientBudget = value(produceProjection({
    ...input, budget: { maxUtf8Bytes: 0, maxFragments: 0 },
  })); // unsatisfied; parts=[]; every discovered required obligation unadmitted.

  // With independently repinned source bytes lacking Review Boundary, production
  // must emit missing-selector/unsatisfied. With the old pins it must reject stale
  // input. Neither case may yield a verified packet, even if graph traversal ends.
  return { packet, verification, insufficientBudget };
}

// The caller supplies separately trusted inputs for a source with its Review
// Boundary section deleted (and deliberately updated source pins). The unchanged
// policy still requires that section; verification must return fail.
export function missingSection(repinnedMissingSource: Omit<ProjectionInput, "policy">) {
  const input: ProjectionInput = {
    ...repinnedMissingSource,
    policy: value(compileProjectionPolicy(JSON.stringify(policy))),
  };
  const packet = value(produceProjection(input));
  return { packet, verification: value(verifyProjection(input, packet)) };
}

// This negative type case guards the intended finite selector/operator surface.
const unsupported: ProjectionPolicyInput = {
  ...policy,
  // @ts-expect-error Natural-language selection is outside the finite contract.
  rules: [{ id: "guess", requirement: "required", op: "infer-from-prose" }],
};
void unsupported;

// Typed micro-oracles for contract section 4.5, not executed runtime tests.
// A/B/C denote REQ-1/REQ-2/REQ-3 in capture "task". o1/o2/o3 and r1/r2/r3
// are illustrative occurrence/relationship labels; implementation fixtures must
// substitute their independently established original IDs and capture pin.
export function evidenceExamples(analysisId: string) {
  const a: EntityRef = { source: "task", identifier: "REQ-1" };
  const b: EntityRef = { source: "task", identifier: "REQ-2" };
  const c: EntityRef = { source: "task", identifier: "REQ-3" };
  const o1 = { analysisId, occurrenceId: "o1" };
  const o2 = { analysisId, occurrenceId: "o2" };
  const o3 = { analysisId, occurrenceId: "o3" };
  // Each expected array is stated explicitly, never derived by graph traversal.
  return {
    incoming: [
      { from: b, to: a, occurrence: o1, relationshipId: "r1", relation: "requires", depth: 1 },
    ],
    both: [
      { from: a, to: b, occurrence: o1, relationshipId: "r1", relation: "requires", depth: 1 },
      { from: b, to: a, occurrence: o1, relationshipId: "r1", relation: "requires", depth: 2 },
    ],
    repeated: [
      { from: a, to: b, occurrence: o1, relationshipId: "r1", relation: "requires", depth: 1 },
      { from: a, to: b, occurrence: o2, relationshipId: "r2", relation: "requires", depth: 1 },
    ],
    cycle: [
      { from: a, to: b, occurrence: o1, relationshipId: "r1", relation: "requires", depth: 1 },
      { from: b, to: a, occurrence: o2, relationshipId: "r2", relation: "requires", depth: 2 },
    ],
    selfLoop: [
      { from: a, to: a, occurrence: o1, relationshipId: "r1", relation: "requires", depth: 1 },
    ],
    unresolvedIncoming: [
      { from: b, to: null, occurrence: o3, relationshipId: "r3", relation: "requires", depth: 1 },
    ],
    depthBoundary: [
      { from: a, to: b, occurrence: o1, relationshipId: "r1", relation: "requires", depth: 1 },
      { from: b, to: c, occurrence: o2, relationshipId: "r2", relation: "requires", depth: 2 },
    ],
  } as const satisfies Readonly<Record<string, readonly EdgeEvidence[]>>;
}
