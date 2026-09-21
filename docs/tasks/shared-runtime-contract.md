---
type: TaskDefinition
title: Define the shared Trace runtime contract on Engine 3.6.0
task_id: shared-trace-runtime-contract
artifact_version: "3.0"
revision: "1"
created_at: "2026-09-20T14:36:24Z"
updated_at: "2026-09-20T14:36:24Z"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | DIRECT | Source authority, Engine 3.6.0 structural validation, semantic quality and post-draft review pass for contract authoring and the bounded dependency upgrade. |

## Objective

Define the shared Markdown Trace runtime boundary that later artifact, installer,
skill-package and Fleet work can implement. Upgrade Trace's actual Markdown
Engine dependency to exactly 3.6.0 and prove compatibility of the current package.

## Context / Constraints

- The user selected task 1 from the Fleet-readiness inventory and explicitly
  required Engine 3.6.0. This task authors the contract and implements that upgrade.
- Start from fetched main at 0a6bb8c00e36d5f5be78044899dd061630253518 in a worktree.
- Preserve the existing legacy CLI, root API, experimental graph/profile/result
  schemas, language, output channels, exit codes, and private package posture.
- Engine owns Markdown parsing and structural operations; Trace owns identities,
  graph validation and queries. Document owners select explicit profiles and
  retain structural and semantic acceptance gates.
- Runtime interface additions are design commitments for subsequent tasks, not
  claims that a distributable artifact, installer or Fleet adapter exists now.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| User instruction, 2026-09-20: execute the first task and upgrade to 3.6.0 | Scope and dependency decision | Explicit | Define runtime contracts and implement the Engine upgrade; later readiness tasks remain separate. |
| [Repository guidance](../../AGENTS.md), [direction](../design/markdown-trace-document-graph-overview.md), [implementation](../current-implementation.md) | Repository constraints and actual behavior | Read; overview checksum verified | Preserve Engine ownership, local read-only document operations, compatibility and worktree isolation. |
| [Prior package task](../../experiments/task-definition-trace/task-definition.md) | Retained consumer-proof boundary | Read; adjacent checksum verified | Preserve its fixtures and outcomes; this task owns the new runtime work. |
| [Command](../../src/markdowntrace/document-graph/command.ts), [analysis](../../src/markdowntrace/document-graph/analyze.ts), [manifest](../../package.json), package checks and tests at the base commit | Implementation evidence | Inspected | Contract additions must identify implementation gaps; parser provenance must track the upgraded dependency. |
| [Fleet runtime at 1ef68a7](https://github.com/jasonbelmonti/skill-fleet/tree/1ef68a780cac6d8786b849db9f78ac284bbd935e/src/runtime) and its Engine 3.6.0 policy | Existing consumer interface | Inspected locally; active wrapper digest verified | Model explicit runtime bindings and verification without claiming current Fleet supports Trace. |

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Shared runtime interface packet | In scope | blocking | Define executable, location/binding, identity, supported runtime, compatibility, faults, ownership and downstream acceptance evidence. |
| Exact Engine 3.6.0 dependency and accurate provenance | In scope | blocking | Update manifest, lockfile, generated metadata, graph parser identity, package expectations and current usage documentation. |
| Compatibility proof | In scope | blocking | Existing command, package, graph and trial checks must prove the upgrade without weakening behavior assertions. |
| Runtime bundling, installer, identity-command implementation, Fleet code/policy/promotion and installed-skill migration | Follow-up | non-blocking | Specify the necessary interfaces here; implement them in their respective later tasks. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | A grounded interface packet resolves the runtime executable, location, identity, Node support, Engine 3.6.0 compatibility, failure behavior and ownership while distinguishing existing behavior from later implementation. | Interface-design profile validation plus in-situ evaluation with no unresolved blocking contract choices for later packaging and adapter work. | Yes |
| TD-SC-2 | Trace installs Engine exactly 3.6.0, and generated metadata, graph snapshots, validation reports and packed consumers identify 3.6.0. | Inspect manifest/lock/installed package and invoke actual graph/report entry points; an old hard-coded parser version must fail the provenance checks. | Yes |
| TD-SC-3 | Existing graph facts, source ranges, defect diagnostics, queries, HTML output, legacy behavior and package boundaries remain valid after the upgrade. | Focused command/provenance checks, ci:enforcement, packed-consumer smoke and the retained TaskDefinition defect/repair proof pass against the changed state. | Yes |
| TD-SC-4 | Current documentation reflects the new baseline and the task does not activate an unimplemented runtime contract. | Inspect the final diff for current version references, retained historical evidence, unchanged experimental/legacy schemas and absence of installer/Fleet/global-install changes. | Yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Contract grounded on the upgraded dependency | Later runtime work has explicit consumer obligations and a proven Engine baseline. | Packaging assumptions, stale parser provenance and compatibility regressions. | TD-SC-1 through TD-SC-4 checks. | Finish when the packet is structurally and semantically valid and upgrade evidence passes; keep subsequent runtime delivery separate. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Runtime contract | Executable/location/identity semantics, compatibility, faults, implementation-gap labeling and grounding | Installer/artifact/Fleet implementation | Missing or contradictory contract choices block; absent downstream implementations do not. |
| Engine upgrade | Exact installed dependency, metadata and parser provenance, regression and package evidence | New graph operators, syntax, source rewriting or consumer-domain policy | Incorrect versions, weakened assertions or changed behavior outside the upgrade block. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Validate task and interface packet with the verified shared Engine 3.6.0 CLI; perform semantic and in-situ review | Retain final artifact hashes, profile hashes, Engine version, zero diagnostics and reviewed contract decisions in a bounded evidence record. | Codex | Yes |
| TD-SC-2 | Inspect dependency resolution and run command/packed-consumer provenance assertions | Manifest, lockfile, installed package and emitted parser/runtime metadata agree on 3.6.0; assertions exercise real entry points. | Codex | Yes |
| TD-SC-3 | Run focused checks, npm run ci:enforcement, npm run check:package-exports and node experiments/task-definition-trace/verify.mjs | Preserve observed exits, test counts and trial results with the tested base, changed-file hashes, lockfile and Node version. | Codex | Yes |
| TD-SC-4 | Inspect final diff and current versus historical documentation | Confirm scope, no unimplemented capability claims, preserved fixtures/checksums and unchanged public schema shapes. | Codex | Yes |

## Execution Notes

Read this task and its controlling sources before implementation, review or
handoff. Its DIRECT route covers contract authoring plus the bounded dependency
upgrade; it does not authorize subsequent runtime delivery. Use the installed
task-definition and interface-design profiles and the Fleet-verified Engine
wrapper. Keep old validation records historical and capture fresh applicable
evidence for the changed dependency. Source changes take place only in this
worktree; global installations are not part of this task.

## Follow-up / Non-blocking Work

Implement the runtime artifact and installer, portable skill package, runtime
identity and verification contracts, Fleet policy/verification/environment
support, source promotion and isolated rollout in subsequent readiness tasks.
The separate local profile-authoring branch is not a dependency of this task.
