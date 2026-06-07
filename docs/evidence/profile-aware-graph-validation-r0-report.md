# Profile-Aware Graph Validation R0 Report

## Document Control

| Field | Value |
| --- | --- |
| Work item | `BEL-1293` / `BEL-1294` / `BEL-1295` |
| Evidence focus | `EVD-3` role-classified extraction evidence, `EVD-4` provisional graph profile semantics, and `EVD-5` negative diagnostic smoke evidence |
| Status | Role-classification evidence captured; provisional profile semantics defined; negative smoke probes pass |
| Generated from | Private R0 extractor and smoke runner under `experiments/profile-aware-graph-validation-r0/**` |
| Generated at | `2026-06-06T23:10:28Z` |
| Scope note | This is not the final R0 recommendation and does not implement production graph validation. |

## Scope

This report records role-classified extraction evidence for the real execution spec, generated design-spec fixture, `ctx://trace` table fixture, and negative diagnostic smoke probes. It is R0-only evidence used to decide whether table-first artifacts can avoid false primary authority before final R0 recommendation work proceeds.

Out of scope: production `derive` changes, public CLI or schema changes, final graph vocabulary, final R0 recommendation, compatibility proof, source Markdown mutation, and authoritative registry promotion.

BEL-1294 adds provisional profile semantics for `VAL-4`. These sketches are private R0 evidence only; they are not production validation profiles, package exports, public schemas, registry authority, or source-mutation behavior.

BEL-1295 adds private negative smoke diagnostics for `VAL-5`. The smoke runner emits review evidence only; it is not a production validator, public command, package export, source mutation behavior, or authoritative registry output.

## Source Inputs

| Source | Path | SHA-256 | Evidence output |
| --- | --- | --- | --- |
| `ctx://trace` table fixture | `experiments/profile-aware-graph-validation-r0/fixtures/ctx-table-trace-fixture.md` | `09e271cda11213240cc736dd0497f93265d5762b6cbdccf8d8708aa6d57207d9` | `ctx-table-trace-fixture.trace-evidence.json` |
| Generated design-spec fixture | `docs/evidence/generated-design-spec-demo.md` | `0b6c209d3a48bdabd12e8dded19e5a174f01a0fa7c17c1178a29d9a1a7c9cf24` | `generated-design-spec-demo.trace-evidence.json` |
| Real execution spec | `/Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md` | `3dce15b7ca9c50f1829984c1dd829908a6aa76fdf012371f622ec789a756894f` | `execution-decomposer-execution-spec.trace-evidence.json` |

## Command Evidence

Run from `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1293`:

```bash
node experiments/profile-aware-graph-validation-r0/extract-trace-evidence.mjs \
  --document experiments/profile-aware-graph-validation-r0/fixtures/ctx-table-trace-fixture.md \
  --output experiments/profile-aware-graph-validation-r0/evidence/ctx-table-trace-fixture.trace-evidence.json

node experiments/profile-aware-graph-validation-r0/extract-trace-evidence.mjs \
  --document docs/evidence/generated-design-spec-demo.md \
  --output experiments/profile-aware-graph-validation-r0/evidence/generated-design-spec-demo.trace-evidence.json

node experiments/profile-aware-graph-validation-r0/extract-trace-evidence.mjs \
  --document /Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md \
  --output experiments/profile-aware-graph-validation-r0/evidence/execution-decomposer-execution-spec.trace-evidence.json
```

Generated JSON is ignored by `.gitignore`; output hashes make the local run reproducible.

| Output | SHA-256 |
| --- | --- |
| `ctx-table-trace-fixture.trace-evidence.json` | `3f6ce53f5f227612dcd4167c4e492c7c1c1cecff78e137d2257faa11ca6bf016` |
| `generated-design-spec-demo.trace-evidence.json` | `e3b2987038cba0c145a2b0c565b183998e548ba43a591a07f7042e37e8533429` |
| `execution-decomposer-execution-spec.trace-evidence.json` | `39714e19a92c69e98b734e7c456ef3d3e0783b3527f88bcfba34a8204cf2f5e1` |

## EVD-3 Summary

