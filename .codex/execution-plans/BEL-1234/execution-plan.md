---
title: "BEL-1234 Execution Plan"
plan_id: "BEL-1234"
artifact_version: "1.0.0"
status: "complete"
created_at: "2026-05-30T14:24:21Z"
updated_at: "2026-05-30T14:34:14Z"
target_repo: "/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1234-r3-2b-report-rendering"
target_branch: "codex/bel-1234-r3-2b-report-rendering"
source_packet: ".codex/execution-briefs/BEL-1234/execution-brief.md"
estimation_mode: "proposal"
validation_profile: "profiles/execution-plan.yaml"
---

# Objective

Execute BEL-1234 / R3-2B by adding stable migration comparison report rendering and representative examples so reviewers can inspect equivalent, intentional, and blocking deltas without manually diffing YAML.

# Source Inventory

| Source | Retrieved at | Authority | Status | Plan impact |
| --- | --- | --- | --- | --- |
| Current thread instructions | 2026-05-30T14:24:21Z | Latest user intent and workflow constraints | loaded | Requires execution brief, execution plan, execution estimation before coding, worktree isolation, and Mission Control style updates. |
| `.codex/execution-briefs/BEL-1234/execution-brief.md` | 2026-05-30T14:30:00Z | Durable source-grounded operating snapshot | loaded and checksummed | Defines objective, scope, validation gates, review boundary, and stop conditions. |
| Linear `BEL-1234` | 2026-05-30T14:13:00Z | Leaf task contract | loaded | Controls report rendering, examples, authority-safe wording, validation gates, and out-of-scope work. |
| Linear `BEL-1224` | 2026-05-30T14:21:00Z | Parent R3 control issue | loaded | Requires worktrees, estimation before coding, and no-flip/no-YAML-removal boundary. |
| `docs/markdown-trace-r3-yaml-replacement-migration-execution.md` | 2026-05-30T14:18:00Z | Binding R3 execution spec | loaded | Controls `WP-2`, `VAL-2`, `MV-2`, report model scope, baseline checks, and stop conditions. |
| `docs/markdown-trace-r3-yaml-replacement-migration-addendum.md` | 2026-05-30T14:20:00Z | R3 design addendum | loaded | Defines equivalent, intentional, and blocking comparison behavior and authority-safe policy. |
| `docs/evidence/r3-deterministic-classification-semantics.md` | 2026-05-30T14:18:00Z | BEL-1233 classifier evidence | loaded | Provides the status semantics the renderer must present without reclassifying. |
| `src/markdowntrace/migration/**` | 2026-05-30T14:17:00Z | Current implementation state | loaded | `MigrationComparisonReport` exists and should be consumed as input. |
| `src/markdowntrace/reporting/**` | 2026-05-30T14:20:00Z | Existing reporting pattern | loaded | Existing validation formatter shows local Markdown reporting style and escaping pattern. |
| Target worktree | 2026-05-30T14:23:31Z | Current branch and baseline | loaded | Branch `codex/bel-1234-r3-2b-report-rendering` at `641990d5bb7e2c3a593cf4dc85b7533c43509863`. |
| `docs/markdown-trace-r3-yaml-replacement-linear-decomposition-plan.md` | 2026-05-30T14:21:00Z | Referenced parent planning source | missing | Non-blocking; BEL-1234 and R3 execution spec provide enough leaf execution scope. |

# Planning Constraints

- Confirmed constraints: Keep implementation inside `src/markdowntrace/migration/**`, `src/markdowntrace/reporting/**`, focused tests, and `docs/evidence/**` examples.
- Dependencies: Existing `MigrationComparisonReport` and BEL-1233 status semantics must remain authoritative for classification.
- Non-goals: No CLI orchestration, package script, migration check command, full coverage matrix, generated sidecar serialization change, YAML removal, or source-authority flip.
- Assumptions / Inferences: `src/markdowntrace/reporting/migration-report.ts` is the narrowest presentation boundary because the existing reporting package already owns Markdown report formatting.
- Missing inputs: The repo-local R3 Linear decomposition plan named by BEL-1224 is absent; not blocking for this leaf because Linear BEL-1234 has a complete task contract.

# Target Completion Route

First, verify the brief and plan artifacts and run proposal execution estimation before code edits. Next, add a Markdown formatter in the reporting package that consumes the existing migration comparison report model without mutating or reclassifying it. Then, add focused tests for equivalent, intentional, and blocking rendered outputs, publish authority-safe report examples under `docs/evidence/**`, and run focused plus baseline validation gates.

# Execution Steps

