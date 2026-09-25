---
type: TaskDefinition
title: Retrieve bounded graph dependencies with source-backed explanations
task_id: bounded-document-graph-traversal
artifact_version: "3.0"
revision: "1"
created_at: "2026-09-23T16:25:18-05:00"
updated_at: "2026-09-23T16:25:18-05:00"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | PLAN_REQUIRED | Source authority, structural validation, semantic quality and post-draft review gates pass. C-6 supplies the selected behavioral contract; implementation placement, boundary cases and proof sequencing require a bounded execution plan. |

## Objective

Allow a caller to retrieve a bounded set of related entities from one captured document, with a reproducible relationship explanation for every included non-root entity and explicit evidence of incomplete exploration. This supplies the dependency selection needed by context projection without asking each implementer to rediscover graph relationships.

## Context / Constraints

Repository: `https://github.com/jasonbelmonti/markdown-trace`. Inspected baseline: `24d33c1061101c1065fb511921f7ddce4f285717` (freshly fetched main, 2026-09-23). Calibration: TD1 Standard. This task is additive to the completed portable-runtime work; it does not reopen that task's scope or treat its checkpoint as evidence for a new capability.

The experimental graph already exposes lookup and direct incoming/outgoing queries; `src/markdowntrace/document-graph/index.ts` exports no traversal operation. This task selects the existing interface proposal C-6 and its common handle/identity rules as the behavioral target, adapted to the current experimental runtime rather than the unimplemented full C-2/C-4 validator design. The current interface packet remains a draft for broader review; this selection does not adopt its unrelated proposals.

The analysis remains document-local, immutable, deterministic and read-only. Query selection never filters a relationship merely because graph validation forbids it. Markdown Engine continues to own parsing; graph facts and validation results cannot change because a caller requested traversal. No fixed production latency or model-token target is asserted.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| User request on 2026-09-23, quoted in README.md beside this task | Task authoring authority | Read in the current conversation | Author the Markdown Trace capability contracts from the discussed projection direction; this session does not execute implementation. |
| AGENTS.md; docs/design/markdown-trace-document-graph-overview.md revision 5; docs/current-implementation.md at 24d33c1061101c1065fb511921f7ddce4f285717 | Repository direction and inspected baseline | Read; overview checksum verified; exact hashes in source-fingerprints.json | Use the experimental graph, public Engine APIs and a worktree; preserve compatibility and separate proposed capabilities from implemented ones. |
| docs/design/markdown-trace-document-graph-interfaces.md, revision 9, C-6; common rules; VAL-4 and CASE-9 | Selected traversal behavior | Read; adjacent checksum verified | Adopt bounded reachability, canonical explanations, issued selections and visible boundary semantics; current runtime types remain the integration baseline. |
| src/markdowntrace/document-graph/queries.ts; src/markdowntrace/document-graph/contracts/query.ts; src/markdowntrace/document-graph/analysis-state.ts; src/markdowntrace/document-graph/index.ts | Implementation baseline | Inspected at recorded commit | Extend the existing graph/query responsibility; direct queries and their evidence remain available. |
| tests/test_document_graph_api.test.ts; tests/test_document_graph_links.test.ts; package.json | Existing proof surfaces | Relevant assertions and commands inspected; not rerun in authoring | Use independent graph expectations and preserve package consumers; historical tests do not prove traversal. |

