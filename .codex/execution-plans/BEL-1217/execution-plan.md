---
title: "BEL-1217 Execution Plan"
plan_id: "BEL-1217"
artifact_version: "1.0.0"
status: "active"
created_at: "2026-05-23T17:41:50Z"
updated_at: "2026-05-23T17:46:56Z"
target_repo: "/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1217"
target_branch: "codex/bel-1217-generated-sidecar-contract"
source_packet: ".codex/execution-briefs/BEL-1217/execution-brief.md"
estimation_mode: "proposal"
validation_profile: "profiles/execution-plan.yaml"
---

# Objective

Create a focused R2 repository contract for generated sidecar registry artifacts that makes later writer/check tasks deterministic and reviewable while preserving the existing YAML sidecar compatibility boundary.

# Source Inventory

| Source | Retrieved at | Authority | Status | Plan impact |
| --- | --- | --- | --- | --- |
| Current thread request | 2026-05-23T17:41:50Z | Latest execution sequence | loaded | Requires execution brief, execution plan, execution, and consensus review. |
| Current-thread AGENTS.md instructions | 2026-05-23T17:41:50Z | Repo-local operating rules supplied by user | loaded | Requires worktree execution, execution estimation, and task-definition review boundaries. |
| Linear issue `BEL-1217` | 2026-05-23T17:41:50Z | Work item of record | loaded | Defines objective, scope, success criteria, validation evidence, and non-goals. |
| Execution Brief `BEL-1217` | 2026-05-23T17:41:50Z | Durable execution context | loaded | Defines review boundary, validation gates, follow-up work, and stop conditions. |
| `docs/evidence/r1-link-backed-evidence-and-recommendation.md` | 2026-05-23T17:41:50Z | R1 recommendation artifact | loaded | Confirms generated artifacts should supplement YAML sidecars during transition. |
| R0/R1 fixtures under `fixtures/` | 2026-05-23T17:41:50Z | Compatibility and source examples | loaded | Contract must support R0 YAML compatibility, minimal R1, and CODEFACTORY-style profiles. |
| Registry/derive implementation under `src/markdowntrace/registry/` | 2026-05-23T17:41:50Z | Current implementation state | loaded | Contract must align with `serializeRegistry`, derived registry version, diagnostics, and CLI output. |

# Planning Constraints

- Confirmed constraints: Define contract and review policy only; use a worktree; use execution estimation before implementation; do not replace YAML sidecars.
- Dependencies: Local repository and Linear issue access are available. Existing dependencies are installed in the main checkout and worktree can use the same repo-level package state through normal npm commands.
- Non-goals: Writer/check implementation, drift checking, CODEFACTORY generated fixtures, migration criteria, live PM mutation, hosted services, graph database behavior, and multi-document projection.
- Assumptions / Inferences: A standalone `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` document is the smallest durable artifact satisfying BEL-1217.
- Missing inputs: None blocking.

# Target Completion Route

Proposal-mode execution estimation returned `proceed-with-controls` with no decomposition recommended. The focused R2 contract document has been added under `docs/`, contract inspection passed against BEL-1217 criteria, and repository validation passed. The remaining route is to revalidate execution artifacts, write checksums, and build the consensus review packet from the final diff and validation evidence.

# Execution Steps

