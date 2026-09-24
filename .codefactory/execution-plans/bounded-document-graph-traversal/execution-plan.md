---
type: ExecutionPlan
title: Implement bounded document graph traversal
plan_id: bounded-document-graph-traversal
artifact_version: "2.0"
revision: "4"
created_at: 2026-09-24T08:54:24-05:00
updated_at: 2026-09-24T09:04:40-05:00
target_repo: /Users/jasonbelmonti/Documents/Development/markdown-trace
target_worktree: /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/bounded-traversal-capsule
target_branch: codex/bounded-traversal-capsule
baseline_ref: fb64872ceb078610f58e0bfaea6500fdaf77f5b5
source_contract: docs/tasks/delegation-context/01-bounded-traversal.md revision 1 sha256 cdc1a012195c7055e81e6cd178489d41e03088089394d895f7698f4b1a61372e
validation_profile: /Users/jasonbelmonti/.codex/skills/execution-plan/profiles/execution-plan.yaml
---

## Plan Control

| Plan state | Planning depth | Source status | Baseline status | State rationale |
| --- | --- | --- | --- | --- |
| READY | standard | current | inspected | Revised route passed semantic audit and both validators; the current-implementation inventory is included in the documentation action. |

## Source Contract

| Source ID | Source reference | Version / fingerprint | Authority | Status | Planning implication |
| --- | --- | --- | --- | --- | --- |
| EP-SRC-1 | docs/tasks/delegation-context/01-bounded-traversal.md, Task Scope and TD-SC-1 through TD-SC-5 | revision 1; sha256 cdc1a012195c7055e81e6cd178489d41e03088089394d895f7698f4b1a61372e | Primary completion, proof and review boundary; newer owner retirement instruction controls conflicting legacy compatibility wording. | current | Implement C-6 on the graph, prove direct and packed consumers, preserve current graph behavior. |
| EP-SRC-2 | AGENTS.md; docs/design/markdown-trace-document-graph-overview.md sections 3 and 7 | baseline fb64872ceb078610f58e0bfaea6500fdaf77f5b5; overview revision 6 sha256 bfa0cdbba260204b8f9e7a8b4ecc35c26184ea36b85ad1bb2a7f58c9a13fab34 | Repository operation and product direction; owner retirement supersedes old root compatibility. | current | Work in this worktree, use current graph and Engine, keep retired workflows absent. |
| EP-SRC-3 | docs/design/markdown-trace-document-graph-interfaces.md C-6 and Common rules | revision 10 sha256 192a7f915e09f30fcb2284a55ed196a554799db07fa06d9908d424e8d26b8efe | Selected traversal semantics; unrelated proposed C-2/C-4/C-7 fields are not adopted. | current | Match BFS ordering, endpoint resolution, immutable issued selection and visible limits. |
| EP-SRC-4 | docs/current-implementation.md; package.json; current graph source and tests | baseline fb64872ceb078610f58e0bfaea6500fdaf77f5b5 | Implemented baseline evidence, not new outcome authority. | current | Retain root and experimental graph exports, direct queries, validation and document command. |

## Outcome Anchors

| Outcome ID | Source IDs | Source location | Required observable | Proof obligation |
| --- | --- | --- | --- | --- |
| EP-OUT-1 | EP-SRC-1, EP-SRC-3 | TD-SC-1; C-6 | Public traversal returns canonical BFS nodes and predecessor reasons across directions and relation filters. | Hand-audited diamond, repeated edge, cycle and self-link oracle with exact IDs and order. |
| EP-OUT-2 | EP-SRC-1, EP-SRC-3 | TD-SC-2; C-6 | Depth/node boundaries and inspected unresolved relationship counts remain explicit. | Exact-fit, one-short, zero-depth and invalid-bound observations. |
| EP-OUT-3 | EP-SRC-1, EP-SRC-3 | TD-SC-3; C-6 | Invalid roots fail, unresolved/uncertain edges do not enter selection, forbidden resolved edges remain eligible. | Counterexamples plus unchanged direct-query and snapshot evidence. |
| EP-OUT-4 | EP-SRC-1, EP-SRC-3 | TD-SC-4; C-6 Common rules | Selection is issued, detached, deeply immutable and analysis-bound. | Fabricated analysis rejection, input/output mutation attempts and repeat identity cases. |
| EP-OUT-5 | EP-SRC-1, EP-SRC-2 | TD-SC-5; Review Boundary | Packed root and experimental graph consumers can call traversal while existing graph/command behavior remains. | Installed tarball TypeScript/runtime proof, current guide example and enforcement. |

## Baseline Findings

