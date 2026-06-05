# Markdown Trace Profile-Aware Graph Validation R0 Execution Specification

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Profile-Aware Graph Validation R0 Execution Specification |
| Status | Draft |
| Execution level | `E0` |
| Execution level justification | This execution is a bounded discovery/prototype pass whose purpose is to retire semantic uncertainty before any R2 design-spec or production implementation. It shall not ship public CLI, mutate source Markdown, or change authoritative registry derivation. |
| Author(s) | Codex |
| Executor(s) | Codex implementation agent |
| Reviewers | Project owner; Markdown Trace maintainer; graph validation reviewer; CODEFACTORY artifact-profile reviewer |
| Decision owner | Project owner |
| Target branch, release, or milestone | R0 graph validation proof |
| Last updated | 2026-06-05 |
| Related source docs | `docs/design/markdown-trace-profile-aware-graph-validation-design-process.md`; `docs/evidence/profile-aware-graph-validation-r0-execution-estimate.json`; sibling `execution-decomposer/docs/execution/execution-decomposer-execution-spec.md`; `docs/evidence/generated-design-spec-demo.md` |
| Related tickets | none |

## 0. Execution Summary

Decision requested: Approve to investigate.

Approved outcome: Execute an R0 proof authorized by `SRC-1` and cleaned by `SRC-2` that determines whether Markdown Trace can extract and validate profile-aware graph evidence from table-first execution and design specs without changing authoritative `derive` behavior.

Execution approach: `WP-1` controls fixtures and baselines, `WP-2` builds a private extraction harness, `WP-3` tests role and relationship semantics with negative probes, and `WP-4` writes the evidence report and compatibility result.

Entry condition: The design-process packet remains consensus-clean and the executor reads this execution spec plus `SRC-1` before making R0 prototype changes.

Top risks or unknowns:

- RISK-1: Table rows and traceability matrix cells may be misclassified as primary definitions.
- RISK-2: Execution-spec and design-spec relationship direction may not share a useful vocabulary.
- RISK-3: The generated design-spec demo fixture is currently untracked and must be controlled or regenerated before claiming VAL-2.

Section status: Complete

## Layer 1: Execution Basis

## 1. Source Authority and Scope

| ID | Source | Authority | Execution implication |
| --- | --- | --- | --- |
| SRC-1 | `docs/design/markdown-trace-profile-aware-graph-validation-design-process.md` | Consensus-reviewed design-process authority for target architecture and R0 gates. | Execution shall prove CAND-4 semantics through CAND-5 R0 evidence before any R2 design-spec or production implementation. |
| SRC-2 | Consensus review packet `.codex/consensus-review/graph-validation-design-process/consensus-review-packet.md` and repository-visible result summary `docs/evidence/profile-aware-graph-validation-design-process-consensus-review-results.md` from 2026-06-05 | Approval evidence that the design-process artifact is clean for R0 execution-spec authoring. | Execution may proceed to R0 planning; reviewer observations about fixture control shall be handled in scope. |
| SRC-3 | `src/markdowntrace/registry/derived.ts` and `src/markdowntrace/markdown/trace-links.ts` | Current authoritative registry derivation and trace-link collection behavior. | R0 shall not modify authoritative `derive`, `derive-sidecar`, registry, graph, or validation behavior. |
| SRC-4 | Sibling `execution-decomposer/docs/execution/execution-decomposer-execution-spec.md` | Real table-first execution-spec calibration artifact. | R0 shall extract role-classified facts from this artifact and prove matrix rows are not false primary definitions. |
| SRC-5 | `docs/evidence/profile-aware-graph-validation-r0-execution-estimate.json` | Execution-estimation result for the proposed R0 proof: `proceed-with-controls`, low blast radius, 8 adjusted story points, no decomposition requirement. | Execution may proceed with targeted controls and evidence capture. |

In scope: Private R0 prototype code under `experiments/profile-aware-graph-validation-r0/**`; graph profile sketches; fixture control for execution-spec, generated design-spec, `ctx://trace` table links, and negative probes; role classification evidence; relationship vocabulary evidence; graph validation smoke diagnostics; compatibility checks; and an R0 evidence report.

Out of scope: Production `src/markdowntrace/**` feature implementation; public CLI or library contracts; source Markdown mutation; authoritative registry promotion; design-spec authoring beyond R0 findings; LLM extraction; remote services; graph databases; MCP; browser automation; and release packaging.

Definition of done: A reviewer can inspect `docs/evidence/profile-aware-graph-validation-r0-report.md` and see deterministic evidence for `VAL-1` through `VAL-6`, including extraction summaries for the real execution spec and generated design spec, `ctx://trace` table behavior, graph profile shape recommendation, graph validation smoke diagnostics, and unchanged authoritative compatibility checks.

Re-decision boundaries: Any need to modify `derive`, introduce public schemas, publish CLI behavior, mutate source Markdown, treat inferred table facts as registry authority, or skip matrix-role classification shall pause execution and return to the project owner before continuing.

Section status: Complete

## 2. Objectives and Non-Objectives

