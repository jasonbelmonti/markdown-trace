---
type: ExecutionPlan
title: Implement exact source context projection
plan_id: task-2-source-projection
artifact_version: "2.0"
revision: "4"
created_at: 2026-09-25T02:32:40.161699+00:00
updated_at: 2026-09-25T04:18:34.275481+00:00
target_repo: /Users/jasonbelmonti/Documents/Development/markdown-trace
target_worktree: /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection
target_branch: codex/task-2-source-projection
baseline_ref: 728e3439c65b0fc65c27cefd69f16161ae866620
source_contract: docs/tasks/delegation-context/02-source-projection.md revision 1 SHA-256 5bb45b3b71aa9cf1523cc0f2cf89063c6071ca12b5807f89a874e8a01ad9d714
validation_profile: /Users/jasonbelmonti/.codex/skills/execution-plan/profiles/execution-plan.yaml
---

## Plan Control

| Plan state | Planning depth | Source status | Baseline status | State rationale |
| --- | --- | --- | --- | --- |
| READY | standard | current | inspected | Task REVIEW and semantic audit pass; final candidate requires both machine validators before checksum-first promotion. |


## Source Contract

| Source ID | Source reference | Version / fingerprint | Authority | Status | Planning implication |
| --- | --- | --- | --- | --- | --- |
| EP-SRC-1 | docs/tasks/delegation-context/02-source-projection.md | 5bb45b3b71aa9cf1523cc0f2cf89063c6071ca12b5807f89a874e8a01ad9d714 | Completion contract; latest user instruction authorizes complete serial implementation, local commits and capsule checkpoints | current | Preserve TD-SC-1 through TD-SC-5; do not rewrite criteria |
| EP-SRC-2 | AGENTS.md | 6400c9bc9e598a3beb485806cdd6a58e848144a2b73ee641623728f7f73436e0 | Repository instructions and selected C-7/OWN-7 semantics subordinate to latest user instruction; runtime source owns implemented behavior | current | Read complete source; preserve graph and retired-workflow boundaries |
| EP-SRC-3 | docs/tasks/delegation-context/README.md | 835688562be6f6f8ccf3d40085f2706538d0db161701ab308bc386643cf465a5 | Repository instructions and selected C-7/OWN-7 semantics subordinate to latest user instruction; runtime source owns implemented behavior | current | Read complete source; preserve graph and retired-workflow boundaries |
| EP-SRC-4 | docs/design/markdown-trace-document-graph-overview.md | bfa0cdbba260204b8f9e7a8b4ecc35c26184ea36b85ad1bb2a7f58c9a13fab34 | Repository instructions and selected C-7/OWN-7 semantics subordinate to latest user instruction; runtime source owns implemented behavior | current | Read complete source; preserve graph and retired-workflow boundaries |
| EP-SRC-5 | docs/current-implementation.md | 8e873ccd781ccf31c8b6f35842a62a6f16b0bf50ea1af7abcecacd1d92444358 | Repository instructions and selected C-7/OWN-7 semantics subordinate to latest user instruction; runtime source owns implemented behavior | current | Read complete source; preserve graph and retired-workflow boundaries |
| EP-SRC-6 | docs/design/markdown-trace-document-graph-interfaces.md | 192a7f915e09f30fcb2284a55ed196a554799db07fa06d9908d424e8d26b8efe | Repository instructions and selected C-7/OWN-7 semantics subordinate to latest user instruction; runtime source owns implemented behavior | current | Read complete source; preserve graph and retired-workflow boundaries |
| EP-SRC-7 | docs/tasks/delegation-context/01-bounded-traversal.md | 6be0510eeb9cc99b14ae9862012de47bf1357ebb1867bb6097b733697f80bb39 | Repository instructions and selected C-7/OWN-7 semantics subordinate to latest user instruction; runtime source owns implemented behavior | current | Read complete source; preserve graph and retired-workflow boundaries |
| EP-SRC-8 | docs/experimental-document-graph.md | e325765e6208d88f85b275ad46ffeb36c61efac43b62b81fd73ce8920b4a3de3 | Repository instructions and selected C-7/OWN-7 semantics subordinate to latest user instruction; runtime source owns implemented behavior | current | Read complete source; preserve graph and retired-workflow boundaries |
| EP-SRC-9 | docs/design/document-graph-api/contracts/context.d.ts | 3a4e94e011451e25974c47f0fe05f029b0247370bd643c1d58be2565706bbbf3 | Repository instructions and selected C-7/OWN-7 semantics subordinate to latest user instruction; runtime source owns implemented behavior | current | Read complete source; preserve graph and retired-workflow boundaries |
| EP-SRC-10 | README.md | ba6fa99b867bf50daa9cd05b975ff10b525eaaae4011b48d6bf3629015d0c60c | Current user-facing capability description; subordinate to Task 2 | current | Correct stale traversal/context status and link to implemented API usage in EP-ACT-4 |
| EP-SRC-11 | tests/test_skill_package.test.ts; skills/markdown-trace/references/link-language.md | 5915c3c049faf72c4c7a3a46903bc02c11b3d9041818e924c146a0118db39fc9; 374624f6eb7ba854cb12d3060e6d8309a721367e0ba324ca1d8386b922b1fd43 | Existing repository packaged-reference mirror and its compatibility check; not an installed workflow skill | current | Synchronize exact guide suffix into the shipped reference; preserve the existing test and all installed source skills |


