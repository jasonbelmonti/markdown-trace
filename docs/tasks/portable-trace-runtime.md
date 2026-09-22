---
type: TaskDefinition
title: Produce the portable Markdown Trace runtime artifact
task_id: portable-trace-runtime
artifact_version: "3.0"
revision: "1"
created_at: "2026-09-21T18:32:29Z"
updated_at: "2026-09-21T18:32:29Z"
validation_profile: skills/task-definition/profiles/task-definition.yaml
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | PLAN_REQUIRED | Source authority, Engine 3.6.0 structural validation, semantic quality and post-draft review gates pass. Complete a bounded execution plan for artifact production and verification before implementation. |

## Objective

Produce a versioned Markdown Trace runtime artifact that a later installer and
Fleet adapter can verify and execute outside a library checkout. The artifact
must include its runtime dependencies, report its actual identity, and preserve
the existing document command on Markdown Engine 3.6.0.

## Context / Constraints

- This is task 2 of the shared-runtime readiness sequence, following merged
  [PR #89](https://github.com/jasonbelmonti/markdown-trace/pull/89). The inspected
  main baseline is `90610cdabca6dfc04e069451798a2ef19b08cf2b`.
- [Shared runtime contract](../design/shared-trace-runtime-contract.md) C-1
  through C-4 controls the interface. Implement the artifact and C-3 identity
  mode here; installed binding, activation and Fleet admission remain later work.
- Preserve Engine exactly 3.6.0, the current private package posture, package
  version 0.1.0, legacy/root and experimental APIs, graph/profile/result schema
  meanings, document language, channels and verdicts. The new runtime identity
  mode is the intended additive command change.
- Supported Node remains `^20.19.0 || >=22.12.0`; Node is an external prerequisite,
  not a required bundled component. Initial shared-runtime platforms are macOS
  and Linux. Windows launcher delivery is outside this task.
- Runtime execution must not need Git, npm, a dependency download, the source
  checkout, its node_modules, or a global Trace/Engine installation. Build-time
  dependency acquisition is permitted. The separate Engine CLI is needed only
  by document-owner structural checks, not by Trace's embedded library.
- The artifact's local output layout and integrity representation are delegated
  implementation choices within C-3. Document how a later installer obtains the
  produced artifact and trusted descriptor. Selecting or activating a remote
  release channel, registry publication, signing infrastructure and automatic
  downloads are not required for this local deliverable.
- Keep document/profile inputs explicit and unchanged. Artifact staging and
  test output stay in disposable directories. HTML generation stays local;
  browser rendering retains the already documented pinned Mermaid CDN behavior.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| User request, 2026-09-21: generate task 2 and an implementer handoff after the runtime-contract PR merged | Task selection | Explicit | Prepare the portable artifact, identity, complete-integrity and isolated-proof boundary; this authoring session does not implement it. |
| [Shared runtime contract](../design/shared-trace-runtime-contract.md), SHA-256 `846b71de6fc109cd7362aface64ef6c875fdf770a5c78639b9d060dda55d98f9` | Selected interface | Read; hash matches merged source | Preserve C-1; realize artifact-relevant C-3 requirements; leave C-2 installation and C-4 Fleet activation to their owners. |
| [Repository instructions](../../AGENTS.md), [graph direction](../design/markdown-trace-document-graph-overview.md), [current implementation](../current-implementation.md) | Ownership and compatibility | Read; overview checksum verified | Reuse public Engine APIs, work in a worktree, preserve the implemented surfaces and keep current/future claims distinct. |
| [Prior task](shared-runtime-contract.md) and [its evidence](../validation/shared-runtime-contract.json) | Completed foundation | Read; task hash verified; evidence describes the earlier tested state | Engine upgrade and interface definition are the baseline, not proof that an isolated runtime artifact exists. Reassess proof dependencies before reuse. |
| [Manifest](../../package.json), [metadata generator](../../scripts/generate-release-metadata.mjs), [document command](../../src/markdowntrace/document-graph/command.ts), [package checks](../../scripts/check-package-exports.mjs) and [consumer](../../scripts/package-exports/consumer.mjs) at the inspected baseline | Actual implementation | Inspected | Current package tests install dependencies with npm; add artifact execution proof that cannot succeed through those external dependencies. |
| [Command tests](../../tests/test_document_graph_command.test.ts), [packed command checks](../../scripts/package-exports/graph-demo.mjs), [TaskDefinition trial](../../experiments/task-definition-trace/verify.mjs) and [CI](../../.github/workflows/ci.yml) | Existing behavior oracles and checks | Inspected; trial source-task checksum verified | Reuse expected identities, links, diagnostics and repairs; make new artifact checks invoke the candidate payload rather than the checkout. |

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Portable runtime production and local staging | In scope | blocking | Build a versioned payload containing the document runtime and all non-Node runtime dependencies, with a documented invocation and local output layout. |
| Standalone runtime-info command and truthful provenance | In scope | blocking | Implement C-3 in the document command and produced artifact; retain existing command behavior otherwise. |
| Complete payload integrity and bounded verification | In scope | blocking | Produce a release descriptor and a check that verifies its covered bytes without executing the candidate. This is artifact verification, not Fleet policy/admission. |
| Isolated behavior, compatibility and reproducibility proof | In scope | blocking | Exercise the candidate artifact with independent fixture expectations; retain applicable existing regression gates and record the tested state. |
| Current usage and producer handoff documentation | In scope | blocking | Describe building, verifying and invoking the artifact, prerequisites, output identity and the boundary remaining for the installer. |
| Shared launcher installation, MARKDOWN_TRACE_BIN host delivery, activation/rollback, portable skill migration, Fleet changes and remote publishing | Follow-up | non-blocking | A private staging launcher, if the artifact format needs one, must preserve C-2 argument/cwd semantics and be covered by integrity; it must not alter active host bindings. |
| New graph features, schema or language changes, domain-profile policy, global runtime changes and unrelated refactors | Out of scope | non-blocking | Retain the current product boundary. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| TD-SC-1 | The produced artifact runs the document command after relocation outside the repository using only supported Node, its own payload and explicitly copied document/profile inputs. | Execute from a separate working directory with checkout/global module resolution unavailable and no runtime dependency installation or network fetch; preserve relative paths and arguments containing spaces. A payload missing a runtime dependency must not pass this proof. | Yes |
| TD-SC-2 | The real command and artifact implement C-3 runtime-info: one identity JSON object on stdout, empty stderr, exit 0, all required fields accurate, and rejected document/profile/format/query combinations exit 2 without reading those inputs. | Invoke the actual entry points without document/profile/Git access; compare package, Engine, analyzer and protocol identity to producer inputs and nodeVersion to the executing Node. Release sourceCommit is the full commit of the built source; uncommitted runtime-affecting inputs are rejected for release production or identified as development with sourceCommit null. Invalid combinations with nonexistent paths must report invocation rejection, not a file-read error. | Yes |
| TD-SC-3 | A producer-generated descriptor binds the release source and versions to every executable payload byte and required runtime dependency, and the documented independent integrity check detects changed or missing covered content. | Verify a valid staged candidate, then alter/delete a covered runtime file or dependency and observe non-success before candidate execution. For a single-file bundle, inspect the build for external runtime imports and mutate that bundle. Identity JSON or an importing entry-file hash alone is insufficient. | Yes |
| TD-SC-4 | The isolated artifact preserves report, graph, query, Mermaid and HTML behavior, including failed/indeterminate graphs, invocation errors, located defects and repaired passes under explicit profiles. | Use existing fixture oracles to assert identities, relationships, backlinks, ranges, parserVersion 3.6.0, channels and exit codes. Exercise the retained TaskDefinition defect/repair cases through the artifact; keep owner structural validation separate. Verify input hashes before and after execution. | Yes |
| TD-SC-5 | Existing source/package consumers remain compatible, and the supported Node/platform boundary is supported by recorded execution evidence for the artifact. | Run ci:enforcement, check:package-exports and the retained trial on the changed state, plus artifact smoke on Linux with Node 20.19.0 and macOS with a Node 22 version at or above 22.12.0. A full platform/version cross-product is not required. Use CI or available local hosts; identify exact environments and do not claim an unavailable platform gate passed. | Yes |
| TD-SC-6 | Maintainers can reproduce the candidate's executable payload and descriptor integrity values from the same declared build inputs, and current documentation accurately explains the local production/verification/invocation workflow. | Compare two clean builds with the same source, lockfile and declared toolchain; covered payload digests and stable descriptor fields agree. Record archive/container metadata exclusions if relevant. Follow the documented commands against a fresh staging location and inspect the diff for unsupported publication or active-runtime claims. | Yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| Relocatable, identified candidate | A consumer can invoke the artifact and identify its actual producer/runtime. | Hidden checkout dependencies and stale/self-invented identity. | TD-SC-1 and TD-SC-2 artifact observations. | Continue only with an isolated callable candidate whose identity matches its build inputs. |
| Verified candidate with preserved behavior | A later installer receives complete integrity, repeatable production and behavioral evidence. | Incomplete hashing, packaging regressions and non-reproducible payloads. | TD-SC-3 through TD-SC-6 results tied to the same candidate. | Finish this task when all criteria pass; shared installation and Fleet admission remain separate. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Artifact and identity | Relocation, runtime dependency closure, source/version truth, C-3 output and invocation semantics | Installed host selection, Fleet policy, registry publication | Missing dependencies, false provenance or incompatible identity behavior block. |
| Integrity and reproducibility | Coverage of actual executable bytes, independent checking, altered/missing-byte failures, repeatable covered payloads | Signatures, registry trust systems and adversarial supply-chain expansion | A candidate can change covered executable behavior without detection, or claimed build reproducibility cannot be demonstrated: blocking. |
| Behavior and evidence | Preserved current workflows, meaningful isolated probes, required environment results and evidence applicability | New graph features, extra unsupported platforms and broad cleanup | Supported regressions, weakened required assertions, checkout-only proof or missing required environment evidence block. |
| Delivery scope and documentation | Accurate local producer/consumer commands and separation from future activation | Installer, skill-fleet and installed-skill implementation | False readiness claims or unrequested activation block; absence of deferred implementations does not. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| TD-SC-1 | Invoke the relocated artifact with copied inputs from an unrelated cwd and controlled dependency lookup. | Exact candidate path/digest, invocation/environment, exit/channels and expected output; demonstrate no checkout or global runtime dependency is consumed. | Implementer | Yes |
| TD-SC-2 | Exercise standalone and conflicting runtime-info invocations against the built command and candidate. | Parsed fields compared to actual source/build/runtime inputs; accepted/rejected exit and channel observations; no document/profile reads in identity mode. | Implementer | Yes |
| TD-SC-3 | Verify the candidate with the trusted producer descriptor, then mutate/delete a covered executable component in a disposable copy. | Descriptor/payload identities, complete coverage inspection and rejection evidence produced without executing the candidate. | Implementer | Yes |
| TD-SC-4 | Run fixture-derived valid, defect, repair, query and output-format assertions through the candidate. | Expected and observed graph facts, located diagnostics, channels/exits, unchanged source hashes and separate owner-gate outcomes. | Implementer | Yes |
| TD-SC-5 | Run existing enforcement/package/trial checks and the bounded Node/platform artifact smoke. | Exact source state, lockfile, artifact digest, command results, CI/local environment versions and meaningful existing assertions retained. | Implementer and CI | Yes |
| TD-SC-6 | Repeat clean artifact production and execute the documented local workflow. | Build input fingerprints, matching covered-file digests/stable metadata, explicit archive metadata exclusions and source-backed documentation inspection. | Implementer | Yes |

## Execution Notes

Read this task and its controlling sources first. This task owns the selected
artifact-delivery boundary; the prior shared-runtime task records the completed
contract-and-upgrade foundation. Use a worktree under the repository's
`.worktrees/`, starting from freshly fetched main. Compare that starting state to
the inspected baseline and reconcile relevant changes before admitting evidence.

The route is PLAN_REQUIRED: the existing interface defines behavior,
while artifact layout, build inputs, integrity representation, change placement
and validation sequencing still need a bounded execution plan. Use the installed
execution-plan skill to complete and validate that plan before source changes.
Choose among C-3's allowed artifact representations without adding a runtime
service, provider framework or installer to this task. Implementation may proceed
after the declared plan gates pass; no additional scope approval is implied.

Keep identity, artifact production and integrity decisions with their owning
modules; retain a thin command adapter and existing Engine parsing. A fixture
runner adapted for artifact selection must make the candidate explicit and must
not silently fall back to the checkout. Preserve independently established
expected facts and diagnostics rather than generating expected results from the
candidate being tested.

Evidence must identify the actual source state, lockfile, build toolchain,
candidate/descriptor digests, test/profile inputs and relevant Node/platform.
Keep previous validation records historical. Reuse prior results only after
checking their dependencies; this new artifact requires its own isolated proof.
Unavailable required evidence blocks completion, not independent implementation
work. Do not rewrite source checksums or weaken assertions to manufacture a pass.

### Execution Checkpoint

| Execution status | Current proving slice | Evidence admitted | Next action | Blockers / stop condition |
| --- | --- | --- | --- | --- |
| active | Prove isolated document behavior and compatibility on the identified candidate. | TD-SC-2 and TD-SC-3: docs/validation/portable-trace-runtime/build-integrity.json records relocated identity, source commit e53473f8b642dd48755977893b7e5235ee1d3899 and altered/missing dependency rejection; identity.log records checkout identity checks. | Execute fixture-derived artifact probes and retained regression gates, then rebuild the final candidate for reproducibility and bounded platforms. | Linux Node 20.19.0 execution is not yet available; completion requires its evidence. |

## Follow-up / Non-blocking Work

Versioned installation, active launcher/binding delivery, upgrade and rollback;
portable skill resources and source-owned Fleet consumer contracts; Fleet runtime
policy, verification and environment support; source/runtime pin promotion;
remote release publication and isolated host rollout. This artifact task supplies
the candidate and evidence those tasks consume, without claiming their gates ran.
