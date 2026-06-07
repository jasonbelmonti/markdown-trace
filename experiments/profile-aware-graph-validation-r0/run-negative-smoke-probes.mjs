#!/usr/bin/env node

import { extractTraceEvidence } from "./extractor/extract-trace-evidence.mjs";
import { evaluateProbe } from "./smoke/diagnostic-evaluation.mjs";
import { smokeProbes } from "./smoke/probe-config.mjs";
import { formatSmokeJson, formatSmokeMarkdown } from "./smoke/report-format.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const results = [];

for (const probe of smokeProbes) {
  const traceEvidence = await extractTraceEvidence(probe.fixturePath);
  results.push(evaluateProbe(probe, traceEvidence));
}

const run = {
  schema: "markdown-trace.r0.negative-smoke.v1",
  runner: "experiments/profile-aware-graph-validation-r0/run-negative-smoke-probes.mjs",
  command: "node experiments/profile-aware-graph-validation-r0/run-negative-smoke-probes.mjs",
  summary: {
    total: results.length,
    passed: results.filter((result) => result.status === "pass").length,
    failed: results.filter((result) => result.status !== "pass").length,
    status: results.every((result) => result.status === "pass") ? "pass" : "fail",
  },
  results,
};

process.stdout.write(args.format === "json" ? formatSmokeJson(run) : `${formatSmokeMarkdown(run)}\n`);

if (run.summary.status !== "pass") {
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = { format: "markdown" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--format") {
      parsed.format = parseFormat(parseOptionValue(argv, (index += 1), "--format"));
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function parseFormat(value) {
  if (["json", "markdown"].includes(value)) {
    return value;
  }

  throw new Error(`unsupported --format value: ${value}`);
}

function parseOptionValue(argv, index, option) {
  const value = argv[index];

  if (value === undefined || value.startsWith("--")) {
    throw new Error(`missing value for ${option}`);
  }

  return value;
}

function printHelp() {
  console.log(`Usage:
  node experiments/profile-aware-graph-validation-r0/run-negative-smoke-probes.mjs [--format markdown|json]

Runs private R0 negative graph diagnostic smoke probes and emits deterministic evidence.`);
}