| Step | Action | Target | Depends on | Evidence | Stop condition |
| --- | --- | --- | --- | --- | --- |
| 1 | Create proposal file list for estimation. | `.codex/execution-plans/BEL-1217/proposed-files.txt` | Loaded source context | Completed; proposed file list included the focused contract document and execution artifacts. | Planned touches expand into writer/check implementation or broad source changes. |
| 2 | Run execution estimation and apply the returned gate. | Execution Estimation script | Step 1 | Completed; estimator returned `proceed-with-controls`, no decomposition recommended. | Estimator returns `decompose-first`, `plan-first`, or blocks execution. |
| 3 | Add generated sidecar artifact contract. | `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` | Step 2 | Completed; document contains explicit clauses for path/naming, deterministic serialization, metadata, YAML coexistence, review policy, and follow-up evidence. | Contract cannot be made concrete without implementing writer/check behavior. |
| 4 | Inspect contract against BEL-1217 success criteria. | New contract document and issue criteria | Step 3 | Completed; required contract sections were found at lines 20, 89, 115, 134, and 163. | Any blocking criterion lacks an explicit, reviewable clause. |
| 5 | Run repository validation. | `npm test`; `npm run typecheck`; `git diff --check` | Step 4 | Completed; 11 test files and 89 tests passed, typecheck passed, and diff check passed. | Required validation fails for an in-scope reason. |
| 6 | Update execution artifacts and prepare review context. | Brief, plan, checksums, consensus review packet | Step 5 | In progress; artifact revalidation, checksums, and review packet remain. | Packet cannot responsibly establish objective, scope, or review boundary. |

# File Touch Plan

| Path | Change type | Purpose | Expected churn | Risk notes |
| --- | --- | --- | --- | --- |
| `.codex/execution-briefs/BEL-1217/execution-brief.md` | add/update | Durable execution context and review boundary. | medium | Must validate before review handoff. |
| `.codex/execution-briefs/BEL-1217/execution-brief.sha256` | add/update | Drift signal for the execution brief. | small | Must be regenerated after material brief updates. |
| `.codex/execution-plans/BEL-1217/execution-plan.md` | add/update | Concrete execution route and validation gates. | medium | Must pass bundled plan validator before execution commitment. |
| `.codex/execution-plans/BEL-1217/execution-plan.sha256` | add/update | Drift signal for the execution plan. | small | Must be regenerated after material plan updates. |
| `.codex/execution-plans/BEL-1217/proposed-files.txt` | add | Estimation input listing planned file touches. | small | Used only for proposal-mode sizing. |
| `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` | add | Defines generated sidecar artifact path, bytes, metadata, coexistence, review policy, and follow-up evidence. | medium | Must not imply YAML replacement or writer/check implementation approval. |

# Estimation Inputs

| Field | Value | Notes |
| --- | --- | --- |
| `repoRoot` | `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1217` | Worktree owns the planned change. |
| `mode` | `proposal` | Use proposal mode before implementation. |
| `proposedFiles` | `.codex/execution-plans/BEL-1217/proposed-files.txt` | Derive from File Touch Plan `Path` values. |
| `proposalLinesChanged` | `unknown` | No override unless estimator materially misreads doc-only churn. |
| `baseRef` | `origin/main` | For any later diff-backed estimate. |
| `headRef` | `HEAD` | Current worktree branch. |
| `includeWorkingTree` | `false` | Proposal estimate runs before product implementation. |

# Validation Gates

| Gate | Command or check | Required evidence | Owner |
| --- | --- | --- | --- |
| Execution estimation | `python3 /Users/jasonbelmonti/.codex/skill-checkouts/execution-estimation/scripts/estimate_execution.py --repo-root /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1217 --proposed-files ./.codex/execution-plans/BEL-1217/proposed-files.txt` | `execution.action` permits execution and decomposition is not recommended. | codex |
| Plan validation wrapper | `python3 /Users/jasonbelmonti/.codex/skills/execution-plan/scripts/validate_execution_plan.py --file ./.codex/execution-plans/BEL-1217/execution-plan.md` | Wrapper validation passes before implementation and review. | codex |
| Brief validation | `npx -y @jasonbelmonti/markdown-engine@2.0.0 validate --file ./.codex/execution-briefs/BEL-1217/execution-brief.md --profile /Users/jasonbelmonti/.codex/skills/execution-brief/profiles/execution-brief.yaml` | Markdown profile validation passes. | codex |
| Contract inspection | Manually map BEL-1217 criteria to contract sections. | Evidence names sections covering path/naming, deterministic serialization, metadata, YAML coexistence, and follow-up evidence. | codex |
| Test suite | `npm test` | Vitest passes. | codex |
| Typecheck | `npm run typecheck` | TypeScript `--noEmit` passes. | codex |
| Repository hygiene | `git diff --check` | No whitespace errors. | codex |

