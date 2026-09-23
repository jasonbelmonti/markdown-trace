# Portable document runtime

The local producer creates a versioned, relocatable directory containing Trace's
compiled JavaScript and all locked production dependencies, including Engine
3.6.0. Node remains an external prerequisite: `^20.19.0 || >=22.12.0`, on Linux
or macOS. The package remains private at 0.1.0. The document command and both
package APIs retain their existing meanings.

## Produce a candidate

From a checkout of the desired committed source, with Git, tar, npm and supported
Node available, choose a new staging directory outside the checkout:

```sh
npm ci
node scripts/runtime/build.mjs --out /tmp/trace-candidate-a
```

Runtime-affecting source, producer scripts, package/lockfile and compiler
configuration must be committed. The producer rejects dirty inputs. It exports
HEAD into a fresh disposable directory, installs from the lockfile without
lifecycle scripts or bin links, generates version metadata, injects the full
source commit into that snapshot, compiles, and prunes development dependencies.
Existing checkout `dist` and `node_modules` never enter the candidate. No active
runtime binding is changed. Build-time dependency downloads are permitted.

The output is:

```text
/tmp/trace-candidate-a/
  release.json
  markdown-trace-0.1.0-<full-source-commit>/
    package.json
    package-lock.json
    dist/
    node_modules/
```

Dependency licenses remain with their package contents. npm's hidden installation
lock is excluded because it is build bookkeeping, with platform-specific optional
development entries; the root package lock and actual production files are
included. No launcher or archive is produced. File paths and raw bytes are
covered; directory timestamps, filesystem ownership and permission bits are not
part of the reproducibility identity. Invocation is through Node, so payload
files need read permission and directories need traversal permission.

`release.json` contains source identity, protocol versions, Node range, source
input fingerprints, lockfile hash, Node/npm/TypeScript toolchain, locked dependency
versions/integrities, every payload file's size and SHA-256, and a digest of the
sorted inventory. It contains no build timestamps or absolute build paths.
The inventory digest is SHA-256 of UTF-8 `JSON.stringify(files)`, where each
sorted entry has keys `path`, `size`, `sha256` in that order.

## Verify before executing

Obtain the directory and descriptor from the producer. Retain the descriptor
through a trusted handoff separately from an untrusted candidate. The checksum
and self-reported identity provide integrity and corroboration, not signatures or
proof of authenticity. Run the verifier from trusted source, not from candidate
code. It uses only Node built-ins and does not import or execute the payload:

```sh
stage=/tmp/trace-candidate-a
payload="$stage/markdown-trace-0.1.0-<full-source-commit>"
node scripts/runtime/verify.mjs --descriptor "$stage/release.json" --payload "$payload"
```

Replace `<full-source-commit>` with the producer's full commit printed in its
result, or the `payloadDirectory` recorded in the trusted descriptor. Verification
returns JSON with `valid: true` and exit 0, or an error on stderr and nonzero exit.
Missing, changed, extra and symbolic-link content is rejected. This verifier is
an artifact integrity check; it does not implement Fleet policy or activation.
Use a stable candidate directory during verification and execution. A later
installer owns immutable staging and race protection across admission/activation.

## Invoke from any working directory

After verification, use an absolute payload path. Relative document/profile
paths resolve against the caller's current directory, and spaces remain ordinary
argument data:

```sh
node "$payload/dist/markdowntrace/document-graph/cli.js" --runtime-info
node "$payload/dist/markdowntrace/document-graph/cli.js" \
  --file 'my document.md' --profile 'my profile.json' --format graph
```

Execution needs no Git, npm, global package, checkout, dependency installation or
network fetch. The Node entry point is a staging interface for later installers;
this task does not install `markdown-trace-document` or set `MARKDOWN_TRACE_BIN`.
The identity mode emits one C-3 JSON object on stdout, empty stderr and exit 0.
It accepts no other arguments, and never reads document/profile inputs. Checkout
builds report `sourceCommit: null`; release candidates report the snapshot commit.
`nodeVersion` always reports the executing Node. Existing `--help`, report,
graph, query, Mermaid, HTML, exit codes and channels are preserved. HTML generation
is local; opening its diagram retains the pinned Mermaid CDN behavior.

Profiles stay explicit. Trace imports its own Engine JavaScript library; the
separate `markdown-engine` CLI remains the document owner's structural gate.
A passing Trace result does not establish structural or semantic readiness.

## Reproduce and test

Build twice from the same committed source and declared toolchain, with fresh
staging directories; both builds acquire and compile their own clean inputs:

```sh
node scripts/runtime/build.mjs --out /tmp/trace-candidate-b
node scripts/runtime/reproduce.mjs --first /tmp/trace-candidate-a --second /tmp/trace-candidate-b
node scripts/runtime/check.mjs --artifact /tmp/trace-candidate-a
```

The comparison requires identical entire descriptors and covered file inventories.
The artifact check verifies integrity, copies the payload and explicit fixtures
outside the checkout, uses empty PATH and disabled global module search, restricts
Node filesystem access and subprocess creation, and blocks network APIs. It
asserts those isolation controls, all output modes, identities/edges/ranges,
located defects and repairs, invalid/indeterminate graphs and unchanged inputs.
It also deletes a required Engine file and requires actual execution failure.
No fallback to a checkout command or missing-dependency install is possible.
`--report /absolute/new-report.json` saves detailed environment and input evidence.
Temporary mutations are confined to the disposable copy; the original candidate
is verified again afterward.

Run repository compatibility and owner checks separately, sequentially (the
existing local-safety tests watch repository writes):

```sh
npm run ci:enforcement
npm run check:package-exports
node experiments/task-definition-trace/verify.mjs
```

The owner trial requires the separate Engine 3.6.0 CLI and installed task-definition
profile. CI includes artifact execution on Linux Node 20.19.0 and macOS Node
22.20.0. Configuring a CI job is not evidence that it has run: only retained
execution results support a platform claim. See the implementation evidence in
`docs/validation/portable-trace-runtime/` for completed and unavailable gates.

Versioned installation, active launchers, rollback, Fleet admission, installed
skill migration, remote distribution and publishing remain separate work.
