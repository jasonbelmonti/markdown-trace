# Markdown Trace tasks for context projections

These four Task Definitions were authored on 2026-09-23 from the user's request and the inspected Markdown Trace baseline. This index supplies navigation and authoring provenance; each task's body owns its scope, lifecycle, route and proof obligations. No runtime implementation was performed by this authoring session.

## User source excerpt

The user asked whether Markdown Trace could help create a worker-facing packet containing applicable obligations, traceability to complete sources and rules for retrieving them. After discussion of bounded traversal, exact source projection, explicit cross-document resolution and projection-policy verification, the user requested:

> Can you help me generate [$task-definition](/Users/jasonbelmonti/.codex/skills/task-definition/SKILL.md) s for the work we needed executed in markdown-trace?

The task set turns that request into bounded proposed capability contracts. It does not modify the installed TaskDefinition or ExecutionPlan full-read rules. Cross-document resolution is an explicit next-delivery extension beyond the existing overview's document-local delivery; task 03 requires specification and documentation reconciliation before implementation.

## Task index

| Task | Outcome | Selected preparation route | Capability dependencies |
| --- | --- | --- | --- |
| [01 — Bounded traversal](01-bounded-traversal.md) | Explain a bounded dependency selection from one document. | PLAN_REQUIRED | Existing graph. |
| [02 — Source projection](02-source-projection.md) | Return exact excerpts, support, provenance and omissions. | PLAN_REQUIRED | Implemented traversal from 01. |
| [03 — Cross-document resolution](03-cross-document-resolution.md) | Resolve qualified entities and revisions across explicit sources. | SPEC_REQUIRED | Existing analyses; 01 before cross-document traversal implementation. |
| [04 — Projection policy and verification](04-projection-policy-verification.md) | Prove declared mandatory content is present and current. | SPEC_REQUIRED | 01/02 for single-document runtime; 03 for corpus runtime. |

This is a capability dependency summary, not an execution plan or permission to fan out edits. Task Control in each file is authoritative. Planning/specification can address declared predecessor contracts before runtime implementation, but dependent execution requires actual verified predecessor capabilities and reconciliation of their interfaces.

## Repository and handoff

- Repository: https://github.com/jasonbelmonti/markdown-trace
- Inspected commit: 24d33c1061101c1065fb511921f7ddce4f285717
- Authoring branch: codex/delegation-projection-tasks
- Repository artifact directory: `docs/tasks/delegation-context/`
- Artifact revisions: 1; exact bytes are identified by adjacent `.sha256` records.
- Read each complete task and its controlling sources first. Resolve repository-relative paths in a Markdown Trace checkout; historical source bytes can be retrieved at the inspected commit. Read and verify adjacent checksums before reliance. Compare current source state before execution.
- `source-fingerprints.json` records inspected baseline sources. `validation/` records final structural checks and their artifact/profile identities. These records do not establish implementation acceptance.

For a different machine, copy this directory into the same repository-relative location in a checkout. The exported bundle contains these files verbatim; it is a delivery copy, not a separately maintained scope authority. The installed task-definition skill must provide its current profile and guides at execution time; reconcile material differences before reliance.

## Outside this repository boundary

Owning-skill adoption of full-read substitutions, semantic sufficiency review, delegation/model routing, actual capsule packaging/agent startup and active runtime/Fleet rollout remain separate. A mechanically verified projection never grants itself execution authority.
