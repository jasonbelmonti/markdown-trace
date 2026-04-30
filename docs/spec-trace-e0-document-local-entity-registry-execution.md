# SpecTrace E0: Document-Local Entity Registry Prototype Execution

## Document Control

| Field | Value |
| --- | --- |
| Title | SpecTrace E0: Document-Local Entity Registry Prototype Execution |
| Status | Approved to investigate |
| Execution level | `E0` |
| Execution level justification | The work is a local prototype whose purpose is to retire uncertainty about document-local entity registries before production or integration scope is approved. |
| Author(s) | Codex |
| Executor(s) | Prototype implementer |
| Reviewers | Jason Belmonti |
| Decision owner | Jason Belmonti |
| Target branch, release, or milestone | SpecTrace R0 prototype implementation |
| Last updated | 2026-04-29 |
| Related source docs | `docs/spec-trace-r0-document-local-entity-registry.md`; PR #1 `[codex] Address design review observations` ([#1](https://github.com/jasonbelmonti/spec-trace/pull/1), merge commit `2b7f760`) |
| Related tickets | None |

## 0. Execution Summary

Decision requested: Approve to investigate

Approved outcome: Execute `SRC-1` by producing a local, read-only prototype that validates one execution-spec fixture family against a document-local YAML entity registry and emits deterministic pass/fail evidence for the R0 decision.

Execution approach: Build the prototype through `WP-1` fixture and registry setup, `WP-2` first end-to-end valid-fixture proof, `WP-3` negative validation rules, `WP-4` determinism and local-safety proof, and `WP-5` evidence capture for decision review.

Entry condition: Merged PR #1 source-document cleanup is available in the implementation branch, and the decision owner confirms the E0 scope remains local-only.

Top risks or unknowns:

- RISK-1: Registry maintenance effort may exceed the value of detected reference failures.
- RISK-2: Markdown scanning may be too brittle for realistic execution-spec prose.
- RISK-3: Collision handling may be over-designed before cross-system projections are in scope.

Section status: Complete

## Layer 1: Execution Basis

## 1. Source Authority and Scope

| ID | Source | Authority | Execution implication |
| --- | --- | --- | --- |
| SRC-1 | `docs/spec-trace-r0-document-local-entity-registry.md` | Approved R0 design document | Defines the prototype scope, requirements, constraints, validation categories, risks, and continue/pivot/stop criteria. |
| SRC-2 | Consensus review verdict on the R0 design, recorded in the R0 internal review record at merge commit `2b7f760` | Three-reviewer consensus approval | Confirms duplicate canonical ID coverage and fixture-family scope are review-acceptable for R0. |
| SRC-3 | PR #1 `[codex] Address design review observations` ([#1](https://github.com/jasonbelmonti/spec-trace/pull/1), merge commit `2b7f760`) | Merged PR cleanup of non-blocking review observations | Provides clarified acceptance coverage and external-reference wording that implementation shall follow. |

In scope: Local fixture Markdown, document-local YAML registry, parser/scanner sufficient for the R0 fixture family, in-memory entity graph, deterministic validation report, local CLI or script harness, tests or fixture runs for `VAL-1` through `VAL-7`, and evidence capture.

Out of scope: Live Linear, Jira, or project-management mutation; graph database; persistent service; multi-document namespace; production parser substrate selection; markdown-engine modification; hosted deployment; irreversible migration.

Definition of done: The prototype can run locally against the valid fixture and required negative fixture variants, produce deterministic ordered output, demonstrate no network or live external mutation, and provide evidence for the section 6 continue/pivot/stop criteria in `SRC-1`.

Re-decision boundaries: Execution shall not re-decide YAML as the registry format, document-local scope, no-network constraint, or external issue-key default behavior. If implementation evidence invalidates any of those decisions, execution pauses and the decision owner resolves the design question before scope expands.

Section status: Complete

## 2. Objectives and Non-Objectives

| ID | Statement | Completion horizon | Evidence |
| --- | --- | --- | --- |
| OBJ-1 | Prove one fixture family can reconcile Markdown entity definitions with a document-local YAML registry. | Completion of `MS-1` and `MS-2`. | `EVD-1`, `EVD-2` |
| OBJ-2 | Prove deterministic validation catches missing registered entity definitions, duplicate canonical IDs, duplicate labels, missing references, missing edge targets, and incomplete bounded ranges. | Completion of `MS-2`. | `EVD-3`, `EVD-4` |
| OBJ-3 | Determine whether canonical dotted IDs and human labels are acceptable for agent-authored specs through manual inspection of registry and report usability. | Completion of `MS-3`. | `EVD-7` |
| OBJ-4 | Prove issue-key tokens such as `BEL-858` stay outside the document entity graph unless registered as external references. | Completion of `MS-2`. | `EVD-5` |
| OBJ-5 | Produce a decision record comparing registry maintenance effort against detected validation value. | Completion of `MS-3`. | `EVD-7` |
| NG-1 | This execution will not validate live Linear, Jira, or other project-management projections. | Entire E0 execution. | Review of `REL-1`, `VAL-6` |
| NG-2 | This execution does not include a graph database, service daemon, or multi-document namespace. | Entire E0 execution. | Review of `SURF-*` and `PKG-*` boundaries |
| NG-3 | This execution will not modify `markdown-engine` or choose its final parser substrate. | Entire E0 execution. | Review of `SURF-5`, `CTRL-2` |

Section status: Complete

## 3. Ownership, Roles, and Decision Points

| Role or person | Responsibility | Required action |
| --- | --- | --- |
| Prototype implementer | Build the local prototype and produce evidence artifacts. | Execute |
| Jason Belmonti | Own R0 decision, milestone approval, and continue/pivot/stop outcome. | Approve |
| Code reviewer | Review implementation boundaries, validation evidence, and no-network safety. | Review |
| Future SpecTrace maintainer | Consume evidence and follow-up questions. | Inform |

