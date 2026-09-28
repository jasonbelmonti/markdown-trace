# Projection policy and independent verification

## Document Control

| Field | Value |
| --- | --- |
| Revision | 2 |
| Status | Proposed implementation contract; runtime not implemented |
| Decision owner | Jason Belmonti |
| Date | 2026-09-27 |
| Task authority | [Task 04](../tasks/delegation-context/04-projection-policy-verification.md), revision 1, READY / SPEC_REQUIRED |
| Inspected runtime | `085b22a` on main; Markdown Engine 3.6.0; package 0.1.1 |
| Companion contracts | [Types](projection-policy/contracts.ts); [compile-only consumer](projection-policy/consumer.ts) |

## 1. Outcome and authority

A selected graph can be complete while a worker packet lacks scope, authority, constraints, or review boundaries. Trace shall evaluate an explicit owner-supplied policy that includes those unlinked obligations as well as applicable graph dependencies. It shall independently verify serialized packets against caller-trusted inputs. This specification resolves Task 04's finite language, identity, budget, API, command, and failure decisions; its six success criteria remain the acceptance boundary.

The reported measured selection motivates the design; its original measurement artifacts were not supplied and are not treated as reproduced evidence. The implementation shall establish the failure and repair with the independent oracle in section 10.

Four claims remain separate: graph validation; satisfaction of the declared projection policy; semantic sufficiency of that policy for the assignment; and source lifecycle/read authority. Only the first two are Trace runtime results. A supervisor reads complete controlling sources, decides which obligations apply, checks the policy against them, and authorizes a scoped handoff under the owning workflow. Trace shall never emit `handoffReady`, `safeToExecute`, or a full-read waiver. Existing explicit full-read mandates continue to apply.

The current task-definition guidance already permits supervisor-verified scoped handoffs. Task 04's older statements about future adoption do not prohibit using that existing permission; they prohibit this runtime from granting permission itself. This specification changes no installed skill, task lifecycle, or source precedence.

## 2. Baseline and bounded scope

Reuse issued local analyses, graph facts, qualified corpus resolution, entity/support bundles, and Engine structure/source maps. Existing `traverseGraph`, `extractContext`, corpus APIs, `context`, and `context-text` retain their meanings, formats, and exits. In particular, a successful extraction with omissions remains valid extraction behavior.

The new API is additive and experimental on both current package entry points. One-source and explicitly supplied multi-source requests use the same contract; the one-source case is a corpus of one with no bindings. Core code performs no filesystem/network I/O, discovery, prose inference, model calls, or source repair. It does not revive retired table validation or registry workflows. The command adapter loads only explicitly supplied local paths.

Task 01/02 documents contain historical pre-implementation wording; the inspected source implements traversal and source projection. Task 03 revision 3 and the corpus implementation supply qualified pins/bindings. Its local validation verdicts shall remain unchanged by projection. The new `context-text` mode at this baseline is an extraction view, not policy verification.

## 3. Trusted inputs and exact identity

The caller supplies an assignment, sources, bindings, budgets, resource limits, a compiled policy, and an independent expectation record. The verifier takes these inputs again; it shall not load expectations or source content from the packet.

Each source has a unique alias, caller-chosen artifact revision label, original text, and raw validation-profile JSON. Its trusted expectation binds alias, revision, `CapturePin` (analysis ID plus complete `SourceIdentity`), profile-file SHA-256, interpretation hash, and validation hash. Hashes cover exact UTF-8 bytes without normalization; offsets remain zero-based UTF-16 with exclusive ends. Revision labels alone cannot establish freshness. Source text must be a lossless UTF-8 round trip; reject lone surrogates. The CLI shall reject invalid UTF-8 bytes rather than silently replace them.

The required validation-profile schema is the existing `markdown-trace.validation-profile.experimental.v1`; compile-only document profiles are not accepted on this new surface. Interpretations across captures must satisfy the current corpus compatibility contract. Compile and analyze each supplied source once per operation, check every expected pin, then build the existing explicit corpus. Do not serialize or reconstruct issued handles from packet data.

