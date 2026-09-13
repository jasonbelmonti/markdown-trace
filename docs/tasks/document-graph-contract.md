---
type: TaskDefinition
title: Specify the document graph contract and proving corpus
task_id: document-graph-contract
artifact_version: "3.0"
revision: "3"
created_at: "2026-09-13T07:32:53-05:00"
updated_at: "2026-09-13T13:03:04Z"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | DIRECT | Source authority, structural validation, semantic quality, and post-draft review pass. The permitted work is a bounded contract/corpus recommendation; production implementation follows the resolved contract. |

## Objective

Produce one reviewable recommendation for Markdown Trace's document-wide identity language, source ownership, graph model, validation boundary, and minimal query/context contract, supported by an independently annotated mixed-layout corpus. The result must make the first graph-and-backlinks implementation slice concrete without committing the project to untested extraction semantics.

## Context / Constraints

- This is contract and corpus work. It does not implement a production extractor, public API, release, or downstream integration.
- The owner's 2026-09-13 vision controls: constrained identifier syntax, inference throughout a large spec, developer-defined relationship validity, validation API, and query-based context assembly for implementer agents.
- Markdown Engine remains the Markdown parser. Use its public 3.5.0 tree/source API as the inspected baseline; run npm ci in the active worktree before inspecting installed package capabilities.
- Proposed syntax and scope choices are recommendations until reviewed. Do not treat the earlier table-only or release-only completion contracts as the new product target.
- Use repository-owned specs as initial corpus sources when the owner has not named a target. Record this assumption and provenance, and permit later substitution without changing the semantic proof obligations.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| Owner statements in this conversation on 2026-09-13 | Product objective | current | Both correctness validation and relationship-based context retrieval are required outcomes. |
| docs/design/markdown-trace-document-graph-overview.md and its adjacent .sha256 file | Reviewed directional recommendation, not finalized syntax | current | Read the complete file first, verify its checksum, and resolve Q-1 through Q-4 to the depth needed for the first implementation slice. |
| Main commit 016dd0905d9f8103dc4dbd528e0b9fc15b516723 | Implementation evidence | current | Reuse parser/source integration and public-shell work; explicitly account for table-only anchors, closed enums, and existing commands. |
| Active operating manual and task-definition skill | Artifact and review discipline | current | Use isolated worktrees, explicit source reads, verifiable criteria, bounded review, and checksummed handoff. |

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Recommended identity/declaration/reference grammar and ownership rules | in scope | blocking | Resolve ambiguity using examples, not informal prose heuristics. |
| General graph, interpretation/validation separation, and minimal query/context contracts | in scope | blocking | Include invalid/partial states and source provenance. |
| Independently annotated fixture corpus and real-spec inventory | in scope | blocking | Expected results must be authored independently of a future extractor. |
| Compatibility disposition and first implementation boundary | in scope | blocking | Specify retain/adapt/defer per existing surface; do not produce a speculative full implementation plan. |
| Production code, public publication, source migration, and fleet activation | out of scope | non-blocking | These require later implementation and release work. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | One recommended grammar defines IDs, declarations versus references, forward references, typed relationship expressions, nesting/ownership, malformed forms, and literal/example policies across supported Markdown structures. | A versioned contract and example ledger assign an unambiguous interpretation or explicit diagnostic to every example, and compare at least one credible alternative. | yes |
| TD-SC-2 | One contract distinguishes entities, occurrences, fragments, unresolved references, and edges; specifies analysis completeness, validation assertions, lookup/backlinks/outgoing/traversal/context results, provenance, and limits. | Example results cover a valid graph, invalid graph with queryable evidence, unowned occurrence, bounded context, and stale-source failure without deriving facts from allowed-edge policy. | yes |
| TD-SC-3 | A corpus covers headings, paragraphs, lists, blockquotes, tables, nested scopes, forward references, duplicate definitions, dangling references, forbidden relationships, literal examples, and empty input; it includes a source inventory from at least one substantial repository spec. | Checked Markdown fixtures plus an independently annotated expectation file identify every entity, role/owner, edge, diagnostic, backlink, and selected/excluded context fragment by source location. Real source paths, hashes, sizes, and any adaptation are recorded. | yes |
| TD-SC-4 | The recommendation explicitly disposes of the existing registry/link graph, table graph/profile/result v1, CLI, API, and earlier release documentation, and bounds the first document-graph/backlinks delivery. | A compatibility table and one proving example show the retained behavior, proposed replacement/version boundary, follow-up scope, required evidence, and unresolved owner decisions. | yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Language and example interpretation | Two reviewers can derive the same entities, ownership, and references from a mixed-layout example. | Ambiguous language and accidental definitions | TD-SC-1 and the core examples for TD-SC-3 | Revise the recommendation if interpretation requires unstated conventions. |
| Graph/query contract and proving corpus | A future executor knows what backlinks, invalid states, and relevant source context must contain. | Conflicting validation/query models and tests that merely copy an extractor | TD-SC-2 through TD-SC-4 | Hand off only after all required contract/corpus evidence is present; unresolved owner choices remain explicitly unapproved. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Language and ownership | Determinism, syntax bounds, definitions/references, every supported context, ambiguity outcomes | NLP, universal Markdown extensions, multi-document resolution | Hidden or contradictory interpretation rules block acceptance. |
| Graph and consumer contract | Shared facts, invalid/partial evidence, source-backed queries, fragment selection, bounded results | Database implementation, agent orchestration, full rule catalog | Losing evidence or leaving basic query/context outcomes unspecified blocks acceptance. |
| Corpus and compatibility | Independent expected results, real source provenance, current-surface dispositions | Production regression execution for unchanged code, release preparation | Self-derived expectations, missing required cases, or silent v1 changes block acceptance. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Interpret each example using only the proposed contract; inspect lexical boundaries and scope transitions. | Contract clauses and explicit expected interpretation/diagnostic per example. | Maintainer and reviewer | yes |
| TD-SC-2 | Walk valid, invalid, unowned, bounded, and stale-source queries by hand against the graph examples. | Public-result sketches and traced source fragments with no hidden completeness assumptions. | Maintainer and reviewer | yes |
| TD-SC-3 | Cross-check every fixture occurrence and context fragment against its source; verify source hashes and inventory. | Independently authored expectation ledger and hashed corpus; actual target sizes recorded. | Maintainer and reviewer | yes |
| TD-SC-4 | Compare proposed dispositions against current source/public types and release work; inspect the first proving boundary. | Compatibility table, first-slice example, and explicit decision list. | Maintainer and project owner | yes |

