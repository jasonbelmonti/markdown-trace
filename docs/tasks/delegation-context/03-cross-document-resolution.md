---
type: TaskDefinition
title: Resolve trace relationships across explicitly supplied document revisions
task_id: cross-document-trace-resolution
artifact_version: "3.0"
revision: "1"
created_at: "2026-09-23T16:25:18-05:00"
updated_at: "2026-09-23T16:25:18-05:00"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | SPEC_REQUIRED | Source authority, structural validation, semantic quality and post-draft review gates pass. This expands the current document-local boundary; qualified identity, cross-document reference binding, revision compatibility and failure semantics require a scoped specification before implementation. |

## Objective

Allow callers to connect a task definition, execution plan and related Markdown artifacts without confusing identical local entity IDs or mixing source revisions. Cross-document queries must preserve the original document-local evidence and explain exactly which source occurrence establishes each connection.

## Context / Constraints

Repository: `https://github.com/jasonbelmonti/markdown-trace`. Inspected baseline: `24d33c1061101c1065fb511921f7ddce4f285717` (freshly fetched main, 2026-09-23). Calibration: TD1 Standard. This task is additive to the completed portable-runtime work; it does not reopen that task's scope or treat its checkpoint as evidence for a new capability.

The current direction explicitly excludes multi-document resolution from its existing delivery. The user now requests task definitions for the projection work discussed in this conversation, which includes this capability. This is a separate proposed delivery boundary, not a claim that the existing delivery already includes it. Its required specification must reconcile the direction and interface documents before implementation.

Inputs remain an explicit, finite caller-supplied set of local document captures and supported data-only configuration. No repository crawling, URL fetching, global entity registry or latest-revision inference is required. Preserve the existing draft2 grammar and single-document behavior; select an additive cross-document representation through the specification rather than inventing new URI fields in this task. Identity must distinguish the document/artifact, captured revision/content identity and local entity ID; its exact encoding is delegated to specification.

Existing document-local validation remains about its captured document. Cross-document resolution must not silently turn that verdict into a different claim or rewrite a local missing-target record. The corpus view needs separate, truthful status and provenance.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| User request on 2026-09-23, quoted in README.md beside this task | Task authoring authority | Read in the current conversation | Author the Markdown Trace capability contracts from the discussed projection direction; this session does not execute implementation. |
| AGENTS.md; docs/design/markdown-trace-document-graph-overview.md revision 5; docs/current-implementation.md at 24d33c1061101c1065fb511921f7ddce4f285717 | Repository direction and inspected baseline | Read; overview checksum verified; exact hashes in source-fingerprints.json | Use the experimental graph, public Engine APIs and a worktree; preserve compatibility and separate proposed capabilities from implemented ones. |
| Conversation source excerpt in README.md, user request on 2026-09-23 | New authoring scope | Explicit request following cross-document projection discussion | Define a separate multi-document task and its design gate; no runtime changes are being executed in this session. |
| docs/design/markdown-trace-document-graph-overview.md revision 5, non-goals and ASM-1; interface packet revision 9, C-1/C-3/C-5/C-8 | Existing boundary and compatibility | Read; design checksums verified | Record the scope extension; require explicit additive contracts and preserve document-local semantics. |
| src/markdowntrace/document-graph/contracts/source.ts; src/markdowntrace/document-graph/contracts/analysis.ts; src/markdowntrace/document-graph/queries.ts; docs/experimental-document-graph.md | Actual identity and query baseline | Inspected at recorded commit | Local identifiers and issued analyses do not provide corpus resolution; source hashes and occurrence ranges can support it. |

