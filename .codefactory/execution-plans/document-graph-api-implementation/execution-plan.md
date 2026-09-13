---
type: ExecutionPlan
title: Document graph API implementation planning prerequisites
plan_id: document-graph-api-implementation
artifact_version: "2.0"
revision: "1"
created_at: 2026-09-13T14:22:17Z
updated_at: 2026-09-13T14:22:17Z
target_repo: /Users/jasonbelmonti/Documents/Development/markdown-trace
target_worktree: /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/document-graph-interfaces
target_branch: codex/document-graph-interfaces
baseline_ref: dce4ac19f8f25f4add7c38898e31934eb70de592
source_contract: "docs/design/markdown-trace-document-graph-interfaces.md; revision 2; sha256 b99969954c79843b4995cd10393a7e2cc2734cb96da204b0e8f77277b8c91e3f; draft semantics"
validation_profile: /Users/jasonbelmonti/.codex/skills/execution-plan/profiles/execution-plan.yaml
---

# Document graph API implementation planning prerequisites

## Plan Control

| Plan state | Planning depth | Source status | Baseline status | State rationale |
| --- | --- | --- | --- | --- |
| BLOCKED | standard | missing | inspected | The API draft is available, but language/source-ownership decisions needed to select a trustworthy extraction route remain incomplete. This is a blocked planning packet, not an executable or fully validated plan. |

| Missing planning input | Route decision affected | Why execution is unsafe | Permitted reconnaissance | Decision owner | Exact resume condition |
| --- | --- | --- | --- | --- | --- |
| Packet Q-1: selected declaration and typed-reference syntax | Lexer and declaration classification | Explicit markers and structural declarations produce different graphs for the same Markdown; the plan cannot silently decide product meaning | Compare examples and parser source mappings; finish the recommendation under the existing contract task | Jason, with maintainer recommendation | Owner selects the syntax direction and that decision is recorded in the current packet with refreshed revision, validation status and checksum |
| Packet Q-2/FND-1: complete lexical, literal, malformed and nested ownership contract with independent corpus | Extraction, resolution, fragments and exact source locations | A compiling API cannot determine correct owners or offsets for unresolved cases; implementing them now would turn incidental code into language authority | Complete .codefactory/execution-plans/document-graph-contract-closeout/execution-plan.md; inspect public Engine mappings without implementing a second parser | Maintainer; Jason judges authoring fit | A current checksummed contract and corpus assign each required case an interpretation or diagnostic, and the authoring decisions needed by the first extraction slice are accepted |
| Packet Q-3: additive package subpath and schema disposition | Public export implementation only | Root-only consumer checks are an existing boundary; public names must not change by inference from a draft | Inventory imports and export tests; preserve existing root API | Maintainer and Jason | Public contract disposition is current before export work; it need not hold up earlier internal proof once Q-1/Q-2 are resolved |

Read first: this packet; docs/tasks/document-graph-contract.md; docs/design/markdown-trace-document-graph-overview.md; docs/design/markdown-trace-document-graph-interfaces.md; docs/design/document-graph-api/validation.json; and AGENTS.md. Verify their supplied checksums. Current primary task SHA-256 is f9f7132321ed0e8664a0e4f906074e7302de8dfc03d5c94df39033e2a3e52057. The staged API draft is additional input beyond baseline commit dce4ac19f8f25f4add7c38898e31934eb70de592.

The established delivery order is recorded in the overview, section 7: document graph and backlinks, profile validation, context retrieval, then adoption and release. This packet does not fabricate detailed runtime actions before their controlling language is resolved. Q-4 real-spec context and scale targets are later pilot/release prerequisites, not an additional blocker on contract work.

Operation: CREATE. Revision: 1. Semantic route-audit decision: BLOCKED for runtime implementation. Structural-profile and execution-route validators are not run because the blocked-output format intentionally is not a complete Execution Plan. Its checksum identifies the recorded prerequisites and does not confer execution readiness.

The next executable work is the separate contract-closeout plan. This packet may be revised into a full runtime route when its missing inputs are present; a specific ticket format or new planning-document hierarchy is not required.
