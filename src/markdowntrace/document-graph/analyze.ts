import type {
  AnalysisLimits,
  DocumentAnalysis,
  GraphSnapshot,
  IdentifierRecord,
  Occurrence,
  Relationship,
} from "./contracts/analysis.js";
import type { TraceProfile } from "./contracts/profile.js";
import type { DocumentSource, Outcome } from "./contracts/source.js";
import type { ReferenceMatch } from "./contracts/query.js";
import { registerAnalysis } from "./analysis-state.js";
import { extract } from "./extract.js";
import { assignOwners } from "./ownership.js";
import { attachSupport } from "./fragment-support.js";
import { profileData } from "./profile.js";
import {
  AnalysisFailure,
  canonical,
  failure,
  freeze,
  sha256,
} from "./value.js";
import { Coordinates } from "./coordinates.js";

const ANALYZER_VERSION = "0.1.0-experimental.2";
const PARSER_VERSION = "3.5.0";
export function analyzeDocument(
  source: DocumentSource,
  profile: TraceProfile,
  limits: AnalysisLimits,
): Outcome<DocumentAnalysis> {
  const data = profileData(profile);
  if (
    !data ||
    !source ||
    typeof source.documentId !== "string" ||
    !source.documentId.trim() ||
    typeof source.text !== "string" ||
    /[\uD800-\uDFFF]/u.test(source.text) ||
    !limits ||
    ![limits.maxOccurrences, limits.maxSourceUtf8Bytes].every(
      (n) => Number.isSafeInteger(n) && n > 0,
    )
  ) {
    return failure(
      "invalid-input",
      "Expected source text, an issued profile and positive safe-integer limits",
    );
  }
  const { text, documentId } = source;
  const sourceIdentity = {
    documentId,
    sha256: sha256(text),
    utf8Bytes: Buffer.byteLength(text),
    utf16Length: text.length,
  };
  if (sourceIdentity.utf8Bytes > limits.maxSourceUtf8Bytes)
    return failure("analysis-limit", "Document exceeds maxSourceUtf8Bytes");
  try {
    const coordinates = new Coordinates(text),
      extracted = extract(coordinates, documentId, limits.maxOccurrences);
    const located = extracted.blocks
      .flatMap((b) => b.tokens.map((token) => ({ token, block: b })))
      .sort((a, b) => a.token.range.start.offset - b.token.range.start.offset);
    const occurrences: Occurrence[] = located.map(({ token, block }, i) => ({
      id: `O${i + 1}`,
      identifier: token.identifier,
      role: token.role,
      range: token.range,
      fragmentId: block.id,
    }));
    const fragments = attachSupport(
        assignOwners(extracted.blocks, occurrences, text.length),
        extracted.blocks,
        coordinates,
      ),
      byFragment = new Map(fragments.map((f) => [f.id, f]));
    const prefixKinds = new Map(
      data.interpretation.entityKinds.flatMap((k) =>
        k.prefixes.map((p) => [p, k.name] as const),
      ),
    );
    const identifiers: IdentifierRecord[] = [
      ...new Set(occurrences.map((o) => o.identifier)),
    ]
      .sort()
      .map((identifier) => {
        const definitions = occurrences
          .filter((o) => o.identifier === identifier && o.role === "definition")
          .map((o) => o.id);
        return {
          identifier,
          entityKind: prefixKinds.get(identifier.split("-")[0]) ?? null,
          definition:
            definitions.length === 0
              ? { status: "missing" }
              : definitions.length === 1
                ? { status: "resolved", occurrenceId: definitions[0] }
                : {
                    status: "duplicate",
                    occurrenceIds: definitions as [string, string, ...string[]],
                  },
        };
      });
    extracted.diagnostics = extracted.diagnostics.map((diagnostic) => {
      if (diagnostic.code !== "markdown-trace.language.malformed-link")
        return diagnostic;
      const offset = diagnostic.sourceRanges[0].start.offset;
      const owner = fragments.find(
        (f) => f.range.start.offset <= offset && f.range.end.offset > offset,
      )?.owner;
      const ids =
        owner?.status === "owned"
          ? [owner.declarationId]
          : owner?.status === "ambiguous"
            ? owner.declarationIds
            : [];
      return {
        ...diagnostic,
        identifiers: ids.map(
          (id) => occurrences.find((o) => o.id === id)!.identifier,
        ),
      };
    });
    const relationships: Relationship[] = [],
      incoming = new Map<string, ReferenceMatch[]>(),
      outgoing = new Map<string, ReferenceMatch[]>();
    const add = (
      map: Map<string, ReferenceMatch[]>,
      id: string,
      match: ReferenceMatch,
    ) => {
      const list = map.get(id) ?? [];
      list.push(match);
      map.set(id, list);
    };
    for (const [i, occurrence] of occurrences.entries()) {
      if (occurrence.role !== "reference") continue;
      const owner = byFragment.get(occurrence.fragmentId)!.owner;
      const relationship: Relationship = {
        id: `R${relationships.length + 1}`,
        kind: located[i].token.kind,
        source: owner,
        target: occurrence.identifier,
        occurrenceId: occurrence.id,
      };
      relationships.push(relationship);
      const match = { relationship, occurrence };
      add(incoming, occurrence.identifier, match);
      if (owner.status === "owned") add(outgoing, owner.identifier, match);
      else
        extracted.diagnostics.push({
          code: `markdown-trace.language.${owner.status === "unowned" ? "unowned" : "ambiguous"}-reference`,
          severity: "error",
          message: "Reference has no unique source owner",
          identifiers: [occurrence.identifier],
          sourceRanges: [occurrence.range],
        });
    }
    extracted.diagnostics.sort(
      (a, b) =>
        (a.sourceRanges[0]?.start.offset ?? -1) -
          (b.sourceRanges[0]?.start.offset ?? -1) ||
        a.code.localeCompare(b.code),
    );
    extracted.exclusions.sort(
      (a, b) =>
        a.range.start.offset - b.range.start.offset ||
        a.range.end.offset - b.range.end.offset,
    );
    const snapshot: GraphSnapshot = {
      schemaVersion: "markdown-trace.document-graph.v1",
      analysisId: sha256(
        canonical({
          source: sourceIdentity,
          interpretationHash: profile.interpretationHash,
          schemaVersion: "markdown-trace.document-graph.v1",
          analyzerVersion: ANALYZER_VERSION,
          parserVersion: PARSER_VERSION,
        }),
      ),
      source: sourceIdentity,
      interpretationHash: profile.interpretationHash,
      analyzerVersion: ANALYZER_VERSION,
      parserVersion: PARSER_VERSION,
      coverage: extracted.diagnostics.some((d) => d.severity === "error")
        ? "partial"
        : "complete",
      identifiers,
      occurrences,
      relationships,
      fragments,
      diagnostics: extracted.diagnostics,
      exclusions: extracted.exclusions,
    };
    const analysis = freeze({ snapshot }) as DocumentAnalysis;
    registerAnalysis(analysis, {
      document: freeze(extracted.document),
      identifiers: new Map(identifiers.map((i) => [i.identifier, i])),
      incoming,
      outgoing,
    });
    return freeze({ ok: true, value: analysis });
  } catch (error) {
    if (error instanceof AnalysisFailure)
      return failure(error.code, error.message);
    throw error;
  }
}