| ID | Statement | Completion horizon | Evidence |
| --- | --- | --- | --- |
| OBJ-1 | Produce controlled R0 fixtures for real execution-spec extraction, generated design-spec extraction, `ctx://trace` table behavior, and negative graph validation probes. | `WP-1` complete and `MS-1` approved | `EVD-1`, `EVD-2`, `VAL-1`, `VAL-2`, `VAL-3` |
| OBJ-2 | Produce a private extractor that emits deterministic role-classified trace facts without changing production Markdown Trace behavior. | `WP-2` complete and `MS-2` approved | `EVD-3`, `VAL-1`, `VAL-2`, `VAL-6` |
| OBJ-3 | Prove or reject initial role and relationship semantics for primary definitions, supplemental definitions, coverage rows, mentions, references, ranges, and candidate edges. | `WP-3` complete and `MS-2` approved | `EVD-4`, `EVD-5`, `VAL-4`, `VAL-5` |
| OBJ-4 | Produce graph validation smoke diagnostics for dangling references, duplicate primary definitions, invalid ranges, and missing matrix coverage. | `WP-3` complete and `MS-2` approved | `EVD-5`, `VAL-5` |
| OBJ-5 | Produce an R0 evidence report that states whether CAND-4 is ready for R2 design-spec, needs narrowing, or should be rejected. | `WP-4` complete and `MS-3` approved | `EVD-6`, `VAL-6`, `REV-3` |
| OBJ-6 | Preserve existing authoritative `derive`, `derive-sidecar`, `validate`, and R1 link-backed behavior throughout the R0 proof. | Entire execution and `MS-3` approval | `EVD-7`, `VAL-6`, `REV-2` |
| NG-1 | This R0 will not ship production graph validation, public CLI commands, public schemas, or durable package exports. | Entire execution | `REV-1` and `REV-2` verify no production surface is added. |
| NG-2 | This R0 will not mutate source Markdown or auto-promote inferred table facts into authoritative registry entities. | Entire execution | `VAL-6`, `REV-2` |
| NG-3 | This R0 will not decide final graph relationship vocabulary without evidence from execution-spec and design-spec fixtures. | Entire execution | `Q-2`, `EVD-6` |
| NG-4 | This R0 will not use LLM, network, graph database, browser, MCP, or live project-management integration. | Entire execution | `REV-2` |

Section status: Complete

## 3. Ownership, Roles, and Decision Points

| Role or person | Responsibility | Required action |
| --- | --- | --- |
| Project owner | Approves R0 entry, milestone results, and post-R0 direction. | Approve |
| Codex implementation agent | Executes R0 fixture, prototype, smoke validation, report, and compatibility work. | Execute |
| Markdown Trace maintainer | Reviews that R0 remains isolated from production registry and CLI behavior. | Review |
| Graph validation reviewer | Reviews role classification, relationship direction, graph profile sketch, and diagnostics. | Review |
| CODEFACTORY artifact-profile reviewer | Reviews execution-spec and design-spec table role policy. | Review |

Decision points:

- DP-1: Project owner approval of this `E0` execution spec before R0 prototype work begins.
- DP-2: `MS-1` approval before extractor semantics are treated as evidence.
- DP-3: `MS-2` approval before R0 report recommendations are written as final.
- DP-4: `MS-3` approval before R2 design-spec authoring begins.

Escalation path: If a prototype result requires production behavior changes, contradicts `SRC-1`, fails authoritative compatibility, or cannot classify matrix rows without false authority, pause and escalate to the project owner with the failing evidence artifact and proposed re-decision.

Section status: Complete

## 4. Constraints, Assumptions, and Dependencies

| ID | Type | Statement | Owner | Blocking? | Validation or resolution plan |
| --- | --- | --- | --- | --- | --- |
| CON-1 | Constraint | R0 code shall stay under `experiments/profile-aware-graph-validation-r0/**` unless a project-owner deviation approves another path. | Codex | No | `REV-2` inspects changed paths. |
| CON-2 | Constraint | R0 shall use public `@jasonbelmonti/markdown-engine` APIs only. | Codex | No | `VAL-6` and `REV-2` inspect imports. |
| CON-3 | Invariant | R0 outputs are trace evidence and diagnostics, not authoritative `EntityRegistry` or production `TraceGraph` output. | Codex | No | `VAL-4`, `VAL-5`, and `REV-1` inspect report wording and outputs. |
| CON-4 | Constraint | R0 outputs shall be deterministic for identical inputs and profiles. | Codex | No | `VAL-1`, `VAL-2`, and `VAL-5` capture repeatable artifacts. |
| CON-5 | Constraint | Existing production commands and tests shall remain compatible. | Codex | No | `VAL-6` runs build and targeted regression checks. |
| ASM-1 | Assumption | Private experiment code can answer the semantic questions without production package integration. | Codex | No | `MS-2` rejects the proof if private outputs cannot produce decision-grade evidence. |
| ASM-2 | Assumption | The generated design-spec demo can be used if it is either committed as controlled evidence or regenerated deterministically by the R0 procedure. | Codex | No | `WP-1` records fixture-control decision in `EVD-2`. |
| DEP-1 | Dependency | Read access to sibling `execution-decomposer/docs/execution/execution-decomposer-execution-spec.md` is required. | Codex | Yes | `WP-1` verifies file availability before extractor work starts. |

Section status: Complete

## Layer 2: Execution Plan

## 5. Evidence-Led Execution Model

Observable outcome: Markdown Trace has R0 evidence showing whether table-first CODEFACTORY specs can produce role-classified graph evidence and graph validation diagnostics without changing authoritative derivation.

Core value proposition: The project avoids installing false graph semantics into production by proving table-role and relationship behavior on real artifacts first.

Critical path hypothesis: If a private extractor can classify the real execution spec, generated design spec, `ctx://trace` table fixture, and negative probes into stable definitions, references, coverage rows, ranges, candidate edges, and diagnostics, then CAND-4 is ready for R2 design-spec authoring.

