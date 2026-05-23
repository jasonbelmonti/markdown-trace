---
title: "BEL-1218 Execution Plan"
plan_id: "BEL-1218"
artifact_version: "1.0.0"
status: "active"
created_at: "2026-05-23T23:43:07Z"
updated_at: "2026-05-23T23:43:07Z"
target_repo: "/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1218"
target_branch: "codex/bel-1218-generated-sidecar-writer"
source_packet: ".codex/execution-briefs/BEL-1218/execution-brief.md"
estimation_mode: "proposal"
validation_profile: "profiles/execution-plan.yaml"
---

# Objective

Implement BEL-1218 by adding a minimal generated registry sidecar writer for the R1 minimal fixture, checking in the generated artifact, proving deterministic output, and preserving existing R0 YAML and R1 derive behavior.

# Source Inventory

| Source | Retrieved at | Authority | Status | Plan impact |
| --- | --- | --- | --- | --- |
| Current thread request | 2026-05-23T23:43:07Z | Latest operator intent | loaded | Requires brief, plan, execution, clean consensus review, and PR posting. |
| Thread-provided operating manual | 2026-05-23T23:43:07Z | Repo-local operating rules | loaded | Requires execution-estimation before implementation, `.worktrees` use, and task-definition guidance before review packets. |
| Linear issue `BEL-1218` | 2026-05-23T23:43:07Z | Task contract | loaded | Defines objective, success criteria, validation gates, non-goals, and follow-up work. |
| Execution Brief `BEL-1218` | 2026-05-23T23:43:07Z | Durable execution context | loaded | Supplies scope, review boundary, planned follow-up work, and stop conditions. |
| `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` | 2026-05-23T23:43:07Z | Artifact contract | loaded | Controls output path, metadata fields, root registry shape, serialization, and review policy. |
| `docs/evidence/r1-link-backed-evidence-and-recommendation.md` | 2026-05-23T23:43:07Z | R1 recommendation | loaded | Confirms generated checked artifacts should supplement YAML before replacement. |
| Current code and fixtures | 2026-05-23T23:43:07Z | Implementation state | loaded | Existing derive CLI and registry serialization are the reuse targets. |

# Planning Constraints

- Confirmed constraints: Work in `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1218`; branch is `codex/bel-1218-generated-sidecar-writer`; implement from `origin/main`; preserve R0 YAML sidecar validation; reuse existing derivation internals.
- Dependencies: Contract-defined profile path hash for `fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml` is `378211c9`; source document and profile are committed fixtures.
- Non-goals: CODEFACTORY sidecar generation, drift check mode, YAML replacement, hosted behavior, multi-document projection, and broad migration policy.
- Assumptions / Inferences: A new focused registry module is preferable to expanding `cli.ts` with serialization, hashing, and path-contract logic because the operating manual prefers smaller files and lean view/controller code.
- Missing inputs: None material after BEL-1217 contract was found on `origin/main`.

# Target Completion Route

First, validate the durable artifacts and run proposal-mode execution estimation using the planned file list. Next, add a focused generated-sidecar module that derives the registry from the existing Markdown/profile path, builds deterministic `generated` metadata, computes the contract output path, and serializes YAML with the required comment and top-level order. Then, expose that writer through a small CLI command such as `derive-sidecar --document <path> --type-profile <path>`, generate the checked minimal artifact, and add tests for path, metadata, loadability, and byte determinism. Completion is proven by the required test/build/fixture gates, a no-drift repeated generation check, consensus review approval, and a posted PR.

# Execution Steps

