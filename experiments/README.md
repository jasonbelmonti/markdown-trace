# Experiments

The [packaged profile-driven validation API](../docs/experimental-graph-validation.md) checks
annotation coverage and relationships using external JSON rules over public
Engine and Trace APIs. The opt-in [TaskDefinition trial](task-definition-trace/README.md)
is its runnable consumer and proof. The validator lives in the package; installed
skill behavior is unchanged.

`profile-aware-graph-validation-r0/` contains the private extractor and negative-probe code used by existing tests. It is not the production graph extractor, a public profile schema, or a current implementation plan.

Superseded instructions and unused YAML profile sketches were removed. The [implemented boundary](../docs/current-implementation.md) and [current direction](../docs/design/markdown-trace-document-graph-overview.md) guide new work.

The repository-owned source fixture is `docs/evidence/generated-design-spec-demo.md`. Some tests optionally inspect a local sibling spec; its absolute path is provenance, not a setup requirement. Historical source-path strings in experimental fixtures remain test data. Do not import private experimental code into production to bypass the new contract.