First proving slice: `WP-1` and `WP-2` together prove whether the extractor can produce deterministic role-classified facts from the real execution spec without treating traceability matrix rows as primary definitions.

Sequencing principle: Retire false-authority risk before graph validation breadth. Fixture control and real execution-spec extraction precede relationship generalization and report recommendations.

Validation cadence: Validate after each work package; require `MS-1` fixture approval before relying on extraction output, `MS-2` semantic approval before final report recommendations, and `MS-3` final approval before any R2 design-spec work.

Deferred completeness: Production API shape, CLI naming, performance targets, visualization, durable authoring integration, broad artifact-family coverage, and source mutation remain deferred until the R0 report recommends R2 design-spec.

Primary risks and unknowns:

| ID | Risk or unknown | Why it matters | Owner | Evidence required to retire | Decision gate |
| --- | --- | --- | --- | --- | --- |
| RISK-1 | Matrix rows may be misclassified as primary definitions. | This would create false authority and duplicate graph facts. | Codex | `VAL-1` report showing matrix rows classified as coverage, not primary definitions. | `MS-2` |
| RISK-2 | Relationship vocabulary may diverge between execution-spec and design-spec artifacts. | A generic graph profile may be too broad if relationships do not generalize. | Graph validation reviewer | `VAL-4` relationship glossary and example edges for both artifacts. | `MS-2` |
| RISK-3 | Negative probes may pass for the wrong reason. | Smoke diagnostics must prove graph validation logic, not parser accidents. | Codex | `VAL-5` includes source evidence and expected diagnostic codes for each negative fixture. | `MS-2` |
| Q-1 | Should graph roles live in a standalone graph profile or profile extension? | This determines the future R2 contract boundary. | Project owner | `VAL-4` profile-shape recommendation with tradeoffs. | `MS-3` |
| Q-2 | Which repeated IDs are supplemental definitions versus coverage rows versus duplicate failures? | Duplicate policy controls false-positive and repair behavior. | CODEFACTORY artifact-profile reviewer | `VAL-1`, `VAL-4`, and `EVD-6` policy table. | `MS-3` |

Section status: Complete

## 6. Change Surface Inventory

| ID | Surface | Change type | Owner | Read/write boundary | Review expectation |
| --- | --- | --- | --- | --- | --- |
| SURF-1 | `experiments/profile-aware-graph-validation-r0/**` | Code / Config / Test | Codex | Writable R0-only prototype and fixtures. | Reviewed for containment, deterministic output, and no production imports beyond public APIs. |
| SURF-2 | `docs/evidence/profile-aware-graph-validation-r0-report.md` | Docs | Codex | Writable R0 evidence report. | Reviewed for decision-grade evidence and honest unresolved questions. |
| SURF-3 | `docs/evidence/generated-design-spec-demo.md` | Docs | Codex | Read or promote/regenerate as controlled fixture; no silent dependency on untracked state. | Reviewed for fixture-control decision before VAL-2 is claimed. |
| SURF-4 | Sibling `execution-decomposer/docs/execution/execution-decomposer-execution-spec.md` | Data | Codex | Read-only external calibration artifact. | Reviewed for read-only use and explicit source path in evidence. |
| SURF-5 | Production `src/markdowntrace/**`, `fixtures/**`, and existing tests | Code / Test | Codex | Read-only during R0 unless project owner approves deviation. | Reviewed to confirm no production behavior changed. |
| SURF-6 | `docs/markdown-trace-profile-aware-graph-validation-r0-execution.md` | Docs | Codex | Writable execution control artifact. | Reviewed with execution-spec validation profile and project-owner approval. |

Section status: Complete

## 7. Agent-Focused Package Decomposition

Decomposition mission: Keep the R0 prototype isolated while separating extraction mechanics, profile semantics, and evidence reporting so an implementation agent can retire graph-semantics risk without creating production coupling.

| ID | Unit | Ladder level | Mission | Observable value enabled | Risk retired | Public interface | Validation command | Promotion blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PKG-1 | R0 extraction harness | 1 | Parse Markdown through public engine APIs and emit raw occurrences plus role-classified facts. | Real execution and design specs become inspectable as trace evidence. | RISK-1 | Private experiment script output JSON/Markdown. | `npm run build --silent` plus R0 script command recorded in `EVD-3`. | Cannot promote until R2 design-spec defines production schemas and ownership. |
| PKG-2 | R0 graph profile sketches and fixtures | 1 | Define provisional table roles, ID families, relationship hints, range rules, and negative fixtures. | Relationship and duplicate-role semantics become reviewable. | RISK-2 / Q-2 | Private YAML profile sketches and fixture files. | R0 script command recorded in `EVD-4` and `EVD-5`. | Cannot promote until graph profile location is decided in `Q-1`. |
| PKG-3 | R0 evidence and compatibility report | 1 | Convert prototype output, smoke diagnostics, and regression checks into decision-grade evidence. | Project owner can approve, narrow, or reject CAND-4 before R2 design-spec. | RISK-3 / Q-1 | `docs/evidence/profile-aware-graph-validation-r0-report.md`. | `markdown-engine validate` where applicable plus `VAL-6` regression commands. | Cannot promote until report is reviewed at `MS-3`. |

### Package Boundary Card: PKG-1

Ladder level: 1

Mission: Own private extraction mechanics for the R0 proof.

Value / risk trace:
- Observable value enabled: Table-first artifacts produce inspectable trace evidence.
- Risk retired: RISK-1.
- Validation evidence: VAL-1, VAL-2, VAL-3.
- Blocking unknowns: None before R0; results may expose Q-1 or Q-2.

