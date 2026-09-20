import type { DocumentAnalysis } from "../contracts/analysis.js";
import type { GraphValidationReport } from "../contracts/validation.js";
import { reportClient } from "./html-client.js";
import { reportStyle } from "./html-style.js";
import { renderMermaid } from "./mermaid.js";
import { presentation } from "./presentation.js";

const escape = (value: string | number) => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]!);

/** Internal CLI presentation; data stays literal, and all graph facts are retained. */
export function exportHtml(analysis: DocumentAnalysis, validation: GraphValidationReport): string {
  const snapshot = analysis.snapshot;
  if (validation.analysisId !== snapshot.analysisId)
    throw new Error("HTML report and graph must describe the same analysis.");
  const view = presentation(analysis);
  const labels = new Map(view.entities.map(entity => [entity.record.identifier,
    entity.label.length > 72 ? entity.label.slice(0, 69) + "…" : entity.label]));
  const diagram = snapshot.identifiers.length
    ? renderMermaid(snapshot, { direction: "TD", labels }) : null;
  const verdict = { pass: "Trace checks passed", fail: "Trace checks failed", indeterminate: "Trace checks indeterminate" }[validation.status];
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(view.title)} — Trace report</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Fira+Code:wght@400;500&amp;display=swap" referrerpolicy="no-referrer">
<style>${reportStyle}</style></head><body>
<header><div class="eyebrow">Markdown Trace / Document map</div><h1>${escape(view.title)}</h1>
<p class="subtle">Explore the document's identities, follow their connections, and inspect what its profile requires.</p>
<div class="summary"><span class="badge ${validation.status}">${verdict}</span>
<span class="count">${snapshot.identifiers.length} identities · ${snapshot.relationships.length} relationships · ${validation.diagnostics.length} findings</span>
<span class="count">Extraction: ${snapshot.coverage}</span></div></header>
<main><div class="layout"><section class="panel diagram-shell" aria-labelledby="graph-title">
<div class="panel-header"><h2 id="graph-title">Relationships</h2><small>Read arrows from source to target</small></div>
<p class="diagram-shell__hint">Drag to pan. Ctrl/Cmd + scroll to zoom. Use Fit to reset or Expand for the full diagram.</p>
<div class="mermaid-wrap"><div class="zoom-controls">
${[["zoom-in", "+", "Zoom in"], ["zoom-out", "−", "Zoom out"], ["zoom-fit", "Fit", "Fit diagram"],
    ["zoom-one", "1:1", "Actual size"], ["zoom-expand", "Expand", "Open full diagram"], ["download", "SVG", "Download SVG"]]
    .map(([action, label, title]) => `<button type="button" data-action="${action}" title="${title}" aria-label="${title}" disabled>${label}</button>`).join("")}
<span class="zoom-label">—</span></div><div class="mermaid-viewport"><div class="mermaid mermaid-canvas"></div></div></div>
<p class="render-status" role="status">Loading the diagram requires JavaScript and an internet connection to Mermaid's CDN. Entity details and findings are available without it.</p>
</section><section class="panel" aria-labelledby="entities-title"><h2 id="entities-title">Entity key</h2>
<label for="entity-search" class="subtle">Find an identity or phrase</label><input id="entity-search" type="search" placeholder="Search entities…">
<div class="entity-list">${view.entities.map(entityCard).join("") || "<p>No identities recognized.</p>"}</div></section></div>
<section class="panel validation ${validation.status}" aria-labelledby="validation-title">
<div class="panel-header"><h2 id="validation-title">Validation findings</h2><span class="badge ${validation.status}">${verdict}</span></div>
<p class="subtle">Profile: ${escape(validation.profileId)}. ${snapshot.exclusions.length} excluded source ranges; ${snapshot.diagnostics.length} extraction diagnostics. These checks do not certify the meaning or truth of the document.</p>
${validation.diagnostics.length ? `<ol class="findings">${validation.diagnostics.map(item => `<li>
<strong>${escape(item.ruleId)}</strong>${item.line ? ` <span class="count">line ${item.line}:${item.column ?? 1}</span>` : ""}
<p>${escape(item.message)}</p><code>${escape(item.code)}</code></li>`).join("")}</ol>`
    : "<p>No Trace findings. Semantic review remains part of the document's authoring workflow.</p>"}
<details><summary>Inspect ${validation.rules.length} evaluated rules</summary><ul class="rule-list">
${validation.rules.map(rule => `<li><strong>${escape(rule.id)}</strong><br>${escape(rule.status)} · ${rule.selected} selected · ${rule.evaluated} evaluated</li>`).join("")}</ul></details>
</section></main><footer><p>Source: ${escape(snapshot.source.documentId)}<br>SHA-256: <code>${snapshot.source.sha256}</code></p>
<p>Static report from the captured document. Shortened graph labels have full text in the entity key. Changes to the source require a new export.</p></footer>
<script type="application/json" id="trace-diagram">${JSON.stringify(diagram).replace(/</g, "\\u003c")}</script>
<script type="module">${reportClient}</script></body></html>\n`;
}

function entityCard(entity: ReturnType<typeof presentation>["entities"][number]): string {
  const id = entity.record.identifier;
  return `<article class="entity" id="entity-${escape(id)}"><code>${escape(id)}</code>
<h3>${escape(entity.label)}</h3><p class="entity-meta">${escape(entity.record.entityKind ?? "Unknown kind")} · ${escape(entity.record.definition.status)} · ${entity.incoming} incoming · ${entity.outgoing.length} outgoing</p>
${entity.details.map(detail => `<details><summary>Definition at line ${detail.line}</summary><p>${escape(detail.context || detail.label)}</p></details>`).join("")}
${entity.outgoing.length ? `<ul class="outgoing">${entity.outgoing.map(({ relationship }) => `<li>${escape(relationship.kind)} → <a href="#entity-${escape(relationship.target)}">${escape(relationship.target)}</a></li>`).join("")}</ul>` : ""}</article>`;
}
