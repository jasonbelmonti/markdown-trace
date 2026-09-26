# Explicit document corpus contract

## Document Control

| Field | Value |
| --- | --- |
| Title | Explicit document corpus contract |
| Contract depth | ID2 Standard |
| Revision | 1 |
| Status | Adopted for Task 3 implementation after the recorded pre-implementation checks |
| Source authority | Task 3 revision 3, design brief revision 2, owner instruction to proceed with Task 3 using delegation-planner on 2026-09-26 |
| Author | Codex coordinator |
| Reviewers | Codex contract evaluation; owner authorized bounded implementation |
| Last updated | 2026-09-26 |
| Related design/spec/tickets | [Task 3](../tasks/delegation-context/03-cross-document-resolution.md), [brief](cross-document-workflow-design-brief.md), [types](corpus-api/contracts.d.ts), [compile-only consumer](corpus-api/consumer.ts) |

## 0. Executive Contract Summary

This is the specification required by Task 3 TD-SC-1. It fixes the experimental contract for an immutable corpus of explicitly supplied document analyses, occurrence-backed external bindings, qualified direct queries and bounded traversal. Existing local results retain their meaning. The separate caller composes local excerpts using issued depth-zero selections and shows corpus provenance and omissions.

The owner's instruction to proceed adopts the bounded direction and authorizes materialization and supervised implementation. No additional product decision is delegated to implementers. Current proof of pin mechanics suffices to proceed; actual consumer usability remains an acceptance observation, not a claim established by the local probes. No discovery, URI extension, persistent registry, projection policy, global budget, publication or installed-skill change is included.

Section status: Complete.

## 1. Source Requirements and Assumptions

| ID | Statement | Source | Impact on contracts |
| --- | --- | --- | --- |
| TD-SC-1 | Specify qualified identity, binding, compatibility, failures and ordering before implementation | Task 3 | C-1 through C-4; typed consumer and contract review |
| TD-SC-2 | Distinguish duplicate local IDs and source revisions with original occurrence evidence | Task 3 | C-1 and C-2 |
| TD-SC-3 | Never guess an edge for absent, stale, incompatible or ambiguous inputs | Task 3 | C-1 and C-2 |
| TD-SC-4 | Preserve evidence and local validity through direct queries and bounded cyclic traversal | Task 3 | C-2 and C-3 |
| TD-SC-5 | Work from the packed package while retaining current APIs and command behavior | Task 3 | C-4 |
| ASM-1 | Small explicit inputs and manual pin updates are an acceptable first experiment | Owner's proceed instruction after brief revision 2 | C-4 must expose both edit cases and their effort; no automation claim |

Task 3 controls outcomes; this contract selects behavior within them; the brief supplies rationale. Source/tests at 0bce099df4bf30b017ea58490f6b32db62415d2a establish delivered local APIs despite historical proposed-status text in the original direction/interface packet. Current user instructions govern authorization and worker context. Full original controlling-source reads remain required where those sources mandate them.

Section status: Complete.

## 2. Problem-Space Model

### Existing Interface Constraints

| Interface | Kind | Owner | Mutability | Quality/completeness | Known consumers | Constraint or opportunity |
| --- | --- | --- | --- | --- | --- | --- |
| IF-1 | Local analysis/query/context API | Trace | fixed | Tested runtime; immutable issued handles | Node callers, document command | Reuse; never mutate local facts or fabricate selections |
| IF-2 | Markdown Engine 3.6.0 | SDK | Engine | fixed | Public structure and source maps | Trace analyzer | No second parser or new Engine integration |
| IF-3 | Root and experimental exports | Package | Trace | owned-changeable | Packed consumers | Add corpus exports to common index; retain sole existing binary |
| IF-4 | Corpus API | Memory API | Trace | not-yet-real | Explicit-input example | Small versioned surface defined here |

### Actors and Systems

| Actor/System | Role | Trust level | Contract needs |
| --- | --- | --- | --- |
| Host | Reads files, supplies trusted pins and budgets | Owns I/O and intent | Exact errors, diagnostic references and source excerpts |
| Corpus runtime | Qualifies existing facts and resolves bindings | Validates ingress | Issued handles and immutable results |
| Source author | Declares IDs and relationships | Text remains untrusted data | Inspectable source evidence; no implied execution authority |

