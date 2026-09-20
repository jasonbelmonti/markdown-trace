# Markdown Trace

Markdown Trace is being developed into a document graph engine for complex Markdown specifications: discover identities and relationships throughout a document under a constrained syntax, validate relationships against developer-owned profiles, and query the graph for relevant source context.

**Document-wide graphs, backlinks and profile-driven validation are runnable.** The APIs are experimental; traversal and context assembly remain to be implemented. The repository also retains the table-based validator and registry/trace-link compatibility tools. The package is version `0.1.0`, guarded by `private: true`, and in development.

## Start here

1. [Current product direction](docs/design/markdown-trace-document-graph-overview.md)
2. [Implemented capabilities and limitations](docs/current-implementation.md)
3. [Runnable graph API and demo](docs/experimental-document-graph.md)
4. [Shared validation command and authoring skill](docs/experimental-graph-validation.md#shared-command)

The [documentation map](docs/README.md) identifies current guidance and retained test data. Superseded plans were removed; Git history retains them. Earlier YAML migration, automated-authoring, and release-only plans do not define the current objective.

## Intended product

- A source-backed graph discovered across headings, paragraphs, lists, quotes, and tables.
- An explicit identity/declaration/reference language with deterministic ownership.
- Profile validation that preserves invalid or unresolved evidence for inspection.
- Queries for definitions, occurrences, incoming/outgoing references, and bounded traversal.
- Context extraction with source locations, inclusion reasons, and visible size limits.

Markdown Engine supplies Markdown structure and source locations. Markdown Trace owns graph interpretation, integrity, validation, and querying. The experimental API uses standard Markdown links for declarations and typed relationships, with constrained `ctx://trace/entity/ID` destinations; stable language and release compatibility remain later decisions.

## What runs today

| Surface | Implemented boundary |
| --- | --- |
| `graph-validate` / `validateGraphDocument` | YAML profile loading, table-based relationship extraction, required-path checks, and JSON results. |
| `validate` | Registry-driven document validation. |
| `derive` | Registry/graph derivation using existing heading and `ctx://trace` conventions. |
| `derive-sidecar` | Generated registry writing and read-only stale/missing checks. |
| `migration-check` | Manual-versus-generated registry comparison. |
| `experimental/graph` | Document-wide analysis, direct queries, Mermaid export and [profile-driven validation](docs/experimental-graph-validation.md). |
| `markdown-trace-document` | Experimental command for profile validation, graph export and direct queries; used by the shared Trace skill. |
| Traversal and context projection | Follow-up work over the shared graph. |

The legacy table validator covers only its implemented checks. Empty/unrecognized documents can pass; duplicate definitions, dangling references, and ranges are not comprehensively validated. This is not a complete spec-validity verdict.

## Development setup

Requires Node.js `^20.19.0 || >=22.12.0` and npm. Install from the lockfile in the worktree where checks will run:

```sh
npm ci
npm run build
node dist/markdowntrace/cli.js --help
```

Run the document-wide graph and backlinks demonstration:

```sh
npm run demo:graph
# Full graph for your own document (after building):
node scripts/demo-document-graph.mjs "/absolute/path/to/spec.md" --graph > /tmp/markdown-trace-graph.json
```

See the [experimental API guide](docs/experimental-document-graph.md) for link syntax, profile configuration and query examples.

Run the existing table-profile demonstration:

```sh
node dist/markdowntrace/cli.js graph-validate \
  --file fixtures/profile-aware-graph-validation/first-slice/positive-execution-spec.md \
  --profile fixtures/profile-aware-graph-validation/profiles/valid-execution-spec.yaml
```

The package-root export is `validateGraphDocument({ documentPath, profilePath, cwd? })`. A built checkout can import it from `./dist/markdowntrace/public.js`. It returns the existing `pass`, `fail`, or `operational-error` result; it is not the proposed graph/query API.

## Validation and contribution

```sh
npm run ci:enforcement
```

This gate checks types, tests, build, registry/migration behavior, generated sidecars, and unintended repository changes. Use `npm run check:package-exports` when changing the package boundary. Passing existing tests does not prove the planned product is implemented.

Read [AGENTS.md](AGENTS.md) and the [source map](src/markdowntrace/README.md) before implementation. Keep modules focused, work under `.worktrees/`, and never hand-edit generated sidecars. See [current implementation](docs/current-implementation.md) for compatibility command examples.
