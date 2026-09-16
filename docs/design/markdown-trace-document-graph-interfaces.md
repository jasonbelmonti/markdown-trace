# Markdown Trace Document Graph Interface Design Packet

Current implementation authority: the owner selected standard Markdown links on 2026-09-16. The [experimental guide](../experimental-document-graph.md) defines draft2 URI semantics and the [runnable task](../tasks/runnable-document-graph.md) bounds this implementation. Earlier draft1 brace-language examples remain design evidence only. Graph validation, traversal and context interfaces below remain proposed.

## Document Control

| Field | Value |
| --- | --- |
| Title | Markdown Trace Document Graph APIs |
| Contract depth | ID2 Standard |
| Status | Draft for interface review |
| Revision | 7 |
| Source authority | Owner's document-graph vision and API-design request; merged direction in PR #74; source baseline dce4ac19f8f25f4add7c38898e31934eb70de592 |
| Author | Codex |
| Reviewers | Codex internal evaluation; project owner for authoring fit and API acceptance |
| Last updated | 2026-09-16 |
| Related design/spec/tickets | [Direction](markdown-trace-document-graph-overview.md); [contract/corpus task](../tasks/document-graph-contract.md); [implementation baseline](../current-implementation.md) |
| Companion artifacts | [TypeScript declarations](document-graph-api/contracts/index.d.ts); [consumer example](document-graph-api/examples/consumer.ts); [profile example](document-graph-api/examples/profile.ts); [case ledger](document-graph-api/examples/cases.md) |

## 0. Executive Contract Summary

- Decision requested: Review the remaining validation, traversal and context boundaries. Standard-link authoring is selected for the experimental graph/direct-query slice; stable release approval remains separate.
- Source design summary: Recognize constrained identities and relationships throughout a spec, build one graph with source evidence, validate its relationships, and retrieve related implementation context.
- Highest-risk boundaries: Declaration versus mention and source ownership (RISK-1); policy accidentally changing graph facts (RISK-2); context exceeding its selection or hiding omissions (RISK-3).
- Implementation slice covered: An in-memory analysis handle, extensible profile data, validation results, identifier lookup, direct reference queries, bounded traversal, and source context. Declaration files are design artifacts, not installed APIs.
- Out of scope: Production implementation, a full design spec, HTTP services, databases, events, automatic source edits, multi-document resolution, arbitrary query languages, all-path enumeration, and release activation.
- Section status: Complete for the API draft. Language/corpus acceptance and real-spec scale evidence remain explicit gates.

Proposed consumer flow:

~~~ts
const profile = compileProfile(profileInput);
if (!profile.ok) return profile;
const analyzed = analyzeDocument(
  { documentId: "spec.md", text: markdown },
  profile.value,
  { maxSourceUtf8Bytes: 1_000_000, maxOccurrences: 50_000 },
);
if (!analyzed.ok) return analyzed;
const analysis = analyzed.value;
const validity = validateGraph(analysis, profile.value);
const backlinks = findIncoming(analysis, "REQ-1", { limit: 100 });
const selected = traverseGraph(analysis, {
  roots: ["WP-1"], direction: "outgoing",
  relations: ["implements", "references"], maxDepth: 1, maxNodes: 20,
});
if (!selected.ok) return selected;
const context = extractContext(analysis, {
  selection: selected.value,
  budget: { maxUtf8Bytes: 12_000, maxFragments: 40 },
});
~~~

These limits are example caller budgets, not measured production thresholds. A validation failure does not prevent querying the analysis.

## 1. Source Requirements and Assumptions

| ID | Statement | Source | Impact on contracts |
| --- | --- | --- | --- |
| OBJ-1 | Discover identities/references across document structures under a constrained language and deterministic ownership. | Direction sections 2-5 | C-1, C-2, C-3 |
| OBJ-2 | Validate observed relationships against developer-owned rules, retaining invalid evidence. | Direction sections 2-5 | C-2, C-4 |
| OBJ-3 | Lookup, incoming/outgoing references, and bounded traversal use the same graph. | Direction FLOW-2 and FLOW-3 | C-1, C-5, C-6 |
| OBJ-4 | Return bounded source context with provenance and inclusion reasons. | Direction FLOW-3 | C-1, C-7 |
| CON-1 | Use Markdown Engine public structure/source APIs. | Direction section 3 | C-3 contains the dependency |
| CON-4 | Prohibited and unresolved references remain observed facts. | Direction section 3 | C-1, C-4, C-5 |
| CON-5 | Changing validation policy must not change the graph. | Direction section 3 | Separate interpretation and validation hashes in C-2 |
| CON-6 | Query/context results identify their analysis snapshot. | Direction section 3 | C-5, C-6, C-7 |
| CON-7 | Keep local deterministic operation and existing v1 behavior. | Direction section 3 | C-3 through C-8 |
| ASM-1 | First delivery analyzes one complete local document. | Direction section 3 | Caller supplies source text; no resolver or network port |
| ASM-2 | A declaration can own bare references; typed relationships need constrained syntax. | Direction section 3 | Candidate syntax below; Q-1 and Q-2 remain acceptance decisions |
| ASM-3 | Profiles own entity/relationship vocabulary; runtime owns finite operators. | Direction section 3 | C-2 replaces closed domain enums in the new API |
| ASM-4 | The initial consumer is a Node/TypeScript authoring or implementer tool. | Inspected package and owner request | Synchronous memory API; callers own file reads and process scheduling |
| Q-4 | No owner-selected real spec, latency target, or context-completeness oracle has been supplied. | Direction section 9 | Example budgets only; no production performance claim |

Section status: Complete; assumptions remain recommendations, not implied owner decisions.

## 2. Problem-Space Model

### Existing Interface Constraints

| Interface | Kind | Owner | Mutability | Quality/completeness | Known consumers | Constraint or opportunity |
| --- | --- | --- | --- | --- | --- | --- |
| IF-1: Markdown Engine package root 3.5.0 | SDK/tree/source contract | Markdown Engine | fixed | partial; public types and local probes; bundled API prose still labels 3.0.0 | Current table and registry extractors | Reuse public nodes and raw source slices; never export Engine types |
| IF-2: validateGraphDocument and result v1 | Public API | Markdown Trace | owned-risky | tested, versioned; narrow table/path semantics | Package consumer fixture and CLI | Preserve existing meaning and root export |
| IF-3: graph-profile.v1 and trace-evidence.v1 | Profile/evidence schema | Markdown Trace | owned-risky | schema-validated but some accepted operators are unevaluated | Table extractor, path validator, fixtures | Do not reinterpret these files as the new profile |
| IF-4: Registry, type profiles, ctx://trace and generated sidecars | File and internal API | Markdown Trace | owned-risky | legacy, extensively tested | derive, validate, sidecar and migration commands | Retain independently; no automatic translation or authority flip |
| IF-5: Package export map and CLI transport | Distribution/CLI | Markdown Trace | owned-changeable | tested root and experimental graph imports; atomic-output behavior | Node consumers and CLI users | Experimental graph consumer checks are implemented; stable exports remain later work |
| IF-6: Shared analysis/query/context API | Library API | Markdown Trace | owned-changeable | experimental graph/direct queries implemented; context proposed | Spec tools and implementer agents | Shape around consumer needs without legacy table anchors |

