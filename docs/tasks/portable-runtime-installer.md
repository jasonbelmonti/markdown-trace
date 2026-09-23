---
type: TaskDefinition
title: Install and bind a verified portable Markdown Trace runtime
task_id: portable-runtime-installer
artifact_version: "3.0"
revision: "1"
created_at: "2026-09-23T16:30:00Z"
updated_at: "2026-09-23T16:30:00Z"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | PLAN_REQUIRED | Source authority, Engine 3.6.0 profile validation, semantic quality and post-draft review pass; a bounded execution plan must sequence verified staging, activation and rollback before implementation. |

## Objective

Install a locally produced portable Markdown Trace candidate under an operator-chosen root, expose the canonical `markdown-trace-document` executable, and explicitly switch or restore the active version only after verifying the selected payload and launcher. A skill or host can resolve `MARKDOWN_TRACE_BIN` without a checkout or silent fallback.

## Context / Constraints

- Merged PR #90 supplies the directory payload, trusted descriptor, independent payload verifier, and C-3 runtime-info. This task implements the local C-2 installer and binding boundary from the shared runtime contract; it does not change graph semantics.
- Initial supported hosts are macOS and Linux with external Node in Trace's `^20.19.0 || >=22.12.0` range. Node selection through the host PATH is permitted. Windows delivery is deferred.
- Installation root is explicit and disposable in tests. Staging and verification must not change the active command. Activation and rollback are explicit operator actions; no automatic download, repair, global host mutation, or Fleet approval is implied.
- The trusted descriptor and installer code come from the trusted source, not the candidate payload. Verify complete payload bytes and the fixed-target launcher before candidate execution. Runtime-info corroborates verified bytes, not provenance authenticity.
- Preserve the existing document command, package exports, owner-gate separation, private package/version posture, and Engine 3.6.0. Keep existing build artifacts and prior evidence historical.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| User request on 2026-09-23 to execute the recommended installation/runtime-binding task | Task selection | Explicit | Deliver the next bounded local installer and binding slice, with verification and rollback proof. |
| [Shared runtime contract](../design/shared-trace-runtime-contract.md), SHA-256 `846b71de6fc109cd7362aface64ef6c875fdf770a5c78639b9d060dda55d98f9` | C-2 binding, C-3 identity and C-4 lifecycle boundary | Read; hash matches | Fixed-target launcher, explicit binding precedence, staged/verified/active separation, failure behavior and rollback govern this task. Fleet admission and skill pinning remain later. |
| [Portable runtime guide](../portable-runtime.md), [producer](../../scripts/runtime/build.mjs), [verifier](../../scripts/runtime/verify.mjs) and [integrity module](../../scripts/runtime/integrity.mjs) | Existing candidate format | Inspected at baseline `34be6d6b705397a2da465aaaf1a914c13aadb227` | Reuse the versioned payload and complete descriptor verification; no parallel artifact format or candidate-owned trust root. |
| [Repository instructions](../../AGENTS.md), [graph direction](../design/markdown-trace-document-graph-overview.md) and [current implementation](../current-implementation.md) | Ownership and compatibility | Read; overview checksum verified | Work in a worktree and preserve implemented graph and owner-gate behavior. |

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Explicit-root versioned local staging and verification | In scope | blocking | Install the candidate and descriptor into a versioned slot only after complete verification; create a fixed-target executable launcher and verify it against an installer-owned template. |
| Explicit activation and rollback | In scope | blocking | Switch the active command only after verifying the selected installed slot; retain earlier slots for an explicit rollback to a previously verified compatible version. |
| C-2 binding selection | In scope | blocking | A nonempty absolute `MARKDOWN_TRACE_BIN` is authoritative; missing or non-executable explicit targets fail. Empty/unset binding may discover only `markdown-trace-document` through PATH. |
| Local workflow, compatibility and platform proof | In scope | blocking | Exercise actual installed command, failed verification, unsupported Node, stable active state, and existing source/package gates on macOS and Linux. |
| Fleet policy/admission, installed-skill migration, host environment application, remote publication and automatic updates | Follow-up | non-blocking | These consumers use the installed root and binding later; this task must not claim their gates passed. |
| Graph traversal, context projection, schema changes, Windows launchers and unrelated refactors | Out of scope | non-blocking | Preserve current runtime meanings. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | A valid portable candidate can be staged under an explicit root as a versioned payload with a trusted descriptor and fixed-target launcher, while the active command remains unchanged. Invalid, altered or missing payload bytes and malformed descriptors cannot stage. | Stage a real produced candidate into a temporary root; compare complete copied inventory with the trusted descriptor and inspect the launcher target/template. Snapshot active binding before and after both successful staging and rejected corruptions. | Yes |
| TD-SC-2 | The installed launcher executes only its fixed versioned payload, preserves argument boundaries and caller cwd, reports truthful runtime-info, and rejects unsupported Node before document work. | Invoke the launcher from an unrelated cwd with spaced paths and actual document/profile inputs; compare output and identity with direct candidate execution. Try a payload override, missing dependency, and unsupported Node selection; inspect failure channels/exits and unchanged inputs. | Yes |
| TD-SC-3 | Activation and rollback explicitly select a verified installed version; failed integrity, launcher, compatibility or process checks leave the prior active target callable. | Stage two independently identified candidates, activate each by explicit version, then restore the first. Before/after active-target snapshots and direct invocations must agree. Mutate a disposable staged copy or select a bad target and prove no active change. | Yes |
| TD-SC-4 | Binding selection follows C-2: a nonempty absolute `MARKDOWN_TRACE_BIN` wins, an invalid explicit binding fails without PATH fallback, and unset/empty binding discovers only `markdown-trace-document` as an absolute executable path. | Exercise resolver against isolated executable fixtures and PATH values, including spaces, nonexistent/non-executable/relative explicit values and a different command name. Invoke the resolved command with argument arrays and observe no shell interpretation. | Yes |
| TD-SC-5 | The documented local install/verify/activate/rollback workflow and existing source/package consumers remain valid on the bounded macOS/Linux Node matrix. | Follow the guide against a clean temporary root, run focused installer proofs plus `ci:enforcement`, `check:package-exports` and the retained TaskDefinition trial; record macOS Node 22.12+ and Linux Node 20.19.0 job results and exact tested source/environment. | Yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Verified inactive installation | An operator can stage and inspect a fixed-target launcher without changing the current executable. | Candidate-controlled bytes or accidental activation. | TD-SC-1 and focused integrity/launcher evidence. | Continue only if corrupt candidates fail before executable selection. |
| Explicit selected runtime | A host can activate, resolve and restore one installed command while preserved document behavior runs. | Silent fallback, wrong target and destructive failed switches. | TD-SC-2 through TD-SC-5 on both platforms. | Hand off only after rollback, negative cases and regression gates pass. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Installation integrity | Complete copied bytes, trusted descriptor, fixed launcher and inert staging | Signing, remote artifact registry and Fleet trust policy | Incomplete verification or active mutation during staging blocks. |
| Active selection | Explicit switch, stable target, failure containment and rollback | Automated rollout and global host configuration | Wrong/partial active target, silent fallback or failed rollback blocks. |
| Binding and behavior | C-2 precedence, Node compatibility, cwd/arguments, current command and owner gate | Installed skill/Fleet consumer implementation | A bad explicit binding falling back or changed document behavior blocks. |
| Evidence and documentation | Real temp-root operation, current source/platform/regression proof and accurate guide | Windows, publication and broader graph features | Missing required platform evidence or false readiness claim blocks. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Stage valid and corrupt candidates under an isolated root without activation. | Candidate/descriptor hashes, installed inventory/launcher inspection and unchanged active-target snapshot. | Implementer | Yes |
| TD-SC-2 | Invoke actual installed launcher with identity, document and negative Node/dependency cases. | Exact argv/cwd inputs, observed output/exits, source/Node identity and unchanged input hashes. | Implementer and CI | Yes |
| TD-SC-3 | Activate two versions, roll back and attempt failed switches. | Before/after active-target and invocation records, verified slot identities and failure isolation. | Implementer and CI | Yes |
| TD-SC-4 | Resolve explicit and PATH bindings under controlled environment. | Exact selected absolute path or operational error; negative cases show no fallback or shell interpolation. | Implementer | Yes |
| TD-SC-5 | Follow documented workflow and rerun compatibility/platform gates. | Current source/lock/toolchain, test and CI logs, Node/platform versions, guide commands and unaffected consumer results. | Implementer and CI | Yes |

