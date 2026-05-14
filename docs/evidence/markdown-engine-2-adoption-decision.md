# Markdown Engine 2.0 Adoption Decision

Evidence ID: `EVD-PARSER-PIVOT`
Date: 2026-05-14
Related issues: `BEL-1045`; `BEL-991`

## Decision

Markdown Trace R0 adopts the npm-published `@jasonbelmonti/markdown-engine@2.0.0` package as its Markdown parsing, normalization, source-range, section, text-span, link, and structural-query substrate.

Markdown Trace will consume only package-root public APIs, including `parse`, `normalize`, and `documentQueries`. The Markdown Trace adapter must not inspect raw parser AST nodes, raw mdast nodes, parser internals, sibling-repository paths, or unpublished package artifacts.

Implementation may resume only after:

- `npm view @jasonbelmonti/markdown-engine version` returns `2.0.0`.
- Linear records release authorization for the Markdown Engine 2.0 gate in `BEL-991`.
- Markdown Trace documents and project-management records identify the package version and document contract version evidence expected from implementation reports.

Current package-gate evidence on 2026-05-14: `npm view @jasonbelmonti/markdown-engine version --silent` returned `2.0.0`.

## Adopted Package Target

| Field | Value |
| --- | --- |
| Package | `@jasonbelmonti/markdown-engine` |
| Required version | `2.0.0` |
| Required source | npm registry; verified at `2.0.0` on 2026-05-14 |
| Allowed import surface | package-root public exports only |
| Expected document contract evidence | engine package version plus `documentVersion` in `EVD-2` through `EVD-6` |

## Rejected Alternatives

| Alternative | Rejection reason |
| --- | --- |
| Continue the fixture-scoped custom scanner | It duplicates generic Markdown parsing and was already increasing complexity around source IDs, source ranges, and reference extraction. |
| Consume the sibling `markdown-engine` repository directly | It would make Markdown Trace depend on unpublished local state and would bypass the release gate needed for reproducible implementation. |
| Consume an unpublished tarball or local workspace package | It would hide unresolved package contract risk and make validation evidence non-reproducible. |
| Use `@jasonbelmonti/markdown-engine@1.x` | R0 needs the 2.0 rich IR and structural-query contract, not the 1.x package surface. |
| Move registry semantics into `markdown-engine` for R0 | Registry identity, semantic entity definitions, external references, and issue-key collision policy are Markdown Trace domain behavior. |

## BEL-905 Scanner Branch Disposition

The unmerged custom-scanner work associated with `BEL-905` is stale and superseded as an implementation base. It remains useful only as historical evidence of why simple line/string scanning became too complex for source IDs and structural reference handling.

`BEL-905` should be re-scoped to prove the engine-backed adapter path after `BEL-1045` closes, npm serves `@jasonbelmonti/markdown-engine@2.0.0`, and `BEL-991` records Markdown Engine 2.0 release authorization.

## Registry Semantics Remain Local

`markdown-engine` owns generic Markdown structure. Markdown Trace owns document-local registry semantics:

- canonical entity IDs and display labels
- required entity definitions
- semantic relationships and edge validation
- registered external references
- issue-key collision behavior
- deterministic validation findings and reports

Keeping these semantics local preserves the R0 experiment boundary: no live Linear/Jira calls, no persistent service, no graph database, and no changes to the sibling `markdown-engine` repository.

## Project-Management Implications

`BEL-1045` blocks resuming adapter/validator implementation until the source-of-truth documents and Linear state align with this decision. Downstream implementation issues should depend on the adoption decision, the npm 2.0 package evidence, and the Markdown Engine release-authorization gate `BEL-991`.

Historical issues should remain accurate. Old scanner work should be marked stale or superseded instead of rewritten as though it used `markdown-engine`.

## Validation

Before implementation resumes, verify the package gate in the implementation environment:

```sh
npm view @jasonbelmonti/markdown-engine version
```

must return:

```text
2.0.0
```

Documentation consistency checks should not leave active references to the old parser strategy except where explicitly marked historical. Run the repository validation command from the implementation plan against `docs/**`; any remaining match must identify superseded history rather than active direction.
