# Markdown Trace Document Graph Direction

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Document Graph Direction |
| Status | Experimental graph, profile validation, local traversal/context and explicit corpus APIs implemented |
| Revision | 7 |
| Decision owner | Jason Belmonti |
| Last updated | 2026-09-26 |
| Source material | Owner's document-wide validation/context vision, standard-link decision and explicit instruction to retire both no-consumer legacy workflows; current source, tests and Engine 3.6.0 dependency |
| Related docs | [Current implementation](../current-implementation.md); [authoring/API guide](../experimental-document-graph.md); [validation guide](../experimental-graph-validation.md); [API design](markdown-trace-document-graph-interfaces.md); [shared runtime task](../tasks/shared-runtime-contract.md) |

## 0. Orientation

Markdown Trace builds a document-wide identity and relationship graph over Markdown Engine. The product has two outcomes: validate a spec's relationships against a developer-owned profile, and retrieve related source context for an implementer agent.

The experimental runtime analyzes documents once, supports identifier and direct-reference queries, evaluates an explicit validation profile, and provides bounded local traversal and source extraction. A separate explicit-corpus API resolves caller-pinned captures and bindings and selects qualified paths across them. Hosts can compose checked corpus selections from genuine local excerpts while preserving per-document budgets and omissions. Corpus-wide context completeness remains separate. Continue from the runnable graph and validator; there is no prerequisite to finish the removed brace-language corpus or old execution plans.

Section status: Complete.

## 1. Problem and Context

Authors and implementer agents need dependable relationships among entities distributed across large specifications. Table-only validation leaves prose, lists and nested scopes outside its model, while manual context assembly can miss dependencies.

The runtime at `src/markdowntrace/document-graph/` uses Markdown Engine 3.6.0 across headings, paragraphs, lists, blockquotes and tables. It preserves declarations, mentions, typed edges, unresolved/duplicate identities, ownership uncertainty and exact source locations. The [authoring guide](../experimental-document-graph.md) and [validation guide](../experimental-graph-validation.md) describe the runnable contract. The former table validator and registry/sidecar workflow were retired after the owner confirmed they have no consumers.

Section status: Complete.

## 2. Goals, Non-Goals, and Success

- OBJ-1: Discover identities and references across document structures with deterministic lexical and ownership rules. Implemented experimentally.
- OBJ-2: Validate observed relationships against developer-owned rules without dropping invalid evidence. An experimental validation profile now evaluates source annotations, allowed relations, entity counts and required relationships; the full C-4 design is not a stable API commitment.
- OBJ-3: Query lookup, incoming/outgoing references and bounded traversal from the same graph. Local and explicitly bound corpus queries are implemented experimentally.
- OBJ-4: Return bounded source excerpts with provenance and inclusion reasons for an implementer agent. Local extraction is implemented experimentally; hosts can compose per-document bundles from a checked corpus selection. Corpus-wide completeness and mandatory-content policy remain separate work.

Non-goals are natural-language inference, automatic source repair, a graph database/service, an agent framework, automatic multi-document discovery, and corpus-wide completeness policy. Explicit multi-document resolution is available through caller-supplied captures and trusted bindings. Relationship validity cannot establish that prose is factually correct or that a cited validation activity ran.

Success means a mixed-layout spec yields explainable graph facts; invalid relationships fail applicable rules while remaining queryable; selected context contains relevant source with exact locations and explicit omissions. Stop expansion when a feature requires unrestricted prose parsing, erases evidence, invents ownership or hides incomplete analysis.

Section status: Complete.

## 3. Constraints, Invariants, and Assumptions

- CON-1: Markdown Engine owns Markdown parsing and structural validation. Use its public tree, link-resolution and source APIs; no second Markdown parser.
- CON-2: Constrain identifiers and URI fields. Separate occurrences, declarations and owned source fragments.
- CON-3: Every edge has an observed reference and a deterministic owner outcome. Co-occurrence does not invent a typed relationship.
- CON-4: Validation inspects the full graph, including unresolved and prohibited references; it never removes evidence.
- CON-5: Source, language, interpretation and validation identities are explicit. Policy changes do not alter discovered facts.
- CON-6: Validation and queries consume one immutable snapshot; source offsets refer to the captured source/hash.
- CON-7: Core operation is local, deterministic and read-only. The package root exports the current graph and explicit corpus APIs; the document command preserves its report, graph, query and export behavior. Retired commands and schemas do not remain compatibility requirements.

