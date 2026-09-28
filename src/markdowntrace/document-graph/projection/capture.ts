import {
  analyzeDocument, compileValidationProfile, createCorpus, validateGraph,
} from "../index.js";
import type { DocumentAnalysis, DocumentCorpus, GraphValidationReport, TraceProfile } from "../index.js";
import type { ProjectionInput, ProjectionOutcome } from "./contracts.js";
import { projectionPolicyData } from "./policy-state.js";
import { parseStrictJson, projectionFailure } from "./json.js";
import { sha256, freeze } from "../value.js";
import { validateProjectionIdentity } from "./identity.js";

export interface CapturedProjectionSource {
  readonly alias: string;
  readonly profile: TraceProfile;
  readonly analysis: DocumentAnalysis;
  readonly validation: GraphValidationReport;
}
export interface CapturedProjectionInput {
  readonly input: ProjectionInput;
  readonly sources: readonly CapturedProjectionSource[];
  readonly policy: NonNullable<ReturnType<typeof projectionPolicyData>>["input"];
  readonly corpus: DocumentCorpus;
}

/** Recompile original profiles and recapture every caller-supplied source on each invocation. */
export function captureProjectionInput(value: unknown): ProjectionOutcome<CapturedProjectionInput> {
  const checked = validateProjectionIdentity(value);
  if (!checked.ok) return checked;
  const input = checked.value;
  const policy = projectionPolicyData(input.policy);
  if (!policy) return projectionFailure("invalid-policy", "Projection policy handle is not issued.");
  const expected = new Map(input.expected.sources.map(item => [item.alias, item]));
  const sources: CapturedProjectionSource[] = [];
  const availableKinds = new Set<string>();
  for (const source of [...input.sources].sort((a, b) => a.alias < b.alias ? -1 : a.alias > b.alias ? 1 : 0)) {
    const pin = expected.get(source.alias)!;
    let profileData: unknown;
    try { profileData = parseStrictJson(source.validationProfileJson); }
    catch (error) { return projectionFailure("invalid-input", `Validation profile for ${source.alias} is not strict JSON: ${error instanceof Error ? error.message : "invalid JSON"}`); }
    const compiled = compileValidationProfile(source.validationProfileJson);
    if (!compiled.ok) return projectionFailure("invalid-input", `Validation profile for ${source.alias} is invalid: ${compiled.error.message}`);
    const profile = compiled.value;
    if (sha256(source.validationProfileJson) !== pin.profileFileSha256 ||
        profile.interpretationHash !== pin.interpretationHash || profile.validationHash !== pin.validationHash)
      return projectionFailure("stale-input", `Validation profile identity changed for ${source.alias}.`);
    const analyzed = analyzeDocument(
      { documentId: source.documentId, text: source.text }, profile, input.limits.analysis,
    );
    if (!analyzed.ok) {
      const code = (analyzed.error as { code?: string }).code;
      return projectionFailure(code === "resource-limit" || code === "analysis-limit" ? "resource-limit" : "invalid-input", `Analysis failed for ${source.alias}: ${analyzed.error.message}`);
    }
    const analysis = analyzed.value;
    if (analysis.snapshot.analysisId !== pin.pin.analysisId ||
        analysis.snapshot.source.documentId !== pin.pin.source.documentId ||
        analysis.snapshot.source.sha256 !== pin.pin.source.sha256 ||
        analysis.snapshot.source.utf8Bytes !== pin.pin.source.utf8Bytes ||
        analysis.snapshot.source.utf16Length !== pin.pin.source.utf16Length)
      return projectionFailure("stale-input", `Source capture identity changed for ${source.alias}.`);
    const validation = validateGraph(analysis, profile);
    if (!validation.ok) return projectionFailure("invalid-input", `Validation could not run for ${source.alias}: ${validation.error.message}`);
    for (const gate of policy.input.validationGates.filter(item => item.source === source.alias)) {
      if (gate.rules !== "all") {
        if (gate.rules.some(id => !validation.value.rules.some(row => row.id === id)))
          return projectionFailure("invalid-input", `A selected validation rule is absent for ${source.alias}.`);
      }
    }
    const kindNames = (profileData as { interpretation?: { entityKinds?: readonly { name: string }[] } })?.interpretation?.entityKinds?.map(kind => kind.name) ?? [];
    kindNames.forEach(kind => availableKinds.add(kind));
    sources.push(freeze({ alias: source.alias, profile, analysis, validation: validation.value }));
  }
  if (policy.input.rules.some(rule => rule.op === "expand" && rule.subjectKinds.some(kind => !availableKinds.has(kind))))
    return projectionFailure("invalid-policy", "An expansion rule names a kind absent from supplied profiles.");
  const corpus = createCorpus({
    captures: sources.map(source => ({
      alias: source.alias, analysis: source.analysis,
      expected: expected.get(source.alias)!.pin,
    })),
    bindings: input.bindings,
    limits: input.limits.corpus,
  });
  if (!corpus.ok) {
    const code = corpus.error.code === "corpus-limit" ? "resource-limit" :
      corpus.error.code === "stale-capture" ? "stale-input" : "invalid-input";
    return projectionFailure(code, `Pinned captures could not form a corpus: ${corpus.error.message}`);
  }
  // Corpus admission above must see the raw binding count. Canonical packet data
  // then uses the same duplicate semantics as the admitted corpus snapshot.
  const bindings = [...new Map(input.bindings.map(binding => [
    `${binding.source.analysisId}\0${binding.source.occurrenceId}\0${binding.target.analysisId}\0${binding.target.identifier}`,
    binding,
  ])).values()];
  const normalized: ProjectionInput = {
    ...input,
    bindings,
    expected: { ...input.expected, sources: [...input.expected.sources].sort((a, b) =>
      a.alias < b.alias ? -1 : a.alias > b.alias ? 1 : 0) },
  };
  return freeze({ ok: true, value: freeze({ input: normalized, sources, policy: policy.input, corpus: corpus.value }) });
}