### Capabilities

| Capability | Command/query/event | Owner | Consumers | Notes |
| --- | --- | --- | --- | --- |
| Construct corpus | Pure computation | Corpus | Host | Capture admission and resolution |
| Inspect and traverse | Query | Corpus | Host | Qualified identities, diagnostic pages and bounded BFS |
| Compose excerpts | Query orchestration | Host | Human/agent reader | Existing local extraction; no completeness verdict |

### Domain Vocabulary

| Term | Definition | Invariants | Non-examples |
| --- | --- | --- | --- |
| Qualified entity | Analysis ID plus local identifier | Source and interpretation identity distinguish revisions | Bare TD-SC-1 across documents |
| Capture pin | Expected analysis ID and complete SourceIdentity | Compared to the supplied issued analysis | Latest revision label |
| Binding | Qualified observed reference occurrence to qualified target | Target identifier must equal the lexical reference ID | Independently authored graph edge |
| Corpus selection | Issued bounded result tied to corpus identity | Retains qualified predecessor occurrence | Local GraphSelection or importable JSON |

Section status: Complete.

## 3. Boundary Map

| Boundary | Owner | Consumers | Direction | Stability | Reason to exist |
| --- | --- | --- | --- | --- | --- |
| Files to captured analyses | Host / existing analyzer | Corpus | Explicit text to issued analyses | Existing experimental | Contains I/O and parsing |
| Captures and bindings to corpus | Corpus construction | Queries | Validated input to immutable handle | Experimental v1 | Contains identity, admission and resolution |
| Corpus to queries/selection | Corpus query domain | Host | Facts to diagnostic or bounded results | Experimental v1 | Keeps qualified evidence coherent |
| Selection to per-source excerpts | Host / existing projector | Reader | Checked corpus selection to local issued selections | Existing local contract | Reuses source projection without a corpus policy engine |

Section status: Complete.

## 3A. Integration Strategy

| Existing interface | Proposed response | Adapter/translator contract | Upstream change needed | Validation required |
| --- | --- | --- | --- | --- |
| IF-1 | Reuse and validate issued captures; preserve local outputs | C-1 through C-3 | No | VAL-1 through VAL-3 |
| IF-2 | Reuse analyzer's public extraction | C-1 | No | Existing regressions |
| IF-3 | Extend common graph index additively | C-4 | No | VAL-4 |
| IF-4 | Implement selected contract | C-1 through C-4 | No | All validation rows |

Section status: Complete.

## 4. Contract Inventory

| Contract ID | Name | Kind | Owner | Consumers | Stability | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| C-1 | Capture admission and corpus identity | API / types | Corpus | Host | Experimental public | TD-SC-1, TD-SC-2, TD-SC-3 |
| C-2 | Resolution and diagnostic queries | API / types | Corpus | Reviewer and host | Experimental public | TD-SC-1, TD-SC-2, TD-SC-3, TD-SC-4 |
| C-3 | Bounded selection and compatibility check | API / types | Corpus | Context consumer | Experimental public | TD-SC-1, TD-SC-4 |
| C-4 | Package and first workflow | Consumer integration | Host / package | Owner | Experimental | TD-SC-5, ASM-1 |

Section status: Complete.

## 5. Materialized Contracts

The companion declarations are normative for field names and signatures. All inputs except issued analysis/corpus/selection objects are finite data records and dense arrays with no extra own keys. Reject malformed nested shapes, unsafe integers, invalid SHA-256 strings (64 lowercase hex), noncanonical entity IDs and nonexistent source-reference occurrences as `invalid-input`. SourceIdentity sizes are nonnegative safe integers, documentId and alias are nonblank opaque strings, and occurrence IDs match O followed by a positive decimal integer. Do not parse source again. Returned DTOs and nested collections are detached and deeply frozen; input arrays/records are not frozen as a side effect. Handles are module-instance issued and tracked privately. JSON is inspection data only.

