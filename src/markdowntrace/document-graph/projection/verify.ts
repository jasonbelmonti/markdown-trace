import type { ProjectionDiagnostic, ProjectionInput, ProjectionOutcome, ProjectionPacket, ProjectionVerification } from "./contracts.js";
import { captureProjectionInput } from "./capture.js";
import { decodeProjectionPacket } from "./packet.js";
import { produceFromCapture } from "./produce.js";
import { canonical, freeze } from "../value.js";
import { projectionPolicyData } from "./policy-state.js";
import { compileProjectionPolicy } from "./policy.js";
import { validateProjectionIdentity } from "./identity.js";

const report = (status: ProjectionVerification["status"], policyStatus: ProjectionVerification["policyStatus"],
  diagnostics: readonly ProjectionDiagnostic[]): ProjectionOutcome<ProjectionVerification> => freeze({ ok: true, value: freeze({
    schemaVersion: "markdown-trace.projection-verification.v1", status, policyStatus, diagnostics,
  }) });
const issue = (code: ProjectionDiagnostic["code"], message: string, ruleId: string | null = null,
  source: string | null = null): ProjectionDiagnostic => ({ code, ruleId, source, entity: null, range: null, message });

function firstDifference(expected: unknown, actual: unknown, path = "packet"): string | null {
  if (Object.is(expected, actual)) return null;
  if (Array.isArray(expected) || Array.isArray(actual)) {
    if (!Array.isArray(expected) || !Array.isArray(actual) || expected.length !== actual.length) return path;
    for (let i = 0; i < expected.length; i++) {
      const difference = firstDifference(expected[i], actual[i], `${path}[${i}]`);
      if (difference) return difference;
    }
    return null;
  }
  if (expected && actual && typeof expected === "object" && typeof actual === "object") {
    const e = expected as Record<string, unknown>, a = actual as Record<string, unknown>;
    const ek = Object.keys(e).sort(), ak = Object.keys(a).sort();
    if (ek.length !== ak.length || ek.some((key, i) => key !== ak[i])) return path;
    for (const key of ek) {
      const difference = firstDifference(e[key], a[key], `${path}.${key}`);
      if (difference) return difference;
    }
    return null;
  }
  return path;
}

/** Recompute from original trusted inputs and compare every semantic packet field. */
export function verifyProjection(input: ProjectionInput, packet: unknown): ProjectionOutcome<ProjectionVerification> {
  const validated = validateProjectionIdentity(input);
  if (!validated.ok) {
    if (validated.error.code === "stale-input")
      return report("stale", "not-evaluated", [issue("identity-mismatch", validated.error.message)]);
    return validated;
  }
  const trusted = validated.value;
  const limit = trusted.limits.maxPacketUtf8Bytes;
  const decoded = decodeProjectionPacket(packet, limit);
  if (!decoded.ok) {
    if (decoded.error.code === "resource-limit") return decoded;
    return report("fail", "not-evaluated", [issue("packet-shape", decoded.error.message)]);
  }
  const issued = projectionPolicyData(trusted.policy);
  if (!issued) return { ok: false, error: { code: "invalid-policy", message: "Projection policy handle is not issued.", diagnostics: [] } };
  const recompiled = compileProjectionPolicy(issued.raw);
  if (!recompiled.ok) return recompiled;
  const captured = captureProjectionInput({ ...trusted, policy: recompiled.value });
  if (!captured.ok) {
    if (captured.error.code === "stale-input")
      return report("stale", "not-evaluated", [issue("identity-mismatch", captured.error.message)]);
    return captured;
  }
  if (canonical(decoded.value.identity) !== canonical(captured.value.input.expected))
    return report("stale", "not-evaluated", [issue("identity-mismatch", "Packet identities differ from caller-trusted expectations.")]);
  const recomputed = produceFromCapture(captured.value);
  if (!recomputed.ok) return recomputed;
  const difference = firstDifference(recomputed.value, decoded.value);
  if (difference) {
    const ruleIndex = /^packet\.rules\[(\d+)\]/.exec(difference);
    const obligationIndex = /^packet\.obligations\[(\d+)\]/.exec(difference);
    const partIndex = /^packet\.parts\[(\d+)\]/.exec(difference);
    const ruleId = ruleIndex ? recomputed.value.rules[Number(ruleIndex[1])]?.ruleId ?? null :
      obligationIndex ? recomputed.value.obligations[Number(obligationIndex[1])]?.ruleId ?? null : null;
    const source = obligationIndex ? recomputed.value.obligations[Number(obligationIndex[1])]?.source ?? null :
      partIndex ? recomputed.value.parts[Number(partIndex[1])]?.source ?? null : null;
    return report("fail", recomputed.value.policyStatus, [issue("packet-mismatch", `Packet differs at ${difference}.`, ruleId, source)]);
  }
  if (recomputed.value.policyStatus !== "satisfied")
    return report("fail", "unsatisfied", [issue("packet-mismatch", "Required policy obligations are not satisfied.")]);
  return report("pass", "satisfied", []);
}
