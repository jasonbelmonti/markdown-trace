---
title: "BEL-1219 Execution Plan"
plan_id: "bel-1219"
artifact_version: "1.0.0"
status: "executed"
created_at: "2026-05-24T04:47:25Z"
updated_at: "2026-05-24T12:59:46Z"
target_repo: "/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1219"
target_branch: "codex/bel-1219-check-mode-drift"
source_packet: ".codex/execution-briefs/bel-1219/execution-brief.md"
estimation_mode: "proposal"
validation_profile: "/Users/jasonbelmonti/.codex/skills/execution-plan/profiles/execution-plan.yaml"
---

# Objective

Implement BEL-1219 by adding a no-write generated-sidecar check mode that compares freshly derived canonical sidecar bytes with the checked artifact and reports actionable drift diagnostics for missing or stale artifacts.

# Source Inventory

| Source | Retrieved at | Authority | Status | Plan impact |
| --- | --- | --- | --- | --- |
| Current thread user instruction `BEL-1219 > execution-brief > execution-plan > EXECUTE` | 2026-05-24T04:47:25Z | Latest user intent and sequencing | loaded | Execute after durable brief and plan are created. |
| Thread-provided AGENTS.md instructions | 2026-05-24T04:47:25Z | Operating rules | loaded | Use `.worktrees/`, run execution estimation before implementation, and keep modules focused. |
| Repo-local `AGENTS.md` file | 2026-05-24T04:47:25Z | Operating rules if present | missing file | No local file exists; thread-provided rules control. |
| Linear `BEL-1219` | 2026-05-24T04:47:25Z | Task contract | loaded; archived in Linear at 2026-05-24T04:43:01.335Z | Defines success criteria, non-goals, validation gates, and review boundary; latest user instruction controls execution despite archive state. |
| Linear `BEL-1216` | 2026-05-24T04:47:25Z | R2 parent control | loaded | Confirms dependency order and execution-estimation gate. |
| `.codex/execution-briefs/bel-1219/execution-brief.md` | 2026-05-24T04:47:25Z | Durable execution context | loaded | Normalizes objective, scope, review boundary, stop conditions, and validation gates. |
| `origin/main` commit `1918521` | 2026-05-24T04:47:25Z | Implementation base | loaded | Contains merged BEL-1217 artifact contract and BEL-1218 minimal writer. |
| `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` | 2026-05-24T04:47:25Z | R2 design contract | loaded | Requires deterministic checked sidecar bytes and future check mode that fails without rewriting. |
| `src/markdowntrace/registry/generated-sidecar.ts` | 2026-05-24T04:47:25Z | Existing generator implementation | loaded | Add in-memory check helper and drift diagnostic model here. |
| `src/markdowntrace/registry/index.ts` | 2026-05-24T04:47:25Z | Registry public exports | loaded | Export any new check-mode helper needed by CLI or tests. |
| `src/markdowntrace/cli.ts` | 2026-05-24T04:47:25Z | CLI command surface | loaded | Extend `derive-sidecar` parsing and execution with `--check`. |
| `tests/test_generated_sidecar.test.ts` | 2026-05-24T04:47:25Z | Focused generated-sidecar tests | loaded | Add matching, missing, and stale check-mode coverage plus no-write assertions. |

# Planning Constraints

- Confirmed constraints: Check mode must not create, write, or rewrite generated artifact files; diagnostics must identify document path, artifact path, and drift category.
- Dependencies: BEL-1217 and BEL-1218 must be present in the base branch; observed present in `origin/main` commit `1918521`.
- Non-goals: Do not add broad CODEFACTORY coverage, YAML replacement policy, or migration approval.
- Assumptions / Inferences: A boolean `derive-sidecar --check` flag is the smallest compatible CLI extension because `derive-sidecar` already owns generated sidecar writing.
- Missing inputs: No blocking source input is missing; the repo-local `AGENTS.md` file is absent, but its full instructions were supplied in the current thread.

# Target Completion Route

First, validate the durable brief and plan, then run proposal-mode execution estimation from the planned file list. If the estimator allows execution, add a check helper that builds expected sidecar bytes in memory, reads the checked artifact if present, and returns stable drift diagnostics without calling `mkdir` or `writeFile`. Then extend the CLI with `derive-sidecar --check`, add tests for matching, missing, and stale artifacts, and run the targeted and full validation gates. As of 2026-05-24T04:53:13Z, this route has been executed and validation gates have passed.

# Execution Steps

