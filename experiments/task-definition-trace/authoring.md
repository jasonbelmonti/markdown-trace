# Opt-in TaskDefinition trace trial

Use the installed task-definition skill in AUTHOR or REVISE mode. Read its
SKILL.md, structural profile and applicable reference guides first. This
supplement adds annotation requirements for this local trial; it does not
replace the skill's structure, semantic review or readiness rules.

Author the links with the task, using the existing draft2 Markdown convention:

- Each success-criterion ID cell declares its criterion with a link whose
  visible label remains the exact TD-SC identifier.
- Each Validation / Evidence Check cell declares one VAL identity.
- That row's Criterion ID cell links to its displayed criterion with rel=verifies.
- Each Incremental Value Delivery Slice cell declares one SLICE identity.
- Its Evidence cell links to the validation checks that prove the slice,
  using rel=verified-by. Keep the evidence descriptions readable.
- Every validation must be referenced by at least one slice, every slice must
  reference at least one validation, and every criterion must be verified.
  Shared validation checks may serve multiple slices.

Use ctx://trace/entity/ID?role=definition for declarations and
ctx://trace/entity/ID?rel=RELATION for relationships. Assign stable identifiers;
do not reuse an identifier for two declarations. These three entity kinds and
two relation kinds are the complete trial vocabulary. Avoid bare identifiers
elsewhere in the task: Trace interprets them as additional generic references.

After authoring, run the installed skill's Engine 3.6.0 structural profile and
this trial's checker. Repair located failures within the skill's three-draft
limit. Rerun both checks after repair, then perform the skill's semantic and
post-draft review gates before READY. Machine validation alone is insufficient.

The source row inventory is independent of trace links. A missing identity is
an error even when no graph node was extracted for that row. A link to a
different criterion than its displayed ID is an error even when both criteria
exist. The checker never invents relationships or edits the task.

The external [profile.json](profile.json) now specifies these annotation locations,
counts, label agreement and required relationships. The trial command accepts
`--profile` to select another profile; the shared validator contains no
TaskDefinition section names or vocabulary. Changing the annotation convention
requires changing the profile and the author's guidance together.

The trial uses the packaged experimental API. The installed skill is unchanged;
activation in installed skills remains follow-up work.