The expectation also binds the raw policy-file SHA-256, policy ID, policy revision, schema version, and producer identity: package version, analyzer version, parser version, and projection algorithm version `markdown-trace.projection-algorithm.v1`. The manifest explicitly lists all captures and bindings, roots, assignment ID, budgets, and limits. The packet reproduces this normalized request; the verifier compares it to the caller's request, including bindings. A packet cannot replace a root, weaken a budget, omit a capture, change a policy, or repin itself.

Policy compilation retains raw JSON identity. Formatting-only edits deliberately require a new trusted policy digest. Human revisions need not change to detect an edit, but owners should revise them for material changes. Hashes provide identity, not authentication or approval. The host is responsible for establishing expectations outside the packet and for reassessing them after edits.

## 4. Finite policy language

The complete data shape is in the companion types. Reject unknown fields, duplicate object keys in JSON text, unknown versions/operators, invalid IDs, duplicate IDs/aliases, invalid paths/ranges, non-safe or negative integers, and unsupported combinations. Rejection returns no usable compiled policy. Apply the same strict decoding to manifests and packets; an already decoded API object cannot reveal duplicate keys that a caller discarded. No callbacks, expressions, regexes, scripts, negation, or implicit selectors are supported.

Policy IDs, rule IDs and source aliases match `[a-z][a-z0-9]*(?:-[a-z0-9]+)*`; entity and relation IDs follow draft2. Revision/assignment/document IDs and heading path segments are nonblank strings without NUL. Hashes are 64 lowercase hexadecimal characters. Positions follow the existing SourceRange contract and source text; numeric fields are nonnegative safe integers, with analysis limits and corpus maxCaptures/maxSourceUtf8Bytes positive as their existing contracts require. Policy, supplied-source and expected-source alias sets must match exactly, with exactly one gate per alias. Reject repeated pins even under different aliases. Referenced rule/source names must exist at compilation; validate subject kind names against the supplied profiles at request admission. Relation names use the finite draft2 grammar, and zero matching edges are evaluated through the declared minima rather than silently treated as an unknown-operator error.

A policy declares its exact source aliases, ordered rules, and validation gates. At least one required rule and one gate must exist; empty policies are invalid. All assignment roots are inherently required and shall have unique known-kind definitions. Each rule ID is unique and cannot be `roots`. A rule is one of:

| Operator | Selection and obligation |
| --- | --- |
| `source` | Select one exact source alias and either its whole document, one uniquely matching heading path and its complete subtree, or one exact Engine block range plus structural support. Independent of graph reachability. |
| `entities` | Select an explicit nonempty list of source-alias/local-ID pairs. Every listed entity is an obligation, including when a corresponding annotation has disappeared. |
| `expand` | Starting at `roots` or an earlier entity-producing rule, follow one explicit direction and a nonempty set of relation kinds. `step` performs one hop; `closure` follows the same relation set to a fixed point. |

Every rule declares `required` or `optional`. Required expansion may depend only on roots or an earlier required entity rule; a source rule cannot feed expansion. Rule references form a forward-evaluated DAG, with graph cycles handled inside closure. Sequences of `step` rules express ordered relation paths. `closure` expresses transitive dependency closure, not an arbitrary path language. Optional results never become requirements implicitly.

### 4.1 Source selectors

`document` selects `[0, text.length)`, including frontmatter and any preamble. `section` uses an exact nonempty path of Engine-normalized heading titles from the document's top-level section ancestry (for example `["Task", "Review Boundary"]`). It must identify exactly one section. Include its heading, body, nested sections, original intervening whitespace, and necessary ancestor headings. End immediately before the next heading of equal or lesser depth, or at EOF. Resolve hierarchy through Engine's public section/tree API, not a regex Markdown parser. A full section intentionally includes all descendant-owned content.

`block` supplies an exact `SourceRange`, which must match exactly one supported Engine paragraph, list item, blockquote, table, or code block, with all supplied positions checked against the capture. Include its structural heading/list/quote/table support using the existing source-support rules. Do not accept arbitrary substring ranges as blocks. Multiple matches, no match, unavailable source ranges, or unsupported support relationships make the selector unresolved. A required unresolved selector prevents satisfaction; an optional one is reported as an omission.

