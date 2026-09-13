# Markdown Trace Document Graph Direction

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Document Graph Direction |
| Status | Ready for Detailed Design |
| Rigor posture | R2 |
| Rigor justification | A durable library and CLI contract will change across extraction, graph modeling, validation, and querying. Local read-only operation and reversible adoption bound the operational impact. |
| Author(s) | Codex |
| Reviewers | Codex internal review; project owner for direction |
| Decision owner | Jason Belmonti |
| Target milestone or decision date | Next design session, before resuming public release preparation |
| Last updated | 2026-09-13 |
| Source material | Project-owner vision in this conversation on 2026-09-13; implementation at 016dd0905d9f8103dc4dbd528e0b9fc15b516723; source inspection and fresh baseline checks in this session |
| Related docs | [Documentation map](../README.md); [current implementation](../current-implementation.md); [next task](../tasks/document-graph-contract.md) |
| Related tickets | None created; bounded next task at docs/tasks/document-graph-contract.md |

## 0. Orientation

Decision requested: Align on a document graph as the product core and proceed to detailed language, graph, and query contracts before expanding production code or freezing a public release.

Overview summary: Implementer agents cannot reliably retrieve related context or validate connections across large specs with the present table-only graph validator. Markdown Trace should recognize a constrained identity/reference language throughout Markdown, build one source-backed graph, and expose both profile validation and graph/context queries. Markdown Engine remains responsible for parsing and structural validation.

Why now: The owner's clarified objective includes context retrieval as a first-class outcome; completing packaging around the current narrow validator would not deliver that outcome.

Top risks or unknowns:

- RISK-1: A repeated identifier is mistaken for a definition or attached to the wrong owning entity.
- RISK-2: Allowed relationship rules are mistaken for evidence that a relationship exists.
- RISK-3: Context extraction omits a needed constraint or expands into most of the document.

Section status: Complete

## 1. Problem and Context

Problem declaration: Authors and implementer agents lack a dependable way to validate and retrieve connections among entities distributed across a spec, leading to false confidence in document validity and manual assembly of implementation context.

Affected actors or systems: Spec authors, reviewers, implementer agents, source-skill profiles, Markdown Trace API/CLI consumers, and Markdown Engine.

Current-state baseline: Main at 016dd09 passed 219 tests in 30 files and the full enforcement gate on 2026-09-13 in a clean installed worktree. Its public API exposes only validateGraphDocument. Graph extraction iterates tables, recognizes a restricted uppercase/hyphen token grammar, and projects configured column pairs. The relationship and artifact-family vocabularies are closed code enums. A separate registry/link path supports heading definitions and section references, but its graph has only basic nodes and edges. No public backlinks, traversal, or context API exists. Controlled graph-validation probes returned pass for an empty document, duplicate objective, and additional dangling reference.

Evidence or source: src/markdowntrace/{public.ts,trace-evidence/extract.ts,trace-evidence/model.ts,graph-profile/model.ts,graph-validation/validate.ts,graph/model.ts,markdown/trace-links.ts,markdown/source-slices.ts}. Markdown Engine 3.5.0 public API inspection and a mixed-layout parser probe confirmed headings, paragraphs, lists, blockquotes, tables, and source ranges are available. The initial baseline checks used a clean worktree after npm ci. Reproduce from an installed checkout with npm run ci:enforcement; docs/current-implementation.md records the inspected capability boundary.

Consequence of inaction: Distribution can be completed while the central validation and context-retrieval outcomes remain unavailable.

Section status: Complete

## 2. Goals, Non-Goals, and Success

Objectives:

- OBJ-1: Discover identities and references across document structures under one explicit lexical and ownership contract.
- OBJ-2: Determine whether observed relationships satisfy developer-owned profiles, with diagnostics explaining failures and incomplete analysis.
- OBJ-3: Answer identity lookup, incoming/outgoing references, typed-neighbor, and bounded traversal queries from the same graph used for validation.
- OBJ-4: Return useful, bounded source excerpts with provenance and inclusion reasons for an implementer agent.

