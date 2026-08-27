# Markdown Trace Public npm Package Interface Design

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Public npm Package Interface Design |
| Contract depth | `ID2` |
| Source authority | Project-owner direction on 2026-08-26; Markdown Trace `origin/main` at `8eb7ca25025409266e20533bc16dffaf4fefa03f`; current graph-validation implementation and tests; npm public-package documentation |
| Author | Codex |
| Reviewers | Project owner; Markdown Trace maintainer |
| Last updated | 2026-08-26 (self-review revision) |
| Related design/spec/tickets | `docs/design/markdown-trace-profile-aware-graph-validation-design-spec.md`; Markdown Trace PRs 63 through 66; execution-plan PR 16 is superseded for this release focus |

## 0. Executive Contract Summary

- Decisions recorded: the project owner approved `MIT`, then authorized the self-review recommendations on 2026-08-26. That authorization ratifies the recommended scoped package identity and initial version, the stable semantic hash model in `C-5`, and the corrected release-tooling floor; publication remains a separately gated owner operation under `C-7`.
- Source design summary: publish Markdown Trace as the public ESM package `@jasonbelmonti/markdown-trace`, retain the executable name `markdown-trace`, expose a narrow file-backed graph-validation API, and ship a self-contained CLI artifact suitable for both npm installation and skill-fleet runtime pinning.
- Highest-risk boundaries: accidentally publishing repository-internal files, leaking internal types through public declarations, ambiguous CLI failure routing, version or dependency metadata drift, release authentication, and post-publication compatibility of the graph-profile and result schemas.
- Implementation slice covered: package identity and manifest, package-root API, CLI and exit behavior, profile and result file schemas, package contents, standalone runtime artifact and installer, release verification, publishing, and downstream runtime ownership.
- Out of scope: authoring execution-plan or task-definition graph profiles; repair-loop orchestration; changes to graph-validation semantics; registry/derivation command redesign; skill-fleet policy updates; a `1.0.0` stability declaration.
- Section status: complete; no design-level owner decision remains open.

## 1. Source Requirements and Assumptions

| ID | Statement | Source | Impact on contracts |
| --- | --- | --- | --- |
| REQ-1 | Publish Markdown Trace for public installation from the npm registry. | Project-owner direction, 2026-08-26 | Defines `C-1`, `C-6`, and `C-7`. |
| REQ-2 | Preserve a stable graph-validation command for file-backed profiles. | Merged Markdown Trace PR 66 and `tests/test_graph_cli.test.ts` | Defines `C-2`, `C-4`, and `C-5`. |
| REQ-3 | Preserve a stable programmatic API for the same file-backed operation. | Merged Markdown Trace PR 66 and `src/markdowntrace/graph-validation/run.ts` | Defines `C-3`, `C-4`, and `C-5`. |
| REQ-4 | Make the released runtime consumable by skill-fleet without assigning build or publish ownership to skill-fleet. | Existing skill-fleet Markdown Engine runtime model | Defines `C-6` and `C-8`. |
| REQ-5 | Keep graph profiles owned by their source skill repositories rather than embedding consumer-specific profiles in Markdown Trace. | Project-owner decision to focus on execution-plan and task-definition | Defines `C-4` and `C-8`. |
| REQ-6 | Prevent internal source modules, fixtures, experiments, evidence, tests, and repository automation from becoming supported package interfaces. | Current 224-file `npm pack --dry-run` result and public-boundary risk | Defines `C-1` and `C-3`. |
| REQ-7 | Provide deterministic, machine-readable validation outcomes that can later feed a repair loop. | Existing `markdown-trace.graph-validation-result.v1` implementation | Defines `C-2`, `C-3`, and `C-5`. |
| REQ-8 | Use current npm security mechanisms for public release. | npm public-package and trusted-publishing documentation, inspected 2026-08-26 | Defines `C-7`. |
| ASM-1 | The first public release will be `0.1.0`; neither scoped nor unscoped package name currently resolves publicly. | `package.json`; registry queries on 2026-08-26 returned `E404` | Defines initial versioning; registry ownership must still be confirmed during bootstrap. |
| ASM-2 | The user scope `@jasonbelmonti` is the intended public namespace. | Published `@jasonbelmonti/markdown-engine` package and repository ownership | Selects `@jasonbelmonti/markdown-trace` instead of the unscoped name. |
| ASM-3 | The release remains Node-only and ESM-only. | Current implementation and `package.json` | Constrains `C-1`, `C-2`, and `C-3`. |
| ASM-4 | The standalone CLI should align to the same runtime-distribution pattern as Markdown Engine. | Markdown Engine `3.5.0` package and installer | Shapes `C-6` without making the packages identical internally. |
| Q-1 | `MIT` is the approved SPDX license for public use and redistribution, matching Markdown Engine. | Project-owner approval, 2026-08-26 | Closes the license decision; implementation must add matching package metadata and a license file before publication. |
| DEC-1 | The public identity is `@jasonbelmonti/markdown-trace` and the initial version remains `0.1.0`. | Project-owner authorization of the self-review recommendations, 2026-08-26 | Ratifies `ASM-1` and `ASM-2` as implementation decisions while retaining bootstrap ownership verification. |
| DEC-2 | Result hashes identify stable semantic inputs/evidence, not filesystem location or runtime/version metadata; hash availability is stage-specific. | Project-owner authorization of the self-review recommendations, 2026-08-26 | Controls the corrected `C-5` preimages, failure-stage matrix, sequencing, and golden tests. |
| DEC-3 | Later staged publishing uses Node 24, npm 11.15.0 or later, stage-only OIDC, and current reviewed immutable action pins. | Project-owner authorization of the self-review recommendations plus current official npm/GitHub documentation, 2026-08-26 | Corrects `C-7` and requires action-pin discovery immediately before workflow implementation. |

Section status: complete; `Q-1` is resolved.

## 2. Problem-Space Model

### Existing Interface Constraints

| Interface | Kind | Owner | Mutability | Quality/completeness | Known consumers | Constraint or opportunity |
| --- | --- | --- | --- | --- | --- | --- |
| IF-1 | npm `package.json` and tarball | Markdown Trace | owned-changeable | incomplete; unpublished; dry-run includes 224 files | npm, Node, developers, skill-fleet installer | Establish the public identity and explicit contents before publishing. |
| IF-2 | `markdown-trace graph-validate` | Markdown Trace | owned-risky | core validation routing is test-covered; invocation and output-write failure routing is incomplete; no public distribution yet | skill agents, CI, developers | Preserve validation arguments and exits while making all stream and output-file terminal states explicit. |
| IF-3 | `validateGraphDocument(...)` | Markdown Trace | owned-risky | test-covered; currently exported through an overbroad root barrel; result types reference internal models; no declarations emitted | Node consumers and future repair-loop adapters | Publish only the consumer-shaped file operation and self-contained result DTOs. |
| IF-4 | `markdown-trace.graph-profile.v1` YAML | Markdown Trace schema; consumer repositories own instances | negotiable only through a new schema version | schema-validated and fixture-tested | execution-plan, task-definition, later profile authors | Treat the file schema as an external versioned input contract. |
| IF-5 | `markdown-trace.graph-validation-result.v1` JSON | Markdown Trace | owned-risky | core statuses are deterministic and test-covered; profile path differs by status and hash preimages are implicit | CLI consumers, API consumers, future repair loops | Normalize the unpublished v1 shape and hash definitions before treating it as an external contract. |
| IF-6 | `@jasonbelmonti/markdown-engine` dependency | Markdown Engine | fixed at a selected release | public and release-hardened; fleet currently pins `3.5.0` | Markdown Trace | Align and prove compatibility; do not fork or vendor its API contract. |
| IF-7 | skill-fleet runtime policy | skill-fleet | owned-changeable in a separate repository | strong for Markdown Engine; Markdown Trace entry not yet real | installed skills | Extend later with package/version/hash only after a Markdown Trace release exists. |
| IF-8 | GitHub Actions CI | Markdown Trace | owned-changeable | build/test enforcement exists; publish workflow absent | maintainers | Add an isolated OIDC release workflow after package bootstrap. |
| IF-9 | legacy CLI commands | Markdown Trace | owned-risky | implemented and tested unevenly; documented as prototype behavior | current repository users | Continue shipping for compatibility but do not promote them to stable release scope. |

### Actors and Systems

