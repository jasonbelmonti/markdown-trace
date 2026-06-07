# Markdown Trace Profile-Aware Graph Validation Design Specification

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Profile-Aware Graph Validation Design Specification |
| Status | In Review |
| Rigor level | `R2` |
| Rigor justification | This design creates durable local CLI, library, schema, profile, diagnostic, report, and repair-plan contracts for production use. It is additive, local-only, read-only for source Markdown, and reversible, so it does not trigger `R3`, but it is broader than a small `R1` patch. |
| Author(s) | Codex |
| Reviewers | Project owner; Markdown Trace maintainer; markdown-engine contract reviewer; graph validation reviewer; CODEFACTORY artifact-profile reviewer; agent authoring workflow reviewer |
| Decision owner | Project owner |
| Target milestone or release | Profile-aware graph validation implementation approval |
| Last updated | 2026-06-07 |
| Related docs | `docs/evidence/profile-aware-graph-validation-r0-report.md`; `docs/design/markdown-trace-profile-aware-graph-validation-design-process.md`; `docs/markdown-trace-profile-aware-graph-validation-r0-execution.md`; `docs/design/markdown-trace-durable-markdown-authoring-design-spec.md`; `docs/design/markdown-trace-candidate-graph-design-spec.md`; `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md` |
| Related tickets | `BEL-1290` through `BEL-1296` |

## 0. Executive Summary

Decision requested: Approve for implementation

Problem summary: Markdown Trace users and agent workflows are unable to validate whether generated CODEFACTORY execution and design specs actually connect objectives, work packages, validation checkpoints, evidence, requirements, behaviors, mechanisms, and acceptance cases because current authoritative `derive` remains heading or `ctx://trace` oriented, resulting in structurally valid table-first Markdown that can still hide graph gaps, duplicate authority, broken references, invalid ranges, and missing matrix coverage.

Proposed outcome: Markdown Trace exposes local, deterministic, profile-aware trace evidence, graph validation diagnostics, graph reports, and repair-plan artifacts for generated execution and design specs while preserving existing authoritative registry behavior and treating source mutation and table-derived registry authority as later gated work.

Why now: On 2026-06-07, the completed profile-aware graph validation R0 returned `pass-with-scope-controls`, proving that table-first artifacts can produce deterministic trace evidence and that graph validation can proceed to R2 design-spec with standalone graph profiles.

Top risks or unknowns:

- RISK-1: Production graph evidence may be mistaken for authoritative registry output if schemas, CLI text, and reports do not preserve the authority boundary.
- RISK-2: Overly generic relationship vocabulary may flatten execution-spec and design-spec semantics into misleading edges.
- RISK-3: Repair-plan output may be treated as safe source mutation unless the design keeps it read-only and explicitly non-applying.

Section status: Complete

## Layer 1: Problem and Requirements

## 1. Problem Definition

Problem declaration: Markdown Trace users and agent workflows are unable to validate generated Markdown graph coherence because current production behavior does not extract profile-aware table roles or validate graph paths from table-first artifacts, resulting in generated specs that can pass structural review while objectives, work packages, validation, evidence, requirements, behavior, and mechanisms remain disconnected.

Affected actors or systems: Project owner, Markdown Trace users, implementation agents, graph validation reviewers, CODEFACTORY artifact-profile reviewers, agent authoring workflows, Markdown Trace CLI, Markdown Trace library consumers, generated execution specs, and generated design specs.

Current-state baseline: The R0 report records 130 raw primary definitions, 7 supplemental definitions, 147 coverage rows, 25 ranges, and 1924 candidate edges in the real execution spec; it also records 21 raw primary definitions, 15 coverage rows, and 38 candidate edges in the generated design-spec fixture. Current production `derive` and `validate` remain registry-authoritative and do not expose this profile-aware graph validation layer.

Evidence or source: `docs/evidence/profile-aware-graph-validation-r0-report.md`; `docs/design/markdown-trace-profile-aware-graph-validation-design-process.md`; current `src/markdowntrace/cli.ts`; current `src/markdowntrace/registry/derived.ts`; current `src/markdowntrace/graph/derive.ts`; current `src/markdowntrace/validation/findings.ts`; R0 prototype files under `experiments/profile-aware-graph-validation-r0/**`.

Consequence of inaction: Before the next generated-spec implementation cycle, agents and reviewers will continue relying on manual inspection to decide whether generated Markdown is graph-coherent, which leaves coverage gaps and broken trace paths undetected until review or downstream execution.

Decision deadline or trigger: The project owner asked on 2026-06-07 to continue from R0 into an R2 design because the desired product value is better generated-spec validation, graph-aware repair loops, agent-readable diagnostics, confidence in objective-to-evidence connectivity, and safer future Markdown authoring automation.

Section status: Complete

## 2. Objectives and Non-Objectives

| ID | Statement | Measurement or decision horizon |
| --- | --- | --- |
| OBJ-1 | Provide better validation for generated CODEFACTORY execution and design specs through profile-aware graph checks. | Implementation review shall show execution-spec and design-spec fixtures producing graph validation results with expected pass and fail cases. |
| OBJ-2 | Produce agent-readable diagnostics and graph evidence that explain source ranges, roles, relationships, missing paths, and repair targets. | Implementation review shall inspect schema-versioned diagnostic and repair-plan artifacts. |
| OBJ-3 | Give reviewers confidence that objectives, work packages, validation checkpoints, and evidence records actually connect. | Execution-spec fixture review shall include objective-to-work-package-to-validation-to-evidence coverage checks. |
| OBJ-4 | Give reviewers confidence that requirements, functional behavior, technical mechanisms, acceptance cases, and validation checks actually connect. | Design-spec fixture review shall include requirement-to-behavior-to-mechanism-to-validation coverage checks. |
| OBJ-5 | Enable graph-aware repair loops by producing non-mutating repair plans that cite diagnostics, evidence, and suggested remediation actions. | Implementation review shall include at least one repair-plan fixture for each blocking diagnostic family. |
| OBJ-6 | Preserve current authoritative `derive`, `derive-sidecar`, `validate`, and R1 link-backed behavior. | Existing compatibility tests and fixture commands shall pass unchanged before implementation approval. |
| NG-1 | This effort will not mutate source Markdown. | Source mutation remains a later design and implementation gate. |
| NG-2 | This effort will not promote table-derived facts into authoritative `EntityRegistry` or production `TraceGraph` output. | Registry authority promotion remains a separate migration design. |
| NG-3 | This effort will not use LLMs, network services, graph databases, browser automation, MCP, or live project-management integrations. | Applies through implementation and launch. |
| NG-4 | This effort will not define final source-writing automation. | Safer Markdown authoring automation consumes diagnostics and repair plans later. |
| NG-5 | This effort will not replace markdown-engine structural validation profiles. | Graph profiles compose beside structural profiles. |

Section status: Complete

## 3. Stakeholders and Decision Authorities

| Stakeholder or role | Interest | Required action |
| --- | --- | --- |
| Project owner | Generated specs should become graph-verifiable and repair-ready without unsafe authority promotion. | Approve |
| Markdown Trace maintainer | Additive graph validation must not regress registry derivation, generated sidecar, or validation compatibility. | Review |
| markdown-engine contract reviewer | Extraction must use public package-root parser and query APIs only. | Review |
| Graph validation reviewer | Diagnostics, relationship direction, coverage paths, and source evidence must be deterministic and useful. | Review |
| CODEFACTORY artifact-profile reviewer | Execution-spec and design-spec table role semantics must match artifact intent. | Review |
| Agent authoring workflow reviewer | Diagnostic and repair-plan artifacts must be machine-readable enough to drive future repair loops. | Review |

Decision owner: Project owner

Section status: Complete

## 4. Constraints, Invariants, and Assumptions

| ID | Type | Statement | Source or rationale | Validation or resolution plan |
| --- | --- | --- | --- | --- |
| CON-1 | Constraint | Extraction shall use only public `@jasonbelmonti/markdown-engine` package-root APIs. | R0 prototype used `parse`, `normalize`, and `documentQueries`; existing adoption boundary forbids parser internals. | VAL-13 inspects imports and dependency boundaries. |
| CON-2 | Invariant | Profile-aware graph validation shall remain schema-distinct from `EntityRegistry` and production `TraceGraph`. | R0 verdict explicitly preserves current registry authority. | VAL-3, VAL-6, and VAL-12 verify schema naming and compatibility. |
| CON-3 | Invariant | Graph profiles shall be standalone semantic profiles that compose beside structural validation profiles. | R0 resolved `Q-1` in favor of standalone graph profiles. | VAL-2 verifies graph profile load and schema behavior. |
| CON-4 | Invariant | Matrix cells and coverage cells shall never create primary or supplemental definitions. | R0 matrix check classified 962 execution-spec matrix IDs as coverage references only. | VAL-5 and VAL-8 exercise matrix false-authority regressions. |
| CON-5 | Constraint | Outputs shall be deterministic for identical input, graph profile, package version, and runtime version. | Agent handoff and review require stable artifacts. | VAL-10 snapshot-tests canonical ordering and serialization. |
| CON-6 | Constraint | The feature shall remain local-first and offline. | Existing product scope and R0 containment. | VAL-13 inspects dependencies and runtime behavior. |
| CON-7 | Invariant | Repair plans shall not apply edits or write source Markdown. | User wants future safer automation, but this R2 slice only prepares graph-aware repair loops. | VAL-9 verifies source hashes and repair-plan output behavior. |
| ASM-1 | Assumption | Execution-spec and generated design-spec graph semantics are stable enough for first artifact-family-specific graph profiles. | R0 passed both fixture families with scoped recommendation. | VAL-5 and VAL-6 exercise both profile families before launch. |
| ASM-2 | Assumption | The initial execution-spec and design-spec relationship classes defined in section 13 are stable enough for production graph-profile contracts, while broader universal vocabulary remains out of scope. | R0 found useful relationship hints but warned against universal vocabulary. | VAL-2, VAL-5, VAL-6, and VAL-7 review normalized relationship classes with graph validation reviewer. |
| ASM-3 | Assumption | Agent consumers can use source-backed diagnostics and repair plans before direct source mutation exists. | User goals include graph-aware repair loops and safer future authoring automation. | VAL-9 and manual repair-loop review evaluate artifact usefulness. |

