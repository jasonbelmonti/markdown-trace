# Markdown Trace Candidate Graph Design Overview

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Candidate Graph Design Overview |
| Status | Superseded by Durable Markdown Authoring Revision |
| Rigor posture | `R2` |
| Rigor justification | Candidate graph discovery creates durable CLI, library, schema, diagnostics, and visualization contracts. It is local-only, read-only, and reversible, so it does not trigger `R3`, but it is broader than a small `R1` patch. |
| Author(s) | Codex |
| Reviewers | Project owner; Markdown Trace maintainer; markdown-engine contract reviewer; graph UX reviewer |
| Decision owner | Project owner |
| Target milestone or decision date | Candidate graph detailed design approval |
| Last updated | 2026-06-03 |
| Source material | `docs/design/markdown-trace-candidate-graph-design-process.md`; `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; `docs/evidence/markdown-engine-2-adoption-decision.md`; sibling `execution-decomposer/docs/design/execution-decomposer-design-spec.md`; `docs/design/markdown-trace-durable-markdown-authoring-revision-overview.md` |
| Related docs | `README.md`; `docs/markdown-trace-r1-link-backed-entity-syntax.md` |
| Related tickets | none |

## 0. Orientation

Decision requested: Superseded by the durable Markdown authoring revision; do not use this read-only overview for implementation planning.

Overview summary: Markdown Trace currently visualizes authoritative graphs only after documents contain `ctx://trace` links or heading-derived entity labels. Existing design specs often contain rich ID families and traceability tables but no trace links, so the current native graph path returns empty output. This superseded direction proposed a non-authoritative candidate graph layer that discovers IDs, infers edges, labels confidence and provenance, and exports JSON plus graph views without mutating source Markdown.

Why now: The sibling `execution-decomposer` design spec showed the gap directly on 2026-06-02: it has many traceability IDs, but current Markdown Trace derivation returned zero graph nodes.

Top risks or unknowns:

- RISK-1: Candidate graph output may be mistaken for validated trace authority.
- RISK-2: Traceability table shapes may vary enough to reduce inference precision.
- RISK-3: Users may quickly ask for promotion to `ctx://trace` links, which is intentionally outside the first slice.

Section status: Complete

## 1. Problem and Context

Problem declaration: Markdown Trace users are unable to visualize existing non-trivial design specs before annotation because graph derivation requires explicit trace links or heading labels, resulting in empty graphs for documents that already contain meaningful traceability IDs.

Affected actors or systems: Project owner, Markdown Trace users, implementation agents, reviewers, graph UX consumers, Markdown Trace CLI, and downstream `markdown-context` mission-packet workflows.

Current-state baseline: Direct inspection on 2026-06-02 found that current native derive output for the execution-decomposer design spec was 0 entities and 0 edges, while the same document visibly contains more than 100 ID references across common design-spec families.

Evidence or source: Design-process packet source evidence; current `src/markdowntrace/registry/derived.ts`; current `src/markdowntrace/graph/derive.ts`; R1 evidence recommending link-backed authoring with checked artifacts; execution-decomposer design spec inspection.

Consequence of inaction: Existing documents remain visually opaque until manually annotated, reducing onboarding value and delaying adoption of trustworthy trace links.

Section status: Complete

## 2. Goals, Non-Goals, and Success

Objectives:

- OBJ-1: Make existing unannotated design specs visually inspectable through deterministic candidate graphs.
- OBJ-2: Preserve the authoritative `ctx://trace` registry boundary by labeling discovered data as candidate or inferred.
- OBJ-3: Provide useful CLI and artifact output for humans, agents, and future `markdown-context` packet composition.
- OBJ-4: Create a natural review path toward later checked sidecar generation and trace-link promotion.

Non-goals:

- NG-1: This effort will not mutate source Markdown.
- NG-2: This effort will not produce validated `EntityRegistry` output from inferred candidates.
- NG-3: This effort will not use LLMs, network connectors, graph databases, MCP, browser automation, or live project-management APIs.
- NG-4: This effort will not define the promotion patch workflow for adding `ctx://trace` links.

Success signals:

- `markdown-trace discover` emits candidate nodes and inferred edges for a fixture shaped like the execution-decomposer design spec.
- Candidate graph output includes source ranges, confidence, provenance, diagnostics, and deterministic ordering.
- Existing R1 link-backed graph tests still pass.
- HTML or Mermaid graph export visibly marks candidates as non-authoritative.

Stop or kill criteria:

- Stop the first slice if candidate discovery cannot produce at least defined ID nodes and direct table-reference edges for the execution-decomposer-style fixture.
- Stop promotion planning if users cannot distinguish candidate output from authoritative registry output in review.

Section status: Complete

## 3. Constraints, Invariants, and Assumptions

Constraints and invariants:

- CON-1: Candidate discovery shall use only `@jasonbelmonti/markdown-engine` package-root public APIs.
- CON-2: Candidate outputs shall be schema-distinct from `EntityRegistry` and `TraceGraph`.
- CON-3: The source document shall remain unchanged by discovery and graph export commands.
- CON-4: Outputs shall be deterministic for identical input, options, package version, and runtime version.
- CON-5: The feature shall remain local-first and offline.

Assumptions:

- ASM-1: Default design-spec ID families are sufficient for a first useful discovery slice.
- ASM-2: `markdown-engine` rich IR tables, link references, text spans, and source ranges are sufficient for first-pass provenance.
- ASM-3: Users will accept candidate confidence labels as a bridge toward later authoritative trace links.

Open questions:

- Q-1: Should custom ID-family profiles be part of the first release? Owner: project owner. Decision point: after the first candidate discovery fixture and one real-doc run. Resolution path: compare default-family coverage against real output. Consequence if unresolved: keep custom profiles out of scope and document unsupported families as diagnostics.

Section status: Complete

## 4. Direction and Alternatives

Recommended direction: Add a read-only candidate graph layer that discovers IDs and inferred relationships from existing Markdown structure, then exports confidence-labeled graph artifacts without changing source documents or authoritative trace semantics.

Rationale: This path gives immediate UX value for existing documents while respecting the strongest existing Markdown Trace boundary: only validated link-backed or sidecar-derived data is authoritative. It also creates a measurable first slice that can be decomposed into discovery, edge inference, and graph UX work.

Alternatives considered:

- Keep `ctx://trace` only: rejected because it leaves existing design specs with empty graphs until manual annotation.
- One-off visualization script: rejected because it is not a package contract and cannot support repeatable UX.
- Promotion-first migration: deferred because source mutation, type-profile mapping, and review policy require separate design.
- LLM semantic graph: rejected because it violates local deterministic scope.

Accepted tradeoffs:

- The first graph will be useful but not authoritative.
- Some inferred edges will be incomplete until table-shape coverage expands.
- Promotion to durable `ctx://trace` links is delayed to preserve review safety.

Section status: Complete

## 5. Expected Behavior

Primary flows:

- FLOW-1: A user runs discovery on an unannotated design spec and receives candidate JSON with nodes, inferred edges, diagnostics, source ranges, and confidence.
- FLOW-2: A user exports the candidate graph as Mermaid or HTML and reviews the visual structure without editing the source file.
- FLOW-3: An agent consumes candidate JSON to identify where future trace-link promotion may be valuable.

Functional commitments:

- FUNC-1: The system identifies configured ID families in headings, tables, and prose.
- FUNC-2: The system separates candidate definitions, mentions, inferred edges, and diagnostics.
- FUNC-3: The system marks every inferred edge with provenance, confidence, and source evidence.
- FUNC-4: The system emits deterministic JSON and at least one human-readable graph format.
- FUNC-5: The system leaves existing authoritative derive behavior unchanged.

Acceptance signals:

- ACC-1: A fixture excerpt from execution-decomposer produces non-empty candidate nodes and edges.
- ACC-2: A malformed or unresolved target produces diagnostics instead of a fabricated edge.
- ACC-3: Existing R1 `ctx://trace` fixture tests pass unchanged.
- ACC-4: HTML or Mermaid graph output visibly labels candidate and inferred status.

Failure or fallback behavior:

- If a document has no recognizable IDs, discovery exits successfully with empty candidates and an explanatory diagnostic.
- If an inferred edge references an unresolved target, the edge is omitted or marked unresolved according to the contract and a diagnostic is emitted.
- If graph export cannot write an output file, source discovery remains unaffected and the CLI reports a write failure.

Section status: Complete

## 6. Architecture Sketch

System boundary: Candidate graph discovery is a Markdown Trace CLI and library capability that reads local Markdown, parses it through `markdown-engine`, emits candidate artifacts, and optionally renders graph views. It does not alter registry derivation or validation.

Major components or responsibilities:

- TECH-1: Candidate discovery reads engine-normalized documents and extracts ID definitions and mentions.
- TECH-2: Edge inference maps traceability table cells and reference text into non-authoritative edge candidates.
- TECH-3: Candidate graph projection produces deterministic nodes, edges, diagnostics, and graph metadata.
- TECH-4: Graph export renders JSON, Mermaid, and HTML views from the candidate graph.
- TECH-5: CLI commands expose discovery and export while preserving existing `validate` and `derive` behavior.

Data and contract impact: New candidate schemas are required for discovered identifiers, mentions, inferred edges, diagnostics, and graph exports. Existing `EntityRegistry`, `TraceGraph`, and R1 type-profile contracts remain unchanged.

Ownership and boundaries: Markdown Trace owns candidate discovery and graph export. `markdown-engine` owns structural Markdown parsing and query APIs. Future `markdown-context` may consume candidate artifacts, but that integration is not part of this direction.

