---
title: "BEL-1218 Execution Brief"
brief_id: "BEL-1218"
artifact_version: "1.0.0"
status: "active"
created_at: "2026-05-23T23:43:07Z"
updated_at: "2026-05-23T23:56:41Z"
target_repo: "/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1218"
target_branch: "codex/bel-1218-generated-sidecar-writer"
review_boundary_id: "BEL-1218-RB"
---

# Objective

Implement the first generated registry sidecar artifact path for the minimal R1 link-backed fixture so reviewers can compare a checked artifact against existing derived registry behavior without weakening the R0 YAML sidecar path.

# Context / Constraints

- Confirmed constraints: Use the project-local worktree at `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1218`; follow the thread-provided operating manual; use the merged R2 generated sidecar contract; reuse existing derivation internals rather than creating a parallel parser or registry model.
- Dependencies: BEL-1217 generated sidecar contract is present on `origin/main` at merge `7959fbf`; minimal fixture input is `fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md`; active profile input is `fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml`.
- Non-goals: Do not add CODEFACTORY breadth, no-write drift check mode, replacement migration, multi-document projection, hosted behavior, or YAML sidecar removal.
- Accepted tradeoffs: The first writer may be scoped to write mode only; check-mode diagnostics are planned follow-up unless required to make the minimal writer deterministic.
- Assumptions / Inferences: BEL-1218 should be implemented from `origin/main` because BEL-1217 is merged there and defines the controlling artifact contract.

# Authoritative Sources

| Source | Retrieved at | Authority | Status | Controls |
| --- | --- | --- | --- | --- |
| Current thread user request | 2026-05-23T23:43:07Z | Latest operator sequence | loaded | Execute `BEL-1218 > execution plan > execute > consensus review until clean > post PR`. |
| Thread-provided operating manual for `/Users/jasonbelmonti/Documents/Development/markdown-trace` | 2026-05-23T23:43:07Z | Repo-local operating rules supplied by user | loaded | Requires task-definition for review packets, execution-estimation before work, worktrees under `.worktrees`, and Mission Control status format. |
| Linear issue `BEL-1218` | 2026-05-23T23:43:07Z | Project-management task contract | loaded | Defines objective, scope, success criteria, validation gates, and follow-up work. |
| `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` | 2026-05-23T23:43:07Z | Local R2 contract authority | loaded | Controls generated artifact path, metadata, serialization, determinism, and review policy. |
| `docs/evidence/r1-link-backed-evidence-and-recommendation.md` | 2026-05-23T23:43:07Z | R1 recommendation | loaded | Supports generated checked sidecars while preserving YAML compatibility. |
| Minimal R1 fixture and profile | 2026-05-23T23:43:07Z | Proving input | loaded | Provides the source document and profile for the first checked artifact. |
| Current BEL-1218 worktree | 2026-05-23T23:43:07Z | Implementation state | loaded | Branch `codex/bel-1218-generated-sidecar-writer` starts clean from `origin/main`. |

# Current State

- Planning / PM: `BEL-1218` is in Linear Backlog and assigned to Jason Belmonti; scope is the minimal generated sidecar writer and checked artifact.
- Design: BEL-1217 contract is merged on `origin/main` and defines the generated sidecar path, root registry shape, `generated` metadata, deterministic serialization, and review policy.
- Implementation: Added a focused generated-sidecar registry module, exported its public API, added `derive-sidecar --document ... [--type-profile ...]`, added focused tests, and checked in the minimal generated artifact at the contract path.
- Validation: `npm test`, `npm run typecheck`, `npm run build`, `npm run validate:fixture`, `npm run derive:fixture`, repeated `derive-sidecar` generation, and `git diff --check` passed on 2026-05-23. The first parallel `npm test` attempt failed because concurrent build/fixture commands changed repo status during the WP-4 local-safety test; the sequential rerun passed.
- Known gaps: PR posting remains pending.

# Execution Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Add minimal generated sidecar writer path | in-scope | blocking | CLI or public API must write the generated sidecar for the minimal R1 fixture using the active profile. |
| Check in the generated minimal artifact | in-scope | blocking | Artifact must live at the contract-defined path under the fixture `.markdown-trace/generated/` directory. |
| Include required contract metadata and deterministic bytes | in-scope | blocking | Metadata must use repository-relative paths and hashes with no timestamps, hostnames, absolute local paths, temporary directories, process IDs, or user-specific paths. |
| Preserve root registry loadability | in-scope | blocking | Existing registry loader must parse the generated artifact or focused tests must prove equivalent compatibility. |
| Preserve R0 YAML and R1 derive compatibility | in-scope | blocking | Existing validation and derive commands must continue to pass. |
| Add CODEFACTORY sidecar coverage | out-of-scope | non-blocking | Later R2 task. |
| Add no-write drift check mode | out-of-scope | non-blocking | Later R2 task unless required by an approved contract change. |
| Replace hand-authored YAML sidecars | out-of-scope | non-blocking | Explicitly disallowed for this task. |

# Materially Verifiable Success Criteria