Owns:
- Files/directories: `experiments/profile-aware-graph-validation-r0/extract-trace-evidence.ts`.
- Concepts: Raw ID occurrences, source ranges, section/table context, role-classified facts.
- Runtime responsibilities: Read local Markdown and emit deterministic prototype output.

Does not own:
- Explicitly excluded behavior: Production `derive`, public CLI, registry construction, source mutation.
- Responsibilities delegated elsewhere: PKG-2 owns provisional graph semantics; PKG-3 owns report decisions.

Public interface:
- Exported types: None; private script-local types only.
- Exported functions/classes/components: None.
- Events/messages/contracts: Private JSON/Markdown output captured as `EVD-*`.
- CLI/API surface: Experiment command only.

Allowed dependencies:
- May import: Public `@jasonbelmonti/markdown-engine` APIs and Node standard library.
- May call: Read-only local file reads and deterministic serialization helpers local to the experiment.
- May read configuration from: R0 graph profile sketch files under SURF-1.

Forbidden dependencies:
- Must not import: Private `markdown-engine` internals or production `src/markdowntrace/registry/**` mutation paths.
- Must not call: Production `derive` as an extraction substitute except in compatibility checks owned by PKG-3.
- Must not know about: Future public CLI names or production schema commitments.

State boundary:
- Owns state: Temporary in-memory extraction state.
- Reads state: Local Markdown files and profile sketches.
- Mutates state: R0 output artifacts only.
- Persistence responsibility: None beyond explicit evidence artifacts.

Agent ownership boundary:
- Agent editable paths: `experiments/profile-aware-graph-validation-r0/extract-trace-evidence.ts`.
- Agent read-only paths: `src/**`, `node_modules/@jasonbelmonti/markdown-engine/**`, `docs/design/**`, sibling execution spec.
- Required coordination before editing: Any production `src/**` change requires project owner deviation.

Validation command: R0 extraction command recorded in `EVD-3`.

Promotion blockers: No production API, schema, performance target, or compatibility story is approved.

### Package Boundary Card: PKG-2

Ladder level: 1

Mission: Own provisional graph profile sketches and fixtures that make role and relationship semantics falsifiable.

Value / risk trace:
- Observable value enabled: Reviewers can inspect graph semantics before production design.
- Risk retired: RISK-2 and Q-2.
- Validation evidence: VAL-4, VAL-5.
- Blocking unknowns: Q-1 profile location remains unresolved until MS-3.

Owns:
- Files/directories: `experiments/profile-aware-graph-validation-r0/graph-profile.*.yaml`; `experiments/profile-aware-graph-validation-r0/fixtures/**`.
- Concepts: Table role rules, ID family rules, relationship hints, range policy, negative probes.
- Runtime responsibilities: Provide input to PKG-1 and PKG-3.

Does not own:
- Explicitly excluded behavior: Production validation profile changes.
- Responsibilities delegated elsewhere: PKG-1 executes extraction; PKG-3 records evidence.

Public interface:
- Exported types: None.
- Exported functions/classes/components: None.
- Events/messages/contracts: Private YAML sketch only.
- CLI/API surface: None.

Allowed dependencies:
- May import: Not applicable for Markdown/YAML fixtures.
- May call: Not applicable.
- May read configuration from: Source design-process packet and skill validation profiles as structural references.

Forbidden dependencies:
- Must not import: Not applicable.
- Must not call: Not applicable.
- Must not know about: Production CLI behavior or registry authority.

State boundary:
- Owns state: Fixture files and profile sketches.
- Reads state: Source profile docs and real artifacts.
- Mutates state: R0 fixture/profile files only.
- Persistence responsibility: Fixture state under experiment directory.

Agent ownership boundary:
- Agent editable paths: `experiments/profile-aware-graph-validation-r0/graph-profile.*.yaml`; `experiments/profile-aware-graph-validation-r0/fixtures/**`.
- Agent read-only paths: `/Users/jasonbelmonti/.codex/skills/**`; sibling execution spec; production fixtures.
- Required coordination before editing: Any checked production fixture promotion requires project owner approval.

Validation command: R0 smoke command recorded in `EVD-5`.

Promotion blockers: Profile location and schema remain undecided until Q-1 is resolved.

### Package Boundary Card: PKG-3

Ladder level: 1

Mission: Own evidence synthesis, compatibility checks, and final R0 recommendation.

Value / risk trace:
- Observable value enabled: Project owner receives a decision-grade R0 result.
- Risk retired: RISK-3 and Q-1.
- Validation evidence: VAL-5, VAL-6.
- Blocking unknowns: None after MS-3 if report is approved.

Owns:
- Files/directories: `docs/evidence/profile-aware-graph-validation-r0-report.md`; `docs/evidence/profile-aware-graph-validation-r0-execution-estimate.json`.
- Concepts: Evidence summary, unresolved questions, compatibility status, R2 recommendation.
- Runtime responsibilities: Run and record validation commands.

Does not own:
- Explicitly excluded behavior: Implementing production graph validation.
- Responsibilities delegated elsewhere: PKG-1 extracts; PKG-2 defines provisional semantics.

Public interface:
- Exported types: None.
- Exported functions/classes/components: None.
- Events/messages/contracts: Evidence report sections and command transcripts.
- CLI/API surface: None.

Allowed dependencies:
- May import: Not applicable for evidence docs.
- May call: Existing build, test, and markdown-engine validation commands.
- May read configuration from: Package metadata, existing tests, R0 output artifacts.

