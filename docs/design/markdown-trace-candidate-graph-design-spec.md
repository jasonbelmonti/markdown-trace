# Markdown Trace Candidate Graph Design Specification

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Candidate Graph Design Specification |
| Status | Superseded by Durable Markdown Authoring Revision |
| Rigor level | `R2` |
| Rigor justification | Candidate graph discovery creates durable CLI, library, schema, diagnostics, and visualization contracts. It is local-only, read-only, and reversible, so it does not trigger `R3`, but it is broader than a small `R1` patch. |
| Author(s) | Codex |
| Reviewers | Project owner; Markdown Trace maintainer; markdown-engine contract reviewer; graph UX reviewer |
| Decision owner | Project owner |
| Target milestone or release | Candidate graph implementation approval |
| Last updated | 2026-06-03 |
| Related docs | `docs/design/markdown-trace-candidate-graph-design-process.md`; `docs/design/markdown-trace-candidate-graph-overview.md`; `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; `docs/evidence/markdown-engine-2-adoption-decision.md`; sibling `execution-decomposer/docs/design/execution-decomposer-design-spec.md`; `docs/design/markdown-trace-durable-markdown-authoring-revision-overview.md` |
| Related tickets | none |

## 0. Executive Summary

Decision requested: Superseded by the durable Markdown authoring revision; do not approve this read-only candidate graph spec for implementation.

Problem summary: Markdown Trace cannot produce a useful graph for existing non-trivial design specs that contain visible traceability IDs but do not contain `ctx://trace` links or heading labels, resulting in empty graph output where users need onboarding, review, and visualization value.

Superseded proposed outcome: Existing unannotated design specs produce deterministic, non-authoritative candidate graph artifacts with discovered nodes, inferred edges, diagnostics, provenance, confidence, and visually labeled graph exports.

Why now: On 2026-06-02, the sibling execution-decomposer design spec produced 0 derived entities and 0 graph edges despite containing more than 100 visible design-spec identifiers.

Top risks or unknowns:

- RISK-1: Candidate graph output may be mistaken for authoritative trace evidence.
- RISK-2: Traceability table variation may reduce inferred-edge precision.
- Q-1: Custom ID-family profiles may be needed after the default-family slice is exercised on real documents.

Section status: Complete

## Layer 1: Problem and Requirements

## 1. Problem Definition

Problem declaration: Markdown Trace users are unable to visually inspect existing design-spec trace structure because the current graph derivation path requires explicit `ctx://trace` links or heading labels, resulting in 0-node graph output for documents that already contain meaningful requirement, behavior, mechanism, and validation IDs.

Affected actors or systems: Project owner, Markdown Trace users, implementation agents, design reviewers, graph UX consumers, Markdown Trace CLI, and future markdown-context packet composition.

Current-state baseline: Direct inspection on 2026-06-02 found that `markdown-trace derive` returned 0 entities and 0 edges for the sibling execution-decomposer design spec, while text inspection found more than 100 visible IDs across `OBJ-*`, `NG-*`, `CON-*`, `ASM-*`, `REQ-*`, `FLOW-*`, `FUNC-*`, `ACC-*`, `TECH-*`, `VAL-*`, `RISK-*`, and `Q-*` families.

Evidence or source: Direct repository inspection; current `src/markdowntrace/registry/derived.ts`; current `src/markdowntrace/graph/derive.ts`; `docs/evidence/r1-link-backed-evidence-and-recommendation.md`; `docs/evidence/markdown-engine-2-adoption-decision.md`; sibling `execution-decomposer/docs/design/execution-decomposer-design-spec.md`.

Consequence of inaction: Until an explicit trace-link promotion flow exists, existing specs remain visually opaque at every onboarding or review event that occurs before manual annotation.

Decision deadline or trigger: The project owner requested formalization on 2026-06-02 after confirming that the existing visualization path only works with CTX links.

Section status: Complete

## 2. Objectives and Non-Objectives

| ID | Statement | Measurement or decision horizon |
| --- | --- | --- |
| OBJ-1 | Make existing unannotated design specs visually inspectable through deterministic candidate graphs. | Implementation review shall include a non-empty graph for an execution-decomposer-shaped fixture. |
| OBJ-2 | Preserve the authoritative `ctx://trace` registry boundary by labeling discovered data as candidate or inferred. | Implementation review shall verify schema names, CLI text, and graph exports mark candidate status. |
| OBJ-3 | Provide useful CLI and artifact output for humans, agents, and future markdown-context packet composition. | Implementation review shall verify JSON, Mermaid, and HTML or equivalent graph export surfaces. |
| OBJ-4 | Create a natural review path toward later checked sidecar generation and trace-link promotion. | Post-implementation review shall identify promotion candidates without source mutation in this slice. |
| NG-1 | This effort will not mutate source Markdown. | Applies through implementation and launch. |
| NG-2 | This effort will not produce validated `EntityRegistry` output from inferred candidates. | Applies through implementation and launch. |
| NG-3 | This effort will not use LLMs, network connectors, graph databases, MCP, browser automation, or live project-management APIs. | Applies through implementation and launch. |
| NG-4 | This effort will not define the promotion patch workflow for adding `ctx://trace` links. | Promotion requires a later design decision. |