| Actor/System | Role | Trust level | Contract needs |
| --- | --- | --- | --- |
| Package consumer | Installs the library and calls file-backed graph validation. | untrusted input; trusted package bytes | Typed ESM entrypoint, clear errors, no implicit writes, SemVer compatibility. |
| CLI consumer or skill agent | Runs deterministic validation in a local process. | untrusted document/profile paths | Stable command, JSON envelope, bounded exit codes, safe output handling. |
| Profile owner | Authors and versions a YAML graph profile in a skill repository. | repository-reviewed | Versioned schema, actionable profile diagnostics, no dependency on Markdown Trace internals. |
| Markdown Trace maintainer | Builds, verifies, and publishes a release. | trusted operator | Reproducible gates, inspectable tarball, provenance, rollback guidance. |
| npm registry | Stores and serves immutable package versions. | external trusted service | Valid metadata, public access declaration, authenticated publish. |
| GitHub Actions | Builds and submits release candidates. | trusted only through bounded OIDC identity | Minimal permissions, pinned workflow identity, no long-lived publish token. |
| skill-fleet | Pins and verifies a shared runtime for skills. | trusted policy repository | Version, package identity, bundled-CLI hash, and source-owned contracts. |
| execution-plan/task-definition repositories | Own domain-specific profiles and repair behavior. | trusted source repositories | Stable runtime command and profile/result schemas. |

### Capabilities

| Capability | Command/query/event | Owner | Consumers | Notes |
| --- | --- | --- | --- | --- |
| Install npm package | `npm install @jasonbelmonti/markdown-trace` | npm and Markdown Trace | Node projects | Provides the ESM API and project-local CLI link. |
| Install global CLI | `npm install --global @jasonbelmonti/markdown-trace` | npm and Markdown Trace | humans and automation | Provides `markdown-trace` on `PATH`. |
| Validate a Markdown graph | `markdown-trace graph-validate --file ... --profile ...` | Markdown Trace | agents, CI, humans | Stable release command. |
| Validate from Node | `validateGraphDocument(options)` | Markdown Trace | Node integrations | Stable public root API. |
| Install a pinned shared runtime | `scripts/install-markdown-trace-cli.sh` | Markdown Trace | skill-fleet operators | Verifies exact bundled bytes and installs a stable wrapper. |
| Stage a later release | Git tag triggers GitHub Actions and `npm stage publish` | Markdown Trace and npm | maintainers | Applies after the separately evidenced interactive `0.1.0` bootstrap; requires later npm approval with 2FA. |
| Verify runtime policy | skill-fleet runtime verifier | skill-fleet | skill installation/update workflows | Separate follow-up after public release. |

### Domain Vocabulary

| Term | Definition | Invariants | Non-examples |
| --- | --- | --- | --- |
| Public package | The immutable npm artifact named `@jasonbelmonti/markdown-trace`. | Scoped, public, SemVer-versioned, contains only allowlisted release files. | Git checkout, source worktree, unpublished build directory. |
| Public API | The symbols reachable through the package root `exports` entry. | ESM-only; declarations included; no deep imports; file-backed and read-only. | `src/markdowntrace/index.ts` wildcard exports; test helpers; CLI parser internals. |
| Stable command | The `graph-validate` command plus package-level `--help` and `--version`. | Documented arguments, streams, result schema, and exit codes require compatible evolution. | Legacy registry/derivation command output formats during `0.x`. |
| Graph profile | One YAML document conforming to `markdown-trace.graph-profile.v1`. | Schema validated before document validation; instance owned outside Markdown Trace unless it is a test fixture. | A JavaScript callback or consumer-specific hardcoded branch. |
| Validation result | One `markdown-trace.graph-validation-result.v1` envelope. | Status is `pass`, `fail`, or `operational-error`; diagnostics are machine-readable; schema version is explicit. | Ad hoc stderr prose standing in for a graph failure. |
| Bundled CLI | A self-contained ESM executable built from the same source and version as the npm package. | Has a Node shebang; its SHA-256 is release evidence; needs no runtime network access. | The TypeScript source CLI or a wrapper that resolves repository `node_modules`. |
| Runtime policy | skill-fleet metadata selecting exact released CLI bytes. | Pins package, version, hash, and consumers; does not build or publish Markdown Trace. | A copied CLI payload committed to skill-fleet. |

Section status: complete.

## 3. Boundary Map

| Boundary | Owner | Consumers | Direction | Stability | Reason to exist |
| --- | --- | --- | --- | --- | --- |
| B-1 npm package manifest | Markdown Trace | npm, Node, maintainers | repository to registry | public | Names the artifact and constrains install/runtime metadata. |
| B-2 package-root ESM API | Markdown Trace | Node integrations | consumer to Markdown Trace | public during `0.x` | Provides a narrow programmatic validation seam without exposing internals. |
| B-3 CLI process | Markdown Trace | humans, agents, CI | caller to local process | public during `0.x` | Provides language-neutral local validation. |
| B-4 graph-profile file | Markdown Trace schema; profile repository instance | CLI/API to profile file | inbound | external versioned schema | Decouples graph rules from Markdown Trace releases. |
| B-5 graph-validation result | Markdown Trace | callers and repair adapters | outbound | external versioned schema | Carries deterministic evidence and diagnostics across process/repository boundaries. |
| B-6 bundled CLI and installer | Markdown Trace | skill-fleet operator and local runtime | package to local filesystem | persisted, versioned | Supplies exact auditable runtime bytes and a stable executable path. |
| B-7 release workflow | Markdown Trace and npm | maintainers | GitHub OIDC to npm | security-sensitive | Publishes without a long-lived npm token and retains human approval. |
| B-8 fleet policy handoff | skill-fleet | installed skills | release evidence to fleet policy | external follow-up | Separates runtime production from runtime selection and verification. |

Section status: complete.

## 3A. Integration Strategy

| Existing interface | Proposed response | Adapter/translator contract | Upstream change needed | Validation required |
| --- | --- | --- | --- | --- |
| IF-1 | replace | `C-1` replaces prototype metadata with a public manifest and allowlist. | no | `VAL-1`, `VAL-2`, `VAL-9` |
| IF-2 | replace | `C-2` preserves completed validation behavior while defining total invocation, transport, stream, and output-file terminal states and routing the npm bin to `C-6`. | no | `VAL-3`, `VAL-4`, `VAL-10` |
| IF-3 | replace | `C-3` introduces a dedicated public entrypoint and self-contained DTO module; internal barrels and types remain repository-only. | no | `VAL-5`, `VAL-6` |
| IF-4 | validate | `C-4` accepts only one schema-versioned YAML document and returns structured profile-load failures. | no | `VAL-7` |
| IF-5 | replace | `C-5` normalizes the unpublished v1 envelope across statuses, defines hash preimages, and then permits additive compatible fields. | no | `VAL-3`, `VAL-5`, `VAL-8` |
| IF-6 | validate | `C-1` selects Markdown Engine `3.5.0`; release execution must prove source and bundled-CLI compatibility. | no, unless compatibility fails | `VAL-10` |
| IF-7 | extend | `C-8` defines a later fleet policy entry using `C-6` evidence. | yes, separate repository and PR | `VAL-11` |
| IF-8 | extend | `C-7` adds an isolated tagged release workflow with OIDC. | no | `VAL-12` |
| IF-9 | tolerate | `C-2` ships legacy commands as explicitly experimental compatibility behavior in `0.x`. | no | `VAL-4` |

Section status: complete.

## 4. Contract Inventory

| Contract ID | Name | Kind | Owner | Consumers | Stability | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| C-1 | Public npm package manifest and contents | config | Markdown Trace | npm, Node, maintainers | public | REQ-1, REQ-6, REQ-8, ASM-1, ASM-2, ASM-3, DEC-1 |
| C-2 | `markdown-trace` CLI | API | Markdown Trace | humans, agents, CI | public during `0.x` | REQ-1, REQ-2, REQ-7 |
| C-3 | Package-root file-backed validation API | API | Markdown Trace | Node integrations | public during `0.x` | REQ-3, REQ-6, REQ-7, ASM-3 |
| C-4 | Graph-profile YAML v1 | schema | Markdown Trace schema; consumer repository instance | profile authors, CLI, API | external | REQ-2, REQ-3, REQ-5 |
| C-5 | Graph-validation result JSON v1 | schema | Markdown Trace | CLI/API consumers, repair adapters | external | REQ-2, REQ-3, REQ-7, DEC-2 |
| C-6 | Bundled CLI and pinned installer | SDK | Markdown Trace | npm, skill-fleet operators | persisted | REQ-1, REQ-4 |
| C-7 | Release verification and publication | port | Markdown Trace and npm | maintainers, registry users | external security boundary | REQ-1, REQ-6, REQ-8, Q-1, DEC-1, DEC-3 |
| C-8 | Downstream skill-fleet handoff | config | skill-fleet | execution-plan, task-definition, later skill consumers | external follow-up | REQ-4, REQ-5 |

Section status: complete.

## 5. Materialized Contracts

### C-1: Public npm Package Manifest and Contents

