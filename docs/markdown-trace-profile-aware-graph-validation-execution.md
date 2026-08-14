# Markdown Trace Profile-Aware Graph Validation Execution Specification

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Profile-Aware Graph Validation Execution Specification |
| Status | Draft |
| Execution level | `E2` |
| Execution level justification | This execution delivers durable local CLI, library, schema, graph profile, diagnostic, report, repair-plan, fixture, and evidence contracts for production use. It is additive, local-only, read-only for source Markdown, and reversible, so it does not trigger `E3`; it is broader than `E1` because it creates new public package and CLI surfaces. |
| Author(s) | Codex |
| Executor(s) | Implementation agent or Markdown Trace maintainer |
| Reviewers | Project owner; Markdown Trace maintainer; markdown-engine contract reviewer; graph validation reviewer; CODEFACTORY artifact-profile reviewer; agent authoring workflow reviewer |
| Decision owner | Project owner |
| Target branch, release, or milestone | Implementation branch to be created from `origin/main` after this execution spec is approved; execution-spec branch `codex/profile-aware-graph-validation-execution-spec` |
| Last updated | 2026-08-13 |
| Related source docs | `docs/design/markdown-trace-profile-aware-graph-validation-design-spec.md`; `docs/evidence/profile-aware-graph-validation-r0-report.md`; `docs/design/markdown-trace-profile-aware-graph-validation-design-process.md`; `docs/markdown-trace-profile-aware-graph-validation-r0-execution.md` |
| Related tickets | `BEL-1290` through `BEL-1296`; implementation follow-up ticket to be assigned |

## 0. Execution Summary

Decision requested: Approve to execute

Approved outcome: Implement the R2-approved profile-aware graph validation capability from `SRC-1` and the R0 evidence recommendation from `SRC-2`, producing local deterministic trace evidence, graph profiles, graph validation results, graph reports, repair plans, CLI commands, library exports, fixtures, tests, and review evidence.

Execution approach: Execute a first vertical proving slice in `WP-1` that validates one execution-spec objective-to-evidence path and one missing-path failure without touching authoritative registry behavior, then deepen graph profile contracts in `WP-2`, trace evidence extraction in `WP-3`, graph validation in `WP-4`, agent-readable reporting and repair plans in `WP-5`, CLI and package exports in `WP-6`, and final compatibility, determinism, performance, and local-safety evidence in `WP-7`.

Entry condition: The project owner approves this `E2` execution spec, an implementation branch is created from the merged R2 design on `origin/main`, and no implementation begins by re-deciding source mutation, table-derived registry authority, universal graph vocabulary, or live integration scope.

Top risks or unknowns:

- `RISK-1`: Trace evidence or graph validation output could be mistaken for authoritative `EntityRegistry` or production `TraceGraph` output.
- `RISK-2`: Relationship and profile semantics could drift from the R2-approved execution-spec and design-spec contracts during implementation.
- `RISK-3`: Additive CLI and export work could regress current `validate`, `derive`, `derive-sidecar`, `migration-check`, or R1 link-backed behavior.

Section status: Complete

## Layer 1: Execution Basis

## 1. Source Authority and Scope

| ID | Source | Authority | Execution implication |
| --- | --- | --- | --- |
| SRC-1 | `docs/design/markdown-trace-profile-aware-graph-validation-design-spec.md` | Approved R2 design source for product, schema, profile, CLI, validation, repair-plan, compatibility, and safety scope. | Execute the section 13 and section 14 contracts without reopening source mutation, registry authority promotion, or universal vocabulary decisions. |
| SRC-2 | `docs/evidence/profile-aware-graph-validation-r0-report.md` | Final R0 experiment evidence and `pass-with-scope-controls` recommendation. | Carry forward deterministic table-first extraction, matrix-as-coverage policy, private smoke diagnostic families, and compatibility proof into production implementation. |
| SRC-3 | Current `src/markdowntrace/**`, `tests/**`, `fixtures/**`, and `package.json` on `origin/main` at merge commit `5a65b11`. | Repository implementation baseline for current command behavior, package exports, markdown-engine boundary, tests, and fixture scripts. | Keep new modules additive; preserve current authoritative `derive`, `derive-sidecar`, `validate`, migration check, and R1 link-backed tests. |
| SRC-4 | User request dated 2026-06-07: better validation for generated specs, graph-aware repair loops, agent-readable diagnostics, confidence that planning artifacts connect, and safer future Markdown authoring automation. | Product objective source for why this implementation should proceed after R0 and R2. | Prioritize graph-validation outputs, repair-plan readiness, and agent-readable diagnostics over source-writing automation. |
| SRC-5 | Execution-estimation pass for this planning artifact in `.worktrees/profile-aware-graph-validation-execution-spec` using proposed file `docs/markdown-trace-profile-aware-graph-validation-execution.md`. | Planning control source for drafting this execution spec only; result was `execution.action=proceed`, `planning.recommended=false`, `decompositionRecommended=false`, blast radius `low`, adjusted estimate 8 story points for the artifact draft. | Draft one execution spec rather than decomposing this planning artifact; `DEP-3` requires a separate implementation-scope estimate before coding starts. |
| SRC-6 | Implementation-scope estimate `.codefactory/execution-estimates/profile-aware-graph-validation-implementation-estimate.json`, decomposed WP-1 estimate `.codefactory/execution-estimates/profile-aware-graph-validation-wp1-estimate.json`, and project-owner approval in the current thread on 2026-08-13. | Current execution-entry authority for the bounded WP-1 child only. | The full scope returned `decompose-first`; WP-1 was then estimated as a depth-1 child and returned `execution.action=proceed`, `decompositionRecommended=false`, and low blast radius. Project-owner approval satisfies `DEP-3` for WP-1 but does not authorize `MS-1` passage or later work packages. |

In scope: Add production TypeScript modules for trace evidence extraction, graph profile loading, graph validation, graph reporting, graph repair plans, canonical serialization and hashing, CLI adapters, public package exports, built-in execution-spec and design-spec graph profiles, positive and negative fixtures, tests, performance evidence, compatibility evidence, and local-safety evidence.

Out of scope: Source Markdown mutation; applying repair plans; promoting table-derived facts into `EntityRegistry` or production `TraceGraph`; replacing markdown-engine structural validation profiles; claiming universal graph vocabulary beyond the two built-in artifact-family profiles; LLM, network, browser automation, MCP, Linear, GitHub, graph database, or live project-management integration behavior.

Definition of done: The implementation branch contains additive code, profiles, fixtures, tests, CLI behavior, library exports, reports, repair-plan outputs, and evidence artifacts that satisfy `VAL-0` through `VAL-13`, pass required reviews `REV-1` through `REV-7`, receive milestone approvals `MS-1` through `MS-4`, and preserve all current compatibility commands from `SRC-3`.

Re-decision boundaries: Any need for source mutation, registry authority promotion, a new universal relationship vocabulary, non-local execution, public schema incompatibility, or changing existing authoritative command behavior shall stop execution and return to the project owner and design-spec process before implementation continues.

Section status: Complete

## 2. Objectives and Non-Objectives

| ID | Statement | Completion horizon | Evidence |
| --- | --- | --- | --- |
| OBJ-1 | Produce schema-versioned `markdown-trace.trace-evidence.v1` artifacts from local Markdown using public markdown-engine APIs and profile-aware role classification. | Complete by `WP-3` before CLI finalization. | `VAL-1`, `VAL-3`, `VAL-10`, `EVD-1`, `EVD-3`, `EVD-10` |
| OBJ-2 | Provide standalone built-in and file-backed `markdown-trace.graph-profile.v1` contracts for execution-spec and design-spec artifact families. | Complete by `WP-2` before full graph validation work. | `VAL-2`, `VAL-5`, `VAL-6`, `EVD-2`, `EVD-5`, `EVD-6` |
| OBJ-3 | Validate trace evidence against graph profiles and emit stable graph diagnostics for unresolved references, duplicate primary definitions, invalid ranges, missing matrix coverage, missing required paths, and profile errors. | Complete by `WP-4` before report and repair-plan finalization. | `VAL-4`, `VAL-5`, `VAL-6`, `VAL-8`, `EVD-4`, `EVD-5`, `EVD-6`, `EVD-8` |
| OBJ-4 | Produce human-readable and agent-readable graph reports plus non-mutating repair plans tied to source ranges, diagnostics, affected IDs, confidence, and validation targets. | Complete by `WP-5` before final compatibility gate. | `VAL-7`, `VAL-9`, `EVD-7`, `EVD-9` |
| OBJ-5 | Expose additive CLI commands and library exports for trace evidence, graph validation, graph reports, and graph repair plans while preserving existing command behavior. | Complete by `WP-6` before final regression evidence. | `VAL-8`, `VAL-12`, `EVD-8`, `EVD-12` |
| OBJ-6 | Prove deterministic, performant, local-only, reversible execution with no source Markdown mutation and no authority-boundary breach. | Complete by `WP-7` before merge or release. | `VAL-10`, `VAL-11`, `VAL-12`, `VAL-13`, `EVD-10`, `EVD-11`, `EVD-12`, `EVD-13` |
| NG-1 | This execution will not mutate source Markdown or apply repair plans. | Applies through all work packages. | `VAL-9`, `VAL-13`, `EVD-9`, `EVD-13` |
| NG-2 | This execution will not promote table-derived graph evidence into authoritative `EntityRegistry` or production `TraceGraph` output. | Applies through all work packages. | `VAL-12`, `VAL-13`, `EVD-12`, `EVD-13` |
| NG-3 | This execution will not claim a universal graph vocabulary beyond the execution-spec and design-spec built-in graph profiles. | Applies through profile and validation work. | `VAL-2`, `VAL-5`, `VAL-6`, `EVD-2`, `EVD-5`, `EVD-6` |
| NG-4 | This execution does not include LLM calls, network services, browser automation, MCP connectors, graph databases, or live external-system mutation. | Applies through implementation, validation, and release. | `VAL-13`, `EVD-13` |
| NG-5 | This execution will not replace markdown-engine structural validation profiles or existing Markdown Trace registry validation. | Applies through rollout and compatibility gates. | `VAL-12`, `EVD-12` |

Section status: Complete

## 3. Ownership, Roles, and Decision Points

| Role or person | Responsibility | Required action |
| --- | --- | --- |
| Project owner | Approve execution start, milestone decisions, and final readiness. | Approve |
| Implementation agent or Markdown Trace maintainer | Execute work packages within assigned edit boundaries and produce evidence. | Execute |
| Markdown Trace maintainer | Review compatibility, package exports, CLI behavior, registry isolation, and rollback readiness. | Review |
| markdown-engine contract reviewer | Review public `@jasonbelmonti/markdown-engine` API usage and parser-boundary compliance. | Review |
| Graph validation reviewer | Review profile semantics, relationship direction, required path logic, diagnostics, and repair target quality. | Review |
| CODEFACTORY artifact-profile reviewer | Review execution-spec and design-spec table-role semantics against artifact intent. | Review |
| Agent authoring workflow reviewer | Review diagnostic and repair-plan usefulness for future graph-aware repair loops. | Review |
| Local operator | Run CLI evidence commands and capture milestone verification artifacts. | Operate |

Decision points: `MS-1` approves the first vertical proving slice before broader implementation; `MS-2` approves graph profile and validation semantics before CLI/report finalization; `MS-3` approves report and repair-plan usability before final regression evidence; `MS-4` approves final implementation readiness before merge or release.

Escalation path: If an implementation step requires out-of-scope authority promotion, source mutation, non-local execution, existing command behavior changes, public schema changes beyond `SRC-1`, or unresolved profile semantics, the executor shall stop the work package, record a `Q-*` or `DEV-*` candidate, and escalate to the project owner before continuing.

Section status: Complete

## 4. Constraints, Assumptions, and Dependencies

