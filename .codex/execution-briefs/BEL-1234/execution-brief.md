---
title: "BEL-1234 Execution Brief"
brief_id: "BEL-1234"
artifact_version: "1.0.0"
status: "complete"
created_at: "2026-05-30T14:24:21Z"
updated_at: "2026-05-30T14:34:14Z"
target_repo: "/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1234-r3-2b-report-rendering"
target_branch: "codex/bel-1234-r3-2b-report-rendering"
review_boundary_id: "RB-BEL-1234"
---

# Objective

Execute BEL-1234 / R3-2B by adding stable reviewer-facing migration report rendering and representative evidence examples. Reviewers must be able to inspect every comparison delta through rendered output that includes stable path, expected value, actual value, status, and rationale without manually diffing YAML.

# Context / Constraints

- Confirmed constraints: Editable implementation paths are `src/markdowntrace/migration/**`, `src/markdowntrace/reporting/**`, focused tests, and `docs/evidence/**` examples.
- Confirmed constraints: Preserve R0 YAML compatibility, preserve the R2 generated sidecar artifact contract, keep generated sidecars as non-human-editable checked artifacts, and do not imply generated sidecar authority.
- Dependencies: BEL-1233 / R3-2A deterministic classifier semantics are merged into `origin/main` at `641990d5bb7e2c3a593cf4dc85b7533c43509863`.
- Non-goals: No CLI orchestration, no migration check command, no full R2 fixture/profile coverage matrix, no YAML removal, no source-authority flip, no live project-management mutation.
- Accepted tradeoffs: Rendering will consume the existing `MigrationComparisonReport` data model and stay separate from classifier semantics and CLI orchestration.
- Assumptions / Inferences: A new reporting formatter and evidence artifact are sufficient for R3-2B because BEL-1234 owns presentation and examples only.

# Authoritative Sources

| Source | Retrieved at | Authority | Status | Controls |
| --- | --- | --- | --- | --- |
| Current thread instructions | 2026-05-30T14:24:21Z | Latest user intent and local operating rules | loaded | Execute `execution-brief > execution-plan > EXECUTE`; use worktrees; use execution estimation before coding; preserve task-definition review boundaries. |
| Linear `BEL-1234` | 2026-05-30T14:13:00Z | Leaf task contract | loaded | Controls objective, editable paths, success criteria, validation gates, non-goals, and report examples. |
| Linear `BEL-1224` | 2026-05-30T14:21:00Z | Parent R3 control issue | loaded | Controls no-flip boundary, worktree use, estimation-before-coding, and stop conditions. |
| `docs/markdown-trace-r3-yaml-replacement-migration-execution.md` | 2026-05-30T14:18:00Z | Binding R3 execution spec | loaded | Controls `WP-2`, `VAL-2`, `MV-2`, report model scope, and no source-authority flip. |
| `docs/markdown-trace-r3-yaml-replacement-migration-addendum.md` | 2026-05-30T14:20:00Z | R3 design addendum | loaded | Defines comparison report behavior and authority-safe wording. |
| `docs/evidence/r3-deterministic-classification-semantics.md` | 2026-05-30T14:18:00Z | BEL-1233 classifier evidence | loaded | Supplies approved equivalent, intentional, and blocking status semantics. |
| `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md` | 2026-05-30T14:21:00Z | R2 replacement criteria | loaded | Blocks YAML replacement until later migration checks, coverage, rollback, CI enforcement, and approval exist. |
| `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` | 2026-05-30T14:21:00Z | R2 generated sidecar contract | loaded | Controls generated metadata, non-human-editable wording, serialization, and coexistence policy. |
| Target worktree | 2026-05-30T14:23:31Z | Current implementation state | loaded | Branch `codex/bel-1234-r3-2b-report-rendering` at `641990d5bb7e2c3a593cf4dc85b7533c43509863`; no implementation changes before artifact creation. |
| `docs/markdown-trace-r3-yaml-replacement-linear-decomposition-plan.md` | 2026-05-30T14:21:00Z | Referenced parent planning source | missing | Not present in checkout; non-blocking because BEL-1234 and R3 spec define the leaf boundary. |

# Current State

- Planning / PM: BEL-1234 is in Backlog, assigned to Jason Belmonti, priority Medium, estimate 5 points, and action `proceed-with-controls`.
- Design: R3 execution spec requires `MV-2` reviewers to inspect equivalent, intentional, and blocking examples with stable path, expected value, actual value, and rationale where needed.
- Implementation: `formatMigrationComparisonReport` now renders `MigrationComparisonReport` as stable Markdown from `src/markdowntrace/reporting/migration-report.ts` and is exported from `src/markdowntrace/reporting/index.ts`.
- Validation: Focused report tests, typecheck, full tests, build, R0 YAML validation, R0 derivation, and diff hygiene passed after implementation.
- Estimation: Proposal estimator evidence is recorded at `.codex/estimation/bel-1234-estimate.json`; result is `proceed-with-controls`, 5 points, medium blast radius, and no decomposition recommendation.
- Known gaps: None inside the BEL-1234 boundary.

# Execution Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Stable migration report rendering | in-scope | blocking | Render each dimension and delta with stable path, expected value, actual value, status, and rationale where needed. |
| Representative report examples | in-scope | blocking | Evidence must cover equivalent, intentional, and blocking outputs. |
| Authority-safe wording | in-scope | blocking | Reports and examples must not imply generated sidecar authority, YAML removal, or source-authority flip. |
| Focused tests | in-scope | blocking | Tests should prove rendering content and deterministic ordering without coupling to CLI orchestration. |
| Command orchestration or npm migration check command | out-of-scope | blocking if included | Belongs to later `WP-3` / `R3-3A` work. |
| Full R2 fixture/profile coverage matrix | out-of-scope | blocking if included | Belongs to later `WP-4` work. |
| Generated sidecar serialization changes | out-of-scope | blocking if included | R2 contract preservation is mandatory. |

