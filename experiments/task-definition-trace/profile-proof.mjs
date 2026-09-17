import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { analyzeDocument, compileValidationProfile, validateGraph as validate } from "@jasonbelmonti/markdown-trace/experimental/graph";
import { unwrap } from "./check.mjs";
const analyze = (...args) => unwrap(analyzeDocument(...args));
const validateGraph = (...args) => unwrap(validate(...args));

const limits = { maxSourceUtf8Bytes: 2_000_000, maxOccurrences: 50_000 };
const compile = data => unwrap(compileValidationProfile(JSON.stringify(data)));
export function proveProfiles({ source, sourcePath, rawProfile, output, run }) {
  const strict = compile(rawProfile);
  const missing = source.replace("[relationship probes](ctx://trace/entity/VAL-2?rel=verified-by)", "relationship probes");
  assert.notEqual(missing, source);
  const input = { text: missing, documentId: sourcePath };
  const analysis = analyze(input, strict, limits);
  input.text = "Caller replaced the text after capture.";
  const before = JSON.stringify(analysis.snapshot);
  const strictResult = validateGraph(analysis, strict);
  assert.equal(strictResult.status, "fail");
  assert.deepEqual(strictResult.diagnostics.map(item => item.ruleId), ["validation-has-slice"]);
  const relaxedData = structuredClone(rawProfile);
  relaxedData.validation.rules.find(rule => rule.id === "validation-has-slice").min = 0;
  const relaxed = compile(relaxedData);
  const relaxedResult = validateGraph(analysis, relaxed);
  assert.equal(relaxedResult.status, "pass");
  assert.notEqual(strictResult.validationHash, relaxedResult.validationHash);
  assert.equal(strictResult.interpretationHash, relaxedResult.interpretationHash);
  assert.deepEqual(validateGraph(analysis, strict), strictResult, "Repeated reports must be identical");
  assert.equal(JSON.stringify(analysis.snapshot), before, "Validation must not change graph facts");
  const reanalyzed = analyze({ text: missing, documentId: sourcePath }, relaxed, limits);
  assert.equal(JSON.stringify(reanalyzed.snapshot), before, "Policy must not affect extraction identity");
  const relaxedPath = join(output, "relaxed-profile.json");
  writeFileSync(relaxedPath, JSON.stringify(relaxedData, null, 2) + "\n");
  const cliRelaxed = run(join(output, "missing-slice-link/task.md"), join(output, "relaxed-policy"), 0, relaxedPath);
  assert.equal(cliRelaxed.trace.validationHash, relaxedResult.validationHash);
  assert.equal(readFileSync(join(output, "missing-slice-link/graph.json"), "utf8"),
    readFileSync(join(output, "relaxed-policy/graph.json"), "utf8"), "CLI profiles must preserve the same graph bytes");

  const valid = analyze({ text: source, documentId: sourcePath }, strict, limits);
  const changedSelector = structuredClone(rawProfile);
  changedSelector.validation.rules.find(rule => rule.id === "validation-definitions").select.column = "Evidence";
  const selectionFailure = validateGraph(valid, compile(changedSelector));
  assert.equal(selectionFailure.status, "fail");
  assert.ok(selectionFailure.diagnostics.some(item => item.ruleId === "validation-definitions" && item.code.endsWith("annotation-count")));
  const countProfile = structuredClone(rawProfile);
  countProfile.validation.rules.push({ id: "too-many-criteria-required", op: "entity-count", kinds: ["criterion"], min: 4, max: null });
  assert.equal(validateGraph(valid, compile(countProfile)).rules.find(rule => rule.id === "too-many-criteria-required").status, "fail");

  const renamedData = structuredClone(rawProfile);
  let renamedText = source;
  for (const [from, to] of [["Materially Verifiable Success Criteria", "Requirements"], ["Validation / Evidence", "Verification"], ["Incremental Value Delivery", "Deliveries"], ["Criterion ID", "Target"], ["Check", "Procedure"]]) {
    renamedText = renamedText.replaceAll(from, to);
    for (const rule of renamedData.validation.rules) {
      if (rule.select?.section === from) rule.select.section = to;
      if (rule.select?.column === from) rule.select.column = to;
    }
  }
  const renamedProfile = compile(renamedData);
  const renamedAnalysis = analyze({ text: renamedText, documentId: "renamed.md" }, renamedProfile, limits);
  assert.equal(validateGraph(renamedAnalysis, renamedProfile).status, "pass");

  const prose = "# [A requirement](ctx://trace/entity/NEED-1?role=definition)\n\n"
    + "# [A test](ctx://trace/entity/TEST-1?role=definition)\n\n"
    + "Checks [the requirement](ctx://trace/entity/NEED-1?rel=checks).\n";
  const proseData = {
    schemaVersion: rawProfile.schemaVersion, profileId: "prose-proof",
    interpretation: { language: "markdown-trace.identity.draft2", entityKinds: [
      { name: "requirement", prefixes: ["NEED"] }, { name: "test", prefixes: ["TEST"] },
    ] },
    validation: { minEntities: 2, allowedRelations: [{ kind: "checks", from: ["test"], to: ["requirement"] }], rules: [
      { id: "heading-identities", op: "declarations", kinds: ["requirement", "test"], select: { target: "node", nodeType: "heading" }, min: 1, max: 1, minSelections: 2, matchText: false, exclusive: true },
      { id: "paragraph-references", op: "references", relation: "checks", select: { target: "node", nodeType: "paragraph" }, min: 1, max: 1, minSelections: 1, matchText: false, exclusive: true },
      { id: "requirement-tested", op: "require-relation", kinds: ["requirement"], direction: "incoming", relation: "checks", relatedKinds: ["test"], min: 1, max: 1 },
    ] },
  };
  const proseProfile = compile(proseData);
  const proseAnalysis = analyze({ text: prose, documentId: "prose.md" }, proseProfile, limits);
  assert.equal(validateGraph(proseAnalysis, proseProfile).status, "pass");
  const proseMissing = analyze({ text: prose.replace("[the requirement](ctx://trace/entity/NEED-1?rel=checks)", "the requirement"), documentId: "prose.md" }, proseProfile, limits);
  assert.equal(validateGraph(proseMissing, proseProfile).status, "fail");
  for (const [nodeType, marker] of [["listItem", "- "], ["blockquote", "> "]]) {
    const containerData = structuredClone(proseData);
    containerData.validation.rules[1].select.nodeType = nodeType;
    const containerProfile = compile(containerData);
    const container = analyze({ text: prose.replace("Checks ", marker + "Checks "), documentId: nodeType + ".md" }, containerProfile, limits);
    assert.equal(validateGraph(container, containerProfile).status, "pass");
    containerData.validation.rules[1].matchText = true;
    assert.throws(() => compile(containerData), error => error.code === "invalid-profile");
  }
  writeFileSync(join(output, "prose.md"), prose);
  writeFileSync(join(output, "prose-profile.json"), JSON.stringify(proseData, null, 2) + "\n");
  assert.throws(() => validateGraph(valid, proseProfile), error => error.code === "profile-mismatch");
  for (const mutation of [data => { data.validation.rules[0].op = "walk-path"; }, data => { data.validation.rules[0].extra = true; }]) {
    const bad = structuredClone(rawProfile); mutation(bad);
    assert.throws(() => compile(bad), error => error.code === "invalid-profile");
  }
  const incompleteData = structuredClone(proseData);
  incompleteData.validation = { minEntities: 0, allowedRelations: [], rules: [] };
  const incompleteProfile = compile(incompleteData);
  const incomplete = analyze({ documentId: "unsupported.md", text: "A footnote[^a].\n\n[^a]: A note.\n" }, incompleteProfile, limits);
  assert.equal(validateGraph(incomplete, incompleteProfile).status, "indeterminate");
  assert.equal(JSON.stringify(analysis.snapshot), before);
  return {
    strictStatus: strictResult.status, relaxedStatus: relaxedResult.status,
    strictValidationHash: strictResult.validationHash, relaxedValidationHash: relaxedResult.validationHash,
    analysisId: analysis.snapshot.analysisId, graphUnchanged: true, repeatable: true,
    changedSelectorRejected: true, renamedSectionsPassed: true, prosePassed: true, listAndQuotePassed: true,
    missingProseReferenceRejected: true, unsupportedProfilesRejected: true,
    interpretationMismatchRejected: true, partialAnalysisStatus: "indeterminate",
  };
}
