import type { ProjectionOutcome, ProjectionPacket } from "./contracts.js";
import { assertJsonData, JsonAdmissionError, projectionFailure } from "./json.js";

const fields = ["schemaVersion", "identity", "request", "policyStatus", "requiredSetComplete", "validation", "rules", "obligations", "parts", "diagnostics", "budget", "measurements"];
const record = (value: unknown, keys: readonly string[]): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value) &&
  Object.keys(value).sort().join() === [...keys].sort().join();
const text = (value: unknown): value is string => typeof value === "string";
const number = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const entity = (value: unknown): boolean => record(value, ["source", "identifier"]) && text(value.source) && text(value.identifier);
const position = (value: unknown): boolean => record(value, ["offset", "line", "column"]) &&
  number(value.offset) && number(value.line) && number(value.column);
const range = (value: unknown): boolean => record(value, ["start", "end"]) && position(value.start) && position(value.end);
const diagnostic = (value: unknown): boolean => record(value, ["code", "ruleId", "source", "entity", "range", "message"]) &&
  text(value.code) && (value.ruleId === null || text(value.ruleId)) && (value.source === null || text(value.source)) &&
  (value.entity === null || entity(value.entity)) && (value.range === null || range(value.range)) && text(value.message);
const evidence = (value: unknown): boolean => record(value, ["from", "to", "occurrence", "relationshipId", "relation", "depth"]) &&
  entity(value.from) && (value.to === null || entity(value.to)) &&
  record(value.occurrence, ["analysisId", "occurrenceId"]) && text(value.occurrence.analysisId) && text(value.occurrence.occurrenceId) &&
  text(value.relationshipId) && text(value.relation) && number(value.depth);
