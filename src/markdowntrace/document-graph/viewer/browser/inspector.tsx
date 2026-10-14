import { useState } from "react";
import type { ViewerPayload, ViewSelection } from "../contracts.js";
import { sourceEvidence } from "../evidence.js";

export function Inspector({ payload, id, selection, focus, inspect, relationId }: {
  payload: ViewerPayload; id: string | null; selection: ViewSelection; relationId: string | null;
  focus(id: string): void; inspect(id: string): void;
}) {
  const entity = payload.entities.find(node => node.id === id);
  const [page, setPage] = useState({ id, count: 30 });
  const count = page.id === id ? page.count : 30;
  const references = payload.relations.filter(r => r.target === id || (r.source.status === "owned" && r.source.identifier === id));
  const boundary = new Map(selection.boundary.map(item => [item.relationId, item.reason]));
  const activeRelation = payload.relations.find(r => r.id === relationId);
  if (!entity) return <aside className="inspector"><h2>Source inspector</h2><p>Select an entity to inspect its definition and references.</p></aside>;
  return <aside className="inspector" aria-label="Source inspector">
    <div className="eyebrow">SOURCE INSPECTOR · {entity.id}</div>
    <h2>{entity.label}</h2>
    <div className="tags"><span>{entity.kind ?? "unknown kind"}</span><span>Definition: {entity.definition.status}</span>
      {entity.sourceSelected ? <span>Source status: Selected</span> : null}</div>
    <button className="primary" onClick={() => focus(entity.id)}>Focus this neighborhood</button>
    {!selection.nodes.some(n => n.id === entity.id) ? <p className="notice">This entity is outside the current graph. Its source evidence remains available.</p> : null}
    {activeRelation ? <section className="relation-detail"><h3>Selected relationship</h3><p>{activeRelation.kind} · line {activeRelation.range.start.line}</p><pre>{sourceEvidence(payload, activeRelation.fragmentId).excerpt}</pre></section> : null}
    <h3>Definition evidence</h3>
    {entity.evidence.length ? entity.evidence.map(evidence => {
      const source = sourceEvidence(payload, evidence.fragmentId);
      return <section key={evidence.occurrenceId}>
      <p className="muted small">Line {evidence.range.start.line} · occurrence {evidence.occurrenceId}</p>
      {source.fields.length ? <dl>{source.fields.map((field, index) => <div key={index}><dt>{field.name}</dt><dd>{field.value}</dd></div>)}</dl> : null}
      <details><summary>Literal source</summary><pre>{source.excerpt}</pre></details>
    </section>; }) : <p className="notice">No captured definition. Check the document's Trace findings.</p>}
    <h3>References · {references.length}</h3>
    <p className="muted small">All direct occurrences, including those hidden by the view. Generic references make no mitigation or dependency claim.</p>
    <div className="reference-list">{references.slice(0, count).map(reference => {
      const from = reference.source.status === "owned" ? reference.source.identifier : null;
      const other = from === id ? reference.target : from;
      const node = payload.entities.find(n => n.id === other);
      return <details key={reference.id} className="reference"><summary>
        <span>{from === id ? "→" : "←"} {reference.kind} · {other ?? `${reference.source.status} source`}</span>
        <small>line {reference.range.start.line}{boundary.has(reference.id) ? ` · ${boundary.get(reference.id)}` : ""}</small>
      </summary>
        {node ? <button onClick={() => inspect(node.id)}>Inspect {node.id}: {node.label}</button> : <p>{reference.source.status} ownership</p>}
        <pre>{sourceEvidence(payload, reference.fragmentId).excerpt}</pre>
      </details>;
    })}</div>
    {count < references.length ? <button onClick={() => setPage({ id, count: count + 30 })}>Show more references ({references.length - count} remaining)</button> : null}
  </aside>;
}
