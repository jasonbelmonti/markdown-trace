---
type: TaskDefinition
title: Resolve trace relationships across explicitly supplied document revisions
task_id: cross-document-trace-resolution
artifact_version: "3.0"
revision: "3"
created_at: "2026-09-23T16:25:18-05:00"
updated_at: "2026-09-26T14:29:47.985926+00:00"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | PLAN_REQUIRED | Revision 3 records implementation authorization and the adopted corpus contract. Source, structural, semantic and post-draft review gates pass. TD-SC-1 specification review preceded implementation. The validated plan and delegation bundle were executed serially; all runtime criteria now have admitted coordinator evidence. Execution is review-ready, pending independent judgment. |

## Objective

Allow callers to connect a task definition, execution plan and related Markdown artifacts without confusing identical local entity IDs or mixing source revisions. Cross-document queries must preserve the original document-local evidence and explain exactly which source occurrence establishes each connection.

## Context / Constraints

Repository: `https://github.com/jasonbelmonti/markdown-trace`. Inspected merged-main baseline: `0bce099df4bf30b017ea58490f6b32db62415d2a` (fetched 2026-09-26). Calibration: TD1 Standard. Document-local traversal and exact source projection are implemented. The package root and experimental graph entrypoint export `traverseGraph` and `extractContext`; issued selections remain bound to one analysis. This task adds a corpus view without reopening those delivered capabilities.

The owner requests a bounded first design aimed at real workflow use, specifically a plan action linked to its task's acceptance criteria and source obligations. The companion [cross-document workflow design brief](../../design/cross-document-workflow-design-brief.md) records proposed choices and reconciliation evidence. The companion [corpus contract](../../design/cross-document-corpus-contract.md) and its typed consumer now materialize that direction. The owner has requested implementation with delegation-planner; preserve all five success criteria while executing the validated route. The design and type proof are not runtime acceptance.

At preparation, the direction limited delivery to one document and its overview/interface status lagged delivered traversal/context. This task is the explicit additive scope extension. Current direction revision 7, interface packet revision 11 and current-implementation.md now reconcile local and corpus runtime behavior; the adopted corpus contract retains the selected semantics. Retired table-profile and registry/sidecar interfaces have no compatibility obligation and must not be restored.

Inputs remain an explicit, finite caller-supplied set of local document captures and supported data-only configuration. No repository crawling, URL fetching, global entity registry or latest-revision inference is required. Preserve draft2 grammar and single-document behavior. Identity must distinguish the document/artifact, captured content and interpretation identity, and local entity ID; select the additive binding representation in the specification. Existing opt-in TaskDefinition annotations provide a starting point; plain ID text alone is not a declaration and must not acquire inferred meaning.

Existing document-local validation remains about its captured document. Corpus resolution must not turn that verdict into a different claim or rewrite a local missing-target record. Corpus results need separate status and original occurrence evidence. Mandatory-content policy, global packet budgets and independent packet verification remain Task 4 concerns; linked obligations alone do not establish complete worker context.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| Owner’s 2026-09-26 instruction to proceed with Task 3 using delegation-planner, after accepting the design follow-up revision | Current implementation authorization; latest instruction prevails | Read | Complete specification/plan gates, then serial supervised implementation. No publication, installed-runtime activation or full-read exemption follows. |
| Current owner-supplied operating instructions and AGENTS.md | Operating authority; full read | Read; global instructions updated in this run | Use a project worktree, source-backed checks and explicit module ownership. Measure mandatory worker reading; keep per-run plans and evidence ignored. |
| docs/design/cross-document-corpus-contract.md revision 1; docs/design/corpus-api/contracts.d.ts; docs/design/corpus-api/consumer.ts | Adopted behavioral specification and type contract; full read before implementation | Pre-implementation contract review, structural validation and strict consumer typecheck recorded under .codefactory/task-3-run/ | Materializes identity, pins, binding precedence, accepted profiles, deterministic queries, selection compatibility, failures and package workflow; runtime evidence remains required. |
| docs/design/markdown-trace-document-graph-overview.md; docs/current-implementation.md | Direction and delivered baseline; full read per AGENTS.md | Current bytes inspected; historical proposed-status wording is reconciled by current source and the corpus contract | Extend the document-local runtime additively and preserve retired-workflow exclusion. |
| docs/design/cross-document-workflow-design-brief.md revision 2; docs/design/markdown-trace-document-graph-interfaces.md revision 11; docs/experimental-document-graph.md | Supporting design and local API context | Inspected; full read when revising behavior, investigating a contract conflict or updating these documents | The corpus contract owns selected new semantics; original local contracts remain compatible. These supporting documents are not additional worker completion contracts. |
| src/markdowntrace/document-graph/; tests/test_document_graph_*; scripts/package-exports/; package.json | Implementation and verification baseline | Inspected at 0bce099df4bf30b017ea58490f6b32db62415d2a | Read the relevant producer, consumer and test files before editing their behavior, as selected in each packet. Code does not replace acceptance authority. |
| docs/tasks/delegation-context/01-bounded-traversal.md; 02-source-projection.md; 04-projection-policy-verification.md; experiments/task-definition-trace/authoring.md and task-definition.md | Delivered predecessor and deferred-policy boundaries; representative authoring context | Inspected; read when changing predecessor compatibility, claiming policy completeness or adapting the annotated example | Traversal and local projection are implemented. Task 4 owns mandatory policy and verification. Old historical authoring/checkpoint status does not override current source. |

