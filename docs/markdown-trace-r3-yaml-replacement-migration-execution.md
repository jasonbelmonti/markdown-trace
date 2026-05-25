# Markdown Trace R3: YAML Replacement Migration Execution Spec

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace R3: YAML Replacement Migration Execution Spec |
| Status | Draft |
| Execution level | `E2` |
| Execution level justification | The work is a durable local implementation that spans code, fixtures, checked generated artifacts, tests, evidence, and operator documentation. It is reversible and local-only, so it does not trigger `E3`, but it is broader than an `E1` bounded change because it governs source-authority migration gates. |
| Author(s) | Codex |
| Executor(s) | Markdown Trace implementation agent |
| Reviewers | Jason Belmonti; independent implementation reviewer for migration comparison logic |
| Decision owner | Jason Belmonti |
| Target branch, release, or milestone | R3 YAML replacement migration implementation readiness |
| Last updated | 2026-05-25 |
| Related source docs | `docs/markdown-trace-r3-yaml-replacement-migration-addendum.md`; `docs/markdown-trace-r3-yaml-replacement-migration-design-process.md`; `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md`; `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` |
| Related tickets | `BEL-1216`; `BEL-1217`; `BEL-1218`; `BEL-1219`; `BEL-1220`; `BEL-1221`; follow-up R3 implementation issues to be created from this spec |

## 0. Execution Summary

Decision requested: Approve to execute

Approved outcome: Execute `SRC-1` and `SRC-2` by implementing the R3 migration checks that prove whether Markdown plus type profiles can become editable registry source while checked generated YAML remains review evidence; source-authority flip remains blocked until the required evidence set is approved.

Execution approach: Deliver the work through `WP-1` first same-document parity proof, `WP-2` migration comparison core, `WP-3` local migration check wrapper, `WP-4` R2 fixture/profile coverage evidence, and `WP-5` review policy, rollback rehearsal, and final migration evidence. Each slice must preserve R0 YAML compatibility and no-write check mode.

Entry condition: PR #30 and merge commit `d928b4a` are present on the implementation base, this execution spec has passed structural validation, and Jason Belmonti approves the `E2` execution boundary before code work begins.

Top risks or unknowns:

- RISK-1: Manual YAML and generated sidecar outputs may diverge across registry, graph, metadata, or validation dimensions.
- RISK-2: A future authority flip could miss R1 minimal, CODEFACTORY, stale, missing, or malformed-profile coverage required by R2.
- RISK-3: Migration checks could accidentally rewrite generated artifacts in check mode or imply YAML removal before approval.

Section status: Complete

## Layer 1: Execution Basis

## 1. Source Authority and Scope

| ID | Source | Authority | Execution implication |
| --- | --- | --- | --- |
| SRC-1 | `docs/markdown-trace-r3-yaml-replacement-migration-addendum.md` | Approved R3 design addendum merged through PR #30 | Defines binding requirements `REQ-1` through `REQ-9`, comparison dimensions, coverage matrix, rollback, and source-authority flip gates. |
| SRC-2 | `docs/markdown-trace-r3-yaml-replacement-migration-design-process.md` | Selected design decision record for staged parity-gated migration | Selects CAND-3 and requires same-document parity, YAML compatibility, generated drift checks, review policy, and rollback before authority changes. |
| SRC-3 | `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md` | R2 replacement criteria and transition evidence | Blocks YAML replacement until migration checks, review policy, compatibility, rollback, CI enforcement, fixture/profile coverage, documentation, and approval record exist. |
| SRC-4 | `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` | Generated sidecar artifact contract | Defines deterministic generated sidecar path, schema, metadata, serialization, review marker, and coexistence with hand-authored YAML. |
| SRC-5 | Repository state at merge commit `d928b4a` | Current implementation baseline | Provides R0 YAML fixture, R1 generated sidecars, CLI derivation and validation paths, and test coverage that execution shall preserve. |

In scope: Local migration comparison code, report model, same-document parity fixture or equivalent control fixture, migrated fixture inventory, migration check command or npm script, tests for registry, graph, metadata, validation, missing artifacts, stale artifacts, malformed profiles, CODEFACTORY profile coverage, documentation for review and rollback, and evidence artifacts proving every required gate.

Out of scope: Removing YAML registry support, changing R1 `ctx://trace` syntax, changing R2 generated sidecar serialization, making generated sidecars sole source of truth, adding live Linear, Jira, graph database, service deployment, hosted CI administration outside repository scripts, or approving the final source-authority flip.

Definition of done: A local operator can run the migration check against the required fixture set and receive deterministic pass/fail output plus reviewable evidence covering registry, graph, metadata, validation, fixture/profile coverage, YAML compatibility, no-write drift behavior, documentation, and rollback rehearsal. The final evidence package states whether authority flip may be requested, but does not perform the flip.

Re-decision boundaries: Execution shall not re-decide the R2 sidecar artifact contract, YAML compatibility during the migration window, generated artifact human-editable status, required R2 fixture/profile coverage, or the requirement for a separate authority-flip approval record. If parity cannot be produced without changing registry semantics, execution pauses and returns to Jason Belmonti for design or scope revision.

Section status: Complete

## 2. Objectives and Non-Objectives

| ID | Statement | Completion horizon | Evidence |
| --- | --- | --- | --- |
| OBJ-1 | Prove same-document manual/generated comparison across registry, graph, metadata, and validation dimensions before any source-authority change. | Completion of `MS-1` and `MS-2`. | `EVD-1`, `EVD-2` |
| OBJ-2 | Preserve R0 YAML validation compatibility and generated sidecar no-write check behavior through every migration slice. | Every implementation PR and completion of `MS-3`. | `EVD-3`, `EVD-4`, `EVD-9` |
| OBJ-3 | Produce the R2-required fixture/profile coverage matrix for R0 YAML, minimal R1, CODEFACTORY, stale artifact failure, missing artifact failure, and malformed profile failure cases. | Completion of `MS-3`. | `EVD-6` |
| OBJ-4 | Give reviewers and operators deterministic instructions for generated artifact review, regeneration, rollback, and drift recovery. | Completion of `MS-4`. | `EVD-7`, `EVD-8` |
| OBJ-5 | Produce a final R3 migration evidence package that supports a later authority-flip approval decision without silently performing the flip. | Completion of `MS-5`. | `EVD-10` |
| NG-1 | This execution will not remove hand-authored YAML support or make generated sidecars the only supported registry source. | Entire execution. | `REV-4`, `REL-3` |
| NG-2 | This execution does not include live Linear, Jira, graph database, hosted service, or multi-document project registry scope. | Entire execution. | `REV-1`, `SURF-*` review |
| NG-3 | This execution will not change R1 link syntax or the R2 generated sidecar serialization contract. | Entire execution. | `REV-1`, `VAL-5` |

Section status: Complete

## 3. Ownership, Roles, and Decision Points