| Finding ID | Repository evidence | Current behavior / constraint | Planning implication | Confidence |
| --- | --- | --- | --- | --- |
| EP-FIND-1 | src/markdowntrace/document-graph/analyze.ts registerAnalysis; analysis-state.ts | Issued analyses use a WeakMap; incoming and outgoing indexes hold the same ReferenceMatch objects and retain invalid facts. | Traverse these private indexes without extracting or parsing again. | confirmed |
| EP-FIND-2 | src/markdowntrace/document-graph/queries.ts; contracts/query.ts | Direct query ownership is localized; graph API uses Outcome, strict input checks and deep freeze. | Put traversal in a focused sibling module and extend the owned query contract. | confirmed |
| EP-FIND-3 | src/markdowntrace/document-graph/index.ts; package.json; scripts/package-exports/graph-consumer.mjs | Package root and experimental subpath resolve the same graph index; packed smoke asserts exact export names. | Export traversal once and update installed consumer assertions and type fixture. | confirmed |
| EP-FIND-4 | tests/test_document_graph_api.test.ts; fixtures/document-graph/mixed-layout.md | Existing direct-query tests prove located references but no traversal; root task checksum and Markdown Engine profile pass. | Add independent traversal cases without weakening direct-query or validation checks. | confirmed |
| EP-FIND-5 | git diff 24d33c1..fb64872; AGENTS.md; task TD-SC-5 | Task's old source baseline predates owner retirement; merged root now exports graph and no legacy CLI. | Treat current graph root as preserved behavior under latest owner authority; do not restore legacy API. | confirmed |
| EP-FIND-6 | capsule status for run bounded-traversal-20260924 | Capsule binding is active and verified, source at fb64872, current session acknowledged the selected input. | Record plan and evidence in execution context; source work remains in assigned worktree. | confirmed |

| EP-FIND-7 | Initial focused Vitest output in this Capsule worktree | Default Vitest discovery imports the copied .context-capsule/context/tests tree, whose selected source subset is intentionally incomplete. | Exclude the generated context tree from repository test discovery without reducing real test coverage. | confirmed |
| EP-FIND-8 | tests/test_skill_package.test.ts; skills/markdown-trace/references/link-language.md | The bundled skill copies the guide Results and limits section byte-for-byte. Updating traversal availability changes that mirror. | Synchronize the authoritative guide and bundled copy in documentation action and rerun enforcement. | confirmed |
| EP-FIND-9 | docs/current-implementation.md | The live implementation inventory still lists bounded traversal as follow-up work. | Update this current-state inventory when the operation is proven. | confirmed |

## Preconditions

| Precondition ID | Required state / input | Verification | Unmet trigger ID |
| --- | --- | --- | --- |
| EP-PRE-1 | Task and design checksums are valid, source baseline and Capsule receipt are current. | Verify adjacent SHA-256 records, git rev-parse HEAD, capsule status with session. | EP-TRIG-1 |
| EP-PRE-2 | Node satisfies package engines and npm dependencies install cleanly in this worktree. | node --version; npm ci; npm run typecheck before source edits. | EP-TRIG-2 |

## Implementation Decisions

| Decision ID | Kind | Decision or assumption | Finding IDs | Evidence / rationale | Affected action IDs | Replan trigger ID |
| --- | --- | --- | --- | --- | --- | --- |
| EP-DEC-1 | decision | Add a focused traversal module over private analysis indexes and a runtime-issued selection registry. | EP-FIND-1, EP-FIND-2 | Reuses one captured graph. Parallel graph construction or serialized handle import would duplicate facts and weaken identity. | EP-ACT-1, EP-ACT-2 | EP-TRIG-3 |
| EP-DEC-2 | decision | Inspect all direction-eligible incident relationships at admitted nodes, including depth/node boundaries, and count each unresolved relationship ID once. | EP-FIND-1 | This makes omissions visible without claiming unseen-region completeness; policy validity never filters graph facts. | EP-ACT-2, EP-ACT-3 | EP-TRIG-3 |
| EP-DEC-3 | assumption | Current package root is the compatibility target after PR 94; the Task 1 criterion does not revive retired exports. | EP-FIND-3, EP-FIND-5 | Latest explicit owner retirement authority and merged AGENTS.md supersede the old source snapshot. | EP-ACT-4 | EP-TRIG-1 |

