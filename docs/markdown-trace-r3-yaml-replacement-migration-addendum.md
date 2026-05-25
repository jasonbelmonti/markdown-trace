# Markdown Trace R3: YAML Replacement Migration Addendum

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace R3: YAML Replacement Migration Addendum |
| Status | In Review |
| Rigor level | `R3` |
| Rigor justification | The change governs a source-of-truth transition for registry artifacts. A wrong decision can silently break compatibility, make generated artifacts stale, or constrain rollback across future Markdown Trace workflows. |
| Author(s) | Codex |
| Reviewers | Jason Belmonti; independent implementation reviewer for the migration comparison logic |
| Decision owner | Jason Belmonti |
| Target milestone or release | R3 YAML replacement migration planning |
| Last updated | 2026-05-24 |
| Related docs | `docs/markdown-trace-r3-yaml-replacement-migration-design-process.md`; `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md`; `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md`; `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; `docs/markdown-trace-r0-document-local-entity-registry.md` |
| Related tickets | `BEL-1216`; `BEL-1217`; `BEL-1218`; `BEL-1219`; `BEL-1220`; `BEL-1221` |

## 0. Executive Summary

Decision requested: Approve with heightened controls

Problem summary: Markdown Trace maintainers are unable to know when generated registry sidecars can replace hand-authored YAML authority because R2 proved deterministic generated artifacts but not same-document parity, review policy, compatibility guarantees, or rollback behavior, resulting in a risk of unsupported source-authority changes.

Proposed outcome: A local operator can use Markdown and type profiles as the editable source while checked registry artifacts provide review evidence, deterministic drift detection, and an explicit rollback path.

Why now: R2 transition evidence merged on 2026-05-24 and recommends replacement planning before any YAML replacement implementation.

Top risks or unknowns:

- RISK-1: Generated registry, graph, metadata, or validation output may diverge from manual YAML semantics before reviewers understand the delta.
- RISK-2: Existing `validate --registry` compatibility may regress during the transition.
- RISK-3: Reviewers may hand-edit generated YAML unless policy and check mode block it.

Section status: Complete

## Layer 1: Problem and Requirements

## 1. Problem Definition

Problem declaration: Markdown Trace maintainers are unable to promote generated registry sidecars to registry authority because the current repository lacks a same-document parity gate and migration policy, resulting in a risk that stale generated artifacts or unsupported YAML compatibility changes enter future review and validation workflows.

Affected actors or systems: Markdown Trace maintainers, local operators, implementation agents, generated artifact reviewers, and future consumers of `validate --registry` compatibility.

Current-state baseline: As of 2026-05-24, the merged repository has 1 hand-authored registry YAML file, 2 generated sidecar registry files, 0 same-document manual/generated parity pairs, and 8 R2 replacement criteria that must be satisfied before replacement.

Evidence or source: Direct repository inspection on 2026-05-24; `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md`; `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md`; generated sidecar tests in `tests/test_generated_sidecar.test.ts`.

Consequence of inaction: Before the next R3 implementation slice, YAML replacement could proceed as an implicit code change instead of an evidence-gated source-authority decision.

Decision deadline or trigger: Before opening implementation tasks for YAML replacement migration after the merged R2 line.

Section status: Complete

## 2. Objectives and Non-Objectives

| ID | Statement | Measurement or decision horizon |
| --- | --- | --- |
| OBJ-1 | Establish when Markdown plus type profiles may become the editable registry source for migrated fixtures. | Source-authority flip review after parity, CI, documentation, and rollback evidence pass. |
| OBJ-2 | Prove same-document manual/generated registry, graph, metadata, and validation parity or classify every intentional delta before authority changes. | First migration implementation slice review. |
| OBJ-3 | Preserve existing YAML registry validation compatibility throughout the migration window. | Every migration slice and final replacement review. |
| OBJ-4 | Define how reviewers and operators handle generated sidecar diffs, stale artifacts, missing artifacts, and rollback. | Addendum approval and implementation evidence review. |
| NG-1 | This addendum will not remove YAML registry support. | Removal requires a later compatibility-break decision. |
| NG-2 | This addendum does not include live Linear, Jira, graph database, or multi-document project registry scope. | Deferred until after source-authority migration evidence. |
| NG-3 | This addendum will not change R1 `ctx://trace` syntax or the R2 generated sidecar serialization contract. | Syntax and serialization stay under existing R1/R2 controls. |

Section status: Complete

## 3. Stakeholders and Decision Authorities

| Stakeholder or role | Interest | Required action |
| --- | --- | --- |
| Jason Belmonti | Owns the approval decision for source-authority migration. | Approve |
| Markdown Trace maintainer | Needs implementation-ready gates and stop conditions. | Review |
| Independent implementation reviewer | Challenges comparison logic and compatibility coverage before source authority changes. | Review |
| Generated artifact reviewer | Needs deterministic review policy for checked YAML artifacts. | Consult |
| Local operator | Needs regeneration, check, and rollback instructions. | Inform |

