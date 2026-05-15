# Markdown Trace R0: Document-Local Entity Registry Prototype

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace R0: Document-Local Entity Registry Prototype |
| Status | Draft |
| Rigor level | `R0` |
| Rigor justification | The work is a bounded experiment to determine whether stable entity references in one execution spec can be represented and validated deterministically before any production implementation is approved. |
| Author(s) | Codex |
| Reviewers | Jason Belmonti |
| Decision owner | Jason Belmonti |
| Target milestone or release | Markdown Trace prototype decision |
| Last updated | 2026-05-15 |
| Related docs | Prior planning discussion for Markdown Trace entity references; observed BEL-858 attribution pattern; `docs/evidence/markdown-engine-2-adoption-decision.md`; `docs/evidence/prototype-decision-record.md`; `docs/markdown-trace-r1-link-backed-entity-syntax.md`; `@jasonbelmonti/markdown-engine` 2.0 public API contract |
| Related tickets | BEL-1045; BEL-991; BEL-899; BEL-900; BEL-1064 |

## 0. Executive Summary

Decision requested: Approve for experiment

Problem summary: Agent-authored execution specs can contain many useful identifiers, but those identifiers currently exist as plain text without a deterministic registry, resulting in duplicate labels, stale references, broken ranges, and ambiguous cross-reference meaning during document generation and revision.

Proposed outcome: A local operator can validate one execution spec against a document-local entity registry and receive deterministic pass/fail evidence about entity definitions, references, ranges, and relationship integrity.

Why now: The BEL-858 execution-reference pattern shows immediate value from stable identifiers, and the concept should be validated before Markdown Trace commits to broader project-management or graph-storage scope.

Top risks or unknowns:

- RISK-1: A document-local registry may not provide enough value to justify agent maintenance overhead.
- RISK-2: Markdown reference extraction may still overstate feasibility if Markdown Trace adds semantic reference logic beyond the published `markdown-engine` 2.0 rich IR contract.
- RISK-3: Collision handling may be over-designed before cross-system projections are in scope.

Section status: Complete

## Layer 1: Problem and Requirements

## 1. Problem Definition

Problem declaration: Agents and document maintainers are unable to preserve stable, machine-checkable entity references in identifier-rich execution specs because identifiers are currently plain-text labels without a source-of-truth registry, resulting in stale references, duplicate labels, and ambiguous relationship claims during document edits.

Affected actors or systems: Agent authors, human reviewers, execution-spec maintainers, downstream project-management projection workflows, and future Markdown Trace tooling.

Current-state baseline: Estimated from 1 directly observed Linear issue pattern, BEL-858, containing at least 9 execution identifier families: `WP-*`, `MS-*`, `PKG-*`, `SURF-*`, `CON-*`, `VAL-*`, `RISK-*`, `EVD-*`, and `REV-*`.

Evidence or source: Direct observation from the user-provided BEL-858 excerpt and subsequent Linear read during planning on 2026-04-28; current prototype repository is empty and has no existing validator.

Consequence of inaction: Within the next execution-spec authoring cycle, agents can continue producing useful identifier-rich documents without deterministic checks, increasing the chance that stale IDs or broken references enter implementation handoffs.

Decision deadline or trigger: Before implementation work begins in `/Users/jasonbelmonti/Documents/Development/markdown-trace`.

Section status: Complete

## 2. Objectives and Non-Objectives

| ID | Statement | Measurement or decision horizon |
| --- | --- | --- |
| OBJ-1 | Prove that one execution spec can use a document-local registry to preserve stable entity identity independently from display labels. | Prototype review after all `VAL-*` checks complete. |
| OBJ-2 | Prove that deterministic validation can catch missing references, duplicate identifiers, missing edge targets, and incomplete bounded ranges. | Prototype review after negative fixtures produce expected failures. |
| OBJ-3 | Determine whether canonical dotted IDs and human labels are acceptable for agent-authored specs without solving global identity. | Prototype review after manual inspection of registry and report usability. |
| NG-1 | This experiment will not validate live Linear, Jira, or other project-management projections. | Deferred until a later `R1` or `R2` design decision. |
| NG-2 | This experiment does not include a graph database, multi-document namespace, or persistent service. | Deferred until document-local value is proven. |
| NG-3 | This experiment will not modify `markdown-engine`, consume unpublished `markdown-engine` builds, or inspect parser internals. | Markdown parsing uses the published package-root API from `@jasonbelmonti/markdown-engine@2.0.0`; document entity semantics remain local to Markdown Trace. |

