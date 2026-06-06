---
markdownTrace:
  documentId: markdown-trace.r0.fixture.ctx-table-trace
  title: R0 ctx Trace Table Fixture
  fixtureFamily: profile-aware-graph-validation-r0
  sourceDocs:
    - docs/markdown-trace-profile-aware-graph-validation-r0-execution.md
    - docs/design/markdown-trace-profile-aware-graph-validation-design-process.md
r0Fixture:
  workItem: BEL-1291
  validationTarget: VAL-3
  expectedBehavior:
    - heading-defined ctx links remain authoritative definitions
    - heading-defined entities may be referenced from prose and table cells
    - table-only ctx links with type parameters remain trace evidence candidates
    - table-only ctx links must not become authoritative registry entities
---

# R0 ctx Trace Table Fixture

## Fixture Intent

This fixture is controlled R0 input for `VAL-3`. It does not claim production
behavior and must not be used to promote table-only facts into authoritative
registry entities.

| Case | Source shape | Expected role |
| --- | --- | --- |
| Heading-defined prose reference | A heading-defined work package references a heading-defined validation checkpoint in prose. | Compatible `ctx://trace` reference anchored to the heading definition. |
| Heading-defined table reference | A table cell references the same heading-defined validation checkpoint. | Compatible table-cell reference, not a new definition. |
| Table-only definition candidate | A table cell contains a `ctx://trace/entity/...?...type=` link with no owning heading. | Trace evidence candidate only; not an authoritative registry entity. |
| Mixed prose and table reference | The same entity is referenced in body prose and in a table row. | Source contexts remain distinguishable for later extraction evidence. |

### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Heading-owned table references

WP-1 proves that a heading-defined entity can reference
[VAL-1](ctx://trace/entity/exec.val.1) in prose and repeat the same reference in
a table cell without changing source authority.

| Evidence row | Linked target | Expected role |
| --- | --- | --- |
| Prose-compatible checkpoint | [VAL-1](ctx://trace/entity/exec.val.1) | Table-cell reference to a heading-defined validation checkpoint. |
| Range-compatible checkpoint | [VAL-1 through VAL-2](ctx://trace/range/VAL-1/VAL-2) | Table-cell range reference whose endpoints are heading-defined below. |
| Mixed reference context | [VAL-2](ctx://trace/entity/exec.val.2) | Table-cell reference that is also mentioned from prose in the next section. |

WP-1 also records [VAL-2](ctx://trace/entity/exec.val.2) in prose so the same
heading-defined entity is referenced from both prose and table contexts.

### [VAL-1](ctx://trace/entity/exec.val.1?type=validation_checkpoint): Heading-defined validation checkpoint

VAL-1 is a heading-owned checkpoint. It is referenced from both prose and the
WP-1 table above.

### [VAL-2](ctx://trace/entity/exec.val.2?type=validation_checkpoint): Second heading-defined checkpoint

VAL-2 closes the valid range used by WP-1. VAL-2 is also referenced from table
and prose contexts so downstream extraction can report both source locations.

## Table-Only Non-Authoritative Candidates

The links in this table intentionally include `type=` parameters while appearing
only inside table cells. They are candidates for R0 trace evidence and must not
be treated as authoritative registry definitions by current or future
production `derive` behavior.

| Table-only candidate | Why it exists | Expected role |
| --- | --- | --- |
| [OBJ-99](ctx://trace/entity/exec.obj.99?type=objective) | Looks like an objective definition but has no heading-owned definition. | Non-authoritative trace evidence candidate. |
| [EVD-99](ctx://trace/entity/exec.evd.99?type=evidence_record) | Looks like an evidence record definition inside a matrix row. | Non-authoritative trace evidence candidate. |
| [VAL-99](ctx://trace/entity/exec.val.99?type=validation_checkpoint) | Looks like a validation checkpoint definition inside a table cell. | Non-authoritative trace evidence candidate. |

## Review Notes

- Current authoritative registry behavior is not expected to register OBJ-99,
  EVD-99, or VAL-99 from this table.
- Later R0 extractor evidence should report source context and candidate status
  for table-only links.
- Later compatibility evidence must confirm this fixture does not require
  production source mutation or table-derived registry authority.
