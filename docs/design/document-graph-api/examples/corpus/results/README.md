# Expected API results

These EP-ACT-3 fixtures give all 79 manifest cases complete result DTOs for their named operations: 1,183 outcomes over 66 source snapshots, plus two explicitly injected API states. Read the [interface packet](../../../../markdown-trace-document-graph-interfaces.md) first. Its declarations own public shapes; the recommendations below supply the report and context details used by these examples. No proposed runtime API is implemented here.

## Files and execution

- [index.json](index.json) lists every case and operation. The parent manifest's `apiResults` field leads to each result record.
- `snapshots/` contains one public GraphSnapshot image per distinct source. Each record points to its original source annotation, snapshot and exact source hash.
- `cases/` contains complete `Outcome` images. Operations run in array order within a case. An omitted analysis argument means the case's primary analysis; `additionalSnapshots` names another source version. A selection argument names an earlier successful traversal operation. Arguments such as `profile`, `analysis` and `selection` are fixture bindings, not new public API fields.
- [profiles.json](profiles.json) records exact profile inputs: `example` mirrors `examples/profile.ts`; `language` isolates language/integrity from business obligations; `forbidden` has no allowed relations; `empty` permits an empty document; `changed` changes prefix interpretation. CASE-14's `inputMutation` applies to the caller's original input after compilation, before operations marked `afterInputMutation`.
- `states/` holds two CASE-13 model states. `partial` injects an unsupported-node finding; `warning` injects a parser warning. They preserve the base graph to isolate report precedence and query metadata. Their parser identities and messages explicitly identify injection; they are not parser results for that Markdown source.
- [interpretation-lock.json](interpretation-lock.json) preserves hashes of the 66 sources and 81 source annotations admitted by EP-GATE-1. These bytes remain unchanged.

Run from the repository root after `npm ci`:

```sh
node docs/design/document-graph-api/checks/check-examples.mjs
node docs/design/document-graph-api/checks/check-result-types.mjs
node --test docs/design/document-graph-api/checks/test-corpus.mjs
```

The first command reports each case, verifies source evidence and checks result consistency. The second checks every full DTO against the current declarations, including excess-field rejection. The tests deliberately corrupt evidence, results and inventories to confirm rejection. The checks never parse Markdown into an expected graph, write fixtures or call the proposed APIs. Runtime tests must later execute those APIs against these expectations.

## Identity bindings and provenance

`O1`, `R1` and `F1` retain the source annotation's local aliases. `@analysis:<source-sha>`, `@interpretation:standard`, `@validation:<profile-key>` and `@analyzer-version` are symbolic fixture bindings. They assert shared or different identities without prescribing hash serialization or runtime version strings. The two injected states use distinct `@analysis:model-…` and `@parser:model-…` bindings. Source SHA-256 values, sizes, coordinates and source text are actual values.

A future runtime harness must bind actual issued identities and record IDs to these aliases consistently within each analysis. A serialized profile image contains its three public identity fields; an analysis image contains its snapshot; a selection image contains its public fields. None contains a private brand or can be passed as a live handle. CASE-14's `json-copy` binding expressly models rejected fabricated handles. Error/diagnostic prose is illustrative; code, severity, provenance and outcomes carry the semantic expectation. Do not freeze message wording merely because it appears in a JSON image. Compiler failures still identify the offending field in their diagnostic message and the authored rule ID when applicable.

The source facts were independently interpreted in EP-GATE-1 before this result expansion. Result authoring used a temporary Python serializer over those frozen facts for redundant DTO joins, report bookkeeping and source slicing; scenario traversal selections and bounds were explicitly enumerated. The JavaScript checker was written separately and never imports the authoring helper. Its graph comes only from the source annotations. This is independence from extraction, not a claim that two reviewers independently authored or approved every new API result. The action evidence records the additional result walk; full consumer reconciliation and EP-GATE-2 remain subsequent work.

## Validation report recommendations

Analysis diagnostics contain malformed-language findings and unowned/ambiguous references, plus dependency findings when present. Definition/target/kind integrity findings are reported by validation. Thus a completely scanned dangling reference has complete coverage and can have zero analysis diagnostics while its validation report fails. A fragment with ambiguous ownership but no references also need not make analysis partial; its context omission is query-local.

Builtin reports appear in this order, followed by `profile.<id>` in profile order:

| Rule ID | Selected subjects | Failure or inconclusive condition |
| --- | --- | --- |
| integrity.language | Analysis diagnostics excluding owner findings | Malformed expressions fail; unsupported-node/parser errors are indeterminate; warnings pass |
| integrity.definitions | Labels with declarations | Duplicate declarations fail |
| integrity.targets | Reference relationships | Missing or duplicate target definitions fail |
| integrity.kinds | All identifier records | Unknown prefix/kind fails |
| integrity.owners | Reference relationships | Unowned or ambiguous source fails |
| policy.minEntities | Uniquely defined labels with known kind | Entity count below the explicit minimum |
| policy.allowedRelations | Reference relationships | Known endpoint kinds absent from the closed allowlist fail; unknown owner/kind is indeterminate unless a definite violation already exists |
| profile entity-count | Uniquely defined known labels of selected kinds | Count outside min/max; zero can fail |
| profile require-relation | Uniquely defined known source labels of selected kinds | Too few/many distinct uniquely resolved known targets of the specified kind/relation; zero sources is not-applicable |

Both subject counters equal the selected count in these fixtures: every selected subject is evaluated, including subjects whose evaluation is indeterminate. Repeated mentions do not satisfy a distinct-target minimum twice. An incomplete analysis makes an unmet lower bound indeterminate; an observed upper-bound violation still fails. A satisfied lower bound without a maximum passes; a finite upper bound remains indeterminate under incomplete coverage. Observed integrity/policy failures remain definite. Overall fail takes precedence, otherwise partial coverage or an indeterminate rule yields indeterminate, otherwise pass.

Diagnostics use the `markdown-trace.integrity.*`, `markdown-trace.policy.*` and `markdown-trace.profile.*` codes shown in the results, preserving source ranges and applicable identifiers. The report copies language/dependency diagnostics under `integrity.language`. Summary diagnostics are ordered by first range start, then rule ID and code; findings without ranges come first. Required obligations remain visible when their subject count is zero.

## Context recommendations

Use the frozen source-fragment partition. Fragments exclude their final line terminator; internal terminators remain. An identity-free table header and delimiter form one support fragment, including their joining newline. Take all exclusively owned fragments and transitive heading/header dependencies for an admitted entity. Do not add descendant-owned content.

Merge strictly overlapping intervals, preserving exact source bytes; touching ranges remain separate and gaps are never filled. `maxFragments` counts the final merged parts including support. Parts list `forIdentifiers` in selection order and roles in `owned-content`, `heading`, `table-header` order. Evaluate the whole candidate entity bundle against both final byte and part counts. Ambiguous definition ownership wins before budget evaluation; byte-budget wins when both numeric bounds fail.

CASE-11H's WP-2 bundle has exactly three parts and 127 UTF-8 bytes: its required heading, header/delimiter and row. A 126-byte budget omits the entire bundle; 127 bytes and three parts admit it; two parts omit it. CASE-11AZ records ownership omission even with zero budget. CASE-13 preserves CRLF and emoji rather than normalizing them.

The original large spec remains inventoried without adaptation. This corpus establishes concrete design expectations; it does not supply that spec's context-completeness oracle or performance measurements.
