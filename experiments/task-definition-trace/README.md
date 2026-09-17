# TaskDefinition annotation trial

This opt-in trial uses an [external profile](profile.json) and the reusable
[experimental validation API](../../docs/experimental-graph-validation.md) to check
annotations and required relationships. Read [the authored task](task-definition.md)
and verify [its checksum](task-definition.sha256) before relying on the completion
boundary. The task describes this proof, using the installed task-definition skill
and [this supplement](authoring.md).

## Run

From a checkout with Node dependencies installed and the graph built:

```sh
npm ci
npm run build
node experiments/task-definition-trace/run.mjs \
  --profile experiments/task-definition-trace/profile.json \
  --out experiments/task-definition-trace/output/valid
node experiments/task-definition-trace/verify.mjs
shasum -a 256 -c experiments/task-definition-trace/task-definition.sha256
```

Check another task authored with the same convention:

```sh
node experiments/task-definition-trace/run.mjs /absolute/path/task.md \
  --profile experiments/task-definition-trace/profile.json \
  --out /tmp/task-trace-output
```

The command runs the installed task-definition structural profile via Engine CLI
3.6.0, then applies the selected trace profile. It exits 0 on machine-validation
success, 1 on failure or indeterminate validation, and 2 on runtime/configuration failure.
It prints JSON with gate results and located diagnostics, preserving the input.
Optional MARKDOWN_ENGINE_BIN and TASK_DEFINITION_SKILL_DIR environment variables
select other local installations; the structural engine must still be 3.6.0.

The output directory contains report.json, graph.json and graph.mmd. Invalid
graphs remain inspectable when structural validation passes. When structure
fails, graph.json is null and graph.mmd explains why no graph was generated.
The Mermaid metadata still says core policy is not evaluated; report.json
separately records the experimental validator's actual rule results.

## Scope and ownership

- Engine 3.6.0 runs the existing skill's structural profile, including criterion
  and evidence ID coverage. Its semantic/readiness gates remain the author's job.
- Engine 3.5.0, already installed by Trace, supplies structural queries and ranges.
  The validator joins selected source targets to the existing graph occurrences;
  it does not parse Markdown syntax or decode Trace URIs itself.
- Trace supplies identities, ownership and references through its graph API.
  The captured analysis remains usable with existing backlink queries and export.
- profile.json supplies vocabulary, allowed endpoint kinds, source selectors,
  annotation counts, text agreement, and required incoming/outgoing connections.
  Its versioned experimental schema is separate from the core profile schema.

The TaskDefinition profile selects every matching data cell in its named sections.
All selected rows require their configured annotations; a wholly unannotated row
remains visible to the source selector. Shared validation checks may serve multiple
slices. The adapter still requires TaskDefinition structure; use the reusable API
for other layouts. No check certifies implied prose relationships, evidence truth
or semantic readiness. The package exports compileValidationProfile and validateGraph. The installed
skill remains unchanged.

Analysis parses and normalizes once, retaining Engine structure privately. Repeated
validation reuses that capture and graph indexes; the trial has no separate parser
or validator implementation. The package returns typed Outcome results, unwrapped
by the thin command adapter.

## Reproducible observations

verify.mjs invokes the actual command for the valid task and four isolated defects:
a missing declaration, missing slice link, wrong criterion destination, and wholly
unannotated check. Each defect must pass the original structural profile, fail the
trace checks at the affected row, and pass again when repaired.

The valid task has seven identities and six relationships. The check named
VAL-2 has an incoming verified-by reference from SLICE-1. Exact identities and
edges are independently listed in the proof, and input preservation is checked.

The profile proof also checks:

- One captured missing-link graph fails under the strict profile and passes when
  the slice requirement's minimum becomes zero. Validation hashes differ, graph
  bytes remain identical, and repeating validation returns the same report.
- Changing a selector causes a located coverage failure. Renamed sections and
  columns work when the profile changes with them.
- A second vocabulary works in headings and paragraphs, list items and blockquotes.
  Removing its prose reference fails validation.
- Unsupported configuration and interpretation mismatches are rejected. An
  unsupported source construct produces an indeterminate result rather than success.

After running verify.mjs, compare the strict and relaxed CLI runs yourself:

```sh
node experiments/task-definition-trace/run.mjs \
  experiments/task-definition-trace/output/missing-slice-link/task.md \
  --profile experiments/task-definition-trace/profile.json
node experiments/task-definition-trace/run.mjs \
  experiments/task-definition-trace/output/missing-slice-link/task.md \
  --profile experiments/task-definition-trace/output/relaxed-profile.json
```

The first exits 1; the second exits 0. The missing connection remains absent in
both graphs: relaxing policy changes what is required, not what the document says.

output/verification.json records observed results, source/checker/profile hashes,
dependency lockfile, built graph runtime fingerprint and engine versions.
Output is ignored by Git. Rerun after relevant input changes; these observations
do not promote another task to READY or prove its implementation completed.