| Step | Action | Target | Depends on | Evidence | Stop condition |
| --- | --- | --- | --- | --- | --- |
| 1 | Validate execution brief and plan artifacts, then write checksums. | `.codex/execution-briefs/BEL-1218/*`, `.codex/execution-plans/BEL-1218/*` | Loaded sources | Validator exits 0 and checksum files exist. | Artifact validation fails and cannot be corrected without scope change. |
| 2 | Run proposal-mode execution estimation. | `.codex/execution-plans/BEL-1218/proposed-files.txt` | Step 1 | Estimator JSON allows proceed or proceed-with-controls. | Estimator returns `decompose-first`, `plan-first`, or blocking planning. |
| 3 | Implement focused sidecar path, metadata, hashing, and deterministic serialization. | `src/markdowntrace/registry/generated-sidecar.ts`, `src/markdowntrace/registry/index.ts` | Step 2 | Public function returns artifact path and bytes matching the contract. | Contract requirements cannot be met without replacing existing registry model. |
| 4 | Add CLI command that writes the generated sidecar. | `src/markdowntrace/cli.ts` | Step 3 | `derive-sidecar --document ... --type-profile ...` writes the contract path and reports it. | CLI syntax conflicts with existing command behavior. |
| 5 | Add focused automated tests. | `tests/test_generated_sidecar.test.ts`, possibly `tests/test_cli.test.ts` | Steps 3-4 | Tests assert artifact path, metadata, root registry loadability, and repeated byte stability. | Tests require broad CODEFACTORY or check-mode behavior outside scope. |
| 6 | Generate and check in the minimal sidecar artifact. | `fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml` | Steps 3-5 | Artifact exists and matches regenerated bytes. | Generated artifact path or metadata diverges from BEL-1217 contract. |
| 7 | Run required validation gates and update the brief with material evidence. | npm scripts, git diff check, determinism command | Step 6 | All required commands pass or failures are documented as blockers. | Required validation fails for an out-of-scope or unexplained reason. |
| 8 | Build consensus-review packet and dispatch three identical reviewers. | `.codex/consensus-reviews/BEL-1218/*` | Step 7 | Supervising consensus verdict is APPROVE with no validated blockers. | Review packet boundary is ambiguous or a validated blocker remains. |
| 9 | Commit, push, and post PR. | Git branch and GitHub PR | Step 8 | Commit exists, branch is pushed, and PR URL is returned. | Push or PR creation credentials are unavailable. |

# File Touch Plan

| Path | Change type | Purpose | Expected churn | Risk notes |
| --- | --- | --- | --- | --- |
| `src/markdowntrace/registry/generated-sidecar.ts` | add | Own contract path derivation, metadata hashing, generated artifact shape, and deterministic YAML bytes. | medium | High review value because metadata must avoid nondeterministic local values. |
| `src/markdowntrace/registry/index.ts` | update | Export generated-sidecar API for CLI/tests. | small | Keep export narrow to avoid broad API churn. |
| `src/markdowntrace/cli.ts` | update | Add `derive-sidecar` command while preserving existing `validate` and `derive` behavior. | medium | CLI parsing must not regress existing commands or failure surfaces. |
| `tests/test_generated_sidecar.test.ts` | add | Cover artifact path, metadata, loadability, checked fixture bytes, and repeated generation determinism. | medium | Tests should use committed fixtures and temporary directories only. |
| `tests/test_cli.test.ts` | update | Cover CLI command ergonomics for writing the sidecar if not fully covered by the new test file. | small | Keep assertions focused on writer behavior. |
| `fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml` | add | Checked generated sidecar evidence artifact. | medium | Must be byte-for-byte reproducible. |
| `.codex/execution-briefs/BEL-1218/execution-brief.md` | add/update | Durable scope, validation, and review boundary artifact. | small | Do not let artifact updates create implementation scope creep. |
| `.codex/execution-briefs/BEL-1218/execution-brief.sha256` | add/update | Checksum for execution brief. | small | Regenerate after material brief updates. |
| `.codex/execution-plans/BEL-1218/execution-plan.md` | add/update | Durable execution route and validation gates. | small | Must validate before execution. |
| `.codex/execution-plans/BEL-1218/execution-plan.sha256` | add/update | Checksum for execution plan. | small | Regenerate after material plan updates. |
| `.codex/execution-plans/BEL-1218/proposed-files.txt` | add | Proposal-mode estimation input file list. | small | Keep synchronized with expected file touches before estimation. |

# Estimation Inputs

| Field | Value | Notes |
| --- | --- | --- |
| `repoRoot` | `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1218` | Target worktree for BEL-1218. |
| `mode` | `proposal` | Required before implementation by operating manual. |
| `proposedFiles` | `.codex/execution-plans/BEL-1218/proposed-files.txt` | Newline-delimited paths from File Touch Plan. |
| `proposalLinesChanged` | `unknown` | Let the estimator use file-list heuristics. |
| `baseRef` | `origin/main` | Use for later diff-backed sizing if needed. |
| `headRef` | `HEAD` | Current branch before implementation. |
| `includeWorkingTree` | `false` | Proposal estimate runs before implementation diff. |

# Validation Gates

