# Markdown Trace Durable Markdown Authoring Interface Design Packet

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Durable Markdown Authoring Interface Design Packet |
| Contract depth | `ID2` |
| Source authority | `docs/design/markdown-trace-durable-markdown-authoring-design-spec.md` |
| Author | Codex |
| Reviewers | Project owner; Markdown Trace maintainer; markdown-engine contract reviewer; graph UX reviewer; agent authoring workflow reviewer |
| Last updated | 2026-06-03 |
| Related design/spec/tickets | `docs/design/markdown-trace-durable-markdown-authoring-revision-overview.md`; `docs/design/markdown-trace-durable-markdown-authoring-design-spec.md`; no related tickets |

## 0. Executive Contract Summary

- Decision requested: Approve implementation-facing contracts for durable Markdown authoring, repair, graph delta, revalidation, and controlled write modes.
- Source design summary: Markdown Trace will become a read/write durable Markdown control layer where agents write through profiles, incoherence becomes diagnostics, repairs become evidence-linked packets or patches, and output becomes durable only after revalidation.
- Highest-risk boundaries: Local filesystem mutation, draft-versus-validated authority state, repair confidence, existing CLI compatibility, `markdown-engine` dependency boundary, and graph/diff UX state labeling.
- Implementation slice covered: CLI commands, authoring profile schema, authoring intent schema, draft result schema, incoherence diagnostics, repair packet, patch plan, graph delta, durability validation result, engine adapter, artifact IO, serializer, and compatibility guard.
- Out of scope: Network services, LLM runtime integration, browser automation, MCP, graph database storage, silent mutation, and automatic authority promotion.
- Section status: Complete

## 1. Source Requirements and Assumptions

| ID | Statement | Source | Impact on contracts |
| --- | --- | --- | --- |
| REQ-1 | Read local Markdown and produce trace evidence. | Design spec section 5 | Requires C-8, C-13, and C-14. |
| REQ-2 | Emit schema-versioned diagnostic and graph-delta artifacts. | Design spec section 5 | Requires C-8, C-11, C-12, and C-16. |
| REQ-3 | Define authoring profiles. | Design spec section 5 | Requires C-5 and C-14. |
| REQ-4 | Generate Markdown drafts from intent and profile. | Design spec section 5 | Requires C-1, C-6, C-7, and C-14. |
| REQ-5 | Classify incoherence into actionable categories. | Design spec section 5 | Requires C-8 and C-14. |
| REQ-6 | Produce evidence-linked repair packets. | Design spec section 5 | Requires C-2, C-9, C-10, and C-14. |
| REQ-7 | Keep draft, candidate, repaired, validated, unresolved, and failed states distinct. | Design spec section 5 | Requires C-7, C-9, C-11, C-12, and C-17. |
| REQ-8 | Expose author, repair, graph-delta, and revalidate flows with explicit write modes. | Design spec section 5 | Requires C-1, C-2, C-3, C-4, and C-15. |
| REQ-9 | Refuse existing-file mutation without apply mode and reversible evidence. | Design spec section 5 | Requires C-15 and C-17. |
| REQ-10 | Produce deterministic artifacts. | Design spec section 5 | Requires C-16. |
| REQ-11 | Preserve validate and derive behavior. | Design spec section 5 | Requires C-17. |
| REQ-12 | Render graph and diff view with state and change labels. | Design spec section 5 | Requires C-3 and C-11. |
| REQ-13 | Complete read-diagnose-repair planning within 10 seconds for a 10,000-line document. | Design spec section 5 | Requires C-13, C-14, and C-16. |
| CON-1 | Use only public `@jasonbelmonti/markdown-engine` package-root APIs. | Design spec section 4 | C-13 contains engine access. |
| CON-2 | Source changes require explicit writer or repair command with reviewable or reversible evidence. | Design spec section 4 | C-15 owns write safety. |
| CON-3 | Generated Markdown is not durable until profile and trace gates pass. | Design spec section 4 | C-12 owns durability state. |
| CON-4 | Every repair proposal references diagnostics, source ranges, graph deltas, or validation targets. | Design spec section 4 | C-9 and C-10 own repair evidence. |
| Q-1 | Decide whether custom authoring profiles ship first. | Design spec section 18 | C-5 reserves profile extension. |
| Q-2 | Decide whether direct `--apply` ships first. | Design spec section 18 | C-15 defaults to patch-first. |
| Q-3 | Decide first-class artifact family. | Design spec section 18 | C-5 can start with design spec profile. |

Section status: Complete

## 2. Problem-Space Model

### Existing Interface Constraints

| Interface | Kind | Owner | Mutability | Quality/completeness | Known consumers | Constraint or opportunity |
| --- | --- | --- | --- | --- | --- | --- |
| IF-1 Existing `main(argv, environment)` CLI entry | API | Markdown Trace | owned-changeable | partial and test-covered | CLI tests, package bin | Extend command parsing without regressing `validate` and `derive`. |
| IF-2 `markdown-trace` package exports | API | Markdown Trace | owned-changeable | partial | Local tests, future package users | Add focused authoring exports without provider-wide service objects. |
| IF-3 `@jasonbelmonti/markdown-engine` package-root APIs | SDK | markdown-engine | fixed for this effort | strong enough by adoption evidence | Registry derivation, authoring reader | Use only public parse, normalize, and query APIs. |
| IF-4 `EntityRegistry` | schema | Markdown Trace | owned-risky | strong and behaviorally tested | Validation, graph derivation, R1 fixtures | Do not overload for draft, candidate, or repair states. |
| IF-5 `TraceGraph` | schema | Markdown Trace | owned-risky | simple and behaviorally tested | Graph derivation, CLI output tests | Keep graph delta separate from authoritative graph projection. |
| IF-6 Existing `derive` and `validate` CLI output | file | Markdown Trace | owned-risky | test-covered | CLI users and tests | Preserve current command behavior. |
| IF-7 Local filesystem behavior | file | User environment | fixed | operating-system controlled | CLI commands | Read source, write generated artifacts, and apply only with explicit reversible evidence. |
| IF-8 R1 link-backed type profile contract | config | Markdown Trace | owned-risky | test-covered | R1 derivation | Keep separate from authoring profiles. |

