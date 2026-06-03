# Markdown Trace Candidate Graph Interface Design Packet

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Candidate Graph Interface Design Packet |
| Contract depth | `ID2` |
| Source authority | `docs/design/markdown-trace-candidate-graph-design-spec.md` |
| Author | Codex |
| Reviewers | Project owner; Markdown Trace maintainer; markdown-engine contract reviewer; graph UX reviewer |
| Last updated | 2026-06-03 |
| Related design/spec/tickets | `docs/design/markdown-trace-candidate-graph-design-process.md`; `docs/design/markdown-trace-candidate-graph-overview.md`; `docs/design/markdown-trace-candidate-graph-design-spec.md`; `docs/design/markdown-trace-durable-markdown-authoring-revision-overview.md`; no related tickets |

## 0. Executive Contract Summary

- Decision requested: Superseded by the durable Markdown authoring revision; do not use this read-only interface packet for implementation.
- Source design summary: Existing unannotated design specs shall produce deterministic, non-authoritative candidate graph artifacts without changing source Markdown or existing authoritative `validate` and `derive` behavior.
- Highest-risk boundaries: Candidate-versus-authoritative schema boundary, CLI command compatibility boundary, `markdown-engine` public API dependency boundary, and local filesystem read/write boundary.
- Implementation slice covered: Candidate discovery options, discovery result schema, candidate node and edge schemas, diagnostics, CLI commands, graph export, engine adapter, deterministic serialization, and authoritative compatibility guard.
- Out of scope: Source mutation, trace-link promotion, validated `EntityRegistry` generation from candidates, remote services, LLM extraction, and custom ID-family profiles beyond extension placeholders.
- Section status: Complete

## 1. Source Requirements and Assumptions

| ID | Statement | Source | Impact on contracts |
| --- | --- | --- | --- |
| REQ-1 | Discover configured ID-family candidates in headings, tables, and prose from local Markdown. | Design spec section 5 | Requires C-3 options, C-8 engine adapter, and C-9 discovery service. |
| REQ-2 | Emit schema-versioned discovery JSON with candidates, mentions, inferred edges, diagnostics, source ranges, and run metadata. | Design spec section 5 | Requires C-4 result schema, C-5 node schema, C-6 edge schema, C-7 diagnostics, and C-11 serialization. |
| REQ-3 | Mark every discovered entity and inferred edge as non-authoritative with provenance and confidence fields. | Design spec section 5 | Requires trust fields in C-4, C-5, C-6, and C-10 graph export. |
| REQ-4 | Infer candidate edges from explicit traceability table cells when source and target IDs are discoverable. | Design spec section 5 | Requires C-6 edge evidence and C-9 discovery rules. |
| REQ-5 | Report unresolved references, duplicate definitions, unsupported table shapes, and file errors through stable diagnostics. | Design spec section 5 | Requires C-7 diagnostic taxonomy and CLI exit rules in C-1 and C-2. |
| REQ-6 | Provide read-only discovery and graph export commands that never write to input Markdown. | Design spec section 5 | Requires C-1, C-2, and C-13 compatibility/read-only guard. |
| REQ-7 | Produce byte-stable JSON for identical input, options, package version, and runtime version. | Design spec section 5 | Requires C-11 deterministic serialization. |
| REQ-8 | Preserve existing authoritative `validate` and `derive` behavior for link-backed fixtures. | Design spec section 5 | Requires C-13 authoritative compatibility guard. |
| REQ-9 | Provide a human-readable graph export that visibly labels candidate nodes and inferred edges. | Design spec section 5 | Requires C-2 and C-10 graph export contracts. |
| REQ-10 | Complete discovery for a 10,000-line Markdown document within 5 seconds under default-family conditions. | Design spec section 5 | Requires C-8 and C-9 single-pass processing constraints. |
| CON-1 | Candidate discovery uses only `@jasonbelmonti/markdown-engine` package-root public APIs. | Design spec section 4 | C-8 must be the only engine-facing adapter. |
| CON-2 | Candidate output is schema-distinct from `EntityRegistry` and `TraceGraph`. | Design spec section 4 | C-4, C-5, and C-6 must not reuse authoritative registry types. |
| CON-3 | Source Markdown is not modified by discovery or graph export commands. | Design spec section 4 | C-1, C-2, C-12, and C-13 must preserve read-only input behavior. |
| CON-4 | Outputs are deterministic for identical input, options, package version, and runtime version. | Design spec section 4 | C-11 must own canonical ordering. |
| CON-5 | The feature remains local-first and offline. | Design spec section 4 | No contract may require network, browser, database, MCP, or LLM services. |
| ASM-1 | Default design-spec ID families are sufficient for the first useful discovery slice. | Design spec section 4 | C-3 exposes defaults and reserves profile extension without requiring it. |
| ASM-2 | `markdown-engine` normalized structures and source ranges are sufficient for first-pass provenance. | Design spec section 4 | C-8 maps engine structure to C-5 and C-6 source evidence. |
| Q-1 | Decide whether custom ID-family profiles are needed in the first release. | Design spec section 18 | C-3 reserves an optional profile shape but first implementation may keep it disabled. |

Section status: Complete

## 2. Problem-Space Model

### Existing Interface Constraints

