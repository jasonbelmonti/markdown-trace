# EVD-9: R2 Generated Sidecar Transition Evidence and YAML Replacement Criteria

Evidence ID: `EVD-9`
Validation checkpoint: `VAL-9`
Work package: `R2-Leaf-5`
Status: Complete transition recommendation with local validation passing on 2026-05-24
Related tickets: `BEL-1216`, `BEL-1217`, `BEL-1218`, `BEL-1219`, `BEL-1220`, `BEL-1221`

## Decision Summary

Recommended R2 outcome: `PROCEED_TO_REPLACEMENT_PLANNING`

Generated sidecar registry artifacts should continue supplementing hand-authored YAML sidecars during the current transition. The R2 evidence is strong enough to start a separate YAML replacement planning task, but it does not approve removing YAML support, migrating existing registries, or treating generated artifacts as the only supported registry source.

The replacement planning task must define migration checks, review policy, compatibility guarantees, and rollback or recovery expectations before implementation work can replace YAML sidecars.

## Evidence Inventory

| Evidence | Artifact or command | Result |
| --- | --- | --- |
| Artifact contract | `docs/markdown-trace-r2-generated-sidecar-artifact-contract.md` | Contract defines deterministic generated sidecar paths, metadata, serialization, coexistence, review policy, and follow-up evidence expectations. |
| Minimal generated sidecar | `fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml` | Checked artifact preserves registry root fields, generated metadata, two entities, one edge, and no external references. |
| CODEFACTORY generated sidecar | `fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/codefactory-link-backed-spec--profile-codefactory-type-profile-1d87b2e3.entity-registry.yaml` | Checked artifact preserves CODEFACTORY profile metadata, domain entity types, three entities, two edges, and no external references. |
| Check-mode drift diagnostics | Controlled stale artifact probe with `derive-sidecar --check` | Command exited `1`, reported `category: content_mismatch`, and preserved stale artifact bytes. |
| R0 YAML compatibility | `npm run validate:fixture` | Command exited `0`; `docs/evidence/valid-fixture-report.md` reported `Status` `PASS` and `Findings` `0`. |
| R0 derived-registry compatibility | `npm run derive:fixture` | Command exited `0`; output reported `diagnostics: []` for the R0 fixture. |
| Regression suite | `npm test` | Command exited `0`; 12 test files and 99 tests passed. |
| TypeScript typecheck | `npm run typecheck` | Command exited `0`. |
| Build | `npm run build` | Command exited `0`. |

## R2 Artifact Evidence

The R2 contract remains the authority for generated sidecar shape. It explicitly states that generated sidecars supplement existing YAML sidecars during transition and that YAML replacement requires a later migration contract.

The minimal checked artifact confirms the first generated-sidecar path:

```bash
node dist/markdowntrace/cli.js derive-sidecar \
  --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml \
  --check
```

Observed result on 2026-05-24: exit code `0`, stdout:

```text
fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml
```

The CODEFACTORY checked artifact confirms profile-backed domain coverage:

```bash
node dist/markdowntrace/cli.js derive-sidecar \
  --document fixtures/r1-link-backed-entity-syntax/codefactory-link-backed-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/codefactory-type-profile.yaml \
  --check
```

Observed result on 2026-05-24: exit code `0`, stdout:

```text
fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/codefactory-link-backed-spec--profile-codefactory-type-profile-1d87b2e3.entity-registry.yaml
```

## Drift Check Evidence

A controlled stale-artifact probe copied the minimal fixture, type profile, checked artifact, and `package.json` into a temporary repository, replaced the checked artifact bytes with `# stale generated artifact`, and ran the minimal `derive-sidecar --check` command from that temporary repository.

Observed result on 2026-05-24:

| Field | Value |
| --- | --- |
| Exit code | `1` |
| Stdout | empty |
| Drift category | `content_mismatch` |
| Document | `fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md` |
| Artifact | `fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml` |
| Before SHA-256 | `427ac79882f206c8b929d2759acdbb0340ee8a845ad9495ca703bf7e8e2abba9` |
| After SHA-256 | `427ac79882f206c8b929d2759acdbb0340ee8a845ad9495ca703bf7e8e2abba9` |

The unchanged SHA-256 confirms check mode reported drift without rewriting the stale artifact.

## R0 Compatibility Confirmation

R0 remains YAML-first and historically scoped. This R2 evidence does not rewrite R0 or R1 as if generated sidecars were previously approved as replacement authority.

