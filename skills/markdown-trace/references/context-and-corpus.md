# Context and corpus use

## Local source context

After confirming `context` in the bound runtime's help, invoke the same helper
from the document directory with its explicit validation profile:

```sh
node "$SKILL_DIR/scripts/run.mjs" --file document.md --profile profile.json \
  --format context --root REQ-1 --direction outgoing \
  --max-depth 2 --max-nodes 20 --max-utf8-bytes 12000 --max-fragments 40
```

Use identifiers and relationship kinds from the document's profile. Repeat
`--root` for multiple roots and `--relation` to filter edge kinds. Direction can be
incoming, outgoing or both. All four limits are required nonnegative integers;
max-nodes must cover the distinct roots. Roots need unique known definitions.

Output is `{ validation, context }`. Inspect the original validation verdict,
selected identifiers and predecessor evidence, traversal `boundary`, source hash,
verbatim `parts` and ranges, `includedIdentifiers` and `omittedIdentifiers`.
Source budgets count UTF-8 text and fragments, not serialized JSON bytes or tokens.
Zero budgets can omit all selected content. Exit 0 means validation passed, not
that context is complete. Validation failure returns exit 1 with available
context; invalid invocation or unusable roots return exit 2. Never treat omission
as authorization to skip a controlling requirement or full read.

## Exact-text view with retained evidence

When the verified runtime's help lists `context-text`, prefer it for reading
selected source without loading the complete JSON into model context:

```sh
node "$SKILL_DIR/scripts/run.mjs" --file document.md --profile profile.json \
  --format context-text --report-file context-report.json \
  --root REQ-1 --direction outgoing \
  --max-depth 2 --max-nodes 20 --max-utf8-bytes 12000 --max-fragments 40
```

Use a new report path in an existing directory. This option is accepted only for
`context-text`; existing files and aliases to inputs are refused. The complete
`{ validation, context }` JSON is saved before any text is emitted. A write failure
returns exit 2 with no text view; an incomplete report from a failed write is not
evidence. Use a fresh path on retry. The view names the report path and its raw
SHA-256 so detailed provenance can be retrieved when needed, without routinely
reading the full report.

Inspect validation, analysis coverage, traversal boundaries and omission counts
in the text view. It displays up to ten omissions/diagnostics and identifiers per
excerpt, with explicit overflow notices; long diagnostic messages are shortened.
Read the retained report for omitted metadata needed for a decision. Source
excerpts are unchanged, including whitespace and line endings, inside fences
longer than their own backtick sequences. Ranges are end-exclusive; the newline
before each closing fence is a view separator, not part of the source slice.

The original `context` JSON mode, budgets and validation exit codes are unchanged.
Neither view certifies required-context completeness or changes reading authority.
An older installed runtime may lack this format; report the capability difference
and keep using the authorized runtime rather than silently substituting a checkout.

## Explicit cross-document context

The package root and `experimental/graph` expose `createCorpus`,
`lookupCorpusIdentifier`, `findCorpusIncoming`, `findCorpusOutgoing`,
`traverseCorpus` and `checkCorpusSelection`. This is an API workflow for a host
with an explicitly selected compatible package/runtime, not an additional format
accepted by the installed document CLI. Do not infer a package import path from
an executable binding or fall back to another installation implicitly.

The host reads a finite chosen set of documents, analyzes each with the same
interpretation, and supplies trusted expected source/analysis identities.
Bindings name a source analysis plus reference occurrence and a target analysis
plus identifier. A bare ID or alias is not global identity. Trace preserves local
validation and occurrence evidence; it does not crawl files or guess revisions.

Traverse qualified entities under explicit depth/node limits, check the returned
selection against its corpus, group nodes by analysis, then use genuine local
`traverseGraph` selections at depth zero with `extractContext` and per-document
budgets. Excerpts may omit selected entities; linked content does not establish
mandatory-context completeness.

After edits, review and update capture pins, affected binding occurrence/target
identities and qualified query keys (including traversal roots and inspection
keys). Old pins fail as stale. The source repository's `examples/cross-document/`
manifest and `scripts/demo-document-corpus.mjs` demonstrate this host composition;
they are development examples, not bundled skill commands or implicit fallbacks.

## Fleet and runtime selection

Fleet's Trace `runtime-verify`/`runtime-env` accepts an explicit installed launcher
and skill root, checks pinned runtime and consumer inputs, and executes the
source-owned contract. Its environment map supplies `MARKDOWN_TRACE_BIN` as the
immutable verified launcher. The host applies that map when starting an agent;
changing a symlink does not update an already-bound process.

A rollout updates the Trace source pin, candidate descriptor/payload digests,
consumer contract and helper hashes together. Stage and verify the candidate
before owner-authorized activation, retain the prior release, then verify through
the installed skill helper. Shared Markdown Engine structural checks continue
through their separate verified wrapper; Trace's embedded Engine library is not
an interchangeable executable binding.