Repository-relative source paths resolve in Markdown Trace at the recorded baseline. Sibling task paths resolve in this task set. Read the actual sources before relying on their descriptions; newer explicit user authority takes precedence. The source-fingerprint record is provenance, not additional completion authority.

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Bounded traversal and analysis-bound selection through the experimental package API | In scope | blocking | Realize C-6 over the current captured graph, including directions, filters, limits, deterministic order and provenance. |
| Meaningful boundary, defect, immutability and package-consumer proof; current usage documentation | In scope | blocking | Prove callable runtime behavior and retain existing semantics. |
| Context excerpts, cross-document resolution, projection policy, model routing and agent dispatch | Out of scope | non-blocking | Separate tasks or consumer responsibilities. |
| Stable API promotion, publication, performance certification and unrelated validator operators | Follow-up | non-blocking | No broader C-4 adoption or activation is required. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | The public traversal operation returns the C-6 entity set, breadth-first order and canonical shortest predecessor explanation for incoming, outgoing and both directions under explicit relation filters. | Compare exact ordered entities, depths and relationship IDs to a hand-audited graph containing multiple roots, a diamond, repeated references, cycles and self-links. Check omitted, empty and unknown relation filters separately. | Yes |
| TD-SC-2 | Depth and node limits bound selection exactly as C-6 specifies; depthLimited, nodeLimited and unresolvedRelationships describe the examined boundary without claiming exhaustive reachability. | Exercise depth zero, exact-fit and one-short node limits, duplicate roots, exhausted graphs, unresolved incident edges and unseen regions. Assert flags/counts, not only returned size; malformed or unsafe numeric bounds fail. | Yes |
| TD-SC-3 | Absent, missing or duplicate roots fail as unresolved roots; traversal skips non-resolvable endpoints and uncertain ownership while preserving direct-query access to the original evidence. | Use unique-definition, duplicate-definition and ambiguous-owner counterexamples. A resolved relationship rejected by validation must still be traversable when the query admits its kind. Compare snapshots and direct-query outputs before and after. | Yes |
| TD-SC-4 | Selections are runtime-issued, immutable and bound to analysis identity; repeat calls yield equal semantic results and caller mutations cannot alter captured facts or earlier results. | Reject fabricated analyses; mutate input query arrays and returned nested structures; compare earlier results. Check matching repeat analyses and distinct source/interpretation identities using actual public handles. | Yes |
| TD-SC-5 | The additive operation and types are usable from the packed experimental package while existing graph, validation, command and root-package behavior remains compatible. | Run a consumer outside the checkout against the packed package and independently specified traversal output; run applicable existing enforcement/package checks and follow the documented example. A declaration-only or checkout-only implementation must fail this proof. | Yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Explained dependency selection | A consumer obtains exactly the reachable bounded entities and their observed reasons. | Incorrect direction, path or budget semantics. | TD-SC-1, TD-SC-2 and TD-SC-3 observations. | Continue only when exact expectations and invalid-graph behavior agree. |
| Reusable package capability | A separate consumer can use the immutable selection contract. | Hidden mutable state or exports that exist only in source. | TD-SC-4 and TD-SC-5 observations. | Review when all required criteria have current evidence. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Selected capability | Objective, in-scope behavior and all required success criteria. | Items explicitly classified out of scope or follow-up. | Wrong selection, invented relationships, hidden truncation, false resolution, mutable results, stale identity or regressions in affected existing consumers block acceptance. Broader traversal languages, all-path enumeration, context projection and release-scale claims do not. |
| Maintainability and evidence | Ownership, explicit interfaces and meaningful proof at affected public boundaries. | Unrelated restructuring, stylistic preferences and additional framework layers. | Blocking only for a concrete problem introduced by this change with an identified affected boundary and practical consequence; stale or irrelevant required evidence also blocks. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Run the public experimental API against independent directed-graph expectations. | Compare exact ordered entities, depths and relationship IDs to a hand-audited graph containing multiple roots, a diamond, repeated references, cycles and self-links. Check omitted, empty and unknown relation filters separately. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-2 | Assert limit and defect observations against deliberately distinguishable graph fixtures. | Exercise depth zero, exact-fit and one-short node limits, duplicate roots, exhausted graphs, unresolved incident edges and unseen regions. Assert flags/counts, not only returned size; malformed or unsafe numeric bounds fail. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-3 | Prove resolution and validation remain separate at the public boundary. | Use unique-definition, duplicate-definition and ambiguous-owner counterexamples. A resolved relationship rejected by validation must still be traversable when the query admits its kind. Compare snapshots and direct-query outputs before and after. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-4 | Inspect actual selection identity, mutation resistance and deterministic output. | Reject fabricated analyses; mutate input query arrays and returned nested structures; compare earlier results. Check matching repeat analyses and distinct source/interpretation identities using actual public handles. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |
| TD-SC-5 | Capture packed consumer output, applicable regression results and documentation smoke evidence. | Run a consumer outside the checkout against the packed package and independently specified traversal output; run applicable existing enforcement/package checks and follow the documented example. A declaration-only or checkout-only implementation must fail this proof. Implementation evidence is not yet available. | Implementer; reviewer checks independent expected results. | Yes |

