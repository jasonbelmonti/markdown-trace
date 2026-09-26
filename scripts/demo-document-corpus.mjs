#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const [manifestArgument = "examples/cross-document/manifest.json", ...options] = process.argv.slice(2);
const packageOption = options.indexOf("--package");
const packageName = packageOption < 0 ? null : options[packageOption + 1];
const exerciseEdits = options.includes("--exercise-edits");
const verifyExample = options.includes("--verify-example") || exerciseEdits;
const manifestPath = path.resolve(manifestArgument);
const baseDirectory = path.dirname(manifestPath);
const api = await import(packageName ?? pathToFileURL(path.resolve(scriptDirectory, "../dist/markdowntrace/document-graph/index.js")));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const profileBytes = await readFile(path.resolve(baseDirectory, manifest.profile));
const profileJson = JSON.parse(profileBytes.toString("utf8"));
const profile = unwrap(api.compileProfile(profileJson));
const validationProfile = unwrap(api.compileValidationProfile(JSON.stringify({
  schemaVersion: "markdown-trace.validation-profile.experimental.v1", profileId: "corpus-demo",
  interpretation: profileJson.interpretation,
  validation: { minEntities: 0, allowedRelations: [], rules: [] },
})));
const captures = [];
const byAlias = new Map();
const rawHashes = new Map();
for (const descriptor of manifest.captures) {
  const bytes = await readFile(path.resolve(baseDirectory, descriptor.path));
  const text = bytes.toString("utf8");
  rawHashes.set(descriptor.alias, sha256(bytes));
  const analysis = unwrap(api.analyzeDocument({ documentId: descriptor.documentId, text }, profile,
    { maxSourceUtf8Bytes: 100_000, maxOccurrences: 2_000 }));
  const capture = { alias: descriptor.alias, analysis, expected: descriptor.expected };
  captures.push(capture);
  byAlias.set(capture.alias, capture);
}
const localBefore = captures.map((capture) => ({
  analysisId: capture.analysis.snapshot.analysisId,
  snapshot: JSON.stringify(capture.analysis.snapshot),
  validation: JSON.stringify(unwrap(api.validateGraph(capture.analysis, validationProfile))),
}));
const corpus = unwrap(api.createCorpus({ captures, bindings: manifest.bindings, limits: manifest.budgets.corpus }));
for (const capture of captures) {
  assert.equal(capture.analysis.snapshot.analysisId, capture.expected.analysisId, `analysis pin accepted for ${capture.alias}`);
  assert.deepEqual(capture.analysis.snapshot.source, capture.expected.source, `source identity pin accepted for ${capture.alias}`);
  assert.equal(rawHashes.get(capture.alias), capture.expected.source.sha256, `copied file hash independently matches ${capture.alias} pin`);
}
const selection = unwrap(api.traverseCorpus(corpus, manifest.traversal));
const checked = unwrap(api.checkCorpusSelection(corpus, selection));
const root = manifest.traversal.roots[0];
const outgoing = unwrap(api.findCorpusOutgoing(corpus, root, manifest.queries?.outgoing ?? {}));
const inspected = manifest.inspectEntity;
const lookupAndIncoming = inspected ? {
  lookup: unwrap(api.lookupCorpusIdentifier(corpus, inspected)),
  incoming: unwrap(api.findCorpusIncoming(corpus, inspected, manifest.queries?.incoming ?? {})),
} : null;
const localStatus = captures.map((capture) => ({ alias: capture.alias, analysisId: capture.analysis.snapshot.analysisId,
  source: capture.analysis.snapshot.source, rawBytesSha256: rawHashes.get(capture.alias),
  coverage: capture.analysis.snapshot.coverage, validation: unwrap(api.validateGraph(capture.analysis, validationProfile)).status }));