- [ ] A CLI command or public API writes the generated sidecar artifact for `fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md` with `fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml`.
- [ ] The generated minimal sidecar artifact is checked into the repository at `fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml`.
- [ ] The artifact includes expected minimal entities, references, ranges, root registry fields, and required `generated` metadata.
- [ ] Two generation runs for the same input produce no byte drift in the checked artifact or an explicitly recorded stable hash comparison.
- [ ] Focused automated tests cover the minimal generation path and accidental output shape regressions.
- [ ] `npm test`, `npm run typecheck`, `npm run build`, `npm run validate:fixture`, `npm run derive:fixture`, and `git diff --check` pass.

# Review Boundary

| Boundary | Scope | Approval impact | Notes |
| --- | --- | --- | --- |
| Minimal generator correctness | in-scope | blocking | Reviewers should reject if the minimal artifact cannot be reproduced, has the wrong path/content/metadata, is not deterministic, or bypasses existing derivation semantics. |
| Compatibility | in-scope | blocking | Reviewers should reject if R0 YAML validation or accepted R1 derive behavior regresses. |
| Generated artifact reviewability | in-scope | blocking | Reviewers should reject if the checked artifact is not loadable or cannot be compared as contract-shaped evidence. |
| Broader R2 expansion | out-of-scope | non-blocking | CODEFACTORY breadth, drift diagnostics, multi-document projection, and migration policy are not required for approval. |
| Planned follow-up work | out-of-scope | non-blocking | Follow-up is non-blocking unless the current diff prevents or contradicts it. |

# Planned Follow-up Work

- Add no-write drift diagnostics and deterministic drift comparison.
- Add CODEFACTORY/profile-backed generated sidecar coverage.
- Define and review any future YAML replacement or migration policy before changing compatibility authority.

# Execution Plan

1. Create and validate a BEL-1218 execution plan artifact.
2. Run proposal-mode execution estimation against the expected file touch list and stop only if decomposition or plan-first is required.
3. Implement the smallest sidecar writer path by reusing existing registry derivation and serialization behavior.
4. Generate and check in the minimal sidecar artifact at the contract path.
5. Run required validation gates and record determinism evidence.
6. Build a consensus review packet from this brief, dispatch three identical reviewers, fix validated blockers, and repeat until the supervising consensus verdict is clean.
7. Commit, push, and open a PR for BEL-1218.

# Validation Gates

- Validate this brief:
  `npx -y @jasonbelmonti/markdown-engine@2.0.0 validate --file ./.codex/execution-briefs/BEL-1218/execution-brief.md --profile /Users/jasonbelmonti/.codex/skills/execution-brief/profiles/execution-brief.yaml`
- Validate the execution plan:
  `python3 /Users/jasonbelmonti/.codex/skills/execution-plan/scripts/validate_execution_plan.py --file ./.codex/execution-plans/BEL-1218/execution-plan.md`
- Run execution estimation:
  `python3 /Users/jasonbelmonti/.codex/skills/execution-estimation/scripts/estimate_execution.py --repo-root /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1218 --proposed-files ./.codex/execution-plans/BEL-1218/proposed-files.txt`
- Required implementation checks: `npm test`, `npm run typecheck`, `npm run build`, `npm run validate:fixture`, `npm run derive:fixture`, and `git diff --check`.
- Determinism proof: run the generated sidecar command twice and verify the checked artifact bytes do not change.

# Stop Conditions

- The contract path, metadata, or serialization requirements become ambiguous after inspecting the implementation surface.
- Execution estimation returns `decompose-first`, `plan-first`, or `planning.blocksExecution=true`.
- Required validation fails for reasons outside the current scope.
- The implementation would require replacing or weakening the R0 YAML sidecar compatibility path.
- Posting the PR requires unavailable credentials or a failed push.

# Review Packet Inputs

| Field | Source section | Required mapping | Notes |
| --- | --- | --- | --- |
| `objective` | Objective | Implement minimal generated sidecar writer and checked artifact. | Source-grounded by BEL-1218. |
| `intended_behavior_change` | Objective and Execution Plan | CLI/API can write a contract-shaped sidecar artifact for the minimal R1 fixture. | Include checked artifact path. |
| `in_scope` | Execution Scope | Include all `in-scope` rows. | Blocking review items. |
| `out_of_scope` | Execution Scope | Include out-of-scope rows and Planned Follow-up Work. | Non-blocking unless contradicted. |
| `constraints` | Context / Constraints | Include contract, worktree, reuse, and compatibility constraints. | Preserve accepted tradeoffs. |
| `review_boundary` | Review Boundary | Copy all boundary rows. | Primary approval boundary. |
| `planned_follow_up_work` | Planned Follow-up Work | Copy deferred R2 work. | Non-blocking. |
| `test_or_risk_context` | Validation Gates | Include test commands run, skipped, failed, and determinism proof. | Update before review dispatch. |

# Revision Log

| Timestamp | Actor | Change | Checksum |
| --- | --- | --- | --- |
| 2026-05-23T23:43:07Z | codex | Created initial BEL-1218 Execution Brief from current thread, Linear issue, contract, evidence, fixture, and worktree state. | pending |
| 2026-05-23T23:45:54Z | codex | Recorded execution-estimation result: proceed-with-controls, no decomposition, no blocking planning; controls are targeted tests and owner-level review coverage. | pending |
| 2026-05-23T23:50:40Z | codex | Recorded implementation and validation state before consensus review dispatch. | pending |
| 2026-05-23T23:56:41Z | codex | Recorded clean consensus review: all three reviewers approved with no findings, and supervising validation found no blockers. | pending |