| Interface | Kind | Owner | Mutability | Quality/completeness | Known consumers | Constraint or opportunity |
| --- | --- | --- | --- | --- | --- | --- |
| IF-1 Existing `main(argv, environment)` CLI entry | API | Markdown Trace | owned-changeable | partial and test-covered | CLI tests, package bin | Extend command parsing without regressing existing `validate` and `derive`. |
| IF-2 `markdown-trace` package exports | API | Markdown Trace | owned-changeable | partial | Local tests, future package users | Add focused candidate exports without creating provider-wide service objects. |
| IF-3 `@jasonbelmonti/markdown-engine` package-root APIs | SDK | markdown-engine | fixed for this effort | strong enough by adoption evidence | Registry derivation, future candidate discovery | Use only public parse, normalize, and query APIs. |
| IF-4 `EntityRegistry` | schema | Markdown Trace | owned-risky | strong and behaviorally tested | Validation, graph derivation, R1 fixtures | Do not extend or overload for candidates. |
| IF-5 `TraceGraph` | schema | Markdown Trace | owned-risky | simple and behaviorally tested | Graph derivation, CLI output tests | Do not make candidate graph a hidden replacement for authoritative graph. |
| IF-6 Existing `derive` CLI output | file | Markdown Trace | owned-risky | test-covered | CLI users and tests | Preserve YAML output shape and exit behavior. |
| IF-7 Existing local filesystem behavior | file | User environment | fixed | operating-system controlled | CLI commands | Read source Markdown and write generated artifacts only to requested paths. |
| IF-8 R1 link-backed type profile contract | config | Markdown Trace | owned-risky | test-covered | R1 derivation | Keep separate from candidate ID-family defaults. |

### Actors and Systems

| Actor/System | Role | Trust level | Contract needs |
| --- | --- | --- | --- |
| CLI user | Runs discovery and graph export locally. | Trusted local operator | Clear flags, exit codes, diagnostics, and no source mutation. |
| Implementation agent | Consumes candidate JSON for planning or future context packets. | Trusted local consumer | Stable schema, deterministic ordering, and source evidence. |
| Graph reviewer | Reviews visual trace shape. | Trusted local reviewer | Candidate and inferred labels in rendered output. |
| Markdown Trace maintainer | Owns package boundaries and compatibility. | Internal owner | Additive contracts and regression gates. |
| markdown-engine | Provides Markdown parse/query structure. | External package dependency | Narrow adapter contract using public APIs. |
| Local filesystem | Supplies source and receives artifacts. | Fixed environment | Explicit read/write boundaries and failure diagnostics. |

### Capabilities

| Capability | Command/query/event | Owner | Consumers | Notes |
| --- | --- | --- | --- | --- |
| Candidate discovery | Command/query | Markdown Trace | CLI user, implementation agent | Reads Markdown and emits C-4 JSON. |
| Candidate graph rendering | Command/query | Markdown Trace | CLI user, graph reviewer | Renders Mermaid or HTML from C-4. |
| Engine document adaptation | Query | Markdown Trace | Candidate discovery service | Contains dependency on IF-3. |
| Diagnostic explanation | Query | Markdown Trace | CLI user, implementation agent | Provides stable codes and severities. |
| Deterministic artifact production | Query | Markdown Trace | Tests, agents, reviewers | Canonical JSON order and schema version. |
| Authoritative compatibility guarding | Command/test gate | Markdown Trace | Maintainer, test suite | Keeps `validate` and `derive` unchanged. |

### Domain Vocabulary

| Term | Definition | Invariants | Non-examples |
| --- | --- | --- | --- |
| Candidate discovery result | The schema-versioned non-authoritative output of discovery. | Has schema version, run metadata, nodes, edges, diagnostics, and summary. | `EntityRegistry` |
| Candidate node | A discovered ID-family entity candidate from the source document. | Has candidate status, label, family, source evidence, and confidence. | Validated registry entity |
| Candidate mention | A source occurrence of an ID label. | Has source range, role, and context. | Plain text with no recognized ID |
| Candidate edge | An inferred relationship from explicit table-cell evidence. | Has inferred or unresolved status, evidence, and confidence. | Authoritative registry edge |
| Candidate diagnostic | Stable explanation of an extraction, inference, or IO condition. | Has code, severity, message, and optional source evidence. | Generic thrown exception |
| Source evidence | Location and context proving why a candidate exists. | References local path and range when available. | Remote issue link or inferred semantic rationale |
| Confidence | Bounded trust signal for candidate and edge records. | Values are `high`, `medium`, or `low`. | Boolean authority flag |
| Authority status | Trust classification for candidate output. | Candidate artifacts never use authoritative status. | Registry validation result |

Section status: Complete

## 3. Boundary Map

| Boundary | Owner | Consumers | Direction | Stability | Reason to exist |
| --- | --- | --- | --- | --- | --- |
| CLI ingress boundary | Markdown Trace | CLI users and agents | User to package | external | Parse flags, route commands, preserve current CLI behavior. |
| Candidate domain boundary | Markdown Trace | CLI, library consumers, graph exporter | Discovery to consumers | internal-to-public | Keep candidate semantics distinct from registry semantics. |
| Engine adapter boundary | Markdown Trace | Candidate discovery service | markdown-engine to Markdown Trace | internal | Contain dependency on public engine APIs and normalize source evidence. |
| Filesystem boundary | Markdown Trace | CLI commands | Local filesystem to package | fixed | Enforce read-only source handling and artifact write failures. |
| Graph export boundary | Markdown Trace | Reviewers and future context tooling | Candidate graph to visual artifact | external | Provide usable visual graph without changing source. |
| Authoritative compatibility boundary | Markdown Trace | Existing users and tests | Existing commands to package | owned-risky | Ensure candidate discovery cannot change registry validation or derivation behavior. |

Section status: Complete

## 3A. Integration Strategy

