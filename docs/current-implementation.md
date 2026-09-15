# Current implementation

The first document-wide graph runtime is implemented on the merged PR #76 baseline (`9155cdd`). The [experimental API guide](experimental-document-graph.md) gives runnable examples. The [overview](design/markdown-trace-document-graph-overview.md) describes the broader target.

## Document-wide graph and direct queries

The `experimental/graph` package entry point exports `compileProfile`, `analyzeDocument`, `lookupIdentifier`, `findIncoming`, and `findOutgoing`. Analysis uses Markdown Engine's public tree and source maps across headings, paragraphs, lists, blockquotes and tables, under `markdown-trace.identity.draft1`.

The immutable snapshot preserves declaration/mention distinctions, duplicate and missing definitions, unknown vocabulary, ambiguous ownership, source fragments and diagnostics. Incoming/outgoing indexes support source-ordered pagination and relationship filters. Limits apply to source bytes and occurrence count. Analysis coverage and graph validity are separate: profile policy is compiled but not evaluated in this slice.

`npm run demo:graph` prints the mixed-layout graph and two located backlinks to `REQ-2`. Tests execute all 66 distinct sources in the independently annotated corpus, plus API ingress, immutability, pagination and clean-package consumption. This is initial correctness evidence, not release-scale or consuming-agent validation.

Graph validation, traversal, context projection, stable syntax/export approval and package publication remain follow-up work. The sections below describe the retained compatibility surfaces.

## Public API and CLI

The package-root JavaScript export is `validateGraphDocument({ documentPath, profilePath, cwd? })`, plus self-contained result types. It reads local files and returns `pass`, `fail`, or `operational-error` in `markdown-trace.graph-validation-result.v1`. The separate experimental entry point above provides analysis and direct queries; the root API remains the legacy table validator.

```sh
node dist/markdowntrace/cli.js graph-validate \
  --file <document.md> --profile <graph-profile.yaml> \
  [--output <result.json>] [--format json]
```

The profile argument is a file path, not a built-in alias. JSON is the only format. Completed pass/fail results go to stdout with exit 0/1. Profile/document/extraction operational failures use JSON on stderr with exit 2; invocation or output-transport failures use text on stderr with exit 2. Output writes are atomic and cannot alias inputs.

Help calls graph validation, help, and version stable commands. This identifies the existing pre-release interface boundary, not comprehensive graph verification. The manifest remains private; release and new-version compatibility are later work.

## Legacy extraction and validation limits

| Concern | Existing behavior | Remaining boundary |
| --- | --- | --- |
| Markdown coverage | Graph extraction iterates tables. | Common discovery and ownership across headings/prose/lists/quotes. |
| Identifiers | Uppercase hyphen-separated tokens filtered by profile regular expressions. | Canonical language; arbitrary lexical syntax is not supported today. |
| Definitions | A recognized primary ID in a configured column creates a definition. | General declaration/mention distinction and nested ownership. |
| Edges | Configured column pairs create forward-direction edges. | General relationship interpretation. |
| Selectors | Required columns are matched; heading selectors are not applied; reverse roles are skipped. | Complete operator support and explicit unsupported behavior. |
| Required paths | Matching primary nodes are checked; some source-selector details are ignored. | Complete source selection and integrity contract. |
| Vocabularies | Artifact families and relationship names are closed runtime enums. | Versioned, domain-owned vocabulary. |
| Integrity | Unresolved edges can be dropped; duplicates/ranges are not comprehensively diagnosed. | Preserve defects and report analysis completeness. |
| Matrices | Matrix-required-path profiles cause compatibility errors; completed results contain no matrix-coverage evaluations. | Matrix assertion implementation. |
| Query/context | No public surface. | Shared indexes, fragment ownership, queries, and projection. |

Controlled baseline probes showed the positive execution fixture passed and a removed required validation connection failed. Empty input, a duplicate objective, an extra dangling work reference, and an undefined prose range endpoint still passed. Zero evaluated paths do not establish spec validity. The legacy tests protect these compatibility boundaries. The new graph tests separately exercise document-wide behavior.

## Registry and trace-link compatibility

A separate workflow supports registry validation, heading definitions, section references, type profiles, `ctx://trace` links, generated sidecars, and migration comparison. It is not unified with the table graph validator.

```sh
node dist/markdowntrace/cli.js validate \
  --registry fixtures/r0-document-local-registry/entity-registry.yaml \
  --document fixtures/r0-document-local-registry/execution-spec.md

node dist/markdowntrace/cli.js derive \
  --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml

node dist/markdowntrace/cli.js derive-sidecar \
  --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml --check

node dist/markdowntrace/cli.js migration-check \
  --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md \
  --manual-registry fixtures/r1-link-backed-entity-syntax/minimal-link-backed-manual-registry.yaml \
  --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml
```

Omitting `--check` from `derive-sidecar` intentionally writes the generated artifact. Check mode fails on stale/missing bytes without rewriting them. Files under `.markdown-trace/generated/` stay generated. Existing YAML authority rules apply to this compatibility workflow and do not define the future graph.

## Implementation resumption

Reuse Markdown Engine integration, source locations, hashing, structured errors, atomic output, and package tests. Extend the experimental shared graph with profile validation and bounded context queries. Keep the legacy table-specific evidence model and closed vocabulary isolated until an explicit migration. Align release documentation/distribution after the contract is proven.
