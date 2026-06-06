# Profile-Aware Graph Validation R0 Report

## Document Control

| Field | Value |
| --- | --- |
| Work item | `BEL-1293` |
| Evidence focus | `EVD-3` role-classified extraction evidence |
| Status | Role-classification evidence captured |
| Generated from | Private R0 extractor under `experiments/profile-aware-graph-validation-r0/**` |
| Generated at | `2026-06-06T16:02:33Z` |
| Scope note | This is not the final R0 recommendation and does not implement production graph validation. |

## Scope

This report records role-classified extraction evidence for the real execution spec, generated design-spec fixture, and `ctx://trace` table fixture. It is R0-only evidence used to decide whether table-first artifacts can avoid false primary authority before profile semantics, smoke diagnostics, or final R0 recommendation work proceeds.

Out of scope: production `derive` changes, public CLI or schema changes, final graph vocabulary, negative smoke diagnostics, source Markdown mutation, and authoritative registry promotion.

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

## Containment

The implementation is private R0 evidence only. It changes experiment-local extractor code, targeted extractor tests, and evidence documents. It does not edit production `src/markdowntrace/**`, authoritative `fixtures/**`, registry derivation, graph projection, validation runtime, public CLI behavior, package exports, or source Markdown.

## Review Boundary

Review should block on missing required fixture evidence, ambiguous matrix/repeated-ID role classifications, incorrect non-authoritative table-only handling, or production containment violations. Review should not block on final graph vocabulary, negative smoke diagnostics, broader fixture-family coverage, or final R0 recommendation content; those are later R0 tasks.
