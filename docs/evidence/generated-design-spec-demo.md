# Generated Design Spec: Markdown Trace Design-Spec Validation Demo

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Design-Spec Validation Demo |
| Status | In Review |
| Rigor level | `R1` |
| Rigor justification | The demo is a small, reversible local evidence workflow with no production, trust-boundary, schema, or data migration impact. |
| Author(s) | Codex |
| Reviewers | Jason Belmonti |
| Decision owner | Jason Belmonti |
| Target milestone or release | 2026-06-04 local validation pass |
| Last updated | 2026-06-04 |
| Related docs | `/Users/jasonbelmonti/.codex/skills/design-spec/SKILL.md`; `/Users/jasonbelmonti/.codex/skills/design-spec/references/design-spec-validation-profile.yaml` |
| Related tickets | N/A |

## 0. Executive Summary

Decision requested: Approve for implementation

Problem summary: Markdown Trace users are unable to determine which parts of a generated design-spec artifact can be validated today because table-backed ID validation and graph derivation use different code paths, resulting in unclear evidence about current capability.

Proposed outcome: A generated design-spec artifact with table-backed IDs produces deterministic validation evidence and a separately recorded graph derivation result that identifies the current derivation boundary.

Why now: The project is on `main` at 2026-06-04 after the latest pull, and the validation question is active today.

Top risks or unknowns:

- RISK-1: The demo may be mistaken for implementation of table-backed graph derivation.
- RISK-2: Validation may pass structurally while semantic traceability remains only manually reviewed.

Section status: Complete

## Layer 1: Problem and Requirements

## 1. Problem Definition

Problem declaration: Markdown Trace maintainers are unable to validate generated design-spec graph behavior from one local artifact because design-spec table IDs are validated by `markdown-engine` while `markdown-trace derive` does not currently promote those table IDs into graph entities, resulting in ambiguous capability claims.

Affected actors or systems: Maintainers, review agents, generated design-spec artifacts, `markdown-engine validate`, and `markdown-trace derive`.

Current-state baseline: One local project checkout on 2026-06-04 contains a design-spec validation profile with table ID rules and a graph derivation path that derives from trace links or heading labels.

Evidence or source: Direct source inspection of the current checkout and the design-spec validation profile.

Consequence of inaction: Without a repeatable demo by 2026-06-04, future review packets may overstate graph validation capability for table-backed design-spec IDs.

Decision deadline or trigger: Complete before using generated design specs as evidence for reference graph validation on 2026-06-04.

Section status: Complete

## 2. Objectives and Non-Objectives

| ID | Statement | Measurement or decision horizon |
| --- | --- | --- |
| OBJ-1 | Produce one generated design-spec artifact that exercises table-backed ID validation. | Artifact validates during the 2026-06-04 local demo. |
| OBJ-2 | Record graph derivation output from the same artifact. | Derivation evidence is available during the 2026-06-04 local demo. |
| NG-1 | Do not implement candidate graph extraction or table-backed graph derivation in this demo. | No source files are changed for feature implementation. |

Section status: Complete

## 3. Stakeholders and Decision Authorities

Stakeholders: Jason Belmonti as project owner and reviewer; Codex as demo author and operator.

Decision owner: Jason Belmonti.

Reviewers: Jason Belmonti for capability interpretation; Codex for structural validation evidence.

Escalation path: If validation and derivation evidence conflict, treat source code behavior and command output as the authority.

Section status: Complete

## 4. Constraints, Invariants, and Assumptions

Constraints:

- CON-1: The demo must use the current local checkout without implementing a new feature.
- CON-2: The design-spec validation profile must remain the baseline structural authority for the generated artifact.

Invariants:

- CON-3: Passing design-spec validation is not equivalent to graph semantic approval.
- CON-4: Graph derivation evidence must come from `markdown-trace derive` against the same artifact.

Assumptions:

- ASM-1: `npm run build` and `node_modules/.bin/markdown-engine` are available in the local checkout.
- ASM-2: Table-backed IDs in the generated artifact represent the intended design-spec tag families for this demo.

Section status: Complete

## 5. Requirements

| ID | Type | Priority | Requirement statement | Rationale | Verification |
| --- | --- | --- | --- | --- | --- |
| REQ-1 | Functional | Must | The demonstration artifact shall validate with the design-spec structural profile. | Proves current table-backed design-spec validation is usable today. | VAL-1 |
| REQ-2 | Functional | Must | The demonstration workflow shall derive a graph from the same artifact. | Proves the graph command can be run against the artifact and exposes current output. | VAL-2 |
| REQ-3 | Evidence | Must | The evidence record shall distinguish validation success from graph derivation coverage. | Prevents over-claiming that table IDs become graph nodes today. | VAL-3 |

