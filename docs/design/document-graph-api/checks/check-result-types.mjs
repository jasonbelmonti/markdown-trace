import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { loadCorpus } from './corpus/inventory.mjs';

export function checkResultTypes(c = loadCorpus()) {
  const declarations = fileURLToPath(new URL('../contracts/index.js', import.meta.url));
  const path = fileURLToPath(new URL('./result-typecheck.generated.mts', import.meta.url));
  const lines = [`import type { GraphSnapshot, GraphSelection, Outcome, ValidationReport, LookupResult, ReferencePage, ContextBundle, TraceProfile, DocumentAnalysis, ProfileInput, TraversalQuery } from ${JSON.stringify(declarations)};`,
    'type ProfileDTO = Pick<TraceProfile, "profileId" | "interpretationHash" | "validationHash">; type AnalysisDTO = Pick<DocumentAnalysis, "snapshot">; type SelectionDTO = Pick<GraphSelection, "analysisId" | "coverage" | "diagnosticCount" | "query" | "nodes" | "boundary">;'];
  const types = { validateGraph: 'ValidationReport', lookupIdentifier: 'LookupResult', findIncoming: 'ReferencePage', findOutgoing: 'ReferencePage',
    traverseGraph: 'SelectionDTO', extractContext: 'ContextBundle', compileProfile: 'ProfileDTO', analyzeDocument: 'AnalysisDTO' };
  let count = 0;
  const check = (value, type) => { lines.push(`const value${count++} = ${JSON.stringify(value)} as const satisfies ${type};`); };
  for (const profile of Object.values(c.profiles)) check(profile, 'ProfileInput');
  for (const s of [...c.snapshots.values(), ...c.states.values()]) check(s, 'GraphSnapshot');
  for (const record of c.records.values()) for (const op of record.operations) {
    assert(types[op.operation], op.operation); check(op.expected, `Outcome<${types[op.operation]}>`);
    if (op.operation === 'traverseGraph') check(op.arguments.query, 'TraversalQuery');
  }
  const source = lines.join('\n');
  const options = { strict: true, exactOptionalPropertyTypes: true, noEmit: true, skipLibCheck: false,
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, types: [] };
  const host = ts.createCompilerHost(options), originalRead = host.readFile.bind(host), originalExists = host.fileExists.bind(host);
  host.readFile = name => name === path ? source : originalRead(name);
  host.fileExists = name => name === path || originalExists(name);
  host.getSourceFile = (name, version) => {
    const text = host.readFile(name); return text === undefined ? undefined : ts.createSourceFile(name, text, version);
  };
  const program = ts.createProgram([path], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: name => name, getCurrentDirectory: () => process.cwd(), getNewLine: () => '\n',
  }));
  return { status: 'pass', checkedValues: count, scope: 'DTO shape checks only; opaque runtime brands are deliberately excluded from serialized selection images.' };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(JSON.stringify(checkResultTypes(), null, 2));
