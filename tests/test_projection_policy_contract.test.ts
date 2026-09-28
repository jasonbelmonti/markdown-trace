import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileValidationProfile,
  extractContext,
  traverseGraph,
  validateGraph,
} from "../src/markdowntrace/document-graph/index.js";
import { fixturePolicyJson, fixtureProfileJson, fixtureSource, projectionOracle } from "./projection-policy/fixture.js";
import { compileProjectionPolicy } from "../src/markdowntrace/document-graph/projection/policy.js";
import { projectionPolicyData } from "../src/markdowntrace/document-graph/projection/policy-state.js";
import { validateProjectionIdentity } from "../src/markdowntrace/document-graph/projection/identity.js";
import { captureProjectionInput } from "../src/markdowntrace/document-graph/projection/capture.js";

const value = <T>(result: { ok: boolean; value?: T; error?: unknown }): T => {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value as T;
};
const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");

describe("projection-policy independent fixture oracle", () => {
  it("freezes exact unlinked slices and captures trusted pins through existing APIs", () => {
    expect(JSON.parse(fixturePolicyJson).rules.slice(0, 4).map((r: { select: { path: string[] } }) => r.select.path)).toEqual([
      ["Task", "Scope"], ["Task", "Authority"], ["Task", "Constraints"], ["Task", "Review Boundary"],
    ]);
    for (const section of projectionOracle.requiredSections) {
      expect(section.range.start.offset).toBe(section.start);
      expect(section.range.end.offset).toBe(section.end);
      expect(fixtureSource.slice(section.start, section.end)).toBe(section.text);
      expect(Buffer.byteLength(section.text, "utf8")).toBe(section.utf8Bytes);
    }
    expect(projectionOracle.requiredSectionBytes).toBe(
      projectionOracle.requiredSections.reduce((n, section) => n + section.utf8Bytes, 0),
    );
    for (const part of projectionOracle.requiredParts) {
      expect(fixtureSource.slice(part.start, part.end)).toBe(part.text);
      expect(Buffer.byteLength(part.text, "utf8")).toBe(part.utf8Bytes);
    }
    expect(projectionOracle.requiredParts.reduce((sum, part) => sum + part.utf8Bytes, 0)).toBe(projectionOracle.requiredPartBytes);

    const profile = value(compileValidationProfile(fixtureProfileJson));
    const analysis = value(analyzeDocument(
      { documentId: "tests/projection-policy/single-task.md", text: fixtureSource },
      profile,
      { maxSourceUtf8Bytes: 100_000, maxOccurrences: 100 },
    ));
    const validation = value(validateGraph(analysis, profile));
    if (validation.status !== "pass") throw new Error(JSON.stringify(validation));
    const selection = value(traverseGraph(analysis, {
      roots: ["WP-1"], direction: "outgoing", relations: ["implements", "requires"], maxDepth: 3, maxNodes: 10,
    }));
    expect(selection.nodes.map(node => node.identifier)).toEqual(["WP-1", "REQ-1", "CON-1"]);
    expect(analysis.snapshot.coverage).toBe("complete");
    expect(selection.boundary).toEqual({ depthLimited: false, nodeLimited: false, unresolvedRelationships: 0 });
    const graphOnly = value(extractContext(analysis, {
      selection, budget: { maxUtf8Bytes: 100_000, maxFragments: 100 },
    }));
    const graphOnlyText = graphOnly.parts.map(part => part.text).join("");
    expect(graphOnly.omittedIdentifiers).toEqual([]);
    const expectedGraphOnly = projectionOracle.requiredParts.filter(part =>
      part.start === 0 || part.reasons.some(reason => reason.role === "owned-content"),
    );
    expect(graphOnly.parts.map(part => ({
      text: part.text,
      start: part.range.start.offset,
      end: part.range.end.offset,
    }))).toEqual(expectedGraphOnly.map(part => ({ text: part.text, start: part.start, end: part.end })));
    for (const title of projectionOracle.graphOnlyExcludedSections)
      expect(graphOnlyText).not.toContain(`## ${title}`);
    expect(graphOnlyText).not.toContain(projectionOracle.excludedText);
    expect(projectionOracle.requiredEntities.map(entity => entity.identifier)).toEqual(["WP-1", "REQ-1", "CON-1"]);

    expect(Buffer.byteLength(fixtureSource, "utf8")).toBe(projectionOracle.sourceBytes);
    const sourcePin = {
      analysisId: analysis.snapshot.analysisId,
      source: structuredClone(analysis.snapshot.source),
      interpretationHash: analysis.snapshot.interpretationHash,
      validationHash: profile.validationHash,
      profileFileSha256: sha256(fixtureProfileJson),
    };
    if (process.env.CAPTURE_PROJECTION_PIN === "1")
      console.log(`PROJECTION_PIN=${JSON.stringify(sourcePin)}`);
    expect(sourcePin.source.sha256).toBe(sha256(fixtureSource));
    expect(analysis.snapshot.occurrences.map(item => item.id)).toEqual(["O1", "O2", "O3", "O4", "O5"]);
    expect(analysis.snapshot.relationships.map(item => [item.id, item.kind, item.occurrenceId])).toEqual([
      ["R1", "implements", "O2"], ["R2", "requires", "O4"],
    ]);
  });

  it("makes each required annotation deletion a profile failure", () => {
    const profile = value(compileValidationProfile(fixtureProfileJson));
    const validate = (text: string) => {
      const analysis = value(analyzeDocument(
        { documentId: "tests/projection-policy/single-task.md", text }, profile,
        { maxSourceUtf8Bytes: 100_000, maxOccurrences: 100 },
      ));
      return value(validateGraph(analysis, profile));
    };
    expect(validate(fixtureSource).status).toBe("pass");
    for (const damaged of [
      fixtureSource.replace("[Criterion](ctx://trace/entity/REQ-1?role=definition)", "Criterion"),
      fixtureSource.replace("[Constraint](ctx://trace/entity/CON-1?role=definition)", "Constraint"),
      fixtureSource.replace("[criterion](ctx://trace/entity/REQ-1?rel=implements)", "criterion"),
      fixtureSource.replace("[constraint](ctx://trace/entity/CON-1?rel=requires)", "constraint"),
    ]) {
      expect(damaged).not.toBe(fixtureSource);
      expect(validate(damaged).status).toBe("fail");
    }
  });
});