Section status: Complete

## 3. Stakeholders and Decision Authorities

| Stakeholder or role | Interest | Required action |
| --- | --- | --- |
| Project owner | Existing specs should become visually inspectable without manual annotation first. | Approve |
| Markdown Trace maintainer | Candidate discovery must preserve the authoritative trace registry boundary and current CLI compatibility. | Review |
| markdown-engine contract reviewer | Candidate discovery must consume only public `@jasonbelmonti/markdown-engine` APIs. | Review |
| Graph UX reviewer | Candidate graph output must make provenance, confidence, and non-authority visible. | Review |
| Implementation agents | Agents need deterministic JSON and diagnostics that can feed later planning and context packets. | Inform |

Decision owner: Project owner

Section status: Complete

## 4. Constraints, Invariants, and Assumptions

| ID | Type | Statement | Source or rationale | Validation or resolution plan |
| --- | --- | --- | --- | --- |
| CON-1 | Constraint | Candidate discovery uses only `@jasonbelmonti/markdown-engine` package-root public APIs. | Existing parser adoption decision and package boundary. | VAL-7 inspects imports and implementation allocation. |
| CON-2 | Invariant | Candidate output is schema-distinct from `EntityRegistry` and `TraceGraph`. | R1 evidence keeps registry integrity separate from authoring convenience. | VAL-3 verifies candidate schema names and non-authority markers. |
| CON-3 | Invariant | Source Markdown is not modified by discovery or graph export commands. | User requested an inferred candidate graph, not promotion. | VAL-6 verifies input content hash before and after CLI runs. |
| CON-4 | Constraint | Outputs are deterministic for identical input, options, package version, and runtime version. | Markdown Trace repeatability expectations. | VAL-4 snapshot-tests canonical ordering and serialization. |
| CON-5 | Constraint | The feature remains local-first and offline. | Repository README scope and selected design direction. | VAL-7 inspects dependency and runtime boundaries. |
| ASM-1 | Assumption | Default design-spec ID families are sufficient for the first useful discovery slice. | Observed execution-decomposer and CODEFACTORY-style documents. | VAL-1 and VAL-2 exercise `OBJ`, `NG`, `CON`, `ASM`, `REQ`, `FLOW`, `FUNC`, `ACC`, `TECH`, `VAL`, `RISK`, `Q`, and `WVR` families before implementation review. |
| ASM-2 | Assumption | `markdown-engine` document nodes, sections, tables, text spans, and source ranges are sufficient for first-pass provenance. | Engine 2.0 adoption and existing normalized-document APIs. | VAL-1, VAL-2, and VAL-7 verify extraction without raw parser internals. |
| ASM-3 | Assumption | Users will accept candidate confidence labels as a bridge toward later authoritative trace links. | Product direction from design-process packet. | VAL-8 graph export review checks visible labels before launch. |

Section status: Complete

## 5. Requirements

| ID | Type | Priority | Requirement statement | Rationale | Verification |
| --- | --- | --- | --- | --- | --- |
| REQ-1 | Functional | Must | The system shall discover configured ID-family candidates in headings, tables, and prose from a local Markdown input. | Users need graphable nodes before source documents contain trace links. | VAL-1, VAL-2 |
| REQ-2 | Functional | Must | The system shall emit schema-versioned discovery JSON containing candidates, mentions, inferred edges, diagnostics, source ranges, and run metadata. | Humans and agents need durable, parseable evidence from discovery. | VAL-3, VAL-4 |
| REQ-3 | Functional | Must | The system shall mark every discovered entity and inferred edge as non-authoritative with provenance and confidence fields. | Trust depends on separating candidates from validated trace authority. | VAL-3, VAL-8 |
| REQ-4 | Functional | Must | The system shall infer candidate edges from explicit traceability table cells when referenced source and target IDs are discoverable. | Table traceability is the highest-signal relationship source in existing specs. | VAL-2, VAL-5 |
| REQ-5 | Operability | Must | The system shall report unresolved references, duplicate definitions, unsupported table shapes, and file errors through stable diagnostics. | Users need degraded-mode explanations instead of silent graph gaps. | VAL-5 |
| REQ-6 | Operability | Must | The CLI shall provide read-only discovery and graph export commands that never write to the input Markdown file. | Candidate discovery is not a promotion or migration feature. | VAL-6 |
| REQ-7 | Reliability | Must | The system shall produce byte-stable JSON for identical input, options, package version, and runtime version. | Snapshot review and agent consumption require repeatability. | VAL-4 |
| REQ-8 | Compatibility | Must | The system shall preserve existing authoritative `validate` and `derive` behavior for link-backed fixtures. | Candidate discovery must not regress the R1 authority path. | VAL-9 |
| REQ-9 | Functional | Must | The system shall provide at least one human-readable graph export that visibly labels candidate nodes and inferred edges. | Reviewers need a graph view that communicates trust status without reading JSON. | VAL-8 |
| REQ-10 | Performance | Should | The CLI shall complete discovery for a 10,000-line Markdown document within 5 seconds on a developer workstation when run with default families. | The feature should remain practical for large design specs. | VAL-10 |