| Step | Action | Target | Depends on | Evidence | Stop condition |
| --- | --- | --- | --- | --- | --- |
| 1 | Verify durable planning artifacts and checksum state. | `.codex/execution-briefs/BEL-1234/**`, `.codex/execution-plans/BEL-1234/**` | None | Brief and plan validate; checksum files exist. | Artifact validation fails and cannot be corrected without changing scope. |
| 2 | Run proposal-mode execution estimation before implementation edits. | `.codex/estimation/bel-1234-proposed-files.txt` and estimator script | Step 1 | Estimator JSON reports `execution.action` compatible with proceeding. | Estimator returns `decompose-first`, `plan-first`, or blocking planning status. |
| 3 | Inspect current migration report model and reporting formatter pattern. | `src/markdowntrace/migration/model.ts`, `src/markdowntrace/reporting/validation-report.ts` | Step 2 | Implementation notes reflected in a small formatter diff. | Renderer requires changing classifier semantics or CLI orchestration. |
| 4 | Add stable migration report Markdown formatter and export it. | `src/markdowntrace/reporting/migration-report.ts`, `src/markdowntrace/reporting/index.ts` | Step 3 | New formatter renders inputs, dimension statuses, deltas, stable value text, and rationale. | Formatter needs generated sidecar serialization changes or schema duplication outside reporting. |
| 5 | Add focused renderer tests. | `tests/test_migration_report.test.ts` | Step 4 | Tests cover equivalent, intentional, blocking, missing values, escaping, and stable ordering. | Tests become low-value implementation wiring checks instead of proving report contract. |
| 6 | Add representative report examples. | `docs/evidence/r3-stable-migration-report-examples.md` | Step 5 | Evidence includes equivalent, intentional, and blocking examples with authority-safe wording. | Evidence wording implies generated authority, YAML removal, or a completed migration check command. |
| 7 | Run focused and baseline validation gates. | Commands listed in Validation Gates | Step 6 | Passing command output or documented in-scope failure fixed. | Required validation fails for an out-of-scope reason or reveals scope expansion. |
| 8 | Update durable artifacts if material execution facts change, then prepare final handoff. | Brief, plan, checksum files, git diff | Step 7 | Artifacts and checksums reflect final validation results and no stop condition remains. | Review boundary or validation gate changes after implementation require user direction. |

# File Touch Plan

| Path | Change type | Purpose | Expected churn | Risk notes |
| --- | --- | --- | --- | --- |
| `.codex/execution-briefs/BEL-1234/execution-brief.md` | add/update | Durable execution context for BEL-1234. | medium | Must validate and be reread before relying on it. |
| `.codex/execution-briefs/BEL-1234/execution-brief.sha256` | add/update | Checksum for brief drift detection. | low | Must be regenerated after brief changes. |
| `.codex/execution-plans/BEL-1234/execution-plan.md` | add/update | Durable executable route and viability review. | medium | Must validate before execution commitment. |
| `.codex/execution-plans/BEL-1234/execution-plan.sha256` | add/update | Checksum for plan drift detection. | low | Must be regenerated after plan changes. |
| `.codex/estimation/bel-1234-proposed-files.txt` | add | Proposal file list for execution estimation. | low | Must match expected implementation file touches. |
| `.codex/estimation/bel-1234-estimate.json` | add | Stored execution-estimation evidence before coding. | low | Result must allow proceeding before implementation begins. |
| `src/markdowntrace/reporting/migration-report.ts` | add | Format `MigrationComparisonReport` as stable reviewer-facing Markdown. | medium | Must stay presentation-only and not reclassify deltas. |
| `src/markdowntrace/reporting/index.ts` | update | Export migration report formatter. | low | Keep public reporting surface focused. |
| `tests/test_migration_report.test.ts` | add | Prove equivalent, intentional, and blocking rendered outputs. | medium | Assert user-facing contract, not private helper structure. |
| `docs/evidence/r3-stable-migration-report-examples.md` | add | Publish representative R3-2B report examples for review. | medium | Must preserve generated sidecar non-authority wording. |

# Estimation Inputs

| Field | Value | Notes |
| --- | --- | --- |
| `repoRoot` | `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1234-r3-2b-report-rendering` | Worktree owns the planned change. |
| `mode` | `proposal` | Run before coding because no implementation diff exists yet. |
| `proposedFiles` | Derive from File Touch Plan `Path` values, excluding checksum files when sizing implementation churn. | Use `.codex/estimation/bel-1234-proposed-files.txt`. |
| `proposalLinesChanged` | `unknown` | Do not override unless estimator output contradicts observed scope. |
| `baseRef` | `origin/main` | Diff-backed follow-up can compare branch to `origin/main`. |
| `headRef` | `HEAD` | Current branch head after implementation. |
| `includeWorkingTree` | `true after implementation` | Use if rerunning diff-backed estimation with uncommitted work. |

# Validation Gates

| Gate | Command or check | Required evidence | Owner |
| --- | --- | --- | --- |
| Brief validation | `npx -y @jasonbelmonti/markdown-engine@2.0.0 validate --file ./.codex/execution-briefs/BEL-1234/execution-brief.md --profile /Users/jasonbelmonti/.codex/skills/execution-brief/profiles/execution-brief.yaml` | Validation passes with no diagnostics. | codex |
| Plan validation wrapper | `python3 /Users/jasonbelmonti/.codex/skills/execution-plan/scripts/validate_execution_plan.py --file ./.codex/execution-plans/BEL-1234/execution-plan.md` | Wrapper validation passes before execution. | codex |
| Execution estimation | `python3 /Users/jasonbelmonti/.codex/skill-checkouts/execution-estimation/scripts/estimate_execution.py --repo-root /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1234-r3-2b-report-rendering --proposed-files ./.codex/estimation/bel-1234-proposed-files.txt` | Estimator action allows proceeding; controls are honored. | codex |
| Focused report tests | `npm test -- tests/test_migration_report.test.ts` | Tests pass and cover equivalent, intentional, and blocking report output. | codex |
| TypeScript typecheck | `npm run typecheck` | Exits `0`. | codex |
| Full tests | `npm test` | Exits `0`. | codex |
| Build | `npm run build` | Exits `0`. | codex |
| R0 YAML compatibility | `npm run validate:fixture` | Exits `0`; existing report remains passing. | codex |
| R0 derive compatibility | `npm run derive:fixture` | Exits `0`; output has no diagnostics. | codex |
| Diff hygiene | `git diff --check` | Exits `0`. | codex |