The user request is retained verbatim at /Users/jasonbelmonti/.codex/attachments/500d0d3f-3a7c-48f5-88db-6e88b665d5e7/Pasted text.txt. Also follow the user-supplied operating manual for this repository: serial workers, worktree, task-definition, no source-skill/runtime changes, no merge/publication/activation. Historical baselines and proposal-status prose do not undo the implemented Task 1 at this baseline. Task 1 checkpoint is historical; its tests are rerun here.


## Outcome Anchors

| Outcome ID | Source IDs | Source location | Required observable | Proof obligation |
| --- | --- | --- | --- | --- |
| EP-OUT-1 | EP-SRC-1 | TD-SC-1 | Exact selected owned source plus required structure, excluding unselected descendants and ancestor bodies | Nested heading/list/quote/table fixtures; independent exact ranges/text; literal code, Unicode and CRLF |
| EP-OUT-2 | EP-SRC-1 | TD-SC-2 | Atomic byte/fragment admission with overlap counted once and a complete included/omitted partition | Shared support; overlap; gaps; exact-fit/one-short; zero; byte precedence; later-fitting entities; malformed numeric budgets |
| EP-OUT-3 | EP-SRC-1 | TD-SC-3 | Ambiguous definition-fragment owner omits the whole entity with evidence | Two declarations; both selected; zero budgets; support shared by an admitted entity; no-admitted case |
| EP-OUT-4 | EP-SRC-1 | TD-SC-4 | Captured source, issued compatible selections and serialized provenance | Input/file mutation; fresh analysis; stale and copied/fabricated handles; predecessor/query/boundary and diagnostics inspection |
| EP-OUT-5 | EP-SRC-1 | TD-SC-5 | Packed-package operation with preserved graph/profile/command semantics | Outside-checkout root and experimental consumers, independent excerpts, input hashes, documentation smoke, enforcement and package checks |


## Baseline Findings

