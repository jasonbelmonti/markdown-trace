# R3 EVD-2B: Stable Migration Report Examples

Evidence ID: `R3-EVD-2B`
Validation checkpoint: `VAL-2`
Work package: `R3-2B`
Related issue: `BEL-1234`
Status: Complete stable report examples with local validation passing on 2026-05-30

## Objective

Show stable reviewer-facing migration comparison report output for equivalent, intentional, and blocking results. The examples let reviewers inspect the comparison status and each delta's path, expected value, actual value, and rationale without manually diffing YAML.

## Authority Boundary

These examples render existing migration comparison report data. They do not run migration check orchestration, change classification semantics, approve generated sidecar authority, remove YAML support, or approve a source-authority flip.

Generated sidecars remain non-human-editable checked artifacts. Hand-authored YAML remains supported during the migration window until a later separately approved authority decision.

## Report Contract

| Report field | Reviewer use |
| --- | --- |
| Document, manual registry, generated sidecar | Identify the compared inputs without relying on local command context. |
| Exit code and dimension summary | Show whether the comparison has blocking drift. |
| Dimension status | Show whether each dimension is `equivalent`, `intentional`, or `blocking`. |
| Delta path | Provide a stable normalized location for each difference. |
| Expected value and actual value | Show manual-side and generated-side values using deterministic value text. |
| Rationale | Explain why intentional drift is accepted or blocking drift rejects approval. |

## Equivalent Output Example

```markdown
# Migration Comparison Report

## Inputs

| Field | Value |
| --- | --- |
| Document | `fixtures/migration-test.md` |
| Manual registry | `fixtures/manual.yaml` |
| Generated sidecar | `fixtures/generated.yaml` |

## Result

| Field | Value |
| --- | ---: |
| Exit code | `0` |
| Equivalent dimensions | `4` |
| Intentional dimensions | `0` |
| Blocking dimensions | `0` |

## Dimensions

| Dimension | Status | Deltas |
| --- | --- | ---: |
| `registry` | `equivalent` | `0` |
| `graph` | `equivalent` | `0` |
| `metadata` | `equivalent` | `0` |
| `validation` | `equivalent` | `0` |

## Delta Details

### Registry

Status: `equivalent`

No deltas.
```

## Intentional Output Example

```markdown
### Metadata

Status: `intentional`

| Status | Path | Expected | Actual | Rationale |
| --- | --- | --- | --- | --- |
| `intentional` | `generated.humanEditable` | `<missing>` | `false` | Manual YAML has no generated metadata while the sidecar remains checked evidence. |
```

## Blocking Output Example

```markdown
### Validation

Status: `blocking`

| Status | Path | Expected | Actual | Rationale |
| --- | --- | --- | --- | --- |
| `blocking` | `exitCode` | `0` | `1` | Manual and generated validation entries differ; unexplained drift blocks parity approval. |
```

## Review Notes

- Equivalent dimensions render with status and an explicit no-delta statement.
- Intentional dimensions render every accepted delta with a non-empty rationale.
- Blocking dimensions render every unsafe delta with the normalized path and failing values.
- Table cells escape Markdown table separators so values and rationales remain inspectable.

## Validation Status

| Check | Result |
| --- | --- |
| Focused renderer tests | Passed: `npm test -- tests/test_migration_report.test.ts`; 1 test file and 3 tests passed. |
| TypeScript typecheck | Passed: `npm run typecheck` exited `0`. |
| Full test suite | Passed: `npm test`; 14 test files and 121 tests passed. |
| Build | Passed: `npm run build` exited `0`. |
| R0 YAML compatibility | Passed: `npm run validate:fixture` exited `0`; report status `PASS` and findings `0`. |
| R0 derive compatibility | Passed: `npm run derive:fixture` exited `0`; output began with `diagnostics: []`. |
| Diff hygiene | Passed: `git diff --check` exited `0`. |
