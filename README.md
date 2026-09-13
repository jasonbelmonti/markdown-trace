# Markdown Trace

Markdown Trace is being developed into a document graph engine for complex Markdown specifications: discover identities and relationships throughout a document under a constrained syntax, validate relationships against developer-owned profiles, and query the graph for relevant source context.

**The complete document graph is not implemented yet.** Today the repository provides a table-based graph validator and separate registry/trace-link compatibility tools. The package is version `0.1.0`, guarded by `private: true`, and in development.

## Start here

1. [Current product direction](docs/design/markdown-trace-document-graph-overview.md)
2. [Implemented capabilities and limitations](docs/current-implementation.md)
3. [Next task: document graph contract and corpus](docs/tasks/document-graph-contract.md)

The [documentation map](docs/README.md) identifies current guidance and retained test data. Superseded plans were removed; Git history retains them. Earlier YAML migration, automated-authoring, and release-only plans do not define the current objective.

## Intended product

- A source-backed graph discovered across headings, paragraphs, lists, quotes, and tables.
- An explicit identity/declaration/reference language with deterministic ownership.
- Profile validation that preserves invalid or unresolved evidence for inspection.
- Queries for definitions, occurrences, incoming/outgoing references, and bounded traversal.
- Context extraction with source locations, inclusion reasons, and visible size limits.

Markdown Engine supplies Markdown structure and source locations. Markdown Trace owns graph interpretation, integrity, validation, and querying. Exact syntax, ownership rules, and new API/schema versions remain decisions in the next task.

## What runs today

| Surface | Implemented boundary |
| --- | --- |
| `graph-validate` / `validateGraphDocument` | YAML profile loading, table-based relationship extraction, required-path checks, and JSON results. |
| `validate` | Registry-driven document validation. |
| `derive` | Registry/graph derivation using existing heading and `ctx://trace` conventions. |
| `derive-sidecar` | Generated registry writing and read-only stale/missing checks. |
| `migration-check` | Manual-versus-generated registry comparison. |
| Document-wide graph, backlinks, context API | Planned; unavailable in the current public package. |

A graph-validation pass covers only implemented checks. Empty/unrecognized documents can pass; duplicate definitions, dangling references, and ranges are not comprehensively validated. This is not a complete spec-validity verdict.

## Development setup

Requires Node.js `^20.19.0 || >=22.12.0` and npm. Install from the lockfile in the worktree where checks will run:

```sh
npm ci
npm run build
node dist/markdowntrace/cli.js --help
```

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
