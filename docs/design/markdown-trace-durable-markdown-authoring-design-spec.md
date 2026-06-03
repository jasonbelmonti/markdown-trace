# Markdown Trace Durable Markdown Authoring Design Specification

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Durable Markdown Authoring Design Specification |
| Status | In Review |
| Rigor level | `R2` |
| Rigor justification | The design creates durable local CLI, library, schema, patch, diagnostics, authoring-profile, graph-delta, and write-mode contracts. It includes controlled local writing, but mutation is explicit, reviewable, reversible, offline, and local-only, so it does not trigger `R3`. |
| Author(s) | Codex |
| Reviewers | Project owner; Markdown Trace maintainer; markdown-engine contract reviewer; graph UX reviewer; agent authoring workflow reviewer |
| Decision owner | Project owner |
| Target milestone or release | Durable Markdown authoring implementation approval |
| Last updated | 2026-06-03 |
| Related docs | `docs/design/markdown-trace-durable-markdown-authoring-revision-overview.md`; `docs/design/markdown-trace-candidate-graph-design-spec.md`; `docs/design/markdown-trace-candidate-graph-interface-design.md`; `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; `docs/evidence/markdown-engine-2-adoption-decision.md`; sibling `execution-decomposer/docs/design/execution-decomposer-design-spec.md` |
| Related tickets | none |

## 0. Executive Summary

Decision requested: Approve for implementation

Problem summary: Agents and users cannot rely on generated Markdown as durable execution context because Markdown Trace can currently read and validate existing trace structure but does not yet constrain, write, diagnose, repair, or revalidate Markdown outputs against trace-aware authoring contracts, resulting in plausible documents whose structural incoherence is found late or manually.

Proposed outcome: Agents and users can produce, inspect, repair, and revalidate durable Markdown through explicit authoring profiles, trace diagnostics, repair packets, patchable changes, graph deltas, controlled write modes, and authority-state labels.

Why now: On 2026-06-02, the project owner clarified that the core product bet is both reading and writing: structure should keep LLM-generated Markdown on the rails and make incoherence repair intentional through tracing.

Top risks or unknowns:

- RISK-1: Write-capable commands may corrupt source Markdown if mutation is silent, destructive, or not reversible.
- RISK-2: Agents may hide incoherence by rewriting prose without preserving diagnostic and trace evidence.
- Q-2: Direct `--apply` mutation may need to wait until patch-first repair evidence proves safe.

Section status: Complete

## Layer 1: Problem and Requirements

## 1. Problem Definition

Problem declaration: Markdown Trace users and agent workflows are unable to treat generated Markdown as durable context because the current system lacks trace-aware authoring profiles, write-mode controls, incoherence diagnostics, repair packets, and revalidation loops, resulting in generated documents that may look coherent while carrying missing IDs, broken traces, weak provenance, unresolved references, or coverage gaps.

Affected actors or systems: Project owner, Markdown Trace users, agent authors, implementation agents, design reviewers, graph UX consumers, Markdown Trace CLI, future markdown-context packet composition, and sibling planning/design repositories.

Current-state baseline: On 2026-06-02, current `markdown-trace` exposes `validate` and `derive`; the candidate graph artifacts created in this worktree are structurally valid but explicitly mark source mutation, trace-link promotion, and repair workflows as superseded. There are 0 CLI commands for `author`, `repair`, `graph-delta`, or write-mode revalidation.

Evidence or source: User revision on 2026-06-02; `docs/design/markdown-trace-durable-markdown-authoring-revision-overview.md`; current `src/markdowntrace/cli.ts`; current `src/markdowntrace/registry/derived.ts`; current `tests/test_cli.test.ts`; current `tests/test_r1_link_backed_graph.test.ts`.

Consequence of inaction: Within the next agent-authored planning or design workflow, generated Markdown remains manually policed and Markdown Trace remains an inspection tool rather than the control layer that keeps generated context coherent.

Decision deadline or trigger: The project owner requested execution of the rewrite after rejecting the read-only plan as insufficient for the durable Markdown mission.

Section status: Complete

## 2. Objectives and Non-Objectives

| ID | Statement | Measurement or decision horizon |
| --- | --- | --- |
| OBJ-1 | Preserve candidate and authoritative graph reading as the instrumentation layer for durable Markdown authoring. | Implementation review shall show graph evidence used during authoring or repair validation. |
| OBJ-2 | Enable agents to write new durable Markdown from explicit authoring profiles, source intent, section rules, ID policies, and trace expectations. | Implementation review shall include a design-spec-shaped authoring fixture. |
| OBJ-3 | Detect incoherence as a first-class artifact through structural diagnostics, trace diagnostics, unresolved references, duplicate IDs, coverage gaps, unsupported shapes, and low-confidence repairs. | Implementation review shall include incoherence fixture snapshots. |
| OBJ-4 | Produce repair packets and patchable Markdown changes that explain diagnostics, rationale, source evidence, graph deltas, confidence, and validation targets. | Implementation review shall include a repair packet and patch fixture. |
| OBJ-5 | Provide a user-facing loop for draft, inspect graph, view diagnostics, preview patch, apply intentionally, and revalidate. | Implementation review shall exercise the loop through CLI tests and manual graph/diff review. |
| OBJ-6 | Preserve authoritative `ctx://trace` registry behavior and distinguish draft, candidate, repaired, validated, unresolved, and failed states. | Existing R1 link-backed tests shall pass unchanged. |
| NG-1 | This effort will not silently or destructively mutate source Markdown. | Applies through implementation and launch. |
| NG-2 | This effort will not treat LLM-generated prose as durable context without structural and trace validation evidence. | Applies through implementation and launch. |
| NG-3 | This effort will not auto-promote inferred candidates into authoritative registry evidence without an explicit validated transition. | Applies through implementation and launch. |
| NG-4 | This effort will not use network connectors, graph databases, browser automation, MCP, or live project-management APIs. | Applies through implementation and launch. |
| NG-5 | This effort will not make an LLM the source of truth for trace relationships. | Trace evidence remains document-structural and inspectable. |

