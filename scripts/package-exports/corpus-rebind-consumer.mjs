import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { run } from "./process.mjs";

// Apply the demonstration's reported authoring operations to copied files, then
// exercise the ordinary manifest path without either fixed-fixture proof flag.
export async function verifyCorpusManifestRebinds(options) {
  const cases = [
    { alias: "plan", name: "earlier plan-action insertion", occurrenceId: "O4", range: [242, 294],
      edit: (text) => text.replace("| Action | Work |\n| --- | --- |",
        "| Action | Work |\n| --- | --- |\n| [EP-ACT-0](ctx://trace/entity/EP-ACT-0?role=definition) | Prepare |") },
    { alias: "task-a", name: "Task A criterion text edit", occurrenceId: "O3", range: [172, 224],
      edit: (text) => text.replace("This criterion depends on local constraint",
        "This criterion deliberately continues to depend on local constraint") },
  ];
  const results = [];
  for (const edit of cases) {
    const directory = await mkdtemp(path.join(options.consumerDirectory, "corpus-rebind-"));
    try {
      await cp(options.exampleDirectory, directory, { recursive: true });
      results.push(await verifyEditedManifest(options, edit, directory));
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
  return results;
}

async function verifyEditedManifest(options, edit, directory) {
  const report = options.editCases.find((item) => item.case === edit.name);
  assert.ok(report, `missing authoring report for ${edit.name}`);
  const manifestPath = path.join(directory, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const capture = manifest.captures.find((item) => item.alias === edit.alias);
  const sourcePath = path.join(directory, capture.path);
  const original = await readFile(sourcePath, "utf8");
  const edited = edit.edit(original);
  assert.notEqual(edited, original);
  await writeFile(sourcePath, edited);
  capture.expected = report.editedCaptureAfter;
  manifest.bindings[0] = { source: report.after.source, target: report.after.target };
  manifest.traversal = report.after.traversal;
  manifest.inspectEntity = report.after.inspectEntity;
  const analysisId = (alias) => manifest.captures.find((item) => item.alias === alias).expected.analysisId;
  assert.equal(manifest.traversal.roots[0].analysisId, analysisId("plan"));
  assert.equal(manifest.inspectEntity.analysisId, analysisId("task-a"));
  await writeFile(manifestPath, JSON.stringify(manifest));
  const inputPaths = [manifestPath, path.join(directory, manifest.profile),
    ...manifest.captures.map((item) => path.join(directory, item.path))];
  const before = await Promise.all(inputPaths.map((file) => readFile(file)));
  const { stdout } = run(process.execPath, [options.scriptDestination, manifestPath,
    "--package", options.packageName], { cwd: options.consumerDirectory });
  const output = JSON.parse(stdout);
  assert.deepEqual(output.selectedPath.map((node) => node.entity), [
    { analysisId: analysisId("plan"), identifier: "EP-ACT-1" },
    { analysisId: analysisId("task-a"), identifier: "TD-SC-1" },
    { analysisId: analysisId("task-a"), identifier: "CON-1" },
  ]);
  assert.equal(output.lookupAndIncoming.lookup.record.identifier, "TD-SC-1");
  assert.equal(output.lookupAndIncoming.lookup.capture.analysisId, analysisId("task-a"));
  const edge = output.lookupAndIncoming.incoming.items.find((item) => item.evidence.analysisId === analysisId("plan"));
  assert.equal(edge.evidence.occurrenceId, edit.occurrenceId);
  assert.deepEqual([edge.occurrence.range.start.offset, edge.occurrence.range.end.offset], edit.range);
  assert.deepEqual(edge.resolution.target, manifest.inspectEntity);
  assert.equal(output.inputsUnchanged, true);
  assert.deepEqual(await Promise.all(inputPaths.map((file) => readFile(file))), before);
  return { case: edit.name, normalManifestConsumer: "pass", pathAndInspectionRestored: true, inputsUnchanged: true };
}