Source selection does not invent entity ownership. A block may deliberately contain several entity declarations; ambiguity becomes blocking when the policy also requires extracting an entity whose ownership cannot be resolved. Selecting the whole section cannot hide that entity obligation failure.

### 4.2 Dependency applicability and missing links

An expansion rule supplies `subjectKinds`, `minSubjects`, and `minNeighbors`. Inspect the complete frontier; only entities whose kinds are in `subjectKinds` expand in the rule's chosen direction. Return every resolved neighbor reached through matching relations, irrespective of neighbor kind. Seeds do not appear in that rule's output merely because they are seeds; they may appear if a traversed cycle reaches them. In closure mode, reached neighbors of a subject kind are expanded in turn. Count unique qualified neighbors per subject. Duplicate occurrences do not satisfy a minimum twice. `minSubjects` applies to the distinct subjects actually examined for that rule, and prevents a missing kind from making a rule vacuously succeed.

For each examined subject, `minNeighbors` is a required lower bound; a missing required annotation/binding can therefore fail even when no dangling edge remains. A terminal kind is excluded from `subjectKinds`, or the rule deliberately uses `minNeighbors: 0`. Rules never infer a missing dependency from prose. Domain source-coverage validation gates and explicit entity rules cover obligations that cannot be proved by neighbor counts. The supervisor remains responsible for choosing these constraints; omitting a dependency from both source and policy cannot be detected semantically.

Resolve every incident matching edge using original occurrence evidence. A required rule cannot pass with unresolved endpoints, ambiguous applicable owners, broken/conflicting corpus bindings, or unknown applicable kinds. For incoming queries, an unresolved possible source is also blocking. Inspect ambiguous incident evidence, not only the currently indexed uniquely owned outgoing edges. Partial analysis coverage in any declared capture prevents satisfaction in v1; this conservative rule avoids claiming completeness from excluded uncertain evidence. Ordinary graph-validation failure with complete coverage remains separately reportable.

### 4.3 Exploration bounds

Each expansion has explicit `maxDepth` and `maxNodes`; the request also bounds total rule/entity visits. Bounds limit work, never redefine required closure. A `step` has semantic depth one and requires `maxDepth: 1`. A `closure` may pass at its depth bound only if examining that frontier finds no unseen admissible neighbor and no unresolved matching edge. Reaching a bound with remaining work prevents satisfaction for a required rule. A cycle terminates through visited qualified entity keys and passes when exploration is exhausted; revisiting a known vertex is not truncation. Count seeds in maxNodes even if their kind does not expand. The visit ceiling counts distinct `(rule ID, qualified entity)` evaluations, including seeds, and is independent of output byte budgets.

Never claim to enumerate obligations beyond an unexplored frontier. Diagnostics identify the rule, frontier, limit, known affected items, and `requiredSetComplete: false`; discovered omissions remain enumerated. No remaining optional exploration may consume capacity reserved for required rules: evaluate all required rules in declared order first, then optional rules in declared order.

### 4.4 Validation gates

Every source requires one explicit gate: `all`, or a nonempty exact list of existing validation rule IDs. All selected rule results must be `pass`; `not-applicable`, missing, fail, and indeterminate do not satisfy a gate. Preserve each full local validation report. Selecting individual rules permits a plan's known external-reference local failure to remain visible while corpus bindings resolve those dependencies; it does not rewrite local validity. Domain examples shall gate source annotation coverage and required counts so deleting a declaration cannot silently narrow the policy result.

### 4.5 Canonical expansion evidence

`RuleEvaluation.evidence` is an incidence log: one record per examined subject and matching original reference, including revisits, parallel references, unresolved references and edges inspected at a depth/node boundary. It is not a predecessor tree. Roots, `entities`, `source`, and skipped evaluations have empty evidence arrays. Do not create evidence for an unexamined subject or an inferred link. Selection/admission remains separately recorded in `entities`, obligations, boundaries and diagnostics; an evidence record alone does not mean its neighbor was admitted.

