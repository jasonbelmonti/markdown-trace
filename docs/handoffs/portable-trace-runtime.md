# Implementer handoff: portable Markdown Trace runtime

Implement **Produce the portable Markdown Trace runtime artifact** in
`jasonbelmonti/markdown-trace`:
https://github.com/jasonbelmonti/markdown-trace

Read the complete task and its controlling sources before planning or changing
code. The canonical task is `docs/tasks/portable-trace-runtime.md`, revision **1**,
SHA-256 **`6c4528f02d912848784c22761f5e43f4c65783fb95ab1aae536b9f1a711e4eb0`**.
Its state/route is **READY / PLAN_REQUIRED**. Its Execution Checkpoint is
**not-started**, with no implementation evidence admitted.

On the originating machine, read the task at:

```text
/Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/portable-runtime-task/docs/tasks/portable-trace-runtime.md
```

The task, this prompt and `docs/validation/portable-trace-runtime-task.json` are
available on the local authoring branch `codex/portable-runtime-task`. If working
in another checkout or on another machine, carry those three files at their
repository-relative paths and verify the task hash before relying on them; do
not assume the local authoring branch has been pushed to origin.

Load the installed **task-definition** skill and follow its task, checkpoint and
evidence rules. Then read `AGENTS.md`, `docs/current-implementation.md`, the task's
Source Authority entries and especially
`docs/design/shared-trace-runtime-contract.md`. The shared contract's SHA-256 is
`846b71de6fc109cd7362aface64ef6c875fdf770a5c78639b9d060dda55d98f9`.
Verify the existing overview and fixture checksum companions. This explicitly
selected task owns the new work; the prior shared-runtime task records the
completed interface/Engine-upgrade foundation.

Create an implementation worktree under the repository's `.worktrees/` directory
from freshly fetched `origin/main`, using a `codex/` branch. Carry the task files
into it. The inspected baseline is
`90610cdabca6dfc04e069451798a2ef19b08cf2b`, which includes merged PR #89. Reconcile
relevant changes since that baseline without silently changing this task's scope.

Use the installed **execution-plan** skill to create and validate the bounded
execution plan before implementation. The plan should resolve the artifact
production choices left open by the existing contract and map implementation
and proof to TD-SC-1 through TD-SC-6. After its required gates pass, implement the
task to completion. Do not stop after merely proposing the plan.

The result is a locally produced, versioned runtime payload with its dependencies,
C-3 `--runtime-info`, complete integrity metadata and independent verification,
plus evidence from running that candidate outside the checkout. Keep Engine
exactly **3.6.0** and preserve the existing public/experimental interfaces and
document-owner gates. Reuse existing fixture expectations; a test that invokes
the checkout or installs missing runtime dependencies does not prove portability.

Apply the task's checks, including unchanged input hashes, real identity-command
probes, altered/missing payload failures, isolated defect/repair and output-mode
checks, existing enforcement/package/trial checks, the bounded Linux/macOS Node
coverage, and repeatable covered-payload production. Record the exact source,
lockfile, toolchain, artifact, descriptor, profile and environment identities.
Update the Execution Checkpoint at material evidence and handoff boundaries.

Keep installation, active launchers/bindings, rollback, installed-skill migration,
Fleet changes and remote publishing outside this task. Continue independent
work when a check is unavailable, but do not claim completion without the required
evidence. If implementation requires a controlling interface or scope change,
identify the precise conflict and use the task-definition revision workflow
before continuing dependent work.

Finish with the implementation commits, runnable artifact and descriptor paths,
reproduction commands, and a criterion-by-criterion evidence summary. Set the
Execution Checkpoint to `review-ready` only after all six criteria have applicable
passing evidence. Leave a reviewable result; this prompt does not request a merge,
release publication or host activation.