| Step | Action | Target | Depends on | Evidence | Stop condition |
| --- | --- | --- | --- | --- | --- |
| 1 | Validate the Execution Brief and write its checksum. | `.codex/execution-briefs/bel-1219/execution-brief.md` | Loaded sources | Brief validator passes and `.sha256` exists. | Brief profile rejects required structure. |
| 2 | Validate the Execution Plan, create proposed-file inputs, and write its checksum. | `.codex/execution-plans/bel-1219/execution-plan.md` | Step 1 | Plan validator passes, readiness rows are `pass`, and `.sha256` exists. | Viability review cannot pass. |
| 3 | Run proposal-mode execution estimation before implementation. | `.codex/execution-plans/bel-1219/proposed-files.txt` | Step 2 | Estimator JSON allows `proceed` or `proceed-with-controls`. | Estimator returns `decompose-first`, `plan-first`, or blocks execution. |
| 4 | Add no-write sidecar drift comparison. | `src/markdowntrace/registry/generated-sidecar.ts` | Step 3 | Helper returns valid result for matching bytes and diagnostics for missing or mismatched bytes. | Helper needs broad fixture policy or writes during check mode. |
| 5 | Export check helper and extend CLI check mode. | `src/markdowntrace/registry/index.ts`, `src/markdowntrace/cli.ts` | Step 4 | `derive-sidecar --check` exits `0` for matching artifacts and `1` for drift with stable diagnostics. | CLI changes break existing command parsing or write mode. |
| 6 | Add focused automated coverage. | `tests/test_generated_sidecar.test.ts` | Step 5 | Tests cover matching, missing, and stale artifact check mode plus unchanged checked bytes. | Tests require CODEFACTORY or migration scope. |
| 7 | Run validation gates and update durable artifacts with final state. | Package scripts, git hygiene, brief and plan artifacts | Step 6 | Required commands pass or failures are documented with stop conditions. | Required validation fails outside BEL-1219 scope. |

# File Touch Plan

| Path | Change type | Purpose | Expected churn | Risk notes |
| --- | --- | --- | --- | --- |
| `.codex/execution-briefs/bel-1219/execution-brief.md` | add/update | Durable source-grounded execution context. | medium | Must validate and be checksummed. |
| `.codex/execution-briefs/bel-1219/execution-brief.sha256` | add/update | Drift checksum for the brief. | small | Generated after validation. |
| `.codex/execution-plans/bel-1219/execution-plan.md` | add/update | Durable executable route and viability review. | medium | Must validate and be checksummed before execution. |
| `.codex/execution-plans/bel-1219/execution-plan.sha256` | add/update | Drift checksum for the plan. | small | Generated after validation. |
| `.codex/execution-plans/bel-1219/proposed-files.txt` | add | Proposal-mode estimator input. | small | Should list expected implementation and artifact paths only. |
| `src/markdowntrace/registry/generated-sidecar.ts` | update | Add no-write check helper, drift diagnostic categories, and formatter-friendly data. | medium | Must not call write APIs in check path. |
| `src/markdowntrace/registry/index.ts` | update | Export the check helper and diagnostic types for CLI/tests. | small | Keep public API additions narrow. |
| `src/markdowntrace/cli.ts` | update | Add `derive-sidecar --check` parsing, exit codes, and diagnostic output. | medium | Preserve existing `validate`, `derive`, and `derive-sidecar` write behavior. |
| `tests/test_generated_sidecar.test.ts` | update | Cover matching, missing, stale, and no-write check-mode behavior. | medium | Temporary repo setup must distinguish checked artifact copies from writer tests. |

# Estimation Inputs

| Field | Value | Notes |
| --- | --- | --- |
| `repoRoot` | `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1219` | BEL-1219 worktree created from `origin/main`. |
| `mode` | `proposal` | Run before implementation because there is no code diff yet. |
| `proposedFiles` | `.codex/execution-plans/bel-1219/proposed-files.txt` | Derive from File Touch Plan implementation and artifact paths. |
| `proposalLinesChanged` | `unknown` | No override; planned file list should be representative. |
| `baseRef` | `n/a` | Diff-backed sizing is not used before implementation. |
| `headRef` | `n/a` | Diff-backed sizing is not used before implementation. |
| `includeWorkingTree` | `false` | Proposal mode is based on planned files, not uncommitted diff. |

# Validation Gates

| Gate | Command or check | Required evidence | Owner |
| --- | --- | --- | --- |
| Brief validation | `npx -y @jasonbelmonti/markdown-engine@2.0.0 validate --file ./.codex/execution-briefs/bel-1219/execution-brief.md --profile /Users/jasonbelmonti/.codex/skills/execution-brief/profiles/execution-brief.yaml` | Profile validation passes before implementation. | codex |
| Plan validation wrapper | `python3 /Users/jasonbelmonti/.codex/skills/execution-plan/scripts/validate_execution_plan.py --file ./.codex/execution-plans/bel-1219/execution-plan.md` | Wrapper validation passes, including markdown-engine profile validation and placeholder guard. | codex |
| Execution estimation | `python3 /Users/jasonbelmonti/.codex/skill-checkouts/execution-estimation/scripts/estimate_execution.py --repo-root /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1219 --proposed-files ./.codex/execution-plans/bel-1219/proposed-files.txt` | Estimator permits execution or lists controls that are incorporated. | codex |
| Focused check-mode tests | `npm test -- tests/test_generated_sidecar.test.ts` | New and existing generated-sidecar tests pass. | codex |
| Full test suite | `npm test` | Existing package behavior remains green. | codex |
| TypeScript typecheck | `npm run typecheck` | TypeScript accepts new APIs and tests. | codex |
| Build | `npm run build` | Emitted CLI remains buildable. | codex |
| R0 validation fixture | `npm run validate:fixture` | Existing YAML sidecar validation path remains compatible. | codex |
| R0 derive fixture | `npm run derive:fixture` | Existing derive path remains compatible. | codex |
| Git hygiene | `git diff --check` | No whitespace errors. | codex |

