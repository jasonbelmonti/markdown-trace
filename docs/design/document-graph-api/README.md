# Document graph API draft

Start with the [interface packet](../markdown-trace-document-graph-interfaces.md). It defines proposed behavior and distinguishes review decisions from implementation gates. The declaration files under contracts/ are design artifacts; they do not expose runnable package APIs.

The [consumer example](examples/consumer.ts) exercises the proposed analysis, validation, lookup, references, traversal and context signatures. The [profile example](examples/profile.ts) defines vocabulary as data. The [case ledger](examples/cases.md) and [expectations](examples/expectations.json) were authored independently of an extractor, which has not been implemented.

Run these checks from the repository root after npm ci:

```sh
./node_modules/.bin/tsc -p docs/design/document-graph-api/tsconfig.json
node docs/design/document-graph-api/checks/check-examples.mjs
node docs/design/document-graph-api/checks/check-result-types.mjs
node --test docs/design/document-graph-api/checks/test-corpus.mjs
node docs/design/document-graph-api/checks/probe-engine.mjs
```

The example check covers all 79 cases and 1,183 operation outcomes, including exact source coordinates, invalid evidence, validation counts, backlinks, traversal bounds and context bytes. DTO checks compare full result images with the declarations; corruption tests exercise checker rejection. The Engine probe checks public tree/source feasibility on mixed Markdown, CRLF and emoji. These checks do not execute the proposed graph API.

[validation.json](validation.json) records the checks and artifact hashes. Recompute its artifact hashes before relying on a handoff; read the packet and its questions first. The packet also has an adjacent .sha256 file. The [materialized corpus](examples/corpus/README.md) contains all 55 language cases and 24 API scenarios, with independently reviewed source interpretations. Its [API results guide](examples/corpus/results/README.md) explains complete result images, symbolic identity bindings, injected states and recommended report/context conventions. EP-ACT-3 is complete; EP-ACT-4 reconciles the consumer and compatibility boundary before EP-GATE-2. Owner decisions and real-spec context/scale evidence remain outstanding.

The corpus materialization and full-source parser checks are separately reproducible:

```sh
node .codefactory/execution-plans/document-graph-contract-closeout/evidence/verify-materialization.mjs
node .codefactory/execution-plans/document-graph-contract-closeout/evidence/probe-corpus-sources.mjs
```
