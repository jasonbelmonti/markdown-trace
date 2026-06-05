# Markdown Trace Profile-Aware Graph Validation Design Process Packet

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Profile-Aware Graph Validation Design Process Packet |
| Status | Ready for R0 Experiment |
| Packet owner | Codex |
| Reviewers | Project owner; Markdown Trace maintainer; markdown-engine contract reviewer; graph validation reviewer; CODEFACTORY artifact-profile reviewer |
| Decision owner | Project owner |
| Downstream target | `R0 experiment` |
| Expected downstream rigor | `R0`, followed by `R2` design-spec if calibration passes |
| Last updated | 2026-06-05 |
| Related docs | `docs/design/markdown-trace-durable-markdown-authoring-design-spec.md`; `docs/design/markdown-trace-durable-markdown-authoring-revision-overview.md`; `docs/design/markdown-trace-candidate-graph-design-spec.md`; `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; sibling `execution-decomposer/docs/execution/execution-decomposer-execution-spec.md`; `/Users/jasonbelmonti/.codex/skills/execution-spec/references/execution-spec-validation-profile.yaml`; `/Users/jasonbelmonti/.codex/skills/design-spec/references/design-spec-validation-profile.yaml` |
| Related tickets | none |

## 0. Design Mission Summary

Decision requested: Decide how Markdown Trace should extract and validate graph evidence from table-first CODEFACTORY Markdown artifacts before implementation planning begins.

Problem summary: Current `derive` can build authoritative registry graphs from heading labels or heading-owned `ctx://trace` definitions, but real execution and design specs place most identifiers and trace relationships in tables. Structural profile validation can pass while `derive` returns an empty graph, leaving no graph evidence for sophisticated validation, repair, or authoring feedback.

Selected direction: Select a profile-aware trace evidence and graph validation layer beside authoritative `derive`, but route the work through an R0 calibration experiment before `design-spec`. The layer should discover definitions, mentions, ranges, table roles, and candidate edges across headings, tables, prose, and links, while preserving the current registry authority boundary.

Top risks or unknowns:

- RISK-1: Naive table extraction can convert matrix coverage rows or repeated risk rows into false primary definitions.
- RISK-2: Relationship direction and vocabulary are not yet proven across execution-spec and design-spec artifacts.
- RISK-3: Reusing structural validation profiles as graph profiles may mix shape validation with semantic trace claims.

Readiness statement: Ready for R0 experiment, not ready for implementation design-spec. The R0 must prove role-aware extraction and graph validation against a real execution spec and a generated design spec before an R2 design-spec can safely lock contracts.

Section status: Complete

## 1. Problem Frame and Decision Needed

Problem declaration: Markdown Trace lacks a source-grounded trace evidence model for table-first Markdown artifacts, so it cannot perform graph-level validation such as dangling-reference checks, duplicate primary-definition checks, required coverage paths, relationship integrity, or candidate repair feedback for current CODEFACTORY specs.

Current-state baseline: `src/markdowntrace/registry/derived.ts` collects trace definitions from headings and falls back to heading-label derivation when no heading trace definitions exist. `src/markdowntrace/markdown/trace-links.ts` collects `ctx://trace` body references by scanning section body slices owned by heading definitions. A real sibling execution spec validates structurally with the execution-spec profile, but current `derive` returns 0 entities and 0 edges because its IDs are table-first.

Evidence or source: Current code in `src/markdowntrace/registry/derived.ts` and `src/markdowntrace/markdown/trace-links.ts`; R1 evidence that graph validation is not independent after registry derivation; durable Markdown authoring spec REQ-1 and FUNC-1 requiring trace evidence; real `execution-decomposer` execution spec tables for `SRC-*`, `OBJ-*`, `PKG-*`, `WP-*`, `MS-*`, `VAL-*`, `REV-*`, and matrix coverage; execution-spec validation profile table and `idsFrom` rules.

Decision trigger: The project owner asked why definitions are heading-only and requested examination of a real execution spec to determine what changes are needed for sophisticated entity-graph validation.

In scope:

- Role-aware extraction of document-wide identifiers from headings, tables, prose, ranges, and `ctx://trace` links.
- A schema-distinct trace evidence graph that is not an authoritative `EntityRegistry`.
- Graph validation rules for unresolved references, duplicate primary definitions, required paths, coverage rows, range expansion, relationship constraints, and diagnostics.
- Profile-controlled table role interpretation for execution-spec and design-spec artifacts.
- Compatibility with the durable Markdown authoring and repair loop.

Out of scope:

- Changing current authoritative `derive` behavior in the first design slice.
- Auto-promoting inferred table IDs into authoritative registry entities.
- Mutating source Markdown or writing `ctx://trace` links.
- LLM semantic inference, remote services, graph databases, browser automation, MCP, or live project-management integration.
- Replacing `markdown-engine` structural validation profiles.

Section status: Complete

## 2. Stakeholders, Concerns, and Viewpoints

| Stakeholder or role | Concern | Viewpoint required | Required action |
| --- | --- | --- | --- |
| Project owner | Real execution and design specs should support graph validation without manual heading annotation first. | Product value and artifact workflow | Approve |
| Markdown Trace maintainer | New evidence graphs must not corrupt the authoritative registry and generated sidecar boundary. | Package compatibility and authority boundary | Review |
| markdown-engine contract reviewer | Extraction must use public engine document, table, link, section, and source-range APIs. | Dependency and parser contract | Review |
| CODEFACTORY artifact-profile reviewer | Execution-spec and design-spec table roles must be interpreted according to artifact profile intent. | Profile semantics and validation coverage | Review |
| Graph validation reviewer | Graph diagnostics must be deterministic, explainable, and useful for repair loops. | Graph correctness and failure modes | Review |
| Agent authoring workflow reviewer | Diagnostics and graph deltas must feed durable Markdown authoring without hidden semantic authority. | Authoring and repair control loop | Consult |

Decision authority: Project owner.

Section status: Complete

## 3. Constraints, Invariants, and Assumptions

| ID | Type | Statement | Source or basis | Design impact |
| --- | --- | --- | --- | --- |
| CON-1 | Constraint | Extraction shall use only public `@jasonbelmonti/markdown-engine` package-root APIs. | Existing parser adoption and durable authoring specs. | A focused engine adapter reads sections, tables, text spans, links, and source ranges; raw parser internals stay out of scope. |
| CON-2 | Invariant | Current authoritative `derive`, `derive-sidecar`, `validate`, and R1 link-backed behavior shall remain unchanged until a later approved transition. | R1/R2 evidence and compatibility guarantees. | The new graph evidence schema is additive and separate from `EntityRegistry` and `TraceGraph`. |
| CON-3 | Invariant | Structural profile success shall not be treated as semantic graph approval. | Real execution spec structurally validates while current graph output is empty. | Graph validation needs its own profile or profile extension with explicit semantic roles. |
| CON-4 | Constraint | Outputs shall be deterministic for identical input, profile, package version, and runtime version. | Existing fixture and sidecar evidence. | Canonical ordering, stable diagnostics, source ranges, and snapshot tests are required. |
| CON-5 | Constraint | The feature shall remain local-first and offline. | Existing product scope. | No network, LLM, graph database, MCP, or browser dependency is included. |
| CON-6 | Invariant | Table rows can represent different roles: primary definitions, supplemental definitions, coverage rows, references, mentions, or non-trace text. | Real execution spec has definition tables and a traceability matrix that repeats IDs. | Extraction must classify role before creating graph facts. |
| ASM-1 | Assumption | Execution-spec and design-spec skill profiles are stable enough to seed first graph profiles. | Current validation profiles already identify many required sections and ID columns. | R0 can start from profile-informed selectors instead of hardcoded global regex only. |
| ASM-2 | Assumption | The real execution-decomposer execution spec and generated design-spec demo are sufficient first calibration fixtures. | They cover table-first execution and design artifacts. | Passing R0 on both fixtures is required before design-spec readiness. |
| ASM-3 | Assumption | Existing `label-scanner` range syntax can be reused for `X-1 through X-9` after families are discovered profile-wide. | Current range scanner supports registered family ranges. | R0 should test family discovery before range expansion. |
| Q-1 | Question | Should graph role rules live in a new graph profile, in authoring profiles, or as an extension to markdown-engine validation profiles? | Owner: project owner; due point: R0 design review. | Determines schema shape and how artifact profiles compose validation and graph semantics. |
| Q-2 | Question | What relationship vocabulary and direction should become canonical for execution and design graph validation? | Owner: graph validation reviewer; due point: R0 extraction report. | Determines path rules, required coverage rules, and graph visualization semantics. |
| Q-3 | Question | Which repeated IDs are supplemental definitions versus coverage rows versus duplicate-definition failures? | Owner: CODEFACTORY artifact-profile reviewer; due point: R0 extraction report. | Determines false-positive risk and repair diagnostics. |