Section status: Complete

## 3. Stakeholders and Decision Authorities

| Stakeholder or role | Interest | Required action |
| --- | --- | --- |
| Jason Belmonti | Decides whether the prototype evidence justifies further investment. | Approve |
| Prototype implementer | Needs a decision-complete experiment boundary. | Review |
| Future Markdown Trace maintainer | Needs evidence about registry usability and validation value. | Inform |
| Future markdown-engine consumer | Needs boundary clarity between Markdown parsing and semantic entity validation. | Consult |

Decision owner: Jason Belmonti

Security, data, legal, and operations reviewers: none required for this local, read-only experiment.

Section status: Complete

## 4. Constraints, Invariants, and Assumptions

| ID | Type | Statement | Source or rationale | Validation or resolution plan |
| --- | --- | --- | --- | --- |
| CON-1 | Constraint | The experiment is limited to one fixture family derived from one source execution spec and one document-local registry; valid and broken cases may be represented as local fixture variants or generated mutations of that family. | User selected one-spec scope during planning while requiring negative validation evidence. | Validate through `VAL-2` and `VAL-3`. |
| CON-2 | Constraint | The registry format is YAML. | User selected YAML registry during planning. | Validate through `VAL-1`. |
| CON-3 | Invariant | Canonical entity IDs use dotted lowercase syntax such as `exec.wp.1`; human display labels may use `WP-1`. | Reduces collision with project-management keys while preserving readable labels. | Validate through `VAL-1`, `VAL-2`, and `VAL-4`. |
| CON-4 | Constraint | The prototype performs no network calls and no live project-management mutation. | Keeps the `R0` experiment reversible and local. | Validate through `VAL-6`. |
| CON-5 | Invariant | Jira-like or Linear-like keys such as `BEL-858` are external issue keys unless explicitly registered as external references. | Prevents accidental collision between document entity labels and project-management identifiers. | Validate through `VAL-4`. |
| ASM-1 | Assumption | A sidecar registry can be maintained by an agent with lower total effort than manual reference cleanup. | The value is plausible from the BEL-858 pattern but unproven. | Resolve at prototype review after `DEP-1`, `DEP-2`, and required evidence are complete. |
| DEP-1 | Dependency | `@jasonbelmonti/markdown-engine@2.0.0` must be available from npm before engine-backed validation implementation starts. | The prototype now depends on the package-root 2.0 parser and rich IR API instead of local line/string parsing. | Package availability was verified on 2026-05-14; revalidate with `npm view @jasonbelmonti/markdown-engine version` before implementation resumes. |
| DEP-2 | Dependency | BEL-991 must record Markdown Engine 2.0 release authorization before engine-backed validation implementation starts. | The R0 implementation must not treat npm availability alone as release approval. | Confirm BEL-991 release authorization before implementation resumes. |
| ASM-2 | Assumption | The published `markdown-engine` 2.0 rich IR exposes enough section, text-span, link, source-slice, and query information for the one-fixture R0 adapter. | The implementation should test the adapter boundary without duplicating parser behavior. | Resolve through `VAL-2`, `VAL-3`, and `EVD-2`/`EVD-3` package-version evidence. |

Section status: Complete

## 5. Requirements

| ID | Type | Priority | Requirement statement | Rationale | Verification |
| --- | --- | --- | --- | --- | --- |
| REQ-1 | Functional | Must | The prototype shall validate every registered entity definition in the fixture execution spec against one document-local YAML registry. | The experiment must prove registry-to-document integrity. | VAL-1, VAL-2 |
| REQ-2 | Functional | Must | The prototype shall distinguish canonical entity IDs from human display labels during validation. | Identity must remain stable even when labels are optimized for humans. | VAL-1, VAL-2 |
| REQ-3 | Functional | Must | The prototype shall report missing registered entity definitions, missing references, duplicate canonical IDs, duplicate labels, missing edge targets, and incomplete bounded ranges as failures. | The prototype must catch the reference failures that justify the project. | VAL-3 |
| REQ-4 | Functional | Must | The prototype shall ignore project-management issue keys unless they are explicitly registered as external references. | Collision resistance with systems such as Linear and Jira is necessary even in the first model. | VAL-4 |
| REQ-5 | Reliability | Must | The prototype shall emit the same ordered validation result for identical inputs across 3 consecutive local runs. | Deterministic output is required for agent handoff and review evidence. | VAL-5 |
| REQ-6 | Operability | Must | The prototype shall complete validation without network calls or live external-system mutation. | The experiment must remain safe, local, and reversible. | VAL-6 |

