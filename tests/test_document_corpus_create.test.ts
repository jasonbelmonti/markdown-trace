import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analyzeDocument, compileProfile, createCorpus, type DocumentAnalysis, type CorpusCapture, type CorpusBinding } from "../src/markdowntrace/document-graph/index.js";
import { declaration, reference } from "./document-graph-context/fixture.js";

const profileInput = JSON.parse(readFileSync("fixtures/document-graph/profile.json", "utf8"));
const profileResult = compileProfile(profileInput);
if (!profileResult.ok) throw new Error("fixture profile failed to compile");
const profile = profileResult.value;
const limits = { maxSourceUtf8Bytes: 100_000, maxOccurrences: 100 };
const analyze = (text: string, documentId = "task.md", p = profile) => {
  const result = analyzeDocument({ documentId, text }, p, limits);
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};
const capture = (analysis: DocumentAnalysis, alias: string): CorpusCapture => ({ alias, analysis, expected: { analysisId: analysis.snapshot.analysisId, source: { ...analysis.snapshot.source } } });
const input = (captures: CorpusCapture[], bindings: CorpusBinding[] = [], more: Partial<{maxCaptures:number;maxBindings:number;maxSourceUtf8Bytes:number}> = {}) => ({ captures, bindings, limits: { maxCaptures: 10, maxBindings: 20, maxSourceUtf8Bytes: 100_000, ...more } });
const val = (result: ReturnType<typeof createCorpus>) => { if (!result.ok) throw new Error(JSON.stringify(result.error)); return result.value; };
const errorCode = (result: ReturnType<typeof createCorpus>) => result.ok ? "success" : result.error.code;
const unresolved = (reason: string) => expect.objectContaining({ resolution: { status: "unresolved", reason } });