Section status: Complete

## 4. Design Space Decomposition

| ID | Decision surface | Why it matters | Variable or fixed | Related constraints |
| --- | --- | --- | --- | --- |
| SURF-1 | Authority boundary | Prevents inferred table evidence from masquerading as validated registry authority. | Fixed separate from `EntityRegistry` initially | CON-2 |
| SURF-2 | Extraction coverage | Determines whether headings, tables, prose, ranges, and links are all visible. | Variable | CON-1, CON-6 |
| SURF-3 | Role classification | Determines whether table IDs become definitions, mentions, coverage rows, or diagnostics. | Variable | CON-3, CON-6 |
| SURF-4 | Profile source | Determines whether graph semantics are hardcoded, structural-profile derived, authoring-profile driven, or graph-profile specific. | Variable | ASM-1, Q-1 |
| SURF-5 | Relationship vocabulary and direction | Determines graph validation, path checks, visualization, and repair suggestions. | Variable | Q-2 |
| SURF-6 | Graph validation rule set | Determines which sophisticated validation is possible beyond extraction. | Variable | CON-3 |
| SURF-7 | Range and aggregate references | Determines support for `PKG-1 through PKG-9`, grouped `VAL-*`, and matrix rows. | Variable | ASM-3 |
| SURF-8 | Evidence and diagnostics | Determines reviewability and agent repair usefulness. | Variable | CON-4 |
| SURF-9 | Integration point | Determines whether this lives in `derive`, candidate graph commands, durable authoring, or a reusable trace evidence service. | Variable | CON-2 |
| SURF-10 | Fixture and rollout gates | Determines whether implementation can proceed safely. | Variable | ASM-2 |

Surface coupling notes: SURF-3 and SURF-5 are tightly coupled. A row classified as coverage creates different edges than a row classified as a primary definition. SURF-4 also couples with SURF-6 because graph validation cannot be profile-aware unless profiles declare source roles, allowed relationships, and coverage requirements. SURF-1 is fixed because the current authoritative registry boundary is already tested and should remain a compatibility control.

Section status: Complete

## 5. Option Families

| ID | Option family | Summary | Surfaces varied | Promoted to candidate? | Rationale |
| --- | --- | --- | --- | --- | --- |
| OPT-1 | Preserve heading and `ctx://trace` derive only | Keep current derivation and require manual annotation before graph validation. | SURF-1, SURF-9 | Yes | Conservative baseline; useful to compare because it preserves all existing authority behavior. |
| OPT-2 | Extend authoritative `derive` to table IDs | Treat IDs found in tables as derived registry entities and scan the document for references. | SURF-2, SURF-3, SURF-9 | Yes | Directly addresses empty graphs, but carries high false-authority risk. |
| OPT-3 | Restore read-only candidate graph discovery | Reuse the superseded candidate graph direction with heuristic ID-family discovery and inferred edges. | SURF-2, SURF-8, SURF-9 | Yes | Good prior work, but not enough for profile-specific graph validation. |
| OPT-4 | Use structural validation profiles as graph profiles | Infer definitions and edges from existing markdown-engine validation profile selectors and `idsFrom` rules. | SURF-4, SURF-6 | Yes | Attractive because skill profiles already exist, but structural rules do not encode all graph semantics. |
| OPT-5 | Add profile-aware trace evidence and graph validation layer | Build a reusable trace evidence service with explicit role rules, graph profiles, validation diagnostics, and durable-authoring integration. | SURF-2 through SURF-10 | Yes | Best match for sophisticated validation while preserving authority boundaries. |
| OPT-6 | R0 calibration experiment first | Build no production surface yet; produce extractor output and graph validation report for real fixtures to retire role and relationship uncertainty. | SURF-3, SURF-4, SURF-5, SURF-10 | Yes | Appropriate when selected architecture depends on unproven table-role semantics. |

