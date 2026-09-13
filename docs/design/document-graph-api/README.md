# Document graph API draft

Start with the [interface packet](../markdown-trace-document-graph-interfaces.md). It defines proposed behavior and distinguishes review decisions from implementation gates. The declaration files under contracts/ are design artifacts; they do not expose runnable package APIs.

The [consumer example](examples/consumer.ts) exercises the proposed analysis, validation, lookup, references, traversal and context signatures. The [profile example](examples/profile.ts) defines vocabulary as data. The [case ledger](examples/cases.md) and [expectations](examples/expectations.json) were authored independently of an extractor, which has not been implemented.

Run these checks from the repository root after npm ci:

```sh
./node_modules/.bin/tsc -p docs/design/document-graph-api/tsconfig.json
node docs/design/document-graph-api/checks/check-examples.mjs
node docs/design/document-graph-api/checks/probe-engine.mjs
```

The example check verifies source hashes, coordinates, ledger references and byte totals. It checks internal consistency of the hand-authored oracle, not extraction correctness. The Engine probe checks public tree/source feasibility on mixed Markdown, CRLF and emoji. Neither executes the proposed graph API.

[validation.json](validation.json) records the checks and artifact hashes. Recompute its artifact hashes before relying on a handoff; read the packet and its questions first. The packet also has an adjacent .sha256 file. The full lexical/ownership corpus and real-spec context/scale evidence remain outstanding.
