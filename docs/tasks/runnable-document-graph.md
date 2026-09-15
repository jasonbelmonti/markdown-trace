---
type: TaskDefinition
title: Run document-wide graph analysis and direct backlinks
task_id: runnable-document-graph
artifact_version: "3.0"
revision: "1"
created_at: "2026-09-15T00:00:00-05:00"
updated_at: "2026-09-15T00:00:00-05:00"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | DIRECT | The owner authorized this bounded experimental implementation; source, structural, semantic and post-draft readiness gates pass. |

## Objective

Make a caller-supplied Markdown spec into a runnable identity/relationship graph and answer which identifiers reference another identifier, with exact source locations across document layouts.

## Context / Constraints

Use the current draft language experimentally and Markdown Engine 3.5.0's public structure/source API. Keep the root API and CLI compatible. The owner explicitly requested this runnable slice after rejecting further expansion of pre-implementation proof; the earlier contract/corpus closeout sequence is not a prerequisite. This does not approve stable syntax, publication or the full product.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| Owner's latest request in the implementation conversation: create the first runnable graph-and-backlinks capability now | Execution authorization | current | Build and demonstrate the capability now using the existing draft. |
| Main commit 9155cdd65bffdd5afad299deeb28abd5b0a9eb9c | Implementation baseline | current | Start independently of PR #77's expanded API-result oracles. |
| docs/design/markdown-trace-document-graph-interfaces.md and adjacent checksum | Draft interpretation and consumer contracts | current experimental reference | Read first and verify checksum; use the graph/direct-query subset. No validation, traversal or projection promise in this slice. |
| docs/design/document-graph-api/examples/corpus/ | Independently reviewed source annotations | current evidence | Compare real extraction and queries to the existing 66 distinct annotated sources. |

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Profile compilation, document analysis, lookup and incoming/outgoing queries | in scope | blocking | Export at experimental/graph with source provenance, immutable handles and explicit limits/errors. |
| Runnable example, source-fixture tests and package consumer | in scope | blocking | Demonstrate actual calls; keep proof concise and expectations independent. |
| Graph policy evaluation, traversal, context projection, migration and publication | follow-up | non-blocking | Preserve evidence needed for later work; do not expose unimplemented operations. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | Real Markdown extraction and direct queries match the reviewed occurrence, owner, relationship and coverage facts across supported layouts. | All 66 distinct source annotations pass; the mixed-layout demo returns the WP-1 list and WP-2 table backlinks to REQ-2 at the annotated locations. | yes |
| TD-SC-2 | Duplicate/dangling/unknown and uncertain-owner evidence remains queryable; invalid inputs and limits fail explicitly; policy-only changes preserve immutable graph identity. | API tests exercise these states, repeated-reference pagination, source capture, malformed-expression recovery and fabricated handles through public functions. | yes |
| TD-SC-3 | A packed consumer can typecheck and execute the five experimental functions while the legacy API/CLI checks still pass. | Package smoke consumes the installed tarball and verifies a located backlink; ci:enforcement passes; the guide and demo describe the actual experimental boundary. | yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Graph and backlinks from real Markdown | A caller can identify the source owner and location of an incoming reference. | Contracts that cannot be implemented or consumed | TD-SC-1 through TD-SC-3 | Complete this slice once the runtime, package and compatibility evidence pass; broaden functionality in later work. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Graph facts and direct queries | Draft syntax, ownership, preserved defects, provenance, indexes, bounds and immutable handles | Exhaustive input permutations, full API-result oracle expansion, release-scale guarantees | Incorrect source facts or query results block. |
| Consumer and compatibility | Experimental entry point, executable demo, accurate current guidance and retained root/CLI behavior | Stable subpaths, graph-policy verdicts, traversal and agent context assembly | Unusable exports, misleading capability claims or legacy regressions block. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Run test_document_graph_corpus and demo:graph | Actual source facts and located backlinks compared to existing annotations, without generating new oracle payloads | Implementer | yes |
| TD-SC-2 | Run test_document_graph_api | Public-operation assertions for retained evidence, malformed recovery, input errors, immutability and pagination | Implementer | yes |
| TD-SC-3 | Run ci:enforcement, including the installed-package consumer | Passing types, tests, build, API/CLI compatibility, and no unintended tracked changes; record tested commit in the PR | Implementer | yes |

## Execution Notes

TD1 Standard, direct execution. Read this file and its adjacent checksum first on resume, then the cited interface packet. Runtime source is under src/markdowntrace/document-graph; docs/experimental-document-graph.md is the consumer guide. The graph captures Engine block fragments and supporting headings/table structure; exact fragment partitioning remains experimental until context projection is implemented. This task uses the existing source annotations directly and does not depend on PR #77. Revision 1 records the owner's changed implementation priority. Structural validation is recorded in docs/validation/runnable-document-graph.json.

## Follow-up / Non-blocking Work

Add profile-based graph validation, then bounded traversal and source-context projection over this graph. Measure representative real-spec scale and consuming-agent value before a stable release. Stable syntax approval, publication and migration remain separate decisions.
