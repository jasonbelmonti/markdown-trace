# Current implementation

Inspected baseline: `016dd0905d9f8103dc4dbd528e0b9fc15b516723`, 2026-09-13. This page describes existing code. The [overview](design/markdown-trace-document-graph-overview.md) describes the target; the [next task](tasks/document-graph-contract.md) resolves language and API contracts.

## Public API and CLI

The package-root JavaScript export is `validateGraphDocument({ documentPath, profilePath, cwd? })`, plus self-contained result types. It reads local files and returns `pass`, `fail`, or `operational-error` in `markdown-trace.graph-validation-result.v1`. No public graph-analysis, backlinks, traversal, or context API exists.

```sh
node dist/markdowntrace/cli.js graph-validate \
  --file <document.md> --profile <graph-profile.yaml> \
  [--output <result.json>] [--format json]
```

The profile argument is a file path, not a built-in alias. JSON is the only format. Completed pass/fail results go to stdout with exit 0/1. Profile/document/extraction operational failures use JSON on stderr with exit 2; invocation or output-transport failures use text on stderr with exit 2. Output writes are atomic and cannot alias inputs.

Help calls graph validation, help, and version stable commands. This identifies the existing pre-release interface boundary, not comprehensive graph verification. The manifest remains private; release and new-version compatibility are later work.

## Extraction and validation limits

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

Controlled baseline probes showed the positive execution fixture passed and a removed required validation connection failed. Empty input, a duplicate objective, an extra dangling work reference, and an undefined prose range endpoint still passed. Zero evaluated paths do not establish spec validity. The 219 existing tests protect implemented boundaries, not the proposed product.

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

Reuse Markdown Engine integration, source locations, hashing, structured errors, atomic output, and package tests. Redesign the table-specific evidence model and closed vocabulary through the current contract task. Deliver document-wide lookup/backlinks early, then profile validation and bounded context queries over the same graph. Align release documentation/distribution after the contract is proven.