| Existing interface | Proposed response | Adapter/translator contract | Upstream change needed | Validation required |
| --- | --- | --- | --- | --- |
| IF-1 Existing `main(argv, environment)` CLI entry | extend | C-1, C-2 | no | VAL-1, VAL-2, VAL-9 |
| IF-2 Package exports | extend | C-3 through C-12 | no | VAL-3, VAL-9 |
| IF-3 markdown-engine public APIs | wrap | C-8 | no | VAL-7 |
| IF-4 `EntityRegistry` | tolerate and isolate | C-13 | no | VAL-9 |
| IF-5 `TraceGraph` | tolerate and isolate | C-10, C-13 | no | VAL-8, VAL-9 |
| IF-6 Existing `derive` CLI output | tolerate | C-13 | no | VAL-9 |
| IF-7 Local filesystem | validate | C-1, C-2, C-12 | no | VAL-6 |
| IF-8 R1 type profile contract | tolerate and isolate | C-3, C-13 | no | VAL-9 |

Section status: Complete

## 4. Contract Inventory

| Contract ID | Name | Kind | Owner | Consumers | Stability | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| C-1 | Discover CLI Command | API | Markdown Trace | CLI users, agents, tests | public | REQ-1, REQ-2, REQ-5, REQ-6, REQ-7 |
| C-2 | Graph Candidates CLI Command | API | Markdown Trace | CLI users, reviewers, tests | public | REQ-3, REQ-6, REQ-9 |
| C-3 | Candidate Discovery Options | config | Markdown Trace | C-1, C-9, library consumers | internal | REQ-1, ASM-1, Q-1 |
| C-4 | Candidate Discovery Result | schema | Markdown Trace | C-1, C-2, C-10, agents | public | REQ-2, REQ-3, REQ-7 |
| C-5 | Candidate Node and Mention | schema | Markdown Trace | C-4, C-10, agents | public | REQ-1, REQ-2, REQ-3 |
| C-6 | Candidate Edge | schema | Markdown Trace | C-4, C-10, agents | public | REQ-3, REQ-4, REQ-5 |
| C-7 | Candidate Diagnostic | schema | Markdown Trace | C-1, C-2, C-4, tests | public | REQ-5 |
| C-8 | Engine Document Adapter | port | Markdown Trace | C-9 | internal | CON-1, ASM-2, REQ-1 |
| C-9 | Candidate Discovery Service | port | Markdown Trace | C-1, C-2, library consumers | internal | REQ-1, REQ-4, REQ-10 |
| C-10 | Candidate Graph Exporter | API | Markdown Trace | C-2, reviewers | internal-to-public | REQ-3, REQ-9 |
| C-11 | Deterministic Serializer | schema | Markdown Trace | C-1, C-4, tests | internal | REQ-2, REQ-7 |
| C-12 | Candidate Artifact IO | API | Markdown Trace | C-1, C-2 | internal | REQ-5, REQ-6 |
| C-13 | Authoritative Compatibility Guard | API | Markdown Trace | Maintainers, tests | internal | REQ-8, CON-2, CON-3 |

Section status: Complete

## 5. Materialized Contracts

### C-1: Discover CLI Command

- Kind: API
- Purpose: Run read-only candidate discovery and emit C-4 JSON.
- Owner: Markdown Trace
- Consumers: CLI users, implementation agents, tests
- Lifecycle/stability: Public additive CLI surface; breaking flag changes require a new design update.
- Source IDs: REQ-1, REQ-2, REQ-5, REQ-6, REQ-7
- Existing interface relationship: Extends IF-1 without changing `validate` or `derive`.
- Preconditions: User provides `--document <path>`; path resolves under normal filesystem rules.
- Postconditions: JSON is written to stdout or `--output`; input Markdown content is unchanged.
- Invariants: Output is candidate-only; successful command does not write the source document.
- Inputs: `discover --document <path> [--namespace <value>] [--output <path>] [--format json]`.
- Outputs: C-4 JSON; diagnostics embedded in result; exit code.
- Error model: Exit `0` when C-4 is produced; exit `2` for invalid arguments, unreadable input, unrecoverable parse failure, or output write failure.
- Authorization/tenancy: None; local operator controls filesystem access.
- Idempotency/retry/ordering: Re-running with identical inputs and options produces byte-stable JSON.
- Versioning/compatibility: `--format json` is the default and maps to schema `markdown-trace.discovery-result.v0`.
- Observability: Summary counts, schema version, diagnostic counts, and exit code.
- Validation evidence: VAL-1, VAL-4, VAL-6, VAL-9.

```text
markdown-trace discover --document <path> [--namespace <namespace>] [--output <path>] [--format json]
```

### C-2: Graph Candidates CLI Command

- Kind: API
- Purpose: Render candidate graph data as a human-readable graph artifact.
- Owner: Markdown Trace
- Consumers: CLI users, graph reviewers, tests
- Lifecycle/stability: Public additive CLI surface.
- Source IDs: REQ-3, REQ-6, REQ-9
- Existing interface relationship: Extends IF-1 and wraps C-10.
- Preconditions: User provides either `--input <candidate-json>` or `--document <markdown-path>` plus `--format mermaid|html`.
- Postconditions: Graph text is written to stdout or output path; input Markdown and candidate JSON inputs are unchanged.
- Invariants: Rendered graph labels candidate nodes, inferred edges, confidence, and non-authoritative status.
- Inputs: `graph-candidates --document <path> --format mermaid|html [--output <path>]` or `graph-candidates --input <path> --format mermaid|html [--output <path>]`.
- Outputs: Mermaid text or self-contained HTML; diagnostics and exit code.
- Error model: Exit `0` when graph artifact is produced; exit `2` for invalid arguments, invalid candidate JSON, failed discovery, or write failure.
- Authorization/tenancy: None; local operator controls filesystem access.
- Idempotency/retry/ordering: Re-running with identical inputs produces byte-stable Mermaid and deterministic HTML graph data blocks.
- Versioning/compatibility: Supported formats are explicit; adding formats is additive.
- Observability: Rendered node count, edge count, diagnostic count, output path, and exit code.
- Validation evidence: VAL-2, VAL-6, VAL-8.