### Actors and Systems

| Actor/System | Role | Trust level | Contract needs |
| --- | --- | --- | --- |
| Spec author/reviewer | Writes declarations and references; inspects validity | Authored content is data | Exact diagnostics and explained relationships |
| Profile author | Supplies domain vocabulary and validity assertions | Configuration validated at ingress | Data-only schema, explicit unsupported-operator failures |
| Implementer tool/agent | Chooses entities and related context | Caller owns access decisions | Backlinks, bounded traversal, source excerpts |
| Host application | Reads files, allocates budgets, renders results | Owns filesystem/process privileges | Explicit input and error boundaries |
| Markdown Engine | Parses Markdown and locates source | Fixed dependency behind adapter | Public tree/source mapping verified against actual input |

### Capabilities

| Capability | Command/query/event | Owner | Consumers | Notes |
| --- | --- | --- | --- | --- |
| Compile profile | Pure command | Profile compiler | Analysis and validation callers | No I/O, scripts, or callbacks |
| Analyze document | Pure computation | Analyzer | All graph consumers | Source text captured once |
| Validate graph | Query | Validator | Authors and CI | Never alters observed facts |
| Lookup/direct references | Query | Graph query functions | Reviewers and tools | No validation prerequisite |
| Traverse/context | Query | Query and context functions | Implementer tools | Explicit limits; no automatic agent dispatch |

### Domain Vocabulary

| Term | Definition | Invariants | Non-examples |
| --- | --- | --- | --- |
| Identifier | Canonical case-sensitive label in one document | One graph record per label; may lack a unique definition | Engine target ID, filesystem path |
| Occurrence | One definition/reference appearance in source | Exact range; one occurrence is counted once | Aggregated parent text counted again |
| Definition state | Unique, missing, or duplicate declarations for a label | Duplicates remain explicit; never first-wins | Successful reference resolution based on order |
| Owner | Declaration responsible for a source reference/fragment | Owned, unowned, or ambiguous; preserves declaration IDs | Nearest arbitrary identifier token |
| Relationship | One observed reference with kind, owner, target and occurrence | Can have an unowned source or unresolved target | Allowed relation in a validation profile |
| Fragment | Contiguous source range used for context | Required heading/table context is explicit | Entire ancestor section by default |
| Analysis | Immutable graph plus privately retained source and indexes | Bound to source, interpretation, analyzer and parser identities | Reloaded file or a mutable external DTO |
| Selection | Bounded traversal result issued for one analysis | One chosen shortest explanation per selected identifier | All paths, complete agent knowledge |

Section status: Complete.

## 3. Boundary Map

| Boundary | Owner | Consumers | Direction | Stability | Reason to exist |
| --- | --- | --- | --- | --- | --- |
| Profile input to compiled profile | Profile compiler | Host, analyzer, validator | Data to validated handle | Proposed public | Reject invalid configuration once |
| Source/Engine tree to analysis | Analyzer | Queries and validator | External parser to domain | Adapter internal; result public | Contain parser shapes and preserve provenance |
| Analysis to validation | Validator | Spec author/CI | Facts plus assertions to report | Proposed public | Policy must not create or erase facts |
| Analysis to direct/traversal queries | Query functions | Reviewer/tool | Facts to selected results | Proposed public | Reuse indexes and consistent resolution |
| Analysis plus selection to context | Context projector | Implementer tool | Captured source to bounded excerpts | Proposed public | Own clipping, support context, and omissions |
| Files/process transport | Host/current CLI | Local user | I/O to memory contracts | Existing compatibility | Keep paths, atomic writes, and scheduling out of graph semantics |

No service interface, repository abstraction, plugin callback, event bus, or graph store is introduced. The exported functions are consumer contracts; private helpers stay concrete.

Section status: Complete.

## 3A. Integration Strategy

| Existing interface | Proposed response | Adapter/translator contract | Upstream change needed | Validation required |
| --- | --- | --- | --- | --- |
| IF-1 | wrap and validate | C-3 maps public Engine nodes/source into C-1 | no identified change; source-mapping proof remains required | VAL-1, VAL-6 |
| IF-2 | tolerate and extend additively | C-8 retains root API; new graph entrypoint | no | VAL-7 |
| IF-3 | retain separately | C-2 rejects old profile schemas; no lossy adapter | no | VAL-2, VAL-7 |
| IF-4 | retain separately | C-8 preserves commands and sidecar authority | no | VAL-7 |
| IF-5 | extend deliberately | C-8 reserves a future ./graph package export | no | VAL-7 |
| IF-6 | materialize | C-1 through C-7 | no | VAL-1 through VAL-8 |

Section status: Complete.

## 4. Contract Inventory

| Contract ID | Name | Kind | Owner | Consumers | Stability | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| C-1 | Source identity and document graph | Domain types/snapshot | Analyzer | Validator, queries, context | Proposed public DTO and opaque handle | OBJ-1, OBJ-3, CON-4, CON-6 |
| C-2 | Compiled interpretation/validation profile | Config/API | Profile compiler | Authors, analyzer, validator | Proposed public data and opaque handle | OBJ-2, CON-5, ASM-3 |
| C-3 | analyzeDocument | API/adapter | Analyzer | Host tool | Proposed public | OBJ-1, CON-1, ASM-1 |
| C-4 | validateGraph | API/report | Validator | Author/CI | Proposed public | OBJ-2, CON-4, CON-5 |
| C-5 | Identifier and direct reference queries | Query API | Query functions | Reviewer/agent | Proposed public | OBJ-3, FLOW-2 |
| C-6 | traverseGraph | Query API | Query functions | Implementer tool | Proposed public handle | OBJ-3, FLOW-3 |
| C-7 | extractContext | Query/projection API | Context projector | Implementer tool | Proposed public report | OBJ-4, CON-6 |
| C-8 | Package/legacy coexistence | Compatibility contract | Package/CLI adapters | Existing and new callers | Existing stable boundary; additive proposal | CON-7, Q-3 |

