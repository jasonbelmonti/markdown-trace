# Supported profile contract

The complete [TaskDefinition profile](../examples/task-definition/profile.json) uses
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
truth. Additional selectors/operators, automatic adoption by other authoring skills and production scale
guarantees remain outside this integration. Mermaid exports contain graph facts
and do not attach validation reports; present the report separately from the diagram.