| Fixture | Trace primary definitions | Raw primary definitions | Supplemental definitions | Coverage rows | Mentions | Ranges | Candidate edges | Diagnostics |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `ctx://trace` table fixture | 3 | 0 | 0 | 0 | 17 | 1 | 6 | 9 |
| Generated design-spec fixture | 0 | 21 | 0 | 15 | 11 | 0 | 38 | 0 |
| Real execution spec | 0 | 130 | 7 | 147 | 152 | 25 | 1924 | 303 |

## Role Policy

The provisional R0 role policy is deterministic and reviewable:

- A heading-owned `ctx://trace` link with `type=` remains a trace primary definition.
- A table-only typed `ctx://trace` link is `table_evidence_candidate`, not primary authority.
- The first raw ID in an ID-like table column outside a traceability matrix is a `primary_definition`.
- Later ID-column occurrences for the same label are `supplemental_definition`.
- IDs in validation, evidence, dependency, review, milestone, coverage, relationship, and traceability matrix cells are `coverage_reference`.
- IDs in prose or table cells without definition or coverage signals are `mention`.
- Raw ranges such as `VAL-1 through VAL-14` are range evidence; endpoints resolve only when same-document primary or supplemental definitions exist.
- Candidate edges preserve source occurrence IDs, target occurrence IDs, and per-target relationship hints from the owning coverage row.

## Real Execution Spec Findings

| Evidence area | Observation | Approval impact |
| --- | --- | --- |
| Primary definitions | 130 raw primary definitions across source, objective, package, work package, milestone, validation, review, release, observability, control, risk, and related definition tables. | Satisfies the requirement to list primary definitions for table-first execution-spec evidence. |
| Supplemental definitions | 7 supplemental definitions: `RISK-1` through `RISK-7` in the later risk register after earlier risk/unknown definitions. | Supports `Q-2` review by distinguishing repeated risk rows from duplicate primary failures. |
| Matrix rows | Section `17. Execution Traceability Matrix` contains 962 classified raw ID occurrences, all `coverage_reference`. | Passes the false-authority check: no traceability matrix cell is primary or supplemental authority. |
| Ranges | 25 raw range references are captured. Examples include `SURF-2 through SURF-11`, `PKG-1 through PKG-9`, `WP-1 through WP-6`, `MS-1 through MS-4`, and `VAL-1 through VAL-14`. | Range evidence is available for future profile semantics. |
| Candidate edges | 1924 candidate edges are emitted from definition rows, matrix rows, and range references. Source and target occurrence anchors were checked against their owning coverage rows with zero mismatches. | Provides inspectable relationship evidence without production graph promotion. |
| Diagnostics | 303 informational diagnostics are unresolved coverage/reference candidates, dominated by `EVD-*` evidence artifact labels. | Controlled gap: evidence artifacts are referenced but not defined in same-document ID-column tables. |

## Generated Design-Spec Findings

| Evidence area | Observation | Approval impact |
| --- | --- | --- |
| Primary definitions | 21 raw primary definitions across `OBJ`, `NG`, `REQ`, `FLOW`, `FUNC`, `ACC`, `TECH`, `VAL`, and `RISK` families. | Satisfies generated design fixture role coverage. |
| Coverage paths | Requirements rows map `REQ-1` to `VAL-1`, `REQ-2` to `VAL-2`, and `REQ-3` to `VAL-3`. Behavior rows map `FLOW-1`, `FUNC-1`, and `FUNC-2` to `REQ-*`. Acceptance rows and traceability rows map `ACC-*`, `REQ-*`, and `FUNC-*`. Verification rows map `VAL-*` to `REQ`, `FUNC`, `ACC`, and `TECH` IDs. | Shows requirement, behavior, mechanism, and validation paths are extractable. |
| Candidate-edge provenance | Mixed-column coverage rows preserve per-target relationship hints, for example `VAL-3` maps `VAL-1` and `VAL-2` through `verification_method_coverage`, while `ACC-3`, `FUNC-1`, `FUNC-2`, `REQ-3`, and `TECH-4` map through `related_ids_coverage`. | Prevents candidate-edge evidence from flattening distinct column provenance. |
| Diagnostics | 0 diagnostics. | No controlled gaps for this fixture under the provisional role policy. |

## `ctx://trace` Table Findings

