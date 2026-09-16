# Test scope

Tests cover the [current implementation](../docs/current-implementation.md). Fixture vocabularies and table/registry assumptions are compatibility contracts, not the future document-graph language.

- Graph/profile/result/CLI tests cover the existing table graph. Package tests exercise both the legacy root and experimental graph entry points.
- `test_document_graph_links` exercises standard links across layouts, Engine-resolved references, malformed URIs and exact source locations; `test_document_graph_api` covers runtime input, ownership, immutable handles and pagination.
- Registry, link, sidecar, migration, and evidence tests protect the older workflow independently.
- `test_r0_extractor_evidence` runs private experimental code; it does not prove production extraction breadth. Its sibling-spec probe is conditional on that local file's existence.
- `docs/evidence/` payloads are source fixtures or exact expected reports; do not edit them merely to update guidance.

The [runnable graph task](../docs/tasks/runnable-document-graph.md) uses the current link fixtures under fixtures/document-graph. Superseded draft1 brace-language design annotations were removed. Exact runtime fragment partitioning and future context projection are not asserted by the source-fact comparison. Do not copy expectations from the future extractor or remove compatibility assertions to conceal regressions.

Fixture `sourceDocs` strings may name removed documents. They are frozen historical loader/serialization data, not executable dependencies or current authority. Git baseline `016dd09` retains their source.
