---
type: DelegationPlan
artifact_version: "2.0"
revision: "3"
delegation_id: "task-2-source-projection"
---

# Delegation: task-2-source-projection

## Control

| State | Granularity | Selected pilot extent | Max attempts per packet | Scheduling |
| --- | --- | --- | --- | --- |
| READY | action | DP-WP-1, DP-WP-2, DP-WP-3, DP-WP-4 and every coordinator step; complete Task 2 route | 2 | Serial |


## Sources and baseline

| Role | Full read path / reference | Revision | SHA-256 / immutable identity |
| --- | --- | --- | --- |
| Task completion authority; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/docs/tasks/delegation-context/02-source-projection.md | 1 | 5bb45b3b71aa9cf1523cc0f2cf89063c6071ca12b5807f89a874e8a01ad9d714 |
| Task completion authority; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/AGENTS.md | Current baseline | 6400c9bc9e598a3beb485806cdd6a58e848144a2b73ee641623728f7f73436e0 |
| Task completion authority; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/docs/tasks/delegation-context/README.md | 1 | 835688562be6f6f8ccf3d40085f2706538d0db161701ab308bc386643cf465a5 |
| Task completion authority; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/docs/design/markdown-trace-document-graph-overview.md | Current baseline | bfa0cdbba260204b8f9e7a8b4ecc35c26184ea36b85ad1bb2a7f58c9a13fab34 |
| Task completion authority; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/docs/current-implementation.md | Current baseline | 2500f2820c3b96795bab11caddc950549355b1674ab179ec085f3a934e566568 |
| Task completion authority; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/docs/design/markdown-trace-document-graph-interfaces.md | Current baseline | 192a7f915e09f30fcb2284a55ed196a554799db07fa06d9908d424e8d26b8efe |
| Task completion authority; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/docs/tasks/delegation-context/01-bounded-traversal.md | 1 | 6be0510eeb9cc99b14ae9862012de47bf1357ebb1867bb6097b733697f80bb39 |
| Task completion authority; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/docs/experimental-document-graph.md | Current baseline | f21b6199363c806f52776f6f3b7ba74204c653572856e04a795b01831575ca26 |
| Task completion authority; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/docs/design/document-graph-api/contracts/context.d.ts | Current baseline | 3a4e94e011451e25974c47f0fe05f029b0247370bd643c1d58be2565706bbbf3 |
| User-facing capability status; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/README.md | Current baseline | 93b64acc6cfb2ab3661146fcf21032de62b9f7efe15bf0628d29f013cdd4f1c3 |
| READY execution plan; complete read | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/.codefactory/execution-plans/task-2-source-projection/execution-plan.md | 3 | 665bcbf191cf2a6a91bef24e8c3aca626b8e930974dbaeeb39ef7eeef217b281 |
| Upstream validator and REVIEW evidence; inspect | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/.codefactory/execution-plans/task-2-source-projection/validation | Current candidate pass | task-validation.json; plan-structure-3.json; plan-route-3.json; task-review.md |
| User authorization; complete read | /Users/jasonbelmonti/.codex/attachments/500d0d3f-3a7c-48f5-88db-6e88b665d5e7/Pasted text.txt | 2026-09-24 | Complete Task 2 route, local commits/checkpoints; no merge/publication/activation |
| Repository/worktree | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection | codex/task-2-source-projection | 728e3439c65b0fc65c27cefd69f16161ae866620 baseline; accepted packet1-3 progress at 8b23a06815a26da5f5a8594cf0cfb32b1a4a1d90; runtime decisions and original task unchanged |
| Capsule workflow; complete read | /Users/jasonbelmonti/.codex/skills/context-capsules/SKILL.md | Installed current bytes | Installed capsule CLI operation help and per-worker session receipt required |

All controlling sources require complete reads. Read current runtime sources as well as captured inputs; expected accepted implementation progress is reconciled from execution records. No mandatory source read is replaced by packet prose. The supplied repository operating manual additionally requires precise STATUS updates, task-definition for work-item contracts, focused module ownership, no review-only edits, preserved evidence and worktrees. Workers execute only their implementation action and do not author/review task contracts.

## Model roster

| Order | Model | Reasoning effort | Harness | Availability evidence |
| --- | --- | --- | --- | --- |
| 1 | gpt-6-luna | medium | Codex collaboration.spawn_agent, fork_turns none | Current tool schema advertises this exact model and medium; reconfirm at dispatch; no comparable measured history |
| 2 | gpt-6-sol | medium | Codex collaboration.spawn_agent, fork_turns none | Current tool schema advertises this exact model and medium; reconfirm at dispatch; no comparable measured history |
| 3 | gpt-6-astra | medium | Codex collaboration.spawn_agent, fork_turns none | Current tool schema advertises this exact model and medium; reconfirm at dispatch; no comparable measured history |


## Ordered assignments

