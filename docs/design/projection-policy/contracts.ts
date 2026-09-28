/** Proposed declarations only: this file does not implement the runtime. */
import type {
  AnalysisLimits, CapturePin, CorpusBinding, CorpusLimits, GraphValidationReport,
  SourceRange,
} from "../../../src/markdowntrace/document-graph/index.js";

export type EntityRef = Readonly<{ source: string; identifier: string }>;
export type Selection =
  | Readonly<{ kind: "document" }>
  | Readonly<{ kind: "section"; path: readonly [string, ...string[]] }>
  | Readonly<{ kind: "block"; range: SourceRange }>;
type RuleBase = Readonly<{ id: string; requirement: "required" | "optional" }>;
export type ProjectionRule = RuleBase & (
  | Readonly<{ op: "source"; source: string; select: Selection }>
  | Readonly<{ op: "entities"; entities: readonly [EntityRef, ...EntityRef[]] }>
  | Readonly<{
      op: "expand"; from: string; mode: "step" | "closure";
      direction: "incoming" | "outgoing" | "both";
      relations: readonly [string, ...string[]];
      subjectKinds: readonly [string, ...string[]];
      minSubjects: number; minNeighbors: number; maxDepth: number; maxNodes: number;
    }>
);
export interface ProjectionPolicyInput {
  readonly schemaVersion: "markdown-trace.projection-policy.v1";
  readonly policyId: string;
  readonly revision: string;
  readonly sources: readonly [string, ...string[]];
  readonly rules: readonly [ProjectionRule, ...ProjectionRule[]];
  readonly validationGates: readonly Readonly<{
    source: string; rules: "all" | readonly [string, ...string[]];
  }>[];
}
export interface PolicyIdentity {
  readonly schemaVersion: "markdown-trace.projection-policy.v1";
  readonly policyId: string;
  readonly revision: string;
  readonly sha256: string;
}
declare const issuedPolicy: unique symbol;
export interface ProjectionPolicy {
  readonly [issuedPolicy]: true;
  readonly identity: PolicyIdentity;
}
export interface ProducerIdentity {
  readonly packageVersion: string;
  readonly analyzerVersion: string;
  readonly parserVersion: string;
  readonly algorithmVersion: "markdown-trace.projection-algorithm.v1";
}
export interface ExpectedSource {
  readonly alias: string;
  readonly revision: string;
  readonly pin: CapturePin;
  readonly profileFileSha256: string;
  readonly interpretationHash: string;
  readonly validationHash: string;
}
export interface ProjectionSource {
  readonly alias: string;
  readonly revision: string;
  readonly documentId: string;
  readonly text: string;
  readonly validationProfileJson: string;
}
export interface ProjectionBudget {
  readonly maxUtf8Bytes: number;
  readonly maxFragments: number;
}
export interface ProjectionLimits {
  readonly analysis: AnalysisLimits;
  readonly corpus: CorpusLimits;
  readonly maxRuleEntityVisits: number;
  /** UTF-8 byte ceiling for JSON.stringify(packet), no framing/newline.
   * CLI verification also bounds raw file bytes before parsing. */
  readonly maxPacketUtf8Bytes: number;
}
export interface ProjectionExpectation {
  readonly policy: PolicyIdentity;
  readonly producer: ProducerIdentity;
  readonly sources: readonly ExpectedSource[];
}
export interface ProjectionInput {
  readonly assignmentId: string;
  readonly roots: readonly [EntityRef, ...EntityRef[]];
  readonly sources: readonly [ProjectionSource, ...ProjectionSource[]];
  readonly bindings: readonly CorpusBinding[];
  readonly policy: ProjectionPolicy;
  readonly expected: ProjectionExpectation;
  readonly budget: ProjectionBudget;
  readonly limits: ProjectionLimits;
}
/** File adapter shape: all paths resolve against the manifest's directory. */
export interface ProjectionManifest extends Omit<ProjectionInput, "sources" | "policy"> {
  readonly schemaVersion: "markdown-trace.projection-manifest.v1";
  readonly policyFile: string;
  readonly sources: readonly [
    Readonly<Omit<ProjectionSource, "text" | "validationProfileJson"> & {
      file: string; profileFile: string;
    }>,
    ...Readonly<Omit<ProjectionSource, "text" | "validationProfileJson"> & {
      file: string; profileFile: string;
    }>[],
  ];
}
export type ProjectionDiagnosticCode =
  | "missing-selector" | "ambiguous-selector" | "unsupported-source-range"
  | "unresolved-entity" | "ambiguous-ownership" | "unresolved-edge"
  | "partial-analysis" | "validation-gate" | "min-subjects" | "min-neighbors"
  | "depth-limit" | "node-limit" | "visit-limit"
  | "byte-budget" | "fragment-budget" | "required-admission-aborted"
  | "packet-shape" | "packet-mismatch" | "identity-mismatch";