Section status: Complete

## 6. Success Measures and Kill Criteria

| Measure | Baseline | Target or decision threshold | Evaluation date or decision event | Related IDs |
| --- | --- | --- | --- | --- |
| Valid fixture result | Baseline is 0 existing validators in the new repository. | Continue if a valid fixture spec and matching registry produce 0 validation failures. | Prototype review after `DEP-1`, `DEP-2`, and required evidence are complete. | OBJ-1, REQ-1, REQ-2 |
| Broken fixture detection | Baseline is manual review only. | Continue if fixture variants for missing registered entity definition, duplicate canonical ID, duplicate label, missing reference, missing edge target, and incomplete range each fail with the expected finding category. | Prototype review after `DEP-1`, `DEP-2`, and required evidence are complete. | OBJ-2, REQ-3 |
| Collision behavior | Baseline is undefined handling for tokens like `BEL-858`. | Continue if project-management issue keys are ignored unless explicitly registered; pivot if they are treated as document entities by default. | Prototype review after `DEP-1`, `DEP-2`, and required evidence are complete. | OBJ-3, REQ-4 |
| Determinism | Baseline is no deterministic report. | Continue if 3 consecutive runs over the same fixture variant produce the same ordered result; stop if output order or finding identity is unstable. | Prototype review after `DEP-1`, `DEP-2`, and required evidence are complete. | OBJ-2, REQ-5 |
| Maintenance signal | Baseline is estimated from manual reference review. | Stop if the registry requires more manual edits than the number of reference failures it can detect in the prototype fixture variants. | Prototype review after `DEP-1`, `DEP-2`, and required evidence are complete. | OBJ-1, OBJ-3 |

Section status: Complete

## Layer 1 Exit

Layer 1 status: Complete

## Layer 2: Functional Specification

## 7. System Context and External Interfaces

System boundary: The prototype is a local validation workflow that reads a fixture Markdown execution spec and a sidecar YAML registry, normalizes the Markdown through the published `@jasonbelmonti/markdown-engine@2.0.0` package-root API, builds an in-memory entity graph, and emits a deterministic validation report.

External actors and systems: Local operator; local filesystem; npm-installed `@jasonbelmonti/markdown-engine@2.0.0` package. Linear and Jira have no data or control interface in this `R0` experiment. The sibling `markdown-engine` repository is not modified or used as an unpublished dependency.

Trust or control boundaries: No network, authentication, authorization, secrets, or external trust boundary is crossed. The only boundary is between local input files and local validation output.

| Interface | Owner | Consumer or dependency | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| Fixture Markdown input | Local filesystem | Markdown Engine document adapter | One local execution-spec Markdown file | Normalized rich IR document, sections, text spans, links, link references, and source slices from `markdown-engine` |
| YAML registry input | Markdown Trace prototype | Validator | One local YAML registry file | Declared entities, labels, types, and edges |
| Validation report output | Markdown Trace prototype | Local operator | Validation findings and summary | Deterministic pass/fail report |

Section status: Complete

## 8. Operational Scenarios and Functional Behavior

