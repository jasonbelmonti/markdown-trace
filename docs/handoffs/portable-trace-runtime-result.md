# Portable runtime execution result

Implementation is delivered locally. Overall completion is blocked only on the
required Linux Node 20.19.0 execution result; the task checkpoint is `blocked`,
not `review-ready`. No source contract change is needed to resume that check.

Read these complete artifacts and controlling sources before relying on this
handoff or running the pending check:

- `docs/tasks/portable-trace-runtime.md`, revision 1, SHA-256 `f6be21a6a89d6b1d438b946848ddd73b6411f1242b76238b08dbb8ea5908a953`.
- `.codefactory/execution-plans/portable-trace-runtime/execution-plan.md`, revision 1,
  READY, SHA-256 `fe90acc9ed10530ac4b97ade1dc442f341fa3d27c2d1a8906d1866551b9886e9`; verify the adjacent checksum first.
- `AGENTS.md`, `docs/current-implementation.md`,
  `docs/design/shared-trace-runtime-contract.md` and
  `docs/design/markdown-trace-document-graph-overview.md` (verify its companion).
- `docs/validation/portable-trace-runtime/summary.json`, including evidence
  applicability and the full-version checkpoint comparison. The original
  `docs/handoffs/portable-trace-runtime.md` names the initial authoring hash;
  it is historical. Only the checkpoint row changed from that original task.

## Delivered source and artifacts

Branch: `codex/portable-runtime-implementation`.

Implementation commits: `a242c90` (plan, identity, producer, verifier), `e53473f`
(staging correction), `8a92023b96078594f1caa484a851f330e760da2b` (artifact proofs, CI and usage documentation).
The later delivery commit contains evidence and checkpoint updates only.

Producer source: `8a92023b96078594f1caa484a851f330e760da2b`. Engine: 3.6.0. Package: private 0.1.0.
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
| TD-SC-5 | PARTIAL | `enforcement.log` (296 passing tests and full enforcement), `package.log`, `owner-trial.json`, Mac arm64 Node v22.20.0; Linux Node 20.19.0 remains unexecuted. |
| TD-SC-6 | PASS | `reproduction.json`: all 2,005 files and full descriptors identical across independent clean builds; local usage workflow exercised. |

Evidence filenames above resolve under `docs/validation/portable-trace-runtime/`.
The Mac artifact run also passed under `sandbox-exec` with network denied.
A redundant enforcement rerun was interrupted after host process delays; it is
not admitted. The earlier passing regression inputs are unchanged, as recorded
in `summary.json`.

## Reproduction and remaining gate

From the repository root, create a checkout of the exact producer source:

```sh
git worktree add --detach .worktrees/portable-runtime-reproduction 8a92023b96078594f1caa484a851f330e760da2b
cd .worktrees/portable-runtime-reproduction
node scripts/runtime/build.mjs --out /tmp/trace-reproduced-a
node scripts/runtime/build.mjs --out /tmp/trace-reproduced-b
node scripts/runtime/reproduce.mjs --first /tmp/trace-reproduced-a --second /tmp/trace-reproduced-b
node scripts/runtime/check.mjs --artifact /tmp/trace-reproduced-a
```

Use the declared Node/npm toolchain to reproduce the recorded descriptor exactly.
For execution on Linux, install/select Node 20.19.0 on an available runner and
transfer the existing candidate plus its separately trusted descriptor. Run the
trusted proof scripts from the source commit above:

```sh
node --version
node scripts/runtime/check.mjs --artifact /absolute/transferred-stage --report /absolute/new-linux-proof.json
```

Require `environment.platform: linux`, `environment.node: v20.19.0`, `passed: true`
and the same source, descriptor and payload identities as above. Record the
result, compare evidence dependencies, revalidate the task checkpoint, and only
then mark it `review-ready`. The configured CI matrix offers the bounded Linux
and Mac route, but no workflow result is claimed and no branch has been pushed.

See `docs/portable-runtime.md` for independent verification and invocation.
Installation, host activation, rollback, Fleet changes, installed-skill migration,
merge and remote release publication remain outside this delivery.
