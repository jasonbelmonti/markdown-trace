import { readFile, readdir, realpath } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { expect, it } from "vitest";

const root = resolve("skills/markdown-trace");
const read = (path: string) => readFile(path, "utf8");

async function files(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(join(path, entry.name)) : [join(path, entry.name)]))).flat();
}

it("declares every package resource and keeps every instructional link inside the copy", async () => {
  const paths = await files(root);
  const manifest = JSON.parse(await read(join(root, "skill-package.json")));
  expect(manifest.schemaVersion).toBe(1);
  expect(manifest.requiredFiles.sort()).toEqual(paths.map(path => relative(root, path))
    .filter(path => path !== "skill-package.json").sort());
  for (const path of paths.filter(path => path.endsWith(".md"))) {
    for (const [, destination] of (await read(path)).matchAll(/\]\(([^\s)]+)\)/g)) {
      if (/^[a-z]+:|^#/.test(destination)) continue;
      const target = await realpath(resolve(dirname(path), destination.split("#")[0]));
      expect(relative(root, target), `${path}: ${destination}`).not.toMatch(/^\.\.|^\//);
    }
  }
});

it("mirrors authoritative language, profile fields and complete example profiles", async () => {
  const language = (await read("docs/experimental-document-graph.md")).split("## Link identity language\n")[1];
  expect(await read(join(root, "references/link-language.md"))).toBe(`# Link identity language\n${language}`);
  const profile = (await read("docs/experimental-graph-validation.md")).split("## Supported profile contract\n")[1]
    .replace("../experiments/task-definition-trace/profile.json", "../examples/task-definition/profile.json");
  expect(await read(join(root, "references/profile-contract.md"))).toBe(`# Supported profile contract\n${profile}`);
  for (const [target, source] of [
    ["examples/preview-design/profile.json", "examples/preview-design/profile.json"],
    ["examples/preview-design/document.md", "examples/preview-design/document.md"],
    ["examples/task-definition/profile.json", "experiments/task-definition-trace/profile.json"],
  ]) expect(await read(join(root, target))).toBe(await read(source));
});