| ID | Trigger | Preconditions | Behavior or outcome | Related requirements |
| --- | --- | --- | --- | --- |
| FLOW-1 | Operator runs validation on a valid fixture. | Fixture Markdown and registry are present and internally consistent. | The workflow reports success with a deterministic summary. | REQ-1, REQ-2, REQ-5, REQ-6 |
| FLOW-2 | Operator runs validation on an intentionally broken fixture variant. | Fixture variant contains at least one missing registered entity definition, duplicate canonical ID, duplicate label, missing reference, missing edge target, or incomplete bounded range. | The workflow reports failure with categorized findings that identify the violated entity rule. | REQ-3, REQ-5, REQ-6 |
| FLOW-3 | Operator runs validation on a fixture containing a project-management issue key. | Fixture contains a token such as `BEL-858` that is not registered as a Markdown Trace entity. | The workflow treats the issue key as external text and does not register it as a document entity. | REQ-4, REQ-5, REQ-6 |
| FUNC-1 | Validator receives a fixture spec and registry. | Inputs are readable local files. | The system associates registered canonical IDs with expected display labels and document definitions. | REQ-1, REQ-2 |
| FUNC-2 | Validator detects invalid entity graph conditions. | Inputs contain a missing registered entity definition, duplicate canonical ID, duplicate label, missing target, missing reference, or incomplete range. | The system emits deterministic failure findings. | REQ-3, REQ-5 |
| FUNC-3 | Validator encounters a project-management issue key. | The issue key is not explicitly registered. | The system leaves the issue key outside the document entity graph. | REQ-4 |
| FUNC-4 | Validator runs locally. | Operator invokes the local validation workflow. | The system completes without external service calls or live mutation. | REQ-6 |

Section status: Complete

## 9. State Model, Faults, and Misuse Cases

States and transitions: Input files begin in `unchecked`; successful parse moves them to `loaded`; graph construction moves them to `resolved`; rule evaluation ends in `passed` or `failed`. Failed parse or missing file moves the run to `failed` with diagnostic output.

| Scenario | Expected behavior | Invariant maintained | Related IDs |
| --- | --- | --- | --- |
| Fault-1 | Invalid YAML registry produces a failed validation run with a registry parse diagnostic. | Invalid registry input cannot produce a passing report. | REQ-1, FUNC-1 |
| Fault-2 | Missing registered entity definition produces a failed validation run. | Every registered entity expected in the document is either found or reported missing. | REQ-1, REQ-3, FUNC-2 |
| Fault-3 | Edge target is absent from the registry. | Every edge endpoint resolves to one registered canonical ID. | REQ-3, FUNC-2 |
| Misuse-1 | Operator expects `BEL-858` to become a document entity without registering it. | External issue keys are not document entities by default. | REQ-4, FUNC-3 |

Section status: Complete

## 10. External Service Levels and Acceptance Cases

External service expectations: Local prototype only; no availability or latency service level applies. Identical fixture-variant and registry inputs are expected to produce the same ordered validation result for 3 consecutive local runs.

| ID | Acceptance case | Expected result | Covers |
| --- | --- | --- | --- |
| ACC-1 | Validate a fixture with registered `exec.wp.1` labeled `WP-1` and matching document definition. | Report exits with success and 0 findings. | REQ-1, REQ-2, FUNC-1 |
| ACC-2 | Validate a fixture variant with two registry entries using the same canonical ID. | Report exits with failure and a duplicate-canonical-id finding. | REQ-3, FUNC-2 |
| ACC-3 | Validate a fixture variant with two entities using the same display label. | Report exits with failure and a duplicate-label finding. | REQ-2, REQ-3, FUNC-2 |
| ACC-4 | Validate a fixture variant that references an unregistered entity label. | Report exits with failure and a missing-reference finding. | REQ-3, FUNC-2 |
| ACC-5 | Validate a fixture variant whose registry edge points to an absent canonical ID. | Report exits with failure and a missing-edge-target finding. | REQ-3, FUNC-2 |
| ACC-6 | Validate a fixture variant referencing `CON-3 through CON-6` while `CON-5` is absent. | Report exits with failure and an incomplete-range finding. | REQ-3, FUNC-2 |
| ACC-7 | Validate a fixture containing `BEL-858` without registering it as an external reference. | Report does not classify `BEL-858` as a Markdown Trace entity. | REQ-4, FUNC-3 |
| ACC-8 | Run validation 3 times on the same fixture variant and registry. | Ordered findings and summary are identical across all runs. | REQ-5, FUNC-2 |
| ACC-9 | Run validation while network access is unavailable. | Validation completes using local files only. | REQ-6, FUNC-4 |
| ACC-10 | Validate a registry entry that declares an expected document definition absent from the fixture. | Report exits with failure and a missing-registered-definition finding. | REQ-1, REQ-3, FUNC-2 |

Section status: Complete

## 11. Requirements-to-Behavior Traceability