Section status: Complete

## 5. Requirements

| ID | Type | Priority | Requirement statement | Rationale | Verification |
| --- | --- | --- | --- | --- | --- |
| REQ-1 | Functional | Must | The system shall extract trace evidence from headings, tables, prose, `ctx://trace` links, raw ID labels, and ranges in local Markdown documents. | Generated specs are table-first but still contain graphable evidence across document structures. | VAL-1 |
| REQ-2 | Functional | Must | The system shall load standalone graph profiles that declare ID families, table roles, relationship classes, range policy, matrix semantics, repeated-ID policy, required paths, and diagnostic classes. | R0 proved graph semantics need standalone semantic profiles. | VAL-2 |
| REQ-3 | Functional | Must | The system shall emit schema-versioned trace evidence results containing definitions, supplemental definitions, coverage rows, mentions, ranges, candidate edges, diagnostics, source ranges, input hashes, profile hashes, and run metadata. | Agents and reviewers need durable machine-readable graph evidence. | VAL-3, VAL-10 |
| REQ-4 | Functional | Must | The system shall validate graph evidence against the active graph profile and report unresolved references, duplicate primary definitions, invalid range endpoints, missing matrix coverage, and missing required path diagnostics. | These were the R0 smoke diagnostic families and are minimum production graph validation value. | VAL-4 |
| REQ-5 | Functional | Must | The system shall validate execution-spec coverage paths from objectives through work packages to validation checkpoints and evidence records. | The project owner needs confidence that execution planning artifacts actually connect. | VAL-5 |
| REQ-6 | Functional | Must | The system shall validate design-spec coverage paths from requirements through behavior, mechanisms, acceptance cases, and validation checkpoints. | Generated design specs need graph-level validation beyond structural section checks. | VAL-6 |
| REQ-7 | Functional | Must | The system shall emit graph validation reports that are readable by humans and agents. | Better validation and repair loops require explainable output, not only pass or fail status. | VAL-7 |
| REQ-8 | Functional | Must | The system shall emit non-mutating graph repair plans for blocking graph diagnostics. | Graph-aware repair loops need actionable next steps before source-writing automation exists. | VAL-9 |
| REQ-9 | Operability | Must | The CLI shall provide read-only commands for trace evidence extraction, graph validation, graph reporting, and repair-plan generation. | Users need a durable production surface while preserving source safety. | VAL-8, VAL-9 |
| REQ-10 | Reliability | Must | The system shall produce byte-stable JSON artifacts for identical input, graph profile, package version, and runtime version. | Deterministic artifacts are required for review, CI, and agent consumption. | VAL-10 |
| REQ-11 | Compatibility | Must | The system shall preserve existing authoritative `derive`, `derive-sidecar`, `validate`, migration check, and R1 link-backed behavior. | Profile-aware graph validation must remain additive. | VAL-12 |
| REQ-12 | Operability | Must | The system shall use exit code `0` for successful graph validation, `1` for blocking graph validation diagnostics, and `2` for operational failures. | CI, agents, and local operators need predictable command behavior. | VAL-8 |
| REQ-13 | Performance | Should | The system shall complete graph validation for a 10,000-line Markdown document within 10 seconds on a developer workstation under default profile settings. | Large generated specs should remain practical for agent workflows. | VAL-11 |
| REQ-14 | Security | Must | The system shall run without network access, live external-system mutation, secret access, or executable content evaluation. | The feature is local evidence processing, not an integration surface. | VAL-13 |

Section status: Complete

## 6. Success Measures and Kill Criteria

| Measure | Baseline | Target or decision threshold | Evaluation date or decision event | Related IDs |
| --- | --- | --- | --- | --- |
| Generated execution-spec graph confidence | R0 evidence exists only under `experiments/**`; no production command validates OBJ/WP/VAL/EVD paths. | Production fixture validates objective-to-work-package-to-validation-to-evidence paths and fails a missing-path negative fixture. | Implementation review | OBJ-1, OBJ-3, REQ-4, REQ-5 |
| Generated design-spec graph confidence | R0 evidence exists only for a controlled generated design-spec fixture; no production command validates REQ/FUNC/TECH/VAL paths. | Production fixture validates requirement-to-behavior-to-mechanism-to-validation paths and fails a missing-path negative fixture. | Implementation review | OBJ-1, OBJ-4, REQ-4, REQ-6 |
| Agent-readable diagnostics | Current production findings are registry validation findings, not graph-profile diagnostics. | Graph validation JSON includes stable diagnostic codes, severity, source ranges, related IDs, repair-plan references, and profile rule IDs. | Implementation review | OBJ-2, REQ-3, REQ-4, REQ-7 |
| Graph-aware repair-loop readiness | No production repair-plan artifact exists. | Each blocking diagnostic family produces a non-mutating repair-plan entry with suggested action, confidence, affected source ranges, and validation target. | Implementation review | OBJ-5, REQ-8 |
| Compatibility preservation | BEL-1296 compatibility proof passed build, tests, derive, validate, migration check, and targeted R1 tests. | Same command set passes after production implementation. | Implementation review | OBJ-6, REQ-11 |
| Kill criterion for source mutation | R0 did not authorize source mutation. | Stop this implementation if any design or code path requires editing input Markdown to deliver graph validation value. | Before launch | NG-1, CON-7 |
| Kill criterion for registry authority promotion | R0 did not authorize table-derived registry authority. | Stop this implementation if table-derived facts must enter `EntityRegistry` to produce validation diagnostics. | Before launch | NG-2, CON-2 |

Section status: Complete

## Layer 1 Exit

Layer 1 status: Complete

## Layer 2: Functional Specification

## 7. System Context and External Interfaces

System boundary: Profile-aware graph validation is a Markdown Trace CLI and library capability that reads local Markdown, loads a graph profile, extracts trace evidence, validates graph rules, emits reports and repair plans, and exits with stable status codes. It does not modify source Markdown and does not alter authoritative registry derivation or validation.

External actors and systems: CLI user, implementation agent, graph validation reviewer, CODEFACTORY artifact-profile reviewer, agent authoring workflow, local filesystem, `@jasonbelmonti/markdown-engine`, existing Markdown Trace `derive`, `derive-sidecar`, `validate`, and `migration-check` commands. Linear, Jira, GitHub, MCP, browser automation, graph databases, and LLM services have no data or control interface in this design.

Trust or control boundaries: The design crosses a local file read boundary, a generated artifact write boundary, and a dependency boundary into `markdown-engine`. It does not cross network, authentication, authorization, secret, tenancy, or live external-system boundaries. The authority boundary between graph evidence and authoritative registry output is explicit.

| Interface | Owner | Consumer or dependency | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `markdown-trace trace-evidence` CLI | Markdown Trace | CLI user or agent | Markdown path, graph profile path, optional output path | Trace evidence JSON, diagnostics, exit code |
| `markdown-trace graph-validate` CLI | Markdown Trace | CLI user, CI, or agent | Markdown path or trace evidence path, graph profile path, optional report path | Graph validation JSON or Markdown report, exit code |
| `markdown-trace graph-report` CLI | Markdown Trace | Human reviewer or graph validation reviewer | Graph validation result or Markdown path plus profile | Markdown, Mermaid, or JSON summary report |
| `markdown-trace graph-repair-plan` CLI | Markdown Trace | Agent authoring workflow or human reviewer | Graph validation result, optional output path | Non-mutating repair-plan JSON or Markdown, exit code |
| Trace evidence library API | Markdown Trace | CLI and future package consumers | Markdown text or path, engine document, graph profile | Trace evidence result |
| Graph profile loader API | Markdown Trace | CLI and graph validator | YAML graph profile path or built-in profile name | Validated graph profile object or load diagnostics |
| Graph validation library API | Markdown Trace | CLI and repair planner | Trace evidence result and graph profile | Graph validation result |
| Repair-plan library API | Markdown Trace | CLI and future authoring automation | Graph validation diagnostics and trace evidence | Repair plan result |
| Engine parse/query API | markdown-engine | Trace evidence extractor | Markdown text and path | Normalized document, sections, tables, links, text spans, diagnostics |
| Existing authoritative commands | Markdown Trace | Existing users and tests | Existing registry, document, sidecar, and profile inputs | Current outputs and exit codes unchanged |
| Local filesystem | User environment | Markdown Trace CLI | Input paths and requested artifact paths | Read source files and write generated artifacts only |