- Kind: npm package configuration and immutable tarball.
- Purpose: define one installable public artifact without exposing the development repository as the product.
- Owner: Markdown Trace.
- Consumers: npm, Node.js, maintainers, CLI installers, and package users.
- Lifecycle/stability: package name is permanent after first publish; every version is immutable; first public version is `0.1.0`.
- Source IDs: `REQ-1`, `REQ-6`, `REQ-8`, `ASM-1`, `ASM-2`, `ASM-3`, `Q-1`, `DEC-1`.
- Existing interface relationship: replaces the current private prototype manifest before first publish.
- Preconditions: `Q-1` is resolved; release verification passes; package name ownership is confirmed; working tree and generated release artifacts satisfy the clean-release policy.
- Postconditions: `npm install @jasonbelmonti/markdown-trace` provides the public ESM API and a project-local `markdown-trace` executable; global installation provides the same executable on `PATH`.
- Invariants: package is scoped and public; `private` is absent; `publishConfig.access` is `public`; repository URL exactly names this GitHub repository; `files` is an allowlist; no credentials, `.github`, `.codefactory`, source, tests, fixtures, experiments, general design/evidence documents, or worktree content is present.
- Inputs: verified build outputs, package metadata, contract docs, license, README, changelog, security policy, and installer.
- Outputs: npm tarball and registry metadata.
- Error model: release verification fails closed before publish and reports the violated manifest, content, build, or install invariant.
- Authorization/tenancy: user-scoped public package owned under `@jasonbelmonti`; npm account governance and 2FA remain owner responsibilities.
- Idempotency/retry/ordering: packing is repeatable; publishing the same version again is prohibited; a failed or rejected staged candidate may be rebuilt only from the same tag after evidence confirms byte identity, otherwise a new version is required.
- Versioning/compatibility: package SemVer governs CLI/API compatibility. During `0.x`, breaking public changes require a minor version; patches are backward compatible. The name and executable do not change through a version bump.
- Observability: `npm pack --dry-run --json`, tarball manifest, size/file-count summary, package version, git commit, and bundled-CLI SHA-256 are release evidence.
- Validation evidence: `VAL-1`, `VAL-2`, `VAL-9`, and `VAL-10`.

```json
{
  "name": "@jasonbelmonti/markdown-trace",
  "version": "0.1.0",
  "description": "Profile-aware graph validation for traceable Markdown documents.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "bin": {
    "markdown-trace": "./dist-bundled/markdown-trace-cli.mjs"
  },
  "exports": {
    ".": {
      "types": "./dist/markdowntrace/public.d.ts",
      "import": "./dist/markdowntrace/public.js"
    }
  },
  "types": "./dist/markdowntrace/public.d.ts",
  "files": [
    "dist",
    "dist-bundled/markdown-trace-cli.mjs",
    "scripts/install-markdown-trace-cli.sh",
    "docs/contracts",
    "README.md",
    "LICENSE",
    "CHANGELOG.md",
    "SECURITY.md"
  ],
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jasonbelmonti/markdown-trace.git"
  },
  "bugs": {
    "url": "https://github.com/jasonbelmonti/markdown-trace/issues"
  },
  "homepage": "https://github.com/jasonbelmonti/markdown-trace#readme",
  "keywords": [
    "markdown",
    "graph",
    "traceability",
    "validation"
  ],
  "engines": {
    "node": "^20.19.0 || >=22.12.0"
  },
  "dependencies": {
    "@jasonbelmonti/markdown-engine": "3.5.0",
    "yaml": "^2.8.3"
  }
}
```

### C-2: `markdown-trace` CLI

- Kind: local process API.
- Purpose: provide language-neutral, file-backed graph validation and preserve existing repository commands during the pre-1.0 transition.
- Owner: Markdown Trace.
- Consumers: skill agents, CI, developers, and operators.
- Lifecycle/stability: `graph-validate`, package-level `--help`, and package-level `--version` are the stable release surface; `validate`, `derive`, `derive-sidecar`, and `migration-check` remain available but are explicitly experimental during `0.x`.
- Source IDs: `REQ-1`, `REQ-2`, `REQ-7`.
- Existing interface relationship: preserves the merged PR 66 graph flags, validation statuses, and diagnostic meanings while replacing incomplete failure/stream routing and adding a package version query.
- Preconditions: non-empty Markdown and profile path arguments for an attempted validation; Node satisfies `C-1`; any `--output` path does not alias either input. Readability is an evaluated operational condition, not a caller precondition.
- Postconditions: completed pass/fail results are emitted as one pretty-printed v1 JSON document to stdout. Validation operational failures are emitted as one v1 JSON document to stderr. Invocation and transport failures emit human-readable stderr with empty stdout. Graph validation never modifies either input.
- Invariants: command name is `markdown-trace`; graph subcommand is `graph-validate`; required flags are `--file` and `--profile`; only `--format json` is accepted. When `--output` is requested for a completed pass/fail result, the CLI atomically persists the complete result before publishing the identical bytes to stdout. A failed output write leaves any prior destination unchanged and emits no result on stdout.
- Inputs: `markdown-trace graph-validate --file <markdown> --profile <yaml> [--output <path>] [--format json]`.
- Outputs: a `C-5` JSON result plus process exit status for completed or validation-operational runs; human-readable stderr plus process exit status for invocation or transport failures.
- Error model: exit `0` means `status: pass`; exit `1` means completed validation with `status: fail`; exit `2` has two disjoint surfaces. Profile-load, profile-compatibility, document-read, and evidence-extraction failures emit `status: operational-error` JSON to stderr. Usage, unsupported option/format, input-output alias, output-directory creation, output persistence, and other CLI transport failures emit human-readable stderr with no `C-5` envelope. Graph findings are never converted into invocation prose, and invocation/transport failures never masquerade as graph results.
- Authorization/tenancy: no network, account, or repository authorization is required at runtime; filesystem permissions govern reads and optional output writes.
- Idempotency/retry/ordering: read-only validation is retry-safe. Identical resolved input paths, source/profile bytes, package version, dependency version, and Node runtime produce byte-identical output. The CLI performs no implicit profile discovery.
- Versioning/compatibility: flags, the two exit-`2` error surfaces, stream routing, output commit ordering, and exit mapping are public. Additive optional flags are compatible. Removing/renaming flags or changing exit meanings requires a `0.x` minor version and changelog entry. Experimental commands may change in a minor release but must not silently shadow the stable command.
- Observability: `--version` prints only the package SemVer plus newline; `--help` names stable versus experimental commands; the result envelope includes runtime metadata and hashes.
- Validation evidence: `VAL-3`, `VAL-4`, and `VAL-10`.

```text
markdown-trace --version
markdown-trace --help
markdown-trace graph-validate \
  --file <document.md> \
  --profile <graph-profile.yaml> \
  [--output <result.json>] \
  [--format json]
```

### C-3: Package-Root File-Backed Validation API

- Kind: TypeScript/JavaScript ESM API.
- Purpose: let Node consumers invoke the same validation operation without subprocess management.
- Owner: Markdown Trace.
- Consumers: Node integrations and future repair-loop adapters.
- Lifecycle/stability: public during `0.x`; the package root is the only supported import path.
- Source IDs: `REQ-3`, `REQ-6`, `REQ-7`, `ASM-3`.
- Existing interface relationship: preserves `validateGraphDocument(...)` while replacing the wildcard root barrel and transitive internal type graph with a dedicated public entrypoint and public DTO module.
- Preconditions: `documentPath` and `profilePath` are non-empty file paths. The base directory is `path.resolve(process.cwd(), options.cwd ?? ".")`; both input paths resolve from that base without changing process state.
- Postconditions: resolves to `GraphValidationRunResult`; expected profile, input, extraction, and graph outcomes do not reject the promise; inputs are not modified.
- Invariants: no CLI `main`, built-in fixture profile, extraction primitive, registry, Markdown scanner, or internal validator module is exported at package root; no deep import is supported through `exports`. Every named or structural type reachable from the public API is owned by a focused public contract layer rooted at `public.ts`; that layer may use smaller public contract modules, but emitted root declarations contain no import of repository-internal models and do not expose Markdown Engine types.
- Inputs: `ValidateGraphDocumentOptions`.
- Outputs: `Promise<GraphValidationRunResult>` conforming to `C-5`.
- Error model: expected failures resolve as `fail` or `operational-error`. Promise rejection is reserved for programmer errors or process-level failures outside the declared operational model; release tests must minimize and document any such residual path.
- Authorization/tenancy: no network or ambient credentials; filesystem access only.
- Idempotency/retry/ordering: read-only and retry-safe; each call captures its own source/profile bytes and metadata.
- Versioning/compatibility: adding optional options or result fields is compatible. Removing or changing an exported symbol, making an optional field required, or changing resolution semantics requires a `0.x` minor release. ESM-only is explicit.
- Observability: callers receive `C-5`; no implicit logging to stdout/stderr.
- Validation evidence: `VAL-5`, `VAL-6`, `VAL-7`, and `VAL-8`.

