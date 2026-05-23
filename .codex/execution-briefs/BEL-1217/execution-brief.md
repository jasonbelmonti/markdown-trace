---
title: "BEL-1217 Execution Brief"
brief_id: "BEL-1217"
artifact_version: "1.0.0"
status: "active"
created_at: "2026-05-23T17:41:50Z"
updated_at: "2026-05-23T17:46:56Z"
target_repo: "/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1217"
target_branch: "codex/bel-1217-generated-sidecar-contract"
review_boundary_id: "BEL-1217-RB"
---

# Objective

Define the generated sidecar registry artifact contract for link-backed Markdown so later R2 implementation tasks can write deterministic, reviewable artifacts while preserving the existing R0 YAML sidecar compatibility boundary.

# Context / Constraints

- Confirmed constraints: Follow the current-thread AGENTS.md instructions; execute in a git worktree; run execution estimation before implementation; keep modules and files focused; apply the task-definition review boundary for review.
- Dependencies: BEL-1217 Linear issue; R1 recommendation in `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; R0 YAML sidecar fixture; R1 minimal and CODEFACTORY fixtures; current registry serialization and derive behavior.
- Non-goals: Do not implement writer behavior, check mode, drift checking, CODEFACTORY expansion, YAML replacement migration, live Linear/Jira mutation, hosted services, graph database behavior, or multi-document projection.
- Accepted tradeoffs: A contract document is sufficient for this slice when it states path policy, deterministic bytes, metadata, YAML coexistence, review policy, and validation evidence for follow-up tasks.
- Assumptions / Inferences: The most direct repository artifact is a new focused document under `docs/`; focused tests are optional unless the implementation changes code or needs executable fixture assertions.

# Authoritative Sources

| Source | Retrieved at | Authority | Status | Controls |
| --- | --- | --- | --- | --- |
| Current thread request | 2026-05-23T17:41:50Z | Latest user intent and execution sequence | loaded | Use `execution-brief`, then `execution-plan`, then execute, then `consensus-review` for BEL-1217. |
| Current-thread AGENTS.md instructions | 2026-05-23T17:41:50Z | Repo-local operating rules supplied by user | loaded | Require task-definition boundaries, execution estimation, worktrees, and mission-control status updates. |
| Linear issue `BEL-1217` | 2026-05-23T17:41:50Z | Work item of record | loaded | Defines objective, scope, success criteria, validation evidence, non-goals, and review boundary. |
| PR #23 / merge commit `4a260ffc` | 2026-05-23T17:41:50Z | Landed R1 evidence baseline | loaded | Establishes R1 evidence and recommendation to supplement YAML sidecars before replacement. |
| `docs/evidence/r1-link-backed-evidence-and-recommendation.md` | 2026-05-23T17:41:50Z | R1 recommendation artifact | loaded | Generated checked sidecar artifacts should supplement YAML during transition. |
| `fixtures/r0-document-local-registry/entity-registry.yaml` | 2026-05-23T17:41:50Z | R0 compatibility control | loaded | Existing YAML sidecar schema and validation path must not be weakened. |
| `fixtures/r1-link-backed-entity-syntax/*` | 2026-05-23T17:41:50Z | R1 source examples | loaded | Contract must support minimal execution-spec and CODEFACTORY-style profile examples. |
| `src/markdowntrace/registry/*` | 2026-05-23T17:41:50Z | Current implementation state | loaded | Contract should align with derived registry model, serialization, diagnostics, and CLI output. |

# Current State

- Planning / PM: BEL-1217 is in Linear Backlog with priority Medium and parent `BEL-1216` under project `markdown-trace R2: Generated Sidecar Registry Artifacts`.
- Design: R1 recommends generated checked sidecar artifacts that supplement, not replace, YAML sidecars during transition.
- Implementation: Added `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` defining generated sidecar path/naming, root registry-compatible schema, required deterministic metadata, serialization rules, YAML coexistence, review policy, and follow-up validation evidence. No writer/check behavior was implemented.
- Validation: Initial brief validation passed; execution plan validation passed; execution estimation returned `proceed-with-controls` with no decomposition recommended; contract inspection found required sections; `npm test`, `npm run typecheck`, and `git diff --check` passed.
- Known gaps: Writer/check mode, drift checking, generated fixtures, CODEFACTORY generated artifact coverage, transition evidence, and YAML replacement criteria remain planned follow-up work.

# Execution Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Define generated sidecar path and naming rules | in-scope | blocking | Contract must state where generated artifacts live relative to source Markdown and optional type profiles. |
| Define deterministic serialization rules | in-scope | blocking | Contract must state stable ordering, canonical bytes, newline policy, and repeatability requirements suitable for byte comparison. |
| Define generated metadata | in-scope | blocking | Contract must require source document identity, profile identity when present, generator command/version, and review marker expectations where applicable. |
| Define coexistence with YAML sidecars | in-scope | blocking | Contract must state generated artifacts supplement YAML sidecars during transition and YAML replacement is not approved by this task. |
| Define follow-up validation evidence expectations | in-scope | blocking | Contract must identify evidence expected from minimal generator, drift check, CODEFACTORY coverage, and transition evidence tasks. |
| Implement writer/check mode or drift checking | out-of-scope | non-blocking | Owned by later R2 child tasks unless the current contract contradicts or prevents them. |
| Replace YAML sidecars or migrate production behavior | out-of-scope | non-blocking | Replacement requires a later migration and review policy task. |

# Materially Verifiable Success Criteria

- [x] A repository document states the generated sidecar output path and naming convention for a Markdown source document and optional type profile.
- [x] The contract states deterministic serialization requirements that a future test can verify with repeated generation or byte comparison.
- [x] The contract states required generated metadata, including source document identity, profile identity when present, and generator or review marker information.
- [x] The contract states how generated sidecars coexist with hand-authored YAML sidecars during transition and explicitly says YAML replacement is not approved by this task.
- [x] The contract identifies expected validation evidence for the minimal generator, drift check, CODEFACTORY coverage, and transition evidence tasks.
- [x] Required repository checks pass, or any skipped/failed checks are recorded as a confidence risk before review.

# Review Boundary

| Boundary | Scope | Approval impact | Notes |
| --- | --- | --- | --- |
| Artifact contract completeness | in-scope | blocking | Reject if path policy, metadata, determinism, YAML coexistence, or follow-up evidence is ambiguous or unverifiable. |
| Compatibility preservation | in-scope | blocking | Reject if the contract weakens R0 YAML sidecar validation or claims YAML replacement is approved. |
| Implementation restraint | in-scope | blocking | Reject if the diff implements broad writer/check behavior beyond the contract slice and creates unreviewed behavior. |
| Writer/check implementation breadth | out-of-scope | non-blocking | Missing writer, check mode, drift detection, CODEFACTORY generated artifacts, or evidence packets should not block unless the contract prevents them. |
| Unrelated documentation or code cleanup | out-of-scope | non-blocking | Note separately; do not reject unless the current diff creates a correctness, safety, regression, or maintainability issue. |

# Planned Follow-up Work

- Implement the minimal generated sidecar writer and check mode after this contract is approved.
- Add drift-check validation that compares generated bytes against checked artifacts.
- Add CODEFACTORY coverage using the R1 profile and fixture surface.
- Produce transition evidence comparing generated artifacts with the existing YAML sidecar compatibility control.
- Decide YAML sidecar replacement or migration criteria in a later task.

# Execution Plan

1. Completed: validated the issue boundary and current repo context, then ran proposal-mode execution estimation before implementation.
2. Completed: added a focused R2 generated sidecar artifact contract document under `docs/`.
3. Completed: ran contract inspection, `npm test`, `npm run typecheck`, and `git diff --check`; artifact revalidation and checksums remain required after this update.
4. Next: build a consensus-review packet from this brief, the plan, the task definition, validation results, and the final diff.

# Validation Gates

- Validate this brief:
  `npx -y @jasonbelmonti/markdown-engine@2.0.0 validate --file ./.codex/execution-briefs/BEL-1217/execution-brief.md --profile /Users/jasonbelmonti/.codex/skills/execution-brief/profiles/execution-brief.yaml`
- Validate the execution plan:
  `python3 /Users/jasonbelmonti/.codex/skills/execution-plan/scripts/validate_execution_plan.py --file ./.codex/execution-plans/BEL-1217/execution-plan.md`
- Run execution estimation before implementation:
  `python3 /Users/jasonbelmonti/.codex/skill-checkouts/execution-estimation/scripts/estimate_execution.py --repo-root /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1217 --proposed-files ./.codex/execution-plans/BEL-1217/proposed-files.txt`
- Inspect the contract for explicit path, naming, metadata, determinism, YAML coexistence, review policy, and follow-up evidence clauses.
- Run `npm test`.
- Run `npm run typecheck`.
- Run `git diff --check`.

# Stop Conditions

- Execution estimation returns `decompose-first`, `plan-first`, or `planning.blocksExecution: true`.
- A named authoritative source is unavailable and materially affects scope.
- Sources conflict and the controlling source cannot be determined.
- The implementation requires writer/check mode, generated output mutation, broad code changes, or YAML replacement to satisfy the contract.
- Required validation fails for reasons outside the current scope.
- Review boundary changes would alter approval criteria after implementation has started.

# Review Packet Inputs

| Field | Source section | Required mapping | Notes |
| --- | --- | --- | --- |
| `objective` | Objective | Define the generated sidecar artifact contract without changing YAML compatibility. | Keep BEL-1217 source authority visible. |
| `intended_behavior_change` | Objective and Execution Plan | Repository gains an R2 contract document; no writer/check implementation is required. | Review against contract completeness. |
| `in_scope` | Execution Scope | Include all in-scope blocking rows. | Path, determinism, metadata, coexistence, evidence expectations. |
| `out_of_scope` | Execution Scope and Planned Follow-up Work | Include writer/check mode, drift checking, CODEFACTORY expansion, evidence packet, and YAML replacement migration. | Non-blocking unless contradicted. |
| `constraints` | Context / Constraints | Preserve R0 YAML boundary and R1 source behavior. | Include execution-estimation and worktree constraints. |
| `review_boundary` | Review Boundary | Copy approval boundary rows. | Primary consensus-review standard. |
| `planned_follow_up_work` | Planned Follow-up Work | Copy each deferred task. | Non-blocking unless current diff blocks it. |
| `test_or_risk_context` | Validation Gates | Include commands run and contract inspection result. | Record skipped or failed checks explicitly. |

# Revision Log

| Timestamp | Actor | Change | Checksum |
| --- | --- | --- | --- |
| 2026-05-23T17:41:50Z | codex | Created initial BEL-1217 Execution Brief from Linear issue, current-thread instructions, R1 evidence, fixtures, and implementation state. | `.codex/execution-briefs/BEL-1217/execution-brief.sha256` |
| 2026-05-23T17:46:56Z | codex | Recorded implementation and validation results before consensus review. | `.codex/execution-briefs/BEL-1217/execution-brief.sha256` |
