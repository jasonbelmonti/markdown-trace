# Shared Trace Runtime Contract

## Document Control

| Field | Value |
| --- | --- |
| Title | Shared Trace Runtime Contract |
| Contract depth | ID2; a bounded local process contract shared by Trace, skills and Fleet |
| Source authority | [Task](../tasks/shared-runtime-contract.md), revision 1; user selected Engine 3.6.0 |
| Author | Codex |
| Reviewers | Codex internal in-situ evaluation |
| Last updated | 2026-09-20 |
| Related design/spec/tickets | [Graph direction](markdown-trace-document-graph-overview.md), [current implementation](../current-implementation.md) |

## 0. Executive Contract Summary

The shared skill runtime exposes `markdown-trace-document` as a local process.
Trace ships its own exact Engine **3.6.0 JavaScript dependency**; the separately
installed `markdown-engine` CLI runs document-owner structural checks. They have
the same baseline version and distinct jobs. Neither substitutes for the other.

This packet selects four contracts: document execution, runtime location,
machine-readable identity, and Fleet admission/composition. Existing document
flags and schema meanings are preserved. `--runtime-info`, shared installation,
and Trace-aware Fleet support are specified for subsequent implementation.
Only the Engine dependency/provenance upgrade is implemented with this packet.

The highest-risk boundaries are accepting the wrong executable, hashing only an
entry point while dependencies change, reporting stale parser provenance, and
treating successful Trace checks as document-owner acceptance. Packaging,
installer implementation, Fleet CLI changes, publishing and host activation are
outside this task. No further runtime-interface decision is requested here.

Section status: Complete; contract selected, downstream delivery remains separate.

## 1. Source Requirements and Assumptions

| ID | Statement | Source | Impact on contracts |
| --- | --- | --- | --- |
| REQ-1 | Expose a reusable shared Trace runtime with explicit location, identity and faults. | User-selected readiness task 1 | C-1 through C-4 |
| REQ-2 | Upgrade the actual Engine dependency to exactly 3.6.0. | User instruction | C-3 and C-4; accurate provenance and compatibility proof |
| REQ-3 | Preserve document/legacy behavior, explicit profiles, local input handling and owner gates. | Task scope; command and schema implementations | C-1 and C-4 |
| REQ-4 | Fleet verifies approved bytes and emits environment bindings; separate installation owns activation. | Inspected Fleet runtime and README | C-2 through C-4 |
| ASM-1 | Initial shared runtime targets local macOS/Linux hosts with Node; supported Node range remains the current package range. | Existing shell installation pattern and package contracts | C-2 and C-3; Windows launcher support is a later extension |

Section status: Complete; Engine baseline is an explicit decision, not an assumption.

## 2. Problem-Space Model

### Existing Interface Constraints

| Interface | Kind | Owner | Mutability | Quality/completeness | Known consumers | Constraint or opportunity |
| --- | --- | --- | --- | --- | --- | --- |
| IF-1: markdown-trace-document | CLI | Trace | owned-risky | Tested flags, channels, results and limits; no runtime-info mode | Shared skill and packed-consumer checks | Preserve execution; add identity separately |
| IF-2: package-root API and markdown-trace | API/CLI | Trace | fixed for this task | Legacy compatibility tests | Existing consumers | Retain exports, command meanings and plain-text version |
| IF-3: Engine public JavaScript API | Dependency | Engine | fixed | Published 3.6.0; same Node range | Trace extraction and structural queries | Upgrade exact package; use public interfaces |
| IF-4: Fleet runtime-verify/runtime-env | CLI/config | Fleet | negotiable | Engine-specific policy, digest and consumer checks | Host/installer workflows | Later Trace adapter; no claim of current support |
| IF-5: shared Trace installation | Process/files | Trace installer | not-yet-real | Contract only | Skills and Fleet | Define one binding and immutable payload admission |

### Actors and Systems

| Actor/System | Role | Trust level | Contract needs |
| --- | --- | --- | --- |
| Document owner/authoring skill | Supplies document, profile and acceptance policy | Explicit workflow authority | Separate structural, Trace and semantic verdicts |
| Trace process | Computes graph, validation and queries | Approved executable; inputs remain data | Local read-only execution and provenance |
| Runtime installer | Stages and activates approved releases | Explicit operator action | Integrity verification and recoverable activation |
| Fleet and host | Select approved identity and bind skill processes | Trusted configuration | Exact identity, validation evidence and explicit environment |