Decision points:

- DP-1: Approve this E0 execution spec before implementation begins.
- DP-2: Approve `MS-1` before adding full negative-case breadth.
- DP-3: Approve `MS-2` before decision-record completion.
- DP-4: Approve `MS-3` to continue, pivot, or stop after prototype evidence is captured.

Escalation path: If a required validation category cannot be implemented locally, if the scanner requires production parser scope, or if network/live-system behavior becomes necessary, the implementer pauses and escalates to Jason Belmonti for design revision.

Section status: Complete

## 4. Constraints, Assumptions, and Dependencies

| ID | Type | Statement | Owner | Blocking? | Validation or resolution plan |
| --- | --- | --- | --- | --- | --- |
| CON-1 | Constraint | Execution remains local-only, read-only except for repository artifacts, and performs no network calls during validation. | Prototype implementer | No | Validate through `VAL-6` and `MS-2`. |
| CON-2 | Constraint | The fixture set is one fixture family derived from one source execution spec and one document-local registry, with local variants or generated mutations. | Prototype implementer | No | Validate through `VAL-2`, `VAL-3`, and fixture inventory review. |
| CON-3 | Constraint | Canonical entity IDs use dotted lowercase syntax; display labels remain separate. | Prototype implementer | No | Validate through `VAL-1`, `VAL-2`, `VAL-3`, and `VAL-7`. |
| ASM-1 | Assumption | A Node.js TypeScript local CLI or script harness using npm and Vitest is sufficient for the E0 prototype. | Prototype implementer | No | Re-estimate if implementation requires a service, daemon, or non-TypeScript package. |
| ASM-2 | Assumption | The fixture-family Markdown scanner can be simple and deterministic without full GFM support. | Prototype implementer | No | Retire through `VAL-2`, `VAL-3`, and `RISK-2` evidence. |
| DEP-1 | Dependency | Merged PR #1 cleanup must be present before prototype implementation begins. | Prototype implementer | Yes | Confirm branch source in the entry gate; equivalent wording in the implementation branch is acceptable. |

Section status: Complete

## Layer 2: Execution Plan

## 5. Evidence-Led Execution Model

Observable outcome: A local operator can run one command against the fixture family and registry and inspect deterministic pass/fail output for entity definitions, references, edges, ranges, collision behavior, and local safety.

Core value proposition: The prototype converts identifier-rich execution specs from prose-only artifacts into locally verifiable handoff artifacts without committing SpecTrace to production integration or storage scope.

Critical path hypothesis: If the implementation can load the registry, scan the fixture Markdown, resolve canonical IDs and labels into an in-memory graph, and emit a stable report for valid and broken variants, then the document-local registry model is valuable enough to evaluate for the next design slice.

First proving slice: `WP-2` shall make the valid fixture and registry produce a passing report with stable summary output before broader negative-case breadth is implemented.

Sequencing principle: Sequence by risk retirement and progressive value: prove one valid end-to-end path first, then add negative categories, then prove determinism/local safety, then capture the maintenance and decision evidence.

Validation cadence: Each work package produces at least one `VAL-*` result before the next milestone gate. `MS-1` reviews the first proof, `MS-2` reviews validation breadth, and `MS-3` reviews the R0 continue/pivot/stop decision evidence.

Deferred completeness: Full Markdown semantics, multi-document IDs, live external-system projection, persistent graph storage, polished packaging, and markdown-engine integration are deferred until after `MS-3`.

Primary risks and unknowns:

| ID | Risk or unknown | Why it matters | Owner | Evidence required to retire | Decision gate |
| --- | --- | --- | --- | --- | --- |
| RISK-1 | Registry upkeep costs more than detected failure value. | If maintenance effort is higher than detected errors, the R0 model should stop or pivot. | Prototype implementer | Edit-count and finding-count comparison in `EVD-7`. | `MS-3` |
| RISK-2 | Markdown scanner misses realistic references or over-matches prose. | Scanner brittleness could invalidate the model or require parser investment. | Prototype implementer | `VAL-2`, `VAL-3`, and examples of scanner hits/misses in `EVD-2` and `EVD-3`. | `MS-2` |
| RISK-3 | Collision handling is over-scoped before live Linear or Jira projection is in scope. | Prototype effort could drift into projection policy before document-local behavior is proven. | Prototype implementer | `VAL-4` collision fixture and documented deferred scope in `EVD-5`. | `MS-2` |

Section status: Complete

## 6. Change Surface Inventory

| ID | Surface | Change type | Owner | Read/write boundary | Review expectation |
| --- | --- | --- | --- | --- | --- |
| SURF-1 | `src/spectrace/registry/**` | Code | Prototype implementer | Write registry model, YAML loading, and schema checks only. | Review schema separation, duplicate canonical ID behavior, and no external calls. |
| SURF-2 | `src/spectrace/markdown/**` | Code | Prototype implementer | Write fixture-family scanner only; no markdown-engine changes. | Review deterministic scanning and parser-scope containment. |
| SURF-3 | `src/spectrace/validation/**` | Code | Prototype implementer | Write graph resolver and validation rule evaluator. | Review required failure categories and ordering. |
| SURF-4 | `src/spectrace/cli.ts`, `src/spectrace/reporting/**` | Code | Prototype implementer | Write local command entry point and deterministic report output. | Review output stability and local-only operation. |
| SURF-5 | `fixtures/**`, `tests/**` | Test | Prototype implementer | Write valid fixture, fixture variants, and automated tests. | Review coverage of all `VAL-*` checks. |
| SURF-6 | `docs/evidence/**` | Docs | Prototype implementer | Write evidence notes and decision records only; source authority docs remain read-only during implementation. | Review decision evidence and handoff clarity. |
| SURF-7 | `package.json`, `package-lock.json`, `tsconfig.json`, or equivalent local tool config | Config | Prototype implementer | Write only if needed for local test execution or a YAML parser dependency. | Review dependency footprint and reversibility. |

