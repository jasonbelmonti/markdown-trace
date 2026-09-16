# Source map

Read the [direction](../../docs/design/markdown-trace-document-graph-overview.md) and [implemented boundary](../../docs/current-implementation.md) before extending these modules.

| Modules | Existing responsibility | Directional boundary |
| --- | --- | --- |
| `document-graph/` | Experimental document-wide extraction, immutable graph and direct query indexes | Validation and context projection are follow-up work over these facts. |
| `markdown/` | Markdown Engine adapter, headings/sections, labels, trace links, source slicing | Reuse parser/source integration; current ownership is compatibility behavior. |
| `trace-evidence/` | Table-only graph evidence/hashing | Retained compatibility model; new document-wide facts live in document-graph/. |
| `graph-profile/` | Closed v1 schema/vocabulary and examples | Retained legacy profiles; document-graph/ owns the extensible new profile contract. |
| `graph-validation/` | File-backed operation and path evaluation | Retained table/path checks; implement new graph validation over document-graph/, not these table anchors. |
| `registry/`, `profiles/`, `validation/`, `migration/`, `graph/` | Registry, type-profile, link, sidecar, and migration compatibility | Retain behavior until explicitly migrated; this graph is a registry projection. |
| `public.ts`, `cli.ts`, `cli/` | Public types and transport | Preserve/version existing contracts; do not expose unimplemented target APIs. |
| `reporting/` | Registry-validation and migration reports | These are not graph repair plans or context results. |
| `runtime-metadata.ts`, `generated/` | Runtime/package identity | Retain deterministic metadata generation. |

The target responsibilities are language/interpretation, shared graph/indexes, validation, query, context projection, and thin public adapters. The experimental graph implements interpretation and direct queries; validation and context projection remain to be added.