| Packet / coordinator | Ordered source steps | Source outcomes | Worker packet | Model / effort | Selection basis | Escalation / stop |
| --- | --- | --- | --- | --- | --- | --- |
| DP-WP-1 | EP-ACT-1 | TD-SC-1, TD-SC-4 | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/.codefactory/delegations/task-2-source-projection-r3/packets/DP-WP-1.md | gpt-6-luna / medium | experimental: settled bounded capture/range correction | Escalate to gpt-6-sol on implementation failure only; two total attempts; stop for context/plan/environment/scope failure |
| Coordinator | EP-GATE-1 | TD-SC-1, TD-SC-4 | Run and inspect exact source gate after worker proposal | Coordinator session | User requires independent coordinator acceptance | Do not advance until gate passes; preserve failures |
| DP-WP-2 | EP-ACT-2 | TD-SC-1, TD-SC-2, TD-SC-3, TD-SC-4 | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/.codefactory/delegations/task-2-source-projection-r3/packets/DP-WP-2.md | gpt-6-sol / medium | experimental: coupled bundle union, identity and omission reasoning within settled plan | Escalate to gpt-6-astra on implementation failure only; two total attempts; stop for context/plan/environment/scope failure |
| Coordinator | EP-GATE-2 | TD-SC-1, TD-SC-2, TD-SC-3, TD-SC-4 | Run and inspect exact source gate after worker proposal | Coordinator session | User requires independent coordinator acceptance | Do not advance until gate passes; preserve failures |
| DP-WP-3 | EP-ACT-3 | TD-SC-1, TD-SC-2, TD-SC-3, TD-SC-4 | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/.codefactory/delegations/task-2-source-projection-r3/packets/DP-WP-3.md | gpt-6-sol / medium | experimental: cross-layout independent oracle design and adversarial accounting | Escalate to gpt-6-astra on implementation failure only; two total attempts; stop for context/plan/environment/scope failure |
| Coordinator | EP-GATE-3 | TD-SC-1, TD-SC-2, TD-SC-3, TD-SC-4 | Run and inspect exact source gate after worker proposal | Coordinator session | User requires independent coordinator acceptance | Do not advance until gate passes; preserve failures |
| DP-WP-4 | EP-ACT-4 | TD-SC-5 | /Users/jasonbelmonti/Documents/Development/markdown-trace/.worktrees/task-2-source-projection/.codefactory/delegations/task-2-source-projection-r3/packets/DP-WP-4.md | gpt-6-luna / medium | experimental: bounded consumer and documentation integration | Escalate to gpt-6-sol on implementation failure only; two total attempts; stop for context/plan/environment/scope failure |
| Coordinator | EP-GATE-4 | TD-SC-5 | Run and inspect exact source gate after worker proposal | Coordinator session | User requires independent coordinator acceptance | Do not advance until gate passes; preserve failures |
| Coordinator | EP-ACT-5, EP-GATE-5 | TD-SC-1, TD-SC-2, TD-SC-3, TD-SC-4, TD-SC-5 | Inspect all current evidence, run enforcement, commit accepted source and publish capsule checkpoint | Coordinator session | User owns final verification requirement | Stop if any required evidence is absent/stale; independent task review follows |

One delegate run including follow-ups is one attempt. Start at each assigned tier; advance once to the next roster tier only on retained implementation failure. Never reset the two-attempt cap. Costs, token usage and success probabilities are unknown unless returned by the harness. No dollar/turn cap is claimed. Only one worker may write at a time. Workers cannot recursively delegate, change contracts or accept themselves.

## Readiness

| Field | Value |
| --- | --- |
| Audit decision | PASS |
| Audit evidence | Flattened assignments exactly match all ten plan route rows in order, with gates coordinator-owned and no duplication. All source and packet reads, postconditions, paths, attempt caps, evidence capture and model configurations are explicit. Task REVIEW and both plan validators pass under Engine 3.6.0; plan checksum verifies. Revision 3 adds only README to packet4 and its documentation gate; prior accepted packet evidence remains applicable. This is coordinator audit, not independent assurance. |
| Dispatch prerequisites | Verify current task/plan/bundle checksums and artifact/resource hashes; revalidate delegation plus selected packet before EVERY attempt; require earlier gate acceptance, current code-state reconciliation and verified capsule binding, complete reads and own session acknowledgment before edits. |
| Blockers | None |
| Resume condition | Dispatch only when all listed prerequisites pass and selected attempt is within the cap. |
| Capsule | Coordinator will bind one task run to the exact plan worktree; actual returned run ID, entrypoint and identities are supplied in each live handoff. Every worker must use its own fresh UUID and verify receipt. |


## Revision note

| Field | Value |
| --- | --- |
| Change and authority | Revision 3 adds README status correction to packet4 after source inspection. Prior accepted packets and all attempt counts are retained; no packet4 attempt has run. The exact ten-step route and task outcomes are unchanged. This revision packages the READY plan for the user-authorized complete Task 2 route. Runtime evidence stays under .context-capsule/execution/runs/task-2 outside this immutable bundle. |

