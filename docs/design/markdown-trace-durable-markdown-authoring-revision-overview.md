# Markdown Trace Durable Markdown Authoring Revision Overview

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Durable Markdown Authoring Revision Overview |
| Status | Ready for Detailed Design |
| Rigor posture | `R2` |
| Rigor justification | The revised direction creates durable local CLI, library, schema, patch, diagnostics, authoring-profile, and graph UX contracts. It includes controlled local writing, but it remains explicit, reviewable, reversible, offline, and local-only, so it does not trigger `R3`. |
| Author(s) | Codex |
| Reviewers | Project owner; Markdown Trace maintainer; markdown-engine contract reviewer; graph UX reviewer; agent authoring workflow reviewer |
| Decision owner | Project owner |
| Target milestone or decision date | Durable Markdown authoring detailed design approval |
| Last updated | 2026-06-02 |
| Source material | User revision on 2026-06-02; superseded candidate graph artifacts; `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; `docs/evidence/markdown-engine-2-adoption-decision.md`; sibling `execution-decomposer/docs/design/execution-decomposer-design-spec.md` |
| Related docs | `docs/design/markdown-trace-candidate-graph-design-process.md`; `docs/design/markdown-trace-candidate-graph-overview.md`; `docs/design/markdown-trace-candidate-graph-design-spec.md`; `docs/design/markdown-trace-candidate-graph-interface-design.md`; `README.md`; `docs/markdown-trace-r1-link-backed-entity-syntax.md` |
| Related tickets | none |

## 0. Orientation

Decision requested: Align on an `R2` direction for a read/write durable Markdown context layer before revising the detailed design spec and interface packet.

Overview summary: The read-only candidate graph remains valuable, but it is only the read side of the system. The revised product direction adds a trace-aware authoring and repair loop so agents can generate Markdown that carries durable structure, IDs, trace links, provenance, diagnostics, and validation evidence. The system should let agents draft or repair Markdown, discover incoherence through trace and structural checks, produce reviewable repair packets or patches, visualize the before/after trace graph, and revalidate until the output is coherent enough to call durable.

Why now: The project owner clarified on 2026-06-02 that the core bet is not only reading existing documents; it is using structure to keep LLM-generated outputs on the rails and to create an intentional process for incoherence and repair through tracing.

Top risks or unknowns:

- RISK-1: Write-capable commands could corrupt source Markdown if mutation is silent, destructive, or not reviewable.
- RISK-2: Agents may hide incoherence by rewriting prose instead of surfacing trace diagnostics and repair rationale.
- RISK-3: Authoring profiles may be too rigid for useful drafting or too loose to preserve durable structure.

Section status: Complete

## 1. Problem and Context

Problem declaration: Agents and users are unable to rely on generated Markdown as durable execution context because current tooling can read trace-like structure but does not yet constrain, validate, repair, or intentionally write Markdown outputs against trace-aware structural contracts.

Affected actors or systems: Project owner, Markdown Trace users, agent authors, implementation agents, reviewers, graph UX consumers, Markdown Trace CLI, future markdown-context packet composition, and sibling planning/design repositories.

Current-state baseline: On 2026-06-02, the current plan produced validated artifacts for read-only candidate discovery, but the artifacts explicitly excluded source mutation, trace-link promotion, and repair workflows. Current `markdown-trace` CLI exposes `validate` and `derive`; it does not expose `author`, `repair`, `patch`, or revalidation-loop commands.

Evidence or source: User revision request on 2026-06-02; superseded read-only design artifacts in `docs/design/`; current `src/markdowntrace/cli.ts`; current `src/markdowntrace/registry/derived.ts`; current R1 evidence and tests.

Consequence of inaction: Markdown Trace would remain an inspection and visualization tool while agents continue to emit plausible but structurally fragile Markdown that requires manual review to identify missing IDs, broken trace links, incoherent tables, and ungrounded claims.

Section status: Complete

## 2. Goals, Non-Goals, and Success

Objectives:

- OBJ-1: Preserve candidate and authoritative graph reading as the system's instrumentation layer.
- OBJ-2: Enable agents to write new durable Markdown from explicit authoring profiles, required sections, ID policies, and trace expectations.
- OBJ-3: Detect incoherence as a first-class result through structural diagnostics, trace diagnostics, unresolved references, duplicate IDs, missing coverage, and unsupported table shapes.
- OBJ-4: Produce repair packets and patchable Markdown changes that explain why each change exists and which diagnostics it addresses.
- OBJ-5: Provide a high-quality UX loop: draft, inspect graph, view diagnostics, preview patch, apply intentionally, and revalidate.
- OBJ-6: Preserve the authoritative `ctx://trace` registry boundary by distinguishing draft, candidate, repaired, and validated states.

