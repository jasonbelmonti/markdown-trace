# Author a Trace validation profile

Use this workflow when creating or revising a document-owned Trace profile.
Read the [supported profile contract](../../../docs/experimental-graph-validation.md#supported-profile-contract)
for exact fields and operators. Profiles configure the existing runtime; they do
not introduce Markdown syntax or custom parsing code.

## Establish the document convention

Read the document owner's requirements, a representative document, and any
existing profile or annotation guide. Identify:

- Entity kinds and their ID prefixes, preserving established identifiers.
- Relationship names, their meanings, and permitted source/target kinds.
- Which connections are required, in which direction, and how many.
- Which source units must declare entities or contain references, including
  units whose annotations are currently missing.

Derive these choices from the document convention. When the request includes
designing that convention, propose explicit choices and explain them. Ask about
unresolved policy that materially changes validity; do not infer policy merely
from whatever makes the sample pass.

Reuse an existing suitable profile. For a new one, adapt the complete
[paragraph/list example](../../../examples/preview-design/profile.json) or
[table example](../../../experiments/task-definition-trace/profile.json), reading
the accompanying [preview guide](../../../examples/preview-design/authoring.md)
or [TaskDefinition guide](../../../experiments/task-definition-trace/authoring.md).
Replace their domain vocabulary and requirements; example counts and layouts
are not universal defaults. Use `markdown-trace.validation-profile.experimental.v1`
with `markdown-trace.identity.draft2`, a meaningful `profileId`, and unique rule IDs.

## Encode the intended checks

Map prefixes in `interpretation.entityKinds`. Put permitted endpoint combinations
in `validation.allowedRelations`. Generic mentions use the relation `references`;
permit them only where they fit the convention. Permission does not establish
that a relationship exists: add an appropriate rule for each required connection.

| Intended requirement | Existing mechanism |
| --- | --- |
| Each selected source unit declares an identity | `declarations` with a source selector and occurrence bounds |
| Each selected field or unit contains the required reference | `references` with a source selector and occurrence bounds |
| Every resolved entity has required connections | `require-relation` with direction, relation, related kinds and distinct-neighbor bounds |
| A kind must exist even when no entity of that kind was extracted | `entity-count`; `minEntities` supplies a document-wide floor |

For example, allowing `check -> requirement` via `verifies` does not require any
check to exist. An outgoing `require-relation` rule on checks requires each check
to verify a requirement. An incoming rule on requirements requires each requirement
to have a check. Repeated links to one check still count as one distinct neighbor.
Use only the directions and counts the convention actually requires.

Source coverage must select Markdown structure independently of Trace links.
Select a table column or supported node type, optionally within an Engine section
title. Set `minSelections` when that source region must exist; otherwise an empty
selection can conceal a missing or misspelled region. `min`/`max` apply separately
to each selected unit. Nested or overlapping containers each receive a count, so
choose the unit that matches the author's convention.

Set `exclusive` only when matching annotations must occur solely in those targets.
Use `matchText` only when the entire normalized target text must equal its matched
identifier, such as a dedicated ID cell. Set it to false for prose labels and for
`listItem`/`blockquote` containers. These options must be explicit. A graph-only
rule cannot detect an undeclared source unit that never became an entity.

If a requirement cannot be expressed with the supported selectors and four
operators, identify that limitation and leave the check with the owner's
structural or semantic review. Do not approximate it with an unrelated rule or
silently claim coverage. Trace does not infer missing prose or prove that a
relationship is semantically justified.

## Prove the profile against documents

Use the shared command from a built checkout (or its installed equivalent):

```sh
node dist/markdowntrace/document-graph/cli.js --file document.md --profile profile.json
node dist/markdowntrace/document-graph/cli.js --file document.md --profile profile.json --format graph
```

The command compiles the profile before analysis. Exit 2 and an `invalid-profile`
or `unsupported-version` error are configuration failures, not evidence that a
document rule caught a defect. Use `compileValidationProfile(jsonText)` from the
existing API if a compile-only check is useful.

Check one representative valid document: expect exit 0, the intended identities
and edges, and meaningful per-rule selection/evaluation counts. A required rule
that selects nothing or is `not-applicable` has not demonstrated its promise.

Then use disposable copies to exercise materially different promises of the
new or changed policy. Remove a declaration link while keeping its readable
text/source unit to test annotation coverage; remove a required relationship
while keeping its entities to test connection requirements. Where applicable,
use an existing target of a forbidden kind to test endpoint restrictions, or
remove/rename a required source region to test `minSelections`. Choose the small
set that distinguishes correct rules from plausible ineffective ones; do not
enumerate parsing permutations.

For each defect, require exit 1 and the intended rule/built-in diagnostic at the
expected source location when one exists. An unrelated dangling-reference error
alone does not prove a coverage or cardinality rule works. Restore the altered
input and confirm it passes again. Preserve real source documents, keep the
profile fixed during document probes, and rerun affected proofs after edits.

For profile revisions, explain the policy change and retain representative
previously valid documents as regression checks. Do not weaken rules to repair
annotations. Run the document owner's applicable structural and semantic gates;
report unavailable checks rather than claiming them passed.

## Hand off the result

Deliver the profile with a short explanation of its domain meanings, expected
annotation locations, and the command using explicit document/profile paths.
Record which valid/defect/repair checks ran, their rule IDs and results, and the
input/runtime identities from the reports so the evidence can be reproduced.
State the remaining coverage limits. Profile authoring does not automatically
change another skill's selected profile or establish document readiness.
