import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileValidationProfile,
  validateGraph,
  type Outcome,
  type ValidationProfileInput,
} from "../src/markdowntrace/document-graph/index.js";

function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}
const input: ValidationProfileInput = {
  schemaVersion: "markdown-trace.validation-profile.experimental.v1",
  profileId: "partial-integrity",
  interpretation: {
    language: "markdown-trace.identity.draft2",
    entityKinds: [{ name: "item", prefixes: ["ITEM"] }],
  },
  validation: {
    minEntities: 0,
    allowedRelations: [{ kind: "checks", from: ["item"], to: ["item"] }],
    rules: [],
  },
};
const profile = value(compileValidationProfile(JSON.stringify(input)));
function validate(text: string) {
  const analysis = value(analyzeDocument({ documentId: "partial.md", text }, profile, {
    maxSourceUtf8Bytes: 10_000, maxOccurrences: 100,
  }));
  return value(validateGraph(analysis, profile));
}
const source = "# [Source](ctx://trace/entity/ITEM-1?role=definition)\n\n[Target](ctx://trace/entity/ITEM-2?rel=checks).\n\n";
const definition = "[Target](ctx://trace/entity/ITEM-2?role=definition)";
const note = "See details[^n].\n\n[^n]: Plain note.\n";

describe("validation integrity under partial extraction", () => {
  it("keeps an uncaptured definition indeterminate and a complete absence failing", () => {
    const partial = validate(source + `See details[^n].\n\n[^n]: ${definition}\n`);
    expect(partial).toMatchObject({ coverage: "partial", status: "indeterminate", valid: false });
    expect(partial.diagnostics.find(item => item.ruleId === "builtin.integrity"))
      .toMatchObject({ identifier: "ITEM-2", status: "indeterminate" });
    const missing = validate(source);
    expect(missing).toMatchObject({ coverage: "complete", status: "fail" });
    expect(missing.diagnostics.find(item => item.ruleId === "builtin.integrity"))
      .toMatchObject({ identifier: "ITEM-2", status: "fail" });
    const captured = validate(source + definition + "\n\n" + note);
    expect(captured.status).toBe("indeterminate");
    expect(captured.rules.find(rule => rule.id === "builtin.integrity")?.status).toBe("pass");
    expect(validate(source + definition).status).toBe("pass");
  });

  it("still fails known duplicate and unknown-kind defects when extraction is partial", () => {
    for (const text of [
      source + definition + "\n\n" + definition + "\n\n" + note,
      source.replace("ITEM-2?rel=checks", "OTHER-2?rel=checks") + note,
    ]) {
      const result = validate(text);
      expect(result).toMatchObject({ coverage: "partial", status: "fail" });
      expect(result.diagnostics.find(item => item.ruleId === "builtin.integrity")?.status)
        .toBe("fail");
    }
  });
});