Section status: Complete

## 6. Success Measures and Kill Criteria

| Measure | Baseline | Target or decision threshold | Evaluation date or decision event | Related IDs |
| --- | --- | --- | --- | --- |
| Existing-spec graph usefulness | 0 entities and 0 edges for the execution-decomposer design spec on 2026-06-02. | Fixture run produces at least one candidate node and at least one inferred or explainably unresolved edge. | Implementation review | OBJ-1, REQ-1, REQ-4 |
| Trust labeling coverage | No candidate graph output exists. | Every emitted candidate node and edge has non-authoritative status, provenance, and confidence fields. | Implementation review | OBJ-2, REQ-3 |
| CLI/artifact usability | Existing CLI only exposes `validate` and `derive`. | CLI emits JSON and at least one graph export without source mutation. | Implementation review | OBJ-3, REQ-2, REQ-6, REQ-9 |
| Compatibility regression | Existing R1 link-backed behavior passes current test suite. | Existing R1 link-backed fixture tests continue to pass unchanged. | Implementation review | REQ-8 |
| Kill criterion for first slice | No candidate discovery baseline exists. | Stop implementation if explicit ID definitions and direct table-reference edges cannot be recovered from the execution-decomposer-shaped fixture. | First discovery milestone | OBJ-1, REQ-1, REQ-4 |

Section status: Complete

## Layer 1 Exit

Layer 1 status: Complete

## Layer 2: Functional Specification

## 7. System Context and External Interfaces

System boundary: Candidate graph discovery is a Markdown Trace CLI and library capability that reads local Markdown, parses it through `@jasonbelmonti/markdown-engine`, emits candidate artifacts, and optionally renders graph views. It does not alter existing registry validation, registry derivation, or source Markdown.

External actors and systems: CLI user, implementation agent, graph reviewer, local filesystem, `@jasonbelmonti/markdown-engine`, existing Markdown Trace `validate` and `derive` commands, future markdown-context packet composition with no data/control interface in this slice.

Trust or control boundaries: The feature crosses a read boundary from local Markdown into generated artifacts and a dependency boundary into `markdown-engine`; it does not cross auth, network, secret, or live data boundaries. The authority boundary between candidate artifacts and validated registries is explicit and mandatory.

| Interface | Owner | Consumer or dependency | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `markdown-trace discover` CLI | Markdown Trace | CLI user or agent | Local Markdown path, optional namespace, optional output path, default ID-family profile | Candidate discovery JSON, diagnostics, exit code |
| `markdown-trace graph-candidates` CLI | Markdown Trace | CLI user or reviewer | Candidate JSON or local Markdown path, output format, optional output path | Mermaid or HTML graph artifact, diagnostics, exit code |
| Candidate discovery library API | Markdown Trace | CLI command and future package consumers | Markdown text or document path, discovery options | Schema-versioned candidate discovery result |
| Engine parse/query API | markdown-engine | Markdown Trace discovery modules | Markdown text and document path | Normalized document, sections, nodes, tables, link references, diagnostics |
| Authoritative derive path | Markdown Trace | Existing users and tests | Link-backed Markdown or heading-label Markdown | Existing registry and graph output |
| Local filesystem | User environment | Markdown Trace CLI | Input Markdown path and optional output path | Read source content, write generated artifacts only |

Section status: Complete

## 8. Operational Scenarios and Functional Behavior