| Evidence area | Observation | Approval impact |
| --- | --- | --- |
| Heading-owned definitions | Existing trace-link evidence still records `WP-1`, `VAL-1`, and `VAL-2` as primary definitions. | Preserves current heading-defined behavior. |
| Table references | Table-cell references to heading-owned `VAL-1` and `VAL-2` remain references. | Confirms table references do not create definitions. |
| Table-only candidates | `OBJ-99`, `EVD-99`, and `VAL-99` are `table_evidence_candidate` and resolve as `non_authoritative_candidate`. | Passes the non-authoritative table-only check. |
| Range | `VAL-1 through VAL-2` resolves both endpoints through heading-owned definitions. | Confirms range evidence can coexist with current trace links. |

## Repeated-ID Policy Evidence

| Label | Policy | Roles |
| --- | --- | --- |
| `RISK-1` | `primary_with_supplemental_definition` | `primary_definition=1`, `supplemental_definition=1`, `coverage_reference=8`, `mention=6` |
| `RISK-2` | `primary_with_supplemental_definition` | `primary_definition=1`, `supplemental_definition=1`, `coverage_reference=3`, `mention=2` |
| `EVD-3` | `coverage_or_reference_only` | `coverage_reference=13` |
| `REQ-1` | `single_primary_with_references` | Generated fixture: `primary_definition=1`, `coverage_reference=5`, `mention=1` |
| `OBJ-99` | `non_authoritative_table_candidate` | `table_evidence_candidate=1`, `mention=1` |

## BEL-1294 EVD-4 Provisional Profile Sketches

| Profile sketch | Artifact family | Purpose | Authority boundary |
| --- | --- | --- | --- |
| `experiments/profile-aware-graph-validation-r0/graph-profile.execution-spec.yaml` | CODEFACTORY execution spec | Declares provisional table roles, ID families, relationship hints, range rules, matrix semantics, repeated-ID policy, and diagnostic classes for execution-spec evidence. | Private R0 trace-evidence sketch only. |
| `experiments/profile-aware-graph-validation-r0/graph-profile.design-spec.yaml` | Generated CODEFACTORY design spec | Declares comparable provisional semantics for requirement, behavior, acceptance, technical, validation, and traceability matrix evidence. | Private R0 trace-evidence sketch only. |

Both sketches use `profileVersion: markdown-trace.r0.graph-profile-sketch.v1` and explicitly set `productionSchema: false`, `packageExport: false`, `registryAuthority: false`, and `sourceMutation: false`.

## BEL-1295 EVD-5 Negative Diagnostic Smoke

Run from `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1295`:

```bash
node experiments/profile-aware-graph-validation-r0/run-negative-smoke-probes.mjs
```

Overall result: `pass` (4/4 probes passed).

| Probe | Fixture | Expected diagnostic | Actual diagnostic | Source evidence |
| --- | --- | --- | --- | --- |
| Dangling reference | `experiments/profile-aware-graph-validation-r0/fixtures/negative-probes/dangling-reference.md` | `r0.graph_validation.unresolved_reference` | `r0.graph_validation.unresolved_reference` / `pass` | `trace-link-0002` line 26:25 to 26:65; `trace-link-0004` line 31:42 to 31:82 |
| Duplicate primary definition | `experiments/profile-aware-graph-validation-r0/fixtures/negative-probes/duplicate-primary-definition.md` | `r0.graph_validation.duplicate_primary_definition` | `r0.graph_validation.duplicate_primary_definition` / `pass` | `trace-link-0001` line 24:5 to 24:59; `trace-link-0002` line 28:5 to 28:59 |
| Invalid range endpoint | `experiments/profile-aware-graph-validation-r0/fixtures/negative-probes/invalid-range-endpoint.md` | `r0.graph_validation.invalid_range_endpoint` | `r0.graph_validation.invalid_range_endpoint` / `pass` | `trace-link-0002` line 27:1 to 27:53; `trace-link-0004` line 31:42 to 31:94; `raw-range-0001` line 20:21 to 20:116 |
| Missing matrix coverage | `experiments/profile-aware-graph-validation-r0/fixtures/negative-probes/missing-matrix-coverage.md` | `r0.graph_validation.missing_matrix_coverage` | `r0.graph_validation.missing_matrix_coverage` / `pass` | `coverage-row-0002`: `OBJ-1` line 47:1 to 47:42, `WP-1` line 47:42 to 47:81, `EVD-1` line 47:84 to 47:126 |