# Stop Conditions

- Execution estimation blocks execution or recommends decomposition.
- Proposed implementation requires writer/check mode, drift detection, generated output mutation, or YAML replacement.
- A success criterion cannot be satisfied by an explicit repository contract clause.
- Source authority changes in Linear or the thread after implementation starts.
- Required validation fails for an in-scope reason and cannot be corrected without changing scope.
- Consensus review packet cannot include a complete task definition, review boundary, diff, and validation context.

# Plan Viability Review

| Review area | Viability question | Reviewer notes | Decision | Required revision |
| --- | --- | --- | --- | --- |
| Source authority | Are all material sources loaded or explicitly marked as missing? | Current thread, AGENTS instructions, BEL-1217, R1 evidence, fixtures, and registry code are loaded; no blocking source is missing. | pass | None. |
| Route feasibility | Can the route be executed with current access, dependencies, and constraints? | The route is doc-focused and uses available local repository access. No credentialed mutation is required. | pass | None. |
| Dependency order | Are prerequisite inspections, changes, and validations sequenced before dependent work? | Source loading precedes estimation; estimation precedes implementation; inspection precedes tests and review packet creation. | pass | None. |
| Validation evidence | Can the validation gates prove the intended outcome objectively? | Contract inspection proves doc criteria; npm/typecheck/diff checks prove no repo regression from the doc/artifact change. | pass | None. |
| Estimation readiness | Can execution sizing derive proposal or diff inputs from the plan? | File Touch Plan lists exact proposed paths and the proposed file list path is defined. | pass | None. |
| Execution commitment | Is the plan ready to use as execution context without hidden blockers? | No hidden blocker is visible; estimator remains the explicit gate before product implementation. | pass | None. |

# Plan Readiness Check

| Check | Requirement | Evidence | Status |
| --- | --- | --- | --- |
| Placeholder sweep | No unresolved template placeholders remain in the artifact. | Manual sweep completed while drafting. | pass |
| Source completeness | Material sources are loaded or listed as missing inputs. | Source Inventory contains current thread, issue, brief, evidence, fixtures, and implementation state. | pass |
| Step specificity | Each execution step has an action, target, dependency, evidence, and stop condition. | Execution Steps table is complete. | pass |
| Viability review | Plan viability is reviewed before execution commitment. | Plan Viability Review decisions are all pass. | pass |
| Estimation readiness | File or diff inputs can be passed to an execution sizing workflow. | Estimation Inputs and File Touch Plan are complete. | pass |
| Validation readiness | Required commands or manual checks have evidence expectations. | Validation Gates table is complete. | pass |

# Review Handoff

- Review boundary: Judge whether the current diff satisfies BEL-1217 by defining a complete generated sidecar artifact contract without approving YAML replacement or broad writer/check behavior.
- Out of scope: Writer/check implementation, drift detection, CODEFACTORY generated artifacts, transition evidence packet, YAML replacement migration, unrelated cleanup.
- Planned follow-up work: Minimal writer/check mode; drift checking; CODEFACTORY coverage; transition evidence; YAML replacement criteria.
- Evidence to include: Linear issue, execution brief, execution plan, estimator output, final diff, contract inspection checklist, passing `npm test`, passing `npm run typecheck`, passing `git diff --check`, artifact validation, and checksums.

# Revision Log

| Timestamp | Actor | Change | Artifact checksum reference |
| --- | --- | --- | --- |
| 2026-05-23T17:41:50Z | codex | Created initial BEL-1217 Execution Plan from source-grounded brief and repository inspection. | `.codex/execution-plans/BEL-1217/execution-plan.sha256` |
| 2026-05-23T17:46:56Z | codex | Recorded estimator, implementation, and validation results before consensus review. | `.codex/execution-plans/BEL-1217/execution-plan.sha256` |