# Stop Conditions

- Execution estimation returns `execution.action` `decompose-first` or `plan-first`, `planning.blocksExecution: true`, or `estimation.decompositionRecommended: true`.
- Report rendering requires changing registry, graph, validation, generated sidecar serialization, classifier semantics, or CLI command behavior.
- A source conflict changes BEL-1234 scope or review boundary and cannot be resolved by source priority.
- Evidence examples imply YAML removal, generated sidecar authority, or completion of migration check orchestration.
- Required validation fails for a reason outside the BEL-1234 implementation boundary.

# Plan Viability Review

| Review area | Viability question | Reviewer notes | Decision | Required revision |
| --- | --- | --- | --- | --- |
| Source authority | Are all material sources loaded or explicitly marked as missing? | BEL-1234, BEL-1224, R3 execution docs, R2 contract, BEL-1233 evidence, migration code, and reporting code are loaded; missing decomposition plan is explicitly non-blocking for this leaf. | pass | None. |
| Route feasibility | Can the route be executed with current access, dependencies, and constraints? | Current worktree has the merged migration model and reporting package; planned edits stay within allowed paths and do not require external credentials. | pass | None. |
| Dependency order | Are prerequisite inspections, changes, and validations sequenced before dependent work? | Artifact validation and estimation precede implementation; formatter precedes tests and evidence; validation follows code and docs. | pass | None. |
| Validation evidence | Can the validation gates prove the intended outcome objectively? | Focused tests prove report content; baseline gates prove compatibility; evidence doc provides reviewer-facing examples. | pass | None. |
| Estimation readiness | Can execution sizing derive proposal or diff inputs from the plan? | File Touch Plan and `.codex/estimation/bel-1234-proposed-files.txt` provide proposal input; `origin/main` and `HEAD` support diff-backed follow-up. | pass | None. |
| Execution commitment | Is the plan ready to use as execution context without hidden blockers? | No blocking source conflict or access gap remains; stop conditions cover scope expansion, unsafe authority wording, and failed validation. | pass | None. |

# Plan Readiness Check

| Check | Requirement | Evidence | Status |
| --- | --- | --- | --- |
| Placeholder sweep | No unresolved template placeholders remain in the artifact. | Manual scan completed before validation; wrapper performs full-document placeholder guard. | pass |
| Source completeness | Material sources are loaded or listed as missing inputs. | Source Inventory records all loaded sources and one non-blocking missing document. | pass |
| Step specificity | Each execution step has an action, target, dependency, evidence, and stop condition. | Execution Steps table has eight sequenced rows. | pass |
| Viability review | Plan viability is reviewed before execution commitment. | Plan Viability Review decisions are all pass. | pass |
| Estimation readiness | File or diff inputs can be passed to an execution sizing workflow. | File Touch Plan and Estimation Inputs are concrete. | pass |
| Validation readiness | Required commands or manual checks have evidence expectations. | Validation Gates table lists commands and required evidence. | pass |

# Review Handoff

- Review boundary: Judge stable migration report rendering, examples, authority wording, focused tests, and compatibility. Do not require CLI orchestration, full fixture/profile coverage, rollback, CI enforcement, YAML removal, or source-authority flip.
- Out of scope: Migration check command, npm scripts for migration checks, generated sidecar serialization changes, broad coverage matrix, operator runbook, rollback rehearsal, and final authority decision.
- Planned follow-up work: R3 command orchestration, R2 coverage matrix, operator documentation, rollback, CI enforcement status, and separate authority-flip approval task.
- Evidence to include: Brief validation, plan validation, estimator output, focused report tests, baseline checks, evidence artifact path, checksum files, and final diff summary.

# Revision Log

| Timestamp | Actor | Change | Artifact checksum reference |
| --- | --- | --- | --- |
| 2026-05-30T14:24:21Z | codex | Created initial BEL-1234 Execution Plan from the validated brief, Linear task, R3 docs, current code, and worktree state. | pending; write `execution-plan.sha256` after validation |
| 2026-05-30T14:34:14Z | codex | Recorded proposal estimator evidence: `proceed-with-controls`, 5 points, medium blast radius, no decomposition recommendation. | pending; write `execution-plan.sha256` after validation |
| 2026-05-30T14:34:14Z | codex | Completed implementation route and required validation gates for BEL-1234. | pending; write `execution-plan.sha256` after validation |
