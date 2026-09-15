# Repository operating guidance

## Current authority

Read before planning or implementation:

1. [Document graph direction](docs/design/markdown-trace-document-graph-overview.md)
2. [Current implementation](docs/current-implementation.md)
3. The active implementation boundary: [runnable document graph and backlinks](docs/tasks/runnable-document-graph.md).

The latest explicit user instruction takes precedence. The overview defines direction; source/tests describe implemented behavior. The active task owns completion and review boundaries. Future tasks must cite current contracts rather than resurrecting removed plans.

The target is a document-wide identity/relationship graph with validation and query/context APIs. Current table roles, closed relationship enums, YAML registries, and `ctx://trace` syntax are existing implementation constraints, not the final language or product scope. The experimental graph uses the current draft syntax and ownership. The owner authorized a runnable implementation after the contract/corpus work; earlier contract-only gates do not block this slice. Stable syntax and release approval remain separate.

## Tasks and durable artifacts

- Use the `task-definition` skill for task authoring, revision, and review. Evaluate changes within the task's scope and review boundary.
- Read durable source artifacts before relying on them; verify checksums when provided. Update affected artifacts, revision records, validation evidence, and checksums when scope changes.
- Include exact repository-relative artifact paths and a read-first instruction in handoffs. Do not depend on machine-specific worktree paths or chat memory.
- Evidence payloads, experimental fixtures, and older local agent/worktree artifacts are not current execution authority. Follow directory guidance and the active task.

## Implementation discipline

- Work in a Git worktree under the project's `.worktrees/` directory.
- Keep modules focused; separate contracts, extraction, graph logic, validation, queries, context projection, and adapters as those boundaries are introduced.
- Use Markdown Engine's public API for Markdown structure/source access. Do not build a second Markdown parser.
- Preserve runtime and schema/CLI compatibility unless the active task explicitly changes it. Do not weaken tests to conceal missing target functionality.
- Use the worktree's installed environment: `npm ci`, relevant focused checks, then `npm run ci:enforcement` for changes affecting repository compatibility.
- Remove superseded guidance instead of keeping archives or redirect stubs. Git history remains available when the current task needs historical evidence.