### Actors and Systems

| Actor/System | Role | Trust level | Contract needs |
| --- | --- | --- | --- |
| CLI user | Runs authoring, repair, graph-delta, and revalidation locally. | Trusted local operator | Explicit modes, diagnostics, patch previews, and rollback evidence. |
| Agent author | Generates drafts or repair intents. | Trusted but fallible local producer | Structural rails, profile validation, and feedback artifacts. |
| Implementation agent | Consumes packets and validation results. | Trusted local consumer | Stable schemas and deterministic ordering. |
| Graph reviewer | Reviews before/after trace structure. | Trusted local reviewer | State labels, graph deltas, and unresolved markers. |
| Markdown Trace maintainer | Owns package boundaries and compatibility. | Internal owner | Additive contracts and regression gates. |
| markdown-engine | Provides Markdown parse/query structure. | External package dependency | Narrow adapter contract using public APIs. |
| Local filesystem | Supplies source and receives artifacts. | Fixed environment | Explicit read/write boundary and apply safety. |

### Capabilities

| Capability | Command/query/event | Owner | Consumers | Notes |
| --- | --- | --- | --- | --- |
| Author durable draft | Command | Markdown Trace | CLI user, agent author | Emits Markdown and C-7 draft result. |
| Diagnose incoherence | Query | Markdown Trace | CLI user, agent author | Produces C-8 diagnostics and trace evidence. |
| Plan repair | Command/query | Markdown Trace | CLI user, agent author, reviewer | Produces C-9 and C-10. |
| Render graph delta | Query | Markdown Trace | Graph reviewer | Produces C-11. |
| Revalidate durability | Query | Markdown Trace | CLI user, agent author | Produces C-12. |
| Apply controlled write | Command | Markdown Trace | CLI user | Uses C-15 with backup or reversible evidence. |
| Preserve authoritative behavior | Test gate | Markdown Trace | Maintainer | Uses C-17. |

### Domain Vocabulary

| Term | Definition | Invariants | Non-examples |
| --- | --- | --- | --- |
| Authoring profile | A contract for required Markdown structure, ID policy, trace policy, and durability gates. | Does not replace R1 type profile. | Free-form prompt |
| Authoring intent | Structured input describing the target document content and purpose. | Not trusted until rendered and validated. | Raw LLM prose |
| Draft result | Metadata for generated Markdown before durability gates pass. | State is `draft` or `failed`. | Validated registry |
| Incoherence diagnostic | Structural or trace problem that blocks or weakens durability. | Has category, severity, source evidence, and repairability. | Generic exception |
| Repair packet | Evidence-linked proposal to repair incoherence. | References diagnostics and validation targets. | Silent rewrite |
| Patch plan | Deterministic representation of file changes. | Includes input hash and write mode. | Direct untracked file overwrite |
| Graph delta | Before/after trace change artifact. | Labels states and change types. | Authoritative trace graph |
| Durability validation result | State label and gate evidence for a draft or repaired document. | Does not assert registry authority unless authoritative gates pass. | Candidate graph alone |

Section status: Complete

## 3. Boundary Map

| Boundary | Owner | Consumers | Direction | Stability | Reason to exist |
| --- | --- | --- | --- | --- | --- |
| CLI ingress boundary | Markdown Trace | CLI users and agents | User to package | external | Parse commands, modes, paths, and output format. |
| Authoring profile boundary | Markdown Trace | Writer, repair planner, revalidator | Profile to authoring domain | internal-to-public | Keep structural rules explicit and reusable. |
| Draft/repair state boundary | Markdown Trace | Agents, reviewers, graph UX | Authoring domain to consumers | public | Prevent false durability or false authority. |
| Engine adapter boundary | Markdown Trace | Reader and classifier | markdown-engine to Markdown Trace | internal | Contain public engine dependency. |
| Filesystem write boundary | Markdown Trace | CLI commands | Package to local filesystem | fixed | Control patch, new file, and apply behavior. |
| Graph/diff boundary | Markdown Trace | Reviewers and agents | Repair evidence to visual artifact | external | Make incoherence and repairs inspectable. |
| Authoritative compatibility boundary | Markdown Trace | Existing users and tests | Existing commands to package | owned-risky | Protect `validate`, `derive`, and R1 fixtures. |

Section status: Complete

## 3A. Integration Strategy

| Existing interface | Proposed response | Adapter/translator contract | Upstream change needed | Validation required |
| --- | --- | --- | --- | --- |
| IF-1 Existing CLI entry | extend | C-1, C-2, C-3, C-4 | no | VAL-1, VAL-2, VAL-6, VAL-12 |
| IF-2 Package exports | extend | C-5 through C-16 | no | VAL-3, VAL-4, VAL-12 |
| IF-3 markdown-engine APIs | wrap | C-13 | no | VAL-11 |
| IF-4 `EntityRegistry` | tolerate and isolate | C-12, C-17 | no | VAL-10, VAL-12 |
| IF-5 `TraceGraph` | tolerate and isolate | C-11, C-17 | no | VAL-8, VAL-12 |
| IF-6 Existing CLI output | tolerate | C-17 | no | VAL-12 |
| IF-7 Local filesystem | validate and control | C-10, C-15 | no | VAL-6, VAL-9 |
| IF-8 R1 type profile | tolerate and isolate | C-5, C-17 | no | VAL-12 |

Section status: Complete

## 4. Contract Inventory

