---
type: ExecutionPlan
title: Install and bind a verified portable Markdown Trace runtime
plan_id: portable-runtime-installer
artifact_version: "2.0"
revision: "2"
created_at: "2026-09-23T17:00:00Z"
updated_at: "2026-09-23T17:12:30Z"
target_repo: /Users/jasonbelmonti/Documents/Development/markdown-trace
target_worktree: /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/portable-runtime-installer
target_branch: codex/portable-runtime-installer
baseline_ref: 34be6d6b705397a2da465aaaf1a914c13aadb227
source_contract: docs/tasks/portable-runtime-installer.md revision 1 SHA-256 sidecar
validation_profile: /Users/jasonbelmonti/.codex/skills/execution-plan/profiles/execution-plan.yaml
---

## Plan Control

| Plan state | Planning depth | Source status | Baseline status | State rationale |
| --- | --- | --- | --- | --- |
| READY | expanded | current | inspected | Source integrity and baseline were inspected; the bounded staging, selection, and proof route passes semantic review. |

## Source Contract

| Source ID | Source reference | Version / fingerprint | Authority | Status | Planning implication |
| --- | --- | --- | --- | --- | --- |
| EP-SRC-1 | docs/tasks/portable-runtime-installer.md | revision 1; docs/tasks/portable-runtime-installer.sha256 | Primary completion and review boundary | current | Implement TD-SC-1 through TD-SC-5 without expanding Fleet or skill scope. |
| EP-SRC-2 | docs/design/shared-trace-runtime-contract.md C-2 to C-4 | SHA-256 846b71de6fc109cd7362aface64ef6c875fdf770a5c78639b9d060dda55d98f9 | Binding and lifecycle constraint subordinate to latest user instruction | current | Fixed launcher, no binding fallback, verify before active selection. |
| EP-SRC-3 | AGENTS.md; docs/portable-runtime.md | baseline commit 34be6d6b705397a2da465aaaf1a914c13aadb227 | Repository operation and existing format | current | Use worktree, retain producer format and existing gates. |

## Outcome Anchors

| Outcome ID | Source IDs | Source location | Required observable | Proof obligation |
| --- | --- | --- | --- | --- |
| EP-OUT-1 | EP-SRC-1, EP-SRC-2 | TD-SC-1; C-3 and C-4 | Valid candidate stages inertly; invalid bytes or descriptor reject. | Real candidate inventory, launcher inspection and unchanged active link. |
| EP-OUT-2 | EP-SRC-1, EP-SRC-2 | TD-SC-2; C-2 and C-3 | Fixed launcher preserves argv/cwd and identity; unsupported Node fails. | Installed command, negative Node and missing dependency runs. |
| EP-OUT-3 | EP-SRC-1, EP-SRC-2 | TD-SC-3; C-4 | Explicit activation and rollback of verified versions; failure keeps prior callable. | Two distinct candidates and failure injection with link snapshots. |
| EP-OUT-4 | EP-SRC-1, EP-SRC-2 | TD-SC-4; C-2 | Explicit binding wins, errors do not fall back; PATH finds exact command. | Controlled PATH and binding fixtures including invalid values. |
| EP-OUT-5 | EP-SRC-1, EP-SRC-3 | TD-SC-5 | Local documented workflow and current regression/platform gates pass. | macOS and Linux matrix plus source/package checks. |

## Baseline Findings

| Finding ID | Repository evidence | Current behavior / constraint | Planning implication | Confidence |
| --- | --- | --- | --- | --- |
| EP-FIND-1 | scripts/runtime/build.mjs produce; integrity.mjs verifyPayload | Producer emits release.json and a versioned payload; verifier covers full inventory but no launcher. | Installer consumes existing descriptor and owns launcher. | confirmed |
| EP-FIND-2 | scripts/runtime/check.mjs; .github/workflows/ci.yml portable-runtime job | CI already builds and checks real candidates on macOS and Linux; no install test. | Extend existing job with installed lifecycle proof. | confirmed |
| EP-FIND-3 | package.json bin and engines; docs/portable-runtime.md | Document CLI exists; supported Node range and local production guide are established. | Preserve CLI and document installed workflow. | confirmed |
| EP-FIND-4 | git status at baseline; `npm run ci:enforcement` after initial proof | Runtime inputs were clean; Vitest discovers `*.test.mjs` and cannot run the candidate-dependent standalone Node proof without artifact paths. | Keep that proof at `install.proof.mjs` and call it explicitly after candidate builds. | confirmed |

## Preconditions

| Precondition ID | Required state / input | Verification | Unmet trigger ID |
| --- | --- | --- | --- |
| EP-PRE-1 | Task checksum is valid, baseline is recorded, Node/npm and dependencies are available. | `shasum -a 256 -c docs/tasks/portable-runtime-installer.sha256`; `git rev-parse HEAD`; `node --version`; `npm ci`. | EP-TRIG-1 |
| EP-PRE-2 | First phase proves inert staging before active selection is edited. | EP-GATE-1 passes with real candidate and corrupt copy. | EP-TRIG-1 |