All APIs are synchronous, deterministic, local and read-only. Unexpected programming defects may throw; expected failures return CorpusOutcome. Corpus errors have empty diagnostics unless a located Diagnostic is available. Existing Outcome and OperationError types do not change. Host owns scheduling and authorization; source content is not executable instructions. Fix input then retry; there are no side effects to roll back.

### C-1: createCorpus

Owner: corpus construction. Input: nonempty captures, bindings (possibly empty), and explicit limits. `maxCaptures` and `maxSourceUtf8Bytes` are positive safe integers; `maxBindings` is nonnegative. Bound raw descriptor and binding counts before normalization; bound sum of source UTF-8 bytes once per unique admitted analysis. Limit excess is `corpus-limit` with no usable corpus.

Every capture supplies an issued analysis and trusted expected pin. Compare all SourceIdentity fields and analysis ID exactly; mismatch is `stale-capture`. Never refresh a pin from the provided handle. Repeating one identical alias/pin is idempotent; an alias naming different captures is `invalid-input`. Different aliases may name the same analysis and collapse into one capture summary with sorted aliases. Multiple different captures of the same documentId are permitted. Alias labels are convenience only and do not change corpus identity. Every admitted analysis must share interpretationHash, graph schemaVersion, analyzerVersion and parserVersion; mismatch is `incompatible-capture`. Partial or locally invalid graphs are admissible, with unchanged coverage and diagnostics.

Admission order for expected failures is input shape/issued handles, raw count limits, pins/alias conflicts, compatibility, aggregate byte limit, then source-binding existence. Inputs used to report a later semantic outcome must pass admission. A binding source analysis must be admitted and its occurrence must be a reference with an observed relationship. Failure is `invalid-input`. Target captures may be absent and are retained as unresolved intent.

Success returns a DocumentCorpus with `markdown-trace.corpus.v1` snapshot and one reference result for every observed relationship in each unique capture. Captures sort by `(documentId, source.sha256, analysisId)`; all string comparison uses JavaScript `<`/`>` code-unit order, never localeCompare. Qualified entities use that capture tuple followed by identifier; an absent capture sorts after admitted captures, by analysisId then identifier.

Corpus ID is SHA-256 of canonical JSON with sorted object keys and preserved normalized array order: `{schemaVersion: 'markdown-trace.corpus.v1', captures: sortedUniqueAnalysisIds, bindings: sortedUniqueBindings}`. Sort analysis IDs lexically for this hash. Sort binding tuples by source analysisId, source occurrenceId, target analysisId, target identifier, and remove exact duplicates. Include unsuccessful binding intents; exclude aliases, limits and validation policy. Existing analysis IDs already bind complete source identity and interpretation/runtime. A changed target binding changes corpusId even when source bytes stay fixed. A repeated equivalent input produces compatible identity.

### C-2: Resolution, lookupCorpusIdentifier, findCorpusIncoming, findCorpusOutgoing

Each CorpusReference retains the original Relationship and Occurrence without rewriting either. `evidence` qualifies that occurrence by source analysis ID. `source` qualifies a structurally owned label, even if its definition is duplicate/unknown; otherwise it is null. `targets` lists deduplicated intended targets: explicit binding targets when any exist, otherwise the original local target. The `binding` flag distinguishes these cases. Never add a local target fallback after explicit intent fails.

Resolution uses this first-applicable reason order: multiple distinct targets for one occurrence → `conflicting-bindings`; explicit binding when local target definition is resolved or duplicate → `local-target-not-missing`; explicit target ID differs from lexical target → `target-id-mismatch`; source is unowned/ambiguous or lacks one unique known-kind definition → `unusable-owner`; target capture absent → `missing-capture`; target definition absent/missing → `missing-definition`; duplicate target definition → `duplicate-definition`; unknown target kind → `unknown-kind`. Otherwise resolution is `resolved` with one qualified target. This applies to generic and typed reference occurrences. Identical repeated binding descriptors do not conflict. Invalidity under a local validation policy does not filter an otherwise resolved edge.

