import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import { main } from "../src/markdowntrace/cli.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = "fixtures/r0-document-local-registry/entity-registry.yaml";
const documentPath = "fixtures/r0-document-local-registry/execution-spec.md";
const r1DocumentPath =
  "fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md";
const r1ProfilePath = "fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml";
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

  it("does not label sidecar validation input errors as R1 derivation surfaces", async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const exitCode = await main(
      [
        "validate",
        "--registry",
        "fixtures/r0-document-local-registry/missing-registry.yaml",
        "--document",
        documentPath,
      ],
      {
        cwd: repoRoot,
        stdout: (text) => stdout.push(text),
        stderr: (text) => stderr.push(text),
      },
    );

    expect(exitCode).toBe(2);
    expect(stdout).toEqual([]);
    expect(stderr.join("")).not.toContain("Failure surface:");
    expect(stderr.join("")).toContain("cannot be read");
  });

  it("derives a registry and graph from the fixture document", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-cli-"));

    try {
      const outputPath = path.join(temporaryDirectory, "derived-registry-graph.yaml");
      const stdout: string[] = [];
      const stderr: string[] = [];
      const exitCode = await main(
        [
          "derive",
          "--document",
          documentPath,
          "--namespace",
          "exec",
          "--output",
          outputPath,
        ],
        {
          cwd: repoRoot,
          stdout: (text) => stdout.push(text),
          stderr: (text) => stderr.push(text),
        },
      );
      const output = stdout.join("");
      const parsed = parse(output) as {
        diagnostics: unknown[];
        registry: {
          document: { path: string };
          entities: Array<{
            id: string;
            label: string;
            type: string;
            defines: { kind: string; text: string };
            expectedReferences: unknown;
          }>;
          edges: Array<{ from: string; relationship: string; to: string }>;
        };
        graph: {
          nodes: Array<{ id: string; label: string }>;
          edges: Array<{ source: string; target: string }>;
        };
      };

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(await readFile(outputPath, "utf8")).toBe(output);
      expect(parsed.diagnostics).toEqual([]);
      expect(parsed.registry.document.path).toBe(documentPath);
      expect(parsed.registry.entities).toContainEqual({
        id: "exec.wp.1",
        label: "WP-1",
        type: "work_package",
        defines: {
          kind: "heading",
          text: "### WP-1: Create fixture family, YAML registry shape, and test scaffolding",
        },
        expectedReferences: expect.any(Object),
      });
      expect(parsed.registry.edges).toContainEqual({
        from: "exec.wp.1",
        relationship: "references",
        to: "exec.con.2",
      });
      expect(parsed.graph.edges).toContainEqual({
        source: "exec.wp.1",
        target: "exec.con.2",
      });
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it("derives a profiled R1 registry and graph from ctx trace fixture links", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-cli-"));

    try {
      const outputPath = path.join(temporaryDirectory, "r1-derived-registry-graph.yaml");
      const stdout: string[] = [];
      const stderr: string[] = [];
      const exitCode = await main(
        [
          "derive",
          "--document",
          r1DocumentPath,
          "--type-profile",
          r1ProfilePath,
          "--output",
          outputPath,
        ],
        {
          cwd: repoRoot,
          stdout: (text) => stdout.push(text),
          stderr: (text) => stderr.push(text),
        },
      );
      const output = stdout.join("");
      const parsed = parse(output) as {
        diagnostics: unknown[];
        registry: {
          document: { fixtureFamily: string; path: string };
          entities: Array<{
            id: string;
            label: string;
            type: string;
            expectedReferences: { labels: string[]; ranges: unknown[] };
          }>;
        };
        graph: {
          edges: Array<{ source: string; target: string }>;
        };
      };

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(await readFile(outputPath, "utf8")).toBe(output);
      expect(parsed.diagnostics).toEqual([]);
      expect(parsed.registry.document).toMatchObject({
        fixtureFamily: "r1-link-backed-entity-syntax",
        path: r1DocumentPath,
      });
      expect(parsed.registry.entities.map((entity) => [entity.id, entity.label, entity.type]))
        .toEqual([
          ["exec.con.1", "CON-1", "constraint"],
          ["exec.wp.1", "WP-1", "work_package"],
        ]);
      expect(
        parsed.registry.entities.find((entity) => entity.id === "exec.wp.1")
          ?.expectedReferences,
      ).toEqual({
        labels: ["CON-1"],
        ranges: [],
      });
      expect(parsed.graph.edges).toEqual([
        {
          source: "exec.wp.1",
          target: "exec.con.1",
        },
      ]);
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it("reports profile validation as the failure surface for missing R1 type profiles", async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const exitCode = await main(["derive", "--document", r1DocumentPath], {
      cwd: repoRoot,
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text),
    });

    expect(exitCode).toBe(2);
    expect(stdout).toEqual([]);
    expect(stderr.join("")).toContain("Failure surface: profile_validation");
    expect(stderr.join("")).toContain("requires a type profile for ctx://trace entity links");
  });

  it("reports registry derivation as the failure surface for invalid R1 references", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-cli-"));

    try {
      const documentWithMissingReference = path.join(
        temporaryDirectory,
        "missing-r1-reference.md",
      );
      await writeFile(
        documentWithMissingReference,
        [
          "# Missing R1 Reference",
          "",
          "### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Work package",
          "",
          "WP-1 depends on [CON-404](ctx://trace/entity/exec.con.404).",
        ].join("\n"),
        "utf8",
      );

      const stdout: string[] = [];
      const stderr: string[] = [];
      const exitCode = await main(
        [
          "derive",
          "--document",
          documentWithMissingReference,
          "--type-profile",
          r1ProfilePath,
        ],
        {
          cwd: repoRoot,
          stdout: (text) => stdout.push(text),
          stderr: (text) => stderr.push(text),
        },
      );

      expect(exitCode).toBe(2);
      expect(stdout).toEqual([]);
      expect(stderr.join("")).toContain("Failure surface: registry_derivation");
      expect(stderr.join("")).toContain("references unknown ctx://trace entity 'exec.con.404'");
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it("reports link parsing as the failure surface for parser diagnostics", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-cli-"));

    try {
      const malformedDocument = path.join(temporaryDirectory, "malformed-frontmatter.md");
      await writeFile(
        malformedDocument,
        ["---", "markdownTrace: [unterminated", "---", "# Broken"].join("\n"),
        "utf8",
      );

      const stdout: string[] = [];
      const stderr: string[] = [];
      const exitCode = await main(["derive", "--document", malformedDocument], {
        cwd: repoRoot,
        stdout: (text) => stdout.push(text),
        stderr: (text) => stderr.push(text),
      });

      expect(exitCode).toBe(2);
      expect(stdout).toEqual([]);
      expect(stderr.join("")).toContain("Failure surface: link_parsing");
      expect(stderr.join("")).toContain("parse diagnostic");
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });
});