| ID | Type | Statement | Owner | Blocking? | Validation or resolution plan |
| --- | --- | --- | --- | --- | --- |
| CON-1 | Constraint | Extraction shall use only public `@jasonbelmonti/markdown-engine` package-root APIs. | Implementation agent | No | `VAL-13` inspects imports and dependency boundaries. |
| CON-2 | Invariant | Trace evidence and graph validation outputs shall remain schema-distinct from `EntityRegistry`, generated sidecar, and production `TraceGraph`. | Markdown Trace maintainer | No | `VAL-3`, `VAL-12`, and `VAL-13` verify schemas, output labels, and compatibility. |
| CON-3 | Invariant | Graph profiles shall be standalone semantic profiles that compose beside markdown-engine structural profiles. | Graph validation reviewer | No | `VAL-2` inspects loader behavior and built-in profile contracts. |
| CON-4 | Invariant | Matrix cells and coverage cells shall never create primary or supplemental definitions. | Graph validation reviewer | No | `VAL-5`, `VAL-6`, and negative fixtures verify matrix coverage behavior. |
| CON-5 | Constraint | Canonical JSON outputs shall be byte-stable for identical input, graph profile, package version, and runtime version. | Implementation agent | No | `VAL-10` repeats extraction and validation commands and compares hashes. |
| CON-6 | Constraint | The feature shall remain local-first and offline, with no secret access and no executable content evaluation. | Markdown Trace maintainer | No | `VAL-13` inspects dependencies and runtime behavior. |
| CON-7 | Invariant | Repair plans shall not apply edits, patch files, or write source Markdown. | Agent authoring workflow reviewer | No | `VAL-9` and `VAL-13` verify source hashes and output behavior. |
| ASM-1 | Assumption | Execution-spec and design-spec graph semantics in `SRC-1` are stable enough for initial built-in profiles. | Project owner | No | `MS-2` verifies profile semantics using `VAL-2`, `VAL-5`, and `VAL-6`. |
| ASM-2 | Assumption | The implementation can reuse R0 extractor knowledge without making private R0 scripts production dependencies. | Implementation agent | No | `VAL-13` checks production code imports from `experiments/**`; `REV-2` reviews boundaries. |
| DEP-1 | Dependency | Project owner approval of this execution spec is required before implementation begins. | Project owner | Yes | Entry gate in section 18 blocks execution until approval is recorded. |
| DEP-2 | Dependency | Node.js runtime shall satisfy the current package engine range `^20.19.0` or `>=22.12.0`; performance evidence uses documented Node.js 22.x conditions. | Local operator | No | `VAL-11` records Node version and benchmark conditions. |
| DEP-3 | Dependency | Implementation-scope execution estimation is required before coding begins. The full `SURF-1` through `SURF-12` estimate required decomposition; the bounded WP-1 child estimate subsequently returned `execution.action=proceed` with no decomposition recommendation and received project-owner approval on 2026-08-13. | Implementation agent | No | Treat `.codefactory/execution-estimates/profile-aware-graph-validation-wp1-estimate.json` as satisfying entry estimation for WP-1 only. Re-estimate any later milestone-authorized scope if its work-package boundary differs materially from the current execution specification. |

Section status: Complete

## Layer 2: Execution Plan

## 5. Evidence-Led Execution Model

Observable outcome: A local user or agent can run `markdown-trace graph-validate --file <generated-spec.md> --profile execution-spec` or `--profile design-spec` and receive deterministic graph validation output that proves required objective, work package, validation, evidence, requirement, behavior, mechanism, and acceptance paths are connected or reports source-backed blocking diagnostics plus non-mutating repair guidance.

Core value proposition: Generated specs become graph-verifiable before execution, so reviewers and agents can detect disconnected objectives, work packages, validation checkpoints, evidence records, requirements, mechanisms, and acceptance cases without promoting table-derived data to registry authority or writing source Markdown.

Critical path hypothesis: The smallest end-to-end path that proves the design is one Markdown execution-spec fixture parsed through markdown-engine, classified by a built-in graph profile into trace evidence, projected into graph validation relationships, checked for `OBJ -> WP -> VAL -> EVD` connectivity, and failed on a paired missing-path fixture with `markdown-trace.graph.missing_required_path`.

First proving slice: `WP-1` shall implement a minimal vertical slice with one execution-spec positive fixture, one missing-required-path negative fixture, minimal `trace-evidence`, `graph-profile`, and `graph-validation` APIs, and a test transcript proving the graph-validation result passes and fails as expected while current `derive` and `validate` behavior remains untouched.

Sequencing principle: Execute by risk retirement and progressive value. The first slice proves the authority boundary and graph path mechanics before full profile breadth, then contract and fixture work stabilizes semantics before broader extraction, validation, reporting, repair, CLI, performance, and release evidence.

Validation cadence: Each work package shall produce at least one `VAL-*` evidence artifact before the next milestone gate. Full `npm run build --silent`, targeted tests, and relevant fixture commands run at each milestone; full compatibility and performance evidence are required before `MS-4`.

Deferred completeness: Generalized universal graph vocabulary, source-writing automation, registry authority migration, external integration hooks, broader artifact-family profiles, and non-local repair loops are explicitly deferred until after this implementation ships and produces review evidence.

Primary risks and unknowns:

| ID | Risk or unknown | Why it matters | Owner | Evidence required to retire | Decision gate |
| --- | --- | --- | --- | --- | --- |
| RISK-1 | Trace evidence may be mistaken for authoritative registry output. | A false authority boundary could corrupt user expectations and future automation. | Markdown Trace maintainer | `VAL-3`, `VAL-12`, and `VAL-13` show schema names, report labels, exports, and compatibility remain separate. | `MS-1`, `MS-4` |
| RISK-2 | Profile semantics may drift from the R2 execution-spec and design-spec relationship contracts. | Incorrect relationship direction or required path logic would produce misleading diagnostics. | Graph validation reviewer | `VAL-2`, `VAL-5`, and `VAL-6` inspect built-in profiles, positive fixtures, and negative fixtures. | `MS-2` |
| RISK-3 | New CLI or package exports may regress current authoritative commands. | Existing users depend on current registry validation, derivation, generated sidecar, and migration behavior. | Markdown Trace maintainer | `VAL-12` runs build, full tests, fixture commands, migration check, and targeted R1 tests. | `MS-4` |
| RISK-4 | Output determinism or performance may fail on generated-spec-sized documents. | Agent workflows need stable JSON and practical runtime for repeated validation and repair loops. | Implementation agent | `VAL-10` byte-stability evidence and `VAL-11` 10,000-line median benchmark. | `MS-4` |

Section status: Complete

## 6. Change Surface Inventory

| ID | Surface | Change type | Owner | Read/write boundary | Review expectation |
| --- | --- | --- | --- | --- | --- |
| SURF-1 | `src/markdowntrace/trace-evidence/**` | Code / Contract | Implementation agent | Writable for new trace evidence models, extractor, canonical serialization helpers local to trace evidence, and tests. | `REV-2`, `REV-3`, `REV-5`, and `REV-7` review API, public engine boundary, determinism, and authority labels. |
| SURF-2 | `src/markdowntrace/graph-profile/**` | Code / Config / Contract | Implementation agent | Writable for graph profile model, loader, schema validation, built-in profiles, and profile diagnostics. | `REV-2` and `REV-3` review profile contract, selectors, relationship classes, and required paths. |
| SURF-3 | `src/markdowntrace/graph-validation/**` | Code / Contract | Implementation agent | Writable for graph projection, normalized relationships, required path evaluation, matrix checks, diagnostic model, and validation result schema. | `REV-3` reviews graph semantics and diagnostic stability. |
| SURF-4 | `src/markdowntrace/graph-repair/**` | Code / Contract | Implementation agent | Writable for non-mutating repair-plan model and generator. | `REV-4` reviews action quality, source evidence, confidence, and non-mutation boundary. |
| SURF-5 | `src/markdowntrace/reporting/**` | Code | Implementation agent | Writable only for additive graph report rendering and shared report utilities that do not change existing validation or migration report output. | `REV-4` and `REV-5` compare current report snapshots and graph report snapshots. |
| SURF-6 | `src/markdowntrace/cli.ts` and optional `src/markdowntrace/cli/**` | Code / API | Implementation agent | Writable for additive command parsing and command adapters; existing command flags and defaults are read-only unless a compatibility test proves no behavior change. | `REV-4` and `REV-5` review CLI UX, exit codes, operational failures, and current command compatibility. |
| SURF-7 | `src/markdowntrace/index.ts` and package export files | Code / API | Markdown Trace maintainer | Writable for public exports of new graph modules only. | `REV-5` reviews exported surface and forbidden deep-import requirements. |
| SURF-8 | `fixtures/profile-aware-graph-validation/**` | Test / Data | Implementation agent | Writable for built-in profile fixtures, positive and negative Markdown fixtures, generated expected JSON or report snapshots, and performance fixture source. | `REV-3` and `REV-5` review fixture realism, scope, and reproducibility. |
| SURF-9 | `tests/**` and `tests/support/**` | Test | Implementation agent | Writable for focused graph tests, CLI tests, snapshot tests, determinism tests, compatibility guards, and evidence helpers. | `REV-5` reviews test value and compatibility coverage. |
| SURF-10 | `docs/evidence/**` | Docs / Evidence | Local operator | Writable for implementation evidence reports, compatibility transcript, performance transcript, safety report, and milestone approval records. | `REV-5` and project owner inspect evidence before `MS-4`. |
| SURF-11 | Existing `src/markdowntrace/registry/**`, `src/markdowntrace/graph/**`, `src/markdowntrace/validation/**`, `src/markdowntrace/markdown/**`, and current fixtures | Code / Test | Markdown Trace maintainer | Read-only by default; writable only through a documented `DEV-*` candidate approved by project owner if additive graph work cannot proceed otherwise. | Any write triggers `CTRL-1`, `CTRL-3`, and `CTRL-8` review before merge. |
| SURF-12 | `package.json`, `tsconfig*.json`, and scripts | Config | Markdown Trace maintainer | Writable only for additive test scripts or build export changes required by the new CLI and library surfaces. | `REV-5` reviews no dependency, engine, or script regression. |

Section status: Complete

## 7. Agent-Focused Package Decomposition

Decomposition mission: Establish isolated internal package boundaries for trace evidence, graph profiles, graph validation, graph reporting, graph repair, CLI integration, and fixture evidence so implementation agents can work from explicit edit scopes while preserving the authority boundary and current registry behavior.

| ID | Unit | Ladder level | Mission | Observable value enabled | Risk retired | Public interface | Validation command | Promotion blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PKG-1 | `trace-evidence` | 2 | Extract and serialize profile-aware trace evidence from local Markdown. | `OBJ-1` | `RISK-1`, `RISK-4` | `extractTraceEvidence`, trace evidence model types, canonical JSON helpers. | `npm test -- tests/test_graph_trace_evidence.test.ts` | Product-specific ID families and CODEFACTORY artifact semantics block level 3 reuse. |
| PKG-2 | `graph-profile` | 2 | Load, validate, and expose standalone graph profiles and built-in profile contracts. | `OBJ-2` | `RISK-2` | `loadGraphProfile`, `getBuiltInGraphProfile`, graph profile model types. | `npm test -- tests/test_graph_profiles.test.ts` | Built-in execution-spec and design-spec policies are product-specific. |
| PKG-3 | `graph-validation` | 2 | Project trace evidence into graph validation results and stable diagnostics. | `OBJ-3` | `RISK-1`, `RISK-2`, `RISK-4` | `validateGraphEvidence`, validation result types, diagnostic codes. | `npm test -- tests/test_graph_validation.test.ts` | Required path rules are artifact-family-specific. |
| PKG-4 | `graph-reporting` | 2 | Render graph validation reports for humans and agents without changing current registry reports. | `OBJ-4` | `RISK-1` | `formatGraphValidationReport`, optional Mermaid or JSON projection helpers. | `npm test -- tests/test_graph_reporting.test.ts` | Report semantics depend on Markdown Trace schema and diagnostic models. |
| PKG-5 | `graph-repair` | 2 | Convert graph diagnostics into non-mutating repair-plan artifacts. | `OBJ-4` | `RISK-1` | `createGraphRepairPlan`, repair-plan model types. | `npm test -- tests/test_graph_repair_plan.test.ts` | Source-writing automation is explicitly out of scope. |
| PKG-6 | `cli-and-exports` | 2 | Expose additive CLI commands and package exports for graph validation features. | `OBJ-5` | `RISK-3` | `main` command dispatch, package-root exports in `src/markdowntrace/index.ts`. | `npm test -- tests/test_cli.test.ts tests/test_graph_cli.test.ts` | CLI is package-specific and cannot be reused outside Markdown Trace. |
| PKG-7 | `fixtures-tests-evidence` | 1 | Provide fixture, snapshot, performance, compatibility, and local-safety evidence harnesses. | `OBJ-6` | `RISK-3`, `RISK-4` | Test helpers and evidence scripts under `tests/support/**`; generated evidence in `docs/evidence/**`. | `npm test` | Evidence harness is repository-specific and not a reusable library. |

