# Portable runtime execution result

Implementation and required platform proof are available for independent review.
The task checkpoint is `review-ready`; this is not an acceptance or installed
runtime claim. GitHub Actions run 35723730819 supplies the formerly missing
Linux Node 20.19.0 proof alongside macOS Node 22.20.0.

Read these complete artifacts and controlling sources before relying on this
handoff or reviewing the PR:

- `docs/tasks/portable-trace-runtime.md`, revision 1, SHA-256 `27a2665ee8cb40702400c28354200bae03895ea8f10f7737fbaee517fe695e82`.
- `.codefactory/execution-plans/portable-trace-runtime/execution-plan.md`, revision 1,
  READY, SHA-256 `fe90acc9ed10530ac4b97ade1dc442f341fa3d27c2d1a8906d1866551b9886e9`; verify the adjacent checksum first.
- `AGENTS.md`, `docs/current-implementation.md`,
  `docs/design/shared-trace-runtime-contract.md` and
  `docs/design/markdown-trace-document-graph-overview.md` (verify its companion).
- `docs/validation/portable-trace-runtime/summary.json`, including evidence
  applicability, the full-version checkpoint comparison, and the retained CI
  reports. The original `docs/handoffs/portable-trace-runtime.md` names the
  initial authoring hash and is historical. Only the checkpoint row changed
  from that original task.

## Delivered source and artifacts

Branch: `codex/portable-runtime-implementation`.

Implementation commits: `a242c90` (plan, identity, producer, verifier), `e53473f`
(staging correction), `8a92023b96078594f1caa484a851f330e760da2b` (artifact proofs, CI and usage documentation).
Subsequent commits through PR head `6e9245f7d8cd9f53b0736ecbb0160f175b1983ad`
opened the draft PR without changing runtime, test, fixture, lockfile or CI inputs.
This remediation changes only the checkpoint, result handoff, validation summary
and retained CI reports; compare the diff before carrying older evidence forward.

The following local candidate is historical evidence from producer source
`8a92023b96078594f1caa484a851f330e760da2b`. Engine: 3.6.0. Package: private 0.1.0.
Toolchain: Node v22.20.0, npm 11.13.0, TypeScript 6.0.3.

Local runnable artifact: `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/portable-runtime-implementation/dist/portable-runtime/markdown-trace-0.1.0-8a92023b96078594f1caa484a851f330e760da2b`.

Trusted descriptor: `/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/portable-runtime-implementation/dist/portable-runtime/release.json`.

Payload inventory SHA-256: `4458f31c4b4990bc46168f75b96c655885ca86fae54ec618dec837c9402f03a7`.
Descriptor SHA-256: `709ddf2269a35a638c6463253792e7aa529e207f72f2c2f29e6a6fcb55d024f7`.

The delivery copy was independently reverified after relocation. The two clean
production stages also remain at `/tmp/markdown-trace-runtime-release-a` and
`/tmp/markdown-trace-runtime-release-b`; they are disposable. Runtime payloads
and the delivery copy are ignored build artifacts, not Git-tracked release assets.
Keep the descriptor through a trusted channel when transferring a candidate.

## Evidence by criterion

| Criterion | Result | Evidence |
| --- | --- | --- |
| TD-SC-1 | PASS | `macos.json`: relocated candidate, explicit copied inputs, spaces/relative paths, restricted filesystem, empty PATH, disabled global lookup, denied network/subprocess, missing Engine execution failure. |
| TD-SC-2 | PASS | `macos.json`, `checkout-identity.json`, `producer-negatives.json`: real entry points, truthful identity, 20 rejected combinations and dirty-source rejection. |
| TD-SC-3 | PASS | `macos.json`: independent complete inventory; changed, missing, extra and linked content rejected. |
| TD-SC-4 | PASS | `macos.json`, `owner-trial.json`: five modes, exact graph/query/range oracles, invalid/indeterminate graphs, four located defects and repairs, unchanged inputs, separate structural gate. |
| TD-SC-5 | PASS | `enforcement.log` (296 passing tests and full enforcement), `package.log`, `owner-trial.json`; CI run 35723730819 passes artifact smoke on Linux x64 Node v20.19.0 and macOS arm64 Node v22.20.0 for the reviewed tree. |
| TD-SC-6 | PASS | `reproduction.json` and both CI reproduction reports: 2,005-file payload and descriptors agree across two clean builds per toolchain; local usage workflow exercised. |

Evidence filenames above resolve under `docs/validation/portable-trace-runtime/`.
The Mac artifact run also passed under `sandbox-exec` with network denied.
A redundant enforcement rerun was interrupted after host process delays; it is
not admitted. The earlier passing regression inputs are unchanged, as recorded
in `summary.json`.

## Platform proof and review handoff

[CI run 35723730819](https://github.com/jasonbelmonti/markdown-trace/actions/runs/35723730819)
completed successfully for enforcement, Linux x64 Node v20.19.0 and macOS
arm64 Node v22.20.0. The retained `ci-35723730819-{linux,macos}-{artifact-proof,reproduction}.json`
reports each say `passed: true`. Each platform built two matching 2,005-file
payloads; both payload inventories have SHA-256
`23ca04e2d5aafd7c987a47d75585a9e384ea3ec3de733e3bb324b4b23d5d3ba6`.
The Linux and macOS descriptors differ by build environment but match within
each platform's two-build comparison. The reports identify synthetic merge
commit `9c3dd3a6670d9bde966799c1058d49dfeef7e540`; its tree
`1c3230c5fc26db4f50d4ea3520ee4790eaf3ec8c` equals PR head
`6e9245f7d8cd9f53b0736ecbb0160f175b1983ad`'s tree. This establishes
source applicability without pretending the synthetic merge commit is the PR
head commit.

The four retained CI reports and their hashes are indexed in `summary.json`.
Prior local candidate identities above remain historical evidence, not the CI
candidate identities. This remediation changes only task/evidence/handoff
records, so the recorded runtime, test, fixture, lockfile and workflow inputs
remain unchanged. Before concluding independent review, inspect the rerun CI
artifacts on the new PR head and compare its checkout tree to that head. A
failure or tree mismatch returns the checkpoint to active rather than relying
on this handoff.

From a clean checkout, a maintainer can reproduce the candidate and verify the
local workflow with the commands in `docs/portable-runtime.md`. Installation,
host activation, rollback, Fleet changes, installed-skill migration, merge and
remote release publication remain outside this delivery.