Sort all reference results by source capture tuple, occurrence start offset, end offset, relationship kind, relationship ID. Distinct reference occurrences remain distinct. Sort intended targets by qualified entity comparator. Direct outgoing pages include results whose structurally owned source equals the requested entity, including unresolved results. Direct incoming pages include a result once when its intended-target set contains the requested entity, including absent target captures and ambiguous bindings. Consequently both views retain the same source occurrence evidence, while only resolved results are traversable.

Lookup returns the capture summary or null, original IdentifierRecord or null, original definition occurrences in source order, and incoming occurrence count (each relationship counted once). Absent/missing labels are query data. Queries with an absent but well-formed capture identity succeed with null capture/record and any explicitly intended incoming references. No fallback by document name or bare ID. Invalid corpus/qualified key/query is `invalid-input`.

ReferenceQuery retains local semantics: offset defaults 0, limit defaults 100 and lies in 1–1000; integers must be safe and offset nonnegative. Omitted relations admit all; an empty array admits none; unknown but syntactically valid relation slugs match no edges. Filters precede pagination. Return exact totalMatches, actual offset/limit, and nextOffset or null. Every result identifies corpusId.

### C-3: traverseCorpus and checkCorpusSelection

Owner: corpus query/selection. Query requires nonempty roots, incoming/outgoing/both, maxDepth a nonnegative safe integer, maxNodes a safe integer at least the distinct root count, and optional dense relation slugs. Unknown keys and malformed qualified roots fail `invalid-input`. All roots must be in admitted captures with unique known-kind definitions; otherwise fail `unresolved-root` before returning a selection.

Deduplicate and sort roots by the qualified comparator from C-1. BFS scans each node's relevant incoming/outgoing references in C-2 reference order, deduplicating evidence when both directions expose the same reference. Apply relation filters first. Unresolved incident references increment a distinct qualified-occurrence set and are not followed. Resolved neighbors require both endpoints uniquely known. First discovery supplies one canonical shortest predecessor with qualified `from`, source evidence, relationship ID and kind. Root `via` is null. Cycles and repeated edges never duplicate a node; incoming traversal still cites the original source occurrence. Both-direction self-loops remain one incident reference.

After filtering, already visited neighbors do not trigger a limit. For each unvisited resolved neighbor, set depthLimited when current depth is at maxDepth, set nodeLimited when selected size is at maxNodes, and skip if either bound holds. Inspect selected nodes even when budget is exhausted. `unresolvedRelationships` is the size of the examined unresolved occurrence set, not a corpus-wide completeness count. This preserves local C-6 boundary meanings. Selection coverage is partial if any admitted capture is partial; diagnosticCount sums unique-capture diagnostic counts. These are inherited analysis facts, independent of resolution/validation status.

The normalized query stores sorted unique roots and a detached optional relation list; returned selected nodes, boundaries and provenance are immutable. `checkCorpusSelection` is the consumer boundary before using saved path/grouping data: invalid corpus → `invalid-input`, non-issued/copy selection → `invalid-selection`, issued selection with different corpusId → `stale-selection`, otherwise return the same valid issued selection. Equivalent repeated corpus construction is compatible. It grants no completeness or authority claim and performs no projection. Local extractContext must still reject corpus selections.

### C-4: Package and workflow

Both root and experimental/graph expose createCorpus, lookupCorpusIdentifier, findCorpusIncoming, findCorpusOutgoing, traverseCorpus, checkCorpusSelection and their types. No existing exports, grammar, profile meaning, package metadata, dependency or document-command output changes. The host example reads only explicit files and a reviewed data manifest containing trusted capture pins, source occurrence IDs, target analysis IDs, roots and budgets. It must not compute fresh expected pins or silently rebind during a normal run. Document the separate authoring process for capturing identities and deliberately editing the manifest.

The example uses a plan table action, task A's criterion linked to local CON-1, colliding task B TD-SC-1, and an unlinked global constraint. Output separates corpus selection, qualified path evidence, original local coverage/validation, per-source excerpt bundles and omissions. Group checked corpus nodes by analysis; obtain genuine local selections at maxDepth 0 and extract under explicit per-document budgets. Root sorting gives lexical excerpt admission order, not corpus BFS priority. Show the tight-budget criterion omission plainly. Context absence never authorizes omitting a controlling read.