Non-goals:

- NG-1: This effort will not silently or destructively mutate source Markdown.
- NG-2: This effort will not treat LLM-generated prose as trustworthy without structural validation evidence.
- NG-3: This effort will not auto-promote inferred candidates into authoritative registry evidence without an explicit validated transition.
- NG-4: This effort will not use network connectors, graph databases, browser automation, MCP, or live project-management APIs in the first slice.
- NG-5: This effort will not make an LLM the source of truth for trace relationships; trace evidence remains document-structural and inspectable.

Success signals:

- `markdown-trace author` can emit a new design-spec-shaped Markdown draft from a bounded authoring intent and profile.
- `markdown-trace repair` can emit a repair packet or patch for a document with missing trace links, duplicate IDs, unresolved references, or coverage gaps.
- A before/after graph view shows which nodes and edges changed and which diagnostics were resolved.
- Generated or repaired Markdown is not marked durable until the relevant structural and trace validation gates pass.
- Existing R1 link-backed `validate` and `derive` behavior remains unchanged.

Stop or kill criteria:

- Stop direct apply behavior if reviewable patch output cannot preserve source integrity and rollback evidence.
- Stop authoring automation if generated documents routinely pass syntax checks while failing traceability, coverage, or provenance checks.
- Stop promotion planning if users cannot distinguish draft, candidate, repaired, and validated authority states.

Section status: Complete

## 3. Constraints, Invariants, and Assumptions

Constraints and invariants:

- CON-1: Markdown parsing, normalization, and structural queries shall use only `@jasonbelmonti/markdown-engine` package-root public APIs.
- CON-2: Source Markdown may be changed only through explicit writer or repair commands that produce reviewable output, reversible patch evidence, or backup-backed apply behavior.
- CON-3: Generated Markdown shall not be called durable until the selected authoring profile and trace validation gates pass.
- CON-4: Every repair proposal shall reference the diagnostics, source ranges, or trace graph differences it intends to resolve.
- CON-5: Candidate, draft, repaired, and validated states shall remain schema-distinct from `EntityRegistry` authority.
- CON-6: Outputs shall be deterministic for identical input, options, package version, and runtime version.
- CON-7: The feature shall remain local-first and offline.

Assumptions:

- ASM-1: Existing CODEFACTORY-style design, execution, and task artifacts provide enough structure to define useful first authoring profiles.
- ASM-2: Patch-first repair UX is acceptable before direct in-place apply behavior.
- ASM-3: Agents can use diagnostics and graph deltas as control feedback to improve subsequent generated Markdown.

Open questions:

- Q-1: Should custom ID-family and authoring profiles ship in the first release? Owner: project owner. Decision point: after first authoring and repair fixtures.
- Q-2: Should direct `--apply` mutation ship in the first release, or should the first slice remain patch-only? Owner: project owner. Decision point: after repair packet validation.
- Q-3: Which artifact families should become first-class authoring profiles first: design spec, execution spec, task definition, or execution brief? Owner: project owner. Decision point: detailed design kickoff.

Section status: Complete

## 4. Direction and Alternatives

Recommended direction: Upgrade Markdown Trace from read-only candidate graph discovery to a read/write durable Markdown control layer. Candidate and authoritative graphs become the instrumentation used to constrain writing, expose incoherence, produce repair packets, and verify that generated Markdown has crossed from draft to durable.

