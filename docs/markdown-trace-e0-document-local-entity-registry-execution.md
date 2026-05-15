# Markdown Trace E0: Document-Local Entity Registry Prototype Execution

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace E0: Document-Local Entity Registry Prototype Execution |
| Status | Approved to investigate |
| Execution level | `E0` |
| Execution level justification | The work is a local prototype whose purpose is to retire uncertainty about document-local entity registries before production or integration scope is approved. |
| Author(s) | Codex |
| Executor(s) | Prototype implementer |
| Reviewers | Jason Belmonti |
| Decision owner | Jason Belmonti |
| Target branch, release, or milestone | Markdown Trace R0 prototype implementation |
| Last updated | 2026-05-15 |
| Related source docs | `docs/markdown-trace-r0-document-local-entity-registry.md`; `docs/evidence/markdown-engine-2-adoption-decision.md`; `docs/evidence/prototype-decision-record.md`; `docs/markdown-trace-r1-link-backed-entity-syntax.md`; PR #1 `[codex] Address design review observations` ([#1](https://github.com/jasonbelmonti/markdown-trace/pull/1), merge commit `2b7f760`) |
| Related tickets | BEL-1045; BEL-991; BEL-898; BEL-899; BEL-900; BEL-1064 |

## 0. Execution Summary

Decision requested: Approve to investigate

Approved outcome: Execute `SRC-1` by producing a local, read-only prototype that validates one execution-spec fixture family against a document-local YAML entity registry and emits deterministic pass/fail evidence for the R0 decision.

Execution approach: Build the prototype through `WP-1` fixture and registry setup, `WP-2` first end-to-end valid-fixture proof through a Markdown Engine document adapter, `WP-3` negative validation rules, `WP-4` determinism and local-safety proof, and `WP-5` evidence capture for decision review.

Entry condition: Merged PR #1 source-document cleanup is available in the implementation branch, `DEP-2` has been revalidated, `DEP-3` is satisfied, and the decision owner confirms the E0 scope remains local-only with no blocking source-design finding open.

Top risks or unknowns:

- RISK-1: Registry maintenance effort may exceed the value of detected reference failures.
- RISK-2: Markdown Trace semantic reference extraction may still be brittle even after generic Markdown parsing moves to `@jasonbelmonti/markdown-engine@2.0.0`.
- RISK-3: Collision handling may be over-designed before cross-system projections are in scope.

Section status: Complete

## Layer 1: Execution Basis

## 1. Source Authority and Scope

| ID | Source | Authority | Execution implication |
| --- | --- | --- | --- |
| SRC-1 | `docs/markdown-trace-r0-document-local-entity-registry.md` | Approved R0 design document | Defines the prototype scope, requirements, constraints, validation categories, risks, and continue/pivot/stop criteria. |
| SRC-2 | Consensus review verdict on the R0 design, recorded in the R0 internal review record at merge commit `2b7f760` | Three-reviewer consensus approval | Confirms duplicate canonical ID coverage and fixture-family scope are review-acceptable for R0. |
| SRC-3 | PR #1 `[codex] Address design review observations` ([#1](https://github.com/jasonbelmonti/markdown-trace/pull/1), merge commit `2b7f760`) | Merged PR cleanup of non-blocking review observations | Provides clarified acceptance coverage and external-reference wording that implementation shall follow. |
| SRC-4 | `docs/evidence/markdown-engine-2-adoption-decision.md`; BEL-1045; BEL-991 | Approved parser-pivot decision record | Supersedes the custom scanner path and gates implementation on `DEP-2` package availability plus `DEP-3` release authorization. |

In scope: Local fixture Markdown, document-local YAML registry, published `@jasonbelmonti/markdown-engine@2.0.0` package-root API usage, a Markdown Engine document adapter for the R0 fixture family, in-memory entity graph, deterministic validation report, local CLI or script harness, tests or fixture runs for `VAL-1` through `VAL-7`, and evidence capture.

Out of scope: Live Linear, Jira, or project-management mutation during validation; graph database; persistent service; multi-document namespace; modifying the sibling `markdown-engine` repository; unpublished local package/tarball dependencies; hosted deployment; irreversible migration; implementing link-backed `ctx://trace` Markdown syntax in R0.

Definition of done: The prototype can run locally against the valid fixture and required negative fixture variants, produce deterministic ordered output, demonstrate no network or live external mutation, and provide evidence for the section 6 continue/pivot/stop criteria in `SRC-1`.

Re-decision boundaries: Execution shall not re-decide YAML as the registry format for R0, document-local scope, no-network constraint, external issue-key default behavior, or the package-root-only `markdown-engine` 2.0 consumption boundary. If implementation evidence invalidates any of those decisions, execution pauses and the decision owner resolves the design question before scope expands. Q-2 may recommend a post-R0 pivot without changing the implemented R0 evidence path.

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
| NG-3 | This execution will not modify `markdown-engine`, consume unpublished `markdown-engine` artifacts, or inspect parser internals. | Entire E0 execution. | Review of `SURF-2`, `DEP-2`, `CTRL-2` |

Section status: Complete

## 3. Ownership, Roles, and Decision Points

