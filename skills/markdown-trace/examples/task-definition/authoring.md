# Opt-in TaskDefinition trace mapping

Use the installed task-definition skill in AUTHOR or REVISE mode. Read its
SKILL.md, structural profile and applicable reference guides first. Compose it
with [the shared markdown-trace skill](../../SKILL.md) and
explicitly select [this Trace profile](profile.json). This guide adds the domain
mapping; the shared skill owns link syntax, ownership and runtime operation.

Declare criteria in success-criterion ID cells, validation checks in Validation /
Evidence Check cells, and slices in Incremental Value Delivery Slice cells.
Use the profile's criterion, validation and slice kinds. Preserve the exact
visible TD-SC identifiers in criterion ID cells, as required by task-definition.

A check's `verifies` reference belongs in its Criterion ID cell and points to
the criterion the check actually proves. A slice's `verified-by` references
belong in its Evidence cell and point to checks that prove the slice's value.
Keep evidence descriptions readable. Shared checks may serve multiple slices;
the profile enforces annotation counts, coverage, label agreement and required
connections. It cannot decide whether the evidence actually proves the claim.

After authoring, run task-definition's Engine 3.6.0 structural check, followed by
the shared command through the installed skill helper (SKILL_DIR is its absolute directory):

```sh
node "$SKILL_DIR/scripts/run.mjs" --file /absolute/path/task.md --profile "$SKILL_DIR/examples/task-definition/profile.json"
```

Repair located failures within task-definition's three-draft limit, rerun both
checks, then complete its semantic and post-draft gates before READY. Trace alone
does not establish readiness.

The installed task-definition skill is unchanged. For this opt-in composition,
supply this guide alongside it; the guide explicitly selects the shared skill
and domain profile. Convention changes must reconcile this mapping with the
profile while keeping generic protocol guidance in the shared skill.
