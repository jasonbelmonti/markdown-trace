# API proving cases

These are independently authored expectations for the candidate language in the [interface packet](../../markdown-trace-document-graph-interfaces.md). They are not outputs from a graph extractor. The API runtime does not exist yet.

The [mixed-layout source](mixed-layout.md) has six identifiers, ten occurrences and four relationships under the [example profile](profile.ts). [expectations.json](expectations.json) supplies every occurrence's exact range, owner/edge associations, owned fragments, required supporting context, query answers and explicit exclusions. Ledger IDs such as O1/R1/F1 are aliases; implementations choose their own deterministic IDs. Compact predecessor entries identify a ledger relationship, not an alternative public DTO shape.

The [source inventory](source-inventory.json) records a substantial repository-owned design spec for the later complete corpus. Its historical content is fixture material, not current direction. It has not been adapted or fully annotated. The [materialized corpus](corpus/README.md) supplies the complete language/scenario input inventory and independent source annotations. Full API-result expansion remains EP-ACT-3; the corpus does not by itself complete the parent task.

| Case | Concrete input/query | Independently expected result | Contract/validation |
| --- | --- | --- | --- |
| CASE-1 | Source below with a forward requirement reference | Two resolved records, three occurrences, one implements edge from WP-1 to REQ-1; target definition found after collection | C-1, C-3; VAL-1 |
| CASE-2 | Remove line 5 from mixed-layout.md | REQ-2 has missing definition; R2 and R4 remain. Incoming REQ-2 returns WP-1 and WP-2 evidence; integrity fails. WP-2's required resolved target count is zero. Coverage remains complete. | C-1, C-4, C-5; VAL-3 |
| CASE-2D | Append a second paragraph declaration of REQ-1 to the mixed-layout source | REQ-1 has duplicate state containing both declaration IDs; R1 remains. Lookup returns both definitions; validation fails; using REQ-1 as traversal root returns unresolved-root. | C-1, C-4, C-5; VAL-3 |
| CASE-3 | Prepend "See REQ-1." and a blank line before the first heading | One additional unowned reference appears before R1 in incoming REQ-1; coverage is partial and ownership integrity fails. No invented source identifier. | C-1, C-3, C-5; VAL-1, VAL-3 |
| CASE-3A | Paragraph source: "{#WP-1} {#WP-2} {implements:REQ-1}." followed by a separate REQ-1 declaration | Both work declarations retained; relationship source is ambiguous with both declaration occurrence IDs. No first-wins owner. Incoming REQ-1 exposes ambiguity; validation fails. | C-1, C-3, C-5; VAL-1, VAL-3 |
| CASE-4 | Revalidate the unchanged mixed-layout analysis with allowedRelations empty and rules empty, preserving minEntities and interpretation | Four observed relationships remain identical; all four fail allowed-relation policy. Direct queries and traversal give the same graph facts. | C-2, C-4, C-5, C-6; VAL-2, VAL-3, VAL-4 |
| CASE-5 | Analyze empty text with the example profile | No facts; coverage complete. minEntities and work-exists fail. work-has-requirement is not-applicable with zero selected/evaluated work subjects. | C-2, C-4; VAL-2, VAL-3 |
| CASE-5A | Empty text, minEntities 0 and rules empty | Explicitly permitted empty graph passes; report records the zero subject counts. | C-2, C-4; VAL-2, VAL-3 |
| CASE-6 | Change a rule op to "arbitrary-query", or supply graph-profile.v1 as schemaVersion | Profile compilation fails without a handle; unsupported configuration cannot be silently skipped | C-2, C-8; VAL-2, VAL-7 |
| CASE-7 | Change only validation, as in CASE-4 | interpretationHash and analysisId stay the same; validationHash changes. Snapshot bytes/facts remain unchanged. | C-2, C-4; VAL-2 |
| CASE-8 | Change the WP prefix assignment to another entity kind, then call validateGraph on the existing analysis | profile-mismatch; caller must reanalyze before validating with the changed interpretation | C-2, C-4; VAL-2 |
| CASE-9 | Add another identifier-only REQ-2 mention in the nested WP-1 list item; incoming query limit 1 | Each distinct appearance remains a separate reference/relationship. Pages have exact totalMatches and progressing nextOffset. Traversal selects REQ-2 once. | C-5, C-6; VAL-4 |
| CASE-9D | Original mixed source; WP-1 outgoing traversal, maxDepth 0, maxNodes 20 | Only WP-1; depthLimited true, nodeLimited false, unresolvedRelationships 0 | C-6; VAL-4 |
| CASE-9N | Original mixed source; WP-1 outgoing traversal, maxDepth 1, maxNodes 2 | WP-1 then REQ-1; nodeLimited true; REQ-2 is outside the node budget; no silent unlimited traversal | C-6; VAL-4 |
| CASE-9C | Hand graph A->B, B->A and A->A, all endpoints resolved; root A, both directions, depth 3, nodes 10 | A then B once; B has one canonical predecessor; all direct occurrences still queryable. No all-path expansion. These are symbolic graph vertices, not proposed lexical identifier forms. | C-5, C-6; VAL-4 |
| CASE-10 | Create a selection, append text to source and reanalyze, then use old selection with new analysis | stale-selection; current text is never sliced with old offsets | C-6, C-7; VAL-5, VAL-6 |
| CASE-11 | Original mixed source; WP-1 outgoing depth 1, context budget 1000 UTF-8 bytes and 10 fragments | Nodes WP-1, REQ-1, REQ-2. Context parts F1, F2, F3, F4 in source order; 169 text bytes. Exclude VAL-1, WP-2, REQ-3, the example code, and the unneeded table header. | C-6, C-7; VAL-5 |
| CASE-11H | Select only WP-2 at depth 0 with ample context budget | Parts F1, F10, F6: ancestor heading, full table header/delimiter and selected row; exclude other rows/entities | C-7; VAL-5 |
| CASE-11Z | The CASE-11 selection with maxUtf8Bytes 0 and maxFragments 0 | Empty parts; all three identifiers explicitly omitted for byte-budget (tie-break); usedUtf8Bytes 0; retain selected paths/boundaries in bundle metadata | C-7; VAL-5 |
| CASE-11A | [Ambiguous paragraph oracle](ambiguous-context.json): select WP-1 from "{#WP-1} {#WP-2} Shared text." with ample budget | Both labels resolve uniquely; traversal succeeds. Context includes no parts and omits WP-1 with ambiguous-ownership, F1's exact range and O1/O2. Analysis coverage/diagnosticCount remain complete/0. | C-3, C-6, C-7; VAL-5 |
| CASE-11AZ | CASE-11A with both budgets zero, or select both WP-1/WP-2 with ample budget | Ownership omission precedes budgets. Selecting both candidates omits both in selection order; no joint ownership is invented. The selection remains in result metadata. | C-7; VAL-5 |
| CASE-12 | Set maxSourceUtf8Bytes below the source's recorded 413 bytes, or maxOccurrences below 10 | analysis-limit; no successful partial snapshot masquerading as complete | C-3; VAL-6 |
| CASE-13 | Convert the same source to CRLF and insert an emoji before a reference | Facts remain semantically equivalent; source/analysis hashes and offsets change. Each occurrence range slices the exact source expression. Code example REQ-999 stays excluded. | C-1, C-3; VAL-1, VAL-6 |
| CASE-14 | Mutate the original profile object after compilation, or JSON-roundtrip an analysis/selection handle | Original compiled behavior remains fixed; rehydrated/fabricated objects are not accepted as runtime-issued handles | C-1, C-2, C-6, C-7; VAL-2, VAL-5 |