For each expansion, seeds have depth zero. Examine subjects breadth first, ordering each depth's subjects by source alias then identifier (the section 5 code-point order). Inspect a subject's matching references in original-reference order: occurrence capture alias, occurrence start offset, end offset, occurrence ID, then relationship ID. The first discovery establishes an entity's shortest depth; later paths never change it. Each qualified entity is examined at most once per rule. In `step` mode only seeds are examined. In `closure` mode, reached entities of a subject kind are also examined, including the frontier scan required by section 4.3. Finish the current subject's reference scan before moving to the next; a visit limit stops before examining the next entity and fabricates no evidence for it. Node/depth limits prevent new discovery but do not hide references inspected from the current subject.

| Field | Exact meaning |
| --- | --- |
| `from` | The examined subject in traversal direction, always a known qualified entity. |
| `to` | The uniquely resolved, known-kind neighbor in traversal direction; null when no usable unique neighbor can be established, including an ambiguous owner or conflicting binding. Never choose one candidate from an unresolved set. |
| `occurrence` | The original reference's capture analysis ID and occurrence ID, regardless of traversal direction. It may belong to a different capture from `from`. |
| `relationshipId`, `relation` | The original reference's relationship ID and kind; incoming traversal does not rewrite them. |
| `depth` | The examined subject's shortest depth plus one: the attempted hop depth. This can exceed a revisited neighbor's shortest depth or the closure depth bound during its frontier scan. It is not the neighbor's discovery depth. |

For an original A-to-B reference, an incoming examination at B records `from: B, to: A` and keeps A's original occurrence. In `both` mode that reference may be examined once at A and once at B, producing two records; a self-loop at A produces only one. Distinct occurrences between the same endpoints remain distinct records. Revisiting a seed through a cycle produces evidence and includes that seed in the rule's output as specified in section 4.2, without re-expanding it. Unresolved incidence produces one record with null `to` plus the applicable diagnostic, not one record per candidate. The known subject must be an actual or candidate endpoint under the existing ownership/corpus resolution evidence; unrelated unresolved references are not invented as incident edges.

The per-rule record key is `(from.source, from.identifier, occurrence.analysisId, occurrence.occurrenceId, relationshipId)`. Deduplicate only this key, including duplicate outgoing/incoming lookup of a self-loop. Sort the final array by numeric `depth`, then `from.source`, `from.identifier`, and the original-reference order above. Text ties use section 5's code-point order; offsets use numeric order. This defines a total order for distinct record keys. The original occurrence remains resolvable against the pinned capture, so original edge orientation is recoverable without overloading `from`/`to`. These projection-specific rules do not change existing corpus traversal or its predecessor explanations.

The following independently specified micro-oracles are mandatory implementation fixtures. A, B and C are known entities in one capture, all eligible subject kinds; all edges have the selected relation, minima are zero, and limits permit completion unless stated. `o1 < o2 < o3` denotes original source order. A tuple is `(from, to, occurrence, depth)`; the table lists the complete ordered evidence array. The companion consumer contains typed versions with illustrative IDs; runtime fixtures must bind these labels to independently established original occurrence/relationship IDs and capture pins.

| Case | Input | Expected evidence |
| --- | --- | --- |
| Incoming | `o1: A -> B`; incoming step rooted at B | `[(B,A,o1,1)]` |
| Both directions | `o1: A -> B`; both-direction closure rooted at A | `[(A,B,o1,1), (B,A,o1,2)]` |
| Repeated references | `o1: A -> B`, `o2: A -> B`; outgoing step rooted at A | `[(A,B,o1,1), (A,B,o2,1)]`; one unique neighbor |
| Returning cycle | `o1: A -> B`, `o2: B -> A`; outgoing closure rooted at A | `[(A,B,o1,1), (B,A,o2,2)]`; output includes A and B |
| Self-loop | `o1: A -> A`; both-direction closure rooted at A | `[(A,A,o1,1)]`; A examined once |
| Unresolved incoming owner | `o3` targets B but has ambiguous source ownership; incoming step rooted at B | `[(B,null,o3,1)]` plus unresolved/ownership diagnostic; required rule cannot pass |
| Depth boundary | `o1: A -> B`, `o2: B -> C`; outgoing closure rooted at A, maxDepth 1 | `[(A,B,o1,1), (B,C,o2,2)]`; C remains unselected and the required rule is limited |