ASM-1: Each analysis uses one caller-supplied document; a corpus is a finite set of those issued analyses and explicit trusted bindings. ASM-2: Definitions and typed edges use standard links; bare canonical identifiers remain generic references within structural ownership scopes. ASM-3: Profiles own entity/relationship vocabulary; the runtime owns finite grammar and rule operators.

Section status: Complete.

## 4. Direction and Alternatives

Selected direction: use `markdown-trace.identity.draft2`, with declarations such as `[REQ-1](ctx://trace/entity/REQ-1?role=definition)` and typed references such as `[requirement](ctx://trace/entity/REQ-1?rel=implements)`. The URI establishes identity; link labels are presentation text. Unqualified entity links and bare IDs create generic references. See the guide for canonical grammar and exclusions.

The owner selected link protocols to use ordinary Markdown syntax. Brace annotations and both no-consumer legacy workflows are superseded. Restricting the product to tables would leave document-wide retrieval unsolved; probabilistic prose inference would undermine deterministic verification. Requiring links for every generic mention would add unnecessary annotation, so bare references remain supported.

Accepted tradeoffs: authors explicitly declare identities and typed edges; ambiguous ownership stays visible; storing occurrences and fragments consumes memory that still needs representative scale measurement.

Section status: Complete.

## 5. Expected Behavior

- FLOW-1: Analyze once, then evaluate graph integrity and supported profile rules. The experimental validator returns located findings and a pass/fail/indeterminate report while leaving graph facts available for queries.
- FLOW-2: Look up an identifier and list its incoming/outgoing occurrences, with owners and exact locations. Implemented; unknown or ambiguous owners remain explicit.
- FLOW-3: Select related identifiers through bounded local or qualified corpus traversal, then project source with genuine local selections and per-document budgets. Corpus composition is host-owned; budgets and omissions remain visible.

Analysis coverage is separate from validity. Complete coverage is not a validity verdict. Missing or duplicate definitions remain graph facts; malformed links and uncertain ownership can yield partial coverage. Invalid inputs or exceeded admission limits return operation errors. A profile requiring entities fails an empty document.

Section status: Complete.

## 6. Architecture Sketch

Markdown Engine parsing and source maps feed Trace's constrained URI/bare-ID interpretation, structural ownership, immutable graph and direct-reference indexes. Profile validation, local traversal/context, and explicitly bound corpus queries consume captured facts. The host composes corpus selections through depth-zero local selections. Keep contracts, extraction, graph state, validation, queries and adapters in focused modules.

The host supplies text, reads files and handles process/output transport. Trace never fetches `ctx:` destinations. Consumer repositories supply domain profiles; agents decide which queries to run. Extracted text is source data, not agent instructions.

The package root and `@jasonbelmonti/markdown-trace/experimental/graph` expose the same current graph API. The only package binary is `markdown-trace-document`. The legacy root validator and registry tools are removed, not reimplemented as graph adapters. No persistent graph store, automatic registry conversion or service layer is required.

Section status: Complete.

## 7. Operations and Change Plan

| Capability | State | Observable next value |
| --- | --- | --- |
| Link interpretation, graph and direct queries | Implemented experimentally | Run the demo against a real spec; inspect full snapshot JSON and located backlinks. |
| Profile-based graph validation | Implemented experimentally for the supported validation-profile operators; broader C-4 design remains a proposal | Exercise source-annotation, integrity, allowed-relation and required-relation checks against a real spec while retaining query access. |
| Local and qualified corpus traversal; local excerpt projection | Implemented experimentally | Retrieve selected identities with relationship explanations, then use genuine local depth-zero selections and explicit per-document budgets. |
| Corpus-wide context completeness policy | Proposed follow-up | Define mandatory content and completeness separately from relationship resolution. |
| Adoption and release | Later | Demonstrate usefulness on an owner-selected spec, measure scale, decide stable API/CLI compatibility and publication. |

Each capability should deliver runnable behavior with focused independent examples. Do not restore exhaustive pre-implementation oracle generation as a gate. Retired fixtures and compatibility tests do not define the new graph. The existing installed runtime and Fleet pin remain versioned historical releases until an independently verified rollout; no automatic spec rewrite or publication is included.

