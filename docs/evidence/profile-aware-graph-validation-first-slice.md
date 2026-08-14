# Profile-Aware Graph Validation First-Slice Evidence

## Document Control

| Field | Value |
| --- | --- |
| Evidence ID | `EVD-0` |
| Work package | `WP-1` — graph proving slice |
| Validation checkpoint | `VAL-0` |
| Status | Complete and ready for independent `MS-1` review |
| Worktree | `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/profile-aware-graph-validation-implementation` |
| Branch | `codex/profile-aware-graph-validation-implementation` |
| Baseline commit | `6991be22d0ba0dd6dbfa2bbb81629883400bad77` |
| Runtime | Node.js `v22.20.0`; npm `11.13.0`; `@jasonbelmonti/markdown-engine` `2.0.0` |
| Scope statement | This artifact records observed WP-1 evidence only. It does not approve `MS-1`, authorize `WP-2`, or claim completion of later graph-validation contracts. |

## Entry Controls

The controlling execution brief, R2 design, execution specification, R0 report, task definition, execution plan, and their applicable checksums were read and verified before execution. Repository identity remained on the expected branch and baseline commit.

`DEP-3` was satisfied for this bounded child by `.codefactory/execution-estimates/profile-aware-graph-validation-wp1-estimate.json`:

| Estimate field | Observed value |
| --- | --- |
| Schema | `execution-estimation.v5` |
| Decomposition depth | `1` |
| `execution.action` | `proceed` |
| `decompositionRecommended` | `false` |
| Blast radius | `low` |
| Adjusted estimate | `5` story points, medium confidence |

The project owner's approval applied to WP-1 only. No later work package was authorized.

## Clean Baseline

The following commands were run in order before any WP-1 production-code edit:

| Command | Exit | Observed result |
| --- | ---: | --- |
| `npm ci` | 0 | Installed 118 packages from the lockfile. npm reported three high-severity audit findings. No audit fix was run because dependency and package changes are outside WP-1. |
| `npm run build --silent` | 0 | TypeScript build completed without diagnostics. |
| `npm run typecheck` | 0 | Type checking completed without diagnostics. |
| `npm test` | 0 | Vitest reported 20 passed test files and 137 passed tests. |

Status inspection after the baseline showed no WP-1 implementation path. The only existing changes were the authorized execution-spec and local `.codefactory/**` / `.frontier/**` control state.

## Implemented Proving Slice

WP-1 adds three isolated internal boundaries:

- `graph-profile`: immutable `markdown-trace.graph-profile.v1` data for the narrow execution-spec path.
- `trace-evidence`: public-engine-backed, non-registry `markdown-trace.trace-evidence.v1` extraction.
- `graph-validation`: deterministic projection and ordered required-path evaluation returning `markdown-trace.graph-validation-result.v1`.

The minimal profile declares these ordered relationships:

1. `OBJ -> WP` via `objective_implemented_by`.
2. `WP -> VAL` via `work_validated_by`.
3. `VAL -> EVD` via `validation_supported_by`.

`EVD` is a definition-free terminal coverage node. Trace evidence remains explicitly labeled `authority: trace-evidence`; no registry, authoritative graph, CLI, or package-root export behavior is changed.

## Positive Result Evidence

The positive fixture produced this observed result projection:

```json
{
  "schemaVersion": "markdown-trace.graph-validation-result.v1",
  "status": "pass",
  "summary": {
    "nodes": 4,
    "relationships": 3,
    "requiredPaths": 1,
    "satisfiedRequiredPaths": 1,
    "diagnostics": 0
  },
  "requiredPathResults": [
    {
      "pathId": "exec.objective_to_evidence",
      "sourceId": "OBJ-1",
      "status": "satisfied",
      "nodeIds": ["OBJ-1", "WP-1", "VAL-1", "EVD-1"],
      "relationshipClasses": [
        "objective_implemented_by",
        "work_validated_by",
        "validation_supported_by"
      ]
    }
  ]
}
```

Observed hashes:

| Input / projection | SHA-256 |
| --- | --- |
| Positive fixture / validation source | `70e305aabcefc661b423702d668b92da497d9194201f783fac28845b2728b9d9` |
| Minimal execution profile | `185113b56c7808b91279dcb3decdf46ef1541a00d69412f6b97ec54647aa3d88` |
| Positive trace evidence | `4aa61caf7ab87bf51445be6467a7492741879e81eb31a8a69c8edc2b34664e5b` |

## Negative Result Evidence

The paired negative fixture preserved the same OBJ, WP, and VAL definitions while omitting terminal EVD evidence. It produced:

```json
{
  "schemaVersion": "markdown-trace.graph-validation-result.v1",
  "status": "fail",
  "requiredPathResults": [
    {
      "pathId": "exec.objective_to_evidence",
      "sourceId": "OBJ-1",
      "status": "missing",
      "nodeIds": ["OBJ-1", "WP-1", "VAL-1"],
      "relationshipClasses": [
        "objective_implemented_by",
        "work_validated_by"
      ],
      "missingRelationshipClass": "validation_supported_by"
    }
  ],
  "diagnostic": {
    "code": "markdown-trace.graph.missing_required_path",
    "severity": "error",
    "profileRuleId": "exec.objective_to_evidence",
    "affectedIds": ["OBJ-1", "WP-1", "VAL-1"],
    "sourceLines": [7, 13, 19],
    "blocking": true
  }
}
```

Observed hashes:

| Input / projection | SHA-256 |
| --- | --- |
| Negative fixture / validation source | `fc0d359c719121cef95411ed18828689bdae3d2f0b0c57fd4174bf4ee9ef13c1` |
| Minimal execution profile | `185113b56c7808b91279dcb3decdf46ef1541a00d69412f6b97ec54647aa3d88` |
| Negative trace evidence | `4662b866a2679641fdcd2d70417f469e1f14d96914d5daa8abba9cfb183ca112` |

## Final Validation

The completed WP-1 tree was validated in the execution-plan order:

| Command | Exit | Observed result |
| --- | ---: | --- |
| `npm test -- tests/test_graph_first_slice.test.ts` | 0 | 1 file and 3 tests passed: positive path, negative source-backed diagnostic, and deterministic/non-mutating repeated execution. |
| `npm run build --silent` | 0 | Build completed without diagnostics. |
| `npm run typecheck` | 0 | Type checking completed without diagnostics. |
| `npm test` | 0 | 21 test files and 140 tests passed. |
| `git diff --check` | 0 | No diff whitespace errors. |

One contained type-check error was observed during the first focused implementation gate: optional engine source offsets were used as required numeric sort keys in the new validator. The repair was limited to `src/markdowntrace/graph-validation/validate.ts`, used a deterministic fallback for absent offsets, and the focused gate plus every final command above were rerun successfully. This was an in-scope repair, not an approved deviation.

## Authority and Import Boundary Audit

The public package-root import search found only these production imports:

```text
src/markdowntrace/trace-evidence/model.ts: @jasonbelmonti/markdown-engine
src/markdowntrace/trace-evidence/extract.ts: @jasonbelmonti/markdown-engine
src/markdowntrace/graph-validation/model.ts: @jasonbelmonti/markdown-engine
src/markdowntrace/graph-validation/validate.ts: @jasonbelmonti/markdown-engine
```

Separate searches observed no deep `@jasonbelmonti/markdown-engine/*` import, no `experiments/**` import, and no production dependency on existing `registry`, `graph`, `validation`, or `markdown` modules. Inspection also found no network call, source-writing operation, executable-content evaluation, registry promotion, CLI change, or public package-root export.

Read-only configuration hashes remained:

| File | SHA-256 |
| --- | --- |
| `package.json` | `f93b7f466a2f9f35e6fe36a88467f2d5b9d9aa3ca3bc05503b6fe1713dd165d8` |
| `package-lock.json` | `c4ba4129037cc971827da03897f9dd0ba50ef157a59b6f7f727b9e970194b8de` |
| `tsconfig.json` | `1778f93e677efbc4eb3164faba944889d0af2cbab0b6674fbc00abef13b3e6fe` |
| `tsconfig.build.json` | `22d42ef12a5ea925fa02e656bcadc72893c693c71ac77bc8bff275e75d6bd791` |

## Changed-Path Containment

Executor-created WP-1 paths are confined to:

```text
docs/evidence/profile-aware-graph-validation-first-slice.md
fixtures/profile-aware-graph-validation/first-slice/missing-required-path.md
fixtures/profile-aware-graph-validation/first-slice/positive-execution-spec.md
src/markdowntrace/graph-profile/execution-spec.ts
src/markdowntrace/graph-profile/index.ts
src/markdowntrace/graph-profile/model.ts
src/markdowntrace/graph-validation/index.ts
src/markdowntrace/graph-validation/model.ts
src/markdowntrace/graph-validation/validate.ts
src/markdowntrace/trace-evidence/extract.ts
src/markdowntrace/trace-evidence/index.ts
src/markdowntrace/trace-evidence/model.ts
tests/test_graph_first_slice.test.ts
```

The worktree also contains pre-existing authorized control state under `.codefactory/**`, `.frontier/**`, and `docs/markdown-trace-profile-aware-graph-validation-execution.md`. That state was preserved and was not misclassified as WP-1 implementation. After the execution route completed, the task definition's mutable execution checkpoint and checksum were refreshed to record `review-ready`; no task objective, scope, success criterion, or review boundary changed. The completed execution plan is therefore a historical record of this run and is not authority to resume later work.

No existing `src/markdowntrace/registry/**`, `src/markdowntrace/graph/**`, `src/markdowntrace/validation/**`, `src/markdowntrace/markdown/**`, CLI, package-root export, package configuration, TypeScript configuration, or existing fixture file was edited by WP-1.

## Success-Criterion Mapping

| Criterion | Evidence disposition |
| --- | --- |
| `TD-SC-1` | Satisfied: focused test and positive result show schema v1, pass status, and exact `OBJ-1 -> WP-1 -> VAL-1 -> EVD-1` connectivity. |
| `TD-SC-2` | Satisfied: focused test and negative result show fail status, exact diagnostic identity, affected IDs, and source lines. |
| `TD-SC-3` | Satisfied: all engine imports are package-root; forbidden imports and read-only implementation edits are absent. |
| `TD-SC-4` | Satisfied: pre-edit baseline and final build, typecheck, and full tests passed; the focused final test passed. |
| `TD-SC-5` | Satisfied: the executor-created diff is limited to approved WP-1 paths and this EVD-0; later work has not begun. |

## Deviations and Gate Disposition

Approved deviations: none.

WP-1 has produced the evidence required for independent `MS-1` review. `MS-1` has not been approved, and execution is stopped before `WP-2`.

Request `MS-1` review; do not proceed to `WP-2` without the required milestone approval.