Section status: Complete

## 7. Agent-Focused Package Decomposition

Decomposition mission: Keep registry loading, Markdown scanning, graph validation, and report/harness behavior independently reviewable so agents can work without crossing ownership boundaries.

| ID | Unit | Ladder level | Mission | Observable value enabled | Risk retired | Public interface | Validation command | Promotion blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PKG-1 | Registry model and loader | 2 | Load and validate document-local YAML registry declarations. | Enables canonical ID and label reconciliation. | RISK-1 | `loadRegistry(path)`, registry TypeScript types or typed records. | `npm test -- tests/test_registry.test.ts` | Schema is experimental and tied to R0 fixture evidence. |
| PKG-2 | Markdown fixture scanner | 2 | Extract definitions, label references, bounded ranges, and ignored issue-key candidates from fixture Markdown. | Enables document-to-registry comparison. | RISK-2 | `scanMarkdown(path, registry)` returning deterministic scan facts. | `npm test -- tests/test_markdown_scanner.test.ts` | Scanner is fixture-family scoped and not parser-substrate neutral. |
| PKG-3 | Entity graph validator | 2 | Resolve registry and scan facts into deterministic findings. | Enables pass/fail validation for required failure categories. | RISK-2, RISK-3 | `validate(registry, scanFacts)` returning ordered findings. | `npm test -- tests/test_validation.test.ts` | Rule set is R0-only until broader fixtures exist. |
| PKG-4 | CLI, report writer, and fixture harness | 2 | Run local validation and emit stable evidence artifacts. | Enables operator workflow and milestone evidence. | RISK-1, RISK-3 | `main(argv)`, `writeReport(result)`. | `npm test -- tests/test_cli.test.ts` | CLI contract is not stable for external consumers. |

### Package Boundary Card: PKG-1

Ladder level: 2

Mission: Own registry schema loading, canonical ID validation, display-label separation, edge declarations, and external-reference declarations.

Value / risk trace:
- Observable value enabled: The validator can distinguish identity from labels before scanning Markdown.
- Risk retired: RISK-1 through explicit registry maintenance surface.
- Validation evidence: `VAL-1`, `VAL-2`, `VAL-3`, `EVD-1`, `EVD-3`.
- Blocking unknowns: None.

Owns:
- Files/directories: `src/spectrace/registry/**`
- Concepts: registry schema, canonical IDs, display labels, external references, declared edges
- Runtime responsibilities: local YAML load and schema diagnostics

Does not own:
- Explicitly excluded behavior: Markdown parsing, validation rule ordering, CLI formatting
- Responsibilities delegated elsewhere: scanning to `PKG-2`, rule evaluation to `PKG-3`, reporting to `PKG-4`

Public interface:
- Exported types: registry record types
- Exported functions/classes/components: `loadRegistry(path)`
- Events/messages/contracts: registry diagnostics
- CLI/API surface: none

Allowed dependencies:
- May import: standard library, local shared typing utilities, and a repository-declared YAML parser dependency if introduced through `SURF-7`
- May call: filesystem read APIs for explicit local paths
- May read configuration from: explicit function arguments only

Forbidden dependencies:
- Must not import: Markdown scanner, validator, CLI, network clients, live project-management SDKs
- Must not call: network APIs or external mutation APIs
- Must not know about: report formatting or test fixture names beyond explicit input paths

State boundary:
- Owns state: in-memory registry representation
- Reads state: local YAML file
- Mutates state: none outside in-memory objects
- Persistence responsibility: none

Agent ownership boundary:
- Agent editable paths: `src/spectrace/registry/**`, registry-focused tests and fixtures
- Agent read-only paths: `docs/**`, scanner and validator modules
- Required coordination before editing: public record shape consumed by `PKG-2` or `PKG-3`

Validation command: `npm test -- tests/test_registry.test.ts`

Promotion blockers: Schema has one fixture-family consumer and no compatibility policy.

### Package Boundary Card: PKG-2

Ladder level: 2

Mission: Own deterministic extraction of fixture Markdown definitions, references, supported bounded ranges, and issue-key candidates.

Value / risk trace:
- Observable value enabled: Markdown text can be compared against registered entities.
- Risk retired: RISK-2.
- Validation evidence: `VAL-2`, `VAL-3`, `VAL-4`, `EVD-2`, `EVD-5`.
- Blocking unknowns: None.

Owns:
- Files/directories: `src/spectrace/markdown/**`
- Concepts: fixture-family scan facts, supported range syntax, ignored issue-key candidates
- Runtime responsibilities: deterministic scanning of explicit local files

Does not own:
- Explicitly excluded behavior: full GFM parsing, markdown-engine integration, graph validation
- Responsibilities delegated elsewhere: registry semantics to `PKG-1`, findings to `PKG-3`

Public interface:
- Exported types: scan fact records
- Exported functions/classes/components: `scanMarkdown(path, registry)`
- Events/messages/contracts: scan diagnostics
- CLI/API surface: none

Allowed dependencies:
- May import: standard library, `PKG-1` public registry types
- May call: filesystem read APIs for explicit local paths
- May read configuration from: registry facts and function arguments

Forbidden dependencies:
- Must not import: CLI/report writer, live project-management SDKs, markdown-engine
- Must not call: network APIs or external mutation APIs
- Must not know about: output report formatting

State boundary:
- Owns state: in-memory scan facts
- Reads state: local Markdown fixture
- Mutates state: none
- Persistence responsibility: none

Agent ownership boundary:
- Agent editable paths: `src/spectrace/markdown/**`, scanner-focused tests and fixtures
- Agent read-only paths: `src/spectrace/registry/**`, `docs/**`
- Required coordination before editing: scan fact contract consumed by `PKG-3`

