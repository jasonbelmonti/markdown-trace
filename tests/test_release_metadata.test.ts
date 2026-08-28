import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  MARKDOWN_ENGINE_PACKAGE_VERSION,
  MARKDOWN_TRACE_PACKAGE_VERSION,
} from "../src/markdowntrace/generated/release-metadata.js";
import { runtimeMetadata } from "../src/markdowntrace/runtime-metadata.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generatorPath = path.join(repoRoot, "scripts/generate-release-metadata.mjs");
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe("release metadata generation", () => {
  it("keeps tracked metadata aligned with the repository manifest", async () => {
    const manifest = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
    const result = runGenerator("--check");

    expect(result).toMatchObject({ status: 0, stderr: "" });
    expect(result.stdout).toContain("release metadata is current");
    expect(MARKDOWN_TRACE_PACKAGE_VERSION).toBe(manifest.version);
    expect(MARKDOWN_ENGINE_PACKAGE_VERSION).toBe(
      manifest.dependencies["@jasonbelmonti/markdown-engine"],
    );
    expect(runtimeMetadata()).toMatchObject({
      packageVersion: MARKDOWN_TRACE_PACKAGE_VERSION,
      markdownEngineVersion: MARKDOWN_ENGINE_PACKAGE_VERSION,
    });
  });

  it("writes identical bytes when generation is repeated", async () => {
    const fixture = await createFixture();

    expect(runFixtureGenerator(fixture).status).toBe(0);
    const firstOutput = await readFile(fixture.outputPath, "utf8");
    expect(runFixtureGenerator(fixture).status).toBe(0);
    const secondOutput = await readFile(fixture.outputPath, "utf8");

    expect(secondOutput).toBe(firstOutput);
    expect(secondOutput).toContain('MARKDOWN_TRACE_PACKAGE_VERSION = "1.2.3"');
    expect(secondOutput).toContain('MARKDOWN_ENGINE_PACKAGE_VERSION = "4.5.6"');
  });

  it.each([
    ["package", { version: "1.2.4", engineVersion: "4.5.6" }],
    ["Markdown Engine", { version: "1.2.3", engineVersion: "4.5.7" }],
  ])("detects stale %s metadata without modifying the output", async (_label, versions) => {
    const fixture = await createFixture();
    expect(runFixtureGenerator(fixture).status).toBe(0);
    await writeManifest(fixture.manifestPath, versions);
    const beforeCheck = await readFile(fixture.outputPath, "utf8");

    const result = runFixtureGenerator(fixture, "--check");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("generated release metadata is stale");
    expect(await readFile(fixture.outputPath, "utf8")).toBe(beforeCheck);
  });

  it("rejects malformed JSON with an actionable diagnostic", async () => {
    const fixture = await createFixture();
    await writeFile(fixture.manifestPath, "{", "utf8");

    const result = runFixtureGenerator(fixture);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("cannot read a valid JSON manifest");
  });

  it("detects malformed generated output without modifying it", async () => {
    const fixture = await createFixture();
    const malformedOutput = "this is not generated TypeScript\n";
    expect(runFixtureGenerator(fixture).status).toBe(0);
    await writeFile(fixture.outputPath, malformedOutput, "utf8");

    const result = runFixtureGenerator(fixture, "--check");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("generated release metadata is stale");
    expect(await readFile(fixture.outputPath, "utf8")).toBe(malformedOutput);
  });

  it("rejects dependency ranges instead of treating them as release identity", async () => {
    const fixture = await createFixture();
    await writeManifest(fixture.manifestPath, {
      version: "1.2.3",
      engineVersion: "^4.5.6",
    });

    const result = runFixtureGenerator(fixture);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "@jasonbelmonti/markdown-engine dependency must be an exact SemVer value",
    );
  });
});

async function createFixture(): Promise<{
  readonly manifestPath: string;
  readonly outputPath: string;
}> {
  const directory = await mkdtemp(path.join(tmpdir(), "markdown-trace-release-metadata-"));
  temporaryDirectories.push(directory);
  const manifestPath = path.join(directory, "package.json");
  await writeManifest(manifestPath, { version: "1.2.3", engineVersion: "4.5.6" });

  return {
    manifestPath,
    outputPath: path.join(directory, "generated/release-metadata.ts"),
  };
}

async function writeManifest(
  manifestPath: string,
  versions: { readonly version: string; readonly engineVersion: string },
): Promise<void> {
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        name: "metadata-fixture",
        version: versions.version,
        dependencies: {
          "@jasonbelmonti/markdown-engine": versions.engineVersion,
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function runFixtureGenerator(
  fixture: { readonly manifestPath: string; readonly outputPath: string },
  ...arguments_: string[]
) {
  return runGenerator(
    "--manifest",
    fixture.manifestPath,
    "--output",
    fixture.outputPath,
    ...arguments_,
  );
}

function runGenerator(...arguments_: string[]) {
  return spawnSync(process.execPath, [generatorPath, ...arguments_], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}
