import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { analyzeDocument, compileValidationProfile, validateGraph, type Outcome } from "../src/markdowntrace/document-graph/index.js";
import { viewerPayload } from "../src/markdowntrace/document-graph/viewer/payload.js";
import { exportExplorer } from "../src/markdowntrace/document-graph/viewer/export.js";

const value = <T>(outcome: Outcome<T>) => { if (!outcome.ok) throw new Error(outcome.error.message); return outcome.value; };
const profile = value(compileValidationProfile(readFileSync("examples/preview-design/profile.json", "utf8")));

it("embeds literal hostile data safely and retains readable fallback evidence", () => {
  const attack = '</script><img src=x onerror="alert(1)">';
  const text = readFileSync("examples/preview-design/document.md", "utf8")
    .replace("# Local file preview", "# &lt;/script&gt;&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  const analysis = value(analyzeDocument({ text, documentId: attack }, profile, { maxSourceUtf8Bytes: 100_000, maxOccurrences: 1000 }));
  const payload = viewerPayload(analysis, value(validateGraph(analysis, profile)));
  const html = exportExplorer(payload, { script: "/* client */", style: "body{}", worker: "/* worker */" });
  expect(html).not.toContain(attack);
  const embedded = JSON.parse(html.match(/id="trace-payload">([^]*?)<\/script>/)![1]);
  expect(embedded).toEqual(payload);
  expect(embedded.graph.source.documentId).toBe(attack);
  expect(html).toContain("Captured evidence / readable fallback");
  expect(html).toContain("Selection handler");
  expect(html).toContain("All relationship occurrences");
  expect(html).not.toMatch(/<script[^>]+src=/);
  expect(html).toContain("connect-src 'none'");
  expect(html).toContain("not implementation verification");
});