Section status: Complete

## 3. Stakeholders and Decision Authorities

| Stakeholder or role | Interest | Required action |
| --- | --- | --- |
| Project owner | Agents should speak durable Markdown and use trace repair loops instead of producing fragile prose artifacts. | Approve |
| Markdown Trace maintainer | Write-capable behavior must preserve source integrity and existing authoritative validation behavior. | Review |
| markdown-engine contract reviewer | Authoring and repair must consume only public engine APIs for parse, normalization, and structural queries. | Review |
| Graph UX reviewer | Users need clear state, graph delta, repair confidence, and unresolved-incoherence visuals. | Review |
| Agent authoring workflow reviewer | Agent-generated drafts and repairs must expose intent, provenance, diagnostics, and validation evidence. | Review |
| Future markdown-context consumer | Durable Markdown and repair packets should be consumable as trustworthy context inputs. | Inform |

Decision owner: Project owner

Section status: Complete

## 4. Constraints, Invariants, and Assumptions

| ID | Type | Statement | Source or rationale | Validation or resolution plan |
| --- | --- | --- | --- | --- |
| CON-1 | Constraint | Markdown parsing, normalization, and structural queries use only `@jasonbelmonti/markdown-engine` package-root public APIs. | Engine 2.0 adoption decision and dependency boundary. | VAL-11 inspects imports and adapter allocation. |
| CON-2 | Invariant | Source Markdown changes occur only through explicit writer or repair commands that produce reviewable output, reversible patch evidence, or backup-backed apply behavior. | User rejected purely read-only direction but still needs trust. | VAL-6, VAL-8, and VAL-9 verify write modes and rollback evidence. |
| CON-3 | Invariant | Generated Markdown is not called durable until the selected authoring profile and trace validation gates pass. | Durable context requires validation evidence. | VAL-1, VAL-2, VAL-7, and VAL-10 verify state transitions. |
| CON-4 | Invariant | Every repair proposal references diagnostics, source ranges, trace evidence, graph deltas, or validation targets. | Repair must make incoherence intentional and inspectable. | VAL-4 and VAL-5 verify repair packet completeness. |
| CON-5 | Invariant | Draft, candidate, repaired, validated, unresolved, and failed states are schema-distinct from authoritative `EntityRegistry`. | Existing R1 boundary must remain intact. | VAL-3, VAL-10, and VAL-12 verify state labels and regression safety. |
| CON-6 | Constraint | Outputs are deterministic for identical input, options, package version, and runtime version. | Agent and review workflows need stable artifacts. | VAL-2 and VAL-4 snapshot deterministic artifacts. |
| CON-7 | Constraint | The feature remains local-first and offline. | Product scope and security posture. | VAL-11 inspects dependency and runtime boundaries. |
| ASM-1 | Assumption | CODEFACTORY-style design, execution, and task artifacts provide enough structure for first authoring profiles. | Existing design-spec and skill artifacts. | VAL-1 and VAL-2 exercise one first-class profile before implementation review. |
| ASM-2 | Assumption | Patch-first repair UX is acceptable before direct in-place apply behavior. | Revision overview risk treatment. | Q-2 decision after VAL-5 and VAL-6 evidence. |
| ASM-3 | Assumption | Agents can use diagnostics and graph deltas as control feedback for better subsequent Markdown output. | User's durable Markdown thesis. | VAL-8 manual UX review and repair-loop fixture results. |

Section status: Complete

## 5. Requirements

| ID | Type | Priority | Requirement statement | Rationale | Verification |
| --- | --- | --- | --- | --- | --- |
| REQ-1 | Functional | Must | The system shall read local Markdown and produce trace evidence for configured ID families, ctx links, traceability tables, definitions, mentions, and coverage gaps. | Reading remains the instrumentation layer for durable writing. | VAL-3, VAL-11 |
| REQ-2 | Functional | Must | The system shall emit schema-versioned diagnostic and graph-delta artifacts for each authoring or repair run. | Agents and users need machine-readable feedback and visual review. | VAL-3, VAL-4, VAL-5 |
| REQ-3 | Functional | Must | The system shall define authoring profiles that specify required sections, ID policies, trace-link policy, table expectations, validation gates, and durability criteria. | Agents need structural rails before writing begins. | VAL-1 |
| REQ-4 | Functional | Must | The system shall generate Markdown drafts from structured authoring intent and an authoring profile. | Durable Markdown requires a controlled writer, not free-form prose generation. | VAL-2 |
| REQ-5 | Operability | Must | The system shall classify incoherence into missing structure, broken trace, duplicate ID, unresolved reference, coverage gap, unsupported shape, and low-confidence repair categories. | Repair loops need actionable fault classes. | VAL-3 |
| REQ-6 | Functional | Must | The system shall produce repair packets that cite diagnostics, source ranges, rationale, proposed changes, confidence, and validation targets. | Repair must be inspectable and trace-linked. | VAL-4 |
| REQ-7 | Functional | Must | The system shall keep draft, candidate, repaired, validated, unresolved, and failed states distinct in schemas and UX. | Users must know whether output is safe durable context. | VAL-7, VAL-10 |
| REQ-8 | Operability | Must | The CLI shall expose author, repair, graph-delta, and revalidate flows with explicit write modes. | Users need a coherent loop, not disconnected commands. | VAL-6, VAL-8 |
| REQ-9 | Reliability | Must | The system shall refuse to modify an existing Markdown file unless the user selects an apply mode that records backup or reversible patch evidence. | Local writing must be safe and auditable. | VAL-6, VAL-9 |
| REQ-10 | Reliability | Must | The system shall produce deterministic artifacts for identical input, options, package version, and runtime version. | Review, agents, and fixtures need repeatable artifacts. | VAL-2, VAL-4 |
| REQ-11 | Compatibility | Must | The system shall preserve existing validate and derive behavior for authoritative fixtures. | New write behavior must not regress current trusted paths. | VAL-12 |
| REQ-12 | Functional | Must | The system shall render a graph and diff view that labels draft, candidate, repaired, validated, unresolved, added, removed, and changed elements. | Users need visual repair and durability state. | VAL-8 |
| REQ-13 | Performance | Should | The CLI shall complete read-diagnose-repair planning for a 10,000-line Markdown document within 10 seconds under default profiles. | Large design specs should remain practical for agent workflows. | VAL-13 |