```ts
export interface ValidateGraphDocumentOptions {
  readonly documentPath: string;
  readonly profilePath: string;
  readonly cwd?: string;
}

export function validateGraphDocument(
  options: ValidateGraphDocumentOptions,
): Promise<GraphValidationRunResult>;

export interface GraphValidationSourcePosition {
  readonly line: number;
  readonly column: number;
  readonly offset?: number;
}

export interface GraphValidationSourceRange {
  readonly start: GraphValidationSourcePosition;
  readonly end: GraphValidationSourcePosition;
}

export type GraphArtifactFamily =
  | "execution-spec"
  | "execution-plan"
  | "design-spec";

export type GraphValidationRelationshipClass =
  | "objective_implemented_by"
  | "work_validated_by"
  | "validation_supported_by"
  | "execution_plan_source_anchors_outcome"
  | "execution_plan_outcome_implemented_by_action"
  | "execution_plan_outcome_validated_by_gate"
  | "objective_supported_by_evidence"
  | "requirement_realized_by_behavior"
  | "behavior_allocated_to_mechanism"
  | "requirement_accepted_by"
  | "behavior_accepted_by"
  | "requirement_validated_by"
  | "mechanism_verified_by"
  | "matrix_coverage"
  | "coverage_range";

export interface GraphValidationEvidenceAnchor {
  readonly tableTargetId: string;
  readonly rowIndex: number;
  readonly columnIndex: number;
  readonly columnHeader: string;
  readonly sourceRange?: GraphValidationSourceRange;
}

export interface GraphValidationSourceDescriptor {
  readonly path: string;
  readonly sha256: string | null;
  readonly lineCount: number | null;
}

export interface GraphValidationProfileDescriptor {
  readonly path: string;
  readonly profileId: string | null;
  readonly artifactFamily: GraphArtifactFamily | null;
  readonly profileVersion: string | null;
  readonly sha256: string | null;
}

export interface GraphValidationRuntimeMetadata {
  readonly packageVersion: string;
  readonly markdownEngineVersion: string;
  readonly runtimeVersion: string;
}

export interface GraphValidationNode {
  readonly id: string;
  readonly family: string;
  readonly authority: "trace-evidence";
  readonly role: "primary_definition" | "terminal_coverage_node";
  readonly sourceRange?: GraphValidationSourceRange;
}

export interface GraphValidationRelationship {
  readonly class: GraphValidationRelationshipClass;
  readonly sourceId: string;
  readonly targetId: string;
  readonly sourceRanges: readonly GraphValidationSourceRange[];
  readonly rawEvidenceAnchors: readonly GraphValidationEvidenceAnchor[];
}

export interface RequiredPathResult {
  readonly pathId: string;
  readonly sourceId: string;
  readonly status: "satisfied" | "missing";
  readonly nodeIds: readonly string[];
  readonly relationshipClasses: readonly GraphValidationRelationshipClass[];
  readonly missingRelationshipClass?: GraphValidationRelationshipClass;
}

export interface GraphDiagnostic {
  readonly code: "markdown-trace.graph.missing_required_path";
  readonly severity: "error";
  readonly message: string;
  readonly profileRuleId: string;
  readonly affectedIds: readonly string[];
  readonly sourceRanges: readonly GraphValidationSourceRange[];
  readonly blocking: true;
}

export type GraphValidationOperationalStage =
  | "profile-load"
  | "profile-compatibility"
  | "document-read"
  | "evidence-extraction";

export interface GraphValidationOperationalDiagnostic {
  readonly code:
    | "markdown-trace.graph.profile_error"
    | "markdown-trace.graph.operational_error";
  readonly severity: "error";
  readonly message: string;
  readonly profileRuleId: string;
  readonly affectedIds: readonly string[];
  readonly sourceRanges: readonly GraphValidationSourceRange[];
  readonly blocking: true;
  readonly stage: GraphValidationOperationalStage;
  readonly source?: string;
}

export interface GraphValidationSummary {
  readonly nodes: number;
  readonly relationships: number;
  readonly requiredPaths: number;
  readonly satisfiedRequiredPaths: number;
  readonly diagnostics: number;
}

export interface GraphValidationHashes {
  readonly sourceSha256: string | null;
  readonly profileSha256: string | null;
  readonly traceEvidenceSha256: string | null;
}

export interface GraphValidationResult {
  readonly schemaVersion: "markdown-trace.graph-validation-result.v1";
  readonly status: "pass" | "fail";
  readonly source: GraphValidationSourceDescriptor & {
    readonly sha256: string;
    readonly lineCount: number;
  };
  readonly profile: GraphValidationProfileDescriptor & {
    readonly profileId: string;
    readonly artifactFamily: GraphArtifactFamily;
    readonly profileVersion: string;
    readonly sha256: string;
  };
  readonly run: GraphValidationRuntimeMetadata;
  readonly nodes: readonly GraphValidationNode[];
  readonly relationships: readonly GraphValidationRelationship[];
  readonly requiredPathResults: readonly RequiredPathResult[];
  readonly matrixCoverageResults: readonly never[];
  readonly diagnostics: readonly GraphDiagnostic[];
  readonly summary: GraphValidationSummary;
  readonly hashes: GraphValidationHashes & {
    readonly sourceSha256: string;
    readonly profileSha256: string;
    readonly traceEvidenceSha256: string;
  };
}

export interface GraphValidationOperationalResult {
  readonly schemaVersion: "markdown-trace.graph-validation-result.v1";
  readonly status: "operational-error";
  readonly source: GraphValidationSourceDescriptor;
  readonly profile: GraphValidationProfileDescriptor;
  readonly run: GraphValidationRuntimeMetadata;
  readonly nodes: readonly never[];
  readonly relationships: readonly never[];
  readonly requiredPathResults: readonly never[];
  readonly matrixCoverageResults: readonly never[];
  readonly diagnostics: readonly GraphValidationOperationalDiagnostic[];
  readonly summary: GraphValidationSummary;
  readonly hashes: GraphValidationHashes;
}

export type GraphValidationRunResult =
  | GraphValidationResult
  | GraphValidationOperationalResult;
```

These DTOs are declared in the public contract layer using only public value types. `public.ts` is the package entrypoint, not a requirement that every DTO live in one file. Implementation modules may consume focused public contract types; public contract modules must not import implementation models merely to re-export aliases.

### C-4: Graph-Profile YAML v1

- Kind: versioned YAML schema.
- Purpose: let a source repository declare artifact-specific identifier families, evidence relationships, required paths, diagnostics, and serialization without consumer-specific branches in Markdown Trace.
- Owner: Markdown Trace owns schema semantics; each skill repository owns its profile instances and version pins.
- Consumers: `C-2`, `C-3`, execution-plan, task-definition, and future profile authors.
- Lifecycle/stability: external schema identified by `schemaVersion: markdown-trace.graph-profile.v1`.
- Source IDs: `REQ-2`, `REQ-3`, `REQ-5`.
- Existing interface relationship: preserves the current loader and validator contract.
- Preconditions: a path or bytes are supplied to the loader. Successful loading requires exactly one YAML document, a supported schema version, supported artifact/relationship values, valid diagnostic rules, and internally valid references.
- Postconditions: a valid profile is normalized into an immutable in-memory model; an invalid or unreadable profile yields structured profile diagnostics before source graph validation.
- Invariants: consumer profiles are data, not executable code; profile identity includes `profileId`, `artifactFamily`, `profileVersion`, and SHA-256; graph rules do not depend on fixture file paths or skill names beyond declared profile data.
- Inputs: a YAML file conforming to the published `docs/contracts/graph-profile-v1.md` contract.
- Outputs: loaded profile or `markdown-trace.graph.profile_error` diagnostics with `stage` equal to `read`, `yaml`, or `schema` internally and `profile-load` in `C-5` operational results.
- Error model: unreadable, malformed, multi-document, schema-invalid, and unsupported-feature profiles are operational errors; they never become graph failure diagnostics.
- Authorization/tenancy: profile content is untrusted data; no tags, callbacks, includes, imports, or environment expansion execute.
- Idempotency/retry/ordering: loading is read-only; profile SHA-256 identifies exact normalized profile semantics for the run.
- Versioning/compatibility: fields may be added only when old v1 consumers can safely ignore or default them. Incompatible semantic or structural changes require a new `schemaVersion`; `profileVersion` versions an instance and does not override schema compatibility.
- Observability: the absolute resolved profile path plus identity, version, and hash appear under the same keys in every `C-5` status. Unknown identity/version/hash values are `null` for failures that occur before successful profile validation. Failures include stage, source, rule identifier, severity, and blocking state.
- Validation evidence: `VAL-7` and `VAL-8`.

```yaml
schemaVersion: markdown-trace.graph-profile.v1
profileId: <stable dotted identifier>
artifactFamily: execution-spec | execution-plan | design-spec
profileVersion: <profile SemVer>
idFamilies: []
definitionPolicies: {}
tableRoles: []
rangePolicy: {}
matrixSemantics: {}
relationshipClasses: []
requiredPaths: []
diagnosticRules: []
serialization: {}
```

### C-5: Graph-Validation Result JSON v1

