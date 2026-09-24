# Source map

Read the [direction](../../docs/design/markdown-trace-document-graph-overview.md) and [implemented boundary](../../docs/current-implementation.md) before extending the runtime.

| Modules | Responsibility |
| --- | --- |
| `document-graph/contracts/` | Versioned inputs, graph snapshot, query, and validation result types. |
| `document-graph/` | Markdown Engine capture, draft2 interpretation, ownership, immutable graph and direct query indexes. |
| `document-graph/validation/` | Profile compilation and evaluation over the captured graph and source. |
| `document-graph/export/` | Mermaid and HTML presentation of captured facts and findings. |
| `document-graph/command.ts`, `cli.ts` | Local file and process adapters for the document command. |
| `runtime-metadata.ts`, `generated/` | Deterministic package, parser and source identity. |

The package root and `experimental/graph` export the same document-graph API. Context projection is the next boundary over the existing immutable snapshot. Use Markdown Engine's public API; do not add a second Markdown parser. The retired registry, sidecar and table-profile modules are available only in Git history and must not be reintroduced as dependencies.
