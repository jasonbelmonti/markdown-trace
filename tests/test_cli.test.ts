import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { main } from "../src/markdowntrace/cli.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = "fixtures/r0-document-local-registry/entity-registry.yaml";
const documentPath = "fixtures/r0-document-local-registry/execution-spec.md";
const evidencePath = path.join(repoRoot, "docs/evidence/valid-fixture-report.md");

describe("markdown-trace CLI", () => {
  it("writes the deterministic EVD-2 report for the valid fixture", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-cli-"));

    try {
      const reportPath = path.join(temporaryDirectory, "valid-fixture-report.md");
      const stdout: string[] = [];
      const stderr: string[] = [];
      const exitCode = await main(
        [
          "validate",
          "--registry",
          registryPath,
          "--document",
          documentPath,
          "--report",
          reportPath,
        ],
        {
          cwd: repoRoot,
          stdout: (text) => stdout.push(text),
          stderr: (text) => stderr.push(text),
        },
      );
      const expectedReport = await readFile(evidencePath, "utf8");

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(stdout.join("")).toBe(expectedReport);
      expect(await readFile(reportPath, "utf8")).toBe(expectedReport);
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it("returns an operator error for incomplete arguments", async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const exitCode = await main(["validate", "--registry", registryPath], {
      cwd: repoRoot,
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text),
    });

    expect(exitCode).toBe(2);
    expect(stdout).toEqual([]);
    expect(stderr.join("")).toContain("Usage: markdown-trace validate");
  });
});
