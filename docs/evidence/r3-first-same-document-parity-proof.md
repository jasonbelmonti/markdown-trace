# EVD-1: First Same-Document Parity Proof

Evidence ID: `EVD-1`
Validation checkpoint: `VAL-1`
Work package: `R3-1C`
Related issue: `BEL-1232`
Status: Complete first parity proof on 2026-05-29

## Objective

Compare the selected same-document manual/generated fixture pair across registry, graph, metadata, and validation dimensions before any source-authority change.

## Selected Fixture Pair

| Field | Value |
| --- | --- |
| Source document | `fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md` |
| Manual registry | `fixtures/r1-link-backed-entity-syntax/minimal-link-backed-manual-registry.yaml` |
| Generated sidecar | `fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml` |
| Type profile | `fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml` |
| Fixture family | `r1-link-backed-entity-syntax` |
| Authority state | `yaml-authoritative`; generated sidecar remains checked evidence only. |

## Dimension Classification

| Dimension | Classification | Delta count | Evidence | Approval impact |
| --- | --- | ---: | --- | --- |
| Registry | `equivalent` | 0 | Manual and generated registries normalize to the same `registryVersion`, `document`, `entities`, `edges`, and `externalRefs` entries. | Passes `MS-1` proof boundary. |
| Graph | `equivalent` | 0 | Graphs derived from both registries have the same deterministic node and edge entries. | Passes `MS-1` proof boundary. |
| Metadata | `intentional` | 16 | Manual YAML has no `generated.*` metadata while the fixture remains `yaml-authoritative`; generated sidecar metadata is present and checked under the R2 contract. | Intentional transition delta; not authority approval. |
| Validation | `equivalent` | 0 | Manual and generated validation results both exit `0`, report `valid: true`, and resolve 2 entities, 2 definitions, 1 expected reference, 0 ranges, 1 edge, and 0 findings. | Passes `MS-1` proof boundary. |

Comparison report summary from the built implementation:

```json
{
  "exitCode": 0,
  "dimensions": [
    {
      "dimension": "registry",
      "status": "equivalent",
      "deltaCount": 0
    },
    {
      "dimension": "graph",
      "status": "equivalent",
      "deltaCount": 0
    },
    {
      "dimension": "metadata",
      "status": "intentional",
      "deltaCount": 16
    },
    {
      "dimension": "validation",
      "status": "equivalent",
      "deltaCount": 0
    }
  ]
}
```

## Command Evidence

| Check | Command | Result |
| --- | --- | --- |
| Focused parity tests | `npm test -- tests/test_migration_comparison.test.ts` | Passed: 1 test file, 9 tests. |
| Selected manual validation | `node dist/markdowntrace/cli.js validate --registry fixtures/r1-link-backed-entity-syntax/minimal-link-backed-manual-registry.yaml --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md` | Exited `0`; status `PASS`; findings `0`. |
| Selected generated sidecar check | `node dist/markdowntrace/cli.js derive-sidecar --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml --check` | Exited `0`; printed the checked generated sidecar path. |
| TypeScript typecheck | `npm run typecheck` | Exited `0`. |
| Full test suite | `npm test` | Passed: 13 test files, 108 tests. |
| Build | `npm run build` | Exited `0`. |
| R0 YAML compatibility | `npm run validate:fixture` | Exited `0`; report status `PASS`; findings `0`. |
| R0 derive compatibility | `npm run derive:fixture` | Exited `0`; `diagnostics: []`. |
| Diff hygiene | `git diff --check` | Exited `0`. |

## Drift Handling

No blocking drift was observed for this selected fixture pair.

The only intentional delta is metadata: hand-authored YAML does not contain generated sidecar metadata, while the generated sidecar must contain R2 contract metadata. This proof does not approve generated sidecar authority. It only confirms the first same-document pair can be compared safely and that the metadata difference is explicit.

## Review Boundary

This evidence supports `R3-MS-1` review of the first same-document parity proof only. It does not satisfy the full R2 fixture/profile coverage matrix, CI enforcement, rollback rehearsal, documentation, or final source-authority flip gates.