### Dangling Reference Probe

Semantic proof: The diagnostic is valid because `VAL-99` is present in parsed trace evidence and no primary definition resolves `exec.val.99`.

| Evidence kind | Occurrence | Diagnostic basis | Source range |
| --- | --- | --- | --- |
| `unresolved_entity_reference` | `trace-link-0002` | `exec.val.99` | line 26:25 to 26:65 |
| `unresolved_entity_reference` | `trace-link-0004` | `exec.val.99` | line 31:42 to 31:82 |

### Duplicate Primary Definition Probe

Semantic proof: The diagnostic is valid because two heading-owned primary definitions declare `exec.wp.1`, while the matrix occurrence remains a non-primary table reference.

| Evidence kind | Occurrences | Diagnostic basis | Source range |
| --- | --- | --- | --- |
| `duplicate_heading_primary_definitions` | `trace-link-0001`, `trace-link-0002` | `exec.wp.1` | `WP-1` line 24:5 to 24:59; `WP-1` line 28:5 to 28:59 |

### Invalid Range Endpoint Probe

Semantic proof: The diagnostic is valid because the range start `VAL-1` resolves and the range end `VAL-4` remains unresolved in source-backed range evidence.

| Evidence kind | Occurrence | Diagnostic basis | Source range |
| --- | --- | --- | --- |
| `invalid_range_endpoint` | `trace-link-0002` | `VAL-1 through VAL-4`, missing `VAL-4` | line 27:1 to 27:53 |
| `invalid_range_endpoint` | `trace-link-0004` | `VAL-1 through VAL-4`, missing `VAL-4` | line 31:42 to 31:94 |
| `invalid_range_endpoint` | `raw-range-0001` | `VAL-1 through VAL-4`, missing `VAL-4` | line 20:21 to 20:116 |
| `invalid_range_endpoint` | `raw-range-0002` | `VAL-1 through VAL-4`, missing `VAL-4` | line 31:40 to 31:95 |

### Missing Matrix Coverage Probe

Semantic proof: The diagnostic is valid because matrix row `coverage-row-0002` links `OBJ-1` to `WP-1` and `EVD-1` while omitting a validation checkpoint target. The row is classified as matrix coverage evidence, not entity authority.

| Evidence kind | Row | Diagnostic basis | Source range |
| --- | --- | --- | --- |
| `missing_matrix_coverage` | `coverage-row-0002` | source `OBJ-1`, targets `WP-1`, `EVD-1`, missing `VAL` | `OBJ-1` line 47:1 to 47:42; `WP-1` line 47:42 to 47:81; `EVD-1` line 47:84 to 47:126 |

## Relationship Glossary