Section status: Complete

## 8. Operational Scenarios and Functional Behavior

| ID | Trigger | Preconditions | Behavior or outcome | Related requirements |
| --- | --- | --- | --- | --- |
| FLOW-1 | User validates a generated execution spec. | Markdown file exists and the execution-spec graph profile is available. | The system extracts evidence, validates OBJ/WP/VAL/EVD coverage, reports graph diagnostics, and exits `0` or `1` according to blocking findings. | REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-12 |
| FLOW-2 | User validates a generated design spec. | Markdown file exists and the design-spec graph profile is available. | The system extracts evidence, validates REQ/FUNC/TECH/ACC/VAL coverage, reports graph diagnostics, and exits `0` or `1` according to blocking findings. | REQ-1, REQ-2, REQ-3, REQ-4, REQ-6, REQ-12 |
| FLOW-3 | Agent requests repair guidance after graph validation fails. | Graph validation result contains blocking diagnostics. | The system emits a non-mutating repair plan with suggested actions, affected ranges, confidence, and validation targets. | REQ-7, REQ-8, REQ-9 |
| FLOW-4 | Human reviewer requests a graph report. | Trace evidence or graph validation result is available. | The system emits a readable report that shows nodes, relationship classes, diagnostics, source evidence, and authority labels. | REQ-3, REQ-7, REQ-9 |
| FLOW-5 | Existing user runs authoritative commands. | Existing command inputs are present. | Existing `derive`, `derive-sidecar`, `validate`, and migration behavior remains unchanged. | REQ-11 |
| FLOW-6 | The system encounters malformed input, a malformed graph profile, or an output write failure. | Input, profile, or output path is invalid. | The command emits operational diagnostics, exits `2`, and does not write partial source changes. | REQ-9, REQ-12, REQ-14 |
| FUNC-1 | Trace evidence is extracted. | A Markdown document is parseable or yields recoverable engine diagnostics. | The result contains role-classified definitions, supplemental definitions, coverage rows, mentions, ranges, candidate edges, and source ranges. | REQ-1, REQ-3 |
| FUNC-2 | A graph profile is loaded. | A built-in or local profile is selected. | The result contains validated ID families, table roles, relationship classes, required paths, matrix semantics, range rules, and diagnostic rules. | REQ-2 |
| FUNC-3 | Graph validation runs. | Trace evidence and graph profile are available. | The result contains pass/fail status, stable diagnostic codes, severity, source evidence, affected relationships, and profile rule references. | REQ-4, REQ-5, REQ-6, REQ-7 |
| FUNC-4 | Repair plan is produced. | Blocking graph diagnostics exist. | The result contains non-mutating repair guidance for each supported diagnostic family. | REQ-8 |
| FUNC-5 | Graph report is produced. | Trace evidence or validation result is available. | The report labels profile family, graph evidence, relationships, diagnostics, non-authority status, and source references. | REQ-7, REQ-9 |
| FUNC-6 | Compatibility path is exercised. | Existing authoritative fixture inputs are present. | Existing output shape and validation behavior remain equivalent to the pre-implementation baseline. | REQ-11 |
| FUNC-7 | Operational failure occurs. | Input read, profile load, parse, validation, or output write cannot complete. | The command returns exit `2` with an operational diagnostic and no source mutation. | REQ-12, REQ-14 |

Section status: Complete

## 9. State Model, Faults, and Misuse Cases

States and transitions: A graph validation invocation transitions through `input-resolved`, `profile-loaded`, `source-read`, `engine-parsed`, `evidence-extracted`, `graph-validated`, `report-projected`, and `artifact-written` or `diagnostics-returned`. Public validation states are `pass`, `fail`, and `operational-error`. Repair plan states are `not-requested`, `available`, `partial`, and `unavailable`. No source Markdown or authoritative registry state changes during these transitions.

| Scenario | Expected behavior | Invariant maintained | Related IDs |
| --- | --- | --- | --- |
| Fault-1 | Missing or unreadable Markdown path returns exit `2` with a file-read diagnostic. | Source Markdown and existing registry behavior remain unchanged. | REQ-9, REQ-12, FUNC-7 |
| Fault-2 | Malformed graph profile returns exit `2` with profile diagnostics and no evidence artifact. | Structural validation success is not confused with graph profile validity. | REQ-2, REQ-12, FUNC-2, FUNC-7 |
| Fault-3 | Engine parse or normalize diagnostics are included in trace evidence when recoverable and become operational errors when graph validation cannot continue. | Diagnostics remain source-backed and deterministic. | REQ-3, REQ-7, FUNC-1, FUNC-7 |
| Fault-4 | Duplicate primary definitions produce blocking graph diagnostics under the active profile. | Duplicate table or heading evidence is not silently promoted to authority. | REQ-4, FUNC-3 |
| Fault-5 | Invalid range endpoint produces a blocking graph diagnostic when required endpoints are missing. | Range edges are not accepted without endpoint resolution. | REQ-4, FUNC-3 |
| Fault-6 | Missing required path produces a blocking diagnostic with the missing relationship class and nearest source evidence. | Graph validation does not pass when required connectivity is absent. | REQ-5, REQ-6, FUNC-3 |
| Fault-7 | Output write fails after validation completes. | The source file remains unchanged and the operational failure is reported with exit `2`. | REQ-9, REQ-12, FUNC-7 |
| Misuse-1 | User attempts to use trace evidence JSON as authoritative registry YAML. | Schema names and report labels state trace evidence is non-authoritative and separate from `EntityRegistry`. | REQ-3, REQ-11, FUNC-5 |
| Misuse-2 | Agent treats repair plan as permission to edit source Markdown. | Repair plan states non-mutating status and includes validation targets for a later authoring workflow. | REQ-8, REQ-9, FUNC-4 |
| Misuse-3 | User expects structural profile validation to imply graph validation. | CLI and report output keep structural diagnostics, trace evidence, and graph validation results as distinct categories. | REQ-2, REQ-7, FUNC-2, FUNC-5 |

Section status: Complete

## 10. External Service Levels and Acceptance Cases

External service expectations: This is a local CLI and library feature, not a hosted service. Default-profile graph validation should complete within 10 seconds for a generated 10,000-line Markdown fixture using the built local CLI, Node.js 22.x, a warm local filesystem, and the default built-in graph profile. The performance transcript shall record OS, CPU model, RAM, Node version, package version, input hash, profile hash, line count, and three consecutive command durations; the median duration shall be 10 seconds or less. JSON artifacts shall be byte-stable under identical input, graph profile, package version, and runtime version. Commands shall not perform network access or source Markdown mutation.

| ID | Acceptance case | Expected result | Covers |
| --- | --- | --- | --- |
| ACC-1 | Run `trace-evidence` on the real execution-spec fixture or controlled equivalent. | Output contains primary definitions, supplemental definitions, coverage rows, mentions, ranges, candidate edges, diagnostics, source hashes, and source ranges. | REQ-1, REQ-3, FUNC-1 |
| ACC-2 | Run `graph-validate` on an execution-spec positive fixture. | Result passes required OBJ/WP/VAL/EVD connectivity checks and preserves matrix rows as coverage evidence only. | REQ-4, REQ-5, FUNC-3 |
| ACC-3 | Run `graph-validate` on a design-spec positive fixture. | Result passes REQ/FUNC/TECH/ACC/VAL connectivity checks and reports no blocking diagnostics. | REQ-4, REQ-6, FUNC-3 |
| ACC-4 | Run negative diagnostics for unresolved reference, duplicate primary definition, invalid range endpoint, missing matrix coverage, and missing required path. | Each fixture returns exit `1` with the expected stable diagnostic code and source evidence. | REQ-4, REQ-5, REQ-6, REQ-12, FUNC-3 |
| ACC-5 | Run `graph-repair-plan` for each blocking diagnostic family. | Output contains non-mutating suggested action, confidence, affected IDs, source ranges, and validation targets. | REQ-8, REQ-9, FUNC-4 |
| ACC-6 | Run `graph-report` on validation output. | Human-readable output names profile family, relationship classes, diagnostic summary, authority boundary, and graph evidence. | REQ-7, REQ-9, FUNC-5 |
| ACC-7 | Run graph validation twice with identical inputs and profile. | JSON output hashes match exactly. | REQ-10, FUNC-1, FUNC-3 |
| ACC-8 | Run existing compatibility commands and R1 tests after implementation. | Existing behavior passes unchanged. | REQ-11, FUNC-6 |
| ACC-9 | Run graph validation with network unavailable and inspect runtime dependencies. | Command succeeds or fails only from local file conditions and makes no network or live external-system attempt. | REQ-14, FUNC-7 |
| ACC-10 | Run graph validation on a generated 10,000-line fixture. | Median of three consecutive command durations is 10 seconds or less under the documented Node.js 22.x local benchmark conditions. | REQ-13, FUNC-3 |

Section status: Complete

## 11. Requirements-to-Behavior Traceability