Section status: Complete.

## 5. Materialized Contracts

### Common rules

The [compilable declaration draft](document-graph-api/contracts/index.d.ts) is the shape authority within this packet; this section owns semantics. All functions are synchronous, local, and read-only. They return an Outcome discriminating expected input/profile/limit/selection errors from successful values. A successful operation may contain an invalid or partial graph. Unexpected programming defects may throw; callers must not treat exceptions as a validity verdict.

The host owns file access, authorization, text decoding, scheduling, and any timeout or worker cancellation. No filesystem path is opened or URL fetched by these new functions. There is no tenancy or remote authorization layer to add. Profile input is ordinary data; arbitrary functions, evaluators and network imports are rejected. Extracted text remains untrusted source data.

Repeated calls with the same successful inputs produce the same semantic output and order. There are no writes, retries with side effects, wall-clock timestamps, random IDs, or telemetry callbacks in the core. The host can time each operation; reports expose hashes, counts, ranges and limits. In-process synchronous computation does not claim interruptible cancellation.

All returned public collections are deeply immutable at runtime; the implementation must detach input data rather than trust TypeScript readonly. Analysis and compiled-profile/selection handles are runtime-issued objects, not constructible JSON. No hydrate/import-snapshot function is proposed. Snapshot/report DTOs may be serialized for inspection; serialized data cannot be supplied as a live handle.

Non-issued analysis/profile handles return invalid-input; non-issued selections return invalid-selection. Issued selections are compatible with an analysis when their analysisId matches, including a repeat analysis with identical identity inputs.

Proposed schema literals ending in v1 reserve independent new formats. They do not redefine existing graph-profile.v1 or graph-validation-result.v1. The declarations remain unpublished design artifacts until implementation and package review.

### C-1: Source identity and document graph

- Kind/purpose: Domain snapshot and opaque analysis handle; retain facts, provenance, and interpretation identity.
- Owner/consumers: Analyzer owns construction; validation, query, and context functions consume it.
- Lifecycle/stability: One immutable source capture; GC owns memory lifetime. Proposed public snapshot schema, private source/index representation.
- Source IDs: OBJ-1, OBJ-3, CON-4, CON-6.
- Existing interface relationship: New graph model; no table anchor, Engine target, registry object, or parser type crosses this boundary.
- Preconditions/inputs: Nonempty documentId is an opaque caller identifier. Text must be well-formed Unicode; no newline or Unicode normalization. The document ID does not confer filesystem access.
- Postconditions/outputs: Every recognized label has one IdentifierRecord; its declaration state is resolved, missing, or duplicate. Each occurrence's exact range covers the complete lexical expression, including whole Markdown links or identifier-only code delimiters. Each reference occurrence produces one Relationship, including unowned/ambiguous sources and dangling targets.
- Invariants: Relationship target equals its reference occurrence's identifier. Owned sources identify their exact declaration occurrence; duplicate labels do not erase those distinctions. Each occurrence points to a containing fragment. All fragment dependencies exist and form an acyclic required-context relation.
- Error model: Missing usable offsets for accepted content produces source-map-unavailable; fabricated or approximate token locations are forbidden. Semantic ambiguity is retained in diagnostics and coverage, not erased.
- Authorization/tenancy: Common host-owned rules; text remains private to the handle unless explicitly queried/exported.
- Idempotency/retry/ordering: Records sort by source start, end, then stable kind/label tie-breaks. Identifier records sort by ASCII identifier. Occurrence/relationship/fragment IDs are deterministic within an analysis and have no stability guarantee across edits.
- Versioning/compatibility: Source hash is SHA-256 of UTF-8 text; offsets and columns are UTF-16 code units, line/column are one-based, offsets zero-based, and end is exclusive. CRLF occupies two offsets. Analysis identity hashes source identity, interpretation hash, graph schema, analyzer version and parser version; validation policy and operational limits are excluded.
- Observability: Snapshot includes coverage, exclusions, diagnostics, versions, source sizes and fact collections; hosts derive counts without timing being part of identity.
- Validation evidence: VAL-1, VAL-3, VAL-6; EVD-1, EVD-2, EVD-5.

A missing definition or duplicate definition can exist in a completely scanned document. Coverage measures whether analysis covered the language's eligible source, not graph validity. Unowned or ambiguous references make coverage partial because a source endpoint could not be determined. Literal exclusions explicitly defined by the language do not make coverage partial.

### C-2: Compiled profile

- Kind/purpose: Data-only configuration and compileProfile(input: unknown) API.
- Owner/consumers: Profile compiler; profile authors, analyzer, validator.
- Lifecycle/stability: Clone, validate and compile once; share an immutable TraceProfile.
- Source IDs: OBJ-2, CON-5, ASM-3.
- Existing interface relationship: New document-profile.v1 schema; old graph profiles and registry type profiles stay on their existing paths.
- Preconditions/inputs: [ProfileInput](document-graph-api/contracts/profile.d.ts); no unknown fields, duplicate names/prefix assignments/rule IDs, non-finite bounds, cyclic objects, callbacks, or unsupported versions/operators.
- Postconditions/outputs: Success returns a handle with independently computed interpretationHash and validationHash. Failure returns diagnostics and no usable partial profile.
- Invariants: Entity and relationship kind names are lowercase ASCII slug strings; ID prefixes are the segment before the first hyphen, start with an uppercase letter, and map to exactly one entity kind. Vocabularies are data, not runtime enums. Every rule/allowlist endpoint kind exists in interpretation.entityKinds. Allowed-relation rows have unique kinds.
- Error model: invalid-profile for shape/reference/bound errors; unsupported-version for unknown schemas/languages. Unsupported operators fail compilation rather than becoming skipped checks.
- Authorization/tenancy: Common rules; YAML decoding, if used, belongs to the host. The core consumes an object and never loads include paths.
- Idempotency/retry/ordering: Hash canonical JSON with sorted object keys and preserved array order; caller property order is immaterial. Equivalent text/YAML rendering is irrelevant after decoding.
- Versioning/compatibility: Reserved namespaces keep new formats distinct. Changing interpretation requires reanalysis; changing only validation permits reuse of the same analysis.
- Observability: profileId is a human-facing label; hashes establish semantic identity. Compiler diagnostics identify the offending profile field or rule.
- Validation evidence: VAL-2, VAL-3, VAL-8; EVD-3, EVD-4.

The profile is one authored document with two sections. Interpretation defines how source becomes facts. Validation specifies which observed relationships are allowed and which obligations must hold. A validity rule cannot invent a relationship.