- Kind: versioned result schema.
- Purpose: carry deterministic graph evidence, validation status, diagnostics, hashes, and runtime identity to humans and automation.
- Owner: Markdown Trace.
- Consumers: `C-2`, `C-3`, CI, skill agents, and future repair-loop adapters.
- Lifecycle/stability: external schema identified by `schemaVersion: markdown-trace.graph-validation-result.v1`.
- Source IDs: `REQ-2`, `REQ-3`, `REQ-7`, `DEC-2`.
- Existing interface relationship: preserves the PR 66 status and diagnostic behavior while normalizing the unpublished v1 source/profile descriptors and hash definitions before public release.
- Preconditions: none beyond invocation of `C-2` or `C-3`; even operational failures use this envelope.
- Postconditions: exactly one status is returned; summaries agree with arrays; every status contains the same source/profile descriptor keys; hashes agree with the normative preimages when available.
- Invariants: `source.path` and `profile.path` are absolute resolved paths in every status. `pass` has no blocking diagnostics; `fail` represents completed graph validation with blocking graph diagnostics; `operational-error` represents inability to complete validation. Diagnostics carry stable code, severity, message, `profileRuleId`, affected IDs, source ranges, and blocking state as applicable.
- Inputs: loaded or failed `C-4`, source Markdown, graph evidence, and runtime metadata.
- Outputs: the v1 result envelope.
- Error model: hash availability follows the stage matrix below. A semantic profile hash exists only after profile validation; a source hash exists only after the Markdown string is acquired; a trace-evidence hash exists only after complete normalized evidence is constructed. Status and CLI exit mapping remain consistent.
- Authorization/tenancy: source text is not copied wholesale into diagnostics; paths and bounded source ranges may be disclosed to the caller that supplied them.
- Idempotency/retry/ordering: result serialization is deterministic for fixed resolved paths, inputs, and runtime metadata; arrays follow the profile-defined serialization rules where applicable. Hashes intentionally remain stable across filesystem relocation and runtime/package-version changes:
  - `sourceSha256` is SHA-256 of the UTF-8 encoding of the exact decoded Markdown string passed to the parser.
  - `profileSha256` is SHA-256 of compact UTF-8 JSON for the validated semantic profile DTO in declared schema field order, with array order preserved and undefined properties omitted. YAML presentation-only changes therefore do not change this digest.
  - `traceEvidenceSha256` is SHA-256 of compact UTF-8 JSON for a stable evidence projection in declared field order. The projection includes `schemaVersion`, `authority`, source `sha256` and `lineCount` (not source path), profile identity/version/hash, definitions, supplemental definitions, coverage rows, mentions, ranges, candidate edges, and evidence diagnostics. It excludes `run` and the redundant `hashes` object. Arrays are already normalized to their declared serialization order and remain order-sensitive.
- Versioning/compatibility: existing field meanings and enum values do not change in place. New optional fields and new diagnostic codes are compatible. Removing fields, changing status semantics, or changing required field types requires a new result `schemaVersion` and a package minor release during `0.x`.
- Observability: result contains source, profile, runtime, nodes, relationships, path and coverage results, diagnostics, summary, and hashes.
- Validation evidence: `VAL-3`, `VAL-5`, and `VAL-8`.

```ts
type GraphValidationRunResult =
  | { readonly schemaVersion: "markdown-trace.graph-validation-result.v1"; readonly status: "pass"; readonly source: GraphValidationSourceDescriptor; readonly profile: GraphValidationProfileDescriptor; /* completed evidence */ }
  | { readonly schemaVersion: "markdown-trace.graph-validation-result.v1"; readonly status: "fail"; readonly source: GraphValidationSourceDescriptor; readonly profile: GraphValidationProfileDescriptor; /* completed evidence and diagnostics */ }
  | { readonly schemaVersion: "markdown-trace.graph-validation-result.v1"; readonly status: "operational-error"; readonly source: GraphValidationSourceDescriptor; readonly profile: GraphValidationProfileDescriptor; /* operational diagnostics */ };
```

| Result state / operational stage | `sourceSha256` | `profileSha256` | `traceEvidenceSha256` |
| --- | --- | --- | --- |
| `profile-load` | `null` | `null` | `null` |
| `profile-compatibility` | `null` | semantic profile hash | `null` |
| `document-read` | `null` | semantic profile hash | `null` |
| `evidence-extraction` | source hash | semantic profile hash | `null` |
| completed `pass` or `fail` | source hash | semantic profile hash | stable evidence hash |

### C-6: Bundled CLI and Pinned Installer

- Kind: self-contained executable artifact and installation adapter.
- Purpose: give npm and skill-fleet the same exact CLI bytes while supporting a stable per-user wrapper.
- Owner: Markdown Trace.
- Consumers: npm `bin`, local operators, and skill-fleet runtime setup.
- Lifecycle/stability: one bundle and SHA-256 per package version; installer is version-pinned source code in the same package.
- Source IDs: `REQ-1`, `REQ-4`, `ASM-4`.
- Existing interface relationship: adds the Markdown Engine distribution pattern to Markdown Trace; does not change graph semantics.
- Preconditions: release verification produced `dist-bundled/markdown-trace-cli.mjs`; installer constants match package version, package name, bundle path, and bundle SHA-256.
- Postconditions: npm invokes the bundle directly; the installer copies verified bytes into a versioned data directory and writes a stable `markdown-trace` wrapper into a configurable bin directory.
- Invariants: bundle has a Node shebang; bundle performs no network access at validation time; installer accepts only the exact expected SHA-256; local bundle fallback is accepted only when its hash matches; install is side-by-side by version.
- Inputs: local verified bundle or `npm pack @jasonbelmonti/markdown-trace@<exact-version> --ignore-scripts`, Node, npm, tar, and SHA-256 tooling.
- Outputs: `${MARKDOWN_TRACE_HOME}/tools/markdown-trace/<version>/markdown-trace-cli.mjs` and `${MARKDOWN_TRACE_BIN_DIR}/markdown-trace`.
- Error model: missing tools, missing tarball member, hash mismatch, failed wrapper smoke test, or filesystem error exits nonzero without activating unverified bytes.
- Authorization/tenancy: installer writes only under explicit/configured per-user directories; package retrieval uses public npm and no publish credential.
- Idempotency/retry/ordering: reinstalling identical version/hash is safe; bundle is written before wrapper activation; an existing earlier version remains available for rollback.
- Versioning/compatibility: installer constants change with each release; environment variables and wrapper command remain stable. The package tarball is the distribution authority.
- Observability: installer prints installed artifact path, wrapper path, version, and verified SHA-256.
- Validation evidence: `VAL-9`, `VAL-10`, and `VAL-11`.

### C-7: Release Verification and Publication

- Kind: release port and security policy.
- Purpose: prove exact package contents and behavior, then publish through a bounded authenticated channel.
- Owner: Markdown Trace maintains the workflow; npm authenticates and stores releases; project owner approves staged publication.
- Consumers: maintainers and public registry users.
- Lifecycle/stability: every version/tag. Version `0.1.0` is an explicit interactive bootstrap exception because trusted-publisher configuration requires an owned package. All later releases use the stage-only trusted publisher.
- Source IDs: `REQ-1`, `REQ-6`, `REQ-8`, `Q-1`, `DEC-1`, `DEC-3`.
- Existing interface relationship: extends CI with an isolated release workflow; no ordinary pull-request workflow receives publish permissions.
- Preconditions: `Q-1` resolved; main branch contains the version commit; annotated tag exactly matches `v<package version>`; full gate and release-specific verification pass; package name ownership confirmed.
- Postconditions: bootstrap `0.1.0` is public from the exact CI-verified tarball and is backed by tag, commit, tarball SHA-256, and registry-integrity evidence, but has no provenance attestation. Every later reviewed candidate becomes public with npm-generated trusted-publishing provenance, or publication stops without changing the public registry.
- Invariants: the bootstrap workflow builds and uploads the exact tarball but has no npm credential; an owner publishes that exact tarball interactively with npm 2FA and verifies the registry artifact hash before configuring trust. The subsequent release workflow uses a GitHub-hosted runner, Node `24`, npm `>=11.15.0`, `contents: read`, and `id-token: write`; it has no long-lived npm publish token; third-party actions are pinned to immutable commits from the current supported major generation verified immediately before implementation; npm trusted publisher is limited to the exact repository and workflow filename with stage-only permission; normal CI cannot publish.
- Inputs: signed/authorized version tag and verified tarball for bootstrap; signed/authorized version tag, GitHub OIDC identity, and verified tarball for later releases.
- Outputs: bootstrap tarball/hash/public version evidence for `0.1.0`; staged candidate, human approval record, public npm version, provenance, release notes, and release evidence for later releases.
- Error model: any tag/version mismatch, dirty generation, test failure, unexpected tarball member, install smoke failure, hash mismatch, OIDC failure, or npm rejection fails closed.
- Authorization/tenancy: first publish is an interactive owner bootstrap using npm 2FA against the exact CI artifact; immediately afterward, configure a stage-only trusted publisher and disallow traditional publish tokens. Later tags use `npm stage publish`; public availability requires owner approval with 2FA.
- Idempotency/retry/ordering: bootstrap ordering is verify, pack, inspect, install-smoke, upload artifact, owner verifies artifact hash, interactive publish, verify registry hash, configure trust. Later ordering is verify, pack, inspect, install-smoke, stage through OIDC, inspect staged candidate, approve, verify registry and provenance. Never reuse a version for changed bytes.
- Versioning/compatibility: version comes from `package.json`; tag, CLI `--version`, runtime metadata, installer, and changelog release heading must match.
- Observability: every release retains workflow run, git tag/commit, test output, tarball manifest and SHA-256, bundle hash, and registry smoke test. Later releases additionally retain staged package ID, approval, and provenance. Bootstrap evidence explicitly records the absence of provenance.
- Validation evidence: `VAL-1`, `VAL-2`, `VAL-9`, `VAL-10`, and `VAL-12`.