```text
markdown-trace graph-candidates --document <path> --format mermaid --output <path>
markdown-trace graph-candidates --input candidates.json --format html --output graph.html
```

### C-3: Candidate Discovery Options

- Kind: config
- Purpose: Carry discovery configuration without coupling the first slice to type-profile mutation or custom profiles.
- Owner: Markdown Trace
- Consumers: C-1, C-9, library consumers
- Lifecycle/stability: Internal in first slice; may become public when custom profile support is approved.
- Source IDs: REQ-1, ASM-1, Q-1
- Existing interface relationship: Separates candidate family defaults from IF-8 R1 type profiles.
- Preconditions: Options are normalized before discovery begins.
- Postconditions: Discovery receives a deterministic set of ID families and output controls.
- Invariants: Defaults include design-spec families; custom profile support is optional and bounded by Q-1.
- Inputs: Document path, namespace hint, ID-family defaults, optional output format.
- Outputs: Normalized discovery options.
- Error model: Invalid option values produce C-7 diagnostics or CLI argument failure.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Normalization is deterministic.
- Versioning/compatibility: New optional fields are additive.
- Observability: Options recorded in C-4 run metadata with paths normalized for display.
- Validation evidence: VAL-1, VAL-3, VAL-7.

```ts
interface CandidateDiscoveryOptions {
  readonly documentPath?: string;
  readonly namespace?: string;
  readonly idFamilies?: readonly CandidateIdFamily[];
}

interface CandidateIdFamily {
  readonly prefix: string;
  readonly kindHint?: string;
}
```

### C-4: Candidate Discovery Result

- Kind: schema
- Purpose: Canonical machine-readable candidate discovery artifact.
- Owner: Markdown Trace
- Consumers: C-1, C-2, C-10, agents, future markdown-context consumers
- Lifecycle/stability: Public schema version `markdown-trace.discovery-result.v0`.
- Source IDs: REQ-2, REQ-3, REQ-7
- Existing interface relationship: New schema; does not replace IF-4 or IF-5.
- Preconditions: Produced only by C-9 and serialized by C-11.
- Postconditions: Contains deterministic arrays and summary counts.
- Invariants: `authority` is always `candidate`; every node and edge uses candidate schemas.
- Inputs: C-5 nodes, C-6 edges, C-7 diagnostics, run metadata.
- Outputs: JSON object.
- Error model: Diagnostics are embedded; malformed external JSON input to C-2 fails validation.
- Authorization/tenancy: None; local paths may be present as source evidence.
- Idempotency/retry/ordering: Canonical serialization controls field and array order.
- Versioning/compatibility: Breaking changes require a new `schemaVersion`; additive fields are allowed.
- Observability: Summary includes node, edge, mention, unresolved, and diagnostic counts.
- Validation evidence: VAL-3, VAL-4.

```ts
interface CandidateDiscoveryResult {
  readonly schemaVersion: "markdown-trace.discovery-result.v0";
  readonly authority: "candidate";
  readonly document: CandidateDocumentRef;
  readonly options: CandidateRunOptions;
  readonly nodes: readonly CandidateNode[];
  readonly edges: readonly CandidateEdge[];
  readonly diagnostics: readonly CandidateDiagnostic[];
  readonly summary: CandidateDiscoverySummary;
}
```

### C-5: Candidate Node and Mention

- Kind: schema
- Purpose: Represent discovered ID definitions and mentions without claiming registry authority.
- Owner: Markdown Trace
- Consumers: C-4, C-10, agents
- Lifecycle/stability: Public schema versioned through C-4.
- Source IDs: REQ-1, REQ-2, REQ-3
- Existing interface relationship: New schema; not a `RegistryEntity`.
- Preconditions: Label matches a configured ID family.
- Postconditions: Node has at least one definition or mention and source evidence.
- Invariants: `status` is `candidate`; `id` is a candidate artifact ID, not a registry canonical ID.
- Inputs: Engine source spans, ID family configuration, table/prose context.
- Outputs: Candidate node and mention records.
- Error model: Duplicate definitions appear as C-7 diagnostics and node conflict metadata.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Mentions sort by source order; nodes sort by normalized label.
- Versioning/compatibility: Required fields stay stable within C-4 v0.
- Observability: Node confidence and mention count appear in result and graph labels.
- Validation evidence: VAL-1, VAL-3, VAL-4.

```ts
type CandidateStatus = "candidate";
type CandidateConfidence = "high" | "medium" | "low";
type CandidateMentionRole = "definition" | "mention" | "edge_evidence";

interface CandidateNode {
  readonly id: string;
  readonly label: string;
  readonly family: string;
  readonly status: CandidateStatus;
  readonly confidence: CandidateConfidence;
  readonly definition?: CandidateMention;
  readonly mentions: readonly CandidateMention[];
}

interface CandidateMention {
  readonly role: CandidateMentionRole;
  readonly text: string;
  readonly context: "heading" | "table_cell" | "paragraph" | "link" | "unknown";
  readonly source: CandidateSourceRange;
}
```

### C-6: Candidate Edge