| Contract ID | Name | Kind | Owner | Consumers | Stability | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| C-1 | Author CLI Command | API | Markdown Trace | CLI users, agent authors, tests | public | REQ-3, REQ-4, REQ-8 |
| C-2 | Repair CLI Command | API | Markdown Trace | CLI users, agent authors, reviewers, tests | public | REQ-5, REQ-6, REQ-8, REQ-9 |
| C-3 | Graph Delta CLI Command | API | Markdown Trace | Graph reviewers, tests | public | REQ-2, REQ-12 |
| C-4 | Revalidate CLI Command | API | Markdown Trace | CLI users, agent authors, tests | public | REQ-7, REQ-8 |
| C-5 | Authoring Profile | schema | Markdown Trace | C-1, C-2, C-4, C-14 | public | REQ-3, Q-1, Q-3 |
| C-6 | Authoring Intent | schema | Markdown Trace | C-1, C-14 | public | REQ-4 |
| C-7 | Draft Result | schema | Markdown Trace | C-1, C-4, agents | public | REQ-4, REQ-7 |
| C-8 | Trace Evidence and Incoherence Diagnostics | schema | Markdown Trace | C-2, C-4, C-9, C-11 | public | REQ-1, REQ-2, REQ-5 |
| C-9 | Repair Packet | schema | Markdown Trace | C-2, C-10, reviewers | public | REQ-6, REQ-7 |
| C-10 | Patch Plan | schema | Markdown Trace | C-2, C-15, reviewers | public | REQ-6, REQ-8, REQ-9 |
| C-11 | Graph Delta | schema | Markdown Trace | C-3, C-9, reviewers | public | REQ-2, REQ-12 |
| C-12 | Durability Validation Result | schema | Markdown Trace | C-4, agents, reviewers | public | REQ-7 |
| C-13 | Engine Document Adapter | port | Markdown Trace | C-14 | internal | REQ-1, CON-1 |
| C-14 | Durable Markdown Authoring Service | port | Markdown Trace | C-1, C-2, C-4, library consumers | internal | REQ-1 through REQ-7 |
| C-15 | Artifact IO and Apply Controller | API | Markdown Trace | C-1, C-2, C-10 | internal | REQ-8, REQ-9 |
| C-16 | Deterministic Serializer | schema | Markdown Trace | C-1 through C-12, tests | internal | REQ-10 |
| C-17 | Authoritative Compatibility Guard | API | Markdown Trace | Maintainers, tests | internal | REQ-11, CON-5 |

Section status: Complete

## 5. Materialized Contracts

### C-1: Author CLI Command

- Kind: API
- Purpose: Generate Markdown drafts from structured intent and an authoring profile.
- Owner: Markdown Trace
- Consumers: CLI users, agent authors, tests
- Lifecycle/stability: Public additive CLI surface.
- Source IDs: REQ-3, REQ-4, REQ-8
- Existing interface relationship: Extends IF-1 without changing existing commands.
- Preconditions: Profile and intent are provided as files or stdin-supported JSON in a later slice.
- Postconditions: Markdown draft and C-7 metadata are emitted without modifying existing files unless a new output path is selected.
- Invariants: Output state is draft until C-12 passes.
- Inputs: `author --profile <path> --intent <path> [--output <path>] [--result <path>]`.
- Outputs: Markdown draft, C-7 draft result, diagnostics, exit code.
- Error model: Exit `0` when draft is produced; exit `2` for invalid profile, invalid intent, read failure, or write failure.
- Authorization/tenancy: None; local operator controls filesystem.
- Idempotency/retry/ordering: Identical inputs produce deterministic draft and result artifacts.
- Versioning/compatibility: Additive command; profile schema version governs behavior.
- Observability: State, diagnostics, schema version, output path, and snapshot hash in tests.
- Validation evidence: VAL-1, VAL-2, VAL-6.

```text
markdown-trace author --profile <profile.json> --intent <intent.json> --output <draft.md> --result <draft.json>
```

### C-2: Repair CLI Command

- Kind: API
- Purpose: Diagnose Markdown and emit repair packets, patch plans, patch files, or explicit apply results.
- Owner: Markdown Trace
- Consumers: CLI users, agent authors, reviewers, tests
- Lifecycle/stability: Public additive CLI surface.
- Source IDs: REQ-5, REQ-6, REQ-8, REQ-9
- Existing interface relationship: Extends IF-1 and wraps C-9, C-10, and C-15.
- Preconditions: Markdown path and profile are available.
- Postconditions: Repair packet and optional patch plan are emitted; input Markdown is unchanged unless apply mode is explicit and reversible evidence is recorded.
- Invariants: Repair packet cites diagnostics and validation targets.
- Inputs: `repair --document <path> --profile <path> [--packet <path>] [--patch <path>] [--apply]`.
- Outputs: C-9, C-10, diagnostics, optional patch, optional apply result, exit code.
- Error model: Exit `0` when repair planning completes with actionable repair output and no unresolved durability blockers; exit `1` when repair planning emits a packet or patch but the result remains unresolved or non-durable; exit `2` for operational failure.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Repair packet and patch plan are deterministic for identical inputs.
- Versioning/compatibility: Patch-first behavior is default; direct apply can be withheld under Q-2.
- Observability: Repair confidence, unresolved item count, input hash, backup path, and diagnostic counts.
- Validation evidence: VAL-3, VAL-4, VAL-5, VAL-6, VAL-9.

### C-3: Graph Delta CLI Command

- Kind: API
- Purpose: Render before/after trace and diff state for repair review.
- Owner: Markdown Trace
- Consumers: Graph reviewers, tests
- Lifecycle/stability: Public additive CLI surface.
- Source IDs: REQ-2, REQ-12
- Existing interface relationship: Produces graph delta without changing IF-5.
- Preconditions: Before/after Markdown, patch plan, or graph evidence is available.
- Postconditions: Mermaid or HTML graph delta is emitted.
- Invariants: State and change labels remain visible.
- Inputs: `graph-delta --before <path> --after <path> --format mermaid|html [--output <path>]`.
- Outputs: C-11-backed graph artifact, diagnostics, exit code.
- Error model: Exit `0` on render; exit `2` for invalid inputs or write failure.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Identical inputs produce deterministic graph data.
- Versioning/compatibility: New formats are additive.
- Observability: Added, removed, changed, unresolved, repaired, and validated counts.
- Validation evidence: VAL-8.

