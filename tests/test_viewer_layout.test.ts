import { afterEach, expect, it, vi } from "vitest";
import { startLayout, type LayoutWorker } from "../src/markdowntrace/document-graph/viewer/browser/layout.js";

const input = { nodes: [{ id: "one" }], edges: [] };
function worker() {
  const worker: LayoutWorker = { onmessage: null, onerror: null, postMessage: vi.fn(), terminate: vi.fn() };
  return { worker, release: vi.fn() };
}
afterEach(() => vi.useRealTimers());

it("terminates superseded work and ignores its late result", () => {
  const old = worker(), next = worker(), update = vi.fn();
  const cancel = startLayout(input, () => old, update);
  const stale = old.worker.onmessage!;
  cancel();
  startLayout(input, () => next, update);
  stale({ data: { positions: { one: { x: 999, y: 999 } } } });
  expect(update).not.toHaveBeenCalled();
  next.worker.onmessage!({ data: { positions: { one: { x: 10, y: 20 } } } });
  expect(update).toHaveBeenCalledExactlyOnceWith({ one: { x: 10, y: 20 } }, false);
  expect(old.worker.terminate).toHaveBeenCalled();
  expect(next.release).toHaveBeenCalledOnce();
});

it("bounds layout time, frees resources and returns a grid on failure", () => {
  vi.useFakeTimers();
  const owned = worker(), update = vi.fn();
  startLayout(input, () => owned, update, 20);
  vi.advanceTimersByTime(20);
  expect(update).toHaveBeenCalledExactlyOnceWith({ one: { x: 0, y: 0 } }, true);
  expect(owned.worker.terminate).toHaveBeenCalledOnce();
  expect(owned.release).toHaveBeenCalledOnce();
  startLayout(input, () => { throw new Error("workers disabled"); }, update);
  expect(update).toHaveBeenCalledTimes(2);
});

it("rejects incomplete or non-finite worker positions", () => {
  const owned = worker(), update = vi.fn();
  startLayout(input, () => owned, update);
  owned.worker.onmessage!({ data: { positions: { one: { x: NaN, y: 0 } } } });
  expect(update).toHaveBeenCalledExactlyOnceWith({ one: { x: 0, y: 0 } }, true);
});