| Compatibility boundary | Evidence | Result |
| --- | --- | --- |
| Existing YAML sidecar validation remains accepted | `npm run validate:fixture` | Valid R0 fixture passed with exit code `0` and 0 findings. |
| Existing R0 derived-registry behavior remains accepted | `npm run derive:fixture` | R0 derivation passed with `diagnostics: []`. |
| Existing R1 recommendation remains bounded | `docs/evidence/r1-link-backed-evidence-and-recommendation.md` | R1 approves generated checked artifacts as a transition supplement, not direct YAML replacement. |

## Replacement Criteria

YAML sidecars may not be replaced until a later task satisfies all of these criteria:

| Criterion | Required evidence before replacement |
| --- | --- |
| Migration checks | A migration command or test suite compares existing YAML sidecars against regenerated sidecars and reports every registry, graph, metadata, and validation delta as either equivalent, intentionally changed, or blocking. |
| Review policy | Generated artifact diffs have explicit review rules covering ownership, required metadata, human-editable status, manual-edit drift, and when reviewers may trust regeneration instead of hand-inspecting every line. |
| Compatibility guarantee | The existing `validate --registry` path and current R0 fixture behavior remain supported through the migration window, or a separately approved compatibility break documents consumers, rollout, and release impact. |
| Rollback and recovery | Operators can restore the prior YAML-backed state from source control or regenerate checked artifacts deterministically from Markdown source and type profiles after a failed migration. |
| CI enforcement | CI runs sidecar generation or check mode for migrated fixtures and fails on missing artifacts, stale artifacts, metadata drift, and YAML compatibility regressions while YAML remains supported. |
| Fixture and profile coverage | Replacement evidence covers at least the R0 YAML fixture, the minimal R1 link-backed fixture, CODEFACTORY profile-backed fixtures, stale artifact failures, missing artifact failures, and malformed profile failures. |
| Documentation boundary | User-facing and operator-facing docs identify the supported registry source of truth, how to regenerate artifacts, how to review generated diffs, and how to recover from drift. |
| Approval record | A separate migration contract or task explicitly approves replacement implementation after the above evidence is available. |

## Final Recommendation

Proceed to replacement planning, not replacement implementation.

Generated sidecars have enough evidence to act as checked transition artifacts: the minimal and CODEFACTORY artifacts match deterministic derivation, check mode detects stale artifacts without rewriting them, and R0 YAML validation remains compatible. Replacement remains blocked because no migration command, CI migration policy, rollout boundary, or rollback procedure has been approved.

Decision record:

| Option | Recommendation | Reason |
| --- | --- | --- |
| Replace YAML sidecars now | Do not approve. | R2 proves generated artifact viability, but replacement criteria are not yet implemented or approved. |
| Continue supplementing YAML sidecars | Approve. | This preserves the R0 compatibility control while using generated artifacts as reviewable transition evidence. |
| Start YAML replacement planning | Approve. | The required evidence now exists to write a bounded migration contract and implementation task. |
| Stop generated sidecar work | Do not approve. | Current tests, checked artifacts, and drift diagnostics passed with no blocking compatibility regression. |

## Validation Status

Final local validation passed on 2026-05-24 from the BEL-1221 worktree based on `origin/main` commit `f5770410b7ce973cb27ad314ce04c5471e8c1294`.

| Command or check | Result | Evidence |
| --- | --- | --- |
| Execution estimation | Passed | Proposal estimate returned `execution.action` `proceed`, low blast radius, and no decomposition recommendation. |
| `npm test` | Passed | 12 test files and 99 tests passed. |
| `npm run typecheck` | Passed | `tsc --noEmit` completed with exit code `0`. |
| `npm run build` | Passed | `tsc -p tsconfig.build.json` completed with exit code `0`. |
| `npm run validate:fixture` | Passed | R0 valid fixture report emitted `Status` `PASS`, `Exit code` `0`, and 0 findings. |
| `npm run derive:fixture` | Passed | R0 fixture derived registry and graph output with `diagnostics: []`. |
| Minimal generated sidecar check | Passed | `derive-sidecar --check` exited `0` and printed the checked minimal artifact path. |
| CODEFACTORY generated sidecar check | Passed | `derive-sidecar --check` exited `0` and printed the checked CODEFACTORY artifact path. |
| Controlled stale-artifact drift probe | Passed | `derive-sidecar --check` exited `1`, reported `content_mismatch`, and preserved stale artifact bytes. |