### C-8: Downstream skill-fleet Handoff

- Kind: runtime policy configuration in a separate repository.
- Purpose: let execution-plan, task-definition, and later skills depend on one verified Markdown Trace CLI installation.
- Owner: skill-fleet owns policy and verification; Markdown Trace owns package, installer, and contract fixtures; each skill owns its graph profile and pass/fail examples.
- Consumers: skill-fleet installation/update operations and graph-validating skills.
- Lifecycle/stability: follow-up only after `C-7` produces a public version; one fleet policy update per selected release.
- Source IDs: `REQ-4`, `REQ-5`.
- Existing interface relationship: extends the existing Markdown Engine policy pattern with a distinct Markdown Trace entry.
- Preconditions: public package version exists; bundle SHA-256 and source-owned contract fixtures are final.
- Postconditions: fleet verifies either a staged exact bundle or stable wrapper and runs consumer contract fixtures without storing runtime payload bytes.
- Invariants: fleet policy pins package name, version, CLI SHA-256, consumers, and contract paths; fleet does not build, publish, or silently upgrade Markdown Trace; profile content remains in consumer repositories.
- Inputs: `C-6` release evidence and consumer-owned pass/fail fixtures.
- Outputs: verified fleet runtime policy and installer integration.
- Error model: absent wrapper, wrong hash, wrong version, or contract-fixture mismatch fails fleet verification before skill activation.
- Authorization/tenancy: fleet verification is read-only; runtime installation is a separately authorized local operation.
- Idempotency/retry/ordering: publish Markdown Trace first, then update fleet policy, then update local installations, then enable consumer repair loops.
- Versioning/compatibility: fleet selects exact package versions; a package upgrade is an explicit policy PR with source-owned contract evidence.
- Observability: verifier reports expected/actual version, hash, wrapper path, and contract outcomes.
- Validation evidence: `VAL-11`.

Section status: complete.

## 6. State, Fault, and Misuse Contracts

| Case ID | State/fault/misuse case | Owning contract | Expected behavior | Validation |
| --- | --- | --- | --- | --- |
| CASE-1 | Tarball contains a non-allowlisted repository file. | C-1, C-7 | Release verification fails before stage/publish and reports the path. | VAL-2 |
| CASE-2 | Consumer attempts a deep import such as an internal profile or CLI parser module. | C-3 | Node rejects the import through the package `exports` boundary; only the root API is supported. | VAL-6 |
| CASE-3 | Graph validation finds a missing required path. | C-2, C-5 | Emit `status: fail` JSON to stdout and exit `1`; do not write either input. | VAL-3 |
| CASE-4 | Profile is unreadable, malformed, multi-document, schema-invalid, or unsupported. | C-2, C-4, C-5 | Emit `status: operational-error` JSON to stderr and exit `2`; do not create `--output`. | VAL-3, VAL-7 |
| CASE-5 | Invocation is invalid because a required flag is absent, the format is unsupported, or `--output` aliases an input, including by hard link. | C-2 | Emit human-readable stderr, emit nothing to stdout, exit `2`, and preserve both inputs byte-for-byte. | VAL-4 |
| CASE-6 | API caller supplies relative paths. | C-3, C-5 | Resolve from explicit `cwd` or `process.cwd()`, then report absolute resolved source and profile paths under the same keys for pass, fail, and operational-error results. | VAL-5, VAL-8 |
| CASE-7 | Runtime version metadata disagrees with `package.json` or installed Markdown Engine. | C-1, C-5, C-7 | Build/release verification fails; metadata is generated from authoritative package inputs rather than manually duplicated literals. | VAL-8, VAL-9 |
| CASE-8 | Bundled CLI bytes differ from the installer pin. | C-6, C-7 | Installer-pin and release checks fail; no wrapper activates those bytes. | VAL-9, VAL-10 |
| CASE-9 | Tag version differs from package version. | C-7 | Release workflow fails before npm authentication or staging. | VAL-12 |
| CASE-10 | Release workflow lacks OIDC trust or human approval. | C-7 | Candidate remains unpublished; no token fallback is used. | VAL-12 |
| CASE-11 | A consumer supplies a profile with arbitrary executable YAML features. | C-4 | Parser treats it as data and schema validation rejects unsupported shapes; no code or environment expansion runs. | VAL-7 |
| CASE-12 | A repair loop needs more diagnostic structure than v1 provides. | C-5, C-8 | Consume current diagnostics as-is or propose additive/new-version schema work; do not infer structure from message strings. | VAL-8, VAL-11 |
| CASE-13 | Initial package name is unavailable or not owned at bootstrap. | C-1, C-7 | Stop without publishing; resolve namespace ownership explicitly and revise this packet if identity changes. | VAL-1, VAL-12 |
| CASE-14 | Persisting a completed result to `--output` fails. | C-2 | Leave any prior destination unchanged, emit no result to stdout, emit human-readable stderr, and exit `2`; a consumer can never observe stdout success before the requested durable write commits. | VAL-3, VAL-4 |
| CASE-15 | Bootstrap `0.1.0` cannot carry trusted-publishing provenance because the package does not yet exist. | C-7 | Publish only the exact CI-produced tarball through interactive owner 2FA, record the no-provenance exception and registry-integrity match, then configure the stage-only trusted publisher before any later release. | VAL-12 |
| CASE-16 | Equivalent profile or evidence values are constructed with different object insertion order or produced on another supported runtime/path. | C-5 | Canonical serialization in declared schema field order produces the same profile/evidence hash; filesystem paths and runtime/package metadata do not affect semantic hashes, while semantically ordered arrays remain order-sensitive. | VAL-8 |
| CASE-17 | Validation fails after only some semantic inputs have been acquired. | C-5 | The result exposes exactly the hashes allowed by the failure-stage matrix; unavailable semantic values remain `null` and already acquired source/profile identity is retained. | VAL-8 |

Section status: complete.

## 7. Compatibility and Migration Notes

| Contract ID | Compatibility rule | Migration/backfill | Rollback constraint | Deprecation plan |
| --- | --- | --- | --- | --- |
| C-1 | Package name remains `@jasonbelmonti/markdown-trace`; `0.x` minor releases may break only with changelog notice; patches remain compatible. | Rename unpublished manifest, add metadata/allowlist, and publish `0.1.0`. | Published versions are immutable; rollback means selecting an earlier version or publishing a corrective patch. | No alias package is planned; the current unscoped unpublished name has no compatibility standing. |
| C-2 | Stable command name, graph flags, the two exit-`2` surfaces, stream routing, transactional `--output` ordering, and exit codes remain compatible. | Add `--version`; label legacy commands experimental; route bin to bundled CLI; centralize total CLI outcome routing. | Keep earlier npm version or versioned installed artifact available. | Any future legacy-command removal requires at least one prior minor release with warnings/docs. |
| C-3 | Root exports are additive within patches; removals or semantic changes require a minor during `0.x`. Public declarations remain self-contained and path resolution remains explicit. | Replace wildcard barrel with `public.ts`; define public DTOs without internal or Markdown Engine type imports; emit declarations; update source tests to import the public entrypoint. | Consumers can pin earlier package version. | Deprecated exports remain documented for at least one minor before removal. |
| C-4 | Existing v1 field meanings do not change incompatibly. | Publish contract documentation; consumer profiles retain explicit `schemaVersion` and `profileVersion`. | Older package/profile pairing remains pinned together by consumers/fleet. | New incompatible schema uses a new schema-version value and migration guide. |
| C-5 | The first published v1 fixes uniform source/profile descriptors, normative hash preimages, field ordering, and status meanings; afterward, additive optional fields and new diagnostic codes are compatible. | Normalize the currently unpublished v1 DTOs before release and make golden pass/fail/operational fixtures package-contract evidence. | Consumers may pin an earlier package and result schema. | A replacement schema is emitted only via an explicit new version/format path with overlap. |
| C-6 | Installer variables, wrapper name, and versioned layout remain stable. | Build bundle and installer; compute and record first hash. | Repoint/reinstall wrapper to an earlier retained version. | Installer changes follow package SemVer and changelog. |
| C-7 | Release tags and registry versions are append-only. `0.1.0` is the sole recorded no-provenance bootstrap exception; later releases require stage-only OIDC provenance. | Publish the exact CI artifact interactively with 2FA, verify registry integrity, configure trust, then use the staged trusted workflow for every later version. | Deprecate a bad version and publish a fix; do not unpublish except under npm policy and security necessity. | Token-based CI publishing is not introduced. |
| C-8 | Fleet upgrades are exact-version policy changes with contract proof. | Separate PR after first public release. | Restore prior fleet policy version/hash and wrapper. | Consumer removal requires its own repository change; profile ownership never migrates into fleet. |

