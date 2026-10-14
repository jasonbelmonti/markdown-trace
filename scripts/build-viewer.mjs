import { build } from "esbuild";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const source = "src/markdowntrace/document-graph/viewer/browser/";
const outdir = process.argv[2] ?? "dist/markdowntrace/document-graph/viewer/assets";
await mkdir(outdir, { recursive: true });
const options = { bundle: true, minify: true, platform: "browser", format: "iife", target: "es2022", tsconfig: "tsconfig.viewer.json",
  legalComments: "inline", define: { "process.env.NODE_ENV": '"production"' }, metafile: true };
const outputs = [await build({ ...options, entryPoints: [source + "app.tsx"], outfile: outdir + "/app.js" })];
await copyFile("node_modules/elkjs/lib/elk-worker.min.js", outdir + "/worker.js");
// Keep complete package license notices with the distributable; don't ship Node/browser source maps.
const require = createRequire(import.meta.url);
const packageRoots = new Set();
for (const output of outputs) for (const input of Object.keys(output.metafile.inputs)) {
  const match = input.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (match) packageRoots.add(match[1]);
}
const notices = [];
for (const name of [...packageRoots].sort()) {
  let directory;
  try { directory = dirname(require.resolve(name + "/package.json")); }
  catch { directory = join("node_modules", name); }
  let license;
  for (const file of ["LICENSE", "LICENSE.txt", "LICENSE.md", "license", "license.txt", "LICENSE-MIT"]) {
    try { license = await readFile(join(directory, file), "utf8"); break; } catch { /* alternate license filename */ }
  }
  if (!license) throw new Error(`Missing bundled dependency license: ${name}`);
  const manifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
  const repository = typeof manifest.repository === "string" ? manifest.repository : manifest.repository?.url;
  notices.push(`${name}@${manifest.version}\nSource: ${repository ?? manifest.homepage ?? `https://www.npmjs.com/package/${name}`}\n${license}`);
}
const notice = notices.join("\n\n---\n\n");
await writeFile(outdir + "/THIRD-PARTY-NOTICES.txt", notice);
// Every standalone export carries the notices too; comment terminators remain inert.
await writeFile(outdir + "/app.js", (await readFile(outdir + "/app.js", "utf8")) + "\n/*!\n" + notice.replace(/\*\//g, "* /") + "\n*/\n");