| Role or person | Responsibility | Required action |
| --- | --- | --- |
| Markdown Trace implementation agent | Implement the migration checks, fixtures, tests, evidence, and docs within this spec. | Execute |
| Jason Belmonti | Own execution approval, milestone approval, and final authority-flip decision readiness. | Approve |
| Independent implementation reviewer | Review comparison logic, fixture/profile coverage, and source-authority boundaries. | Review |
| Generated artifact reviewer | Review generated sidecar diffs and regeneration policy evidence. | Review |
| Local operator | Run migration checks, inspect reports, and execute rollback rehearsal steps. | Operate |

Decision points:

- DP-1: Approve this execution spec before implementation begins.
- DP-2: Approve `MS-1` before broadening comparator behavior beyond the first same-document parity proof.
- DP-3: Approve `MS-3` before documentation and final evidence claim that all R2 coverage exists.
- DP-4: Approve `MS-5` before creating any separate authority-flip task.

Escalation path: If an implementation slice requires changing the generated sidecar serialization contract, removing YAML compatibility, weakening fixture/profile coverage, writing artifacts in check mode, or approving generated authority by implication, the implementer stops and escalates to Jason Belmonti for design revision or explicit deviation approval.

Section status: Complete

## 4. Constraints, Assumptions, and Dependencies

| ID | Type | Statement | Owner | Blocking? | Validation or resolution plan |
| --- | --- | --- | --- | --- | --- |
| CON-1 | Constraint | Existing hand-authored YAML sidecars remain valid registry inputs during the migration window. | Implementation agent | No | Run `VAL-4` in every implementation PR and final gate. |
| CON-2 | Constraint | Generated sidecars are checked artifacts and are not human-editable source. | Implementation agent | No | Enforce with `VAL-5`, `VAL-7`, docs, and review gates. |
| CON-3 | Constraint | Migration comparison must cover registry, graph, metadata, and validation dimensions. | Implementation agent | No | Prove with `VAL-1`, `VAL-2`, and `EVD-2`. |
| CON-4 | Constraint | Check mode must not write generated artifacts or mutate stale bytes. | Implementation agent | No | Prove with `VAL-3` and `EVD-3`. |
| CON-5 | Constraint | Source-authority flip is out of scope until `VAL-1` through `VAL-8` evidence is accepted. | Jason Belmonti | No | Block through `REV-4`, `REL-4`, and final gate wording. |
| ASM-1 | Assumption | A same-document parity fixture can be produced from the R0 fixture or a dedicated equivalent fixture without changing public registry semantics. | Implementation agent | No | Retire in `WP-1`; failure triggers `CTRL-1` and `MS-1` rejection. |
| ASM-2 | Assumption | Existing registry loading, graph derivation, validation, and generated sidecar APIs can be reused without changing their public semantics. | Implementation agent | No | Retire through `VAL-1`, `VAL-2`, `VAL-4`, and `VAL-5`. |
| DEP-1 | Dependency | Merge commit `d928b4a` containing PR #30 must be present on the implementation base. | Implementation agent | Yes | Confirm with `git merge-base --is-ancestor d928b4a HEAD` or equivalent branch inspection before code work. |
| DEP-2 | Dependency | Execution spec structural validation must pass before implementation begins. | Implementation agent | Yes | Run markdown-engine validation with `execution-spec-validation-profile.yaml`. |

Section status: Complete

## Layer 2: Execution Plan

## 5. Evidence-Led Execution Model

Observable outcome: A local operator can run one migration check and receive a deterministic report that classifies manual/generated registry, graph, metadata, and validation deltas while preserving YAML compatibility and no-write generated artifact behavior.

Core value proposition: The implementation turns R3 source-authority migration from a subjective review judgment into local evidence that can support or block a later authority-flip decision.

Critical path hypothesis: If the system can generate or locate a same-document sidecar, load both manual and generated registry representations, derive comparable graph and validation outputs, classify every dimension as equivalent, intentional, or blocking, and preserve no-write checks, then Markdown/profile source can proceed toward controlled replacement planning without weakening the YAML compatibility boundary.

First proving slice: `WP-1` shall produce the first same-document R0 or equivalent parity proof and a focused comparison report covering all four required dimensions for one fixture family. If that proof cannot be produced without semantic changes, execution stops before broad comparator work.

Sequencing principle: Sequence by risk retirement and progressive value: prove one same-document parity path first, harden deterministic classification second, add migration check orchestration third, expand to R2 fixture/profile coverage fourth, then document review and rollback evidence last.

Validation cadence: Each work package must produce at least one `VAL-*` result and evidence artifact before the next milestone. Baseline `npm run typecheck`, `npm test`, `npm run build`, `npm run validate:fixture`, and `npm run derive:fixture` run before every implementation PR review.

Deferred completeness: Final source-authority flip, YAML removal, multi-document registry projection, hosted CI administration beyond repository scripts, public API stability guarantees, and generalized migration beyond the required fixture set are deferred until after `MS-5`.

Primary risks and unknowns:

| ID | Risk or unknown | Why it matters | Owner | Evidence required to retire | Decision gate |
| --- | --- | --- | --- | --- | --- |
| RISK-1 | Same-document manual/generated parity may expose semantic differences that cannot be classified safely. | Unclassified drift would make generated authority unsafe. | Implementation agent | `EVD-1` and `EVD-2` showing equivalent, intentional, or blocking classification across every dimension. | `MS-1`, `MS-2` |
| RISK-2 | Manual YAML metadata absence may be confused with generated metadata drift. | Manual registries do not carry `generated.*`; incorrect comparison would create false blockers or false passes. | Implementation agent | `VAL-2` and `EVD-2` prove manual metadata absence is intentional only in `yaml-authoritative` state. | `MS-2` |
| RISK-3 | Migration check mode could write generated bytes while attempting to verify drift. | A check command that rewrites artifacts hides stale evidence. | Implementation agent | `VAL-3` and `EVD-3` prove missing and stale cases exit non-zero without writes. | `MS-3` |
| RISK-4 | Fixture/profile coverage could pass a single parity proof but miss R2-required breadth. | The R2 replacement criteria require more than one manual/generated pair. | Implementation agent | `VAL-6` and `EVD-6` coverage matrix with all required rows passing. | `MS-3` |

Section status: Complete

## 6. Change Surface Inventory