| Requirement | Functional behaviors or flows | Acceptance coverage | Notes |
| --- | --- | --- | --- |
| REQ-1 | FLOW-1, FUNC-1 | ACC-1 | Registry-to-document integrity. |
| REQ-2 | FLOW-1, FUNC-1 | ACC-1, ACC-3 | Canonical ID and display label separation. |
| REQ-3 | FLOW-2, FUNC-2 | ACC-2, ACC-3, ACC-4, ACC-5, ACC-6, ACC-10 | Failure-mode detection. |
| REQ-4 | FLOW-3, FUNC-3 | ACC-7 | Collision behavior. |
| REQ-5 | FLOW-1, FLOW-2, FLOW-3, FUNC-2 | ACC-8 | Deterministic output. |
| REQ-6 | FLOW-1, FLOW-2, FLOW-3, FUNC-4 | ACC-9 | Local read-only operation. |

Section status: Complete

## Layer 2 Exit

Layer 2 status: Complete

## Layer 3: Technical Specification

## 12. Architecture Overview

Architecture summary: The `R0` prototype will use local files, the published `@jasonbelmonti/markdown-engine@2.0.0` package-root API, and an in-memory validation pass. A fixture execution spec supplies Markdown text, `markdown-engine` supplies the normalized rich IR and structural query surface, a YAML sidecar registry supplies canonical entity declarations and relationships, and a validator reports deterministic findings.

Major components and boundaries: The top-level components are fixture Markdown input, YAML registry input, registry loader, Markdown Engine document adapter, entity graph resolver, validation rule evaluator, and deterministic report writer. The main boundary is between package-owned Markdown structure from `markdown-engine` and Markdown Trace-owned entity semantics. Markdown Trace must not inspect raw parser AST, raw mdast, raw parser positions, or `markdown-engine` internal modules.

Deployment or runtime placement: Local developer workstation only. No service, daemon, hosted database, or project-management integration is part of the experiment.

Architecture rationale: A file-backed prototype is sufficient for REQ-1 through REQ-6 because the experiment tests entity identity, reference validation, range expansion, collision behavior, deterministic reporting, and local safety without requiring a durable database or live integration. Reusing `markdown-engine` 2.0 avoids duplicating generic Markdown parsing and keeps this experiment focused on document-local entity semantics.

Section status: Complete

## 13. Technical Mechanisms and Allocation

| ID | Mechanism | Component or owner | Responsibility | Related behaviors |
| --- | --- | --- | --- | --- |
| TECH-1 | Document-local YAML registry model | Markdown Trace prototype | Represent canonical IDs, display labels, entity types, definition expectations, and edges. | FUNC-1 |
| TECH-2 | Markdown Engine document adapter | Markdown Trace prototype | Use `parse`, `normalize`, and `documentQueries` from published `@jasonbelmonti/markdown-engine@2.0.0` to produce Markdown Trace adapter facts for definitions, label references, bounded ranges, ignored issue-key candidates, and source evidence. | FUNC-1, FUNC-3 |
| TECH-3 | Entity graph resolver | Markdown Trace prototype | Build the in-memory graph and detect duplicate IDs, duplicate labels, missing definitions, missing references, missing edge targets, and incomplete ranges. | FUNC-1, FUNC-2 |
| TECH-4 | Deterministic report writer | Markdown Trace prototype | Emit ordered validation findings with stable finding categories and source context where available. | FUNC-2 |
| TECH-5 | Local fixture harness | Markdown Trace prototype | Exercise valid, invalid, collision, and deterministic-repeat cases from the one fixture family without external service access. | FUNC-2, FUNC-4 |

Section status: Complete

## 14. Data, Schemas, and Compatibility

The provisional registry shape for the experiment is:

```yaml
document:
  id: markdown-trace.prototype
  path: fixtures/execution-spec.md
entities:
  - id: exec.wp.1
    label: WP-1
    type: work_package
    defines:
      kind: heading
      text: "WP-1:"
edges:
  - from: exec.wp.1
    relationship: depends_on
    to: exec.wp.0
externalRefs:
  - system: linear
    key: BEL-858
    relatedEntity: exec.wp.1
```