### C-4: Revalidate CLI Command

- Kind: API
- Purpose: Evaluate whether a draft or repaired Markdown document is durable under a profile and trace policy.
- Owner: Markdown Trace
- Consumers: CLI users, agent authors, tests
- Lifecycle/stability: Public additive CLI surface.
- Source IDs: REQ-7, REQ-8
- Existing interface relationship: Complements but does not replace `validate`.
- Preconditions: Markdown path and profile are provided.
- Postconditions: C-12 result reports state and gate evidence.
- Invariants: Durable state requires profile and trace gates to pass.
- Inputs: `revalidate --document <path> --profile <path> [--output <path>]`.
- Outputs: C-12 result, diagnostics, exit code.
- Error model: Exit `0` when durable; exit `1` when non-durable with diagnostics; exit `2` for operational failure.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Revalidation result is deterministic.
- Versioning/compatibility: Existing registry `validate` remains unchanged.
- Observability: Gate status, state, diagnostics, and schema version.
- Validation evidence: VAL-7, VAL-10, VAL-12.

### C-5: Authoring Profile

- Kind: schema
- Purpose: Define the rails for agent-authored Markdown.
- Owner: Markdown Trace
- Consumers: C-1, C-2, C-4, C-14
- Lifecycle/stability: Public schema `markdown-trace.authoring-profile.v0`.
- Source IDs: REQ-3, Q-1, Q-3
- Existing interface relationship: Separate from IF-8 R1 type profiles.
- Preconditions: Profile validates before use.
- Postconditions: Writer, classifier, and revalidator receive explicit structure and trace rules.
- Invariants: Profiles define durability gates and cannot mark content durable alone.
- Inputs: JSON or YAML profile file.
- Outputs: Normalized profile.
- Error model: Invalid profile produces diagnostics and CLI exit `2`.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Normalization is deterministic.
- Versioning/compatibility: Breaking profile changes require new version.
- Observability: Profile ID and version appear in artifacts.
- Validation evidence: VAL-1.

```ts
interface AuthoringProfile {
  readonly schemaVersion: "markdown-trace.authoring-profile.v0";
  readonly id: string;
  readonly artifactFamily: "design-spec" | "execution-spec" | "task-definition" | "execution-brief";
  readonly requiredSections: readonly string[];
  readonly idFamilies: readonly string[];
  readonly tracePolicy: "optional" | "required" | "repairable";
  readonly durabilityGates: readonly string[];
}
```

### C-6: Authoring Intent

- Kind: schema
- Purpose: Carry structured source intent for draft generation.
- Owner: Markdown Trace
- Consumers: C-1, C-14
- Lifecycle/stability: Public schema `markdown-trace.authoring-intent.v0`.
- Source IDs: REQ-4
- Existing interface relationship: New schema; raw LLM prose is not the contract.
- Preconditions: Intent references a profile and contains required high-level fields.
- Postconditions: Writer has bounded content inputs for draft generation.
- Invariants: Intent is not durable evidence until rendered and validated.
- Inputs: JSON intent file.
- Outputs: Normalized intent.
- Error model: Invalid intent produces diagnostics and no draft.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Normalization is deterministic.
- Versioning/compatibility: Additive optional fields are allowed.
- Observability: Intent ID appears in C-7 provenance.
- Validation evidence: VAL-2.

### C-7: Draft Result

- Kind: schema
- Purpose: Record generated Markdown metadata before durability validation.
- Owner: Markdown Trace
- Consumers: C-1, C-4, agents
- Lifecycle/stability: Public schema `markdown-trace.draft-result.v0`.
- Source IDs: REQ-4, REQ-7
- Existing interface relationship: New schema; not `EntityRegistry`.
- Preconditions: Draft writer completed or failed.
- Postconditions: Result records state, profile, intent, output path, diagnostics, and validation hints.
- Invariants: State is `draft` or `failed`.
- Inputs: Writer output and diagnostics.
- Outputs: JSON result.
- Error model: Failed draft includes diagnostics and no durable state.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Deterministic field and array order.
- Versioning/compatibility: Breaking changes require new schema version.
- Observability: State, counts, profile ID, intent ID.
- Validation evidence: VAL-2, VAL-10.

### C-8: Trace Evidence and Incoherence Diagnostics

- Kind: schema
- Purpose: Represent read-side evidence and incoherence that blocks durability.
- Owner: Markdown Trace
- Consumers: C-2, C-4, C-9, C-11
- Lifecycle/stability: Public schema `markdown-trace.incoherence-diagnostic.v0`.
- Source IDs: REQ-1, REQ-2, REQ-5
- Existing interface relationship: Uses candidate graph evidence but does not claim registry authority.
- Preconditions: Markdown has been read through C-13.
- Postconditions: Diagnostics have category, severity, source, repairability, and related IDs.
- Invariants: Incoherence is explicit and not hidden by repair prose.
- Inputs: Engine document view, profile, trace links, ID families, table evidence.
- Outputs: Trace evidence and diagnostics.
- Error model: Categories include missing structure, broken trace, duplicate ID, unresolved reference, coverage gap, unsupported shape, and low-confidence repair.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Diagnostics sort by source order, severity, and code.
- Versioning/compatibility: Diagnostic codes remain stable or receive aliases.
- Observability: Counts by category and severity.
- Validation evidence: VAL-3.

### C-9: Repair Packet