Decision owner: Jason Belmonti.

Section status: Complete

## 4. Constraints, Invariants, and Assumptions

| ID | Type | Statement | Source or rationale | Validation or resolution plan |
| --- | --- | --- | --- | --- |
| CON-1 | Constraint | Hand-authored YAML registry inputs remain accepted during the migration window. | R2 coexistence policy and replacement criteria. | VAL-4 verifies R0 `validate --registry` compatibility in every migration slice. |
| CON-2 | Constraint | Generated sidecars are checked artifacts, not human-editable source. | R2 generated metadata sets `generated.humanEditable: false`. | VAL-6 verifies review policy and check-mode drift behavior. |
| CON-3 | Constraint | The first source-authority change requires same-document manual/generated comparison evidence across registry, graph, metadata, and validation outputs. | R2 replacement criteria require migration checks. | VAL-1 and VAL-2 verify parity and drift classification before authority flip. |
| CON-4 | Invariant | Generated artifact path, metadata, and serialization remain under the R2 generated sidecar artifact contract. | R2 contract is already implemented and tested. | VAL-5 runs sidecar check coverage without changing serialization. |
| CON-5 | Constraint | Replacement implementation must be locally reversible until a later decision approves YAML removal. | R3 rollback posture from the design-process packet. | VAL-7 exercises rollback or deterministic regeneration before final authority flip. |
| CON-6 | Constraint | Replacement evidence must cover the R0 YAML fixture, minimal R1 link-backed fixture, CODEFACTORY profile-backed fixture, stale artifact failure, missing artifact failure, and malformed profile failure before source-authority flip. | R2 fixture and profile coverage criterion. | VAL-8 verifies the fixture/profile coverage matrix before source-authority flip. |
| ASM-1 | Assumption | The R0 YAML fixture or a dedicated equivalent fixture can produce same-document registry, graph, metadata, and validation comparison evidence without changing public registry semantics. | Current derivation paths produce registry-shaped YAML, but no same-document pair exists yet. | Resolve through VAL-1 before any source-authority change. |

Section status: Complete

## 5. Requirements

| ID | Type | Priority | Requirement statement | Rationale | Verification |
| --- | --- | --- | --- | --- | --- |
| REQ-1 | Compatibility | Must | The migration path shall keep hand-authored registry YAML accepted by validation until an approved replacement evidence record exists. | Existing users and R0 evidence depend on `validate --registry`. | VAL-4 |
| REQ-2 | Functional | Must | The migration path shall require same-document manual and generated comparison across registry, graph, metadata, and validation outputs before any authority change. | Authority cannot move without evidence that the generated artifact represents the same registry meaning and projected behavior. | VAL-1 |
| REQ-3 | Functional | Must | The comparison workflow shall classify each registry, graph, metadata, and validation delta as equivalent, intentionally changed, or blocking drift. | Reviewers need deterministic outcomes rather than ad hoc interpretation. | VAL-2 |
| REQ-4 | Operability | Must | The check workflow shall fail on missing generated artifacts, stale generated artifacts, and unexplained comparison drift. | CI and local operators need blocking failure modes for unsafe generated state. | VAL-3, VAL-5 |
| REQ-5 | Reliability | Must | Generated artifact verification shall prove byte-stable output across two consecutive runs for each migrated fixture. | Checked artifacts are reviewable only if regeneration is deterministic. | VAL-5 |
| REQ-6 | Operability | Must | The review policy shall mark generated sidecars as non-human-editable checked artifacts with regeneration instructions. | Prevents reviewers from treating generated YAML as editable authority. | VAL-6 |
| REQ-7 | Recovery | Must | The rollback plan shall restore YAML-backed authority or regenerate checked artifacts without manual reconstruction. | A failed migration must not strand the repository between two authorities. | VAL-7 |
| REQ-8 | Documentation | Must | The user-facing workflow shall identify the supported registry authority for manual YAML, generated sidecars, and migrated fixtures. | Operators need to know what to edit, what to check, and what to recover. | VAL-6, VAL-7 |
| REQ-9 | Functional | Must | The migration evidence set shall cover the R2-required fixture and profile cases before any source-authority flip. | Replacement criteria require evidence beyond one same-document pair. | VAL-8 |

Section status: Complete

## 6. Success Measures and Kill Criteria

