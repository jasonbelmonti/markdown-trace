---
markdownTrace:
  documentId: markdown-trace.r0.negative.duplicate-primary-definition
  title: R0 Negative Probe - Duplicate Primary Definition
  fixtureFamily: profile-aware-graph-validation-r0
r0NegativeProbe:
  workItem: BEL-1291
  validationTarget: VAL-5
  expectedDiagnosticCodeFamily: r0.graph_validation.duplicate_primary_definition
  failingCondition: Two heading-owned primary definitions declare the same WP-1 canonical entity.
---

# R0 Negative Probe: Duplicate Primary Definition

## Expected Diagnostic Intent

| Field | Value |
| --- | --- |
| Expected diagnostic code family | `r0.graph_validation.duplicate_primary_definition` |
| Failing condition | Two heading-owned sections declare `WP-1` as `exec.wp.1`. |
| Source evidence notes | The coverage matrix repeats `WP-1` as a reference only; the duplicate failure must come from the two primary headings, not the matrix row. |
| Non-goal | Do not decide final supplemental-definition policy in this fixture. |

### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): First primary definition

This is the first primary definition for WP-1.

### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Second primary definition

This second heading intentionally repeats the same canonical entity and should
be diagnosed as a duplicate primary definition.

## Matrix Reference That Must Not Be The Duplicate Cause

| Matrix row | Referenced work package | Expected role |
| --- | --- | --- |
| Coverage row | [WP-1](ctx://trace/entity/exec.wp.1) | Reference or coverage evidence only, not a primary definition. |