### Capabilities

| Capability | Command/query/event | Owner | Consumers | Notes |
| --- | --- | --- | --- | --- |
| Validate/inspect document | Query | Trace | Skills | Explicit file and profile |
| Describe running runtime | Query | Trace | Fleet/host | New --runtime-info contract |
| Bind verified runtime | Query/config | Fleet/host | Skill process | Emitted map must be applied by the host |
| Activate release | Command | Installer | Operator | Separate from verification |

### Domain Vocabulary

| Term | Definition | Invariants | Non-examples |
| --- | --- | --- | --- |
| Runtime identity | Source, package, Engine and protocol versions | Machine-readable, matched to verified bytes | Package version alone |
| Payload | All executable code and runtime dependencies in a release | Complete integrity coverage | Hash of a tiny importing entry file |
| Approved binding | Executable path selected after Fleet admission | No silent fallback if invalid | Arbitrary first command on PATH |
| Document verdict | Result under the selected Trace profile | Separate from runtime health and semantic acceptance | Successful --help |

Section status: Complete; consumers and implementation gaps are identified.

## 3. Boundary Map

| Boundary | Owner | Consumers | Direction | Stability | Reason to exist |
| --- | --- | --- | --- | --- | --- |
| Document process | Trace | Skills/Fleet probes | Explicit inputs to stdout/stderr | Experimental versioned schemas | Isolate graph logic from process transport |
| Runtime selection | Fleet/host | Skill process | Approved identity to executable path | Runtime contract v1 | Make selection independent of a library checkout |
| Artifact activation | Installer | Host/Fleet | Verified payload to active binding | Runtime contract v1 | Separate mutation from read-only verification |
| Document acceptance | Document owner | Author/reviewer | Separate gate results to acceptance | Domain-owned | Trace cannot certify evidence truth or prose completeness |

Section status: Complete.

## 3A. Integration Strategy

| Existing interface | Proposed response | Adapter/translator contract | Upstream change needed | Validation required |
| --- | --- | --- | --- | --- |
| IF-1 | Preserve document behavior; extend with an independent identity mode later | C-1, C-3 | Yes; later Trace runtime task | Existing command tests plus identity-mode acceptance |
| IF-2 | Retain | C-1 | No | Legacy enforcement and packed-root consumer |
| IF-3 | Upgrade exact dependency and derive parser metadata from the generated version | C-3 | No Engine API changes | Actual installed version and emitted graph/report identity |
| IF-4 | Extend with Trace-specific admission/environment behavior later | C-2, C-4 | Yes; later Fleet tasks | Engine regressions plus staged/active Trace verification |
| IF-5 | Implement versioned payload and fixed-target launcher later | C-2, C-4 | Yes; later artifact/installer tasks | Isolated installation and failure/rollback proof |

Section status: Complete; no generic provider framework is required by these contracts.

## 4. Contract Inventory

| Contract ID | Name | Kind | Owner | Consumers | Stability | Source IDs |
| --- | --- | --- | --- | --- | --- | --- |
| C-1 | Document command | CLI | Trace | Skills and verifiers | Existing experimental, preserved | REQ-1, REQ-3 |
| C-2 | Runtime binding | Process/config | Installer and host | Skills/Fleet | New shared runtime v1 | REQ-1, REQ-4, ASM-1 |
| C-3 | Runtime identity and compatibility | JSON/provenance | Trace | Fleet and operators | New identity v1; existing graph schemas | REQ-1, REQ-2, ASM-1 |
| C-4 | Admission and owner-gate composition | Verification protocol | Fleet and document owner | Host/author | New Trace admission; existing owner gates | REQ-2, REQ-3, REQ-4 |

Section status: Complete.

## 5. Materialized Contracts

### C-1: Document command

