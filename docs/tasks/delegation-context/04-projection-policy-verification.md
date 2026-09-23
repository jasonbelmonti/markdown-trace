---
type: TaskDefinition
title: Produce and verify context projections against an explicit obligation policy
task_id: policy-verified-context-projections
artifact_version: "3.0"
revision: "1"
created_at: "2026-09-23T16:25:18-05:00"
updated_at: "2026-09-23T16:25:18-05:00"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | SPEC_REQUIRED | Source authority, structural validation, semantic quality and post-draft review gates pass. Required-obligation selection, policy identity, completeness claims, serialized provenance and independent verification need a scoped contract before implementation. |

## Objective

Let a consuming workflow produce a small source-backed context packet and independently check that it contains every obligation required by its explicitly selected projection policy. Verification must detect omitted mandatory material, changed sources or policy, and altered excerpts without claiming semantic sufficiency or authority to waive full reads.

## Context / Constraints

Repository: `https://github.com/jasonbelmonti/markdown-trace`. Inspected baseline: `24d33c1061101c1065fb511921f7ddce4f285717` (freshly fetched main, 2026-09-23). Calibration: TD1 Standard. This task is additive to the completed portable-runtime work; it does not reopen that task's scope or treat its checkpoint as evidence for a new capability.

This task adds generic projection-policy evaluation and a verifiable serialized result to Markdown Trace. Domain owners supply what must accompany an assigned action; the runtime does not infer obligation meaning from prose. A policy can require graph-related entities and explicitly selected always-required source sections or blocks, including global constraints with no graph edge. Reuse Markdown Engine structure and existing graph facts; choose a finite, data-only policy language through specification.

Generic C-7 extraction may return a successful operation containing omissions. This task needs a separate policy-verification status: a result missing mandatory content or relying on incomplete required exploration cannot pass. Preserve diagnostic/partial output for inspection without advertising a handoff-ready or full-read-authorized packet. Mechanical policy satisfaction, semantic sufficiency, source lifecycle readiness and authority to replace full reads remain distinct.

Verification receives caller-trusted expected source identities, the explicitly selected policy and original source content. A packet's self-reported hashes, completeness flag or embedded policy cannot establish its own validity. Start with a complete single-document case and prove the explicitly supplied multi-document case after the corpus dependency is available. No model inference or capsule runtime is required for this task.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| User request on 2026-09-23, quoted in README.md beside this task | Task authoring authority | Read in the current conversation | Author the Markdown Trace capability contracts from the discussed projection direction; this session does not execute implementation. |
| AGENTS.md; docs/design/markdown-trace-document-graph-overview.md revision 5; docs/current-implementation.md at 24d33c1061101c1065fb511921f7ddce4f285717 | Repository direction and inspected baseline | Read; overview checksum verified; exact hashes in source-fingerprints.json | Use the experimental graph, public Engine APIs and a worktree; preserve compatibility and separate proposed capabilities from implemented ones. |
| Conversation source excerpt in README.md, 2026-09-23 projection discussion and task-authoring request | Requested outcome and ownership | Explicit request; derived capability scope stated here | Support small, traceable worker context; keep approval of full-read substitutions in the owning skills. |
| docs/tasks/delegation-context/01-bounded-traversal.md; docs/tasks/delegation-context/02-source-projection.md; docs/tasks/delegation-context/03-cross-document-resolution.md, each revision 1 | Sibling dependency contracts | Authored and reread with this task set | Use implemented selections, verbatim source parts and qualified capture identity; sibling READY states do not prove those runtimes exist. |
| docs/experimental-graph-validation.md; docs/experimental-document-graph.md; experiments/task-definition-trace/authoring.md | Existing validation limits and domain ownership | Read at recorded baseline | Extend finite generic operations deliberately; the current profile checks selected annotations/relationships, not semantic completeness. |
| docs/design/markdown-trace-document-graph-interfaces.md revision 9, C-7; skills/markdown-trace/SKILL.md | Source projection and consumer guidance boundary | Interface checksum verified; current skill read | Retain source reasons and omissions; document new usage in Trace without changing the TaskDefinition or ExecutionPlan full-read rules. |

