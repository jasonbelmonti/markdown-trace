# Experimental graph validation

The `experimental/graph` package entry point applies external JSON rules to a
captured Trace graph and Engine source structure. The [TaskDefinition trial](../experiments/task-definition-trace/README.md)
exercises these exports through a real skill's structural validation and defect probes.

## API

From the repository root, with dependencies installed and `npm run build` complete:

```js
import { readFileSync } from "node:fs";
import {
  compileValidationProfile, analyzeDocument, validateGraph,
} from "@jasonbelmonti/markdown-trace/experimental/graph";

const value = result => {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
};
const profile = value(compileValidationProfile(
  readFileSync("experiments/task-definition-trace/profile.json", "utf8"),
));
const path = "experiments/task-definition-trace/task-definition.md";
const analysis = value(analyzeDocument(
  { documentId: path, text: readFileSync(path, "utf8") },
  profile,
  { maxSourceUtf8Bytes: 2_000_000, maxOccurrences: 50_000 },
));
const result = value(validateGraph(analysis, profile));
console.log(result.status, result.rules, result.diagnostics);
```

`compileValidationProfile(jsonText)` returns `Outcome<TraceValidationProfile>`.
The immutable profile can be passed directly to `analyzeDocument`, which returns
`Outcome<DocumentAnalysis>`. `validateGraph(analysis, profile)` returns
`Outcome<GraphValidationReport>`. Each operation uses the package's existing
`{ ok: true, value }` / `{ ok: false, error }` convention. A completed validation
can have a failing verdict inside a successful operation result.

Analysis retains its Engine document privately. It parses and normalizes once;
validation uses the captured structure and incoming/outgoing indexes. Existing
queries and `exportMermaid(analysis.snapshot)` use the same unchanged graph.
The Engine tree is not added to the serializable snapshot or public types.

Revalidate an issued analysis with any issued validation profile sharing its
interpretation hash, including analyses made using the original `compileProfile`.
Changed validation rules produce a new validation hash. Interpretation changes
require new analysis and otherwise return `profile-mismatch`. Fabricated handles
and ordinary `TraceProfile` handles used as validation profiles return `invalid-input`.
Invalid configuration returns `invalid-profile` or `unsupported-version`; analysis
limits and unavailable source ranges retain their existing operation error codes.

The original `compileProfile` and document-profile.v1 rules retain their current
compile-only behavior. Use the validation profile schema below to evaluate rules;
the two formats are not interchangeable. No legacy CLI behavior changes.

## Supported profile contract

The complete [TaskDefinition profile](../experiments/task-definition-trace/profile.json) uses
`markdown-trace.validation-profile.experimental.v1`. This is a separate schema
from `markdown-trace.document-profile.v1`; its rules must not be passed directly
to the core compiler. Interpretation vocabulary and allowed endpoint types reuse
the core compiler's checks. Unknown fields and unsupported operators fail explicitly.

Root fields are `schemaVersion`, `profileId`, `interpretation`, and `validation`.
Validation contains `minEntities`, `allowedRelations`, and `rules`. Entity prefixes
follow the existing draft2 language; the profile cannot add new Markdown syntax.

| Operator | Meaning | Operator-specific fields |
| --- | --- | --- |
| `declarations` | Count definition occurrences of the selected kinds inside each selected source target. | `kinds`, `select`, `minSelections`, `matchText`, `exclusive` |
| `references` | Count observed references of one relation inside each selected source target. | `relation`, `select`, `minSelections`, `matchText`, `exclusive` |
| `require-relation` | Count distinct resolved neighbors for each resolved entity of the selected kinds. | `kinds`, `direction` (`incoming` or `outgoing`), `relation`, `relatedKinds` |
| `entity-count` | Count resolved entities of the selected kinds. | `kinds` |

Every rule also requires `id`, `op`, `min` and `max`. Bounds are nonnegative
integers; `max: null` means unbounded. Rule IDs are unique; `builtin.*` is reserved.
An empty subject set is not evidence that a required entity exists: use
`minEntities`, `entity-count` or a source-coverage rule to require existence.

Source rules support two selector forms:

```json
{ "target": "tableCell", "section": "Validation / Evidence", "column": "Check" }
{ "target": "node", "section": "Requirements", "nodeType": "paragraph" }
```

`section` is optional and matches Engine section titles. Table selectors match
header text and select data cells in every matching table. Node selectors support
`heading`, `paragraph`, `listItem` and `blockquote`, including nested nodes.
Containment uses Engine offsets. Overlapping selected containers each receive
their own count; occurrences are not duplicated in the graph.

`minSelections` requires a minimum number of source targets, independent of links.
`exclusive: true` also rejects matching annotations outside those targets.
`matchText: true` compares each matched identifier with the entire selected target's
Engine-normalized text; it does not infer meaning from prose. It is supported for
table cells, headings and paragraphs. Engine container nodes have no direct text,
so list-item and blockquote rules must set it to false. All three options are explicit.

## Results and limits

Reports include source, analysis and profile identities, Engine version, coverage,
per-rule counts/statuses, and source-ordered diagnostics with rule IDs and ranges.
Overall status is `pass`, `fail` or `indeterminate`; `valid` is true only for `pass`.
Individual rules can also be `not-applicable` when they have no subjects to evaluate.
Partial extraction prevents an overall pass; failure findings take precedence.

Built-in checks require known, uniquely defined identities, owned references,
the configured minimum entity count, and allowed relationship endpoint types.
Malformed trace links fail validation; incomplete extraction remains visible.
Graph defects and forbidden relationships remain available to queries and export.

Completeness is limited to what the profile selects. A missing annotation in a
selected source row can be detected even if no identity was extracted. An entirely
missing row or an implied relationship in prose needs a separate structural or
semantic requirement. No rules infer unexpressed relationships or certify evidence
truth. Additional selectors/operators, installed-skill activation and production scale
guarantees remain outside this integration. Mermaid exports contain graph facts
and do not attach validation reports; present the report separately from the diagram.
