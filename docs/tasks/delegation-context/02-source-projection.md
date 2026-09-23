---
type: TaskDefinition
title: Project selected source context with exact provenance and visible omissions
task_id: verbatim-source-context-projection
artifact_version: "3.0"
revision: "1"
created_at: "2026-09-23T16:25:18-05:00"
updated_at: "2026-09-23T16:25:18-05:00"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | PLAN_REQUIRED | Source authority, structural validation, semantic quality and post-draft review gates pass. C-7 defines the selected projection behavior; fragment ownership, supporting structure, budget accounting and consumer proof require a bounded execution plan after traversal is available. |

## Objective

Return bounded, verbatim context for selected entities from one captured Markdown document, preserving source provenance, structural support, inclusion reasons and every omission. A consumer can assemble a small context packet without manually slicing a specification or silently importing unrelated sections.

## Context / Constraints

Repository: `https://github.com/jasonbelmonti/markdown-trace`. Inspected baseline: `24d33c1061101c1065fb511921f7ddce4f285717` (freshly fetched main, 2026-09-23). Calibration: TD1 Standard. This task is additive to the completed portable-runtime work; it does not reopen that task's scope or treat its checkpoint as evidence for a new capability.

Current analysis captures source ranges, fragment owners and supporting fragment references, but `extractContext` is not exported. C-7 and OWN-7 supply the selected behavioral target. Fragment partitioning is explicitly provisional in the baseline; reconcile it against projection behavior while preserving existing graph facts and documented query semantics. This task does not adopt unrelated unimplemented C-2/C-4 proposals.

Require the bounded traversal task's accepted selection behavior before dependent implementation. Preparation of the execution plan may continue against its declared contract; reconcile actual predecessor interfaces before execution. Budgets measure source UTF-8 bytes and fragments, not model tokens or the complete serialized packet. Projection is a source-selection result and does not certify complete worker knowledge or permission to skip controlling sources.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| User request on 2026-09-23, quoted in README.md beside this task | Task authoring authority | Read in the current conversation | Author the Markdown Trace capability contracts from the discussed projection direction; this session does not execute implementation. |
| AGENTS.md; docs/design/markdown-trace-document-graph-overview.md revision 5; docs/current-implementation.md at 24d33c1061101c1065fb511921f7ddce4f285717 | Repository direction and inspected baseline | Read; overview checksum verified; exact hashes in source-fingerprints.json | Use the experimental graph, public Engine APIs and a worktree; preserve compatibility and separate proposed capabilities from implemented ones. |
| docs/design/markdown-trace-document-graph-interfaces.md, revision 9, C-7, OWN-7, common rules, VAL-5 and VAL-6 | Selected projection behavior | Read; adjacent checksum verified | Adopt exact slices, entity-bundle admission, support, omission precedence, provenance and stale/forged selection rejection. |
| docs/tasks/delegation-context/01-bounded-traversal.md, revision 1 | Sibling dependency contract | Authored and reread with this task set | Require an implemented, verified selection boundary before dependent code; do not treat task readiness as implementation evidence. |
| src/markdowntrace/document-graph/fragment-support.ts; src/markdowntrace/document-graph/contracts/analysis.ts; src/markdowntrace/document-graph/contracts/source.ts; src/markdowntrace/document-graph/index.ts; tests/test_document_graph_links.test.ts | Implementation and proof baseline | Inspected at recorded commit | Reuse Engine-backed source and ownership; supporting-fragment existence alone does not prove correct projection. |