| Finding ID | Repository evidence | Current behavior / constraint | Planning implication | Confidence |
| --- | --- | --- | --- | --- |
| EP-FIND-1 | traverse.ts; selection-state.ts; contracts/query.ts; baseline merge 728e343 | Issued selections carry analysisId, query/nodes/boundary; issuedSelectionAnalysisId reads a private WeakMap | Reuse issuance; compare analysis identity, permit repeat equivalent analysis | confirmed |
| EP-FIND-2 | analysis-state.ts; analyze.ts; contracts/analysis.ts | Private state retains Engine document and query indexes; snapshots retain SourceIdentity and fragment owners | Retain captured original text privately at analysis construction for slicing | confirmed |
| EP-FIND-3 | fragment-support.ts attachSupport; OWN-7; quote-table probe | Immediate-parent prefix expansion misses nested table rows; delimiter ends at next row column and captures its prefix | Expand container block starts to original line start; delimit delimiters before next row line; preserve block IDs/owners | confirmed |
| EP-FIND-4 | ownership.ts assignOwners; extract.ts | Leaf blocks already partition descendant scopes; code literal blocks have owners without occurrences | Use uniquely owned fragments; do not rescan Markdown or pull entire enclosing sections | confirmed |
| EP-FIND-5 | tests/test_document_graph_links.test.ts and traversal tests | 39 baseline tests pass after npm ci; Engine 3.6.0; public ranges UTF-16 | Keep original graph assertions; add independent projection proof | confirmed |
| EP-FIND-7 | tests/test_document_runtime_info.test.ts; scripts/runtime/integrity.mjs verifyPayload | Both hardcode analyzer experimental.2 | Advance the current identity assertion while retaining known prior .2 release verification | confirmed |
| EP-FIND-6 | package.json; scripts/package-exports/graph-consumer.mjs; tests/fixtures/public-package/consumer.ts.fixture | Both imports share index.ts; API smoke asserts exact runtime exports; command checks preserve read-only inputs | Export context and update exact export oracle; extend external consumer through existing package runner | confirmed |
| EP-FIND-8 | README.md introduction, What runs today and validation guidance | Describes traversal and context as future work despite delivered traversal and current projection implementation | Correct the primary capability entry point alongside the two selected API guides; no runtime or task-contract change | confirmed |
| EP-FIND-9 | tests/test_skill_package.test.ts line 31; failed final enforcement at bc4fcf5 | Existing test requires the complete guide suffix after Link identity language to equal the packaged reference; packet4 omitted this consumer and 116 of 117 tests passed | Reopen only packet4 for attempt2 after plan/bundle revision and capsule pivot; synchronize the repository reference and rerun affected gates; retain failed gate5 | confirmed |


## Preconditions

| Precondition ID | Required state / input | Verification | Unmet trigger ID |
| --- | --- | --- | --- |
| EP-PRE-1 | Current task checksum, READY plan and verified serial capsule assignment | Verify task/plan/bundle hashes, both plan validators and capsule status/read/ack receipt before worker edits | EP-TRIG-1 |
| EP-PRE-2 | Owned worktree at baseline plus accepted progress; installed lockfile environment | git status and git log; npm ci; node --version; verify package-lock.json and Engine 3.6.0 | EP-TRIG-1 |


## Implementation Decisions

