import type { ViewerPayload } from "./contracts.js";

export interface ExplorerAssets { script: string; style: string; worker: string }
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

/** A portable read-only document. Source strings never become markup or executable code. */
export function exportExplorer(payload: ViewerPayload, assets: ExplorerAssets): string {
  const { graph, validation } = payload;
  const definitions = payload.entities.map(entity => `<article><h3>${escape(entity.id)} · ${escape(entity.label)}</h3>
<p>Definition: ${escape(entity.definition.status)}</p>${entity.evidence.map(item => `<p>Definition at line ${item.range.start.line}; <a href="#captured-source">read captured source</a>.</p>`).join("")}</article>`).join("");
  const findings = [...graph.diagnostics, ...validation.diagnostics].map(item => `<li>${escape(item.code)}: ${escape(item.message)}</li>`).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; worker-src blob:; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'">
<title>${escape(payload.title)} · Trace explorer</title><style>${assets.style.replace(/<\/style/gi, "<\\/style")}</style></head>
<body><div id="explorer"><p>Opening interactive explorer… Captured evidence is available below.</p></div>
<section class="provenance"><h2>Source and Trace checks</h2><p>Trace validation: ${escape(validation.status)} · ${validation.diagnostics.length} findings · capture ${graph.coverage}. These are document checks, not implementation verification.</p>
<dl><dt>Document</dt><dd>${escape(graph.source.documentId)}</dd><dt>Source SHA-256</dt><dd>${escape(graph.source.sha256)}</dd>
<dt>Profile</dt><dd>${escape(validation.profileId)}</dd><dt>Analysis</dt><dd>${escape(graph.analysisId)}</dd>
<dt>Runtime</dt><dd>Trace ${escape(graph.analyzerVersion)} · Engine ${escape(graph.parserVersion)}</dd></dl>
${findings ? `<ul>${findings}</ul>` : "<p>No captured findings.</p>"}
${graph.exclusions.length ? `<details><summary>${graph.exclusions.length} capture exclusions</summary><ul>${graph.exclusions.map(item => `<li>Line ${item.range.start.line}: ${escape(item.reason)}</li>`).join("")}</ul></details>` : ""}</section>
<details class="fallback"><summary>Captured evidence / readable fallback · ${payload.entities.length} entities</summary>${definitions}
<details><summary>All relationship occurrences · ${payload.relations.length}</summary>${payload.relations.map(r => `<article><p>${escape(r.source.status === "owned" ? r.source.identifier : r.source.status + " source")} → ${escape(r.kind)} → ${escape(r.target)} · line ${r.range.start.line}</p></article>`).join("")}</details>
<h3 id="captured-source">Captured source</h3><pre>${escape(payload.sourceText)}</pre>
</details><noscript><p>JavaScript is disabled. Open captured evidence above to read the source.</p></noscript>
<script type="application/json" id="trace-payload">${json(payload)}</script>
<script type="application/json" id="trace-worker">${json(assets.worker)}</script>
<script>${assets.script.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
}