| ID | Trigger | Preconditions | Behavior or outcome | Related requirements |
| --- | --- | --- | --- | --- |
| FLOW-1 | User runs candidate discovery on an unannotated design spec. | The input Markdown file exists and is readable. | The command returns schema-versioned candidate JSON containing discovered IDs, mentions, inferred edges, diagnostics, source ranges, and run metadata. | REQ-1, REQ-2, REQ-3, REQ-5, REQ-7, REQ-10 |
| FLOW-2 | User requests a graph view from candidate output. | Candidate JSON exists or the command can run discovery from the provided Markdown path. | The command writes or prints a Mermaid or HTML graph that labels candidate nodes and inferred edges. | REQ-2, REQ-3, REQ-6, REQ-9 |
| FLOW-3 | Existing user runs authoritative `derive` or `validate`. | Existing link-backed or registry-backed fixture inputs are present. | Existing command behavior and output contracts remain unchanged by candidate discovery modules. | REQ-8 |
| FLOW-4 | Discovery encounters ambiguous or unsupported source structure. | The input contains duplicate definitions, unresolved references, unsupported table shapes, parse diagnostics, or write failures. | The command emits stable diagnostics and either returns degraded candidate output or a stable failure exit code according to the fault class. | REQ-5, REQ-6 |
| FUNC-1 | Candidate discovery scans Markdown. | The document has headings, tables, or prose containing configured ID families. | The externally visible result contains definition and mention records with source ranges for recognized IDs. | REQ-1 |
| FUNC-2 | Candidate JSON is emitted. | Discovery has completed or degraded with diagnostics. | The externally visible result has schema version, candidate nodes, mentions, candidate edges, diagnostics, and deterministic ordering. | REQ-2, REQ-3, REQ-7 |
| FUNC-3 | Explicit table references are processed. | Traceability-style table cells contain source and target IDs. | The externally visible result contains inferred edge records or unresolved-reference diagnostics tied to source ranges. | REQ-4, REQ-5 |
| FUNC-4 | Graph export is requested. | Candidate result is available. | The externally visible graph artifact labels candidate nodes, inferred edges, confidence, and non-authoritative status. | REQ-3, REQ-9 |
| FUNC-5 | Existing authoritative commands are executed. | User invokes `validate` or `derive`. | The externally visible behavior remains equivalent to the current implementation and test fixtures. | REQ-6, REQ-8 |
| FUNC-6 | Faults or unsupported structures occur. | Discovery, parsing, resolving, or writing encounters a known fault class. | The externally visible result reports stable diagnostic codes and does not silently fabricate authoritative edges. | REQ-5 |

Section status: Complete

## 9. State Model, Faults, and Misuse Cases

States and transitions: The feature has no durable runtime state. A single invocation transitions through `input-resolved`, `source-read`, `engine-parsed`, `candidates-discovered`, `edges-inferred`, `result-projected`, and `artifact-written` or `diagnostics-returned`. Generated artifacts are disposable outputs and do not alter the source document or authoritative registry state.

| Scenario | Expected behavior | Invariant maintained | Related IDs |
| --- | --- | --- | --- |
| Fault-1 | Missing or unreadable input path returns a stable CLI failure and file diagnostic. | Source Markdown and existing registry behavior remain unchanged. | REQ-5, REQ-6, FUNC-6 |
| Fault-2 | Engine parse or normalize diagnostics are included in discovery diagnostics with severity and source location when available. | Candidate output is never promoted to authoritative registry output. | REQ-2, REQ-3, REQ-5, FUNC-2 |
| Fault-3 | Duplicate definition candidates for the same ID produce diagnostics and deterministic conflict handling. | Ambiguous definitions do not silently become authoritative entities. | REQ-3, REQ-5, FUNC-6 |
| Fault-4 | A traceability cell references an ID that is not discoverable as a candidate. | The system emits an unresolved-reference diagnostic or unresolved edge status instead of fabricating a target node. | REQ-4, REQ-5, FUNC-3 |
| Fault-5 | Output artifact writing fails after discovery succeeds. | Source Markdown remains unchanged and discovery diagnostics remain reportable. | REQ-5, REQ-6, FUNC-6 |
| Misuse-1 | User attempts to use candidate JSON as validated registry evidence. | Schema names, status fields, CLI text, and graph labels identify the output as candidate and non-authoritative. | REQ-3, REQ-8, FUNC-4, FUNC-5 |
| Misuse-2 | User expects source Markdown promotion from discovery. | CLI help and output diagnostics state that discovery and graph export are read-only. | REQ-6, FUNC-5 |

Section status: Complete

## 10. External Service Levels and Acceptance Cases

External service expectations: Candidate discovery is a local CLI and library feature, not a hosted service. For default ID families, discovery should complete within 5 seconds for a 10,000-line Markdown document on a developer workstation. Output determinism applies byte-for-byte for JSON under identical input, options, package version, and runtime version.

