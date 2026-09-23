---
type: TaskDefinition
title: Make the Markdown Trace skill portable for Fleet admission
task_id: portable-trace-skill
artifact_version: "3.0"
revision: "1"
created_at: "2026-09-23T15:00:00Z"
updated_at: "2026-09-23T15:00:00Z"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | DIRECT | Source authority, Engine 3.6.0 structural validation, semantic quality and post-draft review gates pass. The selected binding and agreed declarative contract bound this work for direct implementation. |

## Objective

Allow a copied Markdown Trace skill package to use an installed, verified Trace
runtime and provide reproducible document behavior evidence for Fleet admission.

## Context / Constraints

Preserve Engine exactly 3.6.0, explicit document/profile inputs, existing runtime
behavior and independent document-owner structural and semantic gates. The skill
does not install, activate or verify release payloads; Fleet and the installer
own those boundaries. A nonempty MARKDOWN_TRACE_BIN is authoritative, must name
one absolute executable and must never trigger a fallback. Only an unset/empty
binding permits discovery of the exact markdown-trace-document name on PATH.
Skill resources must remain usable when only skills/markdown-trace is copied.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| User request on 2026-09-23 to execute the coordinated Trace and Fleet PRs | Selected work | Explicit | Deliver the Trace skill PR and a pinned source handoff to Fleet; do not merge or activate. |
| [Shared runtime contract](../design/shared-trace-runtime-contract.md), SHA-256 846b71de6fc109cd7362aface64ef6c875fdf770a5c78639b9d060dda55d98f9 | C-1 through C-4 | Read; hash verified | Preserve behavior and implement the skill side of binding and source-owned admission probes. |
| [Repository guidance](../../AGENTS.md), [implementation](../current-implementation.md), [runtime usage](../portable-runtime.md), [graph direction](../design/markdown-trace-document-graph-overview.md) | Ownership and baseline | Read at bc687b7d0064968346b13a68149cbdfb495f6769 | Work in a project worktree and preserve compatibility. |
| [Skill](../../skills/markdown-trace/SKILL.md), its profile-authoring guide and the existing preview example | Current skill and independent fixture oracle | Read | Eliminate external package references and retain the known three-entity, two-relationship example. |
| Coordinated Fleet consumer agreement on 2026-09-23 | Consumer format | Agreed with Fleet implementer | Deliver markdown-trace.consumer-contract.v1 with literal defect replacement, fixed expected counts and located diagnostic, and restoration proof; never executable commands. |

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Installed binding invocation and self-contained skill resources | In scope | blocking | A local Node-only helper may implement existing C-2 semantics; no repository-relative runtime imports. |
| Declarative valid/defect/repair consumer contract | In scope | blocking | Source-owned fixture/profile, fixed oracle, temporary mutation and restoration. |
| Installed-copy proof, compatibility and source-pin handoff | In scope | blocking | Publish one reviewable PR with exact source/package identities. |
| Fleet adapter, active host installation, release publishing and graph changes | Out of scope | non-blocking | Fleet has its own coordinated PR; operator activation remains later. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | A copied skill resolves and invokes the installed runtime from an unrelated cwd; explicit invalid bindings fail without trying an available PATH command. | Exercise copied helper with absolute paths containing spaces, relative document/profile paths, unset/empty fallback, and missing/relative/non-executable/directory explicit bindings; verify candidate outputs and no fallback marker. | Yes |
| TD-SC-2 | All instructional references and example resources stay inside the copied package and preserve protocol/profile and owner-gate meanings. | Audit local Markdown links and Node imports, compare mirrored reference sections/profile/fixture bytes to authoritative sources, and follow copied-skill instructions against a real portable runtime. | Yes |
| TD-SC-3 | The agreed declarative contract proves valid, located defect and repaired results with immutable source inputs under Engine 3.6.0. | Require valid report counts 3/2, remove the design relationship once, require rule design-implements-requirement and trace-validation.relation-count at line 9, restore and require pass; assert query IDs/edges and before/after source hashes. | Yes |
| TD-SC-4 | Existing supported behavior remains compatible and Fleet receives exact source/package identities. | Run repository enforcement, packed consumer and installed-copy checks; commit before release production and record source commit, package file hashes and release descriptor identity in the handoff. | Yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Portable skill consumer | Installed-copy invocation and resource completeness | Hidden checkout assumptions and silent fallback | TD-SC-1 and TD-SC-2 proof | Continue when the copied package is independently usable. |
| Fleet admission package | Located behavior failure and restoration with reproducible source pin | Healthy identity masking broken document behavior | TD-SC-3 and TD-SC-4 proof | Hand off only after required checks pass on identified inputs. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Skill portability and binding | Self-contained references, argument/cwd preservation, explicit binding failures and owner gates | New runtime features or host activation | Broken copied-skill use, silent fallback or weakened gates block. |
| Consumer evidence and compatibility | Fixed meaningful fixture oracle, located failure, repair, hashes and compatible current checks | Wider domain policy or rollout | False pass, source mutation, stale pin or regression blocks. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Run copied helper against staged runtime and unavailable bindings | Exit/channels, exact cwd/arguments, no fallback invocation and observed Engine identity on recorded commit | Trace implementer | Yes |
| TD-SC-2 | Inspect package closure and execute installed-copy workflow | Local link/import audit and mirrored source comparisons on recorded package hash | Trace implementer and parent integration review | Yes |
| TD-SC-3 | Execute agreed profile/fixture contract | Valid/defect/repaired report assertions, query IDs/edges, located diagnostic, parserVersion and input SHA-256 before/after | Trace implementer; Fleet independently repeats | Yes |
| TD-SC-4 | Run compatibility gates and record producer/skill identity | Enforcement and package logs, installed-copy output, clean commit and release/package fingerprints | Trace implementer | Yes |

## Execution Notes

Read this artifact and its controlling sources first. This bounded task uses
DIRECT because C-2 and the agreed consumer format already select the interfaces;
the edits remain within the skill package, its proof and current usage docs.
Send the exact commit and contract paths to the Fleet implementer before pinning;
notify Fleet before changing any pinned package bytes. Release production must
use committed inputs. Review evidence must identify the commit and relevant
runtime, profile, fixture and environment; rerun affected checks after edits.

## Follow-up / Non-blocking Work

Fleet runtime verification and inventory are delivered by the coordinated Fleet
PR. Local activation and replacement of the user's existing skill symlink follow
review and remain an operator action. Broader graph features and domain policy
changes remain with their owners.
