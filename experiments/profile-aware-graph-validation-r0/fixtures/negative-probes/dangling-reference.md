---
markdownTrace:
  documentId: markdown-trace.r0.negative.dangling-reference
  title: R0 Negative Probe - Dangling Reference
  fixtureFamily: profile-aware-graph-validation-r0
r0NegativeProbe:
  workItem: BEL-1291
  validationTarget: VAL-5
  expectedDiagnosticCodeFamily: r0.graph_validation.unresolved_reference
  failingCondition: WP-1 references VAL-99, which has no primary definition or allowed supplemental definition.
---

# R0 Negative Probe: Dangling Reference

## Expected Diagnostic Intent

| Field | Value |
| --- | --- |
| Expected diagnostic code family | `r0.graph_validation.unresolved_reference` |
| Failing condition | `WP-1` references `VAL-99`, but no heading-owned primary definition or allowed supplemental definition exists for `VAL-99`. |
| Source evidence notes | The unresolved reference appears once in prose and once in a matrix cell so smoke diagnostics must identify a real source occurrence. |
| Non-goal | Do not implement reference resolution in this fixture. |

### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): References a missing checkpoint

WP-1 claims coverage by [VAL-99](ctx://trace/entity/exec.val.99), but this file
does not define VAL-99.

| Work package | Claimed validation | Expected probe result |
| --- | --- | --- |
| [WP-1](ctx://trace/entity/exec.wp.1) | [VAL-99](ctx://trace/entity/exec.val.99) | Emit unresolved reference diagnostic for `VAL-99`. |