Rationale: This direction matches the core product bet: structure is not only for visualization after the fact; structure is the mechanism that keeps agent output coherent while it is being written. A patch-first write model gives users practical authoring and repair UX without losing source control, reviewability, or trace authority.

Alternatives considered:

- Preserve read-only candidate graphs: rejected because it does not help agents write better Markdown or repair incoherence.
- Add uncontrolled direct rewrite commands: rejected because silent mutation would undermine trust and rollback.
- Add patch-first durable authoring and repair loops: selected because it gives write capability while preserving review and trace evidence.
- Build promotion-first auto-apply migration: deferred because direct source mutation and authority promotion require more evidence.
- Use LLM-only semantic self-healing: rejected because repair must be traceable to structural evidence, not hidden model judgment.

Accepted tradeoffs:

- The first write-capable slice should favor reviewable patch output over convenience.
- Some authoring profile strictness is necessary to make generated Markdown durable.
- Candidate graph UX remains non-authoritative, but it becomes central to repair and validation loops.

Section status: Complete

## 5. Expected Behavior

Primary flows:

- FLOW-1: An agent or user provides authoring intent and an authoring profile; the system emits a Markdown draft with required sections, IDs, trace placeholders or links, provenance notes, and validation metadata.
- FLOW-2: The system reads generated or existing Markdown, derives candidate and authoritative trace evidence, and reports incoherence as diagnostics.
- FLOW-3: A repair command consumes diagnostics and graph differences, then emits a repair packet and patchable Markdown changes.
- FLOW-4: A user previews the diff and graph delta, applies changes intentionally, and reruns validation.
- FLOW-5: A document becomes durable only after structural, trace, and profile validation gates pass.

Functional commitments:

- FUNC-1: The system identifies configured ID families, trace links, traceability tables, definitions, mentions, and coverage gaps.
- FUNC-2: The system writes new Markdown only from explicit authoring profiles and source intent.
- FUNC-3: The system separates draft, candidate, repair, and validated authority states in schemas and UX.
- FUNC-4: The system emits repair packets with diagnostics, proposed changes, rationale, affected source ranges, and validation targets.
- FUNC-5: The system renders graph and diff views that show before/after trace structure and resolved or unresolved incoherence.
- FUNC-6: The system leaves existing authoritative `validate` and `derive` behavior unchanged.

Acceptance signals:

- ACC-1: A design-spec authoring fixture produces a draft with required headings, stable IDs, and validation metadata.
- ACC-2: A malformed generated fixture produces diagnostics instead of being marked durable.
- ACC-3: A repair fixture emits a patch that resolves at least one duplicate, unresolved, missing coverage, or unsupported trace condition.
- ACC-4: A graph delta view distinguishes added, removed, changed, unresolved, candidate, repaired, and validated elements.
- ACC-5: Existing R1 `ctx://trace` fixture tests pass unchanged.

Failure or fallback behavior:

- If authoring intent is insufficient, the system emits a bounded diagnostic and refuses to mark the output durable.
- If repair confidence is low, the system emits a repair packet with unresolved items instead of applying changes.
- If a write target already exists, the system writes a new file, patch, or backup-backed change only under an explicit mode.
- If validation still fails after repair, the loop records the remaining incoherence and the next repair target.

Section status: Complete

## 6. Architecture Sketch

System boundary: Durable Markdown authoring is a Markdown Trace CLI and library capability that reads Markdown, writes new Markdown artifacts or reviewable patches, validates structure and trace evidence, emits repair packets, and renders graph/diff views. It remains local-only and does not replace authoritative registry validation.

Major components or responsibilities:

- TECH-1: Authoring profile model defines required sections, ID families, trace-link policy, table expectations, validation gates, and durability criteria.
- TECH-2: Durable Markdown writer emits new Markdown from structured intent and profile constraints.
- TECH-3: Trace reader and candidate graph discovery identify definitions, mentions, trace links, table edges, diagnostics, and graph deltas.
- TECH-4: Incoherence classifier groups diagnostics into missing structure, broken trace, duplicate ID, unresolved reference, coverage gap, and unsupported shape classes.
- TECH-5: Repair planner produces repair packets with rationale, proposed changes, source evidence, validation targets, and confidence.
- TECH-6: Patch writer emits reviewable Markdown patches or new files; direct apply remains explicit and backup-backed if enabled.
- TECH-7: Graph and diff exporter renders before/after trace state and repair status.
- TECH-8: Revalidation loop reruns profile, trace, and compatibility gates until the document is durable or remaining incoherence is explicit.

Data and contract impact: New schemas are required for authoring profiles, durable draft results, incoherence diagnostics, repair packets, patch plans, graph deltas, and durability validation results. Existing `EntityRegistry`, `TraceGraph`, R1 type-profile contracts, `validate`, and `derive` remain unchanged.

Ownership and boundaries: Markdown Trace owns authoring, repair, patch, graph-delta, and revalidation contracts. `markdown-engine` owns structural Markdown parsing and query APIs. Future markdown-context can consume durable Markdown outputs and repair packets, but live project-management integration remains out of scope.

Architecture questions: Q-1, Q-2, and Q-3 must be resolved or bounded in the detailed design spec before implementation starts.

Section status: Complete

## 7. Operations and Change Plan

Rollout approach:

- Mark the read-only candidate graph spec and interface packet as superseded for implementation.
- Revise the R2 design spec around durable Markdown authoring, repair packets, and patch-first write behavior.
- Revise the interface packet with authoring profile, writer, repair packet, patch plan, graph delta, and revalidation contracts.
- Implement in slices: read/incoherence diagnostics, author new file, repair packet, patch output, graph delta UX, then optional explicit apply.

Rollback or containment:

- Patch-first behavior rolls back by discarding generated patches or files.
- Direct apply, if approved, requires backup-backed writes and a documented rollback path.
- Existing `validate` and `derive` commands remain compatibility gates.

Observability and support:

- CLI diagnostics shall report authoring profile violations, trace incoherence, repair confidence, unresolved repair items, patch write failures, graph delta counts, and validation gate status.
- UX should make the state machine visible: draft, candidate, repaired, validated, unresolved, and failed.

Migration or compatibility impact:

- Existing source documents do not require migration.
- Existing candidate graph artifacts are still useful as read evidence but no longer represent the whole product direction.
- New write-capable schemas require versioning from first release.

Section status: Complete

## 8. Validation Plan

Validation goals:

- Prove agents can produce Markdown drafts that obey structural and trace-aware authoring profiles.
- Prove incoherence is surfaced instead of hidden.
- Prove repair packets and patches are reviewable, deterministic, and validation-linked.
- Prove authoritative R1 behavior remains unchanged.

Evidence required:

- Authoring fixture snapshots.
- Incoherence diagnostic fixture snapshots.
- Repair packet and patch fixture snapshots.
- Before/after graph delta snapshots or visual review.
- Input hash and backup evidence for any apply-mode test.
- Existing R1 link-backed graph tests passing.

Validation activities:

- VAL-1: Unit-test authoring profile enforcement over required sections, IDs, and trace policies.
- VAL-2: Snapshot-test generated Markdown drafts for deterministic structure and metadata.
- VAL-3: Unit-test incoherence classification for duplicate IDs, unresolved references, missing coverage, and unsupported trace tables.
- VAL-4: Contract-test repair packets for diagnostic references, source ranges, rationale, confidence, and validation targets.
- VAL-5: Patch-test reviewable Markdown changes and before/after graph deltas.
- VAL-6: CLI-test write modes: stdout, new file, patch output, and explicit apply if approved.
- VAL-7: Regression-test existing `validate`, `derive`, and R1 link-backed fixtures.
- VAL-8: Manual UX review for draft, diagnostics, graph delta, patch preview, apply, and revalidate loop.