| Relationship hint | Provisional meaning | Example evidence | Artifact family |
| --- | --- | --- | --- |
| `authority_coverage` | A source-authority row names an authority or source basis for the row label. | `SRC-6 -> BEL-1136` from `coverage-row-0007`. | Execution spec |
| `execution_implication_coverage` | A source-authority row names the package or execution area affected by the source. | `SRC-6 -> PKG-4` from `coverage-row-0007`. | Execution spec |
| `completion_horizon_coverage` | An objective row names the milestone or work package that completes the objective. | `OBJ-1 -> MS-1` and `OBJ-1 -> WP-1` from `coverage-row-0009`. | Execution spec |
| `evidence_coverage` | An objective, package, validation, or matrix row names evidence or validation labels tied to the source label. | `OBJ-2 -> EVD-4` and `OBJ-2 -> VAL-4` from `coverage-row-0010`. | Execution spec |
| `traceability_matrix_coverage` | A matrix row creates coverage edges only; matrix cells never become primary or supplemental definitions. | `SRC-1 -> SURF-11`, `SRC-1 -> PKG-1`, and `SRC-1 -> CTRL-1` from `coverage-row-0151`; `REQ-1 -> FUNC-1` and `REQ-1 -> ACC-1` from generated design-spec matrix rows. | Execution spec and generated design spec |
| `verification_coverage` | A requirement row points to validation evidence. | `REQ-1 -> VAL-1`, `REQ-2 -> VAL-2`, and `REQ-3 -> VAL-3` from generated design-spec rows. | Generated design spec |
| `related_requirements_coverage` | A flow or function row points to requirement coverage. | `FLOW-1 -> REQ-1`, `FLOW-1 -> REQ-2`, `FUNC-2 -> REQ-3`. | Generated design spec |
| `covers_coverage` | An acceptance row points to the function or requirement it covers. | `ACC-3 -> FUNC-1`, `ACC-3 -> FUNC-2`, and `ACC-3 -> REQ-3`. | Generated design spec |
| `related_ids_coverage` | A validation row points to acceptance, function, requirement, or technical mechanism evidence. | `VAL-1 -> ACC-1`, `VAL-1 -> FUNC-1`, `VAL-1 -> REQ-1`, and `VAL-1 -> TECH-2`. | Generated design spec |
| `verification_method_coverage` | A validation row points to prerequisite validation methods. | `VAL-3 -> VAL-1` and `VAL-3 -> VAL-2`. | Generated design spec |
| `coverage_range` | A same-family range expression creates range evidence only after endpoints are checked. | `PKG-1 through PKG-9`, `WP-1 through WP-6`, `MS-1 through MS-4`, and `VAL-1 through VAL-14` resolve; `EVD-1 through EVD-14` remains unresolved because endpoints are not same-document definitions. | Execution spec |

No relationship hint is promoted to production graph schema naming in this R0. The glossary records evidence vocabulary for review and later R2 design-spec consideration only.

The execution-spec sketch also records the complete observed execution-spec candidate-edge relationship inventory. Most hints are column-derived coverage semantics: the extractor normalizes a table column heading to a `*_coverage` hint, then preserves that hint as trace evidence without treating it as production graph schema naming.

| Execution-spec relationship hint | Example edge | Evidence anchor |
| --- | --- | --- |
| `action_coverage` | `REL-3 -> MS-4` | `coverage-row-0133` |
| `authority_coverage` | `SRC-6 -> BEL-1136` | `coverage-row-0007` |
| `blocking_coverage` | `DEP-2 -> WP-2` | `coverage-row-0037` |
| `claim_verified_coverage` | `VAL-1 -> SRC-1` | `coverage-row-0108` |
| `completion_criteria_coverage` | `WP-3 -> BEL-1211` | `coverage-row-0070` |
| `completion_evidence_coverage` | `REV-1 -> EVD-14` | `coverage-row-0122` |
| `completion_horizon_coverage` | `OBJ-1 -> MS-1` | `coverage-row-0009` |
| `coverage_range` | `CTRL-1 -> CTRL-1 through CTRL-11` | `raw-range-0020` |
| `covered_work_coverage` | `MS-1 -> OBJ-1` | `coverage-row-0074` |
| `decision_gate_coverage` | `RISK-1 -> MS-1` | `coverage-row-0040` |
| `dependencies_coverage` | `WP-1 -> ASM-1` | `coverage-row-0068` |
| `due_point_coverage` | `MS-1 -> WP-2` | `coverage-row-0074` |
| `evidence_artifact_coverage` | `MV-1 -> EVD-1` | `coverage-row-0078` |
| `evidence_coverage` | `CTRL-11 -> EVD-14` | `coverage-row-0097` |
| `evidence_required_to_retire_coverage` | `RISK-1 -> VAL-1` | `coverage-row-0040` |
| `execution_implication_coverage` | `SRC-6 -> PKG-4` | `coverage-row-0007` |
| `expected_result_coverage` | `MV-1 -> SRC-1` | `coverage-row-0078` |
| `failure_path_coverage` | `MS-3 -> SRC-1` | `coverage-row-0076` |
| `inputs_coverage` | `WP-1 -> SRC-1` | `coverage-row-0068` |
| `milestone_coverage` | `MV-1 -> MS-1` | `coverage-row-0078` |
| `milestone_gate_coverage` | `WP-1 -> MS-1` | `coverage-row-0068` |
| `mitigation_coverage` | `RISK-5 -> ACC-9` | `coverage-row-0147` |
| `observable_value_enabled_coverage` | `PKG-5 -> ACC-9` | `coverage-row-0063` |
| `operator_action_coverage` | `MV-5 -> SRC-1` | `coverage-row-0082` |
| `package_boundary_coverage` | `WP-1 -> PKG-1` | `coverage-row-0068` |
| `prerequisites_coverage` | `MS-1 -> EVD-1` | `coverage-row-0074` |
| `required_action_coverage` | `CTRL-5 -> MS-3` | `coverage-row-0091` |
| `response_coverage` | `OBS-3 -> MS-3` | `coverage-row-0137` |
| `review_gate_coverage` | `MS-1 -> REV-1` | `coverage-row-0074` |
| `review_scope_coverage` | `REV-1 -> SRC-1` | `coverage-row-0122` |
| `risk_retired_coverage` | `PKG-1 -> RISK-1` | `coverage-row-0059` |
| `statement_coverage` | `CON-10 -> SRC-1` | `coverage-row-0030` |
| `timing_coverage` | `REL-2 -> WP-1` | `coverage-row-0132` |
| `traceability_matrix_coverage` | `MS-1 -> CTRL-10` | `coverage-row-0181` |
| `trigger_coverage` | `CTRL-1 -> SRC-1` | `coverage-row-0087` |
| `validation_checkpoint_coverage` | `WP-1 -> VAL-1` | `coverage-row-0068` |
| `validation_coverage` | `RISK-1 -> REV-1` | `coverage-row-0143` |
| `validation_or_resolution_plan_coverage` | `ASM-1 -> MS-1` | `coverage-row-0033` |
| `why_it_matters_coverage` | `RISK-5 -> ACC-9` | `coverage-row-0044` |

