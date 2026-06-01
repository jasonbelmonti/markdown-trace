# R3 EVD-7: Reviewer and Operator Migration Policy

Evidence ID: `R3-EVD-7`
Validation checkpoint: `VAL-7`
Work package: `WP-5`
Related issue: `BEL-1241`
Status: Ready for `R3-MS-4` review
Observed at: `2026-06-01T16:43:23Z`

## Objective

Record the BEL-1241 reviewer and operator policy evidence for generated sidecar review, regeneration, drift handling, and YAML/generated authority-state boundaries.

## Policy Artifact

| Field | Value |
| --- | --- |
| Policy doc | `docs/markdown-trace-r3-reviewer-operator-migration-policy.md` |
| Reviewer scope | Generated sidecar review, drift signals, and approval boundaries. |
| Operator scope | Safe check, regeneration, and drift recovery commands. |
| Authority boundary | Hand-authored YAML remains valid; generated sidecars remain checked non-human-editable artifacts. |

## Success Criteria Mapping

| BEL-1241 criterion | Evidence | Status |
| --- | --- | --- |
| Docs state generated sidecars are checked non-human-editable artifacts. | Policy Boundary, Reviewer Policy, Operator Workflow, and Authority Boundary Checklist state generated sidecars are checked non-human-editable artifacts and must not be patched by hand. | `PASS` |
| Docs state hand-authored YAML remains valid during the migration window. | Policy Boundary, Authority States, and Authority Boundary Checklist keep `yaml-authoritative` compatibility valid. | `PASS` |
| Docs explain regeneration, review, and drift handling without approving a source-authority flip. | Reviewer Policy, Operator Workflow, Drift Handling, and `R3-MS-4` Readiness define review and regeneration while excluding generated authority and YAML removal. | `PASS` |
| `EVD-7` exists and is ready for `R3-MS-4` review. | This artifact exists as `R3-EVD-7` and maps to `VAL-7`. | `PASS` |

## Source Inputs

| Source | Role |
| --- | --- |
| `docs/markdown-trace-r3-yaml-replacement-migration-execution.md` | Defines `WP-5`, `VAL-7`, `MS-4`, PKG-4 ownership, and source-authority stop conditions. |
| `docs/markdown-trace-r3-yaml-replacement-migration-addendum.md` | Defines authority states, generated artifact review policy, regeneration, drift, and recovery requirements. |
| `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` | Defines generated sidecar path, metadata, deterministic serialization, non-human-editable marker, and YAML coexistence. |
| `docs/evidence/r2-generated-sidecar-transition-evidence-and-yaml-replacement-criteria.md` | Requires migration checks, review policy, compatibility, rollback, CI enforcement, documentation, and approval before YAML replacement. |
| `docs/evidence/r3-r2-fixture-profile-coverage-matrix.md` | Confirms the required R2 coverage matrix exists before policy documentation. |

## Review Boundary

This evidence supports BEL-1241 / R3-5A policy documentation only. It does not claim rollback rehearsal completion, final migration evidence completion, hosted CI enforcement, YAML removal, generated sidecar authority, replacement readiness, or source-authority flip approval.

## `VAL-7` Inspection Result

| Inspection item | Result | Approval impact |
| --- | --- | --- |
| Generated sidecar status | The policy states generated sidecars are checked non-human-editable artifacts. | Passes `VAL-7`. |
| YAML compatibility | The policy states hand-authored YAML remains valid during the migration window. | Passes `VAL-7`. |
| Regeneration instructions | The policy names `derive-sidecar --check` for no-write verification and `derive-sidecar` without `--check` for intentional regeneration. | Passes `VAL-7`. |
| Review instructions | The policy names blocking and acceptable review signals for equivalent, intentional, blocking, missing, and stale states. | Passes `VAL-7`. |
| Drift handling | The policy defines required responses for missing artifacts, stale artifacts, registry drift, graph drift, metadata drift, validation drift, and intentional metadata absence. | Passes `VAL-7`. |
| Authority boundary | The policy excludes YAML removal, generated authority, source-authority flip approval, rollback rehearsal completion, and final readiness claims. | Passes `VAL-7`. |

## Validation Results

| Purpose | Command | Observed result | Status |
| --- | --- | --- | --- |
| TypeScript validation | `npm run typecheck` | Exit code `0`. | `PASS` |
| Full local regression suite | `npm test` | Exit code `0`; 19 test files and 134 tests passed. | `PASS` |
| Build | `npm run build` | Exit code `0`. | `PASS` |
| R0 YAML compatibility baseline | `npm run validate:fixture` | Exit code `0`; status `PASS`; findings `0`. | `PASS` |
| R0 derive compatibility baseline | `npm run derive:fixture` | Exit code `0`; output began with `diagnostics: []`. | `PASS` |
| Passing migration command baseline | `npm run migration:check` | Exit code `0`; migration check reported `Valid` as `true`. | `PASS` |
| Diff hygiene | `git add -N docs/markdown-trace-r3-reviewer-operator-migration-policy.md docs/evidence/r3-reviewer-operator-migration-policy.md && git diff --check -- docs/markdown-trace-r3-reviewer-operator-migration-policy.md docs/evidence/r3-reviewer-operator-migration-policy.md` | Exit code `0`; intent-to-add made the untracked approval diff visible to the whitespace check. | `PASS` |
| Authority-boundary inspection | Search final docs for YAML removal, generated authority, replacement readiness, and manual generated YAML edit claims. | No approval-boundary violation; matching text is explicit prohibition or boundary language. | `PASS` |

## Open Follow-up

- `R3-5B` remains responsible for rollback rehearsal and follow-up evidence.
- `R3-MS-5` remains responsible for final migration evidence and CI enforcement evidence or blocker status.
- Any future source-authority flip requires a separate approval record after the required R3 gates pass.