Non-goals:

- NG-1: Free-form natural-language interpretation or probabilistic inference of relationship meaning.
- NG-2: Source rewriting, automatic repair application, a graph database service, or an agent framework.
- NG-3: Proof that a specification's prose is factually correct or that a cited validation activity actually ran.
- NG-4: Multi-document resolution in the first delivery. Document identity is preserved so this can be designed later.

Success signals: A mixed-layout spec yields the expected graph; invalid references and forbidden edges remain visible and fail applicable rules; backlinks identify their source owners and occurrences; a query returns the required context with exact source locations, deterministic ordering, and explicit omissions. Querying remains possible on an invalid graph with its diagnostic state attached.

Stop or kill criteria: Stop expansion if correct extraction depends on unrestricted prose parsing, validation rules erase disallowed evidence, source ownership cannot be explained, or query results hide incompleteness. Revise the contract at that boundary before adding more formats or rules.

Section status: Complete

## 3. Constraints, Invariants, and Assumptions

Constraints and invariants:

- CON-1: Use public Markdown Engine parsing, tree/query, and source APIs; do not build a parallel Markdown parser.
- CON-2: Constrain identifier syntax and relationship expressions. Keep identifier occurrences, definitions, and owned source fragments distinct.
- CON-3: Every inferred edge has a source occurrence and an explicit authoring or interpretation rule. Co-occurrence alone does not establish a typed relationship.
- CON-4: Validation operates on observed facts, including unresolved and prohibited references; an invalid edge is not silently removed from the graph.
- CON-5: Input, language, interpretation-profile, and validation-profile identities are explicit. Changing validation rules must not rewrite discovered facts.
- CON-6: Validation and querying consume one graph snapshot. Reuse of source offsets requires the same source hash.
- CON-7: Operation remains local, deterministic, and read-only. A new contract is versioned rather than silently changing existing v1 meanings.

Assumptions:

- ASM-1: First delivery targets one complete local document, including headings, paragraphs, lists, blockquotes, and tables. The precise treatment of code, inline code, links, HTML, frontmatter, and examples is part of Q-2, not a silent exclusion.
- ASM-2: Basic references can be inferred from identifiers inside a defined entity scope. Typed edges use constrained markers or deterministic structural rules; the preferred balance remains Q-1.
- ASM-3: Consumer profiles own domain entity and relationship names; the runtime owns the grammar and rule operators. Existing families are compatibility examples, not the domain universe.

Open questions: Q-1 through Q-4 in section 9 are detailed-design decisions. They do not prevent direction or corpus work, but must be resolved for the relevant production slice.

Section status: Complete

## 4. Direction and Alternatives

Recommended direction: Build a document-wide graph layer over Markdown Engine. Recognize constrained tokens, classify occurrences and ownership, resolve references, and index the resulting graph. Expose validation, querying, and context extraction over that shared snapshot. Keep interpretation rules distinct from validity assertions even if both eventually live in one profile file.

Rationale: This makes headings, lists, prose, and tables equivalent sources of graph evidence while preserving structural context. It also prevents validation and retrieval from developing contradictory interpretations of the same document.

Alternatives considered:

- Extend only table roles: reuses the current slice but leaves prose and scope ownership unresolved.
- Require every entity and edge to be an explicit ctx://trace link: deterministic and compatible with existing work, but imposes significant annotation overhead and does not itself define context boundaries.
- Infer meaning using an LLM: accommodates arbitrary prose but conflicts with deterministic verification and the owner's bounded syntax requirement.

Accepted tradeoffs: Authors follow a small language and explicit ownership conventions. Ambiguous source text produces incomplete-analysis findings rather than invented edges. Keeping both occurrence evidence and graph indexes costs memory, which must be measured on representative specs.

Section status: Complete

## 5. Expected Behavior

Primary flows:

- FLOW-1: Analyze a spec once, inspect definitions and reference occurrences, then validate allowed endpoint types, cardinality, required connections, and applicable path/cycle rules.
- FLOW-2: Given REQ-17, list the identifiers that reference it, with every matching occurrence and source location. An occurrence without a resolved source owner remains explicitly unowned.
- FLOW-3: Starting at an implementation entity, traverse selected relationship kinds and directions with depth/result limits, then retrieve its definition and related source fragments for an agent.

Functional commitments: Profiles declare domain vocabularies and validity rules without requiring new TypeScript relationship enums; runtime rule operators remain finite and versioned. Queries distinguish direct references from transitive reachability and definitions from mentions. Context results include document identity/hash, relationship paths or inclusion reasons, source ranges, excerpt text, and truncation metadata. A mere identifier occurrence never becomes a definition because it appeared first; declarations and ownership need deterministic language rules.

Acceptance signals: Re-expressing a fixture among supported authoring structures while preserving its declarations and ownership preserves entity/edge meaning. Backlinks agree with outgoing edges. A dangling reference remains queryable as unresolved and fails applicable validation. Context output excludes an intentionally unrelated section and identifies any fragments omitted by its budget. Character/byte limits can be deterministic in the core; token budgets require an explicitly selected tokenizer and belong in the context contract, not an unqualified token-count claim.

Failure or fallback behavior: Missing definitions, duplicate definitions, ambiguous ownership, malformed expressions, and unsupported profile operators produce structured diagnostics. Parse/analysis completeness is separate from rule validity. An empty or unrecognized document cannot silently satisfy a profile that requires entities. Queries may expose partial evidence, but must label it as partial; invalid specifications are still inspectable.

Section status: Complete

## 6. Architecture Sketch

System boundary: One local Markdown document plus versioned language/profile inputs produces an immutable analysis snapshot and explicit validation/query/context results.

Major components or responsibilities:

1. Markdown adapter: consumes the parsed tree and source map; enumerates each eligible occurrence once across nested nodes.
2. Language and interpretation: tokenization, declaration/reference classification, ownership scopes, and deterministic relationship interpretation.
3. Graph and indexes: identity records, occurrence records, unresolved references, typed edges, inbound/outbound indexes, and source-fragment ownership.
4. Validation: graph-integrity checks and profile assertions over the complete observed graph.
5. Query: lookup, occurrences, backlinks, outgoing links, filters, paths, and bounded traversal.
6. Context projection: source slicing, surrounding headings/table headers where needed, overlap removal, ordering, and explicit size limits.
7. Public adapters: stable library types and thin CLI serialization/error handling.

Data and contract impact: Current table-only evidence anchors, public closed relationship unions, and minimal registry graph cannot express the target. Define a general graph contract and language/profile/result versions before replacing them. Existing source ranges, hashing, JSON handling, CLI transport protections, and package-boundary tests remain useful.

Ownership and boundaries: Markdown Engine owns Markdown syntax and structural validation. Markdown Trace owns the identity language, graph integrity, rule operators, queries, and source projection. Consumer repositories own domain profiles; agents choose which queries to run. Query results are source data, not agent instructions.

Architecture questions: Q-1 settles relationship expression; Q-2 settles scope and literal handling; Q-3 settles compatibility; Q-4 settles context and scale constraints. No service or persistent graph store is justified for the initial document-local boundary.

Section status: Complete

## 7. Operations and Change Plan

Rollout approach: Rebaseline the product direction before resuming release preparation. Remove superseded guidance from the checkout, using Git history for historical recovery, and use this latest user direction as the current source for proposed work. Do not create archives or redirect stubs. Use the following capability sequence; detailed implementation tasks follow the contract and corpus findings.