describe("projection policy admission and identities", () => {
  it("rejects deeply nested unsupported JSON without throwing", () => {
    const deep = "[".repeat(10_000) + "0" + "]".repeat(10_000);
    for (const json of [deep, `{\"unknown\":${deep}}`])
      expect(compileProjectionPolicy(json)).toMatchObject({ ok: false, error: { code: "invalid-policy" } });
  });

  it("issues immutable policies only for the finite schema and retains exact raw identity", () => {
    const compiled = value(compileProjectionPolicy(fixturePolicyJson));
    expect(Object.isFrozen(compiled)).toBe(true);
    expect(Object.isFrozen(compiled.identity)).toBe(true);
    expect(compiled.identity.sha256).toBe(sha256(fixturePolicyJson));
    expect(projectionPolicyData(compiled)?.raw).toBe(fixturePolicyJson);
    expect(projectionPolicyData(JSON.parse(JSON.stringify(compiled)) as typeof compiled)).toBeUndefined();

    const invalid = [
      fixturePolicyJson.replace('"op": "source"', '"op": "infer-from-prose"'),
      fixturePolicyJson.replace('"maxDepth": 1', '"maxDepth": 2'),
      fixturePolicyJson.replace('"from": "roots"', '"from": "dependencies"'),
      fixturePolicyJson.replace('"policyId": "task-worker-context"', '"policyId": "Task Worker"'),
      fixturePolicyJson.replace('"rules": [', '"rules": [{"id":"explicit","op":"entities","requirement":"required","entities":[{"source":"other","identifier":"WP-2"}]},'),
      fixturePolicyJson.replace('"kind": "section", "path"', '"kind": "section", "guess": true, "path"'),
      fixturePolicyJson.replace('"policyId": "task-worker-context",', '"policyId": "task-worker-context", "\\u0070olicyId": "shadow",'),
    ];
    for (const json of invalid) expect(compileProjectionPolicy(json).ok).toBe(false);
    const zeroNodes = compileProjectionPolicy(fixturePolicyJson.replace('"maxNodes": 20', '"maxNodes": 0'));
    expect(zeroNodes.ok).toBe(true);
    const dottedGate = fixturePolicyJson.replace('"rules": "all"', '"rules": ["builtin.rule"]');
    expect(compileProjectionPolicy(dottedGate).ok).toBe(true);
    expect(compileProjectionPolicy(fixturePolicyJson.replace("markdown-trace.projection-policy.v1", "markdown-trace.projection-policy.v9"))).toMatchObject({
      ok: false, error: { code: "unsupported-version" },
    });
  });

  it("rejects forged policies and stale policy or producer expectations before capture", () => {
    const policy = value(compileProjectionPolicy(fixturePolicyJson));
    const base = {
      assignmentId: "fixture", roots: [{ source: "task", identifier: "WP-1" }],
      sources: [{ alias: "task", revision: "fixture-r1", documentId: "tests/projection-policy/single-task.md", text: fixtureSource, validationProfileJson: fixtureProfileJson }],
      bindings: [], policy,
      expected: {
        policy: policy.identity,
        producer: { packageVersion: "0.1.5", analyzerVersion: "0.1.0-experimental.3", parserVersion: "5.0.0", algorithmVersion: "markdown-trace.projection-algorithm.v1" },
        sources: [{ alias: "task", revision: "fixture-r1", pin: { analysisId: "c".repeat(64), source: { documentId: "tests/projection-policy/single-task.md", sha256: sha256(fixtureSource), utf8Bytes: 697, utf16Length: 697 } }, profileFileSha256: sha256(fixtureProfileJson), interpretationHash: "a".repeat(64), validationHash: "b".repeat(64) }],
      },
      budget: { maxUtf8Bytes: 10_000, maxFragments: 100 },
      limits: { analysis: { maxSourceUtf8Bytes: 10_000, maxOccurrences: 100 }, corpus: { maxCaptures: 4, maxBindings: 100, maxSourceUtf8Bytes: 100_000 }, maxRuleEntityVisits: 1000, maxPacketUtf8Bytes: 100_000 },
    };
    expect(validateProjectionIdentity({ ...base, policy: { identity: policy.identity } }).ok).toBe(false);
    expect(validateProjectionIdentity({ ...base, expected: { ...base.expected, policy: { ...policy.identity, sha256: "0".repeat(64) } } })).toMatchObject({
      ok: false, error: { code: "stale-input" },
    });
    expect(validateProjectionIdentity({ ...base, expected: { ...base.expected, producer: { ...base.expected.producer, parserVersion: "other" } } })).toMatchObject({
      ok: false, error: { code: "stale-input" },
    });
    expect(validateProjectionIdentity({ ...base, expected: { ...base.expected, policy: { ...base.expected.policy, extra: true } } })).toMatchObject({
      ok: false, error: { code: "invalid-input" },
    });
    expect(validateProjectionIdentity({ ...base, roots: [{ source: "task", identifier: ["WP-1"] }] }).ok).toBe(false);
    expect(validateProjectionIdentity({ ...base, bindings: [{ source: { analysisId: "c".repeat(64), occurrenceId: "O1" }, target: { analysisId: "d".repeat(64), identifier: "WP-2" } }] }).ok).toBe(true);
    expect(validateProjectionIdentity({ ...base, sources: [{ ...base.sources[0], revision: "fixture-r2" }] })).toMatchObject({
      ok: false, error: { code: "stale-input" },
    });
    expect(validateProjectionIdentity({ ...base, sources: [{ ...base.sources[0], unexpected: true }] })).toMatchObject({
      ok: false, error: { code: "invalid-input" },
    });
    const accessor = { ...base } as Record<string, unknown>;
    let getterRead = false;
    Object.defineProperty(accessor, "assignmentId", { enumerable: true, get() { getterRead = true; return "fixture"; } });
    expect(validateProjectionIdentity(accessor).ok).toBe(false);
    expect(getterRead).toBe(false);
    const unusualArray = [...base.roots];
    Object.setPrototypeOf(unusualArray, { toJSON() { throw new Error("should not execute"); } });
    expect(validateProjectionIdentity({ ...base, roots: unusualArray }).ok).toBe(false);
    expect(validateProjectionIdentity({ ...base, budget: { maxUtf8Bytes: 0, maxFragments: 0 }, limits: { ...base.limits, maxRuleEntityVisits: 0, maxPacketUtf8Bytes: 0 } }).ok).toBe(true);
  });

  it("recompiles profiles and recaptures exact pinned source identities on every call", () => {
    const policy = value(compileProjectionPolicy(fixturePolicyJson));
    const input = {
      assignmentId: "fixture", roots: [{ source: "task", identifier: "WP-1" }],
      sources: [{ alias: "task", revision: "fixture-r1", documentId: "tests/projection-policy/single-task.md", text: fixtureSource, validationProfileJson: fixtureProfileJson }],
      bindings: [], policy,
      expected: {
        policy: policy.identity,
        producer: { packageVersion: "0.1.5", analyzerVersion: "0.1.0-experimental.3", parserVersion: "5.0.0", algorithmVersion: "markdown-trace.projection-algorithm.v1" },
        sources: [{ alias: "task", revision: "fixture-r1", pin: { analysisId: "7e3c85125261f33609ff459295b5a3a309d0d79cc070c6f004d1840e56223502", source: { documentId: "tests/projection-policy/single-task.md", sha256: "87884a414e1553c1be2191bd92aae00095422f70c86bb277143cbdab6b703eab", utf8Bytes: 697, utf16Length: 697 } }, profileFileSha256: "7e0d63d472c56de1eb7959b60d507da2d692261ab1549e53fdb3253868d4278a", interpretationHash: "2671b80ba5795010896aef789d642eba070ceeaf7d611ece8d146385c3a395ab", validationHash: "87559f43ba98e203f9adbd03cd02916acad6b289581936c3a01bdf93a0286532" }],
      },
      budget: { maxUtf8Bytes: 10_000, maxFragments: 100 },
      limits: { analysis: { maxSourceUtf8Bytes: 10_000, maxOccurrences: 100 }, corpus: { maxCaptures: 4, maxBindings: 100, maxSourceUtf8Bytes: 100_000 }, maxRuleEntityVisits: 1000, maxPacketUtf8Bytes: 100_000 },
    };
    const captured = captureProjectionInput(input);
    expect(captured.ok).toBe(true);
    // A parser upgrade must not silently accept the old capture or producer.
    expect(captureProjectionInput({ ...input, expected: { ...input.expected,
      producer: { ...input.expected.producer, packageVersion: "0.1.1", parserVersion: "3.6.0" },
    } })).toMatchObject({ ok: false, error: { code: "stale-input" } });
    expect(captureProjectionInput({ ...input, expected: { ...input.expected,
      sources: [{ ...input.expected.sources[0], pin: { ...input.expected.sources[0].pin,
        analysisId: "ef6dfc495eb47d5860124d13d33567dfb15882c2b8bee849493211edeb087800",
      } }],
    } })).toMatchObject({ ok: false, error: { code: "stale-input" } });
    if (captured.ok) {
      expect(captured.value.sources).toHaveLength(1);
      expect(captured.value.sources[0].validation.status).toBe("pass");
      (input.sources[0] as { text: string }).text = "changed after capture";
      expect(captured.value.input.sources[0].text).toBe(fixtureSource);
      (input.sources[0] as { text: string }).text = fixtureSource;
    }
    expect(captureProjectionInput({ ...input, sources: [{ ...input.sources[0], text: `${fixtureSource}changed` }] })).toMatchObject({
      ok: false, error: { code: "stale-input" },
    });
    expect(captureProjectionInput({ ...input, sources: [{ ...input.sources[0], validationProfileJson: fixtureProfileJson.replace('"minEntities": 3', '"minEntities": 2') }] })).toMatchObject({
      ok: false, error: { code: "stale-input" },
    });
    const duplicateProfile = fixtureProfileJson.replace('"profileId": "projection-policy-fixture",', '"profileId": "projection-policy-fixture", "\\u0070rofileId": "shadow",');
    expect(captureProjectionInput({ ...input, sources: [{ ...input.sources[0], validationProfileJson: duplicateProfile }] })).toMatchObject({
      ok: false, error: { code: "invalid-input" },
    });
    const failingProfile = fixtureProfileJson.replace('"minEntities": 3', '"minEntities": 4');
    const compiledFailingProfile = value(compileValidationProfile(failingProfile));
    const updatedExpectation = {
      ...input.expected,
      sources: [{ ...input.expected.sources[0], profileFileSha256: sha256(failingProfile), validationHash: compiledFailingProfile.validationHash }],
    };
    const failedLocalGate = captureProjectionInput({ ...input, sources: [{ ...input.sources[0], validationProfileJson: failingProfile }], expected: updatedExpectation });
    expect(failedLocalGate.ok).toBe(true);
    if (failedLocalGate.ok) expect(failedLocalGate.value.sources[0].validation.status).toBe("fail");
    const dottedPolicy = value(compileProjectionPolicy(fixturePolicyJson.replace('"rules": "all"', '"rules": ["builtin.rule"]')));
    const dottedInput = { ...input, policy: dottedPolicy, expected: { ...input.expected, policy: dottedPolicy.identity } };
    expect(captureProjectionInput(dottedInput)).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    const unknownKindPolicy = value(compileProjectionPolicy(fixturePolicyJson.replace('"subjectKinds": ["work"]', '"subjectKinds": ["ghost"]')));
    const unknownKindInput = { ...input, policy: unknownKindPolicy, expected: { ...input.expected, policy: unknownKindPolicy.identity } };
    expect(captureProjectionInput(unknownKindInput)).toMatchObject({ ok: false, error: { code: "invalid-policy" } });
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(input.sources[0])).toBe(false);
    expect(input.sources[0].text).toBe(fixtureSource);
  });
});
