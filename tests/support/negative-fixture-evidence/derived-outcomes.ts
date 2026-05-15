import { expect } from "vitest";

import { deriveRegistryFromMarkdownText } from "../../../src/markdowntrace/registry/index.js";
import type { VariantOutcome } from "./model.js";

export function derivedBoundedRangeSafetyOutcome(): VariantOutcome {
  const registry = deriveRegistryFromMarkdownText(
    [
      "# Mission Plan",
      "",
      "### CON-1: First constraint",
      "",
      "### CON-2: Second constraint",
      "",
      "### CON-3: Third constraint",
      "",
      "### WP-1: Start",
      "",
      "WP-1 depends on CON-1 through CON-1000000000.",
    ].join("\n"),
    { documentPath: "mission.md", namespace: "exec" },
  );
  const wp1 = registry.entitiesById.get("exec.wp.1");

  expect(wp1?.expectedReferences.ranges).toEqual([
    {
      labelFamily: "CON",
      start: "CON-1",
      end: "CON-1000000000",
      expandsTo: ["CON-1", "CON-2", "CON-3"],
    },
  ]);

  return {
    name: "derived-bounded-range-safety",
    proofSurface: "derived registry generation",
    expectedOutcome: "bounded range expands only to registered labels",
    actualOutcome:
      "`CON-1..CON-1000000000` expands to `CON-1`, `CON-2`, and `CON-3` only",
    status: "DERIVED",
    findings: [],
  };
}
