// Compile-only contract consumer. Runtime package proof remains independently required.
import { createCorpus, traverseCorpus, checkCorpusSelection, findCorpusIncoming, lookupCorpusIdentifier, type CorpusCapture, type CorpusBinding } from './contracts.js';
import { traverseGraph, extractContext } from '../../../src/markdowntrace/document-graph/index.js';

export function actionContext(captures: readonly CorpusCapture[], bindings: readonly CorpusBinding[]) {
  const corpus = createCorpus({ captures, bindings, limits: { maxCaptures: 4, maxBindings: 20, maxSourceUtf8Bytes: 100000 } });
  if (!corpus.ok) return corpus;
  const root = { analysisId: captures[0].expected.analysisId, identifier: 'EP-ACT-1' };
  const lookup = lookupCorpusIdentifier(corpus.value, root);
  const incoming = findCorpusIncoming(corpus.value, root, { limit: 10 });
  const selected = traverseCorpus(corpus.value, { roots: [root], direction: 'outgoing', relations: ['implements', 'depends-on'], maxDepth: 2, maxNodes: 3 });
  if (!selected.ok) return selected;
  const checked = checkCorpusSelection(corpus.value, selected.value);
  if (!checked.ok) return checked;
  const contexts = [];
  for (const capture of captures) {
    const ids = checked.value.nodes.filter(n => n.entity.analysisId === capture.expected.analysisId).map(n => n.entity.identifier);
    if (!ids.length) continue;
    const local = traverseGraph(capture.analysis, { roots: ids as [string, ...string[]], direction: 'outgoing', maxDepth: 0, maxNodes: ids.length });
    if (!local.ok) return local;
    contexts.push(extractContext(capture.analysis, { selection: local.value, budget: { maxUtf8Bytes: 10000, maxFragments: 100 } }));
  }
  return { corpus: corpus.value.snapshot, selection: checked.value, lookup, incoming, contexts };
}
