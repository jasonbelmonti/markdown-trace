# R3 EVD-10: Final Migration Evidence Package

Evidence ID: `R3-EVD-10`
Validation checkpoint: `VAL-10`
Work package: `WP-5`
Related issue: `BEL-1242`
Status: Repository CI workflow is hosted and required on `main`; source-authority flip remains a separate approval
Observed at: `2026-06-02T15:58:17Z`

## Objective

Summarize the R3 YAML replacement migration evidence package, preserve the separate source-authority approval boundary, and record whether CI enforcement evidence exists before any later authority-flip request.

## Final Evidence Boundary

This package supports final R3 evidence review only. It does not perform or approve a source-authority flip, remove YAML support, make generated sidecars authoritative, or declare replacement readiness without a later separate authority decision.

## Evidence Inventory

| Evidence | Artifact | Summary | Status |
| --- | --- | --- | --- |
| `R3-1A` | `docs/evidence/r3-first-parity-fixture-inventory.md` | Selected the minimal R1 same-document manual/generated fixture pair without changing public registry semantics or generated sidecar bytes. | `PASS` |
| `EVD-1` | `docs/evidence/r3-first-same-document-parity-proof.md` | Proved first same-document parity across registry, graph, metadata, and validation dimensions; metadata absence remained intentional while `yaml-authoritative`. | `PASS` |
| `R3-EVD-2` | `docs/evidence/r3-deterministic-classification-semantics.md` | Proved deterministic equivalent, intentional, and blocking classification semantics across migration comparison dimensions. | `PASS` |
| `R3-EVD-2B` | `docs/evidence/r3-stable-migration-report-examples.md` | Recorded stable reviewer-facing migration report examples for equivalent, intentional, and blocking outcomes. | `PASS` |
| `R3-EVD-3` | `docs/evidence/r3-no-write-migration-check-failures.md` | Proved migration check no-write failure behavior for missing artifacts, stale artifacts, and unexplained drift. | `PASS` |
| `R3-EVD-4` / `R3-EVD-5` | `docs/evidence/r3-yaml-compatibility-and-sidecar-byte-stability.md` | Proved R0 YAML compatibility and generated sidecar byte stability remain intact after migration check integration. | `PASS` |
| `R3-EVD-6` | `docs/evidence/r3-r2-fixture-profile-coverage-matrix.md` | Covered the R2-required fixture/profile matrix, including R0 YAML, minimal R1, CODEFACTORY, stale artifact, missing artifact, and malformed profile cases. | `PASS` |
| `R3-EVD-7` | `docs/evidence/r3-reviewer-operator-migration-policy.md` | Documented reviewer/operator policy for checked non-human-editable sidecars, regeneration, drift handling, and authority-state boundaries. | `PASS` |
| `R3-EVD-8` | `docs/evidence/r3-rollback-rehearsal.md` | Rehearsed stale artifact detection, source-control restore, deterministic regeneration, check-mode verification, migration check verification, and clean worktree recovery. | `PASS` |
| `R3-EVD-9` | `docs/evidence/r3-baseline-regression-suite-status.md` | Recorded TypeScript, test, build, R0 YAML, R0 derive, migration check, and diff hygiene baseline status before final evidence. | `PASS` |
| `R3-EVD-10` | `docs/evidence/r3-final-migration-evidence.md` | Summarizes final evidence, CI status, enforcement state, and no-flip boundary. | `PASS WITH CI ENFORCEMENT` |

## CI Enforcement Status

| Check | Observed result | Authority-flip impact |
| --- | --- | --- |
| Repository CI workflow definition | `.github/workflows/ci.yml` runs `npm run ci:enforcement` on pull requests and pushes to `main`. | Defines the hosted enforcement path for future source-authority decision review. |
| Migrated fixture CI command surface | `scripts/ci-enforcement.sh` runs typecheck, tests, build, R0 validation, R0 derivation, migration check, minimal generated sidecar check, CODEFACTORY generated sidecar check, and repository mutation detection. | Covers the required repository-owned enforcement commands. |
| Hosted `main` run evidence | GitHub Actions run `26829545825` passed on `main` commit `df89757701b22fdf128dde6d246ec6c0edfba41f`: `https://github.com/jasonbelmonti/markdown-trace/actions/runs/26829545825`. | Provides hosted CI evidence for the landed workflow after the README merge. |
| Required-check enforcement evidence | `main` is protected and active branch ruleset `main` (`17146344`) targets `~DEFAULT_BRANCH` and requires status check context `CI enforcement` with integration id `15368`. | Satisfies the required-check enforcement blocker. |
| Required-check update policy | Ruleset `17146344` records `strict_required_status_checks_policy: false`. | Branches must pass `CI enforcement`, but the ruleset does not require updating with latest `main` before merge. |
| Local CI-equivalent run | `npm run ci:enforcement` passed locally on `2026-06-02`; full test suite passed 19 files and 134 tests. | Supports local review in addition to hosted enforcement. |