Forbidden dependencies:
- Must not import: Not applicable.
- Must not call: Network, LLM, graph database, browser, MCP, or live project-management APIs.
- Must not know about: Production API decisions not proven by R0.

State boundary:
- Owns state: Evidence report contents.
- Reads state: Prototype outputs and test results.
- Mutates state: Evidence report only.
- Persistence responsibility: Durable `docs/evidence/**` artifacts.

Agent ownership boundary:
- Agent editable paths: `docs/evidence/profile-aware-graph-validation-r0-report.md`; `docs/evidence/profile-aware-graph-validation-r0-execution-estimate.json`.
- Agent read-only paths: production source, tests, design docs, R1/R2 evidence.
- Required coordination before editing: Report recommendations that contradict `SRC-1` require project-owner review.

Validation command: `node_modules/.bin/markdown-engine validate --file docs/markdown-trace-profile-aware-graph-validation-r0-execution.md --profile /Users/jasonbelmonti/.codex/skills/execution-spec/references/execution-spec-validation-profile.yaml --format json` plus compatibility commands in VAL-6.

Promotion blockers: R0 report must be approved at MS-3 before R2 design-spec work starts.

Dependency direction rules:

- Allowed direction: PKG-3 reads outputs from PKG-1 and PKG-2; PKG-1 may read PKG-2 profile sketches; PKG-2 shall not depend on PKG-1 internals.
- Prohibited imports: No production code may import experiment modules.
- Allowed cross-boundary communication: File-based prototype inputs and outputs under `experiments/profile-aware-graph-validation-r0/**` and `docs/evidence/**`.
- Disallowed cross-boundary communication: Hidden in-memory coupling, production registry mutation, or private engine internals.

State boundary rules:

- Package-owned state: R0 fixture/profile/output/report artifacts.
- Package-read state: Source docs, existing tests, package metadata.
- Package-mutated state: Only explicitly listed experiment and evidence artifacts.
- Persistence ownership: PKG-3 owns final evidence persistence.

Reusable package candidates:

| Candidate | Current level | Reuse rationale | Required decoupling | Promotion trigger |
| --- | --- | --- | --- | --- |
| Trace evidence extractor | 1 | May become a production internal package after R0. | Needs R2 schema, public boundary, tests, CLI decision, and compatibility design. | R2 design-spec approval after MS-3. |

Coupling tripwires:

- Any need for production `src/**` edits.
- Any prototype output pretending to be authoritative registry output.
- Any relationship rule that only works by hardcoding one source document.
- Any fixture promotion outside `experiments/**` or `docs/evidence/**` without owner approval.

N/A rationale: Package decomposition is applicable because the R0 includes private code, profile sketches, fixtures, and evidence contracts.

Section status: Complete

## 8. Work Packages and Sequencing

Planning strategy: Spike then slice with risk retirement.

Critical path hypothesis: The R0 succeeds only if the real execution spec can be classified without matrix false definitions and the generated design spec can produce meaningful coverage evidence.

First proving slice: `WP-1` and `WP-2`.

Validation cadence: `VAL-1` and `VAL-2` after extraction; `VAL-4` and `VAL-5` after semantic probes; `VAL-6` before final approval.

Deferred completeness: Production schemas, public APIs, broad fixtures, performance benchmarks, visualization, and repair integration are deferred.

| ID | Objective | Owner | Package boundary | Editable paths | Read-only paths | Inputs | Outputs | Dependencies | Observable value enabled | Risk retired | Milestone gate | Validation checkpoint | Completion criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WP-1 | Establish controlled R0 fixture set and baseline inputs. | Codex | PKG-2 | `experiments/profile-aware-graph-validation-r0/fixtures/**`, optional controlled handling of `docs/evidence/generated-design-spec-demo.md` | `docs/design/**`, sibling execution spec, `/Users/jasonbelmonti/.codex/skills/**` | `SRC-1`, `SRC-4`, generated design-spec demo, consensus fixture observation | Fixture inventory, fixture-control decision, source path checks | DEP-1 | R0 inputs are inspectable and repeatable before extraction claims are made. | RISK-3 | MS-1 | VAL-1, VAL-2, VAL-3 | Real execution spec path verified; generated design fixture controlled or regeneration documented; table ctx and negative fixtures created. |
| WP-2 | Build private extraction harness and run it on real execution and design fixtures. | Codex | PKG-1 | `experiments/profile-aware-graph-validation-r0/extract-trace-evidence.ts` | `src/**`, `node_modules/@jasonbelmonti/markdown-engine/**`, fixtures from WP-1 | Fixture set, graph profile sketches, public engine APIs | Deterministic occurrence and role-classification output for execution and design fixtures | WP-1 | Table-first specs produce trace evidence without production code changes. | RISK-1 | MS-2 | VAL-1, VAL-2, VAL-6 | Outputs list definitions, mentions, coverage rows, ranges, candidate edges, and diagnostics; matrix rows are not primary definitions. |
| WP-3 | Add provisional graph profile sketches, relationship glossary, and negative smoke probes. | Codex | PKG-2, PKG-3 | `experiments/profile-aware-graph-validation-r0/graph-profile.*.yaml`, `experiments/profile-aware-graph-validation-r0/fixtures/**`, `docs/evidence/profile-aware-graph-validation-r0-report.md` | `src/**`, skill validation profiles, R0 extractor output | Extractor output, graph profile sketches, negative fixtures | Relationship examples, profile-shape recommendation, smoke diagnostics | WP-1, WP-2 | R0 proves whether graph validation semantics are plausible before R2 design. | RISK-2 / Q-1 / Q-2 | MS-2 | VAL-4, VAL-5 | Smoke probes emit expected diagnostics for dangling reference, duplicate primary definition, invalid range, and missing coverage. |
| WP-4 | Produce final R0 evidence report and compatibility validation. | Codex | PKG-3 | `docs/evidence/profile-aware-graph-validation-r0-report.md` | `src/**`, `tests/**`, `fixtures/**`, `docs/design/**`, R0 outputs | WP-1 through WP-3 outputs, validation commands | R0 evidence report, compatibility results, recommendation for R2 design-spec or rework | WP-1, WP-2, WP-3 | Project owner can decide next design step from evidence rather than intuition. | RISK-1 / RISK-2 / RISK-3 / Q-1 / Q-2 | MS-3 | VAL-5, VAL-6 | Report includes all required evidence, unresolved questions, recommendation, and compatibility proof. |