Validation command: `npm test -- tests/test_markdown_scanner.test.ts`

Promotion blockers: Scanner is intentionally fixture-family scoped.

### Package Boundary Card: PKG-3

Ladder level: 2

Mission: Own graph resolution, validation findings, failure categories, and deterministic ordering.

Value / risk trace:
- Observable value enabled: Required valid and broken fixture variants produce decision-grade pass/fail evidence.
- Risk retired: RISK-2 and RISK-3.
- Validation evidence: `VAL-3`, `VAL-4`, `VAL-5`, `EVD-3`, `EVD-4`, `EVD-5`.
- Blocking unknowns: None.

Owns:
- Files/directories: `src/spectrace/validation/**`
- Concepts: entity graph, rule categories, ordered findings
- Runtime responsibilities: local in-memory validation

Does not own:
- Explicitly excluded behavior: YAML parsing, Markdown scanning, CLI rendering
- Responsibilities delegated elsewhere: input loading to `PKG-1` and `PKG-2`, report writing to `PKG-4`

Public interface:
- Exported types: finding records, validation result
- Exported functions/classes/components: `validate(registry, scanFacts)`
- Events/messages/contracts: finding categories
- CLI/API surface: none

Allowed dependencies:
- May import: `PKG-1` public types, `PKG-2` public scan facts
- May call: pure local helper functions
- May read configuration from: explicit validation options if needed

Forbidden dependencies:
- Must not import: CLI/report writer, filesystem-specific fixture paths, network clients
- Must not call: external systems or mutable global state
- Must not know about: shell invocation details

State boundary:
- Owns state: in-memory validation result
- Reads state: registry and scan facts only
- Mutates state: none
- Persistence responsibility: none

Agent ownership boundary:
- Agent editable paths: `src/spectrace/validation/**`, validation-focused tests and fixtures
- Agent read-only paths: `src/spectrace/registry/**`, `src/spectrace/markdown/**`, `docs/**`
- Required coordination before editing: finding categories consumed by `PKG-4`

Validation command: `npm test -- tests/test_validation.test.ts`

Promotion blockers: Finding taxonomy is experimental until R0 review.

### Package Boundary Card: PKG-4

Ladder level: 2

Mission: Own local command execution, deterministic report writing, fixture harness, and evidence capture.

Value / risk trace:
- Observable value enabled: Local operator can run validation and inspect evidence.
- Risk retired: RISK-1 and RISK-3.
- Validation evidence: `VAL-4`, `VAL-5`, `VAL-6`, `VAL-7`, `EVD-4`, `EVD-5`, `EVD-6`, `EVD-7`.
- Blocking unknowns: None.

Owns:
- Files/directories: `src/spectrace/cli.ts`, `src/spectrace/reporting/**`, `tests/test_cli.test.ts`, `docs/evidence/**`, evidence scripts if needed
- Concepts: invocation contract, report shape, evidence artifact paths
- Runtime responsibilities: local execution and stable output

Does not own:
- Explicitly excluded behavior: validation rule semantics, registry schema, Markdown extraction
- Responsibilities delegated elsewhere: core model behavior to `PKG-1` through `PKG-3`

Public interface:
- Exported types: report result if needed
- Exported functions/classes/components: `main(argv)`, `writeReport(result)`
- Events/messages/contracts: process exit codes and report text or JSON
- CLI/API surface: local CLI command

Allowed dependencies:
- May import: public interfaces from `PKG-1`, `PKG-2`, `PKG-3`
- May call: local filesystem reads and writes under repository evidence paths
- May read configuration from: explicit CLI arguments

Forbidden dependencies:
- Must not import: live external-system SDKs
- Must not call: network APIs or mutate files outside approved output paths
- Must not know about: internal private files from peer packages

State boundary:
- Owns state: transient CLI invocation state and report output
- Reads state: explicit local input files
- Mutates state: approved report/evidence output files only
- Persistence responsibility: none beyond committed evidence artifacts

Agent ownership boundary:
- Agent editable paths: `src/spectrace/cli.ts`, `src/spectrace/reporting/**`, `tests/test_cli.test.ts`, `docs/evidence/**`
- Agent read-only paths: `src/spectrace/registry/**`, `src/spectrace/markdown/**`, `src/spectrace/validation/**`
- Required coordination before editing: report schema or CLI exit-code changes

Validation command: `npm test -- tests/test_cli.test.ts`

Promotion blockers: CLI is internal to R0 and has no external compatibility promise.

Dependency direction rules:

- Allowed direction: `PKG-4` may depend on `PKG-3`, `PKG-2`, and `PKG-1`; `PKG-3` may depend on public types from `PKG-2` and `PKG-1`; `PKG-2` may depend on public registry types from `PKG-1`.
- Prohibited imports: Lower-level packages must not import CLI/reporting code; no package may import live external-system clients.
- Allowed cross-boundary communication: Public records, typed return values, and documented finding categories.
- Disallowed cross-boundary communication: Deep private imports, shared mutable globals, environment-driven hidden configuration, and network calls.

State boundary rules:

- Package-owned state: in-memory records only, except report/evidence output owned by `PKG-4`.
- Package-read state: explicit repository-local input paths.
- Package-mutated state: only approved report/evidence artifacts.
- Persistence ownership: none for runtime state.

Reusable package candidates:

| Candidate | Current level | Reuse rationale | Required decoupling | Promotion trigger |
| --- | --- | --- | --- | --- |
| None | N/A | R0 scope is intentionally local and experimental. | N/A | Later design approval after `MS-3`. |

Coupling tripwires:

- Scanner requires knowledge of registry loader private structures.
- Validator imports fixture paths or CLI/reporting code.
- CLI becomes the only way to test package behavior.
- Any package requires network access or live project-management credentials.
- Separate agents need to edit the same file for normal work-package completion.