| Measure | Baseline | Target or decision threshold | Evaluation date or decision event | Related IDs |
| --- | --- | --- | --- | --- |
| Same-document parity evidence | Baseline is 0 same-document manual/generated pairs on 2026-05-24. | Continue only if at least one manual/generated pair covers registry, graph, metadata, and validation outputs with all deltas classified as equivalent, intentional with reviewer approval, or blocking. | First migration implementation slice. | OBJ-2, REQ-2, REQ-3 |
| Fixture and profile coverage | Baseline is R2 evidence for generated sidecars but no migration coverage matrix. | Final authority flip is blocked until the evidence set covers the R0 YAML fixture, minimal R1 link-backed fixture, CODEFACTORY profile-backed fixture, stale artifact failure, missing artifact failure, and malformed profile failure. | Final R3 migration decision. | OBJ-1, OBJ-2, REQ-9 |
| YAML compatibility | Baseline is R2 evidence that `npm run validate:fixture` passes. | Continue only if R0 YAML validation passes in every migration slice. | Every migration pull request. | OBJ-3, REQ-1 |
| Generated drift enforcement | Baseline is R2 missing artifact and stale artifact check-mode coverage. | Continue only if check mode remains no-write and fails on missing, stale, and unexplained comparison drift cases. | CI enforcement slice. | OBJ-4, REQ-4, REQ-5 |
| Review policy clarity | Baseline is generated metadata but no replacement review policy. | Continue only if docs say what humans edit, what is generated, and how to regenerate or rollback. | Documentation slice review. | OBJ-4, REQ-6, REQ-8 |
| Authority flip readiness | Baseline is not approved for replacement. | Stop if parity, compatibility, CI, documentation, or rollback evidence is missing. | Final R3 migration decision. | OBJ-1, REQ-1, REQ-7 |

Section status: Complete

## Layer 1 Exit

Layer 1 status: Complete

## Layer 2: Functional Specification

## 7. System Context and External Interfaces

System boundary: The migration design covers local Markdown Trace source documents, type profiles, hand-authored registry YAML, generated sidecar registry YAML, local CLI workflows, test scripts, CI-equivalent check commands, and repository documentation.

External actors and systems: Local operator; implementation agent; human reviewer; local filesystem; Node.js CLI; npm scripts. No live Linear, Jira, hosted service, database, authentication, authorization, or secret boundary is introduced.

Trust or control boundaries: Generated sidecar artifacts cross a review trust boundary because they are checked into source control but are not human-editable source. The local CLI is the authority for regeneration and check-mode drift diagnostics.

| Interface | Owner | Consumer or dependency | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| Manual registry validation | Markdown Trace CLI | Local operator and tests | Registry YAML path, Markdown document path | Deterministic validation report and exit code |
| Generated sidecar derivation | Markdown Trace CLI | Local operator, tests, CI | Markdown document path, optional type profile path | Generated registry YAML artifact or check-mode diagnostic |
| Parity comparison workflow | Future migration comparison module | Local operator, tests, CI | Manual registry, generated sidecar, document, type profile, derived graph, validation report | Registry, graph, metadata, and validation delta classification report with exit code |
| Documentation workflow | Repository docs | Reviewer and operator | Migration policy, commands, rollback steps | Human-readable workflow and review boundary |

Section status: Complete

## 8. Operational Scenarios and Functional Behavior

| ID | Trigger | Preconditions | Behavior or outcome | Related requirements |
| --- | --- | --- | --- | --- |
| FLOW-1 | Operator checks a migrated fixture after editing Markdown or a type profile. | Source document and active profile are present; generated sidecar is checked in. | The workflow verifies generated bytes and reports the artifact path or deterministic drift diagnostics. | REQ-4, REQ-5 |
| FLOW-2 | Operator compares a manual YAML registry with a generated sidecar for the same document. | Both artifacts exist, the document identity is known, and graph and validation projections can be derived. | The workflow reports equivalent output, intentional deltas, or blocking drift across registry, graph, metadata, and validation dimensions. | REQ-2, REQ-3 |
| FLOW-3 | CI runs migration checks on a pull request. | Migrated fixture list is known. | CI fails on missing sidecars, stale sidecars, unexplained parity drift, or R0 YAML compatibility regression. | REQ-1, REQ-4 |
| FLOW-4 | Reviewer inspects generated sidecar changes. | Diff contains generated YAML with `generated.humanEditable: false`. | Reviewer treats the YAML as checked evidence and asks for regeneration instead of manual patching. | REQ-6, REQ-8 |
| FLOW-5 | Operator rolls back a failed migration. | Migration evidence failed after generated artifacts changed. | Operator restores YAML-backed authority or regenerates checked artifacts from source without manual reconstruction. | REQ-7 |
| FUNC-1 | Manual YAML remains in the migration window. | Operator uses the existing validation command. | The system accepts hand-authored registry YAML and preserves the R0 validation path. | REQ-1 |
| FUNC-2 | Parity comparison is requested. | Manual and generated artifacts refer to the same source document and comparable projections can be derived. | The system classifies registry, graph, metadata, and validation deltas deterministically. | REQ-2, REQ-3 |
| FUNC-3 | Generated sidecar check is requested. | Source document and optional type profile are readable. | The system detects missing or stale generated artifacts without rewriting bytes in check mode. | REQ-4, REQ-5 |
| FUNC-4 | Generated artifact appears in review. | Artifact includes generated metadata. | The system documentation tells reviewers not to hand-edit the generated YAML. | REQ-6, REQ-8 |
| FUNC-5 | Rollback is required. | Migration gate fails or reviewer rejects source-authority change. | The system has documented recovery using YAML-backed authority or deterministic regeneration. | REQ-7 |

