---
type: TaskDefinition
title: Run document-wide graph analysis and direct backlinks
task_id: runnable-document-graph
artifact_version: "3.0"
revision: "4"
created_at: "2026-09-15T00:00:00-05:00"
updated_at: "2026-09-16T13:28:36.967535+00:00"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | DIRECT | The owner authorized the graph and export with cleanup in a separate PR; source, structural, semantic and post-draft readiness gates pass. |

## Objective

Make a caller-supplied Markdown spec into a runnable identity/relationship graph and answer which identifiers reference another identifier, with exact source locations across document layouts and a full JSON snapshot for local inspection.

## Context / Constraints

Use standard Markdown links for declarations and typed references under markdown-trace.identity.draft2, with Markdown Engine 3.5.0's public structure/source API. Keep the root API and CLI compatible. The owner explicitly requested this runnable slice after rejecting further expansion of pre-implementation proof; the earlier contract/corpus closeout sequence is not a prerequisite. This does not approve stable syntax, publication or the full product.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| Owner's latest request in the implementation conversation: replace brace annotations with standard Markdown links, open a PR, export a user-supplied document graph, and separate baseline cleanup into its own PR | Execution authorization | current | Implement link URI semantics; the latest instruction supersedes the draft1 brace grammar. |
| Main commit 9155cdd65bffdd5afad299deeb28abd5b0a9eb9c | Implementation baseline | current | Start independently of PR #77's expanded API-result oracles. |
| docs/design/markdown-trace-document-graph-interfaces.md and adjacent checksum | Draft interpretation and consumer contracts | current experimental reference | Read first and verify checksum for the graph/direct-query subset. The current authoring convention is owned by docs/experimental-document-graph.md; draft1 syntax is superseded; removing old planning artifacts belongs to the separate cleanup PR. No validation, traversal or projection promise in this slice. |
| docs/experimental-document-graph.md and fixtures/document-graph/ | Current link convention and source examples | current | URI targets establish identity; explicit role=definition declares and rel names typed references. Engine resolves reference-style Markdown links. |

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Profile compilation, document analysis, lookup and incoming/outgoing queries | in scope | blocking | Export at experimental/graph with source provenance, immutable handles and explicit limits/errors. |
| Runnable example, source-fixture tests and package consumer | in scope | blocking | Demonstrate actual calls and full snapshot JSON for a caller-supplied document/profile; keep proof concise and expectations independent. |
| Broader planning/design cleanup and obsolete artifact removal | out of scope | non-blocking | Delivered in a separate PR at the owner’s request; feature usage documentation remains in this task. |
| Graph policy evaluation, traversal, context projection, migration and publication | follow-up | non-blocking | Preserve evidence needed for later work; do not expose unimplemented operations. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | Real Markdown extraction and direct queries produce the expected occurrence, owner, relationship and coverage facts from standard Markdown links across supported layouts. | Hand-authored link fixtures and ownership assertions pass; the mixed-layout demo returns the WP-1 list and WP-2 table backlinks to REQ-2 at the annotated locations. | yes |
| TD-SC-2 | Duplicate/dangling/unknown and uncertain-owner evidence remains queryable; invalid inputs and limits fail explicitly; policy-only changes preserve immutable graph identity. | API tests exercise these states, repeated-reference pagination, source capture, malformed-link diagnostics and fabricated handles through public functions. | yes |
| TD-SC-3 | A packed consumer can typecheck and execute the five experimental functions while the legacy API/CLI checks still pass. | Package smoke consumes the installed tarball and verifies a located backlink; ci:enforcement passes; the guide and demo describe the actual experimental boundary; exported JSON contains the full source-identified graph with no console-log preamble. | yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Graph and backlinks from real Markdown | A caller can identify the source owner and location of an incoming reference. | Contracts that cannot be implemented or consumed | TD-SC-1 through TD-SC-3 | Complete this slice once the runtime, package and compatibility evidence pass; broaden functionality in later work. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Graph facts and direct queries | Link syntax, ownership, preserved defects, provenance, indexes, bounds and immutable handles | Exhaustive input permutations, full API-result oracle expansion, release-scale guarantees | Incorrect source facts or query results block. |
| Consumer and compatibility | Experimental entry point, executable demo, full JSON export, accurate feature usage guidance and retained root/CLI behavior | Stable subpaths, graph-policy verdicts, traversal and agent context assembly | Unusable exports, misleading capability claims or legacy regressions block. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Run test_document_graph_links and demo:graph | Actual link targets, roles, owners and exact source slices compared to hand-authored expectations; no label double counting or malformed-URL fallback | Implementer | yes |
| TD-SC-2 | Run test_document_graph_api | Public-operation assertions for retained evidence, malformed-link handling, input errors, immutability and pagination | Implementer | yes |
| TD-SC-3 | Run ci:enforcement, including the installed-package consumer | Passing types, tests, build, API/CLI compatibility, and no unintended tracked changes; record tested commit in the PR; parse full demo output for default and custom profiles and compare source locations | Implementer | yes |

## Execution Notes

TD1 Standard, direct execution. Read this file and its adjacent checksum first on resume, then the cited interface packet. Runtime source is under src/markdowntrace/document-graph; docs/experimental-document-graph.md is the consumer guide. The graph captures Engine block fragments and supporting headings/table structure; exact fragment partitioning remains experimental until context projection is implemented. This task does not depend on PR #77. Revision 1 recorded the runnable implementation priority. Revision 2 replaces brace declarations/typed expressions with Engine-parsed links, keeps bare-ID generic mentions and existing ownership, and replaces the obsolete runtime brace-corpus assertions with link-focused checks. Revision 3 combined export and baseline cleanup. Revision 4 keeps the export here and moves broader planning/design reconciliation and obsolete-file removal into a separate PR, as requested by the owner. The cleanup PR is based on the feature branch; merge the feature PR first. Legacy registry/trace-link commands remain unchanged. Structural validation is recorded in docs/validation/runnable-document-graph.json.

## Follow-up / Non-blocking Work

Add profile-based graph validation, then bounded traversal and source-context projection over this graph. Measure representative real-spec scale and consuming-agent value before a stable release. Stable syntax approval, publication and migration remain separate decisions.
