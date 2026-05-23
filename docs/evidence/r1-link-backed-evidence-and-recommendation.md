# EVD-8: R1 Link-Backed Evidence and Recommendation

Evidence ID: `EVD-8`
Validation checkpoint: `VAL-8`
Work package: `R1-WP-5`
Status: Complete recommendation with final local validation passing on 2026-05-23
Related tickets: `BEL-1064`, `BEL-1170`, `BEL-1171`

## Decision Summary

Recommended R1 outcome: `CONTINUE`

Recommended artifact strategy: generate checked sidecar registry artifacts from link-backed annotated Markdown, while supplementing the existing YAML sidecar path during transition. Do not replace YAML sidecars as the only supported path until generated registry output has explicit migration checks and review policy.

R1 proves that `ctx://trace` Markdown links can carry document-local entity identity, references, bounded ranges, and configurable domain type profiles without changing Markdown Trace core taxonomy. The evidence supports moving the authoring source toward annotated Markdown because identity and references stay near the prose they describe. The evidence does not support a direct replacement yet because R0 YAML sidecars remain the compatibility control and production migration behavior is outside R1.

## Evidence Inventory

| Evidence | Artifact | Validation | Result |
| --- | --- | --- | --- |
| R1 fixture coverage | `fixtures/r1-link-backed-entity-syntax/*.md`, `fixtures/r1-link-backed-entity-syntax/*.yaml` | `tests/test_trace_link_facts.test.ts`, `tests/test_type_profiles.test.ts`, `tests/test_r1_link_backed_graph.test.ts` | Inline definitions, reference-style definitions, body references, bounded ranges, and configurable profiles are covered. |
| Deterministic R1 failures | R1 unit and integration tests | `tests/test_type_profiles.test.ts`, `tests/test_trace_link_facts.test.ts`, `tests/test_r1_link_backed_graph.test.ts` | Missing profile data, unknown types, malformed profiles, type mismatches, duplicate IDs or labels, missing references, and incomplete ranges fail deterministically. |
| R0 compatibility | R0 fixture and validation tests | `tests/test_valid_fixture_validation.test.ts`, `tests/test_derived_registry_graph.test.ts`, `npm run validate:fixture`, `npm run derive:fixture` | Existing YAML sidecar validation and R0 derived-registry behavior remain compatible. |
| Local CLI/report surface | `src/markdowntrace/cli.ts`, `tests/test_cli.test.ts` | `derive --type-profile`, failure-surface stderr assertions | R1 fixture output is available locally through CLI derive, and supported failure surfaces are identified. |
| Recommendation basis | This document plus R0 `docs/evidence/prototype-decision-record.md` | Evidence comparison below | Link-backed Markdown should generate checked sidecar artifacts first, supplement YAML during transition, and replace only after follow-up migration criteria. |

## Fixture Coverage

| Required coverage | Evidence | Result |
| --- | --- | --- |
| Inline heading definitions | `minimal-link-backed-execution-spec.md`; `tests/test_r1_link_backed_graph.test.ts` | `ctx://trace/entity/<canonical-id>?type=<entity-type>` heading links derive canonical registry entities. |
| Reference-style heading definitions | `syntax-breadth-link-backed-execution-spec.md`; `tests/test_trace_link_facts.test.ts` | Reference-style definitions derive equivalent entity facts to inline definitions. |
| Body references | `minimal-link-backed-execution-spec.md`; `codefactory-link-backed-spec.md`; R1 tests | Body `ctx://trace/entity/<canonical-id>` links derive expected references and graph edges. |
| Bounded ranges | `syntax-breadth-link-backed-execution-spec.md`; R0-style parity and CODEFACTORY range tests | `ctx://trace/range/<start-label>/<end-label>` expands registered label ranges and rejects missing endpoints or interior gaps. |
| Configurable type profiles | `minimal-type-profile.yaml`; `codefactory-type-profile.yaml`; `tests/test_type_profiles.test.ts` | Profile files define the accepted type set and optional label/canonical-ID constraints without core taxonomy changes. |

## Deterministic Failure Outcomes

| Failure category | Evidence | Failure surface |
| --- | --- | --- |
| Missing profile data | Non-R0 `ctx://trace` document without active profile in `tests/test_type_profiles.test.ts`; CLI test for missing `--type-profile` | `profile_validation` |
| Unknown types | Closed-profile unknown type case in `tests/test_type_profiles.test.ts` | `profile_validation` |
| Malformed profiles | Bad root value, profile version, empty entity map, invalid type name, invalid label prefix, and invalid regex tests | `profile_validation` |
| Type mismatches | Repeated reference type mismatch in `tests/test_trace_link_facts.test.ts` | `profile_validation` |
| Duplicate canonical IDs | Duplicate canonical ID test in `tests/test_r1_link_backed_graph.test.ts` | `registry_derivation` |
| Duplicate labels | Duplicate label test in `tests/test_r1_link_backed_graph.test.ts` | `registry_derivation` |
| Missing references | Missing `ctx://trace` reference target test in `tests/test_r1_link_backed_graph.test.ts` and CLI failure-surface test | `registry_derivation` |
| Incomplete ranges | Missing endpoint and missing interior label tests in `tests/test_r1_link_backed_graph.test.ts` | `registry_derivation` |
| Parser diagnostics | CLI malformed-frontmatter test | `link_parsing` |