| Requirement | Functional behaviors or flows | Acceptance coverage | Notes |
| --- | --- | --- | --- |
| REQ-1 | FLOW-1, FLOW-2, FUNC-1 | ACC-1 | Extraction covers document structures proven in R0. |
| REQ-2 | FLOW-1, FLOW-2, FUNC-2 | ACC-2, ACC-3 | Profiles are standalone semantic contracts. |
| REQ-3 | FLOW-1, FLOW-2, FUNC-1, FUNC-5 | ACC-1, ACC-6, ACC-7 | Trace evidence JSON is the machine-readable substrate. |
| REQ-4 | FLOW-1, FLOW-2, FUNC-3 | ACC-4 | Minimum diagnostic families come from R0 smoke probes. |
| REQ-5 | FLOW-1, FUNC-3 | ACC-2, ACC-4 | Execution-spec graph confidence centers on OBJ/WP/VAL/EVD paths. |
| REQ-6 | FLOW-2, FUNC-3 | ACC-3, ACC-4 | Design-spec graph confidence centers on REQ/FUNC/TECH/ACC/VAL paths. |
| REQ-7 | FLOW-3, FLOW-4, FUNC-3, FUNC-5 | ACC-5, ACC-6 | Reports support humans and agents. |
| REQ-8 | FLOW-3, FUNC-4 | ACC-5 | Repair plans are non-mutating. |
| REQ-9 | FLOW-1, FLOW-2, FLOW-3, FLOW-4, FLOW-6, FUNC-4, FUNC-5, FUNC-7 | ACC-5, ACC-6 | CLI surfaces are read-only for source Markdown. |
| REQ-10 | FLOW-1, FLOW-2, FUNC-1, FUNC-3 | ACC-7 | Determinism applies to generated JSON artifacts. |
| REQ-11 | FLOW-5, FUNC-6 | ACC-8 | Compatibility path remains authoritative. |
| REQ-12 | FLOW-1, FLOW-2, FLOW-6, FUNC-3, FUNC-7 | ACC-4 | Exit code behavior is externally observable. |
| REQ-13 | FLOW-1, FLOW-2, FUNC-3 | ACC-10 | Performance is bounded for generated-spec-sized inputs. |
| REQ-14 | FLOW-6, FUNC-7 | ACC-9 | Local-only security posture is verified. |

Section status: Complete

## Layer 2 Exit

Layer 2 status: Complete

## Layer 3: Technical Specification

## 12. Architecture Overview

Architecture summary: Add a new profile-aware graph validation layer beside existing registry derivation. The layer reads Markdown through markdown-engine, projects schema-versioned trace evidence, validates that evidence against standalone graph profiles, emits graph validation diagnostics and reports, and optionally produces non-mutating repair plans. Existing `derive`, `derive-sidecar`, `validate`, and migration paths remain unchanged except for shared utilities where review proves no behavior change.

Major components and boundaries: New components are `trace-evidence` extraction, `graph-profile` loading, `graph-validation` rule execution, `graph-reporting`, `graph-repair-plan`, and CLI command adapters. Existing components are `registry`, `graph`, `validation`, `markdown`, `profiles`, `migration`, and `reporting`. The primary boundaries are trace evidence versus authoritative registry, graph profile versus markdown-engine structural profile, graph diagnostics versus registry validation findings, and repair plan versus source mutation.

Deployment or runtime placement: The feature runs in the existing local Node.js CLI and TypeScript library package. It introduces no service, daemon, database, browser dependency, network connector, or deployment topology beyond package release and local command invocation.

Architecture rationale: REQ-1 through REQ-8 require graph semantics that current registry derivation does not own. A separate trace-evidence and graph-validation layer satisfies FUNC-1 through FUNC-5 while CON-2 and REQ-11 preserve existing registry authority. Standalone graph profiles satisfy CON-3 and REQ-2 because relationship, matrix, range, and duplicate-role semantics are not structural Markdown validation rules.

Section status: Complete

## 13. Technical Mechanisms and Allocation

| ID | Mechanism | Component or owner | Responsibility | Related behaviors |
| --- | --- | --- | --- | --- |
| TECH-1 | Engine-backed document adapter | `src/markdowntrace/trace-evidence/**` | Parse Markdown through public `@jasonbelmonti/markdown-engine` APIs and expose sections, tables, links, text spans, source ranges, and engine diagnostics. | FUNC-1, FUNC-7 |
| TECH-2 | Trace evidence extractor | `src/markdowntrace/trace-evidence/**` | Collect trace-link occurrences, raw ID occurrences, table contexts, ranges, role classifications, coverage rows, and candidate edges. | FUNC-1 |
| TECH-3 | Graph profile schema and loader | `src/markdowntrace/graph-profile/**` | Load built-in and file-backed graph profiles, validate profile schema, and expose the artifact-family relationship and path rules defined below. | FUNC-2, FUNC-7 |
| TECH-4 | Evidence graph projector | `src/markdowntrace/graph-validation/**` | Project trace evidence into a graph-validation model with nodes, relationships, coverage rows, ranges, and authority labels. | FUNC-3, FUNC-5 |
| TECH-5 | Graph validation rule engine | `src/markdowntrace/graph-validation/**` | Evaluate unresolved references, duplicate primaries, invalid ranges, missing matrix coverage, missing required paths, and profile-specific relationship constraints. | FUNC-3 |
| TECH-6 | Diagnostic schema and formatter | `src/markdowntrace/graph-validation/**`, `src/markdowntrace/reporting/**` | Emit stable diagnostic codes, severity, source ranges, related IDs, profile rule IDs, and repair target hints. | FUNC-3, FUNC-5 |
| TECH-7 | Report and graph export renderer | `src/markdowntrace/reporting/**` | Render Markdown, JSON, and Mermaid-oriented graph reports from graph validation results. | FUNC-5 |
| TECH-8 | Repair-plan generator | `src/markdowntrace/graph-repair/**` | Convert blocking graph diagnostics into non-mutating repair-plan actions with confidence, source evidence, and validation targets. | FUNC-4 |
| TECH-9 | CLI command adapters | `src/markdowntrace/cli.ts` plus command modules | Add `trace-evidence`, `graph-validate`, `graph-report`, and `graph-repair-plan` commands with stable exit codes. | FUNC-1, FUNC-2, FUNC-3, FUNC-4, FUNC-5, FUNC-7 |
| TECH-10 | Canonical serialization and hashing | Shared serialization utilities | Produce byte-stable JSON, input hashes, graph profile hashes, and deterministic ordering. | FUNC-1, FUNC-3, FUNC-5 |
| TECH-11 | Compatibility regression harness | Tests and fixture support | Prove existing authoritative commands and R1 fixtures remain unchanged. | FUNC-6 |
| TECH-12 | Built-in graph profiles and fixtures | `fixtures/profile-aware-graph-validation/**` or equivalent | Provide execution-spec and design-spec graph profiles, positive fixtures, and negative fixtures. | FUNC-2, FUNC-3 |

Graph profile contract: `markdown-trace.graph-profile.v1` is the production graph semantic profile shape for this effort. A valid profile shall contain `schemaVersion`, `profileId`, `artifactFamily`, `profileVersion`, `idFamilies`, `definitionPolicies`, `tableRoles`, `rangePolicy`, `matrixSemantics`, `relationshipClasses`, `requiredPaths`, `diagnosticRules`, and `serialization` fields. `schemaVersion` shall be exactly `markdown-trace.graph-profile.v1`; `artifactFamily` shall initially be `execution-spec` or `design-spec`; `serialization.ordering` shall define deterministic sort keys for definitions, coverage rows, ranges, relationships, diagnostics, and repair actions. Profile load failure is an operational failure with exit `2`.

Profile policy contract:

| Profile field | Required production rule |
| --- | --- |
| `idFamilies` | Declares each supported family prefix, canonical label pattern, role bucket, and whether same-document primary definition is required for references to resolve. |
| `definitionPolicies.primaryColumns` | Lists table column names or heading signals that may create `primary_definition` occurrences; matrix cells and coverage-only columns are forbidden as primary sources. |
| `definitionPolicies.supplementalColumns` | Lists table columns or sections that may create `supplemental_definition` occurrences only after a same-label primary definition exists. |
| `definitionPolicies.repeatedIdPolicy` | Declares one of `single_primary_with_references`, `primary_with_supplemental_definition`, `coverage_or_reference_only`, `mention_only`, or `non_authoritative_table_candidate` for each family. |
| `tableRoles` | Declares table matching rules, source label columns, target label columns, role classification, and whether row evidence may create relationships, coverage rows, supplemental definitions, or diagnostics. |
| `rangePolicy` | Allows only same-family `FAMILY-n through FAMILY-m` ranges; endpoints must resolve to same-document primary or supplemental definitions before range expansion. Missing endpoints emit `markdown-trace.graph.invalid_range_endpoint`. |
| `matrixSemantics` | Declares traceability matrices as coverage evidence only; first-column labels may source `matrix_coverage` relationships, but matrix cells never create primary or supplemental definitions. |
| `diagnosticRules` | Maps unresolved references, duplicate primary definitions, invalid range endpoints, missing matrix coverage, missing required paths, and profile errors to stable diagnostic codes, severity, blocking behavior, and repair action kinds. |

Production role classification rules:

