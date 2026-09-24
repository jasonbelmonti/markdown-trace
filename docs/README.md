# Documentation map

The current direction is a document-wide graph for relationship validation and context queries.

| Document | Purpose |
| --- | --- |
| [Document graph overview](design/markdown-trace-document-graph-overview.md) | Current direction, resolved language decisions and remaining capabilities. |
| [Document graph API draft](design/markdown-trace-document-graph-interfaces.md) | Implemented graph and validation boundaries plus proposed traversal/context contracts. |
| [Current implementation](current-implementation.md) | What the code does and where it falls short. |
| [Experimental graph guide](experimental-document-graph.md) | Runnable API, demo, syntax and current limits. |
| [Profile validation and shared skill](experimental-graph-validation.md) | Generic command, domain-owned profiles, skill composition and runnable examples. |
| [Shared runtime contract](design/shared-trace-runtime-contract.md) | Historical delivery contract for the portable runtime; its legacy-preservation clauses were superseded by owner-directed retirement. |
| [Portable runtime guide](portable-runtime.md) | Local artifact production, independent integrity verification and isolated execution. |
| [Portable runtime task](tasks/portable-trace-runtime.md) | Completed artifact implementation and historical evidence boundary. |
| [Shared runtime task](tasks/shared-runtime-contract.md) | Completed contract-authoring and Engine 3.6.0 upgrade foundation. |
| [Runnable graph task](tasks/runnable-document-graph.md) | Delivered graph/query slice and retained acceptance evidence. |
| [Context capability tasks](tasks/delegation-context/README.md) | Proposed traversal, projection, cross-document resolution and policy verification work. |
| [Source map](../src/markdowntrace/README.md) | Existing responsibilities and reuse boundaries. |
| [Test guidance](../tests/README.md) | Current graph, package and runtime proof boundaries. |

The overview and interface packet have adjacent SHA-256 files and current structural records in [overview validation](validation/artifacts.json) and [interface validation](design/document-graph-api/validation.json). The runnable task has its own [structural record](validation/runnable-document-graph.json) and adjacent checksum. Verify from the repository root with `shasum -a 256 -c <checksum-file>` before durable handoff. Structural validation and declaration compilation do not mean proposed behavior is implemented.

The active implementation uses draft2 standard Markdown links and the document-wide graph. The table-profile validator, registry/sidecar commands, their fixture and evidence families, and their tests were retired. Completed task and validation records may still describe the older state; their source pins identify historical evidence, not current implementation authority. Git history retains removed material.