# Materially Verifiable Success Criteria

- [x] Rendered migration reports include document path, manual registry path, generated sidecar path, exit code, dimension status, stable delta path, expected value, actual value, and rationale where needed.
- [x] Focused tests prove equivalent, intentional, and blocking rendered outputs.
- [x] Evidence examples under `docs/evidence/**` cover equivalent, intentional, and blocking outputs.
- [x] Evidence wording states generated sidecars remain checked artifacts and does not imply YAML removal or authority flip.
- [x] Required validation gates pass, or any failure is recorded as a stop condition before review.

# Review Boundary

| Boundary | Scope | Approval impact | Notes |
| --- | --- | --- | --- |
| Report contract | in-scope | blocking | Reject if reviewers cannot understand every delta from rendered output or if status/rationale is misleading. |
| Classification semantics | in-scope only as consumed data | blocking if regressed | Do not re-decide BEL-1233 semantics; reject only if rendering contradicts or corrupts them. |
| Package boundary | in-scope | blocking | Rendering must not duplicate schema in CLI code or merge presentation into classification policy. |
| Authority wording | in-scope | blocking | Reject if examples imply generated sidecars are editable authority or YAML can be removed now. |
| CLI orchestration, coverage matrix, rollback, CI enforcement, authority flip | out-of-scope | non-blocking unless contradicted | Planned follow-up work; do not require it for BEL-1234 approval. |

# Planned Follow-up Work

- `R3-3A1` / `R3-3A2`: local migration check orchestration and no-write failure behavior.
- `R3-4A`: full R2 fixture/profile coverage matrix.
- Later R3 work: operator docs, rollback rehearsal, CI enforcement status, and separate source-authority flip approval decision if evidence supports it.

# Execution Plan

1. Read this brief, the execution plan, and the current migration/reporting code.
2. Add a focused migration report formatter that consumes `MigrationComparisonReport` without changing classifier semantics.
3. Add focused tests proving equivalent, intentional, and blocking rendered outputs.
4. Add authority-safe evidence examples under `docs/evidence/**`.
5. Run execution estimation before coding, then run focused and baseline validation gates after implementation.

# Validation Gates

- Validate this brief:
  `npx -y @jasonbelmonti/markdown-engine@2.0.0 validate --file ./.codex/execution-briefs/BEL-1234/execution-brief.md --profile /Users/jasonbelmonti/.codex/skills/execution-brief/profiles/execution-brief.yaml`
- Validate the execution plan:
  `python3 /Users/jasonbelmonti/.codex/skills/execution-plan/scripts/validate_execution_plan.py --file ./.codex/execution-plans/BEL-1234/execution-plan.md`
- Execution estimation:
  `python3 /Users/jasonbelmonti/.codex/skill-checkouts/execution-estimation/scripts/estimate_execution.py --repo-root /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1234-r3-2b-report-rendering --proposed-files ./.codex/estimation/bel-1234-proposed-files.txt`
- Focused tests:
  `npm test -- tests/test_migration_report.test.ts`
- Baseline checks:
  `npm run typecheck`
  `npm test`
  `npm run build`
  `npm run validate:fixture`
  `npm run derive:fixture`
- Diff hygiene:
  `git diff --check`

# Stop Conditions

- Execution estimation returns `decompose-first`, `plan-first`, or `planning.blocksExecution: true`.
- A required source conflicts with BEL-1234 scope and the controlling source cannot be determined.
- Implementing stable report rendering requires CLI orchestration, generated sidecar serialization changes, YAML removal, or source-authority flip wording.
- Required validation fails for reasons outside the BEL-1234 boundary.
- Evidence examples cannot be written without implying generated sidecar authority or weakening the R2 sidecar contract.

# Review Packet Inputs

| Field | Source section | Required mapping | Notes |
| --- | --- | --- | --- |
| `objective` | Objective | Add stable reviewer-facing migration report rendering and examples for BEL-1234 / R3-2B. | Use Linear task wording. |
| `intended_behavior_change` | Objective and Execution Plan | A migration report can be rendered as stable Markdown that explains equivalent, intentional, and blocking outcomes. | No CLI command is required. |
| `in_scope` | Execution Scope | Include report rendering, examples, authority wording, and focused tests. | Blocking review items. |
| `out_of_scope` | Execution Scope and Planned Follow-up Work | Include CLI orchestration, coverage matrix, rollback, CI enforcement, YAML removal, and authority flip. | Non-blocking unless contradicted by this diff. |
| `constraints` | Context / Constraints | Preserve YAML compatibility, R2 sidecar contract, sidecar non-authority wording, and classification/reporting separation. | Current thread and Linear control this. |
| `review_boundary` | Review Boundary | Reject for report contract gaps, classifier contradiction, package-boundary violations, or unsafe authority wording. | Primary anti-scope-creep control. |
| `planned_follow_up_work` | Planned Follow-up Work | Copy each deferred R3 work item. | Non-blocking unless current diff prevents it. |
| `test_or_risk_context` | Validation Gates | Include focused tests, baseline commands, estimator output, and any skipped/failing gate. | Required before review. |

# Revision Log

| Timestamp | Actor | Change | Checksum |
| --- | --- | --- | --- |
| 2026-05-30T14:24:21Z | codex | Created initial BEL-1234 Execution Brief from current thread, Linear sources, R3 docs, R2 contract, and worktree state. | pending |
| 2026-05-30T14:34:14Z | codex | Recorded proposal execution estimate before implementation edits. | pending |
| 2026-05-30T14:34:14Z | codex | Completed report rendering, evidence examples, focused tests, and required validation gates. | pending |