- Kind: schema
- Purpose: Carry evidence-linked repair proposals.
- Owner: Markdown Trace
- Consumers: C-2, C-10, reviewers
- Lifecycle/stability: Public schema `markdown-trace.repair-packet.v0`.
- Source IDs: REQ-6, REQ-7
- Existing interface relationship: New schema; not an applied change.
- Preconditions: Incoherence diagnostics exist.
- Postconditions: Packet references diagnostics, proposed changes, rationale, confidence, unresolved items, validation targets, and graph delta.
- Invariants: Every proposed change is tied to evidence or marked low confidence.
- Inputs: C-8 diagnostics, source ranges, profile, repair options.
- Outputs: Repair packet JSON.
- Error model: Low-confidence or incomplete repairs remain unresolved.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Proposed changes sort by source range and diagnostic ID.
- Versioning/compatibility: Breaking schema changes require new version.
- Observability: Confidence distribution and unresolved count.
- Validation evidence: VAL-4, VAL-10.

### C-10: Patch Plan

- Kind: schema
- Purpose: Represent deterministic reviewable Markdown changes before file mutation.
- Owner: Markdown Trace
- Consumers: C-2, C-15, reviewers
- Lifecycle/stability: Public schema `markdown-trace.patch-plan.v0`.
- Source IDs: REQ-6, REQ-8, REQ-9
- Existing interface relationship: Contains C-15 write behavior.
- Preconditions: Repair packet exists and target input hash is known.
- Postconditions: Patch can be rendered or applied with reversible evidence.
- Invariants: Existing-file apply requires input hash and backup or patch evidence.
- Inputs: Repair packet, original source, target path.
- Outputs: Patch plan JSON and optional unified patch text.
- Error model: Stale input hash or hunk mismatch blocks apply.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Hunk order is deterministic by source range.
- Versioning/compatibility: Breaking schema changes require new version.
- Observability: Input hash, hunk count, target path, backup path when applied.
- Validation evidence: VAL-5, VAL-6, VAL-9.

### C-11: Graph Delta

- Kind: schema
- Purpose: Make before/after trace structure visible.
- Owner: Markdown Trace
- Consumers: C-3, C-9, reviewers
- Lifecycle/stability: Public schema `markdown-trace.graph-delta.v0`.
- Source IDs: REQ-2, REQ-12
- Existing interface relationship: New schema beside IF-5.
- Preconditions: Before and after evidence or patch plan exists.
- Postconditions: Added, removed, changed, unresolved, repaired, and validated graph elements are labeled.
- Invariants: Candidate and authoritative state remain distinct.
- Inputs: Before evidence, after evidence, repair packet, patch plan.
- Outputs: Graph delta JSON plus Mermaid or HTML.
- Error model: Missing before/after evidence emits diagnostics.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Nodes and edges sort deterministically.
- Versioning/compatibility: New visual fields are additive.
- Observability: Counts by state and change type.
- Validation evidence: VAL-8.

### C-12: Durability Validation Result

- Kind: schema
- Purpose: Declare whether output is draft, candidate, repaired, validated, unresolved, or failed.
- Owner: Markdown Trace
- Consumers: C-4, agents, reviewers
- Lifecycle/stability: Public schema `markdown-trace.durability-validation-result.v0`.
- Source IDs: REQ-7
- Existing interface relationship: Complements but does not replace authoritative registry validation.
- Preconditions: Profile and trace gates have run.
- Postconditions: Result states durability outcome and gate evidence.
- Invariants: Durable state requires all selected gates to pass.
- Inputs: Markdown, profile, trace evidence, repair evidence.
- Outputs: Validation result JSON.
- Error model: Failed or unresolved gates produce diagnostics.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Gate order follows profile order.
- Versioning/compatibility: Breaking schema changes require new version.
- Observability: State, gate results, diagnostics, schema version.
- Validation evidence: VAL-7, VAL-10.

### C-13: Engine Document Adapter

- Kind: port
- Purpose: Contain all `markdown-engine` dependency usage.
- Owner: Markdown Trace
- Consumers: C-14
- Lifecycle/stability: Internal.
- Source IDs: REQ-1, CON-1
- Existing interface relationship: Wraps IF-3.
- Preconditions: Markdown text and display path are available.
- Postconditions: Authoring service receives normalized document structure and diagnostics.
- Invariants: Imports come from package-root `@jasonbelmonti/markdown-engine`.
- Inputs: Markdown text, path.
- Outputs: Document view with sections, nodes, tables, text spans, links, source ranges, diagnostics.
- Error model: Engine diagnostics map to C-8.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Stable for identical engine output.
- Versioning/compatibility: Engine major-version changes require adapter review.
- Observability: Engine version in artifacts when available.
- Validation evidence: VAL-11, VAL-13.

### C-14: Durable Markdown Authoring Service

- Kind: port
- Purpose: Coordinate authoring, reading, incoherence classification, repair planning, graph delta, and revalidation.
- Owner: Markdown Trace
- Consumers: C-1, C-2, C-4, library consumers
- Lifecycle/stability: Internal with focused exports as needed.
- Source IDs: REQ-1 through REQ-7
- Existing interface relationship: New service beside authoritative derivation.
- Preconditions: Profile and inputs are normalized.
- Postconditions: C-7, C-8, C-9, C-11, or C-12 artifacts are produced.
- Invariants: Service never constructs `EntityRegistry` from draft or repair artifacts.
- Inputs: Intent, Markdown, profile, repair options, write mode.
- Outputs: Draft result, diagnostics, repair packet, graph delta, validation result.
- Error model: Recoverable incoherence becomes diagnostics; operational failure propagates to CLI.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Single-document deterministic pipeline.
- Versioning/compatibility: Public schemas are the compatibility surface.
- Observability: State, counts, profile ID, diagnostic categories.
- Validation evidence: VAL-1 through VAL-7, VAL-13.

### C-15: Artifact IO and Apply Controller