| Delivery | Observable value | Existing basis | Remaining work |
| --- | --- | --- | --- |
| Language and corpus | Reviewers can predict definitions, ownership, edges, and query answers from concrete examples. | Legacy links, labels, table fixtures, real spec documents | Grammar, declaration/scope semantics, mixed-layout oracle, interpretation/validation boundary, compatibility decision |
| Document graph and backlinks | A real entity can be located and all incoming references explained across layouts. | Markdown Engine tree/source APIs and legacy section scans | Shared fact model, document-wide extraction, resolution, unresolved evidence, indexes, basic query surface |
| Profile validation | Bad references and forbidden/missing relationships fail with source-backed reasons. | YAML loader, deterministic results, required-path implementation | General domain vocabulary, integrity rules, applicable assertion set, no silent unsupported fields or empty-check success |
| Context retrieval | An implementer receives selected related source fragments with a visible budget and inclusion reasons. | Source-slice utilities | Bounded traversal, fragment ownership, deduplication, necessary surrounding structure, truncation and stale-source handling |
| Adoption and release | A consuming skill verifies a real spec and queries its implementation context using pinned runtime bytes. | Tested CLI/API shell and package checks | Real-document oracle, scale evidence, final API/docs alignment, compatibility gates, bundle/installer/release work, separate downstream integration |

Rollback or containment: Develop in isolated worktrees; retain the existing command path until a replacement has fixture and consumer proof. No automatic YAML-authority flip, source edit, or bulk spec migration. Contain regressions by selecting the earlier runtime/profile version.

Observability and support: Report recognized/excluded/unresolved occurrence counts, entity and edge counts, analysis completeness, evaluated-rule counts, source/profile hashes, query limits, and context omissions. Measure parse/extract/validate/query time and memory separately.

Migration or compatibility impact: Any earlier local release work describes the old surface; it must be reconciled with this direction and Q-3 before reuse. Unrelated worktrees are not current repository guidance. Public publishing and fleet activation remain later operations. Do not use the old release checklist as the completion contract for this new product goal.

Section status: Complete

## 8. Validation Plan

Validation goals: Prove correct discovery, ownership, validation, and retrieval on mixed-layout and real documents before treating packaging as completion.

Evidence required: Human-audited expected entities, occurrence roles, owner assignments, edges, diagnostics, backlinks, and context fragments; exact source snapshots/hashes; negative mutations; repeatability output; consumer examples; scale measurements with environment details.

Validation activities:

- VAL-1: Compare equivalent heading, prose, list, quote, and table cases; include nested scopes, forward references, multiple IDs, links, literal examples, and Unicode/line-ending offset probes.
- VAL-2: Inject duplicate definitions, dangling references, forbidden edge types, missing required links, ambiguity, and empty documents. Verify diagnostic locations and that invalid evidence remains queryable.
- VAL-3: Compare incoming/outgoing indexes and traversals with the independent oracle, including cycles, self-links, repeated occurrences, depth limits, and disconnected components.
- VAL-4: Compare context excerpts to source bytes, test overlap and truncation, and reject stale offsets. Audit a representative implementer context selection for required and unrelated material.
- VAL-5: Measure representative large documents and generated scale variants. Set latency/memory and context-size thresholds from this corpus before calling the implementation production-ready; retain existing regression gates.

Traceability notes: VAL-1 addresses OBJ-1/RISK-1; VAL-2 addresses OBJ-2/RISK-2; VAL-3 addresses OBJ-3; VAL-4 addresses OBJ-4/RISK-3; VAL-5 addresses Q-4 and operational adoption. Structural profile validation is a separate check and does not prove these semantics.

Section status: Complete

## 9. Risks, Open Questions, and Formalization Readiness

Material risks:

| Risk | Likelihood / impact | Mitigation | Owner |
| --- | --- | --- | --- |
| RISK-1: Incorrect definition or scope ownership | High / wrong graph and context | Explicit scope rules, ambiguous-state handling, nested-layout oracle | Markdown Trace maintainer |
| RISK-2: Validation policy creates or erases facts | Medium / misleading pass results | Separate discovery/interpretation from assertions; retain invalid evidence | Markdown Trace maintainer |
| RISK-3: Missing or excessive context | High / implementer loses constraints or budget | Independently audited fragment expectations, limits, inclusion reasons | Project owner and maintainer |

