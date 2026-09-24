# Test scope

Tests protect the [document-wide graph](../docs/current-implementation.md), validation profile, direct queries, exports, document command, release metadata, portable skill and packed-package boundary. The bundled [mixed-layout fixture](../fixtures/document-graph/mixed-layout.md) and [preview example](../examples/preview-design/document.md) exercise current draft2 links and profiles.

Tests for the retired table-profile validator, registry/sidecar derivation and migration comparison were removed with their implementations. Do not restore those fixtures to claim coverage of the document graph. Add focused cases at the owning graph boundary for new traversal or projection behavior, and retain packed-consumer and runtime checks for changes to public artifacts.
