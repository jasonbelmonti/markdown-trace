# Document graph API design companions

Read the [interface packet](../markdown-trace-document-graph-interfaces.md) for proposed validation, traversal and context semantics. The [experimental guide](../../experimental-document-graph.md) defines the current link language and runnable API; installed declarations under `src/markdowntrace/document-graph/contracts/` describe its implemented types.

| Artifact | Role |
| --- | --- |
| [contracts/](contracts/index.d.ts) | Type-checkable design for the full API, including operations not yet exported. |
| [Consumer example](examples/consumer.ts) | Proposed full consumer flow; type-checked, not executable. |
| [Profile example](examples/profile.ts) | Domain vocabulary and proposed validation policy using draft2. Compilation exists; graph-policy evaluation does not. |
| [Runtime fixture](../../../fixtures/document-graph/mixed-layout.md) | Current standard-link example, exercised by runtime tests and the demo. |

Check the proposed declaration and consumer shapes from the repository root:

```sh
./node_modules/.bin/tsc -p docs/design/document-graph-api/tsconfig.json
```

[validation.json](validation.json) records current structural/declaration checks and artifact hashes. Verify hashes before relying on a durable handoff. These checks do not execute the proposed validator, traversal or context APIs. Runtime proof lives in the focused tests, package consumer and CI.

Superseded brace-language fixtures, source ledgers, probes and contract-closeout plans are removed; Git history retains them. No historical corpus-completion gate blocks development from the runnable graph.
