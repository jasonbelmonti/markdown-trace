import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Background, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, ReactFlowProvider,
  useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import type { ViewerEntity, ViewSelection } from "../contracts.js";
import { gridPositions, startLayout } from "./layout.js";
import { createElkWorker } from "./elk-layout.js";

type EntityNode = Node<{ entity: ViewerEntity; inspected: boolean; root: boolean; compact: boolean }, "entity">;
const EntityCard = memo(function EntityCard({ data }: NodeProps<EntityNode>) {
  return <div style={{ width: data.compact ? 180 : 238 }} className={`entity-node kind-${data.entity.kind} ${data.inspected ? "inspected" : ""} ${data.root ? "root-node" : ""}`}>
    <Handle type="target" position={data.compact ? Position.Top : Position.Left} isConnectable={false} />
    <div className="node-id">{data.entity.id}<span>{data.entity.kind ?? "unknown"}</span></div>
    <div className="node-label" title={data.entity.label}>{data.entity.label}</div>
    <div className="node-foot">{data.root ? "FOCUS" : data.entity.sourceSelected ? "SOURCE: SELECTED" : data.entity.definition.status !== "resolved" ? data.entity.definition.status.toUpperCase() : ""}</div>
    <Handle type="source" position={data.compact ? Position.Bottom : Position.Right} isConnectable={false} />
  </div>;
});
const nodeTypes = { entity: EntityCard };

function Canvas({ selection, root, inspected, workerSource, inspect, inspectEdge }: {
  selection: ViewSelection; root: string | null; inspected: string | null; workerSource: string;
  inspect(id: string): void; inspectEdge(id: string): void;
}) {
  const { fitView } = useReactFlow();
  const container = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(window.innerWidth < 650);
  const [layout, setLayout] = useState({ selection, compact, positions: gridPositions(selection), state: "Arranging graph…" });
  const current = layout.selection === selection && layout.compact === compact;
  const positions = current ? layout.positions : gridPositions(selection);
  useEffect(() => startLayout(selection, () => createElkWorker(workerSource, compact),
    (next, failed) => setLayout({ selection, compact, positions: next, state: failed ? "Grid layout · automatic layout unavailable" : "Graph arranged" })), [selection, workerSource, compact]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => { void fitView({ padding: 0.18, maxZoom: 1 }); });
    return () => cancelAnimationFrame(frame);
  }, [layout, fitView]);
  useEffect(() => {
    let frame = 0;
    const observer = new ResizeObserver(entries => {
      setCompact(entries[0].contentRect.width < 560);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { void fitView({ padding: 0.18, maxZoom: 1 }); });
    });
    if (container.current) observer.observe(container.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [fitView]);
  const nodes = useMemo<EntityNode[]>(() => selection.nodes.map(entity => ({ id: entity.id, type: "entity",
    position: positions[entity.id] ?? { x: 0, y: 0 }, data: { entity, inspected: entity.id === inspected, root: entity.id === root, compact },
    ariaLabel: `${entity.id}: ${entity.label}`, width: compact ? 180 : 238, height: 104 })), [selection, positions, inspected, root, compact]);
  const edges = useMemo(() => selection.edges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target,
    label: edge.kind + (edge.occurrences.length > 1 ? ` ×${edge.occurrences.length}` : ""),
    markerEnd: { type: MarkerType.ArrowClosed }, type: "default", interactionWidth: 24 })), [selection]);
  return <div className="canvas-wrap" ref={container}>
    <div className="layout-state" role="status">{current ? layout.state : "Arranging graph…"}</div>
    {nodes.length ? <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.08} maxZoom={2}
      nodesDraggable={false} nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null}
      onNodeClick={(_, node) => inspect(node.id)} onEdgeClick={(_, edge) => inspectEdge(edge.id)}
      colorMode="dark" attributionPosition="bottom-right">
      <Background gap={22} size={1} /><Controls showInteractive={false} /><MiniMap pannable zoomable />
    </ReactFlow> : <div className="empty">No entities match this view. Choose another focus or loosen the filters.</div>}
  </div>;
}
export function Graph(props: Parameters<typeof Canvas>[0]) {
  return <ReactFlowProvider><Canvas {...props} /></ReactFlowProvider>;
}