Repository-relative source paths resolve in Markdown Trace at the recorded baseline. Sibling task paths resolve in this task set. Read the actual sources before relying on their descriptions; newer explicit user authority takes precedence. The source-fingerprint record is provenance, not additional completion authority.

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Verbatim context projection and any necessary bounded fragment/support correction | In scope | blocking | Implement the current C-7 target without broad changes to interpretation or graph validation. |
| Budget accounting, inclusion explanations, omissions and source/selection identity checks | In scope | blocking | Retain facts required to inspect the serialized result. |
| Experimental package consumer, documented API usage and regression proof | In scope | blocking | Expose the usable result through the experimental package API; the later policy task owns command access. |
| Cross-document assembly, mandatory-obligation policy, semantic summarization, Markdown packet rendering and token estimation | Out of scope | non-blocking | Generic source parts are the deliverable; later consumers may render or package them. |
| Full-read exemptions, agent execution, capsule runtime changes, publication and active runtime installation | Follow-up | non-blocking | No authority or host activation is conferred by projection. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | For selected uniquely owned entities, the public result contains their exact source parts and required supporting structure; unselected descendant-owned content and unrelated ancestor body text are excluded. | Use nested heading/list/quote/table fixtures with selected parents, independently owned children, code literals and non-identity support. Compare every returned text and range to independently marked original slices, including Unicode and CRLF. | Yes |
| TD-SC-2 | Entity bundles are admitted atomically under both C-7 budgets; overlaps are counted once, separated intervals never bridge gaps, and every selected identifier is either included or has exactly one explicit omission. | Use shared support, overlapping ranges, exact-fit, one-byte-short, fragment-limit and zero-budget cases. Independently count returned UTF-8 bytes and distinct final parts; assert budget precedence and later-fitting entities after an earlier omission. Negative, non-integer and unsafe numeric budgets must fail at public ingress. | Yes |
| TD-SC-3 | Ambiguous definition-fragment ownership omits the complete entity with C-7 ownership evidence, including when all candidate owners are selected or budgets are zero. | Use two declarations in one paragraph, a separate admitted entity sharing structural support, and a case with no admitted entities. Assert declaration IDs, source range and fragment ID; omitted entities must not appear as owners/reasons on emitted parts. | Yes |
| TD-SC-4 | Projection uses the captured source, rejects stale and fabricated selections, and exports enough analysis/source and selection provenance to explain every included part after JSON serialization. | Change the original external input after analysis, compare old capture to a fresh analysis, pass a stale issued selection and a JSON copy/fabrication, and inspect serialized predecessor relationships, query bounds and inherited diagnostics. No source reload or invented handle is permitted. | Yes |
| TD-SC-5 | A packed-package consumer can retrieve and inspect the context result while existing APIs, profiles and command modes retain their behavior. | Exercise the real package API from outside the checkout using explicit inputs and independent expected excerpts; verify source/profile bytes are unchanged, existing command behavior remains compatible, and applicable enforcement/package checks pass. | Yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Useful exact context | One selected behavior yields the expected owned content with supporting structure. | Whole-section leakage or unusable fragments. | TD-SC-1 and TD-SC-2 exact-source observations. | Continue when content and budgets match the independent oracle. |
| Trustworthy exported context | A consumer can inspect omissions, source identity and reasons through the delivered interfaces. | Ambiguous ownership, stale source or hidden checkout dependence. | TD-SC-3 through TD-SC-5 observations. | Review only with all required current evidence. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Selected capability | Objective, in-scope behavior and all required success criteria. | Items explicitly classified out of scope or follow-up. | Source corruption, unwanted descendant content, absent required structure, incorrect budgets, false ownership, stale selection use, missing omission/provenance information and affected compatibility regressions block. Stylistic packet rendering, semantic sufficiency guarantees and model-token estimates remain outside this boundary. |
| Maintainability and evidence | Ownership, explicit interfaces and meaningful proof at affected public boundaries. | Unrelated restructuring, stylistic preferences and additional framework layers. | Blocking only for a concrete problem introduced by this change with an identified affected boundary and practical consequence; stale or irrelevant required evidence also blocks. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Compare exact owned/support content and explicit excluded content at the public projection boundary. | Use nested heading/list/quote/table fixtures with selected parents, independently owned children, code literals and non-identity support. Compare every returned text and range to independently marked original slices, including Unicode and CRLF. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-2 | Check independently calculated accounting, membership partition and atomic omission behavior. | Use shared support, overlapping ranges, exact-fit, one-byte-short, fragment-limit and zero-budget cases. Independently count returned UTF-8 bytes and distinct final parts; assert budget precedence and later-fitting entities after an earlier omission. Negative, non-integer and unsafe numeric budgets must fail at public ingress. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-3 | Distinguish structural support from asserted ownership and verify omission precedence. | Use two declarations in one paragraph, a separate admitted entity sharing structural support, and a case with no admitted entities. Assert declaration IDs, source range and fragment ID; omitted entities must not appear as owners/reasons on emitted parts. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-4 | Prove captured-source consistency, selection validation and exported explanation preservation. | Change the original external input after analysis, compare old capture to a fresh analysis, pass a stale issued selection and a JSON copy/fabrication, and inspect serialized predecessor relationships, query bounds and inherited diagnostics. No source reload or invented handle is permitted. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-5 | Capture package consumer output, input preservation, documentation smoke and affected regression evidence. | Exercise the real package API from outside the checkout using explicit inputs and independent expected excerpts; verify source/profile bytes are unchanged, existing command behavior remains compatible, and applicable enforcement/package checks pass. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |

Every admitted result must identify the tested code/artifact state, relevant source and profile hashes, independent expected fixtures, dependency lockfile and runtime versions. Verify those inputs stayed applicable throughout the check. Preserve invalidated results as historical evidence; rerun affected checks after relevant changes and retain unaffected evidence only with an applicability explanation. Task-definition structural validation proves this contract's shape, not any implementation criterion.

## Execution Notes

Read `docs/tasks/delegation-context/02-source-projection.md` revision 1 and every controlling source above before planning, implementation or review. Verify its adjacent checksum when present and compare the recorded source baseline with the current checkout. Use a worktree under the repository's `.worktrees/`, starting from freshly fetched main; reconcile relevant drift before relying on an old source finding.

Selected next route: PLAN_REQUIRED. C-7 defines the selected projection behavior; fragment ownership, supporting structure, budget accounting and consumer proof require a bounded execution plan after traversal is available. The route supplies the next permitted preparation step; completing this authoring session does not execute implementation. No publication, external messaging, active host-runtime change or destructive operation is authorized here. Internal implementation decisions belong in the required downstream artifact. A discovery that changes the outcome, proof or approval boundary requires a revised task contract.

Dependencies: Depends on `docs/tasks/delegation-context/01-bounded-traversal.md` revision 1 for implemented selection behavior. The later policy task determines which selections are mandatory; this generic projector may truthfully return omissions.

Keep existing parsing, graph interpretation, query, projection, policy and transport responsibilities explicit. Do not add a second Markdown parser, infer links from prose or initialize unrelated subsystems merely to test this capability. Run focused behavior checks and required `npm run ci:enforcement` for runtime/compatibility changes, plus `npm run check:package-exports` for changed package surfaces. A successful command without its required observations is insufficient evidence.

### Execution Checkpoint

| Execution status | Current proving slice | Evidence admitted | Next action | Blockers / stop condition |
| --- | --- | --- | --- | --- |
| not-started | Prepare the selected route for the first proving slice; implementation of TD-SC-1 has not begun. | None admitted. | Read the task and sources, inspect traversal availability, then create the source-projection execution plan with that prerequisite explicit. | Stop dependent execution if source authority conflicts, prerequisite runtime behavior is unavailable, or the required downstream artifact is not executable. Resume after reconciliation and the affected route gates pass. |

## Follow-up / Non-blocking Work

`docs/tasks/delegation-context/04-projection-policy-verification.md` supplies required-obligation selection and verification. Multi-document support is separate. Summarization, whole-packet token budgeting, agent context receipts and a change to full-read requirements belong to consuming workflows.
