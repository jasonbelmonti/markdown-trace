import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  analyzeDocument, compileProjectionPolicy, compileValidationProfile,
} from "../src/markdowntrace/document-graph/index.js";
import { runDocumentCommand } from "../src/markdowntrace/document-graph/command.js";
import type * as PublicProjectionTypes from "../src/markdowntrace/document-graph/index.js";
import {
  fixturePolicyJson, fixtureProfileJson, fixtureSource, projectionOracle,
} from "./projection-policy/fixture.js";
import { corpusInput, corpusPolicyJson } from "./projection-policy/corpus/fixture.js";
import { corpusOracle } from "./projection-policy/corpus/oracle.js";

const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const producer = {
  packageVersion: "0.1.1",
  analyzerVersion: "0.1.0-experimental.3",
  parserVersion: "3.6.0",
  algorithmVersion: "markdown-trace.projection-algorithm.v1",
} as const;
type ProjectionExportCheck = [
  PublicProjectionTypes.EntityRef, PublicProjectionTypes.Selection,
  PublicProjectionTypes.ProjectionRule, PublicProjectionTypes.ProjectionPolicyInput,
  PublicProjectionTypes.PolicyIdentity, PublicProjectionTypes.ProjectionPolicy,
  PublicProjectionTypes.ProducerIdentity, PublicProjectionTypes.ExpectedSource,
  PublicProjectionTypes.ProjectionSource, PublicProjectionTypes.ProjectionBudget,
  PublicProjectionTypes.ProjectionLimits, PublicProjectionTypes.ProjectionExpectation,
  PublicProjectionTypes.ProjectionInput, PublicProjectionTypes.ProjectionManifest,
  PublicProjectionTypes.ProjectionDiagnosticCode, PublicProjectionTypes.ProjectionDiagnostic,
  PublicProjectionTypes.EdgeEvidence, PublicProjectionTypes.RuleEvaluation,
  PublicProjectionTypes.Obligation, PublicProjectionTypes.ProjectionPart,
  PublicProjectionTypes.ProjectionPacket, PublicProjectionTypes.ProjectionOutcome<unknown>,
  PublicProjectionTypes.ProjectionVerification,
];
const publicProjectionTypeSurface: ProjectionExportCheck | null = null;
void publicProjectionTypeSurface;

let temporary: string;
beforeAll(async () => { temporary = await mkdtemp(join(tmpdir(), "trace-projection-command-")); });
afterAll(async () => { await rm(temporary, { recursive: true, force: true }); });

async function run(args: string[]) {
  let stdout = "", stderr = "";
  const exitCode = await runDocumentCommand(args, {
    stdout: text => { stdout += text; },
    stderr: text => { stderr += text; },
  });
  return { exitCode, stdout, stderr };
}

function projectionOutcome<T>(result: { ok: true; value: T } | { ok: false; error: { message: string } }): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

function singleManifest(sourceText = fixtureSource): {
  manifest: Record<string, any>;
  files: { path: string; bytes: Uint8Array; contents: string }[];
} {
  const profile = projectionOutcome(compileValidationProfile(fixtureProfileJson));
  const analysis = projectionOutcome(analyzeDocument(
    { documentId: "task.md", text: sourceText }, profile,
    { maxSourceUtf8Bytes: 10_000, maxOccurrences: 100 },
  ));
  const policy = projectionOutcome(compileProjectionPolicy(fixturePolicyJson));
  const source = {
    alias: "task", revision: "fixture-r1", documentId: "task.md",
    text: sourceText, validationProfileJson: fixtureProfileJson,
  };
  return {
    manifest: {
      schemaVersion: "markdown-trace.projection-manifest.v1",
      assignmentId: "single-task-assignment",
      roots: projectionOracle.roots,
      sources: [{ alias: source.alias, revision: source.revision, documentId: source.documentId,
        file: "task.md", profileFile: "profile.json" }],
      bindings: [],
      policyFile: "policy.json",
      expected: {
        policy: policy.identity,
        producer,
        sources: [{
          alias: source.alias,
          revision: source.revision,
          pin: { analysisId: analysis.snapshot.analysisId, source: analysis.snapshot.source },
          profileFileSha256: sha256(fixtureProfileJson),
          interpretationHash: profile.interpretationHash,
          validationHash: profile.validationHash,
        }],
      },
      budget: { maxUtf8Bytes: projectionOracle.requiredPartBytes, maxFragments: projectionOracle.requiredPartCount },
      limits: {
        analysis: { maxSourceUtf8Bytes: 10_000, maxOccurrences: 100 },
        corpus: { maxCaptures: 1, maxBindings: 0, maxSourceUtf8Bytes: 10_000 },
        maxRuleEntityVisits: 100,
        maxPacketUtf8Bytes: 100_000,
      },
    },
    files: [{ path: "task.md", bytes: Buffer.from(source.text), contents: source.text },
      { path: "profile.json", bytes: Buffer.from(fixtureProfileJson), contents: fixtureProfileJson },
      { path: "policy.json", bytes: Buffer.from(fixturePolicyJson), contents: fixturePolicyJson }],
  };
}

