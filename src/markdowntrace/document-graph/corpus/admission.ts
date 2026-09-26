import type { DocumentAnalysis, Occurrence } from "../contracts/analysis.js";
import type { CorpusBinding, CorpusCapture, CorpusInput, CorpusLimits, CorpusOutcome, CorpusCaptureSummary } from "./contracts.js";
import { analysisState } from "../analysis-state.js";
import { identifierPattern, sha256 } from "../value.js";

const keys = (v: unknown, allowed: readonly string[]): v is Record<string, unknown> => {
  if (!v || typeof v !== "object" || Array.isArray(v) || Object.getPrototypeOf(v) !== Object.prototype) return false;
  return Reflect.ownKeys(v).every(k => typeof k === "string" && allowed.includes(k) && Object.getOwnPropertyDescriptor(v, k)?.enumerable === true && "value" in Object.getOwnPropertyDescriptor(v, k)!);
};
const dense = (v: unknown): v is unknown[] => Array.isArray(v) && Reflect.ownKeys(v).length === v.length + 1 && Reflect.ownKeys(v).filter(k => k !== "length").every((k, i) => k === String(i) && Object.getOwnPropertyDescriptor(v, k)?.enumerable === true && "value" in Object.getOwnPropertyDescriptor(v, k)!);
const safe = (n: unknown, min: number): n is number => Number.isSafeInteger(n) && (n as number) >= min;
const exactMatch = (pattern: RegExp, value: string): boolean => { const m = pattern.exec(value); return !!m && m[0] === value; };
const pinMatches = (capture: CorpusCapture): boolean => {
  const s = capture.analysis.snapshot.source, p = capture.expected.source;
  return capture.expected.analysisId === capture.analysis.snapshot.analysisId && p.documentId === s.documentId && p.sha256 === s.sha256 && p.utf8Bytes === s.utf8Bytes && p.utf16Length === s.utf16Length;
};
const validPin = (p: unknown): boolean => keys(p, ["analysisId", "source"]) && typeof p.analysisId === "string" && p.analysisId.length === 64 && exactMatch(/^[0-9a-f]{64}$/, p.analysisId) && keys(p.source, ["documentId", "sha256", "utf8Bytes", "utf16Length"]) && typeof p.source.documentId === "string" && !!p.source.documentId.trim() && typeof p.source.sha256 === "string" && p.source.sha256.length === 64 && exactMatch(/^[0-9a-f]{64}$/, p.source.sha256) && safe(p.source.utf8Bytes, 0) && safe(p.source.utf16Length, 0);

export interface AdmittedCapture { analysis: DocumentAnalysis; summary: CorpusCaptureSummary }
export interface Admission { captures: AdmittedCapture[]; bindings: CorpusBinding[] }
type Result = { ok: true; value: Admission } | CorpusOutcome<never>;
const bad = (code: "invalid-input" | "stale-capture" | "incompatible-capture" | "corpus-limit", message: string): Result => ({ ok: false, error: { code, message, diagnostics: [] } });