- Kind: API
- Purpose: Own path resolution, artifact writes, patch writes, and explicit apply safety.
- Owner: Markdown Trace
- Consumers: C-1, C-2, C-10
- Lifecycle/stability: Internal.
- Source IDs: REQ-8, REQ-9
- Existing interface relationship: Extends existing CLI write-output behavior with stronger apply controls.
- Preconditions: Caller supplies cwd, target path, write mode, and content or patch plan.
- Postconditions: Output artifacts are written or apply succeeds with reversible evidence.
- Invariants: Existing source mutation requires explicit apply mode, input hash check, and backup or patch evidence.
- Inputs: cwd, output path, patch plan, apply flag.
- Outputs: written artifact metadata, backup path, apply result.
- Error model: Stale hash, hunk mismatch, permission failure, or write failure blocks mutation.
- Authorization/tenancy: None beyond local filesystem permissions.
- Idempotency/retry/ordering: Patch writes are deterministic; apply is guarded by input hash.
- Versioning/compatibility: Internal; apply behavior requires tests before release.
- Observability: Target path, input hash, backup path, hunk count, exit code.
- Validation evidence: VAL-5, VAL-6, VAL-9.

### C-16: Deterministic Serializer

- Kind: schema
- Purpose: Own canonical ordering for JSON, Markdown draft metadata, repair packets, patch plans, and graph deltas.
- Owner: Markdown Trace
- Consumers: C-1 through C-12, tests
- Lifecycle/stability: Internal.
- Source IDs: REQ-10
- Existing interface relationship: Mirrors current deterministic CLI fixture discipline.
- Preconditions: Artifact result is projected.
- Postconditions: Output bytes are stable under identical conditions.
- Invariants: Sorting does not depend on object insertion order or localized collation.
- Inputs: Any authoring artifact.
- Outputs: JSON, Markdown, patch, Mermaid, or graph data string.
- Error model: Serialization failure is operational failure.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Canonical order is mandatory.
- Versioning/compatibility: Byte changes require snapshot review.
- Observability: Snapshot hash in tests.
- Validation evidence: VAL-2, VAL-4, VAL-5, VAL-13.

### C-17: Authoritative Compatibility Guard

- Kind: API
- Purpose: Keep authoring and repair from changing authoritative registry, graph, validation, and R1 link-backed behavior.
- Owner: Markdown Trace
- Consumers: Maintainers and tests
- Lifecycle/stability: Internal gate.
- Source IDs: REQ-11, CON-5
- Existing interface relationship: Tolerates IF-4, IF-5, IF-6, and IF-8 as existing owned-risky interfaces.
- Preconditions: Authoring implementation is present.
- Postconditions: Existing `validate`, `derive`, R1 link-backed graph, and registry tests pass unchanged.
- Invariants: Draft, repair, and durability schemas do not modify `EntityRegistry`, `TraceGraph`, or R1 type-profile semantics.
- Inputs: Existing fixtures and tests.
- Outputs: Regression test evidence.
- Error model: Any regression is a blocking implementation failure.
- Authorization/tenancy: None.
- Idempotency/retry/ordering: Existing tests remain deterministic.
- Versioning/compatibility: Existing public behavior changes require separate design approval.
- Observability: Test results and fixture output snapshots.
- Validation evidence: VAL-12.

Section status: Complete

## 6. State, Fault, and Misuse Contracts

| Case ID | State/fault/misuse case | Owning contract | Expected behavior | Validation |
| --- | --- | --- | --- | --- |
| State-1 | Intent becomes draft | C-1, C-5, C-6, C-7 | Authoring creates draft state and metadata, not durable state. | VAL-2, VAL-10 |
| State-2 | Draft becomes validated | C-4, C-12 | Revalidation moves state to validated only when gates pass. | VAL-7, VAL-10 |
| Fault-1 | Missing or invalid profile | C-1, C-5 | CLI exits `2` with profile diagnostics and no durable output. | VAL-1, VAL-6 |
| Fault-2 | Incoherence remains after repair | C-8, C-9, C-12 | Result remains unresolved and lists remaining diagnostics. | VAL-3, VAL-4, VAL-7 |
| Fault-3 | Stale patch input hash | C-10, C-15 | Apply is blocked before source mutation. | VAL-5, VAL-9 |
| Fault-4 | Write or apply failure | C-15 | CLI exits `2`, reports failure, and preserves backup or original content. | VAL-6, VAL-9 |
| Misuse-1 | User treats draft as durable | C-7, C-12 | State labels and diagnostics show draft is not durable. | VAL-7, VAL-10 |
| Misuse-2 | Agent invents unsupported trace relation | C-8, C-9, C-11 | Relation is low confidence or unresolved unless document evidence supports it. | VAL-3, VAL-4, VAL-8 |

Section status: Complete

## 7. Compatibility and Migration Notes

| Contract ID | Compatibility rule | Migration/backfill | Rollback constraint | Deprecation plan |
| --- | --- | --- | --- | --- |
| C-1 | Additive CLI command; existing flags unchanged. | None. | Disable command routing. | None for first release. |
| C-2 | Additive CLI command; patch-first default. | None. | Disable command routing and discard packets. | None for first release. |
| C-3 | Additive CLI command; formats explicit. | None. | Disable command routing. | None. |
| C-4 | Additive CLI command; does not replace `validate`. | None. | Disable command routing. | None. |
| C-5 | Breaking profile schema changes require new version. | None. | Revert profile schema version. | Deprecated profiles need aliases or migration notes. |
| C-6 | Additive intent fields are allowed. | None. | Revert intent schema. | None. |
| C-7 | Draft result v0 state fields remain stable. | None. | Delete generated artifacts. | None. |
| C-8 | Diagnostic codes remain stable or aliased. | None. | Revert diagnostic code changes. | Deprecated codes need aliases. |
| C-9 | Repair packet breaking changes require new version. | None. | Delete generated packets. | None. |
| C-10 | Patch plan requires target input hash. | None. | Discard patch plan. | None. |
| C-11 | Graph delta changes are additive unless schema version changes. | None. | Delete generated graph artifacts. | None. |
| C-12 | Durability state values require compatibility review. | None. | Revert state change. | Deprecated states need aliases. |
| C-13 | Engine major-version changes require adapter review. | None. | Revert adapter or dependency change. | None. |
| C-14 | Internal service can change if public schemas hold. | None. | Remove authoring command path. | None. |
| C-15 | Existing-file apply requires reversible evidence. | None. | Restore backup or reverse patch. | Direct apply can remain deferred. |
| C-16 | Byte changes require snapshot review. | None. | Revert serializer change. | None. |
| C-17 | Existing authoritative behavior remains the launch gate. | None. | Block release until regression is reverted. | None. |

