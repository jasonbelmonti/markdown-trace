import { link, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runDocumentCommand } from "../src/markdowntrace/document-graph/command.js";

const file = resolve("examples/preview-design/document.md");
const profile = resolve("examples/preview-design/profile.json");
let temporary: string;
beforeAll(async () => { temporary = await mkdtemp(join(tmpdir(), "trace-text-report-")); });
afterAll(async () => { await rm(temporary, { recursive: true, force: true }); });

async function run(flags: string[]) {
  let stdout = "", stderr = "";
  const exitCode = await runDocumentCommand([
    "--file", file, "--profile", profile, "--format", "context-text", "--root", "REQ-1",
    "--max-depth", "0", "--max-nodes", "1", "--max-utf8-bytes", "10000", "--max-fragments", "100", ...flags,
  ], { stdout: text => { stdout += text; }, stderr: text => { stderr += text; } });
  return { exitCode, stdout, stderr };
}

describe("context-text report publication", () => {
  it("rejects existing files and source aliases without changing their bytes or emitting text", async () => {
    const copy = join(temporary, "input.md"), hardlink = join(temporary, "hardlink.md");
    const symbolic = join(temporary, "symbolic.md"), existing = join(temporary, "existing.json");
    await writeFile(copy, await readFile(file));
    await link(copy, hardlink);
    await symlink(file, symbolic);
    await writeFile(existing, "preserve prior report\n");
    for (const report of [file, profile, copy, hardlink, symbolic, existing]) {
      const before = await readFile(report);
      const result = await run(["--report-file", report]);
      expect(result.exitCode).toBe(2);
      expect(result.stdout).toBe("");
      expect(JSON.parse(result.stderr).code).toBe("EEXIST");
      expect(await readFile(report)).toEqual(before);
    }
  });

  it("reports a failed write before emitting a successful text view", async () => {
    const result = await run(["--report-file", join(temporary, "absent-parent", "report.json")]);
    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(JSON.parse(result.stderr).code).toBe("ENOENT");
  });

  it.each([
    [], ["--report-file", ""], ["--report-file", "  "],
    ["--report-file", "unused.json", "--format", "context"],
    ["--report-file", "unused.json", "--format", "report"],
    ["--report-file", "unused.json", "--identifier", "REQ-1"],
  ])("rejects a missing or misplaced report option: %j", async (...flags) => {
    const result = await run(flags);
    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(JSON.parse(result.stderr).message).toMatch(/requires|require/);
  });
});
