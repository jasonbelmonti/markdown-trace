# Registry Fixture Inventory

Evidence ID: EVD-1
Validation: VAL-1
Work package: WP-1
Status: Ready for MS-1 inspection

## Fixture Family

The fixture family is `r0-document-local-registry`.

Source-controlled inputs:

| Artifact | Path | Purpose |
| --- | --- | --- |
| Fixture execution spec | `fixtures/r0-document-local-registry/execution-spec.md` | Compact execution-spec text derived from the R0 and E0 authority docs. |
| Sidecar registry | `fixtures/r0-document-local-registry/entity-registry.yaml` | Document-local YAML registry for canonical entity identity, labels, definition expectations, edges, and external references. |
| Generated variant inventory | `tests/fixtures/registry-variants.yaml` | Declarative mutation inventory for valid-family broken cases to be materialized by later validator work. |
| Registry fixture tests | `tests/test_registry.test.ts` | Schema and inventory inspection scaffold for VAL-1. |

The fixture intentionally contains the issue-like token `BEL-858` as prose
context. It is not registered as a Markdown Trace document entity.

## Registry Shape

Top-level fields in `entity-registry.yaml`:

| Field | Role |
| --- | --- |
| `registryVersion` | Names the experimental R0 registry contract. |
| `document` | Identifies the local document, fixture family, path, and source authority docs. |
| `entities` | Lists canonical document entities. Each entity separates `id`, `label`, `type`, and `defines`. |
| `edges` | Declares relationships between canonical IDs only. |
| `externalRefs` | Registers external system references without making those keys document entities. |

Entity shape:

| Field | Example | VAL-1 check |
| --- | --- | --- |
| `id` | `exec.wp.1` | Canonical dotted lowercase identity. |
| `label` | `WP-1` | Human display label, separate from canonical identity. |
| `type` | `work_package` | Entity classification. |
| `defines.kind` | `heading` | Definition expectation kind. |
| `defines.text` | `### WP-1: Create fixture family, YAML registry shape, and test scaffolding` | Expected Markdown definition text. |
| `expectedReferences.labels` | `VAL-1`, `EVD-1`, `WP-2` | Fixture-family reference expectations for later scanner and validator work. |
| `expectedReferences.ranges` | `CON-1` through `CON-3` | Bounded range expectation for later incomplete-range validation. |

## Registered Entities

| Canonical ID | Label | Type | Definition expectation |
| --- | --- | --- | --- |
| `exec.con.1` | `CON-1` | `constraint` | `### CON-1: Single fixture family` |
| `exec.con.2` | `CON-2` | `constraint` | `### CON-2: YAML registry format` |
| `exec.con.3` | `CON-3` | `constraint` | `### CON-3: Canonical ID syntax` |
| `exec.pkg.1` | `PKG-1` | `package_boundary` | `### PKG-1: Registry model and loader` |
| `exec.pkg.4` | `PKG-4` | `package_boundary` | `### PKG-4: Fixture harness and evidence paths` |
| `exec.wp.1` | `WP-1` | `work_package` | `### WP-1: Create fixture family, YAML registry shape, and test scaffolding` |
| `exec.wp.2` | `WP-2` | `work_package` | `### WP-2: Implement first valid end-to-end validation path` |
| `exec.wp.3` | `WP-3` | `work_package` | `### WP-3: Implement required negative validation categories` |
| `exec.ms.1` | `MS-1` | `milestone` | `### MS-1: Approve first valid-fixture proof` |
| `exec.val.1` | `VAL-1` | `validation_checkpoint` | `### VAL-1: Registry schema inspection` |
| `exec.val.2` | `VAL-2` | `validation_checkpoint` | `### VAL-2: Valid fixture proof` |
| `exec.val.3` | `VAL-3` | `validation_checkpoint` | `### VAL-3: Negative variant proof` |
| `exec.evd.1` | `EVD-1` | `evidence_artifact` | `### EVD-1: Registry fixture inventory` |
| `exec.evd.2` | `EVD-2` | `evidence_artifact` | `### EVD-2: Valid fixture validation report` |

## Declared Edges

| From | Relationship | To |
| --- | --- | --- |
| `exec.wp.1` | `constrained_by` | `exec.con.1` |
| `exec.wp.1` | `constrained_by` | `exec.con.2` |
| `exec.wp.1` | `constrained_by` | `exec.con.3` |
| `exec.wp.1` | `owns_package_boundary` | `exec.pkg.1` |
| `exec.wp.1` | `owns_package_boundary` | `exec.pkg.4` |
| `exec.wp.1` | `produces` | `exec.evd.1` |
| `exec.wp.1` | `satisfies` | `exec.val.1` |
| `exec.wp.1` | `blocks` | `exec.wp.2` |
| `exec.wp.2` | `reviewed_at` | `exec.ms.1` |
| `exec.wp.2` | `satisfies` | `exec.val.2` |
| `exec.wp.3` | `satisfies` | `exec.val.3` |

All edge endpoints are canonical IDs, not display labels.

## External References

| System | Key | Related entity | Role |
| --- | --- | --- | --- |
| `linear` | `BEL-893` | `exec.wp.1` | `task_of_record` |
| `github` | `c52874f` | `exec.wp.1` | `source_commit` |

External reference keys are not document entity labels. The fixture text also
contains `BEL-858` as an unregistered issue-key candidate for later VAL-4
collision behavior work.

## Broken Variant Inventory

The broken cases are recorded as generated mutations of the single fixture
family, not as separate fixture families.

| Variant | Expected finding | Mutation summary |
| --- | --- | --- |
| `missing-registered-definition` | `missing-registered-definition` | Remove the `VAL-1` heading from the document while retaining `exec.val.1` in the registry. |
| `duplicate-canonical-id` | `duplicate-canonical-id` | Append a second entity using `exec.wp.1`. |
| `duplicate-label` | `duplicate-label` | Append a distinct canonical ID using display label `WP-1`. |
| `missing-reference` | `missing-reference` | Add reference label `WP-99` under the `WP-1` section. |
| `missing-edge-target` | `missing-edge-target` | Add an edge from `exec.wp.1` to absent `exec.wp.99`. |
| `incomplete-bounded-range` | `incomplete-range` | Replace the `WP-1` reference `CON-1 through CON-3` with `CON-1 through CON-4`, leaving registry entities and edges intact. |
| `unregistered-issue-key-collision` | `no-document-entity-from-issue-key` | Retain `BEL-858` as an issue-like token without registering it as a document entity. |

## VAL-1 Inspection Result

VAL-1 is ready for review because the registry separates:

- Canonical IDs: `entities[].id`
- Display labels: `entities[].label`
- Entity types: `entities[].type`
- Definition expectations: `entities[].defines`
- Edges: `edges[]`
- External references: `externalRefs[]`

Runtime validator behavior, report output, and CLI behavior remain deferred to
WP-2 through WP-4.