Paths resolve from this repository. Read this complete task and sources marked full read before execution or review; honor the stated triggers for conditional references. The original source-fingerprints and revision 1 validation records are historical. Current source fingerprints, specification review and validation records live under ignored .codefactory/task-3-run/. The adjacent checksum identifies this task’s current bytes.

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Explicit corpus identity, reference binding and resolution outcomes | In scope | blocking | Qualify targets without conflating same-named local entities or selecting revisions implicitly. |
| Source-backed cross-document lookup, direct references and bounded dependency selection | In scope | blocking | Provide a usable consumer boundary with occurrence evidence and deterministic limits; reuse compatible traversal behavior. |
| Specification, experimental package proof and reconciled current documentation | In scope | blocking | Resolve versioning, integrity and failure behavior before implementation; retain existing package/command compatibility. |
| Automatic discovery, remote sources, persistent graph stores, natural-language link inference and global registry migration | Out of scope | non-blocking | Callers explicitly supply sources and bindings; no guessed relationships. |
| Multi-document context packet verification, consuming-skill exemptions and active release/Fleet changes | Follow-up | non-blocking | The policy-verification task consumes this boundary. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | The adopted specification defines qualified identity, explicit cross-document binding, accepted source/profile combinations, deterministic ordering, missing/ambiguous/stale outcomes and bounded selection without changing existing single-document meanings. | Read the reconciled contract against cases for duplicate local IDs, multiple revisions, incompatible interpretations and nonexistent targets; type-check a consumer example. Record the specification review against these outcomes before implementation; this is design evidence only. | Yes |
| TD-SC-2 | A real consumer can distinguish the same local entity ID in different artifacts and revisions, and every successful cross-document reference identifies one explicit target capture and its original source occurrence. | Use two task documents both declaring TD-SC-1 and a plan referring explicitly to one; add a second revision with changed bytes under the same human revision label. Assert qualified targets, actual content hashes and exact occurrence ranges. No first-match or latest-match resolution may pass. | Yes |
| TD-SC-3 | Missing targets/documents, conflicting identity records, ambiguous bindings and incompatible source/profile combinations produce explicit unresolved outcomes or operation failures according to the specification, never successful guessed edges. | Omit a selected document, duplicate an identity with conflicting content, alter a pinned capture and supply conflicting bindings/profiles. Assert precise affected references and retained original evidence; verify no filesystem/network discovery occurs in the core. | Yes |
| TD-SC-4 | Incoming/outgoing queries and bounded traversal across documents preserve observed edge evidence, terminate on cycles and expose limits and uncertainty without mutating document-local analyses or validation results. | Use a cross-document diamond/cycle and a local invalid graph. Compare ordered qualified entities, predecessor occurrence identities, boundary indicators, original snapshots and local validation reports before and after corpus queries. Check input order permutations against the specified order policy. | Yes |
| TD-SC-5 | The additive corpus API and declared types work from the packed experimental package, and existing single-document APIs, profiles and document-command consumers remain compatible; retired table-profile and registry/sidecar workflows remain absent. | Run an isolated consumer on explicit copied sources, applicable enforcement/package checks and the documented example. Compare retained single-document results and verify input preservation. Record the actual source/profile/runtime fingerprints. | Yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Unambiguous cross-document references | A caller connects one plan to the intended task revision despite local-ID collisions. | False equivalence of similarly named criteria. | TD-SC-1 specification and TD-SC-2/TD-SC-3 runtime observations. | Continue after the specified identity and failure cases are proven. |
| Bounded corpus dependency selection | A consumer can inspect and select related obligations across the supplied sources. | Unbounded traversal or altered local validity claims. | TD-SC-4 and TD-SC-5 observations. | Review only when all criteria have current evidence. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Selected capability | Objective, in-scope behavior and all required success criteria. | Items explicitly classified out of scope or follow-up. | Identity collisions, revision substitution, inferred or falsely resolved edges, missing source-occurrence evidence, hidden limits and altered document-local semantics block. General document discovery, databases, remote synchronization and semantic requirement inference remain non-blocking follow-up. |
| Maintainability and evidence | Ownership, explicit interfaces and meaningful proof at affected public boundaries. | Unrelated restructuring, stylistic preferences and additional framework layers. | Blocking only for a concrete problem introduced by this change with an identified affected boundary and practical consequence; stale or irrelevant required evidence also blocks. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Review the scoped specification and consumer example; runtime criteria remain independently required. | Read the reconciled contract against cases for duplicate local IDs, multiple revisions, incompatible interpretations and nonexistent targets; type-check a consumer example. Record the specification review against these outcomes before implementation; this is design evidence only. Observed design acceptance: .codefactory/task-3-run/specification-acceptance.json predates implementation and identifies structural, semantic and strict type proof. Final public signatures preserve the adopted declarations. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-2 | Exercise the public corpus boundary against independently named identities and source locations. | Use two task documents both declaring TD-SC-1 and a plan referring explicitly to one; add a second revision with changed bytes under the same human revision label. Assert qualified targets, actual content hashes and exact occurrence ranges. No first-match or latest-match resolution may pass. Observed: EP-GATE-1 and EP-GATE-4 under .codefactory/task-3-run/ pass exact qualified targets, same-document revision captures, copied-file hashes and ranges; Task B precedes A in the packed fixture and is excluded from the selected path. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-3 | Use negative corpus cases that a global local-ID join would incorrectly accept. | Omit a selected document, duplicate an identity with conflicting content, alter a pinned capture and supply conflicting bindings/profiles. Assert precise affected references and retained original evidence; verify no filesystem/network discovery occurs in the core. Observed: EP-GATE-1 and EP-GATE-2 pass admission and all eight resolution reasons; EP-GATE-4 packed edit probes reject stale pins before deliberate rebinding. Coordinator core-review.json confirms no core I/O or reparsing. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-4 | Compare cross-document selection and direct-query evidence with a hand-audited corpus oracle. | Use a cross-document diamond/cycle and a local invalid graph. Compare ordered qualified entities, predecessor occurrence identities, boundary indicators, original snapshots and local validation reports before and after corpus queries. Check input order permutations against the specified order policy. Observed: EP-GATE-2 and EP-GATE-3 pass query ordering, diagnostic intent, diamond/cycle, directions, limits, permutations and handle compatibility. EP-GATE-4 preserves original snapshots and validation and exposes full selection/excerpt boundaries. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-5 | Capture public consumer results, compatibility proof and reconciled documentation evidence. | Run an isolated consumer on explicit copied sources, applicable enforcement/package checks and the documented example. Compare retained single-document results and verify input preservation. Record the actual source/profile/runtime fingerprints. Observed: EP-GATE-4 passes npm run ci:enforcement (128 tests, 21 files, build, both packed entrypoints/types and existing document command) and the normal manifest demo. before.json/after.json identify unchanged tested inputs; current documentation structural checks pass separately. | Implementer; reviewer checks independent expected results. | Yes |