Initial operators are entity-count and require-relation. minEntities must be explicit and nonnegative; zero deliberately permits an empty document. The allowlist is closed: any observed relation kind or endpoint combination absent from allowedRelations is invalid. An empty allowlist permits no relationships. Required relations count distinct, uniquely resolved targets rather than repeated mentions. A rule selecting no sources reports not-applicable; use entity-count when those sources must exist. Path/cycle/matrix/range operators are deferred and rejected by this schema.

Entity counts include distinct labels with a unique definition and known entity kind. Referenced-only labels do not satisfy an entity-count obligation. Unknown prefixes remain graph facts with null entityKind and fail integrity. Unknown relation slugs remain facts and fail the closed allowlist.

Current interpretation uses `markdown-trace.identity.draft2`. Standard Markdown links carry explicit declarations and typed references; bare identifiers remain low-overhead generic mentions. Markdown Engine owns link parsing, reference-definition resolution and source maps. Trace owns the constrained URI convention described in the [experimental guide](../experimental-document-graph.md).

| Rule ID | Current decision | Observable boundary |
| --- | --- | --- |
| LEX-1 | IDs match [A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+; the first segment selects the profile prefix. | Bare mentions cannot be substrings of longer identifier-like words or assembled across formatting leaves. |
| LEX-2 | A link to ctx://trace/entity/ID?role=definition declares; ?rel=RELATION creates a typed reference; no query creates a generic reference. | Relation names match [a-z][a-z0-9]*(?:-[a-z0-9]+)*. URI targets, not labels, establish identity. Unknown well-formed vocabulary remains evidence. |
| LEX-3 | Engine-parsed inline, reference-style and angle-bracket links are interpreted from their resolved destination. | Each Trace link yields one occurrence covering its full source use; labels are not scanned again. A reference definition supplies a destination, not an entity occurrence. |
| LEX-4 | Non-Trace link labels and emphasis remain eligible for generic mentions; ordinary destinations, titles and images are literal. | Engine HTML nodes are literal; no HTML parser or secondary Markdown parser is added. |
| LEX-5 | Malformed ctx: destinations produce markdown-trace.language.malformed-link and no label fallback. | Reject credentials, ports, fragments, extra path segments, encoded components, duplicate/unknown query fields and mixed declaration/relationship fields. Never fetch a destination. |
| LEX-6 | Generic bare IDs retain raw-source boundaries and backslash parity. | Encoded spellings cannot assemble generic IDs. Brace markers have no special role in draft2. |
| LEX-7 | An Engine inlineCode node is a generic reference only when its normalized text is one canonical ID and its raw source has no newline. | Other code, fenced/indented examples and frontmatter remain literal. |
| LEX-8 | Ownership and policy operate after collection; malformed link labels cannot supply fallback references. | Malformed-link diagnostics cover the full link use and make analysis partial. Missing/duplicate definitions remain separate graph integrity states. |

The supported URI forms and exclusions are specified once in the experimental guide. The runtime fixture is fixtures/document-graph/mixed-layout.md; tests/test_document_graph_links.test.ts asserts source facts, owner selection and exact link ranges. The draft1 corpus and its pre-runtime interpretation reports do not prove draft2 conformance. Parser/unsupported-node failures retain their existing behavior; missing usable source maps fail the operation.

### C-3: analyzeDocument

- Kind/purpose: Memory API and concrete Markdown Engine adapter.
- Owner/consumers: Analyzer; callers needing graph facts.
- Lifecycle/stability: Compile profile, capture input once, parse/normalize once, create immutable analysis. No per-query reparsing.
- Source IDs: OBJ-1, CON-1, ASM-1.
- Existing interface relationship: Reuse public Engine parsing/source access; replace the table-only extraction assumption in the new path.
- Preconditions/inputs: DocumentSource, runtime-issued TraceProfile, and positive safe-integer maxSourceUtf8Bytes/maxOccurrences. No implicit unlimited mode.
- Postconditions/outputs: Outcome<DocumentAnalysis>; all forward references resolve after collection. Exceeding either admission bound returns analysis-limit with no apparently complete snapshot.
- Invariants: Traverse the public tree once for eligible leaves; do not scan both parent aggregate text and children. Source ranges refer to the original captured text, not normalized rendering.
- Error model: invalid-input, analysis-limit, source-map-unavailable. Parse/normalization findings are retained and deduplicated by code/range/message; parser errors make coverage partial, while warnings alone do not. Absent usable source mapping is an operation failure.
- Authorization/tenancy: Common rules; files and parser internals remain outside the signature.
- Idempotency/retry/ordering: Common rules; no retry needed without changed input or limits.
- Versioning/compatibility: Language identifier and analyzer/parser versions participate in analysis identity. Draft2 interprets ctx://trace entity URIs with explicit declaration/relation fields and canonical uppercase IDs. Legacy registry/link commands retain their separate behavior; draft1 profiles are rejected by the experimental runtime.
- Observability: Complete/partial coverage, exact exclusions, diagnostics, source/profile identities and fact counts.
- Validation evidence: VAL-1, VAL-6; EVD-1, EVD-2, EVD-5.

Recommended ownership rules are structural and order-independent within a declaration's scope:

| Rule ID | Recommended decision | Observable boundary |
| --- | --- | --- |
| OWN-1 | Every explicit declaration is retained, wherever it occurs in an eligible heading, paragraph, list introduction or table row. The containing block determines scope; declaration-link position within that block does not. | A reference before its declaration in the same paragraph has that declared owner. All definitions are collected before target resolution; first occurrence never means definition. |
| OWN-2 | A heading declaration owns the heading and its section until the next heading of equal or shallower depth in the same container. | A heading without a declaration still closes a preceding same-level declaration scope. Shallower containing declaration scopes can remain active. Nested-container headings do not close outside sections. |
| OWN-3 | A declaration in the first paragraph child of a list item, when that paragraph is the item's first block, owns the whole item. Other paragraph declarations own only their paragraph. | Sibling items do not inherit each other's owners. Nested items inherit a containing owner until their own declaration shadows it. A paragraph inside a quote does not acquire ownership of the entire quote. |
| OWN-4 | A declaration in any table cell owns that row, including a header row. Multiple declarations across its cells share the same scope. | Header ownership does not propagate to data rows. Header references without a declaration use the enclosing scope. A header with no identity occurrences remains structural support; a header carrying graph facts has its corresponding semantic owner. Delimiter rows are always structural. |
| OWN-5 | Among containing scopes, the most deeply nested structural scope wins. Multiple declarations defining the same scope give ambiguous ownership, even when their labels are equal. | Retain every declaration ID; references in an ambiguous scope do not attach to an outer owner. With no containing declaration scope, retain the reference as unowned. Ambiguous or unowned references fail integrity and make coverage partial. |
| OWN-6 | A heading's container is its nearest ancestor list item, blockquote or document. Container exit ends its scope. Child declarations shadow only their own bounded content. | Reference ownership resumes in the still-active outer scope after a child scope ends. A paragraph declaration does not own later paragraphs. A declaration does not leak out of its list/quote merely because its heading has no following peer. |
| OWN-7 | Context ownership follows the resolved scopes, independently of validation permission. Partition parent context around descendant-owned content rather than including its entire enclosing section. | Keep source fragments contiguous and preserve required list/quote syntax; headings and table headers may be supporting fragments. Structural support without a source reference does not fail ownership integrity. Literal code may belong to an entity's context while contributing no graph occurrences. |

Row/paragraph scopes take precedence over a containing section; a nested heading scope takes precedence over its enclosing list-item scope. A header carrying no graph facts is unowned support, as in the initial mixed-layout ledger. Supporting header/delimiter ranges remain available to selected table rows regardless of whether a header also has semantic ownership. Link runtime tests verify these ownership rules for the current slice. Full validation/traversal/context result proofs remain follow-up work; draft1 annotations are not the new language authority.

### C-4: validateGraph

- Kind/purpose: Pure assertion API; report correctness against a supplied compiled profile.
- Owner/consumers: Validator; authors, reviewers and CI.
- Lifecycle/stability: Reusable over immutable analysis, including invalid documents.
- Source IDs: OBJ-2, CON-4, CON-5.
- Existing interface relationship: New validation report; preserve existing validateGraphDocument result behavior.
- Preconditions/inputs: Runtime-issued analysis/profile with identical interpretationHash.
- Postconditions/outputs: Outcome<ValidationReport>; analysis and all graph facts remain unchanged.
- Invariants: Always evaluate graph integrity: unique definitions, resolved targets, known entity kinds, and deterministic relationship source owners. Then minEntities, allowed relations, and declared rules. Builtin rule IDs use an integrity./policy. namespace; user IDs use profile. in reports.
- Error model: profile-mismatch is an operation error requiring reanalysis. Broken document relationships are report diagnostics, not operation errors. Unsupported configuration was rejected by C-2.
- Authorization/tenancy: Common rules.
- Idempotency/retry/ordering: Rules follow builtin order then profile order; diagnostics sort by range, rule ID and code. All required evaluations appear, including not-applicable or indeterminate entries.
- Versioning/compatibility: document-validation.v1 is distinct from graph-validation-result.v1. Validation hash describes assertions used; analysis ID identifies observed facts.
- Observability: Rule IDs, selected/evaluated subject counts, diagnostics, profileId and profile hashes. A caller can distinguish zero checks from a meaningful pass.
- Validation evidence: VAL-2, VAL-3; EVD-3, EVD-4.

Report precedence is fail when any definite language/integrity/policy violation exists; otherwise indeterminate when partial analysis prevents a conclusion; otherwise pass. Malformed reserved expressions are definite language violations. Unsupported-node or parser incompleteness alone yields indeterminate, not a claim that relationships are invalid. Per-rule results follow the same distinction. Partial analysis cannot produce an overall pass. Duplicate/dangling evidence remains available through C-5 even after validation fails. Requirement checks do not count unresolved or ambiguous endpoints as successful targets.

### C-5: Lookup and direct reference queries

- Kind/purpose: lookupIdentifier, findIncoming, findOutgoing.
- Owner/consumers: Query functions; reviewers and implementer tools.
- Lifecycle/stability: Read one analysis; no dependence on a successful validation run.
- Source IDs: OBJ-3, FLOW-2.
- Existing interface relationship: New public query surface over the common graph.
- Preconditions/inputs: Runtime-issued analysis; syntactically valid label. Reference filters use exact relation names, optional offset default 0 and limit default 100; limit is 1-1000, integers must be safe/nonnegative.
- Postconditions/outputs: Lookup returns declaration state, definition occurrences and a reference count; references are retrieved through pages. Each page item includes both its Relationship and source Occurrence. Incoming returns every matching reference occurrence through pages, including repeated, dangling, unowned and ambiguous observations. Outgoing includes only source owners definitively assigned to the requested label.
- Invariants: Incoming/outgoing refer to the same Relationship IDs, never parallel inferred graphs. Missing lexical label gives a null record and empty result; a mentioned-but-undefined label has a record with missing definition state.
- Error model: Invalid lexical IDs, filters or pagination return invalid-input. A missing definition is query data, not a query failure.
- Authorization/tenancy: Common rules; paging is over captured facts.
- Idempotency/retry/ordering: Reference pages sort by occurrence range then relationship ID. totalMatches is exact within the snapshot; nextOffset is null at exhaustion. Omitted relations filter means all kinds; an empty filter means none. Unknown well-formed relation names match zero.
- Versioning/compatibility: All responses carry analysisId, coverage, and diagnostic count; pagination applies only to that immutable analysis.
- Observability: Source owner state, target label, exact occurrence ranges, counts and visible page boundary. Consumers need not join a snapshot to locate a reference.
- Validation evidence: VAL-3, VAL-4; EVD-2, EVD-3.

A backlink answers "where is this identifier referenced?" even when a source owner cannot be named. Callers can group owned entries by source identifier to answer "which other identifiers reference it"; the occurrence evidence is preserved.

### C-6: traverseGraph

- Kind/purpose: Bounded reachability with one canonical shortest explanation per selected identifier.
- Owner/consumers: Query functions; implementer tools.
- Lifecycle/stability: Runtime-issued immutable GraphSelection bound to one analysis.
- Source IDs: OBJ-3, FLOW-3.
- Existing interface relationship: New query over the same facts used by validation.
- Preconditions/inputs: Nonempty roots, direction, optional kinds, explicit maxDepth >= 0 and maxNodes >= unique root count, all safe integers. Each root must have a unique known definition.
- Postconditions/outputs: Roots at depth zero, then breadth-first reachable identifiers; each non-root has a predecessor identifier, relationship ID and relation kind explaining inclusion. Includes the query and explicit boundary indicators.
- Invariants: Traverse only uniquely resolved endpoints and definitively owned relationships. A forbidden-but-resolved relationship remains traversable unless the caller filters it out. Invalidity is never an implicit traversal filter.
- Error model: invalid-input for malformed parameters; unresolved-root for absent/missing/duplicate roots. Direct queries remain available for investigating those roots.
- Authorization/tenancy: Common rules.
- Idempotency/retry/ordering: Deduplicate and sort roots by ASCII ID, then BFS; adjacency sorts by occurrence range, relation kind, relationship ID. First discovery wins only for shortest-path explanation, never for definitions. Cycles/self-links do not duplicate nodes.
- Versioning/compatibility: No persisted cursor or restore API. The handle is tied to the issuing analysis.
- Observability: depthLimited/nodeLimited report omitted unvisited resolved nodes at examined boundaries. unresolvedRelationships counts distinct non-traversable incident relationships inspected in the selected direction; it is not a count of unknown facts outside the explored region.
- Validation evidence: VAL-4, VAL-5; EVD-2, EVD-3.

maxDepth zero selects roots only. A depth/node boundary makes no claim about the rest of the document. The result deliberately avoids all-path enumeration and unbounded arrays of omission details.

### C-7: extractContext

- Kind/purpose: Bounded source projection from a GraphSelection.
- Owner/consumers: Context projector; implementer tools.
- Lifecycle/stability: Uses the original text privately retained by DocumentAnalysis.
- Source IDs: OBJ-4, CON-6, FLOW-3.
- Existing interface relationship: Reuse source-slice concepts, replace whole-section assumptions with owned fragments.
- Preconditions/inputs: Runtime-issued selection with matching analysisId; nonnegative safe-integer maxUtf8Bytes/maxFragments.
- Postconditions/outputs: ContextBundle with verbatim source parts, ranges, selected-identifier reasons, included/omitted identifiers, ownership-omission evidence, used bytes, coverage, and the original selection query, nodes, predecessor relationships and boundary indicators. Every selected identifier appears exactly once in includedIdentifiers or omittedIdentifiers.
- Invariants: Include owned fragments and required heading/table-header fragments. Exclude descendant-owned content unless that entity is selected. Do not add an entire ancestor body as supporting context. Each returned part equals source.slice(start.offset, end.offset).
- Error model: stale-selection for another analysis identity; invalid-selection for a forged/non-issued handle. An ambiguous definition-fragment owner is a successful query with an explicit ambiguous-ownership omission, not a fabricated owner or operation error. Source changes on disk cannot affect the captured handle; reanalysis produces a new identity.
- Authorization/tenancy: Common rules; only explicit query projection returns source excerpts.
- Idempotency/retry/ordering: Consider entity bundles in selection order. Before budget admission, inspect the fragment containing the entity's unique definition: if its owner is ambiguous, omit that whole entity with ambiguous-ownership, adding no ranges on its behalf, and continue. Otherwise include required supporting fragments atomically and admit the whole bundle if its additional distinct ranges fit both budgets; omit with a budget reason if not. Ownership omission takes precedence even at zero budget; byte-budget wins when both numeric bounds fail. Merge overlapping intervals without bridging gaps, combine reasons, then emit admitted parts in source order.
- Versioning/compatibility: document-context.v1; no markdown renderer or token-estimation dependency. A future renderer must version its own assembly rules.
- Observability: usedUtf8Bytes counts the UTF-8 lengths of returned part texts, excluding JSON metadata and caller-inserted separators. An ownership omission carries the definition fragmentId, its exact sourceRange, and the fragment owner's declarationIds in their existing order. These fields diagnose the query-local omission; inherited coverage/diagnosticCount still describe the unchanged analysis. Omitted identifiers and traversal limits are visible.
- Validation evidence: VAL-5, VAL-6; EVD-5.

The bundle retains the selection's predecessor relationships so its inclusion reasons survive JSON export; parts explain which selected identifiers need each source range. This is source-context selection, not a guarantee that an agent has every fact necessary for implementation.

Selecting all candidate owners does not turn ambiguous ownership into joint ownership: each such entity is omitted independently. Lookup and direct-reference queries remain available. An omitted entity never appears in part.forIdentifiers or includedIdentifiers; a shared range may still appear solely as required heading/table-header support for a different, admitted entity, labelled with the supporting role rather than asserted ownership. With no admitted entities, parts and includedIdentifiers are empty and usedUtf8Bytes is zero. The [ambiguous-context oracle](document-graph-api/examples/ambiguous-context.json) records the reviewed counterexample, zero-budget precedence and selection of both candidates.

### C-8: Package and legacy coexistence

- Kind/purpose: Additive public-boundary and compatibility contract.
- Owner/consumers: Package/CLI maintainers; existing callers and future graph API consumers.
- Lifecycle/stability: Retain existing root API and CLI commands while proving the new graph surface.
- Source IDs: CON-7, Q-3.
- Existing interface relationship: Preserve legacy commands/schemas; propose a new @jasonbelmonti/markdown-trace/graph export for C-1 through C-7.
- Preconditions/inputs: New package export and CLI adapters require a separate implementation change with consumer fixtures.
- Postconditions/outputs: Existing imports, serialized results, exit codes, sidecar checks and migration meanings remain intact.
- Invariants: Never silently reinterpret a legacy profile or claim a v1 table pass is full document validity.
- Error model: Existing transport/error contract remains; the new memory APIs use Outcome. A future CLI must explicitly map report indeterminate before shipping.
- Authorization/tenancy: Existing file access and atomic-output protections stay owned by their adapters.
- Idempotency/retry/ordering: Existing no-write checks and deterministic serialization remain.
- Versioning/compatibility: Package version changes independently from schema versions. The experimental/graph subpath is implemented and package-tested. A stable graph subpath remains a recommendation.
- Observability: Existing CLI metadata plus new graph/report identities once implemented.
- Validation evidence: VAL-7, VAL-8; EVD-4, EVD-6.

No automatic registry-to-new-graph adapter is promised: the registry graph lacks enough occurrence and ownership evidence for a lossless conversion. The original Markdown must be analyzed under an explicit new interpretation policy.

Section status: API proposals retained; C-2/C-3 use the selected experimental link convention. Validation, traversal and context remain future work.

## 6. State, Fault, and Misuse Contracts

| Case ID | State/fault/misuse case | Owning contract | Expected behavior | Validation |
| --- | --- | --- | --- | --- |
| CASE-1 | Forward reference before definition | C-1, C-3 | Resolve after complete collection; stable identity | VAL-1 |
| CASE-2 | Duplicate definition or dangling target | C-1, C-4, C-5 | Retain all evidence; fail integrity; permit direct queries | VAL-3 |
| CASE-3 | Unowned/ambiguous reference | C-1, C-3, C-5 | Keep incoming evidence with explicit owner state and partial coverage | VAL-1, VAL-3 |
| CASE-4 | Forbidden relation | C-4, C-5, C-6 | Validation fails; queries still expose it | VAL-3, VAL-4 |
| CASE-5 | Empty document | C-2, C-4 | Explicit minEntities controls empty validity; report evaluated obligations | VAL-2, VAL-3 |
| CASE-6 | Unknown operator/legacy schema | C-2, C-8 | Compile failure; no partially active profile | VAL-2, VAL-7 |
| CASE-7 | Validation-only profile change | C-2, C-4 | Same analysis and graph, changed validation hash/report | VAL-2 |
| CASE-8 | Interpretation change | C-2, C-4 | profile-mismatch until reanalysis | VAL-2 |
| CASE-9 | Cycle/repeated edge/depth boundary | C-5, C-6 | Preserve direct occurrences, deduplicate traversal nodes, show bounds | VAL-4 |
| CASE-10 | Selection from earlier source version | C-6, C-7 | stale-selection; do not apply old offsets to new text | VAL-5, VAL-6 |
| CASE-11 | Context bundle does not fit | C-7 | Omit whole entity bundle and explain which budget failed | VAL-5 |
| CASE-12 | Source/occurrence admission limit exceeded | C-3 | Operation failure with no apparently complete snapshot | VAL-6 |
| CASE-13 | Unicode/CRLF/escaped or formatted identifiers | C-1, C-3 | Exact offsets or explicit language exclusion/error; never approximate locations | VAL-1, VAL-6 |
| CASE-14 | Caller mutates inputs or fabricates handles | C-1, C-2, C-6, C-7 | Snapshot unchanged; fabricated handles rejected | VAL-2, VAL-5 |

Section status: Complete.

## 7. Compatibility and Migration Notes

| Contract ID | Compatibility rule | Migration/backfill | Rollback constraint | Deprecation plan |
| --- | --- | --- | --- | --- |
| C-1, C-3 | New graph schema; no Engine or legacy DTO leakage | Reanalyze original source; no persisted-graph import | Keep legacy path available | None in this change |
| C-2, C-4 | Distinct profile and result schemas | Author an explicit new profile; validate against the same interpretation identity | Old profiles remain valid only on old commands | Decide after real consumers migrate |
| C-5, C-6, C-7 | Additive APIs with analysis-bound selections | Consumers adopt explicitly; no hidden fallback to legacy graph | Stop using new entrypoint; captured legacy behavior remains | No current query API to deprecate |
| C-8 | Root API and existing CLI meanings preserved | Add graph export and later CLI mapping with package consumer proof | Retain prior package/runtime pin | No root removal proposed |

Section status: Complete.

## 8. Validation and Review Plan

| Validation ID | Contract IDs | Method | Evidence required | Owner |
| --- | --- | --- | --- | --- |
| VAL-1 | C-1, C-3 | Independent source/ownership corpus and adapter probe | Equivalent heading/prose/list/quote/table facts, nested scope, forward refs, exact occurrence ranges from hand-authored link cases and runtime assertions | Maintainer and owner |
| VAL-2 | C-2, C-4 | Profile and policy contract cases | Invalid schema/operator rejection, explicit empty policy, distinct hashes, rule counts, unchanged facts under policy change | Maintainer |
| VAL-3 | C-1, C-4, C-5 | Negative oracle and direct query cases | Duplicates, dangling/unowned/forbidden refs remain queryable and fail appropriate rules | Maintainer/reviewer |
| VAL-4 | C-5, C-6 | Hand-audited graph examples | Backlink/outgoing agreement, repeated evidence, pagination, cycles, canonical shortest paths and visible traversal bounds | Maintainer/reviewer |
| VAL-5 | C-6, C-7 | Context selection oracle | Exact selected/excluded source, supporting headings/headers, overlapping fragments, atomic budgets, stale/forged selection rejection | Maintainer and owner |
| VAL-6 | C-1, C-3, C-7 | Source-map and scale probes | UTF-16/UTF-8/CRLF correctness, escaped/encoded-node mapping, source-limit failure; representative size/time/memory before release | Maintainer |
| VAL-7 | C-2, C-8 | Existing compatibility and new package consumer checks | Existing root behavior retained, old schema rejected by new API, intentional graph subpath declaration closure | Maintainer |
| VAL-8 | C-2, C-8 | Type-check proposed consumer and structural artifact validation | Compilable signatures/profile, Markdown Engine profile pass, source/checksum evidence | Codex/maintainer |

Current runtime tests exercise the experimental analysis and direct queries using standard links. The [case ledger](document-graph-api/examples/cases.md) remains draft1 design evidence for broader API scenarios; it is not draft2 language conformance. Validation, traversal and context still require their own runnable proof.

Section status: Complete as a validation plan.

## 9. Traceability Matrix

| Source ID | Contract IDs | Acceptance/validation IDs | Notes |
| --- | --- | --- | --- |
| OBJ-1, CON-1, ASM-1, ASM-2, RISK-1 | C-1, C-3 | VAL-1, VAL-6 | Cross-layout facts and source ownership |
| OBJ-2, ASM-3, CON-4, CON-5, RISK-2 | C-2, C-4 | VAL-2, VAL-3 | Assertions do not determine facts |
| OBJ-3, FLOW-2 | C-1, C-5 | VAL-3, VAL-4 | Incoming/outgoing occurrence evidence |
| OBJ-3, FLOW-3 | C-6 | VAL-4, VAL-5 | Bounded canonical reachability |
| OBJ-4, CON-6, RISK-3 | C-7 | VAL-5, VAL-6 | Captured source, budgets, omissions |
| CON-7, Q-3 | C-2, C-8 | VAL-7, VAL-8 | Versioned additive adoption |
| Q-4 | C-3, C-6, C-7 | VAL-5, VAL-6 | Real-spec context and scale proof |

Section status: Complete.

## 10. Open Questions

| Question ID | Question | Owner | Due date or decision point | Impact if unresolved |
| --- | --- | --- | --- | --- |
| Q-1 | Resolved for the experiment: standard Markdown links carry declarations and typed relationships. | Jason | Selected 2026-09-16 | Stable-release syntax remains a later decision. |
| Q-2 | Prove the remaining validation, traversal and context contracts against the shared graph. | Maintainer | Before claiming those capabilities | Experimental extraction and direct queries have runtime checks; broader proof remains FND-1. |
| Q-3 | Experimental export is implemented at experimental/graph; select the stable public surface later. | Maintainer and Jason | Before stable release | Root API and legacy schemas remain unchanged. |
| Q-4 | Which real spec and required context define adoption success, and what latency/memory limits apply? | Jason supplies target; maintainer measures | Corpus/consumer pilot, before release readiness | No production scale or agent-context-completeness claim; FND-3 |

The runnable task supersedes earlier contract-only execution gates for the experimental graph and direct queries. This packet does not claim the full product or the remaining API proposals are complete.

Section status: Complete; questions have explicit decision gates.

## 11. In-Situ Evaluation

### Grounding Evidence

| Evidence ID | Source | Tool/source type | What was inspected | Relevant contracts |
| --- | --- | --- | --- | --- |
| EVD-1 | Markdown Engine 3.5.0 public declarations: EngineDocument, EngineNode, SourceRange, documentQueries; installed docs/contracts/api.md | Package inspection | Public tree/source access; aggregate spans overlap; bundled prose labels an older release so actual exports and probes control | C-1, C-3 |
| EVD-2 | src/markdowntrace/trace-evidence/extract.ts; graph-validation/validate.ts; graph/model.ts | Source inspection | Table-only discovery, dropped unresolved edges, empty ranges/matrices, separate registry projection | C-1, C-3, C-4, C-5, C-6 |
| EVD-3 | src/markdowntrace/graph-profile/model.ts and validation modules; graph-validation/run.ts | Source/schema inspection | Closed vocabulary, file-backed validation, unsupported matrix-required-path guard | C-2, C-4 |
| EVD-4 | src/markdowntrace/public.ts; package.json; tests/test_package_exports.test.ts; tests/fixtures/public-package/consumer.ts.fixture | Producer/consumer inspection | Root-only self-contained public boundary and consumer expectations | C-2, C-4, C-8 |
| EVD-5 | src/markdowntrace/markdown/scanner.ts, source-slices.ts, definition-facts.ts, reference-facts.ts; [parser probe](document-graph-api/checks/probe-engine.mjs) | Source/runtime probe | Current whole-section ownership; public nodes include exact raw slices and nested list/table/quote structure; inline-code source includes delimiters | C-1, C-3, C-7 |
| EVD-6 | src/markdowntrace/registry/derived.ts; markdown/trace-links.ts; existing CI and package checks from merged PR #74 | Source and GitHub evidence | Existing link/registry derivation and compatibility work cannot be treated as the new graph | C-8 |
| EVD-7 | Companion declarations, consumer/profile examples, independent case ledger and current validation record | Local design checks | Consumer type fit and original design oracle; runtime link/API tests separately prove the implemented subset | C-1 through C-8 |

### Rubric Scores

| Axis | Score | Evidence IDs | Finding IDs | Notes |
| --- | --- | --- | --- | --- |
| Behavioral fitness | Concern | EVD-2, EVD-5, EVD-7 | FND-1 | APIs retain invalid evidence; source interpretation proven, full API-result proof still required |
| Consumer fitness | Pass | EVD-4, EVD-7 | FND-2 | Memory-first flow, reusable analysis and narrow query functions |
| Integration realism | Concern | EVD-1, EVD-5 | FND-1 | Full corpus public-parser source probes pass; production adapter proof remains |
| Change safety | Pass | EVD-3, EVD-4, EVD-6 | none | Additive recommendation, old schemas and commands preserved |
| Failure semantics | Pass | EVD-2, EVD-3, EVD-7 | none | Operation errors, graph invalidity, partial analysis and bounded results are distinct |
| Data and invariant protection | Pass | EVD-1, EVD-5, EVD-7 | FND-4 | Explicit identities, offset units, owner states, immutable runtime handles; exported context retains selection provenance |
| Operational fitness | Concern | EVD-5, EVD-7 | FND-3 | Caller limits and synchronous operation are explicit; scale thresholds unmeasured |
| Security and trust handling | Pass | EVD-4, EVD-6, EVD-7 | none | Host owns file access; no remote fetch, executable profile, or automatic agent action |
| Testability | Concern | EVD-5, EVD-7 | FND-1, FND-3 | Independent source corpus exists; full API-result and real-spec oracle proof remain |
| Implementation proportionality | Pass | EVD-2, EVD-4, EVD-7 | none | No storage/service framework; private indexes and concrete adapter remain internal |

### Evaluation Findings

| Finding ID | Severity | Axis | Affected contracts | Evidence IDs | Required action | Validation target |
| --- | --- | --- | --- | --- | --- | --- |
| FND-1 | Major | Behavioral fitness/integration/testability | C-1, C-2, C-3, C-7 | EVD-1, EVD-5, EVD-7 | The experimental graph/direct-query slice has runtime proof. Prove validation, traversal and context results as those operations are implemented; retain exact owners and offsets. These broader obligations do not block the current link-based slice. | VAL-1, VAL-5, VAL-6; Q-1/Q-2 |
| FND-2 | Minor | Consumer fitness | C-5 | EVD-7 | Addressed in revision 2: lookup returns definitions and a reference count; paged reference items include source occurrences. Avoids large reference payloads on simple lookup and manual source joins. | VAL-4, VAL-8 |
| FND-3 | Major | Operational fitness/testability | C-3, C-6, C-7 | EVD-5, EVD-7 | Jason selects pilot spec/context oracle; maintainer measures time/memory and agrees budgets before release. Production risk is unusable latency or missing implementer context. | VAL-5, VAL-6; Q-4 |
| FND-4 | Major | Data and invariant protection | C-7 | EVD-7 | Addressed in revision 2: ContextBundle includes selection query, nodes, predecessors and boundaries. Prevents exported context losing the relationship path explaining inclusion. | VAL-5, VAL-8 |

Section status: Complete; concerns are bounded by explicit implementation/release gates.

## Internal Review Record

- Contract depth calibration: ID2 remains appropriate for the proposed library boundaries; this revision changes the authoring convention without adding a remote service.
- Grounding result: Engine 3.5.0 exposes link destinations, reference-definition resolution and complete link-use source maps. The experimental graph/direct-query runtime consumes those public APIs.
- Rubric result: Graph, profile and query shapes remain the prior proposals. The owner's link decision resolves Q-1 for the experiment; FND-1 and FND-3 now bound the remaining capabilities and release claims.
- Findings addressed: Revision 7 replaces brace syntax with standard links, records the explicit user decision and removes the stale pre-extractor gate from current guidance.
- Validation result: The current task and companion record identify structural checks. Runtime link/API tests and the packed consumer verify the implemented subset; draft1 corpus reports remain scoped to their original language.
- Remaining findings: Graph policy evaluation, traversal, context projection and representative scale/agent-context proof remain unfinished.
- Readiness verdict: Runnable experimental graph/direct-query subset, with remaining API designs available for later implementation.

Revision history: Revisions 1–6 developed the API proposals and draft1 brace-language corpus. Revision 7 records the owner's 2026-09-16 standard-link decision and reconciles language guidance with the runnable experimental implementation. The adjacent checksum and companion record identify the current bytes.