| ID | Acceptance case | Expected result | Covers |
| --- | --- | --- | --- |
| ACC-1 | Run discovery against an execution-decomposer-shaped fixture containing design-spec ID families and traceability tables. | Candidate output contains non-empty nodes and at least one inferred or explainably unresolved relationship. | REQ-1, REQ-4, FUNC-1, FUNC-3 |
| ACC-2 | Run discovery on a fixture with a table reference to an undefined target ID. | Output includes an unresolved-reference diagnostic and does not create an authoritative target. | REQ-3, REQ-5, FUNC-3, FUNC-6 |
| ACC-3 | Run discovery on a fixture with duplicate definitions for the same ID. | Output includes a duplicate-definition diagnostic and deterministic winner or ambiguous status. | REQ-5, FUNC-6 |
| ACC-4 | Run discovery twice with identical inputs and options. | JSON output is byte-stable after canonical serialization. | REQ-2, REQ-7, FUNC-2 |
| ACC-5 | Run discovery and graph export while hashing the input file before and after invocation. | Input file hash remains unchanged and only requested output artifacts are written. | REQ-6, FUNC-5 |
| ACC-6 | Run existing R1 link-backed graph and validation tests after adding candidate discovery. | Existing authoritative behavior passes unchanged. | REQ-8, FUNC-5 |
| ACC-7 | Render Mermaid or HTML graph output from candidate data. | The visual output labels candidate nodes, inferred edges, confidence, and non-authoritative status. | REQ-3, REQ-9, FUNC-4 |
| ACC-8 | Run discovery on a generated 10,000-line design-spec-shaped Markdown file. | CLI completes within 5 seconds under the documented developer-workstation benchmark conditions. | REQ-10, FUNC-2 |

Section status: Complete

## 11. Requirements-to-Behavior Traceability

| Requirement | Functional behaviors or flows | Acceptance coverage | Notes |
| --- | --- | --- | --- |
| REQ-1 | FLOW-1, FUNC-1 | ACC-1 | Discovery behavior covers headings, tables, and prose. |
| REQ-2 | FLOW-1, FLOW-2, FUNC-2 | ACC-4 | Schema-versioned JSON is the canonical machine output. |
| REQ-3 | FLOW-1, FLOW-2, FUNC-2, FUNC-4 | ACC-2, ACC-7 | Non-authority labels are required in data and visuals. |
| REQ-4 | FLOW-1, FUNC-3 | ACC-1, ACC-2 | Edge inference is limited to explicit table-cell evidence in this slice. |
| REQ-5 | FLOW-4, FUNC-3, FUNC-6 | ACC-2, ACC-3 | Diagnostics are part of normal degraded behavior. |
| REQ-6 | FLOW-2, FLOW-4, FUNC-5 | ACC-5 | Read-only behavior covers discovery and graph export. |
| REQ-7 | FLOW-1, FUNC-2 | ACC-4 | Canonical ordering and serialization are externally observable. |
| REQ-8 | FLOW-3, FUNC-5 | ACC-6 | Existing authority path remains the compatibility gate. |
| REQ-9 | FLOW-2, FUNC-4 | ACC-7 | At least one human-readable graph view is required. |
| REQ-10 | FLOW-1, FUNC-2 | ACC-8 | Performance is bounded for default-family discovery. |

Section status: Complete

## Layer 2 Exit

Layer 2 status: Complete

## Layer 3: Technical Specification

## 12. Architecture Overview

Architecture summary: The selected architecture adds a candidate discovery pipeline beside the existing authoritative derivation path. The pipeline reads Markdown through `markdown-engine`, classifies ID definitions and mentions, infers candidate edges from explicit table references, projects a schema-versioned candidate graph, and renders JSON plus visual graph artifacts. Existing registry derivation and validation remain isolated.

Major components and boundaries: Top-level components are CLI command dispatcher, engine-backed source reader, ID-family discovery, candidate definition and mention classifier, traceability table edge inferencer, candidate graph projector, graph exporter, deterministic serializer, and diagnostics mapper. Boundaries are the `markdown-engine` public API boundary, the candidate-versus-authoritative schema boundary, and the local filesystem read/write boundary.

Deployment or runtime placement: The feature runs in the existing Node.js TypeScript package and CLI binary. It has no hosted service, background process, database, network dependency, or browser runtime.

Architecture rationale: The architecture satisfies REQ-1 and FUNC-1 by using engine-normalized Markdown structure, satisfies REQ-3 and FUNC-4 by keeping candidate graph schemas separate from registry schemas, satisfies REQ-6 and FUNC-5 by making all new commands read-only against source Markdown, and satisfies REQ-8 by leaving existing derive and validate modules as compatibility gates.

Section status: Complete

## 13. Technical Mechanisms and Allocation