| Role or person | Responsibility | Required action |
| --- | --- | --- |
| Prototype implementer | Build the local prototype and produce evidence artifacts. | Execute |
| Jason Belmonti | Own R0 decision, milestone approval, and continue/pivot/stop outcome. | Approve |
| Code reviewer | Review implementation boundaries, validation evidence, and no-network safety. | Review |
| Future Markdown Trace maintainer | Consume evidence and follow-up questions. | Inform |

Decision points:

- DP-1: Approve this E0 execution spec before implementation begins.
- DP-2: Approve `MS-1` before adding full negative-case breadth.
- DP-3: Approve `MS-2` before decision-record completion.
- DP-4: Approve `MS-3` to continue, pivot, or stop after prototype evidence is captured.

Escalation path: If a required validation category cannot be implemented locally through the published `markdown-engine` 2.0 package-root API plus Markdown Trace-owned semantic logic, or if network/live-system behavior becomes necessary, the implementer pauses and escalates to Jason Belmonti for design revision.

Section status: Complete

## 4. Constraints, Assumptions, and Dependencies

| ID | Type | Statement | Owner | Blocking? | Validation or resolution plan |
| --- | --- | --- | --- | --- | --- |
| CON-1 | Constraint | Execution remains local-only, read-only except for repository artifacts, and performs no network calls during validation. | Prototype implementer | No | Validate through `VAL-6` and `MS-2`. |
| CON-2 | Constraint | The fixture set is one fixture family derived from one source execution spec and one document-local registry, with local variants or generated mutations. | Prototype implementer | No | Validate through `VAL-2`, `VAL-3`, and fixture inventory review. |
| CON-3 | Constraint | Canonical entity IDs use dotted lowercase syntax; display labels remain separate. | Prototype implementer | No | Validate through `VAL-1`, `VAL-2`, `VAL-3`, and `VAL-7`. |
| ASM-1 | Assumption | A Node.js TypeScript local CLI or script harness using npm and Vitest is sufficient for the E0 prototype. | Prototype implementer | No | Re-estimate if implementation requires a service, daemon, or non-TypeScript package. |
| ASM-2 | Assumption | The published `markdown-engine` 2.0 rich IR exposes enough sections, text spans, links, link references, source slices, and query helpers for the R0 fixture adapter. | Prototype implementer | No | Retire through `VAL-2`, `VAL-3`, and `RISK-2` evidence. |
| DEP-1 | Dependency | Merged PR #1 cleanup must be present before prototype implementation begins. | Prototype implementer | Yes | Confirm branch source in the entry gate; equivalent wording in the implementation branch is acceptable. |
| DEP-2 | Dependency | npm must serve `@jasonbelmonti/markdown-engine@2.0.0` before adapter or validation implementation resumes. | Prototype implementer | Yes | Package availability was verified on 2026-05-14; revalidate with `npm view @jasonbelmonti/markdown-engine version`; no sibling-repo dependency or unpublished tarball is allowed. |
| DEP-3 | Dependency | BEL-991 must record Markdown Engine 2.0 release authorization before adapter or validation implementation resumes. | Prototype implementer | Yes | Confirm BEL-991 before editing `SURF-2`, `SURF-7`, or executing `WP-2`. |

Section status: Complete

## Layer 2: Execution Plan

## 5. Evidence-Led Execution Model

Observable outcome: A local operator can run one command against the fixture family and registry and inspect deterministic pass/fail output for entity definitions, references, edges, ranges, collision behavior, and local safety.

Core value proposition: The prototype converts identifier-rich execution specs from prose-only artifacts into locally verifiable handoff artifacts without committing Markdown Trace to production integration or storage scope.

Critical path hypothesis: If the implementation can load the registry, parse and normalize the fixture Markdown through published `markdown-engine` 2.0, adapt the rich IR into Markdown Trace adapter facts, resolve canonical IDs and labels into an in-memory graph, and emit a stable report for valid and broken variants, then the document-local registry model is valuable enough to evaluate for the next design slice.

First proving slice: `WP-2` shall make the valid fixture and registry produce a passing report with stable summary output before broader negative-case breadth is implemented.

Sequencing principle: Sequence by risk retirement and progressive value: prove one valid end-to-end path first, then add negative categories, then prove determinism/local safety, then capture the maintenance and decision evidence.

Validation cadence: Each work package produces at least one `VAL-*` result before the next milestone gate. `MS-1` reviews the first proof, `MS-2` reviews validation breadth, and `MS-3` reviews the R0 continue/pivot/stop decision evidence.

Deferred completeness: Multi-document IDs, live external-system projection, persistent graph storage, polished packaging, link-backed `ctx://trace` Markdown entity syntax, and any `markdown-engine` package changes are deferred until after `MS-3`.

Primary risks and unknowns:

