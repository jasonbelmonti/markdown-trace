# Markdown Trace

Markdown Trace is a local TypeScript prototype for validating document-local
entities in Markdown execution artifacts.

It proves two related workflows:

- R0: validate Markdown against a YAML sidecar entity registry.
- R1: derive entity, reference, range, registry, and graph facts from standard
  Markdown links that use `ctx://trace` URLs and local type profiles.

The repository is public in preparation for release, but the package is not yet
published. The prototype is local-first and does not call Linear, Jira, GitHub,
network services, graph databases, daemons, or hosted APIs.

## Current Status

The R1 prototype is complete. The repository is being prepared for a public
release path, but the current code should still be treated as a local prototype.
The final R1 recommendation is to continue toward annotated Markdown as the
preferred authoring source, but to generate checked sidecar registry artifacts
before replacing YAML sidecars.

Primary evidence:

- `docs/evidence/r1-link-backed-evidence-and-recommendation.md`
- `docs/evidence/prototype-decision-record.md`
- `docs/markdown-trace-r1-link-backed-entity-syntax.md`

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm

Install dependencies:

```bash
npm ci
```

Build the CLI:

```bash
npm run build
```

The built CLI entry point is:

```bash
node dist/markdowntrace/cli.js
```

## Quick Start

Validate the R0 sidecar fixture:

```bash
npm run validate:fixture
```

This validates:

- `fixtures/r0-document-local-registry/execution-spec.md`
- `fixtures/r0-document-local-registry/entity-registry.yaml`

It prints a Markdown validation report and writes the same report to:

```text
docs/evidence/valid-fixture-report.md
```

Derive a registry and graph from the R0 fixture:

```bash
npm run derive:fixture
```

Run the core local checks:

```bash
npm test
npm run typecheck
npm run build
```

## CLI Commands

Show help:

```bash
node dist/markdowntrace/cli.js --help
```

Validate a document against a sidecar registry:

```bash
node dist/markdowntrace/cli.js validate \
  --registry fixtures/r0-document-local-registry/entity-registry.yaml \
  --document fixtures/r0-document-local-registry/execution-spec.md \
  --report docs/evidence/valid-fixture-report.md
```

Exit codes:

- `0`: validation passed
- `1`: validation completed with findings
- `2`: CLI/input/load error

Derive a registry and graph from a Markdown document:

```bash
node dist/markdowntrace/cli.js derive \
  --document fixtures/r0-document-local-registry/execution-spec.md \
  --namespace exec
```

Derive R1 link-backed entities with an explicit type profile:

```bash
node dist/markdowntrace/cli.js derive \
  --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml
```

Derive the CODEFACTORY-style R1 fixture:

```bash
node dist/markdowntrace/cli.js derive \
  --document fixtures/r1-link-backed-entity-syntax/codefactory-link-backed-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/codefactory-type-profile.yaml
```

Write derived output to a file:

```bash
node dist/markdowntrace/cli.js derive \
  --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml \
  --output /tmp/markdown-trace-derived.yaml
```

## R1 Link Syntax

Heading links define entities when they use this URL shape:

```md
### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Build parser
```

Body links reference entities:

```md
WP-1 depends on [CON-1](ctx://trace/entity/exec.con.1).
```

Body links can reference bounded label ranges:

```md
WP-1 covers [CON-1 through CON-3](ctx://trace/range/CON-1/CON-3).
```

Reference-style Markdown links are also supported when they resolve to the same
`ctx://trace` URL forms.

## Type Profiles

R1 documents use a local type profile to define valid entity types and optional
label or canonical-ID constraints.

Example:

```yaml
profileVersion: markdown-trace.type-profile.v1
entityTypes:
  constraint:
    labelPrefixes: [CON]
    canonicalPattern: "^exec\\.con\\.\\d+$"
  work_package:
    labelPrefixes: [WP]
    canonicalPattern: "^exec\\.wp\\.\\d+$"
```

Rules enforced by the prototype:

- Definition links must include `type`.
- The type must exist in the active profile.
- `labelPrefixes` are enforced when present.
- `canonicalPattern` is enforced when present.
- Reference links may omit `type` after the canonical entity is defined.
- Repeated reference types must match the definition type.
- Duplicate canonical IDs, duplicate labels, missing references, and incomplete
  ranges fail deterministically.

## Repository Layout

```text
src/markdowntrace/          TypeScript implementation
fixtures/r0-document-local-registry/
                            R0 YAML sidecar validation fixture
fixtures/r1-link-backed-entity-syntax/
                            R1 ctx://trace link-backed fixtures and profiles
docs/                       Design, execution, and evidence documents
tests/                      Vitest suite and evidence harnesses
```

Key implementation areas:

- `src/markdowntrace/cli.ts`: CLI entry point
- `src/markdowntrace/markdown/`: Markdown scanning and trace-link facts
- `src/markdowntrace/profiles/`: R1 type-profile loading and validation
- `src/markdowntrace/registry/`: sidecar loading and derived registry generation
- `src/markdowntrace/graph/`: graph projection
- `src/markdowntrace/validation/`: validation findings and summaries

## What This Is Not Yet

Markdown Trace is not yet a published package, production service, or migration
tool. The repository is public for release preparation, but the CLI remains a
local prototype. It does not yet generate checked sidecar registry artifacts as
a first class workflow. That is the recommended next implementation slice.

The current prototype is suitable for:

- inspecting the R0 and R1 fixture behavior
- validating the R0 sidecar fixture
- deriving registry and graph output from fixture Markdown
- proving deterministic failure behavior through the test suite

It is not yet suitable for:

- replacing YAML sidecars in production workflows
- live Linear, Jira, or GitHub projection
- multi-document graph projection
- network-backed registry or type-profile loading

## Recommended Next Slice

Implement generation of a checked sidecar registry artifact from link-backed
annotated Markdown.

The intended direction is:

1. Keep YAML sidecars accepted for compatibility.
2. Derive a deterministic registry artifact from `ctx://trace` Markdown and a
   local type profile.
3. Let reviewers compare generated artifacts against the known R0 control.
4. Define migration criteria before removing or replacing YAML sidecars.
