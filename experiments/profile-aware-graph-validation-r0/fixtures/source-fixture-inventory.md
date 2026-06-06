# Profile-Aware Graph Validation R0 Source Fixture Inventory

## Document Control

| Field | Value |
| --- | --- |
| Work item | `BEL-1290` |
| R0 work package | `WP-1` controlled fixture baseline |
| Milestone gate | `MS-1 Fixture Baseline` |
| Status | Updated by `BEL-1291` with final table and negative probe fixtures |
| Created at | `2026-06-06T12:26:01Z` |
| Last updated at | `2026-06-06T13:07:31Z` |
| Owner | Codex |

## Purpose

This inventory records the controlled source fixture baseline for the Markdown Trace profile-aware graph validation R0. It is fixture-control evidence only: it does not implement extraction, classify graph roles, run graph validation diagnostics, mutate source Markdown, or claim production Markdown Trace behavior.

## Source Fixture Inventory

| Fixture family | Source or planned artifact | Control decision | Current evidence | MS-1 approval impact |
| --- | --- | --- | --- | --- |
| Real table-first execution spec | `/Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md` | Use as a read-only sibling source fixture. Do not copy or mutate the source for `WP-1`. | Readable at inventory time; 994 lines; SHA-256 `3dce15b7ca9c50f1829984c1dd829908a6aa76fdf012371f622ec789a756894f`. | Blocking: downstream extraction work must not proceed if this source becomes unreadable or the path changes without an updated control decision. |
| Generated design-spec demo | `docs/evidence/generated-design-spec-demo.md` | Use the committed repository file as the controlled generated design-spec fixture for `VAL-2` calibration. Regeneration is not required for `WP-1` because the committed path and checksum are recorded. | Present in this repository; 305 lines; SHA-256 `0b6c209d3a48bdabd12e8dded19e5a174f01a0fa7c17c1178a29d9a1a7c9cf24`. | Blocking: `VAL-2` evidence may cite this fixture only when the path and checksum remain controlled or a later task records deterministic regeneration evidence. |
| `ctx://trace` table behavior fixture | `experiments/profile-aware-graph-validation-r0/fixtures/ctx-table-trace-fixture.md` | Use the committed R0 fixture as controlled `VAL-3` input. It may be read by downstream extraction work but must not be used to promote table-only links into authoritative registry entities. | Present; covers heading-defined prose references, heading-defined table references, mixed prose/table references, and table-only non-authoritative `ctx://trace` candidates. | Blocking for later `VAL-3`; reviewers should reject missing or ambiguous table-link role intent. |
| Negative graph validation probes | `experiments/profile-aware-graph-validation-r0/fixtures/negative-probes/` | Use the committed R0 probe files as controlled `VAL-5` input. They document diagnostic intent only and do not implement the graph validator or smoke runner. | Present; includes dangling reference, duplicate primary definition, invalid range endpoint, and missing matrix coverage probes with expected diagnostic code families and source evidence notes. | Blocking for later `VAL-5`; reviewers should reject missing probe families or missing diagnostic intent. |

## Source Path Check Evidence

Command run from `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bel-1290-r0-source-fixture-baseline`:

```text
test -r /Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md && printf 'readable: %s\n' /Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md && wc -l docs/evidence/generated-design-spec-demo.md /Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md && shasum -a 256 docs/evidence/generated-design-spec-demo.md /Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md
```

Recorded output:

```text
readable: /Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md
     305 docs/evidence/generated-design-spec-demo.md
     994 /Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md
    1299 total
0b6c209d3a48bdabd12e8dded19e5a174f01a0fa7c17c1178a29d9a1a7c9cf24  docs/evidence/generated-design-spec-demo.md
3dce15b7ca9c50f1829984c1dd829908a6aa76fdf012371f622ec789a756894f  /Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md
```

## Final `ctx://trace` Fixture Coverage

| Case | Fixture path | Purpose | Required future evidence |
| --- | --- | --- | --- |
| Heading-defined table reference | `experiments/profile-aware-graph-validation-r0/fixtures/ctx-table-trace-fixture.md` | Prove existing heading-owned body/table references remain compatible with current Markdown Trace behavior. | Later `VAL-3` evidence records current compatibility output and confirms no source mutation. |
| Table-only `ctx://trace` definition candidate | `experiments/profile-aware-graph-validation-r0/fixtures/ctx-table-trace-fixture.md` | Prove table-only definitions are treated as R0 trace-evidence candidates, not authoritative registry entities. | Later extractor evidence records candidate status without changing production `derive`. |
| Mixed prose and table reference | `experiments/profile-aware-graph-validation-r0/fixtures/ctx-table-trace-fixture.md` | Prove fixture coverage includes both body prose and table-cell references to the same ID family. | Later extraction summary identifies source contexts and ranges. |

## Final Negative Probe Families

| Probe family | Fixture path | Expected diagnostic code family | Intended failure shape | Required future evidence |
| --- | --- | --- | --- | --- |
| Dangling reference | `experiments/profile-aware-graph-validation-r0/fixtures/negative-probes/dangling-reference.md` | `r0.graph_validation.unresolved_reference` | A fixture references an ID that has no primary or allowed supplemental definition. | Later smoke diagnostics include stable diagnostic code and source location. |
| Duplicate primary definition | `experiments/profile-aware-graph-validation-r0/fixtures/negative-probes/duplicate-primary-definition.md` | `r0.graph_validation.duplicate_primary_definition` | A fixture repeats a primary-definition ID where profile policy does not allow it. | Later smoke diagnostics distinguish duplicate primary definitions from allowed coverage rows. |
| Invalid range endpoint | `experiments/profile-aware-graph-validation-r0/fixtures/negative-probes/invalid-range-endpoint.md` | `r0.graph_validation.invalid_range_endpoint` | A fixture uses a range whose start or end ID cannot be resolved within a discovered family. | Later smoke diagnostics identify the missing endpoint and the source range. |
| Missing matrix coverage | `experiments/profile-aware-graph-validation-r0/fixtures/negative-probes/missing-matrix-coverage.md` | `r0.graph_validation.missing_matrix_coverage` | A fixture omits a required source-to-validation or objective-to-evidence path. | Later smoke diagnostics identify the missing coverage relation without promoting matrix rows to primary definitions. |

## MS-1 Approval Prerequisites

- Real execution-spec source path is explicit, read-only, readable, and checksum-recorded.
- Generated design-spec demo fixture is controlled by committed repository path and checksum.
- Final `ctx://trace` table fixture coverage is explicit before extractor implementation begins.
- Final negative probe families are explicit before graph validation smoke diagnostics are implemented.
- Each negative probe records expected diagnostic intent, expected diagnostic code family, failing condition, and source evidence notes.
- No production `src/markdowntrace/**` behavior is changed by this fixture-baseline task.
- Downstream tasks must read this inventory before accepting extraction, role-classification, or smoke-diagnostic evidence.

## Review Boundary

Reviewers should treat missing or ambiguous source paths, missing readability evidence, missing generated fixture control, missing final `ctx://trace` fixture coverage, missing final negative probes, missing diagnostic intent, or production behavior claims as blocking for `MS-1`. Reviewers should not require extractor output, graph role policy, smoke diagnostics, final recommendations, public CLI behavior, or production registry changes for BEL-1290 or BEL-1291 approval.