Repository-relative source paths resolve in Markdown Trace at the recorded baseline. Sibling task paths resolve in this task set. Read the actual sources before relying on their descriptions; newer explicit user authority takes precedence. The source-fingerprint record is provenance, not additional completion authority.

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
| TD-SC-5 | The additive corpus API and declared types work from the packed experimental package, and existing single-document and legacy consumers remain compatible. | Run an isolated consumer on explicit copied sources, applicable enforcement/package checks and the documented example. Compare retained single-document results and verify input preservation. Record the actual source/profile/runtime fingerprints. | Yes |

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
| TD-SC-1 | Review the scoped specification and consumer example; runtime criteria remain independently required. | Read the reconciled contract against cases for duplicate local IDs, multiple revisions, incompatible interpretations and nonexistent targets; type-check a consumer example. Record the specification review against these outcomes before implementation; this is design evidence only. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-2 | Exercise the public corpus boundary against independently named identities and source locations. | Use two task documents both declaring TD-SC-1 and a plan referring explicitly to one; add a second revision with changed bytes under the same human revision label. Assert qualified targets, actual content hashes and exact occurrence ranges. No first-match or latest-match resolution may pass. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-3 | Use negative corpus cases that a global local-ID join would incorrectly accept. | Omit a selected document, duplicate an identity with conflicting content, alter a pinned capture and supply conflicting bindings/profiles. Assert precise affected references and retained original evidence; verify no filesystem/network discovery occurs in the core. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-4 | Compare cross-document selection and direct-query evidence with a hand-audited corpus oracle. | Use a cross-document diamond/cycle and a local invalid graph. Compare ordered qualified entities, predecessor occurrence identities, boundary indicators, original snapshots and local validation reports before and after corpus queries. Check input order permutations against the specified order policy. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-5 | Capture public consumer results, compatibility proof and reconciled documentation evidence. | Run an isolated consumer on explicit copied sources, applicable enforcement/package checks and the documented example. Compare retained single-document results and verify input preservation. Record the actual source/profile/runtime fingerprints. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |

Every admitted result must identify the tested code/artifact state, relevant source and profile hashes, independent expected fixtures, dependency lockfile and runtime versions. Verify those inputs stayed applicable throughout the check. Preserve invalidated results as historical evidence; rerun affected checks after relevant changes and retain unaffected evidence only with an applicability explanation. Task-definition structural validation proves this contract's shape, not any implementation criterion.

## Execution Notes

Read `docs/tasks/delegation-context/03-cross-document-resolution.md` revision 1 and every controlling source above before planning, implementation or review. Verify its adjacent checksum when present and compare the recorded source baseline with the current checkout. Use a worktree under the repository's `.worktrees/`, starting from freshly fetched main; reconcile relevant drift before relying on an old source finding.

Selected next route: SPEC_REQUIRED. This expands the current document-local boundary; qualified identity, cross-document reference binding, revision compatibility and failure semantics require a scoped specification before implementation. The route supplies the next permitted preparation step; completing this authoring session does not execute implementation. No publication, external messaging, active host-runtime change or destructive operation is authorized here. Internal implementation decisions belong in the required downstream artifact. A discovery that changes the outcome, proof or approval boundary requires a revised task contract.

Dependencies: The existing document-local analysis is the baseline. `docs/tasks/delegation-context/01-bounded-traversal.md` revision 1 supplies traversal behavior before this task implements cross-document bounded selection. Specification work may proceed before that runtime exists; source projection is not a prerequisite for corpus resolution.

Keep existing parsing, graph interpretation, query, projection, policy and transport responsibilities explicit. Do not add a second Markdown parser, infer links from prose or initialize unrelated subsystems merely to test this capability. Run focused behavior checks and required `npm run ci:enforcement` for runtime/compatibility changes, plus `npm run check:package-exports` for changed package surfaces. A successful command without its required observations is insufficient evidence.

### Execution Checkpoint

| Execution status | Current proving slice | Evidence admitted | Next action | Blockers / stop condition |
| --- | --- | --- | --- | --- |
| not-started | Prepare the selected route for the first proving slice; implementation of TD-SC-1 has not begun. | None admitted. | Read the task and sources, then formalize the additive corpus specification and reconcile the documented delivery boundary. | Stop dependent execution if source authority conflicts, prerequisite runtime behavior is unavailable, or the required downstream artifact is not executable. Resume after reconciliation and the affected route gates pass. |

## Follow-up / Non-blocking Work

The verified projection task consumes explicit corpus results. Remote access, incremental indexing, stable identity across arbitrary document moves, persistence and additional syntax migrations require separate scope. This task does not grant a projection permission to replace full reads.