## Implementation Decisions

| Decision ID | Kind | Decision or assumption | Finding IDs | Evidence / rationale | Affected action IDs | Replan trigger ID |
| --- | --- | --- | --- | --- | --- | --- |
| EP-DEC-1 | decision | Use explicit install root with versioned releases and one atomic active symlink. | EP-FIND-1 | Avoids mutating existing payload and permits a prior version to remain installed; copying over active files was rejected. | EP-ACT-1, EP-ACT-2 | EP-TRIG-1 |
| EP-DEC-2 | decision | Installer-owned shell launcher embeds a fixed absolute entrypoint; it checks PATH Node version before exec. | EP-FIND-1, EP-FIND-3 | No candidate-owned launcher or payload override; direct Node invocation alone cannot enforce installed preflight. | EP-ACT-1, EP-ACT-2 | EP-TRIG-1 |
| EP-DEC-3 | decision | Binding resolver returns a validated absolute executable path and never executes through a shell. | EP-FIND-3 | Matches C-2 precedence while keeping consumer invocation separate. | EP-ACT-2 | EP-TRIG-1 |

## Execution Phases

| Phase ID | Phase objective | Entry precondition IDs | Safe intermediate state |
| --- | --- | --- | --- |
| EP-PH-1 | Produce real baseline candidate and implement verified inert staging. | EP-PRE-1 | Installed releases are verified and active command remains untouched. |
| EP-PH-2 | Add explicit selection, binding, documentation and platform proof. | EP-PRE-2 | Active command is a verified fixed-target launcher with explicit rollback and current evidence. |

## Execution Route

| Step ID | Kind | Phase ID | Required prior Step IDs |
| --- | --- | --- | --- |
| EP-ACT-1 | action | EP-PH-1 | None |
| EP-GATE-1 | gate | EP-PH-1 | EP-ACT-1 |
| EP-ACT-2 | action | EP-PH-2 | EP-GATE-1 |
| EP-ACT-3 | action | EP-PH-2 | EP-ACT-2 |
| EP-GATE-2 | gate | EP-PH-2 | EP-ACT-3 |

## Execution Actions

| Action ID | Precondition IDs | Outcome IDs | Targets | Concrete action | Observable postcondition | Evidence to capture | Failure response ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EP-ACT-1 | EP-PRE-1 | EP-OUT-1, EP-OUT-2 | scripts/runtime/install.mjs; scripts/runtime/installed-release.mjs; scripts/runtime/launcher.mjs | Produce baseline artifact, add stage command that verifies source and copied payload, writes fixed launcher in a pending versioned slot, verifies its bytes, then renames slot. | Stage succeeds without active link and corrupt inputs fail before a slot is installed. | Candidate descriptor, focused test output and diff. | EP-RESP-1 |
| EP-ACT-2 | EP-PRE-2 | EP-OUT-2, EP-OUT-3, EP-OUT-4 | scripts/runtime/install.mjs activate/rollback/status; scripts/runtime/resolve-binding.mjs; scripts/runtime/install.proof.mjs | Verify selected installed slot and runtime-info before atomic symlink switch; implement explicit rollback and binding resolution; test actual launcher and failure cases. | Two identified versions can be selected and restored, bad switches preserve prior target, resolver obeys C-2. | Installed lifecycle and binding test results with identities and link snapshots. | EP-RESP-1 |
| EP-ACT-3 | EP-PRE-2 | EP-OUT-5 | docs/portable-runtime.md; package.json scripts; .github/workflows/ci.yml | Document commands and extend runtime CI matrix to run installer lifecycle proof and source regressions. | Operators have reproducible commands and matrix jobs exercise installed behavior. | Guide diff, local check logs and CI URLs. | EP-RESP-1 |

## Change Footprint

| Path / component | Action IDs | Change type | Purpose | Confidence | Risk / ownership note |
| --- | --- | --- | --- | --- | --- |
| scripts/runtime/install.mjs and installed-release.mjs | EP-ACT-1, EP-ACT-2 | add | Stage and explicitly select verified releases. | confirmed | Restrict mutations to explicit root. |
| scripts/runtime/launcher.mjs | EP-ACT-1 | add | Generate and verify approved fixed-target launcher. | confirmed | Quote absolute target and check Node range. |
| scripts/runtime/resolve-binding.mjs | EP-ACT-2 | add | Implement binding precedence. | confirmed | No fallback on invalid explicit binding. |
| scripts/runtime/install.proof.mjs | EP-ACT-2 | add | Real temp-root lifecycle and binding proof. | confirmed | Distinct candidates and failure injection required. |
| docs/portable-runtime.md; package.json; .github/workflows/ci.yml | EP-ACT-3 | modify | Workflow and matrix evidence. | confirmed | Preserve existing gates. |

