---
type: ExecutionPlan
title: Produce portable Markdown Trace runtime
plan_id: portable-trace-runtime
artifact_version: "2.0"
revision: "1"
created_at: 2026-09-22T02:00:00Z
updated_at: 2026-09-22T02:00:00Z
target_repo: /Users/jasonbelmonti/Documents/Development/markdown-trace
target_worktree: /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/portable-runtime-implementation
target_branch: codex/portable-runtime-implementation
baseline_ref: 90610cdabca6dfc04e069451798a2ef19b08cf2b
source_contract: docs/tasks/portable-trace-runtime.md revision 1 SHA-256 6c4528f02d912848784c22761f5e43f4c65783fb95ab1aae536b9f1a711e4eb0
validation_profile: /Users/jasonbelmonti/.codex/skills/execution-plan/profiles/execution-plan.yaml
---

## Plan Control

| Plan state | Planning depth | Source status | Baseline status | State rationale |
| --- | --- | --- | --- | --- |
| READY | standard | current | inspected | Route selects a locked dependency directory and independent inventory verifier; final platform evidence is required before completion. |

## Source Contract

| Source ID | Source reference | Version / fingerprint | Authority | Status | Planning implication |
| --- | --- | --- | --- | --- | --- |
| EP-SRC-1 | docs/tasks/portable-trace-runtime.md | revision 1; SHA-256 6c4528f02d912848784c22761f5e43f4c65783fb95ab1aae536b9f1a711e4eb0 | Primary completion contract; latest user selects this over prior task | current | Implement TD-SC-1 through TD-SC-6; no installation or publication. |
| EP-SRC-2 | docs/design/shared-trace-runtime-contract.md | SHA-256 846b71de6fc109cd7362aface64ef6c875fdf770a5c78639b9d060dda55d98f9 | C-1 compatibility and C-3 identity/integrity | current | Standalone identity; exact versions; every runtime byte covered. |
| EP-SRC-3 | AGENTS.md and user operating manual | 90610cdabca6dfc04e069451798a2ef19b08cf2b; user message 2026-09-21 | Repository operations, subordinate to selected task | current | Worktree, focused ownership, public Engine APIs and enforcement. |
| EP-SRC-4 | docs/design/markdown-trace-document-graph-overview.md; docs/current-implementation.md | 90610cdabca6dfc04e069451798a2ef19b08cf2b; overview SHA-256 e08a88780dc60179cba0042dd0aa97655178b8d7b38a9540d541add5dba93cf5 | Direction and implemented compatibility baseline | current | Keep existing parsing, schemas and document-owner gates. |
| EP-SRC-5 | docs/tasks/shared-runtime-contract.md; docs/validation/shared-runtime-contract.json; experiments/task-definition-trace/task-definition.md | 90610cdabca6dfc04e069451798a2ef19b08cf2b; fixture SHA-256 e3c0794e4a93a7892c747b2b3547860e49683b80034f4c69bd8f9baa66576a84 | Historical foundation and independent fixture oracle | current | Reprove changed implementation; preserve fixture bytes and owner structural gate. |

## Outcome Anchors

| Outcome ID | Source IDs | Source location | Required observable | Proof obligation |
| --- | --- | --- | --- | --- |
| EP-OUT-1 | EP-SRC-1, EP-SRC-2 | TD-SC-1 | Relocated runtime requires only Node and copied explicit inputs | Run outside checkout, deny global lookup/network and retain spaces/relative paths; missing dependency fails. |
| EP-OUT-2 | EP-SRC-1, EP-SRC-2 | TD-SC-2 | Standalone truthful C-3 identity and rejected combinations | Real checkout and candidate processes; exact fields, channels, source commit and Node; nonexistent conflicting inputs rejected before reads. |
| EP-OUT-3 | EP-SRC-1, EP-SRC-2 | TD-SC-3 | Trusted descriptor covers all payload bytes | Independent verification passes then rejects altered, missing and extra files without executing payload. |
| EP-OUT-4 | EP-SRC-1, EP-SRC-2 | TD-SC-4 | Existing command modes and defects preserved | Fixture identities/edges/backlinks/ranges; failed and indeterminate graphs; four retained TaskDefinition defects and repairs; unchanged inputs. |
| EP-OUT-5 | EP-SRC-1, EP-SRC-2 | TD-SC-5 | Package compatibility and bounded platforms proven | ci:enforcement, check:package-exports, retained trial; Linux Node 20.19.0 and macOS Node 22.12+ artifact execution. |
| EP-OUT-6 | EP-SRC-1, EP-SRC-2 | TD-SC-6 | Repeatable covered payload and accurate local workflow | Two clean snapshot builds with same source/lock/toolchain have equal inventories and stable descriptor fields; documented fresh staging workflow. |

