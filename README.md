# Markdown Trace

Markdown Trace is being developed into a document graph engine for complex Markdown specifications: discover identities and relationships throughout a document under a constrained syntax, validate relationships against developer-owned profiles, and query the graph for relevant source context.

**Document-wide graphs, backlinks, profile-driven validation, bounded traversal and source-context projection are runnable.** Version `0.1.4` uses Markdown Engine `5.0.0`. The table-profile validator and registry/sidecar workflows have been retired.

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

For a concise exact-text view, a runtime whose help lists `context-text` also
accepts the same selection options with `--format context-text --report-file
context-report.json`. It creates the full JSON report before displaying verbatim
excerpts, source locations, validation status, limits and omissions. Choose a new
report path in an existing directory; existing files are never overwritten.
This format is available starting with version 0.1.2; older pinned runtimes
require an explicit update. See the
[context-text guide](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/experimental-graph-validation.md#exact-text-context-view).

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

The package root and `experimental/graph` entry points both expose document-wide analysis, direct queries, Mermaid export, [profile-driven validation](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/experimental-graph-validation.md), bounded traversal and context projection. The [API guide](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/experimental-document-graph.md#api-example) shows how to traverse a graph and retrieve exact source parts with explicit budgets. `markdown-trace-document` is the local command for validation reports, graph JSON, incoming/outgoing queries, [bounded context JSON and exact-text views](https://github.com/jasonbelmonti/markdown-trace/blob/main/docs/experimental-graph-validation.md#source-context-projection), Mermaid and HTML. The [shared Trace skill](https://github.com/jasonbelmonti/markdown-trace/blob/main/skills/markdown-trace/SKILL.md) invokes that command with a document-owned profile.

## Interactive explorer

Build this checkout, then export a self-contained HTML document:

```sh
node dist/markdowntrace/document-graph/cli.js \
  --file document.md --profile profile.json --format explorer > design-explorer.html
```

Open the file in a browser. React Flow and ELK layout are bundled, so it works
offline. Choose an entity, then explore its incoming/outgoing neighborhood with
depth, relationship-kind and entity-kind filters. Heading nodes start hidden.
The graph draws at most 100 nodes and 240 grouped edges; repeated relationships
show occurrence counts. The inspector retains direct references and source
evidence even when the referenced entity is outside the view. Exports contain
the captured source and its path, so share them as you would the source document.

**Options** focuses one `option` and can exclude the others from traversal.
An option is labeled source-selected only when its unique definition has one
table column named `Status` whose value is exactly `Selected` (case insensitive).
A unique selected option becomes the initial focus. Manual focus does not change
source status. **Risks** uses `risk` entities. **Delivery checks** lists
`validation`, `check`, `question` and `open-question` entities; it does not infer
a schedule, successful verification or readiness. Other profile vocabularies
remain available through **Explore**. Generic `references` remain generic links.

The explorer is a read-only view of one analysis, with literal source inspection,
Trace findings, a grid fallback when layout fails, and readable evidence when
JavaScript is disabled. It does not edit Markdown or infer missing domain
relationships. Existing `--format html` keeps its Mermaid report behavior.
This checkout adds `explorer`; use `--help` to check whether an installed or
Fleet-pinned runtime includes it. Building here does not activate or publish it.

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