Execution sequence:

1. Execute `WP-1` first and stop for `MS-1`.
2. Execute `WP-2` after `MS-1` and capture extraction outputs before adding broader smoke rules.
3. Execute `WP-3` after initial extraction output is available; keep profile sketches provisional.
4. Execute `WP-4` last and stop for `MS-3` before R2 design-spec work.

Parallelization rules: No parallel R0 work before `MS-1`. `WP-2` and `WP-3` may overlap only after extractor output format is stable enough for smoke probes and editable paths remain disjoint. `WP-4` is serialized last.

Integration points: PKG-1 reads PKG-2 profile sketches and fixtures; PKG-3 consumes PKG-1 output and PKG-2 smoke results; no production package consumes experiment output.

Coordination triggers:

- Any production `src/**`, `fixtures/**`, or public docs path needs edits.
- Any graph profile rule requires changing source validation profiles.
- Any R0 output cannot distinguish matrix coverage from definitions.
- Any compatibility command fails.

Section status: Complete

## 9. Milestone Gates and Manual Verification

| ID | Gate objective | Covered work | Due point | Human verifier | Prerequisites | Review gate | Required evidence | Approval decision | Failure path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MS-1 | Approve controlled R0 fixture baseline before extraction claims are used. | OBJ-1, SURF-3, SURF-4, PKG-2, WP-1 | Before WP-2 evidence is accepted | Project owner with CODEFACTORY artifact-profile reviewer | DEP-1, VAL-1, VAL-2, VAL-3 | REV-1 | EVD-1, EVD-2 | Approve / Reject / Conditional approval | Reject blocks WP-2; fix fixture availability, control, or scope and repeat MS-1. |
| MS-2 | Approve extraction semantics and graph validation smoke results before final recommendation. | OBJ-2, OBJ-3, OBJ-4, SURF-1, PKG-1, PKG-2, WP-2, WP-3 | Before WP-4 final report recommendation | Graph validation reviewer and Markdown Trace maintainer | MS-1, VAL-1, VAL-2, VAL-4, VAL-5 | REV-1, REV-2 | EVD-3, EVD-4, EVD-5 | Approve / Reject / Conditional approval | Reject blocks R2 recommendation; narrow graph profile, revise role rules, or record CAND-4 rejection evidence. |
| MS-3 | Approve final R0 evidence report and next-step recommendation. | OBJ-5, OBJ-6, SURF-2, SURF-5, PKG-3, WP-4 | Before R2 design-spec authoring begins | Project owner | MS-2, VAL-5, VAL-6 | REV-1, REV-2, REV-3 | EVD-6, EVD-7 | Approve / Reject / Conditional approval | Reject blocks R2 design-spec; revise report, rerun failed evidence, or return to design-process. |

Manual verification guide:

| Step ID | Milestone | Operator action | Expected result | Evidence artifact |
| --- | --- | --- | --- | --- |
| MV-1 | MS-1 | Inspect fixture inventory and source path checks. | Real execution spec is readable; generated design-spec fixture is controlled or regeneration is documented; ctx and negative fixtures exist. | EVD-1, EVD-2 |
| MV-2 | MS-2 | Inspect extractor output for execution-spec matrix rows and repeated IDs. | Matrix rows are classified as coverage evidence or references, not primary definitions; repeated IDs have explicit role policy. | EVD-3, EVD-4 |
| MV-3 | MS-2 | Inspect negative smoke diagnostics. | Dangling reference, duplicate primary definition, invalid range, and missing coverage fixtures produce expected diagnostics with source evidence. | EVD-5 |
| MV-4 | MS-3 | Inspect final R0 report and compatibility command results. | Report states approve, narrow, or reject CAND-4; production compatibility checks pass. | EVD-6, EVD-7 |

Section status: Complete

## 10. Execution Controls and Drift Management

| ID | Trigger | Required action | Owner | Evidence |
| --- | --- | --- | --- | --- |
| CTRL-1 | R0 work needs production `src/**` edits. | Pause and request project-owner deviation before editing. | Codex | DEV-* or rejection note in EVD-6 |
| CTRL-2 | Fixture cannot be controlled or regenerated. | Do not claim VAL-2; record blocker and request fixture decision. | Codex | EVD-2, EVD-6 |
| CTRL-3 | Matrix rows become primary definitions in prototype output. | Treat RISK-1 as unresolved; do not recommend R2 design-spec until fixed or narrowed. | Graph validation reviewer | EVD-3, EVD-6 |
| CTRL-4 | Relationship rules only work for one artifact family. | Recommend artifact-family-specific profile scope or reject generic graph profile. | Graph validation reviewer | EVD-4, EVD-6 |
| CTRL-5 | Compatibility checks fail. | Stop and resolve or revert experiment changes before MS-3 approval. | Markdown Trace maintainer | EVD-7 |

