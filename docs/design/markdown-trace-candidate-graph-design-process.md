# Markdown Trace Candidate Graph Design Process Packet

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Candidate Graph Design Process Packet |
| Status | Superseded by durable Markdown authoring revision |
| Packet owner | Codex |
| Reviewers | Project owner; Markdown Trace maintainer; markdown-engine contract reviewer; graph UX reviewer |
| Decision owner | Project owner |
| Downstream target | `design-spec` |
| Expected downstream rigor | `R2` |
| Last updated | 2026-06-03 |
| Related docs | `README.md`; `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; `docs/evidence/markdown-engine-2-adoption-decision.md`; sibling `execution-decomposer/docs/design/execution-decomposer-design-spec.md`; `docs/design/markdown-trace-durable-markdown-authoring-revision-overview.md` |
| Related tickets | none |

## 0. Design Mission Summary

Decision requested: Superseded by the durable Markdown authoring revision; do not use this read-only candidate graph packet for implementation planning.

Problem summary: Markdown Trace can derive an authoritative graph from link-backed annotated Markdown, but existing design specs commonly contain unlinked identifiers such as `REQ-*`, `FUNC-*`, `TECH-*`, and `VAL-*`. Those documents cannot produce a useful native trace graph today, so users lose the visual and review value of Markdown Trace exactly where existing documents are most likely to need onboarding.

Superseded direction: Add a read-only inferred candidate graph layer that discovers known identifier families, infers traceability edges from tables and references, marks all outputs as candidate or inferred, and exports JSON plus visual graph formats without mutating the source document or claiming registry authority.

Top risks or unknowns:

- RISK-1: Inferred edges may look authoritative unless the contract and UI make confidence and provenance explicit.
- RISK-2: Existing design specs use varied table shapes, which could limit edge inference precision.
- RISK-3: Adding discovery before promotion could expand scope into a migration tool unless promotion remains a separate follow-up.

Readiness statement: Superseded; the durable Markdown authoring revision replaces this read-only candidate discovery slice as the implementation-planning authority.

Section status: Complete

## 1. Problem Frame and Decision Needed

Problem declaration: Markdown Trace users are unable to visualize non-trivial existing design specs because the current graph derivation path requires `ctx://trace` links or heading labels, resulting in empty graphs for documents that still contain meaningful traceability IDs in tables and prose.

Current-state baseline: On 2026-06-02, running `markdown-trace derive` against sibling `execution-decomposer/docs/design/execution-decomposer-design-spec.md` with namespace `execdec` returned 0 entities and 0 edges, while text inspection found more than 100 visible IDs across `OBJ-*`, `CON-*`, `REQ-*`, `FLOW-*`, `FUNC-*`, `ACC-*`, `TECH-*`, `VAL-*`, and `RISK-*` families.

Evidence or source: Direct repository inspection; current `src/markdowntrace/registry/derived.ts`; current `src/markdowntrace/graph/derive.ts`; R1 evidence in `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; parser adoption decision in `docs/evidence/markdown-engine-2-adoption-decision.md`; sibling execution-decomposer design spec inspected on 2026-06-02.

Decision trigger: The project owner approved the candidate-graph idea after observing that existing non-annotated design specs cannot produce native trace graphs.

In scope:

- Read-only candidate discovery for known design-document ID families.
- Candidate graph projection with explicit confidence and source provenance.
- CLI and library surfaces for JSON, Mermaid, and HTML visualization output.
- Deterministic tests over representative design-spec fixtures.

Out of scope:

- Mutating source Markdown.
- Promoting candidates into `ctx://trace` links.
- Treating inferred entities or edges as an authoritative registry.
- LLM-based semantic extraction.
- Live Linear, Jira, GitHub, network, browser, MCP, or graph-database integration.

Section status: Complete

## 2. Stakeholders, Concerns, and Viewpoints

