import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { run } from "./process.mjs";

const sourceText = [
  "# [Requirement](ctx://trace/entity/REQ-1?role=definition)",
  "",
  "The system keeps records. 🧭",
  "",
  "## [Unselected work](ctx://trace/entity/WP-1?role=definition)",
  "",
  "Unselected private detail.",
  "",
].join("\n");

const profileText = `${JSON.stringify({
  schemaVersion: "markdown-trace.document-profile.v1",
  profileId: "packed-context-consumer",
  interpretation: {
    language: "markdown-trace.identity.draft2",
    entityKinds: [
      { name: "requirement", prefixes: ["REQ"] },
      { name: "work", prefixes: ["WP"] },
    ],
  },
  validation: { minEntities: 0, allowedRelations: [], rules: [] },
}, null, 2)}\n`;

export function runContextApiSmoke(consumerDirectory, specifier) {
  const inputDirectory = path.join(consumerDirectory, "context-inputs");
  const sourcePath = path.join(inputDirectory, "spec.md");
  const profilePath = path.join(inputDirectory, "profile.json");
  return (async () => {
    await mkdir(inputDirectory, { recursive: true });
    await writeFile(sourcePath, sourceText, "utf8");
    await writeFile(profilePath, profileText, "utf8");
    const sourceHashBefore = sha256(await readFile(sourcePath));
    const profileHashBefore = sha256(await readFile(profilePath));
    const program = `
      import assert from 'node:assert/strict';
      import { createHash } from 'node:crypto';
      import { readFile } from 'node:fs/promises';
      import * as graph from ${JSON.stringify(specifier)};
      const sourcePath = ${JSON.stringify(sourcePath)};
      const profilePath = ${JSON.stringify(profilePath)};
      const sourceBytes = await readFile(sourcePath);
      const profileBytes = await readFile(profilePath);
      const sourceHashBefore = ${JSON.stringify(sourceHashBefore)};
      const profileHashBefore = ${JSON.stringify(profileHashBefore)};
      const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
      assert.equal(sha256(sourceBytes), sourceHashBefore);
      assert.equal(sha256(profileBytes), profileHashBefore);
      const unwrap = result => { assert.equal(result.ok, true); return result.value; };
      const profile = unwrap(graph.compileProfile(JSON.parse(profileBytes.toString('utf8'))));
      const text = sourceBytes.toString('utf8');
      const analysis = unwrap(graph.analyzeDocument({documentId: sourcePath, text}, profile,
        {maxSourceUtf8Bytes: 4096, maxOccurrences: 100}));
      const selection = unwrap(graph.traverseGraph(analysis, {
        roots: ['REQ-1', 'WP-1'], direction: 'both', maxDepth: 0, maxNodes: 2,
      }));
      const requirementHeading = '# [Requirement](ctx://trace/entity/REQ-1?role=definition)';
      const requirementBody = 'The system keeps records. 🧭';
      const expectedTexts = [requirementHeading, requirementBody];
      const expectedRanges = [[0, 57], [59, 87]];
      const maxUtf8Bytes = Buffer.byteLength(expectedTexts.join(''));
      const context = unwrap(graph.extractContext(analysis, {
        selection,
        budget: {maxUtf8Bytes, maxFragments: 2},
      }));
      assert.deepEqual(context.parts.map(part => part.text), expectedTexts);
      assert.deepEqual(context.parts.map(part => [part.range.start.offset, part.range.end.offset]), expectedRanges);
      assert.deepEqual(expectedTexts.map(expected => [text.indexOf(expected), text.indexOf(expected) + expected.length]), expectedRanges);
      assert.deepEqual(context.parts.map(part => part.roles), [['owned-content'], ['owned-content']]);
      assert.deepEqual(context.parts.map(part => part.forIdentifiers), [['REQ-1'], ['REQ-1']]);
      assert.equal(context.source.documentId, sourcePath);
      assert.equal(context.source.sha256, sourceHashBefore);
      assert.equal(context.analysisId, analysis.snapshot.analysisId);
      assert.deepEqual(context.includedIdentifiers, ['REQ-1']);
      assert.deepEqual(context.omittedIdentifiers, [{identifier: 'WP-1', reason: 'byte-budget'}]);
      assert.equal(context.usedUtf8Bytes, maxUtf8Bytes);
      assert.ok(context.parts.every(part => text.slice(part.range.start.offset, part.range.end.offset) === part.text));
      assert.ok(!context.parts.some(part => part.text.includes('Unselected private detail.')));
      const serialized = JSON.parse(JSON.stringify(context));
      assert.deepEqual(serialized.selection.nodes.map(node => node.identifier), ['REQ-1', 'WP-1']);
      assert.deepEqual(serialized.omittedIdentifiers, [{identifier: 'WP-1', reason: 'byte-budget'}]);
      assert.equal(sha256(await readFile(sourcePath)), sourceHashBefore);
      assert.equal(sha256(await readFile(profilePath)), profileHashBefore);
      console.log(JSON.stringify({
        entrypoint: ${JSON.stringify(specifier)},
        sourcePath, sourceSha256: sourceHashBefore,
        profilePath, profileSha256: profileHashBefore,
        inputsUnchanged: true, excerpts: expectedTexts,
        ranges: context.parts.map(part => part.range), roles: context.parts.map(part => part.roles),
        includedIdentifiers: context.includedIdentifiers, omittedIdentifiers: context.omittedIdentifiers,
      }));
    `;
    const result = run(process.execPath, ["--input-type=module", "--eval", program], {
      cwd: consumerDirectory,
    });
    return result.stdout.trim();
  })();
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
