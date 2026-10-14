import { readFile } from "node:fs/promises";
import type { ExplorerAssets } from "./export.js";

export async function loadExplorerAssets(): Promise<ExplorerAssets> {
  const [script, style, worker] = await Promise.all(["app.js", "app.css", "worker.js"].map(name =>
    readFile(new URL(`./assets/${name}`, import.meta.url), "utf8")));
  return { script, style, worker };
}