| Stakeholder or role | Concern | Viewpoint required | Required action |
| --- | --- | --- | --- |
| Project owner | Existing specs should become visually inspectable without manual annotation first. | User workflow and product value | Approve |
| Markdown Trace maintainer | Candidate discovery must not corrupt the authoritative trace registry boundary. | Package boundary and compatibility | Review |
| markdown-engine contract reviewer | Discovery must consume only public parser and query APIs. | Dependency and API contract | Review |
| Graph UX reviewer | Users need readable, confidence-aware graph output for non-trivial specs. | Visualization and error explanation | Review |
| Implementation agents | Agents need deterministic artifacts and diagnostics they can consume from CLI output. | CLI and JSON contract | Inform |

Decision authority: Project owner.

Section status: Complete

## 3. Constraints, Invariants, and Assumptions

| ID | Type | Statement | Source or basis | Design impact |
| --- | --- | --- | --- | --- |
| CON-1 | Constraint | Candidate graph discovery shall consume `@jasonbelmonti/markdown-engine` package-root public APIs only. | Existing parser adoption decision. | Discovery works through parse, normalize, and document queries instead of raw parser internals. |
| CON-2 | Invariant | Candidate output shall not be treated as a validated `EntityRegistry`. | R1 evidence keeps registry integrity separate from authoring convenience. | Candidate entities and inferred edges need separate schema names and trust labels. |
| CON-3 | Invariant | Source Markdown shall not be modified by candidate discovery or graph export. | User requested inferred candidate graph sizing, not promotion. | Promotion is follow-up; initial commands are read-only. |
| CON-4 | Constraint | Outputs shall be deterministic for identical input, options, package version, and runtime version. | Markdown Trace repeatability expectations. | Sorting, canonicalization, and snapshot tests are required. |
| CON-5 | Constraint | The feature shall remain local-first and offline. | Repository README scope. | No network connector or hosted graph service is included. |
| ASM-1 | Assumption | Design-spec ID families are stable enough for an initial configured default set. | Observed execution-decomposer and CODEFACTORY-style documents. | Defaults can cover `OBJ`, `NG`, `CON`, `ASM`, `REQ`, `FLOW`, `FUNC`, `ACC`, `TECH`, `VAL`, `RISK`, `Q`, and `WVR`. |
| ASM-2 | Assumption | Table cells and text spans from `markdown-engine` are sufficient for first-pass source provenance. | Engine 2.0 adoption and current rich IR contract. | Implementation can avoid a raw line scanner. |
| Q-1 | Question | Should candidate discovery later support custom ID-family profiles? | Owner: project owner; due point: after proving slice. | Initial design may reserve a config hook but should not require custom profiles for the first slice. |

Section status: Complete

## 4. Design Space Decomposition

| ID | Decision surface | Why it matters | Variable or fixed | Related constraints |
| --- | --- | --- | --- | --- |
| SURF-1 | Authority boundary | Users must distinguish inferred candidates from verified trace registries. | Variable | CON-2 |
| SURF-2 | Discovery input | Determines whether extraction uses raw text, engine IR, tables, or a hybrid. | Variable | CON-1 / ASM-2 |
| SURF-3 | Edge inference | Determines graph usefulness and false-positive risk. | Variable | CON-2 / CON-4 |
| SURF-4 | Output formats | Determines UX for humans, agents, and CI. | Variable | CON-4 |
| SURF-5 | Promotion workflow | Determines whether source mutation is part of this slice. | Fixed out of scope | CON-3 |
| SURF-6 | Runtime integration | Determines whether feature stays local CLI or expands into services. | Fixed local-first | CON-5 |
| SURF-7 | Configuration | Determines whether defaults are sufficient or profiles are required. | Variable | ASM-1 / Q-1 |

Surface coupling notes: Authority boundary and edge inference are tightly coupled. The more aggressive the inference, the more explicit confidence, provenance, and non-authoritative labeling must become. Output format and discovery model are also coupled because useful HTML requires richer node and edge metadata than a plain graph projection.

