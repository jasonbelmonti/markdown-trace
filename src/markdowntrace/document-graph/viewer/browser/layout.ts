export interface LayoutInput {
  nodes: { id: string }[];
  edges: { id: string; source: string; target: string }[];
}
export type Positions = Record<string, { x: number; y: number }>;
export interface LayoutWorker {
  onmessage: ((event: { data: { positions?: Positions; error?: string } }) => void) | null;
  onerror: ((event: { preventDefault(): void }) => void) | null;
  postMessage(value: LayoutInput): void;
  terminate(): void;
}

export function gridPositions(input: LayoutInput): Positions {
  return Object.fromEntries(input.nodes.map((node, index) => [node.id, { x: index % 3 * 300, y: Math.floor(index / 3) * 150 }]));
}

/** Each request owns its worker. Cancellation terminates CPU work and ignores late messages. */
export function startLayout(input: LayoutInput, createWorker: () => { worker: LayoutWorker; release(): void },
  update: (positions: Positions, failed: boolean) => void, timeoutMs = 5000): () => void {
  let active = true;
  let owned: ReturnType<typeof createWorker> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const dispose = () => {
    if (!active) return;
    active = false; clearTimeout(timer); owned?.worker.terminate(); owned?.release();
  };
  const finish = (positions?: Positions) => {
    if (!active) return;
    const valid = positions && input.nodes.every(node => Number.isFinite(positions[node.id]?.x) && Number.isFinite(positions[node.id]?.y));
    dispose(); update(valid ? positions : gridPositions(input), !valid);
  };
  try {
    owned = createWorker();
    owned.worker.onmessage = event => finish(event.data.positions);
    owned.worker.onerror = event => { event.preventDefault(); finish(); };
    timer = setTimeout(() => finish(), timeoutMs);
    owned.worker.postMessage(input);
  } catch { finish(); }
  return dispose;
}