Section applicability: Section 7 applies because code, schema, and test surfaces are planned.

Section status: Complete

## 8. Work Packages and Sequencing

Planning strategy: `SPIKE_THEN_SLICE` followed by `RISK_RETIREMENT`; prove the smallest end-to-end valid fixture path first, then broaden required failures.

Critical path hypothesis: Registry load plus Markdown scan plus validation result plus report output is the shortest path that proves or invalidates document-local value.

First proving slice: `WP-2` validates the valid fixture and produces `EVD-2`.

Validation cadence: Each `WP-*` closes with one or more `VAL-*` items before promotion to the next milestone.

Deferred completeness: Parser generalization, package polish, external projection, and persistent graph storage wait until after `MS-3`.

| ID | Objective | Owner | Package boundary | Editable paths | Read-only paths | Inputs | Outputs | Dependencies | Observable value enabled | Risk retired | Milestone gate | Validation checkpoint | Completion criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WP-1 | Create the fixture family, YAML registry shape, and test scaffolding. | Prototype implementer | PKG-1, PKG-4 | `fixtures/**`, `tests/fixtures/**`, registry schema tests | `docs/spec-trace-r0-document-local-entity-registry.md` | `SRC-1`, `SRC-3` | Valid fixture, registry, broken-variant inventory | DEP-1 | Establishes source-controlled inputs for the prototype. | RISK-1 | MS-1 | VAL-1 | Fixture inventory and schema inspection pass. |
| WP-2 | Implement first valid end-to-end validation path. | Prototype implementer | PKG-1, PKG-2, PKG-3, PKG-4 | `src/spectrace/**`, valid-path tests | `docs/**`, `fixtures/**` | WP-1 outputs | Passing local validation report for valid fixture | WP-1 | Proves operator can run a deterministic local validation path. | RISK-2 | MS-1 | VAL-2 | Valid fixture exits success with 0 findings and stable summary. |
| WP-3 | Implement required negative validation categories. | Prototype implementer | PKG-1, PKG-2, PKG-3 | `src/spectrace/registry/**`, `src/spectrace/markdown/**`, `src/spectrace/validation/**`, negative tests | `src/spectrace/cli.ts`, `docs/**` | WP-2 output | Findings for missing registered definition, duplicate canonical ID, duplicate label, missing reference, missing edge target, and incomplete range | WP-2 | Proves central registry-integrity failure detection. | RISK-2 | MS-2 | VAL-3 | Each negative fixture variant fails with expected category, including missing registered definitions. |
| WP-4 | Prove collision behavior, determinism, and no-network/local safety. | Prototype implementer | PKG-2, PKG-3, PKG-4 | `src/spectrace/markdown/**`, `src/spectrace/validation/**`, `src/spectrace/cli.ts`, `src/spectrace/reporting/**`, `docs/evidence/determinism-repeat-report.md`, `docs/evidence/issue-key-collision-report.md`, `docs/evidence/local-safety-report.md`, collision/determinism tests, report harness | `src/spectrace/registry/**`, `docs/spec-trace-r0-document-local-entity-registry.md`, `docs/spec-trace-e0-document-local-entity-registry-execution.md`, fixtures from WP-1 | WP-3 output | Collision fixture result, 3-run deterministic evidence, zero-network-attempt evidence, and approved-write safety record | WP-3 | Proves safe local operation and issue-key behavior. | RISK-3 | MS-2 | VAL-4, VAL-5, VAL-6 | Collision, repeat-output, zero-network-attempt, and approved-write checks pass. |
| WP-5 | Capture usability, maintenance signal, and decision evidence. | Prototype implementer | PKG-4 | `docs/evidence/prototype-decision-record.md`, supporting `docs/evidence/**` artifacts | `docs/spec-trace-r0-document-local-entity-registry.md`, `docs/spec-trace-e0-document-local-entity-registry-execution.md`, `src/spectrace/**`, `tests/**`, `fixtures/**` | WP-1 through WP-4 outputs | Prototype review packet and continue/pivot/stop recommendation | WP-4 | Produces decision-grade R0 evidence without modifying source authority. | RISK-1 | MS-3 | VAL-7 | Evidence records canonical ID and human-label usability, compares registry edits against detected failures, and records recommendation. |

Execution sequence:

1. Complete `WP-1`.
2. Complete `WP-2` and request `MS-1`.
3. Complete `WP-3` and `WP-4` serially unless package interfaces are stable enough for parallel execution.
4. Request `MS-2`.
5. Complete `WP-5` and request `MS-3`.

Parallelization rules: No parallel work before `WP-1` fixture and registry shape are stable. After `WP-2`, scanner and report work may proceed in parallel only if editable paths remain disjoint and public interfaces are unchanged.

Integration points: `WP-2` integrates all package interfaces for the first time; `WP-3` integrates all negative categories; `WP-4` integrates CLI/report evidence.

Coordination triggers: Any change to registry record shape, scan fact shape, finding category names, CLI exit codes, or report ordering requires coordination with all affected `PKG-*` owners before implementation continues.

Section status: Complete

## 9. Milestone Gates and Manual Verification

