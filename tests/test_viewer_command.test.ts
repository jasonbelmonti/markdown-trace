import { readFileSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, expect, it, vi } from "vitest";
import { runDocumentCommand } from "../src/markdowntrace/document-graph/command.js";
import { loadExplorerAssets } from "../src/markdowntrace/document-graph/viewer/assets.js";

vi.mock("../src/markdowntrace/document-graph/viewer/assets.js", () => ({ loadExplorerAssets: vi.fn() }));
beforeEach(() => {
  vi.mocked(loadExplorerAssets).mockReset().mockResolvedValue({ script: "/* test client */", style: "body{}", worker: "/* test worker */" });
});
const profilePath = "examples/preview-design/profile.json";
const original = readFileSync("examples/preview-design/document.md", "utf8");

it.each([false, true])("writes explorer evidence and preserves validation exit behavior (invalid=%s)", async invalid => {
  const directory = await mkdtemp(join(tmpdir(), "trace-explorer-"));
  try {
    const file = join(directory, "design.md");
    await writeFile(file, invalid ? original.replace("[the preview requirement](ctx://trace/entity/REQ-1?rel=verifies)", "the requirement") : original);
    let stdout = "", stderr = "";
    const exit = await runDocumentCommand(["--file", file, "--profile", profilePath, "--format", "explorer"], {
      stdout: text => { stdout += text; }, stderr: text => { stderr += text; },
    });
    expect(exit).toBe(invalid ? 1 : 0);
    expect(stderr).toBe("");
    const data = JSON.parse(stdout.match(/id="trace-payload">([^]*?)<\/script>/)![1]);
    expect(data.validation.valid).toBe(!invalid);
    expect(data.graph.source.documentId).toBe(file);
    expect(data.entities.some((n: { label: string }) => n.label === "Selection handler")).toBe(true);
    expect(loadExplorerAssets).toHaveBeenCalledOnce();
  } finally { vi.clearAllMocks(); await rm(directory, { recursive: true, force: true }); }
});

it("reports missing assets before emitting partial HTML", async () => {
  vi.mocked(loadExplorerAssets).mockRejectedValue(new Error("Explorer assets unavailable"));
  let stdout = "", stderr = "";
  const exit = await runDocumentCommand(["--file", "examples/preview-design/document.md", "--profile", profilePath, "--format", "explorer"], {
    stdout: text => { stdout += text; }, stderr: text => { stderr += text; },
  });
  expect(exit).toBe(2); expect(stdout).toBe("");
  expect(JSON.parse(stderr).message).toBe("Explorer assets unavailable");
});
