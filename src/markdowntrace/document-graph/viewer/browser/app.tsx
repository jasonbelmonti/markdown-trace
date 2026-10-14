import { Component, useMemo, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";
import "./style.css";
import type { ViewerPayload, ViewOptions } from "../contracts.js";
import { DEFAULT_VIEW, selectView } from "../selection.js";
import { Filters, inLens, lenses, type Lens } from "./controls.js";
import { Graph } from "./graph.js";
import { Inspector } from "./inspector.js";

function App({ payload, workerSource }: { payload: ViewerPayload; workerSource: string }) {
  const chosen = payload.entities.filter(entity => entity.sourceSelected);
  const initial = chosen.length === 1 ? chosen[0] : payload.entities.find(n => !n.heading);
  const [lens, setLens] = useState<Lens>(chosen.length === 1 ? "Options" : "Explore");
  const [options, setOptions] = useState<ViewOptions>({ ...DEFAULT_VIEW, root: initial?.id ?? null,
    option: chosen.length === 1 ? initial!.id : null, depth: chosen.length === 1 ? 2 : 1 });
  const [inspected, setInspected] = useState<string | null>(initial?.id ?? null);
  const [relation, setRelation] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const selection = useMemo(() => selectView(lens !== "Explore" && !options.root
    ? { entities: [], relations: [] } : payload, options), [payload, options, lens]);
  const inspect = (id: string) => { setInspected(id); setRelation(null); };
  const change = (next: Partial<ViewOptions>) => setOptions(previous => ({ ...previous, ...next }));
  const focus = (id: string) => {
    const node = payload.entities.find(entity => entity.id === id);
    if (!inLens(node?.kind ?? null, lens)) setLens("Explore");
    change({ root: id, option: lens === "Options" && node?.kind === "option" ? id : null });
    inspect(id);
  };
  const switchLens = (next: Lens) => {
    const candidates = payload.entities.filter(node => inLens(node.kind, next) && !node.heading);
    const node = next === "Options" && chosen.length === 1 ? chosen[0] : candidates[0];
    setLens(next); setSearch(""); setOptions({ ...DEFAULT_VIEW, root: node?.id ?? null,
      option: next === "Options" ? node?.id ?? null : null, depth: next === "Options" ? 2 : 1 });
    setInspected(node?.id ?? null); setRelation(null);
  };
  const choices = payload.entities.filter(node => inLens(node.kind, lens)
    && `${node.id} ${node.label}`.toLowerCase().includes(search.toLowerCase()));
  const displayedOccurrences = selection.edges.reduce((total, edge) => total + edge.occurrences.length, 0);
  return <>
    <header className="masthead"><div className="eyebrow">MARKDOWN TRACE / EXPLORER</div><h1>{payload.title}</h1>
      <p>Follow one question through the design.</p>
      <div className="document-state"><span>Trace checks: {payload.validation.status}</span><span>Capture: {payload.graph.coverage}</span>
        <span>{payload.entities.length} entities · {payload.relations.length} relationship occurrences</span></div>
    </header>
    <nav className="lenses" aria-label="View presets">{lenses.map(item => <button key={item} aria-pressed={lens === item} onClick={() => switchLens(item)}>{item}</button>)}</nav>
    <main className="workspace">
      <aside className="sidebar"><h2>{lens === "Explore" ? "Choose a focus" : lens}</h2>
        <label>Find an entity<input type="search" value={search} placeholder="Search ID or name" onChange={e => setSearch(e.target.value)} /></label>
        <div className="entity-list" aria-label="Focus choices">{choices.slice(0, 100).map(node => <button key={node.id} className={options.root === node.id ? "active" : ""}
          aria-pressed={options.root === node.id} onClick={() => focus(node.id)}><span className="choice-id">{node.id}{node.sourceSelected ? " · selected in source" : ""}</span><span>{node.label}</span></button>)}</div>
        {!choices.length ? <p className="muted">No matching entities in this preset.</p> : null}
        {choices.length > 100 ? <p className="muted">Showing 100 of {choices.length}. Narrow the search.</p> : null}
        {lens === "Options" ? <><label className="check"><input type="checkbox" checked={options.option !== null} disabled={!options.root}
          onChange={e => change({ option: e.target.checked ? options.root : null })} />Hide other options</label>
          <p className="muted small">{chosen.length === 1 ? `Source selects ${chosen[0].id}.` : "No single selected option is established by an explicit Status field."} Choosing a focus changes only this view.</p></> : null}
        <Filters payload={payload} options={options} change={change} />
      </aside>
      <section className="graph-panel" aria-label="Relationship graph">
        <div className="view-summary"><div><div className="eyebrow">{options.root ? `NEIGHBORHOOD / ${options.root}` : "DOCUMENT OVERVIEW"}</div>
          <strong>{selection.nodes.length} / {payload.entities.length} entities</strong></div>
          <span>{selection.edges.length} drawn edges · {displayedOccurrences} / {payload.relations.length} occurrences</span></div>
        {lens === "Delivery checks" ? <p className="notice">Documented checks and open questions. This view does not assert that checks have run, establish readiness, or infer a delivery schedule.</p> : null}
        {lens === "Risks" ? <p className="view-hint">Inspect a risk's documented connections. A reference alone does not establish mitigation.</p> : null}
        <Graph selection={selection} root={options.root} inspected={inspected} workerSource={workerSource} inspect={inspect}
          inspectEdge={id => { setRelation(id); const edge = payload.relations.find(r => r.id === id); if (edge) setInspected(edge.target); }} />
        <div className="view-footer" role="status">{selection.boundary.length} boundary occurrences · {selection.depthLimit ? "More beyond this depth. " : ""}
          {selection.nodeLimit ? "Node budget reached. " : ""}{selection.edgeLimit ? "Edge budget reached. " : ""}
          Select a node for its source and all direct references.</div>
      </section>
      <Inspector payload={payload} id={inspected} selection={selection} relationId={relation} focus={focus} inspect={inspect} />
    </main>
  </>;
}

class ViewerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p className="notice">Interactive view unavailable. Open the captured evidence below.</p> : this.props.children; }
}
const payload = JSON.parse(document.getElementById("trace-payload")!.textContent!) as ViewerPayload;
const workerSource = JSON.parse(document.getElementById("trace-worker")!.textContent!) as string;
createRoot(document.getElementById("explorer")!).render(<ViewerBoundary><App payload={payload} workerSource={workerSource} /></ViewerBoundary>);