| Gate | Command or check | Required evidence | Owner |
| --- | --- | --- | --- |
| Brief validation | `npx -y @jasonbelmonti/markdown-engine@2.0.0 validate --file ./.codex/execution-briefs/BEL-1218/execution-brief.md --profile /Users/jasonbelmonti/.codex/skills/execution-brief/profiles/execution-brief.yaml` | Validator exits 0 before execution. | codex |
| Plan validation wrapper | `python3 /Users/jasonbelmonti/.codex/skills/execution-plan/scripts/validate_execution_plan.py --file ./.codex/execution-plans/BEL-1218/execution-plan.md` | Wrapper validation exits 0 before estimation. | codex |
| Execution estimation | `python3 /Users/jasonbelmonti/.codex/skills/execution-estimation/scripts/estimate_execution.py --repo-root /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1218 --proposed-files ./.codex/execution-plans/BEL-1218/proposed-files.txt` | Estimator permits execution or execution with controls. | codex |
| Unit and integration tests | `npm test` | Vitest passes. | codex |
| Type checking | `npm run typecheck` | TypeScript no-emit check exits 0. | codex |
| Build | `npm run build` | Build exits 0. | codex |
| R0 fixture validation | `npm run validate:fixture` | Valid fixture report remains PASS. | codex |
| R0 derive fixture | `npm run derive:fixture` | Existing derive fixture command exits 0. | codex |
| Determinism proof | Run `derive-sidecar` twice for the minimal fixture and compare `git diff -- fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/`. | No artifact byte drift after repeated generation. | codex |
| Repository hygiene | `git diff --check` | No whitespace errors. | codex |
| Consensus review | Three identical reviewer dispatches from generated packet. | Supervising verdict is APPROVE. | codex |

# Stop Conditions

- A named material source becomes unavailable or contradicts the loaded contract.
- Execution estimation returns `decompose-first`, `plan-first`, or `planning.blocksExecution=true`.
- The implementation requires CODEFACTORY, drift-check mode, migration policy, or YAML replacement to satisfy the minimal writer.
- Required validation fails for reasons outside the current scope.
- Consensus review finds a validated blocking issue that cannot be fixed without changing the task boundary.
- GitHub push or PR creation is blocked by unavailable credentials.

# Plan Viability Review

| Review area | Viability question | Reviewer notes | Decision | Required revision |
| --- | --- | --- | --- | --- |
| Source authority | Are all material sources loaded or explicitly marked as missing? | Current thread, operating manual, Linear issue, execution brief, R2 contract, R1 evidence, fixtures, and current code were loaded; no material missing source remains. | pass | None. |
| Route feasibility | Can the route be executed with current access, dependencies, and constraints? | The worktree is clean and based on `origin/main` with the contract merged; required fixtures and code paths are present. | pass | None. |
| Dependency order | Are prerequisite inspections, changes, and validations sequenced before dependent work? | The route validates artifacts and runs estimation before code edits, then implements, generates, validates, reviews, and posts PR. | pass | None. |
| Validation evidence | Can the validation gates prove the intended outcome objectively? | Gates include focused tests, full required npm commands, root registry loadability through tests, determinism proof, and consensus review. | pass | None. |
| Estimation readiness | Can execution sizing derive proposal or diff inputs from the plan? | File Touch Plan has concrete paths and `proposed-files.txt` will provide newline-delimited proposal input. | pass | None. |
| Execution commitment | Is the plan ready to use as execution context without hidden blockers? | The plan has explicit stop conditions and no unresolved dependency after BEL-1217 contract was found on `origin/main`. | pass | None. |

# Plan Readiness Check

| Check | Requirement | Evidence | Status |
| --- | --- | --- | --- |
| Placeholder sweep | No unresolved template placeholders remain in the artifact. | Manual draft review completed before validation. | pass |
| Source completeness | Material sources are loaded or listed as missing inputs. | Source Inventory includes all controlling sources and marks no material missing input. | pass |
| Step specificity | Each execution step has an action, target, dependency, evidence, and stop condition. | Execution Steps table is complete. | pass |
| Viability review | Plan viability is reviewed before execution commitment. | Plan Viability Review decisions are all pass. | pass |
| Estimation readiness | File or diff inputs can be passed to an execution sizing workflow. | Estimation Inputs and `proposed-files.txt` path are concrete. | pass |
| Validation readiness | Required commands or manual checks have evidence expectations. | Validation Gates table includes command/check and evidence per gate. | pass |

# Review Handoff

- Review boundary: Judge whether the diff implements the minimal generated sidecar writer and checked artifact under the BEL-1217 contract while preserving R0/R1 compatibility.
- Out of scope: CODEFACTORY generated sidecar, no-write drift check mode, YAML replacement, migration policy, hosted behavior, and multi-document projection.
- Planned follow-up work: drift diagnostics, CODEFACTORY/profile-backed generated sidecar coverage, and future YAML migration policy.
- Evidence to include: validated execution artifacts, execution estimation output, focused tests, required npm command output, determinism proof, generated artifact path and diff, and consensus packet metadata.

# Revision Log

| Timestamp | Actor | Change | Artifact checksum reference |
| --- | --- | --- | --- |
| 2026-05-23T23:43:07Z | codex | Created initial BEL-1218 Execution Plan from execution brief, Linear issue, R2 contract, evidence, and current code state. | pending; write `execution-plan.sha256` after validation |
