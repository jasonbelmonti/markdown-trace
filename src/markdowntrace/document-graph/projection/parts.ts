import { mergeRanges } from "../context/ranges.js";
import { capturedSource } from "../analysis-state.js";
import type { CapturedProjectionInput } from "./capture.js";
import type { ProjectionPart } from "./contracts.js";
import type { ProjectionClaim } from "./requirements.js";

const cmp = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
export function projectParts(captured: CapturedProjectionInput, claims: readonly ProjectionClaim[]): {
  parts: ProjectionPart[]; utf8Bytes: number;
} {
  const parts: ProjectionPart[] = [];
  const ruleOrder = new Map([["roots", -1], ...captured.policy.rules.map((rule, index) => [rule.id, index] as const)]);
  const reasonOrder = (a: ProjectionPart["reasons"][number], b: ProjectionPart["reasons"][number]) => {
    const [ar, as, ae] = JSON.parse(a.obligationId) as string[];
    const [br, bs, be] = JSON.parse(b.obligationId) as string[];
    return (ruleOrder.get(ar) ?? 0) - (ruleOrder.get(br) ?? 0) || cmp(as, bs) || cmp(ae, be) || cmp(a.role, b.role);
  };
  for (const source of captured.sources) {
    const capture = capturedSource(source.analysis);
    if (!capture) throw new Error("Issued analysis has no captured source.");
    const relevant = claims.filter(claim => claim.source === source.alias);
    for (const merged of mergeRanges(relevant)) {
      const reasons: ProjectionPart["reasons"][number][] = [];
      const seen = new Set<string>();
      for (const claim of merged.claims) {
        const reason = { obligationId: claim.obligationId, role: claim.role };
        const key = `${reason.obligationId}\0${reason.role}`;
        if (!seen.has(key)) { seen.add(key); reasons.push(reason); }
      }
      parts.push({ source: source.alias, range: merged.range,
        text: capture.text.slice(merged.range.start.offset, merged.range.end.offset), reasons: reasons.sort(reasonOrder) });
    }
  }
  parts.sort((a, b) => cmp(a.source, b.source) || a.range.start.offset - b.range.start.offset || a.range.end.offset - b.range.end.offset);
  return { parts, utf8Bytes: parts.reduce((sum, part) => sum + Buffer.byteLength(part.text), 0) };
}
