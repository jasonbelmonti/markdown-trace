import { readFileSync } from "node:fs";
import * as engine from "@jasonbelmonti/markdown-engine";
import { afterEach, expect, it, vi } from "vitest";
import { analyzeDocument, compileValidationProfile, validateGraph, type Outcome } from "../src/markdowntrace/document-graph/index.js";
import { viewerPayload } from "../src/markdowntrace/document-graph/viewer/payload.js";
import { explicitlySelected } from "../src/markdowntrace/document-graph/viewer/metadata.js";
import { sourceEvidence } from "../src/markdowntrace/document-graph/viewer/evidence.js";

vi.mock("@jasonbelmonti/markdown-engine", async original => {
  const actual = await original<typeof engine>();
  return { ...actual, parse: vi.fn(actual.parse), normalize: vi.fn(actual.normalize) };
});
afterEach(() => vi.clearAllMocks());
const value = <T>(outcome: Outcome<T>): T => {
  if (!outcome.ok) throw new Error(outcome.error.message);
  return outcome.value;
};
const profile = value(compileValidationProfile(JSON.stringify({
  schemaVersion: "markdown-trace.validation-profile.experimental.v1", profileId: "viewer-test",
  interpretation: { language: "markdown-trace.identity.draft2", entityKinds: [
    { name: "option", prefixes: ["OPT"] }, { name: "risk", prefixes: ["RISK"] }, { name: "context", prefixes: ["CTX"] },
  ] }, validation: { minEntities: 0, allowedRelations: [{ kind: "references", from: ["option", "risk", "context"], to: ["option", "risk", "context"] }], rules: [] },
})));
function prepare(text: string) {
  const analysis = value(analyzeDocument({ text, documentId: "viewer.md" }, profile,
    { maxOccurrences: 1000, maxSourceUtf8Bytes: 100_000 }));
  return { analysis, validation: value(validateGraph(analysis, profile)) };
}
const table = `# Example

## [Options](ctx://trace/entity/CTX-1?role=definition)

| ID | Option | Status | Evidence |
| --- | --- | --- | --- |
| [OPT-1](ctx://trace/entity/OPT-1?role=definition) | Durable records | Selected | [risk](ctx://trace/entity/RISK-1) |
| [OPT-2](ctx://trace/entity/OPT-2?role=definition) | Rebuild cache | Not selected | None |

- [**Write contention**][risk] can lose data.

[risk]: ctx://trace/entity/RISK-1?role=definition
`;

it("derives table names, exact evidence and explicit status from one Engine capture", () => {
  const { analysis, validation } = prepare(table), before = JSON.stringify(analysis.snapshot);
  const payload = viewerPayload(analysis, validation);
  const option = payload.entities.find(n => n.id === "OPT-1")!;
  expect(option.label).toBe("Durable records");
  expect(option.sourceSelected).toBe(true);
  const evidence = sourceEvidence(payload, option.evidence[0].fragmentId);
  expect(evidence.fields.map(f => [f.name, f.value])).toContainEqual(["Status", "Selected"]);
  expect(evidence.excerpt).toContain("| Durable records | Selected |");
  expect(payload.entities.find(n => n.id === "OPT-2")?.sourceSelected).toBe(false);
  expect(payload.entities.find(n => n.id === "RISK-1")?.label).toBe("Write contention");
  expect(payload.entities.find(n => n.id === "CTX-1")?.heading).toBe(true);
  expect(payload.relations[0].range).toEqual(analysis.snapshot.occurrences.find(o => o.id === payload.relations[0].occurrenceId)?.range);
  expect(JSON.stringify(analysis.snapshot)).toBe(before);
  expect(viewerPayload(analysis, validation)).toEqual(payload);
  expect(engine.parse).toHaveBeenCalledTimes(1);
  expect(engine.normalize).toHaveBeenCalledTimes(1);
});

it("keeps missing, duplicate, unowned and ambiguous facts inspectable", () => {
  const { analysis, validation } = prepare(`[unknown](ctx://trace/entity/OPT-9)

[one](ctx://trace/entity/OPT-1?role=definition) [two](ctx://trace/entity/OPT-2?role=definition) [risk](ctx://trace/entity/RISK-1)

[again](ctx://trace/entity/OPT-1?role=definition)
`);
  const p = viewerPayload(analysis, validation);
  expect(p.entities.find(n => n.id === "OPT-9")?.definition.status).toBe("missing");
  expect(p.entities.find(n => n.id === "OPT-1")?.evidence).toHaveLength(2);
  expect(p.entities.find(n => n.id === "OPT-1")?.sourceSelected).toBe(false);
  expect(p.relations.map(r => r.source.status)).toEqual(["unowned", "ambiguous"]);
});

it("does not infer source selection from prose, duplicate status fields or a stale report", () => {
  for (const fields of [[], [{ name: "Status", value: "recommended" }],
    [{ name: "Decision", value: "Selected" }], [{ name: "Status", value: "Selected" }, { name: "Status", value: "Rejected" }]])
    expect(explicitlySelected(fields)).toBe(false);
  const a = prepare(table), b = prepare(table + "\nchanged");
  expect(() => viewerPayload(a.analysis, b.validation)).toThrow("same analysis");
});

it("supports ordinary non-table documents without assuming design vocabulary", () => {
  const other = value(compileValidationProfile(readFileSync("examples/preview-design/profile.json", "utf8")));
  const a = value(analyzeDocument({ documentId: "example.md", text: readFileSync("examples/preview-design/document.md", "utf8") },
    other, { maxOccurrences: 1000, maxSourceUtf8Bytes: 100_000 }));
  expect(viewerPayload(a, value(validateGraph(a, other))).entities.find(n => n.id === "DES-1")?.label).toBe("Selection handler");
});

it("stores a highly referenced source fragment once instead of duplicating its text per edge", () => {
  const references = Array.from({ length: 100 }, () => "[risk](ctx://trace/entity/RISK-1)").join(" ");
  const text = `[option](ctx://trace/entity/OPT-1?role=definition) ${"long evidence ".repeat(600)} ${references}\n\n[risk](ctx://trace/entity/RISK-1?role=definition)`;
  const { analysis, validation } = prepare(text);
  const payload = viewerPayload(analysis, validation);
  expect(payload.relations).toHaveLength(100);
  expect(new Set(payload.relations.map(r => r.fragmentId)).size).toBe(1);
  expect(sourceEvidence(payload, payload.relations[0].fragmentId).excerpt).toContain("long evidence ".repeat(600));
  expect(JSON.stringify(payload).length).toBeLessThan(150_000);
});