## Validation Gates

| Gate ID | Outcome IDs | Command or check | Expected observation | Evidence capture | Evidence artifact | Evidence verification | Failure response ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EP-GATE-1 | EP-OUT-1, EP-OUT-2 | Build a real candidate with `node scripts/runtime/build.mjs --out <temp>/candidate`; stage it and a corrupted copy via installer CLI. | Valid stage leaves active absent; corrupt copy fails; launcher matches template. | Save command output, exit codes, candidate digest, installed inventory and before/after link in evidence directory. | `.codefactory/execution-plans/portable-runtime-installer/evidence/EP-GATE-1.txt` | Verify report has source commit, Node version, command exits and unchanged link snapshot. | EP-RESP-1 |
| EP-GATE-2 | EP-OUT-1, EP-OUT-2, EP-OUT-3, EP-OUT-4, EP-OUT-5 | Run `node --test scripts/runtime/install.proof.mjs`, `npm run ci:enforcement`, `npm run check:package-exports`, `node experiments/task-definition-trace/verify.mjs`; inspect CI matrix results. | Positive and negative installed lifecycle cases pass; both platform jobs and source gates green. | Save stdout/stderr, exits, source/test/config fingerprints, Node/npm versions, and CI run links. | `.codefactory/execution-plans/portable-runtime-installer/evidence/EP-GATE-2.txt` | Confirm logs are current for exact code/fixtures and both platform job reports identify selected source and Node versions; rerun affected checks after changes. | EP-RESP-1 |

Evidence reports record HEAD plus staged/unstaged diffs and hashes of installer, tests, fixtures, package lock and workflow before and after each check. Preserve stale reports historically; rerun only gates whose consumed inputs changed. Temporary roots are outputs, not source inputs.

## Failure and Replan Controls

| Response ID | Trigger | Containment | Exact recovery / rollback procedure | Single restored safe state | Verification | Escalation trigger ID |
| --- | --- | --- | --- | --- | --- | --- |
| EP-RESP-1 | Any staging, selection or gate postcondition fails. | Stop dependent route steps and preserve logs and diff; keep tests confined to temporary roots. | For a disposable test root, remove the pending slot; if active was switched in a test, invoke `rollback --root <root> --release <previous-id>` only after previous slot verification. Do not touch a user's install root. | Prior active link remains callable, or no active link exists in a fresh root. | Inspect active symlink and invoke its `--runtime-info` where present; compare before/after snapshots. | EP-TRIG-1 |

| Trigger ID | Observable trigger | Stopped Step IDs | Evidence to preserve | Required decision / input | Exact resume condition |
| --- | --- | --- | --- | --- | --- |
| EP-TRIG-1 | Descriptor or launcher cannot be validated without changing C-2/C-3, unexpected host mutation, or unavailable required platform proof. | EP-ACT-1, EP-GATE-1, EP-ACT-2, EP-ACT-3, EP-GATE-2 | Descriptor, failed command log, active link and diff. | Revised task authority for changed observable behavior or a validated technical route. | Updated source and plan both pass their validators; affected proof reruns. |

### Rollout and Rollback

EP-ACT-2 changes only a caller-supplied temporary root during proof. Each switch retains earlier release slots; EP-RESP-1 defines the safe rollback. No automatic activation or host-wide installation occurs.

### Compatibility and Versioning

EP-GATE-2 checks Node 20.19.0 on Linux and Node 22.20.0 on macOS, the existing document command, owner gate and package exports. An unsupported Node is a failed selection or invocation, never a replacement active target.

### Security and Privacy

EP-ACT-1 treats candidate payload bytes as untrusted until independent inventory verification and verifies launcher bytes from the installer-owned template. EP-ACT-2 executes only a verified selected release, confines mutations to the explicit root, and rejects bad binding without fallback.

## Plan Readiness

| Decision | Reviewed at | Evidence / rationale | Required revision or blocker |
| --- | --- | --- | --- |
| PASS | 2026-09-23T17:12:30Z by Codex | Every TD-SC anchor maps to actions and gates; phase 1 keeps active state inert; selection follows verification; failure preserves prior active; scope and CI proof are bounded. | None. |

## Revision Log

| Revision | Timestamp | Actor | Material change | Reason / source | Checksum reference |
| --- | --- | --- | --- | --- | --- |
| 1 | 2026-09-23T17:00:00Z | Codex | Authored verified staging, selection and proof route. | Task definition revision 1 and inspected baseline. | execution-plan.sha256 |
| 2 | 2026-09-23T17:12:30Z | Codex | Put candidate-dependent Node proof outside Vitest discovery. | Enforcement run exposed `*.test.mjs` collection conflict. | execution-plan.sha256 |