Section status: Complete

## 9. State Model, Faults, and Misuse Cases

States and transitions: A registry family begins in `yaml-authoritative`. It may move to `parity-candidate` when a generated sidecar exists for the same document. It may move to `generated-checked` when sidecar check mode and parity comparison pass. It may move to `generated-authoritative` only after the final R3 authority flip decision. Any blocking drift, missing artifact, stale artifact, compatibility regression, or rollback exercise failure moves the family to `blocked` until corrected.

| Scenario | Expected behavior | Invariant maintained | Related IDs |
| --- | --- | --- | --- |
| Fault-1 | Missing generated artifact produces a non-zero check result and does not create the artifact in check mode. | Check mode never hides missing review evidence. | REQ-4, FUNC-3 |
| Fault-2 | Stale generated artifact produces a non-zero check result and preserves the stale bytes. | Operators can inspect the exact stale artifact. | REQ-4, REQ-5, FUNC-3 |
| Fault-3 | Manual and generated outputs differ in registry facts, graph projection, metadata, or validation result. | No authority change occurs until the delta is classified and approved or fixed. | REQ-2, REQ-3, FUNC-2 |
| Fault-4 | Existing R0 YAML validation fails during migration. | YAML compatibility remains a blocking control. | REQ-1, FUNC-1 |
| Misuse-1 | Reviewer manually edits generated YAML to fix a diff. | The next check workflow reports drift and documentation directs regeneration. | REQ-4, REQ-6, FUNC-4 |
| Misuse-2 | Operator tries to remove manual YAML support in the same migration slice. | Review blocks the change because removal is out of scope. | REQ-1, REQ-8, FUNC-1 |

Section status: Complete

## 10. External Service Levels and Acceptance Cases

External service expectations: This is a local repository workflow with no hosted availability target. Deterministic checks must return the same pass/fail result and ordered diagnostic categories for identical inputs across two consecutive local runs.

| ID | Acceptance case | Expected result | Covers |
| --- | --- | --- | --- |
| ACC-1 | Run R0 YAML validation during a migration slice. | Existing YAML validation exits successfully with 0 findings. | REQ-1, FUNC-1 |
| ACC-2 | Compare a same-document manual registry and generated sidecar with equivalent registry facts, graph projection, metadata, and validation result. | Parity comparison exits successfully and reports equivalent outputs across all four dimensions. | REQ-2, REQ-3, FUNC-2 |
| ACC-3 | Compare a manual registry and generated sidecar with an unapproved registry, graph, metadata, or validation difference. | Parity comparison exits non-zero and reports blocking drift with the affected dimension. | REQ-3, FUNC-2 |
| ACC-4 | Run generated sidecar check with the artifact missing. | Check exits non-zero, reports missing artifact, and writes no artifact. | REQ-4, FUNC-3 |
| ACC-5 | Run generated sidecar check with stale artifact bytes. | Check exits non-zero, reports content mismatch, and preserves stale bytes. | REQ-4, REQ-5, FUNC-3 |
| ACC-6 | Run generation twice for the same migrated fixture. | Generated bytes are identical across two consecutive runs. | REQ-5, FUNC-3 |
| ACC-7 | Review a generated sidecar diff. | Reviewer sees non-human-editable policy and regeneration instructions. | REQ-6, REQ-8, FUNC-4 |
| ACC-8 | Execute rollback after a failed authority flip rehearsal. | YAML-backed authority is restored or generated artifacts are regenerated without manual reconstruction. | REQ-7, FUNC-5 |
| ACC-9 | Compare a manual YAML registry that lacks generated metadata with a valid generated sidecar during the migration window. | The comparison report marks manual absence of `generated.*` metadata as intentional for `yaml-authoritative` state and separately verifies generated metadata against the R2 contract. | REQ-3, REQ-6, FUNC-2 |
| ACC-10 | Compare a generated sidecar whose source hash, profile hash, generator command, or serialization metadata is inconsistent with the source inputs. | The comparison report exits non-zero and reports blocking metadata drift. | REQ-3, REQ-4, REQ-5, FUNC-2 |
| ACC-11 | Compare manual and generated validation outcomes where one path produces a different finding category, exit code, or resolved-count summary. | The comparison report exits non-zero and reports blocking validation drift. | REQ-3, REQ-4, FUNC-2 |
| ACC-12 | Review the migration coverage matrix before source-authority flip. | The matrix lists passing evidence for R0 YAML, minimal R1 link-backed, CODEFACTORY profile-backed, stale artifact failure, missing artifact failure, and malformed profile failure cases. | REQ-9, FUNC-2 |

Section status: Complete

## 11. Requirements-to-Behavior Traceability