| Role | Creation rule | Authority status | Failure behavior |
| --- | --- | --- | --- |
| `primary_definition` | First accepted occurrence in a profile-declared primary definition position. | Non-registry trace evidence authority only. | A second primary for the same label emits `markdown-trace.graph.duplicate_primary_definition`. |
| `supplemental_definition` | Later occurrence in a profile-declared supplemental position after a primary exists and the family policy allows supplemental definitions. | Clarifies or restates trace evidence; does not replace primary. | If no primary exists, classify as coverage or unresolved reference according to the family policy. |
| `coverage_reference` | ID-like occurrence in relationship, validation, dependency, evidence, matrix, or traceability coverage cells. | Non-authoritative reference. | Missing target definition emits `markdown-trace.graph.unresolved_reference` unless the family is coverage-or-mention-only. |
| `mention` | Prose or table occurrence without profile-declared definition or coverage signal. | Non-authoritative mention. | Does not block validation by itself. |
| `table_evidence_candidate` | Typed table-only `ctx://trace` link without heading ownership. | Non-authoritative candidate. | May be reported but shall not become primary authority. |
| `range_evidence` | Raw same-family range expression. | Non-authoritative until endpoints resolve. | Missing endpoint emits `markdown-trace.graph.invalid_range_endpoint`. |

Built-in family buckets:

| Artifact family | Primary definition families | Supplemental definition families | Coverage-only families | Mention-only families | Coverage-or-mention-only families |
| --- | --- | --- | --- | --- | --- |
| `execution-spec` | `ASM`, `CON`, `CTRL`, `DEP`, `MS`, `MV`, `NG`, `OBJ`, `OBS`, `PKG`, `REL`, `REV`, `RISK`, `SRC`, `SURF`, `VAL`, `WP` | `RISK` | `EVD` | `DP`, `SHA` | `ACC`, `BEL`, `REQ` |
| `design-spec` | `ACC`, `FLOW`, `FUNC`, `NG`, `OBJ`, `REQ`, `RISK`, `TECH`, `VAL` | none initially | none initially | `ASM`, `CON` | none initially |

Built-in repeated-ID policies:

| Policy | Applies to | Rule |
| --- | --- | --- |
| `single_primary_with_references` | Most primary definition families in both built-in profiles. | One primary definition is allowed; later occurrences outside supplemental positions are coverage references or mentions. |
| `primary_with_supplemental_definition` | `RISK` in the execution-spec profile. | One primary definition is allowed; later profile-approved risk register rows are supplemental definitions. |
| `coverage_or_reference_only` | `EVD` in the execution-spec profile. | Occurrences are coverage references or unresolved references; they do not create primary or supplemental definitions. |
| `mention_only` | `DP`, `SHA`, and other non-trace labels listed by profile. | Occurrences are mentions and do not participate in required paths. |
| `non_authoritative_table_candidate` | Table-only typed `ctx://trace` links without heading ownership. | Occurrences remain candidates and do not enter required-path validation as definitions. |

Built-in execution-spec table role selectors:

| Selector ID | Table or row match | Primary or source columns | Target columns | Effect |
| --- | --- | --- | --- | --- |
| `exec.definition_table` | Non-matrix table row whose first ID-like cell belongs to a primary execution family. | First ID-like cell in a row for `ASM`, `CON`, `CTRL`, `DEP`, `MS`, `MV`, `NG`, `OBJ`, `OBS`, `PKG`, `REL`, `REV`, `RISK`, `SRC`, `SURF`, `VAL`, or `WP`. | Remaining ID-like cells in the same row, classified by column heading. | First accepted label creates `primary_definition`; target cells create coverage references and raw candidate edges. |
| `exec.risk_supplemental_table` | Later risk register or risk review table row whose first ID-like cell is an already-primary `RISK`. | First `RISK-*` cell. | Mitigation, validation, evidence, milestone, review, and related-ID cells. | Creates `supplemental_definition` for the repeated risk label and coverage references for target cells. |
| `exec.matrix_table` | Traceability matrix table identified by heading containing `Traceability Matrix` or by columns containing a source ID column plus package/work/validation/evidence coverage columns. | First ID-like cell in the row. | All remaining ID-like cells in matrix coverage columns. | Creates `matrix_coverage` evidence only; no cell creates primary or supplemental definitions. |
| `exec.range_cell` | Any execution-spec table or prose span containing `FAMILY-n through FAMILY-m`. | Owning row label or nearest source occurrence. | Same-family range endpoints and expanded members after endpoint validation. | Creates `range_evidence`; valid endpoints may expand coverage evidence, while missing endpoints emit invalid-range diagnostics. |
| `exec.ctx_table_candidate` | Table-only typed `ctx://trace` link not owned by a heading. | Link label and type. | Adjacent row references. | Creates `table_evidence_candidate` only; it never creates primary authority. |

Built-in execution-spec column mapping:

| Column signal | Normalized role | Relationship or diagnostic behavior |
| --- | --- | --- |
| `ID`, `Source`, `Objective`, `Package`, `Work package`, `Milestone`, `Validation`, `Review`, `Release`, `Observability`, `Control`, `Risk`, `Dependency`, `Surface`, `Assumption`, `Constraint`, `Non-objective` | Primary/source label column when not in a matrix; matrix source when in a matrix. | May create `primary_definition` outside matrices; matrix rows create coverage only. |
| `Validation`, `Validation checkpoint`, `Validation checkpoints`, `Evidence required to retire`, `Required evidence`, `Evidence`, `Evidence artifact`, `Completion evidence` | Coverage target column. | Creates `work_validated_by`, `validation_supported_by`, or supporting coverage relationships according to source and target family. |
| `Milestone`, `Completion horizon`, `Due point`, `Review gate`, `Decision gate` | Coverage target column. | Creates row-level coverage or supplemental relationship evidence; does not create definitions. |
| `Dependencies`, `Inputs`, `Authority`, `Execution implication`, `Package boundary`, `Related IDs` | Coverage target column. | Creates raw candidate edges with normalized relationship class when profile mapping exists; otherwise preserves raw evidence for reports. |

Built-in design-spec table role selectors:

| Selector ID | Table or row match | Primary or source columns | Target columns | Effect |
| --- | --- | --- | --- | --- |
| `design.objectives_table` | Section 2 objectives and non-objectives table. | `ID`. | Measurement or decision horizon cells containing IDs. | Creates `primary_definition` for `OBJ` and `NG`; target IDs become coverage references. |
| `design.requirements_table` | Section 5 requirements table. | `ID`. | `Verification` and rationale cells containing IDs. | Creates `primary_definition` for `REQ`; verification cells create `requirement_validated_by` raw evidence. |
| `design.behavior_table` | Section 8 flow and function table. | `ID`. | `Related requirements`. | Creates `primary_definition` for `FLOW` and `FUNC`; target cells create `requirement_realized_by_behavior` evidence after normalization. |
| `design.acceptance_table` | Section 10 acceptance table. | `ID`. | `Covers`. | Creates `primary_definition` for `ACC`; target cells create requirement or behavior acceptance evidence. |
| `design.requirements_traceability_table` | Section 11 requirements-to-behavior traceability table. | `Requirement`. | `Functional behaviors or flows`, `Acceptance coverage`. | Creates coverage references only; maps requirements to behavior and acceptance evidence. |
| `design.mechanisms_table` | Section 13 technical mechanisms table. | `ID`. | `Related behaviors`. | Creates `primary_definition` for `TECH`; target cells create behavior allocation evidence. |
| `design.verification_table` | Section 17 verification item table. | `ID`. | `Related IDs`. | Creates `primary_definition` for `VAL`; target cells create validation and mechanism-verification evidence. |
| `design.behavior_mechanism_matrix` | Section 17 behavior-or-requirement matrix. | `Behavior or requirement`. | `Mechanisms`, `Verification`. | Creates coverage references only; matrix cells never create definitions. |
| `design.risks_table` | Section 18 risks table. | `ID`. | Mitigation cells containing IDs. | Creates `primary_definition` for `RISK`; target cells become coverage references. |

Built-in design-spec column mapping:

| Column signal | Normalized role | Relationship or diagnostic behavior |
| --- | --- | --- |
| `ID` | Primary/source label column in profile-declared definition tables. | Creates one primary definition for the row label family. |
| `Requirement`, `Behavior or requirement` | Matrix source column. | Creates coverage source only; no definition authority. |
| `Related requirements`, `Functional behaviors or flows`, `Related behaviors` | Coverage target column. | Creates requirement-to-behavior or behavior-to-mechanism evidence after normalization. |
| `Acceptance coverage`, `Covers` | Coverage target column. | Creates requirement or behavior acceptance evidence. |
| `Verification`, `Related IDs`, `Mechanisms` | Coverage target column. | Creates requirement-validation, mechanism-verification, or behavior-allocation evidence after normalization. |

Relationship normalization rule: trace evidence preserves raw candidate-edge provenance from the source row and column. The evidence graph projector then emits normalized semantic relationships in the direction declared by the active graph profile. For example, a design-spec verification row may contain raw evidence from `VAL` to `REQ`, but the normalized relationship is `requirement_validated_by` from `REQ` to `VAL`. Reports shall expose both the normalized class and the raw evidence anchor so reviewers can audit direction choices.

Execution-spec built-in profile contract:

| Relationship class | Direction | Accepted evidence basis | Required path usage |
| --- | --- | --- | --- |
| `objective_implemented_by` | `OBJ` to `WP` | Objective row, work-package row, milestone row, or execution traceability matrix coverage. | Required for `exec.objective_to_evidence`. |
| `work_validated_by` | `WP` to `VAL` | Work-package validation checkpoint cell or execution traceability matrix coverage. | Required for `exec.objective_to_evidence` and `exec.work_to_evidence`. |
| `validation_supported_by` | `VAL` to `EVD` | Validation, review, milestone, evidence, or matrix coverage that links a validation checkpoint to evidence. | Required for `exec.objective_to_evidence` and `exec.work_to_evidence`. |
| `objective_supported_by_evidence` | `OBJ` to `EVD` | Objective row, milestone row, or matrix coverage naming evidence directly. | Supplemental evidence; does not replace the required `OBJ` to `WP` to `VAL` to `EVD` path. |
| `matrix_coverage` | Row source family to covered target family | Traceability matrix row only. | Coverage evidence only; matrix cells never create definitions. |
| `coverage_range` | Owning source occurrence to resolved same-family members | Same-family `FAMILY-n through FAMILY-m` expression after endpoint validation. | Expands path evidence only after both endpoints resolve. |

Execution-spec required path rules:

| Path ID | Source selector | Required normalized path | Blocking diagnostic on failure |
| --- | --- | --- | --- |
| `exec.objective_to_evidence` | Each primary `OBJ` outside traceability matrices. | `OBJ` -> `WP` by `objective_implemented_by`; `WP` -> `VAL` by `work_validated_by`; `VAL` -> `EVD` by `validation_supported_by`. | `markdown-trace.graph.missing_required_path` |
| `exec.work_to_evidence` | Each primary `WP` outside traceability matrices. | `WP` -> `VAL` by `work_validated_by`; `VAL` -> `EVD` by `validation_supported_by`. | `markdown-trace.graph.missing_required_path` |
| `exec.matrix_row_minimum` | Each execution traceability matrix row with source family `OBJ` or `WP`. | Row evidence contains or resolves to at least one `WP`, one `VAL`, and one `EVD` target when those families are applicable to the row source. | `markdown-trace.graph.missing_matrix_coverage` |

Design-spec built-in profile contract:

| Relationship class | Direction | Accepted evidence basis | Required path usage |
| --- | --- | --- | --- |
| `requirement_realized_by_behavior` | `REQ` to `FLOW` or `FUNC` | Behavior rows, function rows, requirements-to-behavior matrix, or validation matrix coverage. | Required for `design.requirement_to_validation`. |
| `behavior_allocated_to_mechanism` | `FLOW` or `FUNC` to `TECH` | Mechanism allocation rows, verification rows, or behavior-to-mechanism traceability coverage. | Required for `design.requirement_to_validation` when a `TECH` mechanism is required. |
| `requirement_accepted_by` | `REQ` to `ACC` | Acceptance rows, requirements-to-behavior matrix, or validation matrix coverage. | Required for `design.requirement_acceptance`. |
| `behavior_accepted_by` | `FLOW` or `FUNC` to `ACC` | Acceptance rows or acceptance coverage cells. | Supplemental path for acceptance confidence. |
| `requirement_validated_by` | `REQ` to `VAL` | Requirement verification cell, validation row, or verification matrix coverage. | Required for `design.requirement_to_validation`. |
| `mechanism_verified_by` | `TECH` to `VAL` | Verification row or behavior-to-mechanism traceability coverage. | Required for `design.mechanism_validation`. |
| `matrix_coverage` | Row source family to covered target family | Traceability matrix row only. | Coverage evidence only; matrix cells never create definitions. |

Design-spec required path rules:

| Path ID | Source selector | Required normalized path | Blocking diagnostic on failure |
| --- | --- | --- | --- |
| `design.requirement_to_validation` | Each primary `REQ`. | `REQ` -> `FLOW` or `FUNC` by `requirement_realized_by_behavior`; if a mechanism is allocated, `FLOW` or `FUNC` -> `TECH` by `behavior_allocated_to_mechanism`; `REQ` or allocated `TECH` -> `VAL` by `requirement_validated_by` or `mechanism_verified_by`. | `markdown-trace.graph.missing_required_path` |
| `design.requirement_acceptance` | Each primary `REQ`. | `REQ` -> `ACC` by `requirement_accepted_by`, or `REQ` -> `FLOW` or `FUNC` -> `ACC` by `requirement_realized_by_behavior` and `behavior_accepted_by`. | `markdown-trace.graph.missing_required_path` |
| `design.mechanism_validation` | Each primary `TECH` referenced by a requirement-driven behavior. | `TECH` -> `VAL` by `mechanism_verified_by`. | `markdown-trace.graph.missing_required_path` |

Section status: Complete

## 14. Data, Schemas, and Compatibility

| Change | Type | Compatibility impact | Reversibility | Mitigation |
| --- | --- | --- | --- | --- |
| Trace evidence result `markdown-trace.trace-evidence.v1` | Schema | Additive durable local schema; does not replace registry YAML. | Reversible | Keep schema distinct from `EntityRegistry`; include `authority: trace-evidence` and source hashes. |
| Graph profile `markdown-trace.graph-profile.v1` | Schema / Config | New graph semantic profile contract for execution-spec and design-spec artifact families. | Reversible | Version profiles, validate schema before use, and keep structural validation profiles unchanged. |
| Graph validation result `markdown-trace.graph-validation-result.v1` | Schema | New validation output with graph diagnostics and pass/fail status. | Reversible | Use stable diagnostic codes and exit code policy; do not alter current `ValidationResult`. |
| Graph repair plan `markdown-trace.graph-repair-plan.v1` | Schema | New non-mutating repair guidance artifact for agents and reviewers. | Reversible | Label actions as suggestions and require later authoring design before applying source edits. |
| CLI commands `trace-evidence`, `graph-validate`, `graph-report`, `graph-repair-plan` | API | Additive public CLI surface. | Reversible | Keep existing commands unchanged and cover new commands with CLI tests. |
| Built-in execution-spec and design-spec graph profiles | Config | Adds default profile selection for supported artifact families. | Reversible | Allow explicit profile path override and record profile hash in outputs. |
| Existing `EntityRegistry`, generated sidecar, `TraceGraph`, and registry validation schemas | Schema | No intended compatibility impact. | Reversible | VAL-12 runs existing compatibility proof commands and targeted tests. |

Schema contract summary:

| Schema | Required top-level fields | Required nested contract |
| --- | --- | --- |
| `markdown-trace.trace-evidence.v1` | `schemaVersion`, `authority`, `source`, `profile`, `run`, `definitions`, `supplementalDefinitions`, `coverageRows`, `mentions`, `ranges`, `candidateEdges`, `diagnostics`, `hashes` | `authority` is exactly `trace-evidence`; `source` contains `path`, `sha256`, and `lineCount`; `profile` contains `profileId`, `artifactFamily`, `profileVersion`, and `sha256`; `run` contains package and runtime versions but no wall-clock timestamp in canonical JSON; each occurrence contains `occurrenceId`, `label`, `family`, `role`, `sourceKind`, and `sourceRange`. |
| `markdown-trace.graph-profile.v1` | `schemaVersion`, `profileId`, `artifactFamily`, `profileVersion`, `idFamilies`, `definitionPolicies`, `tableRoles`, `rangePolicy`, `matrixSemantics`, `relationshipClasses`, `requiredPaths`, `diagnosticRules`, `serialization` | `idFamilies`, `definitionPolicies`, `tableRoles`, `rangePolicy`, and `matrixSemantics` implement the section 13 profile policy and built-in selector contracts; `relationshipClasses` declares normalized `class`, `sourceFamilies`, `targetFamilies`, `direction`, and accepted evidence bases; `requiredPaths` declares `pathId`, source selector, required relationship sequence, severity, and diagnostic code; `serialization` declares canonical sort keys. |
| `markdown-trace.graph-validation-result.v1` | `schemaVersion`, `status`, `source`, `profile`, `run`, `nodes`, `relationships`, `requiredPathResults`, `matrixCoverageResults`, `diagnostics`, `summary`, `hashes` | `status` is `pass`, `fail`, or `operational-error`; `relationships` contain normalized class, source ID, target ID, source ranges, and raw evidence anchors; diagnostics contain code, severity, message, profile rule ID, affected IDs, source ranges, blocking flag, and optional repair target ID. |
| `markdown-trace.graph-repair-plan.v1` | `schemaVersion`, `source`, `profile`, `validationResult`, `run`, `status`, `actions`, `summary` | `status` is `available`, `partial`, or `unavailable`; each action contains `actionId`, diagnostic code, action kind, confidence from `0` to `1`, affected IDs, source ranges, suggested non-mutating action text, expected relationship or definition target, and validation target command. |

Diagnostic code contract:

| Diagnostic code | Severity default | Blocking | Required repair action kind |
| --- | --- | --- | --- |
| `markdown-trace.graph.unresolved_reference` | Error | Yes | `define_missing_id` or `remove_or_replace_reference` |
| `markdown-trace.graph.duplicate_primary_definition` | Error | Yes | `deduplicate_primary_definition` |
| `markdown-trace.graph.invalid_range_endpoint` | Error | Yes | `define_range_endpoint` or `narrow_range` |
| `markdown-trace.graph.missing_matrix_coverage` | Error | Yes | `add_matrix_coverage` |
| `markdown-trace.graph.missing_required_path` | Error | Yes | `add_required_relationship_evidence` |
| `markdown-trace.graph.profile_error` | Error | Yes | `fix_graph_profile` |

