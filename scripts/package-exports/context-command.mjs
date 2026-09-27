import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { run } from "./process.mjs";

/** Exercise only the installed binary, with inputs local to the external consumer. */
export async function runContextCommandSmoke(consumerDirectory) {
  const command = path.join(consumerDirectory, "node_modules/.bin/markdown-trace-document");
  const source = "# Sample\r\n\r\n## [Selected](ctx://trace/entity/REQ-1?role=definition)\r\n\r\nKeep café.\r\nPreserve this line.\r\n\r\n## [Other](ctx://trace/entity/REQ-2?role=definition)\r\n\r\nExclude this.\r\n";
  const profile = JSON.stringify({
    schemaVersion: "markdown-trace.validation-profile.experimental.v1", profileId: "consumer",
    interpretation: { language: "markdown-trace.identity.draft2", entityKinds: [{ name: "requirement", prefixes: ["REQ"] }] },
    validation: { minEntities: 2, allowedRelations: [], rules: [] },
  });
  const file = path.join(consumerDirectory, "context.md");
  const profileFile = path.join(consumerDirectory, "context-profile.json");
  await writeFile(file, source);
  await writeFile(profileFile, profile);
  const args = ["--file", file, "--profile", profileFile, "--format", "context", "--root", "REQ-1",
    "--max-depth", "0", "--max-nodes", "1", "--max-utf8-bytes", "2048", "--max-fragments", "10"];
  const options = { cwd: consumerDirectory, encoding: "utf8" };
  const result = run(command, args, options);
  assert.equal(result.stderr, "");
  const { validation, context } = JSON.parse(result.stdout);
  assert.equal(validation.status, "pass");
  assert.equal(context.source.sha256, createHash("sha256").update(source).digest("hex"));
  assert.deepEqual(context.includedIdentifiers, ["REQ-1"]);
  assert.deepEqual(context.omittedIdentifiers, []);
  assert.deepEqual(context.parts.map(part => part.text), [
    "# Sample", "## [Selected](ctx://trace/entity/REQ-1?role=definition)", "Keep café.\r\nPreserve this line.",
  ]);
  for (const part of context.parts)
    assert.equal(part.text, source.slice(part.range.start.offset, part.range.end.offset));
  const report = path.join(consumerDirectory, "retained context.json");
  const textArgs = [...args, "--format", "context-text", "--report-file", report];
  const text = run(command, textArgs, options);
  const retained = await readFile(report, "utf8");
  assert.equal(retained, result.stdout, "Text mode retains the unchanged JSON context report");
  assert.equal(text.stderr, "");
  assert.ok(text.stdout.includes("Validation: pass; analysis coverage: complete"));
  assert.ok(text.stdout.includes("Required-context completeness: not evaluated"));
  assert.ok(text.stdout.includes(createHash("sha256").update(retained).digest("hex")));
  assert.deepEqual(Array.from(text.stdout.matchAll(/^(`{3,})text\n([\s\S]*?)\n\1\n/gm), match => match[2]), [
    "# Sample", "## [Selected](ctx://trace/entity/REQ-1?role=definition)", "Keep café.\r\nPreserve this line.",
  ]);
  assert.ok(Buffer.byteLength(text.stdout) < Buffer.byteLength(retained));
  const refused = spawnSync(command, textArgs, options);
  assert.equal(refused.status, 2);
  assert.equal(refused.stdout, "");
  assert.equal(JSON.parse(refused.stderr).code, "EEXIST");
  assert.equal(await readFile(report, "utf8"), retained);
  const limited = JSON.parse(run(command, [...args, "--max-utf8-bytes", "0"], options).stdout).context;
  assert.deepEqual(limited.parts, []);
  assert.deepEqual(limited.omittedIdentifiers, [{ identifier: "REQ-1", reason: "byte-budget" }]);
  const missing = spawnSync(command, [...args, "--root", "REQ-404", "--max-nodes", "2"], options);
  assert.equal(missing.status, 2);
  assert.equal(missing.stdout, "");
  assert.equal(JSON.parse(missing.stderr).code, "unresolved-root");
  assert.equal(await readFile(file, "utf8"), source);
  assert.equal(await readFile(profileFile, "utf8"), profile);
  process.stdout.write("installed context command: JSON/text parity, retained report, exact Unicode/CRLF, budgets, unresolved roots and unchanged inputs passed\n");
}