- Kind: schema
- Purpose: Represent inferred relationships from explicit table-cell evidence.
- Owner: Markdown Trace
- Consumers: C-4, C-10, agents
- Lifecycle/stability: Public schema versioned through C-4.
- Source IDs: REQ-3, REQ-4, REQ-5
- Existing interface relationship: New schema; not a `RegistryEdge`.
- Preconditions: Edge evidence comes from an explicit traceability table cell or equivalent table evidence accepted by C-9.
- Postconditions: Resolved edges reference candidate node IDs; unresolved edges or omitted edges produce diagnostics.
- Invariants: `status` is `inferred` or `unresolved`; never authoritative.
- Inputs: Source candidate, target candidate or target label, table source evidence.
- Outputs: Candidate edge records.
- Error model: Missing target generates `candidate.reference.unresolved`; ambiguous source or target generates diagnostic evidence.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Edges sort by source ID, target ID or target label, relationship, and source range.
- Versioning/compatibility: Relationship defaults are stable; future relationship expansion is additive.
- Observability: Confidence, evidence, and relationship hint appear in JSON and graph output.
- Validation evidence: VAL-2, VAL-3, VAL-5, VAL-8.

```ts
interface CandidateEdge {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId?: string;
  readonly targetLabel?: string;
  readonly relationship: "references";
  readonly status: "inferred" | "unresolved";
  readonly confidence: CandidateConfidence;
  readonly evidence: CandidateEdgeEvidence;
}

interface CandidateEdgeEvidence {
  readonly kind: "traceability_table";
  readonly relationHint?: string;
  readonly source: CandidateSourceRange;
}
```

### C-7: Candidate Diagnostic

- Kind: schema
- Purpose: Provide stable, actionable diagnostics for degraded discovery and operational failures.
- Owner: Markdown Trace
- Consumers: C-1, C-2, C-4, tests
- Lifecycle/stability: Public diagnostic code taxonomy.
- Source IDs: REQ-5
- Existing interface relationship: Extends CLI diagnostic practice without using generic exceptions as the public contract.
- Preconditions: Diagnostic code is selected from the candidate taxonomy.
- Postconditions: User can distinguish warning, error, and operational failure.
- Invariants: Diagnostics do not imply authoritative validation failure.
- Inputs: Engine diagnostics, discovery conflicts, unresolved references, unsupported table shapes, IO failures.
- Outputs: Diagnostic records and CLI stderr messages for operational failures.
- Error model: Severity values are `info`, `warning`, and `error`; CLI exits `2` only when no requested artifact can be produced.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Diagnostics sort by severity rank, source range, and code.
- Versioning/compatibility: Codes remain stable within v0 unless replaced by a documented alias.
- Observability: Diagnostic counts by code and severity appear in summary.
- Validation evidence: VAL-5.

```ts
type CandidateDiagnosticCode =
  | "candidate.input.invalid_argument"
  | "candidate.source.read_failed"
  | "candidate.engine.parse"
  | "candidate.definition.duplicate"
  | "candidate.reference.unresolved"
  | "candidate.table.unsupported_shape"
  | "candidate.output.write_failed";

interface CandidateDiagnostic {
  readonly code: CandidateDiagnosticCode;
  readonly severity: "info" | "warning" | "error";
  readonly message: string;
  readonly source?: CandidateSourceRange;
  readonly relatedIds?: readonly string[];
}
```

### C-8: Engine Document Adapter

- Kind: port
- Purpose: Contain all `markdown-engine` dependency usage behind a narrow adapter.
- Owner: Markdown Trace
- Consumers: C-9
- Lifecycle/stability: Internal.
- Source IDs: CON-1, ASM-2, REQ-1
- Existing interface relationship: Wraps IF-3 without leaking engine internals into candidate schemas.
- Preconditions: Markdown text and display path are available.
- Postconditions: Candidate discovery receives normalized document structure and engine diagnostics.
- Invariants: Imports come from the package root of `@jasonbelmonti/markdown-engine`.
- Inputs: Markdown text, document path.
- Outputs: Engine document view with sections, nodes, tables, text spans, link references, and diagnostics.
- Error model: Engine diagnostics convert to C-7 diagnostics; adapter errors are operational failures.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Adapter produces stable views for identical engine output.
- Versioning/compatibility: Engine major-version changes require adapter review.
- Observability: Adapter records engine version in C-4 run metadata when available.
- Validation evidence: VAL-7.

### C-9: Candidate Discovery Service

- Kind: port
- Purpose: Coordinate source adaptation, ID discovery, edge inference, diagnostics, and candidate graph projection.
- Owner: Markdown Trace
- Consumers: C-1, C-2, library consumers
- Lifecycle/stability: Internal with candidate exports as needed.
- Source IDs: REQ-1, REQ-4, REQ-10
- Existing interface relationship: New service beside authoritative derivation.
- Preconditions: C-3 options are normalized and C-8 adapter is available.
- Postconditions: C-4 result is produced or an operational error is returned to CLI.
- Invariants: Service never constructs `EntityRegistry` from candidates.
- Inputs: Markdown text or document path plus C-3 options.
- Outputs: C-4 candidate discovery result.
- Error model: Recoverable conflicts become C-7 diagnostics; unrecoverable IO and argument failures return CLI errors.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Single-document deterministic pipeline.
- Versioning/compatibility: Service internals are changeable; C-4 is the compatibility surface.
- Observability: Summary counts and run metadata.
- Validation evidence: VAL-1, VAL-2, VAL-5, VAL-10.

### C-10: Candidate Graph Exporter