Traceability notes: VAL-1 and VAL-2 cover OBJ-2. VAL-3 and VAL-4 cover OBJ-3 and OBJ-4. VAL-5, VAL-6, and VAL-8 cover OBJ-5. VAL-7 covers OBJ-6.

Section status: Complete

## 9. Risks, Open Questions, and Formalization Readiness

Material risks:

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| RISK-1 | Write-capable commands may corrupt user documents if mutation is not explicit and reversible. | Medium | High | Ship patch-first behavior before direct apply; require backups and input hash checks for apply mode. | Markdown Trace maintainer |
| RISK-2 | Agents may hide incoherence by rewriting prose without preserving trace evidence. | Medium | High | Require repair packets to reference diagnostics, source ranges, graph deltas, and validation targets. | Agent authoring workflow reviewer |
| RISK-3 | Authoring profiles may be too rigid or too permissive. | Medium | Medium | Start with one or two CODEFACTORY artifact families and tune from fixture evidence. | Project owner |
| RISK-4 | Users may confuse draft, candidate, repaired, and validated states. | Medium | High | Encode state in schemas, CLI text, graph labels, and UX surfaces. | Graph UX reviewer |

Open questions:

| ID | Question | Owner | Due date or decision point | Resolution path | Consequence if unresolved |
| --- | --- | --- | --- | --- | --- |
| Q-1 | Should custom ID-family and authoring profiles ship in the first release? | Project owner | Detailed design kickoff | Compare default profile coverage against first authoring and repair fixtures. | Default-only authoring profile ships first. |
| Q-2 | Should direct `--apply` mutation ship in the first release? | Project owner | After repair packet validation | Validate patch-first UX and decide whether backup-backed apply is necessary. | First release remains patch-only. |
| Q-3 | Which artifact family should be first-class first? | Project owner | Detailed design kickoff | Choose design spec, execution spec, task definition, or execution brief based on immediate user value. | Detailed design uses design spec as default first profile. |

Formalization notes: The detailed design spec must replace the read-only framing with a read/write state machine, authoring profile requirements, explicit mutation controls, repair packet schemas, patch strategy, graph delta UX, and revalidation gates. The interface packet must add contracts for `author`, `repair`, patch plans, graph deltas, durability validation results, and write-mode safety.

Readiness verdict: Ready for detailed design revision.

Section status: Complete

## Final Overview Gate

| Gate | Result |
| --- | --- |
| The problem can be understood without the proposed solution. | yes |
| The direction can be summarized in one paragraph by a reviewer. | yes |
| Goals, non-goals, constraints, and assumptions are distinct. | yes |
| Alternatives and tradeoffs are visible. | yes |
| Expected behavior is observable from outside the implementation. | yes |
| Live-system changes have rollout, rollback, observability, and support notes. | N/A: the feature is local-only and offline; local write behavior is controlled through patch-first or explicit backup-backed apply modes. |
| Open questions are bounded with owner, decision point, and consequence. | yes |

Overview status: Complete

## Internal Review Record

Review mode: Author self-review.

Rigor calibration result: `R2` accepted. The revised feature creates durable local read/write contracts and may alter local Markdown files only through explicit controlled modes. It has no live-system, remote-mutation, auth, secret, privacy, compliance, or broad operational exposure.

Findings addressed:

- DRO-1 Major, resolved: The superseded read-only plan did not support the stated product thesis. Revised direction defines writing, repair packets, patch output, graph deltas, and revalidation loops.
- DRO-2 Major, resolved: Source mutation risk was under-specified. Revised direction requires patch-first behavior or explicit backup-backed apply mode.
- DRO-3 Minor, resolved: Candidate graph UX was treated as an endpoint. Revised direction makes graph discovery the instrumentation layer for authoring and repair.

Validation result: Baseline structural validation passed with `@jasonbelmonti/markdown-engine@2.0.0` and `design-overview-validation-profile.yaml`; no diagnostics were reported. Evidence input hash before this review-record update was `113c6c70b4945edc6273fbbed64e479b9da62c7fe32b20974f86886b46219948`.

Unresolved findings: None.

Readiness verdict: Ready for detailed design revision.