The process accepts the existing `--file PATH --profile PATH` pair. Resolve both
against the caller's working directory; launching through a wrapper must preserve
that directory and forward each argument unchanged. Profiles use
`markdown-trace.validation-profile.experimental.v1` and explicitly select
`markdown-trace.identity.draft2`. No filename-derived vocabulary or implicit
profile is allowed. Document ownership remains with the caller.

| Operation | Output on stdout | Output on stderr | Completion |
| --- | --- | --- | --- |
| Default or --format report | Existing validation JSON | Empty on completed validation | Exit 0 for pass; 1 for fail/indeterminate |
| --format graph | Existing { validation, graph } JSON | Empty on completed validation | Same verdict-based exits |
| --format query --identifier ID | Existing { validation, lookup, references } JSON | Empty on completed validation | Same exits; absent ID is null, not a new error |
| --format mermaid | Mermaid diagram | Validation JSON, including on pass | Same verdict-based exits |
| --format html | Existing HTML report | Empty on completed validation | Same verdict-based exits |
| --help | Existing usage text | Empty | Exit 0 |

Queries retain incoming as the default direction, outgoing as an explicit option,
offset 0, limit 100, maximum limit 1,000 and `nextOffset` pagination. Preserve
source/hash/range semantics, 2,000,000 UTF-8 byte and 50,000 occurrence limits,
and visibility of invalid graphs. Graph/report schema versions do not change.

The command reads local inputs and writes only its output streams. It does not
fetch Trace links, install dependencies, rewrite documents or choose output
files. The host owns output redirection and must not overwrite inputs. HTML
generation is local; opening its diagram uses the existing pinned Mermaid CDN.
Plain text and validation findings remain available without that browser fetch.

Runtime/configuration failures caught by the command retain exit 2 and the
existing JSON error on stderr. Do not promise JSON for loader failures, process
signals or broken pipes before/after command handling. Callers classify those as
operational failures, never as a document pass. Retrying unchanged document
failures cannot repair them; fix the input/profile first. Repeated read-only
queries under identical inputs/runtime preserve deterministic content.

### C-2: Runtime binding

The canonical installed executable name is `markdown-trace-document`.
`MARKDOWN_TRACE_BIN` is the sole public skill binding and contains one absolute
path to an executable, never a shell command or argument string. The caller
executes it with an argument array, without shell interpolation.

A non-empty explicit binding is authoritative: missing, unreadable or
non-executable targets fail without falling back. An unset/empty binding permits
interactive discovery of that exact command name through PATH; the caller resolves
it to an absolute path. Fleet-managed skill processes receive an explicit,
verified binding and do not rely on PATH discovery. Development checkout use
continues through `node /absolute/path/dist/markdowntrace/document-graph/cli.js`.

The installer supplies a fixed-target launcher for a versioned payload. The
launcher may resolve a supported Node through PATH; the host controls that PATH
and the identity response records the observed Node version. There is no public
environment override that silently swaps the launcher's Trace payload. Staged
Node entry points are explicit verifier inputs, not inherited overrides.
`MARKDOWN_ENGINE_BIN` continues to select the owner's structural CLI and must
not affect Trace's imported JavaScript dependency.

The host applies Fleet's emitted `MARKDOWN_TRACE_BIN` binding when starting a
skill process; a Fleet subprocess cannot change its parent's environment.
Installer and host own filesystem execution permissions. Standard OS failures
are reported as runtime unavailable; they do not trigger installation or repair.
No network service, tenancy or additional authorization protocol is introduced.

### C-3: Runtime identity and compatibility

Add `markdown-trace-document --runtime-info` in the later runtime-artifact task.
It is a standalone mode: no document, profile, output-format or query arguments
are accepted with it. It reads no document and emits one JSON object on stdout,
empty stderr and exit 0. Rejected combinations use the C-1 invocation-error
contract. This mode is **not implemented by the current change**.