CLI and library contract summary:

| Surface | Required inputs | Required output behavior | Exit behavior |
| --- | --- | --- | --- |
| `markdown-trace trace-evidence` | `--file <markdown>`, `--profile <profile-or-built-in>`, optional `--output <path>`, optional `--format json` | Emits canonical `markdown-trace.trace-evidence.v1` JSON to stdout or the output path. | `0` when extraction completed, `2` for operational failure. |
| `markdown-trace graph-validate` | `--file <markdown>` or `--trace-evidence <json>`, `--profile <profile-or-built-in>`, optional `--output <path>`, optional `--format json|markdown` | Emits `markdown-trace.graph-validation-result.v1` JSON by default or a Markdown report projection when requested. | `0` for pass, `1` for blocking graph diagnostics, `2` for operational failure. |
| `markdown-trace graph-report` | `--validation-result <json>` or `--file <markdown>` plus `--profile <profile-or-built-in>`, optional `--format markdown|json|mermaid` | Emits a non-authoritative graph report with schema version, profile ID, normalized relationships, raw evidence anchors, and diagnostic summary. | `0` when report generation completes, `1` only if validation was run and produced blocking graph diagnostics, `2` for operational failure. |
| `markdown-trace graph-repair-plan` | `--validation-result <json>` or `--file <markdown>` plus `--profile <profile-or-built-in>`, optional `--output <path>`, optional `--format json|markdown` | Emits `markdown-trace.graph-repair-plan.v1`; it does not write or patch source Markdown. | `0` when no blocking diagnostics exist and no plan is needed, `1` when blocking diagnostics remain and a plan is emitted, `2` for operational failure. |
| Library APIs | Typed options equivalent to CLI inputs. | Return discriminated result objects matching the same schema envelopes. | Do not call `process.exit`; return `pass`, `fail`, or `operational-error` status. |

Section status: Complete

## 15. Control Logic and Non-Functional Controls

Control logic summary: CLI commands resolve inputs, load the graph profile, read the source Markdown, parse and normalize through markdown-engine, extract trace evidence, project an evidence graph, run profile-specific validation rules, serialize reports or repair plans, and return stable exit codes. Operational failures short-circuit with exit `2`; graph validation failures return exit `1`; successful validation returns exit `0`.

Concurrency and ordering model: Each command invocation is single-document and single-process. Evidence, nodes, relationships, diagnostics, and repair-plan entries are sorted by source range, role priority, identifier, diagnostic code, and message to produce byte-stable output. No shared runtime state or background concurrency is introduced.

Failure recovery model: Operational failures leave source Markdown unchanged and either avoid artifact writes or write only complete requested output artifacts. Graph validation failures are normal outputs and may produce repair plans. Compatibility failure blocks launch until the regression is fixed or the graph validation change is reverted.

| Requirement | Mechanism | Notes |
| --- | --- | --- |
| REQ-1 | TECH-1, TECH-2 | Public engine APIs preserve parser boundary. |
| REQ-2 | TECH-3, TECH-12 | Standalone profiles encode artifact-family semantics. |
| REQ-3 | TECH-2, TECH-4, TECH-6, TECH-10 | Trace evidence and metadata are schema-versioned. |
| REQ-4 | TECH-4, TECH-5, TECH-6 | Validation rules cover R0 smoke diagnostic families and required paths. |
| REQ-5 | TECH-3, TECH-5, TECH-12 | Execution-spec profile declares OBJ/WP/VAL/EVD path policy. |
| REQ-6 | TECH-3, TECH-5, TECH-12 | Design-spec profile declares REQ/FUNC/TECH/ACC/VAL path policy. |
| REQ-7 | TECH-6, TECH-7 | Reports are generated from validation result data. |
| REQ-8 | TECH-6, TECH-8 | Repair plans derive from diagnostics and remain non-mutating. |
| REQ-9 | TECH-9 | CLI adapters enforce command mode and exit behavior. |
| REQ-10 | TECH-10 | Canonical serialization and stable ordering produce byte-stable output. |
| REQ-11 | TECH-11 | Existing command behavior is regression-tested. |
| REQ-12 | TECH-5, TECH-9 | Rule engine and CLI adapter map result classes to exit codes. |
| REQ-13 | TECH-1, TECH-2, TECH-5, TECH-10 | Single-pass extraction and bounded validation support performance target. |
| REQ-14 | TECH-1, TECH-9, TECH-11 | Local-only dependencies and tests prevent external side effects. |

Section status: Complete

## 16. Observability, Operations, Rollout, and Rollback

| Signal | Type | Purpose | Consumer |
| --- | --- | --- | --- |
| Graph validation exit code | Audit | Distinguish pass, graph failure, and operational failure. | CLI user, CI, agent |
| Diagnostic summary by code and severity | Log / Audit | Show graph validation failure classes and repair targets. | Reviewer, agent |
| Input Markdown SHA-256 | Audit | Prove report and repair plan correspond to a specific source file. | Reviewer, agent |
| Graph profile SHA-256 and profile version | Audit | Prove validation used the intended semantic profile. | Reviewer, CI |
| Trace evidence and validation result schema version | Audit | Support stable agent parsing and compatibility review. | Agent, maintainer |
| Command duration and input line count | Metric | Detect performance regressions against the 10,000-line target. | Maintainer |
| Compatibility command transcript | Audit | Prove existing authoritative paths remain intact. | Markdown Trace maintainer |

Rollout plan: Implement the feature as additive modules and CLI commands behind normal package build and test gates. First land schemas, profile loading, and positive fixtures; then land extraction and validation; then land reports and repair plans; then run full compatibility evidence before implementation approval. Do not remove R0 experiment artifacts until production fixture evidence covers the same claims.

Rollback or containment plan: Trigger rollback or containment if VAL-12 compatibility commands regress, any graph command mutates source Markdown, graph evidence enters `EntityRegistry` or production `TraceGraph`, canonical JSON is not byte-stable under VAL-10, the schema/version envelopes do not match section 14, or the performance fixture misses the VAL-11 threshold after one focused optimization pass. Roll back by reverting the additive graph-profile, trace-evidence, graph-validation, graph-reporting, graph-repair, CLI, and fixture changes. No persistent data migration, source mutation, registry schema change, or generated sidecar migration is introduced, so containment is complete by disabling or reverting new commands.

Operator actions: Operators run `graph-validate` locally or in CI, inspect graph validation reports for blocking diagnostics, use `graph-repair-plan` only as non-mutating guidance, and continue using existing `derive`, `derive-sidecar`, `validate`, and `migration-check` commands for authoritative registry work.

Section status: Complete

## 17. Verification Strategy and Behavior-to-Mechanism Traceability

| ID | Verification method | What is verified | Related IDs |
| --- | --- | --- | --- |
| VAL-1 | Test | Trace evidence extraction captures headings, tables, prose, `ctx://trace` links, raw labels, ranges, source ranges, and run metadata. | REQ-1, REQ-3, FUNC-1, TECH-1, TECH-2 |
| VAL-2 | Test / Inspection | Graph profile loader accepts valid execution-spec and design-spec profiles, rejects malformed profiles with stable diagnostics, and exposes the profile policy, table role selectors, column mappings, relationship classes, and required path rules defined in section 13. | REQ-2, FUNC-2, TECH-3, TECH-12 |
| VAL-3 | Snapshot test | Trace evidence result uses `markdown-trace.trace-evidence.v1`, required section 14 fields, stable ordering, source hashes, profile metadata, and non-authority labels. | REQ-3, FUNC-1, TECH-2, TECH-10 |
| VAL-4 | Test | Negative fixtures emit expected unresolved reference, duplicate primary definition, invalid range endpoint, missing matrix coverage, and missing required path diagnostics. | REQ-4, REQ-12, FUNC-3, TECH-5, TECH-6 |
| VAL-5 | Test | Execution-spec positive and negative fixtures validate or fail section 13 `OBJ` to `WP` to `VAL` to `EVD` paths while matrix cells remain non-authoritative. | REQ-5, FUNC-3, TECH-5, TECH-12 |
| VAL-6 | Test | Design-spec positive and negative fixtures validate or fail section 13 `REQ` to `FLOW` or `FUNC` to `TECH` or `ACC` to `VAL` coverage paths. | REQ-6, FUNC-3, TECH-5, TECH-12 |
| VAL-7 | Inspection / Snapshot test | Graph validation report is readable by humans and agents and includes normalized relationship classes, raw evidence anchors, diagnostics, source evidence, and authority labels. | REQ-7, FUNC-5, TECH-6, TECH-7 |
| VAL-8 | CLI test | New CLI commands expose read-only behavior, section 14 schema envelopes, and correct exit codes for pass, graph failure, and operational failure. | REQ-9, REQ-12, FUNC-7, TECH-9 |
| VAL-9 | Test / Inspection | Repair-plan output is non-mutating, source-backed, confidence-labeled, and tied to validation targets. | REQ-8, REQ-9, FUNC-4, TECH-8 |
| VAL-10 | Determinism test | Repeated runs over identical inputs produce byte-identical JSON artifacts. | REQ-3, REQ-10, FUNC-1, FUNC-3, TECH-10 |
| VAL-11 | Performance test | A generated 10,000-line Markdown fixture validates with a median of 10 seconds or less across three consecutive runs under documented Node.js 22.x local benchmark conditions. | REQ-13, FUNC-3, TECH-1, TECH-2, TECH-5 |
| VAL-12 | Regression test | `npm run build --silent`, `npm test`, `npm run derive:fixture`, `npm run validate:fixture`, `npm run migration:check`, and targeted R1 tests pass. | REQ-11, FUNC-6, TECH-11 |
| VAL-13 | Inspection / Local safety test | Implementation uses only public engine APIs, performs no network calls, evaluates no executable content, and performs no live external-system mutation. | REQ-14, FUNC-7, TECH-1, TECH-9, TECH-11 |