Section status: Complete.

## 8. Validation Plan

- VAL-1: Link/API tests verify cross-layout facts, ownership and exact ranges against hand-authored expectations, including nested scopes and malformed links.
- VAL-2: Retain focused validation proof for duplicate, dangling, unknown, forbidden, missing-relationship and empty-document cases. Verify rule evidence and that invalid facts remain queryable; extend proof if additional C-4 operators are adopted.
- VAL-3: Direct-query and corpus tests verify shared relationships, pagination, source order, cycles, canonical predecessors and boundaries.
- VAL-4: Context tests and the explicit packed corpus consumer compare verbatim excerpts, source ranges, budget omissions, stale pins and selection handling against independent expectations.
- VAL-5: Measure representative document size, latency and memory and audit consuming-agent context before release claims. Current limits are caller budgets, not measured capacity guarantees.

Run `npm run ci:enforcement` for runtime and package-boundary changes. Packed-consumer checks prove the root and experimental graph entry points while excluding retired commands and files. Corpus consumers use explicit copied sources and pinned manifests; structural document validation and declaration compilation do not replace runtime proof.

Section status: Complete.

## 9. Risks, Open Questions, and Formalization Readiness

| ID | Current disposition | Owner / decision point |
| --- | --- | --- |
| RISK-1: Incorrect declaration or owner | Focused runtime checks exist; retain explicit missing/duplicate/ambiguous states as capabilities grow. | Maintainer, every extraction or ownership change |
| RISK-2: Policy changes graph facts | Experimental validation reuses immutable analysis; retain the no-mutation invariant when adding policy operators. | Maintainer, every validation extension |
| RISK-3: Missing or excessive context | Local projection exposes bounded omissions; corpus-wide mandatory-content policy remains unimplemented. | Maintainer and owner, context pilot |
| Q-1: Authoring syntax | Resolved for the experiment: standard links under draft2. | Owner selected 2026-09-16; stable-release compatibility later |
| Q-2: Ownership and literal handling | Ownership, traversal and local extraction are implemented; corpus-wide context policy is host-owned. | Maintainer, before claiming complete worker context |
| Q-3: Package and compatibility | Root and experimental subpath expose the document graph; `markdown-trace-document` remains the sole command. Retired root/table and registry interfaces have no consumers by owner decision. Stable publication remains a later decision. | Maintainer and owner, release |
| Q-4: Real spec, required context and scale | Owner-selected pilot and measured budgets remain open; do not claim production scale or complete agent context. | Owner supplies target; maintainer measures before release |

The language and runtime decisions required to continue from this baseline are recorded. The experimental validator supports a bounded rule set; broader C-4 semantics and corpus-wide context completeness remain proposals.

Section status: Complete.

## Final Overview Gate

| Gate | Result |
| --- | --- |
| Direction and current authoring convention agree | Yes; standard Markdown links, constrained URI semantics and structural ownership. |
| Implemented and proposed capabilities are distinct | Yes; graph, direct queries, local/corpus traversal, local extraction and supported validation rules run experimentally; corpus-wide completeness policy remains proposed. |
| Next implementation target is clear | Yes; a real-spec consumer pilot, scale measurements and a separate corpus completeness policy before release claims. |
| Compatibility and release boundaries are explicit | Yes; no-consumer legacy APIs retired, current document command retained, stable publication and adoption still separate. |
| Superseded guidance remains active | No; old execution plans, contract-only task and brace corpus removed, recoverable in Git history. |

Overview status: Experimental graph, validation, corpus queries/traversal and local context extraction implemented; stable API approval, corpus-wide context policy and release remain separate decisions.

## Internal Review Record

Revision 6 records the owner's retirement decision. The direction remains one document-wide graph, with no compatibility obligation to preserve table-profile or registry/sidecar execution. Review checked that the root export and package binary now point only to current behavior, while the previously installed release remains explicitly pinned and unaffected. Revision 5 and earlier review history remain in Git.

Markdown Engine 3.6.0 structural validation and the adjacent SHA-256 identify this revision; the result is recorded in `docs/validation/artifacts.json`. No blocking directional finding remains; context usefulness and release scale still require the owner-selected pilot. Structural checks are not semantic or runtime acceptance.