function corpusManifest() {
  const input = corpusInput();
  const sources = input.sources.map(source => ({
    alias: source.alias, revision: source.revision, documentId: source.documentId,
    file: `${source.alias}.md`, profileFile: `${source.alias}.profile.json`,
  }));
  const manifest = {
    schemaVersion: "markdown-trace.projection-manifest.v1",
    assignmentId: input.assignmentId,
    roots: input.roots,
    sources,
    bindings: input.bindings,
    policyFile: "policy.json",
    expected: input.expected,
    budget: input.budget,
    limits: { ...input.limits, maxPacketUtf8Bytes: 100_000 },
  };
  const files = [
    ...input.sources.flatMap(source => [
      { path: `${source.alias}.md`, bytes: Buffer.from(source.text), contents: source.text },
      { path: `${source.alias}.profile.json`, bytes: Buffer.from(source.validationProfileJson), contents: source.validationProfileJson },
    ]),
    { path: "policy.json", bytes: Buffer.from(corpusPolicyJson), contents: corpusPolicyJson },
  ];
  return { manifest, files };
}

async function writeCase(name: string, manifest: Record<string, any>, files: readonly { path: string; bytes: Uint8Array }[]) {
  const directory = join(temporary, name);
  await import("node:fs/promises").then(fs => fs.mkdir(directory, { recursive: true }));
  for (const file of files) await writeFile(join(directory, file.path), file.bytes);
  const manifestPath = join(directory, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest));
  return { directory, manifestPath, files };
}

async function writeManifest(path: string, manifest: Record<string, any>) {
  await writeFile(path, JSON.stringify(manifest));
}

async function produceAtExactLimit(manifestPath: string, manifest: Record<string, any>) {
  let limit = 100_000;
  let result = await run(["--projection-manifest", manifestPath]);
  expect(result.exitCode).toBe(0);
  for (let attempt = 0; attempt < 8; attempt++) {
    limit = Buffer.byteLength(result.stdout, "utf8");
    manifest.limits.maxPacketUtf8Bytes = limit;
    await writeManifest(manifestPath, manifest);
    result = await run([`--projection-manifest=${manifestPath}`]);
    expect(result.exitCode).toBe(0);
    if (Buffer.byteLength(result.stdout, "utf8") === limit) break;
  }
  expect(Buffer.byteLength(result.stdout, "utf8")).toBe(limit);
  expect(String(limit - 1)).toHaveLength(String(limit).length);
  expect(JSON.parse(result.stdout).request.limits.maxPacketUtf8Bytes).toBe(limit);
  return { result, limit };
}