Every admitted result must identify the tested code/artifact state, relevant source and profile hashes, independent expected fixtures, dependency lockfile and runtime versions. Verify those inputs stayed applicable throughout the check. Preserve invalidated results as historical evidence; rerun affected checks after relevant changes and retain unaffected evidence only with an applicability explanation. Task-definition structural validation proves this contract's shape, not any implementation criterion.

## Execution Notes

Read `docs/tasks/delegation-context/03-cross-document-resolution.md` revision 3 and the controlling sources above in their stated reading modes before planning, implementation or review. Verify its adjacent checksum when present and compare the recorded source baseline with the current checkout. Use a worktree under the repository's `.worktrees/`, starting from freshly fetched main; reconcile relevant drift before relying on an old source finding.

Selected next route after readiness validation: PLAN_REQUIRED. The adopted corpus contract satisfies the specification prerequisite after TD-SC-1’s recorded structural/type/semantic checks. The authorized RUN still requires a validated execution plan and delegation bundle before dispatch. No publication, external messaging, installed host-runtime change or destructive action is authorized. A discovery that changes the outcome, proof or approval boundary requires task revision.

Dependencies: Document-local analysis and Task 1 traversal are implemented at the inspected baseline. Task 2 extraction is available for a consumer demonstration after corpus selection, using genuine per-document issued selections. Corpus resolution does not depend on new projection behavior. Task 4 remains the separate mandatory-content policy and verification boundary.

