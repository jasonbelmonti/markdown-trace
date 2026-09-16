# Experimental document graph and backlinks

The first document-wide graph API is runnable from a built checkout or packed tarball at `@jasonbelmonti/markdown-trace/experimental/graph`. It uses Markdown Engine 3.5.0 for structure and source maps. The package remains private; the experimental entry point and draft language may change before a stable release.

Run the mixed-layout example:

```sh
npm ci
npm run demo:graph
# Optional: inspect another document using the demo's REQ/WP/VAL vocabulary.
npm run demo:graph -- path/to/spec.md REQ-2
```

The default example produces six identifiers, ten occurrences and four relationships. `REQ-2` has two incoming references: one from the `WP-1` nested list at line 8, and one from the `WP-2` table row at line 14. The demo prints their exact locations and source text.

## API example

```js
import {
  compileProfile, analyzeDocument, lookupIdentifier, findIncoming, findOutgoing,
} from '@jasonbelmonti/markdown-trace/experimental/graph';

const unwrap = result => {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};
const profile = unwrap(compileProfile({
  schemaVersion: 'markdown-trace.document-profile.v1',
  profileId: 'my-spec',
  interpretation: {
    language: 'markdown-trace.identity.draft2',
    entityKinds: [
      { name: 'requirement', prefixes: ['REQ'] },
      { name: 'work', prefixes: ['WP'] },
    ],
  },
  validation: { minEntities: 0, allowedRelations: [], rules: [] },
}));
const text = '# [Requirement](ctx://trace/entity/REQ-1?role=definition)\n\n'
  + '- [Work](ctx://trace/entity/WP-1?role=definition) '
  + '[requirement](ctx://trace/entity/REQ-1?rel=implements)';
const analysis = unwrap(analyzeDocument({ documentId: 'spec.md', text }, profile, {
  maxSourceUtf8Bytes: 1_000_000,
  maxOccurrences: 10_000,
}));
const definition = unwrap(lookupIdentifier(analysis, 'REQ-1'));
const backlinks = unwrap(findIncoming(analysis, 'REQ-1'));
const outgoing = unwrap(findOutgoing(analysis, 'WP-1', {
  relations: ['implements'], offset: 0, limit: 100,
}));
```

`compileProfile` checks and captures profile configuration. It does **not** evaluate relationship validity yet. The `validation` section is accepted for later policy evaluation; it neither removes relationships nor turns analysis into a validity verdict. Changing only that section leaves the graph and analysis identity unchanged.

## Link identity language

Declarations and typed references use standard Markdown links. Markdown Engine parses links and resolves reference-style destinations; Trace interprets their URI values. Labels are presentation text and do not have to match the target identifier.

```markdown
## [Sign-in requirement](ctx://trace/entity/REQ-1?role=definition)

Users can sign in.

## [Sign-in work](ctx://trace/entity/WP-1?role=definition)

Implements [the requirement](ctx://trace/entity/REQ-1?rel=implements).
Also mentions [REQ-1](ctx://trace/entity/REQ-1).
```

The typed edge is `WP-1 -> REQ-1`, with kind `implements`. The second link adds a separate generic `references` edge. Each Trace link contributes exactly one occurrence spanning the whole Markdown link; its label is not scanned again.

- The URI shape is `ctx://trace/entity/ID`, optionally followed by exactly `?role=definition` or `?rel=RELATION`. Declarations work in headings, paragraphs, list items, blockquotes and table cells. Omitted query parameters create generic references.
- IDs match `[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+`. Relation names match `[a-z][a-z0-9]*(?:-[a-z0-9]+)*`. The interpretation profile maps prefixes to entity kinds; unknown well-formed IDs and relation names remain graph facts.
- These are constrained URIs: credentials, ports, fragments, extra path segments, encoded components, duplicate/unknown parameters and combinations of declaration and relation parameters are rejected. A malformed `ctx:` destination produces a located diagnostic and no fallback occurrence from its label. Trace never opens or fetches these URIs.
- Inline links, reference-style links and angle-bracket autolinks recognized by Engine are supported. Reference definitions supply destinations but are not themselves entity declarations. The occurrence range identifies the link use, not its shared reference definition.
- Whole bare identifiers and single-identifier inline code remain generic references. Ordinary link labels are eligible for generic mentions; ordinary destinations, images, HTML nodes, frontmatter and fenced/indented code remain literal.
- Headings own their sections; a declaration in a list item's opening paragraph owns that item. Local paragraph and table-row declarations take precedence over enclosing scopes. Multiple declarations at the selected scope produce an ambiguous owner. Duplicate and missing definitions remain inspectable.

This guide is the current authoring contract. It replaces draft1's brace-marker grammar. Former brace markers have no declaration or typed-reference meaning; an eligible bare ID within ordinary text can still be a generic mention. A draft1 profile is rejected as an unsupported language version rather than silently reinterpreted.

The graph/query contracts remain unchanged. Runtime source fragments follow Engine blocks and capture supporting headings/table structure. Context projection is not implemented, and exact fragment partitioning is provisional. Custom-scheme links use ordinary Markdown syntax; whether a renderer makes their destinations clickable depends on that renderer.

## Results and limits

Every operation returns `{ ok: true, value }` or `{ ok: false, error }`. Invalid profiles, fabricated handles, invalid query bounds, unusable source maps, and exceeded analysis limits return errors. Analysis accepts caller-supplied text; it performs no file reads or network access.

`analysis.snapshot` contains immutable identifiers, occurrences, relationships, source fragments, exclusions and diagnostics. Each reference occurrence contributes one relationship, so repeated references remain distinct. Incoming queries retain unowned and ambiguous references; outgoing queries return references with a unique owner matching the requested identifier.

`coverage: 'complete'` means extraction completed without error diagnostics. It does **not** mean the graph is valid. Malformed Trace links, unsupported structures and uncertain reference ownership produce `partial` coverage with queryable evidence. Duplicate definitions, unknown kinds and missing targets are represented explicitly for later validation.

Ranges use zero-based UTF-16 offsets, one-based lines/columns, and exclusive ends. SHA-256 hashes cover the original UTF-8 source. Keep the source text alongside the analysis when slicing locations. Issued profile/analysis handles are local to the loaded module instance; serializing a snapshot does not create a reusable handle.

Reference pages are ordered by source occurrence. Defaults are offset 0 and limit 100, with a maximum page size of 1,000. Follow `nextOffset` until it is null. Omitted relation filters select all kinds; an empty filter selects none. An absent identifier yields a null record and empty results.

Next capabilities are profile-based graph validation, bounded traversal and source-context projection over this same graph. The existing package-root validator and CLI retain their compatibility behavior.