### Package Boundary Card: PKG-1

Ladder level: 2

Mission: Extract profile-aware trace evidence from local Markdown using public markdown-engine APIs and canonical serialization.

Value / risk trace:
- Observable value enabled: `OBJ-1`
- Risk retired: `RISK-1`, `RISK-4`
- Validation evidence: `VAL-1`, `VAL-3`, `VAL-10`, `VAL-13`
- Blocking unknowns: none after `MS-1`

Owns:
- Files/directories: `src/markdowntrace/trace-evidence/**`
- Concepts: trace evidence schema, source ranges, role classification output, source hashes, canonical ordering
- Runtime responsibilities: read Markdown input through caller-provided path or text, call markdown-engine public APIs, emit trace evidence results

Does not own:
- Explicitly excluded behavior: graph profile schema authority, graph required-path evaluation, registry validation, source mutation
- Responsibilities delegated elsewhere: profile loading to `PKG-2`, graph validation to `PKG-3`, CLI IO to `PKG-6`

Public interface:
- Exported types: `TraceEvidenceResult`, `TraceEvidenceOccurrence`, `TraceEvidenceDiagnostic`
- Exported functions/classes/components: `extractTraceEvidence`, `serializeTraceEvidence`
- Events/messages/contracts: `markdown-trace.trace-evidence.v1`
- CLI/API surface: consumed by `markdown-trace trace-evidence`

Allowed dependencies:
- May import: public `@jasonbelmonti/markdown-engine` package-root APIs, `PKG-2` profile model types, Node filesystem and crypto helpers through explicit adapters
- May call: markdown-engine `parse`, `normalize`, and `documentQueries`
- May read configuration from: explicit extractor options only

Forbidden dependencies:
- Must not import: markdown-engine private internals, `src/markdowntrace/registry/**`, `src/markdowntrace/graph/**`, `experiments/**`
- Must not call: network APIs, process exit, source mutation helpers
- Must not know about: CLI argument parsing, generated sidecar paths, registry entity IDs