Demonstrate the original case, a second task capture with changed bytes under the same revision label, an earlier plan-action insertion, and a task-text edit. Show stale pins rejected before deliberate manifest rebinding, then restored intended selection; preserve all source/profile input bytes during execution. Record affected bindings and required authoring operations for both edit cases. A packed consumer must execute these package functions outside the checkout using copied explicit files and independently expected targets/ranges. The compile-only consumer proves type fit, not runtime success.

Section status: Complete.

## 6. State, Fault, and Misuse Contracts

| Case ID | State/fault/misuse case | Owning contract | Expected behavior | Validation |
| --- | --- | --- | --- | --- |
| CASE-1 | Duplicate local IDs across tasks or revised bytes under one revision label | C-1, C-2 | Exact analysis-qualified target only | VAL-1 |
| CASE-2 | Missing target, conflicting bindings, duplicate/unknown definition | C-2 | Explicit reason and original occurrence; no traversable guessed edge | VAL-1 |
| CASE-3 | Stale pin, conflicting alias, forged analysis, incompatible profile, exceeded admission bound | C-1 | Named operation failure and no corpus | VAL-1 |
| CASE-4 | Explicit binding redirects an existing local definition | C-2 | local-target-not-missing; local result stays unchanged | VAL-1 |
| CASE-5 | Cycle, diamond, repeated reference, filter and boundary | C-3 | Deterministic canonical BFS and examined uncertainty | VAL-2 |
| CASE-6 | Mutated caller data, forged/copied selection, changed binding | C-1, C-3 | Immutable output; invalid/stale selection detected | VAL-2 |
| CASE-7 | Locally invalid graph resolves externally | C-2, C-4 | Separate corpus status; original validation still fails | VAL-3 |
| CASE-8 | Small excerpt budget and unlinked global obligation | C-4 | Visible omission; no mandatory-completeness claim | VAL-4 |

Section status: Complete.

## 7. Compatibility and Migration Notes

| Contract ID | Compatibility rule | Migration/backfill | Rollback constraint | Deprecation plan |
| --- | --- | --- | --- | --- |
| C-1, C-2, C-3 | Additive corpus schema and error union; local API unchanged | Explicit annotations and pins only | Remove unused additive API if necessary; no data writes | None |
| C-4 | Common package index and sole document binary retained | Caller opts into example | No installed release changes | None; retired workflows stay absent |

Section status: Complete.

## 8. Validation and Review Plan

| Validation ID | Contract IDs | Method | Evidence required | Owner |
| --- | --- | --- | --- | --- |
| VAL-1 | C-1, C-2 | Independent source fixtures and public API assertions | Exact pins, same-name captures/revisions, occurrence ranges, all resolution reasons, alias conflicts, limits and no I/O | Implementer and coordinator |
| VAL-2 | C-3 | Hand-audited diamond/cycle and permutations | Incoming/outgoing/both order, exact predecessors, repeated evidence, depth/node/unresolved flags, immutable handles, stale selections | Implementer and coordinator |
| VAL-3 | C-1, C-2, C-3 | Compare original analysis and validation snapshots | Byte-identical local results before/after queries including a locally invalid graph | Implementer and coordinator |
| VAL-4 | C-4 | Packed type/runtime consumer and workflow example | Root/experimental parity, explicit copied files, preserved inputs, both edits, budget omission, current enforcement | Implementer and coordinator |
| VAL-5 | C-1, C-2, C-3, C-4 | Pre-implementation design validation | Structural profile pass, strict consumer typecheck, review against CASE-1 through CASE-8 | Coordinator |

Section status: Complete.

## 9. Traceability Matrix

| Source ID | Contract IDs | Acceptance/validation IDs | Notes |
| --- | --- | --- | --- |
| TD-SC-1 | C-1, C-2, C-3, C-4 | VAL-5 | Accepted before runtime implementation |
| TD-SC-2 | C-1, C-2 | VAL-1, VAL-4 | Runtime proof remains required |
| TD-SC-3 | C-1, C-2 | VAL-1 | No guessed success |
| TD-SC-4 | C-2, C-3 | VAL-2, VAL-3 | Preserve local evidence and boundary semantics |
| TD-SC-5 | C-4 | VAL-4 | Actual packed consumer and compatibility |