## Execution Notes

Start from fetched `origin/main` commit `34be6d6b705397a2da465aaaf1a914c13aadb227` in `.worktrees/portable-runtime-installer`. The route is PLAN_REQUIRED because installation changes persistent active selection and must sequence verified staging, invocation and rollback safely. Use the installed execution-plan skill; validate its READY plan before source changes. Keep install tests confined to temporary roots. Read this task, the shared runtime contract, AGENTS.md and the validated plan before implementation.

Record relevant code, tests, fixture, configuration and environment identities at each gate. A later change to one of those inputs invalidates only affected evidence. Keep old reports historical. Do not treat a passing runtime-info call as Fleet admission or document-owner readiness.

### Execution Checkpoint

| Execution status | Current proving slice | Evidence admitted | Next action | Blockers / stop condition |
| --- | --- | --- | --- | --- |
| review-ready | Independent review of the completed local installer and binding slice. | TD-SC-1, TD-SC-2, TD-SC-3, TD-SC-4 and TD-SC-5: `.codefactory/execution-plans/portable-runtime-installer/evidence/EP-GATE-1.txt` and `EP-GATE-2.txt` record passing local proof and CI run 35893767655 on Linux Node 20.19.0 and macOS Node 22.20.0. The run tested PR head `8e00f8a2c07a44f32340a7787f9295c8850017f6` via merge checkout `411d1775044421a87ce76515b0af5a14d7a075b8`; current code/test/config input hashes match the local proof. Earlier failed and superseded attempts remain historical. | Review the task and plan against PR #91, then accept or request focused remediation. | None. |

## Follow-up / Non-blocking Work

Portable skill adoption, Fleet source pins and runtime verification/environment output, host-applied binding, release promotion, remote publishing and isolated rollout; graph traversal/context projection on its separate product track.