Section status: complete.

## 8. Validation and Review Plan

| Validation ID | Contract IDs | Method | Evidence required | Owner |
| --- | --- | --- | --- | --- |
| VAL-1 | C-1, C-7 | manifest contract test and owner bootstrap check | Exact name/version/access/repository/license/engine fields; authenticated ownership confirmation before publish | Markdown Trace maintainer and project owner |
| VAL-2 | C-1, C-7 | tarball allowlist audit | `npm pack --dry-run --json` and extracted tarball prove only permitted paths, no secrets, and bounded size/file count | Markdown Trace maintainer |
| VAL-3 | C-2, C-5 | CLI contract tests | Pass/fail JSON goes only to stdout; validation-operational JSON goes only to stderr; invocation/transport prose goes only to stderr; exits are `0/1/2`; no run emits contradictory result surfaces | Markdown Trace maintainer |
| VAL-4 | C-2 | CLI safety and compatibility tests | `--help`, `--version`, unsupported format, missing flags, output alias/hard-link alias, no-write, unwritable output, preservation of a prior destination, empty stdout on write failure, and experimental command visibility | Markdown Trace maintainer |
| VAL-5 | C-3, C-5 | TypeScript and runtime API contract tests | Consumer fixture compiles against packed declarations, can name every nested public DTO, validates absolute/relative paths, and observes absolute source/profile paths for every status with no logging or writes | Markdown Trace maintainer |
| VAL-6 | C-3 | declaration and export-boundary tests | Emitted root declarations contain no internal relative imports or Markdown Engine types; root exports match the allowlist; representative deep imports fail under Node package resolution | Markdown Trace maintainer |
| VAL-7 | C-3, C-4 | profile schema and loader tests | Valid profile plus unreadable, malformed, multi-document, invalid reference, and unsupported-feature fixtures | Markdown Trace maintainer |
| VAL-8 | C-3, C-4, C-5 | schema golden tests and repeatability proof | Stable v1 pass/fail/operational fixtures use identical descriptor keys and absolute paths; golden source/profile/evidence preimages prove the failure-stage availability matrix, semantic hash stability across path/runtime metadata, insertion-order independence, array-order semantics, diagnostic fields, and repeated-byte output | Markdown Trace maintainer |
| VAL-9 | C-1, C-6, C-7 | release invariant scripts | Declarations, bundle, package/engine version single-source checks, installer pin, license/docs presence, and clean-tree verification | Markdown Trace maintainer |
| VAL-10 | C-2, C-6, C-7 | packed-install smoke matrix | Install tarball in empty projects on supported minimum Node 20 and current release Node 24; run CLI and import API; prove Markdown Engine `3.5.0` compatibility | Markdown Trace maintainer |
| VAL-11 | C-6, C-8 | downstream staged integration | skill-fleet verifier accepts staged bundle/wrapper hash and execution-plan/task-definition source-owned pass/fail contracts | skill-fleet and consumer maintainers |
| VAL-12 | C-7 | bootstrap rehearsal and later-release workflow dry run | Bootstrap proves CI artifact SHA, interactive 2FA publication of those exact bytes, registry-integrity match, and recorded no-provenance exception; later path proves pinned action SHAs, minimal permissions, exact-workflow OIDC, staging, owner approval, and visible provenance | Project owner and Markdown Trace maintainer |

Section status: complete.

## 9. Traceability Matrix

| Source ID | Contract IDs | Acceptance/validation IDs | Notes |
| --- | --- | --- | --- |
| REQ-1 | C-1, C-2, C-6, C-7 | VAL-1, VAL-2, VAL-3, VAL-4, VAL-9, VAL-10, VAL-12 | Covers public installation, executable delivery, and publication. |
| REQ-2 | C-2, C-4, C-5 | VAL-3, VAL-4, VAL-7, VAL-8 | Freezes the file-backed CLI boundary. |
| REQ-3 | C-3, C-4, C-5 | VAL-5, VAL-6, VAL-7, VAL-8 | Freezes the narrow ESM API boundary. |
| REQ-4 | C-6, C-8 | VAL-9, VAL-10, VAL-11 | Keeps runtime production in Markdown Trace and policy selection in fleet. |
| REQ-5 | C-4, C-8 | VAL-7, VAL-11 | Keeps profiles and repair behavior with source skills. |
| REQ-6 | C-1, C-3, C-7 | VAL-2, VAL-6, VAL-9 | Prevents accidental tarball and API expansion. |
| REQ-7 | C-2, C-3, C-5 | VAL-3, VAL-5, VAL-8 | Preserves machine-readable diagnostics for future repair consumers. |
| REQ-8 | C-1, C-7 | VAL-1, VAL-2, VAL-9, VAL-12 | Applies scoped-public and OIDC/staged-publishing controls. |
| ASM-1 | C-1, C-7 | VAL-1, VAL-12 | Initial version and public-name observation require bootstrap confirmation. |
| ASM-2 | C-1 | VAL-1 | Establishes the package namespace. |
| ASM-3 | C-1, C-2, C-3 | VAL-4, VAL-5, VAL-10 | Establishes ESM and Node support. |
| ASM-4 | C-6 | VAL-9, VAL-10, VAL-11 | Reuses the proven distribution shape without transferring ownership. |
| Q-1 | C-1, C-7 | VAL-1, VAL-9, VAL-12 | Resolved as `MIT`; implementation and publication evidence remain required. |
| DEC-1 | C-1, C-7 | VAL-1, VAL-2, VAL-10, VAL-12 | Ratifies the scoped package name and initial version; bootstrap still proves namespace ownership. |
| DEC-2 | C-3, C-4, C-5 | VAL-5, VAL-8 | Ratifies semantic hash field sets, exclusions, and failure-stage availability. |
| DEC-3 | C-7 | VAL-12 | Corrects the staged-publishing tool floor and action-pin freshness requirement. |

Section status: complete.

## 10. Open Questions

| Question ID | Question | Owner | Due date or decision point | Impact if unresolved |
| --- | --- | --- | --- | --- |
| Q-1 | `MIT` approved as the Markdown Trace public package license, matching Markdown Engine. | Project owner | Resolved 2026-08-26 | Implementation may add `MIT` metadata and the corresponding license file; publication remains subject to `C-7`. |
| Q-2 | Use stable semantic hashes that exclude filesystem path and runtime/package metadata, with the explicit failure-stage availability matrix in `C-5`. | Project owner | Resolved by self-review rework authorization, 2026-08-26 | Hash implementation and golden tests may proceed only against the corrected field sets and sequencing. |
| Q-3 | Retain `@jasonbelmonti/markdown-trace@0.1.0` and use the corrected staged-publishing floor. | Project owner | Resolved by self-review rework authorization, 2026-08-26 | Package and workflow tasks may use the ratified identity and current npm requirements. |

Section status: complete; no open question remains.

## 11. In-Situ Evaluation

### Grounding Evidence