| Requirement | Functional behaviors or flows | Acceptance coverage | Notes |
| --- | --- | --- | --- |
| REQ-1 | FLOW-3, FUNC-1 | ACC-1 | YAML compatibility remains a migration control. |
| REQ-2 | FLOW-2, FUNC-2 | ACC-2 | Same-document comparison across registry, graph, metadata, and validation outputs is required before authority changes. |
| REQ-3 | FLOW-2, FUNC-2 | ACC-2, ACC-3, ACC-9, ACC-10, ACC-11 | Delta classification controls parity and drift decisions across all R2 replacement dimensions. |
| REQ-4 | FLOW-1, FLOW-3, FUNC-2, FUNC-3 | ACC-4, ACC-5, ACC-10, ACC-11 | Missing, stale, and unexplained comparison drift cases fail. |
| REQ-5 | FLOW-1, FUNC-2, FUNC-3 | ACC-5, ACC-6, ACC-10 | Generated output is deterministic and no-write check mode is preserved. |
| REQ-6 | FLOW-4, FUNC-2, FUNC-4 | ACC-7, ACC-9 | Reviewers treat generated YAML as checked evidence. |
| REQ-7 | FLOW-5, FUNC-5 | ACC-8 | Rollback is executable before source authority changes. |
| REQ-8 | FLOW-4, FUNC-4, FUNC-5 | ACC-7, ACC-8 | Docs identify authority, regeneration, and recovery workflows. |
| REQ-9 | FLOW-2, FLOW-3, FUNC-2 | ACC-12 | R2 fixture and profile coverage is required before source authority changes. |

Section status: Complete

## Layer 2 Exit

Layer 2 status: Complete

## Layer 3: Technical Specification

## 12. Architecture Overview

Architecture summary: The migration architecture keeps current registry loading, graph derivation, validation reporting, and generated sidecar derivation intact, then adds a bounded comparison layer and documentation-driven review policy before any source-authority flip. Generated YAML remains a checked artifact; Markdown plus type profiles become editable source only for fixture families that pass the migration gates.

Major components and boundaries: Components are manual registry validation, graph projection, generated sidecar derivation/check mode, migration parity comparison, migration CI or npm-script wrapper, review policy documentation, and rollback procedure. The main boundaries are manual YAML authority versus generated artifact evidence, and registry loading or graph derivation versus comparison/reporting logic.

Deployment or runtime placement: Local developer workstation and CI-equivalent repository commands. No service deployment, daemon, external network call, or hosted data store is introduced.

Architecture rationale: The design satisfies REQ-1 through REQ-9 by preserving proven R0 and R2 paths, adding comparison only at the migration boundary, preserving the fixture/profile coverage gate from the R2 execution spec, and requiring independent evidence before source authority changes.

Section status: Complete

## 13. Technical Mechanisms and Allocation

| ID | Mechanism | Component or owner | Responsibility | Related behaviors |
| --- | --- | --- | --- | --- |
| TECH-1 | YAML compatibility guard | Existing validation path | Keep hand-authored registry YAML loadable and validated during migration. | FUNC-1 |
| TECH-2 | Generated sidecar no-write check | Existing generated sidecar workflow | Detect missing and stale generated artifacts without rewriting in check mode. | FUNC-3 |
| TECH-3 | Migration parity comparator | New migration comparison module | Compare manual and generated registry facts, graph projections, generated metadata, and validation outcomes, then classify deltas. | FUNC-2 |
| TECH-4 | Migration check wrapper | npm script or CI-equivalent command | Run YAML compatibility, generated sidecar checks, and parity comparison for migrated fixtures. | FUNC-1, FUNC-2, FUNC-3 |
| TECH-5 | Generated artifact review policy | Repository documentation | Define what humans edit, what is generated, when diffs block review, and how to regenerate. | FUNC-4 |
| TECH-6 | Rollback and recovery procedure | Repository documentation and source control workflow | Restore YAML-backed authority or regenerate checked artifacts after a failed migration. | FUNC-5 |
| TECH-7 | Fixture/profile coverage matrix | Migration evidence report | Track required R2 coverage cases and block source-authority flip until every case has passing evidence. | FUNC-2 |

Comparison allocation detail:

| Dimension | Primary mechanisms | Comparison source | Normalization rule | Blocking condition |
| --- | --- | --- | --- | --- |
| Registry | TECH-1, TECH-3 | Manual YAML loaded through existing registry loader; generated sidecar loaded through existing registry loader. | Compare semantic registry fields after serialization to the existing root registry shape: `document`, `entities`, `edges`, and `externalRefs`; evaluate `generated.*` separately under metadata. | Entity, edge, external reference, document identity, or expected-reference difference is blocking unless explicitly recorded as intentional. |
| Graph | TECH-3 | Graphs derived from both normalized registries with the existing graph projection path. | Compare deterministic node and edge sets after stable ordering by IDs and endpoints. | Node, edge, label, type, or endpoint difference is blocking unless explicitly recorded as intentional. |
| Metadata | TECH-2, TECH-3 | Generated sidecar metadata and R2 artifact contract; manual YAML metadata absence during `yaml-authoritative` state. | Verify generated metadata fields against source document bytes, type profile bytes, package version, command, and serialization; classify manual absence of `generated.*` as intentional only before source-authority flip. | Missing, stale, absolute-path, hash, command, serialization, or human-editable metadata mismatch in generated artifacts is blocking. |
| Validation | TECH-1, TECH-3 | Validation result from manual registry and validation result from generated sidecar for the same document. | Compare structured validation result fields: exit code, valid flag, finding categories, finding locations where available, and resolved-count summary; do not compare report file path text. | Different exit code, valid flag, finding category, finding location, or resolved-count summary is blocking unless explicitly recorded as intentional. |