- Kind: API
- Purpose: Render C-4 as Mermaid or HTML with visible candidate trust labeling.
- Owner: Markdown Trace
- Consumers: C-2, reviewers
- Lifecycle/stability: Internal-to-public through CLI formats.
- Source IDs: REQ-3, REQ-9
- Existing interface relationship: Produces candidate graph views without changing IF-5.
- Preconditions: C-4 validates structurally.
- Postconditions: Output graph labels candidate nodes and inferred edges.
- Invariants: Graph artifacts do not remove non-authority labels.
- Inputs: C-4 result, format, rendering options.
- Outputs: Mermaid text or HTML string.
- Error model: Invalid result or unsupported format returns C-7-style diagnostic and CLI failure.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Deterministic node and edge order from C-11.
- Versioning/compatibility: New graph formats are additive.
- Observability: Graph title, schema version, node count, edge count, diagnostic count.
- Validation evidence: VAL-2, VAL-8.

### C-11: Deterministic Serializer

- Kind: schema
- Purpose: Own canonical JSON ordering and byte stability.
- Owner: Markdown Trace
- Consumers: C-1, C-4, tests
- Lifecycle/stability: Internal.
- Source IDs: REQ-2, REQ-7, CON-4
- Existing interface relationship: Mirrors existing deterministic CLI testing discipline without changing IF-6.
- Preconditions: C-4 result has been projected.
- Postconditions: JSON string is byte-stable for identical inputs, options, package version, and runtime version.
- Invariants: Does not sort by localized collation or non-deterministic object insertion order.
- Inputs: C-4 result.
- Outputs: JSON string.
- Error model: Serialization errors are operational failures.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Canonical field order and array order are mandatory.
- Versioning/compatibility: Serializer changes that alter bytes require snapshot updates and review.
- Observability: Snapshot hash in tests.
- Validation evidence: VAL-4.

### C-12: Candidate Artifact IO

- Kind: API
- Purpose: Resolve paths, read source files, and write requested generated artifacts.
- Owner: Markdown Trace
- Consumers: C-1, C-2
- Lifecycle/stability: Internal.
- Source IDs: REQ-5, REQ-6
- Existing interface relationship: Extends existing CLI write-output behavior.
- Preconditions: Caller provides cwd, input path, and optional output path.
- Postconditions: Source file is read but never written; output file is written only when requested.
- Invariants: Input document path and output path are distinct operations; no source rewrite path exists.
- Inputs: cwd, document path, output path, output content.
- Outputs: file content, write result, diagnostics.
- Error model: Read/write errors map to stable diagnostic codes and CLI exit `2`.
- Authorization/tenancy: None beyond local filesystem permissions.
- Idempotency/retry/ordering: Repeated writes to the same output path replace generated artifact content only.
- Versioning/compatibility: Internal; failure message changes require diagnostic snapshot review.
- Observability: Output path and input hash in tests.
- Validation evidence: VAL-6.

### C-13: Authoritative Compatibility Guard

- Kind: API
- Purpose: Keep candidate discovery from changing authoritative registry, graph, validation, and R1 link-backed behavior.
- Owner: Markdown Trace
- Consumers: Maintainers and tests
- Lifecycle/stability: Internal gate.
- Source IDs: REQ-8, CON-2, CON-3
- Existing interface relationship: Tolerates IF-4, IF-5, IF-6, and IF-8 as existing owned-risky interfaces.
- Preconditions: Candidate implementation is present.
- Postconditions: Existing `validate`, `derive`, R1 link-backed graph, and registry tests pass unchanged.
- Invariants: Candidate code path does not modify `EntityRegistry`, `TraceGraph`, or R1 type-profile semantics.
- Inputs: Existing fixtures and tests.
- Outputs: Regression test evidence.
- Error model: Any regression is a blocking implementation failure.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Existing tests remain deterministic.
- Versioning/compatibility: Existing public behavior changes require separate design approval.
- Observability: Test results and fixture output snapshots.
- Validation evidence: VAL-9.

Section status: Complete

## 6. State, Fault, and Misuse Contracts

| Case ID | State/fault/misuse case | Owning contract | Expected behavior | Validation |
| --- | --- | --- | --- | --- |
| Fault-1 | Missing or unreadable input path | C-1, C-12 | CLI exits `2` with `candidate.source.read_failed`; source remains unchanged. | VAL-5, VAL-6 |
| Fault-2 | Engine parse or normalize diagnostics | C-7, C-8 | Diagnostics are included in C-4 or escalate to CLI exit `2` only when artifact production is impossible. | VAL-5, VAL-7 |
| Fault-3 | Duplicate ID definitions | C-5, C-7, C-9 | Candidate node records remain deterministic and diagnostics identify the conflict. | VAL-5 |
| Fault-4 | Unresolved table reference target | C-6, C-7, C-9 | Edge is unresolved or omitted according to C-6, and diagnostic identifies the target label. | VAL-2, VAL-5 |
| Fault-5 | Unsupported table shape | C-7, C-9 | Discovery continues for recognized IDs and emits unsupported-shape diagnostics. | VAL-5 |
| Fault-6 | Output write failure | C-2, C-12 | CLI exits `2`; source document remains unchanged. | VAL-5, VAL-6 |
| Misuse-1 | User treats candidates as authority | C-4, C-5, C-6, C-10 | JSON and graph output use candidate/inferred status and never claim validation authority. | VAL-3, VAL-8 |
| Misuse-2 | User expects trace-link promotion | C-1, C-2, C-13 | Commands stay read-only and help text keeps promotion out of scope. | VAL-6, VAL-9 |

Section status: Complete

## 7. Compatibility and Migration Notes