| Change | Type | Compatibility impact | Reversibility | Mitigation |
| --- | --- | --- | --- | --- |
| Document-local registry schema | Config | Internal prototype only; no external consumer compatibility commitment. | Reversible | Treat schema as experimental and version it only inside fixture evidence. |
| Validation report shape | Data | Internal prototype only; report categories may change before implementation approval. | Reversible | Keep fixture snapshots tied to the `R0` experiment only. |
| Optional `externalRefs` section | Config | Internal prototype only; does not integrate with live Linear or Jira. | Reversible | Validate that external references are not treated as document entities by default. |
| `@jasonbelmonti/markdown-engine@2.0.0` dependency | Package | npm availability is verified; Markdown Trace consumes only package-root public APIs and the `documentVersion: "1.0.0"` rich IR contract after `DEP-2` confirms BEL-991 release authorization. | Reversible by changing the adapter dependency before implementation resumes. | Confirm `DEP-1` and `DEP-2`; record package version and document contract version in `EVD-2` through `EVD-6`. |

Section status: Complete

## 15. Control Logic and Non-Functional Controls

Control logic summary: The validator loads registry entities, parses and normalizes fixture Markdown through `markdown-engine`, adapts rich IR query results into Markdown Trace adapter facts, resolves canonical IDs and labels into one in-memory graph, expands supported bounded ranges, evaluates rule failures, sorts findings deterministically, and emits one report.

Concurrency and ordering model: No concurrency is required. Finding order is deterministic: input file order for source-derived findings, then canonical ID order, then finding category order for graph-derived findings.

Failure recovery model: Invalid input produces a failed validation report and does not modify source files, registry files, or external systems.

| Requirement | Mechanism | Notes |
| --- | --- | --- |
| REQ-1 | TECH-1, TECH-2, TECH-3 | Registry and Markdown definitions must reconcile. |
| REQ-2 | TECH-1, TECH-3 | Canonical IDs and display labels are distinct registry fields. |
| REQ-3 | TECH-3, TECH-4 | Rule failures are categorized and reported. |
| REQ-4 | TECH-2, TECH-3 | Issue-key tokens remain outside the entity graph unless explicitly registered as external references. |
| REQ-5 | TECH-4, TECH-5 | Repeat fixtures prove stable ordering. |
| REQ-6 | TECH-5 | Fixture harness avoids network calls and live mutation. |

Section status: Complete

## 16. Observability, Operations, Rollout, and Rollback

| Signal | Type | Purpose | Consumer |
| --- | --- | --- | --- |
| Validation summary | Log | Show pass/fail status, finding count, and fixture identity. | Local operator |
| Finding category counts | Log | Show which entity-integrity rules failed. | Local operator |
| Fixture repeat result | Log | Show whether deterministic output held across 3 consecutive runs. | Local operator |
| Internal review record | Audit | Capture whether the design is ready for experiment. | Decision owner |

Rollout plan: Create the fixture execution spec, YAML registry, fixture variants, and local validation runner in the Markdown Trace repository after this `R0` spec is approved for experiment, `DEP-1` is revalidated, and `DEP-2` confirms BEL-991 release authorization. Run the fixture-variant suite locally and record evidence in the repository.

Rollback or containment plan: Trigger rollback if the prototype writes outside the repository, attempts network access, or mutates live external systems. The rollback action is to stop execution and delete prototype artifacts; containment limit is local filesystem state only.

Operator actions: Run the local validation workflow, inspect the report, compare outputs across repeated runs, and record whether the continue, pivot, or stop criteria in section 6 are met.

Section status: Complete

## 17. Verification Strategy and Behavior-to-Mechanism Traceability

| ID | Verification method | What is verified | Related IDs |
| --- | --- | --- | --- |
| VAL-1 | Inspection | Registry schema separates canonical IDs, labels, entity types, definition expectations, edges, and external references. | REQ-1, REQ-2, TECH-1 |
| VAL-2 | Test | Valid fixture produces a passing report with registered definitions resolved. | REQ-1, REQ-2, FUNC-1, TECH-1, TECH-2, TECH-3 |
| VAL-3 | Test | Negative fixture variants fail for missing registered entity definitions, duplicate canonical IDs, duplicate labels, missing references, missing edge targets, and incomplete bounded ranges. | REQ-3, FUNC-2, TECH-3, TECH-4 |
| VAL-4 | Test | Project-management issue keys are ignored unless explicitly registered as external references. | REQ-4, FUNC-3, TECH-2, TECH-3 |
| VAL-5 | Test | Three consecutive runs over identical inputs produce the same ordered validation result. | REQ-5, FUNC-2, TECH-4, TECH-5 |
| VAL-6 | Manual | Validation completes with network unavailable and without live external-system mutation. | REQ-6, FUNC-4, TECH-5 |
| VAL-7 | Inspection | Prototype results are compared against section 6 continue, pivot, and stop criteria. | OBJ-1, OBJ-2, OBJ-3, RISK-1, RISK-2, RISK-3 |