Deviation rules: Any production source edit, public API claim, source mutation behavior, or authoritative registry promotion requires a `DEV-*` record approved by the project owner before execution continues.

Pause or escalation conditions: Missing real execution spec access, uncontrolled generated design fixture, failed compatibility, ambiguous matrix classification, or graph profile decision deadlock pauses the current work package and escalates to the project owner.

Section status: Complete

## 11. Data, Schema, Config, and Contract Handling

| Change | Impact | Compatibility | Reversibility | Validation |
| --- | --- | --- | --- | --- |
| Private graph profile sketches | Provisional config used only by R0 experiments. | No production compatibility impact. | Delete or revise experiment files. | VAL-4, VAL-5 |
| Private extraction output shape | Provisional data format for evidence capture. | Not a public contract. | Delete or revise experiment files. | VAL-1, VAL-2 |
| R0 evidence report | Durable decision artifact under `docs/evidence/**`. | Additive documentation only. | Revert document changes. | VAL-5, VAL-6 |

N/A rationale: No production data store, public schema, public CLI contract, registry schema, package export, permission, or migration changes are approved in this R0.

Section status: Complete

## Layer 3: Validation, Release, and Handoff

## 12. Validation and Evidence Plan

| ID | Method | Claim verified | Timing | Owner | Evidence artifact |
| --- | --- | --- | --- | --- | --- |
| VAL-1 | Review / Measurement | Real execution spec extraction lists primary definitions, supplemental definitions, coverage rows, mentions, ranges, candidate edges, and diagnostics with no matrix-row false primary definitions. | Pre-merge | Codex | EVD-3 |
| VAL-2 | Review / Measurement | Generated design-spec extraction shows requirement, behavior, mechanism, and validation coverage paths or explicit gaps from a controlled fixture. | Pre-merge | Codex | EVD-2, EVD-3 |
| VAL-3 | Test / Review | `ctx://trace` table fixture proves heading-defined table references remain compatible and table-only definitions stay non-authoritative evidence candidates. | Pre-merge | Codex | EVD-1, EVD-3 |
| VAL-4 | Review | Graph profile sketch declares table roles, ID families, relationship rules, range rules, matrix semantics, and diagnostic classes. | Pre-merge | Graph validation reviewer | EVD-4 |
| VAL-5 | Test / Review | Smoke probes produce expected diagnostics for dangling reference, duplicate primary definition, invalid range endpoint, and matrix coverage gap. | Pre-merge | Codex | EVD-5 |
| VAL-6 | Test / Inspection | Existing `derive`, `derive-sidecar`, `validate`, build, and targeted R1 compatibility behavior remain unchanged. | Pre-merge | Markdown Trace maintainer | EVD-7 |

Section status: Complete

## 13. Review Plan

| ID | Reviewer | Review scope | Blocking? | Completion evidence |
| --- | --- | --- | --- | --- |
| REV-1 | CODEFACTORY artifact-profile reviewer | Fixture role policy, repeated IDs, matrix coverage semantics, generated design-spec fixture control. | Yes | Review note in EVD-6 |
| REV-2 | Markdown Trace maintainer | Experiment containment, production compatibility, no authoritative derive changes, public API absence. | Yes | Compatibility and path review in EVD-7 |
| REV-3 | Project owner | Final R0 recommendation and decision to proceed to R2 design-spec, narrow scope, or reject CAND-4. | Yes | MS-3 approval record in EVD-6 |

Approval conditions: MS-3 may approve R2 design-spec authoring only when VAL-1 through VAL-6 are complete, no production compatibility regression remains, and unresolved questions are either answered or explicitly routed into the next design artifact.

Section status: Complete

## 14. Rollout, Migration, Rollback, and Recovery

| ID | Action | Timing | Owner | Abort trigger | Evidence |
| --- | --- | --- | --- | --- | --- |
| REL-1 | Keep R0 prototype unshipped and private under `experiments/**`. | Entire execution | Codex | Any public CLI, package export, or production source change without deviation. | EVD-6, EVD-7 |
| REL-2 | Use R0 report only as design input after MS-3 approval. | After completion | Project owner | MS-3 rejection or unresolved blocker. | EVD-6 |

Rollback or containment plan: Delete or revert `experiments/profile-aware-graph-validation-r0/**` and R0 evidence artifacts. No production runtime state or user data is changed.

Recovery limit: Recovery is complete by source-control revert because R0 has no production rollout, migration, remote writes, or persistent runtime state.

Section status: Complete

## 15. Observability and Operational Readiness

| ID | Signal | Purpose | Consumer | Response |
| --- | --- | --- | --- | --- |
| OBS-1 | R0 command transcript and output summary in `EVD-3` through `EVD-5`. | Show extraction and smoke diagnostic behavior. | Reviewers | Approve, reject, or request revised R0 evidence. |
| OBS-2 | Compatibility command results in `EVD-7`. | Show production behavior remains unchanged. | Markdown Trace maintainer | Block MS-3 if compatibility fails. |
| OBS-3 | Final recommendation in `EVD-6`. | Show next design state. | Project owner | Approve R2 design-spec, narrow scope, or reject CAND-4. |

Operator actions: No production operator action is required. The executor records local command output and evidence artifacts for review.

Monitoring duration: N/A; no production-facing behavior is shipped.

Section status: Complete

## 16. Risks, Questions, Deviations, and Waivers