Section status: Complete

## 6. Success Measures and Kill Criteria

| Measure | Baseline | Target or decision threshold | Evaluation date or decision event | Related IDs |
| --- | --- | --- | --- | --- |
| Authoring profile effectiveness | No `author` command or profile contract exists. | A design-spec-shaped fixture emits deterministic Markdown with required headings, IDs, and validation metadata. | Implementation review | OBJ-2, REQ-3, REQ-4 |
| Incoherence visibility | Existing generated Markdown can look valid while hiding trace gaps. | Malformed fixtures emit classified incoherence diagnostics and are not marked durable. | Implementation review | OBJ-3, REQ-5, REQ-7 |
| Repair reviewability | No repair packet or patch plan contract exists. | Repair fixture emits packet, patch plan, graph delta, rationale, and validation targets. | Implementation review | OBJ-4, REQ-6, REQ-12 |
| Write safety | Existing CLI writes only requested output artifacts. | Existing-file mutation requires explicit apply mode plus backup or reversible patch evidence. | Implementation review | OBJ-5, REQ-8, REQ-9 |
| Compatibility regression | Existing R1 link-backed tests pass current suite. | Existing `validate`, `derive`, and R1 link-backed tests pass unchanged. | Implementation review | OBJ-6, REQ-11 |
| Kill criterion for direct apply | No apply-mode safety evidence exists. | Do not ship direct apply if backup, hash, patch, and rollback evidence cannot be proven. | Apply-mode decision | REQ-9 |

Section status: Complete

## Layer 1 Exit

Layer 1 status: Complete

## Layer 2: Functional Specification

## 7. System Context and External Interfaces

System boundary: Durable Markdown authoring is a Markdown Trace CLI and library capability that reads Markdown, writes new Markdown artifacts or reviewable patches, validates structure and trace evidence, emits repair packets, and renders graph/diff views. It remains local-only and does not replace authoritative registry validation.

External actors and systems: CLI user, agent author, implementation agent, graph reviewer, local filesystem, `@jasonbelmonti/markdown-engine`, existing Markdown Trace `validate` and `derive` commands, future markdown-context packet composition with no live data/control interface in this slice.

Trust or control boundaries: The feature crosses a local read/write filesystem boundary and a dependency boundary into `markdown-engine`; it does not cross auth, network, secret, tenancy, compliance, or live-service boundaries. The authority boundary between draft/candidate/repair states and validated registry authority is explicit.

| Interface | Owner | Consumer or dependency | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `markdown-trace author` CLI | Markdown Trace | CLI user or agent author | Authoring profile, source intent, output path or stdout mode | Markdown draft, draft result JSON, diagnostics, exit code |
| `markdown-trace repair` CLI | Markdown Trace | CLI user, agent author, reviewer | Markdown path, authoring profile, diagnostics or discovery result, write mode | Repair packet, patch plan, optional patch file, diagnostics, exit code |
| `markdown-trace graph-delta` CLI | Markdown Trace | Graph reviewer | Before and after Markdown or discovery artifacts | Mermaid or HTML graph delta, diagnostics, exit code |
| `markdown-trace revalidate` CLI | Markdown Trace | CLI user, agent author | Markdown path, profile, trace options | Durability validation result and state label |
| Durable authoring library API | Markdown Trace | CLI and future package consumers | Intent, profile, Markdown text, options | Draft results, repair packets, graph deltas, validation results |
| Engine parse/query API | markdown-engine | Markdown Trace authoring and repair modules | Markdown text and document path | Normalized document, sections, nodes, tables, links, diagnostics |
| Authoritative derive path | Markdown Trace | Existing users and tests | Link-backed Markdown or heading-label Markdown | Existing registry and graph output |
| Local filesystem | User environment | Markdown Trace CLI | Input path, output path, patch path, backup path | Read source, write generated artifacts, optionally apply backed-up changes |

Section status: Complete

## 8. Operational Scenarios and Functional Behavior

