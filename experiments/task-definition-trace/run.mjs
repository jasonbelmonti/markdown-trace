import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { exportMermaid } from "@jasonbelmonti/markdown-trace/experimental/graph";
import { checkTask, unwrap } from "./check.mjs";
import { compileValidationProfile } from "@jasonbelmonti/markdown-trace/experimental/graph";

try {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    out: { type: "string" }, profile: { type: "string" }, help: { type: "boolean", short: "h" },
  } });
  if (values.help) {
    console.log("Usage: node experiments/task-definition-trace/run.mjs [task.md] [--profile profile.json] [--out directory]\n"
      + "Defaults to the trial task. Exits 0=pass, 1=validation failed, 2=runtime failure.\n"
      + "Optional env: MARKDOWN_ENGINE_BIN, TASK_DEFINITION_SKILL_DIR. Engine CLI must be 3.6.0.\n"
      + "--out writes report.json and the observed graph.json / graph.mmd, including invalid graphs.\n"
      + "--profile supplies the experimental validation profile; defaults to the trial's profile.json.\n"
      + "The package API is experimental and does not establish semantic readiness.");
    process.exit(0);
  }
  if (positionals.length > 1) throw new Error("Expected one task path; use --help.");
  const path = resolve(positionals[0] ?? fileURLToPath(new URL("./task-definition.md", import.meta.url)));
  const profilePath = resolve(values.profile ?? fileURLToPath(new URL("./profile.json", import.meta.url)));
  const profile = unwrap(compileValidationProfile(readFileSync(profilePath, "utf8")));
  const text = readFileSync(path, "utf8");
  const sha256 = createHash("sha256").update(text).digest("hex");
  const skill = process.env.TASK_DEFINITION_SKILL_DIR ?? join(homedir(), ".codex/skills/task-definition");
  const engine = process.env.MARKDOWN_ENGINE_BIN ?? join(homedir(), ".local/bin/markdown-engine");
  const structuralProfile = join(skill, "profiles/task-definition.yaml");
  const structuralRun = spawnSync(engine, ["validate", "--file", path, "--profile", structuralProfile, "--format", "json"], {
    encoding: "utf8", maxBuffer: 20_000_000, timeout: 20_000,
  });
  if (structuralRun.error || ![0, 1].includes(structuralRun.status))
    throw new Error("Engine validation could not run: " + (structuralRun.error?.message ?? structuralRun.stderr ?? structuralRun.status));
  const structural = JSON.parse(structuralRun.stdout);
  if (structural.evidence?.engineVersion !== "3.6.0")
    throw new Error("Task-definition requires Engine CLI 3.6.0; observed " + structural.evidence?.engineVersion);
  const structureValid = structuralRun.status === 0 && structural.valid === true && structural.diagnostics.length === 0;
  const checked = structureValid ? checkTask(text, path, profile) : null;
  if (readFileSync(path, "utf8") !== text) throw new Error("Task changed during validation; rerun against stable input.");
  const report = {
    document: path, sha256, traceProfile: profilePath,
    valid: structureValid && checked.result.valid,
    structural: { valid: structureValid, engineVersion: structural.evidence.engineVersion,
      profile: structuralProfile,
      profileSha256: createHash("sha256").update(readFileSync(structuralProfile)).digest("hex"),
      diagnostics: structural.diagnostics },
    trace: checked?.result ?? { valid: false, skipped: "Structural validation must pass first." },
    semanticReadiness: "Requires task-definition semantic and post-draft review gates.",
  };
  if (values.out) {
    const out = resolve(values.out);
    const protectedStats = [path, profilePath, structuralProfile].map(input => statSync(input));
    for (const name of ["report.json", "graph.json", "graph.mmd"]) {
      const outputPath = join(out, name);
      if (existsSync(outputPath)) {
        const outputStat = statSync(outputPath);
        if (protectedStats.some(fileStat => fileStat.dev === outputStat.dev && fileStat.ino === outputStat.ino))
          throw new Error("Output must not overwrite an input or another output.");
        protectedStats.push(outputStat);
      }
    }
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, "report.json"), JSON.stringify(report, null, 2) + "\n");
    writeFileSync(join(out, "graph.json"), JSON.stringify(checked?.analysis.snapshot ?? null, null, 2) + "\n");
    writeFileSync(join(out, "graph.mmd"), checked ? exportMermaid(checked.analysis.snapshot)
      : "%% Graph not generated: structural validation failed.\n");
  }
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.valid ? 0 : 1;
} catch (error) {
  console.error(JSON.stringify({ valid: false, code: error.code ?? "runtime-error", runtimeError: error.message }, null, 2));
  process.exitCode = 2;
}