| Contract ID | Compatibility rule | Migration/backfill | Rollback constraint | Deprecation plan |
| --- | --- | --- | --- | --- |
| C-1 | Additive CLI command; existing command flags unchanged. | None. | Remove command routing if needed. | None for first release. |
| C-2 | Additive CLI command; supported formats are explicit. | None. | Remove command routing and generated artifacts if needed. | None for first release. |
| C-3 | Internal options may add optional fields. | None. | Revert option additions. | Custom profile support deferred under Q-1. |
| C-4 | Breaking schema changes require new `schemaVersion`. | None. | Delete generated candidate artifacts. | v0 remains until a replacement version is designed. |
| C-5 | Required node and mention fields remain stable within C-4 v0. | None. | Delete generated candidate artifacts. | None. |
| C-6 | Required edge fields remain stable within C-4 v0. | None. | Delete generated candidate artifacts. | None. |
| C-7 | Diagnostic codes remain stable or receive aliases. | None. | Revert diagnostic code changes. | Deprecated codes require compatibility aliases. |
| C-8 | Engine major-version changes require adapter review. | None. | Revert dependency or adapter change. | None. |
| C-9 | Internal service can change if C-4 compatibility holds. | None. | Remove candidate command path. | None. |
| C-10 | New visual formats are additive. | None. | Remove format from CLI help and tests. | None. |
| C-11 | Byte changes require snapshot review. | None. | Revert serializer change. | None. |
| C-12 | IO behavior cannot write source Markdown. | None. | Remove offending write path. | None. |
| C-13 | Existing authoritative behavior remains the launch gate. | None. | Block release until regression is reverted. | None. |

Section status: Complete

## 8. Validation and Review Plan

| Validation ID | Contract IDs | Method | Evidence required | Owner |
| --- | --- | --- | --- | --- |
| VAL-1 | C-1, C-3, C-8, C-9 | contract test | `discover` emits C-4 JSON for headings, tables, and prose ID families. | Markdown Trace maintainer |
| VAL-2 | C-2, C-6, C-10 | contract test | `graph-candidates` renders Mermaid or HTML from document input and candidate JSON input. | Markdown Trace maintainer |
| VAL-3 | C-4, C-5, C-6, C-7 | schema check | Snapshot proves schema version, authority, status, provenance, confidence, and diagnostics fields. | Markdown Trace maintainer |
| VAL-4 | C-1, C-4, C-11 | contract test | Repeated discovery produces byte-identical JSON. | Markdown Trace maintainer |
| VAL-5 | C-6, C-7, C-9, C-12 | contract test | Duplicate, unresolved, unsupported table, read failure, and write failure fixtures produce stable diagnostics. | Markdown Trace maintainer |
| VAL-6 | C-1, C-2, C-12, C-13 | contract test | Input file hash is identical before and after discovery and graph export. | Markdown Trace maintainer |
| VAL-7 | C-8, C-9 | inspection | Imports use package-root `@jasonbelmonti/markdown-engine` APIs only. | markdown-engine contract reviewer |
| VAL-8 | C-2, C-6, C-10 | manual review | Mermaid or HTML output visibly labels candidate status, inferred edges, and confidence. | Graph UX reviewer |
| VAL-9 | C-1, C-2, C-13 | regression test | Existing CLI, R1 link-backed graph, registry, and validation tests pass unchanged. | Markdown Trace maintainer |
| VAL-10 | C-3, C-8, C-9, C-11 | performance test | Generated 10,000-line Markdown fixture completes within 5 seconds under documented conditions. | Markdown Trace maintainer |

Section status: Complete

## 9. Traceability Matrix

| Source ID | Contract IDs | Acceptance/validation IDs | Notes |
| --- | --- | --- | --- |
| REQ-1 | C-1, C-3, C-5, C-8, C-9 | VAL-1, VAL-7 | Discovery contract covers configured ID families and engine adapter boundary. |
| REQ-2 | C-1, C-4, C-5, C-6, C-7, C-11 | VAL-3, VAL-4 | Candidate JSON is the canonical machine artifact. |
| REQ-3 | C-4, C-5, C-6, C-10 | VAL-3, VAL-8 | Non-authority appears in data and graph outputs. |
| REQ-4 | C-6, C-9 | VAL-2, VAL-5 | Edge inference remains tied to table evidence. |
| REQ-5 | C-1, C-2, C-7, C-9, C-12 | VAL-5 | Diagnostics define degraded behavior and operational failures. |
| REQ-6 | C-1, C-2, C-12, C-13 | VAL-6, VAL-9 | Read-only behavior and compatibility are launch gates. |
| REQ-7 | C-4, C-11 | VAL-4 | Byte-stable JSON is serializer-owned. |
| REQ-8 | C-13 | VAL-9 | Authoritative behavior remains isolated. |
| REQ-9 | C-2, C-10 | VAL-2, VAL-8 | Human-readable graph export is a first-class contract. |
| REQ-10 | C-3, C-8, C-9, C-11 | VAL-10 | Performance bound applies to default-family discovery. |
| CON-1 | C-8 | VAL-7 | Adapter contains engine dependency. |
| CON-2 | C-4, C-5, C-6, C-13 | VAL-3, VAL-9 | Candidate schema does not overload registry or graph schemas. |
| CON-3 | C-1, C-2, C-12, C-13 | VAL-6, VAL-9 | No source mutation path exists. |
| CON-4 | C-11 | VAL-4 | Deterministic serialization is explicit. |
| CON-5 | C-8, C-9, C-13 | VAL-7, VAL-9 | No remote dependency contracts exist. |
| ASM-1 | C-3, C-9 | VAL-1, VAL-2 | Defaults are validated before custom profile work. |
| ASM-2 | C-8, C-9 | VAL-1, VAL-7 | Engine normalized structure supports provenance. |
| Q-1 | C-3 | VAL-1, VAL-2 | Profile extension remains reserved, not required. |