| Behavior or requirement | Mechanisms | Verification |
| --- | --- | --- |
| FUNC-1 | TECH-1, TECH-2, TECH-10 | VAL-1, VAL-3, VAL-10 |
| FUNC-2 | TECH-3, TECH-12 | VAL-2 |
| FUNC-3 | TECH-4, TECH-5, TECH-6, TECH-12 | VAL-4, VAL-5, VAL-6, VAL-8 |
| FUNC-4 | TECH-6, TECH-8 | VAL-9 |
| FUNC-5 | TECH-6, TECH-7 | VAL-7 |
| FUNC-6 | TECH-11 | VAL-12 |
| FUNC-7 | TECH-1, TECH-3, TECH-9, TECH-11 | VAL-2, VAL-8, VAL-13 |
| REQ-1 | TECH-1, TECH-2 | VAL-1 |
| REQ-2 | TECH-3, TECH-12 | VAL-2 |
| REQ-3 | TECH-2, TECH-4, TECH-6, TECH-10 | VAL-3, VAL-10 |
| REQ-4 | TECH-4, TECH-5, TECH-6 | VAL-4 |
| REQ-5 | TECH-3, TECH-5, TECH-12 | VAL-5 |
| REQ-6 | TECH-3, TECH-5, TECH-12 | VAL-6 |
| REQ-7 | TECH-6, TECH-7 | VAL-7 |
| REQ-8 | TECH-6, TECH-8 | VAL-9 |
| REQ-9 | TECH-9 | VAL-8, VAL-9 |
| REQ-10 | TECH-10 | VAL-10 |
| REQ-11 | TECH-11 | VAL-12 |
| REQ-12 | TECH-5, TECH-9 | VAL-8 |
| REQ-13 | TECH-1, TECH-2, TECH-5, TECH-10 | VAL-11 |
| REQ-14 | TECH-1, TECH-9, TECH-11 | VAL-13 |

Section status: Complete

## 18. Alternatives, Risks, Open Questions, and Final Exit

| Alternative | Reason considered | Reason rejected |
| --- | --- | --- |
| Keep using heading or `ctx://trace` authoritative derive only | Lowest compatibility risk and already implemented. | It leaves table-first generated specs without graph validation value. |
| Promote table IDs directly into `EntityRegistry` | Produces authoritative graphs quickly. | R0 showed false-authority risk around matrices and repeated IDs; this requires a separate migration design. |
| Use markdown-engine structural validation profiles as graph profiles | Existing profiles already know many sections and table shapes. | R0 resolved that graph semantics are separate semantic trace-evidence claims. |
| Ship candidate graph visualization only | Could deliver a graph view faster. | User goals require validation, diagnostics, and repair-loop inputs, not just visualization. |
| Implement source mutation in this slice | Would move toward safer authoring automation sooner. | Source mutation needs patch, rollback, and authoring design gates beyond this graph-validation scope. |

| ID | Statement | Likelihood | Consequence | Mitigation |
| --- | --- | --- | --- | --- |
| RISK-1 | Users may mistake trace evidence or graph validation output for authoritative registry output. | Medium | High | Use schema names, CLI copy, report labels, and compatibility tests that preserve the authority boundary. |
| RISK-2 | Relationship vocabulary may still be too artifact-specific for a single universal profile. | Medium | Medium | Ship execution-spec and design-spec graph profiles first and normalize shared relationship classes only where evidence supports them. |
| RISK-3 | Repair-plan output may be treated as permission to mutate source Markdown. | Medium | Medium | Label repair plans as non-mutating guidance and exclude apply behavior from this implementation. |
| RISK-4 | Graph validation diagnostics may be noisy for generated specs with intentionally incomplete drafts. | Medium | Medium | Include severity, profile rule IDs, and repair-plan confidence so agents can distinguish blockers from advisory gaps. |
| RISK-5 | New commands may regress existing registry derivation or validation behavior. | Low | High | Keep modules additive and run VAL-12 compatibility commands before approval. |
| RISK-6 | Performance may degrade on large generated specs. | Low | Medium | Use single-pass extraction, canonical ordering, and VAL-11 performance fixture. |

No open questions

Waivers: none

Final readiness statement: Ready for implementation

Section status: Complete

## Final Consistency Gate

| Check | Result |
| --- | --- |
| Every section from 0 through 18 has an allowed status. | Pass |
| Every `REQ-*` from section 5 appears in section 11 and section 17. | Pass |
| Every `FUNC-*` from section 8 appears in section 17. | Pass |
| Every `TECH-*` from section 13 appears in section 17. | Pass |
| Every `ACC-*` referenced anywhere is defined in section 10. | Pass |
| Every `VAL-*` referenced anywhere is defined in section 17. | Pass |
| Every `Q-*` row has owner, due date, and resolution plan. | Pass; no open questions. |
| Deferred sections are permitted and backed by resolution plans. | Pass; no section is deferred. |
| R3 trigger check. | Pass; no safety, security, compliance, irreversible data, high-volume platform, or constrained rollback trigger applies. |
| Final readiness statement matches rigor level. | Pass; `R2` maps to `Ready for implementation`. |

## Internal Review Record

| Field | Value |
| --- | --- |
| Document | Markdown Trace Profile-Aware Graph Validation Design Specification |
| Review date | 2026-06-07 |
| Moderator | Codex |
| Decision owner | Project owner |
| Proposed rigor level | `R2` |
| Reviewed rigor level | `R2` |
| Structural result | Pass after revision |
| Semantic result | Pass after revision |
| Traceability result | Pass after revision |
| Verdict | Approve for implementation |
| Open findings | none |
| Resolved findings verified in this decision | `SM-1`, `TR-1`, `ST-2`, `SM-2`, `SM-3`, `SM-4` |
| Reviewed waivers | none |
| Required heightened controls | none |
| Approval conditions | none |
| Top blockers | none |
| Required follow-ups | Separate design for source mutation and separate migration design for table-derived registry authority. |

Calibration result: R2 is correct because the design asks for production implementation of additive local CLI, library, schema, profile, diagnostic, report, and repair-plan contracts. It does not qualify as R1 because the public surfaces and schemas are durable. It does not require R3 because there is no network, security boundary, live external-system mutation, irreversible data migration, source mutation, or constrained rollback.

Findings addressed:

- SM-1 Major, resolved: Section 14 now defines schema envelopes, required top-level fields, nested field contracts, diagnostic codes, and CLI/library behavior for the durable trace-evidence, graph-profile, graph-validation-result, and graph-repair-plan surfaces.
- TR-1 Major, resolved: Section 13 now defines the initial execution-spec and design-spec relationship classes, normalized direction rules, required path rules, matrix semantics, range behavior, and blocking diagnostic mapping.
- ST-2 Minor, resolved: Section 16 now names rollback triggers for compatibility regression, source mutation, authority-boundary violation, determinism failure, schema mismatch, and persistent performance failure.
- SM-2 Minor, resolved: Section 10 and VAL-11 now define reproducible Node.js 22.x local benchmark conditions and the median-of-three performance threshold.
- SM-3 Major, resolved: Section 13 now defines graph profile policy fields, role classification rules, built-in family buckets, repeated-ID policies, range policy, and matrix semantics; section 14 and VAL-2 now require those fields in the profile schema and verification contract.
- SM-4 Major, resolved: Consensus review found the built-in table-role and column-mapping contract under-specified. Section 13 now defines execution-spec and design-spec table role selectors, primary or source columns, target columns, and normalized column mapping behavior; section 14 and VAL-2 now require those selector contracts.

Semantic scores:

| Dimension | Score | Notes |
| --- | ---: | --- |
| Problem validity | 3 | R0 evidence gives direct table-first fixture data and current production gap. |
| Requirement quality | 3 | Requirements are singular, traceable, and bounded to read-only graph validation plus repair-plan output. |
| Functional adequacy | 3 | Flows cover execution-spec validation, design-spec validation, reports, repair plans, compatibility, and faults. |
| Technical feasibility | 3 | R0 prototype proves feasibility and sections 13 and 14 now define implementation-facing relationship, path, schema, CLI, and diagnostic contracts. |
| Non-functional adequacy | 3 | Determinism, performance, local safety, compatibility, rollback triggers, and schema compatibility have explicit validation gates. |
| Operational safety | 3 | Additive, local-only, read-only source behavior keeps rollback straightforward. |
| Verification adequacy | 3 | Verification covers risky graph claims, compatibility, determinism, performance, and local safety. |

Validation result: Passed deterministic Markdown validation with `design-spec-validation-profile.yaml`; 45 rules passed with 0 diagnostics.

Unresolved findings: none.

Readiness verdict: Ready for implementation.