## 5. Required content, optional content, and budgets

Resolve the required obligation set before source admission. Each root/entity is atomic with its existing owned fragments and recursive structural support. Each source rule is atomic with its full selector result and support. Preserve every contributing obligation and inclusion reason when intervals overlap. Merge overlapping intervals only; touching ranges remain separate parts, matching the existing projector. Never span gaps or merge across captures. Count each emitted source byte once and count the final disjoint parts. The companion packet has source-selector reasons instead of forging `forIdentifiers` for unowned text.

The request sets one global `maxUtf8Bytes` and `maxFragments`. These bound returned source text and final parts across the entire corpus, not JSON size, transport framing, tokens, or model context. First test the union of all resolved mandatory bundles. If that union cannot fit, admit **none** of the source parts, mark every required obligation unadmitted, report exact minimum required bytes/parts when resolution is complete, and return unsatisfied. Do not produce a root-only success. Zero budgets pass only if the required union is empty; roots make that impossible for a valid nonempty assignment.

If any required selector, traversal, gate, ownership, or resource check fails, v1 also emits no source parts. It retains resolved candidates, bounds, and diagnostics for inspection; it must not advertise a consumable partial packet. This all-or-none required admission avoids priority choices among mandatory obligations.

Once all mandatory content fits, consider optional obligations in policy order, then canonical qualified-entity order. Add an optional bundle atomically only if the normalized union still fits. Continue after an optional omission so later fitting bundles may be admitted. Required wins if one entity/range is reached in both categories. Optional unresolved/limited/budget outcomes remain explicit and do not prevent required satisfaction. The packet accounts for each discovered obligation as admitted or omitted with reasons; unknown regions have boundary diagnostics rather than fabricated item lists.

Ordering is deterministic: captures by alias using Unicode code-point order, rules by declaration order (with a synthetic required `roots` evaluation first), qualified entities by alias then identifier using that same ordering, source parts by alias then start/end offset. Normalize roots and explicit entity lists by sorting/deduplicating; reject duplicate relation/kind lists. Normalize bindings by source analysis/occurrence then target analysis/identifier, preserving conflicting targets as unresolved evidence under the existing corpus contract. Each rule evaluation's `from` names its predecessor rule; its edge evidence follows section 4.5. Diagnostic order follows evaluation phase, rule order, source order and code; obligation/reason order follows rule order, qualified entity and role. No wall-clock timestamps or transport file paths participate in canonical content; caller-chosen logical document IDs are retained verbatim.

## 6. Serialized packet and independent verification

`markdown-trace.projection-packet.v1` contains the normalized trusted-request identity, all source/profile/policy/producer identities, roots and explicit binding configuration, complete local validation reports, rule evaluation outcomes and graph evidence, obligation accounting, exact parts/ranges/reasons, budget use, and source-size measurements. Overall `policyStatus` is `satisfied` or `unsatisfied`; `requiredSetComplete` separately states whether mandatory discovery finished. It has no producer-issued `verified: true` flag.

Obligation IDs are compact JSON arrays `[ruleId, sourceAlias, entityId-or-selectorKind]`; the synthetic root rule uses `roots`. Each entity/source rule contributes its own accounting even when content overlaps another obligation. An admitted obligation has no omission reasons. On aborted mandatory admission, unresolved obligations retain their cause, and otherwise resolved required obligations use `required-admission-aborted` in addition to any applicable budget cause. Required byte/part totals are null when a required selector/closure/support result is unknown, otherwise exact even when admission fails. Optional rules are not evaluated after a required failure; record one `skipped` evaluation per optional rule with `required-admission-aborted`, and do not fabricate optional obligation sets.

