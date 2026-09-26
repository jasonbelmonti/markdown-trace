# Markdown Trace

Markdown Trace is being developed into a document graph engine for complex Markdown specifications: discover identities and relationships throughout a document under a constrained syntax, validate relationships against developer-owned profiles, and query the graph for relevant source context.

**Document-wide graphs, backlinks, profile-driven validation, bounded traversal and source-context projection are runnable.** The public npm release is version `0.1.1`. The table-profile validator and registry/sidecar workflows have been retired.

## Install and use

Requires Node.js `^20.19.0 || >=22.12.0`.

```sh
npm install @jasonbelmonti/markdown-trace
npx markdown-trace-document --help
npx markdown-trace-document --file document.md --profile profile.json --format report
```

Use an explicit validation profile for your document. Retrieve related source with
bounded traversal and excerpt budgets:

```sh
npx markdown-trace-document --file document.md --profile profile.json \
  --format context --root REQ-1 --direction outgoing \
  --max-depth 2 --max-nodes 20 --max-utf8-bytes 12000 --max-fragments 40
```

JavaScript and TypeScript consumers import from `@jasonbelmonti/markdown-trace`.
The existing `experimental/graph` subpath remains a compatibility alias; protocol
identifiers retain their existing version strings. Cross-document traversal uses
the JavaScript API and explicit captures/bindings; it is not a document CLI mode.
Source excerpts preserve locations and omissions, but do not establish complete
worker context or semantic correctness.

Fleet users continue to consume their exact pinned portable runtime. Installing
this npm package does not change Fleet's runtime policy or Codex's binding.

## Start here

1. [Current product direction](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/design/markdown-trace-document-graph-overview.md)
2. [Implemented capabilities and limitations](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/current-implementation.md)
3. [Runnable graph API and demo](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/experimental-document-graph.md)
4. [Shared validation command and authoring skill](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/experimental-graph-validation.md#shared-command)

The [documentation map](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/README.md) identifies current guidance. Git history retains superseded code and plans; they do not define the current objective.

## Intended product

- A source-backed graph discovered across headings, paragraphs, lists, quotes, and tables.
- An explicit identity/declaration/reference language with deterministic ownership.
- Profile validation that preserves invalid or unresolved evidence for inspection.
- Queries for definitions, occurrences, incoming/outgoing references, and bounded traversal.
- Context extraction with source locations, inclusion reasons, and visible size limits.

Markdown Engine supplies Markdown structure and source locations. Markdown Trace owns graph interpretation, integrity, validation, and querying. The API uses standard Markdown links for declarations and typed relationships, with constrained `ctx://trace/entity/ID` destinations.

## What runs today

The package root and `experimental/graph` entry points both expose document-wide analysis, direct queries, Mermaid export, [profile-driven validation](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/experimental-graph-validation.md), bounded traversal and context projection. The [API guide](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/experimental-document-graph.md#api-example) shows how to traverse a graph and retrieve exact source parts with explicit budgets. `markdown-trace-document` is the local command for validation reports, graph JSON, incoming/outgoing queries, [bounded context JSON](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/experimental-graph-validation.md#source-context-projection), Mermaid and HTML. The [shared Trace skill](https://github.com/jasonbelmonti/markdown-trace/blob/main/skills/markdown-trace/SKILL.md) invokes that command with a document-owned profile.

## Development setup

Requires Node.js `^20.19.0 || >=22.12.0` and npm. Install from the lockfile in the worktree where checks will run:

```sh
npm ci
npm run build
node dist/markdowntrace/document-graph/cli.js --help
```

Run the document-wide graph and backlinks demonstration:

```sh
npm run demo:graph
# Full graph for your own document (after building):
node scripts/demo-document-graph.mjs "/absolute/path/to/spec.md" --graph > /tmp/markdown-trace-graph.json
```

See the [API guide](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/experimental-document-graph.md) for link syntax, profile configuration and query examples.

Validate the bundled preview document:

```sh
node dist/markdowntrace/document-graph/cli.js \
  --file examples/preview-design/document.md \
  --profile examples/preview-design/profile.json \
  --format report
```

## Validation and contribution

```sh
npm run ci:enforcement
```

This gate checks types, document-graph tests, build, packed-package consumers, the preview command and unintended repository changes. Use `npm run check:package-exports` when changing the package boundary. Packed consumers exercise the root and experimental APIs, including traversal and context projection.

Read [AGENTS.md](https://github.com/jasonbelmonti/markdown-trace/blob/main/AGENTS.md) and the [source map](https://github.com/jasonbelmonti/markdown-trace/blob/main/src/markdowntrace/README.md) before implementation. Keep modules focused and work under `.worktrees/`. See [current implementation](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/current-implementation.md) for the runnable boundary.