const excerpts = [];
for (const capture of captures) {
  const identifiers = checked.nodes.filter((node) => node.entity.analysisId === capture.analysis.snapshot.analysisId)
    .map((node) => node.entity.identifier).sort();
  if (!identifiers.length) continue;
  const localSelection = unwrap(api.traverseGraph(capture.analysis, { roots: identifiers, direction: "both", maxDepth: 0, maxNodes: identifiers.length }));
  const bundle = unwrap(api.extractContext(capture.analysis, { selection: localSelection,
    budget: manifest.budgets.perDocument[capture.alias] }));
  excerpts.push({ alias: capture.alias, ...bundle });
}
const localAfter = captures.map((capture) => ({
  analysisId: capture.analysis.snapshot.analysisId,
  snapshot: JSON.stringify(capture.analysis.snapshot),
  validation: JSON.stringify(unwrap(api.validateGraph(capture.analysis, validationProfile))),
}));
assert.deepEqual(localAfter, localBefore, "corpus operations preserve original local snapshots and validation results");
for (const descriptor of manifest.captures) {
  assert.equal(sha256(await readFile(path.resolve(baseDirectory, descriptor.path))), rawHashes.get(descriptor.alias));
}
assert.equal(sha256(await readFile(path.resolve(baseDirectory, manifest.profile))), sha256(profileBytes));

let exampleProof = null;
if (verifyExample) exampleProof = verifyFixedExample();
const edits = exerciseEdits ? await runEditCases() : undefined;
console.log(JSON.stringify({ entrypoint: packageName ?? "local source build", corpusId: corpus.snapshot.corpusId,
  localStatus, corpusSelection: checked, selectedPath: checked.nodes, outgoing, lookupAndIncoming, excerpts, exampleProof,
  inputsUnchanged: true, editCases: edits }, null, 2));

function verifyFixedExample() {
  const fixture = manifest.expected;
  assert.ok(fixture, "fixed-example proof requires manifest.expected");
  const targetCapture = byAlias.get(fixture.targetAlias);
  const taskBCapture = byAlias.get(fixture.collidingAlias);
  assert.equal(targetCapture.analysis.snapshot.analysisId, manifest.bindings[0].target.analysisId);
  assert.equal(taskBCapture.analysis.snapshot.identifiers.some((record) => record.identifier === fixture.targetIdentifier), true);
  assert.notEqual(taskBCapture.analysis.snapshot.analysisId, targetCapture.analysis.snapshot.analysisId);
  const target = { analysisId: manifest.bindings[0].target.analysisId, identifier: fixture.targetIdentifier };
  const page = unwrap(api.findCorpusIncoming(corpus, target));
  const edge = page.items.find((item) => item.evidence.analysisId === fixture.sourceAnalysisId && item.evidence.occurrenceId === fixture.sourceOccurrenceId);
  assert.ok(edge && edge.resolution.status === "resolved");
  assert.deepEqual(edge.resolution.target, target);
  const sourceDescriptor = manifest.captures.find((item) => item.alias === fixture.sourceAlias);
  const sourceBytes = readFileSync(path.resolve(baseDirectory, sourceDescriptor.path));
  const sourceText = sourceBytes.toString("utf8");
  const start = sourceText.indexOf(fixture.sourceText);
  assert.notEqual(start, -1);
  assert.deepEqual([edge.occurrence.range.start.offset, edge.occurrence.range.end.offset], [start, start + fixture.sourceText.length]);
  assert.equal(edge.occurrence.range.start.offset, fixture.sourceRange.start);
  assert.equal(edge.occurrence.range.end.offset, fixture.sourceRange.end);
  assert.equal(sha256(sourceBytes), fixture.sourceSha256);
  assert.equal(rawHashes.get(sourceDescriptor.alias), fixture.sourceSha256);
  assert.equal(checked.nodes.some((node) => node.entity.analysisId === target.analysisId && node.entity.identifier === target.identifier), true);
  assert.equal(checked.nodes.some((node) => node.entity.analysisId === taskBCapture.analysis.snapshot.analysisId && node.entity.identifier === fixture.targetIdentifier), false);
  assert.equal(checked.nodes.some((node) => node.entity.identifier === fixture.globalObligationIdentifier), false);
  const targetExcerpt = excerpts.find((item) => item.alias === fixture.targetAlias);
  assert.ok(targetExcerpt.includedIdentifiers.includes(fixture.fittingIdentifier));
  assert.ok(targetExcerpt.omittedIdentifiers.some((item) => item.identifier === fixture.targetIdentifier));
  assert.equal(corpus.snapshot.captures.length, fixture.captureCount);
  return { explicitTargetAnalysisId: target.analysisId, collidingTaskAnalysisId: taskBCapture.analysis.snapshot.analysisId,
    sourceAnalysisId: edge.evidence.analysisId, occurrenceId: edge.evidence.occurrenceId,
    sourceSha256: fixture.sourceSha256, sourceRange: [start, start + fixture.sourceText.length],
    selectedTarget: true, collidingTaskExcluded: true, fittingExcerpt: fixture.fittingIdentifier,
    criterionOmittedForBudget: fixture.targetIdentifier, globalObligationUnlinked: true };
}

