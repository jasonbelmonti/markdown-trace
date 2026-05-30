# R3 EVD-2: Deterministic Classification Semantics

Evidence ID: `R3-EVD-2`
Validation checkpoint: `VAL-2`
Work package: `R3-2A`
Related issue: `BEL-1233`
Status: Complete deterministic classification proof on 2026-05-29

## Objective

Prove that migration comparison classifications are deterministic for registry, graph, metadata, and validation dimensions before report rendering, CLI orchestration, or source-authority changes.

## Classification Contract

| Status | Deterministic rule | Exit impact |
| --- | --- | --- |
| `equivalent` | A dimension has no normalized manual/generated deltas. | Passing |
| `intentional` | Every delta in a dimension is either an exact approved intentional delta or generated metadata absence in explicit `yaml-authoritative` state with a valid checked generated sidecar metadata contract. | Passing |
| `blocking` | Any unexplained, unmatched, invalid, or unsafe delta remains blocking. | Failing |

Approved intentional deltas must match `dimension`, `path`, `expected`, `actual`, and a non-empty `rationale`. Extra, missing, duplicate, or value-mismatched approvals do not downgrade drift.

## Dimension Coverage

| Dimension | Equivalent proof | Intentional proof | Blocking proof |
| --- | --- | --- | --- |
| Registry | Matching registry snapshots report `equivalent`. | Exact approved `document.title` drift reports `intentional`. | The same unapproved `document.title` drift reports `blocking`. |
| Graph | Matching graph snapshots report `equivalent`. | Exact approved `nodes.0.label` drift reports `intentional`. | The same unapproved `nodes.0.label` drift reports `blocking`. |
| Metadata | Matching metadata snapshots report `equivalent`; selected parity fixture reports approved generated-only metadata absence. | Exact approved `generated.generator.packageVersion` drift reports `intentional`; generated metadata absence reports `intentional` only in `yaml-authoritative` state with valid sidecar metadata. | Generated metadata absence outside `yaml-authoritative` state reports `blocking`; stale generated metadata differing from the checked sidecar reports `blocking`. |
| Validation | Matching validation snapshots report `equivalent`. | Exact approved `exitCode` drift reports `intentional`. | The same unapproved `exitCode` drift reports `blocking`. |

## Metadata Authority Guard

Manual YAML generated-metadata absence is classified as intentional only when all of these are true:

- The comparison input declares `authorityState: yaml-authoritative`.
- The generated sidecar metadata check is valid.
- The generated sidecar metadata matches the R2 generated artifact contract fields used by the comparator.
- The only metadata deltas are manual absence versus checked generated metadata presence.

The same generated-only metadata deltas become blocking when the authority state is not `yaml-authoritative`.

## Command Evidence

| Check | Command | Result |
| --- | --- | --- |
| Focused classification tests | `npm test -- tests/test_migration_comparison.test.ts` | Passed: 1 test file, 19 tests. |
| Determinism repeat | `npm test -- tests/test_migration_comparison.test.ts` run three additional times | Passed all three runs: 1 test file, 19 tests each. |
| TypeScript typecheck | `npm run typecheck` | Exited `0`. |
| Full test suite | `npm test` | Passed: 13 test files, 118 tests. |
| Build | `npm run build` | Exited `0`. |
| R0 YAML compatibility | `npm run validate:fixture` | Exited `0`; report status `PASS`; findings `0`. |
| R0 derive compatibility | `npm run derive:fixture` | Exited `0`; `diagnostics: []`. |
| Diff hygiene | `git diff --check` | Exited `0`. |

## Review Boundary

This evidence supports `MS-2` review of deterministic comparison semantics and the migration report data model only. It does not add report rendering policy, CLI orchestration, the full R2 fixture/profile coverage matrix, rollback rehearsal, CI enforcement evidence, YAML removal, or source-authority flip approval.