## Execution Notes

This task is calibrated TD1 Standard. Its next action is authoring a bounded contract/corpus recommendation; no separate production execution plan is required for that artifact work. A later implementation task must consume the resolved contract and corpus, not infer syntax from this task.

Handoff instruction: First read docs/tasks/document-graph-contract.md and verify its adjacent checksum. Then read the exact overview path in Source Authority, verify its checksum and recorded validation evidence, and recheck current source and user decisions. Paths are relative to the repository root. Keep each new artifact in the active context after writing it. Structural validation evidence is recorded in docs/validation/artifacts.json.

Revision history: Revision 1 captured the bounded contract/corpus scope from the owner's clarified vision. Revision 2 marks the task ready for direct artifact work after its readiness gates; this does not approve a proposed language or change the implementation boundary. Revision 3 moves the canonical task into docs/tasks, makes source and handoff paths portable, and incorporates removal of superseded guidance. The adjacent checksum identifies the current bytes.

## Follow-up / Non-blocking Work

- Implement the shared graph and direct backlinks against the resolved corpus.
- Add profile validation breadth and bounded context projection against that same graph.
- Prove large-document behavior and consuming-skill value, then complete package distribution and release.
- Broader traversal operators, multi-document graph resolution, repair automation, and graph visualization remain separate extensions.