Forward-reference source for CASE-1:

~~~markdown
{#WP-1} Enforce {implements:REQ-1}.

{#REQ-1} Require an authenticated session.
~~~

The current parser probe proves the required basic nodes and raw offsets exist in Markdown Engine 3.5.0. It does not prove an extractor correctly recognizes these markers, and it does not resolve transformed/escaped source cases.

## Recorded language decisions

EP-ACT-1 records the recommended lexical and ownership rules in the interface packet. Following PR review remediation, the [rule/case index](corpus/manifest.json) maps 55 paired Markdown/annotation fixtures. The focused [ambiguous-context oracle](ambiguous-context.json) covers the new ownership omission. EP-ACT-2 also materializes all 24 API scenario inputs and their source interpretations, including shared-source references and a separate after-edit source. EP-GATE-1 records two independent interpretations and their comparison; EP-ACT-3 adds [complete API result images](corpus/results/README.md) and the generalized checker for all 79 cases. EP-ACT-4 consumer/compatibility reconciliation is next.

| Rule | Decision demonstrated | Example IDs |
| --- | --- | --- |
| LEX-1 | Canonical spelling, whole-word boundaries, no implicit ranges | LANG-01 through LANG-04; LANG-09 |
| LEX-2 | Explicit markers and preservation of unknown vocabulary | LANG-05, LANG-06, LANG-53 |
| LEX-3 | Exact raw source, no encoded or split-token reconstruction | LANG-07, LANG-08 |
| LEX-4 | Complete formatted tokens and visible labels; explicit HTML/metadata boundary | LANG-08 through LANG-13; LANG-46, LANG-53 |
| LEX-5 | Brace shielding, formatting-transparent candidate classification and local malformed recovery | LANG-14 through LANG-19; LANG-29, LANG-30; LANG-49 through LANG-52; LANG-55 |
| LEX-6 | Backslash parity and literal escaped words/groups | LANG-20 through LANG-22 |
| LEX-7 | Single-ID inline code, other code/frontmatter literal, no heading-name magic | LANG-23 through LANG-28; LANG-47 |
| LEX-8 | Malformed groups do not leak inner references or cross line/cell boundaries | LANG-18, LANG-29, LANG-30, LANG-45; LANG-49 through LANG-52; LANG-55 |
| OWN-1 | Declaration position and forward references do not change identity/ownership | LANG-01, LANG-05, LANG-31 |
| OWN-2 | Heading boundaries, including unlabelled peers | LANG-32, LANG-33, LANG-38 |
| OWN-3 | List introduction scope and paragraph-local declarations | LANG-34 through LANG-37 |
| OWN-4 | Row ownership, including headers, without propagation to other rows | LANG-39 through LANG-41; LANG-45 |
| OWN-5 | Explicit ambiguity with no outer or first-occurrence fallback | LANG-41 through LANG-43; LANG-54 |
| OWN-6 | Nested-container exits and resumption of outer ownership | LANG-33, LANG-35, LANG-36, LANG-38, LANG-48 |
| OWN-7 | Parent/child context partitioning, literal source context and explicit ownership omissions | LANG-26, LANG-44, LANG-54 |

The owner's authorization to execute the first action and this corpus PR is recorded as authorization to complete these recommendations and their proving fixtures. It is not recorded as a selection between the explicit-marker recommendation and the structural alternative. Q-1/Q-2 still require owner syntax/authoring-fit acceptance and the remaining contract/corpus proof before extraction; consult the current gate record for the independent interpretation result. A substantial spec is inventoried; its required-context oracle and performance pilot acceptance remain Q-4.