| Decision ID | Kind | Decision or assumption | Finding IDs | Evidence / rationale | Affected action IDs | Replan trigger ID |
| --- | --- | --- | --- | --- | --- | --- |
| EP-DEC-1 | decision | Private captured text and context contracts | EP-FIND-1, EP-FIND-2 | Add text to AnalysisState at capture; use contracts/context.ts matching the companion C-7 shape and schema markdown-trace.document-context.v1. Keep Engine types private. Avoid source reload or hydration. | EP-ACT-1, EP-ACT-2 | EP-TRIG-1 |
| EP-DEC-2 | decision | Source fragment and support boundaries | EP-FIND-3, EP-FIND-4, EP-FIND-7 | Use Engine-derived blocks and resolved owners. Expand start to line start using SourcePosition.column when a block has a list/quote container, including table rows and code. Delimiter starts after header newline and ends before next row line, or table end. Preserve CR/LF/CRLF. No secondary parser, synthesized separators or ancestor body support. Existing heading/table dependency closure supplies support; the header and delimiter use table-header role. Bump analyzer version to 0.1.0-experimental.3 when fragment output changes to preserve identity. Update the exact runtime-info test and permit both known analyzer versions .2 and .3 in scripts/runtime/integrity.mjs so prior release verification remains available; reject arbitrary versions. These checks are source verification, not active installation. | EP-ACT-1 | EP-TRIG-1 |
| EP-DEC-3 | decision | Entity bundles and omissions | EP-FIND-1, EP-FIND-4 | Resolve each selected unique definition through occurrenceId/fragmentId. Ambiguous definition owner omits before budgets and adds no ranges/reasons. Otherwise gather all owned fragments matching that declaration ID and recursively gather requiredContext. Label directly owned ranges owned-content; dependencies heading or table-header even when their owner is omitted. Only admitted identifiers enter reasons. | EP-ACT-2 | EP-TRIG-1 |
| EP-DEC-4 | decision | Atomic union accounting | EP-FIND-3, EP-FIND-4 | For each bundle in selection order, trial the union with admitted ranges. Merge strictly overlapping intervals, combine identifiers/roles deterministically, leave touching intervals separate and never bridge gaps. Compute UTF-8 text bytes and number of final parts after union. Admit only if both totals fit; byte-budget precedes fragment-budget. Continue after omissions. No partial bundles, greedy fragment chopping or model-token accounting. | EP-ACT-2, EP-ACT-3 | EP-TRIG-1 |
| EP-DEC-5 | decision | Ingress and serialized identity | EP-FIND-1, EP-FIND-2 | Check issued analysis first, request/budget shape and nonnegative safe integer budgets, then issued selection (invalid-selection) and identity match (stale-selection). Same identity from a repeat analysis is allowed. Freeze returned outcome and all nested DTOs; preserve source, analysis summary, selection query/nodes/boundary and their relationship IDs. Parts equal captured text.slice exactly. | EP-ACT-2, EP-ACT-3 | EP-TRIG-1 |
| EP-DEC-6 | decision | Independent proof and integration | EP-FIND-5, EP-FIND-6, EP-FIND-8, EP-FIND-9 | Use hand-written expected excerpts and offsets, no projector-derived expectations. Internal interval tests may supply explicit synthetic overlaps; public shared-support tests prove integration. Add package types and external runtime assertions, with explicit source/profile inputs and before/after hashes. Update current implementation, API usage guide and README capability status, leaving controlling task/design unchanged. Synchronize skills/markdown-trace/references/link-language.md from the guide suffix as required by the existing mirror test; this is a repository distribution reference, not any installed task-definition/execution-plan/delegation/capsule skill. Preserve the mirror assertion unchanged. | EP-ACT-3, EP-ACT-4, EP-ACT-5 | EP-TRIG-1 |


## Execution Phases

| Phase ID | Phase objective | Entry precondition IDs | Safe intermediate state |
| --- | --- | --- | --- |
| EP-PH-1 | Correct capture and fragment support | EP-PRE-1, EP-PRE-2 | Graph facts preserved; exact support ranges and private capture compile |
| EP-PH-2 | Deliver tested public projection | EP-PRE-1, EP-PRE-2 | Atomic explained projection passes exact-source and adversarial evidence |
| EP-PH-3 | Prove package consumption and review readiness | EP-PRE-1, EP-PRE-2 | Current evidence covers all task criteria with local commits/checkpoints and no activation |


## Execution Route

| Step ID | Kind | Phase ID | Required prior Step IDs |
| --- | --- | --- | --- |
| EP-ACT-1 | action | EP-PH-1 | None |
| EP-GATE-1 | gate | EP-PH-1 | EP-ACT-1 |
| EP-ACT-2 | action | EP-PH-2 | EP-GATE-1 |
| EP-GATE-2 | gate | EP-PH-2 | EP-ACT-2 |
| EP-ACT-3 | action | EP-PH-2 | EP-GATE-2 |
| EP-GATE-3 | gate | EP-PH-2 | EP-ACT-3 |
| EP-ACT-4 | action | EP-PH-3 | EP-GATE-3 |
| EP-GATE-4 | gate | EP-PH-3 | EP-ACT-4 |
| EP-ACT-5 | action | EP-PH-3 | EP-GATE-4 |
| EP-GATE-5 | gate | EP-PH-3 | EP-ACT-5 |


