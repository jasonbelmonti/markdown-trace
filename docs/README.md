# Documentation map

The current direction is a document-wide graph for relationship validation and context queries.

| Document | Purpose |
| --- | --- |
| [Document graph overview](design/markdown-trace-document-graph-overview.md) | Current direction, resolved language decisions and remaining capabilities. |
| [Document graph API draft](design/markdown-trace-document-graph-interfaces.md) | Implemented graph and validation boundaries plus proposed traversal/context contracts. |
| [Current implementation](current-implementation.md) | What the code does and where it falls short. |
| [Experimental graph guide](experimental-document-graph.md) | Runnable API, demo, syntax and current limits. |
| [Profile validation and shared skill](experimental-graph-validation.md) | Generic command, domain-owned profiles, skill composition and runnable examples. |
| [Shared runtime contract](design/shared-trace-runtime-contract.md) | Executable, binding, identity and Fleet admission contracts; future delivery boundaries are explicit. |
| [Portable runtime guide](portable-runtime.md) | Local artifact production, independent integrity verification and isolated execution. |
| [Portable runtime task](tasks/portable-trace-runtime.md) | Selected artifact implementation and evidence boundary. |
| [Shared runtime task](tasks/shared-runtime-contract.md) | Completed contract-authoring and Engine 3.6.0 upgrade foundation. |
| [Runnable graph task](tasks/runnable-document-graph.md) | Delivered graph/query slice and retained acceptance evidence. |
| [Source map](../src/markdowntrace/README.md) | Existing responsibilities and reuse boundaries. |
| [Test guidance](../tests/README.md) | Compatibility tests versus future product proof. |

The overview and interface packet have adjacent SHA-256 files and current structural records in [overview validation](validation/artifacts.json) and [interface validation](design/document-graph-api/validation.json). The runnable task has its own [structural record](validation/runnable-document-graph.json) and adjacent checksum. Verify from the repository root with `shasum -a 256 -c <checksum-file>` before durable handoff. Structural validation and declaration compilation do not mean proposed behavior is implemented.

The 2026-09-16 baseline uses draft2 standard Markdown links and the runnable graph. Superseded contract-only tasks, execution plans, brace-language corpus, standalone probes and historical review packets are removed. There are no archives or redirect stubs; Git history retains the old work. PR #77 is an unmerged predecessor based on those superseded artifacts and is not a dependency or implementation authority.

[Evidence payloads](evidence/README.md) remain only where tests or fixture commands consume them. Old path strings inside those payloads are historical provenance, not current guidance links.