| ID | Surface | Change type | Owner | Read/write boundary | Review expectation |
| --- | --- | --- | --- | --- | --- |
| SURF-1 | `src/markdowntrace/migration/**` | Code | Implementation agent | Write new migration comparison model, normalization, classification, and report construction. | Review public entry points, deterministic ordering, dimension coverage, and no private deep imports. |
| SURF-2 | `src/markdowntrace/registry/**`, `src/markdowntrace/graph/**`, `src/markdowntrace/validation/**` | Code | Implementation agent | Read existing APIs and make only compatibility-preserving helper edits when required by `PKG-1`. | Review that registry loading, graph derivation, and validation semantics remain compatible. |
| SURF-3 | `src/markdowntrace/cli.ts`, `src/markdowntrace/reporting/**`, `package.json` | Code / Config | Implementation agent | Add migration check command or npm script without changing existing command behavior. | Review CLI contract, exit codes, check-mode no-write behavior, and script naming. |
| SURF-4 | `fixtures/r0-document-local-registry/**`, `fixtures/r1-link-backed-entity-syntax/**` | Test / Data | Implementation agent | Add or regenerate only migration fixtures and checked generated artifacts required by the coverage matrix. | Review generated sidecar metadata, fixture intent, and absence of YAML authority removal. |
| SURF-5 | `tests/**`, `tests/support/**` | Test | Implementation agent | Add focused unit, integration, negative, and evidence-harness tests for migration checks. | Review coverage for equivalent, intentional, blocking, stale, missing, malformed, R0, minimal R1, and CODEFACTORY cases. |
| SURF-6 | `docs/evidence/**` | Docs | Implementation agent | Write migration evidence, coverage matrix, rollback rehearsal, and final recommendation artifacts. | Review that evidence is command-backed and does not approve source-authority flip by implication. |
| SURF-7 | `docs/**` migration workflow docs | Docs | Implementation agent | Write operator and reviewer workflow docs for authority state, regeneration, review, drift, and rollback. | Review clarity for humans editing Markdown/profile source versus checked generated YAML. |

Section status: Complete

## 7. Agent-Focused Package Decomposition

Decomposition mission: Keep comparison semantics, command orchestration, fixture evidence, and operator policy independently reviewable so agents can execute slices without weakening the source-authority boundary.

| ID | Unit | Ladder level | Mission | Observable value enabled | Risk retired | Public interface | Validation command | Promotion blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PKG-1 | Migration comparison core | 2 | Normalize manual/generated registries, graphs, metadata, and validation outcomes into deterministic dimension classifications. | A reviewer can inspect why a pair is equivalent, intentional, or blocking. | RISK-1, RISK-2 | `compareMigrationPair(input)` returning `MigrationComparisonReport`. | `npm test -- tests/test_migration_comparison.test.ts` | Project-specific registry and generated-sidecar semantics prevent reusable package promotion. |
| PKG-2 | Migration check orchestration | 2 | Run YAML compatibility, generated sidecar checks, comparison, and coverage aggregation through a local command or npm script. | A local operator can run one migration gate before review. | RISK-3 | CLI command or npm script that exits non-zero on blocking drift. | `npm test -- tests/test_migration_check.test.ts` | CLI remains internal until final authority workflow is approved. |
| PKG-3 | Migration fixture and evidence harness | 1 | Maintain same-document parity fixtures, negative fixture probes, and coverage matrix evidence. | Required R2 fixture/profile cases are concrete and repeatable. | RISK-4 | Test support helpers and evidence report generator. | `npm test -- tests/test_migration_evidence.test.ts` | Harness is repository-specific and not reusable. |
| PKG-4 | Migration operator documentation | 1 | Document authority states, review policy, regeneration, rollback, and final approval handoff. | Reviewers know what to edit, what to regenerate, and what blocks approval. | RISK-3, RISK-4 | Markdown docs and evidence records. | `npx --yes @jasonbelmonti/markdown-engine@2.0.0 validate --file <doc> --profile <profile>` where applicable. | Docs encode current project policy, not a shared library. |

### Package Boundary Card: PKG-1

Ladder level: 2

Mission: Compare manual and generated registry evidence without mutating either artifact.

Value / risk trace:
- Observable value enabled: Same-document parity can be reviewed dimension by dimension.
- Risk retired: RISK-1 and RISK-2.
- Validation evidence: `VAL-1`, `VAL-2`, `EVD-1`, `EVD-2`.
- Blocking unknowns: `ASM-1` until `MS-1`.

Owns:
- Files/directories: `src/markdowntrace/migration/**`
- Concepts: dimension normalization, delta classification, comparison report model
- Runtime responsibilities: deterministic comparison over explicit local inputs

Does not own:
- Explicitly excluded behavior: generated sidecar serialization, registry loading semantics, graph derivation semantics, validation rule semantics
- Responsibilities delegated elsewhere: existing registry, graph, validation, and sidecar packages

Public interface:
- Exported types: `MigrationComparisonReport`, `MigrationDimensionResult`, `MigrationDelta`
- Exported functions/classes/components: `compareMigrationPair(input)`
- Events/messages/contracts: local report data only
- CLI/API surface: none

Allowed dependencies:
- May import: existing registry loader, graph derivation, validation reporter models, generated sidecar metadata helpers
- May call: pure comparison and local read helpers
- May read configuration from: explicit function input only

Forbidden dependencies:
- Must not import: CLI command modules, test-only fixtures, network clients, hosted service SDKs
- Must not call: filesystem write APIs, sidecar write mode, external mutation APIs
- Must not know about: final source-authority flip approval workflow

