---
markdownTrace:
  documentId: markdown-trace.r0.negative.invalid-range-endpoint
  title: R0 Negative Probe - Invalid Range Endpoint
  fixtureFamily: profile-aware-graph-validation-r0
r0NegativeProbe:
  workItem: BEL-1291
  validationTarget: VAL-5
  expectedDiagnosticCodeFamily: r0.graph_validation.invalid_range_endpoint
  failingCondition: WP-1 declares a VAL-1 through VAL-4 range while VAL-4 is undefined.
---

# R0 Negative Probe: Invalid Range Endpoint

## Expected Diagnostic Intent

| Field | Value |
| --- | --- |
| Expected diagnostic code family | `r0.graph_validation.invalid_range_endpoint` |
| Failing condition | The range `VAL-1 through VAL-4` has a defined start endpoint and an undefined end endpoint. |
| Source evidence notes | The invalid range appears in prose and in a table cell so later diagnostics can report source range evidence. |
| Non-goal | Do not implement range expansion or repair behavior in this fixture. |

### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Declares an invalid range

WP-1 claims coverage for
[VAL-1 through VAL-4](ctx://trace/range/VAL-1/VAL-4), but VAL-4 is not defined.

| Work package | Claimed range | Expected probe result |
| --- | --- | --- |
| [WP-1](ctx://trace/entity/exec.wp.1) | [VAL-1 through VAL-4](ctx://trace/range/VAL-1/VAL-4) | Emit invalid range endpoint diagnostic for missing `VAL-4`. |

### [VAL-1](ctx://trace/entity/exec.val.1?type=validation_checkpoint): Defined range start

VAL-1 exists so the probe isolates the missing end endpoint.

### [VAL-2](ctx://trace/entity/exec.val.2?type=validation_checkpoint): Interior checkpoint

VAL-2 exists to make the invalid endpoint more specific than an empty family.