## Execution Actions

| Action ID | Precondition IDs | Outcome IDs | Targets | Concrete action | Observable postcondition | Evidence to capture | Failure response ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EP-ACT-1 | EP-PRE-1, EP-PRE-2 | EP-OUT-1, EP-OUT-4 | src/markdowntrace/document-graph/ prefix applies to runtime filenames; analysis-state.ts, analyze.ts, fragment-support.ts, versions.ts, contracts/context.ts; tests/test_document_graph_fragment_support.test.ts, tests/test_document_runtime_info.test.ts; scripts/runtime/integrity.mjs | Retain captured text, add C-7 DTO types and correct container/table support bounds with independent LF/CRLF/CR tests | Existing occurrences/relationships/owners unchanged; exact quote/list/table ranges and immutable state compile | .context-capsule/execution/runs/task-2/act-1: diff, tested inputs, commands, exit codes and worker proposal | EP-RESP-1 |
| EP-ACT-2 | EP-PRE-1, EP-PRE-2 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4 | src/markdowntrace/document-graph/ prefix applies to runtime filenames; context.ts; context/{bundles,intervals}.ts; index.ts; tests/test_document_graph_context.test.ts | Implement public extractContext, bounded bundle construction/union, handle ingress, omission evidence and serialization; add a focused independent public example | Public operation returns exact admitted parts and complete omissions; source and selection are preserved | .context-capsule/execution/runs/task-2/act-2: diff, tested inputs, commands, exit codes and worker proposal | EP-RESP-1 |
| EP-ACT-3 | EP-PRE-1, EP-PRE-2 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4 | src/markdowntrace/document-graph/ prefix applies to runtime filenames; tests/test_document_graph_context*.test.ts; tests/document-graph-context fixtures; context/intervals.test.ts if needed | Add independently specified nested-layout, atomic-budget, ambiguity and provenance counterexamples; correct bounded in-scope implementation defects discovered by those checks | All TD-SC-1 through TD-SC-4 observations are asserted at the public boundary; synthetic interval cases supplement public overlap proof | .context-capsule/execution/runs/task-2/act-3: diff, tested inputs, commands, exit codes and worker proposal | EP-RESP-1 |
| EP-ACT-4 | EP-PRE-1, EP-PRE-2 | EP-OUT-5 | src/markdowntrace/document-graph/ prefix applies to runtime filenames; scripts/package-exports/{graph-consumer,context-consumer,consumer}.mjs; tests/fixtures/public-package/consumer.ts.fixture; docs/{experimental-document-graph,current-implementation}.md; README.md; skills/markdown-trace/references/link-language.md | Expose and consume all context types/functions from packed root and experimental imports; test explicit external source/profile preservation and document executable usage; reconcile README capability status with that usage and synchronize the repository packaged language reference | Outside-checkout consumers compare exact excerpts; usage example runs; packaged language reference matches its authoritative guide; existing command/root behavior remains | .context-capsule/execution/runs/task-2/act-4: diff, tested inputs, commands, exit codes and worker proposal | EP-RESP-1 |
| EP-ACT-5 | EP-PRE-1, EP-PRE-2 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4, EP-OUT-5 | src/markdowntrace/document-graph/ prefix applies to runtime filenames; .context-capsule/execution/runs/task-2 and execution/final-report.md; source Git | Coordinator inspects all diffs and evidence, runs final enforcement and documentation smoke, checks applicability, makes coherent authorized commits and publishes checkpoint | Review-ready source commit with all criterion evidence and complete checkpoint references; independent task review remains required | .context-capsule/execution/runs/task-2/act-5: diff, tested inputs, commands, exit codes and worker proposal | EP-RESP-1 |


