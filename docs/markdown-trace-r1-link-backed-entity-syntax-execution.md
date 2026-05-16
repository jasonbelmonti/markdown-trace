# Markdown Trace R1: Link-Backed Entity Syntax Execution Plan

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace R1: Link-Backed Entity Syntax Execution Plan |
| Status | Draft execution plan |
| Author(s) | Codex |
| Executor(s) | Prototype implementer |
| Reviewers | Jason Belmonti |
| Decision owner | Jason Belmonti |
| Last updated | 2026-05-16 |
| Source docs | `docs/evidence/prototype-decision-record.md`; `docs/markdown-trace-r1-link-backed-entity-syntax.md` |
| Related tickets | BEL-1064 |

## 1. Objective

Implement the post-R0 pivot by proving that Markdown Trace can derive entity definitions, references, ranges, and graph facts from standard Markdown links that use `ctx://trace` URLs.

The implementation must make entity types configurable. Markdown Trace should validate the active document against a local type profile rather than hardcoding the R0 execution-spec taxonomy.

## 2. Constraints

- Preserve the existing R0 YAML sidecar validation path during the R1 experiment.
- Keep Markdown parsing inside the published `@jasonbelmonti/markdown-engine` package-root API boundary.
- Do not introduce live Linear, Jira, network, graph database, service daemon, or multi-document projection behavior.
- Do not treat `CODEFACTORY`, execution-spec IDs, or any other domain taxonomy as built-in Markdown Trace core behavior.
- Fail deterministically for invalid links, missing profile data, unknown types, conflicting type declarations, and profile-rule violations.

## 3. Interface Decisions

| Decision | R1 rule |
| --- | --- |
| Entity definition syntax | A heading link defines an entity when its URL is `ctx://trace/entity/<canonical-id>?type=<entity-type>`. |
| Entity reference syntax | A body link references an entity when its URL is `ctx://trace/entity/<canonical-id>`. |
| Repeated reference type | A reference may include `type`, but if present it must match the definition type. |
| Definition type source | Definition links must include `type`; inference from label family is not allowed in the first slice. |
| Type validation source | The active type profile defines valid entity types and optional label/canonical-ID constraints. |
| Profile discovery | Use CLI `--type-profile`, then document frontmatter, then the built-in execution-spec profile only for recognized R0 compatibility fixtures. Non-R0 documents without a profile fail for missing profile data. |
| Range syntax | Use `ctx://trace/range/<start-label>/<end-label>` for the first slice. |

## 4. Type Profile Contract

Initial profile shape:

```yaml
profileVersion: markdown-trace.type-profile.v1
entityTypes:
  work_package:
    labelPrefixes: [WP]
    canonicalPattern: "^exec\\.wp\\.\\d+$"
  constraint:
    labelPrefixes: [CON]
    canonicalPattern: "^exec\\.con\\.\\d+$"
  codefactory_component:
    labelPrefixes: [CF-COMP]
    canonicalPattern: "^codefactory\\.component\\.[a-z0-9.-]+$"
```

Validation rules:

- `entityTypes` is closed by default.
- `type` on definition links must exist in `entityTypes`.
- `labelPrefixes` and `canonicalPattern` are optional but enforced when present.
- Multiple definitions for one canonical ID must agree on type.
- References that repeat `type` must match the resolved definition.
- Built-in execution-spec types are compatibility defaults only for recognized R0 fixtures, not global Markdown Trace types.
- Non-R0 documents must supply a CLI or frontmatter profile before entity-link validation can pass.

## 5. Work Packages

| ID | Objective | Output | Validation |
| --- | --- | --- | --- |
| R1-WP-1 | Add fixture inputs for link-backed entities and configurable type profiles. | Link-backed execution-spec fixture, `CODEFACTORY`-style fixture, and profile fixtures. | Fixture inspection proves inline/reference definitions, references, ranges, and type-profile examples exist. |
| R1-WP-2 | Implement type-profile loading and deterministic diagnostics. | Profile model, loader, CLI/profile discovery, and profile validation errors. | Tests cover missing profile, unknown type, malformed profile, and rule violations. |
| R1-WP-3 | Derive entity facts from `ctx://trace` links. | Link-backed definition/reference/range adapter facts using `markdown-engine` link references. | Tests cover inline links, reference-style links, source ranges, missing definition type, and repeated reference type mismatch. |
| R1-WP-4 | Integrate link-backed facts with registry/graph generation while preserving R0 compatibility. | Derived registry/graph output for link-backed fixtures plus unchanged R0 sidecar behavior. | Tests prove graph parity for a small R0-style fixture, `CODEFACTORY` profile support, deterministic duplicate handling, and existing fixture regression. |
| R1-WP-5 | Record R1 evidence and next decision. | Evidence note comparing YAML sidecar maintenance against link-backed profile authoring. | Evidence states continue/pivot/stop for replacing, supplementing, or generating sidecar registry artifacts. |

## 6. Acceptance Criteria

- Link-backed entity definitions require `type` and validate it against the active type profile.
- Entity references may omit `type` only after the canonical entity is defined.
- Unknown profile types, conflicting types, profile rule violations, missing definitions, duplicate canonical IDs, duplicate labels, and incomplete ranges fail deterministically.
- A `CODEFACTORY`-style profile can define domain-specific types without Markdown Trace code changes.
- Existing R0 YAML sidecar validation and derived-registry behavior remain compatible.
- Reports identify whether a finding came from link parsing, profile validation, registry derivation, or graph validation.

## 7. Project Management Alignment

`BEL-1064` is the initial issue of record for this R1 prototype. Track it under a lightweight Markdown Trace R1 project so it does not drift into the separate `markdown-context` MVP project.

Keep `BEL-1064` as a single implementation issue until execution estimation proves that the work should split into child issues. If the implementation expands beyond one reviewable PR, split it by the work packages above rather than by file path.
