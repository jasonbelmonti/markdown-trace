# Profile-Aware Graph Validation R0 Source Fixture Inventory

## Document Control

| Field | Value |
| --- | --- |
| Work item | `BEL-1290` |
| R0 work package | `WP-1` controlled fixture baseline |
| Milestone gate | `MS-1 Fixture Baseline` |
| Status | Ready for `MS-1` review |
| Created at | `2026-06-06T12:26:01Z` |
| Owner | Codex |

## Purpose

This inventory records the controlled source fixture baseline for the Markdown Trace profile-aware graph validation R0. It is fixture-control evidence only: it does not implement extraction, classify graph roles, run graph validation diagnostics, mutate source Markdown, or claim production Markdown Trace behavior.

## Source Fixture Inventory

| Fixture family | Source or planned artifact | Control decision | Current evidence | MS-1 approval impact |
| --- | --- | --- | --- | --- |
| Real table-first execution spec | `/Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md` | Use as a read-only sibling source fixture. Do not copy or mutate the source for `WP-1`. | Readable at inventory time; 994 lines; SHA-256 `3dce15b7ca9c50f1829984c1dd829908a6aa76fdf012371f622ec789a756894f`. | Blocking: downstream extraction work must not proceed if this source becomes unreadable or the path changes without an updated control decision. |
| Generated design-spec demo | `docs/evidence/generated-design-spec-demo.md` | Use the committed repository file as the controlled generated design-spec fixture for `VAL-2` calibration. Regeneration is not required for `WP-1` because the committed path and checksum are recorded. | Present in this repository; 305 lines; SHA-256 `0b6c209d3a48bdabd12e8dded19e5a174f01a0fa7c17c1178a29d9a1a7c9cf24`. | Blocking: `VAL-2` evidence may cite this fixture only when the path and checksum remain controlled or a later task records deterministic regeneration evidence. |
| `ctx://trace` table behavior fixture | Planned under `experiments/profile-aware-graph-validation-r0/fixtures/ctx-table-trace-fixture.md` | Defer fixture authoring to downstream R0 fixture implementation; this baseline fixes the expected fixture purpose before extraction work. | Planned fixture must cover heading-defined table references that remain compatible and table-only `ctx://trace` definitions that stay non-authoritative evidence candidates. | Blocking for later `VAL-3`, non-blocking for BEL-1290 once the planned coverage is explicit. |
| Negative graph validation probes | Planned under `experiments/profile-aware-graph-validation-r0/fixtures/negative-probes/` | Defer probe file authoring and diagnostic execution to downstream R0 tasks; this baseline fixes the planned probe set. | Planned probes must cover dangling reference, duplicate primary definition, invalid range endpoint, and missing matrix coverage. | Blocking for later `VAL-5`, non-blocking for BEL-1290 once the planned probe families are explicit. |

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

## Planned `ctx://trace` Fixture Coverage

| Planned case | Purpose | Required future evidence |
| --- | --- | --- |
| Heading-defined table reference | Prove existing heading-owned body/table references remain compatible with current Markdown Trace behavior. | Later `VAL-3` evidence records current compatibility output and confirms no source mutation. |
| Table-only `ctx://trace` definition candidate | Prove table-only definitions are treated as R0 trace-evidence candidates, not authoritative registry entities. | Later extractor evidence records candidate status without changing production `derive`. |
| Mixed prose and table reference | Prove fixture coverage includes both body prose and table-cell references to the same ID family. | Later extraction summary identifies source contexts and ranges. |

## Planned Negative Probe Families

| Probe family | Intended failure shape | Required future evidence |
| --- | --- | --- |
| Dangling reference | A fixture references an ID that has no primary or allowed supplemental definition. | Later smoke diagnostics include stable diagnostic code and source location. |
| Duplicate primary definition | A fixture repeats a primary-definition ID where profile policy does not allow it. | Later smoke diagnostics distinguish duplicate primary definitions from allowed coverage rows. |
| Invalid range endpoint | A fixture uses a range whose start or end ID cannot be resolved within a discovered family. | Later smoke diagnostics identify the missing endpoint and the source range. |
| Missing matrix coverage | A fixture omits a required source-to-validation or objective-to-evidence path. | Later smoke diagnostics identify the missing coverage relation without promoting matrix rows to primary definitions. |

## MS-1 Approval Prerequisites

- Real execution-spec source path is explicit, read-only, readable, and checksum-recorded.
- Generated design-spec demo fixture is controlled by committed repository path and checksum.
- Planned `ctx://trace` table fixture coverage is explicit before extractor implementation begins.
- Planned negative probe families are explicit before graph validation smoke diagnostics are implemented.
- No production `src/markdowntrace/**` behavior is changed by this fixture-baseline task.
- Downstream tasks must read this inventory before accepting extraction, role-classification, or smoke-diagnostic evidence.

## Review Boundary

Reviewers should treat missing or ambiguous source paths, missing readability evidence, missing generated fixture control, missing planned `ctx://trace` fixture coverage, missing planned negative probes, or production behavior claims as blocking for `MS-1`. Reviewers should not require extractor output, graph role policy, smoke diagnostics, final recommendations, public CLI behavior, or production registry changes for BEL-1290 approval.
