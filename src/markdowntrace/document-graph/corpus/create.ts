import type { DocumentAnalysis, IdentifierRecord } from "../contracts/analysis.js";
import type { CorpusBinding, CorpusCaptureSummary, CorpusInput, CorpusOutcome, DocumentCorpus, CorpusSnapshot } from "./contracts.js";
import { admit } from "./admission.js";
import { compareCapture, cmp } from "./order.js";
import { resolveReferences } from "./resolve.js";
import { indexReferences, registerCorpus } from "./state.js";
import { canonical, freeze, sha256 } from "../value.js";

const fail = (e: Extract<CorpusOutcome<never>, {ok:false}>["error"]): CorpusOutcome<never> => freeze({ok:false,error:e});
export function createCorpus(input: CorpusInput): CorpusOutcome<DocumentCorpus> {
  const admission = admit(input);
  if (!admission.ok) return fail(admission.error);
  const admitted = admission.value.captures;
  admitted.sort((a,b) => compareCapture(a.summary,b.summary));
  const summaries = admitted.map(x => x.summary), captures = new Map(summaries.map(c => [c.analysisId,c]));
  const analyses = new Map<string,DocumentAnalysis>(admitted.map(x => [x.summary.analysisId,x.analysis]));
  const records = new Map<string,ReadonlyMap<string,IdentifierRecord>>(admitted.map(x => [x.summary.analysisId,new Map(x.analysis.snapshot.identifiers.map(r => [r.identifier,r]))]));
  const bindings = admission.value.bindings.sort((a,b) => cmp(a.source.analysisId,b.source.analysisId) || cmp(a.source.occurrenceId,b.source.occurrenceId) || cmp(a.target.analysisId,b.target.analysisId) || cmp(a.target.identifier,b.target.identifier));
  const corpusId = sha256(canonical({schemaVersion:"markdown-trace.corpus.v1",captures:[...analyses.keys()].sort(),bindings}));
  const base = admitted[0].analysis.snapshot;
  const references = resolveReferences(analyses,captures,records,bindings).map(reference => structuredClone(reference));
  const snapshot: CorpusSnapshot = {schemaVersion:"markdown-trace.corpus.v1",corpusId,interpretationHash:base.interpretationHash,analyzerVersion:base.analyzerVersion,parserVersion:base.parserVersion,captures:summaries,references};
  const corpus = freeze({snapshot}) as DocumentCorpus;
  const indexes = indexReferences(snapshot.references);
  registerCorpus(corpus,{analyses,records,references:snapshot.references,captures,incoming:indexes.incoming,outgoing:indexes.outgoing});
  return freeze({ok:true,value:corpus});
}