## Change Footprint

| Path / component | Action IDs | Change type | Purpose | Confidence | Risk / ownership note |
| --- | --- | --- | --- | --- | --- |
| src/markdowntrace/document-graph/{analysis-state,analyze,fragment-support,versions}.ts | EP-ACT-1 | modify | Capture text and correct support boundaries | confirmed | Existing ownership facts preserved; analyzer identity advances |
| tests/test_document_runtime_info.test.ts; scripts/runtime/integrity.mjs | EP-ACT-1 | modify | Keep current and retained analyzer-version verification consistent | confirmed | Exact known versions only; no activation |
| src/markdowntrace/document-graph/contracts/context.ts | EP-ACT-1 | add | C-7 public DTO shape | confirmed | No Engine type leakage |
| src/markdowntrace/document-graph/context.ts and context/ | EP-ACT-2, EP-ACT-3 | add | Ingress, entity bundle collection and interval admission | confirmed | Keep each responsibility focused; no I/O |
| src/markdowntrace/document-graph/index.ts | EP-ACT-2 | modify | Experimental and root exports | confirmed | Exact export oracle updated during package action |
| tests/test_document_graph_fragment_support.test.ts and tests/test_document_graph_context*.test.ts; tests/document-graph-context/ | EP-ACT-1, EP-ACT-2, EP-ACT-3 | add | Independent behavior oracles | confirmed | No weakening existing assertions |
| scripts/package-exports/; tests/fixtures/public-package/consumer.ts.fixture | EP-ACT-4 | modify | Packed runtime and type proof | confirmed | Keep independent expected results and explicit input hashes |
| docs/experimental-document-graph.md; docs/current-implementation.md; README.md; skills/markdown-trace/references/link-language.md | EP-ACT-4 | modify | Document callable projection and limits | confirmed | No edit to task or selected design contract |
| .context-capsule/execution/ | EP-ACT-1, EP-ACT-2, EP-ACT-3, EP-ACT-4, EP-ACT-5 | record | Mutable trial and verification evidence | confirmed | Never commit capsule files to source Git |


## Validation Gates

