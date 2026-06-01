# R3 EVD-8: Rollback Rehearsal

Evidence ID: `R3-EVD-8`
Validation checkpoint: `VAL-8`
Work package: `WP-5`
Related issue: `BEL-1242`
Status: Ready for `R3-MS-4` review
Observed at: `2026-06-01T18:49:25Z`

## Objective

Record a local rollback rehearsal showing that, before any source-authority flip, Markdown Trace can recover from generated sidecar drift by restoring source-control bytes or deterministically regenerating checked artifacts without manual generated YAML edits.

## Rehearsal Boundary

This rehearsal uses the minimal R1 same-document migration fixture because it is the selected parity fixture and is already covered by the R3 migration check and R2 fixture/profile matrix evidence.

| Field | Value |
| --- | --- |
| Source document | `fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md` |
| Manual registry | `fixtures/r1-link-backed-entity-syntax/minimal-link-backed-manual-registry.yaml` |
| Type profile | `fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml` |
| Generated sidecar | `fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml` |
| Authority state | `yaml-authoritative`; generated sidecar remains checked non-human-editable evidence. |

This evidence does not approve YAML removal, generated sidecar authority, replacement readiness, or a source-authority flip.

## Rehearsed Runbook

| Step | Command or action | Expected result | Observed result | Status |
| --- | --- | --- | --- | --- |
| Build CLI | `npm run build` | Build exits `0`. | Exit code `0`. | `PASS` |
| Capture baseline | `shasum -a 256 <generated-sidecar>` | Baseline artifact hash is recorded. | `5be224faee1141a85c0edbeaf92021b5590f1c784bb1eb16d328c4dcaee3d97f`. | `PASS` |
| Baseline migration check | `node dist/markdowntrace/cli.js migration-check --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md --manual-registry fixtures/r1-link-backed-entity-syntax/minimal-link-backed-manual-registry.yaml --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml` | Existing checked state passes. | Exit code `0`. | `PASS` |
| Simulate stale checked artifact | Replace generated sidecar bytes with `# rollback rehearsal stale artifact`. | Artifact hash differs from baseline. | Stale hash `80fbaee1ef10b02d22ad336ee5f4bcdafd2e253bbcfb5976d9429be559f98a67`. | `PASS` |
| Detect stale artifact | Run migration check against the stale artifact. | Command exits non-zero with generated sidecar diagnostic. | Exit code `1`; diagnostic token `Generated sidecar check failed`. | `PASS` |
| Recover by source control | `git restore -- <generated-sidecar>` | Artifact bytes match baseline. | Restored hash `5be224faee1141a85c0edbeaf92021b5590f1c784bb1eb16d328c4dcaee3d97f`. | `PASS` |
| Verify restored state | Run migration check after restore. | Restored state passes. | Exit code `0`. | `PASS` |
| Simulate missing artifact | `rm <generated-sidecar>` | Worktree shows the generated sidecar as deleted. | `D fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml`. | `PASS` |
| Recover by regeneration | `node dist/markdowntrace/cli.js derive-sidecar --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml` | Generated sidecar is recreated deterministically. | Regenerated hash `5be224faee1141a85c0edbeaf92021b5590f1c784bb1eb16d328c4dcaee3d97f`. | `PASS` |
| Verify regenerated artifact | `node dist/markdowntrace/cli.js derive-sidecar --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml --check` | Check mode exits `0`. | Exit code `0`. | `PASS` |
| Verify final migration state | Run migration check after regeneration. | Migration check exits `0`. | Exit code `0`. | `PASS` |
| Verify final worktree | `git status --short` | Worktree is clean after rehearsal. | `<clean>`. | `PASS` |

## Result

`VAL-8` passes for the selected local rehearsal: YAML-backed authority remained intact, a stale generated artifact was detected without accepting the drift, source-control restore recovered the original checked bytes, deterministic regeneration recreated the same bytes, check mode passed after recovery, and the final worktree returned clean.

Operators must continue to recover generated sidecar drift by source-control restore or deterministic CLI regeneration. Operators must not patch generated YAML by hand.

## Review Boundary

This evidence supports `BEL-1242` rollback rehearsal and `R3-MS-4` review of `EVD-8`. It does not claim hosted CI enforcement, final source-authority flip approval, generated sidecar authority, YAML removal, or replacement readiness.