## Baseline Findings

| Finding ID | Repository evidence | Current behavior / constraint | Planning implication | Confidence |
| --- | --- | --- | --- | --- |
| EP-FIND-1 | git fetch origin; git rev-parse HEAD in implementation worktree | Fetched baseline exactly 90610cdabca6dfc04e069451798a2ef19b08cf2b; only carried task files added | No upstream behavior drift to reconcile. | confirmed |
| EP-FIND-2 | src/markdowntrace/document-graph/command.ts options/runDocumentCommand; generated/release-metadata.ts | Thin adapter parses before reads; generated package and Engine constants; no runtime-info | Add identity owner and early standalone branch, leave graph logic intact. | confirmed |
| EP-FIND-3 | package.json; package-lock.json; tsconfig.build.json; scripts/check-package-exports.mjs | Private ESM package; tsc dist; locked production dependencies; package smoke installs dependencies | Use clean Git snapshot, npm ci at build time, compile and prune dev dependencies; inventory whole payload. | confirmed |
| EP-FIND-4 | tests/test_document_graph_command.test.ts; scripts/package-exports/graph-demo.mjs; experiments/task-definition-trace/verify.mjs | Independent expected identities, edges, ranges, four located mutations and repaired passes already exist | Copy expectations to artifact-only subprocess runner; keep original trial owner checks. | confirmed |
| EP-FIND-5 | node --version; command -v docker podman colima; .github/workflows/ci.yml | Mac arm64 Node v22.20.0; no local container commands; current CI uses Linux Node 20.19.0 | Add bounded artifact CI matrix and use available Linux execution tooling if available; missing evidence blocks completion only. | confirmed |

## Preconditions

| Precondition ID | Required state / input | Verification | Unmet trigger ID |
| --- | --- | --- | --- |
| EP-PRE-1 | Verified task, contract, overview and fixture; Node/npm/Git and Engine 3.6.0 available | shasum checks; node --version; npm --version; markdown-engine validate task with installed task-definition profile | EP-TRIG-1 |
| EP-PRE-2 | Committed runtime inputs and locked build dependencies obtainable | git status scoped to runtime inputs; npm ci in disposable snapshot | EP-TRIG-2 |
| EP-PRE-3 | Local Mac and Linux Node 20.19.0 runner for final platform admission | Record process.platform, process.version and os release from candidate smoke on both hosts; unavailable Linux leaves gate pending | EP-TRIG-3 |

## Implementation Decisions

| Decision ID | Kind | Decision or assumption | Finding IDs | Evidence / rationale | Affected action IDs | Replan trigger ID |
| --- | --- | --- | --- | --- | --- | --- |
| EP-DEC-1 | decision | Versioned directory with dist, production node_modules, manifests and licenses; Node entry path; external descriptor | EP-FIND-3 | Uses existing ESM compiler and npm lock; avoids new bundler and external-import auditing. No launcher needed for staged Node entry. | EP-ACT-2, EP-ACT-3 | EP-TRIG-2 |
| EP-DEC-2 | decision | Checkout identity has null sourceCommit; producer injects full snapshot commit only inside disposable build | EP-FIND-2, EP-FIND-3 | Release rejects dirty runtime inputs and snapshots HEAD; no runtime Git or filesystem provenance lookup. | EP-ACT-1, EP-ACT-2 | EP-TRIG-1 |
| EP-DEC-3 | decision | Verifier reads trusted descriptor and exact sorted regular-file inventory, rejecting links/extras/missing/changed files | EP-FIND-3 | Hashing just entry file cannot cover Engine; whole directory inventory is bounded and independent of candidate execution. | EP-ACT-3 | EP-TRIG-2 |
| EP-DEC-4 | decision | Candidate-only test runner uses absolute Node and copied relative inputs in external disposable cwd with restricted filesystem/network | EP-FIND-4, EP-FIND-5 | Existing npm packed tests alone do not prove closure; reproduce independent fixture facts and deliberate missing Engine failure. | EP-ACT-4, EP-ACT-5 | EP-TRIG-3 |

