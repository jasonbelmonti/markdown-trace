# Portable Trace skill result

Read [the task](../tasks/portable-trace-skill.md), revision 1, and its controlling
sources first. The task is READY / DIRECT; its checkpoint records review-ready
execution evidence, not acceptance. [PR #92](https://github.com/jasonbelmonti/markdown-trace/pull/92)
delivers this package for the coordinated Skill Fleet integration.

The source and skill pin is `dde0960b10c0a5c927d605286370b3682766dce8`.
Later evidence/checkpoint commits preserve every implementation, skill, profile,
fixture and proof input. The package root is `skills/markdown-trace`; copy that
directory completely. Its `skill-package.json` includes transitively loaded
resources. The runtime resolver is owned by the package; the existing
`scripts/runtime/resolve-binding.mjs` entry delegates to it for compatibility.

The installed helper accepts the host's verified absolute `MARKDOWN_TRACE_BIN`.
Invalid explicit bindings fail; only empty/unset bindings allow exact command
discovery. It forwards arguments with no shell and retains the caller's cwd.
The package includes local protocol/profile guides and both example profiles;
tests compare mirrored contract sections and source-owned fixture/profile bytes.

The declarative consumer contract is `contracts/runtime.json` relative to the
package root, with schema `markdown-trace.consumer-contract.v1`. It selects the
preview profile and document, expects three entities/two relationships, removes
one exact relationship literal in a disposable copy, expects
`design-implements-requirement` / `trace-validation.relation-count` at line 9,
then restores original bytes and expects a pass. The report scalar count fields
are `identifiers` and `relationships`; the diagnostic has `line` and
`range.start.line`. Additional diagnostics are permitted. Every document owner
still runs its own structural and semantic gates.

## Evidence and reproduction

[Checks](../validation/portable-trace-skill/checks.json) identify the tested
commit, exact environment and passed commands. [Installed-copy proof](../validation/portable-trace-skill/installed-copy.json)
contains all package file fingerprints, located failure, repair, graph/query
facts, binding cases and unchanged input hashes. [Runtime proof](../validation/portable-trace-skill/runtime.json)
and [installer proof](../validation/portable-trace-skill/installer.txt) establish
compatibility with the existing artifact and installer workflows. An independent
[agent scenario](../validation/portable-trace-skill/independent-agent.json) follows
the skill after actual `gh skill install` at the source pin; only installer-added
SKILL frontmatter differs from the original package bytes. Enforcement
passes all 40 test files / 298 tests; packed package consumers pass.

Produce a candidate from the pinned source, then run:

```sh
node scripts/runtime/build.mjs --out /absolute/path/to/new-candidate
node scripts/skill/check.mjs --artifact /absolute/path/to/new-candidate
```

The local candidate used for recorded checks is `dist/portable-skill-runtime`.
Its release descriptor SHA-256 is
`f203fd171f331671157c67cb2e5abd6878669251d7e8a3ea5a18c019213798d3` and
payload SHA-256 is
`95e1891e7cfe7af37720a0e784b498fc0466fe5cba609e338b7e4da50dada4d9`.
The producer toolchain and complete descriptor inventory remain in the candidate;
these hashes identify this build rather than promising cross-toolchain equality.

CI run [35912087657](https://github.com/jasonbelmonti/markdown-trace/actions/runs/35912087657)
passes copied-skill proof on Linux Node 20.19.0 and macOS Node 22.20.0 alongside
existing portable-runtime proofs at the selected source pin. Inspect the PR checks for the current remote
result; the recorded local environment is independently identified in evidence.
Fleet pins this skill/runtime source and repeats admission checks in its own PR.
Neither PR merges or activates the user's existing installation automatically.
