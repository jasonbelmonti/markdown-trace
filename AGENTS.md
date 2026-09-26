# Repository operating guidance

## Current authority

Read before planning or implementation:

1. [Document graph direction](docs/design/markdown-trace-document-graph-overview.md)
2. [Current implementation](docs/current-implementation.md)
3. The selected task definition under [delegation-context](docs/tasks/delegation-context/README.md), when implementing that capability.

The latest explicit user instruction takes precedence. The overview defines direction; source/tests describe implemented behavior. A selected task owns its own completion and review boundaries. The earlier runnable-graph and portable-runtime tasks record delivered work; they are not active authority for new changes.

The target is a document-wide identity/relationship graph with validation and query/context APIs. The experimental graph uses standard Markdown links under draft2; docs/experimental-document-graph.md owns the current authoring convention. Graph analysis, direct queries, profile-based validation, bounded traversal and local source-context projection are implemented. The document CLI exposes local context; explicitly bound cross-document queries and traversal are available through the corpus API. See docs/current-implementation.md for current capability and interface boundaries. Continue from this runtime. Old brace-syntax corpus and contract-only execution plans are removed and must not be restored as implementation prerequisites.

The table-profile validator and registry/sidecar workflow were retired by owner instruction. Do not restore their code, fixtures, CLI commands, package exports, or CI gates. Older task and evidence records describe completed historical work; they are not current implementation instructions. The owner approved a normal public npm release at 0.1.1. Preserve existing protocol identifiers and the experimental/graph compatibility alias; confirm registry publication separately from package preparation.

## Tasks and durable artifacts

- Use the `task-definition` skill for task authoring, revision, and review. Evaluate changes within the task's scope and review boundary.
- Read durable source artifacts before relying on them; verify checksums when provided. Update affected artifacts, revision records, validation evidence, and checksums when scope changes.
- Include exact repository-relative artifact paths and a read-first instruction in handoffs. Do not depend on machine-specific worktree paths or chat memory.
- Keep per-run execution plans, delegation bundles and verbose validation transcripts in ignored local storage. Do not force-add them to implementation commits; repository publication of these artifacts requires an explicit request.
- Evidence payloads, experimental fixtures, and older local agent/worktree artifacts are not current execution authority. Follow directory guidance and the active task.

## Implementation discipline

- Work in a Git worktree under the project's `.worktrees/` directory.
- Keep modules focused; separate contracts, extraction, graph logic, validation, queries, context projection, and adapters as those boundaries are introduced.
- Use Markdown Engine's public API for Markdown structure/source access. Do not build a second Markdown parser.
- Preserve document-graph runtime and schema/CLI behavior unless the active task explicitly changes it. Do not weaken tests to conceal missing target functionality.
- Use the worktree's installed environment: `npm ci`, relevant focused checks, then `npm run ci:enforcement` for changes affecting repository compatibility.
- Remove superseded guidance instead of keeping archives or redirect stubs. Git history remains available when the current task needs historical evidence.