Architecture questions: Q-1 remains open for custom ID-family profiles. The initial architecture should reserve extension points without requiring profiles for the first slice.

Section status: Complete

## 7. Operations and Change Plan

Rollout approach:

- Ship as additive CLI and library behavior.
- Start with fixture-backed discovery and JSON output.
- Add graph export after the candidate schema stabilizes.
- Keep promotion and source mutation as follow-up design work.

Rollback or containment:

- The feature is read-only; rollback is removal or non-use of the new commands and deletion of generated artifacts.
- Existing `validate` and `derive` commands remain compatibility gates.

Observability and support:

- CLI diagnostics shall report unsupported ID families, ambiguous definitions, unresolved targets, graph-export write failures, and whether output is candidate or authoritative.
- Evidence should include repeatability snapshots and a real-doc exercise against an execution-decomposer-shaped fixture.

Migration or compatibility impact:

- No source document migration is required.
- No existing output schema changes are required for authoritative registry derivation.
- New candidate schemas require versioning from first release.

Section status: Complete

## 8. Validation Plan

Validation goals:

- Prove useful non-empty candidate graph output for an existing-spec fixture.
- Prove candidate output remains non-authoritative and cannot replace registry validation.
- Prove deterministic output and compatibility with existing R1 graph behavior.

Evidence required:

- Candidate discovery fixture snapshots.
- Candidate graph export snapshots.
- Diagnostics fixtures for ambiguous, duplicate, and unresolved IDs.
- Existing R1 link-backed graph tests passing.
- CLI tests for output format and failure behavior.

Validation activities:

- VAL-1: Unit-test ID-family discovery over headings, tables, and prose.
- VAL-2: Unit-test inferred edge extraction from traceability-style tables.
- VAL-3: Snapshot-test candidate graph JSON ordering and schema fields.
- VAL-4: CLI-test JSON and graph export commands.
- VAL-5: Regression-test existing R1 `derive` behavior.
- VAL-6: Review HTML or Mermaid output for candidate/inferred labeling.

Traceability notes: VAL-1 and VAL-2 cover OBJ-1. VAL-3, VAL-5, and VAL-6 cover OBJ-2. VAL-4 covers OBJ-3. Promotion remains follow-up under NG-4.

Section status: Complete

## 9. Risks, Open Questions, and Formalization Readiness

Material risks:

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| RISK-1 | Users may treat candidate graphs as authoritative trace evidence. | Medium | High | Schema names, CLI labels, HTML badges, and tests require candidate and inferred markers. | Markdown Trace maintainer |
| RISK-2 | Table-shape variation may make inferred edges incomplete. | Medium | Medium | Start with explicit traceability-table patterns and emit unsupported-shape diagnostics. | Markdown Trace maintainer |
| RISK-3 | Feature scope may expand into source promotion too early. | Medium | Medium | Keep promotion out of scope and route it to a later design. | Project owner |

Open questions:

| ID | Question | Owner | Due date or decision point | Resolution path | Consequence if unresolved |
| --- | --- | --- | --- | --- | --- |
| Q-1 | Should custom ID-family profiles be included in the first release? | Project owner | After proving fixture and one real-doc run | Review default-family coverage and decide whether unsupported families are blocking. | Default-only discovery ships first. |

Formalization notes: The detailed design spec should preserve the selected non-authoritative direction, define candidate schemas, specify CLI flows, map diagnostics to failure behavior, and keep promotion out of scope. The interface design packet should materialize candidate graph contracts and compatibility rules.

Readiness verdict: Superseded; not the implementation-planning authority.

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
| Live-system changes have rollout, rollback, observability, and support notes. | N/A: the feature is a local read-only CLI/library capability with no live service. |
| Validation targets the highest-risk claims. | yes |
| Risks and questions are owned and bounded. | yes |
| The overview is ready for its stated next step. | no; superseded by durable Markdown authoring revision |

Overview status: Superseded; not ready for detailed design or implementation planning.

## Internal Review Record

Rigor calibration result: `R2` accepted. The feature creates durable local contracts and CLI behavior but has no live-system, remote-mutation, data-loss, auth, secret, or compliance exposure.

Findings addressed:

- DO-1 Major, resolved: Initial draft risked over-detailing mechanisms. Revised overview keeps mechanisms at boundary level and routes detailed contracts to later artifacts.
- DO-2 Minor, resolved: Initial risk section did not name owners. Revised material-risk table assigns owners.

Validation result: Supersession structural validation passed with `@jasonbelmonti/markdown-engine@2.0.0` and `design-overview-validation-profile.yaml`; no diagnostics were reported. Evidence input hash before this review-record update was `4091405144e1e39cb54b494017a727f2abcadd8129c9954751ec06b10b8529c5`.

Unresolved findings: None.

Readiness verdict: Superseded; not the implementation-planning authority.