Section status: Complete

## 6. Candidate Elaboration

| ID | Source option | Mechanism | Boundaries and interfaces | Rollback posture | Load-bearing assumptions |
| --- | --- | --- | --- | --- | --- |
| CAND-1 | OPT-1 | Keep current heading/trace-link derivation. Use docs to explain that table-first specs need annotation before graph validation. | Existing CLI and registry APIs only. | No change. | Users will accept manual annotation and empty graphs for table-first specs. |
| CAND-2 | OPT-2 | Expand `deriveRegistryResultFromMarkdownText` to register IDs from table cells and derive references from all document text. | Modifies authoritative registry derivation and graph projection. | Requires reverting source changes if semantics prove wrong. | Every table ID can be safely promoted or deterministic rules can be added quickly. |
| CAND-3 | OPT-3 | Add non-authoritative candidate discovery with default ID families, mentions, inferred edges, diagnostics, and graph exports. | New candidate schema and CLI/library surface beside `derive`. | Disable or remove additive commands; source Markdown untouched. | Heuristics are sufficient for real execution and design specs. |
| CAND-4 | OPT-5 | Add a profile-aware trace evidence service that extracts role-classified facts from headings, tables, prose, links, and ranges; project a schema-distinct evidence graph; run graph validation profiles over it. | New `trace-evidence` domain, graph validation profile schema, diagnostics, graph summary/export, and durable authoring integration. Existing `derive` remains authoritative. | Additive and reversible; production commands can be disabled without changing source Markdown or registry behavior. | Profiles can express primary definitions, supplemental definitions, coverage rows, allowed relationships, and required paths precisely enough. |
| CAND-5 | OPT-6 | Run an R0 experiment that prototypes CAND-4 extraction and validation against the real execution spec and generated design spec, without adding package public APIs. | Temporary script or private module plus evidence report under `docs/evidence`. | Delete experiment artifacts; no production behavior changes. | R0 fixture results will expose enough semantics to write an R2 design-spec. |

Candidate notes: CAND-4 is the target architecture, but CAND-5 is the immediate next action. CAND-2 is rejected unless a later migration explicitly approves table-derived registry authority. CAND-3 remains useful as prior art but is too heuristic for validation that needs to distinguish source authority, work packages, milestones, evidence, risks, and traceability matrix rows.

Section status: Complete

## 7. Stress Scenarios and Failure Modes