Section status: Complete

## 14. Data, Schemas, and Compatibility

| Change | Type | Compatibility impact | Reversibility | Mitigation |
| --- | --- | --- | --- | --- |
| Migration comparison report | Data | Adds local report output for parity and drift classification; does not change registry schema. | Reversible | Keep report generation separate from registry loading and generated sidecar serialization. |
| Migrated fixture inventory | Config | Identifies which fixtures are subject to generated sidecar and parity checks. | Reversible | Review fixture additions independently and preserve R0 YAML compatibility checks. |
| Documentation authority table | Config | Clarifies manual YAML, generated sidecar, and migrated fixture authority states. | Reversible | Docs can be corrected without changing artifact bytes. |
| Generated sidecar artifact | Schema | No schema change; the R2 generated sidecar contract remains authoritative. | Reversible | VAL-5 verifies existing generated sidecar metadata and byte stability. |
| Comparison delta report | Data | Adds a review artifact with per-dimension classifications for registry, graph, metadata, and validation output. | Reversible | The report is generated evidence only and does not mutate source artifacts in check mode. |

Section status: Complete

## 15. Control Logic and Non-Functional Controls

Control logic summary: Migration checks run in this order: validate existing YAML compatibility; derive or check generated sidecars in no-write mode; derive graph and validation outputs for the same document; compare registry facts, graph projections, generated metadata, and validation outcomes; classify deltas; fail on missing artifacts, stale artifacts, unexplained drift, or compatibility regression; require rollback evidence before source authority changes.

Concurrency and ordering model: The workflow is local and single-command ordered. There is no concurrent state mutation. Check mode must read source and generated artifacts without writing generated bytes.

Failure recovery model: A failed migration gate leaves the fixture in `yaml-authoritative` or `parity-candidate` state. Operators either fix source and regenerate artifacts in write mode, restore prior YAML-backed authority from source control, or stop before source authority changes.

Comparison report model:

| Field | Required content | Purpose |
| --- | --- | --- |
| `documentPath` | Repository-relative Markdown source path. | Anchors all compared artifacts to the same document. |
| `manualRegistryPath` | Repository-relative manual YAML path when present. | Identifies the current YAML authority. |
| `generatedSidecarPath` | Repository-relative generated sidecar path. | Identifies the checked generated artifact. |
| `dimensions[]` | One row each for `registry`, `graph`, `metadata`, and `validation`. | Prevents a passing report from omitting an R2 replacement dimension. |
| `dimensions[].status` | `equivalent`, `intentional`, or `blocking`. | Gives reviewers a deterministic classification vocabulary. |
| `dimensions[].deltas[]` | Stable paths, expected value, actual value, and rationale when status is not `equivalent`. | Makes drift reviewable without hand-inspecting full YAML. |
| `exitCode` | `0` only when every dimension is `equivalent` or approved `intentional`; non-zero when any dimension is `blocking`. | Lets local and CI checks enforce the migration gate. |

Coverage matrix model:

| Required case | Evidence required before source-authority flip | Blocking condition |
| --- | --- | --- |
| R0 YAML fixture | Manual YAML validation passes and same-document comparison evidence classifies registry, graph, metadata, and validation dimensions. | Missing R0 comparison evidence or YAML validation regression. |
| Minimal R1 link-backed fixture | Generated sidecar check passes and comparison evidence covers registry, graph, metadata, and validation dimensions where a manual/equivalent control exists. | Missing minimal R1 evidence, stale artifact, or unexplained dimension drift. |
| CODEFACTORY profile-backed fixture | Generated sidecar check passes with CODEFACTORY profile metadata and domain facts preserved. | Missing CODEFACTORY evidence, stale artifact, profile metadata drift, or domain fact drift. |
| Stale artifact failure | Controlled stale artifact check exits non-zero and preserves stale bytes. | Check mode rewrites bytes or fails to report content mismatch. |
| Missing artifact failure | Controlled missing artifact check exits non-zero and writes no artifact in check mode. | Check mode silently writes the artifact or fails to report missing artifact. |
| Malformed profile failure | Malformed or invalid type profile case exits non-zero with deterministic profile-validation diagnostics. | Malformed profile passes or fails without deterministic diagnostics. |

