# Local file preview

## Requirements

[Selection controls the preview](ctx://trace/entity/REQ-1?role=definition): update the local preview only after the user explicitly selects a file.

## Design

- [Selection handler](ctx://trace/entity/DES-1?role=definition): load the selected file from the picker's selection handler to implement [the preview requirement](ctx://trace/entity/REQ-1?rel=implements).

## Checks

- [Selection behavior check](ctx://trace/entity/CHECK-1?role=definition): verify [the preview requirement](ctx://trace/entity/REQ-1?rel=verifies) by observing that opening the picker without selecting a file leaves the preview unchanged, then selecting a file updates it. This check is proposed and has not run against an implementation.