Two additional execution-spec relationship hints are preserved only at coverage-row level and are not emitted as candidate-edge hints because the same row emits target labels through more specific per-target hints.

| Row-only execution-spec relationship hint | Example row | Row source labels | Row target labels | Policy |
| --- | --- | --- | --- | --- |
| `abort_trigger_coverage` | `coverage-row-0133` | `REL-3` | `MS-4`, `WP-6`, `EVD-10` through `EVD-14` | Keep as row-level intent; do not treat as missing candidate-edge evidence. |
| `required_evidence_coverage` | `coverage-row-0074` | `MS-1` | `EVD-1` through `EVD-4`, `EVD-9`, `VAL-1` through `VAL-4`, `VAL-9`, `REV-1`, `REV-2`, `REV-4`, `REV-6`, `REV-9` | Keep as row-level intent; do not treat as missing candidate-edge evidence. |

The generated design-spec sketch records all observed generated design-spec relationship hints.

| Generated design-spec relationship hint | Example edge | Evidence anchor |
| --- | --- | --- |
| `covers_coverage` | `ACC-1 -> FUNC-1` | `coverage-row-0010` |
| `related_ids_coverage` | `VAL-1 -> ACC-1` | `coverage-row-0020` |
| `related_requirements_coverage` | `FLOW-1 -> REQ-1` | `coverage-row-0007` |
| `traceability_matrix_coverage` | `REQ-1 -> ACC-1` | `coverage-row-0013` |
| `verification_coverage` | `REQ-1 -> VAL-1` | `coverage-row-0004` |
| `verification_method_coverage` | `VAL-3 -> VAL-1` | `coverage-row-0022` |

## Evidence-Grounded Family Buckets

| Artifact family | Primary definition families | Supplemental definition families | Coverage-only families | Mention-only families | Coverage-or-mention-only families |
| --- | --- | --- | --- | --- | --- |
| Execution spec | `ASM`, `CON`, `CTRL`, `DEP`, `MS`, `MV`, `NG`, `OBJ`, `OBS`, `PKG`, `REL`, `REV`, `RISK`, `SRC`, `SURF`, `VAL`, `WP` | `RISK` | `EVD` | `DP`, `SHA` | `ACC`, `BEL`, `REQ` |
| Generated design spec | `ACC`, `FLOW`, `FUNC`, `NG`, `OBJ`, `REQ`, `RISK`, `TECH`, `VAL` | None observed | None observed | `ASM`, `CON` | None observed |

The family buckets above are evidence roles, not production entity-type commitments. Families with only mentions or coverage references remain non-authoritative trace evidence until a future R2 design-spec approves any broader interpretation.