| Behavior or requirement | Mechanisms | Verification |
| --- | --- | --- |
| REQ-1 | TECH-1, TECH-2, TECH-3 | VAL-1, VAL-2 |
| REQ-2 | TECH-1, TECH-3 | VAL-1, VAL-2 |
| REQ-3 | TECH-3, TECH-4 | VAL-3 |
| REQ-4 | TECH-2, TECH-3 | VAL-4 |
| REQ-5 | TECH-4, TECH-5 | VAL-5 |
| REQ-6 | TECH-5 | VAL-6 |
| FUNC-1 | TECH-1, TECH-2, TECH-3 | VAL-2 |
| FUNC-2 | TECH-3, TECH-4, TECH-5 | VAL-3, VAL-5 |
| FUNC-3 | TECH-2, TECH-3 | VAL-4 |
| FUNC-4 | TECH-5 | VAL-6 |

Section status: Complete

## 18. Alternatives, Risks, Open Questions, and Final Exit

| Alternative | Reason considered | Reason rejected |
| --- | --- | --- |
| Plain labels only | Lowest ceremony and closest to current execution-spec writing. | Does not provide deterministic identity, relationship validation, or stale-reference detection. |
| Graph database first | Natural fit for entity and edge queries. | Premature for one-document value proof and adds operational setup before the graph contract is validated. |
| HTML comments as primary entity markers | Easy for machines to find in Markdown. | Adds hidden syntax to documents before proving that a sidecar registry is insufficient. |
| Live Linear projection validation first | Closest to the BEL-858 example. | Expands blast radius and integration complexity before document-local stability is proven. |

Post-R0 follow-on candidate: Markdown-native `ctx://trace` links are the preferred next experiment after the R0 evidence packet. This candidate uses standard Markdown inline links and reference-style links so entity definitions and references remain visible in the authoring surface while the URL target carries canonical identity. The candidate is documented in `docs/markdown-trace-r1-link-backed-entity-syntax.md`; it does not change the R0 requirement that the implemented prototype uses sidecar YAML plus heading-derived definitions.

| ID | Statement | Likelihood | Consequence | Mitigation |
| --- | --- | --- | --- | --- |
| RISK-1 | Registry upkeep may cost more than the reference failures it prevents. | Medium | Medium | Include maintenance signal kill criterion and inspect agent usability after the fixture-variant suite. |
| RISK-2 | Markdown Trace semantic reference extraction may produce false positives or miss references even when generic Markdown structure comes from `markdown-engine`. | Medium | Medium | Use `markdown-engine` 2.0 for generic parsing and constrain Markdown Trace to adapter plus entity semantics; record misses/false positives in prototype evidence. |
| RISK-3 | Collision handling may be under-proven without live Linear or Jira data. | Low | Medium | Treat issue keys as external by default and defer live projection validation to a later design. |

| ID | Question | Owner | Due date | Resolution plan |
| --- | --- | --- | --- | --- |
| Q-1 | Should a later implementation integrate this entity model into `markdown-engine` or remain a separate semantic validation layer? | Jason Belmonti | 2026-05-14 | Resolved for R0: consume published `@jasonbelmonti/markdown-engine@2.0.0` for generic Markdown parsing and structural queries; keep document entity registry semantics in Markdown Trace. |
| Q-2 | Should a later implementation keep YAML as the source of truth or derive the registry from annotated Markdown? | Jason Belmonti | At `MS-3` prototype review | `EVD-7` recommends preserving YAML as R0 historical evidence and pivoting the next experiment toward link-backed annotated Markdown; final acceptance occurs at `MS-3`. |
| Q-3 | Should live Linear or Jira projection validation be the next slice after document-local proof? | Jason Belmonti | At `MS-3` prototype review | Resolve after the document-local fixture-variant suite passes or exposes a pivot condition. |

Waivers: none

Final readiness statement: Ready for experiment

Section status: Complete

## Final Consistency Gate