Graph validation is not a separately modeled failure surface in R1. Current graph output is a deterministic projection from a valid registry; registry derivation must fail before graph projection when link-backed references or ranges are invalid.

## R0 Compatibility Confirmation

R0 remains YAML-first and historically accurate. R1 does not rewrite R0 evidence or claim that link-backed syntax was implemented in R0.

The compatibility boundary is:

| R0 behavior | Evidence | Result |
| --- | --- | --- |
| YAML sidecar validation remains accepted | `npm run validate:fixture`; `tests/test_valid_fixture_validation.test.ts`; `docs/evidence/valid-fixture-report.md` | Valid R0 fixture continues to validate with 0 findings. |
| Heading-derived registry behavior remains accepted | `npm run derive:fixture`; `tests/test_derived_registry_graph.test.ts` | R0-style heading derivation still produces registry and graph facts. |
| R0 evidence remains historically scoped | `docs/evidence/prototype-decision-record.md` | R0 recommendation remains a pivot baseline, not a retroactive R1 implementation claim. |

## Authoring Comparison

| Dimension | YAML sidecar authoring | Link-backed annotated Markdown authoring | R1 signal |
| --- | --- | --- | --- |
| Source locality | Entity identity, references, ranges, and edges are maintained outside the prose. | Identity and references live in ordinary Markdown links near the prose. | Link-backed authoring reduces source-of-truth distance. |
| Human readability | Markdown prose stays clean, but the registry must be cross-checked manually. | Link text stays human-readable while `ctx://trace` carries machine identity. | Link-backed syntax remains reviewable in plain Markdown. |
| Type taxonomy | R0 sidecar carries fixed fixture types for the prototype. | Active type profiles define domain-specific closed type sets. | R1 supports domain profiles such as CODEFACTORY without core type changes. |
| Determinism | R0 has deterministic sidecar validation and reports. | R1 deterministically rejects malformed profiles, unknown types, duplicates, missing references, type mismatches, and incomplete ranges. | Determinism is preserved. |
| Compatibility | Existing R0 path is stable and useful as a control. | R1 can derive registry and graph output from annotated Markdown. | Generate checked sidecar artifacts before replacement. |

## CLI and Report Surface

The local CLI now supports profiled R1 fixture derivation:

```bash
node dist/markdowntrace/cli.js derive \
  --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml
```

```bash
node dist/markdowntrace/cli.js derive \
  --document fixtures/r1-link-backed-entity-syntax/codefactory-link-backed-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/codefactory-type-profile.yaml
```

Supported failure surfaces are identified on stderr as:

| Surface | Meaning |
| --- | --- |
| `link_parsing` | Markdown parser or normalization diagnostics blocked derivation. |
| `profile_validation` | Type profile loading or entity type/profile rule validation blocked derivation. |
| `registry_derivation` | Registry construction or trace-link integrity blocked derivation. |

`graph_validation` is not emitted in R1 because graph projection currently has no independent validation phase after registry derivation succeeds.

## Final Recommendation

Continue the R1 direction and make annotated Markdown the preferred authoring source for the next experiment slice.

The next implementation should generate a checked registry artifact from link-backed Markdown rather than immediately replacing YAML sidecars. During transition, generated artifacts should supplement existing YAML sidecars so reviewers can compare derived output against the known R0 control. Replacement should wait until a later task defines migration criteria, artifact review policy, and compatibility guarantees.

Decision record:

| Option | Recommendation | Reason |
| --- | --- | --- |
| Replace YAML sidecars now | Do not approve yet. | R1 is an experiment and has no migration or production rollout criteria. |
| Supplement YAML sidecars | Approve during transition. | Keeps R0 compatibility while adding link-backed evidence. |
| Generate checked registry artifacts from annotated Markdown | Preferred next step. | Preserves reviewable registry artifacts while reducing YAML-first authoring maintenance. |

## Validation Status

Final local validation passed on 2026-05-23 from the BEL-1171 worktree.

| Command or check | Result | Evidence |
| --- | --- | --- |
| `npm test` | Passed | 11 test files and 89 tests passed. |
| `npm run typecheck` | Passed | `tsc --noEmit` completed with exit code 0. |
| `npm run build` | Passed | `tsc -p tsconfig.build.json` completed with exit code 0. |
| `npm run validate:fixture` | Passed | R0 valid fixture report emitted `Status` `PASS`, `Exit code` `0`, and 0 findings. |
| `npm run derive:fixture` | Passed | R0 fixture derived registry and graph output with empty diagnostics. |
| R1 minimal CLI derive command | Passed | R1 minimal fixture derived registry and graph output with empty diagnostics. |
| R1 CODEFACTORY CLI derive command | Passed | CODEFACTORY fixture derived domain-specific registry and graph output with empty diagnostics. |
| `git diff --check` | Passed | No whitespace errors. |