| ID | Mechanism | Component or owner | Responsibility | Related behaviors |
| --- | --- | --- | --- | --- |
| TECH-1 | Engine-backed source reader | `src/markdowntrace/candidates/source.ts` | Read Markdown, call `parse` and `normalize`, collect public engine diagnostics, and pass normalized structure to discovery. | FUNC-1, FUNC-2, FUNC-6 |
| TECH-2 | ID-family configuration | `src/markdowntrace/candidates/id-families.ts` | Define default ID families, label hints, and extension placeholders without requiring custom profiles in the first slice. | FUNC-1 |
| TECH-3 | Candidate definition and mention classifier | `src/markdowntrace/candidates/discovery.ts` | Distinguish definition candidates, mentions, duplicates, and source ranges across headings, tables, and prose. | FUNC-1, FUNC-2, FUNC-6 |
| TECH-4 | Traceability table edge inferencer | `src/markdowntrace/candidates/edges.ts` | Infer candidate edges from explicit table-cell ID references and emit unresolved-reference diagnostics for missing targets. | FUNC-3, FUNC-6 |
| TECH-5 | Candidate graph projector | `src/markdowntrace/candidates/graph.ts` | Convert discovery output into deterministic nodes, edges, confidence, provenance, and summary metadata. | FUNC-2, FUNC-3, FUNC-4 |
| TECH-6 | Graph exporter | `src/markdowntrace/candidates/export.ts` | Render Mermaid and HTML or equivalent graph artifacts with visible candidate and inferred labels. | FUNC-4 |
| TECH-7 | CLI command dispatcher | `src/markdowntrace/cli.ts` and focused command modules | Add `discover` and `graph-candidates` command routing, argument parsing, output writing, and exit-code handling. | FUNC-2, FUNC-4, FUNC-5, FUNC-6 |
| TECH-8 | Diagnostics and deterministic serialization | `src/markdowntrace/candidates/diagnostics.ts`; `src/markdowntrace/candidates/serialization.ts` | Map known faults to stable diagnostics and serialize candidate JSON in canonical order. | FUNC-2, FUNC-6 |
| TECH-9 | Compatibility guard tests | `tests/test_candidate_*.test.ts`; existing R1 tests | Verify candidate behavior while keeping `derive` and `validate` behavior unchanged. | FUNC-5 |

Section status: Complete

## 14. Data, Schemas, and Compatibility

| Change | Type | Compatibility impact | Reversibility | Mitigation |
| --- | --- | --- | --- | --- |
| `markdown-trace.discovery-result.v0` | Schema | Additive candidate JSON schema; does not replace `EntityRegistry` or `TraceGraph`. | Reversible | Version schema from first release and keep authoritative outputs unchanged. |
| `markdown-trace.candidate-node.v0` | Schema | Additive node schema with `id`, `family`, `label`, `status`, `confidence`, `definition`, and `mentions`. | Reversible | Mark `status` as candidate and keep source range/provenance fields required. |
| `markdown-trace.candidate-edge.v0` | Schema | Additive edge schema with `source`, `target`, `relationship`, `status`, `confidence`, and `evidence`. | Reversible | Use inferred status and unresolved diagnostics instead of fabricating authority. |
| Candidate diagnostics | Schema | Additive diagnostics with stable codes for duplicate definitions, unresolved references, unsupported tables, parse diagnostics, read failures, and write failures. | Reversible | Snapshot diagnostic codes and messages that affect CLI behavior. |
| CLI commands `discover` and `graph-candidates` | API | Additive CLI surface; existing `validate` and `derive` flags remain unchanged. | Reversible | Keep command routing backward-compatible and regression-test existing commands. |
| Candidate graph exports | Data | Generated Mermaid or HTML files are disposable artifacts. | Reversible | Output files are written only to requested paths and can be deleted without source changes. |

Section status: Complete

## 15. Control Logic and Non-Functional Controls

Control logic summary: Candidate discovery runs as a deterministic pipeline: resolve options, read source, parse and normalize through `markdown-engine`, classify ID definitions and mentions, infer table-backed edges, generate diagnostics, project candidate graph metadata, serialize JSON, and optionally render graph output. Each stage receives immutable inputs and returns explicit result objects.

Concurrency and ordering model: Discovery is single-invocation and single-document for the first slice. Ordering is canonical by source order for occurrences, then by normalized ID for nodes, then by source ID, target ID, relationship, and source range for edges. No shared mutable state or background concurrency is introduced.

Failure recovery model: Recoverable discovery faults produce diagnostics and degraded candidate output. Non-recoverable read, parse-error, argument, or write failures return stable CLI exit codes. Existing authoritative commands remain isolated and unaffected by candidate failure paths.