Each part must equal its original captured slice byte-for-byte, including CRLF, Unicode and whitespace; line/column offsets must agree. `originalSourceUtf8Bytes` is the sum of unique declared captures (reject duplicate capture aliases/pins), `projectedSourceUtf8Bytes` is the normalized emitted union, and `serializedPacketUtf8Bytes` is measured by the host after serialization. Only the first two belong in the packet, avoiding a self-referential size field. Report optional omissions even when verification passes.

The verifier accepts `packet: unknown` and independently supplied trusted input. It shall:

1. Strictly decode packet shape/version without interpreting any embedded text as instructions. The packet encoding is UTF-8 of `JSON.stringify(packet)` with no replacer or indentation, no BOM, no wrapper and no terminal newline. The API validates finite acyclic JSON data and applies `maxPacketUtf8Bytes` to that encoding's length; non-JSON values, getters and custom prototypes are invalid packet data. The CLI first applies the same bound to actual file bytes before parsing, including any whitespace a caller added, and then invokes API verification. Production returns `resource-limit` if the defined packet encoding exceeds the bound. The CLI must measure its buffered encoded packet before any stdout write and emit those exact bytes; thus successful producer output fits the unchanged verifier manifest's input bound. Exceeding either admission check returns `resource-limit`, never a partial packet or verification result; do not truncate diagnostics or metadata to fit. Caller-reformatted JSON remains eligible only when both its raw size and compact-data size fit; whitespace tolerance in semantic comparison does not waive resource admission.
2. Recompile the trusted policy and profiles from their original bytes, recapture originals, and compare all expected source, interpretation, validation, policy, producer and revision identities. An unverifiable expected source fails as stale; do not update pins.
3. Recompute the full required/optional selection, applicable validation gates, closure boundaries, structural support, interval unions, deterministic admission, omissions, and measurements. An unchanged empty or unsatisfied packet cannot pass verification.
4. Compare the entire semantic packet to that recomputation. JSON object key order and insignificant JSON whitespace are irrelevant; array order, strings, ranges, reasons, identities, reports, and accounting are exact. Reject extra fields/parts and underreported omissions. A recomputed packet-local hash or a changed completeness flag cannot repair a missing requirement.
5. Return a separate immutable verification report: `pass` only for a satisfied recomputation and exact match; otherwise `fail`, or `stale` for trusted identity mismatch. Report explicit differences and the affected source/rule/obligation when known.

Production and verification may share deterministic resolver primitives, but verification cannot accept producer-issued booleans, cached evaluation state, or supplied analysis handles as proof. Tests shall use an independent hand-authored oracle, including mutations that would pass if both paths merely trusted the same packet claim. No separate verifier executable/service or second Markdown parser is required.

## 7. API and outcome contract

The companion declarations specify proposed exports `compileProjectionPolicy`, `produceProjection`, and `verifyProjection`. Compilation produces an immutable issued policy handle; copied/fabricated handles fail. Production compiles profiles and analyzes trusted inputs once within the call. Verification recaptures originals in its own call, including after JSON serialization in a fresh process. Inputs/results must not be mutated. Both package entry points expose identical symbols and types.

| Condition | Operation result | Policy / verification result |
| --- | --- | --- |
| Unsupported/malformed policy, request, forged handle, resource limit before analysis | `ok: false` with `unsupported-version`, `invalid-policy`, `invalid-input`, or `resource-limit` | No usable policy or packet |
| Producer source/policy/runtime expectation mismatch | `ok: false`, `stale-input` | No replacement pin or packet |
| Required selector/edge/gate/ownership failure or required exploration limit | `ok: true`, packet and diagnostics | `unsatisfied`; no source parts |
| Resolved required union exceeds output budget | `ok: true`, packet and diagnostics | `unsatisfied`; complete required set may be known |
| Optional omissions only | `ok: true`, packet and diagnostics | `satisfied`; verifier may pass |
| Valid trusted input but malformed/tampered packet | `ok: true`, verification report | `fail`, including unknown packet version |
| Packet identity differs from expected identity, or original content differs from trusted pin | `ok: true`, verification report | `stale` |
| Verifier cannot evaluate its trusted input (bad policy/config or admission limit) | `ok: false`, explicit error | Never pass |