export function admit(input: CorpusInput): Result {
  if (!keys(input, ["captures", "bindings", "limits"]) || !dense(input.captures) || !dense(input.bindings) || !keys(input.limits, ["maxCaptures", "maxBindings", "maxSourceUtf8Bytes"])) return bad("invalid-input", "Expected dense captures and bindings with explicit limits");
  const limits = input.limits as CorpusLimits;
  if (!safe(limits.maxCaptures, 1) || !safe(limits.maxBindings, 0) || !safe(limits.maxSourceUtf8Bytes, 1)) return bad("invalid-input", "Invalid corpus limits");
  if (input.captures.length === 0) return bad("invalid-input", "At least one capture is required");
  // Validate all descriptor shapes and issued handles before applying raw count limits.
  for (const raw of input.captures) {
    if (!keys(raw, ["alias", "analysis", "expected"]) || typeof raw.alias !== "string" || !raw.alias.trim() || !validPin(raw.expected) || !analysisState(raw.analysis as DocumentAnalysis)) return bad("invalid-input", "Capture must contain a nonblank alias, issued analysis and valid pin");
  }
  for (const raw of input.bindings) {
    if (!keys(raw, ["source", "target"]) || !keys(raw.source, ["analysisId", "occurrenceId"]) || !keys(raw.target, ["analysisId", "identifier"]) || typeof raw.source.analysisId !== "string" || raw.source.analysisId.length !== 64 || !exactMatch(/^[0-9a-f]{64}$/, raw.source.analysisId) || typeof raw.source.occurrenceId !== "string" || !exactMatch(/^O[1-9][0-9]*$/, raw.source.occurrenceId) || typeof raw.target.analysisId !== "string" || raw.target.analysisId.length !== 64 || !exactMatch(/^[0-9a-f]{64}$/, raw.target.analysisId) || typeof raw.target.identifier !== "string" || !exactMatch(identifierPattern, raw.target.identifier)) return bad("invalid-input", "Malformed corpus binding");
  }
  if (input.captures.length > limits.maxCaptures || input.bindings.length > limits.maxBindings) return bad("corpus-limit", "Corpus descriptor or binding limit exceeded");
  const byId = new Map<string, { analysis: DocumentAnalysis; aliases: Set<string> }>(), aliasIds = new Map<string, string>();
  for (const raw of input.captures) {
    if (!keys(raw, ["alias", "analysis", "expected"]) || typeof raw.alias !== "string" || !raw.alias.trim() || !validPin(raw.expected) || !analysisState(raw.analysis as DocumentAnalysis)) return bad("invalid-input", "Capture must contain a nonblank alias, issued analysis and valid pin");
    const c = raw as unknown as CorpusCapture, snap = c.analysis.snapshot;
    if (!pinMatches(c)) return bad("stale-capture", "Capture pin does not match the issued analysis");
    const priorAlias = aliasIds.get(c.alias);
    if (priorAlias && priorAlias !== snap.analysisId) return bad("invalid-input", "Capture alias names different analyses");
    aliasIds.set(c.alias, snap.analysisId);
    const found = byId.get(snap.analysisId);
    if (found) found.aliases.add(c.alias); else byId.set(snap.analysisId, { analysis: c.analysis, aliases: new Set([c.alias]) });
  }
  const unique = [...byId.values()];
  const base = unique[0].analysis.snapshot;
  if (unique.some(x => x.analysis.snapshot.interpretationHash !== base.interpretationHash || x.analysis.snapshot.schemaVersion !== base.schemaVersion || x.analysis.snapshot.analyzerVersion !== base.analyzerVersion || x.analysis.snapshot.parserVersion !== base.parserVersion)) return bad("incompatible-capture", "Captures use incompatible graph interpretations or runtimes");
  const bytes = unique.reduce((n, x) => n + x.analysis.snapshot.source.utf8Bytes, 0);
  if (bytes > limits.maxSourceUtf8Bytes) return bad("corpus-limit", "Corpus source byte limit exceeded");
  const summaries: AdmittedCapture[] = unique.map(({ analysis, aliases }) => ({ analysis, summary: {
    analysisId: analysis.snapshot.analysisId, source: { ...analysis.snapshot.source }, aliases: [...aliases].sort(),
    coverage: analysis.snapshot.coverage, diagnosticCount: analysis.snapshot.diagnostics.length,
  }}));
  const admitted = new Set(byId.keys()), occurrences = new Map<string, Occurrence[]>(), relationshipOccurrences = new Set<string>();
  for (const { analysis } of summaries) {
    const id = analysis.snapshot.analysisId;
    occurrences.set(id, [...analysis.snapshot.occurrences]);
    for (const rel of analysis.snapshot.relationships) relationshipOccurrences.add(`${id}\0${rel.occurrenceId}`);
  }
  const normalized = new Map<string, CorpusBinding>();
  for (const raw of input.bindings) {
    if (!admitted.has(raw.source.analysisId) || !relationshipOccurrences.has(`${raw.source.analysisId}\0${raw.source.occurrenceId}`) || !occurrences.get(raw.source.analysisId)!.some(o => o.id === raw.source.occurrenceId && o.role === "reference")) return bad("invalid-input", "Binding source must be an admitted observed reference occurrence");
    const binding = { source: { analysisId: raw.source.analysisId, occurrenceId: raw.source.occurrenceId }, target: { analysisId: raw.target.analysisId, identifier: raw.target.identifier } };
    normalized.set(`${binding.source.analysisId}\0${binding.source.occurrenceId}\0${binding.target.analysisId}\0${binding.target.identifier}`, binding);
  }
  return { ok: true, value: { captures: summaries, bindings: [...normalized.values()] } };
}