| Requirement | Mechanism | Notes |
| --- | --- | --- |
| REQ-1 | TECH-1, TECH-2, TECH-3 | Engine-backed extraction avoids raw parser internals. |
| REQ-2 | TECH-5, TECH-8 | Schema and serialization are separated from extraction. |
| REQ-3 | TECH-5, TECH-6, TECH-8 | Candidate status is encoded in JSON and visual exports. |
| REQ-4 | TECH-4, TECH-5 | Table inference remains evidence-bound. |
| REQ-5 | TECH-4, TECH-7, TECH-8 | Diagnostics cover degraded modes and CLI failure classes. |
| REQ-6 | TECH-7 | Commands write only requested output artifacts, never source Markdown. |
| REQ-7 | TECH-5, TECH-8 | Canonical sorting and serializer snapshots control repeatability. |
| REQ-8 | TECH-7, TECH-9 | Candidate modules are additive and existing tests remain gates. |
| REQ-9 | TECH-6 | Visual graph export receives candidate graph data with labels. |
| REQ-10 | TECH-1, TECH-3, TECH-4, TECH-8 | Single-pass extraction and bounded table/reference processing support the performance target. |

Section status: Complete

## 16. Observability, Operations, Rollout, and Rollback

| Signal | Type | Purpose | Consumer |
| --- | --- | --- | --- |
| CLI exit code | Log | Distinguish success, validation-style failure, and operational failure. | CLI user, agent, tests |
| Candidate count | Log | Show whether discovery found graphable nodes. | CLI user, graph reviewer |
| Inferred edge count | Log | Show graph relationship yield. | CLI user, graph reviewer |
| Diagnostic count by severity and code | Log | Explain missing edges, unsupported shapes, and degraded behavior. | CLI user, implementation agent |
| Output schema version | Audit | Identify candidate artifact compatibility. | Agent, future markdown-context consumer |
| Snapshot hash | Audit | Verify deterministic JSON and fixture repeatability. | Test suite, reviewer |
| Input content hash in tests | Audit | Prove read-only behavior for source Markdown. | Test suite, reviewer |

Rollout plan: Implement in reviewable slices: candidate data model and discovery fixtures, table edge inference and diagnostics, CLI JSON output, graph export output, then compatibility and performance gates. Release as additive behavior behind new commands with no change to existing command invocation.

Rollback or containment plan: Trigger rollback if candidate commands regress existing `validate` or `derive` behavior, produce unlabeled candidate authority, or write to source Markdown. Action is to remove or disable the new command routing and generated artifacts; reversibility is complete because the feature is read-only and introduces no migration.

Operator actions: Users can run `markdown-trace discover --document <path>` for JSON evidence, `markdown-trace graph-candidates --document <path> --format mermaid|html --output <path>` for visualization, inspect diagnostics for unsupported shapes, and delete generated artifacts to clean up.

Section status: Complete

## 17. Verification Strategy and Behavior-to-Mechanism Traceability

| ID | Verification method | What is verified | Related IDs |
| --- | --- | --- | --- |
| VAL-1 | Test | ID-family discovery finds definitions and mentions across headings, tables, and prose. | REQ-1, FUNC-1, TECH-1, TECH-2, TECH-3 |
| VAL-2 | Test | Execution-decomposer-shaped fixture produces candidate nodes across default design-spec families. | REQ-1, REQ-4, FUNC-1, FUNC-3, TECH-3, TECH-4 |
| VAL-3 | Test | Candidate JSON uses schema-versioned non-authoritative node and edge records with provenance and confidence. | REQ-2, REQ-3, FUNC-2, TECH-5, TECH-8 |
| VAL-4 | Test | Candidate JSON is byte-stable across repeated runs with identical inputs and options. | REQ-2, REQ-7, FUNC-2, TECH-5, TECH-8 |
| VAL-5 | Test | Unresolved references, duplicate definitions, unsupported table shapes, and file failures emit stable diagnostics. | REQ-4, REQ-5, FUNC-3, FUNC-6, TECH-4, TECH-8 |
| VAL-6 | Test | Discovery and graph export do not modify input Markdown content. | REQ-6, FUNC-5, TECH-7 |
| VAL-7 | Inspection | Implementation imports only public `@jasonbelmonti/markdown-engine` APIs and does not add network, browser, MCP, database, or LLM dependencies. | CON-1, CON-5, REQ-1, TECH-1 |
| VAL-8 | Manual | Mermaid or HTML graph output visibly labels candidate nodes, inferred edges, confidence, and non-authoritative status. | REQ-3, REQ-9, FUNC-4, TECH-6 |
| VAL-9 | Test | Existing R1 link-backed `derive` and `validate` fixture behavior passes unchanged. | REQ-8, FUNC-5, TECH-7, TECH-9 |
| VAL-10 | Test | Default-family discovery completes for a generated 10,000-line Markdown fixture within 5 seconds on a developer workstation. | REQ-10, FUNC-2, TECH-1, TECH-3, TECH-4, TECH-8 |