| ID | Trigger | Preconditions | Behavior or outcome | Related requirements |
| --- | --- | --- | --- | --- |
| FLOW-1 | Agent or user requests a new durable Markdown draft. | Authoring intent and profile are provided. | The system emits Markdown and draft metadata that follow required sections, IDs, trace policy, and validation metadata. | REQ-3, REQ-4, REQ-7, REQ-10 |
| FLOW-2 | User or agent diagnoses generated or existing Markdown. | Markdown path or text exists and profile is selected. | The system emits trace evidence, incoherence diagnostics, graph summary, and durability state. | REQ-1, REQ-2, REQ-5, REQ-7 |
| FLOW-3 | User or agent requests repair. | Diagnostics or discoverable incoherence exists. | The system emits a repair packet and patch plan with rationale, confidence, source evidence, and validation targets. | REQ-5, REQ-6, REQ-8, REQ-10 |
| FLOW-4 | User previews and applies a repair. | Patch plan exists and write mode is explicit. | The system writes a patch or applies a backed-up change, then exposes graph delta and revalidation status. | REQ-8, REQ-9, REQ-12 |
| FLOW-5 | Existing user runs authoritative commands. | Existing link-backed or registry-backed fixture inputs are present. | Existing `validate` and `derive` behavior remains unchanged. | REQ-11 |
| FUNC-1 | Markdown is read for trace evidence. | Input Markdown is available. | Output contains definitions, mentions, ctx links, table edges, coverage gaps, diagnostics, and graph evidence. | REQ-1, REQ-2 |
| FUNC-2 | Authoring profile is enforced. | Profile and intent are available. | Draft output follows required sections, ID policy, trace policy, table expectations, and durability criteria. | REQ-3, REQ-4 |
| FUNC-3 | Incoherence is classified. | Diagnostics or structural gaps exist. | Output classifies missing structure, broken trace, duplicates, unresolved references, coverage gaps, unsupported shapes, and low-confidence repairs. | REQ-5, REQ-7 |
| FUNC-4 | Repair packet is produced. | Incoherence is classified. | Output contains diagnostic references, source ranges, rationale, proposed changes, confidence, and validation targets. | REQ-6, REQ-10 |
| FUNC-5 | Write mode is selected. | User requests output, patch, or apply mode. | Output is written only according to explicit mode; existing-file mutation requires reversible evidence. | REQ-8, REQ-9 |
| FUNC-6 | Graph and diff view is rendered. | Before/after evidence or patch plan exists. | Output labels draft, candidate, repaired, validated, unresolved, added, removed, and changed elements. | REQ-12 |
| FUNC-7 | Authoritative commands are executed. | User invokes existing commands. | Existing behavior remains equivalent to current implementation and fixtures. | REQ-11 |

Section status: Complete

## 9. State Model, Faults, and Misuse Cases

States and transitions: The workflow phases are `intent-received`, `draft-written`, `trace-read`, `candidate-diagnosed`, `repair-proposed`, `patch-written`, `apply-requested`, `repair-applied`, and `revalidated`. The public durability states are `draft`, `candidate`, `repaired`, `validated`, `unresolved`, and `failed`. Existing authoritative registry state remains separate. A document may be called durable only when its public state is `validated` after profile and trace validation gates pass.

| Scenario | Expected behavior | Invariant maintained | Related IDs |
| --- | --- | --- | --- |
| Fault-1 | Missing authoring intent or profile produces a bounded diagnostic and no durable output. | Invalid intent is not converted into durable Markdown. | REQ-3, REQ-4, REQ-7, FUNC-2 |
| Fault-2 | Generated Markdown violates required sections, ID policy, or trace policy. | Output remains draft or unresolved until validation gates pass. | REQ-5, REQ-7, FUNC-3 |
| Fault-3 | Duplicate IDs or unresolved references are detected. | Repair packet cites diagnostics and source evidence instead of hiding incoherence. | REQ-5, REQ-6, FUNC-3, FUNC-4 |
| Fault-4 | Repair confidence is low or evidence is incomplete. | The system emits unresolved repair items and does not apply changes automatically. | REQ-6, REQ-7, REQ-9, FUNC-4 |
| Fault-5 | Output path exists when user requested a new file. | The system fails or requires explicit overwrite/apply mode with reversible evidence. | REQ-8, REQ-9, FUNC-5 |
| Fault-6 | Patch apply fails during write. | Backup or original file evidence remains available and the state becomes failed or unresolved. | REQ-8, REQ-9, FUNC-5 |
| Misuse-1 | User treats draft or repaired output as validated durable context. | State labels, diagnostics, and validation results show the output is not durable. | REQ-7, REQ-12, FUNC-6 |
| Misuse-2 | Agent tries to invent trace relationships without evidence. | Repair and graph outputs require document-structural evidence or mark the relationship low confidence or unresolved. | REQ-5, REQ-6, FUNC-3, FUNC-4 |

Section status: Complete

## 10. External Service Levels and Acceptance Cases

External service expectations: This is a local CLI and library feature. Default-profile read-diagnose-repair planning should complete within 10 seconds for a 10,000-line Markdown document on a developer workstation. Artifact determinism applies byte-for-byte under identical input, options, package version, and runtime version. No hosted availability target applies.

| ID | Acceptance case | Expected result | Covers |
| --- | --- | --- | --- |
| ACC-1 | Run authoring against a design-spec-shaped intent and profile fixture. | Markdown draft includes required headings, stable IDs, trace policy metadata, and draft state. | REQ-3, REQ-4, FUNC-2 |
| ACC-2 | Diagnose a malformed generated fixture with missing IDs and unresolved references. | Output includes classified incoherence diagnostics and non-durable state. | REQ-1, REQ-2, REQ-5, REQ-7, FUNC-1, FUNC-3 |
| ACC-3 | Repair a fixture containing duplicate ID and missing coverage diagnostics. | Repair packet cites diagnostics, source ranges, rationale, proposed changes, confidence, and validation targets. | REQ-6, FUNC-4 |
| ACC-4 | Request patch output for a repair packet. | Patch file is written deterministically without modifying the input document. | REQ-8, REQ-9, FUNC-5 |
| ACC-5 | Request explicit apply mode for a repair patch. | Existing file changes only when backup or reversible patch evidence is recorded. | REQ-8, REQ-9, FUNC-5 |
| ACC-6 | Render graph delta for before and after Markdown or patch plan. | Output labels draft, candidate, repaired, validated, unresolved, added, removed, and changed elements. | REQ-12, FUNC-6 |
| ACC-7 | Run existing R1 link-backed graph and validation tests after adding authoring and repair. | Existing authoritative behavior passes unchanged. | REQ-11, FUNC-7 |
| ACC-8 | Run read-diagnose-repair planning on a generated 10,000-line Markdown fixture. | CLI completes within 10 seconds under documented benchmark conditions. | REQ-13, FUNC-1, FUNC-3, FUNC-4 |