| Field | Required value/shape | Meaning |
| --- | --- | --- |
| schemaVersion | markdown-trace.runtime-info.v1 | Version of this JSON interface |
| package | @jasonbelmonti/markdown-trace | Runtime producer |
| packageVersion | Exact package SemVer | Existing package remains 0.1.0 in this task |
| sourceCommit | Full lowercase 40-character Git SHA, or null for a development build | Release source; Fleet rejects null for an approved runtime |
| markdownEngineVersion | 3.6.0 for this baseline | Exact embedded/installed Engine library |
| analyzerVersion | Exact analyzer version string | Current value 0.1.0-experimental.2 |
| languageVersion | markdown-trace.identity.draft2 | Identity language |
| validationProfileVersion | markdown-trace.validation-profile.experimental.v1 | Supported command profile |
| graphVersion | markdown-trace.document-graph.v1 | Graph snapshot format |
| validationResultVersion | markdown-trace.validation-result.experimental.v1 | Validation report format |
| nodeVersion | Observed process.version string | Actual executing Node runtime |

All required fields are strings except the explicitly nullable sourceCommit.
Consumers reject missing, malformed or unsupported required values and ignore
additional fields within v1; additive fields cannot change existing meanings.

Supported Node remains `^20.19.0 || >=22.12.0`. Trace's package range stays
unchanged; Fleet still has its own Node 22+ requirement. The installer/verifier
checks the selected Node against the intersection where both tools run on it.
Unsupported Node is an operational failure, not a document-validation verdict.

An artifact's trusted release descriptor must bind its source commit, package
version, exact Engine version and protocol versions to complete payload integrity.
Use either a self-contained executable digest or a descriptor covering every
runtime file/dependency. Hashing only an importing CLI file is insufficient.
The launcher must also be verified against its approved fixed template and target
before invoking it. Digest generation and release asset layout belong to the
artifact task; the digest cannot be supplied solely by the executable being
verified. Runtime-info corroborates approved bytes, not their authenticity.

The existing `parserVersion` in snapshots/reports comes from generated Engine
release metadata. Parser version participates in `analysisId`; upgrading Engine
intentionally changes that identity and invalidates old analysis evidence even
if graph facts are unchanged. Re-run affected checks and keep prior evidence
historical. Existing graph, profile and result schema versions and the analyzer
version retain their current meaning. Any later incompatible runtime-info shape
requires a new schema version; Fleet admits only explicitly supported versions.

### C-4: Admission and owner-gate composition

Fleet approval binds the complete payload integrity, source commit, package/Engine
versions, C-3 protocol versions, compatible Node and selected skill source pins.
It checks integrity before invoking candidate code, then identity, then
source-owned positive and negative contracts. A successful `--runtime-info`
does not prove document behavior or skill-package completeness.

The lifecycle is staged -> verified -> active. Staging and verification do not
modify the active binding; the installer owns activation. A change to payload,
launcher, selected skill/profile or relevant Node invalidates its affected
verification. Repeated verification is read-only. Failed verification produces
non-success and leaves activation to an explicit later action; rollback restores
a previously verified compatible runtime/skill selection. Consumers must not
continue after missing identity, unsupported versions, digest mismatch, failed
contracts or process failure. There is no automatic download or fallback.

The first Trace integration uses the existing valid/defect/repair document proofs.
TaskDefinition composition separately runs Engine structural validation, Trace
profile validation, then the owner's semantic/readiness review. Each result
retains its own meaning; a structurally invalid document cannot become ready
because Trace passed, and a healthy runtime cannot make an invalid graph pass.
Domain profiles and policy changes remain with their document owners.

Section status: Complete; C-1 is preserved, C-2/C-3 admission surfaces and C-4 Fleet execution are future implementation obligations.

## 6. State, Fault, and Misuse Contracts

| Case ID | State/fault/misuse case | Owning contract | Expected behavior | Validation |
| --- | --- | --- | --- | --- |
| CASE-1 | Valid input or failed/indeterminate graph | C-1 | Preserve 0/1 verdict, inspectable graph and channel contract | VAL-2 |
| CASE-2 | Missing/malformed profile, unknown flag, bad pagination or analysis limit | C-1 | Existing operational error, exit 2; no false pass | VAL-2 |
| CASE-3 | Explicit binding missing or non-executable | C-2 | Report unavailable; no PATH fallback or auto-install | VAL-4 |
| CASE-4 | Wrong digest, incomplete integrity set, wrong Engine/protocol or unsupported Node | C-3, C-4 | Reject candidate; active selection remains unchanged | VAL-4 |
| CASE-5 | Identity mode mixed with document arguments | C-3 | Invocation error; no document read or validation claim | VAL-4 |
| CASE-6 | Process fails before JSON, receives a signal or breaks its output pipe | C-1, C-4 | Operational failure; caller does not infer a document verdict | VAL-4 |
| CASE-7 | Runtime/parser or profile changes after evidence capture | C-3, C-4 | Mark affected evidence stale and re-run it | VAL-2, VAL-4 |
| CASE-8 | Trace passes but an owner gate fails | C-4 | Preserve the failing gate; no readiness promotion | VAL-3 |