Section status: Complete.

## 10. Open Questions

| Question ID | Question | Owner | Due date or decision point | Impact if unresolved |
| --- | --- | --- | --- | --- |
| Q-1 | Is measured edit/rebind effort acceptable in the owner workflow? | Owner with coordinator evidence | Consumer demonstration | Limits adoption confidence; does not authorize heuristic rebinding or prevent the requested bounded implementation |

Section status: Complete; no unsettled implementation semantics.

## 11. In-Situ Evaluation

### Grounding Evidence

| Evidence ID | Source | Tool/source type | What was inspected | Relevant contracts |
| --- | --- | --- | --- | --- |
| EVD-1 | analyze.ts, analysis-state.ts, contracts/analysis.ts and source.ts | Source | Source/interpretation/runtime hashing and privately issued immutable analyses | C-1, C-2 |
| EVD-2 | queries.ts, traverse.ts, selection-state.ts and context.ts | Source and focused tests | Diagnostic pages, canonical BFS, boundary flags, issued local selection and lexical admission | C-2, C-3, C-4 |
| EVD-3 | package.json, scripts/package-exports/consumer.mjs and ci-enforcement.sh | Source | Shared exports and isolated package/regression route | C-4 |
| EVD-4 | Brief revision 2 and local follow-up probe | Observed local API results | 176-byte omission; source O2→O3 and target capture edits | C-4 |

### Rubric Scores

| Axis | Score | Evidence IDs | Finding IDs | Notes |
| --- | --- | --- | --- | --- |
| Behavioral fitness | Pass | EVD-1, EVD-2 | None | Exact identity and unresolved cases specified |
| Consumer fitness | Pass | EVD-2, EVD-4 | None | Small explicit memory API and host composition |
| Integration realism | Pass | EVD-1, EVD-2 | None | Existing issued handles preserved |
| Change safety | Pass | EVD-3 | None | Additive exports and separate error types |
| Failure semantics | Pass | EVD-1, EVD-2 | None | Admission and resolution precedence explicit |
| Data and invariant protection | Pass | EVD-1, EVD-2 | None | Canonical identity, immutable snapshots and exact ranges |
| Operational fitness | Concern | EVD-4 | FND-1 | Finite bounds; no scale or ergonomic success claim |
| Security and trust handling | Pass | EVD-1 | None | Trusted expected pins and host-only I/O |
| Testability | Pass | EVD-2, EVD-3 | None | Independent fixtures and real packed entrypoints |
| Implementation proportionality | Pass | EVD-2 | None | Corpus ownership; no new parser, store or global projector |

### Evaluation Findings

| Finding ID | Severity | Axis | Affected contracts | Evidence IDs | Required action | Validation target |
| --- | --- | --- | --- | --- | --- | --- |
| FND-1 | Minor | Operational fitness | C-4 | EVD-4 | Report actual edit steps and bounded input sizes; retain owner adoption decision | VAL-4 |

Section status: Complete.

## Internal Review Record

- Contract depth calibration: ID2 is appropriate for durable public identity semantics.
- Grounding result: The coordinator inspected analysis identity, direct queries, local BFS, issued selections, extraction and packed-consumer boundaries at the recorded baseline.
- Rubric result: Nine Pass and one Concern; no Blocker or Major finding remains.
- Findings addressed: Reviewed duplicate-ID/revision, incompatible-profile, nonexistent-target, local-preservation, ordering, ambiguity and stale-selection cases. Separate corpus errors preserve the local union; qualified evidence prevents occurrence collisions; selection checking prevents reuse after binding changes.
- Validation result: VAL-5 structural/typecheck results and artifact hashes are retained under `.codefactory/task-3-run/` before dispatch.
- Remaining findings: FND-1 requires the bounded consumer demonstration and an honest adoption assessment.
- Readiness verdict: Approve for bounded Task 3 implementation once VAL-5 checks pass; runtime acceptance still requires VAL-1 through VAL-4.