| ID | Scenario | Stimulus and environment | Candidates tested | Expected response | Result |
| --- | --- | --- | --- | --- | --- |
| SCN-1 | Real execution spec baseline | Run against sibling `execution-decomposer` execution spec with many table IDs and no heading trace definitions. | CAND-1, CAND-2, CAND-3, CAND-4 | CAND-1 returns empty graph; CAND-2 risks false authority; CAND-3 finds nodes but may misclassify roles; CAND-4 should classify primary definitions, mentions, ranges, and coverage rows. | Favors CAND-4, requires CAND-5 proof. |
| SCN-2 | Traceability matrix repeats IDs | Section 17 repeats `SRC-*`, `OBJ-*`, `WP-*`, `MS-*`, `VAL-*`, and `REV-*` as matrix row headers and cells. | CAND-2, CAND-3, CAND-4 | CAND-2 may create duplicate definitions; CAND-3 may over-count; CAND-4 should classify matrix cells as coverage evidence, not primary definitions. | Strongly rejects naive table-derived authority. |
| SCN-3 | Duplicate risk rows with different roles | `RISK-*` appears in risk/unknown sections and later risk sections. | CAND-2, CAND-3, CAND-4 | The system must distinguish duplicate primary-definition failure from supplemental-definition or repeated-risk-table policy. | Requires profile role rules and R0 fixture evidence. |
| SCN-4 | Range expressions | The execution spec uses ranges such as `PKG-1 through PKG-9`, `WP-1 through WP-6`, and `VAL-1 through VAL-14`. | CAND-3, CAND-4 | The graph must expand valid ranges only after the family is discovered and must diagnose missing endpoints. | Favors CAND-4 with explicit range validation. |
| SCN-5 | `ctx://trace` links inside tables | A heading-defined entity section contains table cells with `ctx://trace` body references; another fixture contains table-only `ctx://trace` definitions. | CAND-1, CAND-4 | Current body references remain compatible; table-only definitions become trace evidence candidates, not authoritative registry definitions. | CAND-4 can preserve current behavior while expanding evidence. |
| SCN-6 | Generated design-spec table IDs | The generated design spec contains `REQ-*`, `FUNC-*`, `TECH-*`, and `VAL-*` table IDs and passes structural design-spec validation. | CAND-1, CAND-3, CAND-4 | CAND-1 remains empty; CAND-3 can visualize; CAND-4 should validate requirement-to-behavior-to-mechanism-to-validation coverage. | Requires cross-profile semantics beyond execution-spec. |
| SCN-7 | Dangling and missing coverage | A work package references `VAL-99` or has no path to a milestone or validation checkpoint. | CAND-3, CAND-4 | CAND-3 can report unresolved references; CAND-4 can fail graph validation with stable diagnostics and source evidence. | Favors graph validation profile. |
| SCN-8 | Durable authoring repair loop | A generated artifact has duplicate IDs, unresolved ranges, or missing matrix coverage. | CAND-3, CAND-4 | CAND-4 emits diagnostics that can feed repair packets and graph deltas without claiming final authority. | Favors CAND-4 integration with authoring. |
| SCN-9 | Backward compatibility | Existing R1 link-backed graph tests, generated sidecar checks, and validate/derive commands run after adding the new layer. | CAND-2, CAND-4 | CAND-2 has high regression surface; CAND-4 should pass unchanged because it is additive. | Favors CAND-4. |

Section status: Complete

## 8. Trade Study

| ID | Criterion | Priority | Source concern or constraint |
| --- | --- | --- | --- |
| CRIT-1 | Correctly handles real table-first execution and design specs | High | User request; real execution spec evidence |
| CRIT-2 | Preserves authoritative registry and sidecar boundary | High | CON-2, R1/R2 evidence |
| CRIT-3 | Supports profile-specific role semantics | High | CON-3, CON-6, Q-1 |
| CRIT-4 | Provides deterministic evidence and diagnostics | High | CON-4, durable authoring repair needs |
| CRIT-5 | Enables graph validation beyond extraction | High | Need for dangling, coverage, path, duplicate, and range checks |
| CRIT-6 | Keeps implementation decomposable and reviewable | Medium | Prior execution estimate recommended decomposition-first |
| CRIT-7 | Fits durable Markdown authoring and repair loops | Medium | Durable authoring spec REQ-1, REQ-2, REQ-5, REQ-12 |

| Candidate | CRIT-1 | CRIT-2 | CRIT-3 | CRIT-4 | CRIT-5 | CRIT-6 | CRIT-7 | Decisive strengths | Decisive weaknesses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAND-1 | Weak | Strong | Weak | Strong | Weak | Strong | Weak | No regression risk. | Fails the real user problem and leaves graph validation unavailable. |
| CAND-2 | Medium | Weak | Weak | Medium | Medium | Weak | Weak | Produces non-empty graphs quickly. | Converts ambiguous table facts into authority and threatens existing derive semantics. |
| CAND-3 | Medium | Strong | Medium | Strong | Medium | Strong | Medium | Additive and based on prior design work. | Too heuristic for matrix roles, repeated IDs, and profile-specific graph validation. |
| CAND-4 | Strong after R0 | Strong | Strong | Strong | Strong | Medium | Strong | Matches real artifact shape and durable authoring needs while preserving authority. | Requires new profile semantics and graph validation contracts. |
| CAND-5 | Medium | Strong | Strong | Strong | Medium | Strong | Medium | Retires uncertainty cheaply before production design. | Does not itself deliver production capability. |

Sensitivity points: If R0 shows execution-spec and design-spec relationship semantics cannot be generalized from profiles, CAND-4 should narrow to explicit artifact-family profiles instead of a generic graph profile. If the project owner wants immediate visualization over validation, CAND-3 can ship first as a read-only UX slice. If table-derived entities must become registry authority, CAND-2 requires a separate migration design and sidecar compatibility proof.

