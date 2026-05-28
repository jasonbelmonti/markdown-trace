# R3-1A First Parity Fixture Inventory

Evidence ID: R3-1A
Related issue: BEL-1230
Status: Complete fixture inventory

## Objective

Select the first same-document parity fixture that can let later R3 comparison work evaluate manual YAML registry evidence against generated sidecar evidence without changing public registry semantics.

## Selected Fixture Decision

Selected fixture: minimal R1 link-backed fixture.

This task adds one hand-authored manual registry fixture for the existing minimal R1 document and pairs it with the already checked generated sidecar artifact. This creates a same-document manual/generated pair without editing generated sidecar bytes, changing the R2 generated sidecar contract, or changing existing validation behavior.

The R0 fixture was not selected for the first pair because the current `derive-sidecar` command does not expose the `--namespace exec` option used by `npm run derive:fixture`. A generated R0 sidecar through the current command would derive default `doc.*` canonical IDs instead of the manual R0 registry's `exec.*` IDs, so using R0 first would create a known semantic mismatch before comparator work begins.

## Fixture Inventory

| Field | Value |
| --- | --- |
| Fixture purpose | First same-document manual/generated parity candidate for R3 migration comparison work. |
| Source document | `fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md` |
| Manual registry path | `fixtures/r1-link-backed-entity-syntax/minimal-link-backed-manual-registry.yaml` |
| Generated sidecar path | `fixtures/r1-link-backed-entity-syntax/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml` |
| Generation/check route | `node dist/markdowntrace/cli.js derive-sidecar --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml --check` |
| Type profile | `fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml` |
| Manual authority state | Manual YAML remains a valid registry input for the comparison fixture during the migration window. |
| Generated artifact state | Existing checked generated sidecar evidence; not human-editable source. |
| Fixture family | `r1-link-backed-entity-syntax` |
| Comparison dimensions | Registry, graph, metadata, and validation. |
| Follow-up owner | `R3-1B` and `R3-1C` comparator/report work. |

## Comparison Dimensions

| Dimension | Manual source | Generated source | Required comparison in follow-up |
| --- | --- | --- | --- |
| Registry | Load `minimal-link-backed-manual-registry.yaml` with the existing registry loader. | Load the checked generated sidecar with the existing registry loader. | Compare root registry facts: `registryVersion`, `document`, `entities`, `edges`, and `externalRefs`. |
| Graph | Project the manual registry with the existing graph derivation path. | Project the generated sidecar registry with the existing graph derivation path. | Compare deterministic node and edge sets. |
| Metadata | Manual YAML intentionally has no `generated.*` metadata while the fixture remains manual-authoritative. | Generated sidecar metadata must satisfy the R2 sidecar contract. | Classify manual metadata absence as intentional and verify generated metadata separately. |
| Validation | Validate the source document against the manual registry path. | Validate the same source document against the generated sidecar path. | Compare validation exit code, valid flag, finding categories, finding locations where available, and resolved-count summary. |

## ASM-1 Decision

Decision: this fixture retires `ASM-1` as a blocker for proceeding to `R3-1B` and `R3-1C`.

Rationale: the selected pair uses one source document, one type profile, one hand-authored manual YAML registry, and one existing checked generated sidecar. The root registry facts can be compared without changing public registry semantics or writing generated sidecar bytes. Dimension-level equivalence is not claimed by this inventory; the actual comparison report remains the responsibility of later R3 comparator work.

## Authority Boundary

- This inventory does not approve generated sidecar authority.
- This inventory does not remove or weaken hand-authored YAML registry support.
- This inventory does not change R1 `ctx://trace` syntax, R2 generated sidecar serialization, registry loading semantics, graph semantics, validation semantics, or CLI behavior.
- The generated sidecar remains checked evidence and must be regenerated through tooling, not manual editing.
- Any future source-authority change still requires the later R3 evidence gates and explicit approval record.

## Stop / Continue Decision

Continue to `R3-1B` when validation confirms the manual registry fixture loads and the existing generated sidecar check remains clean. Stop before comparator work if the manual registry cannot validate the selected document or if the checked generated sidecar no longer matches deterministic generation.

## Validation Evidence To Attach

| Check | Command or inspection |
| --- | --- |
| Manual registry validation | `node dist/markdowntrace/cli.js validate --registry fixtures/r1-link-backed-entity-syntax/minimal-link-backed-manual-registry.yaml --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md` |
| Generated sidecar check | `node dist/markdowntrace/cli.js derive-sidecar --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml --check` |
| R0 YAML compatibility | `npm run validate:fixture` |
| R0 derive compatibility | `npm run derive:fixture` |
| Baseline suite | `npm run typecheck`, `npm test`, and `npm run build` |
