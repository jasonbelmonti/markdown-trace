# Fixture scope

These files are inputs for existing registry/link and table-graph behavior. They do not prescribe the final language, artifact families, or relationship vocabulary. Read the [direction](../docs/design/markdown-trace-document-graph-overview.md) and [test guidance](../tests/README.md).

- `r0-document-local-registry/`: registry compatibility.
- `r1-link-backed-entity-syntax/`: trace-link/type-profile compatibility and generated sidecars.
- `profile-aware-graph-validation/`: table extraction, profiles, path checks, and CLI/API examples.

Use generated-sidecar check mode in CI. Historical source-path strings remain fixture data even when old guidance is removed. New document-wide fixtures follow the resolved contract/corpus task.
