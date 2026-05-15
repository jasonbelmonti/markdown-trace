# EVD-7: Prototype Decision Record

Evidence ID: `EVD-7`
Validation checkpoint: `VAL-7`
Work package: `WP-5`
Status: Draft recommendation pending MS-2 and MS-3 approval
Related tickets: `BEL-899`, `BEL-900`, `BEL-1064`

## Decision Summary

Recommended MS-3 outcome: `PIVOT`

The R0 prototype proves that document-local entity validation is valuable: the fixture family can distinguish canonical IDs from human labels, catch required broken-reference categories, preserve issue-key collision behavior, emit deterministic reports, and run with local-safety evidence. The sidecar YAML registry is useful as an R0 control surface, but its maintenance cost is high enough that the next slice should pivot the authoring source toward Markdown-native entity annotations instead of expanding the YAML-first model.

The recommended follow-on experiment is link-backed Markdown Trace syntax using standard Markdown inline links and reference-style links with `ctx://trace` URLs. R0 remains historically accurate: YAML plus heading-derived definitions were the implemented prototype path, and link-backed syntax is a post-R0 experiment candidate.

## Evidence Inventory

| Evidence | Artifact | Validation | Result |
| --- | --- | --- | --- |
| `EVD-1` | `docs/evidence/registry-fixture-inventory.md` | `VAL-1` | Registry shape separates canonical IDs, labels, entity types, definition expectations, edges, and external references. |
| `EVD-2` | `docs/evidence/valid-fixture-report.md` | `VAL-2` | Valid fixture exits `PASS` with 0 findings. |
| `EVD-3` | `docs/evidence/negative-fixture-report.md` | `VAL-3` | Required negative categories are covered by validator findings or registry-load failures. |
| `EVD-4` | `docs/evidence/determinism-repeat-report.md` | `VAL-5` | Sidecar validation and derived registry generation are byte-identical across 3 runs. |
| `EVD-5` | `docs/evidence/issue-key-collision-report.md` | `VAL-4` | `BEL-858` remains outside sidecar and derived document entity graphs. |
| `EVD-6` | `docs/evidence/local-safety-report.md` | `VAL-6` | Selected command paths record zero network attempts and no unapproved local writes. |

## Usability Assessment

Canonical dotted IDs such as `exec.wp.1` are stable enough for machine identity and graph edges. Human labels such as `WP-1` are readable enough for execution-spec prose and review. The separation works mechanically and should remain part of the model.

The weak point is authoring locality. R0 requires authors or agents to maintain entity definitions in Markdown while also maintaining labels, canonical IDs, definition expectations, references, ranges, and edges in a separate YAML file. That split makes the source of truth less obvious during ordinary Markdown editing.

## Maintenance Signal

The R0 fixture registry contains:

| Registry element | Count |
| --- | ---: |
| Registered entities | 14 |
| Declared edges | 11 |
| Expected label references | 12 |
| Expected ranges | 1 |
| External references | 2 |

The negative evidence demonstrates valuable failure detection across missing registered definitions, duplicate canonical IDs, duplicate labels, missing references, missing edge targets, and incomplete bounded ranges. That value is real, but the sidecar registry requires more explicit maintenance entries than the number of failure categories proven in the fixture.

This satisfies the R0 learning goal but triggers the maintenance-cost pivot condition from the source design: do not scale the YAML-first authoring model without testing whether Markdown-native annotations can lower registry upkeep.

## Q-2 Resolution

Q-2: Should YAML remain source of truth or should annotated Markdown generate the registry?

Recommended resolution: keep YAML as the R0 historical and compatibility source, but pivot the next experiment toward deriving or supplementing registry identity from annotated Markdown.

The recommended syntax direction is standard Markdown links carrying Markdown Trace context URLs:

```md
### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Build parser
```

```md
### [WP-1]: Build parser

This depends on [CON-2] and [VAL-3 through VAL-5].

[WP-1]: ctx://trace/entity/exec.wp.1?type=work_package
[CON-2]: ctx://trace/entity/exec.con.2?type=constraint
[VAL-3 through VAL-5]: ctx://trace/range/VAL-3/VAL-5
```

The sibling `markdown-context` project demonstrates the same general pattern: normal Markdown links remain readable to humans while typed URLs carry machine-readable context.

## Continue, Pivot, or Stop Criteria

| Criterion | R0 result | Recommendation |
| --- | --- | --- |
| Valid fixture result | Passed with 0 findings. | Continue validating document-local entity semantics. |
| Broken fixture detection | Required categories are proven by findings or registry-load failures. | Continue the validation rule set. |
| Collision behavior | Issue-like keys stay outside the entity graph by default. | Continue external-reference separation. |
| Determinism | Repeated command output is stable. | Continue deterministic report requirements. |
| Maintenance signal | YAML upkeep is heavier than the proven failure-category count. | Pivot authoring source toward link-backed Markdown annotations. |

## MS-3 Recommendation

Approve R0 as a successful local proof of value, then pivot the next slice to link-backed Markdown entity syntax. Do not retrofit R0 docs or evidence to claim link-backed syntax is implemented. The follow-on design package should define `ctx://trace` link semantics, fixture coverage, compatibility behavior with existing YAML registries, and migration criteria. `BEL-1064` tracks this deferred post-R0 implementation candidate.
