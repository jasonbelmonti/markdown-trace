import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ContextBudget, ContextBundle } from "./contracts/context.js";
import type { GraphValidationReport } from "./contracts/validation.js";
import { renderContextText } from "./export/context-text.js";

/** Retain the full report before returning its smaller model-facing view. */
export async function publishContextText(
  destination: string,
  report: string,
  validation: GraphValidationReport,
  context: ContextBundle,
  budget: ContextBudget,
): Promise<string> {
  const path = resolve(destination);
  const sha256 = createHash("sha256").update(report, "utf8").digest("hex");
  const text = renderContextText(validation, context, budget, { path, sha256 });
  // Exclusive creation also refuses symlinks/hardlinks to inputs or prior reports.
  await writeFile(path, report, { encoding: "utf8", flag: "wx" });
  return text;
}
