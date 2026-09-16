# Markdown Trace Document Graph Direction

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Document Graph Direction |
| Status | Experimental graph and direct queries implemented; graph validation next |
| Revision | 4 |
| Decision owner | Jason Belmonti |
| Last updated | 2026-09-16 |
| Source material | Owner's document-wide validation/context vision, runnable implementation request, standard-link decision and baseline-cleanup request; current source and tests |
| Related docs | [Current implementation](../current-implementation.md); [authoring/API guide](../experimental-document-graph.md); [API design](markdown-trace-document-graph-interfaces.md); [runnable task](../tasks/runnable-document-graph.md) |

## 0. Orientation

Markdown Trace builds a document-wide identity and relationship graph over Markdown Engine. The product has two outcomes: validate a spec's relationships against a developer-owned profile, and retrieve related source context for an implementer agent.

The first usable slice exists: profile compilation, document analysis, identifier lookup and incoming/outgoing references. Standard Markdown links carry declarations and typed relationships. Graph-policy evaluation, traversal and context assembly remain to be implemented. Continue from the runnable graph; there is no prerequisite to finish the removed brace-language corpus or old execution plans.

Section status: Complete.

## 1. Problem and Context

Authors and implementer agents need dependable relationships among entities distributed across large specifications. Table-only validation leaves prose, lists and nested scopes outside its model, while manual context assembly can miss dependencies.

The experimental runtime at `src/markdowntrace/document-graph/` now uses Markdown Engine 3.5.0 across headings, paragraphs, lists, blockquotes and tables. It preserves declarations, mentions, typed edges, unresolved/duplicate identities, ownership uncertainty and exact source locations. The [guide](../experimental-document-graph.md) is the current authoring contract; [current implementation](../current-implementation.md) distinguishes this runtime from the retained table/registry compatibility tools.

Section status: Complete.

## 2. Goals, Non-Goals, and Success

- OBJ-1: Discover identities and references across document structures with deterministic lexical and ownership rules. Implemented experimentally.
- OBJ-2: Validate observed relationships against developer-owned rules without dropping invalid evidence. Next capability; profile compilation alone does not deliver it.
- OBJ-3: Query lookup, incoming/outgoing references and bounded traversal from the same graph. Direct queries implemented; traversal proposed.
- OBJ-4: Return bounded source excerpts with provenance and inclusion reasons for an implementer agent. Proposed.

Non-goals are natural-language inference, automatic source repair, a graph database/service, an agent framework, and multi-document resolution in this delivery. Relationship validity cannot establish that prose is factually correct or that a cited validation activity ran.

Success means a mixed-layout spec yields explainable graph facts; invalid relationships fail applicable rules while remaining queryable; selected context contains relevant source with exact locations and explicit omissions. Stop expansion when a feature requires unrestricted prose parsing, erases evidence, invents ownership or hides incomplete analysis.

Section status: Complete.

## 3. Constraints, Invariants, and Assumptions

- CON-1: Markdown Engine owns Markdown parsing and structural validation. Use its public tree, link-resolution and source APIs; no second Markdown parser.
- CON-2: Constrain identifiers and URI fields. Separate occurrences, declarations and owned source fragments.
- CON-3: Every edge has an observed reference and a deterministic owner outcome. Co-occurrence does not invent a typed relationship.
- CON-4: Validation inspects the full graph, including unresolved and prohibited references; it never removes evidence.
- CON-5: Source, language, interpretation and validation identities are explicit. Policy changes do not alter discovered facts.
- CON-6: Validation and queries consume one immutable snapshot; source offsets refer to the captured source/hash.
- CON-7: Core operation is local, deterministic and read-only. Preserve existing root API and CLI meanings unless a later migration explicitly changes them.

ASM-1: One caller-supplied document is the analysis boundary. ASM-2: Definitions and typed edges use standard links; bare canonical identifiers remain generic references within structural ownership scopes. ASM-3: Profiles own entity/relationship vocabulary; the runtime owns finite grammar and rule operators.

Section status: Complete.

## 4. Direction and Alternatives

Selected direction: use `markdown-trace.identity.draft2`, with declarations such as `[REQ-1](ctx://trace/entity/REQ-1?role=definition)` and typed references such as `[requirement](ctx://trace/entity/REQ-1?rel=implements)`. The URI establishes identity; link labels are presentation text. Unqualified entity links and bare IDs create generic references. See the guide for canonical grammar and exclusions.

The owner selected link protocols to use ordinary Markdown syntax. Brace annotations are superseded. Restricting the product to tables would leave document-wide retrieval unsolved; probabilistic prose inference would undermine deterministic verification. Requiring links for every generic mention would add unnecessary annotation, so bare references remain supported.

Accepted tradeoffs: authors explicitly declare identities and typed edges; ambiguous ownership stays visible; storing occurrences and fragments consumes memory that still needs representative scale measurement.

Section status: Complete.

## 5. Expected Behavior

- FLOW-1: Analyze once, then evaluate graph integrity and profile policy. Analysis exists; policy evaluation is proposed.
- FLOW-2: Look up an identifier and list its incoming/outgoing occurrences, with owners and exact locations. Implemented; unknown or ambiguous owners remain explicit.
- FLOW-3: Select related identifiers through bounded traversal, then project their owned source with supporting headings/table structure. Proposed; budgets and omissions must remain visible.