| Evidence ID | Source | Tool/source type | What was inspected | Relevant contracts |
| --- | --- | --- | --- | --- |
| EVD-1 | Markdown Trace `package.json`, `tsconfig.build.json`, `src/markdowntrace/index.ts`, `src/markdowntrace/runtime-metadata.ts` | code and config | Private prototype metadata, absent declarations/exports/allowlist, wildcard exports, hardcoded package/engine versions | C-1, C-3, C-5, C-7 |
| EVD-2 | `src/markdowntrace/graph-validation/run.ts`, `model.ts`, `index.ts`; `src/markdowntrace/graph-profile/load.ts`, `model.ts`, `diagnostics.ts` | code | File-backed API, v1 input/output schemas, status/error model, and public type candidates | C-3, C-4, C-5 |
| EVD-3 | `tests/test_graph_cli.test.ts` | tests | API pass/fail/operational cases; deterministic CLI JSON; stream routing; exits `0/1/2`; output alias safety | C-2, C-3, C-5 |
| EVD-4 | `src/markdowntrace/cli.ts`, `README.md` | code and docs | Existing commands, graph command arguments, absent `--version`, prototype language, and missing public installation docs | C-2, C-7 |
| EVD-5 | `npm pack --dry-run --json`, 2026-08-26 | package inspection | Current dry run emits 224 files, about 372 KB packed and 1.63 MB unpacked, using `.gitignore` fallback | C-1, C-7 |
| EVD-6 | Public npm registry queries, 2026-08-26 | registry | Scoped and unscoped names returned `E404`; `@jasonbelmonti/markdown-engine` is public | C-1, C-7 |
| EVD-7 | Markdown Engine `origin/main` package `3.5.0` and installer | adjacent implementation | Public manifest, declaration/exports boundary, files allowlist, bundled CLI, hash-pinned installer, release verification | C-1, C-6, C-7 |
| EVD-8 | skill-fleet `origin/main:fleet/runtimes/markdown-engine.json` | adjacent config | Fleet pins exact package/version/hash and consumer contracts while remaining payload-free | C-6, C-8 |
| EVD-9 | [npm scoped-public package documentation](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/), inspected 2026-08-26 | official docs | Scoped packages require public access selection; staged publication supports later 2FA approval | C-1, C-7 |
| EVD-10 | [npm trusted-publisher documentation](https://docs.npmjs.com/trusted-publishers/), inspected 2026-08-26 | official docs | OIDC, supported GitHub-hosted runners, Node/npm minimums, exact workflow trust, and minimal permissions | C-7 |
| EVD-11 | [npm `package.json` documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/), inspected 2026-08-26 | official docs | `files` controls contents, `exports` encapsulates entrypoints, `bin` exposes executables, repository metadata requirements | C-1, C-2, C-3 |
| EVD-12 | Repository root and GitHub metadata | code search and GitHub | No `LICENSE`, `CHANGELOG.md`, `SECURITY.md`, or release workflow; public GitHub repository reports no license | C-1, C-7, Q-1 |
| EVD-13 | Semantic contract review against `src/markdowntrace/cli.ts`, graph-validation and trace-evidence models, plus npm trusted-publisher constraints, 2026-08-26 | code, tests, and official docs | Current CLI can publish stdout before output persistence and uses prose for top-level errors; public candidates import internal/engine types; completed profile identity lacks path; hashes depend on implicit `JSON.stringify` construction order; initial ownership bootstrap cannot use package-configured trusted publishing | C-2, C-3, C-4, C-5, C-7 |
| EVD-14 | Self-review against current trace-evidence/runtime models and decomposed plan ordering, 2026-08-26 | code and durable artifacts | A hash over the complete trace-evidence DTO would include path and runtime/version metadata, causing relocation/runtime drift and invalidating early golden hashes when the later package phase changes Markdown Engine metadata. | C-3, C-5 |
| EVD-15 | [npm staged publishing](https://docs.npmjs.com/staged-publishing/), [npm trusted publishers](https://docs.npmjs.com/trusted-publishers/), and official GitHub action repositories, inspected 2026-08-26 | official docs and immutable tag resolution | Staged publishing requires npm 11.15.0 or later and an existing package; current reviewed action majors resolve to checkout v6 `d23441a48e516b6c34aea4fa41551a30e30af803`, setup-node v6 `249970729cb0ef3589644e2896645e5dc5ba9c38`, and upload-artifact v7 `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`. | C-7 |

### Rubric Scores

| Axis | Score | Evidence IDs | Finding IDs | Notes |
| --- | --- | --- | --- | --- |
| Behavioral fitness | Pass | EVD-2, EVD-3 | FND-1 | Stable operation and v1 result already exist; contract adds distribution without changing graph semantics. |
| Consumer fitness | Concern | EVD-2, EVD-3, EVD-8, EVD-13 | FND-1 | The contract is consumer-shaped, but the implementation still leaks internal/engine types and varies profile descriptors by status. |
| Integration realism | Concern | EVD-6, EVD-7, EVD-8, EVD-9, EVD-10, EVD-13, EVD-15 | FND-2, FND-3, FND-7 | Concrete precedents exist; bootstrap and later trusted-publication paths require distinct implementation, current tool floors, and fresh immutable action pins. |
| Change safety | Concern | EVD-1, EVD-4, EVD-5, EVD-13 | FND-1, FND-2, FND-4, FND-6 | Current implementation must be narrowed, result/hash behavior normalized, and release metadata made single-source before publication. |
| Failure semantics | Concern | EVD-2, EVD-3, EVD-13 | FND-1, FND-4 | The revised routing is total, but current output-write ordering can expose stdout success before persistence fails. |
| Data and invariant protection | Concern | EVD-2, EVD-3, EVD-13, EVD-14 | FND-1, FND-6 | Inputs are guarded, but current hashes lack schema-owned canonical preimages and completed results omit profile path; the corrected contract excludes path/runtime metadata and defines stage-specific availability. |
| Operational fitness | Concern | EVD-4, EVD-7, EVD-12 | FND-3, FND-4 | Bundle, installer, docs, version command, and release gates are specified but not implemented. |
| Security and trust handling | Concern | EVD-9, EVD-10, EVD-12 | FND-3, FND-5 | The license is selected and the OIDC/staging contract is sound; registry bootstrap remains an external owner action. |
| Testability | Pass | EVD-3, EVD-7, EVD-13 | FND-1, FND-2, FND-3, FND-4, FND-6 | Every contract correction has an automatable validation target plus bounded owner checks. |
| Implementation proportionality | Pass | EVD-1, EVD-5, EVD-7, EVD-8 | FND-1, FND-2, FND-3 | One release-focused Markdown Trace change can establish the package; fleet/profile work remains separate. |

### Evaluation Findings

| Finding ID | Severity | Axis | Affected contracts | Evidence IDs | Required action | Validation target |
| --- | --- | --- | --- | --- | --- | --- |
| FND-1 | Major | Consumer fitness | C-3, C-4, C-5 | EVD-1, EVD-2, EVD-3, EVD-13 | Add a dedicated public entrypoint whose DTOs do not import internal or Markdown Engine types; normalize source/profile descriptors, including absolute profile path, across every result status. | VAL-5, VAL-6, VAL-8 |
| FND-2 | Major | Integration realism | C-1, C-7 | EVD-5, EVD-11 | Add a package `files` allowlist and fail release verification on unexpected tarball paths. | VAL-2, VAL-9 |
| FND-3 | Major | Operational fitness | C-1, C-6, C-7 | EVD-1, EVD-7, EVD-10, EVD-13 | Build and verify the bundled CLI/installer, align Markdown Engine `3.5.0`, implement the exact-artifact interactive bootstrap, then configure isolated stage-only OIDC automation for later releases. | VAL-9, VAL-10, VAL-12 |
| FND-4 | Major | Failure semantics | C-1, C-2, C-5, C-7 | EVD-1, EVD-4, EVD-12, EVD-13 | Centralize total CLI outcome routing; make requested output persistence atomic and prior to stdout; eliminate hardcoded version metadata; add `--version` and public release/security documentation. | VAL-3, VAL-4, VAL-8, VAL-9 |
| FND-5 | Blocker | Security and trust handling | C-1, C-7 | EVD-9, EVD-12 | Add the approved `MIT` metadata/file and complete the separately authorized authenticated initial package ownership bootstrap. | VAL-1, VAL-9, VAL-12 |
| FND-6 | Major | Data and invariant protection | C-4, C-5 | EVD-2, EVD-13, EVD-14 | Implement schema-owned canonical serializers for the corrected semantic profile/evidence projections, exclude path/runtime/redundant hash fields, preserve declared array semantics, retain acquired hashes by failure stage, and add golden preimage/hash fixtures. | VAL-8 |
| FND-7 | Major | Integration realism | C-7 | EVD-10, EVD-15 | Use npm 11.15.0 or later for staged publishing and pin the reviewed current supported action generations immediately before workflow implementation. | VAL-12 |

Section status: revised contracts fit the implementation context; findings are implementation work, with `FND-5` blocking only public publication.

## Internal Review Record

- Contract depth calibration: `ID2` is appropriate because npm identity, CLI/API compatibility, schema versions, runtime distribution, and publishing trust become public or persisted boundaries.
- Grounding result: passed. The draft was reconciled against current Markdown Trace source/tests/package output, the adjacent Markdown Engine distribution implementation, skill-fleet runtime policy, registry observations, and current official npm documentation.
- Rubric result: three axes pass and seven axes remain concerns against the current implementation. The contract resolves the semantic contradictions; each concern maps to bounded release implementation evidence.
- Findings addressed in the self-review revision: package identity/version and semantic hash decisions are explicitly ratified; trace-evidence hashes exclude filesystem path and runtime/package metadata; operational hash availability is stage-specific; the public contract may be organized into focused modules; and the staged-publishing floor/action generations are current. Earlier CLI routing, bootstrap separation, profile/fleet ownership, tarball bounds, and single-source versioning remain intact.
- Validation result: passed the interface-design structural profile with Markdown Engine `3.5.0` after the semantic rework; no diagnostics remain.
- Remaining findings: `FND-1` through `FND-4`, `FND-6`, and `FND-7` are implementation requirements. `FND-5` blocks first public publication until the license artifact and separately authorized npm bootstrap are complete.
- Readiness verdict: ready for release-task authoring and execution planning; public publish authorization is not yet ready.