function identityShape(value: unknown): boolean {
  if (!record(value, ["policy", "producer", "sources"]) || !Array.isArray(value.sources)) return false;
  if (!record(value.policy, ["schemaVersion", "policyId", "revision", "sha256"]) ||
      !Object.values(value.policy).every(text)) return false;
  if (!record(value.producer, ["packageVersion", "analyzerVersion", "parserVersion", "algorithmVersion"]) ||
      !Object.values(value.producer).every(text)) return false;
  return value.sources.every(source => record(source, ["alias", "revision", "pin", "profileFileSha256", "interpretationHash", "validationHash"]) &&
    text(source.alias) && text(source.revision) && text(source.profileFileSha256) && text(source.interpretationHash) && text(source.validationHash) &&
    record(source.pin, ["analysisId", "source"]) && text(source.pin.analysisId) &&
    record(source.pin.source, ["documentId", "sha256", "utf8Bytes", "utf16Length"]) &&
    text(source.pin.source.documentId) && text(source.pin.source.sha256) &&
    number(source.pin.source.utf8Bytes) && number(source.pin.source.utf16Length));
}
function packetShape(data: Record<string, unknown>): boolean {
  if (!identityShape(data.identity) ||
      !record(data.request, ["assignmentId", "roots", "bindings", "budget", "limits"]) ||
      !text(data.request.assignmentId) || !Array.isArray(data.request.roots) || !Array.isArray(data.request.bindings) ||
      !data.request.roots.every(entity) || !data.request.bindings.every(binding =>
        record(binding, ["source", "target"]) && record(binding.source, ["analysisId", "occurrenceId"]) &&
        text(binding.source.analysisId) && text(binding.source.occurrenceId) &&
        record(binding.target, ["analysisId", "identifier"]) && text(binding.target.analysisId) && text(binding.target.identifier)) ||
      !record(data.request.budget, ["maxUtf8Bytes", "maxFragments"]) ||
      !number(data.request.budget.maxUtf8Bytes) || !number(data.request.budget.maxFragments) ||
      !record(data.request.limits, ["analysis", "corpus", "maxRuleEntityVisits", "maxPacketUtf8Bytes"]) ||
      !number(data.request.limits.maxRuleEntityVisits) || !number(data.request.limits.maxPacketUtf8Bytes) ||
      !record(data.budget, ["requiredUtf8Bytes", "requiredFragments", "usedUtf8Bytes", "usedFragments"]) ||
      !(data.budget.requiredUtf8Bytes === null || number(data.budget.requiredUtf8Bytes)) ||
      !(data.budget.requiredFragments === null || number(data.budget.requiredFragments)) ||
      !number(data.budget.usedUtf8Bytes) || !number(data.budget.usedFragments) ||
      !record(data.measurements, ["originalSourceUtf8Bytes", "projectedSourceUtf8Bytes"]) ||
      !number(data.measurements.originalSourceUtf8Bytes) || !number(data.measurements.projectedSourceUtf8Bytes) ||
      typeof data.requiredSetComplete !== "boolean" ||
      (data.policyStatus !== "satisfied" && data.policyStatus !== "unsatisfied")) return false;
  if (!(data.validation as unknown[]).every(row => record(row, ["source", "report"]) && text(row.source) &&
      !!row.report && typeof row.report === "object" && !Array.isArray(row.report))) return false;
  if (!(data.rules as unknown[]).every(rule => record(rule, ["ruleId", "from", "requirement", "status", "entities", "evidence", "frontier", "subjects", "diagnostics"]) &&
      text(rule.ruleId) && (rule.from === null || text(rule.from)) && text(rule.requirement) && text(rule.status) &&
      Array.isArray(rule.entities) && rule.entities.every(entity) && Array.isArray(rule.evidence) && rule.evidence.every(evidence) &&
      Array.isArray(rule.frontier) && rule.frontier.every(entity) && number(rule.subjects) &&
      Array.isArray(rule.diagnostics) && rule.diagnostics.every(diagnostic))) return false;
  if (!(data.obligations as unknown[]).every(item => record(item, ["id", "ruleId", "requirement", "source", "entity", "ranges", "status", "reasons"]) &&
      text(item.id) && text(item.ruleId) && text(item.requirement) && text(item.source) &&
      (item.entity === null || entity(item.entity)) && Array.isArray(item.ranges) && item.ranges.every(range) &&
      text(item.status) && Array.isArray(item.reasons) && item.reasons.every(text))) return false;
  if (!(data.parts as unknown[]).every(part => record(part, ["source", "range", "text", "reasons"]) &&
      text(part.source) && range(part.range) && text(part.text) && Array.isArray(part.reasons) &&
      part.reasons.every(reason => record(reason, ["obligationId", "role"]) && text(reason.obligationId) && text(reason.role)))) return false;
  if (!(data.diagnostics as unknown[]).every(diagnostic)) return false;
  return true;
}
export function decodeProjectionPacket(packet: unknown, maxUtf8Bytes: number): ProjectionOutcome<ProjectionPacket> {
  try {
    assertJsonData(packet);
    const bytes = Buffer.byteLength(JSON.stringify(packet));
    if (bytes > maxUtf8Bytes) return projectionFailure("resource-limit", "Projection packet exceeds maxPacketUtf8Bytes.");
    if (!packet || typeof packet !== "object" || Array.isArray(packet))
      return projectionFailure("invalid-input", "Projection packet must be a JSON object.");
    const data = packet as Record<string, unknown>;
    if (Object.keys(data).sort().join() !== [...fields].sort().join() ||
        data.schemaVersion !== "markdown-trace.projection-packet.v1" ||
        !Array.isArray(data.validation) || !Array.isArray(data.rules) ||
        !Array.isArray(data.obligations) || !Array.isArray(data.parts) || !Array.isArray(data.diagnostics) ||
        !packetShape(data))
      return projectionFailure("invalid-input", "Projection packet shape or version is unsupported.");
    return { ok: true, value: packet as ProjectionPacket };
  } catch (error) {
    if (error instanceof JsonAdmissionError || error instanceof TypeError || error instanceof RangeError)
      return projectionFailure("invalid-input", error.message);
    throw error;
  }
}