| Check | Status |
| --- | --- |
| Every section from 0 through 18 has an allowed section status. | Pass |
| Every `REQ-*` from section 5 appears in section 11 and section 17. | Pass |
| Every `FUNC-*` from section 8 appears in section 17. | Pass |
| Every `TECH-*` from section 13 appears in section 17. | Pass |
| Every `ACC-*` referenced anywhere is defined in section 10. | Pass |
| Every `VAL-*` referenced anywhere is defined in section 17. | Pass |
| Every `Q-*` row has owner, due date, and resolution plan. | Pass |
| No section is marked `Deferred`. | Pass |
| No `R3` trigger applies to this local read-only experiment. | Pass |
| Final readiness statement matches `R0`. | Pass |

## Internal Review Record

| Field | Value |
| --- | --- |
| Document | Markdown Trace R0: Document-Local Entity Registry Prototype |
| Review date | 2026-04-28 |
| Moderator | Codex internal review |
| Decision owner | Jason Belmonti |
| Proposed rigor level | `R0` |
| Reviewed rigor level | `R0` |
| Structural result | Pass |
| Semantic result | Pass |
| Traceability result | Pass |
| Verdict | Approve for experiment |
| Open findings | none |
| Resolved findings verified in this decision | ST-1, ST-2, SM-1, TR-1, TR-2, NB-1, NB-2, NB-3 |
| Reviewed waivers | none |
| Required heightened controls | none |
| Approval conditions | none |
| Top blockers | none |
| Required follow-ups | Q-2 recommendation is captured in `docs/evidence/prototype-decision-record.md`; resolve Q-3 at prototype review; Q-1 is resolved by BEL-1045 and `docs/evidence/markdown-engine-2-adoption-decision.md`. |

### Findings Addressed During Revision

| Finding ID | Severity | Status | Section | Finding | Resolution |
| --- | --- | --- | --- | --- | --- |
| ST-1 | Major | Resolved | 14 | Initial draft did not make the experimental schema and compatibility impact explicit enough for review. | Added the provisional YAML shape and compatibility rows. |
| ST-2 | Major | Resolved | 4 | Consensus review found that the one-fixture constraint conflicted with valid and broken fixture validation evidence. | Reframed the scope as one fixture family derived from one source spec and registry, with local variants or generated mutations allowed. |
| SM-1 | Major | Resolved | 6 | Initial draft did not include a disconfirming maintenance-cost kill criterion. | Added the maintenance signal stop criterion. |
| TR-1 | Major | Resolved | 17 | Initial draft did not map local read-only operation through behavior, mechanism, and verification. | Added FUNC-4, TECH-5, VAL-6, and traceability coverage for REQ-6. |
| TR-2 | Major | Resolved | 6, 10, 17 | Consensus review found that duplicate canonical ID detection was required but not materially verified. | Added duplicate canonical ID coverage to the success threshold, acceptance cases, requirements traceability, and VAL-3. |
| NB-1 | Minor | Resolved | 1 | Consensus review noted that the baseline counted at least 8 identifier families while listing 9. | Corrected the baseline count to 9 identifier families. |
| NB-2 | Minor | Resolved | 4, 5, 17 | Consensus review noted inconsistent wording between entities and external references for project-management keys. | Aligned the wording to external references across the constraint, acceptance case, compatibility note, and validation rows. |
| NB-3 | Minor | Resolved | 10, 11 | Consensus review noted that missing-reference and missing-edge-target coverage was present in `VAL-3` but not explicit in acceptance cases. | Added explicit acceptance cases and updated requirements-to-behavior traceability for both finding categories. |

### Semantic Scores

| Dimension | Score | Notes |
| --- | --- | --- |
| Problem validity | 2 | Evidence is limited but adequate for `R0`; the BEL-858 pattern is a concrete trigger. |
| Requirement quality | 3 | Requirements are atomic and verification-linked. |
| Functional adequacy | 3 | Behaviors cover valid, invalid, collision, deterministic, and local-safety cases. |
| Technical feasibility | 2 | Mechanisms are plausible for a local prototype; generic parser completeness is delegated to the published `markdown-engine` 2.0 package while semantic reference extraction remains experimental. |
| Non-functional adequacy | 2 | Determinism and local-safety controls are specified for `R0`. |
| Operational safety | 3 | No network, no live mutation, and local rollback are explicit. |
| Verification adequacy | 3 | Verification targets the highest-risk claims for the experiment. |

Readiness verdict: Ready for experiment.