Section status: Complete

## 8. Validation and Review Plan

| Validation ID | Contract IDs | Method | Evidence required | Owner |
| --- | --- | --- | --- | --- |
| VAL-1 | C-1, C-5, C-14 | contract test | Authoring profile enforces sections, IDs, trace policy, tables, and durability gates. | Markdown Trace maintainer |
| VAL-2 | C-1, C-6, C-7, C-16 | contract test | Draft fixture emits deterministic Markdown and C-7 metadata. | Markdown Trace maintainer |
| VAL-3 | C-8, C-13, C-14 | contract test | Incoherence fixture detects duplicates, unresolved refs, missing coverage, and unsupported tables. | Markdown Trace maintainer |
| VAL-4 | C-2, C-8, C-9, C-16 | contract test | Repair packet cites diagnostics, ranges, rationale, changes, confidence, unresolved items, and validation targets. | Markdown Trace maintainer |
| VAL-5 | C-2, C-9, C-10, C-11, C-15, C-16 | contract test | Patch plan and graph delta are deterministic and input-hash linked. | Markdown Trace maintainer |
| VAL-6 | C-1, C-2, C-10, C-15 | contract test | stdout, new file, patch output, and explicit apply modes behave according to contract. | Markdown Trace maintainer |
| VAL-7 | C-4, C-12, C-14 | contract test | Non-durable drafts and failed repairs cannot become validated state. | Markdown Trace maintainer |
| VAL-8 | C-3, C-11 | manual review | Graph/diff output visibly labels state and change types. | Graph UX reviewer |
| VAL-9 | C-10, C-15 | contract test | Apply records backup or reversible patch evidence before mutation. | Markdown Trace maintainer |
| VAL-10 | C-7, C-9, C-11, C-12 | contract test | State transitions and state labels are deterministic and schema-distinct. | Markdown Trace maintainer |
| VAL-11 | C-13, C-14 | inspection | Imports use public `@jasonbelmonti/markdown-engine` APIs and no forbidden dependencies are added. | markdown-engine contract reviewer |
| VAL-12 | C-1, C-2, C-3, C-4, C-17 | regression test | Existing CLI, registry, validation, derive, and R1 link-backed tests pass unchanged. | Markdown Trace maintainer |
| VAL-13 | C-13, C-14, C-16 | performance test | 10,000-line read-diagnose-repair planning completes within 10 seconds. | Markdown Trace maintainer |

Section status: Complete

## 9. Traceability Matrix

| Source ID | Contract IDs | Acceptance/validation IDs | Notes |
| --- | --- | --- | --- |
| REQ-1 | C-8, C-13, C-14 | VAL-3, VAL-11, VAL-13 | Reading evidence remains the instrumentation layer. |
| REQ-2 | C-8, C-11, C-12, C-16 | VAL-3, VAL-5, VAL-8 | Diagnostics and graph deltas feed repair loops. |
| REQ-3 | C-1, C-5, C-14 | VAL-1 | Profiles define writing rails. |
| REQ-4 | C-1, C-6, C-7, C-14 | VAL-2 | Drafts come from structured intent and profile. |
| REQ-5 | C-8, C-14 | VAL-3 | Incoherence categories are explicit. |
| REQ-6 | C-2, C-9, C-10, C-14 | VAL-4, VAL-5 | Repair packets and patches cite evidence. |
| REQ-7 | C-4, C-7, C-9, C-11, C-12, C-17 | VAL-7, VAL-10, VAL-12 | State distinction prevents false durability. |
| REQ-8 | C-1, C-2, C-3, C-4, C-15 | VAL-6, VAL-8, VAL-12 | CLI loop is explicit. |
| REQ-9 | C-10, C-15, C-17 | VAL-6, VAL-9, VAL-12 | Existing-file mutation is controlled. |
| REQ-10 | C-7, C-9, C-10, C-11, C-12, C-16 | VAL-2, VAL-4, VAL-5, VAL-10 | Determinism covers all artifacts. |
| REQ-11 | C-17 | VAL-12 | Authoritative behavior remains isolated. |
| REQ-12 | C-3, C-11 | VAL-8 | Visual state and change labels are required. |
| REQ-13 | C-13, C-14, C-16 | VAL-13 | Performance applies to planning path. |
| CON-1 | C-13 | VAL-11 | Engine dependency is contained. |
| CON-2 | C-10, C-15 | VAL-6, VAL-9 | Write safety is explicit. |
| CON-3 | C-12 | VAL-7, VAL-10 | Durability gates own state promotion. |
| CON-4 | C-8, C-9, C-10, C-11 | VAL-4, VAL-5 | Repair evidence is mandatory. |
| CON-5 | C-7, C-9, C-12, C-17 | VAL-10, VAL-12 | Draft and repair schemas remain separate from registry authority. |
| Q-1 | C-5 | VAL-1 | Default profile can ship first. |
| Q-2 | C-10, C-15 | VAL-5, VAL-6, VAL-9 | Apply can remain deferred. |
| Q-3 | C-5, C-6 | VAL-1, VAL-2 | Design spec profile is default first profile. |

Section status: Complete

## 10. Open Questions