| Gate ID | Outcome IDs | Command or check | Expected observation | Evidence capture | Evidence artifact | Evidence verification | Failure response ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EP-GATE-1 | EP-OUT-1, EP-OUT-4 | npm run typecheck; npm test -- tests/test_document_graph_fragment_support.test.ts tests/test_document_graph_links.test.ts tests/test_document_graph_traversal.test.ts tests/test_document_runtime_info.test.ts; coordinator inspect verifyPayload permits only experimental.2 and experimental.3 | Exact nested quote/list/table prefix and delimiter ranges, no next-row leakage; existing graph/traversal cases pass | Coordinator captures stdout/stderr/exit and before/after content SHA-256 inventory of tracked and relevant untracked source, tests, fixtures, config, lockfile, dist plus Node/npm/Engine versions. Preserve worker diff. Inputs must stay unchanged during checks. | .context-capsule/execution/runs/task-2/gate-1.json and gate-1.log | Inspect exact assertions/results, zero exit and identical input hashes. Later edits to shared runtime/fixtures/tests/config invalidate affected gates; retain old evidence and rerun. Documentation-only edits do not invalidate unrelated runtime checks after inspected comparison. | EP-RESP-1 |
| EP-GATE-2 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4 | npm run typecheck; npm test -- tests/test_document_graph_context.test.ts | Exact independent public excerpts, source-order and budget/omission partition; no unselected descendant body | Coordinator captures stdout/stderr/exit and before/after content SHA-256 inventory of tracked and relevant untracked source, tests, fixtures, config, lockfile, dist plus Node/npm/Engine versions. Preserve worker diff. Inputs must stay unchanged during checks. | .context-capsule/execution/runs/task-2/gate-2.json and gate-2.log | Inspect exact assertions/results, zero exit and identical input hashes. Later edits to shared runtime/fixtures/tests/config invalidate affected gates; retain old evidence and rerun. Documentation-only edits do not invalidate unrelated runtime checks after inspected comparison. | EP-RESP-1 |
| EP-GATE-3 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4 | npm test -- tests/test_document_graph_context; npm test -- tests/test_document_graph_fragment_support.test.ts tests/test_document_graph_links.test.ts tests/test_document_graph_traversal.test.ts | Nested layouts and literal Unicode/CRLF, shared support/overlap/gaps, exact-fit/one-short/zero/unsafe budgets, ambiguous-owner precedence, later fit, input mutation, stale/forged rejection, repeat identity and JSON provenance all match independent expectations | Coordinator captures stdout/stderr/exit and before/after content SHA-256 inventory of tracked and relevant untracked source, tests, fixtures, config, lockfile, dist plus Node/npm/Engine versions. Preserve worker diff. Inputs must stay unchanged during checks. | .context-capsule/execution/runs/task-2/gate-3.json and gate-3.log | Inspect exact assertions/results, zero exit and identical input hashes. Later edits to shared runtime/fixtures/tests/config invalidate affected gates; retain old evidence and rerun. Documentation-only edits do not invalidate unrelated runtime checks after inspected comparison. | EP-RESP-1 |
| EP-GATE-4 | EP-OUT-5 | npm test -- tests/test_skill_package.test.ts; npm run build; npm run check:package-exports; coordinator executes documented API example with built package imports and checks README capability links/status | Packaged language mirror passes its unchanged test; both packed entrypoints and type closure pass outside checkout; source/profile hashes unchanged; documentation excerpt matches independently expected parts | Coordinator captures stdout/stderr/exit and before/after content SHA-256 inventory of tracked and relevant untracked source, tests, fixtures, config, lockfile, dist plus Node/npm/Engine versions. Preserve worker diff. Inputs must stay unchanged during checks. | .context-capsule/execution/runs/task-2/gate-4.json and gate-4.log | Inspect exact assertions/results, zero exit and identical input hashes. Later edits to shared runtime/fixtures/tests/config invalidate affected gates; retain old evidence and rerun. Documentation-only edits do not invalidate unrelated runtime checks after inspected comparison. | EP-RESP-1 |
| EP-GATE-5 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4, EP-OUT-5 | npm run ci:enforcement; coordinator verifies criterion evidence and capsule checkpoint status | All repository enforcement/package/command checks pass without source drift; all five current criteria evidenced; source clean; complete returned checkpoint retained | Coordinator captures stdout/stderr/exit and before/after content SHA-256 inventory of tracked and relevant untracked source, tests, fixtures, config, lockfile, dist plus Node/npm/Engine versions. Preserve worker diff. Inputs must stay unchanged during checks. | .context-capsule/execution/runs/task-2/gate-5.json and gate-5.log | Inspect exact assertions/results, zero exit and identical input hashes. Later edits to shared runtime/fixtures/tests/config invalidate affected gates; retain old evidence and rerun. Documentation-only edits do not invalidate unrelated runtime checks after inspected comparison. | EP-RESP-1 |


## Failure and Replan Controls

| Response ID | Trigger | Containment | Exact recovery / rollback procedure | Single restored safe state | Verification | Escalation trigger ID |
| --- | --- | --- | --- | --- | --- | --- |
| EP-RESP-1 | Failed action, proof, integrity, capsule receipt or scope conflict | Stop dependent steps and all writers; preserve diff, failed output and attempt identity | Inspect git diff/status and capsule status. Preserve partial changes; correct within assigned surface only under recorded attempt cap. No reset/stash/clean. For context failure follow installed recovery help with verified quiescence; for route changes revise plan/bundle and pivot before resuming. | Stopped owned worktree with complete preserved evidence and no active writer | Coordinator checks worker terminal status, git status and capsule binding/diagnostics/incompleteOperations | EP-TRIG-1 |