describe("document corpus construction and reference resolution", () => {
  it("pins unique captures, collapses aliases, sorts identity and preserves exact occurrence evidence", () => {
    const sourceText = `# ${declaration("WP-1")}\n\n${reference("REQ-1", "implements")}`;
    const source = analyze(sourceText, "z-plan.md"), targetA = analyze(declaration("REQ-1"), "task.md"), targetB = analyze(`${declaration("REQ-1")}\n\nChanged.`, "task.md");
    const binding = { source: { analysisId: source.snapshot.analysisId, occurrenceId: "O2" }, target: { analysisId: targetA.snapshot.analysisId, identifier: "REQ-1" } };
    const supplied = input([capture(source,"plan"),capture(targetB,"revision-b"),capture(targetA,"revision-a"),capture(targetA,"task")],[binding]);
    const before = JSON.stringify(supplied), corpus = val(createCorpus(supplied));
    expect(JSON.stringify(supplied)).toBe(before);
    expect(corpus.snapshot.captures.map(c=>c.source.documentId)).toEqual(["task.md","task.md","z-plan.md"]);
    expect(corpus.snapshot.captures.find(c=>c.analysisId===targetA.snapshot.analysisId)?.aliases).toEqual(["revision-a","task"]);
    const ref = corpus.snapshot.references.find(r=>r.evidence.analysisId===source.snapshot.analysisId)!;
    expect(ref).toMatchObject({source:{analysisId:source.snapshot.analysisId,identifier:"WP-1"},targets:[{analysisId:targetA.snapshot.analysisId,identifier:"REQ-1"}],binding:true,resolution:{status:"resolved"}});
    const at = sourceText.indexOf(reference("REQ-1","implements"));
    expect(sourceText.slice(ref.occurrence.range.start.offset,ref.occurrence.range.end.offset)).toBe(reference("REQ-1","implements"));
    expect(ref.occurrence.range.start.offset).toBe(at);
    expect(Object.isFrozen(corpus.snapshot.references[0].occurrence.range.start)).toBe(true);
    expect(ref.occurrence).not.toBe(source.snapshot.occurrences.find(o=>o.id===ref.occurrence.id));
    expect(createCorpus(input([capture(targetA,"task"),capture(source,"plan")],[binding])).ok).toBe(true);
    expect(val(createCorpus(input([capture(targetB,"revision-b"),capture(source,"plan"),capture(targetA,"task")],[binding]))).snapshot.corpusId).toBe(corpus.snapshot.corpusId);
  });

  it("returns contract ordered unresolved reasons and never falls back from explicit intent", () => {
    const root = analyze(`# ${declaration("WP-1")}\n\n${reference("REQ-1","implements")} ${reference("REQ-2","depends-on")} ${reference("REQ-3","references")} ${reference("REQ-4","implements")} ${reference("REQ-5","depends-on")} ${reference("REQ-6","references")}`);
    const targetOther = analyze(declaration("REQ-0"),"other.md");
    const targetAbsent = analyze(declaration("REQ-9"),"absent.md");
    const targetDup = analyze(`${declaration("REQ-5")}\n\n${declaration("REQ-5")}`,"duplicate.md");
    const rids = root.snapshot.occurrences.filter(o=>o.role==="reference").map(o=>o.id);
    const bind = (occurrenceId:string, analysisId:string, identifier:string):CorpusBinding => ({source:{analysisId:root.snapshot.analysisId,occurrenceId},target:{analysisId,identifier}});
    const bindings = [
      bind(rids[0],targetOther.snapshot.analysisId,"REQ-1"),
      bind(rids[0],targetAbsent.snapshot.analysisId,"REQ-1"),
      bind(rids[1],"a".repeat(64),"REQ-2"),
      bind(rids[2],targetOther.snapshot.analysisId,"REQ-X"),
      bind(rids[3],targetOther.snapshot.analysisId,"REQ-4"),
      bind(rids[4],targetDup.snapshot.analysisId,"REQ-5"),
    ];
    const results = val(createCorpus(input([capture(root,"root"),capture(targetOther,"other"),capture(targetAbsent,"absent"),capture(targetDup,"dup")],bindings))).snapshot.references.filter(r=>r.evidence.analysisId===root.snapshot.analysisId);
    expect(results[0]).toMatchObject(unresolved("conflicting-bindings"));
    expect(results[1]).toMatchObject(unresolved("missing-capture"));
    expect(results[2]).toMatchObject(unresolved("target-id-mismatch"));
    expect(results[3]).toMatchObject(unresolved("missing-definition"));
    expect(results[4]).toMatchObject(unresolved("duplicate-definition"));
    expect(results[5]).toMatchObject(unresolved("missing-definition"));
    const localDefined = analyze(`# ${declaration("WP-1")}\n\n${reference("REQ-8","implements")}\n\n${declaration("REQ-8")}`);
    const localBinding = [{source:{analysisId:localDefined.snapshot.analysisId,occurrenceId:"O2"},target:{analysisId:targetOther.snapshot.analysisId,identifier:"REQ-8"}}];
    expect(val(createCorpus(input([capture(localDefined,"local"),capture(targetOther,"other")],localBinding))).snapshot.references[0]).toMatchObject(unresolved("local-target-not-missing"));
    const ownerBad = analyze(`# ${declaration("WP-1")}\n\n## ${declaration("WP-1")}\n\n${reference("REQ-9","implements")}`,"owner.md");
    const ownerBadResult = val(createCorpus(input([capture(ownerBad,"bad-owner")]))).snapshot.references[0];
    expect(ownerBadResult).toMatchObject({source:{analysisId:ownerBad.snapshot.analysisId,identifier:"WP-1"},resolution:{status:"unresolved",reason:"unusable-owner"}});
    const unknownRoot = analyze(`# ${declaration("WP-1")}\n\n${reference("XXX-1","implements")}`);
    const unknownTarget = analyze("[XXX-1](ctx://trace/entity/XXX-1?role=definition)","unknown.md");
    const unknownBinding = [{source:{analysisId:unknownRoot.snapshot.analysisId,occurrenceId:"O2"},target:{analysisId:unknownTarget.snapshot.analysisId,identifier:"XXX-1"}}];
    expect(val(createCorpus(input([capture(unknownRoot,"unknown-root"),capture(unknownTarget,"unknown-target")],unknownBinding))).snapshot.references[0]).toMatchObject(unresolved("unknown-kind"));
    const missingRef = analyze(`# ${declaration("WP-1")}\n\n${reference("REQ-MISSING","implements")}`);
    const conflicting = [{source:{analysisId:missingRef.snapshot.analysisId,occurrenceId:"O2"},target:{analysisId:targetOther.snapshot.analysisId,identifier:"REQ-MISSING"}},{source:{analysisId:missingRef.snapshot.analysisId,occurrenceId:"O2"},target:{analysisId:targetAbsent.snapshot.analysisId,identifier:"REQ-MISSING"}}];
    const conflicted = val(createCorpus(input([capture(missingRef,"m"),capture(targetOther,"o"),capture(targetAbsent,"a")],conflicting))).snapshot.references[0];
    expect(conflicted).toMatchObject(unresolved("conflicting-bindings"));
    const missingDefinition = analyze(`# ${declaration("WP-1")}\n\n${reference("REQ-MISSING","implements")}`);
    const absent = analyze(declaration("REQ-2"),"absent.md");
    const one = [{source:{analysisId:missingDefinition.snapshot.analysisId,occurrenceId:"O2"},target:{analysisId:absent.snapshot.analysisId,identifier:"REQ-2"}}];
    // Target capture exists but requested definition is absent.
    const absentDefinition = val(createCorpus(input([capture(missingDefinition,"m"),capture(absent,"a")],one))).snapshot.references[0];
    expect(absentDefinition).toMatchObject(unresolved("target-id-mismatch"));
  });

  it("enforces stale, alias, compatibility and limits without freezing inputs", () => {
    const a = analyze(`${declaration("WP-1")}\n\n${reference("REQ-1","implements")}`,"same.md"), changed = analyze(`${declaration("WP-1")}\n\n${reference("REQ-1","references")}`,"same.md");
    const stale = { ...capture(a,"a"), expected: { analysisId:a.snapshot.analysisId, source:{...a.snapshot.source,sha256:"0".repeat(64)} } };
    expect(errorCode(createCorpus(input([stale])))).toBe("stale-capture");
    expect(errorCode(createCorpus(input([capture(a,"same"),capture(changed,"same")])))).toBe("invalid-input");
    const otherProfileInput = structuredClone(profileInput); otherProfileInput.interpretation.entityKinds[0].prefixes.push("ZZ");
    const otherProfile = compileProfile(otherProfileInput); if (!otherProfile.ok) throw new Error("alternate profile failed");
    expect(errorCode(createCorpus(input([capture(a,"a"),capture(analyze(declaration("WP-2"),"b.md",otherProfile.value),"b")])))).toBe("incompatible-capture");
    expect(createCorpus(input([capture(a,"a")],[],{maxCaptures:0})).ok).toBe(false);
    expect(errorCode(createCorpus(input([capture(a,"a"),capture(a,"b")],[],{maxCaptures:1})))).toBe("corpus-limit");
    expect(errorCode(createCorpus(input([capture(a,"a")],[],{maxSourceUtf8Bytes:1})))).toBe("corpus-limit");
    const forged = JSON.parse(JSON.stringify(a)) as DocumentAnalysis;
    expect(errorCode(createCorpus(input([capture(forged,"forged")])))).toBe("invalid-input");
    const badBinding = {source:{analysisId:a.snapshot.analysisId,occurrenceId:"O1"},target:{analysisId:a.snapshot.analysisId,identifier:"REQ-1"}};
    expect(errorCode(createCorpus(input([capture(a,"a")],[badBinding])))).toBe("invalid-input");
    expect(Object.isFrozen(stale)).toBe(false);
    const validCapture = capture(a,"mutable-pin"), validBinding = {source:{analysisId:a.snapshot.analysisId,occurrenceId:"O2"},target:{analysisId:a.snapshot.analysisId,identifier:"REQ-1"}};
    createCorpus(input([validCapture],[validBinding]));
    expect(Object.isFrozen(validCapture.expected)).toBe(false);
    expect(Object.isFrozen(validCapture.expected.source)).toBe(false);
    expect(Object.isFrozen(validBinding)).toBe(false);
    expect(Object.isFrozen(validBinding.target)).toBe(false);
  });

  it("rejects malformed own properties before limits, including hidden, symbol and accessor keys", () => {
    const a = analyze(`# ${declaration("WP-1")}\n\n${reference("REQ-1","implements")}`,"shape.md");
    const valid = capture(a,"shape"), hugeLimits = input([valid],[],{maxCaptures:1});
    const extra = {...valid, unexpected:true};
    expect(errorCode(createCorpus({...hugeLimits,captures:[extra,valid]}))).toBe("invalid-input");
    const hidden = {...valid}; Object.defineProperty(hidden,"hidden",{value:true,enumerable:false});
    expect(errorCode(createCorpus(input([hidden],[],{maxCaptures:1})))).toBe("invalid-input");
    const symbol = {...valid,[Symbol("extra")]:true};
    expect(errorCode(createCorpus(input([symbol],[],{maxCaptures:1})))).toBe("invalid-input");
    let getterRan = false;
    const accessor = Object.defineProperty({...valid},"alias",{get(){getterRan=true;return "shape";}});
    expect(errorCode(createCorpus(input([accessor],[],{maxCaptures:1})))).toBe("invalid-input");
    expect(getterRan).toBe(false);
    const newlinePin = {...valid,expected:{...valid.expected,analysisId:`${valid.expected.analysisId}\n`}};
    expect(errorCode(createCorpus(input([newlinePin],[],{maxCaptures:1})))).toBe("invalid-input");
    const stalePin = {...valid,expected:{...valid.expected,source:{...valid.expected.source,sha256:"0".repeat(64)}}};
    expect(errorCode(createCorpus(input([stalePin,extra],[],{maxCaptures:1})))).toBe("invalid-input");
    expect(errorCode(createCorpus(input([stalePin],[],{maxCaptures:1})))).toBe("stale-capture");
    const binding = {source:{analysisId:a.snapshot.analysisId,occurrenceId:"O2"},target:{analysisId:a.snapshot.analysisId,identifier:"REQ-1"}};
    const newlineBinding = {...binding,target:{...binding.target,identifier:"REQ-1\n"}};
    expect(errorCode(createCorpus(input([valid],[newlineBinding],{maxBindings:0})))).toBe("invalid-input");
    expect(Object.isFrozen(valid)).toBe(false);
    expect(Object.isFrozen(valid.expected)).toBe(false);
    expect(Object.isFrozen(binding)).toBe(false);
  });
});