State boundary:
- Owns state: in-memory trace evidence result
- Reads state: local Markdown text and active graph profile data
- Mutates state: no source state; may write only caller-requested output through `PKG-6`
- Persistence responsibility: none outside serialized artifacts

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/trace-evidence/**`, `tests/test_graph_trace_evidence.test.ts`, `fixtures/profile-aware-graph-validation/trace-evidence/**`
- Agent read-only paths: existing `registry`, `graph`, `validation`, `markdown` authoritative modules
- Required coordination before editing: shared serialization utilities or CLI integration require `PKG-6` coordination

Validation command: `npm test -- tests/test_graph_trace_evidence.test.ts`

Promotion blockers: Artifact-family semantics, profile coupling, and authority-boundary labels make this an internal package, not a reusable package candidate.

### Package Boundary Card: PKG-2

Ladder level: 2

Mission: Own graph profile schema, loader, built-in profiles, and profile diagnostics.

Value / risk trace:
- Observable value enabled: `OBJ-2`
- Risk retired: `RISK-2`
- Validation evidence: `VAL-2`, `VAL-5`, `VAL-6`
- Blocking unknowns: none; changes beyond `SRC-1` require escalation

Owns:
- Files/directories: `src/markdowntrace/graph-profile/**`, built-in profile fixture files
- Concepts: graph profile schema, artifact families, table roles, relationship classes, required paths, repeated-ID policies
- Runtime responsibilities: load built-in or file-backed profiles, validate schema, expose normalized profile model

Does not own:
- Explicitly excluded behavior: evidence extraction, graph validation execution, structural markdown-engine validation
- Responsibilities delegated elsewhere: extraction to `PKG-1`, validation to `PKG-3`

Public interface:
- Exported types: `GraphProfile`, `GraphProfileDiagnostic`, `RelationshipClass`, `RequiredPathRule`
- Exported functions/classes/components: `loadGraphProfile`, `getBuiltInGraphProfile`
- Events/messages/contracts: `markdown-trace.graph-profile.v1`
- CLI/API surface: `--profile <built-in-or-path>` resolution

Allowed dependencies:
- May import: YAML parser, Node filesystem helpers, internal path and hashing helpers
- May call: no markdown-engine parser calls
- May read configuration from: explicit profile path or built-in profile ID

Forbidden dependencies:
- Must not import: trace evidence runtime data, registry modules, CLI parser internals, experiments
- Must not call: network APIs or process exit
- Must not know about: source Markdown contents except through validation-time consumers

State boundary:
- Owns state: immutable loaded graph profile object
- Reads state: profile YAML or built-in definitions
- Mutates state: none
- Persistence responsibility: none outside optional profile hash metadata

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/graph-profile/**`, `tests/test_graph_profiles.test.ts`, `fixtures/profile-aware-graph-validation/profiles/**`
- Agent read-only paths: `src/markdowntrace/validation/**`, `src/markdowntrace/registry/**`, `src/markdowntrace/cli.ts`
- Required coordination before editing: public profile fields or built-in semantic changes require `REV-3`

Validation command: `npm test -- tests/test_graph_profiles.test.ts`

Promotion blockers: Profiles encode CODEFACTORY artifact-family behavior and are not project-agnostic.

### Package Boundary Card: PKG-3

Ladder level: 2

Mission: Validate trace evidence against graph profiles and emit stable graph validation results.

Value / risk trace:
- Observable value enabled: `OBJ-3`
- Risk retired: `RISK-1`, `RISK-2`, `RISK-4`
- Validation evidence: `VAL-4`, `VAL-5`, `VAL-6`, `VAL-8`, `VAL-10`
- Blocking unknowns: none after `MS-2`

Owns:
- Files/directories: `src/markdowntrace/graph-validation/**`
- Concepts: evidence graph projection, normalized relationships, diagnostics, required path results, matrix coverage results
- Runtime responsibilities: convert trace evidence and graph profile into validation result status and diagnostics

Does not own:
- Explicitly excluded behavior: profile loading, source parsing, report rendering, repair-plan suggestions, process exit
- Responsibilities delegated elsewhere: profile loading to `PKG-2`, extraction to `PKG-1`, reporting to `PKG-4`, repair to `PKG-5`

Public interface:
- Exported types: `GraphValidationResult`, `GraphDiagnostic`, `GraphRelationship`, `RequiredPathResult`
- Exported functions/classes/components: `validateGraphEvidence`
- Events/messages/contracts: `markdown-trace.graph-validation-result.v1`
- CLI/API surface: consumed by `markdown-trace graph-validate`

Allowed dependencies:
- May import: `PKG-1` model types, `PKG-2` model types, deterministic collection utilities
- May call: no filesystem reads except through caller-provided evidence loading adapter
- May read configuration from: graph profile object only

Forbidden dependencies:
- Must not import: registry validator, production `TraceGraph` derivation, report rendering internals, CLI parser internals
- Must not call: source mutation, network APIs, process exit
- Must not know about: generated sidecar authority or registry YAML structure

State boundary:
- Owns state: in-memory validation graph and diagnostics
- Reads state: trace evidence and graph profile inputs
- Mutates state: none outside local validation result construction
- Persistence responsibility: none outside serialized validation result

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/graph-validation/**`, `tests/test_graph_validation.test.ts`, `fixtures/profile-aware-graph-validation/negative/**`, `fixtures/profile-aware-graph-validation/validation/**`
- Agent read-only paths: `src/markdowntrace/registry/**`, `src/markdowntrace/graph/**`, current validation modules unless approved
- Required coordination before editing: diagnostic code changes require `PKG-4`, `PKG-5`, and `REV-3` coordination

Validation command: `npm test -- tests/test_graph_validation.test.ts`

Promotion blockers: Rule engine depends on Markdown Trace graph profile schema and artifact-specific path rules.

### Package Boundary Card: PKG-4

Ladder level: 2

Mission: Render graph validation reports that are readable by humans and agents.

Value / risk trace:
- Observable value enabled: `OBJ-4`
- Risk retired: `RISK-1`
- Validation evidence: `VAL-7`
- Blocking unknowns: none after graph validation result schema stabilizes

Owns:
- Files/directories: additive files in `src/markdowntrace/reporting/**`
- Concepts: graph validation Markdown reports, diagnostic summaries, relationship summaries, authority labels
- Runtime responsibilities: render reports from validation results without mutating results or existing reports

Does not own:
- Explicitly excluded behavior: changing current registry validation or migration report output
- Responsibilities delegated elsewhere: validation result construction to `PKG-3`, CLI output routing to `PKG-6`

Public interface:
- Exported types: report options local to graph reporting
- Exported functions/classes/components: `formatGraphValidationReport`
- Events/messages/contracts: Markdown report projection of `markdown-trace.graph-validation-result.v1`
- CLI/API surface: consumed by `markdown-trace graph-report` and `graph-validate --format markdown`

Allowed dependencies:
- May import: `PKG-3` result types and shared reporting formatting helpers
- May call: no graph validation recomputation unless caller requests report from source through `PKG-6`
- May read configuration from: explicit report format options

Forbidden dependencies:
- Must not import: registry loader or source parsing modules directly
- Must not call: source mutation or process exit
- Must not know about: CLI argument internals

State boundary:
- Owns state: generated report string only
- Reads state: graph validation result
- Mutates state: none
- Persistence responsibility: none; caller writes output

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/reporting/graph-*.ts`, `tests/test_graph_reporting.test.ts`, `fixtures/profile-aware-graph-validation/reports/**`
- Agent read-only paths: existing report format snapshots except for expected-output updates backed by compatibility review
- Required coordination before editing: shared report helper changes require `REV-5`

Validation command: `npm test -- tests/test_graph_reporting.test.ts`

Promotion blockers: Report shape is tied to Markdown Trace diagnostics and graph profile semantics.

### Package Boundary Card: PKG-5

Ladder level: 2

Mission: Produce non-mutating graph repair plans from blocking diagnostics.

Value / risk trace:
- Observable value enabled: `OBJ-4`
- Risk retired: `RISK-1`
- Validation evidence: `VAL-9`, `VAL-13`
- Blocking unknowns: none; source mutation is out of scope

Owns:
- Files/directories: `src/markdowntrace/graph-repair/**`
- Concepts: repair-plan schema, action kinds, confidence, validation target commands, non-mutating guidance
- Runtime responsibilities: convert diagnostics and source evidence into suggested actions

Does not own:
- Explicitly excluded behavior: applying edits, creating patches, rewriting Markdown, agent automation execution
- Responsibilities delegated elsewhere: diagnostic generation to `PKG-3`, CLI artifact writing to `PKG-6`

Public interface:
- Exported types: `GraphRepairPlan`, `GraphRepairAction`
- Exported functions/classes/components: `createGraphRepairPlan`
- Events/messages/contracts: `markdown-trace.graph-repair-plan.v1`
- CLI/API surface: consumed by `markdown-trace graph-repair-plan`

Allowed dependencies:
- May import: `PKG-1` evidence types and `PKG-3` diagnostic types
- May call: no filesystem writes except through caller
- May read configuration from: explicit repair-plan options

Forbidden dependencies:
- Must not import: source mutation utilities, patch libraries, registry mutation modules, external agent clients
- Must not call: network APIs, editor APIs, process exit
- Must not know about: future source-authoring automation internals

State boundary:
- Owns state: in-memory repair-plan result
- Reads state: validation result and trace evidence source ranges
- Mutates state: none
- Persistence responsibility: none outside caller-requested output

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/graph-repair/**`, `tests/test_graph_repair_plan.test.ts`, `fixtures/profile-aware-graph-validation/repair-plans/**`
- Agent read-only paths: source Markdown fixtures except fixture additions under `SURF-8`
- Required coordination before editing: diagnostic action mapping changes require `REV-4`

Validation command: `npm test -- tests/test_graph_repair_plan.test.ts`

Promotion blockers: It intentionally omits source-writing behavior and depends on Markdown Trace diagnostic schemas.

### Package Boundary Card: PKG-6

Ladder level: 2

Mission: Expose additive CLI commands and package-root exports while preserving existing commands.

Value / risk trace:
- Observable value enabled: `OBJ-5`
- Risk retired: `RISK-3`
- Validation evidence: `VAL-8`, `VAL-12`
- Blocking unknowns: none after command contract review

Owns:
- Files/directories: `src/markdowntrace/cli.ts`, optional `src/markdowntrace/cli/**`, `src/markdowntrace/index.ts`
- Concepts: command parsing, output path writing, exit codes, command usage text, package exports
- Runtime responsibilities: resolve CLI options, orchestrate packages, write requested artifacts, return stable exit codes

Does not own:
- Explicitly excluded behavior: business rules for graph validation, profile semantics, source mutation
- Responsibilities delegated elsewhere: core behavior to `PKG-1` through `PKG-5`

Public interface:
- Exported types: package-root exports from graph modules
- Exported functions/classes/components: `main`
- Events/messages/contracts: CLI commands `trace-evidence`, `graph-validate`, `graph-report`, `graph-repair-plan`
- CLI/API surface: public local CLI behavior

Allowed dependencies:
- May import: `PKG-1` through `PKG-5`, existing CLI helpers, Node filesystem helpers
- May call: package APIs and write requested output artifacts
- May read configuration from: explicit CLI flags only

Forbidden dependencies:
- Must not import: experiments, private parser internals, future external integration clients
- Must not call: network APIs or source mutation helpers
- Must not know about: graph validation internals beyond public package APIs

State boundary:
- Owns state: parsed command options and exit-code mapping
- Reads state: input file paths, profile paths, optional validation result paths
- Mutates state: generated output files only when user passes `--output` or equivalent report path
- Persistence responsibility: complete requested artifact writes; no partial source writes

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/cli.ts`, optional `src/markdowntrace/cli/**`, `src/markdowntrace/index.ts`, `tests/test_graph_cli.test.ts`, additive assertions in `tests/test_cli.test.ts`
- Agent read-only paths: existing command behavior tests unless explicitly updating expected usage text for additive commands
- Required coordination before editing: existing command parser changes require `REV-5`

Validation command: `npm test -- tests/test_cli.test.ts tests/test_graph_cli.test.ts`

Promotion blockers: This is the application CLI surface and is not reusable outside the package.

### Package Boundary Card: PKG-7

Ladder level: 1

Mission: Provide fixtures, tests, snapshots, performance harnesses, compatibility transcripts, and local-safety evidence.

Value / risk trace:
- Observable value enabled: `OBJ-6`
- Risk retired: `RISK-3`, `RISK-4`
- Validation evidence: `VAL-0` through `VAL-13`
- Blocking unknowns: none after `MS-4`

Owns:
- Files/directories: `fixtures/profile-aware-graph-validation/**`, graph tests under `tests/**`, evidence helpers under `tests/support/**`, generated evidence under `docs/evidence/**`
- Concepts: positive and negative fixtures, expected snapshots, benchmark inputs, compatibility command transcripts
- Runtime responsibilities: prove implementation claims with repeatable local commands

Does not own:
- Explicitly excluded behavior: production package code except test helper interfaces
- Responsibilities delegated elsewhere: core runtime behavior to `PKG-1` through `PKG-6`

Public interface:
- Exported types: test-only helper types if needed
- Exported functions/classes/components: test-only helpers
- Events/messages/contracts: evidence artifacts named `EVD-*`
- CLI/API surface: none

Allowed dependencies:
- May import: public package APIs and test framework utilities
- May call: local CLI commands, `npm` scripts, local helper scripts
- May read configuration from: fixture paths and temporary directories

Forbidden dependencies:
- Must not import: implementation private internals when public API coverage is required by the test
- Must not call: network APIs, external services, source mutation behavior
- Must not know about: user-local secrets or live project systems

State boundary:
- Owns state: temporary test directories and generated evidence artifacts
- Reads state: fixtures and package outputs
- Mutates state: temporary files and `docs/evidence/**` implementation evidence only
- Persistence responsibility: evidence artifacts needed for review

Agent ownership boundary:
- Agent editable paths: `fixtures/profile-aware-graph-validation/**`, `tests/test_graph_*.test.ts`, `tests/support/profile-aware-graph-validation/**`, `docs/evidence/profile-aware-graph-validation-*.md`
- Agent read-only paths: current fixture baselines unless compatibility evidence requires explicit snapshot review
- Required coordination before editing: any broad fixture rewrite requires `REV-5`

Validation command: `npm test`

Promotion blockers: Evidence harness is repository-specific.

Dependency direction rules:

- Allowed direction: `PKG-2` is independent; `PKG-1` may depend on `PKG-2` models; `PKG-3` may depend on `PKG-1` and `PKG-2`; `PKG-4` and `PKG-5` may depend on `PKG-1` and `PKG-3`; `PKG-6` may depend on `PKG-1` through `PKG-5`; `PKG-7` may depend on public package APIs and CLI behavior.
- Prohibited imports: graph packages shall not import `src/markdowntrace/registry/**`, production `src/markdowntrace/graph/**`, private markdown-engine internals, or `experiments/**`.
- Allowed cross-boundary communication: typed public package functions, explicit schema objects, and CLI option objects.
- Disallowed cross-boundary communication: shared mutable module state, private deep imports from peer packages, process-wide caches that affect determinism, or direct CLI parsing in core packages.

State boundary rules:

- Package-owned state: in-memory profile, evidence, graph validation, report, and repair-plan objects.
- Package-read state: local input Markdown, profile files, validation result files, and fixtures.
- Package-mutated state: only temporary test directories and requested generated output artifacts.
- Persistence ownership: `PKG-6` owns output writes; `PKG-7` owns review evidence files.

Reusable package candidates:

| Candidate | Current level | Reuse rationale | Required decoupling | Promotion trigger |
| --- | --- | --- | --- | --- |
| None | N/A | Current semantics are Markdown Trace and CODEFACTORY artifact-family specific. | Remove artifact-family assumptions, registry-adjacent terminology, CLI coupling, and product-specific diagnostics. | A later design approves cross-repository graph profile reuse. |

Coupling tripwires:

- Any graph package imports `src/markdowntrace/registry/**`, `src/markdowntrace/graph/**`, or `experiments/**`.
- A diagnostic code change forces unplanned edits across validation, report, repair, and CLI packages without coordination.
- CLI command parsing starts owning graph validation rules instead of delegating to package APIs.
- Fixture or snapshot updates hide a compatibility change to current authoritative commands.
- Package-level validation cannot run without full CLI integration when the package should be testable directly.
- Two work packages require concurrent writes to the same package path before the proving slice has stabilized public contracts.

N/A rationale: Not applicable; code, contracts, schemas, package exports, and agent-owned implementation modules are affected, so package decomposition is required.

Section status: Complete

## 8. Work Packages and Sequencing

Planning strategy: Use risk-retirement and progressive-value sequencing. `WP-1` proves the vertical path and authority boundary first; `WP-2` stabilizes profile contracts; `WP-3` and `WP-4` deepen extraction and validation; `WP-5` and `WP-6` expose repair, report, CLI, and library surfaces; `WP-7` proves readiness with compatibility, determinism, performance, and local-safety evidence.

Critical path hypothesis: A minimal execution-spec fixture can be parsed, classified, validated for `OBJ -> WP -> VAL -> EVD`, and failed on a paired missing-path fixture without source mutation or authoritative registry changes.

First proving slice: `WP-1` is the first proving slice and must be approved at `MS-1` before broader profile or CLI work proceeds.

Validation cadence: Each `WP-*` ends with targeted tests and evidence capture. `MS-1`, `MS-2`, and `MS-3` require human verification before advancing; `MS-4` requires the full validation and review plan.

Deferred completeness: Full profile breadth, report formatting, repair-plan action coverage, CLI polish, performance benchmarking, and release evidence are deferred until after `WP-1` proves the critical path.

| ID | Objective | Owner | Package boundary | Editable paths | Read-only paths | Inputs | Outputs | Dependencies | Observable value enabled | Risk retired | Milestone gate | Validation checkpoint | Completion criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WP-1 | Build the first vertical graph-validation slice for one execution-spec positive fixture and one missing-required-path negative fixture. | Implementation agent | `PKG-1`, `PKG-2`, `PKG-3`, `PKG-7` | `src/markdowntrace/trace-evidence/**`; `src/markdowntrace/graph-profile/**`; `src/markdowntrace/graph-validation/**`; `tests/test_graph_first_slice.test.ts`; `fixtures/profile-aware-graph-validation/first-slice/**` | `docs/design/markdown-trace-profile-aware-graph-validation-design-spec.md`; existing registry, graph, validation, CLI modules | `SRC-1`, `SRC-2`, current code baseline, `DEP-3` estimate result | Minimal APIs, minimal execution profile, positive and negative fixtures, targeted tests, `EVD-0` | `DEP-1`, `DEP-3` | Proves the critical path and produces reviewable graph pass and fail behavior. | `RISK-1`, `RISK-2` | `MS-1` | `VAL-0` | Positive fixture passes, negative fixture emits `markdown-trace.graph.missing_required_path`, public markdown-engine API use is inspected, and no existing authoritative command files are edited. |
| WP-2 | Complete graph profile contracts and built-in execution-spec and design-spec profiles. | Implementation agent | `PKG-2`, `PKG-7` | `src/markdowntrace/graph-profile/**`; `fixtures/profile-aware-graph-validation/**`; `tests/test_graph_profiles.test.ts` | `SRC-1` section 13 and section 14; R0 profile sketches under `experiments/**` | `WP-1` APIs and approved R2 profile contract | Profile loader, built-in profile definitions, malformed profile diagnostics, fixture coverage | `WP-1`, `MS-1` | Makes graph semantics explicit before broad validation behavior. | `RISK-2` | `MS-2` | `VAL-2`, `VAL-5`, `VAL-6` | Valid profiles load, malformed profiles fail with `markdown-trace.graph.profile_error`, and built-in relationship/path rules match `SRC-1`. |
| WP-3 | Complete trace evidence extraction and canonical `markdown-trace.trace-evidence.v1` serialization. | Implementation agent | `PKG-1`, `PKG-7` | `src/markdowntrace/trace-evidence/**`; `tests/test_graph_trace_evidence.test.ts`; `fixtures/profile-aware-graph-validation/trace-evidence/**` | `src/markdowntrace/markdown/**`; markdown-engine public API documentation from package usage; R0 extractor files read-only | `WP-1`, `WP-2` profile model | Extractor, source ranges, source and profile hashes, stable JSON snapshots | `WP-1`, `WP-2` | Produces agent-readable source-backed evidence for generated specs. | `RISK-1`, `RISK-4` | `MS-2` | `VAL-1`, `VAL-3`, `VAL-10`, `VAL-13` | Trace evidence captures headings, tables, prose, links, labels, ranges, roles, diagnostics, hashes, and deterministic order. |
| WP-4 | Complete graph validation engine, normalized relationships, required paths, matrix coverage checks, and diagnostics. | Implementation agent | `PKG-3`, `PKG-7` | `src/markdowntrace/graph-validation/**`; `tests/test_graph_validation.test.ts`; `fixtures/profile-aware-graph-validation/negative/**`; `fixtures/profile-aware-graph-validation/validation/**` | `SRC-1`; `PKG-1` and `PKG-2` public APIs; existing registry validator read-only | `WP-2`, `WP-3` | Graph validation result schema, required path results, matrix coverage results, diagnostic families | `WP-2`, `WP-3` | Produces pass/fail graph confidence for execution-spec and design-spec fixtures. | `RISK-1`, `RISK-2`, `RISK-4` | `MS-2` | `VAL-4`, `VAL-5`, `VAL-6`, `VAL-8`, `VAL-10` | Positive fixtures pass, negative fixtures emit expected stable diagnostics with source evidence, and JSON remains deterministic. |
| WP-5 | Add graph reports and non-mutating repair-plan generation. | Implementation agent | `PKG-4`, `PKG-5`, `PKG-7` | `src/markdowntrace/reporting/graph-*.ts`; `src/markdowntrace/graph-repair/**`; `tests/test_graph_reporting.test.ts`; `tests/test_graph_repair_plan.test.ts`; `fixtures/profile-aware-graph-validation/reports/**`; `fixtures/profile-aware-graph-validation/repair-plans/**` | `PKG-3` result schema; existing reporting output read-only | `WP-4` validation result contract | Markdown graph report snapshots, repair-plan JSON and Markdown projections, action mapping for blocking diagnostics | `WP-4`, `MS-2` | Makes diagnostics usable by humans and future agent repair loops. | `RISK-1` | `MS-3` | `VAL-7`, `VAL-9`, `VAL-13` | Reports include profile, relationships, diagnostics, raw evidence anchors, authority labels; repair plans are source-backed and non-mutating. |
| WP-6 | Add public CLI commands and package exports. | Implementation agent | `PKG-6`, `PKG-1`, `PKG-2`, `PKG-3`, `PKG-4`, `PKG-5` | `src/markdowntrace/cli.ts`; optional `src/markdowntrace/cli/**`; `src/markdowntrace/index.ts`; `tests/test_graph_cli.test.ts`; additive assertions in `tests/test_cli.test.ts` | Existing CLI behavior and tests; package scripts | `WP-3`, `WP-4`, `WP-5` package APIs | `trace-evidence`, `graph-validate`, `graph-report`, `graph-repair-plan` commands, exit-code behavior, package-root exports | `WP-5` | Provides durable local user and agent entry points. | `RISK-3` | `MS-3` | `VAL-8`, `VAL-12`, `VAL-13` | New commands return `0`, `1`, or `2` as specified, existing commands pass unchanged, and exports avoid private deep imports. |
| WP-7 | Capture final compatibility, determinism, performance, local-safety, review, and release evidence. | Local operator and implementation agent | `PKG-7`, all packages for fixes only | `tests/support/profile-aware-graph-validation/**`; `docs/evidence/profile-aware-graph-validation-*.md`; targeted fixes in prior package paths after owner coordination | All source authority and implementation outputs | `WP-1` through `WP-6` | Evidence reports, command transcripts, benchmark results, local-safety report, milestone approval record | `WP-6`, `MS-3` | Proves the implementation is fit to merge and operate locally. | `RISK-1`, `RISK-3`, `RISK-4` | `MS-4` | `VAL-10`, `VAL-11`, `VAL-12`, `VAL-13` | All validation commands pass, evidence artifacts are captured, reviews are complete, rollback is executable, and final readiness is approved. |

Execution sequence:

1. Complete `WP-1` and stop at `MS-1` for human verification.
2. Complete `WP-2`, `WP-3`, and `WP-4` serially until profile, evidence, and validation contracts stabilize, then stop at `MS-2`.
3. Complete `WP-5` after validation result schema is stable, complete `WP-6` after `WP-5` exposes the report and repair-plan APIs needed for CLI integration, then stop at `MS-3`.
4. Complete `WP-7`, resolve review findings, and stop at `MS-4` before merge or release.

Parallelization rules: No parallel implementation is allowed before `MS-1`. After `MS-1`, `WP-2` and `WP-3` may proceed in limited parallel only if `PKG-2` public profile model changes are coordinated daily and no shared files are edited concurrently. `WP-5` starts only after `WP-4` freezes the validation result schema. `WP-6` starts only after `WP-5` exposes the report and repair-plan APIs needed for CLI integration. `WP-7` begins only after `WP-6` is complete and `MS-3` is approved.

Integration points: `WP-1` integrates minimal contracts; `WP-2` freezes profile shape; `WP-4` freezes validation result and diagnostic shape; `WP-6` integrates public CLI and exports; `WP-7` integrates final evidence and release readiness.

Coordination triggers: Any change to schema version fields, diagnostic codes, relationship class names, required path semantics, CLI flags, exit-code mapping, shared reporting helpers, package-root exports, or existing authoritative command behavior requires coordination with the owning `PKG-*` boundary and review under `REV-3`, `REV-4`, or `REV-5`.

Section status: Complete

## 9. Milestone Gates and Manual Verification

| ID | Gate objective | Covered work | Due point | Human verifier | Prerequisites | Review gate | Required evidence | Approval decision | Failure path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MS-1 | Approve the first vertical graph-validation proving slice. | `OBJ-1`, `OBJ-2`, `OBJ-3`, `SURF-1`, `SURF-2`, `SURF-3`, `SURF-8`, `SURF-9`, `PKG-1`, `PKG-2`, `PKG-3`, `PKG-7`, `WP-1` | Before `WP-2` starts | Project owner and graph validation reviewer | `VAL-0` for the minimal proving slice and `DEP-3` implementation estimate complete | `REV-1`, `REV-2`, `REV-3`, `REV-7` | `EVD-0` | Approve, reject, or conditional approval with named follow-up | Stop broader implementation; fix the proving slice, rerun implementation estimation, or return to design if the authority boundary or path model fails. |
| MS-2 | Approve graph profile, trace evidence, and validation contract readiness. | `OBJ-1`, `OBJ-2`, `OBJ-3`, `SURF-1`, `SURF-2`, `SURF-3`, `SURF-8`, `SURF-9`, `PKG-1`, `PKG-2`, `PKG-3`, `PKG-7`, `WP-2`, `WP-3`, `WP-4` | Before `WP-5` or full CLI finalization | Markdown Trace maintainer, markdown-engine contract reviewer, and graph validation reviewer | `VAL-2`, `VAL-3`, `VAL-4`, `VAL-5`, `VAL-6`, `VAL-10`, `VAL-13` | `REV-2`, `REV-3`, `REV-7` | `EVD-2`, `EVD-3`, `EVD-4`, `EVD-5`, `EVD-6`, `EVD-10`, `EVD-13` | Approve, reject, or conditional approval with bounded remediation | Stop report, repair, and CLI work until profile and validation contracts are corrected. |
| MS-3 | Approve graph report, repair-plan, CLI, and export usability. | `OBJ-4`, `OBJ-5`, `SURF-4`, `SURF-5`, `SURF-6`, `SURF-7`, `SURF-9`, `PKG-4`, `PKG-5`, `PKG-6`, `WP-5`, `WP-6` | Before `WP-7` final evidence pass | Project owner, agent authoring workflow reviewer, and Markdown Trace maintainer | `VAL-7`, `VAL-8`, `VAL-9`, `VAL-12`, `VAL-13` | `REV-4`, `REV-5` | `EVD-7`, `EVD-8`, `EVD-9`, `EVD-12`, `EVD-13` | Approve, reject, or conditional approval with required fixes | Stop final readiness evidence; fix report, repair, CLI, export, or compatibility issues. |
| MS-4 | Approve final implementation readiness before merge or release. | `OBJ-1` through `OBJ-6`, all `SURF-*`, all `PKG-*`, `WP-1` through `WP-7` | Before merge or release activation | Project owner and Markdown Trace maintainer | `VAL-0` through `VAL-13`, all blocking reviews complete | `REV-1` through `REV-7` | `EVD-0` through `EVD-13` plus milestone approval record | Approve, reject, or conditional approval with explicit non-blocking follow-up | Do not merge or release; contain by reverting additive graph changes or returning to the failed work package. |

Manual verification guide:

| Step ID | Milestone | Operator action | Expected result | Evidence artifact |
| --- | --- | --- | --- | --- |
| MV-1 | MS-1 | Run the minimal positive execution-spec graph validation test and inspect the JSON result. | Result status is `pass`, includes `markdown-trace.graph-validation-result.v1`, and shows `OBJ -> WP -> VAL -> EVD` connectivity. | `EVD-0` |
| MV-2 | MS-1 | Run the paired missing-required-path negative fixture and inspect the import boundary evidence. | Command or test returns graph failure with `markdown-trace.graph.missing_required_path`, source-backed affected IDs, no authoritative command edits, and only public markdown-engine imports. | `EVD-0` |
| MV-3 | MS-2 | Inspect built-in execution-spec and design-spec graph profiles against `SRC-1` section 13. | Profiles declare expected ID families, repeated-ID policies, matrix semantics, relationship classes, and required paths. | `EVD-2`, `EVD-5`, `EVD-6` |
| MV-4 | MS-2 | Inspect trace evidence snapshots for authority labels, source hashes, profile hashes, source ranges, and deterministic ordering. | Trace evidence schema is `markdown-trace.trace-evidence.v1`, labels authority as `trace-evidence`, and excludes registry authority. | `EVD-3`, `EVD-10`, `EVD-13` |
| MV-5 | MS-3 | Run graph report generation for a failing fixture and inspect report content. | Report names profile, schema, normalized relationships, raw evidence anchors, diagnostics, and non-authority status. | `EVD-7` |
| MV-6 | MS-3 | Run repair-plan generation for blocking diagnostics and inspect action entries. | Repair plan is `markdown-trace.graph-repair-plan.v1`, contains confidence, source ranges, validation target commands, and no source edit operation. | `EVD-9`, `EVD-13` |
| MV-7 | MS-3 | Run CLI pass, graph-fail, and operational-fail probes. | Exit codes are `0`, `1`, and `2` according to the command contract; existing command usage remains valid. | `EVD-8`, `EVD-12` |
| MV-8 | MS-4 | Run the full compatibility command set and targeted R1 tests. | Build, full tests, fixture derive, fixture validate, migration check, and targeted R1 tests pass unchanged. | `EVD-12` |
| MV-9 | MS-4 | Run determinism, performance, and local-safety evidence capture. | JSON hashes are byte-stable, 10,000-line median duration is within threshold, and no network, source mutation, registry promotion, or executable content evaluation occurs. | `EVD-10`, `EVD-11`, `EVD-13` |

Section status: Complete

## 10. Execution Controls and Drift Management

| ID | Trigger | Required action | Owner | Evidence |
| --- | --- | --- | --- | --- |
| CTRL-1 | Any implementation path attempts to promote trace evidence into `EntityRegistry`, generated sidecar, or production `TraceGraph`. | Stop the work package, record a `DEV-*` candidate, and escalate to the project owner; do not continue without a separate design. | Markdown Trace maintainer | `EVD-12`, `EVD-13`, review note under `REV-5` |
| CTRL-2 | Any implementation path writes, patches, rewrites, or applies changes to source Markdown. | Stop immediately and remove the source mutation path; if mutation is required, return to design for a separate source-authoring automation plan. | Project owner | `EVD-9`, `EVD-13` |
| CTRL-3 | Relationship classes, required paths, repeated-ID policies, matrix semantics, or diagnostic codes drift from `SRC-1`. | Pause the affected work package and require `REV-3` approval or design-spec revision before continuing. | Graph validation reviewer | `EVD-2`, `EVD-4`, `EVD-5`, `EVD-6` |
| CTRL-4 | CLI parser changes alter existing `validate`, `derive`, `derive-sidecar`, or `migration-check` behavior. | Revert or isolate the parser change unless `VAL-12` compatibility evidence proves no behavior change. | Markdown Trace maintainer | `EVD-8`, `EVD-12` |
| CTRL-5 | Repeated runs over identical inputs produce different canonical JSON bytes. | Block merge, identify unstable ordering or metadata, and fix before `MS-4`. | Implementation agent | `EVD-10` |
| CTRL-6 | 10,000-line graph validation median exceeds 10 seconds after one focused optimization pass. | Stop release readiness and escalate to project owner for scope reduction, optimization approval, or conditional deferral. | Implementation agent | `EVD-11` |
| CTRL-7 | A new dependency, network call, live integration, or secret access appears in the implementation. | Remove it or escalate as out-of-scope; no merge before `REV-5` and `VAL-13` clear the finding. | Markdown Trace maintainer | `EVD-13` |
| CTRL-8 | Two work packages need concurrent writes to the same file or package boundary before its contract is stable. | Serialize the work, assign a single owner for the shared file, and update package boundary notes before continuing. | Implementation agent | Updated work-package note and `REV-2` approval |
| CTRL-9 | Implementation-scope execution estimation is missing, recommends decomposition, or does not return `execution.action=proceed`. | Do not start coding. If the full scope requires decomposition, use an existing source-authorized work-package boundary, estimate that child with the required decomposition depth, record the result here, and obtain project-owner approval before proceeding. | Implementation agent | Full-scope and child-scope estimate artifacts, project-owner approval, and `MS-1` evidence record |

Deviation rules: Any approved departure from this execution spec shall be recorded as `DEV-*` with owner, approver, rationale, impact, and evidence in section 16 before merge. Deviations are not valid for source mutation, registry authority promotion, live integrations, or unsafe CLI compatibility changes unless a new design approval supersedes this spec.

Pause or escalation conditions: Pause when `CTRL-1` through `CTRL-9` trigger, a blocking `Q-*` appears, a milestone due point arrives without required evidence, a blocking review rejects the current behavior, or a validation command required by section 12 cannot be run.

Section status: Complete

## 11. Data, Schema, Config, and Contract Handling

| Change | Impact | Compatibility | Reversibility | Validation |
| --- | --- | --- | --- | --- |
| `markdown-trace.trace-evidence.v1` schema | Adds durable trace evidence JSON for definitions, supplemental definitions, coverage rows, mentions, ranges, candidate edges, diagnostics, source hashes, profile hashes, and run metadata. | Additive; distinct from registry YAML and current validation result. | Revert `PKG-1`, exports, fixtures, and CLI command. | `VAL-1`, `VAL-3`, `VAL-10`, `VAL-13` |
| `markdown-trace.graph-profile.v1` schema and built-in profiles | Adds standalone semantic graph profile config for execution-spec and design-spec artifact families. | Additive; composes beside markdown-engine structural validation profiles. | Revert `PKG-2`, built-in profiles, and fixtures. | `VAL-2`, `VAL-5`, `VAL-6` |
| `markdown-trace.graph-validation-result.v1` schema | Adds graph validation status, nodes, relationships, required path results, matrix coverage results, diagnostics, summary, and hashes. | Additive; does not alter current `ValidationResult`. | Revert `PKG-3`, CLI command, and exports. | `VAL-4`, `VAL-5`, `VAL-6`, `VAL-8`, `VAL-10` |
| `markdown-trace.graph-repair-plan.v1` schema | Adds non-mutating repair guidance for blocking graph diagnostics. | Additive; does not authorize source-writing automation. | Revert `PKG-5`, CLI command, and exports. | `VAL-9`, `VAL-13` |
| CLI commands `trace-evidence`, `graph-validate`, `graph-report`, and `graph-repair-plan` | Adds public local CLI surfaces and exit-code behavior. | Additive; current commands and scripts stay unchanged. | Remove command dispatch and related exports. | `VAL-8`, `VAL-12` |
| Package-root exports for graph modules | Adds library API access for graph profile, evidence, validation, report, and repair modules. | Additive; no private deep imports required for new consumers. | Remove export lines and dependent docs/tests. | `VAL-8`, `VAL-12`, `REV-5` |
| Evidence and fixture files under `fixtures/profile-aware-graph-validation/**` and `docs/evidence/**` | Adds local fixtures, snapshots, reports, transcripts, and benchmark evidence. | Additive; current fixtures remain unchanged unless explicitly reviewed. | Remove additive fixture and evidence files. | `VAL-0` through `VAL-13` |

N/A rationale: No live data store, database schema, auth permission, external event, customer data migration, backfill, or one-way config migration is introduced. The affected contracts are local package schemas, CLI flags, built-in profile config, fixtures, and evidence artifacts.

Section status: Complete

## Layer 3: Validation, Release, and Handoff

## 12. Validation and Evidence Plan

| ID | Method | Claim verified | Timing | Owner | Evidence artifact |
| --- | --- | --- | --- | --- | --- |
| VAL-0 | Test / Inspection | The first proving slice validates one minimal execution-spec `OBJ -> WP -> VAL -> EVD` path, fails one missing-required-path fixture, uses only public markdown-engine APIs, and does not edit authoritative command files. | Before `MS-1`; pre-merge | Implementation agent, markdown-engine contract reviewer, and graph validation reviewer | `EVD-0`: first proving slice transcript under `docs/evidence/profile-aware-graph-validation-first-slice.md` |
| VAL-1 | Test / Snapshot | Trace evidence extraction captures headings, tables, prose, `ctx://trace` links, raw labels, ranges, source ranges, roles, diagnostics, and run metadata. | Pre-merge | Implementation agent | `EVD-1`: trace evidence extraction test transcript and snapshots under `docs/evidence/profile-aware-graph-validation-trace-evidence.md` |
| VAL-2 | Test / Inspection | Graph profile loader accepts valid execution-spec and design-spec profiles, rejects malformed profiles with stable diagnostics, and exposes the R2 profile policies. | Pre-merge | Graph validation reviewer | `EVD-2`: graph profile contract report under `docs/evidence/profile-aware-graph-validation-profile-contracts.md` |
| VAL-3 | Snapshot | Trace evidence result uses `markdown-trace.trace-evidence.v1`, required fields, stable ordering, source hashes, profile metadata, and non-authority labels. | Pre-merge | Implementation agent | `EVD-3`: trace evidence schema snapshot report under `docs/evidence/profile-aware-graph-validation-trace-schema.md` |
| VAL-4 | Test | Negative fixtures emit expected unresolved reference, duplicate primary definition, invalid range endpoint, missing matrix coverage, missing required path, and profile error diagnostics. | Pre-merge | Implementation agent | `EVD-4`: negative diagnostic report under `docs/evidence/profile-aware-graph-validation-negative-diagnostics.md` |
| VAL-5 | Test / Manual | Execution-spec positive and negative fixtures validate or fail `OBJ -> WP -> VAL -> EVD` paths while matrix cells remain non-authoritative. | Pre-merge | Graph validation reviewer | `EVD-5`: execution-spec graph fixture report under `docs/evidence/profile-aware-graph-validation-execution-spec-fixtures.md` |
| VAL-6 | Test / Manual | Design-spec positive and negative fixtures validate or fail `REQ -> FLOW/FUNC -> TECH/ACC -> VAL` coverage paths. | Pre-merge | CODEFACTORY artifact-profile reviewer | `EVD-6`: design-spec graph fixture report under `docs/evidence/profile-aware-graph-validation-design-spec-fixtures.md` |
| VAL-7 | Snapshot / Inspection | Graph validation report includes normalized relationship classes, raw evidence anchors, diagnostic summary, source evidence, and authority labels. | Pre-merge | Agent authoring workflow reviewer | `EVD-7`: graph report snapshot review under `docs/evidence/profile-aware-graph-validation-report-output.md` |
| VAL-8 | CLI test | New CLI commands expose read-only behavior, schema envelopes, pass/fail/operational exit codes, output path handling, and package-root exports. | Pre-merge | Markdown Trace maintainer | `EVD-8`: graph CLI transcript under `docs/evidence/profile-aware-graph-validation-cli.md` |
| VAL-9 | Test / Inspection | Repair-plan output is non-mutating, source-backed, confidence-labeled, tied to validation targets, and covers blocking diagnostic action kinds. | Pre-merge | Agent authoring workflow reviewer | `EVD-9`: repair-plan evidence under `docs/evidence/profile-aware-graph-validation-repair-plan.md` |
| VAL-10 | Determinism test | Repeated runs over identical inputs produce byte-identical trace evidence and graph validation JSON artifacts. | Pre-merge | Implementation agent | `EVD-10`: determinism report under `docs/evidence/profile-aware-graph-validation-determinism.md` |
| VAL-11 | Measurement | A generated 10,000-line Markdown fixture validates with median duration 10 seconds or less across three consecutive runs under documented Node.js 22.x local benchmark conditions. | Pre-merge | Local operator | `EVD-11`: performance report under `docs/evidence/profile-aware-graph-validation-performance.md` |
| VAL-12 | Regression test | `npm run build --silent`, `npm test`, `npm run derive:fixture`, `npm run validate:fixture`, `npm run migration:check`, and targeted R1 tests pass. | Pre-merge | Markdown Trace maintainer | `EVD-12`: compatibility transcript under `docs/evidence/profile-aware-graph-validation-compatibility.md` |
| VAL-13 | Inspection / Local safety test | Implementation uses public engine APIs, performs no network calls, evaluates no executable content, performs no live mutation, does not mutate source Markdown, and does not promote graph evidence to registry authority. | Pre-merge | Markdown Trace maintainer and markdown-engine contract reviewer | `EVD-13`: local-safety and authority-boundary report under `docs/evidence/profile-aware-graph-validation-local-safety.md` |

Section status: Complete

## 13. Review Plan

| ID | Reviewer | Review scope | Blocking? | Completion evidence |
| --- | --- | --- | --- | --- |
| REV-1 | Project owner | Confirm execution still matches user goals, R2 approval, non-objectives, and milestone gates. | Yes | Comment or review note approving `MS-1` and `MS-4`; referenced in milestone record. |
| REV-2 | Markdown Trace maintainer | Package boundaries, edit scopes, dependency direction, package-root exports, and no private deep imports. | Yes | Review approval tied to `PKG-1` through `PKG-7` and `EVD-12`. |
| REV-3 | Graph validation reviewer | Graph profile semantics, relationship direction, required paths, matrix semantics, repeated-ID policy, diagnostic codes, and negative fixtures. | Yes | Review approval tied to `EVD-2`, `EVD-4`, `EVD-5`, and `EVD-6`. |
| REV-4 | Agent authoring workflow reviewer | Graph report and repair-plan usefulness, source-backed diagnostics, action confidence, and non-mutating guidance. | Yes | Review approval tied to `EVD-7` and `EVD-9`. |
| REV-5 | Markdown Trace maintainer | CLI behavior, existing command compatibility, deterministic serialization, performance, local safety, and rollback plan. | Yes | Review approval tied to `EVD-8`, `EVD-10`, `EVD-11`, `EVD-12`, and `EVD-13`. |
| REV-6 | Final implementation reviewer or consensus review | Whole-diff review against this execution spec, source design, milestone evidence, and review boundary. | Yes | Final review verdict before `MS-4`; all blocker and major findings resolved or validly waived. |
| REV-7 | markdown-engine contract reviewer | Public `@jasonbelmonti/markdown-engine` package-root API usage, parser-boundary compliance, no private parser imports, and no structural-profile replacement behavior. | Yes | Review approval tied to `CON-1`, `SURF-1`, `VAL-0`, `VAL-13`, `EVD-0`, and `EVD-13`. |

Approval conditions: Merge or release approval requires `REV-1` through `REV-7` complete, `MS-1` through `MS-4` approved at their due points, `VAL-0` through `VAL-13` evidence captured, no open blocking `Q-*`, no unapproved `DEV-*`, no unapproved `WVR-*`, and no unresolved blocker or major review finding inside the stated scope.

Section status: Complete

## 14. Rollout, Migration, Rollback, and Recovery

| ID | Action | Timing | Owner | Abort trigger | Evidence |
| --- | --- | --- | --- | --- | --- |
| REL-1 | Land additive graph modules, fixtures, tests, and evidence on an implementation branch from `origin/main`. | During implementation before merge | Implementation agent | Any `CTRL-1`, `CTRL-2`, `CTRL-3`, `CTRL-7`, or `CTRL-9` trigger. | `EVD-0` through `EVD-9`, `EVD-13` |
| REL-2 | Run full validation, compatibility, determinism, performance, and local-safety evidence before merge. | Before `MS-4` | Local operator | Any required `VAL-*` fails or cannot run. | `EVD-10`, `EVD-11`, `EVD-12`, `EVD-13` |
| REL-3 | Merge only after project owner and Markdown Trace maintainer approve `MS-4`. | Before release activation | Project owner | Missing approval, unresolved blocker, compatibility regression, or authority-boundary violation. | `MS-4` approval record and `REV-6` verdict |
| REL-4 | Contain by reverting or disabling additive graph modules and CLI commands if post-merge validation reveals a blocking regression. | Post-merge if needed | Markdown Trace maintainer | Current authoritative command failure, source mutation, registry promotion, determinism failure, or performance threshold miss beyond approved limits. | Rollback PR or revert transcript tied to `EVD-12` and `EVD-13` |

Rollback or containment plan: Because the implementation is additive and introduces no data migration, source mutation, live service, or registry schema change, rollback is to revert additive directories, CLI command branches, exports, fixtures, tests, and evidence. Existing `derive`, `derive-sidecar`, `validate`, migration check, registry, and generated sidecar behavior remain the containment baseline.

Recovery limit: Recovery is limited to local package revert or disabling new graph commands. If existing authoritative command behavior regresses after merge, recovery shall prioritize restoring `VAL-12` command behavior before reintroducing graph validation features.

Section status: Complete

## 15. Observability and Operational Readiness

| ID | Signal | Purpose | Consumer | Response |
| --- | --- | --- | --- | --- |
| OBS-1 | Graph validation exit code `0`, `1`, or `2`. | Distinguish pass, graph diagnostic failure, and operational failure. | CLI user, CI, agent | Treat `1` as repairable graph failure and `2` as operator or input failure. |
| OBS-2 | Diagnostic summary by code, severity, profile rule ID, affected IDs, and source ranges. | Show why validation failed and which repair action is relevant. | Reviewer, agent | Inspect report or repair plan before editing any source manually. |
| OBS-3 | Input Markdown SHA-256 and graph profile SHA-256. | Prove evidence corresponds to specific source and semantic profile. | Reviewer, CI, maintainer | Re-run validation when either hash changes. |
| OBS-4 | Schema version fields for trace evidence, graph profile, graph validation result, and repair plan. | Support stable agent parsing and compatibility review. | Agent, maintainer | Block consumers from treating unknown major schemas as compatible without review. |
| OBS-5 | Command duration, input line count, Node version, package version, and benchmark environment. | Detect performance regression against 10,000-line target. | Maintainer | Optimize, scope down, or defer release if threshold fails under `CTRL-6`. |
| OBS-6 | Compatibility command transcript. | Prove existing authoritative behavior remains intact. | Markdown Trace maintainer | Block merge or revert additive changes if compatibility fails. |

Operator actions: Operators run graph validation locally or in CI, inspect graph reports for blocking diagnostics, use graph repair plans as non-mutating guidance, capture evidence under `docs/evidence/**`, and continue using existing `derive`, `derive-sidecar`, `validate`, and `migration-check` commands for authoritative registry workflows.

Monitoring window: For this local CLI package, monitoring is pre-merge and immediate post-merge validation on the implementation branch and merged main. No live service monitoring window applies.

N/A rationale: No hosted service, dashboard, alerting pipeline, on-call runbook, or live deployment is introduced. Operational readiness is based on local CLI signals, deterministic artifacts, compatibility transcripts, and rollback instructions.

Section status: Complete

## 16. Risks, Questions, Deviations, and Waivers

Risks:

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| RISK-1 | Trace evidence or graph validation could be mistaken for authoritative registry output. | High | Medium | Markdown Trace maintainer | Distinct schema names, `authority: trace-evidence`, report labels, package boundaries, and compatibility checks. | `VAL-3`, `VAL-12`, `VAL-13` |
| RISK-2 | Graph profile relationship direction or required path semantics could be implemented incorrectly. | High | Medium | Graph validation reviewer | Built-in profile tests, positive and negative fixture review, relationship normalization review at `MS-2`. | `VAL-2`, `VAL-5`, `VAL-6` |
| RISK-3 | Additive CLI work could regress existing command behavior. | High | Low | Markdown Trace maintainer | Keep existing command branches stable, add graph commands separately, run full compatibility proof before merge. | `VAL-8`, `VAL-12` |
| RISK-4 | Determinism or 10,000-line performance target could fail late. | Medium | Medium | Implementation agent | Canonical sorting from first slice, repeated hash tests, benchmark before final gate, one focused optimization pass before escalation. | `VAL-10`, `VAL-11` |

Open questions: None. `SRC-1` states no open questions and this execution spec treats new blocking scope questions as pause conditions under section 10.

Approved deviations: None. The WP-1 child estimate follows the decomposition path required by `CTRL-9`; it is not a deviation from the execution plan.

Approved waivers: None.

Section status: Complete

## 17. Execution Traceability Matrix

| Source, objective, or evidence-led claim | Change surfaces | Package boundaries | Work packages | Milestones | Controls | Validation | Review | Release or ops | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SRC-1 R2 design authority | `SURF-1` through `SURF-12` | `PKG-1` through `PKG-7` | `WP-1` through `WP-7` | `MS-1`, `MS-2`, `MS-3`, `MS-4` | `CTRL-1`, `CTRL-2`, `CTRL-3`, `CTRL-7`, `CTRL-9` | `VAL-0`, `VAL-1`, `VAL-2`, `VAL-3`, `VAL-4`, `VAL-5`, `VAL-6`, `VAL-7`, `VAL-8`, `VAL-9`, `VAL-10`, `VAL-11`, `VAL-12`, `VAL-13` | `REV-1`, `REV-2`, `REV-3`, `REV-4`, `REV-5`, `REV-6`, `REV-7` | `REL-1`, `REL-2`, `REL-3`, `REL-4`, `OBS-1` through `OBS-6` | `EVD-0` through `EVD-13` |
| SRC-2 R0 evidence and scope controls | `SURF-1`, `SURF-2`, `SURF-3`, `SURF-8`, `SURF-9`, `SURF-10` | `PKG-1`, `PKG-2`, `PKG-3`, `PKG-7` | `WP-1`, `WP-2`, `WP-3`, `WP-4`, `WP-7` | `MS-1`, `MS-2`, `MS-4` | `CTRL-1`, `CTRL-3`, `CTRL-5` | `VAL-0`, `VAL-1`, `VAL-2`, `VAL-4`, `VAL-5`, `VAL-6`, `VAL-10`, `VAL-12` | `REV-1`, `REV-3`, `REV-5`, `REV-7` | `REL-1`, `REL-2` | `EVD-0`, `EVD-1`, `EVD-2`, `EVD-4`, `EVD-5`, `EVD-6`, `EVD-10`, `EVD-12` |
| SRC-3 current code baseline | `SURF-5`, `SURF-6`, `SURF-7`, `SURF-9`, `SURF-11`, `SURF-12` | `PKG-6`, `PKG-7` | `WP-6`, `WP-7` | `MS-3`, `MS-4` | `CTRL-4`, `CTRL-8` | `VAL-8`, `VAL-12`, `VAL-13` | `REV-2`, `REV-5`, `REV-6` | `REL-2`, `REL-3`, `REL-4`, `OBS-6` | `EVD-8`, `EVD-12`, `EVD-13` |
| SRC-4 user goals | `SURF-3`, `SURF-4`, `SURF-5`, `SURF-6`, `SURF-10` | `PKG-3`, `PKG-4`, `PKG-5`, `PKG-6`, `PKG-7` | `WP-4`, `WP-5`, `WP-6`, `WP-7` | `MS-2`, `MS-3`, `MS-4` | `CTRL-2`, `CTRL-3` | `VAL-4`, `VAL-7`, `VAL-8`, `VAL-9` | `REV-1`, `REV-4`, `REV-6` | `REL-3`, `OBS-1`, `OBS-2` | `EVD-4`, `EVD-7`, `EVD-8`, `EVD-9` |
| SRC-5 planning-artifact estimation control | `SURF-10` | `PKG-7` | `WP-7` | `MS-4` | `CTRL-8`, `CTRL-9` | `VAL-12` | `REV-6` | `REL-3` | `EVD-12` |
| SRC-6 approved WP-1 DEP-3 disposition | `SURF-1`, `SURF-2`, `SURF-3`, `SURF-8`, `SURF-9`, `SURF-10` | `PKG-1`, `PKG-2`, `PKG-3`, `PKG-7` | `WP-1` | `MS-1` | `CTRL-9` | `VAL-0` | `REV-1`, `REV-2`, `REV-3`, `REV-7` | `REL-1` | WP-1 estimate artifact and `EVD-0` |
| DEP-3 implementation-scope estimate | `SURF-1` through `SURF-12` | `PKG-1` through `PKG-7` | `WP-1` through `WP-7` | `MS-1`, `MS-4` | `CTRL-9` | `VAL-0`, `VAL-12` | `REV-1`, `REV-2`, `REV-6` | `REL-1`, `REL-3` | `EVD-0`, `EVD-12` |
| OBJ-1 trace evidence extraction | `SURF-1`, `SURF-8`, `SURF-9` | `PKG-1`, `PKG-7` | `WP-1`, `WP-3`, `WP-7` | `MS-1`, `MS-2`, `MS-4` | `CTRL-1`, `CTRL-5`, `CTRL-7`, `CTRL-9` | `VAL-0`, `VAL-1`, `VAL-3`, `VAL-10`, `VAL-13` | `REV-2`, `REV-3`, `REV-5`, `REV-7` | `REL-1`, `REL-2`, `OBS-3`, `OBS-4` | `EVD-0`, `EVD-1`, `EVD-3`, `EVD-10`, `EVD-13` |
| OBJ-2 graph profiles | `SURF-2`, `SURF-8`, `SURF-9` | `PKG-2`, `PKG-7` | `WP-1`, `WP-2`, `WP-7` | `MS-1`, `MS-2`, `MS-4` | `CTRL-3`, `CTRL-9` | `VAL-0`, `VAL-2`, `VAL-5`, `VAL-6` | `REV-2`, `REV-3`, `REV-7` | `REL-1`, `OBS-3`, `OBS-4` | `EVD-0`, `EVD-2`, `EVD-5`, `EVD-6` |
| OBJ-3 graph validation diagnostics | `SURF-3`, `SURF-8`, `SURF-9` | `PKG-3`, `PKG-7` | `WP-1`, `WP-4`, `WP-7` | `MS-1`, `MS-2`, `MS-4` | `CTRL-1`, `CTRL-3`, `CTRL-5`, `CTRL-9` | `VAL-0`, `VAL-4`, `VAL-5`, `VAL-6`, `VAL-8`, `VAL-10` | `REV-3`, `REV-5`, `REV-7` | `REL-1`, `REL-2`, `OBS-1`, `OBS-2` | `EVD-0`, `EVD-4`, `EVD-5`, `EVD-6`, `EVD-8`, `EVD-10` |
| OBJ-4 reports and repair plans | `SURF-4`, `SURF-5`, `SURF-8`, `SURF-9` | `PKG-4`, `PKG-5`, `PKG-7` | `WP-5`, `WP-7` | `MS-3`, `MS-4` | `CTRL-1`, `CTRL-2` | `VAL-7`, `VAL-9`, `VAL-13` | `REV-4`, `REV-6` | `REL-1`, `REL-3`, `OBS-2` | `EVD-7`, `EVD-9`, `EVD-13` |
| OBJ-5 CLI and exports | `SURF-6`, `SURF-7`, `SURF-9`, `SURF-12` | `PKG-6`, `PKG-7` | `WP-6`, `WP-7` | `MS-3`, `MS-4` | `CTRL-4`, `CTRL-8` | `VAL-8`, `VAL-12`, `VAL-13` | `REV-5`, `REV-6` | `REL-2`, `REL-3`, `OBS-1`, `OBS-6` | `EVD-8`, `EVD-12`, `EVD-13` |
| OBJ-6 readiness evidence | `SURF-8`, `SURF-9`, `SURF-10`, `SURF-11`, `SURF-12` | `PKG-7` | `WP-7` | `MS-4` | `CTRL-5`, `CTRL-6`, `CTRL-7` | `VAL-10`, `VAL-11`, `VAL-12`, `VAL-13` | `REV-5`, `REV-6` | `REL-2`, `REL-3`, `REL-4`, `OBS-3`, `OBS-5`, `OBS-6` | `EVD-10`, `EVD-11`, `EVD-12`, `EVD-13` |
| Critical path hypothesis | `SURF-1`, `SURF-2`, `SURF-3`, `SURF-8`, `SURF-9` | `PKG-1`, `PKG-2`, `PKG-3`, `PKG-7` | `WP-1` | `MS-1` | `CTRL-1`, `CTRL-3`, `CTRL-9` | `VAL-0` | `REV-1`, `REV-2`, `REV-3`, `REV-7` | `REL-1`, `OBS-1`, `OBS-2` | `EVD-0` |
| First proving slice | `SURF-1`, `SURF-2`, `SURF-3`, `SURF-8`, `SURF-9` | `PKG-1`, `PKG-2`, `PKG-3`, `PKG-7` | `WP-1` | `MS-1` | `CTRL-1`, `CTRL-3`, `CTRL-8`, `CTRL-9` | `VAL-0` | `REV-1`, `REV-2`, `REV-3`, `REV-7` | `REL-1` | `EVD-0` |
| WP-1 vertical proving slice | `SURF-1`, `SURF-2`, `SURF-3`, `SURF-8`, `SURF-9` | `PKG-1`, `PKG-2`, `PKG-3`, `PKG-7` | `WP-1` | `MS-1` | `CTRL-1`, `CTRL-3`, `CTRL-8`, `CTRL-9` | `VAL-0` | `REV-1`, `REV-2`, `REV-3`, `REV-7` | `REL-1` | `EVD-0` |
| WP-2 profile contracts | `SURF-2`, `SURF-8`, `SURF-9` | `PKG-2`, `PKG-7` | `WP-2` | `MS-2` | `CTRL-3` | `VAL-2`, `VAL-5`, `VAL-6` | `REV-2`, `REV-3` | `REL-1`, `OBS-3` | `EVD-2`, `EVD-5`, `EVD-6` |
| WP-3 trace evidence extraction | `SURF-1`, `SURF-8`, `SURF-9` | `PKG-1`, `PKG-7` | `WP-3` | `MS-2` | `CTRL-1`, `CTRL-5`, `CTRL-7` | `VAL-1`, `VAL-3`, `VAL-10`, `VAL-13` | `REV-2`, `REV-5`, `REV-7` | `REL-1`, `OBS-3`, `OBS-4` | `EVD-1`, `EVD-3`, `EVD-10`, `EVD-13` |
| WP-4 graph validation engine | `SURF-3`, `SURF-8`, `SURF-9` | `PKG-3`, `PKG-7` | `WP-4` | `MS-2` | `CTRL-1`, `CTRL-3`, `CTRL-5` | `VAL-4`, `VAL-5`, `VAL-6`, `VAL-8`, `VAL-10` | `REV-3`, `REV-5` | `REL-1`, `OBS-1`, `OBS-2` | `EVD-4`, `EVD-5`, `EVD-6`, `EVD-8`, `EVD-10` |
| WP-5 reports and repair plans | `SURF-4`, `SURF-5`, `SURF-8`, `SURF-9` | `PKG-4`, `PKG-5`, `PKG-7` | `WP-5` | `MS-3` | `CTRL-1`, `CTRL-2` | `VAL-7`, `VAL-9`, `VAL-13` | `REV-4` | `REL-1`, `OBS-2` | `EVD-7`, `EVD-9`, `EVD-13` |
| WP-6 CLI and exports | `SURF-6`, `SURF-7`, `SURF-9`, `SURF-12` | `PKG-6`, `PKG-7` | `WP-6` | `MS-3` | `CTRL-4`, `CTRL-8` | `VAL-8`, `VAL-12`, `VAL-13` | `REV-5` | `REL-2`, `REL-3`, `OBS-1`, `OBS-6` | `EVD-8`, `EVD-12`, `EVD-13` |
| WP-7 final evidence | `SURF-8`, `SURF-9`, `SURF-10`, `SURF-11`, `SURF-12` | `PKG-7` | `WP-7` | `MS-4` | `CTRL-5`, `CTRL-6`, `CTRL-7` | `VAL-10`, `VAL-11`, `VAL-12`, `VAL-13` | `REV-5`, `REV-6` | `REL-2`, `REL-3`, `REL-4`, `OBS-3`, `OBS-5`, `OBS-6` | `EVD-10`, `EVD-11`, `EVD-12`, `EVD-13` |
| MS-1 proving gate | `SURF-1`, `SURF-2`, `SURF-3`, `SURF-8`, `SURF-9` | `PKG-1`, `PKG-2`, `PKG-3`, `PKG-7` | `WP-1` | `MS-1` | `CTRL-1`, `CTRL-3`, `CTRL-9` | `VAL-0` | `REV-1`, `REV-2`, `REV-3`, `REV-7` | `REL-1` | `EVD-0` |
| MS-2 contract gate | `SURF-1`, `SURF-2`, `SURF-3`, `SURF-8`, `SURF-9` | `PKG-1`, `PKG-2`, `PKG-3`, `PKG-7` | `WP-2`, `WP-3`, `WP-4` | `MS-2` | `CTRL-1`, `CTRL-3`, `CTRL-5` | `VAL-2`, `VAL-3`, `VAL-4`, `VAL-5`, `VAL-6`, `VAL-10`, `VAL-13` | `REV-2`, `REV-3`, `REV-7` | `REL-1` | `EVD-2`, `EVD-3`, `EVD-4`, `EVD-5`, `EVD-6`, `EVD-10`, `EVD-13` |
| MS-3 output gate | `SURF-4`, `SURF-5`, `SURF-6`, `SURF-7`, `SURF-9` | `PKG-4`, `PKG-5`, `PKG-6`, `PKG-7` | `WP-5`, `WP-6` | `MS-3` | `CTRL-1`, `CTRL-2`, `CTRL-4` | `VAL-7`, `VAL-8`, `VAL-9`, `VAL-12`, `VAL-13` | `REV-4`, `REV-5` | `REL-2`, `OBS-1`, `OBS-2` | `EVD-7`, `EVD-8`, `EVD-9`, `EVD-12`, `EVD-13` |
| MS-4 final gate | `SURF-1` through `SURF-12` | `PKG-1` through `PKG-7` | `WP-1` through `WP-7` | `MS-4` | `CTRL-1` through `CTRL-9` | `VAL-0`, `VAL-1`, `VAL-2`, `VAL-3`, `VAL-4`, `VAL-5`, `VAL-6`, `VAL-7`, `VAL-8`, `VAL-9`, `VAL-10`, `VAL-11`, `VAL-12`, `VAL-13` | `REV-1`, `REV-2`, `REV-3`, `REV-4`, `REV-5`, `REV-6`, `REV-7` | `REL-2`, `REL-3`, `REL-4`, `OBS-1` through `OBS-6` | `EVD-0` through `EVD-13` |
| RISK-1 authority confusion | `SURF-1`, `SURF-3`, `SURF-4`, `SURF-5`, `SURF-6`, `SURF-7`, `SURF-11` | `PKG-1`, `PKG-3`, `PKG-4`, `PKG-5`, `PKG-6` | `WP-1`, `WP-3`, `WP-4`, `WP-5`, `WP-7` | `MS-1`, `MS-2`, `MS-3`, `MS-4` | `CTRL-1`, `CTRL-2`, `CTRL-7`, `CTRL-9` | `VAL-0`, `VAL-3`, `VAL-9`, `VAL-12`, `VAL-13` | `REV-2`, `REV-4`, `REV-5`, `REV-7` | `REL-4`, `OBS-2`, `OBS-4` | `EVD-0`, `EVD-3`, `EVD-9`, `EVD-12`, `EVD-13` |
| RISK-2 semantic drift | `SURF-2`, `SURF-3`, `SURF-8`, `SURF-9` | `PKG-2`, `PKG-3`, `PKG-7` | `WP-1`, `WP-2`, `WP-4` | `MS-1`, `MS-2` | `CTRL-3` | `VAL-0`, `VAL-2`, `VAL-4`, `VAL-5`, `VAL-6` | `REV-3`, `REV-7` | `OBS-2`, `OBS-3` | `EVD-0`, `EVD-2`, `EVD-4`, `EVD-5`, `EVD-6` |
| RISK-3 compatibility regression | `SURF-5`, `SURF-6`, `SURF-7`, `SURF-9`, `SURF-11`, `SURF-12` | `PKG-6`, `PKG-7` | `WP-6`, `WP-7` | `MS-3`, `MS-4` | `CTRL-4`, `CTRL-8` | `VAL-8`, `VAL-12`, `VAL-13` | `REV-5`, `REV-6` | `REL-2`, `REL-3`, `REL-4`, `OBS-6` | `EVD-8`, `EVD-12`, `EVD-13` |
| RISK-4 determinism and performance | `SURF-1`, `SURF-3`, `SURF-8`, `SURF-9`, `SURF-10` | `PKG-1`, `PKG-3`, `PKG-7` | `WP-3`, `WP-4`, `WP-7` | `MS-2`, `MS-4` | `CTRL-5`, `CTRL-6` | `VAL-10`, `VAL-11` | `REV-5`, `REV-6` | `REL-2`, `REL-4`, `OBS-3`, `OBS-5` | `EVD-10`, `EVD-11` |

Section status: Complete

## 18. Final Execution Gate

Entry gate: Ready to start WP-1. The project owner approved execution kickoff (`DEP-1`) and, on 2026-08-13, approved the decomposed WP-1 estimate route after `.codefactory/execution-estimates/profile-aware-graph-validation-wp1-estimate.json` returned `execution.action=proceed` with `decompositionRecommended=false` (`DEP-3`). The implementation branch exists from the merged R2 design on `origin/main`, and no entry work requires source mutation, registry authority promotion, universal vocabulary expansion, or live integration. This entry disposition authorizes WP-1 only and does not approve `MS-1` or later work packages.

Milestone approval gate: `MS-1`, `MS-2`, `MS-3`, and `MS-4` are non-waivable at their due points. Each milestone requires the named verifier, manual verification steps, `REV-*` review scope, and `EVD-*` evidence before work may proceed past that gate.

Completion gate: Completion requires `WP-1` through `WP-7` complete, `VAL-0` through `VAL-13` passed, `REV-1` through `REV-7` complete, all blocking review findings resolved or validly waived, all milestone approvals recorded, no open blocking `Q-*`, and no unapproved `DEV-*` or `WVR-*`.

Release gate: Merge or release activation requires `REL-1`, `REL-2`, and `REL-3` complete, rollback containment from `REL-4` documented, `EVD-12` compatibility proof passing, and `EVD-13` local-safety proof passing.

Handoff record: The implementation handoff shall include this execution spec path, the R2 design path, implementation branch, final diff, implementation-scope estimate artifact, `MS-*` approvals, `REV-*` decisions, command transcripts, evidence artifact paths `EVD-0` through `EVD-13`, known follow-up work, rollback instructions, and a reminder to read this file from disk before continuing after any context compression.

Final readiness state: Ready to execute

Section status: Complete