| Trigger ID | Observable trigger | Stopped Step IDs | Evidence to preserve | Required decision / input | Exact resume condition |
| --- | --- | --- | --- | --- | --- |
| EP-TRIG-1 | Source mismatch, failure beyond packet cap, unresolved ownership semantics, unavailable runtime or invalid capsule state | EP-ACT-1, EP-GATE-1, EP-ACT-2, EP-GATE-2, EP-ACT-3, EP-GATE-3, EP-ACT-4, EP-GATE-4, EP-ACT-5, EP-GATE-5 | Full failed result, source diff/hashes, task/plan/bundle versions and capsule status | Coordinator resolves implementation/environment within route; owner resolves any observable contract change | Required sources and runtime verify; affected plan/bundle validators and gates pass; capsule has valid session receipt; next attempt is within cap |

### Compatibility and Versioning

EP-ACT-1 changes fragment boundaries only where needed by OWN-7 and advances analyzer identity. EP-ACT-2 adds C-7 types/API to both existing entrypoints. EP-GATE-1 preserves graph facts; EP-GATE-4 and EP-GATE-5 preserve packed types and command behavior. EP-RESP-1 contains failed compatibility checks under EP-TRIG-1. No retired workflow, publication or active installation is permitted.


## Plan Readiness

| Decision | Reviewed at | Evidence / rationale | Required revision or blocker |
| --- | --- | --- | --- |
| PASS | 2026-09-25T04:18:34.275481+00:00 coordinator | Semantic route audit: all five task anchors are preserved; inspected capture/selection/fragment/package owners support decisions; the quote-table counterexample closes structural uncertainty; all actions/gates occur once in prior-dependent order and phases end in proof; independent oracles discriminate leakage/accounting/identity failures; input hashes and rechecks govern applicability; stopped-worktree recovery preserves edits; worker can begin without design choices. Revision 2 route audit includes both analyzer identity consumers, preserves prior-release verification and the exact ten-step ordering. Revision 3 adds only the README correction to EP-ACT-4 and its due gate; preceding packets and all ten ordered steps are unchanged. Revision 4 reconciles expected accepted documentation progress, adds the existing packaged-reference consumer to EP-ACT-4 and EP-GATE-4, and preserves all ten route rows. Gate5 failure revokes packet4 final acceptance; its second total attempt retains gpt-6-luna because the cause was omitted plan footprint, not an unresolved implementation design. Earlier packets remain accepted; affected gates4/5 rerun under recovery. Both machine gates must pass on the final candidate before promotion. | None. |


## Revision Log

| Revision | Timestamp | Actor | Material change | Reason / source | Checksum reference |
| --- | --- | --- | --- | --- | --- |
| 1 | 2026-09-25T02:32:40.161699+00:00 | Codex coordinator | Create five-action route with serial workers for actions 1-4 and coordinator action 5 | Authorized Task 2 sequence and inspected Task 1 merge baseline | execution-plan.sha256 |
| 2 | 2026-09-25T02:40:26.625740+00:00 | Codex coordinator | Include analyzer identity consumers in EP-ACT-1 and EP-GATE-1 | Pre-edit discovery of exact-version runtime test and verifier; no task-contract change | execution-plan.sha256 |
| 3 | 2026-09-25T03:41:58.359590+00:00 | Codex coordinator | Include README capability-status reconciliation in EP-ACT-4 and EP-GATE-4 | Inspection found the main product entry still calls traversal/context future work; TD-SC-5 documentation scope is unchanged | execution-plan.sha256 |
| 4 | 2026-09-25T04:18:34.275481+00:00 | Codex coordinator | Include repository packaged language-reference synchronization in EP-ACT-4 and its mirror check in EP-GATE-4 | Final enforcement revealed omitted documentation consumer; task outcomes unchanged, installed source skills remain untouched | execution-plan.sha256 |
