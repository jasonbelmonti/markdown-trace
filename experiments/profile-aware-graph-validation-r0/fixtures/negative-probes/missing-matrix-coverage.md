---
markdownTrace:
  documentId: markdown-trace.r0.negative.missing-matrix-coverage
  title: R0 Negative Probe - Missing Matrix Coverage
  fixtureFamily: profile-aware-graph-validation-r0
r0NegativeProbe:
  workItem: BEL-1291
  validationTarget: VAL-5
  expectedDiagnosticCodeFamily: r0.graph_validation.missing_matrix_coverage
  failingCondition: OBJ-1 reaches WP-1 and EVD-1 but omits the required validation checkpoint path.
---

# R0 Negative Probe: Missing Matrix Coverage

## Expected Diagnostic Intent

| Field | Value |
| --- | --- |
| Expected diagnostic code family | `r0.graph_validation.missing_matrix_coverage` |
| Failing condition | The traceability matrix omits a required validation checkpoint for `OBJ-1` to `EVD-1` coverage. |
| Source evidence notes | The matrix row contains objective, work-package, and evidence references but leaves the validation cell empty. |
| Non-goal | Do not implement graph profile policy or required-path validation in this fixture. |

### [OBJ-1](ctx://trace/entity/exec.obj.1?type=objective): Objective with incomplete evidence path

OBJ-1 should have a path through a work package, a validation checkpoint, and an
evidence record.

### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Work package with incomplete coverage

WP-1 references [EVD-1](ctx://trace/entity/exec.evd.1) but does not connect to a
validation checkpoint in the matrix below.

### [VAL-1](ctx://trace/entity/exec.val.1?type=validation_checkpoint): Available but omitted checkpoint

VAL-1 exists in the document so the probe proves a missing matrix relation, not
a missing validation entity definition.

### [EVD-1](ctx://trace/entity/exec.evd.1?type=evidence_record): Evidence record

EVD-1 exists but lacks the required validation checkpoint edge in the matrix.

## Traceability Matrix

| Objective | Work package | Validation checkpoint | Evidence |
| --- | --- | --- | --- |
| [OBJ-1](ctx://trace/entity/exec.obj.1) | [WP-1](ctx://trace/entity/exec.wp.1) |  | [EVD-1](ctx://trace/entity/exec.evd.1) |

## Review Note

The blank validation checkpoint cell is intentional. A later smoke diagnostic
should report a missing coverage relation without promoting this matrix row into
an authoritative definition for any linked entity.
