#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { extractTraceEvidence } from "./extractor/extract-trace-evidence.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.documentPath === undefined) {
  console.error("missing required --document <path>");
  printHelp();
  process.exit(2);
}

const evidence = await extractTraceEvidence(args.documentPath);
const json = `${JSON.stringify(evidence, null, 2)}\n`;

if (args.outputPath === undefined) {
  process.stdout.write(json);
} else {
  await mkdir(path.dirname(args.outputPath), { recursive: true });
  await writeFile(args.outputPath, json, "utf8");
  console.log(args.outputPath);
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--document") {
      parsed.documentPath = parseOptionValue(argv, (index += 1), "--document");
    } else if (arg === "--output") {
      parsed.outputPath = parseOptionValue(argv, (index += 1), "--output");
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  return parsed;
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
  node experiments/profile-aware-graph-validation-r0/extract-trace-evidence.mjs --document <markdown-path> [--output <json-path>]

Emits private R0 trace evidence JSON for controlled Markdown fixtures.`);
}
