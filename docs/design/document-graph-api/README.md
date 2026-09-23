# Document graph API design companions

Read the [interface packet](../markdown-trace-document-graph-interfaces.md) for the full validation design and proposed traversal/context semantics. The [experimental guide](../../experimental-document-graph.md) and [validation guide](../../experimental-graph-validation.md) define the runnable APIs; installed declarations under `src/markdowntrace/document-graph/contracts/` describe their implemented types.

| Artifact | Role |
| --- | --- |
| [contracts/](contracts/index.d.ts) | Type-checkable design for the full API, including operations not yet exported. |
| [Consumer example](examples/consumer.ts) | Proposed full consumer flow; type-checked, not executable. |
| [Profile example](examples/profile.ts) | Domain vocabulary and proposed full validation policy using draft2. It type-checks against the design declarations; the runtime uses a separate experimental validation-profile schema. |
| [Runtime fixture](../../../fixtures/document-graph/mixed-layout.md) | Current standard-link example, exercised by runtime tests and the demo. |

Check the proposed declaration and consumer shapes from the repository root:

```sh
./node_modules/.bin/tsc -p docs/design/document-graph-api/tsconfig.json
```

[validation.json](validation.json) records structural/declaration checks and artifact hashes. Verify hashes before relying on a durable handoff. These checks do not execute the proposed full C-4 contract or traversal/context APIs. The implemented validation subset has separate runtime proof in focused tests, the package consumer and CI.

Superseded brace-language fixtures, source ledgers, probes and contract-closeout plans are removed; Git history retains them. No historical corpus-completion gate blocks development from the runnable graph.