Open questions:

| Question | Owner | Decision point | Resolution plan | Consequence if unresolved |
| --- | --- | --- | --- | --- |
| Q-1: Exact ID/declaration grammar and balance of explicit typed markers versus structural interpretation | Project owner with maintainer recommendation | Language contract, before extractor implementation | Compare bounded alternatives using the same mixed-layout examples; select one canonical form and explain compatibility | Keep syntax provisional; do not publish or implement conflicting grammars |
| Q-2: Definition ownership, nested scope, and literal/example/HTML/frontmatter policies | Maintainer; project owner judges authoring fit | Language contract, before extractor implementation | Give every occurrence and fragment in the corpus an explicit role/owner or ambiguity outcome | No claims of document-wide completeness |
| Q-3: New API/schema versions and compatibility adapters for existing graph/registry/profile paths | Maintainer | Public contract, before release-facing edits | Inventory current imports/commands and map retain/adapt/deprecate decisions with consumer fixtures | Preserve current paths; defer activation of replacement public behavior |
| Q-4: First real spec, required context policy, and scale/budget targets | Project owner supplies target; maintainer measures | Corpus selection, before context and performance gates | Begin with repository-owned execution/design specs; substitute the owner's target when provided; measure sizes and agree limits | Pilot remains provisional; no production scale or context-completeness claim |

Formalization notes: Preserve the owner's two outcomes: valid relationships and queryable implementation context. Deepen the language, ownership, graph snapshot, interpretation/validation boundary, and minimal query contracts together. The next bounded task produces that contract and an independent corpus; it does not start a wholesale rewrite or a full release plan.

Readiness verdict: Ready for detailed design. The target and architectural direction are established; the listed language/API choices remain the work of detailed design. This verdict does not freeze a syntax or authorize production implementation from an unresolved language contract.

Section status: Complete

## Final Overview Gate

| Gate | Result |
| --- | --- |
| The problem can be understood without the proposed solution. | yes |
| The direction can be summarized in one paragraph by a reviewer. | yes |
| Goals, non-goals, constraints, and assumptions are distinct. | yes |
| Alternatives and tradeoffs are visible. | yes |
| Expected behavior is observable from outside the implementation. | yes |
| Architecture boundaries and data or contract impacts are explicit. | yes |
| Live-system changes have rollout, rollback, observability, and support notes. | yes |
| Validation targets the highest-risk claims. | yes |
| Risks and questions are owned and bounded. | yes |
| The overview is ready for its stated next step. | yes; detailed design resolves the explicitly owned language/API questions |

Overview status: Ready for Detailed Design.

## Internal Review Record

Rigor calibration: R2 accepted; changes span a durable local product contract but introduce no remote execution, source mutation, or irreversible migration.

Findings addressed: The revision makes three boundaries explicit: layout equivalence requires preserved declarations and ownership; domain vocabularies are extensible while operators remain bounded; token budgets require an identified tokenizer. It also rules out first-occurrence-wins definitions. The alignment revision removes obsolete source links and machine-specific dependencies, identifies existing behavior separately from the target, and uses Git history instead of archives. Sections 0 through 9 and the final gate are complete; readability and seed adequacy are adequate for detailed design. Directional coherence: coherent.

Validation result: Markdown Engine 3.5.0 structural results for the current overview and task are recorded in docs/validation/artifacts.json. Verify its recorded source SHA-256 and the adjacent artifact checksum on resume. Structural validation does not prove graph semantics.

Unresolved findings: None blocking directional readiness. Q-1 through Q-4 are explicit inputs to detailed design, not implied product decisions. Readiness verdict: Ready for detailed design.

Revision log: Revision 1 captured the owner's 2026-09-13 direction and implementation baseline. Revision 2 incorporated the internal review clarifications above. Revision 3 incorporates the owner's repository-alignment and deletion-over-archive instructions, removes obsolete/local source references, and makes the handoff portable. The adjacent SHA-256 file identifies the final bytes.