Section status: Complete

## 11. Requirements-to-Behavior Traceability

| Requirement | Functional behaviors or flows | Acceptance coverage | Notes |
| --- | --- | --- | --- |
| REQ-1 | FLOW-2, FUNC-1 | ACC-2 | Trace reading remains the instrumentation layer. |
| REQ-2 | FLOW-2, FUNC-1, FUNC-6 | ACC-2, ACC-6 | Diagnostic and graph-delta artifacts support agent feedback. |
| REQ-3 | FLOW-1, FUNC-2 | ACC-1 | Authoring profile defines the rails. |
| REQ-4 | FLOW-1, FUNC-2 | ACC-1 | Writer emits controlled drafts from structured intent. |
| REQ-5 | FLOW-2, FLOW-3, FUNC-3 | ACC-2, ACC-3 | Incoherence is classified before repair. |
| REQ-6 | FLOW-3, FUNC-4 | ACC-3 | Repair packets are evidence-linked. |
| REQ-7 | FLOW-1, FLOW-2, FLOW-4, FUNC-3, FUNC-6 | ACC-1, ACC-2, ACC-6 | State labels prevent false durability. |
| REQ-8 | FLOW-3, FLOW-4, FUNC-5 | ACC-4, ACC-5 | Write modes are explicit. |
| REQ-9 | FLOW-4, FUNC-5 | ACC-4, ACC-5 | Existing-file mutation requires reversible evidence. |
| REQ-10 | FLOW-1, FLOW-3, FUNC-4 | ACC-1, ACC-3, ACC-4 | Determinism covers draft, repair, and patch artifacts. |
| REQ-11 | FLOW-5, FUNC-7 | ACC-7 | Compatibility remains a launch gate. |
| REQ-12 | FLOW-4, FUNC-6 | ACC-6 | Visual UX shows state and graph changes. |
| REQ-13 | FLOW-2, FLOW-3, FUNC-1, FUNC-3, FUNC-4 | ACC-8 | Performance target applies to planning, not full LLM generation. |

Section status: Complete

## Layer 2 Exit

Layer 2 status: Complete

## Layer 3: Technical Specification

## 12. Architecture Overview

Architecture summary: The architecture adds a durable Markdown authoring pipeline beside the existing authoritative validation and derivation paths. The pipeline reads structure through `markdown-engine`, applies authoring profiles, writes drafts, classifies incoherence, plans repairs, emits patchable changes, renders graph deltas, and revalidates until output becomes `validated` or `unresolved`.

Major components and boundaries: Top-level components are CLI command dispatcher, authoring profile model, durable Markdown writer, engine-backed trace reader, incoherence classifier, repair planner, patch writer/apply controller, graph/diff exporter, deterministic serializer, revalidation orchestrator, and compatibility guard. Boundaries are the engine public API boundary, local filesystem write boundary, draft/candidate/repair/validated state boundary, and authoritative registry boundary.

Deployment or runtime placement: The feature runs in the existing Node.js TypeScript package and CLI binary. It has no hosted service, background process, database, network dependency, browser runtime, MCP integration, or LLM runtime dependency.

Architecture rationale: The architecture satisfies REQ-3 and REQ-4 by separating profile rules from draft writing, satisfies REQ-5 and REQ-6 by turning incoherence into evidence-linked repair packets, satisfies REQ-8 and REQ-9 by isolating write modes behind a patch writer/apply controller, and satisfies REQ-11 by keeping existing authoritative commands behind a compatibility guard.

Section status: Complete

## 13. Technical Mechanisms and Allocation

| ID | Mechanism | Component or owner | Responsibility | Related behaviors |
| --- | --- | --- | --- | --- |
| TECH-1 | Authoring profile model | `src/markdowntrace/authoring/profiles.ts` | Define required sections, ID families, trace policy, table expectations, validation gates, and durability criteria. | FUNC-2, FUNC-3 |
| TECH-2 | Durable Markdown writer | `src/markdowntrace/authoring/writer.ts` | Render Markdown drafts from structured intent and active profile rules. | FUNC-2 |
| TECH-3 | Engine-backed trace reader | `src/markdowntrace/authoring/reader.ts` | Parse and normalize Markdown, then collect trace links, definitions, mentions, tables, and source evidence through public engine APIs. | FUNC-1 |
| TECH-4 | Incoherence classifier | `src/markdowntrace/authoring/incoherence.ts` | Classify structural and trace diagnostics into repairable categories. | FUNC-3 |
| TECH-5 | Repair planner | `src/markdowntrace/authoring/repair.ts` | Produce repair packets with diagnostics, rationale, changes, confidence, validation targets, and unresolved items. | FUNC-4 |
| TECH-6 | Patch writer and apply controller | `src/markdowntrace/authoring/patch.ts` | Emit deterministic patch plans, write patch files, and perform explicit backup-backed apply when enabled. | FUNC-5 |
| TECH-7 | Graph and diff exporter | `src/markdowntrace/authoring/graph-delta.ts` | Render before/after graph and diff views with state and change labels. | FUNC-6 |
| TECH-8 | Revalidation orchestrator | `src/markdowntrace/authoring/revalidate.ts` | Rerun profile, trace, and compatibility gates and produce durability validation results. | FUNC-3, FUNC-6, FUNC-7 |
| TECH-9 | Diagnostics and deterministic serialization | `src/markdowntrace/authoring/diagnostics.ts`; `src/markdowntrace/authoring/serialization.ts` | Map known conditions to stable diagnostics and serialize artifacts in canonical order. | FUNC-1, FUNC-3, FUNC-4 |
| TECH-10 | CLI command dispatcher | `src/markdowntrace/cli.ts` and focused command modules | Add `author`, `repair`, `graph-delta`, and `revalidate` command routing without changing existing commands. | FUNC-2, FUNC-4, FUNC-5, FUNC-6, FUNC-7 |
| TECH-11 | Compatibility guard tests | `tests/test_authoring_*.test.ts`; existing tests | Verify authoring behavior and existing authoritative behavior. | FUNC-7 |

