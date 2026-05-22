---
markdownTrace:
  documentId: markdown-trace.r1.fixture.syntax-breadth
  title: R1 Link-Backed Syntax Breadth Fixture
  fixtureFamily: r1-link-backed-entity-syntax
  sourceDocs:
    - docs/markdown-trace-r1-link-backed-entity-syntax.md
---

# R1 Link-Backed Syntax Breadth Fixture

### [CON-2]: Reference-style constraint

CON-2 is defined with a reference-style heading link.

### [VAL-1](ctx://trace/entity/exec.val.1?type=validation_checkpoint): First checkpoint

VAL-1 starts the author-facing range.

### [VAL-2](ctx://trace/entity/exec.val.2?type=validation_checkpoint): Second checkpoint

VAL-2 closes the author-facing range.

### [WP-2]: Reference-style work package

WP-2 depends on [CON-2] and covers [VAL-1 through VAL-2](ctx://trace/range/VAL-1/VAL-2).

WP-2 also records repeated type mismatch evidence through [CON-2 as work package](ctx://trace/entity/exec.con.2?type=work_package).

Plain issue key BEL-858 is prose only and is not a Markdown Trace entity fact.

### [MS-1](ctx://trace/entity/exec.ms.1): Missing type evidence

MS-1 intentionally omits `type` so validation can reject the definition later.

[CON-2]: ctx://trace/entity/exec.con.2?type=constraint
[WP-2]: ctx://trace/entity/exec.wp.2?type=work_package