## Execution Phases

| Phase ID | Phase objective | Entry precondition IDs | Safe intermediate state |
| --- | --- | --- | --- |
| EP-PH-1 | Create identified and integrity-covered candidate | EP-PRE-1 | Real checkout identity passes; committed source can produce independently verified runnable payload. |
| EP-PH-2 | Prove isolated behavior and compatibility | EP-PRE-1 | Local candidate preserves independent fixture behavior and source/package regressions. |
| EP-PH-3 | Reproduce and record delivery evidence | EP-PRE-2, EP-PRE-3 | Reproducible candidate and both required platforms have admitted evidence before review-ready. |

## Execution Route

| Step ID | Kind | Phase ID | Required prior Step IDs |
| --- | --- | --- | --- |
| EP-ACT-1 | action | EP-PH-1 | None |
| EP-GATE-1 | gate | EP-PH-1 | EP-ACT-1 |
| EP-ACT-2 | action | EP-PH-1 | EP-GATE-1 |
| EP-ACT-3 | action | EP-PH-1 | EP-ACT-2 |
| EP-GATE-2 | gate | EP-PH-1 | EP-ACT-3 |
| EP-ACT-4 | action | EP-PH-2 | EP-GATE-2 |
| EP-GATE-3 | gate | EP-PH-2 | EP-ACT-4 |
| EP-ACT-5 | action | EP-PH-3 | EP-GATE-3 |
| EP-ACT-6 | action | EP-PH-3 | EP-ACT-5 |
| EP-ACT-7 | action | EP-PH-3 | EP-ACT-6 |
| EP-GATE-4 | gate | EP-PH-3 | EP-ACT-7 |

## Execution Actions

| Action ID | Precondition IDs | Outcome IDs | Targets | Concrete action | Observable postcondition | Evidence to capture | Failure response ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EP-ACT-1 | EP-PRE-1 | EP-OUT-2 | src/markdowntrace/document-graph/command.ts; runtime identity module and generated build source; focused tests | Add early standalone runtime-info handling and immutable identity composition, default source null; reject all extra identity arguments before input reads | Checkout process reports required versions and invalid combinations exit 2 | Focused test log and real CLI output | EP-RESP-1 |
| EP-ACT-2 | EP-PRE-1 | EP-OUT-1, EP-OUT-2, EP-OUT-6 | scripts/runtime/build.mjs and provenance owner; package scripts | Produce from committed Git archive with isolated npm ci, tsc and production prune; inject commit; reject dirty runtime inputs and existing output destinations | Versioned directory contains local dist and dependency closure plus build input identities | Build log, source and lock hashes, staged payload | EP-RESP-1 |
| EP-ACT-3 | EP-PRE-1, EP-PRE-2 | EP-OUT-1, EP-OUT-2, EP-OUT-3 | scripts/runtime/integrity.mjs; verify.mjs; producer descriptor integration | Generate complete sorted SHA-256 inventory and independently validate descriptor/regular files; add corruption checks | Candidate verifies before execution; mutated/missing payload fails | Descriptor and positive/negative integrity logs | EP-RESP-1 |
| EP-ACT-4 | EP-PRE-1 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4, EP-OUT-5 | scripts/runtime/check.mjs and fixture/identity proof modules | Run candidate-only subprocess checks with copied inputs, Node permission sandbox and no global lookup; reuse documented oracles and four TaskDefinition mutation/repair cases | All modes, errors, ranges, profiles and unchanged input hashes are asserted on relocated candidate | Machine-readable artifact proof plus enforcement/package/trial logs | EP-RESP-1 |
| EP-ACT-5 | EP-PRE-1 | EP-OUT-5, EP-OUT-6 | .github/workflows/ci.yml; docs/portable-runtime.md; docs/current-implementation.md; AGENTS.md; docs/README.md | Document local producer/verifier/consumer boundary and add artifact smoke matrix for Linux Node 20.19 and Mac Node 22.20 | Reproduction commands and CI inputs explicitly select candidate; no activation/publication claims | Documentation diff and workflow inspection | EP-RESP-1 |
| EP-ACT-6 | EP-PRE-2 | EP-OUT-5, EP-OUT-6 | docs/validation/portable-trace-runtime/; docs/tasks/portable-trace-runtime.md Execution Checkpoint | Build twice from same committed source and toolchain; compare complete inventories/stable descriptors; collect available platform evidence and update checkpoint only with admitted results | Reproducibility record and exact candidate identities; missing platform remains explicit | Two descriptors, input fingerprints, platform results and checkpoint reconciliation | EP-RESP-1 |
| EP-ACT-7 | EP-PRE-3 | EP-OUT-5 | scripts/runtime/check.mjs on bounded platform runners | Execute candidate smoke on both named environments and retain exact platform/toolchain identities | Both required platform results are available for final admission | docs/validation/portable-trace-runtime/linux.json and macos.json | EP-RESP-1 |

