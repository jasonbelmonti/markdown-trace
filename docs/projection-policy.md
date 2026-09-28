# Experimental projection policy

Markdown Trace can produce a source-backed context packet for an explicit assignment and verify it against independently supplied source, profile, policy, runtime and binding expectations. A policy names required graph paths and source selections. Required content is admitted together; a budget or incomplete search cannot turn a missing obligation into a satisfied result. Optional content may be omitted with an accounting record.

The [single-source and corpus examples](../examples/projection-policy/) contain reviewed, static manifests. Each manifest pins the expected policy identity, producer version, original source captures and validation profiles. The CLI reads those files relative to the manifest. It does not refresh pins or write inputs. To inspect a case from this checkout after `npm run build`:

`markdown-trace.projection-policy.v1` provides three rule forms. `source` selects one named source's whole document, exact Engine section path, or exact block range. `entities` selects explicit qualified identifiers. `expand` follows specified relationship kinds and direction from roots or a prior rule, in one step or bounded closure. An expansion declares subject kinds, minimum subjects/neighbors, maximum depth and maximum nodes. Every rule marks its selection `required` or `optional`; every source has an explicit validation gate. Unknown fields, versions, operators, selectors and invalid bounds are rejected. The typed [contract](design/projection-policy/contracts.ts) gives the complete field shapes.

```sh
node dist/markdowntrace/document-graph/cli.js --projection-manifest examples/projection-policy/single/manifest.json > packet.json
node dist/markdowntrace/document-graph/cli.js --verify-projection packet.json --projection-manifest examples/projection-policy/single/manifest.json
node dist/markdowntrace/document-graph/cli.js --projection-manifest examples/projection-policy/corpus/manifest.json > corpus-packet.json
node dist/markdowntrace/document-graph/cli.js --verify-projection corpus-packet.json --projection-manifest examples/projection-policy/corpus/manifest.json
```

The installed command has the same forms as `markdown-trace-document`. Production emits one compact packet JSON value on stdout without a trailing newline. Verification emits a separate compact report. Exit 0 means policy satisfaction or verification pass; exit 1 means an unsatisfied policy, failed or stale verification; exit 2 means an operation or invocation error with empty stdout and structured stderr. Preserve the entire packet bytes when testing exact wire limits.

These manifests target Trace 0.1.4 with Markdown Engine 5.0.0. Their previous Engine 3.6.0 captures were compared with fresh Engine 5 captures: graph facts, source ranges and validation outcomes were unchanged; parser versions and analysis IDs changed. Trusted producer identities, capture pins and qualified bindings were then updated deliberately. Older manifests remain stale, even when source bytes match. After a runtime upgrade, inspect fresh captures and update expectations explicitly before producing a new packet; production and verification never perform this migration automatically.

The [copied example runner](../examples/projection-policy/run.mjs) exercises both public package entry points and the installed command outside the checkout during `npm run check:package-exports`. Its independent expected excerpts, offsets and source aliases are transcribed from the source fixtures. For the bounded single fixture, 11 required parts contain 551 UTF-8 source bytes from 697 original bytes; the optional background is absent. The corpus fixture selects 541 source bytes from 693 original bytes across three sources, includes Task A's global sections and qualified dependency, and excludes Task B's colliding criterion. The complete compact packets are much larger: 11,437 and 13,902 UTF-8 bytes in the checked run. These are fixture measurements, not a model token, cost, comprehension or productivity result.

## Copied fixture defect and repair

Run these commands from an installed consumer that has copied `examples/projection-policy/` and has the package binary in `node_modules/.bin`. They edit only disposable copies. The `repin-disposable.mjs` command is an explicit authoring step for a copied defect; normal production and verification retain the reviewed manifest pins.

```sh
cp -R examples/projection-policy/single projection-defect-global
python3 - <<'PY'
from pathlib import Path
p = Path('projection-defect-global/task.md')
p.write_text(p.read_text().replace('## Scope\n\nThe selected task has a narrow objective.\n\n', ''))
PY
node node_modules/.bin/markdown-trace-document --projection-manifest projection-defect-global/manifest.json > projection-defect-global/packet.json
# Exit 2, stale-input: the reviewed source pin still names the original bytes.
node examples/projection-policy/repin-disposable.mjs projection-defect-global
node node_modules/.bin/markdown-trace-document --projection-manifest projection-defect-global/manifest.json > projection-defect-global/packet.json
# Exit 1, unsatisfied: the required Scope section is missing after deliberate repinning.
cp examples/projection-policy/single/task.md projection-defect-global/task.md
node examples/projection-policy/repin-disposable.mjs projection-defect-global
node node_modules/.bin/markdown-trace-document --projection-manifest projection-defect-global/manifest.json > projection-defect-global/packet.json
# Exit 0. Verify the restored packet with --verify-projection and the copied manifest.
```

The executable [defect demonstration](../examples/projection-policy/defect-demo.mjs) performs the missing-edge, short-budget, tampered-packet and restored-pass sequences, plus a corpus missing-global sequence, using disposable copies. It records before/after SHA-256 values for every source, profile, policy and manifest around each CLI operation; its explicit repin records the deliberate manifest change. Run it from a consumer with the package installed:

```sh
node examples/projection-policy/run.mjs @jasonbelmonti/markdown-trace
node examples/projection-policy/defect-demo.mjs @jasonbelmonti/markdown-trace
```

Both commands are also run with `@jasonbelmonti/markdown-trace/experimental/graph` by the packed package harness. `defect-demo.mjs` asserts stale input before repinning, unsatisfied policy after repinning, failed verification after packet tampering, and success after restoring each copy. The runner prints the exact input hashes and channel byte counts for inspection.

The runtime reports graph validation and satisfaction of the **declared** projection policy. A supervisor still reads the complete controlling sources, determines which obligations apply, checks whether this policy captures them, and authorizes any scoped handoff through its owning workflow. Verification cannot establish semantic sufficiency, task readiness or permission to skip a required full read. Installed runtime or skill activation and package publication are separate decisions.