Section status: Complete

## 9. Source Doctrine Validation

| Doctrine lens | Applied check | Result | Follow-up |
| --- | --- | --- | --- |
| NASA systems design | Mission, constraints, risks, validation gates, and readiness state are chained from observed empty graph output to R0 gate. | Pass | Preserve the R0 stop condition before implementation design. |
| ISO 42010 architecture description | Stakeholders, concerns, viewpoints, boundaries, and candidate interfaces are explicit. | Pass | R2 design-spec must define schema and interface contracts after R0. |
| SEI ATAM | Tradeoffs between authority, correctness, profile semantics, determinism, and scope are explicit. | Pass | R0 must stress sensitivity points around relationship vocabulary and duplicate roles. |
| Parnas information hiding | Trace evidence and graph validation are isolated from authoritative registry derivation. | Pass | Keep `derive` unchanged until a later approved transition. |
| NIST SSDF and threat modeling | No secrets, auth, network, or remote mutation are introduced; misuse risk is false authority. | Pass | State labels and diagnostics must distinguish evidence from authority. |
| SRE and Well-Architected operations | Local deterministic artifacts, diagnostics, rollback by containment, and compatibility gates are identified. | Pass | R2 design-spec should include CLI exit codes, artifact hashes, and fixture gates. |

Section status: Complete

## 10. Selected Design Decision Record

Decision: Select profile-aware trace evidence and graph validation as the target architecture, but do not proceed directly to implementation design. Execute an R0 calibration experiment first.

Selected candidate: CAND-4 as the target design, with CAND-5 as the immediate downstream action.

Rationale: CAND-4 is the only candidate that supports table-first specs, preserves current registry authority, allows profile-specific table roles, and enables graph validation diagnostics for durable authoring. The real execution spec proves the problem is not just ID discovery; it is role-aware interpretation of definitions, references, ranges, and matrix coverage. Because relationship direction and duplicate-role policy are load-bearing, CAND-5 must run before an R2 design-spec locks public contracts.

Rejected alternatives:

- CAND-1 is rejected because it leaves real table-first artifacts with empty graph evidence.
- CAND-2 is rejected because it expands authoritative registry derivation before table roles and duplicate semantics are proven.
- CAND-3 is rejected as the final design because heuristic candidate graphs cannot support sophisticated validation with low false-positive risk.
- Pure structural-profile reuse is rejected because existing validation profiles prove table shape and some references, not semantic graph authority.

Accepted risks:

- RISK-1 remains accepted only for R0; the experiment must prove coverage rows and repeated IDs are not promoted to primary definitions.
- RISK-2 remains accepted only behind R0; relationship vocabulary and direction must be reported before design-spec.
- RISK-3 remains accepted with mitigation: graph semantics shall be schema-distinct from markdown-engine structural validation unless R0 proves a safe extension model.

Decision owner: Project owner.

Section status: Complete

## 11. Uncertainty, Experiments, and R0 Gates

| ID | Uncertainty or validation need | Gate type | Owner | Evidence required | Due point |
| --- | --- | --- | --- | --- | --- |
| VAL-1 | Real execution-spec role extraction quality | R0 experiment | Codex | Extraction report for `execution-decomposer` execution spec listing primary definitions, supplemental definitions, coverage rows, mentions, ranges, candidate edges, and diagnostics with no matrix-row false primary definitions. | Before design-spec |
| VAL-2 | Generated design-spec graph validation quality | R0 experiment | Codex | Extraction report for `docs/evidence/generated-design-spec-demo.md` showing requirement, function, technical mechanism, and validation coverage paths or explicit gaps. | Before design-spec |
| VAL-3 | `ctx://trace` table compatibility | R0 experiment | Codex | Fixture proving current heading-defined table references remain compatible and table-only `ctx://trace` definitions become evidence candidates, not authoritative registry entities. | Before design-spec |
| VAL-4 | Graph profile shape decision | R0 experiment | Project owner and graph validation reviewer | Sample graph profile or profile-extension draft declaring table roles, ID families, relationship rules, range rules, coverage matrix semantics, and diagnostic classes. | Before design-spec |
| VAL-5 | Graph validation rule smoke test | R0 experiment | Codex | Private or prototype validator output for dangling references, duplicate primary definitions, missing required path, invalid range endpoint, and matrix coverage gap. | Before design-spec |
| VAL-6 | Authoritative compatibility guard | Validate before design-spec | Codex | `npm test`, `npm run typecheck`, `npm run build`, and targeted R1 derive/sidecar compatibility checks still pass after any prototype code is removed or isolated. | Before design-spec |
| Q-1 | Profile location and composition | R0 experiment | Project owner | Decision record choosing separate graph profile, authoring-profile extension, or markdown-engine validation-profile extension. | R0 review |
| Q-2 | Relationship vocabulary and direction | R0 experiment | Graph validation reviewer | Relationship glossary and example edges for execution-spec and design-spec artifacts. | R0 review |
| Q-3 | Primary versus supplemental definition policy | R0 experiment | CODEFACTORY artifact-profile reviewer | Policy table for duplicate IDs, repeated risk rows, coverage rows, and source-authority restatements. | R0 review |