| Requirement | Mechanism | Notes |
| --- | --- | --- |
| REQ-1 | TECH-1, TECH-4 | YAML validation runs before replacement approval. |
| REQ-2 | TECH-3, TECH-4 | Same-document comparison gates authority changes. |
| REQ-3 | TECH-3 | Delta categories are deterministic review outcomes for registry, graph, metadata, and validation outputs. |
| REQ-4 | TECH-2, TECH-3, TECH-4 | Missing, stale, and unexplained drift block migration. |
| REQ-5 | TECH-2, TECH-4 | Byte-stable generation is required for checked artifacts. |
| REQ-6 | TECH-5 | Review policy treats generated YAML as non-human-editable. |
| REQ-7 | TECH-6 | Rollback is documented and rehearsed before authority flip. |
| REQ-8 | TECH-5, TECH-6 | User-facing docs identify source authority and recovery paths. |
| REQ-9 | TECH-4, TECH-7 | Fixture/profile coverage matrix blocks authority flip until all R2-required cases have passing evidence. |

Section status: Complete

## 16. Observability, Operations, Rollout, and Rollback

| Signal | Type | Purpose | Consumer |
| --- | --- | --- | --- |
| YAML validation exit code | Log | Detect R0 compatibility regression. | Local operator, CI, reviewer |
| Generated sidecar check diagnostic | Log | Detect missing or stale generated artifacts. | Local operator, CI, reviewer |
| Parity comparison report | Log | Classify equivalent, intentional, and blocking registry, graph, metadata, and validation deltas. | Local operator, reviewer |
| Generated artifact byte comparison | Audit | Prove deterministic regeneration across repeated runs. | Reviewer |
| Fixture/profile coverage matrix | Audit | Prove every R2-required fixture and failure case has passing evidence before source-authority flip. | Decision owner, reviewer |
| Rollback rehearsal result | Audit | Prove recovery before source authority changes. | Decision owner, reviewer |

Rollout plan: Execute in ordered slices. First, implement the migration contract and same-document parity fixture. Second, add deterministic parity comparison and tests. Third, add a migration check wrapper for local and CI-equivalent use. Fourth, record R3 evidence and documentation, including the fixture/profile coverage matrix. Fifth, request an explicit authority flip only after all gates pass and all R2-required coverage cases have passing evidence.

Rollback or containment plan: Trigger rollback on parity failure, missing or stale generated artifacts, YAML compatibility regression, reviewer rejection, or failed rollback rehearsal. Action is to keep or restore YAML-backed authority for the affected fixture family, revert generated artifact changes from source control when needed, or regenerate checked artifacts from Markdown and type profiles in write mode. No irreversible data migration is allowed in this addendum.

Operator actions: Run the documented check command before review, inspect parity reports, regenerate sidecars only through the CLI write path, avoid hand-editing generated YAML, and execute rollback instructions when any blocking gate fails.

Section status: Complete

## 17. Verification Strategy and Behavior-to-Mechanism Traceability

| ID | Verification method | What is verified | Related IDs |
| --- | --- | --- | --- |
| VAL-1 | Test | A same-document manual/generated pair can be compared across registry, graph, metadata, and validation outputs before authority changes, and the report contains one dimension row for each R2 replacement dimension. | REQ-2, FUNC-2, TECH-3 |
| VAL-2 | Test | Equivalent, intentionally changed, and blocking drift classifications are deterministic for registry, graph, metadata, and validation deltas, including generated-only metadata handling during `yaml-authoritative` state. | REQ-3, FUNC-2, TECH-3 |
| VAL-3 | Test | Migration checks fail on unexplained registry, graph, metadata, or validation drift, including validation exit-code or finding-category mismatches. | REQ-4, FUNC-2, TECH-3, TECH-4 |
| VAL-4 | Test | Existing R0 YAML validation remains accepted during the migration window. | REQ-1, FUNC-1, TECH-1 |
| VAL-5 | Test | Generated sidecar check mode detects missing and stale artifacts without rewriting bytes and proves byte-stable output. | REQ-4, REQ-5, FUNC-3, TECH-2 |
| VAL-6 | Inspection | Documentation marks generated sidecars as non-human-editable checked artifacts and gives regeneration instructions. | REQ-6, REQ-8, FUNC-4, TECH-5 |
| VAL-7 | Manual | Rollback restores YAML-backed authority or deterministic generated artifacts without manual reconstruction. | REQ-7, REQ-8, FUNC-5, TECH-6 |
| VAL-8 | Test / Inspection | Fixture/profile coverage matrix has passing evidence for R0 YAML, minimal R1 link-backed, CODEFACTORY profile-backed, stale artifact failure, missing artifact failure, and malformed profile failure cases. | REQ-9, FUNC-2, TECH-7 |