export interface ProjectionDiagnostic {
  readonly code: ProjectionDiagnosticCode;
  readonly ruleId: string | null;
  readonly source: string | null;
  readonly entity: EntityRef | null;
  readonly range: SourceRange | null;
  readonly message: string;
}
/** One examined subject/original-reference incidence; contract section 4.5.
 * Includes revisits and boundary scans, not only discovery predecessors. */
export interface EdgeEvidence {
  /** Examined subject in traversal direction. */
  readonly from: EntityRef;
  /** Usable unique neighbor in traversal direction, or null if unresolved.
   * A non-null neighbor is not necessarily selected/admitted. */
  readonly to: EntityRef | null;
  /** Original reference capture and occurrence, even for incoming traversal. */
  readonly occurrence: Readonly<{ analysisId: string; occurrenceId: string }>;
  /** Original relationship ID and kind, without reversing incoming evidence. */
  readonly relationshipId: string;
  readonly relation: string;
  /** Shortest depth of `from` plus one; attempted hop, not `to`'s depth. */
  readonly depth: number;
}
export interface RuleEvaluation {
  readonly ruleId: string;
  readonly from: string | null;
  readonly requirement: "required" | "optional";
  readonly status: "resolved" | "unresolved" | "limited" | "skipped";
  readonly entities: readonly EntityRef[];
  /** Complete incidence log sorted/deduplicated by contract section 4.5;
   * empty for non-expansion and skipped rules. */
  readonly evidence: readonly EdgeEvidence[];
  readonly frontier: readonly EntityRef[];
  readonly subjects: number;
  readonly diagnostics: readonly ProjectionDiagnostic[];
}
export interface Obligation {
  /** Canonical JSON of [ruleId, sourceAlias, entityId-or-selectorKind]. */
  readonly id: string;
  readonly ruleId: string;
  readonly requirement: "required" | "optional";
  readonly source: string;
  readonly entity: EntityRef | null;
  readonly ranges: readonly SourceRange[];
  readonly status: "admitted" | "omitted";
  readonly reasons: readonly ProjectionDiagnosticCode[];
}
export interface ProjectionPart {
  readonly source: string;
  readonly range: SourceRange;
  readonly text: string;
  readonly reasons: readonly Readonly<{
    obligationId: string;
    role: "owned-content" | "heading" | "table-header" | "source-selection" | "structural-support";
  }>[];
}
export interface ProjectionPacket {
  readonly schemaVersion: "markdown-trace.projection-packet.v1";
  readonly identity: ProjectionExpectation;
  readonly request: Readonly<{
    assignmentId: string;
    roots: readonly EntityRef[];
    bindings: readonly CorpusBinding[];
    budget: ProjectionBudget;
    limits: ProjectionLimits;
  }>;
  readonly policyStatus: "satisfied" | "unsatisfied";
  readonly requiredSetComplete: boolean;
  readonly validation: readonly Readonly<{ source: string; report: GraphValidationReport }>[];
  readonly rules: readonly RuleEvaluation[];
  readonly obligations: readonly Obligation[];
  readonly parts: readonly ProjectionPart[];
  readonly diagnostics: readonly ProjectionDiagnostic[];
  readonly budget: Readonly<{
    requiredUtf8Bytes: number | null;
    requiredFragments: number | null;
    usedUtf8Bytes: number;
    usedFragments: number;
  }>;
  readonly measurements: Readonly<{
    originalSourceUtf8Bytes: number;
    projectedSourceUtf8Bytes: number;
  }>;
}
export type ProjectionOutcome<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: Readonly<{
      code: "invalid-input" | "invalid-policy" | "unsupported-version" | "resource-limit" | "stale-input";
      message: string;
      diagnostics: readonly ProjectionDiagnostic[];
    }> }>;
export interface ProjectionVerification {
  readonly schemaVersion: "markdown-trace.projection-verification.v1";
  readonly status: "pass" | "fail" | "stale";
  readonly policyStatus: "satisfied" | "unsatisfied" | "not-evaluated";
  readonly diagnostics: readonly ProjectionDiagnostic[];
}
export declare function compileProjectionPolicy(json: string): ProjectionOutcome<ProjectionPolicy>;
export declare function produceProjection(input: ProjectionInput): ProjectionOutcome<ProjectionPacket>;
export declare function verifyProjection(
  input: ProjectionInput, packet: unknown,
): ProjectionOutcome<ProjectionVerification>;