describe("projection command adapter", () => {
  it("documents projection forms and mode-specific exit behavior", async () => {
    const result = await run(["--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("--projection-manifest PATH");
    expect(result.stdout).toContain("--verify-projection PATH");
    expect(result.stdout).toContain("Produce: markdown-trace-document --projection-manifest manifest.json");
    expect(result.stdout).toContain("Verify:  markdown-trace-document --verify-projection packet.json --projection-manifest manifest.json");
    expect(result.stdout).toContain("Projection exit 0: satisfied / verification pass; exit 1: unsatisfied / fail or stale;");
    expect(result.stdout).toContain("exit 2: operation or invocation error, structured JSON on stderr and empty stdout.");
  });

  it("exports every projection contract type and function from the common entry point", async () => {
    const exports = await import("../src/markdowntrace/document-graph/index.js");
    for (const name of ["compileProjectionPolicy", "produceProjection", "verifyProjection"])
      expect(exports).toHaveProperty(name);
  });

  it("preserves BOM, CRLF, Unicode, and exact source slices through manifest decoding", async () => {
    const sourceText = `\uFEFF${fixtureSource.replaceAll("\n", "\r\n").replace(
      "Inputs are explicit and bounded.", "Inputs keep café 🧪 explicit and bounded.",
    )}`;
    const { manifest, files } = singleManifest(sourceText);
    manifest.budget = { maxUtf8Bytes: 10_000, maxFragments: 100 };
    const test = await writeCase("source-encoding", manifest, files);
    const result = await run(["--projection-manifest", test.manifestPath]);
    expect(result.exitCode).toBe(0);
    const packet = JSON.parse(result.stdout);
    expect(packet.identity.sources[0].pin.source.sha256).toBe(sha256(sourceText));
    expect(packet.parts.some((part: { text: string }) => part.text.includes("café 🧪"))).toBe(true);
    for (const part of packet.parts)
      expect(part.text).toBe(sourceText.slice(part.range.start.offset, part.range.end.offset));
    expect(await readFile(join(test.directory, "task.md"))).toEqual(Buffer.from(sourceText, "utf8"));
  });

  it("produces and verifies the single-source oracle with exact wire limits and trusted error channels", async () => {
    const { manifest, files } = singleManifest();
    const test = await writeCase("single", manifest, files);
    const before = await Promise.all(files.map(file => readFile(join(test.directory, file.path))));
    const { result: exact, limit } = await produceAtExactLimit(test.manifestPath, manifest);
    expect(exact.stderr).toBe("");
    expect(exact.stdout.startsWith("\uFEFF")).toBe(false);
    expect(exact.stdout.endsWith("\n")).toBe(false);
    const packet = JSON.parse(exact.stdout);
    expect(packet).toMatchObject({ schemaVersion: "markdown-trace.projection-packet.v1", policyStatus: "satisfied" });
    expect(packet.parts).toHaveLength(projectionOracle.requiredPartCount);
    expect(packet.parts.map((part: { text: string }) => part.text)).toEqual(projectionOracle.requiredParts.map(part => part.text));
    expect(packet.parts.map((part: { range: { start: { offset: number }; end: { offset: number } } }) => [part.range.start.offset, part.range.end.offset]))
      .toEqual(projectionOracle.requiredParts.map(part => [part.start, part.end]));
    expect(packet.measurements).toMatchObject({ originalSourceUtf8Bytes: projectionOracle.sourceBytes,
      projectedSourceUtf8Bytes: projectionOracle.requiredPartBytes });

    const packetPath = join(test.directory, "packet.json");
    await writeFile(packetPath, exact.stdout);
    const verified = await run([`--verify-projection=${packetPath}`, `--projection-manifest=${test.manifestPath}`]);
    expect(verified.exitCode).toBe(0);
    expect(verified.stderr).toBe("");
    expect(verified.stdout.endsWith("\n")).toBe(false);
    expect(JSON.parse(verified.stdout)).toMatchObject({ status: "pass", policyStatus: "satisfied" });

    await writeFile(packetPath, `${exact.stdout}\n`);
    const newline = await run(["--verify-projection", packetPath, "--projection-manifest", test.manifestPath]);
    expect(newline.exitCode).toBe(2);
    expect(newline.stdout).toBe("");
    expect(JSON.parse(newline.stderr).code).toBe("resource-limit");

    manifest.limits.maxPacketUtf8Bytes = limit - 1;
    await writeManifest(test.manifestPath, manifest);
    const short = await run(["--projection-manifest", test.manifestPath]);
    expect(short.exitCode).toBe(2);
    expect(short.stdout).toBe("");
    expect(JSON.parse(short.stderr).code).toBe("resource-limit");

    manifest.limits.maxPacketUtf8Bytes = limit + 1_000;
    await writeManifest(test.manifestPath, manifest);
    const ample = await run(["--projection-manifest", test.manifestPath]);
    expect(ample.exitCode).toBe(0);
    const reformatted = join(test.directory, "whitespace-packet.json");
    await writeFile(reformatted, ` ${ample.stdout}  `);
    const whitespace = await run(["--verify-projection", reformatted, "--projection-manifest", test.manifestPath]);
    expect(whitespace.exitCode).toBe(0);
    expect(JSON.parse(whitespace.stdout).status).toBe("pass");

    await writeFile(packetPath, "{");
    const malformed = await run(["--verify-projection", packetPath, "--projection-manifest", test.manifestPath]);
    expect(malformed.exitCode).toBe(1);
    expect(malformed.stderr).toBe("");
    expect(JSON.parse(malformed.stdout)).toMatchObject({ status: "fail", policyStatus: "not-evaluated" });

    await writeFile(packetPath, '{"schemaVersion":"markdown-trace.projection-packet.v1","schema\\u0056ersion":"changed"}');
    const duplicatePacket = await run(["--verify-projection", packetPath, "--projection-manifest", test.manifestPath]);
    expect(duplicatePacket.exitCode).toBe(1);
    expect(duplicatePacket.stderr).toBe("");
    expect(JSON.parse(duplicatePacket.stdout).status).toBe("fail");

    const oldMode = await run(["--file", join(test.directory, "task.md"), "--profile", join(test.directory, "profile.json"), "--format", "report"]);
    expect(oldMode.exitCode).toBe(0);
    expect(oldMode.stdout.endsWith("\n")).toBe(true);
    expect(JSON.parse(oldMode.stdout).status).toBe("pass");
    expect(await Promise.all(files.map(file => readFile(join(test.directory, file.path))))).toEqual(before);
  });

  it("runs the explicit corpus oracle and rejects conflicting flags, duplicate keys and invalid UTF-8 as operation errors", async () => {
    const { manifest, files } = corpusManifest();
    const test = await writeCase("corpus", manifest, files);
    const before = await Promise.all(files.map(file => readFile(join(test.directory, file.path))));
    const produced = await run(["--projection-manifest", test.manifestPath]);
    expect(produced.exitCode).toBe(0);
    expect(produced.stderr).toBe("");
    const packet = JSON.parse(produced.stdout);
    expect(packet.policyStatus).toBe("satisfied");
    expect(packet.parts.map((part: { source: string; text: string }) => ({ source: part.source, text: part.text }))).toEqual(corpusOracle.parts);
    expect(packet.parts.map((part: { reasons: readonly { obligationId: string; role: string }[] }) =>
      part.reasons.map(reason => [reason.obligationId, reason.role]))).toEqual(corpusOracle.reasons);
    expect(JSON.stringify(packet)).not.toContain(corpusOracle.excluded);
    for (const part of packet.parts) {
      const source = manifest.sources.find(row => row.alias === part.source)!;
      const contents = files.find(file => file.path === source.file)!.contents;
      expect(part.text).toBe(contents.slice(part.range.start.offset, part.range.end.offset));
    }
    const packetPath = join(test.directory, "corpus-packet.json");
    await writeFile(packetPath, produced.stdout);
    const verified = await run(["--verify-projection", packetPath, "--projection-manifest", test.manifestPath]);
    expect(verified.exitCode).toBe(0);
    expect(JSON.parse(verified.stdout).status).toBe("pass");

    const conflict = await run(["--projection-manifest", test.manifestPath, "--file", "ignored.md"]);
    expect(conflict.exitCode).toBe(2);
    expect(conflict.stdout).toBe("");
    const duplicateManifest = join(test.directory, "duplicate.json");
    await writeFile(duplicateManifest, '{"schemaVersion":"markdown-trace.projection-manifest.v1","schema\\u0056ersion":"bad"}');
    const duplicate = await run(["--projection-manifest", duplicateManifest]);
    expect(duplicate.exitCode).toBe(2);
    expect(duplicate.stdout).toBe("");

    const invalidProfile = join(test.directory, "invalid-utf8.json");
    await writeFile(invalidProfile, Buffer.from([0xff, 0xfe, 0xfd]));
    const invalidManifestPath = join(test.directory, "invalid-utf8-manifest.json");
    const invalidManifest = { ...manifest, sources: manifest.sources.map(source =>
      source.alias === "plan" ? { ...source, profileFile: "invalid-utf8.json" } : source) };
    await writeManifest(invalidManifestPath, invalidManifest);
    const invalidUtf8 = await run(["--projection-manifest", invalidManifestPath]);
    expect(invalidUtf8.exitCode).toBe(2);
    expect(invalidUtf8.stdout).toBe("");
    expect(JSON.parse(invalidUtf8.stderr).code).toBe("invalid-utf8");
    expect(await Promise.all(files.map(file => readFile(join(test.directory, file.path))))).toEqual(before);
  });
});