| Behavior or requirement | Mechanisms | Verification |
| --- | --- | --- |
| REQ-1 | TECH-1, TECH-4 | VAL-4 |
| REQ-2 | TECH-3, TECH-4 | VAL-1 |
| REQ-3 | TECH-3 | VAL-2, VAL-3 |
| REQ-4 | TECH-2, TECH-3, TECH-4 | VAL-3, VAL-5 |
| REQ-5 | TECH-2, TECH-4 | VAL-5 |
| REQ-6 | TECH-5 | VAL-6 |
| REQ-7 | TECH-6 | VAL-7 |
| REQ-8 | TECH-5, TECH-6 | VAL-6, VAL-7 |
| REQ-9 | TECH-4, TECH-7 | VAL-8 |
| FUNC-1 | TECH-1, TECH-4 | VAL-4 |
| FUNC-2 | TECH-3, TECH-4, TECH-7 | VAL-1, VAL-2, VAL-3, VAL-8 |
| FUNC-3 | TECH-2, TECH-4 | VAL-5 |
| FUNC-4 | TECH-5 | VAL-6 |
| FUNC-5 | TECH-6 | VAL-7 |

Section status: Complete

## 18. Alternatives, Risks, Open Questions, and Final Exit

| Alternative | Reason considered | Reason rejected |
| --- | --- | --- |
| Keep manual YAML as permanent authority. | Safest compatibility posture. | Does not resolve the R1/R2 authoring-distance problem or reduce duplicate registry maintenance. |
| Make generated sidecars authoritative immediately. | Fastest apparent source-authority simplification. | R2 explicitly did not approve replacement, and same-document parity evidence does not exist. |
| Run only a parity spike and defer the contract. | Could retire one feasibility question quickly. | R2 already identified review policy, compatibility, CI, rollback, and documentation as replacement gates. |
| Allow manual edits to generated sidecars. | Could appear convenient during review. | Conflicts with generated metadata and undermines deterministic drift checks. |

| ID | Statement | Likelihood | Consequence | Mitigation |
| --- | --- | --- | --- | --- |
| RISK-1 | Generated registry, graph, metadata, or validation output diverges from manual YAML behavior in a way reviewers miss. | Medium | High | Require same-document parity comparison and blocking drift classification across all R2 replacement dimensions before authority changes. |
| RISK-5 | Manual YAML lacks generated metadata, causing reviewers or tools to misclassify expected pre-migration metadata absence as semantic drift. | Medium | Medium | Classify manual absence of `generated.*` as intentional only while the fixture remains `yaml-authoritative`, and require generated metadata to pass the R2 contract. |
| RISK-6 | A future authority flip passes one same-document parity proof but misses R1 minimal, CODEFACTORY, or malformed-profile coverage required by R2. | Medium | High | Require the fixture/profile coverage matrix and block source-authority flip until every R2-required case has passing evidence. |
| RISK-2 | YAML compatibility regresses while generated authority work proceeds. | Medium | High | Run R0 YAML validation in every migration slice and block on failure. |
| RISK-3 | Reviewers hand-edit generated YAML instead of changing source Markdown or type profiles. | Medium | Medium | Preserve generated metadata, document non-human-editable policy, and fail check mode on drift. |
| RISK-4 | The migration becomes too large for clean review. | Medium | Medium | Execute the addendum as contract, parity, comparison, CI, evidence, and documentation slices. |

No open questions

Waivers: none

Final readiness statement: Ready with heightened controls

Section status: Complete

## Final Consistency Gate

1. Every required section is marked `Complete`.
2. Every `REQ-*` appears in section 11 and section 17.
3. Every `FUNC-*` from section 8 appears in section 17.
4. Every `TECH-*` from section 13 appears in section 17.
5. Every referenced `ACC-*` is defined in section 10.
6. Every referenced `VAL-*` is defined in section 17.
7. No open `Q-*` rows exist.
8. No section is marked `Deferred`.
9. The fixture/profile coverage matrix preserves the R2-required coverage cases before any source-authority flip.
10. The selected rigor level is `R3` because the design changes source-authority and rollback controls.
11. The final readiness statement matches `R3`.
12. No `R3` waiver is present or required.

Internal Review Record:

| Field | Result |
| --- | --- |
| Rigor calibration | Accepted as `R3`; source-authority migration creates compatibility, rollback, and checked-artifact review risk. |
| Findings addressed | ST-1 Resolved: added explicit Layer 2 behavior for rollback and review policy. SM-1 Resolved: made YAML compatibility and no-write generated check mode binding requirements. TR-1 Resolved: mapped every `REQ-*`, `FUNC-*`, and `TECH-*` through section 17. DS-1 Resolved: expanded migration comparison from registry-only deltas to registry, graph, metadata, and validation deltas to match R2 replacement criteria. DS-2 Resolved: added comparison normalization rules, blocking criteria, and the comparison report model to strengthen functional adequacy and technical feasibility. CR-1 Resolved: added R2 fixture/profile coverage as CON-6, REQ-9, ACC-12, TECH-7, VAL-8, and final consistency gate item 9. |
| Structural validation | Passed on 2026-05-24 with `@jasonbelmonti/markdown-engine@2.0.0` and `design-spec-validation-profile.yaml`; diagnostics: none. |
| Unresolved findings | None. |
| Readiness verdict | Approve with heightened controls for implementation planning; do not approve source-authority flip until VAL-1 through VAL-8 pass. |