Section status: Complete

## 14. Data, Schemas, and Compatibility

| Change | Type | Compatibility impact | Reversibility | Mitigation |
| --- | --- | --- | --- | --- |
| `markdown-trace.authoring-profile.v0` | Schema | Additive profile schema; does not replace R1 type profiles. | Reversible | Version separately and keep type-profile contracts unchanged. |
| `markdown-trace.authoring-intent.v0` | Schema | Additive input intent schema for controlled draft generation. | Reversible | Allow profile-specific optional fields without making prose authority. |
| `markdown-trace.draft-result.v0` | Schema | Additive draft output metadata with state, diagnostics, provenance, and validation status. | Reversible | Mark draft state explicitly and require validation before durable state. |
| `markdown-trace.incoherence-diagnostic.v0` | Schema | Additive diagnostics for missing structure, broken trace, duplicate ID, unresolved reference, coverage gap, unsupported shape, and low-confidence repair. | Reversible | Snapshot diagnostic codes and severity behavior. |
| `markdown-trace.repair-packet.v0` | Schema | Additive repair schema with diagnostic references, rationale, proposed changes, source evidence, confidence, graph delta, and validation targets. | Reversible | Keep repair packets separate from applied source changes. |
| `markdown-trace.patch-plan.v0` | Schema | Additive patch schema for deterministic reviewable writes. | Reversible | Require input hash and target path metadata. |
| `markdown-trace.graph-delta.v0` | Schema | Additive graph and diff schema for before/after trace state. | Reversible | Label state and change types explicitly. |
| `markdown-trace.durability-validation-result.v0` | Schema | Additive validation result for draft, candidate, repaired, validated, unresolved, and failed states. | Reversible | Keep authoritative registry validation separate. |
| CLI commands `author`, `repair`, `graph-delta`, `revalidate` | API | Additive CLI surface; existing `validate` and `derive` flags remain unchanged. | Reversible | Keep command routing backward-compatible and regression-test existing commands. |
| Optional explicit apply mode | Config | Controlled local file mutation when enabled by user. | Reversible with backup or patch evidence | Ship patch-first by default; gate apply mode behind validation evidence and tests. |

Section status: Complete

## 15. Control Logic and Non-Functional Controls

Control logic summary: The write loop runs as a deterministic state machine: normalize options, load profile, read or receive intent, write draft or read source, parse and inspect Markdown, classify incoherence, plan repairs, emit patch or apply explicitly, render graph delta, revalidate, and assign durability state. Each transition records diagnostics and source evidence.

Concurrency and ordering model: The first slice is single-document and single-invocation. Artifact ordering is canonical by profile order for sections, source order for occurrences, normalized ID for nodes, diagnostic code and source range for diagnostics, and patch hunk order by source range. No shared mutable state or background concurrency is introduced.

Failure recovery model: Recoverable incoherence produces diagnostics, repair packets, unresolved items, and non-durable states. Non-recoverable argument, read, parse, serialization, write, or apply failures return stable CLI exit codes. Apply mode, if enabled, records input hash and backup or reversible patch evidence before changing a file.

| Requirement | Mechanism | Notes |
| --- | --- | --- |
| REQ-1 | TECH-3, TECH-9 | Reading evidence is separate from writing. |
| REQ-2 | TECH-7, TECH-8, TECH-9 | Diagnostic and graph-delta artifacts are serialized outputs. |
| REQ-3 | TECH-1 | Profiles are the main authoring contract. |
| REQ-4 | TECH-1, TECH-2 | Draft generation follows profile rules. |
| REQ-5 | TECH-3, TECH-4, TECH-9 | Incoherence categories are stable diagnostics. |
| REQ-6 | TECH-5, TECH-9 | Repair packet cites evidence and validation targets. |
| REQ-7 | TECH-5, TECH-7, TECH-8, TECH-9 | State labels are schema and UX fields. |
| REQ-8 | TECH-6, TECH-10 | CLI write modes route through patch/apply controls. |
| REQ-9 | TECH-6 | Existing-file mutation requires reversible evidence. |
| REQ-10 | TECH-2, TECH-6, TECH-9 | Canonical serialization and patch ordering provide determinism. |
| REQ-11 | TECH-10, TECH-11 | Existing commands and tests remain launch gates. |
| REQ-12 | TECH-7 | Graph/diff exporter renders state and change labels. |
| REQ-13 | TECH-3, TECH-4, TECH-5, TECH-9 | Single-pass reading and bounded planning support performance. |

Section status: Complete

## 16. Observability, Operations, Rollout, and Rollback