## Change Footprint

| Path / component | Action IDs | Change type | Purpose | Confidence | Risk / ownership note |
| --- | --- | --- | --- | --- | --- |
| src/markdowntrace/document-graph/command.ts and runtime identity/build-source modules | EP-ACT-1 | modify/add | Standalone identity mode | confirmed | Do not alter graph APIs or version meanings. |
| scripts/runtime/ and package.json | EP-ACT-2, EP-ACT-3, EP-ACT-4 | add/modify | Build, integrity and independent consumer proofs | confirmed | Keep build, inventory, identity and fixture operations separate. |
| tests/test_document_runtime_info.test.ts | EP-ACT-1 | add | Command rejection/channel regression | confirmed | Actual CLI probes supplement adapter tests. |
| .github/workflows/ci.yml; docs/portable-runtime.md; docs/current-implementation.md; docs/README.md; AGENTS.md | EP-ACT-5 | modify/add | Local usage, selected task and bounded platform checks | confirmed | No remote publishing or active bindings. |
| docs/validation/portable-trace-runtime/ and task checkpoint | EP-ACT-6 | add/modify | Evidence admission and resume state | confirmed | Preserve original authoring evidence; checkpoint-only comparison. |

## Validation Gates

| Gate ID | Outcome IDs | Command or check | Expected observation | Evidence capture | Evidence artifact | Evidence verification | Failure response ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EP-GATE-1 | EP-OUT-2 | npm test -- tests/test_document_runtime_info.test.ts; npm run build; node dist/markdowntrace/document-graph/cli.js --runtime-info | Exact C-3 fields; null source in checkout; empty stderr; conflicts reject nonexistent inputs before reads | Capture command exit/stdout/stderr, HEAD, tracked/untracked relevant input hashes, lock/toolchain, candidate/descriptor hashes and fixture/profile hashes before and after; reject unexpected source drift. | docs/validation/portable-trace-runtime/identity.log | Check exit and independent expected facts plus unchanged before/after hashes; rerun affected checks after runtime, dependency, profile, fixture or assertion edits; retain unaffected evidence only after inspected comparison. | EP-RESP-1 |
| EP-GATE-2 | EP-OUT-1, EP-OUT-2, EP-OUT-3 | node scripts/runtime/build.mjs --out ABSENT_STAGE; node scripts/runtime/verify.mjs --descriptor DESCRIPTOR --payload PAYLOAD; candidate --runtime-info; corrupt/delete Engine file in disposable copies | Verified released bytes run after relocation; sourceCommit matches HEAD; modified/missing dependency rejects before execution | Capture command exit/stdout/stderr, HEAD, tracked/untracked relevant input hashes, lock/toolchain, candidate/descriptor hashes and fixture/profile hashes before and after; reject unexpected source drift. | docs/validation/portable-trace-runtime/build-integrity.json | Check exit and independent expected facts plus unchanged before/after hashes; rerun affected checks after runtime, dependency, profile, fixture or assertion edits; retain unaffected evidence only after inspected comparison. | EP-RESP-1 |
| EP-GATE-3 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4, EP-OUT-5 | node scripts/runtime/check.mjs --artifact STAGE; npm run ci:enforcement; npm run check:package-exports; node experiments/task-definition-trace/verify.mjs | All independent identities/relationships/ranges, four defects/repairs, modes and operational/indeterminate cases pass; source inputs untouched; separate owner trial passes | Capture command exit/stdout/stderr, HEAD, tracked/untracked relevant input hashes, lock/toolchain, candidate/descriptor hashes and fixture/profile hashes before and after; reject unexpected source drift. | docs/validation/portable-trace-runtime/macos.json and regression logs | Check exit and independent expected facts plus unchanged before/after hashes; rerun affected checks after runtime, dependency, profile, fixture or assertion edits; retain unaffected evidence only after inspected comparison. | EP-RESP-1 |
| EP-GATE-4 | EP-OUT-5, EP-OUT-6 | Compare two clean producer outputs; follow docs/portable-runtime.md against fresh external stage; run check.mjs on Linux Node 20.19.0 and macOS Node 22.20.0; inspect final diff | Matching full file hashes and descriptor stable fields; both environment proofs present; no installation/publication; otherwise no review-ready claim | Capture command exit/stdout/stderr, HEAD, tracked/untracked relevant input hashes, lock/toolchain, candidate/descriptor hashes and fixture/profile hashes before and after; reject unexpected source drift. Require EP-PRE-3 before admitting platform result. | docs/validation/portable-trace-runtime/reproduction.json; linux.json; summary.json | Check exit and independent expected facts plus unchanged before/after hashes; rerun affected checks after runtime, dependency, profile, fixture or assertion edits; retain unaffected evidence only after inspected comparison. Source snapshot and clean npm ci prevent stale ignored dist or dependencies entering builds. | EP-RESP-1 |

