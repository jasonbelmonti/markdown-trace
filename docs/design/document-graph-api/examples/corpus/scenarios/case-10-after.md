# {#REQ-1} Access control

Access requires an authenticated session.

{#REQ-2} Limit failed attempts.

- {#WP-1} Enforce {implements:REQ-1}.
  - Apply `REQ-2` before retrying.

> {#VAL-1} Verify {verifies:WP-1}.

| ID | Behavior | Requirement |
| --- | --- | --- |
| {#WP-2} | Record failures. | {implements:REQ-2} |

## {#REQ-3} Unrelated display

Display the status label.

```text
{#REQ-999} Example only.
```

Appended text.
