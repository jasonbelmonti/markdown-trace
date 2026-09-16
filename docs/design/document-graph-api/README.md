# Document graph API draft

**Current authoring convention:** The owner selected standard Markdown links on 2026-09-16. Use the [experimental guide](../../experimental-document-graph.md) and fixtures/document-graph for draft2. The brace-language fixtures and their checks below describe draft1 design evidence only; they no longer define runtime syntax or block implementation. The graph, validation, traversal and context interface proposals remain available here.

Start with the [interface packet](../markdown-trace-document-graph-interfaces.md). It defines proposed behavior and distinguishes review decisions from implementation gates. The declaration files under contracts/ remain design artifacts. The graph/direct-query subset is now runnable through the separate [experimental API](../../experimental-document-graph.md); validation, traversal and context signatures remain proposed.

The [consumer example](examples/consumer.ts) exercises the proposed analysis, validation, lookup, references, traversal and context signatures. The [profile example](examples/profile.ts) defines vocabulary as data. The [case ledger](examples/cases.md) and [expectations](examples/expectations.json) were authored independently of the extractor. Runtime tests now exercise the separate draft2 link fixtures; these draft1 source annotations are not runtime conformance evidence.

Run these checks from the repository root after npm ci:

```sh
./node_modules/.bin/tsc -p docs/design/document-graph-api/tsconfig.json
node docs/design/document-graph-api/checks/check-examples.mjs
node docs/design/document-graph-api/checks/probe-engine.mjs
```

The example check verifies source hashes, coordinates, ledger references and byte totals. It checks internal consistency of the hand-authored oracle, not extraction correctness. The Engine probe checks public tree/source feasibility on mixed Markdown, CRLF and emoji. Neither executes the proposed graph API.

[validation.json](validation.json) records the checks and artifact hashes. Recompute its artifact hashes before relying on a handoff; read the packet and its questions first. The packet also has an adjacent .sha256 file. The [materialized corpus](examples/corpus/README.md) contains all 55 language cases and 24 API scenarios, with source hashes, exhaustive occurrence/owner annotations and explicit diagnostics/exclusions. Its independent interpretation status is recorded in the gate evidence. The earlier closeout route assigns complete API-result expectations to EP-ACT-3. The owner subsequently authorized the [runnable graph slice](../../tasks/runnable-document-graph.md) independently of that route. Real-spec context/scale evidence remains outstanding.

The corpus materialization and full-source parser checks are separately reproducible:

```sh
node .codefactory/execution-plans/document-graph-contract-closeout/evidence/verify-materialization.mjs
node .codefactory/execution-plans/document-graph-contract-closeout/evidence/probe-corpus-sources.mjs
```