| Behavior or requirement | Mechanisms | Verification |
| --- | --- | --- |
| FUNC-1 | TECH-1, TECH-2, TECH-3 | VAL-1, VAL-2 |
| FUNC-2 | TECH-5, TECH-8 | VAL-3, VAL-4, VAL-10 |
| FUNC-3 | TECH-4, TECH-5 | VAL-2, VAL-5 |
| FUNC-4 | TECH-5, TECH-6 | VAL-8 |
| FUNC-5 | TECH-7, TECH-9 | VAL-6, VAL-9 |
| FUNC-6 | TECH-4, TECH-7, TECH-8 | VAL-5 |
| REQ-1 | TECH-1, TECH-2, TECH-3 | VAL-1, VAL-2, VAL-7 |
| REQ-2 | TECH-5, TECH-8 | VAL-3, VAL-4 |
| REQ-3 | TECH-5, TECH-6, TECH-8 | VAL-3, VAL-8 |
| REQ-4 | TECH-4, TECH-5 | VAL-2, VAL-5 |
| REQ-5 | TECH-4, TECH-7, TECH-8 | VAL-5 |
| REQ-6 | TECH-7 | VAL-6 |
| REQ-7 | TECH-5, TECH-8 | VAL-4 |
| REQ-8 | TECH-7, TECH-9 | VAL-9 |
| REQ-9 | TECH-6 | VAL-8 |
| REQ-10 | TECH-1, TECH-3, TECH-4, TECH-8 | VAL-10 |

Section status: Complete

## 18. Alternatives, Risks, Open Questions, and Final Exit

| Alternative | Reason considered | Reason rejected |
| --- | --- | --- |
| Keep `ctx://trace` only | It preserves the existing authoritative model with no implementation risk. | It leaves existing non-annotated design specs with empty graphs until manual annotation. |
| One-off visualization script | It could demonstrate value quickly for a single document. | It would not create durable package contracts, diagnostics, or repeatable UX. |
| Promotion-first migration | It would move users directly toward durable trace links. | Source mutation, type-profile mapping, review policy, and patch generation are broader than this first slice. |
| LLM semantic graph | It could infer relationships beyond explicit IDs. | It violates deterministic, local-first, and source-evidence constraints. |

| ID | Statement | Likelihood | Consequence | Mitigation |
| --- | --- | --- | --- | --- |
| RISK-1 | Users may treat candidate graphs as authoritative trace evidence. | Medium | High | Encode candidate status in schema names, node and edge fields, CLI text, graph labels, and tests. |
| RISK-2 | Table-shape variation may make inferred edges incomplete. | Medium | Medium | Start with explicit table-reference patterns, emit unsupported-shape diagnostics, and expand only with fixtures. |
| RISK-3 | Feature scope may expand into source promotion too early. | Medium | Medium | Keep mutation and promotion out of this design and route promotion to a later design chain. |

| ID | Question | Owner | Due date | Resolution plan |
| --- | --- | --- | --- | --- |
| Q-1 | Should custom ID-family profiles be included in the first release? | Project owner | After first fixture implementation and one real-doc run | Compare default-family coverage against execution-decomposer output and decide whether unsupported families block launch. |

Waivers: none

Final readiness statement: Superseded by durable Markdown authoring revision; not the implementation authority.

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
| No `R3` trigger applies. | yes |
| Final readiness statement matches `R2`. | yes |
| `R3` waiver coverage is not applicable. | yes |

## Internal Review Record

| Field | Value |
| --- | --- |
| Document | `docs/design/markdown-trace-candidate-graph-design-spec.md` |
| Review date | 2026-06-03 |
| Moderator | Codex |
| Decision owner | Project owner |
| Proposed rigor level | `R2` |
| Reviewed rigor level | `R2` |
| Structural result | Pass |
| Semantic result | Pass |
| Traceability result | Pass |
| Verdict | Superseded; do not implement from this packet |
| Open findings | none |
| Resolved findings verified in this decision | DS-1, DS-2 |
| Reviewed waivers | none |
| Required heightened controls | none |
| Approval conditions | none |
| Top blockers | Superseded by durable Markdown authoring revision |
| Required follow-ups | Decide Q-1 after first fixture and one real-doc run. |

Findings addressed:

- DS-1 Major, resolved: Initial scope could blur candidate output with authoritative registry derivation. The spec now requires schema-distinct candidate outputs, non-authority fields, visual labels, and compatibility tests.
- DS-2 Minor, resolved: Initial command surface could require too many steps for graph UX. The spec now includes both discovery and direct candidate graph export command behavior.

Validation result: Supersession structural validation passed with `@jasonbelmonti/markdown-engine@2.0.0` and `design-spec-validation-profile.yaml`; no diagnostics were reported. Evidence input hash before this review-record update was `5d27564138efdd18af91618836c3b207a1996cb8c95b4b173c4bd7b0332588a0`.
