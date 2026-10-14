import type { ViewerPayload, ViewOptions } from "../contracts.js";

export type Lens = "Explore" | "Options" | "Risks" | "Delivery checks";
export const lenses: Lens[] = ["Explore", "Options", "Risks", "Delivery checks"];
export function inLens(kind: string | null, lens: Lens): boolean {
  if (lens === "Options") return kind === "option";
  if (lens === "Risks") return kind === "risk";
  if (lens === "Delivery checks") return ["validation", "check", "question", "open-question"].includes(kind ?? "");
  return true;
}
export function Filters({ payload, options, change }: {
  payload: ViewerPayload; options: ViewOptions; change(next: Partial<ViewOptions>): void;
}) {
  return <details className="filters" open><summary>View filters</summary>
    <div className="filter-grid">
      <label>Direction<select value={options.direction} onChange={e => change({ direction: e.target.value as ViewOptions["direction"] })}>
        <option value="both">Both directions</option><option value="incoming">Incoming references</option><option value="outgoing">Outgoing references</option>
      </select></label>
      <label>Depth<select value={options.depth} onChange={e => change({ depth: Number(e.target.value) })}>
        {[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? "hop" : "hops"}</option>)}
      </select></label>
      <label>Node budget<select value={options.maxNodes} onChange={e => change({ maxNodes: Number(e.target.value) })}>
        {[20, 40, 60, 100].map(n => <option key={n} value={n}>{n}</option>)}
      </select></label>
    </div>
    <label className="check"><input type="checkbox" checked={options.headings} onChange={e => change({ headings: e.target.checked })} />Include heading nodes</label>
    <KindFilters title="Entity kinds" values={[...new Set(payload.entities.map(n => n.kind ?? "unknown"))]}
      selected={options.kinds} onChange={kinds => change({ kinds })} />
    <KindFilters title="Relationship kinds" values={[...new Set(payload.relations.map(r => r.kind))]}
      selected={options.relations} onChange={relations => change({ relations })} />
    <p className="muted small">Filters stop traversal. The focus remains visible. Arrows retain their source direction.</p>
  </details>;
}
function KindFilters({ title, values, selected, onChange }: {
  title: string; values: string[]; selected: readonly string[] | null; onChange(values: string[] | null): void;
}) {
  return <details><summary>{title}{selected ? ` · ${selected.length} enabled` : " · all"}</summary>
    <div className="toggle-actions"><button onClick={() => onChange(null)}>All</button><button onClick={() => onChange([])}>None</button></div>
    {values.map(value => <label className="check" key={value}><input type="checkbox" checked={!selected || selected.includes(value)}
      onChange={e => onChange(e.target.checked ? [...(selected ?? values), value] : (selected ?? values).filter(v => v !== value))} />{value}</label>)}
  </details>;
}