| ID | Gate objective | Covered work | Due point | Human verifier | Prerequisites | Review gate | Required evidence | Approval decision | Failure path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MS-1 | Approve first end-to-end valid-fixture proof. | OBJ-1, WP-1, WP-2, SURF-1 through SURF-5 | Before WP-3 starts | Jason Belmonti | VAL-1, VAL-2, EVD-1, EVD-2 | REV-1 | EVD-1, EVD-2 | Approve / Reject / Conditional approval | If rejected, pause WP-3 and revise fixture/schema or critical path. |
| MS-2 | Approve validation breadth, determinism, collision behavior, and local safety. | OBJ-2, OBJ-4, WP-3, WP-4, PKG-1 through PKG-4 | Before WP-5 starts | Jason Belmonti | VAL-3, VAL-4, VAL-5, VAL-6, EVD-3 through EVD-6 | REV-1, REV-2 | EVD-3, EVD-4, EVD-5, EVD-6 | Approve / Reject / Conditional approval | If rejected, fix missing evidence or escalate design gap. |
| MS-3 | Approve R0 decision packet and continue/pivot/stop recommendation. | OBJ-3, OBJ-5, WP-5, all `RISK-*` | Before completion | Jason Belmonti | VAL-7, REV-3, EVD-7 | REV-3 | EVD-7 | Approve / Reject / Conditional approval | If rejected, capture missing evidence or declare R0 not ready. |

Manual verification guide:

| Step ID | Milestone | Operator action | Expected result | Evidence artifact |
| --- | --- | --- | --- | --- |
| MV-1 | MS-1 | Run the local validation command against the valid fixture and registry. | Command exits success with 0 findings and stable summary. | EVD-2 |
| MV-2 | MS-1 | Inspect registry schema and fixture inventory. | Canonical IDs, labels, edges, and external references are separate and fixture variants are listed. | EVD-1 |
| MV-3 | MS-2 | Run negative fixture validation suite. | Each required failure category appears in the expected fixture variant. | EVD-3 |
| MV-4 | MS-2 | Run the issue-key collision fixture containing `BEL-858` without registering it as an external reference. | The report does not classify `BEL-858` as a SpecTrace document entity and records the expected collision-behavior evidence. | EVD-5 |
| MV-5 | MS-2 | Run the same fixture variant 3 consecutive times. | Ordered findings and summary match exactly. | EVD-4 |
| MV-6 | MS-2 | Run validation with network unavailable, instrument or inspect execution to record attempted network access, and inspect filesystem writes after execution. | Validation completes using local files only, records zero network attempts, and writes only approved repository evidence artifacts. | EVD-6 |
| MV-7 | MS-3 | Review registry/report usability for canonical dotted IDs and human labels, registry edit count, detected finding count, and recommendation. | Continue/pivot/stop recommendation is grounded in section 6 criteria from `SRC-1` and records whether canonical IDs and human labels are acceptable for agent-authored specs. | EVD-7 |

Section status: Complete

## 10. Execution Controls and Drift Management

| ID | Trigger | Required action | Owner | Evidence |
| --- | --- | --- | --- | --- |
| CTRL-1 | Implementation needs or attempts network access, credentials, live project-management APIs, or writes outside approved repository artifacts. | Stop execution and request design-owner approval before continuing. | Prototype implementer | DEV-* or design revision |
| CTRL-2 | Scanner scope requires full Markdown semantics or markdown-engine changes. | Pause and decide whether to pivot parser strategy before adding production parser work. | Prototype implementer | Q-* resolution or DEV-* |
| CTRL-3 | A work package must edit another package's owned paths. | Coordinate boundary change and update section 7 before continuing. | Prototype implementer | Updated execution spec or DEV-* |
| CTRL-4 | Deterministic output differs across repeated runs. | Treat as blocking for `MS-2`; fix ordering or finding identity before approval. | Prototype implementer | EVD-4 |
| CTRL-5 | Fixture variants cannot produce a required failure category. | Pause `WP-3` and revise fixture family or design requirement. | Prototype implementer | EVD-3 or Q-* |

Deviation rules: Any scope expansion into live integrations, persistent storage, markdown-engine, network behavior, or multi-document identity requires a `DEV-*` entry approved by Jason Belmonti before implementation proceeds.

Pause or escalation conditions: Pause on failed milestone evidence, missing required validation category, unsafe local-safety result, ambiguous package ownership, or any new blocker not represented in this spec.

Section status: Complete

## 11. Data, Schema, Config, and Contract Handling

| Change | Impact | Compatibility | Reversibility | Validation |
| --- | --- | --- | --- | --- |
| YAML registry schema | Defines internal R0 fixture contract. | Internal prototype only; no external compatibility commitment. | Reversible by editing fixture artifacts. | VAL-1, VAL-2, VAL-3 |
| Validation report shape | Defines evidence consumed by local operator and review. | Internal prototype only; report categories may change after R0. | Reversible by changing report writer and snapshots. | VAL-3, VAL-5 |
| Optional local tool config | Enables local test or CLI execution if required. | Repository-local only. | Reversible by removing config or dependency. | VAL-2 through VAL-6 |

N/A rationale: No live data migration, API contract, permission model, event stream, or external config is affected.

Section status: Complete

## Layer 3: Validation, Release, and Handoff

## 12. Validation and Evidence Plan

| ID | Method | Claim verified | Timing | Owner | Evidence artifact |
| --- | --- | --- | --- | --- | --- |
| VAL-1 | Review | Registry schema separates canonical IDs, labels, entity types, definition expectations, edges, and external references. | Pre-merge | Prototype implementer | EVD-1 |
| VAL-2 | Test | Valid fixture produces a passing report with registered definitions resolved. | Pre-merge | Prototype implementer | EVD-2 |
| VAL-3 | Test | Negative fixture variants fail for missing registered entity definitions, duplicate canonical IDs, duplicate labels, missing references, missing edge targets, and incomplete bounded ranges. | Pre-merge | Prototype implementer | EVD-3 |
| VAL-4 | Test | Project-management issue keys are ignored unless explicitly registered as external references. | Pre-merge | Prototype implementer | EVD-5 |
| VAL-5 | Test | Three consecutive runs over identical inputs produce the same ordered validation result. | Pre-merge | Prototype implementer | EVD-4 |
| VAL-6 | Manual | Validation completes with network unavailable, records zero network attempts, performs no live external-system mutation, and writes only approved repository artifacts. | Pre-merge | Prototype implementer | EVD-6 |
| VAL-7 | Review | Prototype results, registry/report usability for canonical dotted IDs and human labels, and maintenance signal are compared against continue, pivot, and stop criteria. | Before completion | Prototype implementer | EVD-7 |