Section status: Complete

## 6. Success Measures and Kill Criteria

Success measures:

- The generated artifact passes the design-spec validation profile with zero reported errors.
- `markdown-trace derive` completes against the same artifact and records the resulting node and edge count.
- The final demo statement separates deterministic table validation from current graph derivation capability.

Kill criteria:

- Stop and mark the demo not ready if structural validation fails after one revision pass.
- Stop and report a tooling blocker if either required executable is unavailable.

Section status: Complete

## Layer 1 Exit

Layer 1 status: Complete

Layer 1 decision: Proceed to functional behavior because the problem, scope, requirements, and success measures are bounded to local validation evidence.

## Layer 2: Functional Specification

## 7. System Context and External Interfaces

System boundary: The workflow operates inside the local Markdown Trace checkout and reads one generated Markdown design-spec artifact.

External interfaces: Local CLI execution through `node_modules/.bin/markdown-engine` and `node dist/markdowntrace/cli.js`.

Input artifacts: Generated design-spec Markdown file and the design-spec validation profile.

Output artifacts: Validation JSON output, graph derivation JSON/YAML output, and a concise interpretation record.

Section status: Complete

## 8. Operational Scenarios and Functional Behavior

| ID | Trigger | Preconditions | Behavior or outcome | Related requirements |
| --- | --- | --- | --- | --- |
| FLOW-1 | Operator starts the demo. | Project dependencies are installed and the generated artifact exists. | The operator builds the project, validates the artifact, derives graph output, and records the result. | REQ-1, REQ-2, REQ-3 |
| FUNC-1 | The validation command runs against the generated artifact. | The design-spec validation profile is available. | The command reports whether required sections, table columns, ID uniqueness, and selected references pass. | REQ-1 |
| FUNC-2 | The derive command runs against the generated artifact. | The project build output is current. | The command reports graph nodes and edges derived from current Markdown Trace rules. | REQ-2, REQ-3 |

Section status: Complete

## 9. State Model, Faults, and Misuse Cases

State model: N/A for persistent application state because the demo reads static files and emits command output only.

Faults:

- Missing executable causes the demo to stop before evidence is claimed.
- Validation failure causes the artifact to be revised or marked not ready.
- Empty graph output is recorded as current behavior, not treated as a runtime failure.

Misuse cases:

- Treating `VAL-1` as proof that table IDs are graph nodes.
- Treating empty graph output as proof that table IDs were absent from the artifact.

Section status: Complete

## 10. External Service Levels and Acceptance Cases

| ID | Acceptance case | Expected result | Covers |
| --- | --- | --- | --- |
| ACC-1 | Run design-spec structural validation against the generated artifact. | Validation exits successfully and reports zero errors. | REQ-1, FUNC-1 |
| ACC-2 | Run Markdown Trace graph derivation against the generated artifact. | Derivation exits successfully and emits the current graph result. | REQ-2, FUNC-2 |
| ACC-3 | Compare the two evidence records. | The record states that table IDs validate structurally but are not captured as graph entities today. | REQ-3, FUNC-1, FUNC-2 |

Section status: Complete

## 11. Requirements-to-Behavior Traceability

| Requirement | Behavior | Acceptance | Notes |
| --- | --- | --- | --- |
| REQ-1 | FUNC-1 | ACC-1 | Confirms table-backed design-spec validation. |
| REQ-2 | FUNC-2 | ACC-2 | Confirms graph derivation can be executed against the same artifact. |
| REQ-3 | FUNC-1, FUNC-2 | ACC-3 | Confirms the evidence interpretation separates the two capabilities. |

Section status: Complete

## Layer 2 Exit

Layer 2 status: Complete

Layer 2 decision: Proceed to technical workflow because all externally observable demo behaviors trace to requirements and acceptance cases.

## Layer 3: Technical Specification

## 12. Architecture Overview

Design summary: The demo uses one generated Markdown artifact as the common input to two existing validators. `markdown-engine validate` checks the design-spec structural profile, and `markdown-trace derive` emits the current graph result from the same Markdown.

Components:

- Generated design-spec artifact.
- Design-spec validation profile.
- Markdown Engine validation CLI.
- Markdown Trace derivation CLI.

Key interaction: Both CLIs read the same design-spec file, but only the validation profile has table-column ID extraction rules today.

Section status: Complete

## 13. Technical Mechanisms and Allocation