Section status: Complete.

## 7. Compatibility and Migration Notes

| Contract ID | Compatibility rule | Migration/backfill | Rollback constraint | Deprecation plan |
| --- | --- | --- | --- | --- |
| C-1 | Preserve commands, flags, schema meanings and source behavior | Re-run fixture/packed-consumer proofs on Engine 3.6.0 | Earlier runtime can read unchanged documents/profiles | No legacy deprecation |
| C-2 | New optional binding becomes explicit under Fleet | Later replace checkout assumptions and install symlinks deliberately | Restore approved callable target without editing source documents | No installed-skill migration in this task |
| C-3 | Engine provenance changes from 3.5.0 to 3.6.0; analysis identities change | Recompute results; do not relabel old evidence | Old artifacts retain their real parser/version identity | New identity mode is additive |
| C-4 | Engine structural CLI and Trace library remain separate | Later declare Trace policy/consumers and apply bindings | Runtime and skill/profile selection must remain compatible together | Existing Engine/OKF verification retained |

Section status: Complete.

## 8. Validation and Review Plan

| Validation ID | Contract IDs | Method | Evidence required | Owner |
| --- | --- | --- | --- | --- |
| VAL-1 | C-1, C-2, C-3, C-4 | Structural validation and in-situ review | Packet/profile identity, Engine 3.6.0, valid true, no diagnostics; source-grounded decisions | This task |
| VAL-2 | C-1, C-3 | Command/provenance tests, full enforcement and packed-consumer smoke | Real graph/report identify 3.6.0, preserved IDs/edges/ranges/queries/HTML and legacy behavior | This task |
| VAL-3 | C-1, C-4 | Existing TaskDefinition defect/repair trial | Structural pass with Trace-specific defects failing and repaired inputs passing; Engine versions 3.6.0 | This task |
| VAL-4 | C-2, C-3, C-4 | Later isolated artifact/installer/Fleet contract tests | Identity mode, complete integrity, binding precedence, process failures, unsupported Node, no activation on failure and rollback | Subsequent readiness tasks |

Section status: Complete; planned VAL-4 is not admitted implementation evidence.

## 9. Traceability Matrix

| Source ID | Contract IDs | Acceptance/validation IDs | Notes |
| --- | --- | --- | --- |
| REQ-1 | C-1, C-2, C-3, C-4 | VAL-1, VAL-2, VAL-4 | Runtime contract is defined here; distribution follows |
| REQ-2 | C-3, C-4 | VAL-1, VAL-2, VAL-3 | Actual Engine upgrade and parser provenance |
| REQ-3 | C-1, C-4 | VAL-1, VAL-2, VAL-3 | Existing behavior and separate owner gates |
| REQ-4 | C-2, C-3, C-4 | VAL-1, VAL-4 | Selection, admission and activation ownership |
| ASM-1 | C-2, C-3 | VAL-1, VAL-4 | Initial local host/Node boundary |

Section status: Complete.

## 10. Open Questions

| Question ID | Question | Owner | Due date or decision point | Impact if unresolved |
| --- | --- | --- | --- | --- |
| Q-1 | Which release artifact layout, distribution location and actual digest will realize C-3? | Trace artifact task | Before publishing/staging a Fleet candidate | Prevents artifact admission, not completion of this interface definition; C-3 fixes identity and complete-integrity obligations |

Section status: Complete; no unresolved interface choice blocks the current task.

## 11. In-Situ Evaluation

### Grounding Evidence