State boundary:
- Owns state: in-memory comparison report
- Reads state: explicit manual registry, generated sidecar, document, profile, graph, and validation inputs
- Mutates state: none
- Persistence responsibility: none

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/migration/**`, `tests/test_migration_comparison.test.ts`
- Agent read-only paths: `src/markdowntrace/registry/**`, `src/markdowntrace/graph/**`, `src/markdowntrace/validation/**`, `docs/**`
- Required coordination before editing: any registry, graph, validation, or generated-sidecar public shape

Validation command: `npm test -- tests/test_migration_comparison.test.ts`

Promotion blockers: The API depends on Markdown Trace registry and generated-sidecar semantics.

### Package Boundary Card: PKG-2

Ladder level: 2

Mission: Orchestrate local migration checks without changing existing validation or derivation command behavior.

Value / risk trace:
- Observable value enabled: Operators and CI-equivalent scripts can enforce migration gates consistently.
- Risk retired: RISK-3.
- Validation evidence: `VAL-3`, `VAL-4`, `VAL-5`, `EVD-3`, `EVD-4`, `EVD-5`.
- Blocking unknowns: None after `WP-3`.

Owns:
- Files/directories: `src/markdowntrace/cli.ts`, `src/markdowntrace/reporting/**` if needed, `package.json` scripts
- Concepts: migration check command, exit codes, command ordering, no-write orchestration
- Runtime responsibilities: run checks in the R3 order and fail on blocking conditions

Does not own:
- Explicitly excluded behavior: comparison semantics owned by `PKG-1`, generated sidecar serialization, YAML compatibility policy
- Responsibilities delegated elsewhere: artifact writing and validation internals

Public interface:
- Exported types: none unless command options require local model extraction
- Exported functions/classes/components: command handler or script entry point
- Events/messages/contracts: exit code and report path
- CLI/API surface: migration check command or `npm run migration:check`

Allowed dependencies:
- May import: `PKG-1`, generated sidecar check helpers, registry validation helpers, report writer helpers
- May call: local filesystem read APIs and existing no-write check paths
- May read configuration from: command arguments or repository fixture inventory

Forbidden dependencies:
- Must not import: test-only fixture mutation helpers into production CLI
- Must not call: generated sidecar write mode during check mode, network APIs, source-authority flip routines
- Must not know about: manual approval decisions except as report text

State boundary:
- Owns state: command result and report aggregation
- Reads state: source documents, registries, profiles, generated artifacts, inventory config
- Mutates state: report file only when explicitly requested; generated artifacts never in check mode
- Persistence responsibility: optional comparison report under documented evidence path

Agent ownership boundary:
- Agent editable paths: `src/markdowntrace/cli.ts`, `src/markdowntrace/reporting/**`, `package.json`, `tests/test_migration_check.test.ts`
- Agent read-only paths: `src/markdowntrace/migration/**`, generated sidecar serialization modules, design docs
- Required coordination before editing: command names, package scripts, or report schema used by `PKG-4`

Validation command: `npm test -- tests/test_migration_check.test.ts`

Promotion blockers: The command is local and experimental until source-authority workflow is approved.

### Package Boundary Card: PKG-3

Ladder level: 1

Mission: Own fixtures, negative probes, and evidence generation that prove R2 replacement coverage.

Value / risk trace:
- Observable value enabled: The fixture/profile coverage matrix is command-backed and reviewable.
- Risk retired: RISK-4.
- Validation evidence: `VAL-6`, `EVD-6`.
- Blocking unknowns: None after `WP-4`.

Owns:
- Files/directories: `fixtures/**` migration additions, `tests/support/**` migration evidence helpers, migration-focused tests
- Concepts: R0 parity control, minimal R1 control, CODEFACTORY control, stale artifact probe, missing artifact probe, malformed profile probe
- Runtime responsibilities: repeatable fixture setup for tests and evidence

Does not own:
- Explicitly excluded behavior: production comparison semantics and CLI command behavior
- Responsibilities delegated elsewhere: `PKG-1` and `PKG-2`

Public interface:
- Exported types: test support types only
- Exported functions/classes/components: test support helpers only
- Events/messages/contracts: evidence report rows
- CLI/API surface: none

Allowed dependencies:
- May import: test utilities, local command runners, fixture path helpers
- May call: local CLI commands in controlled temporary directories
- May read configuration from: explicit fixture inventory

Forbidden dependencies:
- Must not import: production-only internals into docs
- Must not call: network APIs or uncontrolled filesystem mutation outside temp directories and intended generated artifacts
- Must not know about: final authority approval except as coverage status

State boundary:
- Owns state: test fixture copies and evidence outputs
- Reads state: checked fixtures and generated artifacts
- Mutates state: temporary fixture copies and intended evidence docs only
- Persistence responsibility: evidence artifacts under `docs/evidence/**`

Agent ownership boundary:
- Agent editable paths: `fixtures/**` migration additions, `tests/support/**`, `tests/test_migration_evidence.test.ts`, `docs/evidence/**` migration evidence
- Agent read-only paths: source authority docs, production comparison modules except public APIs
- Required coordination before editing: checked generated artifact bytes or fixture naming

Validation command: `npm test -- tests/test_migration_evidence.test.ts`

Promotion blockers: Harness is tightly coupled to this repository's fixtures and evidence docs.

### Package Boundary Card: PKG-4

Ladder level: 1

Mission: Own human-facing migration workflow and rollback documentation.

Value / risk trace:
- Observable value enabled: Reviewers and operators can execute the intended workflow without hidden chat context.
- Risk retired: RISK-3 and RISK-4.
- Validation evidence: `VAL-7`, `VAL-8`, `EVD-7`, `EVD-8`, `EVD-10`.
- Blocking unknowns: None.

Owns:
- Files/directories: migration workflow docs and final evidence docs under `docs/**`
- Concepts: authority states, generated artifact review policy, regeneration instructions, rollback rehearsal, final approval handoff
- Runtime responsibilities: none

Does not own:
- Explicitly excluded behavior: implementation code, generated sidecar bytes, final authority flip
- Responsibilities delegated elsewhere: code and fixture evidence packages

Public interface:
- Exported types: none
- Exported functions/classes/components: none
- Events/messages/contracts: docs and evidence records
- CLI/API surface: documented commands only

Allowed dependencies:
- May import: none
- May call: not applicable
- May read configuration from: source authority docs and evidence outputs

Forbidden dependencies:
- Must not import: code
- Must not call: runtime systems
- Must not know about: unapproved source-authority state beyond documented gates

State boundary:
- Owns state: Markdown documentation content
- Reads state: evidence artifacts and source docs
- Mutates state: docs only
- Persistence responsibility: durable docs and evidence records

Agent ownership boundary:
- Agent editable paths: `docs/**` migration workflow and evidence docs
- Agent read-only paths: `src/**`, `fixtures/**`, `tests/**`
- Required coordination before editing: source authority docs or final approval wording

Validation command: markdown profile validation where applicable plus manual review under `REV-3`.

Promotion blockers: Docs are project policy, not reusable code.

Dependency direction rules:

- Allowed direction: `PKG-2` may call `PKG-1`; `PKG-3` may exercise `PKG-1` and `PKG-2`; `PKG-4` may reference outputs from all packages.
- Prohibited imports: `PKG-1` must not import `PKG-2`, test support, CLI modules, or docs.
- Allowed cross-boundary communication: exported TypeScript types, CLI outputs, evidence report files, and documented command names.
- Disallowed cross-boundary communication: private deep imports, duplicated report schemas, mutable global state, or implicit fixture path discovery outside the inventory.

State boundary rules:

- Package-owned state: `PKG-1` owns in-memory comparison reports; `PKG-2` owns command aggregation; `PKG-3` owns fixture/evidence outputs; `PKG-4` owns docs.
- Package-read state: all packages may read approved source authority docs as context.
- Package-mutated state: only `PKG-2` and `PKG-3` may write reports or generated artifacts, and generated artifacts only outside check mode.
- Persistence ownership: evidence docs belong to `PKG-3` and `PKG-4`; generated sidecars remain under the R2 contract.

Reusable package candidates:

| Candidate | Current level | Reuse rationale | Required decoupling | Promotion trigger |
| --- | --- | --- | --- | --- |
| None | N/A | The migration logic is intentionally bound to Markdown Trace registry and sidecar semantics. | N/A | N/A |

Coupling tripwires:

- `PKG-1` needs to know CLI argument names or package scripts.
- `PKG-2` changes generated sidecar serialization to make comparison easier.
- `PKG-3` fixture helpers become required production imports.
- `PKG-4` says generated artifacts are authoritative before `MS-5` approval.
- Two agents must edit the same production file for separate work packages without a named coordination point.

N/A rationale: Section 7 applies because code, fixtures, contracts, and multi-agent package boundaries are affected.

Section status: Complete

## 8. Work Packages and Sequencing

Planning strategy: Risk retirement followed by progressive value.

Critical path hypothesis: A first same-document parity report can prove whether the selected migration path is feasible before broader fixture/profile coverage and operator docs are built.

First proving slice: `WP-1` produces `EVD-1`, a first R0 or equivalent same-document comparison report across registry, graph, metadata, and validation dimensions.

Validation cadence: Every work package produces validation evidence before its milestone gate. Full regression validation runs before merge of any implementation PR.

Deferred completeness: Source-authority flip, YAML removal, generalized multi-document migration, and hosted CI policy are deferred until after `MS-5`.

| ID | Objective | Owner | Package boundary | Editable paths | Read-only paths | Inputs | Outputs | Dependencies | Observable value enabled | Risk retired | Milestone gate | Validation checkpoint | Completion criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WP-1 | Produce the first same-document parity proof for R0 or an equivalent control fixture. | Implementation agent | PKG-1, PKG-3 | `src/markdowntrace/migration/**`; migration fixture additions under `fixtures/**`; `tests/test_migration_comparison.test.ts`; `docs/evidence/**` first parity evidence | R3 addendum, R2 criteria, existing registry, graph, validation, sidecar modules | `SRC-1` through `SRC-5`; existing R0 YAML fixture; generated sidecar contract | First comparison report with one row each for registry, graph, metadata, and validation | `DEP-1`, `DEP-2`, `ASM-1` | Establishes whether the migration path is technically feasible. | RISK-1, RISK-2 | MS-1 | VAL-1 | `EVD-1` exists and either proves parity or records blocking drift with no source-authority change. |
| WP-2 | Harden deterministic comparison classifications and report model. | Implementation agent | PKG-1 | `src/markdowntrace/migration/**`; `tests/test_migration_comparison.test.ts` | Existing registry, graph, validation, generated-sidecar modules | `EVD-1`; comparison allocation detail from `SRC-1` | Stable `MigrationComparisonReport` with equivalent, intentional, and blocking classifications | `WP-1` approved or conditionally approved | Reviewers can understand every delta without hand-inspecting full YAML. | RISK-1, RISK-2 | MS-2 | VAL-2 | Tests cover equivalent, intentional, and blocking drift across all four dimensions. |
| WP-3 | Add local migration check orchestration and no-write failure behavior. | Implementation agent | PKG-2 | `src/markdowntrace/cli.ts`; `src/markdowntrace/reporting/**`; `package.json`; `tests/test_migration_check.test.ts` | `PKG-1`; sidecar writer/check code; validation CLI | `EVD-2`; R2 sidecar contract | Local command or npm script that runs compatibility, generated sidecar checks, comparison, and exits non-zero on blocking drift | `WP-2` public report model stable | Operators can run one migration gate before review. | RISK-3 | MS-3 | VAL-3, VAL-4, VAL-5 | Missing, stale, unexplained drift, YAML compatibility, and byte-stability checks pass as specified. |
| WP-4 | Expand evidence to the full R2 fixture/profile coverage matrix. | Implementation agent | PKG-3 | `fixtures/**` migration additions; `tests/support/**`; `tests/test_migration_evidence.test.ts`; `docs/evidence/**` coverage matrix | Existing R0 and R1 fixtures, type profiles, generated sidecars | `EVD-3`, `EVD-4`, `EVD-5`; R2 coverage criteria | Coverage matrix for R0 YAML, minimal R1, CODEFACTORY, stale artifact, missing artifact, and malformed profile cases | `WP-3` command available | Prevents a single parity proof from being mistaken for replacement readiness. | RISK-4 | MS-3 | VAL-6, VAL-9 | `EVD-6` lists passing evidence for every R2-required case and baseline suite. |
| WP-5 | Document review policy, rollback rehearsal, and final migration evidence package. | Implementation agent | PKG-4 | `docs/**` migration workflow docs; `docs/evidence/**` final evidence and rollback rehearsal | Source authority docs, implementation evidence, command outputs | `EVD-1` through `EVD-9` | Operator workflow, reviewer policy, rollback rehearsal result, final R3 migration evidence package | `MS-3` approved | Humans can decide whether to request a later authority flip with complete evidence. | RISK-3, RISK-4 | MS-4, MS-5 | VAL-7, VAL-8, VAL-10 | Docs identify authority states, regeneration, review, rollback, and final flip remains a separate approval. |

Execution sequence:

1. Run entry validation and confirm `DEP-1` and `DEP-2`.
2. Execute `WP-1`; stop if same-document comparison cannot be produced without design revision.
3. Execute `WP-2`; keep comparison core independent of CLI orchestration.
4. Execute `WP-3`; prove no-write check behavior and YAML compatibility before expanding coverage.
5. Execute `WP-4`; produce the full R2 coverage matrix.
6. Execute `WP-5`; document workflow and rollback, then produce final evidence.

Parallelization rules: `WP-1` is serial and blocks all other implementation work. `WP-2` and `WP-3` may not run in parallel until the report model interface is stable. `WP-4` begins after the `WP-3` command is available and must complete before `MS-3`; `WP-5` final evidence and rollback documentation begins only after `MS-3` approves command and coverage semantics.

Integration points: Report schema handoff from `WP-2` to `WP-3`; command output handoff from `WP-3` to `WP-4`; evidence and runbook handoff from `WP-4` to `WP-5`.

Coordination triggers: Any edit to generated sidecar serialization, registry root shape, validation finding shape, report schema, command name, generated artifact path, or source-authority wording requires coordination with all affected package owners and may require `DEV-*` approval.

Section status: Complete

## 9. Milestone Gates and Manual Verification

| ID | Gate objective | Covered work | Due point | Human verifier | Prerequisites | Review gate | Required evidence | Approval decision | Failure path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MS-1 | Approve first same-document parity proof or stop for design revision. | OBJ-1; SURF-1; SURF-4; PKG-1; PKG-3; WP-1 | Before WP-2 starts | Jason Belmonti | VAL-1; EVD-1 | REV-1 | EVD-1 | Approve / Reject / Conditional approval | If rejected, keep YAML authority and return to design-process or revise fixture strategy. |
| MS-2 | Approve deterministic comparison semantics and report model. | OBJ-1; SURF-1; PKG-1; WP-2 | Before WP-3 starts | Independent implementation reviewer | VAL-2; EVD-2 | REV-1 | EVD-2 | Approve / Reject / Conditional approval | If rejected, revise comparison normalization and rerun WP-2 validation. |
| MS-3 | Approve local migration check command and full R2 coverage matrix. | OBJ-2; OBJ-3; SURF-2; SURF-3; SURF-4; SURF-5; PKG-2; PKG-3; WP-3; WP-4 | Before WP-5 final evidence claims | Jason Belmonti | VAL-3; VAL-4; VAL-5; VAL-6; VAL-9; EVD-3; EVD-4; EVD-5; EVD-6; EVD-9 | REV-1, REV-2 | EVD-3, EVD-4, EVD-5, EVD-6, EVD-9 | Approve / Reject / Conditional approval | If rejected, do not publish final migration readiness evidence; fix coverage or command behavior. |
| MS-4 | Approve operator workflow and rollback rehearsal. | OBJ-4; SURF-6; SURF-7; PKG-4; WP-5 | Before completion gate | Local operator and Jason Belmonti | VAL-7; VAL-8; EVD-7; EVD-8 | REV-3 | EVD-7, EVD-8 | Approve / Reject / Conditional approval | If rejected, keep generated artifacts as transition evidence only and revise docs or rollback steps. |
| MS-5 | Approve final execution evidence as ready for a separate authority-flip decision. | OBJ-5; all surfaces; all packages; WP-5 | Before declaring execution complete | Jason Belmonti | VAL-1 through VAL-10; EVD-1 through EVD-10 | REV-4 | EVD-10 | Approve / Reject / Conditional approval | If rejected, do not open or execute authority-flip work; record blockers in final evidence. |

Manual verification guide:

| Step ID | Milestone | Operator action | Expected result | Evidence artifact |
| --- | --- | --- | --- | --- |
| MV-1 | MS-1 | Open `EVD-1` and inspect dimension rows for registry, graph, metadata, and validation. | Each required dimension is present and classified as equivalent, intentional, or blocking. | EVD-1 |
| MV-2 | MS-2 | Review representative equivalent, intentional, and blocking examples in `EVD-2`. | Each delta has stable path, expected value, actual value, and rationale when not equivalent. | EVD-2 |
| MV-3 | MS-3 | Run the migration check command in check mode against the migrated fixture inventory. | Command exits `0` only when no blocking drift exists and writes no generated artifact bytes in check mode. | EVD-3 |
| MV-4 | MS-3 | Inspect `EVD-6` coverage matrix. | R0 YAML, minimal R1, CODEFACTORY, stale artifact, missing artifact, and malformed profile rows all have passing evidence. | EVD-6 |
| MV-5 | MS-4 | Execute rollback rehearsal steps from the runbook. | YAML-backed authority is restored or generated artifacts are deterministically regenerated without manual reconstruction. | EVD-8 |
| MV-6 | MS-5 | Read final migration evidence and confirm source-authority flip is presented as a separate decision. | Evidence states whether a flip may be requested and does not remove YAML support. | EVD-10 |

Section status: Complete

## 10. Execution Controls and Drift Management

| ID | Trigger | Required action | Owner | Evidence |
| --- | --- | --- | --- | --- |
| CTRL-1 | First parity proof cannot be produced or has unclassified drift. | Stop implementation after `WP-1`, keep YAML authority, and escalate to Jason Belmonti for design revision. | Implementation agent | EVD-1 and MS-1 decision record |
| CTRL-2 | Any implementation path changes generated sidecar serialization or metadata contract. | Stop and create a `DEV-*` deviation request tied to `SRC-4`; do not merge until approved. | Implementation agent | Deviation record and revised validation evidence |
| CTRL-3 | Check mode writes generated artifact bytes, creates missing artifacts, or rewrites stale artifacts. | Reject the slice, restore artifact bytes from source control, and fix command behavior before retry. | Implementation agent | EVD-3 and git diff showing no unintended generated writes |
| CTRL-4 | Fixture/profile coverage omits any R2-required case. | Block `MS-3` and add missing case before final evidence work. | Implementation agent | EVD-6 |
| CTRL-5 | Docs or evidence imply generated artifacts are authoritative before approval. | Block `MS-4` or `MS-5`, revise wording, and require Jason Belmonti review. | Implementation agent | REV-3 or REV-4 completion evidence |
| CTRL-6 | Scope expands into YAML removal, multi-document projection, hosted service, or live PM integration. | Stop and re-estimate; require new design or execution spec. | Implementation agent | Updated estimator output and decision-owner approval |

Deviation rules: Any approved deviation must be recorded as `DEV-*` with owner, approver, rationale, impact, expiry or boundary, compensating validation, and evidence. Deviations may not waive R2 fixture/profile coverage or source-authority flip approval.

Pause or escalation conditions: Pause on failed `MS-*` approval, failed full regression validation, check-mode writes, YAML compatibility regression, missing coverage matrix row, or any contradiction with `SRC-1` through `SRC-4`.

Section status: Complete

## 11. Data, Schema, Config, and Contract Handling

| Change | Impact | Compatibility | Reversibility | Validation |
| --- | --- | --- | --- | --- |
| Migration comparison report | Adds local report data with document path, manual registry path, generated sidecar path, dimensions, deltas, and exit code. | Does not change existing registry schema or generated sidecar schema. | Reversible by removing report generation and evidence files. | VAL-1, VAL-2 |
| Migrated fixture inventory | Adds configuration or fixture list for migration checks. | Must not affect existing validation unless migration check command is invoked. | Reversible by removing inventory rows. | VAL-6 |
| Migration check script or CLI command | Adds local command surface for migration evidence. | Existing commands such as `validate`, `derive`, and `derive-sidecar` remain compatible. | Reversible by removing command and scripts before source-authority flip. | VAL-3, VAL-4, VAL-5 |
| Generated sidecar artifacts for migration evidence | May add checked generated artifacts for parity or coverage. | Must preserve R2 generated sidecar artifact contract and existing YAML sidecar coexistence. | Reversible through source control or deterministic regeneration. | VAL-5, VAL-6, VAL-8 |
| Operator and reviewer docs | Adds documented authority states, review policy, regeneration, and rollback instructions. | Docs must state YAML remains supported until separate approval. | Reversible by doc revision. | VAL-7, REV-3 |

N/A rationale: Not N/A; data, config, contract, and compatibility surfaces are affected.

Section status: Complete

## Layer 3: Validation, Release, and Handoff

## 12. Validation and Evidence Plan

| ID | Method | Claim verified | Timing | Owner | Evidence artifact |
| --- | --- | --- | --- | --- | --- |
| VAL-1 | Test / Inspection | First same-document manual/generated pair compares registry, graph, metadata, and validation dimensions. | Pre-merge for `WP-1` | Implementation agent | EVD-1 |
| VAL-2 | Test | Equivalent, intentional, and blocking classifications are deterministic across all four comparison dimensions, including manual metadata absence handling. | Pre-merge for `WP-2` | Implementation agent | EVD-2 |
| VAL-3 | Test | Migration check fails on missing artifacts, stale artifacts, and unexplained drift without writing generated bytes in check mode. | Pre-merge for `WP-3` | Implementation agent | EVD-3 |
| VAL-4 | Test | Existing R0 YAML `validate --registry` path remains accepted during every migration slice. | Every implementation PR | Implementation agent | EVD-4 |
| VAL-5 | Test | Generated sidecar check mode and byte-stability remain compatible with the R2 contract. | Pre-merge for `WP-3` and `WP-4` | Implementation agent | EVD-5 |
| VAL-6 | Test / Inspection | Coverage matrix has passing evidence for R0 YAML, minimal R1, CODEFACTORY, stale artifact failure, missing artifact failure, and malformed profile failure. | Pre-merge for `WP-4` | Implementation agent | EVD-6 |
| VAL-7 | Review | Documentation marks generated sidecars as non-human-editable checked artifacts and gives regeneration/review instructions. | Pre-merge for `WP-5` | Implementation agent | EVD-7 |
| VAL-8 | Manual | Rollback restores YAML-backed authority or deterministic generated artifacts without manual reconstruction. | Pre-completion | Local operator | EVD-8 |
| VAL-9 | Test | Full local regression suite remains clean. | Every implementation PR and final completion gate | Implementation agent | EVD-9 |
| VAL-10 | Review | Final R3 migration evidence package preserves the separate authority-flip approval boundary and summarizes all required evidence. | Pre-completion | Jason Belmonti | EVD-10 |

Section status: Complete

## 13. Review Plan

| ID | Reviewer | Review scope | Blocking? | Completion evidence |
| --- | --- | --- | --- | --- |
| REV-1 | Independent implementation reviewer | Comparison core, report model, package boundaries, registry/graph/validation integration, no serialization drift. | Yes | Approved review or consensus-review verdict for `WP-1` through `WP-3`. |
| REV-2 | Generated artifact reviewer | Generated sidecar diffs, no-write behavior, fixture/profile coverage, and coverage matrix evidence. | Yes | Approved review of `EVD-3`, `EVD-5`, and `EVD-6`. |
| REV-3 | Jason Belmonti and local operator | Operator docs, review policy, regeneration instructions, rollback rehearsal. | Yes | Approved `MS-4` record. |
| REV-4 | Jason Belmonti | Final evidence package and source-authority flip boundary. | Yes | Approved `MS-5` record or explicit rejection with blockers. |

Approval conditions: Merge is allowed only when required validations for the touched work packages pass, blocking `REV-*` items are approved or explicitly rejected with fixes, no `DEV-*` is open without approval, and docs/evidence do not imply YAML removal or generated authority. Completion is allowed only after `MS-5` has an approval record.

Section status: Complete

## 14. Rollout, Migration, Rollback, and Recovery

| ID | Action | Timing | Owner | Abort trigger | Evidence |
| --- | --- | --- | --- | --- | --- |
| REL-1 | Land migration comparison core behind tests only. | After `MS-1` and `MS-2` approval. | Implementation agent | Comparator requires changing registry or sidecar semantics. | EVD-1, EVD-2 |
| REL-2 | Add local migration check command or npm script. | After `REL-1`. | Implementation agent | Command changes existing command behavior or writes generated bytes in check mode. | EVD-3, EVD-4, EVD-5 |
| REL-3 | Add fixture/profile coverage evidence and checked artifacts as review evidence only. | After `REL-2`. | Implementation agent | Coverage matrix incomplete or artifact metadata violates R2 contract. | EVD-6 |
| REL-4 | Publish operator docs, rollback rehearsal, and final evidence package. | After `MS-3` approval. | Implementation agent | Docs imply source-authority flip or YAML removal without separate approval. | EVD-7, EVD-8, EVD-10 |

Rollback or containment plan: Before source-authority flip, rollback is source-control based. Revert the implementation PR or affected fixture/artifact changes, keep hand-authored YAML as authority, rerun `npm run validate:fixture`, rerun generated sidecar checks where applicable, and record rollback evidence. If a generated artifact is stale, regenerate through the documented write command or restore prior checked bytes; never hand-edit generated YAML.

Recovery limit: Recovery is local and reversible until source-authority flip. If a future task performs the flip, that task must define its own rollback and compatibility gates before execution.

Section status: Complete

## 15. Observability and Operational Readiness

| ID | Signal | Purpose | Consumer | Response |
| --- | --- | --- | --- | --- |
| OBS-1 | Migration check exit code | Indicates whether blocking drift, missing artifacts, stale artifacts, or compatibility regression exists. | Local operator, reviewer | Treat non-zero as blocking; inspect comparison report before fixing source or regenerating artifacts. |
| OBS-2 | Comparison report dimension statuses | Shows registry, graph, metadata, and validation classification. | Reviewer | Approve equivalent or approved intentional deltas; reject blocking drift. |
| OBS-3 | Generated sidecar check diagnostic category | Identifies missing artifact, content mismatch, or metadata drift. | Local operator | Regenerate through write mode or restore source-control bytes; do not patch generated YAML manually. |
| OBS-4 | Fixture/profile coverage matrix | Shows whether every R2-required case has passing evidence. | Decision owner, reviewer | Block source-authority flip request until all rows pass. |
| OBS-5 | Rollback rehearsal result | Proves recovery before authority changes. | Decision owner, local operator | Reject final evidence if rollback cannot be executed. |

Operator actions: Run the migration check command, inspect non-zero reports, regenerate sidecars only through documented write mode, restore YAML-backed authority through source control when needed, capture evidence artifacts, and stop before authority flip unless a separate approval record exists.

Monitoring window: Local-only repository workflow. Monitor through pre-merge and final completion validation; no post-release production monitoring window is required.

N/A rationale: Not N/A; local operational signals and operator actions are required even without hosted deployment.

Section status: Complete

## 16. Risks, Questions, Deviations, and Waivers

Risks:

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| RISK-1 | Manual and generated registry, graph, metadata, or validation outputs diverge without safe classification. | Unsafe source-authority decisions. | Medium | Implementation agent | Require first parity proof and deterministic classification before broader implementation. | VAL-1, VAL-2 |
| RISK-2 | Manual YAML metadata absence is misclassified. | False blocker or false pass in migration report. | Medium | Implementation agent | Treat manual absence of `generated.*` as intentional only while `yaml-authoritative`; verify generated metadata separately. | VAL-2 |
| RISK-3 | Check mode rewrites artifacts or hides stale bytes. | Review evidence becomes untrustworthy. | Low | Implementation agent | Controlled missing and stale probes must prove no-write behavior. | VAL-3, VAL-5 |
| RISK-4 | Coverage matrix omits required R2 cases. | Later authority flip could rest on incomplete evidence. | Medium | Implementation agent | Make R0, minimal R1, CODEFACTORY, stale, missing, and malformed rows required and blocking. | VAL-6 |
| RISK-5 | Documentation implies generated authority before approval. | Reviewers may treat checked generated YAML as editable or authoritative source. | Medium | Implementation agent | Require generated artifact review policy and final source-authority boundary review. | VAL-7, REV-4 |

Open questions: None. The R3 addendum resolved the design questions needed to execute migration checks; implementation discoveries become `DEV-*` or design revisions, not silent scope changes.

Approved deviations: None.

Approved waivers: None.

Section status: Complete

## 17. Execution Traceability Matrix

| Source, objective, or evidence-led claim | Change surfaces | Package boundaries | Work packages | Milestones | Controls | Validation | Review | Release or ops | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SRC-1 | SURF-1, SURF-3, SURF-6, SURF-7 | PKG-1, PKG-2, PKG-4 | WP-1, WP-2, WP-3, WP-5 | MS-1, MS-2, MS-4, MS-5 | CTRL-1, CTRL-5 | VAL-1, VAL-2, VAL-7, VAL-8 | REV-1, REV-3, REV-4 | REL-1, REL-4, OBS-2, OBS-5 | EVD-1, EVD-2, EVD-7, EVD-8, EVD-10 |
| SRC-2 | SURF-1, SURF-4, SURF-5 | PKG-1, PKG-3 | WP-1, WP-4 | MS-1, MS-3 | CTRL-1, CTRL-4 | VAL-1, VAL-6 | REV-1, REV-2 | REL-1, REL-3, OBS-4 | EVD-1, EVD-6 |
| SRC-3 | SURF-3, SURF-4, SURF-5, SURF-6 | PKG-2, PKG-3, PKG-4 | WP-3, WP-4, WP-5 | MS-3, MS-5 | CTRL-3, CTRL-4 | VAL-3, VAL-4, VAL-5, VAL-6, VAL-9 | REV-2, REV-4 | REL-2, REL-3, OBS-1, OBS-3, OBS-4 | EVD-3, EVD-4, EVD-5, EVD-6, EVD-9 |
| SRC-4 | SURF-2, SURF-3, SURF-4 | PKG-1, PKG-2, PKG-3 | WP-2, WP-3, WP-4 | MS-2, MS-3 | CTRL-2, CTRL-3 | VAL-2, VAL-5, VAL-6 | REV-1, REV-2 | REL-2, REL-3, OBS-3 | EVD-2, EVD-5, EVD-6 |
| SRC-5 | SURF-2, SURF-4, SURF-5 | PKG-2, PKG-3 | WP-3, WP-4 | MS-3 | CTRL-3, CTRL-4 | VAL-4, VAL-5, VAL-6, VAL-9 | REV-1, REV-2 | REL-2, REL-3 | EVD-4, EVD-5, EVD-6, EVD-9 |
| OBJ-1 | SURF-1, SURF-4 | PKG-1, PKG-3 | WP-1, WP-2 | MS-1, MS-2 | CTRL-1 | VAL-1, VAL-2 | REV-1 | REL-1, OBS-2 | EVD-1, EVD-2 |
| OBJ-2 | SURF-2, SURF-3, SURF-5 | PKG-2 | WP-3 | MS-3 | CTRL-3 | VAL-3, VAL-4, VAL-5, VAL-9 | REV-1, REV-2 | REL-2, OBS-1, OBS-3 | EVD-3, EVD-4, EVD-5, EVD-9 |
| OBJ-3 | SURF-4, SURF-5, SURF-6 | PKG-3 | WP-4 | MS-3 | CTRL-4 | VAL-6 | REV-2 | REL-3, OBS-4 | EVD-6 |
| OBJ-4 | SURF-6, SURF-7 | PKG-4 | WP-5 | MS-4 | CTRL-5 | VAL-7, VAL-8 | REV-3 | REL-4, OBS-5 | EVD-7, EVD-8 |
| OBJ-5 | SURF-6, SURF-7 | PKG-4 | WP-5 | MS-5 | CTRL-5, CTRL-6 | VAL-1 through VAL-10 | REV-4 | REL-4, OBS-4, OBS-5 | EVD-10 |
| Critical path hypothesis | SURF-1, SURF-2, SURF-3, SURF-4 | PKG-1, PKG-2, PKG-3 | WP-1, WP-2, WP-3 | MS-1, MS-2, MS-3 | CTRL-1, CTRL-3 | VAL-1, VAL-2, VAL-3 | REV-1, REV-2 | REL-1, REL-2, OBS-1, OBS-2 | EVD-1, EVD-2, EVD-3 |
| First proving slice | SURF-1, SURF-4 | PKG-1, PKG-3 | WP-1 | MS-1 | CTRL-1 | VAL-1 | REV-1 | REL-1, OBS-2 | EVD-1 |
| RISK-1 | SURF-1 | PKG-1 | WP-1, WP-2 | MS-1, MS-2 | CTRL-1 | VAL-1, VAL-2 | REV-1 | OBS-2 | EVD-1, EVD-2 |
| RISK-2 | SURF-1 | PKG-1 | WP-2 | MS-2 | CTRL-1 | VAL-2 | REV-1 | OBS-2 | EVD-2 |
| RISK-3 | SURF-3, SURF-4 | PKG-2, PKG-3 | WP-3 | MS-3 | CTRL-3 | VAL-3, VAL-5 | REV-2 | REL-2, OBS-3 | EVD-3, EVD-5 |
| RISK-4 | SURF-4, SURF-5, SURF-6 | PKG-3 | WP-4 | MS-3 | CTRL-4 | VAL-6 | REV-2 | REL-3, OBS-4 | EVD-6 |
| RISK-5 | SURF-6, SURF-7 | PKG-4 | WP-5 | MS-4, MS-5 | CTRL-5 | VAL-7, VAL-8, VAL-10 | REV-3, REV-4 | REL-4, OBS-5 | EVD-7, EVD-8, EVD-10 |

Section status: Complete

## 18. Final Execution Gate

Entry gate: Ready to start implementation only after this spec passes deterministic Markdown validation, `DEP-1` and `DEP-2` are satisfied, and Jason Belmonti approves `Approve to execute` for this `E2` scope.

Milestone approval gate: `MS-1` through `MS-5` are non-waivable at their due points unless a `WVR-*` is explicitly approved by Jason Belmonti with compensating controls. No later package may start when its prerequisite milestone is rejected.

Completion gate: Execution is complete only when `VAL-1` through `VAL-10` pass, `EVD-1` through `EVD-10` exist, all blocking `REV-*` reviews are approved, and the final evidence package states that source-authority flip remains a separate approval decision.

Release gate: Repository release or merge of implementation slices is allowed only when touched work-package validations pass and rollback containment is documented. No release may remove YAML support or declare generated authority in this execution.

Handoff record: Final handoff must include the implementation branch or PRs, command outputs, evidence artifact paths, milestone approval records, accepted deviations or waivers if any, rollback rehearsal result, and explicit recommendation for the next authority-flip decision.

Final readiness state: Ready to execute

Section status: Complete