Section status: Complete

## 5. Option Families

| ID | Option family | Summary | Surfaces varied | Promoted to candidate? | Rationale |
| --- | --- | --- | --- | --- | --- |
| OPT-1 | Keep `ctx://trace` only | Do nothing for unannotated docs and require authors to add trace links first. | SURF-1 / SURF-5 | Yes | Conservative baseline but poor UX for existing docs. |
| OPT-2 | One-off visualization script | Generate HTML from regex extraction for a single document. | SURF-2 / SURF-4 | No | Useful demo but not a durable product or package contract. |
| OPT-3 | Read-only candidate graph | Discover IDs and inferred edges, mark outputs as candidate, and export graph views. | SURF-1 / SURF-2 / SURF-3 / SURF-4 / SURF-7 | Yes | Best balance of immediate UX value and trace-authority containment. |
| OPT-4 | Promotion-first migration | Add a command that rewrites source Markdown into `ctx://trace` links before graphing. | SURF-1 / SURF-5 | Yes | Valuable later, but source mutation and review policy are too broad for the first slice. |
| OPT-5 | LLM semantic graph | Use an LLM to infer entities and relationships beyond explicit IDs. | SURF-2 / SURF-3 / SURF-6 | No | Violates deterministic and local-first constraints for this product boundary. |

Section status: Complete

## 6. Candidate Elaboration

| ID | Source option | Mechanism | Boundaries and interfaces | Rollback posture | Load-bearing assumptions |
| --- | --- | --- | --- | --- | --- |
| CAND-1 | OPT-1 | Preserve existing derive-only behavior and document that unannotated specs need manual trace links. | Existing `derive` CLI and graph projection only. | No change. | Users will tolerate manual annotation before visualization. |
| CAND-2 | OPT-3 | Add `discover` and `graph-candidates` behavior over engine-normalized documents. Emit candidate nodes, inferred edges, diagnostics, and graph exports with confidence and source ranges. | New discovery module, candidate schema, CLI command, graph renderer. Existing authoritative registry path remains unchanged. | Delete generated artifacts or remove feature without touching source docs. | Known ID families and traceability tables are enough for useful first graphs. |
| CAND-3 | OPT-4 | Add promotion-aware discovery that emits patches or writes `ctx://trace` links before graph export. | Discovery plus mutation, patch generation, type-profile mapping, review policy. | Requires patch review or file revert. | Promotion rules can be made safe before candidate UX is proven. |

Candidate notes: CAND-2 is intentionally not a replacement for R1 link-backed derivation. It creates a pre-authority visualization and onboarding layer that can later feed promotion.

Section status: Complete

## 7. Stress Scenarios and Failure Modes

| ID | Scenario | Stimulus and environment | Candidates tested | Expected response | Result |
| --- | --- | --- | --- | --- | --- |
| SCN-1 | Existing non-annotated design spec | Run against execution-decomposer design spec with many IDs and no `ctx://trace` links. | CAND-1 / CAND-2 / CAND-3 | CAND-1 returns empty graph; CAND-2 returns candidate graph; CAND-3 requires mutation policy. | Favors CAND-2. |
| SCN-2 | Ambiguous repeated ID | A document repeats `REQ-1` in a definition table and in prose. | CAND-2 / CAND-3 | Candidate output records one definition candidate, reference occurrences, duplicate diagnostics when definitions conflict. | CAND-2 acceptable if schema separates definitions and mentions. |
| SCN-3 | Traceability table with invalid target | A `REQ-*` row references `VAL-99` that is not defined. | CAND-2 / CAND-3 | Output includes inferred edge diagnostic and unresolved target status without failing the whole graph. | CAND-2 supports useful degraded mode. |
| SCN-4 | User mistakes candidate graph for authority | User attempts to use candidate graph as validated registry evidence. | CAND-2 / CAND-3 | Schema, CLI text, and HTML labels mark data as candidate and inferred; authoritative derive remains separate. | Requires explicit UX control in CAND-2. |
| SCN-5 | Future custom task taxonomy | A document uses `PKG-*` and `EVD-*` IDs not in defaults. | CAND-2 | Unknown families become references or diagnostics unless configured; no mutation. | CAND-2 can reserve config follow-up. |
| SCN-6 | Rollback after adoption | Feature proves noisy for some docs. | CAND-2 / CAND-3 | CAND-2 can be disabled by not invoking commands; CAND-3 would need patch/file rollback. | Favors CAND-2 for initial rollout. |

