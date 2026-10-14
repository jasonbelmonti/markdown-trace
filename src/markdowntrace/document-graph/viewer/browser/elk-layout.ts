import ELK from "elkjs/lib/elk-api.js";
import type { LayoutWorker } from "./layout.js";

/** Use ELK's public worker API: its bundled synchronous constructor cannot run inside another worker. */
export function createElkWorker(source: string, compact: boolean): { worker: LayoutWorker; release(): void } {
  const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  let native: Worker | undefined;
  try {
    native = new Worker(url);
    const elk = new ELK({ algorithms: ["layered"], workerFactory: () => native! });
    const worker: LayoutWorker = {
      onmessage: null, onerror: null,
      terminate: () => elk.terminateWorker(),
      postMessage: input => {
        void elk.layout({ id: "root", layoutOptions: { "elk.algorithm": "layered", "elk.direction": compact ? "DOWN" : "RIGHT",
          "elk.spacing.nodeNode": compact ? "25" : "45", "elk.layered.spacing.nodeNodeBetweenLayers": compact ? "65" : "110" },
          children: input.nodes.map(node => ({ id: node.id, width: compact ? 180 : 238, height: 104 })),
          edges: input.edges.map(edge => ({ id: edge.id, sources: [edge.source], targets: [edge.target] })),
        }).then(graph => worker.onmessage?.({ data: { positions: Object.fromEntries((graph.children ?? []).map(node =>
          [node.id, { x: node.x ?? NaN, y: node.y ?? NaN }])) } }),
        () => worker.onmessage?.({ data: { error: "Layout unavailable" } }));
      },
    };
    native.onerror = event => worker.onerror?.(event);
    return { worker, release: () => URL.revokeObjectURL(url) };
  } catch (error) { native?.terminate(); URL.revokeObjectURL(url); throw error; }
}
