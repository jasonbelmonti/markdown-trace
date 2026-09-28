import type { CapturedProjectionInput } from "./capture.js";
import type { Obligation, ProjectionDiagnostic, ProjectionPart } from "./contracts.js";
import type { Candidate, ProjectionClaim, Requirements } from "./requirements.js";
import { projectParts } from "./parts.js";

export interface Admission {
  readonly obligations: readonly Obligation[];
  readonly parts: readonly ProjectionPart[];
  readonly diagnostics: readonly ProjectionDiagnostic[];
  readonly policyStatus: "satisfied" | "unsatisfied";
  readonly requiredUtf8Bytes: number | null;
  readonly requiredFragments: number | null;
  readonly usedUtf8Bytes: number;
  readonly usedFragments: number;
}
const issue = (code: ProjectionDiagnostic["code"], candidate: Candidate | null, message: string): ProjectionDiagnostic => ({
  code, ruleId: candidate?.obligation.ruleId ?? null, source: candidate?.obligation.source ?? null,
  entity: candidate?.obligation.entity ?? null, range: null, message,
});
const withStatus = (candidate: Candidate, status: Obligation["status"], reasons: readonly Obligation["reasons"][number][]): Obligation =>
  ({ ...candidate.obligation, status, reasons });

export function admitRequirements(captured: CapturedProjectionInput, result: Requirements): Admission {
  const required = result.candidates.filter(candidate => candidate.obligation.requirement === "required");
  const optional = result.candidates.filter(candidate => candidate.obligation.requirement === "optional");
  const complete = result.requiredSetComplete;
  const requiredClaims = required.flatMap(candidate => candidate.claims);
  const requiredUnion = complete ? projectParts(captured, requiredClaims) : null;
  const requiredUtf8Bytes = requiredUnion?.utf8Bytes ?? null;
  const requiredFragments = requiredUnion?.parts.length ?? null;
  const byteShort = requiredUnion !== null && requiredUnion.utf8Bytes > captured.input.budget.maxUtf8Bytes;
  const partShort = requiredUnion !== null && requiredUnion.parts.length > captured.input.budget.maxFragments;
  const diagnostics = [...result.diagnostics];
  if (byteShort) diagnostics.push(issue("byte-budget", null, `Required union needs ${requiredUtf8Bytes} UTF-8 bytes.`));
  if (partShort) diagnostics.push(issue("fragment-budget", null, `Required union needs ${requiredFragments} parts.`));
  if (!result.requiredHealthy || !complete || byteShort || partShort) {
    const obligations = result.candidates.map(candidate => {
      if (candidate.obligation.requirement === "optional") return withStatus(candidate, "omitted", candidate.obligation.reasons);
      const reasons = [...candidate.obligation.reasons];
      if (byteShort) reasons.push("byte-budget");
      if (partShort) reasons.push("fragment-budget");
      if (!reasons.length || (byteShort || partShort)) reasons.push("required-admission-aborted");
      return withStatus(candidate, "omitted", [...new Set(reasons)]);
    });
    return { obligations, parts: [], diagnostics, policyStatus: "unsatisfied",
      requiredUtf8Bytes, requiredFragments, usedUtf8Bytes: 0, usedFragments: 0 };
  }
  const obligations: Obligation[] = required.map(candidate => withStatus(candidate, "admitted", []));
  let claims: ProjectionClaim[] = requiredClaims;
  let projected = requiredUnion!;
  for (const candidate of optional) {
    if (candidate.obligation.reasons.length) {
      obligations.push(withStatus(candidate, "omitted", candidate.obligation.reasons));
      continue;
    }
    const trial = projectParts(captured, [...claims, ...candidate.claims]);
    if (trial.utf8Bytes > captured.input.budget.maxUtf8Bytes) {
      obligations.push(withStatus(candidate, "omitted", ["byte-budget"]));
      diagnostics.push(issue("byte-budget", candidate, `Optional obligation ${candidate.obligation.id} exceeds the byte budget.`));
    } else if (trial.parts.length > captured.input.budget.maxFragments) {
      obligations.push(withStatus(candidate, "omitted", ["fragment-budget"]));
      diagnostics.push(issue("fragment-budget", candidate, `Optional obligation ${candidate.obligation.id} exceeds the fragment budget.`));
    } else {
      claims = [...claims, ...candidate.claims]; projected = trial;
      obligations.push(withStatus(candidate, "admitted", []));
    }
  }
  return { obligations, parts: projected.parts, diagnostics, policyStatus: "satisfied",
    requiredUtf8Bytes, requiredFragments, usedUtf8Bytes: projected.utf8Bytes,
    usedFragments: projected.parts.length };
}