| ID | Mechanism | Owner | Allocation |
| --- | --- | --- | --- |
| TECH-1 | Build the TypeScript project before graph derivation. | Codex | Local command execution |
| TECH-2 | Run the design-spec validation profile against this artifact. | Codex | Markdown Engine CLI |
| TECH-3 | Run graph derivation against this artifact with a demo namespace. | Codex | Markdown Trace CLI |
| TECH-4 | Interpret validation and graph outputs as separate evidence dimensions. | Codex | Final review record |

Section status: Complete

## 14. Data, Schemas, and Compatibility

Data impact: N/A because the demo does not modify production data, user data, schemas, APIs, events, or configuration contracts.

Compatibility impact: N/A because the demo does not change a public interface.

Generated artifacts: The generated Markdown file is local evidence and may be removed without rollback impact.

Section status: Complete

## 15. Control Logic and Non-Functional Controls

Control logic:

- Run validation before interpreting graph output.
- Treat command exit status as the primary control for deterministic validation.
- Treat graph node and edge counts as current capability evidence, not semantic approval.

Non-functional controls:

- Reversibility is provided by local file deletion.
- Review control is provided by explicit separation of `VAL-1`, `VAL-2`, and `VAL-3`.

Section status: Complete

## 16. Observability, Operations, Rollout, and Rollback

| Signal | Type | Purpose | Consumer |
| --- | --- | --- | --- |
| Validation exit code | Command result | Confirms whether the structural profile passed. | Maintainer |
| Validation JSON | Evidence artifact | Shows deterministic profile findings. | Maintainer |
| Graph node count | Command result | Shows whether graph entities were derived. | Maintainer |
| Graph edge count | Command result | Shows whether graph relationships were derived. | Maintainer |

Rollout: Run the demo locally in the current checkout only.

Rollback: Delete the generated evidence artifact if it is not needed after review.

Section status: Complete

## 17. Verification Strategy and Behavior-to-Mechanism Traceability

| ID | Verification method | What is verified | Related IDs |
| --- | --- | --- | --- |
| VAL-1 | Run `node_modules/.bin/markdown-engine validate --file docs/evidence/generated-design-spec-demo.md --profile /Users/jasonbelmonti/.codex/skills/design-spec/references/design-spec-validation-profile.yaml --format json`. | The generated artifact satisfies structural section, table column, ID uniqueness, and configured reference checks. | REQ-1, FUNC-1, ACC-1, TECH-2 |
| VAL-2 | Run `node dist/markdowntrace/cli.js derive --document docs/evidence/generated-design-spec-demo.md --namespace design-demo`. | The same artifact produces the current graph derivation output. | REQ-2, FUNC-2, ACC-2, TECH-3 |
| VAL-3 | Compare `VAL-1` and `VAL-2` results in the final review record. | The evidence separates table ID validation from graph entity capture. | REQ-3, FUNC-1, FUNC-2, ACC-3, TECH-4 |

Section status: Complete

## 18. Alternatives, Risks, Open Questions, and Final Exit

Alternatives considered:

- Use an existing design-spec example. Rejected because the demo needs a generated artifact with explicit table IDs tied to this project question.
- Use only `markdown-trace derive`. Rejected because it would not demonstrate design-spec profile validation.

| ID | Statement | Likelihood | Consequence | Mitigation |
| --- | --- | --- | --- | --- |
| RISK-1 | The demo may be mistaken for implementation of table-backed graph derivation. | Medium | Incorrect capability claim. | State the validation and graph derivation distinction in the review record. |
| RISK-2 | Validation may pass structurally while semantic traceability remains only manually reviewed. | Medium | Overstated approval. | Label validation as a baseline structural pass only. |

Open questions:

- Q-1: Should a future candidate graph implementation promote table-backed design-spec IDs into graph entities? Owner: Jason Belmonti. Due: next planning pass. Resolution plan: convert current evidence into a bounded task definition if approved.

Waivers: None.

Final readiness statement: Ready for local demonstration of current validation and graph derivation behavior, not ready as evidence that table-backed graph capture is implemented.

Section status: Complete

## Final Consistency Gate

Problem-to-requirements check: REQ-1, REQ-2, and REQ-3 directly address the ambiguity described in section 1.

Requirements-to-behavior check: Section 11 maps every requirement to behavior and acceptance evidence.

Behavior-to-mechanism check: Section 17 maps validation and derivation behavior to concrete mechanisms and verification commands.

Graph limitation check: The artifact intentionally keeps traceability IDs in tables so an empty derived graph demonstrates current derivation coverage, not absence of design-spec tags.

Rigor check: `R1` remains valid because the demo is local, reversible, and does not change source behavior.

Final status: Complete