# Stop Conditions

- Execution estimation returns `decompose-first`, `plan-first`, or `planning.blocksExecution: true`.
- Planned file touches expand outside generated sidecar helper, CLI, tests, and durable artifacts.
- Check mode requires writing files, creating directories, replacing YAML sidecars, or defining migration policy.
- Validation failure indicates an unrelated regression that cannot be responsibly fixed inside BEL-1219.
- Source authority changes require a new review boundary after implementation begins.

# Plan Viability Review

| Review area | Viability question | Reviewer notes | Decision | Required revision |
| --- | --- | --- | --- | --- |
| Source authority | Are all material sources loaded or explicitly marked as missing? | BEL-1219, BEL-1216, merged R2 contract/writer state, current thread instructions, and implementation files are loaded; absent repo-local `AGENTS.md` is explicitly marked and superseded by thread-provided contents. | pass | None. |
| Route feasibility | Can the route be executed with current access, dependencies, and constraints? | The worktree exists on `origin/main` with dependencies present, and the planned change fits local TypeScript files and tests. | pass | None. |
| Dependency order | Are prerequisite inspections, changes, and validations sequenced before dependent work? | Brief/plan validation and estimation precede implementation; helper changes precede CLI changes; tests and regression validation follow implementation. | pass | None. |
| Validation evidence | Can the validation gates prove the intended outcome objectively? | Tests can assert exit codes, diagnostics, and unchanged bytes; full package commands cover compatibility and hygiene. | pass | None. |
| Estimation readiness | Can execution sizing derive proposal or diff inputs from the plan? | File Touch Plan lists one path per expected artifact or implementation file, and Estimation Inputs names the proposed-file list. | pass | None. |
| Execution commitment | Is the plan ready to use as execution context without hidden blockers? | No blocking missing input remains; the archived Linear state is recorded and the current user instruction controls execution. | pass | None. |

# Plan Readiness Check

| Check | Requirement | Evidence | Status |
| --- | --- | --- | --- |
| Placeholder sweep | No unresolved template placeholders remain in the artifact. | Manual sweep completed; validation wrapper will run before execution. | pass |
| Source completeness | Material sources are loaded or listed as missing inputs. | Source Inventory contains the controlling thread, Linear, contract, code, and test sources. | pass |
| Step specificity | Each execution step has an action, target, dependency, evidence, and stop condition. | Execution Steps table is complete and ordered. | pass |
| Viability review | Plan viability is reviewed before execution commitment. | Plan Viability Review decisions are all `pass`. | pass |
| Estimation readiness | File or diff inputs can be passed to an execution sizing workflow. | Estimation Inputs and proposed-file artifact path are complete. | pass |
| Validation readiness | Required commands or manual checks have evidence expectations. | Validation Gates table names commands and required evidence. | pass |

# Review Handoff

- Review boundary: Judge only BEL-1219 check-mode correctness, no-write behavior, diagnostics, tests, and compatibility with existing generation and R0/R1 paths.
- Out of scope: CODEFACTORY check breadth, YAML replacement, migration policy, and broad transition evidence.
- Planned follow-up work: Expand generated-sidecar checks to CODEFACTORY/profile-backed fixture breadth and record R2 transition evidence in later tasks.
- Evidence to include: Brief and plan validation passed; execution estimation returned `proceed-with-controls`; SOLID, simplification, and boundary review completed with no blocking abstraction findings; three consensus reviewers approved with no findings; `npm test -- tests/test_generated_sidecar.test.ts tests/test_cli.test.ts`, `npm test`, `npm run typecheck`, `npm run build`, `npm run validate:fixture`, `npm run derive:fixture`, direct `derive-sidecar --check`, and `git diff --check` passed.

# Revision Log

| Timestamp | Actor | Change | Artifact checksum reference |
| --- | --- | --- | --- |
| 2026-05-24T04:47:25Z | codex | Created initial Execution Plan for BEL-1219 implementation. | pending; write `execution-plan.sha256` after validation |
| 2026-05-24T04:53:13Z | codex | Recorded executed route and passing validation evidence. | pending; write `execution-plan.sha256` after validation |
| 2026-05-24T12:59:46Z | codex | Recorded post-implementation review, consensus approval, and final validation evidence. | pending; write `execution-plan.sha256` after validation |