Analysis coverage is separate from validity. Complete coverage is not a validity verdict. Missing or duplicate definitions remain graph facts; malformed links and uncertain ownership can yield partial coverage. Invalid inputs or exceeded admission limits return operation errors. An empty document must not silently pass a future profile that requires entities.

Section status: Complete.

## 6. Architecture Sketch

Markdown Engine parsing and source maps feed Trace's constrained URI/bare-ID interpretation, structural ownership, immutable graph and direct-reference indexes. The new validator and context operations will consume that same graph. Keep contracts, extraction, graph state, validation, queries and adapters in focused modules.

The host supplies text, reads files and handles process/output transport. Trace never fetches `ctx:` destinations. Consumer repositories supply domain profiles; agents decide which queries to run. Extracted text is source data, not agent instructions.

The experimental package entry point is `@jasonbelmonti/markdown-trace/experimental/graph`. The legacy root validator and registry tools remain isolated compatibility surfaces. No persistent graph store, automatic registry conversion or service layer is required.

Section status: Complete.

## 7. Operations and Change Plan

| Capability | State | Observable next value |
| --- | --- | --- |
| Link interpretation, graph and direct queries | Implemented experimentally | Run the demo against a real spec; inspect full snapshot JSON and located backlinks. |
| Profile-based graph validation | Next implementation target; C-4 in the API design | Report integrity and allowed/required relationship failures against existing graph facts; retain query access. |
| Bounded traversal and context projection | Proposed; C-6/C-7 | Retrieve selected source with relationship explanations, budgets and omissions. |
| Adoption and release | Later | Demonstrate usefulness on an owner-selected spec, measure scale, decide stable API/CLI compatibility and publication. |

Each capability should deliver runnable behavior with focused independent examples. Do not restore exhaustive pre-implementation oracle generation as a gate. Retain existing compatibility tests; no automatic spec rewrite, YAML authority flip, publication or fleet activation is included.

Section status: Complete.

## 8. Validation Plan

- VAL-1: Link/API tests verify cross-layout facts, ownership and exact ranges against hand-authored expectations, including nested scopes and malformed links.
- VAL-2: Implement validation proof with duplicate, dangling, unknown, forbidden, missing-relationship and empty-document cases. Verify rule evidence and that invalid facts remain queryable.
- VAL-3: Direct-query tests verify shared relationships, pagination and source order. Add bounded traversal proof when that capability is implemented.
- VAL-4: When implementing context, compare verbatim excerpts, supporting structure, overlap/budget omissions and stale-selection handling against source expectations.
- VAL-5: Measure representative document size, latency and memory and audit consuming-agent context before release claims. Current limits are caller budgets, not measured capacity guarantees.

Run `npm run ci:enforcement` for runtime and compatibility changes. Structural document validation and declaration compilation check artifact consistency; they do not prove proposed APIs work.

Section status: Complete.

## 9. Risks, Open Questions, and Formalization Readiness

| ID | Current disposition | Owner / decision point |
| --- | --- | --- |
| RISK-1: Incorrect declaration or owner | Focused runtime checks exist; retain explicit missing/duplicate/ambiguous states as capabilities grow. | Maintainer, every extraction or ownership change |
| RISK-2: Policy changes graph facts | Graph identity excludes validation policy; validator must inspect without mutation. | Maintainer, graph-validation implementation |
| RISK-3: Missing or excessive context | Projection remains unimplemented; exact fragment partitioning is provisional. | Maintainer and owner, context pilot |
| Q-1: Authoring syntax | Resolved for the experiment: standard links under draft2. | Owner selected 2026-09-16; stable-release compatibility later |
| Q-2: Ownership and literal handling | Implemented and documented for analysis/direct queries; future context must prove its projection semantics. | Maintainer, context implementation |
| Q-3: Package and compatibility | Experimental subpath implemented; root API/CLI preserved. Stable subpath and new CLI remain later decisions. | Maintainer and owner, release |
| Q-4: Real spec, required context and scale | Owner-selected pilot and measured budgets remain open; do not claim production scale or complete agent context. | Owner supplies target; maintainer measures before release |

The language and runtime decisions required to continue from this baseline are recorded. Remaining validation/traversal/context contracts are proposals to implement and verify incrementally, not hidden prerequisites to starting development.

Section status: Complete.

## Final Overview Gate

| Gate | Result |
| --- | --- |
| Direction and current authoring convention agree | Yes; standard Markdown links, constrained URI semantics and structural ownership. |
| Implemented and proposed capabilities are distinct | Yes; graph/direct queries run, validation/traversal/context remain. |
| Next implementation target is clear | Yes; profile-based validation over the shared graph. |
| Compatibility and release boundaries are explicit | Yes; legacy APIs retained, stable publication and adoption still separate. |
| Superseded guidance remains active | No; old execution plans, contract-only task and brace corpus removed, recoverable in Git history. |

Overview status: Experimental graph implemented; proceed with bounded graph-validation implementation.

## Internal Review Record

Revision 4 reconciles the owner-selected link syntax and runnable graph with the current capability sequence. It removes obsolete pre-extractor questions and corpus gates while retaining the validation/context objectives and release risks. Earlier revisions are available in Git history.

Structural evidence is recorded in `docs/validation/artifacts.json`; the adjacent SHA-256 identifies the current source. Structural checks are not semantic or runtime acceptance.