| Signal | Type | Purpose | Consumer |
| --- | --- | --- | --- |
| CLI exit code | Log | Distinguish success, non-durable validation, and operational failure. | CLI user, agent, tests |
| Durability state | Audit | Show draft, candidate, repaired, validated, unresolved, or failed state. | CLI user, agent, reviewer |
| Incoherence count by category | Log | Explain repair scope and remaining risk. | CLI user, agent |
| Repair confidence distribution | Log | Show whether repair output is apply-ready or review-only. | Reviewer |
| Patch input hash | Audit | Prove which source version a patch targets. | Reviewer, tests |
| Backup path or reversible patch evidence | Audit | Support rollback for apply mode. | Reviewer, tests |
| Graph delta count by change type | Log | Show added, removed, changed, unresolved, and validated graph elements. | Graph reviewer |
| Output schema version | Audit | Identify artifact compatibility. | Agents, future markdown-context consumers |
| Snapshot hash | Audit | Verify deterministic artifacts. | Test suite, reviewer |

Rollout plan: Ship in slices: authoring profile and draft writer, trace read and incoherence diagnostics, repair packet generation, patch output, graph-delta output, revalidation result, then optional explicit apply mode. Existing `validate` and `derive` commands remain compatibility gates throughout.

Rollback or containment plan: Trigger rollback if write-capable commands mutate files without explicit mode, omit reversible evidence, regress `validate` or `derive`, or mark invalid Markdown durable. Action is to disable new command routing, remove generated artifacts, or revert applied changes from backup or patch evidence. Reversibility is complete for patch-first mode and bounded by backup evidence for apply mode.

Operator actions: Users can run `markdown-trace author` to emit a draft, `markdown-trace repair` to emit repair packets or patches, `markdown-trace graph-delta` to inspect before/after trace structure, and `markdown-trace revalidate` to check durability state. Apply mode requires explicit command flags and rollback evidence.

Section status: Complete

## 17. Verification Strategy and Behavior-to-Mechanism Traceability

| ID | Verification method | What is verified | Related IDs |
| --- | --- | --- | --- |
| VAL-1 | Test | Authoring profile enforces required sections, ID policies, trace policy, table expectations, and durability criteria. | REQ-3, FUNC-2, TECH-1 |
| VAL-2 | Test | Generated Markdown drafts are deterministic and include required structure, metadata, and draft state. | REQ-4, REQ-10, FUNC-2, TECH-2, TECH-9 |
| VAL-3 | Test | Trace reader and incoherence classifier detect definitions, mentions, ctx links, duplicates, unresolved references, missing coverage, and unsupported tables. | REQ-1, REQ-2, REQ-5, FUNC-1, FUNC-3, TECH-3, TECH-4 |
| VAL-4 | Test | Repair packets include diagnostic references, source ranges, rationale, proposed changes, confidence, unresolved items, and validation targets. | REQ-2, REQ-6, REQ-10, FUNC-4, TECH-5, TECH-9 |
| VAL-5 | Test | Patch plans and patch files are deterministic and linked to input hashes and graph deltas. | REQ-2, REQ-6, REQ-8, REQ-10, FUNC-4, FUNC-5, TECH-6, TECH-7 |
| VAL-6 | Test | CLI write modes produce stdout, new file, patch output, and explicit apply behavior according to mode. | REQ-8, REQ-9, FUNC-5, TECH-6, TECH-10 |
| VAL-7 | Test | Durability validation result prevents invalid drafts or repairs from being marked durable. | REQ-7, FUNC-3, TECH-8 |
| VAL-8 | Manual | Graph and diff output visibly labels draft, candidate, repaired, validated, unresolved, added, removed, and changed elements. | REQ-8, REQ-12, FUNC-6, TECH-7 |
| VAL-9 | Test | Apply mode records backup or reversible patch evidence before changing an existing file. | REQ-9, FUNC-5, TECH-6 |
| VAL-10 | Test | State transitions across draft, candidate, repaired, validated, unresolved, and failed are deterministic and schema-distinct. | REQ-7, FUNC-3, FUNC-6, TECH-8, TECH-9 |
| VAL-11 | Inspection | Implementation imports only public `@jasonbelmonti/markdown-engine` APIs and adds no network, browser, MCP, graph database, or LLM dependency. | CON-1, CON-7, REQ-1, TECH-3 |
| VAL-12 | Test | Existing `validate`, `derive`, R1 link-backed graph, registry, and CLI tests pass unchanged. | REQ-11, FUNC-7, TECH-10, TECH-11 |
| VAL-13 | Test | Read-diagnose-repair planning completes for a generated 10,000-line Markdown fixture within 10 seconds under default profiles. | REQ-13, FUNC-1, FUNC-3, FUNC-4, TECH-3, TECH-4, TECH-5, TECH-9 |

| Behavior or requirement | Mechanisms | Verification |
| --- | --- | --- |
| FUNC-1 | TECH-3, TECH-9 | VAL-3, VAL-11 |
| FUNC-2 | TECH-1, TECH-2 | VAL-1, VAL-2 |
| FUNC-3 | TECH-4, TECH-8, TECH-9 | VAL-3, VAL-7, VAL-10 |
| FUNC-4 | TECH-5, TECH-9 | VAL-4, VAL-5 |
| FUNC-5 | TECH-6, TECH-10 | VAL-6, VAL-9 |
| FUNC-6 | TECH-7, TECH-8 | VAL-8, VAL-10 |
| FUNC-7 | TECH-10, TECH-11 | VAL-12 |
| REQ-1 | TECH-3, TECH-9 | VAL-3, VAL-11 |
| REQ-2 | TECH-7, TECH-8, TECH-9 | VAL-3, VAL-4, VAL-5 |
| REQ-3 | TECH-1 | VAL-1 |
| REQ-4 | TECH-1, TECH-2 | VAL-2 |
| REQ-5 | TECH-3, TECH-4, TECH-9 | VAL-3 |
| REQ-6 | TECH-5, TECH-9 | VAL-4, VAL-5 |
| REQ-7 | TECH-5, TECH-7, TECH-8, TECH-9 | VAL-7, VAL-10 |
| REQ-8 | TECH-6, TECH-10 | VAL-5, VAL-6, VAL-8 |
| REQ-9 | TECH-6 | VAL-6, VAL-9 |
| REQ-10 | TECH-2, TECH-6, TECH-9 | VAL-2, VAL-4, VAL-5 |
| REQ-11 | TECH-10, TECH-11 | VAL-12 |
| REQ-12 | TECH-7 | VAL-8 |
| REQ-13 | TECH-3, TECH-4, TECH-5, TECH-9 | VAL-13 |