Evidence artifact inventory:

| ID | Artifact | Storage location | Produced by | Notes |
| --- | --- | --- | --- | --- |
| EVD-1 | Registry schema and fixture inventory review | `docs/evidence/registry-fixture-inventory.md` | VAL-1, MV-2 | Captures fixture family, variants, registry fields, edges, and external references. |
| EVD-2 | Valid fixture validation report | `docs/evidence/valid-fixture-report.md` | VAL-2, MV-1 | Shows success exit and 0 findings. |
| EVD-3 | Negative fixture validation report | `docs/evidence/negative-fixture-report.md` | VAL-3, MV-3 | Shows each required failure category, including missing registered definitions. |
| EVD-4 | Deterministic repeat report | `docs/evidence/determinism-repeat-report.md` | VAL-5, MV-5 | Shows 3 identical ordered outputs. |
| EVD-5 | Issue-key collision report | `docs/evidence/issue-key-collision-report.md` | VAL-4, MV-4 | Shows unregistered issue key remains outside the document entity graph. |
| EVD-6 | Local-safety report | `docs/evidence/local-safety-report.md` | VAL-6, MV-6 | Shows validation completes with network unavailable, records zero network attempts, performs no live mutation, and writes only approved repository evidence artifacts. |
| EVD-7 | Prototype decision record | `docs/evidence/prototype-decision-record.md` | VAL-7, MV-7 | Records canonical ID and human-label usability, compares maintenance effort and findings, and applies continue/pivot/stop criteria. |

Section status: Complete

## 13. Review Plan

| ID | Reviewer | Review scope | Blocking? | Completion evidence |
| --- | --- | --- | --- | --- |
| REV-1 | Code reviewer | Package boundaries, source ownership, first valid path, no-network safety. | Yes | Review approval on implementation PR or documented findings resolved. |
| REV-2 | Code reviewer | Required negative validation categories, deterministic ordering, issue-key collision behavior. | Yes | Review approval on implementation PR or documented findings resolved. |
| REV-3 | Jason Belmonti | R0 evidence packet, canonical ID and human-label usability judgment, and continue/pivot/stop recommendation. | Yes | `MS-3` approval decision recorded. |

Approval conditions: No blocking review finding remains open; `MS-1` through `MS-3` have required evidence by their due points; validation artifacts are available in the repository or review thread; no unapproved `DEV-*` or `WVR-*` exists.

Section status: Complete

## 14. Rollout, Migration, Rollback, and Recovery

| ID | Action | Timing | Owner | Abort trigger | Evidence |
| --- | --- | --- | --- | --- | --- |
| REL-1 | Prepare implementation review package after `MS-2` and code review approval. | Before `MS-3` | Prototype implementer | Missing `VAL-1` through `VAL-6` evidence or open blocking review finding. | EVD-1 through EVD-6 |
| REL-2 | Merge local prototype artifacts and publish R0 decision evidence after `MS-3`. | Before completion | Prototype implementer | Missing canonical ID usability judgment, missing maintenance signal, or no decision-owner approval. | EVD-7 |

Rollback or containment plan: If prototype behavior is rejected, if validation attempts network access, or if validation writes outside approved repository artifacts, stop execution and revert the implementation PR or delete prototype artifacts before they become a dependency. Because no live service, migration, or external mutation exists, rollback is limited to repository state.

Recovery limit: Recovery restores the repository to the pre-prototype state; no external system state exists to recover.

Section status: Complete

## 15. Observability and Operational Readiness

| ID | Signal | Purpose | Consumer | Response |
| --- | --- | --- | --- | --- |
| OBS-1 | Validation summary | Show pass/fail status, finding count, and fixture identity. | Local operator | Inspect failures and compare against expected category. |
| OBS-2 | Finding category counts | Show which entity-integrity rules failed. | Reviewer | Confirm required negative cases fired. |
| OBS-3 | Fixture repeat result | Show deterministic output across 3 runs. | Reviewer | Reject `MS-2` if output order or finding identity differs. |
| OBS-4 | Usability and maintenance signal | Compare canonical ID and human-label usability plus registry edit effort against detected failure value. | Decision owner | Continue, pivot, or stop at `MS-3`. |

Operator actions: Run the local validation command, inspect report output, capture evidence artifacts, and request milestone approval at due points.

Monitoring window: N/A for production monitoring; this is a local prototype. Evidence is reviewed during milestone gates only.

N/A rationale: No production runtime or hosted operation exists.

Section status: Complete

## 16. Risks, Questions, Deviations, and Waivers

Risks:

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| RISK-1 | Registry upkeep exceeds detected validation value. | Prototype should stop or pivot instead of expanding. | Medium | Prototype implementer | Capture maintenance signal before completion. | VAL-7 |
| RISK-2 | Markdown scanner brittleness. | Prototype may overstate feasibility or require parser pivot. | Medium | Prototype implementer | Keep scanner fixture-family scoped and record misses/false positives. | VAL-2, VAL-3 |
| RISK-3 | Issue-key collision handling is over-scoped before cross-system projection is in scope. | Later Linear or Jira projection concerns could distract from document-local proof. | Low | Prototype implementer | Keep external projection out of scope and validate local issue-key behavior. | VAL-4 |

Open questions:

| ID | Question | Owner | Due date | Blocking? | Resolution path |
| --- | --- | --- | --- | --- | --- |
| Q-1 | Should a later implementation integrate this model into `markdown-engine` or remain a semantic validation layer? | Jason Belmonti | 2026-05-05 | No | Resolve after `MS-3` using `EVD-7`. |
| Q-2 | Should YAML remain source of truth or should annotated Markdown generate the registry? | Jason Belmonti | 2026-05-05 | No | Resolve after registry maintenance signal in `EVD-7`. |
| Q-3 | Should live Linear or Jira projection validation be the next slice after document-local proof? | Jason Belmonti | 2026-05-05 | No | Resolve after document-local fixture evidence passes or exposes pivot. |