Section status: Complete

## 12. Handoff to design-spec

Recommended downstream action: Run the R0 experiment and produce an evidence report before authoring an R2 design-spec. Do not implement production graph validation or change `derive` until VAL-1 through VAL-6 are satisfied or explicitly waived by the project owner.

Recommended downstream rigor: R0 now; R2 design-spec after R0 if the selected CAND-4 semantics prove stable across execution-spec and design-spec fixtures.

Source authority for design-spec:

- Current `derive` and trace-link source in `src/markdowntrace/registry/derived.ts` and `src/markdowntrace/markdown/trace-links.ts`.
- Durable Markdown authoring requirements and mechanisms in `docs/design/markdown-trace-durable-markdown-authoring-design-spec.md`.
- R1/R2 evidence preserving authoritative registry and generated sidecar compatibility.
- Real execution spec table-first evidence in sibling `execution-decomposer/docs/execution/execution-decomposer-execution-spec.md`.
- Execution-spec and design-spec validation profiles as structural profile inputs, not graph-semantic authority by themselves.
- R0 extraction and validation report produced from this packet's VAL gates.

Risks and gates to preserve:

- Preserve authoritative registry isolation unless a later migration design approves promotion.
- Require table role classification before graph fact creation.
- Keep structural validation, trace evidence, and graph validation as separate result classes.
- Keep deterministic source evidence and stable diagnostics as first-class outputs.
- Treat unretired relationship vocabulary and duplicate-role policy as blockers to implementation design.

Traceability notes: The future R2 design-spec should map CAND-4 into explicit requirements for trace evidence schemas, graph profile schemas, extraction roles, relationship rules, diagnostics, graph validation rules, CLI/library surfaces, durable authoring integration, fixture coverage, and compatibility gates. The design-spec should also state whether CAND-3-style visualization ships as a separate interim command or only as a view over validated trace evidence.

Section status: Complete

## Internal Review Record

Calibration result: R2 is the expected rigor for production implementation because this creates reusable package schemas, profile contracts, CLI/library surfaces, diagnostics, and durable authoring integration. Current packet is correctly marked Ready for R0 Experiment because relationship direction, profile composition, and duplicate-role semantics remain load-bearing unknowns.

Findings addressed:

- DP-1 Major, resolved: Initial framing risked asking "why not make derive parse tables." Revised decision preserves `derive` and routes table facts through a separate trace evidence layer.
- DP-2 Major, resolved: Initial candidate graph direction underweighted traceability matrices and repeated IDs. Revised packet adds role classification, matrix coverage stress, and R0 gates.
- DP-3 Minor, resolved: Superseded candidate graph artifacts could have been treated as active authority. Revised packet uses durable Markdown authoring as current direction and candidate graph as prior art only.

Validation result: Passed structural validation with `design-process-validation-profile.yaml`; 33 rules passed with 0 diagnostics.

Unresolved findings: Relationship vocabulary, graph profile placement, and duplicate-role policy remain unresolved by design and are routed to R0 gates Q-1 through Q-3.

Readiness verdict: Ready for R0 Experiment.