Section status: Complete

## 10. Open Questions

| Question ID | Question | Owner | Due date or decision point | Impact if unresolved |
| --- | --- | --- | --- | --- |
| Q-1 | Should custom ID-family profiles be included in the first release? | Project owner | After first fixture implementation and one real-doc run | Default-only discovery ships first; unsupported families are diagnostics rather than blockers. |

Section status: Complete

## 11. In-Situ Evaluation

### Grounding Evidence

| Evidence ID | Source | Tool/source type | What was inspected | Relevant contracts |
| --- | --- | --- | --- | --- |
| EVD-1 | `docs/design/markdown-trace-candidate-graph-design-spec.md` | docs | R2 source requirements, mechanisms, schemas, rollout, rollback, and validation gates. | C-1 through C-13 |
| EVD-2 | `package.json` | code search | Node package type, binary entry, dependency on `@jasonbelmonti/markdown-engine@2.0.0`, and existing test/build scripts. | C-1, C-2, C-8, C-13 |
| EVD-3 | `src/markdowntrace/cli.ts` | code search | Current `validate` and `derive` command parsing, output writing, exit code handling, and environment injection. | C-1, C-2, C-12, C-13 |
| EVD-4 | `src/markdowntrace/registry/model.ts` | code search | `EntityRegistry`, `RegistryEntity`, duplicate ID/label invariants, and registry load errors. | C-4, C-5, C-6, C-13 |
| EVD-5 | `src/markdowntrace/graph/model.ts` | code search | Existing `TraceGraph` node and edge shape. | C-10, C-13 |
| EVD-6 | `src/markdowntrace/registry/derived.ts` | code search | Existing engine API usage, trace-link derivation, heading fallback, and registry projection path. | C-8, C-9, C-13 |
| EVD-7 | `tests/test_cli.test.ts` | test | Existing CLI output, temporary output writing, incomplete argument failure, and R1 derivation CLI behavior. | C-1, C-2, C-12, C-13 |
| EVD-8 | `tests/test_r1_link_backed_graph.test.ts` | test | R1 link-backed graph expectations, duplicate handling, missing reference rejection, and range behavior. | C-13 |
| EVD-9 | `src/markdowntrace/index.ts` | code search | Current public export aggregation. | C-3 through C-11 |

### Rubric Scores

| Axis | Score | Evidence IDs | Finding IDs | Notes |
| --- | --- | --- | --- | --- |
| Behavioral fitness | Pass | EVD-1, EVD-3, EVD-7 | none | Contracts cover discovery, graph export, diagnostics, and compatibility workflows. |
| Consumer fitness | Pass | EVD-1, EVD-3, EVD-7 | FND-1 | Graph export accepts document input directly, avoiding mandatory two-step UX. |
| Integration realism | Pass | EVD-2, EVD-3, EVD-6 | none | Engine usage is isolated and existing CLI extension points are owned-changeable. |
| Change safety | Pass | EVD-3, EVD-4, EVD-5, EVD-8 | none | Candidate schemas are separate from authoritative registry and graph schemas. |
| Failure semantics | Pass | EVD-3, EVD-7, EVD-8 | none | Diagnostics and exit behavior are assigned to CLI and schema contracts. |
| Data and invariant protection | Pass | EVD-1, EVD-4, EVD-5 | none | Candidate IDs, status, confidence, and source evidence avoid registry authority leakage. |
| Operational fitness | Pass | EVD-1, EVD-3, EVD-7 | none | Signals are CLI-local: exit code, counts, diagnostics, schema version, and hashes. |
| Security and trust handling | Pass | EVD-1, EVD-2, EVD-3 | none | No auth, secrets, tenancy, network, browser, database, MCP, or LLM boundary exists. |
| Testability | Pass | EVD-7, EVD-8 | none | Contract tests, snapshots, inspection, regression tests, and manual graph review are defined. |
| Implementation proportionality | Pass | EVD-2, EVD-3, EVD-6, EVD-9 | none | Interfaces are limited to real CLI, schema, adapter, exporter, and compatibility boundaries. |

### Evaluation Findings

| Finding ID | Severity | Axis | Affected contracts | Evidence IDs | Required action | Validation target |
| --- | --- | --- | --- | --- | --- | --- |
| FND-1 | Minor | Consumer fitness | C-2, C-10 | EVD-1, EVD-3 | Resolved in this packet: `graph-candidates` supports direct `--document` input as well as `--input` candidate JSON. | VAL-2, VAL-8 |

Section status: Complete

## Internal Review Record

- Contract depth calibration: `ID2` matches the source `R2` design spec. The packet defines implementation-ready CLI, schema, adapter, export, diagnostics, serialization, and compatibility contracts.
- Grounding result: Grounded against current package metadata, CLI implementation, registry model, graph model, registry derivation, public exports, CLI tests, and R1 link-backed graph tests.
- Rubric result: Pass across all axes after resolving FND-1.
- Findings addressed: FND-1 resolved by shaping graph export around the user workflow rather than requiring candidate JSON as an intermediate file.
- Validation result: Supersession structural validation passed with `@jasonbelmonti/markdown-engine@2.0.0` and `interface-design-validation-profile.yaml`; no diagnostics were reported. Evidence input hash before this review-record update was `2fab4647a826f18715ee195e028dc7d5ccb4f80feb877b0d253fe3c0c79fbb2d`.
- Remaining findings: None.
- Readiness verdict: Superseded; not the implementation-planning authority.