Approved deviations:

| ID | Deviation | Owner | Approver | Rationale | Impact | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| None | No approved deviations. | N/A | N/A | N/A | N/A | N/A |

Approved waivers:

| ID | Waived rule or finding | Approver | Rationale | Boundary or expiry | Compensating control | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| None | No approved waivers. | N/A | N/A | N/A | N/A | N/A |

Section status: Complete

## 17. Execution Traceability Matrix

| Source, objective, or evidence-led claim | Change surfaces | Package boundaries | Work packages | Milestones | Controls | Validation | Review | Release or ops | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SRC-1 / OBJ-1 / Critical path | SURF-1, SURF-2, SURF-3, SURF-4, SURF-5 | PKG-1, PKG-2, PKG-3, PKG-4 | WP-1, WP-2 | MS-1 | CTRL-2, CTRL-3 | VAL-1, VAL-2 | REV-1 | REL-1, OBS-1 | EVD-1, EVD-2 |
| SRC-2 / Consensus review authority | SURF-1, SURF-5, SURF-6 | PKG-1, PKG-3, PKG-4 | WP-1, WP-3, WP-5 | MS-1, MS-2, MS-3 | CTRL-3, CTRL-5 | VAL-1, VAL-3, VAL-7 | REV-1, REV-2, REV-3 | REL-1, REL-2, OBS-2, OBS-4 | EVD-1, EVD-3, EVD-7 |
| SRC-3 / PR #1 cleanup authority | SURF-1, SURF-2, SURF-3, SURF-5, SURF-6 | PKG-1, PKG-2, PKG-3, PKG-4 | WP-1, WP-3, WP-4, WP-5 | MS-1, MS-2, MS-3 | CTRL-3, CTRL-5 | VAL-1, VAL-3, VAL-4, VAL-7 | REV-1, REV-2, REV-3 | REL-1, REL-2, OBS-2, OBS-4 | EVD-1, EVD-3, EVD-5, EVD-7 |
| OBJ-2 / First proving slice expansion | SURF-1, SURF-2, SURF-3, SURF-5 | PKG-1, PKG-2, PKG-3 | WP-3 | MS-2 | CTRL-3, CTRL-5 | VAL-3 | REV-2 | REL-1, OBS-2 | EVD-3 |
| OBJ-3 / Canonical ID usability | SURF-1, SURF-4, SURF-6 | PKG-1, PKG-4 | WP-1, WP-2, WP-5 | MS-1, MS-3 | CTRL-3 | VAL-1, VAL-2, VAL-7 | REV-1, REV-3 | REL-2, OBS-4 | EVD-1, EVD-2, EVD-7 |
| OBJ-4 / Collision behavior | SURF-2, SURF-3, SURF-5 | PKG-2, PKG-3 | WP-4 | MS-2 | CTRL-1, CTRL-2 | VAL-4 | REV-2 | REL-1, OBS-2 | EVD-5 |
| OBJ-5 / Maintenance signal | SURF-6 | PKG-4 | WP-5 | MS-3 | CTRL-4 | VAL-7 | REV-3 | REL-2, OBS-4 | EVD-7 |
| Optional tool config / SURF-7 | SURF-7 | PKG-4 | WP-1, WP-2, WP-3, WP-4 | MS-1, MS-2 | CTRL-3 | VAL-2, VAL-3, VAL-4, VAL-5, VAL-6 | REV-1, REV-2 | REL-1 | EVD-2, EVD-3, EVD-4, EVD-5, EVD-6 |
| RISK-1 | SURF-1, SURF-6 | PKG-1, PKG-4 | WP-1, WP-5 | MS-3 | CTRL-3 | VAL-1, VAL-7 | REV-3 | REL-2, OBS-4 | EVD-1, EVD-7 |
| RISK-2 | SURF-2, SURF-3, SURF-5 | PKG-2, PKG-3 | WP-2, WP-3 | MS-1, MS-2 | CTRL-2, CTRL-5 | VAL-2, VAL-3 | REV-1, REV-2 | REL-1 | EVD-2, EVD-3 |
| RISK-3 | SURF-2, SURF-3, SURF-5 | PKG-2, PKG-3 | WP-4 | MS-2 | CTRL-1 | VAL-4, VAL-6 | REV-2 | REL-1, OBS-2 | EVD-5, EVD-6 |
| Determinism / OBS-3 | SURF-3, SURF-4, SURF-5 | PKG-3, PKG-4 | WP-4 | MS-2 | CTRL-4 | VAL-5 | REV-2 | REL-1, OBS-3 | EVD-4 |

Section status: Complete

## 18. Final Execution Gate

Entry gate: Ready when this execution spec is approved, merged PR #1 source cleanup is available in the implementation branch, and no new blocking source-design finding is open.

Milestone approval gate: `MS-1`, `MS-2`, and `MS-3` require named approval from Jason Belmonti at their due points with the evidence artifacts listed in section 9.

Completion gate: Complete only when `VAL-1` through `VAL-7` pass or have explicit rejected/pivot evidence, all blocking `REV-*` reviews are complete, and `MS-3` records continue, pivot, or stop.

Release gate: Merge only local repository artifacts after `REL-2` prerequisites are satisfied; no hosted release or live activation is part of E0.

Handoff record: Handoff shall include the implementation PR, fixture inventory, validation report output, deterministic repeat evidence, local-safety evidence for zero network attempts and approved repository writes, canonical ID and human-label usability judgment, maintenance signal, and `MS-3` decision.

Final readiness state: Ready to investigate

Section status: Complete