Projection errors use their own error union; do not expand existing local/corpus errors merely for this feature. When more than one defect exists, collect available diagnostics in phase order: decoding, identity, selection/gates, budget, packet comparison. Stale identity takes precedence over content differences. Never suppress a required failure because an optional selector covers the same bytes.

## 8. Experimental command

Extend the sole `markdown-trace-document` binary with mutually exclusive `--projection-manifest PATH` and `--verify-projection PATH --projection-manifest PATH` forms. The former produces packet JSON; the latter verifies the packet file using the manifest's independent expectations. Existing document flags (`--file`, `--profile`, `--format`, context/query arguments) are rejected in projection mode. `--help` documents both forms and their experimental schema versions.

The manifest is a strict `markdown-trace.projection-manifest.v1` JSON object containing the request/expectation fields in the types, source rows with `file` and `profileFile` replacing inline text/profile JSON, and `policyFile` replacing the policy handle. Paths resolve relative to the manifest directory; expected identities never come from the packet. Read each input once; refuse manifest configurations that would implicitly discover sources. Core receives explicit text after adapter loading. Do not automatically refresh pins or execute scripts from files.

New forms emit the packet or verification report directly as compact UTF-8 JSON with no BOM, envelope or trailing newline, using section 6's encoding. They perform no file writes. All operation errors, including `resource-limit` and `stale-input`, and invocation/I/O/configuration errors emit structured JSON on stderr only and exit 2; stdout is empty. Production exits 0 only for policy satisfaction, otherwise 1 with the unsatisfied packet. Verification exits 0 only for verification pass, otherwise 1 with a fail/stale report. `maxPacketUtf8Bytes` bounds packets, not verification reports or error responses, so even a zero packet limit can be diagnosed. These meanings and encoding apply only to the new forms; existing document output and exits remain unchanged. Callers redirect to a separate non-input path. A policy-aware text renderer is deferred; JSON is the required experimental command surface.

## 9. Ownership and implementation seams

Place the feature under `src/markdowntrace/document-graph/projection/`: policy decoding/compilation, Engine-backed source selection, requirement resolution, budget admission, packet contracts, and verification each own one operation. Reuse `analysis-state` only through an explicit internal source-capture accessor; keep WeakMaps private. Reuse corpus/direct-query resolution and entity/support/interval code through narrow internal contracts; do not fabricate selections or duplicate graph interpretation. Existing ownership/traversal semantics may require a bounded adapter for per-subject rules and ambiguous incident evidence; prove unchanged old behavior.

The CLI adapter owns manifest/file decoding and output transport; it must not own obligation decisions. Minimal integration edits belong in the common export index, command argument dispatch/help, and packed consumer harness. New focused tests belong beside existing document-graph tests; fixture policies remain domain-owned examples. No new publish step, binary, registry, package split, or installed-runtime activation is required.

## 10. Acceptance examples and discriminating proof

The runnable implementation shall include a one-source task and a corpus containing plan P, Task A, and unrelated Task B with a colliding local criterion ID. P's root action binds explicitly to A's criterion, which depends on A's constraint. An unlinked scope section, authority section, constraints section, and review-boundary section contain distinctive required text. The domain policy selects those sections explicitly and gates declaration/reference coverage. A separately authored expected list names exact source slices, required identities and excluded Task B text; neither the policy resolver nor packet producer generates this oracle.

