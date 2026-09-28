import { MARKDOWN_ENGINE_PACKAGE_VERSION, MARKDOWN_TRACE_PACKAGE_VERSION } from "../../generated/release-metadata.js";
import { ANALYZER_VERSION } from "../versions.js";
import type { ProjectionInput, ProjectionOutcome } from "./contracts.js";
import { projectionPolicyData } from "./policy-state.js";
import { assertJsonData, hasLoneSurrogate, projectionFailure } from "./json.js";
import { freeze, sha256 } from "../value.js";

const HASH = /^(?:[a-f0-9]{64})(?![\s\S])/;
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0 && !value.includes("\0") && !hasLoneSurrogate(value);
const aliasPattern = /^(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?![\s\S])/;
const identifierPattern = /^(?:[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?![\s\S])/;
const exactKeys = (value: object, keys: readonly string[]): boolean => {
  const actual = Object.keys(value).sort(), expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, i) => key === expected[i]);
};

/** Reject forged handles, malformed DTOs and stale caller-pinned identities before capture work. */
export function validateProjectionIdentity(value: unknown): ProjectionOutcome<ProjectionInput> {
  try {
    assertJsonData(value);
    if (!value || typeof value !== "object" || Array.isArray(value))
      return projectionFailure("invalid-input", "Expected a projection input object.");
    const input = value as ProjectionInput;
    if (!exactKeys(input, ["assignmentId", "roots", "sources", "bindings", "policy", "expected", "budget", "limits"]))
      return projectionFailure("invalid-input", "Projection input has missing or unknown fields.");
    if (!text(input.assignmentId) || !Array.isArray(input.roots) || input.roots.length === 0 ||
        !Array.isArray(input.sources) || input.sources.length === 0 || !Array.isArray(input.bindings))
      return projectionFailure("invalid-input", "Assignment, roots, sources and bindings are required.");
    const issued = projectionPolicyData(input.policy);
    if (!issued) return projectionFailure("invalid-policy", "Projection policy handle was not issued by this runtime.");
    if (!input.expected || !exactKeys(input.expected, ["policy", "producer", "sources"]) ||
        !input.expected.policy || !input.expected.producer || !Array.isArray(input.expected.sources))
      return projectionFailure("invalid-input", "Expected identity set is malformed.");
    const identity = input.expected.policy;
    if (!exactKeys(identity, ["schemaVersion", "policyId", "revision", "sha256"]) ||
        typeof identity.schemaVersion !== "string" || typeof identity.policyId !== "string" ||
        typeof identity.revision !== "string" || typeof identity.sha256 !== "string")
      return projectionFailure("invalid-input", "Expected policy identity is malformed.");
    if (identity.schemaVersion !== "markdown-trace.projection-policy.v1" ||
        identity.policyId !== issued.input.policyId || identity.revision !== issued.input.revision ||
        identity.sha256 !== sha256(issued.raw) || input.policy.identity.sha256 !== identity.sha256)
      return projectionFailure("stale-input", "Expected policy identity does not match the issued policy bytes.");

    const producer = input.expected.producer;
    if (!exactKeys(producer, ["packageVersion", "analyzerVersion", "parserVersion", "algorithmVersion"]) ||
        Object.values(producer).some(item => typeof item !== "string"))
      return projectionFailure("invalid-input", "Expected producer identity is malformed.");
    if (producer.packageVersion !== MARKDOWN_TRACE_PACKAGE_VERSION || producer.analyzerVersion !== ANALYZER_VERSION ||
        producer.parserVersion !== MARKDOWN_ENGINE_PACKAGE_VERSION || producer.algorithmVersion !== "markdown-trace.projection-algorithm.v1")
      return projectionFailure("stale-input", "Expected producer identity does not match this runtime.");

    const aliases = input.sources.map(source => source.alias);
    const expectedAliases = input.expected.sources.map(source => source.alias);
    if (aliases.some(alias => !text(alias)) || expectedAliases.some(alias => !text(alias)) ||
        new Set(aliases).size !== aliases.length || new Set(expectedAliases).size !== expectedAliases.length ||
        aliases.length !== expectedAliases.length || aliases.some(alias => !expectedAliases.includes(alias)) ||
        aliases.length !== issued.input.sources.length || aliases.some(alias => !issued.input.sources.includes(alias)))
      return projectionFailure("invalid-input", "Source captures, policy aliases and expected aliases must match uniquely.");

    const actual = new Map(input.sources.map(source => [source.alias, source]));
    const pins = new Set<string>();
    for (const expected of input.expected.sources) {
      if (!exactKeys(expected, ["alias", "revision", "pin", "profileFileSha256", "interpretationHash", "validationHash"]) ||
          !text(expected.revision) || typeof expected.profileFileSha256 !== "string" || !HASH.test(expected.profileFileSha256) ||
          typeof expected.interpretationHash !== "string" || !HASH.test(expected.interpretationHash) ||
          typeof expected.validationHash !== "string" || !HASH.test(expected.validationHash) ||
          !expected.pin || !exactKeys(expected.pin, ["analysisId", "source"]) || !text(expected.pin.analysisId) ||
          !expected.pin.source || !exactKeys(expected.pin.source, ["documentId", "sha256", "utf8Bytes", "utf16Length"]) ||
          !text(expected.pin.source.documentId) || typeof expected.pin.source.sha256 !== "string" || !HASH.test(expected.pin.source.sha256) ||
          !Number.isSafeInteger(expected.pin.source.utf8Bytes) || expected.pin.source.utf8Bytes < 0 ||
          !Number.isSafeInteger(expected.pin.source.utf16Length) || expected.pin.source.utf16Length < 0)
        return projectionFailure("invalid-input", `Expected source pin for ${expected.alias} is malformed.`);
      const source = actual.get(expected.alias);
      if (!source || !exactKeys(source, ["alias", "revision", "documentId", "text", "validationProfileJson"]) ||
          !text(source.revision) || !text(source.documentId) || typeof source.text !== "string" || hasLoneSurrogate(source.text) ||
          typeof source.validationProfileJson !== "string" || hasLoneSurrogate(source.validationProfileJson))
        return projectionFailure("invalid-input", `Source capture ${expected.alias} is malformed.`);
      if (source.revision !== expected.revision)
        return projectionFailure("stale-input", `Source revision changed for ${expected.alias}.`);
      if (!aliasPattern.test(source.alias) || !HASH.test(expected.pin.analysisId))
        return projectionFailure("invalid-input", `Source identity for ${expected.alias} is malformed.`);
      const pinKey = `${expected.pin.analysisId}\0${expected.pin.source.documentId}\0${expected.pin.source.sha256}`;
      if (pins.has(pinKey)) return projectionFailure("invalid-input", "Duplicate expected capture pin.");
      pins.add(pinKey);
    }
    if (!input.budget || !exactKeys(input.budget, ["maxUtf8Bytes", "maxFragments"]) ||
        !Number.isSafeInteger(input.budget.maxUtf8Bytes) || input.budget.maxUtf8Bytes < 0 ||
        !Number.isSafeInteger(input.budget.maxFragments) || input.budget.maxFragments < 0)
      return projectionFailure("invalid-input", "Projection budgets must be nonnegative safe integers.");
    if (!input.limits || !exactKeys(input.limits, ["analysis", "corpus", "maxRuleEntityVisits", "maxPacketUtf8Bytes"]) ||
        !input.limits.analysis || !exactKeys(input.limits.analysis, ["maxSourceUtf8Bytes", "maxOccurrences"]) ||
        !Number.isSafeInteger(input.limits.analysis.maxSourceUtf8Bytes) || input.limits.analysis.maxSourceUtf8Bytes < 1 ||
        !Number.isSafeInteger(input.limits.analysis.maxOccurrences) || input.limits.analysis.maxOccurrences < 1 ||
        !input.limits.corpus || !exactKeys(input.limits.corpus, ["maxCaptures", "maxBindings", "maxSourceUtf8Bytes"]) ||
        !Number.isSafeInteger(input.limits.corpus.maxCaptures) || input.limits.corpus.maxCaptures < 1 ||
        !Number.isSafeInteger(input.limits.corpus.maxBindings) || input.limits.corpus.maxBindings < 0 ||
        !Number.isSafeInteger(input.limits.corpus.maxSourceUtf8Bytes) || input.limits.corpus.maxSourceUtf8Bytes < 1 ||
        !Number.isSafeInteger(input.limits.maxRuleEntityVisits) || input.limits.maxRuleEntityVisits < 0 ||
        !Number.isSafeInteger(input.limits.maxPacketUtf8Bytes) || input.limits.maxPacketUtf8Bytes < 0)
      return projectionFailure("invalid-input", "Projection resource limits are malformed.");
    const sourceAliases = new Set(aliases);
    for (const root of input.roots)
      if (!root || !exactKeys(root, ["source", "identifier"]) || typeof root.source !== "string" || typeof root.identifier !== "string" ||
          !sourceAliases.has(root.source) || !identifierPattern.test(root.identifier))
        return projectionFailure("invalid-input", "Root entity reference is malformed or uses an undeclared source.");
    const expectedAnalysisIds = new Set(input.expected.sources.map(source => source.pin.analysisId));
    for (const binding of input.bindings) {
      if (!binding || !exactKeys(binding, ["source", "target"]) || !binding.source || !exactKeys(binding.source, ["analysisId", "occurrenceId"]) ||
          !binding.target || !exactKeys(binding.target, ["analysisId", "identifier"]) ||
          typeof binding.source.analysisId !== "string" || !expectedAnalysisIds.has(binding.source.analysisId) || !text(binding.source.occurrenceId) ||
          typeof binding.target.analysisId !== "string" || !HASH.test(binding.target.analysisId) ||
          typeof binding.target.identifier !== "string" || !identifierPattern.test(binding.target.identifier))
        return projectionFailure("invalid-input", "Corpus binding is malformed or references an unpinned capture.");
    }
    const cloned = structuredClone({
      assignmentId: input.assignmentId,
      roots: input.roots.map(root => ({ ...root })),
      sources: input.sources.map(source => ({ ...source })),
      bindings: input.bindings.map(binding => ({ source: { ...binding.source }, target: { ...binding.target } })),
      expected: input.expected,
      budget: input.budget,
      limits: input.limits,
    });
    const roots = [...new Map(cloned.roots.map(root => [`${root.source}\0${root.identifier}`, root])).values()]
      .sort((a, b) => a.source < b.source ? -1 : a.source > b.source ? 1 : a.identifier < b.identifier ? -1 : a.identifier > b.identifier ? 1 : 0) as unknown as ProjectionInput["roots"];
    const normalized = { ...cloned, roots, sources: cloned.sources as unknown as ProjectionInput["sources"], policy: input.policy } satisfies ProjectionInput;
    return freeze({ ok: true, value: normalized });
  } catch (error) {
    return projectionFailure("invalid-input", error instanceof Error ? error.message : "Invalid projection input.");
  }
}
