---
type: TaskDefinition
title: Integrate profile validation into the graph package
task_id: task-definition-trace-pilot
artifact_version: "3.0"
revision: "3"
created_at: "2026-09-17T12:28:29Z"
updated_at: "2026-09-17T14:41:11Z"
validation_profile: skills/task-definition/profiles/task-definition.yaml
producer:
  skill: task-definition
  trace_convention: experiments/task-definition-trace/authoring.md
---

## Task Control

| Contract state | Execution route | State rationale |
| --- | --- | --- |
| READY | DIRECT | Source authority, Engine structural validation, semantic quality and post-draft review pass for the bounded package integration. Fresh implementation evidence is required for this revision. |

## Objective

Expose the proven profile-driven validator through the experimental graph package.
Reuse one Engine parse for analysis and validation, preserve the trial's defect
detection, and identify granular review boundaries against freshly fetched main.

## Context / Constraints

- Use public Markdown Engine structure/source APIs and the existing Trace graph.
- Apply the opt-in convention in authoring.md to criteria, checks and slices.
- Preserve the existing profile schema, package-root API and CLI. Add typed
  validation exports under experimental/graph using the proven versioned schema.
- Keep the installed skill unchanged. Do not add rule operators or syntax cases.
- Passing machine checks does not establish semantic readiness or implementation completion.

## Source Authority

| Source | Authority | Status | Task implication |
| --- | --- | --- | --- |
| Owner's request for package integration followed by review-boundary identification in this conversation | Outcome and scope | Confirmed | Ship typed package exports, share the Engine capture, retain proof and compare the complete local diff with latest main. |
| Installed task-definition skill and Engine structural profile | Artifact contract | Read | Preserve its headings, lifecycle, criterion IDs, evidence coverage and semantic review gates. |
| Markdown Trace origin/main at c1c1c4b7a767c5f864e6a47b798363e29d115567, fetched for this revision | Runtime baseline | Inspected | Extend the existing graph and private analysis state; preserve analysis identity, direct queries and Mermaid snapshot behavior. |

## Task Scope

| Scope item | Classification | Approval impact | Notes |
| --- | --- | --- | --- |
| Typed profile compiler and graph validation package exports | In scope | blocking | Port the proven selectors and four operators, reject unsupported configuration, and use package Outcome results. Remove the parallel experiment implementation. |
| Shared Engine capture and retained consumer proof | In scope | blocking | Parse once per analysis; repeated validation uses retained source structure and graph indexes. Preserve deterministic located reports and graph facts. |
| Packaging, compatibility and bounded review handoff | In scope | blocking | Exercise a clean packed consumer, run ci:enforcement, align usage guidance, and map changed files and proof to granular review boundaries against latest main. |
| Additional policy operators, installed-skill activation and publication | Follow-up | non-blocking | Preserve the bounded experimental contract; do not expand this integration into a release or syntax redesign. |

## Materially Verifiable Success Criteria

| ID | Criterion | Proof | Required before done |
| --- | --- | --- | --- |
| [TD-SC-1](ctx://trace/entity/TD-SC-1?role=definition) | The local checker rejects a validation row whose declaration link is removed while its visible text remains, and locates that row. | Invoke the same command used for authoring on the valid task and a disposable copy with one declaration removed. The ordinary structural profile still passes the copy; the added check fails at the affected Check cell. | Yes |
| [TD-SC-2](ctx://trace/entity/TD-SC-2?role=definition) | The checker rejects a validation with no slice connection and a verifies destination that disagrees with its row's visible criterion ID. | Independently remove one slice evidence link and redirect one verifies link to another existing criterion without changing its label. Both copies retain structural validity but must produce distinct, located trace failures. | Yes |
| [TD-SC-3](ctx://trace/entity/TD-SC-3?role=definition) | A packed consumer can typecheck and run profile compilation, document analysis and validation. Analysis parses once; validation reuses that capture without changing graph facts. Compatibility checks pass and granular review boundaries identify the latest-main diff. | Preserve seven identities, six edges, defect/repair outcomes, profile changes, renamed source locations and vocabulary. Assert one Engine parse/normalize across analysis plus repeated validation, deterministic reports, rejection of invalid configuration and handles, and interpretation mismatch. Run the packed consumer and ci:enforcement; record the base SHA, tested inputs and review mapping. | Yes |

## Incremental Value Delivery

| Slice | Value proven | Risk retired | Evidence | Stop / continue decision |
| --- | --- | --- | --- | --- |
| [Detect annotation omissions before handoff](ctx://trace/entity/SLICE-1?role=definition) | Authors control validation through data and receive precise repair guidance. | Hidden TaskDefinition rules in code and policy changes that alter extracted facts. | [Declaration coverage probe](ctx://trace/entity/VAL-1?rel=verified-by), [relationship probes](ctx://trace/entity/VAL-2?rel=verified-by), and [valid task and repair checks](ctx://trace/entity/VAL-3?rel=verified-by). | Finish when defect/repair outcomes, profile changes, repeatability and source/graph preservation are proven. |

## Review Boundary

| Boundary | In scope for review | Out of scope / follow-up | Approval impact |
| --- | --- | --- | --- |
| Validation and source capture | Profile-controlled coverage, required relations, configuration rejection, one Engine parse, reusable analysis and deterministic located rule reports | Implied prose completeness and exhaustive syntax cases | Incorrect verdicts, ignored configuration, extra parsing during validation or changed graph facts block. |
| Package and consumer integration | Typed exported contracts, packed execution, legacy regression checks, removal of duplicate runtime and review boundaries covering the complete latest-main diff | Stable API approval, new CLI commands, installed-skill rollout and publication | Unusable exports, duplicate implementations, compatibility regressions or misleading capability documentation block. |

## Validation / Evidence

| Criterion ID | Check | Evidence | Runner / owner | Required before done |
| --- | --- | --- | --- | --- |
| [TD-SC-1](ctx://trace/entity/TD-SC-1?rel=verifies) | [Remove one declaration while retaining its text](ctx://trace/entity/VAL-1?role=definition) | Command exits with failure, structural validation remains valid, and the trace diagnostic identifies the affected source cell. Record the task, checker, profile and runtime fingerprints with the result. | Implementer | Yes |
| [TD-SC-2](ctx://trace/entity/TD-SC-2?rel=verifies) | [Remove a slice link and misdirect a criterion link](ctx://trace/entity/VAL-2?role=definition) | Each isolated mutation fails for the expected missing-slice or criterion-mismatch reason at a source location; ordinary structural checks pass. | Implementer | Yes |
| [TD-SC-3](ctx://trace/entity/TD-SC-3?rel=verifies) | [Inspect profiles, repeated validation and restored documents](ctx://trace/entity/VAL-3?role=definition) | Package-based trial and focused tests retain strict/relaxed and layout proof. An Engine call-count test proves shared capture; a clean packed consumer proves types and actual runtime exports. ci:enforcement protects legacy behavior. Retain input/runtime fingerprints and map changed files to review boundaries against the fetched base. | Implementer | Yes |

## Execution Notes

Read this complete task and verify its adjacent checksum before resuming or
reviewing. Use existing public Engine operations and the package's analysis state.
Revision one proved the fixed checker; revision two proved external profiles.
Revision three integrates that bounded behavior into the package with shared
capture and a latest-main review handoff. Earlier results do not establish
completion of this revision. The original authored task remains the source fixture.

## Follow-up / Non-blocking Work

Installed-skill activation, additional selectors or policy operators, traversal,
context assembly, production scale evidence and publication are separate work.
