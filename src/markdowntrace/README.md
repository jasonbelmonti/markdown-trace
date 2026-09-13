# Source map

Read the [direction](../../docs/design/markdown-trace-document-graph-overview.md) and [implemented boundary](../../docs/current-implementation.md) before extending these modules.

| Modules | Existing responsibility | Directional boundary |
| --- | --- | --- |
| `markdown/` | Markdown Engine adapter, headings/sections, labels, trace links, source slicing | Reuse parser/source integration; current ownership is compatibility behavior. |
| `trace-evidence/` | Table-only graph evidence/hashing | Needs document-wide occurrences and ownership. Empty ranges/supplemental definitions are gaps. |
| `graph-profile/` | Closed v1 schema/vocabulary and examples | Schema acceptance differs from operator support; resolve the new contract first. |
| `graph-validation/` | File-backed operation and path evaluation | No comprehensive integrity or shared graph/query API. |
| `registry/`, `profiles/`, `validation/`, `migration/`, `graph/` | Registry, type-profile, link, sidecar, and migration compatibility | Retain behavior until explicitly migrated; this graph is a registry projection. |
| `public.ts`, `cli.ts`, `cli/` | Public types and transport | Preserve/version existing contracts; do not expose unimplemented target APIs. |
| `reporting/` | Registry-validation and migration reports | These are not graph repair plans or context results. |
| `runtime-metadata.ts`, `generated/` | Runtime/package identity | Retain deterministic metadata generation. |

The target responsibilities are language/interpretation, shared graph/indexes, validation, query, context projection, and thin public adapters. These describe planned boundaries, not modules that already exist.
