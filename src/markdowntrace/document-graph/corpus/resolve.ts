import type { DocumentAnalysis, IdentifierRecord, Occurrence, Relationship } from "../contracts/analysis.js";
import type { CorpusBinding, CorpusCaptureSummary, CorpusReference, CorpusUnresolvedReason, QualifiedEntity } from "./contracts.js";
import { compareEntity, cmp } from "./order.js";

const key = (analysisId: string, identifier: string) => `${analysisId}\0${identifier}`;
const occurrenceKey = (analysisId: string, occurrenceId: string) => `${analysisId}\0${occurrenceId}`;
const structuralSource = (rel: Relationship, analysis: DocumentAnalysis): QualifiedEntity | null => rel.source.status === "owned"
  ? { analysisId: analysis.snapshot.analysisId, identifier: rel.source.identifier } : null;
const usableOwner = (rel: Relationship, records: ReadonlyMap<string, IdentifierRecord>): boolean => {
  if (rel.source.status !== "owned") return false;
  const record = records.get(rel.source.identifier);
  return !!record?.entityKind && record.definition.status === "resolved" && record.definition.occurrenceId === rel.source.declarationId;
};

export function resolveReferences(analyses: ReadonlyMap<string, DocumentAnalysis>, captures: ReadonlyMap<string, CorpusCaptureSummary>, records: ReadonlyMap<string, ReadonlyMap<string, IdentifierRecord>>, bindings: readonly CorpusBinding[]): CorpusReference[] {
  const bindingsByOccurrence = new Map<string, QualifiedEntity[]>();
  for (const b of bindings) {
    const k = occurrenceKey(b.source.analysisId, b.source.occurrenceId), list = bindingsByOccurrence.get(k) ?? [];
    list.push(b.target); bindingsByOccurrence.set(k, list);
  }
  const results: CorpusReference[] = [];
  for (const [analysisId, analysis] of analyses) {
    const snap = analysis.snapshot, recordMap = records.get(analysisId)!;
    const occurrences = new Map(snap.occurrences.map(o => [o.id, o]));
    for (const relationship of snap.relationships) {
      const occurrence = occurrences.get(relationship.occurrenceId);
      if (!occurrence) continue;
      const evidence = { analysisId, occurrenceId: occurrence.id }, explicit = bindingsByOccurrence.get(occurrenceKey(analysisId, occurrence.id)) ?? [];
      const distinct = new Map(explicit.map(t => [key(t.analysisId, t.identifier), t]));
      const binding = explicit.length > 0;
      const targets = binding ? [...distinct.values()] : [{ analysisId, identifier: relationship.target }];
      targets.sort((a,b) => compareEntity(a,b,captures));
      const source = structuralSource(relationship, analysis);
      const ownerUsable = usableOwner(relationship, recordMap);
      let reason: CorpusUnresolvedReason | undefined;
      if (distinct.size > 1) reason = "conflicting-bindings";
      else if (binding && ["resolved", "duplicate"].includes(recordMap.get(relationship.target)?.definition.status ?? "")) reason = "local-target-not-missing";
      else if (binding && targets[0].identifier !== relationship.target) reason = "target-id-mismatch";
      else if (!ownerUsable) reason = "unusable-owner";
      else if (!captures.has(targets[0].analysisId)) reason = "missing-capture";
      else {
        const targetRecord = records.get(targets[0].analysisId)?.get(targets[0].identifier);
        if (!targetRecord || targetRecord.definition.status === "missing") reason = "missing-definition";
        else if (targetRecord.definition.status === "duplicate") reason = "duplicate-definition";
        else if (!targetRecord.entityKind) reason = "unknown-kind";
      }
      results.push({ evidence, relationship, occurrence, source, targets, binding,
        resolution: reason ? { status: "unresolved", reason } : { status: "resolved", target: targets[0] } });
    }
  }
  const captureById = captures;
  results.sort((a,b) => {
    const ac = captureById.get(a.evidence.analysisId)!, bc = captureById.get(b.evidence.analysisId)!;
    return cmp(ac.source.documentId,bc.source.documentId) || cmp(ac.source.sha256,bc.source.sha256) || cmp(ac.analysisId,bc.analysisId) ||
      a.occurrence.range.start.offset-b.occurrence.range.start.offset || a.occurrence.range.end.offset-b.occurrence.range.end.offset ||
      cmp(a.relationship.kind,b.relationship.kind) || cmp(a.relationship.id,b.relationship.id);
  });
  return results;
}