## Provisional Role, Range, Matrix, and Diagnostic Policy

| Policy area | Provisional rule | Evidence basis | Approval impact |
| --- | --- | --- | --- |
| Primary definitions | The first ID-like table-column occurrence outside a traceability matrix is `primary_definition`. | Real execution spec has 130 raw primary definitions; generated design spec has 21. | Required for profile sketches. |
| Supplemental definitions | Later ID-like table-column occurrences for an already primary label are `supplemental_definition` when they restate source authority or risk policy. | `RISK-1` through `RISK-7` use `primary_with_supplemental_definition` in the real execution spec. | Distinguishes valid repeated definitions from duplicate-primary failure. |
| Coverage references | Relationship, evidence, validation, dependency, review, milestone, release, and matrix cells are `coverage_reference`. | Real execution spec has 1543 coverage references and generated design spec has 41. | Prevents false authority from coverage cells. |
| Mentions | Prose or table text without definition or coverage-column signals is `mention`. | Real execution spec has 152 mentions; generated design spec has 11. | Keeps incidental references out of graph authority. |
| Table-only `ctx://trace` candidates | Typed table-only links are `table_evidence_candidate`, not primary authority. | `OBJ-99`, `EVD-99`, and `VAL-99` remain non-authoritative candidates in the table fixture. | Preserves current heading-owned trace-link behavior. |
| Ranges | `FAMILY-n through FAMILY-m` is range evidence; endpoints must resolve to same-document primary or supplemental definitions before a validated range edge can be accepted. | Execution-spec ranges resolve for `PKG`, `WP`, `MS`, and `VAL`; `EVD` ranges remain unresolved candidates. | Required for future invalid-range diagnostics. |
| Matrices | Traceability matrix rows create `matrix_coverage_row` evidence; first-column labels can source edges, but matrix cells are never definitions. | The real execution-spec traceability matrix has 962 classified raw ID occurrences and all are `coverage_reference`. | Blocks matrix false-primary regressions. |
| Duplicate primary diagnostics | More than one `primary_definition` for the same label is `duplicate_primary_candidate`. | No duplicate primary appears in the generated design-spec fixture; policy is carried for negative probes. | Required for future smoke diagnostics. |
| Missing matrix coverage diagnostics | Missing required coverage paths are represented as `r0.graph.missing_matrix_coverage_candidate` until the smoke validator formalizes the code. | BEL-1294 profiles reserve the class for later negative-probe use. | Non-blocking for BEL-1294, blocking for later smoke diagnostics. |

## Profile Shape Recommendation

The R0 recommendation is to pursue a standalone graph profile shape for the future R2 design-spec, while preserving composition points with authoring profiles and markdown-engine structural validation profiles.

Rationale:

- Relationship direction, repeated-ID handling, range endpoint policy, matrix semantics, and diagnostic classes are semantic trace-evidence claims, not structural Markdown validation rules.
- Keeping graph profiles standalone prevents structural validation success from implying graph approval.
- Authoring-profile integration should consume graph diagnostics later, but authoring profiles should not own the first graph semantics contract.
- Extending markdown-engine validation profiles directly remains a deferred option only if R2 proves a clean extension boundary that does not mix structural profile authority with semantic graph evidence.

If future smoke diagnostics show that execution-spec and design-spec relationship hints cannot generalize, the fallback recommendation is to narrow R2 to artifact-family-specific graph profiles rather than reject CAND-4 outright.

## Containment

The BEL-1294 and BEL-1295 implementation is private R0 evidence only. It adds provisional graph profile sketches, a private smoke runner, focused smoke helper modules, and updates this evidence report. It does not edit production `src/markdowntrace/**`, authoritative `fixtures/**`, registry derivation, graph projection, validation runtime, public CLI behavior, package exports, public schemas, production validation profiles, or source Markdown.

## Review Boundary

Review should block on missing profile sketches, missing relationship examples from either execution-spec or generated design-spec evidence, ambiguous matrix/repeated-ID/range policy, missing or accidental negative smoke diagnostics, unsupported profile-shape recommendation, or production containment violations. Review should not block on final production schema naming, broader fixture-family coverage, compatibility proof, or final R0 recommendation content; those are later R0 tasks.
