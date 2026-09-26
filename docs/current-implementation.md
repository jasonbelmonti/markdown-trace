# Current implementation

Markdown Trace has one active runtime: the document-wide graph introduced in [PR #78](https://github.com/jasonbelmonti/markdown-trace/pull/78) and extended with shared source locations, profile validation, a document command, and a portable local release. The [authoring guide](experimental-document-graph.md), [validation guide](experimental-graph-validation.md), and [direction](design/markdown-trace-document-graph-overview.md) describe the current contract. The older table-profile validator and registry/sidecar workflows have been retired; Git history retains their implementation.

## Document-wide graph and queries

The package root and `experimental/graph` entry points export `compileProfile`, `analyzeDocument`, `lookupIdentifier`, `findIncoming`, `findOutgoing`, `traverseGraph`, `extractContext`, `exportMermaid`, `compileValidationProfile`, and `validateGraph`, with the context request, budget, bundle, part and omission types. Analysis uses Markdown Engine 3.6.0's public tree and source maps across headings, paragraphs, lists, blockquotes and tables under `markdown-trace.identity.draft2`. Standard Markdown links carry declarations (`?role=definition`) and typed references (`?rel=implements`) in `ctx://trace/entity/ID` destinations; bare IDs are generic mentions.

The immutable snapshot preserves declaration/mention distinctions, duplicate and missing definitions, unknown vocabulary, ambiguous ownership, source fragments and diagnostics. Incoming/outgoing indexes support source-ordered pagination and relationship filters. `traverseGraph` returns an immutable, analysis-bound breadth-first selection with canonical predecessor relationships and explicit depth, node and unresolved-edge boundaries. `extractContext` returns bounded, verbatim source parts with ranges, roles, inclusion reasons and explicit omissions from the captured analysis. Source-byte and occurrence limits bound analysis. Coverage and validity are distinct: invalid facts remain queryable, and partial extraction cannot pass validation. The versioned validation profile checks integrity, source annotation coverage, entity counts, allowed relations, and required relationships over the captured Engine document without a second parse.

## Explicit cross-document corpus

The same root and experimental graph entry points now export `createCorpus`, `lookupCorpusIdentifier`, `findCorpusIncoming`, `findCorpusOutgoing`, `traverseCorpus`, and `checkCorpusSelection`, with corpus DTO and error types. Callers supply issued analyses and trusted pins for each complete source identity, plus explicit occurrence-to-qualified-target bindings. The corpus preserves each local snapshot and validation result, identifies every cross-document edge by its original source occurrence, and rejects changed bytes under an unchanged human revision label as stale captures.

[`examples/cross-document/`](../examples/cross-document/) shows a plan table action bound to Task A's TD-SC-1 and its local CON-1 dependency, alongside Task B's colliding TD-SC-1 and an unlinked global obligation. The host keeps corpus paths, local validation, per-document excerpt bundles, and budget omissions separate. Corpus selection does not claim complete worker context. The manifest contains trusted pins; [authoring.md](../examples/cross-document/authoring.md) explains deliberate capture and binding updates after edits.

`npm run demo:graph` prints a mixed-layout summary and two located backlinks to `REQ-2`. `node scripts/demo-document-graph.mjs path/to/spec.md --graph` prints the full snapshot; `--profile path/to/profile.json` supplies domain vocabulary. `--mermaid` prints a diagram without re-extraction. Tests cover cross-layout links, malformed destinations, exact ranges, immutable handles, pagination, profile rules, exports, and packed-package consumption. This is correctness evidence, not a production-scale guarantee.

## Document command and skill

`markdown-trace-document` requires an explicit JSON validation profile. It supports validation reports, full graph JSON, incoming/outgoing queries, bounded source context JSON, Mermaid, visual HTML and standalone runtime identity. The [shared Trace skill](../skills/markdown-trace/SKILL.md) invokes it with a document-owned profile and optional domain guide. The package root exports the same graph API as the experimental subpath; the retired `validateGraphDocument` API and `markdown-trace` binary are absent.

```sh
node dist/markdowntrace/document-graph/cli.js \
  --file examples/preview-design/document.md \
  --profile examples/preview-design/profile.json \
  --format query --identifier REQ-1
```

The command reads local inputs and emits results to stdout/stderr. Report, graph, query, context, Mermaid and HTML formats have documented channels and exit codes in the [command guide](experimental-graph-validation.md#shared-command). HTML shows the graph, Engine-captured labels and definition context, and validation findings; diagram rendering loads Mermaid from a pinned CDN. Trace validation cannot prove that prose is factually correct or that a claimed check ran. Document-owner structural and semantic gates remain separate.

## Portable runtime and next work

The package remains private at 0.1.0. Its Node range is `^20.19.0 || >=22.12.0`, and it pins Markdown Engine 3.6.0. The [portable runtime guide](portable-runtime.md) covers committed-source candidate production, independent integrity verification, versioned local installation, explicit activation/rollback and executable binding. The installed skill package has consumer probes for valid, located-defect and repaired-pass outcomes. Previously produced releases remain identified by their source commit; retiring source code does not silently replace an installed release or Fleet pin.

Projection-policy verification, representative scale measurement, stable API approval and publication remain follow-up work. Explicit cross-document resolution and host composition are delivered experimentally as described above. The [task index](tasks/delegation-context/README.md) defines related capability contracts. Keep implementation over the document graph, not a recovered legacy registry or table model.
