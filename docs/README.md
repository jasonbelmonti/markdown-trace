# Documentation map

The current direction is a document-wide graph for relationship validation and context queries.

| Document | Purpose |
| --- | --- |
| [Document graph overview](design/markdown-trace-document-graph-overview.md) | Direction, boundaries, decisions, and delivery sequence. |
| [Document graph API draft](design/markdown-trace-document-graph-interfaces.md) | Proposed types, validation/query/context contracts, examples, and unresolved language decisions. |
| [Current implementation](current-implementation.md) | What the code does and where it falls short. |
| [Contract and corpus task](tasks/document-graph-contract.md) | Next bounded work; product implementation follows its resolved contract. |
| [Source map](../src/markdowntrace/README.md) | Existing responsibilities and reuse boundaries. |
| [Test guidance](../tests/README.md) | Compatibility tests versus future product proof. |

The overview and task have adjacent SHA-256 files and [structural validation evidence](validation/artifacts.json). Verify from the repository root with `shasum -a 256 -c <checksum-file>` before durable handoff. Review and structural-validation status do not mean proposed behavior is implemented.

Superseded designs, execution plans, unused reports, provisional profiles, and old tracked agent packets were removed in the 2026-09-13 alignment pass. There are no repository archives or redirect stubs. Historical source is recoverable from Git commit `016dd0905d9f8103dc4dbd528e0b9fc15b516723`.

[Evidence payloads](evidence/README.md) remain only where tests or fixture commands consume them. Old path strings inside those payloads are historical provenance, not current guidance links.
