# Preview design annotation example

Compose [the shared Trace skill](../../SKILL.md) with
[this profile](profile.json) when authoring the accompanying design note.
This guide owns the example's domain meanings; the profile owns the exact
annotation locations and counts.

The product requirement is that a local preview updates only after a user
explicitly selects a file. The selected design loads the file from the selection
handler. The proposed check observes that opening the picker without selecting
a file leaves the preview unchanged, then selecting a file updates it.

Describe requirements as paragraphs under Requirements, approaches as list items
under Design, and proposed checks as list items under Checks. Declare each item
using the profile's requirement, design or check kind. `implements` means the
design realizes the linked requirement; `verifies` means the proposed check can
distinguish compliance from a violation. A proposed check is not evidence that
the implementation exists or the check has run.

Use the generic command documented in the
[validation guide](../../SKILL.md#validate-and-inspect).
This document has no separate structural validator. Review its prose and the
relevance of each connection after Trace validation. A passing example does not
establish that another design's requirements are complete.