Hosted CI enforcement is implemented and required on `main`. This clears the missing-CI blocker that was recorded during `R3-MS-5`; it does not approve a source-authority flip, YAML removal, generated sidecar authority, or replacement readiness without a later separate approval record.

## Validation Results

| Purpose | Command | Observed result | Status |
| --- | --- | --- | --- |
| TypeScript validation | `npm run typecheck` | Exit code `0`. | `PASS` |
| Build | `npm run build` | Exit code `0`. | `PASS` |
| Full local regression suite | `npm test` | Exit code `0`; 19 test files and 134 tests passed. | `PASS` |
| R0 YAML compatibility baseline | `npm run validate:fixture` | Exit code `0`; status `PASS`; findings `0`. | `PASS` |
| R0 derive compatibility baseline | `npm run derive:fixture` | Exit code `0`; output began with `diagnostics: []`. | `PASS` |
| Passing migration command baseline | `npm run migration:check` | Exit code `0`; migration check reported `Valid` as `true`. | `PASS` |
| CI enforcement aggregate | `npm run ci:enforcement` | Exit code `0`; ran typecheck, tests, build, fixture validation, fixture derivation, migration check, minimal sidecar check, CODEFACTORY sidecar check, and repository mutation detection. | `PASS` |
| Diff hygiene | `git diff --check` | Exit code `0`. | `PASS` |
| CI workflow inspection | `find .github -maxdepth 3 -type f -print` | `.github/workflows/ci.yml` exists in this worktree. | `PASS` |
| Hosted CI run evidence | `gh run list --workflow CI --branch main --limit 5 --json databaseId,status,conclusion,headSha,displayTitle,url,createdAt,updatedAt` | Run `26829545825` completed with conclusion `success` for `df89757701b22fdf128dde6d246ec6c0edfba41f`. | `PASS` |
| Required-check enforcement evidence | `gh api repos/jasonbelmonti/markdown-trace/rulesets/17146344 --jq '{id,name,target,enforcement,conditions,rules}'` and `gh api repos/jasonbelmonti/markdown-trace/branches/main --jq '{name,protected,protection_url}'` | Active branch ruleset `main` requires status check context `CI enforcement`; `main` is protected. | `PASS` |
| Authority-boundary inspection | Search `R3-EVD-8` and `R3-EVD-10` for authority, YAML removal, replacement readiness, and source-authority flip claims. | Matching text is explicit prohibition, blocker, or review-boundary language. | `PASS` |

## Authority Boundary

- Hand-authored YAML remains valid during the migration window.
- Generated sidecars remain checked non-human-editable artifacts.
- Check mode must not write, create, or rewrite generated artifact bytes.
- Rollback before source-authority flip is source-control based or deterministic CLI regeneration.
- No YAML support is removed in this evidence package.
- No generated sidecar authority is approved in this evidence package.
- Any source-authority flip remains a later separate approval decision after `R3-MS-5`.

## Gate Recommendation

| Gate | Evidence | Recommendation |
| --- | --- | --- |
| `R3-MS-4` | `R3-EVD-7`, `R3-EVD-8` | Review operator workflow and rollback rehearsal. If approved, proceed to `R3-MS-5` final evidence review. |
| `R3-MS-5` | `R3-EVD-10` | Final evidence has CI workflow implementation, hosted run evidence, and required-check enforcement recorded. Authority flip remains a later separate approval decision. |

## Final Recommendation

Close the R3 implementation evidence package with hosted CI enforcement recorded. Do not execute a source-authority flip from this work. Continue to treat generated sidecars as checked transition evidence and keep hand-authored YAML as valid registry input until a later separately approved authority decision exists.

## Review Boundary

This evidence supports `BEL-1242` and `R3-MS-5` review reconciliation. It records hosted CI enforcement and does not approve a source-authority flip, YAML removal, generated sidecar authority, or replacement readiness.