| Question ID | Question | Owner | Due date or decision point | Impact if unresolved |
| --- | --- | --- | --- | --- |
| Q-1 | Should custom ID-family and authoring profiles ship in the first release? | Project owner | Detailed design approval | Default-only design-spec profile ships first. |
| Q-2 | Should direct `--apply` mutation ship in the first release? | Project owner | After repair packet validation | First release remains patch-only. |
| Q-3 | Which artifact family should be first-class first? | Project owner | Implementation kickoff | Design spec remains the default first profile. |

Section status: Complete

## 11. In-Situ Evaluation

### Grounding Evidence

| Evidence ID | Source | Tool/source type | What was inspected | Relevant contracts |
| --- | --- | --- | --- | --- |
| EVD-1 | `docs/design/markdown-trace-durable-markdown-authoring-design-spec.md` | docs | R2 source requirements, mechanisms, schemas, rollout, rollback, and validation gates. | C-1 through C-17 |
| EVD-2 | `package.json` | code search | Node package type, binary entry, dependency on `@jasonbelmonti/markdown-engine@2.0.0`, and test/build scripts. | C-1, C-13, C-17 |
| EVD-3 | `src/markdowntrace/cli.ts` | code search | Existing CLI command parsing, output writing, exit handling, and environment injection. | C-1, C-2, C-3, C-4, C-15, C-17 |
| EVD-4 | `src/markdowntrace/registry/model.ts` | code search | `EntityRegistry`, registry entities, edges, and duplicate ID/label invariants. | C-7, C-9, C-12, C-17 |
| EVD-5 | `src/markdowntrace/graph/model.ts` | code search | Existing authoritative graph node and edge shape. | C-11, C-17 |
| EVD-6 | `src/markdowntrace/registry/derived.ts` | code search | Existing engine API usage, trace-link derivation, heading fallback, and registry projection path. | C-13, C-14, C-17 |
| EVD-7 | `tests/test_cli.test.ts` | test | Current CLI output, temporary output writing, incomplete argument failure, and R1 CLI behavior. | C-1, C-2, C-4, C-15, C-17 |
| EVD-8 | `tests/test_r1_link_backed_graph.test.ts` | test | R1 link-backed graph expectations and failure behavior. | C-17 |
| EVD-9 | `src/markdowntrace/index.ts` | code search | Current public export aggregation. | C-5 through C-16 |

### Rubric Scores

| Axis | Score | Evidence IDs | Finding IDs | Notes |
| --- | --- | --- | --- | --- |
| Behavioral fitness | Pass | EVD-1, EVD-3, EVD-7 | none | Contracts cover author, repair, graph delta, revalidate, and compatibility flows. |
| Consumer fitness | Pass | EVD-1, EVD-3, EVD-7 | none | Commands map to user workflow stages and keep patch-first review explicit. |
| Integration realism | Pass | EVD-2, EVD-3, EVD-6 | none | Existing CLI is owned-changeable and engine access is adapter-contained. |
| Change safety | Pass | EVD-3, EVD-4, EVD-5, EVD-8 | FND-1 | Apply mode is explicitly controlled and can be deferred. |
| Failure semantics | Pass | EVD-1, EVD-3, EVD-7 | FND-2 | Operational failure, unresolved repair output, non-durable state, and actionable repair output are distinguished. |
| Data and invariant protection | Pass | EVD-1, EVD-4, EVD-5 | none | Draft, repair, graph delta, and durability schemas remain separate from authority. |
| Operational fitness | Pass | EVD-1, EVD-3, EVD-7 | none | Signals include state, diagnostics, input hash, backup path, graph counts, and exit code. |
| Security and trust handling | Pass | EVD-1, EVD-2, EVD-3 | none | No remote, auth, secrets, browser, MCP, graph database, or LLM boundary exists. |
| Testability | Pass | EVD-7, EVD-8 | none | Validation plan uses contract tests, snapshots, inspection, manual review, and regression gates. |
| Implementation proportionality | Pass | EVD-2, EVD-3, EVD-6, EVD-9 | none | Interfaces correspond to real CLI, schema, adapter, IO, serializer, and compatibility boundaries. |

### Evaluation Findings

| Finding ID | Severity | Axis | Affected contracts | Evidence IDs | Required action | Validation target |
| --- | --- | --- | --- | --- | --- | --- |
| FND-1 | Minor | Change safety | C-10, C-15 | EVD-1, EVD-3 | Resolved in this packet: direct apply is not required for the first release and remains gated by backup or reversible patch evidence. | VAL-6, VAL-9 |
| FND-2 | Major | Failure semantics | C-2, C-9, C-12 | EVD-1, EVD-3 | Resolved in this packet: `repair` exit code `0` now requires actionable repair output with no unresolved durability blockers, while exit code `1` covers packet or patch output that remains unresolved or non-durable. | VAL-4, VAL-6, VAL-7 |

Section status: Complete

## Internal Review Record

- Contract depth calibration: `ID2` matches the source `R2` design spec. The packet defines implementation-ready CLI, schema, adapter, IO, graph, validation, and compatibility contracts.
- Grounding result: Grounded against package metadata, CLI implementation, registry model, graph model, registry derivation, public exports, CLI tests, and R1 link-backed graph tests.
- Rubric result: Pass across all axes after resolving FND-1 and FND-2.
- Findings addressed: FND-1 resolved by making apply mode optional and requiring backup or reversible patch evidence before existing-file mutation.
- Findings addressed: FND-2 resolved by separating actionable repair completion from unresolved or non-durable repair planning output in the `repair` CLI exit-code contract.
- Validation result: Correction structural validation passed with `@jasonbelmonti/markdown-engine@2.0.0` and `interface-design-validation-profile.yaml`; no diagnostics were reported. Evidence input hash before this review-record update was `f40f17258fe9826160138e2df280220cc3e094b91ef8ee2c3c671fe937c6fd60`.
- Remaining findings: None.
- Readiness verdict: Ready for implementation planning.