| ID | Risk or unknown | Why it matters | Owner | Evidence required to retire | Decision gate |
| --- | --- | --- | --- | --- | --- |
| RISK-1 | Registry upkeep costs more than detected failure value. | If maintenance effort is higher than detected errors, the R0 model should stop or pivot. | Prototype implementer | Edit-count and finding-count comparison in `EVD-7`. | `MS-3` |
| RISK-2 | Markdown Trace semantic reference extraction misses realistic references or over-matches prose. | Generic parser risk is delegated to `markdown-engine`; semantic adapter and entity-reference rules could still invalidate the model. | Prototype implementer | `VAL-2`, `VAL-3`, and examples of adapter hits/misses in `EVD-2` and `EVD-3`. | `MS-2` |
| RISK-3 | Collision handling is over-scoped before live Linear or Jira projection is in scope. | Prototype effort could drift into projection policy before document-local behavior is proven. | Prototype implementer | `VAL-4` collision fixture and documented deferred scope in `EVD-5`. | `MS-2` |

Section status: Complete

## 6. Change Surface Inventory

| ID | Surface | Change type | Owner | Read/write boundary | Review expectation |
| --- | --- | --- | --- | --- | --- |
| SURF-1 | `src/markdowntrace/registry/**` | Code | Prototype implementer | Write registry model, YAML loading, and schema checks only. | Review schema separation, duplicate canonical ID behavior, and no external calls. |
| SURF-2 | `src/markdowntrace/markdown/**` | Code | Prototype implementer | Write Markdown Engine document adapter only; consume package-root APIs from published `@jasonbelmonti/markdown-engine@2.0.0`. | Review adapter contract, package-version gate, and absence of parser internals. |
| SURF-3 | `src/markdowntrace/validation/**` | Code | Prototype implementer | Write graph resolver and validation rule evaluator. | Review required failure categories and ordering. |
| SURF-4 | `src/markdowntrace/cli.ts`, `src/markdowntrace/reporting/**` | Code | Prototype implementer | Write local command entry point and deterministic report output. | Review output stability and local-only operation. |
| SURF-5 | `fixtures/**`, `tests/**` | Test | Prototype implementer | Write valid fixture, fixture variants, and automated tests. | Review coverage of all `VAL-*` checks. |
| SURF-6 | `docs/evidence/**` | Docs | Prototype implementer | Write evidence notes and decision records only; source authority docs remain read-only during implementation. | Review decision evidence and handoff clarity. |
| SURF-7 | `package.json`, `package-lock.json`, `tsconfig.json`, or equivalent local tool config | Config | Prototype implementer | Add only published `@jasonbelmonti/markdown-engine@2.0.0` after `DEP-2` is revalidated and `DEP-3` is satisfied. | Review dependency footprint, lockfile version, and reversibility. |

Section status: Complete

## 7. Agent-Focused Package Decomposition

Decomposition mission: Keep registry loading, Markdown Engine document adaptation, graph validation, and report/harness behavior independently reviewable so agents can work without crossing ownership boundaries.

| ID | Unit | Ladder level | Mission | Observable value enabled | Risk retired | Public interface | Validation command | Promotion blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PKG-1 | Registry model and loader | 2 | Load and validate document-local YAML registry declarations. | Enables canonical ID and label reconciliation. | RISK-1 | `loadRegistry(path)`, registry TypeScript types or typed records. | `npm test -- tests/test_registry.test.ts` | Schema is experimental and tied to R0 fixture evidence. |
| PKG-2 | Markdown Engine document adapter | 2 | Convert `markdown-engine` 2.0 parse/normalize/query output into Markdown Trace adapter facts for definitions, label references, bounded ranges, and ignored issue-key candidates. | Enables document-to-registry comparison without custom Markdown parsing. | RISK-2 | `scanMarkdown(path, registry)` or equivalent adapter returning deterministic facts plus engine package/version metadata. | `npm test -- tests/test_markdown_engine_adapter.test.ts` | Requires verified `@jasonbelmonti/markdown-engine@2.0.0` npm availability, release authorization, and package-root API use. |
| PKG-3 | Entity graph validator | 2 | Resolve registry and adapter facts into deterministic findings. | Enables pass/fail validation for required failure categories. | RISK-2, RISK-3 | `validate(registry, adapterFacts)` returning ordered findings. | `npm test -- tests/test_validation.test.ts` | Rule set is R0-only until broader fixtures exist. |
| PKG-4 | CLI, report writer, and fixture harness | 2 | Run local validation and emit stable evidence artifacts. | Enables operator workflow and milestone evidence. | RISK-1, RISK-3 | `main(argv)`, `writeReport(result)`. | `npm test -- tests/test_cli.test.ts` | CLI contract is not stable for external consumers. |

### Package Boundary Card: PKG-1

Ladder level: 2

Mission: Own registry schema loading, canonical ID validation, display-label separation, edge declarations, and external-reference declarations.

Value / risk trace:
- Observable value enabled: The validator can distinguish identity from labels before Markdown document adaptation.
- Risk retired: RISK-1 through explicit registry maintenance surface.
- Validation evidence: `VAL-1`, `VAL-2`, `VAL-3`, `EVD-1`, `EVD-3`.
- Blocking unknowns: None.

Owns:
- Files/directories: `src/markdowntrace/registry/**`
- Concepts: registry schema, canonical IDs, display labels, external references, declared edges
- Runtime responsibilities: local YAML load and schema diagnostics