Keep existing parsing, graph interpretation, query, projection, policy and transport responsibilities explicit. Do not add a second Markdown parser, infer links from prose or initialize unrelated subsystems merely to test this capability. Run focused behavior checks and required `npm run ci:enforcement` for runtime/compatibility changes, plus `npm run check:package-exports` for changed package surfaces. A successful command without its required observations is insufficient evidence.

### Execution Checkpoint

| Execution status | Current proving slice | Evidence admitted | Next action | Blockers / stop condition |
| --- | --- | --- | --- | --- |
| review-ready | TD-SC-1 through TD-SC-5 have current design and runtime evidence. | TD-SC-1: .codefactory/task-3-run/specification-acceptance.json. TD-SC-2 and TD-SC-3: EP-GATE-1, EP-GATE-2 and EP-GATE-4/result.json under .codefactory/task-3-run/. TD-SC-4: EP-GATE-2, EP-GATE-3 and EP-GATE-4/result.json. TD-SC-5: .codefactory/task-3-run/REMEDIATION-1/result.json reruns full enforcement and the normal demo; both packed entrypoints also restore the edited path and inspected criterion through reported manifest updates. final-overview-validation.json and final-interface-validation.json remain applicable. Gate before/after files record tested-state hashes; .codefactory/convergent-review/task-3-corpus/round-2/evidence-reconciliation.json identifies current evidence and this checkpoint-only update. | Run convergent-review Round 2 against the unchanged contract and BLK-1 remediation. | BLK-1 is repaired with passing coordinator proof; independent closure remains pending. |

### Revision provenance

Revision 2 (2026-09-26) updates source authority and implemented dependencies, removes the obsolete legacy-consumer obligation from TD-SC-5, and records the owner-selected first workflow. TD-SC-1 through TD-SC-4 and their proof obligations are unchanged; TD-SC-5 continues to require packed consumer and current compatibility proof. The companion design remains a proposal.

Revision 3 records the owner’s implementation request, adopts the bounded corpus contract after its gates, and makes required full reads and conditional references explicit under the updated context-cost instructions. All five success criteria, proof obligations, non-goals and review boundaries are unchanged. The 2026-09-26 post-execution update admits verified runtime evidence and refreshes current-document provenance and the execution checkpoint; it does not materially revise the contract or route.

## Follow-up / Non-blocking Work

The verified projection task consumes explicit corpus results. Remote access, incremental indexing, stable identity across arbitrary document moves, persistence and additional syntax migrations require separate scope. This task does not grant a projection permission to replace full reads.
