# [REQ-1](ctx://trace/entity/REQ-1?role=definition) Access control

Access requires an authenticated session.

[REQ-2](ctx://trace/entity/REQ-2?role=definition) Limit failed attempts.

- [WP-1](ctx://trace/entity/WP-1?role=definition) Enforce [REQ-1](ctx://trace/entity/REQ-1?rel=implements).
  - Apply `REQ-2` before retrying.

> [VAL-1](ctx://trace/entity/VAL-1?role=definition) Verify [WP-1](ctx://trace/entity/WP-1?rel=verifies).

| ID | Behavior | Requirement |
| --- | --- | --- |
| [WP-2](ctx://trace/entity/WP-2?role=definition) | Record failures. | [REQ-2](ctx://trace/entity/REQ-2?rel=implements) |

## [REQ-3](ctx://trace/entity/REQ-3?role=definition) Unrelated display

Display the status label.

```text
[REQ-999](ctx://trace/entity/REQ-999?role=definition) Example only.
```
