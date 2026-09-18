# Profile validation review boundaries

Read [the active task](../../experiments/task-definition-trace/task-definition.md)
first and verify its adjacent checksum. Its revision 3 completion and review
boundary governs every handoff below. Do not use the older runnable-graph task
to exclude the package integration authorized by the owner.

The remaining PRs target `main`, fetched at
`94a6c7cc0b3cc5c1dd681ef6690165389266a5e5` on 2026-09-18. PR #82 is
already on main. PR #85 carries the reviewed #83 API changes to main because
#83 merged into the former #82 branch. Its head,
`24e39271f17b37557ba02706579d75c3f51334e5`, has the same complete Git tree
as the reviewed #83 head `ee716f4d896899602eaceec834bb97210f69ce3d`.

Merge #85 before #84. The #84 branch includes #85 and the two #83 review
fixes. While #85 is pending, GitHub's main-based #84 diff includes that
dependency; isolate the R6 review with
`git diff 24e39271f17b37557ba02706579d75c3f51334e5...codex/task-definition-trace-pilot`.
After #85 merges, the ordinary #84 PR diff has that same adapter/docs boundary.
In the review table, `DG` means `src/markdowntrace/document-graph/`.

| Order | Branch | PR base | Review scope |
| --- | --- | --- | --- |
| Landed (#82) | `codex/retain-graph-engine-capture` | `main` | R2: retain the existing normalized document privately; preserve graph/query/export behavior. |
| Next (#85) | `codex/land-graph-validation-on-main` | `main` | Previously reviewed R1, R3, R4 and R5: compiler, source coverage, graph policy, exports and package tests, including the two #83 review fixes. |
| Then (#84) | `codex/task-definition-trace-pilot` | `main` | R6: runnable skill adapter, defect/repair proof, usage guidance and this review map; depends on #85. |

The task, checksum, annotation convention and profile are included in #85 and
inherited by #84. Each PR body links its dependency, this contract and its
specific verification. The six review topics remain separate questions across
the capture, package API and adapter boundaries; shared test inputs stay with
the tests that consume them.

Verification: run `npm run ci:enforcement` at each PR checkpoint, including the
real packed consumer. The reviewed API, including remediation, passed with
36 test files and 275 tests. The PR bodies record checks against their exact
heads. At the stack tip, rerun the TaskDefinition command proof with
`node experiments/task-definition-trace/verify.mjs`; it records its input and
built-runtime fingerprints in its ignored `output/verification.json`.
Before relying on saved observations, verify their fingerprints against the
current files. This packet routes review; it does not claim independent approval.

Review contracts and capture first, then source coverage and graph rules, then
the package and skill consumers. Tests and shared files can appear in multiple
boundaries; each handoff names the behavior it owns.

## Recommended Specialist Reviews

| Priority | Axis | Evidence From Diff | Specialist Handoff Prompt |
| --- | --- | --- | --- |
| P2 | R1 — Profile contracts and compilation | `DG/contracts/validation-profile.ts`, `DG/contracts/validation.ts`, `DG/profile.ts`, `DG/validation/profile.ts`, `DG/validation/schema.ts`: new versioned JSON compiler, typed rules/results, issued handles and separate interpretation/validation hashes. | API-contract specialist: read `experiments/task-definition-trace/task-definition.md` and its checksum first. Start from the diff, loading adjacent code only as needed. Review closed fields, rule and selector types, explicit error outcomes, hash separation and unchanged document-profile.v1 behavior. Preserve this boundary; report findings only with concrete accepted-invalid-input, compatibility or caller-impact evidence. |
| P2 | R2 — Shared Engine capture | `DG/extract.ts`, `DG/extraction-model.ts`, `DG/analyze.ts`, `DG/analysis-state.ts`: retain the normalized Engine document privately. The new validation test counts real parse/normalize calls across analysis and repeated validation; existing graph/query tests protect snapshot behavior. | Capture/lifecycle specialist: read `experiments/task-definition-trace/task-definition.md` and its checksum first. Start from the diff and load adjacent code only as needed. Review one parse per analysis, captured-source ownership, immutable state, handle lifetime and unchanged snapshot/limits/query behavior. Preserve this boundary; require concrete execution or regression evidence for findings. Production-scale benchmarking is separate. |
| P2 | R3 — Source annotation coverage | `DG/validation/selectors.ts`, `DG/validation/source.ts`, and the declarations/references branch of `DG/validation/rules.ts`: Engine section, column and node selection; range containment; annotation counts, text agreement and exclusive locations. The trial includes a row absent from the graph, renamed layouts, and prose/list/quote probes. | Source-coverage correctness specialist: read `experiments/task-definition-trace/task-definition.md` and its checksum first. Start from the diff, loading adjacent Engine/Trace context only as needed. Review missing-annotation detection, empty selections, source ranges, nesting and text-agreement semantics for the supported selectors. Preserve this boundary; report only reproducible wrong verdicts or locations. Do not expand into new Markdown syntax or implied prose inference. |
| P2 | R4 — Graph policy and result semantics | `DG/validation/builtins.ts`, `DG/validation/evaluate.ts`, `DG/validation/validate.ts`, `DG/validation/model.ts`, and the entity-count/require-relation branch of `DG/validation/rules.ts`: integrity, allowed endpoints, distinct resolved neighbors using existing indexes, result aggregation, partial coverage and deterministic diagnostics. | Graph-policy correctness specialist: read `experiments/task-definition-trace/task-definition.md` and its checksum first. Start from the diff and load adjacent code only as needed. Review known defects, missing/duplicate identities, incoming/outgoing bounds, repeated references, incomplete analysis, fabricated handles and interpretation mismatch. Preserve the four-operator boundary; report concrete false verdicts, lost graph facts or nondeterministic results. |
| P2 | R5 — Package exports and compatibility evidence | `DG/index.ts`, `scripts/package-exports/graph-consumer.mjs`, `tests/fixtures/public-package/consumer.ts.fixture`, `tests/test_document_graph_validation.test.ts`: two added exports, public type closure, packed pass/fail execution and shared-capture proof. Package metadata, dependencies, root API and legacy CLI implementations are unchanged. | Use `review-test-value` for the new consumer and integration evidence. Read `experiments/task-definition-trace/task-definition.md` and its checksum first, then start from the diff and load adjacent tests only as needed. Review whether real exports, types, outcomes and regressions are distinguished by the checks. Preserve this boundary; require concrete consumer failures or a plausible incorrect implementation that the evidence misses. Avoid a permutation corpus. |
| P2 | R6 — Skill consumer, documentation and proof | All changed `experiments/task-definition-trace/` files, `experiments/README.md`, `AGENTS.md`, `README.md`, `docs/current-implementation.md`, `docs/experimental-document-graph.md`, `docs/experimental-graph-validation.md`, and this packet. The trial uses package exports, runs the installed structural profile, protects input files and writes located reports/graphs. The parallel experiment validator is absent. | Skill-integration specialist: read `experiments/task-definition-trace/task-definition.md` and its checksum first. Start from the diff and load adjacent skill guidance only as needed. Review profile/convention agreement, CLI exits and output/input protection, defect/repair proof, fingerprints, and documentation of Outcome versus validation status. Preserve this boundary; report concrete misleading claims, source mutation or integration failures. Installed-skill activation and publication remain follow-up work. |

## Watch List

| Axis | Reason |
| --- | --- |
| Real-spec time and memory | Analysis now retains the Engine tree, and source rules compare selected targets with occurrence candidates. The diff proves parse reuse and bounded functionality, not large-document throughput or memory targets. Measure representative specs before stable release; do not turn this into exhaustive parser testing. |
| Adoption | The TaskDefinition adapter still requires the locally installed Engine CLI 3.6.0 structural profile; package analysis uses its pinned Engine 3.5.0. Machine validation does not establish semantic readiness. Installed-skill activation remains a separate action. |

## Not Selected

| Axis | Reason |
| --- | --- |
| Markdown grammar redesign | No lexical, URI-decoding or ownership-language changes appear in the diff; source coverage consumes existing Engine queries and Trace occurrences. |
| Remote security, concurrency and rollout | The package operations are synchronous and local. No authentication, remote service, dependency upgrade, deployment, database migration or publication is introduced. Local input/output behavior is covered by R1 and R6. |