| Evidence ID | Source | Tool/source type | What was inspected | Relevant contracts |
| --- | --- | --- | --- | --- |
| EVD-1 | [Command](../../src/markdowntrace/document-graph/command.ts), [tests](../../tests/test_document_graph_command.test.ts), [packed command](../../scripts/package-exports/graph-demo.mjs) | Local code/tests | Flags, outputs, failures and installed-command behavior | C-1 |
| EVD-2 | [Manifest](../../package.json), [metadata generator](../../scripts/generate-release-metadata.mjs), [analyzer](../../src/markdowntrace/document-graph/analyze.ts), [schemas](../../src/markdowntrace/document-graph/contracts/analysis.ts) | Local code and registry metadata | Exact Engine/Node dependency, parser-version drift, analysis identity and output shapes | C-3 |
| EVD-3 | [Fleet runtime](https://github.com/jasonbelmonti/skill-fleet/tree/1ef68a780cac6d8786b849db9f78ac284bbd935e/src/runtime), [README](https://github.com/jasonbelmonti/skill-fleet/blob/1ef68a780cac6d8786b849db9f78ac284bbd935e/README.md) | Local source and verified active wrapper | Engine-only resolver/verifier/environment output and installer separation | C-2, C-4 |
| EVD-4 | [Consumer mapping](../../experiments/task-definition-trace/authoring.md), [trial](../../experiments/task-definition-trace/verify.mjs) | Local source and checksum-verified fixture | Separate structural/Trace gates and defect/repair proof | C-4 |

### Rubric Scores

| Axis | Score | Evidence IDs | Finding IDs | Notes |
| --- | --- | --- | --- | --- |
| Behavioral fitness | Pass | EVD-1 | None | Existing command behavior is retained |
| Consumer fitness | Pass | EVD-1, EVD-3 | None | One executable binding; identity does not require a document |
| Integration realism | Pass | EVD-2, EVD-3 | FND-1 | Future Fleet/installer surfaces are explicitly unimplemented |
| Change safety | Pass | EVD-1, EVD-2, EVD-4 | None | Versioned identity and evidence invalidation preserve old schema meanings |
| Failure semantics | Pass | EVD-1, EVD-3 | None | Distinguishes document verdicts, startup failures and integrity rejection |
| Data and invariant protection | Pass | EVD-1, EVD-2 | FND-1 | Complete integrity and parser provenance have explicit owners |
| Operational fitness | Pass | EVD-2, EVD-3 | None | Identity, paths, versions and per-gate results support diagnosis |
| Security and trust handling | Pass | EVD-1, EVD-3 | None | Verify bytes before execution; arguments/inputs are data; no auto-install |
| Testability | Pass | EVD-1, EVD-4 | None | Existing independent fixtures plus concrete later runtime fault cases |
| Implementation proportionality | Pass | EVD-1, EVD-3 | None | Four bounded contracts; no service or generic plugin framework |

### Evaluation Findings

| Finding ID | Severity | Axis | Affected contracts | Evidence IDs | Required action | Validation target |
| --- | --- | --- | --- | --- | --- | --- |
| FND-1 | Major; addressed in the contract | Integration realism and provenance | C-3 | EVD-2, EVD-3 | Separate self-reported identity from integrity and derive parser version from generated metadata; never attest only an importing entry file | VAL-1, VAL-2, VAL-4 |

Section status: Complete; rubric assesses contract fitness, not completion of future runtime delivery.

## Internal Review Record

- Contract depth calibration: ID2 because local CLI, package, host and Fleet boundaries share durable identity and compatibility requirements.
- Grounding result: Producers, schemas, command/packed-consumer tests, Fleet runtime code and the retained domain mapping were inspected.
- Rubric result: Approve for this contract boundary; all axes pass as a design, with later implementation proof assigned to VAL-4.
- Findings addressed: FND-1 separates integrity from runtime identity and requires accurate generated parser provenance. Startup/stream failures do not falsely promise JSON.
- Validation result: The interface-design profile passed with Engine 3.6.0, valid true and no diagnostics. Final artifact/profile hashes and the repeated final check are recorded in docs/validation/shared-runtime-contract.json.
- Remaining findings: No blocking contract findings. Q-1 belongs to artifact production; its output is required before Fleet admission.
- Readiness verdict: Approve for subsequent runtime-artifact work; this does not certify an installed shared Trace runtime.
