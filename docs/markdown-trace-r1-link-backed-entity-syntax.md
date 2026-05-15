# Markdown Trace R1: Link-Backed Entity Syntax Candidate

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace R1: Link-Backed Entity Syntax Candidate |
| Status | Draft follow-on candidate |
| Author(s) | Codex |
| Reviewers | Jason Belmonti |
| Decision owner | Jason Belmonti |
| Last updated | 2026-05-15 |
| Source authority | `docs/evidence/prototype-decision-record.md` |
| Related docs | `docs/markdown-trace-r0-document-local-entity-registry.md`; `docs/markdown-trace-e0-document-local-entity-registry-execution.md` |
| Related tickets | BEL-899; BEL-900; BEL-1064 |

## 1. Summary

R0 proves that document-local entity validation is useful, but the YAML-first source of truth creates authoring overhead. This R1 candidate defines a follow-on syntax experiment that uses ordinary Markdown links to carry stable Markdown Trace identity directly in the document.

The syntax is intentionally Markdown-native: both inline links and reference-style links are valid. Link text remains the human label. The `ctx://trace` URL carries machine-readable identity.

## 2. Goals and Non-Goals

| ID | Statement |
| --- | --- |
| G-1 | Let authors define and reference Markdown Trace entities using standard Markdown link syntax. |
| G-2 | Preserve the R0 separation between canonical IDs such as `exec.wp.1` and human labels such as `WP-1`. |
| G-3 | Allow a future implementation to derive or supplement the registry from annotated Markdown. |
| NG-1 | Do not change R0 evidence or claim link-backed syntax was implemented in R0. |
| NG-2 | Do not move generic Markdown parsing or URL semantics into `markdown-engine` for this candidate. |
| NG-3 | Do not introduce live Linear, Jira, graph database, or multi-document projection behavior. |

## 3. Syntax Contract

Entity definition in a heading:

```md
### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Build parser
```

Equivalent reference-style definition:

```md
### [WP-1]: Build parser

[WP-1]: ctx://trace/entity/exec.wp.1?type=work_package
```

Entity reference in body prose:

```md
This depends on [CON-2](ctx://trace/entity/exec.con.2?type=constraint).
```

Equivalent reference-style body reference:

```md
This depends on [CON-2].

[CON-2]: ctx://trace/entity/exec.con.2?type=constraint
```

Bounded range reference:

```md
This satisfies [VAL-3 through VAL-5](ctx://trace/range/VAL-3/VAL-5).
```

## 4. URL Shape

| URL form | Meaning |
| --- | --- |
| `ctx://trace/entity/<canonical-id>?type=<entity-type>` | Identifies one document entity. |
| `ctx://trace/range/<start-label>/<end-label>` | Identifies a bounded label range. |

Initial rules:

- `ctx` is the scheme.
- `trace` is the namespace.
- `entity` and `range` are the initial URL kinds.
- The URL path carries canonical identity or range endpoints.
- The Markdown link text remains the display label.
- Inline and reference-style links are semantically equivalent.
- Heading links define entities.
- Body links reference entities or ranges.

## 5. Relationship to R0

R0 remains YAML-first and heading-derived. This R1 candidate is a follow-on experiment, not a correction to R0.

A future implementation should preserve the existing R0 sidecar registry path while testing link-backed authoring in separate fixtures. The first implementation slice should prove that link-backed definitions and references can produce the same entity graph facts as the R0 registry for a small fixture.

## 6. Validation Scenarios

| Scenario | Expected result |
| --- | --- |
| Inline heading entity definition | Produces one canonical entity with the heading label. |
| Reference-style heading entity definition | Produces the same entity as the inline form. |
| Body entity reference | Resolves to the referenced canonical entity. |
| Bounded range reference | Expands to registered labels in the range and reports missing endpoints. |
| Duplicate canonical ID | Fails deterministically. |
| Duplicate human label | Fails deterministically unless an approved alias rule exists. |
| Plain issue key such as `BEL-858` | Remains outside the document entity graph unless explicitly linked or registered. |
| Existing YAML sidecar fixture | Continues to validate through the R0 path during the transition. |

## 7. Open Decisions for Implementation Planning

| ID | Question | Default for next plan |
| --- | --- | --- |
| R1-Q1 | Should link-backed Markdown replace YAML or generate a checked registry artifact? | Generate or supplement first; replace only after fixture parity is proven. |
| R1-Q2 | Should `type` be required on every entity link or inferred from label family? | Require `type` initially for explicitness. |
| R1-Q3 | Should range URLs use labels or canonical IDs? | Use labels initially because ranges are author-facing prose constructs. |
| R1-Q4 | Should body references require `ctx://trace` URLs or allow bare `[WP-1]` references once defined? | Require explicit `ctx://trace` URLs for the first implementation slice. |