| EP-DEC-4 | decision | Exclude .context-capsule/** from the package test script while retaining all source tests. | EP-FIND-7 | The copied context is task input, not an executable checkout; deleting or changing it would corrupt the acknowledged input. | EP-ACT-3 | EP-TRIG-3 |
| EP-DEC-5 | decision | Keep the bundled skill language mirror byte-identical to the current guide. | EP-FIND-8 | The skill package test enforces that current user-facing description. | EP-ACT-4 | EP-TRIG-3 |
| EP-DEC-6 | decision | Update the current implementation inventory as part of the documentation action. | EP-FIND-9 | Repository instructions designate it as current implementation authority. | EP-ACT-4 | EP-TRIG-3 |

## Execution Phases

| Phase ID | Phase objective | Entry precondition IDs | Safe intermediate state |
| --- | --- | --- | --- |
| EP-PH-1 | Prove bounded selection at the graph API boundary. | EP-PRE-1, EP-PRE-2 | Focused traversal tests pass; pre-existing direct query behavior remains intact. |
| EP-PH-2 | Prove installed-package behavior and document use. | EP-PRE-2 | Built package and repository enforcement pass with current graph exports. |

## Execution Route

| Step ID | Kind | Phase ID | Required prior Step IDs |
| --- | --- | --- | --- |
| EP-ACT-1 | action | EP-PH-1 | None |
| EP-ACT-2 | action | EP-PH-1 | EP-ACT-1 |
| EP-ACT-3 | action | EP-PH-1 | EP-ACT-2 |
| EP-GATE-1 | gate | EP-PH-1 | EP-ACT-3 |
| EP-ACT-4 | action | EP-PH-2 | EP-GATE-1 |
| EP-GATE-2 | gate | EP-PH-2 | EP-ACT-4 |
| EP-GATE-3 | gate | EP-PH-2 | EP-GATE-2 |

## Execution Actions

| Action ID | Precondition IDs | Outcome IDs | Targets | Concrete action | Observable postcondition | Evidence to capture | Failure response ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EP-ACT-1 | EP-PRE-1, EP-PRE-2 | EP-OUT-4 | src/markdowntrace/document-graph/contracts/query.ts; selection-state.ts | Add TraversalQuery, GraphSelection, boundary and predecessor types; register issued selections privately. | Types compile and only issued selections are recognized by the private registry. | Diff and typecheck output tied to working tree fingerprint. | EP-RESP-1 |
| EP-ACT-2 | EP-PRE-1, EP-PRE-2 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4 | src/markdowntrace/document-graph/traverse.ts; src/markdowntrace/document-graph/index.ts; analysis-state.ts indexes | Implement strict input/root checks, canonical BFS and boundary inspection on existing graph facts; clone/freeze query and result. | Traversal returns one immutable selection without changing analysis or direct queries, and is exported from the graph index. | Diff and focused behavior output tied to fixture hash. | EP-RESP-1 |
| EP-ACT-3 | EP-PRE-2 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4 | tests/test_document_graph_traversal.test.ts; package.json test script | Add hand-audited traversal cases and exclude the Capsule input-copy path from Vitest discovery. | Focused suite distinguishes wrong path, hidden omission and invalid-edge admission without collecting copied context inputs. | Test output and fixture/source fingerprints. | EP-RESP-1 |
| EP-ACT-4 | EP-PRE-2 | EP-OUT-5 | scripts/package-exports/graph-consumer.mjs; tests/fixtures/public-package/consumer.ts.fixture; docs/experimental-document-graph.md; skills/markdown-trace/references/link-language.md; docs/current-implementation.md | Assert traversal in installed root/subpath runtime and types, document bounded use/limits, synchronize the skill guide mirror, and update the current implementation inventory. | Both packed entry points expose the operation and guide example matches callable API. | Diff, packed consumer result and guide command output. | EP-RESP-1 |

## Change Footprint

| Path / component | Action IDs | Change type | Purpose | Confidence | Risk / ownership note |
| --- | --- | --- | --- | --- | --- |
| src/markdowntrace/document-graph/contracts/query.ts; selection-state.ts | EP-ACT-1 | modify/add | Own public selection shapes and private issuance. | confirmed | Keep live-handle internals out of serialized DTO contract. |
| src/markdowntrace/document-graph/traverse.ts | EP-ACT-2 | add | Own bounded traversal and boundary computation. | confirmed | Reuse index facts; do not reparse or filter invalid policy facts. |
| tests/test_document_graph_traversal.test.ts; package.json test script | EP-ACT-3 | add/modify | Prove selection semantics with independent expected paths and omit Capsule input copies from test collection. | confirmed | Existing direct-query tests remain unchanged. |
| index.ts | EP-ACT-2 | modify | Expose traversal through both package entry points. | confirmed | Keep direct graph exports unchanged. |
| Packed consumer script and fixture; docs/experimental-document-graph.md; skills/markdown-trace/references/link-language.md; docs/current-implementation.md | EP-ACT-4 | modify | Prove and explain one package API and keep current documentation aligned. | confirmed | Package root and subpath share index; CLI remains unchanged. |

## Validation Gates

| Gate ID | Outcome IDs | Command or check | Expected observation | Evidence capture | Evidence artifact | Evidence verification | Failure response ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EP-GATE-1 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4 | npm run typecheck; npm test -- tests/test_document_graph_traversal.test.ts tests/test_document_graph_api.test.ts | Exact BFS/reason/limit/defect/mutation assertions pass and direct queries still pass. | Save stdout, exit codes, HEAD plus git diff hash, fixture/profile hashes, Node and lockfile hash; compare inputs before/after. | .context-capsule/execution/focused-proof.json | Verify report lists the test cases, zero failures and matching input hashes; rerun if selection/index/tests/fixtures change. | EP-RESP-1 |
| EP-GATE-2 | EP-OUT-5 | npm run check:package-exports; run the documented example | Packed TypeScript and runtime root/subpath traversal succeed with expected node/reason output and no retired exports. | Save stdout, exit codes, package tarball identity, source diff hash and guide input hash; compare input state. | .context-capsule/execution/package-proof.json | Verify installed consumer assertions ran and package/build inputs match; rerun if export, package, consumer fixture or graph implementation changes. | EP-RESP-1 |
| EP-GATE-3 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4, EP-OUT-5 | npm run ci:enforcement | All retained tests, skill package mirror, and package/command gates pass without reintroducing retired workflows. | Save full output and exit code with HEAD, source diff hash, lockfile, Node and relevant fixture hashes; compare input state after command. | .context-capsule/execution/enforcement-proof.json | Verify test count and package smoke observations, unchanged inputs and no source dirtiness beyond intended edits; rerun affected gates if shared code/assertions/config change. | EP-RESP-1 |

## Failure and Replan Controls

| Response ID | Trigger | Containment | Exact recovery / rollback procedure | Single restored safe state | Verification | Escalation trigger ID |
| --- | --- | --- | --- | --- | --- | --- |
| EP-RESP-1 | An action or gate fails | Stop dependent route steps; preserve diff and command evidence. | Repair only the owning file/module and rerun the failed gate plus affected downstream gates; do not reset or clean the worktree. | Reviewed worktree retains complete edits and the last passing gate evidence. | git status --short; inspect saved gate result and affected diff before retry. | EP-TRIG-3 |

| Trigger ID | Observable trigger | Stopped Step IDs | Evidence to preserve | Required decision / input | Exact resume condition |
| --- | --- | --- | --- | --- | --- |
| EP-TRIG-1 | Task/design checksum mismatch or a current authority requires legacy API restoration. | EP-ACT-1, EP-ACT-2, EP-ACT-3, EP-ACT-4, EP-GATE-1, EP-GATE-2, EP-GATE-3 | Task/source hashes and compared contract text. | Resolve source integrity or revise Task 1 through task-definition workflow. | Verified current source contract and no unresolved compatibility conflict. |
| EP-TRIG-2 | Node/npm dependency installation or baseline typecheck unavailable. | EP-ACT-1, EP-ACT-2, EP-ACT-3, EP-ACT-4, EP-GATE-1, EP-GATE-2, EP-GATE-3 | Tool versions, installer output and worktree status. | Restore supported toolchain or dependency access. | npm ci and baseline npm run typecheck pass in assigned worktree. |
| EP-TRIG-3 | Observed graph/index semantics cannot meet C-6 within current task or verification reveals material contradiction. | EP-ACT-2, EP-ACT-3, EP-ACT-4, EP-GATE-1, EP-GATE-2, EP-GATE-3 | Reproduction, partial diff and failed gate output. | Reconcile task/design authority and revise plan if route changes. | A source-consistent, validated route and the affected gate pass. |

## Plan Readiness

| Decision | Reviewed at | Evidence / rationale | Required revision or blocker |
| --- | --- | --- | --- |
| PASS | 2026-09-24T09:04:40-05:00 by Codex | All source outcomes remain covered; current implementation inventory update prevents stale agent guidance without changing scope. | None. |

## Revision Log

| Revision | Timestamp | Actor | Material change | Reason / source | Checksum reference |
| --- | --- | --- | --- | --- | --- |
| 1 | 2026-09-24T08:54:24-05:00 | Codex | Initial bounded traversal route from merged graph. | Task 1 revision 1 and merged PR 94 baseline. | execution-plan.sha256 |
| 2 | 2026-09-24T08:59:18-05:00 | Codex | Exclude generated Capsule input copies from Vitest discovery in the existing test action. | Focused gate collected .context-capsule/context/tests and failed to resolve its intentionally partial source tree. | execution-plan.sha256 |
| 3 | 2026-09-24T09:03:30-05:00 | Codex | Synchronize bundled skill language mirror with current guide in documentation action. | Enforcement identified a generated mirror expectation in test_skill_package. | execution-plan.sha256 |
| 4 | 2026-09-24T09:04:40-05:00 | Codex | Update the current implementation inventory with delivered traversal. | Repository agent guidance relies on that inventory. | execution-plan.sha256 |
