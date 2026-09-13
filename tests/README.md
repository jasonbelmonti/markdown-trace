# Test scope

Tests cover the [current implementation](../docs/current-implementation.md). Fixture vocabularies and table/registry assumptions are compatibility contracts, not the future document-graph language.

- Graph/profile/result/CLI/package tests cover the existing table graph and public boundary.
- Registry, link, sidecar, migration, and evidence tests protect the older workflow independently.
- `test_r0_extractor_evidence` runs private experimental code; it does not prove production extraction breadth. Its sibling-spec probe is conditional on that local file's existence.
- `docs/evidence/` payloads are source fixtures or exact expected reports; do not edit them merely to update guidance.

The [contract/corpus task](../docs/tasks/document-graph-contract.md) must establish independent expected entities, ownership, edges, diagnostics, backlinks, and context fragments across layouts. Do not copy expectations from the future extractor or remove compatibility assertions to conceal regressions.

Fixture `sourceDocs` strings may name removed documents. They are frozen historical loader/serialization data, not executable dependencies or current authority. Git baseline `016dd09` retains their source.
