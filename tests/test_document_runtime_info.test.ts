import { describe, expect, it } from "vitest";
import { runDocumentCommand } from "../src/markdowntrace/document-graph/command.js";

async function run(args: string[]) {
  let stdout = "", stderr = "";
  const exit = await runDocumentCommand(args, {
    stdout: text => { stdout += text; }, stderr: text => { stderr += text; },
  });
  return { exit, stdout, stderr };
}

describe("standalone document runtime identity", () => {
  it("reports development provenance and every C-3 field without document inputs", async () => {
    const result = await run(["--runtime-info"]);
    expect(result.exit).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toEqual({
      schemaVersion: "markdown-trace.runtime-info.v1",
      package: "@jasonbelmonti/markdown-trace", packageVersion: "0.1.1",
      sourceCommit: null, markdownEngineVersion: "3.6.0",
      analyzerVersion: "0.1.0-experimental.3", languageVersion: "markdown-trace.identity.draft2",
      validationProfileVersion: "markdown-trace.validation-profile.experimental.v1",
      graphVersion: "markdown-trace.document-graph.v1",
      validationResultVersion: "markdown-trace.validation-result.experimental.v1",
      nodeVersion: process.version,
    });
  });
  it.each([
    ["--file", "/does-not-exist.md"], ["--profile", "/does-not-exist.json"],
    ["--format", "report"], ["--identifier", "REQ-1"], ["--direction", "incoming"],
    ["--offset", "0"], ["--limit", "1"], ["--help"], ["--runtime-info"],
  ])("rejects mixed %s before reading any input", async (...extra) => {
    for (const args of [["--runtime-info", ...extra], [...extra, "--runtime-info"]]) {
      const result = await run(args);
      expect(result.exit).toBe(2);
      expect(result.stdout).toBe("");
      expect(JSON.parse(result.stderr).message).toBe("--runtime-info must be used alone.");
    }
  });
});