## Failure and Replan Controls

| Response ID | Trigger | Containment | Exact recovery / rollback procedure | Single restored safe state | Verification | Escalation trigger ID |
| --- | --- | --- | --- | --- | --- | --- |
| EP-RESP-1 | Build, assertion, integrity or environment gate fails | Preserve logs and diff; do not admit failed evidence or activate runtime | Remove only failed disposable stages created by this invocation; repair scoped source and rebuild; keep unavailable platform gate pending | Unactivated candidate and preserved source ready for bounded repair | git diff inspection and no changes outside worktree/disposable stage | EP-TRIG-2 |

| Trigger ID | Observable trigger | Stopped Step IDs | Evidence to preserve | Required decision / input | Exact resume condition |
| --- | --- | --- | --- | --- | --- |
| EP-TRIG-1 | Controlling hash mismatch or C-1/C-3 conflict | EP-ACT-1, EP-ACT-2, EP-ACT-3, EP-ACT-4 | Source bytes and conflict | Reconciled source authority | Required hashes verify or authorized task revision passes readiness. |
| EP-TRIG-2 | Closure, producer, identity or integrity assumption fails | EP-ACT-2, EP-ACT-3, EP-GATE-2, EP-GATE-3, EP-GATE-4 | Failed command and candidate | Bounded implementation repair or plan revision | Corrected route passes plan validators if material; affected check passes on unchanged inputs. |
| EP-TRIG-3 | Linux runner or supported Node unavailable | EP-ACT-7, EP-GATE-4 | Available local proof and tooling discovery | Execution environment for missing platform | Same candidate passes on Linux Node 20.19.0; independent local implementation may continue. |

### Compatibility and Versioning

EP-ACT-1 is additive; EP-GATE-3 retains root and experimental consumers. EP-RESP-1 contains regressions; EP-TRIG-1 stops incompatible interface changes. Package remains private 0.1.0 and Engine exactly 3.6.0. Node is external. Directory metadata (mtime, ownership) is excluded; file paths and raw bytes are covered. Descriptor is trusted separately, not authenticated by candidate output. No launcher, installer or activation occurs.

## Plan Readiness

| Decision | Reviewed at | Evidence / rationale | Required revision or blocker |
| --- | --- | --- | --- |
| PASS | 2026-09-22T02:00:00Z; Codex | Self-audit: six faithful anchors map to concrete actions/gates; verified baseline selects ESM directory closure; ordered phases terminate in gates; source snapshot and hash comparisons bound provenance; existing independent oracles distinguish false passes; Linux availability affects final proof only and cannot be silently skipped. No product or approval choice remains. | None. |

## Revision Log

| Revision | Timestamp | Actor | Material change | Reason / source | Checksum reference |
| --- | --- | --- | --- | --- | --- |
| 1 | 2026-09-22T02:00:00Z | Codex | Create bounded portable payload production and proof route | Selected task revision 1 and inspected fetched baseline | execution-plan.sha256 |

