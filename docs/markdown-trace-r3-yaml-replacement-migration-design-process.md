# Markdown Trace R3: YAML Replacement Migration Design Process Packet

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace R3: YAML Replacement Migration Design Process Packet |
| Status | Ready for design-spec |
| Packet owner | Codex |
| Reviewers | Jason Belmonti |
| Decision owner | Jason Belmonti |
| Downstream target | `design-spec` |
| Expected downstream rigor | `R3` |
| Last updated | 2026-05-24 |
| Related docs | `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md`; `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md`; `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; `docs/markdown-trace-r0-document-local-entity-registry.md` |
| Related tickets | `BEL-1216`; `BEL-1217`; `BEL-1218`; `BEL-1219`; `BEL-1220`; `BEL-1221` |

## 0. Design Mission Summary

Decision requested: Select the design direction for moving Markdown Trace from hand-authored registry YAML as the current source of truth toward Markdown plus type profiles as the editable source, with generated checked registry YAML as the review artifact.

Problem summary: R2 proved deterministic generated sidecars and check-mode drift detection, but it explicitly did not approve replacing YAML sidecars. Without a migration design, future work could treat generated artifacts as authoritative before parity, compatibility, review policy, and rollback controls exist.

Selected direction: Use a staged, parity-gated migration. Hand-authored YAML remains accepted until a same-document manual/generated comparison proves equivalence or intentional deltas, CI enforces generated drift checks, and documentation defines how operators review and recover the generated artifacts.

Top risks or unknowns: Silent registry drift during authority transition; accidental compatibility break of `validate --registry`; operator confusion between editable source and checked generated output.

Readiness statement: Ready for `design-spec`; no `R0` experiment is required before writing the R3 addendum, but implementation may not flip source authority until the addendum gates pass.

Section status: Complete

## 1. Problem Frame and Decision Needed

Problem declaration: Markdown Trace maintainers cannot safely decide when generated registry sidecars may replace hand-authored YAML as authority because the repository has generated artifact evidence but no same-document parity gate, review policy, compatibility contract, or rollback procedure.

Current-state baseline: As of 2026-05-24, the merged baseline contains 1 hand-authored sidecar registry at `fixtures/r0-document-local-registry/entity-registry.yaml`, 2 generated sidecars under `fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/`, and 0 same-document manual/generated registry pairs.

Evidence or source: `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md` recommends `PROCEED_TO_REPLACEMENT_PLANNING`; `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` preserves YAML coexistence; `tests/test_generated_sidecar.test.ts` covers deterministic metadata, missing artifact diagnostics, and content mismatch diagnostics.

Decision trigger: The R2 transition line has merged and the next project decision is whether to approve YAML replacement planning before implementation work begins.

In scope: Source-of-truth migration strategy; parity proof requirements; generated artifact review policy; compatibility gates; rollback and recovery gates; documentation handoff to a formal R3 design spec.

Out of scope: Removing YAML support now; changing Markdown syntax; changing generated sidecar serialization; adding a graph database; live Linear/Jira projection; creating project-management issues in this packet.

Section status: Complete

## 2. Stakeholders, Concerns, and Viewpoints

| Stakeholder or role | Concern | Viewpoint required | Required action |
| --- | --- | --- | --- |
| Jason Belmonti | Approve or reject the source-authority transition path. | Decision authority and product workflow. | Approve |
| Markdown Trace maintainer | Preserve deterministic local workflows while reducing manual registry maintenance. | Maintainer and developer ergonomics. | Review |
| Future implementation agent | Needs bounded tasks with unambiguous stop conditions. | Execution and validation. | Review |
| Reviewers of generated artifacts | Need to know whether a YAML diff is editable source or generated evidence. | Review policy and artifact trust. | Consult |
| Local operator | Needs recovery instructions when generated artifacts are stale or missing. | Operations and rollback. | Inform |

Decision authority: Jason Belmonti.

Section status: Complete

## 3. Constraints, Invariants, and Assumptions

| ID | Type | Statement | Source or basis | Design impact |
| --- | --- | --- | --- | --- |
| CON-1 | Constraint | Existing hand-authored YAML sidecars remain valid registry inputs during the migration window. | R2 artifact contract section 6 and R2 evidence replacement criteria. | Any selected design must preserve `validate --registry` compatibility until a later approved break. |
| CON-2 | Constraint | Generated sidecars are not human-editable source. | R2 generated metadata sets `generated.humanEditable: false` and adds the generated review marker. | Review policy must treat manual edits as drift unless a later policy explicitly permits them. |
| CON-3 | Constraint | Generated sidecar bytes are deterministic for the same source document, type profile, package version, and command input. | `src/markdowntrace/registry/generated-sidecar.ts` and R2 generated sidecar tests. | Drift checks can be blocking because regeneration is repeatable. |
| CON-4 | Invariant | The R0 YAML fixture remains the compatibility control. | `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md`. | The first parity proof must include the R0 fixture or explicitly preserve it as a control. |
| CON-5 | Constraint | Replacement implementation is not approved by R2 evidence alone. | R2 final recommendation: proceed to replacement planning, not implementation. | This packet can select a migration design, but the addendum must encode implementation gates. |
| ASM-1 | Assumption | A same-document parity fixture can be produced from the R0 fixture or from a dedicated equivalent fixture without changing the public registry shape. | Existing `derive` and `derive-sidecar` commands already produce registry-shaped YAML, but no manual/generated pair exists yet. | The addendum must require parity proof before authority change; if parity cannot be produced, work stops before source-of-truth flip. |
| ASM-2 | Assumption | Reviewers prefer checked generated YAML to remain in source control during transition. | Prior R1 and R2 recommendations both choose checked sidecar artifacts rather than hidden generated output. | The selected design keeps generated YAML as a review artifact instead of replacing it with ephemeral output. |

Section status: Complete

## 4. Design Space Decomposition

| ID | Decision surface | Why it matters | Variable or fixed | Related constraints |
| --- | --- | --- | --- | --- |
| SURF-1 | Source authority model | Determines what humans edit and what tools regenerate. | Variable | CON-1, CON-2 |
| SURF-2 | Parity and drift policy | Determines when manual and generated registries are equivalent, intentionally different, or blocking. | Variable | CON-3, CON-4 |
| SURF-3 | CLI or script interface | Determines how operators and CI run comparison and check mode. | Variable | CON-1, CON-3 |
| SURF-4 | Checked artifact review policy | Determines how reviewers evaluate generated diffs. | Variable | CON-2 |
| SURF-5 | Compatibility and rollback boundary | Determines whether existing consumers can recover after a bad migration. | Variable | CON-1, CON-4, CON-5 |
| SURF-6 | Serialization and generated metadata | The R2 contract already defines this boundary. | Fixed | CON-2, CON-3 |
| SURF-7 | Markdown link syntax and type-profile semantics | R1 and R2 already established the transition syntax surface. | Fixed | CON-5 |

Surface coupling notes: SURF-1 cannot change safely until SURF-2 proves same-document parity and SURF-5 preserves rollback. SURF-3 is the enforcement path for SURF-2 in both local and CI workflows. SURF-4 must explain why generated YAML is reviewed but not hand-edited.

Section status: Complete

## 5. Option Families

| ID | Option family | Summary | Surfaces varied | Promoted to candidate? | Rationale |
| --- | --- | --- | --- | --- | --- |
| OPT-1 | Status quo manual YAML authority | Keep hand-authored YAML as the only trusted registry source and leave generated sidecars as examples. | SURF-1 | Yes | Conservative baseline; useful for comparison but does not resolve duplicate maintenance. |
| OPT-2 | Immediate generated authority | Treat generated sidecars as authoritative now and stop treating manual YAML as source. | SURF-1, SURF-5 | Yes | Structurally different path; exposes the danger R2 explicitly warned against. |
| OPT-3 | Staged parity-gated migration | Keep YAML compatibility, add same-document comparison, enforce generated checks, then approve authority change only after evidence passes. | SURF-1, SURF-2, SURF-3, SURF-4, SURF-5 | Yes | Best aligned with R2 replacement criteria and rollback constraints. |
| OPT-4 | Experiment-first parity spike only | Run a narrow parity experiment and defer the broader migration contract. | SURF-2 | Yes | Useful if feasibility is unknown; may be too small because R2 already proves generation and check mode. |
| OPT-5 | Manual override policy for generated artifacts | Allow humans to patch generated YAML and reconcile later. | SURF-4, SURF-5 | No | Conflicts with generated `humanEditable: false` metadata and weakens deterministic drift detection. |

Section status: Complete

## 6. Candidate Elaboration

| ID | Source option | Mechanism | Boundaries and interfaces | Rollback posture | Load-bearing assumptions |
| --- | --- | --- | --- | --- | --- |
| CAND-1 | OPT-1 | Continue using manual YAML as the source of truth and keep generated sidecars as supplemental artifacts. | Existing `validate --registry` path remains primary; `derive-sidecar --check` remains optional. | Strong rollback because nothing changes. | Assumes manual YAML overhead is acceptable despite R1/R2 evidence that source locality matters. |
| CAND-2 | OPT-2 | Declare generated sidecars authoritative immediately and move review attention to Markdown plus type profiles. | Generated YAML becomes the checked review artifact; manual YAML loses authority without parity proof. | Weak rollback because consumers may not know whether stale manual YAML or generated YAML is correct. | Assumes generated output is equivalent to all current manual registry semantics, which is not evidenced. |
| CAND-3 | OPT-3 | Add a migration contract that requires same-document parity comparison, drift classification, CI enforcement, documentation, and rollback before authority changes. | `validate --registry` stays supported; generated sidecar check mode stays enforced; a comparison workflow bridges manual YAML and generated artifacts. | Strong rollback because YAML remains accepted until the flip is explicitly approved and source control can restore either artifact set. | Assumes parity proof is feasible; if false, the migration stops before source authority changes. |
| CAND-4 | OPT-4 | Approve only a parity spike that compares one manual registry against one generated registry, then return for another design. | Narrow local test path; no review policy or CI migration contract yet. | Strong for the spike, incomplete for replacement. | Assumes comparison feasibility is the only unknown; underestimates review and compatibility work already identified by R2. |

Candidate notes: CAND-3 treats the generated sidecar as a checked artifact, not hidden build output. The editable source becomes Markdown plus type profile only after evidence confirms equivalence and recovery controls. CAND-4 is available as a fallback if parity cannot be demonstrated inside the first implementation slice.

Section status: Complete

## 7. Stress Scenarios and Failure Modes

| ID | Scenario | Stimulus and environment | Candidates tested | Expected response | Result |
| --- | --- | --- | --- | --- | --- |
| SCN-1 | Normal authoring transition | Author updates Markdown and type profile for a migrated fixture, then runs local check mode. | CAND-1, CAND-2, CAND-3, CAND-4 | CAND-3 regenerates or checks the sidecar, compares it to the manual control during migration, and leaves reviewable evidence. | CAND-3 performs best; CAND-1 does not reduce manual registry maintenance. |
| SCN-2 | Same-document mismatch | Manual YAML and regenerated sidecar disagree on entity labels, edges, or metadata. | CAND-2, CAND-3, CAND-4 | The workflow must report equivalent, intentionally changed, or blocking drift without silently choosing one artifact. | CAND-3 is safest because it requires classification before authority change. |
| SCN-3 | Missing generated artifact in CI | A source document is migrated but its generated artifact is absent. | CAND-2, CAND-3 | CI must fail without writing bytes in check mode. | CAND-3 aligns with current missing artifact diagnostics; CAND-2 could fail late without rollback policy. |
| SCN-4 | Compatibility regression | Existing R0 `validate --registry` behavior breaks after migration work. | CAND-2, CAND-3 | The migration must block until R0 compatibility is restored or a separate compatibility break is approved. | CAND-3 preserves the R0 control; CAND-2 risks unsupported consumers. |
| SCN-5 | Rollback after bad authority flip | Reviewers discover generated output omitted a manual registry fact after merge. | CAND-2, CAND-3 | Operators must restore YAML-backed authority or regenerate checked artifacts deterministically. | CAND-3 has an explicit rollback boundary; CAND-2 does not. |
| SCN-6 | Future multi-document expansion | Markdown Trace later adds project-level registries or external projections. | CAND-1, CAND-3, CAND-4 | Current migration decisions should not hard-code assumptions that block future namespace or projection work. | CAND-3 hides transition policy behind comparison and artifact contracts, leaving future expansion open. |

Section status: Complete

## 8. Trade Study

| ID | Criterion | Priority | Source concern or constraint |
| --- | --- | --- | --- |
| CRIT-1 | Evidence-gated migration safety across authority, compatibility, reviewability, rollback, and delivery effort. | High | R2 replacement criteria; CON-1 through CON-5; stakeholder review concerns. |

| Candidate | CRIT-1 | Decisive strengths | Decisive weaknesses |
| --- | --- | --- | --- |
| CAND-1 | Medium | Maximum compatibility and rollback safety. | Does not solve duplicate authoring or advance the R1/R2 recommendation. |
| CAND-2 | Low | Fastest apparent path to generated authority. | Violates R2 replacement boundary and lacks parity, compatibility, and rollback evidence. |
| CAND-3 | High | Preserves compatibility while creating deterministic gates for parity, drift, review, CI, and rollback. | Requires several implementation slices before authority can change. |
| CAND-4 | Medium | Retires parity feasibility with the smallest initial slice. | Leaves review policy, CI, documentation, and rollback unresolved. |

Sensitivity points: If same-document parity cannot be demonstrated without changing registry semantics, CAND-3 degrades into an R0 parity experiment before implementation continues. If reviewers reject checked generated YAML in source control, the artifact strategy must return to design-process because R1 and R2 assumptions would no longer hold.

Section status: Complete

## 9. Source Doctrine Validation

| Doctrine lens | Applied check | Result | Follow-up |
| --- | --- | --- | --- |
| NASA systems design | Stakeholders, constraints, decomposition, selected design, and validation gates are connected before mechanism selection. | Pass | Preserve the gate sequence in the design spec. |
| ISO 42010 architecture description | Maintainer, reviewer, operator, and implementation viewpoints are named with distinct concerns. | Pass | The design spec must preserve boundary and interface descriptions. |
| SEI ATAM | Quality tradeoffs are explicit: compatibility and rollback win over immediate simplification. | Pass | Keep scenario-based acceptance cases for drift and rollback. |
| Parnas information hiding | Transition policy is isolated behind comparison and generated artifact contracts rather than spread through ad hoc reviews. | Pass | Implementation should keep comparison logic separate from registry loading. |
| NIST SSDF and threat modeling | No secrets or auth are involved, but supply-chain-like checked artifacts can be manually tampered with. | Pass | Treat manual edits to generated sidecars as drift and fail check mode. |
| SRE and Well-Architected operations | Local operation, CI signals, rollback, and recovery are considered despite no hosted service. | Pass | The design spec must define operator signals and rollback triggers. |

Section status: Complete

## 10. Selected Design Decision Record

Decision: Select CAND-3, staged parity-gated migration, as the design direction for the R3 addendum.

Selected candidate: CAND-3.

Rationale: CAND-3 is the only candidate that advances toward Markdown/profile source authority while preserving the R0 YAML compatibility control, the R2 generated artifact contract, deterministic drift checks, and an explicit rollback path. It converts R2 replacement criteria into implementation gates instead of treating generated output as inherently authoritative.

Rejected alternatives: CAND-1 is rejected because it does not resolve manual registry maintenance. CAND-2 is rejected because it violates the R2 boundary and lacks same-document parity proof. CAND-4 is rejected as the main path because R2 has already established enough evidence to write a full migration contract, although a parity-only spike remains a fallback stop condition if parity fails.

Accepted risks: RISK-1: The first parity implementation may show intentional semantic differences between R0 manual YAML and generated output; owner: Markdown Trace maintainer; mitigation: classify deltas before authority changes. RISK-2: The migration will take more than one implementation slice; owner: Jason Belmonti; mitigation: execute contract, parity, comparison, CI, evidence, and docs as separate reviewable tasks.

Decision owner: Jason Belmonti.

Section status: Complete

## 11. Uncertainty, Experiments, and R0 Gates

| ID | Uncertainty or validation need | Gate type | Owner | Evidence required | Due point |
| --- | --- | --- | --- | --- | --- |
| VAL-1 | Same-document manual/generated parity must be proven or differences must be classified. | Validate before implementation authority flip | Markdown Trace maintainer | A parity report covering the R0 YAML fixture or a dedicated equivalent fixture, with registry, graph, metadata, and validation deltas classified, including entity, edge, and external reference facts. | Before any generated sidecar becomes source authority. |
| VAL-2 | Generated sidecar drift enforcement must remain no-write in check mode. | Validate before implementation authority flip | Markdown Trace maintainer | Missing artifact and stale artifact tests that exit non-zero and preserve checked bytes. | Before CI enforces migrated fixtures. |
| VAL-3 | Existing YAML validation compatibility must remain intact. | Validate before implementation authority flip | Markdown Trace maintainer | `npm run validate:fixture` passes with the R0 YAML registry during the migration window. | Every migration slice. |
| VAL-4 | Reviewers need deterministic instructions for generated diffs. | Completed before design-spec | Codex | Addendum requirements for human-editable status, regeneration commands, review blocking cases, and accepted drift classifications. | This addendum. |
| VAL-5 | Rollback must be executable from source control or deterministic regeneration. | Validate before implementation authority flip | Markdown Trace maintainer | Rollback procedure documented and exercised on at least one migrated fixture. | Before source authority flip. |
| VAL-6 | R2 fixture and profile coverage must be preserved. | Validate before implementation authority flip | Markdown Trace maintainer | Coverage matrix with passing evidence for the R0 YAML fixture, minimal R1 link-backed fixture, CODEFACTORY profile-backed fixture, stale artifact failure, missing artifact failure, and malformed profile failure. | Before source authority flip. |

Section status: Complete

## 12. Handoff to design-spec

Recommended downstream action: Author an R3 design-spec addendum that encodes CAND-3 as the approved migration contract and decomposes execution into reviewable slices.

Recommended downstream rigor: `R3`, because a source-of-truth transition can break compatibility, create stale checked artifacts, and constrain rollback across future Markdown Trace workflows even though the current implementation is local.

Source authority for design-spec: This packet's selected CAND-3 decision; R2 evidence in `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md`; R2 generated sidecar contract in `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md`; R1 recommendation in `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; current sidecar inventory of 1 manual YAML and 2 generated sidecars.

Risks and gates to preserve: Same-document parity proof across registry, graph, metadata, and validation outputs; no-write check mode; `validate --registry` compatibility; generated artifact review policy; R2 fixture/profile coverage matrix; rollback from source control or deterministic regeneration; stop condition if parity cannot be produced.

Traceability notes: The addendum should map requirements to acceptance cases for matching parity, intentional drift, blocking drift, stale artifacts, missing artifacts, malformed profile failures, YAML compatibility, generated review policy, fixture/profile coverage, and rollback. The parity cases must cover the R2 replacement dimensions: registry, graph, metadata, and validation output.

Section status: Complete

Internal Review Record:

| Field | Result |
| --- | --- |
| Calibration | Full design-process packet required; downstream R3 is appropriate because this is a source-authority migration with compatibility and rollback risk. |
| Findings addressed | DP-1 Resolved: initial option set was narrowed to include status quo, direct flip, staged migration, and experiment-first paths. DP-2 Resolved: rollback and compatibility scenarios were added before selection. |
| Structural validation | Passed on 2026-05-24 with `@jasonbelmonti/markdown-engine@2.0.0` and `design-process-validation-profile.yaml`; diagnostics: none. |
| Unresolved findings | None. |
| Readiness verdict | Ready for design-spec. |