Section status: Complete

## 18. Alternatives, Risks, Open Questions, and Final Exit

| Alternative | Reason considered | Reason rejected |
| --- | --- | --- |
| Preserve read-only candidate graphs | It had a validated design path and low mutation risk. | It does not help agents write durable Markdown or repair incoherence. |
| Add uncontrolled rewrite commands | It would be easy for agents to produce modified Markdown quickly. | Silent mutation would undermine trust, provenance, and rollback. |
| Patch-first durable authoring and repair | It gives write capability while preserving reviewability and trace evidence. | Selected; direct apply remains gated by evidence. |
| Promotion-first auto-apply migration | It moves documents toward authoritative trace links quickly. | Direct mutation and authority promotion need more proof than the first slice has. |
| LLM-only semantic self-healing | It could produce polished documents with little infrastructure. | It makes hidden model judgment the source of truth and violates trace-evidence constraints. |

| ID | Statement | Likelihood | Consequence | Mitigation |
| --- | --- | --- | --- | --- |
| RISK-1 | Write-capable commands may corrupt user documents if mutation is not explicit and reversible. | Medium | High | Ship patch-first behavior before direct apply; require backups and input hash checks for apply mode. |
| RISK-2 | Agents may hide incoherence by rewriting prose without preserving trace evidence. | Medium | High | Require repair packets to reference diagnostics, source ranges, graph deltas, and validation targets. |
| RISK-3 | Authoring profiles may be too rigid or too permissive. | Medium | Medium | Start with one first-class profile and tune from fixture evidence. |
| RISK-4 | Users may confuse draft, candidate, repaired, validated, unresolved, and failed states. | Medium | High | Encode state in schemas, CLI text, graph labels, and tests. |

| ID | Question | Owner | Due date | Resolution plan |
| --- | --- | --- | --- | --- |
| Q-1 | Should custom ID-family and authoring profiles ship in the first release? | Project owner | Detailed design approval | Compare default profile coverage against first authoring and repair fixtures. |
| Q-2 | Should direct `--apply` mutation ship in the first release? | Project owner | After repair packet validation | Validate patch-first UX and decide whether backup-backed apply is necessary. |
| Q-3 | Which artifact family should be first-class first? | Project owner | Implementation kickoff | Use design spec as the default first profile unless owner selects execution spec, task definition, or execution brief. |

Waivers: none

Final readiness statement: Ready for implementation

Section status: Complete

## Final Consistency Gate

| Gate | Result |
| --- | --- |
| Every section from 0 through 18 has an allowed section status and no required section is incomplete. | yes |
| Every `REQ-*` from section 5 appears in section 11 and section 17. | yes |
| Every `FUNC-*` from section 8 appears in section 17. | yes |
| Every `TECH-*` from section 13 appears in section 17. | yes |
| Every `ACC-*` referenced anywhere is defined in section 10. | yes |
| Every `VAL-*` referenced anywhere is defined in section 17. | yes |
| Every `Q-*` row has owner, due date, and resolution plan. | yes |
| Deferred sections are absent. | yes |
| No `R3` trigger applies because mutation is local, explicit, reversible, and not tied to live systems or customer data. | yes |
| Final readiness statement matches `R2`. | yes |
| `R3` waiver coverage is not applicable. | yes |

## Internal Review Record

| Field | Value |
| --- | --- |
| Document | `docs/design/markdown-trace-durable-markdown-authoring-design-spec.md` |
| Review date | 2026-06-03 |
| Moderator | Codex |
| Decision owner | Project owner |
| Proposed rigor level | `R2` |
| Reviewed rigor level | `R2` |
| Structural result | Pass |
| Semantic result | Pass |
| Traceability result | Pass |
| Verdict | Approve for implementation |
| Open findings | none |
| Resolved findings verified in this decision | DMA-1, DMA-2, DMA-3, DMA-4 |
| Reviewed waivers | none |
| Required heightened controls | none |
| Approval conditions | none |
| Top blockers | none |
| Required follow-ups | Resolve Q-1, Q-2, and Q-3 at implementation kickoff or earlier. |

Findings addressed:

- DMA-1 Major, resolved: The superseded plan treated candidate graphing as the product endpoint. This spec makes graph evidence the instrumentation layer for durable writing and repair.
- DMA-2 Major, resolved: Write behavior could create source-integrity risk. This spec requires patch-first behavior and reversible evidence for any apply mode.
- DMA-3 Minor, resolved: Agent output state was under-specified. This spec defines draft, candidate, repaired, validated, unresolved, and failed states.
- DMA-4 Major, resolved: The workflow phase list used `durable` as if it were a public state. This spec now separates internal workflow phases from the canonical public durability states and uses `validated` as the success state.

Validation result: Correction structural validation passed with `@jasonbelmonti/markdown-engine@2.0.0` and `design-spec-validation-profile.yaml`; no diagnostics were reported. Evidence input hash before this review-record update was `7ebd05c76a042f7abc5dd1a6cdfb198ed7b8c624c472de1ee5bda9368a409ca4`.