async function runEditCases() {
  const original = Object.fromEntries(await Promise.all(manifest.captures.map(async (descriptor) => [descriptor.alias,
    await readFile(path.resolve(baseDirectory, descriptor.path), "utf8")] )));
  const cases = [
    { name: "task B changed bytes with unchanged revision label", alias: "task-b",
      text: original["task-b"] + "\nEdited bytes, still Revision: 1.\n", occurrenceId: "O3", affectedBindings: [] },
    { name: "earlier plan-action insertion", alias: "plan",
      text: original.plan.replace("| Action | Work |\n| --- | --- |", "| Action | Work |\n| --- | --- |\n| [EP-ACT-0](ctx://trace/entity/EP-ACT-0?role=definition) | Prepare |"),
      occurrenceId: "O4", range: [242, 294], affectedBindings: [0] },
    { name: "Task A criterion text edit", alias: "task-a",
      text: original["task-a"].replace("This criterion depends on local constraint", "This criterion deliberately continues to depend on local constraint"),
      occurrenceId: "O3", affectedBindings: [0] },
  ];
  const results = [];
  for (const edit of cases) {
    const descriptor = manifest.captures.find((item) => item.alias === edit.alias);
    const changed = unwrap(api.analyzeDocument({ documentId: descriptor.documentId, text: edit.text }, profile,
      { maxSourceUtf8Bytes: 100_000, maxOccurrences: 2_000 }));
    const changedCaptures = captures.map((capture) => capture.alias === edit.alias ? { ...capture, analysis: changed } : capture);
    const stale = api.createCorpus({ captures: changedCaptures, bindings: manifest.bindings, limits: manifest.budgets.corpus });
    assert.equal(stale.ok, false);
    assert.equal(stale.error.code, "stale-capture");
    const reboundCaptures = changedCaptures.map((capture) => ({ alias: capture.alias, analysis: capture.analysis, expected: pin(capture.analysis) }));
    const reboundByAlias = new Map(reboundCaptures.map((capture) => [capture.alias, capture]));
    const previous = manifest.bindings[0];
    const sourceAlias = captures.find((capture) => capture.analysis.snapshot.analysisId === previous.source.analysisId).alias;
    const targetAlias = captures.find((capture) => capture.analysis.snapshot.analysisId === previous.target.analysisId).alias;
    const sourceCapture = reboundByAlias.get(sourceAlias);
    const occurrence = sourceCapture.analysis.snapshot.occurrences.find((item) => item.id === edit.occurrenceId && item.role === "reference");
    assert.ok(occurrence, "rebind names the fixture's reviewed occurrence ID");
    const sourceText = edit.alias === sourceAlias ? edit.text : original[sourceAlias];
    assert.equal(sourceText.slice(occurrence.range.start.offset, occurrence.range.end.offset), manifest.expected.sourceText);
    if (edit.range) assert.deepEqual([occurrence.range.start.offset, occurrence.range.end.offset], edit.range);
    const nextBinding = { source: { analysisId: sourceCapture.analysis.snapshot.analysisId, occurrenceId: edit.occurrenceId },
      target: { analysisId: reboundByAlias.get(targetAlias).analysis.snapshot.analysisId, identifier: previous.target.identifier } };
    const rebound = unwrap(api.createCorpus({ captures: reboundCaptures, bindings: [nextBinding], limits: manifest.budgets.corpus }));
    const oldAnalysisId = descriptor.expected.analysisId;
    const replaceQueryKey = (key) => key?.analysisId === oldAnalysisId
      ? { ...key, analysisId: changed.snapshot.analysisId } : key;
    const reboundTraversal = { ...manifest.traversal, roots: manifest.traversal.roots.map(replaceQueryKey) };
    const reboundInspectEntity = replaceQueryKey(manifest.inspectEntity);
    const reboundPath = unwrap(api.traverseCorpus(rebound, reboundTraversal));
    if (reboundInspectEntity) assert.ok(unwrap(api.lookupCorpusIdentifier(rebound, reboundInspectEntity)).record,
      "the rebound inspection key names an existing criterion");
    assert.ok(reboundPath.nodes.some((node) => node.entity.analysisId === reboundByAlias.get("task-a").analysis.snapshot.analysisId && node.entity.identifier === "TD-SC-1"));
    const editedCaptureBefore = captures.find((capture) => capture.alias === edit.alias);
    const editedCaptureAfter = reboundByAlias.get(edit.alias);
    if (edit.alias === "task-b") {
      assert.notEqual(editedCaptureBefore.analysis.snapshot.analysisId, editedCaptureAfter.analysis.snapshot.analysisId);
      assert.ok(reboundPath.nodes.some((node) => node.entity.analysisId === reboundByAlias.get("task-a").analysis.snapshot.analysisId && node.entity.identifier === "TD-SC-1"));
      assert.ok(!reboundPath.nodes.some((node) => node.entity.analysisId === editedCaptureAfter.analysis.snapshot.analysisId && node.entity.identifier === "TD-SC-1"));
    }
    results.push({ case: edit.name, stalePinRejected: true, error: stale.error.code,
      editedCaptureBefore: pin(editedCaptureBefore.analysis), editedCaptureAfter: pin(editedCaptureAfter.analysis),
      before: { source: previous.source, target: previous.target,
        traversal: manifest.traversal, inspectEntity: manifest.inspectEntity },
      after: { source: nextBinding.source, target: nextBinding.target,
        traversal: reboundTraversal, inspectEntity: reboundInspectEntity,
        sourcePin: pin(sourceCapture.analysis), targetPin: pin(reboundByAlias.get(targetAlias).analysis) },
      intendedTargetAnalysisId: reboundByAlias.get("task-a").analysis.snapshot.analysisId,
      changedCaptureHasCollidingId: edit.alias === "task-b"
        ? reboundByAlias.get("task-b").analysis.snapshot.identifiers.some((record) => record.identifier === "TD-SC-1") : undefined,
      changedCaptureExcludedFromRestoredPath: edit.alias === "task-b"
        ? !reboundPath.nodes.some((node) => node.entity.analysisId === reboundByAlias.get("task-b").analysis.snapshot.analysisId && node.entity.identifier === "TD-SC-1") : undefined,
      affectedBindingIndexes: edit.affectedBindings,
      requiredAuthoring: edit.alias === "plan"
        ? ["recapture plan source identity and analysis ID", "locate intended reference O4 and range 242–294", "replace source binding analysisId and occurrenceId", "review and replace manifest source pin", "replace traversal.roots[0].analysisId with the reviewed plan analysisId; retain EP-ACT-1"]
        : edit.alias === "task-a"
          ? ["recapture Task A source identity and analysis ID", "replace binding target analysisId", "review and replace Task A manifest pin", "replace inspectEntity.analysisId with the reviewed Task A analysisId; retain TD-SC-1"]
          : ["recapture Task B source identity and analysis ID", "review and replace Task B manifest pin"] });
  }
  return results;
}

function pin(analysis) { return { analysisId: analysis.snapshot.analysisId, source: analysis.snapshot.source }; }
function unwrap(outcome) { if (!outcome.ok) throw new Error(`${outcome.error.code}: ${outcome.error.message}`); return outcome.value; }
function sha256(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