Risks:

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| RISK-1 | Matrix and repeated IDs may be misclassified as primary definitions. | False authority, duplicate graph facts, and misleading repair guidance. | Medium until VAL-1 evidence is produced. | Codex | Classify matrix and repeated-ID rows before graph fact creation; treat matrix primary-definition output as an unresolved proof failure. | VAL-1, CTRL-3, MS-2 |
| RISK-2 | Relationship vocabulary may not generalize across execution-spec and design-spec artifacts. | CAND-4 may need artifact-family-specific profiles instead of a generic graph profile. | Medium until VAL-4 evidence is produced. | Graph validation reviewer | Produce relationship glossary and example edges for both artifacts before final R0 recommendation. | VAL-4, CTRL-4, MS-2 |
| RISK-3 | Negative probes may not prove intended diagnostic semantics. | Smoke validation could pass because of parser accidents instead of graph-validation behavior. | Medium until VAL-5 evidence is produced. | Codex | Pair each negative fixture with expected diagnostic codes and source evidence. | VAL-5, MS-2 |

Open questions:

| ID | Question | Owner | Due date | Blocking? | Resolution path |
| --- | --- | --- | --- | --- | --- |
| Q-1 | Should graph roles live in a standalone graph profile, authoring-profile extension, or markdown-engine validation-profile extension? | Project owner | MS-3 | No for R0; yes before R2 design-spec approval. | Decide from EVD-4 profile-shape recommendation and EVD-6 final report. |
| Q-2 | Which repeated IDs are supplemental definitions, coverage rows, or duplicate failures? | CODEFACTORY artifact-profile reviewer | MS-2 | No for R0; yes before final R0 recommendation. | Decide from VAL-1, VAL-4, and the EVD-6 policy table. |

Approved deviations:

None. No approved departures from this execution spec exist; any future production source edit, public API claim, source mutation behavior, or authoritative registry promotion requires a project-owner-approved DEV-* record.

Approved waivers:

None. No review or approval exceptions exist; Section 9 milestone requirements and due milestone approvals are hard gates and are not waivable by WVR-*.

Section status: Complete

## 17. Execution Traceability Matrix

| Source, objective, or evidence-led claim | Change surfaces | Package boundaries | Work packages | Milestones | Controls | Validation | Review | Release or ops | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SRC-1, SRC-2, SRC-3, SRC-4, SRC-5 | SURF-1 through SURF-6 | PKG-1 through PKG-3 | WP-1 through WP-4 | MS-1 through MS-3 | CTRL-1 through CTRL-5 | VAL-1 through VAL-6 | REV-1 through REV-3 | REL-1, REL-2, OBS-1 through OBS-3 | EVD-1 through EVD-7 |
| OBJ-1 | SURF-3, SURF-4 | PKG-2 | WP-1 | MS-1 | CTRL-2 | VAL-1, VAL-2, VAL-3 | REV-1 | REL-1, OBS-1 | EVD-1, EVD-2 |
| OBJ-2 | SURF-1, SURF-5 | PKG-1 | WP-2 | MS-2 | CTRL-1, CTRL-3, CTRL-5 | VAL-1, VAL-2, VAL-6 | REV-2 | REL-1, OBS-1, OBS-2 | EVD-3, EVD-7 |
| OBJ-3, OBJ-4 | SURF-1, SURF-2 | PKG-2, PKG-3 | WP-3 | MS-2 | CTRL-3, CTRL-4 | VAL-4, VAL-5 | REV-1, REV-2 | REL-1, OBS-1 | EVD-4, EVD-5 |
| OBJ-5, OBJ-6 | SURF-2, SURF-5 | PKG-3 | WP-4 | MS-3 | CTRL-1, CTRL-5 | VAL-5, VAL-6 | REV-2, REV-3 | REL-2, OBS-2, OBS-3 | EVD-6, EVD-7 |
| Critical path hypothesis and first proving slice | SURF-1, SURF-3, SURF-4 | PKG-1, PKG-2 | WP-1, WP-2 | MS-1, MS-2 | CTRL-2, CTRL-3 | VAL-1, VAL-2, VAL-3 | REV-1, REV-2 | REL-1, OBS-1 | EVD-1, EVD-2, EVD-3 |
| RISK-1, RISK-2, RISK-3, Q-1, Q-2 | SURF-1, SURF-2, SURF-3 | PKG-1, PKG-2, PKG-3 | WP-2, WP-3, WP-4 | MS-2, MS-3 | CTRL-3, CTRL-4 | VAL-1, VAL-4, VAL-5 | REV-1, REV-3 | OBS-1, OBS-3 | EVD-3, EVD-4, EVD-5, EVD-6 |

Section status: Complete

## 18. Final Execution Gate

Entry gate: Approved only when the project owner records approval of this E0 execution spec, `DEP-1` is satisfied, and the executor has read `SRC-1` through `SRC-5`.

Milestone approval gate: `MS-1`, `MS-2`, and `MS-3` are non-waivable hard gates. Each milestone requires its named verifier, manual verification guide, required evidence, approval decision, and failure path before dependent work may proceed.

Completion gate: Complete only when VAL-1 through VAL-6 have evidence artifacts EVD-1 through EVD-7 and the final report states approve R2 design-spec, narrow scope, or reject CAND-4.

Release gate: No production release is authorized by this E0. Any R2 design-spec, production implementation, public CLI, or source mutation requires a separate approved artifact.

Handoff record: Handoff to R2 design-spec shall include this execution spec, `EVD-6`, `EVD-7`, resolved `Q-*` decisions, and any approved `DEV-*` records.

Final readiness state: Not ready.

Section status: Complete
