# Markdown Trace

Markdown Trace is being developed into a document graph engine for complex Markdown specifications: discover identities and relationships throughout a document under a constrained syntax, validate relationships against developer-owned profiles, and query the graph for relevant source context.

**Document-wide graphs, backlinks and profile-driven validation are runnable.** The APIs are experimental; traversal and context assembly remain to be implemented. The table-profile validator and registry/sidecar workflows have been retired. The package is version `0.1.0`, guarded by `private: true`, and in development.

## Start here

1. [Current product direction](docs/design/markdown-trace-document-graph-overview.md)
2. [Implemented capabilities and limitations](docs/current-implementation.md)
3. [Runnable graph API and demo](docs/experimental-document-graph.md)
4. [Shared validation command and authoring skill](docs/experimental-graph-validation.md#shared-command)

The [documentation map](docs/README.md) identifies current guidance. Git history retains superseded code and plans; they do not define the current objective.

## Intended product

- A source-backed graph discovered across headings, paragraphs, lists, quotes, and tables.
- An explicit identity/declaration/reference language with deterministic ownership.
- Profile validation that preserves invalid or unresolved evidence for inspection.
- Queries for definitions, occurrences, incoming/outgoing references, and bounded traversal.
- Context extraction with source locations, inclusion reasons, and visible size limits.

Markdown Engine supplies Markdown structure and source locations. Markdown Trace owns graph interpretation, integrity, validation, and querying. The experimental API uses standard Markdown links for declarations and typed relationships, with constrained `ctx://trace/entity/ID` destinations; stable language and release compatibility remain later decisions.

## What runs today

The package root and `experimental/graph` entry points both expose document-wide analysis, direct queries, Mermaid export and [profile-driven validation](docs/experimental-graph-validation.md). `markdown-trace-document` is the local command for validation reports, graph JSON, incoming/outgoing queries, Mermaid and HTML. The [shared Trace skill](skills/markdown-trace/SKILL.md) invokes that command with a document-owned profile. Bounded traversal and context projection are follow-up work.

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

See the [experimental API guide](docs/experimental-document-graph.md) for link syntax, profile configuration and query examples.

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

This gate checks types, document-graph tests, build, packed-package consumers, the preview command and unintended repository changes. Use `npm run check:package-exports` when changing the package boundary. Passing existing tests does not prove traversal or context projection is implemented.

Read [AGENTS.md](AGENTS.md) and the [source map](src/markdowntrace/README.md) before implementation. Keep modules focused and work under `.worktrees/`. See [current implementation](docs/current-implementation.md) for the runnable boundary.