Repository-relative source paths resolve in Markdown Trace at the recorded baseline. Sibling task paths resolve in this task set. Read the actual sources before relying on their descriptions; newer explicit user authority takes precedence. The source-fingerprint record is provenance, not additional completion authority.

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Finite owner-supplied projection policy and mandatory-source selection | In scope | blocking | Support declared relation paths/directions and explicit global source selectors; reject unsupported policy, unresolved required selectors and ambiguous required obligations. |
| Verifiable source projection with budget outcomes and inclusion/omission accounting | In scope | blocking | Keep required content atomic; exact excerpts and provenance must survive serialization. |
| Independent verification against expected sources and policy | In scope | blocking | Recompute required selection/coverage and compare actual excerpts; never trust a packet completeness claim alone. |
| Experimental API/command, Trace guidance and bounded domain demonstration | In scope | blocking | Demonstrate task, plan and worker context using test fixtures; the example policy is not an amendment to installed owning skills. |
| Actual full-read exemptions, semantic sufficiency approval, TaskDefinition/ExecutionPlan lifecycle changes and capsule runtime integration | Out of scope | non-blocking | Those owners must explicitly adopt projection authority later; arbitrary packet text cannot create permission. |
| Model selection, token optimization, semantic summaries, executor launch, broad policy language and release activation | Follow-up | non-blocking | Measure source reduction in the bounded demonstration without promising model success or production savings. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | A reviewed specification defines a finite projection policy, required versus optional selections, mandatory global source selectors, source/policy identities, budget behavior and separate operation/verification outcomes; unsupported configuration is rejected. | Review and type-check consumer examples for a required edge path, an unlinked global constraint, a missing section and insufficient budget. Verify the contract distinguishes mechanical coverage from semantic sufficiency, task readiness and permission to skip full reads. Invoke the implemented policy compiler with unknown versions/operators, malformed selectors and invalid bounds; require rejection without a usable partial policy. | Yes |
| TD-SC-2 | For an assigned root, the actual producer includes all policy-required related obligations and always-required source selections, even when the global constraint has no trace edge, while optional unrelated content may be absent. | Use hand-authored task/plan fixtures with an independent exact required-content list. Remove a required annotation, delete a required unlinked source block, make ownership ambiguous and break a required cross-document binding. Each defect must prevent a passing verification outcome; optional unrelated omission must remain distinguishable. | Yes |
| TD-SC-3 | Budgets never silently remove a mandatory obligation; incomplete required traversal, unresolved mandatory selection or a required bundle that does not fit yields explicit non-pass with actionable omissions and no completeness claim. | Run exact-fit and insufficient budgets, including a root that fits while its required constraint does not, a reached traversal limit and a cycle. Assert all omitted required items/reasons and the distinct treatment of permitted optional omission. Increasing the relevant limit or repairing the source restores the expected result. | Yes |
| TD-SC-4 | A serialized projection binds exact source captures, selected roots, interpretation/validation inputs, projection policy/version, relevant producer identity and excerpt locations/reasons; the verifier detects changes against caller-trusted expectations. | Round-trip a valid packet, then alter text, ranges, source bytes, a mandatory block outside the original graph path, policy requirements or expected revisions. Delete a required excerpt and recompute the packet-local digest. Every changed case must fail or be explicitly stale; replay of unchanged inputs must verify without trusting packet assertions. | Yes |
| TD-SC-5 | The public API and documented experimental command produce and verify both a bounded single-document example and an explicit task/plan corpus example through the packed package, preserving source files and existing behavior. | Invoke actual packaged producer/verifier entry points from outside the checkout; assert exact included/excluded excerpts, status, diagnostics and source preservation against a fixture oracle. Run applicable existing compatibility gates and update Trace-owned usage/profile guidance. No capsule service, installed-skill exemption or model call may be necessary. | Yes |
| TD-SC-6 | The demonstration reports the measured original and projected source-byte sizes and honestly distinguishes profile validation, projection verification and unperformed semantic/authority decisions. | Inspect the emitted records and guidance for separate outcomes and exact measured source-byte counts; a verified packet must not claim an agent read/understood it or is authorized to replace full controlling-artifact reads. Retain the oracle and defect results beside the measurements. | Yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Mandatory context from one source | A producer includes an unlinked global obligation and rejects an incomplete packet. | Graph reachability mistaken for obligation completeness. | TD-SC-1 through TD-SC-3 single-document observations. | Continue when missing required material reliably prevents pass. |
| Verified multi-document handoff material | A fresh consumer verifies the intended source revisions and exact excerpts. | Tampering, stale inputs and self-certified coverage. | TD-SC-2 through TD-SC-6 corpus/verification observations. | Review only after all required evidence is current; owning-skill adoption remains separate. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Selected capability | Objective, in-scope behavior and all required success criteria. | Items explicitly classified out of scope or follow-up. | Missing required content that can pass verification, forged/stale provenance, self-certified policies, hidden mandatory truncation, altered source bytes, false authority/semantic claims and affected compatibility regressions block. Effectiveness on cheaper models, full-read exemption adoption, active capsule integration and production performance are outside this task. |
| Maintainability and evidence | Ownership, explicit interfaces and meaningful proof at affected public boundaries. | Unrelated restructuring, stylistic preferences and additional framework layers. | Blocking only for a concrete problem introduced by this change with an identified affected boundary and practical consequence; stale or irrelevant required evidence also blocks. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Review the scoped policy/verification specification before dependent implementation. | Review and type-check consumer examples for a required edge path, an unlinked global constraint, a missing section and insufficient budget. Verify the contract distinguishes mechanical coverage from semantic sufficiency, task readiness and permission to skip full reads. Invoke the implemented policy compiler with unknown versions/operators, malformed selectors and invalid bounds; require rejection without a usable partial policy. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-2 | Compare public production/verification results to an oracle authored independently of the candidate selection algorithm. | Use hand-authored task/plan fixtures with an independent exact required-content list. Remove a required annotation, delete a required unlinked source block, make ownership ambiguous and break a required cross-document binding. Each defect must prevent a passing verification outcome; optional unrelated omission must remain distinguishable. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-3 | Exercise budget and closure defect/repair pairs at the real public boundary. | Run exact-fit and insufficient budgets, including a root that fits while its required constraint does not, a reached traversal limit and a cycle. Assert all omitted required items/reasons and the distinct treatment of permitted optional omission. Increasing the relevant limit or repairing the source restores the expected result. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-4 | Use independent verification with separately supplied source/policy identities and adversarially changed disposable packets. | Round-trip a valid packet, then alter text, ranges, source bytes, a mandatory block outside the original graph path, policy requirements or expected revisions. Delete a required excerpt and recompute the packet-local digest. Every changed case must fail or be explicitly stale; replay of unchanged inputs must verify without trusting packet assertions. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-5 | Capture isolated package/command demonstrations, relevant regressions and source-backed guidance inspection. | Invoke actual packaged producer/verifier entry points from outside the checkout; assert exact included/excluded excerpts, status, diagnostics and source preservation against a fixture oracle. Run applicable existing compatibility gates and update Trace-owned usage/profile guidance. No capsule service, installed-skill exemption or model call may be necessary. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-6 | Audit claims and accounting against actual fixture inputs and outputs; no numeric savings threshold is required. | Inspect the emitted records and guidance for separate outcomes and exact measured source-byte counts; a verified packet must not claim an agent read/understood it or is authorized to replace full controlling-artifact reads. Retain the oracle and defect results beside the measurements. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |

Every admitted result must identify the tested code/artifact state, relevant source and profile hashes, independent expected fixtures, dependency lockfile and runtime versions. Verify those inputs stayed applicable throughout the check. Preserve invalidated results as historical evidence; rerun affected checks after relevant changes and retain unaffected evidence only with an applicability explanation. Task-definition structural validation proves this contract's shape, not any implementation criterion.

## Execution Notes

Read `docs/tasks/delegation-context/04-projection-policy-verification.md` revision 1 and every controlling source above before planning, implementation or review. Verify its adjacent checksum when present and compare the recorded source baseline with the current checkout. Use a worktree under the repository's `.worktrees/`, starting from freshly fetched main; reconcile relevant drift before relying on an old source finding.

Selected next route: SPEC_REQUIRED. Required-obligation selection, policy identity, completeness claims, serialized provenance and independent verification need a scoped contract before implementation. The route supplies the next permitted preparation step; completing this authoring session does not execute implementation. No publication, external messaging, active host-runtime change or destructive operation is authorized here. Internal implementation decisions belong in the required downstream artifact. A discovery that changes the outcome, proof or approval boundary requires a revised task contract.

Dependencies: Requires the accepted runtime capabilities defined by tasks 01 and 02 for the single-document slice and task 03 for the corpus slice. Policy specification and fixture/oracle authoring may proceed independently; dependent runtime work must wait for actual verified interfaces. Use the current source snapshots when reconciling predecessor changes.

Keep existing parsing, graph interpretation, query, projection, policy and transport responsibilities explicit. Do not add a second Markdown parser, infer links from prose or initialize unrelated subsystems merely to test this capability. Run focused behavior checks and required `npm run ci:enforcement` for runtime/compatibility changes, plus `npm run check:package-exports` for changed package surfaces. A successful command without its required observations is insufficient evidence.

### Execution Checkpoint

| Execution status | Current proving slice | Evidence admitted | Next action | Blockers / stop condition |
| --- | --- | --- | --- | --- |
| not-started | Prepare the selected route for the first proving slice; implementation of TD-SC-1 has not begun. | None admitted. | Read this task and its sources, then formalize the finite projection-policy and independent-verification contract. | Stop dependent execution if source authority conflicts, prerequisite runtime behavior is unavailable, or the required downstream artifact is not executable. Resume after reconciliation and the affected route gates pass. |

## Follow-up / Non-blocking Work

TaskDefinition and ExecutionPlan owners must separately authorize any full-read replacement and define lifecycle/semantic checks. A delegation planner chooses roots and executor context; context-capsules-runtime freezes selected files. Actual runtime integration, model-routing experiments and token accounting remain separate work.