Section status: Complete

## 8. Trade Study

| ID | Criterion | Priority | Source concern or constraint |
| --- | --- | --- | --- |
| CRIT-1 | Preserves authoritative trace boundary | High | CON-2 / RISK-1 |
| CRIT-2 | Gives immediate UX value for existing docs | High | User request and execution-decomposer example |
| CRIT-3 | Deterministic and local-first | High | CON-4 / CON-5 |
| CRIT-4 | Implementation scope can be split into reviewable slices | Medium | Estimator recommended decomposition for full product scope |
| CRIT-5 | Enables later promotion without forcing it now | Medium | R1 recommendation to generate checked artifacts before replacement |

| Candidate | CRIT-1 | CRIT-2 | CRIT-3 | CRIT-4 | CRIT-5 | Decisive strengths | Decisive weaknesses |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CAND-1 | Strong | Weak | Strong | Strong | Weak | No new risk. | Fails the user problem; existing specs remain blank graphs. |
| CAND-2 | Strong with labels | Strong | Strong | Strong | Strong | Directly solves visualization while preserving non-authority. | Inference false positives must be managed. |
| CAND-3 | Medium | Strong | Strong | Weak | Strong | Moves users toward durable trace links. | Source mutation, review policy, and type-profile mapping are too broad for first slice. |

Sensitivity points: If users require immediate source annotation rather than visualization, CAND-3 becomes more attractive after CAND-2 proves discovery quality. If default ID families cannot cover real docs, CAND-2 needs a custom profile before broader rollout.

Section status: Complete

## 9. Source Doctrine Validation

| Doctrine lens | Applied check | Result | Follow-up |
| --- | --- | --- | --- |
| NASA systems design | Stakeholder need, requirements pressure, logical decomposition, and validation are chained from empty native graph to candidate discovery. | Pass | Preserve source evidence and validation gates in design-spec. |
| ISO 42010 architecture description | Stakeholders, concerns, viewpoints, and boundary rationale are explicit. | Pass | Interface design must make contracts concrete. |
| SEI ATAM | Tradeoffs among authority, UX, determinism, and implementation scope are visible. | Pass | Stress false-positive and ambiguous-table cases in tests. |
| Parnas information hiding | Candidate discovery hides inference rules behind a separate module instead of leaking into registry derivation. | Pass | Keep authoritative registry path unchanged. |
| NIST SSDF and threat modeling | No secrets or auth changes; misuse risk is authority confusion. | Pass | Label source-derived and inferred data as non-authoritative. |
| SRE and Well-Architected operations | Local CLI feature has no live service; operations are artifact generation, diagnostics, and rollback by containment. | Pass | Design-spec should cover CLI exit codes and generated artifact deletion. |

Section status: Complete

## 10. Selected Design Decision Record

Decision: Superseded; do not implement from the CAND-2 read-only inferred candidate graph decision.

Selected candidate: Historical CAND-2, superseded by durable Markdown authoring.

Rationale: CAND-2 gave immediate graph UX for existing documents while preserving the R1 authoritative trace boundary, but it addressed only the read side. The durable Markdown authoring revision supersedes this decision by making candidate graph evidence part of a read/write authoring and repair control loop.

Rejected alternatives:

- CAND-1 is rejected because it leaves existing unannotated design specs with empty native graphs.
- CAND-3 is deferred because source mutation and promotion policy need separate design and review controls.
- OPT-5 is rejected because LLM inference violates deterministic local-first constraints.

Accepted risks:

- RISK-1 is accepted with mitigation: every candidate entity and edge carries `candidate` or `inferred` provenance and graph UX labels.
- RISK-2 is accepted with mitigation: first implementation targets explicit ID definitions, references, and traceability tables, then records unsupported shapes as diagnostics.
- RISK-3 is accepted with mitigation: promotion is out of scope for this design chain.

Decision owner: Project owner.

Section status: Complete

## 11. Uncertainty, Experiments, and R0 Gates

| ID | Uncertainty or validation need | Gate type | Owner | Evidence required | Due point |
| --- | --- | --- | --- | --- | --- |
| VAL-1 | Verify candidate discovery produces useful nodes and edges for execution-decomposer excerpt fixture. | Completed before design-spec | Codex | Fixture output with candidate nodes, inferred edges, diagnostics, and stable ordering. | Design-spec validation |
| VAL-2 | Verify native derive path remains unchanged for `ctx://trace` fixtures. | Validate before implementation completion | Codex | Existing R1 tests continue passing. | Implementation review |
| VAL-3 | Verify candidate graph cannot be confused with authoritative registry output. | Validate before implementation completion | Codex | Schema names, CLI text, HTML labels, and tests assert candidate/inferred labels. | Implementation review |
| Q-1 | Decide whether custom ID-family profiles are needed in the first release. | Post-design-spec check | Project owner | Results from proving fixtures and first real-doc runs. | After initial candidate discovery slice |

Section status: Complete

## 12. Handoff to design-spec

Recommended downstream action: Do not author or implement from this read-only candidate graph packet; use the durable Markdown authoring design spec and interface packet as the implementation-planning authority.

Recommended downstream rigor: N/A; superseded by durable Markdown authoring `R2` artifacts.

Source authority for design-spec: Historical only; retained for context and superseded by the durable Markdown authoring design spec and interface packet.

- Selected candidate CAND-2 and decision DEC in this packet.
- Existing authoritative graph implementation in `src/markdowntrace/graph/derive.ts`.
- Existing registry derivation boundary in `src/markdowntrace/registry/derived.ts`.
- R1 recommendation in `docs/evidence/r1-link-backed-evidence-and-recommendation.md`.
- Empty native derive result for sibling `execution-decomposer` design spec.

Risks and gates to preserve:

- Candidate output is never an authoritative registry.
- Source Markdown is not mutated.
- Existing R1 link-backed graph tests remain the compatibility gate.
- UX must visibly distinguish candidate and inferred data.

Traceability notes: The design spec should map read-only discovery requirements to CLI flows, candidate schema, graph export mechanisms, diagnostics, and tests. Promotion to `ctx://trace` links should appear only as follow-up.

Section status: Complete

## Internal Review Record

Calibration result: `R2` is appropriate. The feature is a durable internal package capability with CLI and schema contracts, but it is local-only, read-only, reversible, and does not introduce live data, auth, secrets, or remote mutation.

Findings addressed:

- DP-1 Major, resolved: Initial direction risked implying candidate graphs were trace authority. Revised packet separates candidate schema from `EntityRegistry` and adds explicit UX/contract mitigations.
- DP-2 Minor, resolved: Initial option set underweighted promotion-first. Revised packet promotes CAND-3 for stress and trade comparison but defers it from the selected slice.

Validation result: Supersession structural validation passed with `@jasonbelmonti/markdown-engine@2.0.0` and `design-process-validation-profile.yaml`; no diagnostics were reported. Evidence input hash before this review-record update was `e464bb0a3d5c41769788a2e4f68086fae1d2cef7146545cbf0ec2ba0ebb70dca`.

Unresolved findings: None.

Readiness verdict: Superseded; not the implementation-planning authority.
