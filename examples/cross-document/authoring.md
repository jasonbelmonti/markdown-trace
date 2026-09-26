# Authoring and rebinding this corpus manifest

`manifest.json` is trusted input. A normal run of `scripts/demo-document-corpus.mjs` reads its analysis IDs, complete source identities, qualified root, and source-to-target bindings exactly as written. It passes those pins to `createCorpus`; it never copies identities from newly analyzed files into the manifest. A changed file therefore fails with `stale-capture` before any corpus query runs.

To intentionally rebind after an edit:

1. Review the changed source and its human revision label. A revision label alone does not identify captured bytes.
2. From the repository root, build once and inspect each changed file using the same path string as its manifest `documentId`; this command preserves that identity and prints the source identity, analysis ID, and occurrence ranges:

   ```sh
   npm run build
   cd examples/cross-document
   node ../../scripts/demo-document-graph.mjs task-a.md --profile profile.json --graph > /tmp/task-a.graph.json
   ```

   Use `plan.md` or `task-b.md` in the same command when those files change. Record the new `analysisId` and complete `source` identity in that capture's `expected` field after review.
   Return to the repository root (`cd ../..`) before running the routine corpus command below.
3. Reinspect each affected reference in the changed source. Record its current occurrence ID and source range, then edit the manifest binding's qualified source `analysisId`/`occurrenceId` or target `analysisId` deliberately.
4. Update every qualified query key that names the changed capture. Replace the old `analysisId` in affected `traversal.roots` entries and in `inspectEntity`, preserving each intended `identifier` after checking that its definition still exists. For this example, a plan edit requires `traversal.roots[0].analysisId`; a Task A edit requires `inspectEntity.analysisId`. Capture pins and binding updates alone do not update these query keys.
5. Review the new target and query keys, run the routine example command below and the packed consumer (`npm run check:package-exports`), and keep the source and profile bytes unchanged during each run. Confirm the selected path and inspected criterion name the intended captures.

For routine use, run `node scripts/demo-document-corpus.mjs examples/cross-document/manifest.json`. For the pinned example assertions and isolated stale/rebind demonstrations, add `--verify-example --exercise-edits`. The latter computes replacement identities only in memory and never writes trusted pins back to disk.

The `--exercise-edits` option is a demonstration of that deliberate authoring sequence, not a manifest generator. It first submits old pins and confirms `stale-capture`, then constructs a separate in-memory rebinding for review. It reports before/after pins, bindings, traversal roots, inspection keys, ranges, and the required authoring steps. It does not write the manifest or edited files. The packed check applies these reported updates to isolated edited copies and runs the normal manifest consumer. `manifest.expected` contains assertions for the original fixed fixture only; routine runs after authoring edits do not use `--verify-example` or `--exercise-edits`.

In the example, changing Task B bytes while retaining `Revision: 1` affects zero bindings. Inserting an earlier plan action changes plan identity and shifts the selected plan occurrence from O3 at 172–224 to O4 at 242–294, affecting one binding. Editing Task A criterion text changes its target capture identity and affects the same plan binding. Each stale manifest is rejected until its capture pin is deliberately updated.