Every admitted result must identify the tested code/artifact state, relevant source and profile hashes, independent expected fixtures, dependency lockfile and runtime versions. Verify those inputs stayed applicable throughout the check. Preserve invalidated results as historical evidence; rerun affected checks after relevant changes and retain unaffected evidence only with an applicability explanation. Task-definition structural validation proves this contract's shape, not any implementation criterion.

## Execution Notes

Read `docs/tasks/delegation-context/01-bounded-traversal.md` revision 1 and every controlling source above before planning, implementation or review. Verify its adjacent checksum when present and compare the recorded source baseline with the current checkout. Use a worktree under the repository's `.worktrees/`, starting from freshly fetched main; reconcile relevant drift before relying on an old source finding.

Selected next route: PLAN_REQUIRED. C-6 supplies the selected behavioral contract; implementation placement, boundary cases and proof sequencing require a bounded execution plan. The route supplies the next permitted preparation step; completing this authoring session does not execute implementation. No publication, external messaging, active host-runtime change or destructive operation is authorized here. Internal implementation decisions belong in the required downstream artifact. A discovery that changes the outcome, proof or approval boundary requires a revised task contract.

Dependencies: No new sibling capability is required. The existing captured graph is the implementation prerequisite. The source-projection task consumes the completed selection capability.

Keep existing parsing, graph interpretation, query, projection, policy and transport responsibilities explicit. Do not add a second Markdown parser, infer links from prose or initialize unrelated subsystems merely to test this capability. Run focused behavior checks and required `npm run ci:enforcement` for runtime/compatibility changes, plus `npm run check:package-exports` for changed package surfaces. A successful command without its required observations is insufficient evidence.

### Execution Checkpoint

| Execution status | Current proving slice | Evidence admitted | Next action | Blockers / stop condition |
| --- | --- | --- | --- | --- |
| review-ready | Review the completed bounded traversal slice against TD-SC-1 through TD-SC-5. | TD-SC-1 and TD-SC-2: seven hand-audited traversal cases pass for directions, multiple roots, path order, limits and unseen regions. TD-SC-3 and TD-SC-4: the same suite proves unresolved evidence, policy separation, immutable issued selections and source/profile identity. TD-SC-5: packed root and experimental consumers, the guide example and `npm run ci:enforcement` pass with 93 tests. Tested inputs match aggregate SHA-256 e62f9d952fc7a7ae6ac334f6e418548e0e9582608da3f5e6f71f246fb16280cd, committed as 55eab2e0c57dd7c7e083d7774ff4a20a419d08fd; Node v22.20.0 and package-lock.json are recorded in `.context-capsule/execution/focused-proof.json`, `package-proof.json`, `enforcement-proof.json` and `guide-example-proof.json`. | Independently review the implementation and current proof against TD-SC-1 through TD-SC-5. | None. |

## Follow-up / Non-blocking Work

Context assembly is defined in `docs/tasks/delegation-context/02-source-projection.md`. Cross-document composition and mandatory-obligation policies are separate. All-path enumeration, resumable traversal cursors, automatic repair, graph services and stable release remain deferred.