| Case | Required observation | Task criteria |
| --- | --- | --- |
| Unknown policy/operator/field, duplicate JSON keys, malformed selector, invalid numeric bounds, fabricated policy handle | Compiler or ingress rejects configuration without a usable policy/packet; no ignored operator or partial policy | TD-SC-1 |
| Ordinary graph-only extraction | Can have complete coverage/no traversal limits while missing the four unlinked sections; new policy includes all four | TD-SC-1, TD-SC-2 |
| Required edge path, closure, cycle and terminal kind | Exact qualified dependencies, original occurrence reasons, fixed-point termination; no expansion of excluded terminal kinds | TD-SC-1, TD-SC-2, TD-SC-3 |
| Canonical evidence micro-oracles in section 4.5 | Exact complete arrays for incoming/both, repeated references, returning cycle, self-loop, unresolved incidence and frontier scan; corrupt orientation, depth, multiplicity or order and require verification failure | TD-SC-1, TD-SC-4 |
| Delete annotation, delete entire required section, duplicate heading path, ambiguous entity owner, break binding | Explicit non-pass for each defect; restoration passes; no first-match selection | TD-SC-2 |
| Missing relation that leaves no dangling reference | minSubjects/minNeighbors, explicit entities or domain source-coverage gate detects the omission | TD-SC-2 |
| Exact fit, one byte short, one fragment short, zero bytes, root fits but constraint does not | All required parts or none; exact required-union size; all known omissions and no satisfaction on truncation | TD-SC-3 |
| Required node/depth/visit boundary; same boundary only in optional rule | Required is unsatisfied; optional omission is visible and may pass; increasing bound repairs required result | TD-SC-3 |
| Unicode, CRLF, table/list/quote support and overlapping sections/entities | Exact ranges/text and deduplicated byte/fragment totals; no gap bridging | TD-SC-3, TD-SC-4 |
| Round trip in fresh process; change part text/range/reason, delete required excerpt and rewrite claimed hashes/status | Original verifies; every mutation fails without trusting packet claims | TD-SC-4 |
| Packet transport exact fit and one byte short | With source budgets ample, set a self-consistent `maxPacketUtf8Bytes = N` equal to the packet's compact encoding size, including the serialized limit field; choose N and N-1 with the same decimal width. API and redirected CLI packet verify unchanged. Reproduction at N-1 still needs N bytes and yields operation `resource-limit`, CLI exit 2 and empty stdout. Appending a newline at exact fit fails raw admission; reformatting within a larger unchanged limit still verifies | TD-SC-1, TD-SC-4, TD-SC-5 |
| Change original unlinked block under same revision, expected revision, policy bytes/rules, roots, profiles, binding or runtime identity | Stale or fail as specified; no automatic repinning | TD-SC-4 |
| Local validation fails only for explicitly bound external reference | Original report still fails; selected coverage gates and resolved required corpus obligations may satisfy policy | TD-SC-4, TD-SC-6 |
| Packed root and experimental entry points, both CLI forms, copied fixtures outside checkout | Same exact oracle/status/diagnostics; unchanged source bytes; old command/API regressions pass | TD-SC-5 |
| Measurement and claims audit | Actual original/projected source bytes plus host-measured serialized size; semantic sufficiency and read authority explicitly unperformed by runtime | TD-SC-6 |

Type-check the companion consumer before implementation with `npx tsc -p docs/design/projection-policy/tsconfig.json`. At implementation completion run focused policy/verification tests, packed consumers, `npm run ci:enforcement`, and `npm run check:package-exports`. Retain fixture/lockfile/runtime/source/policy identities with evidence. Type checking and document validation are design evidence only. No numeric savings or model-success target is an acceptance condition.

## 11. Readiness and handoff

Read this complete specification, its companion types/consumer, Task 04, current repository authority, and the relevant current source before implementation or whole-contract review. The Task 04 contract/checksum remain unchanged; satisfying this specification route does not mean any runtime criterion is complete. Runtime source and command behavior are preserved until implementation is explicitly requested.

The proposed implementation order is one-source required globals plus independent tamper/budget proof, then explicit corpus closure/verification, then packed API/CLI and guidance proof. The per-run execution specification and validation transcripts are ignored under `.codefactory/projection-policy-spec/`; they are not source deliverables. Its gates identify evidence and review responsibilities without adding approval authority to packets.

No unresolved technical choice is intentionally delegated to the implementer. Owner acceptance of this proposed contract is the remaining specification decision; implementation evidence remains future work. Semantic policy review must read complete sources and assess which global content, dependency rules, validation gates, and source-owned reading mandates apply to each real assignment.