Does not own:
- Explicitly excluded behavior: Markdown parsing, validation rule ordering, CLI formatting
- Responsibilities delegated elsewhere: Markdown document adaptation to `PKG-2`, rule evaluation to `PKG-3`, reporting to `PKG-4`

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
- Must not import: Markdown adapter, validator, CLI, network clients, live project-management SDKs
- Must not call: network APIs or external mutation APIs
- Must not know about: report formatting or test fixture names beyond explicit input paths

State boundary:
- Owns state: in-memory registry representation
- Reads state: local YAML file
- Mutates state: none outside in-memory objects
- Persistence responsibility: none

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/registry/**`, registry-focused tests and fixtures
- Agent read-only paths: `docs/**`, adapter and validator modules
- Required coordination before editing: public record shape consumed by `PKG-2` or `PKG-3`

Validation command: `npm test -- tests/test_registry.test.ts`

Promotion blockers: Schema has one fixture-family consumer and no compatibility policy.

### Package Boundary Card: PKG-2

Ladder level: 2

Mission: Own deterministic adaptation from the published `@jasonbelmonti/markdown-engine@2.0.0` rich IR document to Markdown Trace adapter facts for fixture definitions, references, supported bounded ranges, and issue-key candidates.

Value / risk trace:
- Observable value enabled: Markdown structure can be compared against registered entities without duplicating generic parser behavior.
- Risk retired: RISK-2.
- Validation evidence: `VAL-2`, `VAL-3`, `VAL-4`, `EVD-2`, `EVD-5`.
- Blocking unknowns: None.

Owns:
- Files/directories: `src/markdowntrace/markdown/**`
- Concepts: Markdown Engine adapter facts, supported range syntax, ignored issue-key candidates, source evidence mapping
- Runtime responsibilities: deterministic parsing through package-root `parse`/`normalize` and deterministic querying through `documentQueries`

Does not own:
- Explicitly excluded behavior: Markdown parser implementation, raw AST inspection, `markdown-engine` package changes, graph validation
- Responsibilities delegated elsewhere: registry semantics to `PKG-1`, findings to `PKG-3`

Public interface:
- Exported types: adapter fact records and engine metadata records
- Exported functions/classes/components: `scanMarkdown(path, registry)` or equivalent adapter API
- Events/messages/contracts: adapter diagnostics, engine package version, engine document contract version
- CLI/API surface: none

Allowed dependencies:
- May import: standard library, `PKG-1` public registry types, package-root exports from published `@jasonbelmonti/markdown-engine@2.0.0`
- May call: filesystem read APIs for explicit local paths
- May read configuration from: registry facts and function arguments

Forbidden dependencies:
- Must not import: CLI/report writer, live project-management SDKs, raw mdast/unified parser modules, `markdown-engine` internal modules, sibling-repo paths, unpublished local tarballs
- Must not call: network APIs or external mutation APIs
- Must not know about: output report formatting

State boundary:
- Owns state: in-memory adapter facts
- Reads state: local Markdown fixture
- Mutates state: none
- Persistence responsibility: none

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/markdown/**`, adapter-focused tests and fixtures
- Agent read-only paths: `src/markdowntrace/registry/**`, `docs/**`
- Required coordination before editing: adapter fact contract consumed by `PKG-3`

Validation command: `npm test -- tests/test_markdown_engine_adapter.test.ts`

Promotion blockers: npm must serve `@jasonbelmonti/markdown-engine@2.0.0`; adapter must not consume parser internals.

### Package Boundary Card: PKG-3

Ladder level: 2

Mission: Own graph resolution, validation findings, failure categories, and deterministic ordering.

Value / risk trace:
- Observable value enabled: Required valid and broken fixture variants produce decision-grade pass/fail evidence.
- Risk retired: RISK-2 and RISK-3.
- Validation evidence: `VAL-3`, `VAL-4`, `VAL-5`, `EVD-3`, `EVD-4`, `EVD-5`.
- Blocking unknowns: None.

Owns:
- Files/directories: `src/markdowntrace/validation/**`
- Concepts: entity graph, rule categories, ordered findings
- Runtime responsibilities: local in-memory validation

Does not own:
- Explicitly excluded behavior: YAML parsing, Markdown document adaptation, CLI rendering
- Responsibilities delegated elsewhere: input loading to `PKG-1` and `PKG-2`, report writing to `PKG-4`

Public interface:
- Exported types: finding records, validation result
- Exported functions/classes/components: `validate(registry, adapterFacts)`
- Events/messages/contracts: finding categories
- CLI/API surface: none

Allowed dependencies:
- May import: `PKG-1` public types, `PKG-2` public adapter facts
- May call: pure local helper functions
- May read configuration from: explicit validation options if needed

Forbidden dependencies:
- Must not import: CLI/report writer, filesystem-specific fixture paths, network clients
- Must not call: external systems or mutable global state
- Must not know about: shell invocation details

State boundary:
- Owns state: in-memory validation result
- Reads state: registry and adapter facts only
- Mutates state: none
- Persistence responsibility: none

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/validation/**`, validation-focused tests and fixtures
- Agent read-only paths: `src/markdowntrace/registry/**`, `src/markdowntrace/markdown/**`, `docs/**`
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
- Files/directories: `src/markdowntrace/cli.ts`, `src/markdowntrace/reporting/**`, `tests/test_cli.test.ts`, `docs/evidence/**`, evidence scripts if needed
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
- Agent editable paths: `src/markdowntrace/cli.ts`, `src/markdowntrace/reporting/**`, `tests/test_cli.test.ts`, `docs/evidence/**`
- Agent read-only paths: `src/markdowntrace/registry/**`, `src/markdowntrace/markdown/**`, `src/markdowntrace/validation/**`
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

- Markdown Engine document adapter requires knowledge of registry loader private structures.
- Validator imports fixture paths or CLI/reporting code.
- CLI becomes the only way to test package behavior.
- Any package requires network access or live project-management credentials.
- Separate agents need to edit the same file for normal work-package completion.

Section applicability: Section 7 applies because code, schema, and test surfaces are planned.

Section status: Complete

## 8. Work Packages and Sequencing

Planning strategy: `SPIKE_THEN_SLICE` followed by `RISK_RETIREMENT`; prove the smallest end-to-end valid fixture path first, then broaden required failures.

Critical path hypothesis: Registry load plus Markdown Engine document adaptation plus validation result plus report output is the shortest path that proves or invalidates document-local value.

First proving slice: `WP-2` validates the valid fixture and produces `EVD-2`.

Validation cadence: Each `WP-*` closes with one or more `VAL-*` items before promotion to the next milestone.

Deferred completeness: Adapter generalization, package polish, external projection, and persistent graph storage wait until after `MS-3`.

| ID | Objective | Owner | Package boundary | Editable paths | Read-only paths | Inputs | Outputs | Dependencies | Observable value enabled | Risk retired | Milestone gate | Validation checkpoint | Completion criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WP-1 | Create the fixture family, YAML registry shape, and test scaffolding. | Prototype implementer | PKG-1, PKG-4 | `fixtures/**`, `tests/fixtures/**`, registry schema tests | `docs/markdown-trace-r0-document-local-entity-registry.md` | `SRC-1`, `SRC-3` | Valid fixture, registry, broken-variant inventory | DEP-1 | Establishes source-controlled inputs for the prototype. | RISK-1 | MS-1 | VAL-1 | Fixture inventory and schema inspection pass. |
| WP-2 | Implement first valid end-to-end validation path through the engine-backed adapter. | Prototype implementer | PKG-1, PKG-2, PKG-3, PKG-4 | `src/markdowntrace/**`, valid-path tests, package manifest after `DEP-2` and `DEP-3` pass | `docs/**`, `fixtures/**` | WP-1 outputs and published `@jasonbelmonti/markdown-engine@2.0.0` | Passing local validation report for valid fixture, including engine package version and document contract version | WP-1, DEP-2, DEP-3 | Proves operator can run a deterministic local validation path through package-root engine APIs. | RISK-2 | MS-1 | VAL-2 | Valid fixture exits success with 0 findings, stable summary, engine package version, and document contract version. |
| WP-3 | Implement required negative validation categories over adapter facts. | Prototype implementer | PKG-1, PKG-2, PKG-3 | `src/markdowntrace/registry/**`, `src/markdowntrace/markdown/**`, `src/markdowntrace/validation/**`, negative tests | `src/markdowntrace/cli.ts`, `docs/**` | WP-2 output | Findings for missing registered definition, duplicate canonical ID, duplicate label, missing reference, missing edge target, and incomplete range, derived from registry entities and adapter facts | WP-2 | Proves central registry-integrity failure detection without custom Markdown parsing. | RISK-2 | MS-2 | VAL-3 | Each negative fixture variant fails with expected category, including missing registered definitions, and records engine metadata. |
| WP-4 | Prove collision behavior, determinism, and no-network/local safety through the adapter/report path. | Prototype implementer | PKG-2, PKG-3, PKG-4 | `src/markdowntrace/markdown/**`, `src/markdowntrace/validation/**`, `src/markdowntrace/cli.ts`, `src/markdowntrace/reporting/**`, `docs/evidence/determinism-repeat-report.md`, `docs/evidence/issue-key-collision-report.md`, `docs/evidence/local-safety-report.md`, collision/determinism tests, report harness | `src/markdowntrace/registry/**`, `docs/markdown-trace-r0-document-local-entity-registry.md`, `docs/markdown-trace-e0-document-local-entity-registry-execution.md`, fixtures from WP-1 | WP-3 output | Collision fixture result, 3-run deterministic evidence, zero-network-attempt evidence, approved-write safety record, engine package version, and document contract version | WP-3 | Proves safe local operation and issue-key behavior. | RISK-3 | MS-2 | VAL-4, VAL-5, VAL-6 | Collision, repeat-output, zero-network-attempt, approved-write, and engine-metadata checks pass. |
| WP-5 | Capture usability, maintenance signal, and decision evidence. | Prototype implementer | PKG-4 | `docs/evidence/prototype-decision-record.md`, supporting `docs/evidence/**` artifacts | `docs/markdown-trace-r0-document-local-entity-registry.md`, `docs/markdown-trace-e0-document-local-entity-registry-execution.md`, `src/markdowntrace/**`, `tests/**`, `fixtures/**` | WP-1 through WP-4 outputs | Prototype review packet and continue/pivot/stop recommendation | WP-4 | Produces decision-grade R0 evidence without modifying source authority. | RISK-1 | MS-3 | VAL-7 | Evidence records canonical ID and human-label usability, compares registry edits against detected failures, resolves Q-2 with a recommended follow-on direction, and records recommendation. |

Execution sequence:

1. Complete `WP-1`.
2. Complete `WP-2` and request `MS-1`.
3. Complete `WP-3` and `WP-4` serially unless package interfaces are stable enough for parallel execution.
4. Request `MS-2`.
5. Complete `WP-5` and request `MS-3`.

Parallelization rules: No parallel work before `WP-1` fixture and registry shape are stable. After `WP-2`, adapter, validator, and report work may proceed in parallel only if editable paths remain disjoint and public interfaces are unchanged.

Integration points: `WP-2` integrates all package interfaces for the first time; `WP-3` integrates all negative categories; `WP-4` integrates CLI/report evidence.

Coordination triggers: Any change to registry record shape, adapter fact shape, finding category names, CLI exit codes, report ordering, engine metadata, or document contract metadata requires coordination with all affected `PKG-*` owners before implementation continues.

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
| MV-1 | MS-1 | Run the local validation command against the valid fixture and registry. | Command exits success with 0 findings, stable summary, `@jasonbelmonti/markdown-engine` package version, and document contract version. | EVD-2 |
| MV-2 | MS-1 | Inspect registry schema and fixture inventory. | Canonical IDs, labels, edges, and external references are separate and fixture variants are listed. | EVD-1 |
| MV-3 | MS-2 | Run negative fixture validation suite. | Each required failure category appears in the expected fixture variant, and each report records the engine package version and document contract version. | EVD-3 |
| MV-4 | MS-2 | Run the issue-key collision fixture containing `BEL-858` without registering it as an external reference. | The report does not classify `BEL-858` as a Markdown Trace document entity and records expected collision evidence plus engine package and document contract versions. | EVD-5 |
| MV-5 | MS-2 | Run the same fixture variant 3 consecutive times. | Ordered findings, summary, engine package version, and document contract version match exactly. | EVD-4 |
| MV-6 | MS-2 | Run validation with network unavailable, instrument or inspect execution to record attempted network access, and inspect filesystem writes after execution. | Validation completes using local files only, records zero network attempts, writes only approved repository evidence artifacts, and records engine package and document contract versions. | EVD-6 |
| MV-7 | MS-3 | Review registry/report usability for canonical dotted IDs and human labels, registry edit count, detected finding count, Q-2 recommendation, and continue/pivot/stop recommendation. | Continue/pivot/stop recommendation is grounded in section 6 criteria from `SRC-1`, records whether canonical IDs and human labels are acceptable for agent-authored specs, and explicitly states whether YAML or annotated Markdown should be the next source-of-truth experiment. | EVD-7 |

Section status: Complete

## 10. Execution Controls and Drift Management

| ID | Trigger | Required action | Owner | Evidence |
| --- | --- | --- | --- | --- |
| CTRL-1 | Implementation needs or attempts network access, credentials, live project-management APIs, or writes outside approved repository artifacts. | Stop execution and request design-owner approval before continuing. | Prototype implementer | DEV-* or design revision |
| CTRL-2 | Adapter implementation would require raw parser AST inspection, raw mdast inspection, `markdown-engine` internal imports, sibling-repo paths, unpublished artifacts, or package changes. | Stop implementation and either revise the adapter to package-root public APIs or open a new approved deviation before continuing. | Prototype implementer | DEV-* or design revision |
| CTRL-3 | A work package must edit another package's owned paths. | Coordinate boundary change and update section 7 before continuing. | Prototype implementer | Updated execution spec or DEV-* |
| CTRL-4 | Deterministic output differs across repeated runs. | Treat as blocking for `MS-2`; fix ordering or finding identity before approval. | Prototype implementer | EVD-4 |
| CTRL-5 | Fixture variants cannot produce a required failure category. | Pause `WP-3` and revise fixture family or design requirement. | Prototype implementer | EVD-3 or Q-* |

Deviation rules: Any scope expansion into live integrations, persistent storage, `markdown-engine` package changes or internal API use, network behavior, unpublished dependency artifacts, or multi-document identity requires a `DEV-*` entry approved by Jason Belmonti before implementation proceeds.

Pause or escalation conditions: Pause on failed milestone evidence, missing required validation category, unsafe local-safety result, ambiguous package ownership, or any new blocker not represented in this spec.

Section status: Complete

## 11. Data, Schema, Config, and Contract Handling

| Change | Impact | Compatibility | Reversibility | Validation |
| --- | --- | --- | --- | --- |
| YAML registry schema | Defines internal R0 fixture contract. | Internal prototype only; no external compatibility commitment. | Reversible by editing fixture artifacts. | VAL-1, VAL-2, VAL-3 |
| Validation report shape | Defines evidence consumed by local operator and review. | Internal prototype only; report categories may change after R0. | Reversible by changing report writer and snapshots. | VAL-3, VAL-5 |
| `@jasonbelmonti/markdown-engine@2.0.0` dependency | Defines the parsing, normalization, source-range, structural-query, and document-contract substrate for Markdown adaptation. | npm availability is verified; Markdown Trace consumes package-root public APIs only after `DEP-3` confirms BEL-991 release authorization and records the engine package version plus `documentVersion`. | Reversible before implementation by changing `PKG-2`; after implementation, requires design deviation and evidence update. | DEP-2, DEP-3, EVD-2 through EVD-6 |
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
| EVD-2 | Valid fixture validation report | `docs/evidence/valid-fixture-report.md` | VAL-2, MV-1 | Shows success exit, 0 findings, `@jasonbelmonti/markdown-engine` package version, and document contract version. |
| EVD-3 | Negative fixture validation report | `docs/evidence/negative-fixture-report.md` | VAL-3, MV-3 | Shows each required failure category, including missing registered definitions, plus engine package and document contract versions. |
| EVD-4 | Deterministic repeat report | `docs/evidence/determinism-repeat-report.md` | VAL-5, MV-5 | Shows 3 identical ordered outputs with identical engine package and document contract versions. |
| EVD-5 | Issue-key collision report | `docs/evidence/issue-key-collision-report.md` | VAL-4, MV-4 | Shows unregistered issue key remains outside the document entity graph and records engine package and document contract versions. |
| EVD-6 | Local-safety report | `docs/evidence/local-safety-report.md` | VAL-6, MV-6 | Shows validation completes with network unavailable, records zero network attempts, performs no live mutation, writes only approved repository evidence artifacts, and records engine package and document contract versions. |
| EVD-7 | Prototype decision record | `docs/evidence/prototype-decision-record.md` | VAL-7, MV-7 | Records canonical ID and human-label usability, compares maintenance effort and findings, resolves Q-2 with a recommended source-of-truth direction, and applies continue/pivot/stop criteria. |

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
| REL-1 | Prepare implementation review package after `DEP-2`, `DEP-3`, `MS-2`, and code review approval. | Before `MS-3` | Prototype implementer | Missing `DEP-2`, missing `DEP-3`, missing `VAL-1` through `VAL-6` evidence, or open blocking review finding. | DEP-2, DEP-3, EVD-1 through EVD-6 |
| REL-2 | Merge local prototype artifacts and publish R0 decision evidence after `DEP-3` and `MS-3`. | Before completion | Prototype implementer | Missing `DEP-3`, missing canonical ID usability judgment, missing maintenance signal, or no decision-owner approval. | DEP-3, EVD-7 |

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
| RISK-2 | Markdown Trace semantic extraction overfits adapter facts or misses domain references. | Prototype may overstate feasibility even though generic Markdown parsing is delegated to `markdown-engine`. | Medium | Prototype implementer | Use package-root `markdown-engine` 2.0 APIs only, keep entity semantics local, and record adapter misses/false positives. | VAL-2, VAL-3 |
| RISK-3 | Issue-key collision handling is over-scoped before cross-system projection is in scope. | Later Linear or Jira projection concerns could distract from document-local proof. | Low | Prototype implementer | Keep external projection out of scope and validate local issue-key behavior. | VAL-4 |

Open questions:

| ID | Question | Owner | Due date | Blocking? | Resolution path |
| --- | --- | --- | --- | --- | --- |
| Q-1 | Should a later implementation integrate this model into `markdown-engine` or remain a semantic validation layer? | Jason Belmonti | 2026-05-14 | No | Resolved for R0 by BEL-1045 and `docs/evidence/markdown-engine-2-adoption-decision.md`: consume published `markdown-engine@2.0.0` for generic parsing and keep registry semantics in Markdown Trace. |
| Q-2 | Should YAML remain source of truth or should annotated Markdown generate the registry? | Jason Belmonti | At `MS-3` prototype review | No | `EVD-7` recommends keeping YAML as R0 historical evidence while pivoting the next experiment toward link-backed annotated Markdown; final acceptance occurs at `MS-3`. |
| Q-3 | Should live Linear or Jira projection validation be the next slice after document-local proof? | Jason Belmonti | At `MS-3` prototype review | No | Resolve after document-local fixture evidence passes or exposes pivot. |

Approved deviations:

| ID | Deviation | Owner | Approver | Rationale | Impact | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| DEV-1 | Parser substrate pivots from custom scanner to published `@jasonbelmonti/markdown-engine@2.0.0`. | Prototype implementer | Jason Belmonti / BEL-1045 | `markdown-engine` 2.0 owns Markdown parsing, normalization, source ranges, sections, text spans, links, and structural queries. | Resolves the parser-strategy decision while preserving `CTRL-2` as the active internal-API/package-boundary stop condition; implementation remains constrained by `DEP-3` release authorization and package-root API use. | `docs/evidence/markdown-engine-2-adoption-decision.md` |

Approved waivers:

| ID | Waived rule or finding | Approver | Rationale | Boundary or expiry | Compensating control | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| None | No approved waivers. | N/A | N/A | N/A | N/A | N/A |

Section status: Complete

## 17. Execution Traceability Matrix

| Source, objective, or evidence-led claim | Change surfaces | Package boundaries | Work packages | Milestones | Controls | Validation | Review | Release or ops | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SRC-1 / OBJ-1 / Critical path | SURF-1, SURF-2, SURF-3, SURF-4, SURF-5 | PKG-1, PKG-2, PKG-3, PKG-4 | WP-1, WP-2 | MS-1 | DEP-2, DEP-3, CTRL-2, CTRL-3 | VAL-1, VAL-2 | REV-1 | REL-1, OBS-1 | EVD-1, EVD-2 |
| SRC-2 / Consensus review authority | SURF-1, SURF-5, SURF-6 | PKG-1, PKG-3, PKG-4 | WP-1, WP-3, WP-5 | MS-1, MS-2, MS-3 | CTRL-3, CTRL-5 | VAL-1, VAL-3, VAL-7 | REV-1, REV-2, REV-3 | REL-1, REL-2, OBS-2, OBS-4 | EVD-1, EVD-3, EVD-7 |
| SRC-3 / PR #1 cleanup authority | SURF-1, SURF-2, SURF-3, SURF-5, SURF-6 | PKG-1, PKG-2, PKG-3, PKG-4 | WP-1, WP-3, WP-4, WP-5 | MS-1, MS-2, MS-3 | CTRL-3, CTRL-5 | VAL-1, VAL-3, VAL-4, VAL-7 | REV-1, REV-2, REV-3 | REL-1, REL-2, OBS-2, OBS-4 | EVD-1, EVD-3, EVD-5, EVD-7 |
| OBJ-2 / First proving slice expansion | SURF-1, SURF-2, SURF-3, SURF-5 | PKG-1, PKG-2, PKG-3 | WP-3 | MS-2 | CTRL-3, CTRL-5 | VAL-3 | REV-2 | REL-1, OBS-2 | EVD-3 |
| OBJ-3 / Canonical ID usability | SURF-1, SURF-4, SURF-6 | PKG-1, PKG-4 | WP-1, WP-2, WP-5 | MS-1, MS-3 | CTRL-3 | VAL-1, VAL-2, VAL-7 | REV-1, REV-3 | REL-2, OBS-4 | EVD-1, EVD-2, EVD-7 |
| OBJ-4 / Collision behavior | SURF-2, SURF-3, SURF-5 | PKG-2, PKG-3 | WP-4 | MS-2 | CTRL-1, CTRL-2 | VAL-4 | REV-2 | REL-1, OBS-2 | EVD-5 |
| OBJ-5 / Maintenance signal | SURF-6 | PKG-4 | WP-5 | MS-3 | CTRL-4 | VAL-7 | REV-3 | REL-2, OBS-4 | EVD-7 |
| Optional tool config / SURF-7 | SURF-7 | PKG-4 | WP-1, WP-2, WP-3, WP-4 | MS-1, MS-2 | DEP-2, DEP-3, CTRL-3 | VAL-2, VAL-3, VAL-4, VAL-5, VAL-6 | REV-1, REV-2 | REL-1 | EVD-2, EVD-3, EVD-4, EVD-5, EVD-6 |
| RISK-1 | SURF-1, SURF-6 | PKG-1, PKG-4 | WP-1, WP-5 | MS-3 | CTRL-3 | VAL-1, VAL-7 | REV-3 | REL-2, OBS-4 | EVD-1, EVD-7 |
| RISK-2 / SRC-4 parser pivot | SURF-2, SURF-3, SURF-5, SURF-7 | PKG-2, PKG-3 | WP-2, WP-3 | MS-1, MS-2 | DEP-2, DEP-3, CTRL-2, CTRL-5, DEV-1 | VAL-2, VAL-3 | REV-1, REV-2 | REL-1 | EVD-2, EVD-3, `docs/evidence/markdown-engine-2-adoption-decision.md` |
| RISK-3 | SURF-2, SURF-3, SURF-5 | PKG-2, PKG-3 | WP-4 | MS-2 | CTRL-1 | VAL-4, VAL-6 | REV-2 | REL-1, OBS-2 | EVD-5, EVD-6 |
| Determinism / OBS-3 | SURF-3, SURF-4, SURF-5 | PKG-3, PKG-4 | WP-4 | MS-2 | CTRL-4 | VAL-5 | REV-2 | REL-1, OBS-3 | EVD-4 |

Section status: Complete

## 18. Final Execution Gate

Entry gate: Ready when this execution spec is approved, merged PR #1 source cleanup is available in the implementation branch, `DEP-2` has been revalidated, `DEP-3` is satisfied, and no new blocking source-design finding is open.

Milestone approval gate: `MS-1`, `MS-2`, and `MS-3` require named approval from Jason Belmonti at their due points with the evidence artifacts listed in section 9.

Completion gate: Complete only when `VAL-1` through `VAL-7` pass or have explicit rejected/pivot evidence, all blocking `REV-*` reviews are complete, and `MS-3` records continue, pivot, or stop.

Release gate: Merge only local repository artifacts after `REL-2` prerequisites are satisfied; no hosted release or live activation is part of E0.

Handoff record: Handoff shall include the implementation PR, fixture inventory, validation report output, deterministic repeat evidence, local-safety evidence for zero network attempts and approved repository writes, canonical ID and human-label usability judgment, maintenance signal, Q-2 source-of-truth recommendation, and `MS-3` decision.

Final readiness state: Ready to investigate

Section status: Complete
