import type { CapturedProjectionInput } from "./capture.js";
import { captureProjectionInput } from "./capture.js";
import type { ProjectionInput, ProjectionOutcome, ProjectionPacket } from "./contracts.js";
import { projectionFailure } from "./json.js";
import { freeze } from "../value.js";
import { resolveRequirements } from "./requirements.js";
import { admitRequirements } from "./admission.js";

const cmp = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
export function produceFromCapture(captured: CapturedProjectionInput): ProjectionOutcome<ProjectionPacket> {
  const required = resolveRequirements(captured);
  const admission = admitRequirements(captured, required);
  const input = captured.input;
  const ruleOrder = new Map([["roots", -1], ...captured.policy.rules.map((rule, index) => [rule.id, index] as const)]);
  const sources = [...input.expected.sources].sort((a, b) => cmp(a.alias, b.alias));
  const bindings = [...input.bindings].sort((a, b) =>
    cmp(a.source.analysisId, b.source.analysisId) || cmp(a.source.occurrenceId, b.source.occurrenceId) ||
    cmp(a.target.analysisId, b.target.analysisId) || cmp(a.target.identifier, b.target.identifier));
  const packet: ProjectionPacket = {
    schemaVersion: "markdown-trace.projection-packet.v1",
    identity: { ...input.expected, sources },
    request: { assignmentId: input.assignmentId, roots: input.roots, bindings, budget: input.budget, limits: input.limits },
    policyStatus: admission.policyStatus,
    requiredSetComplete: required.requiredSetComplete,
    validation: captured.sources.map(source => ({ source: source.alias, report: source.validation })),
    rules: [...required.rules].sort((a, b) => (ruleOrder.get(a.ruleId) ?? 0) - (ruleOrder.get(b.ruleId) ?? 0)),
    obligations: [...admission.obligations].sort((a, b) =>
      (ruleOrder.get(a.ruleId) ?? 0) - (ruleOrder.get(b.ruleId) ?? 0) ||
      cmp(a.source, b.source) || cmp(a.entity?.identifier ?? "", b.entity?.identifier ?? "")),
    parts: admission.parts,
    diagnostics: admission.diagnostics,
    budget: { requiredUtf8Bytes: admission.requiredUtf8Bytes, requiredFragments: admission.requiredFragments,
      usedUtf8Bytes: admission.usedUtf8Bytes, usedFragments: admission.usedFragments },
    measurements: { originalSourceUtf8Bytes: captured.sources.reduce((sum, source) => sum + source.analysis.snapshot.source.utf8Bytes, 0),
      projectedSourceUtf8Bytes: admission.usedUtf8Bytes },
  };
  if (Buffer.byteLength(JSON.stringify(packet)) > input.limits.maxPacketUtf8Bytes)
    return projectionFailure("resource-limit", "Projection packet exceeds maxPacketUtf8Bytes.");
  return freeze({ ok: true, value: freeze(packet) });
}

export function produceProjection(input: ProjectionInput): ProjectionOutcome<ProjectionPacket> {
  const captured = captureProjectionInput(input);
  if (!captured.ok) return captured;
  return produceFromCapture(captured.value);
}
