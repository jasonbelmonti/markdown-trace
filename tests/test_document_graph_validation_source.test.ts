import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileValidationProfile,
  validateGraph,
  type Outcome,
  type SourceSelector,
  type ValidationProfileInput,
} from "../src/markdowntrace/document-graph/index.js";

function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}
function validate(text: string, select: SourceSelector) {
  const input: ValidationProfileInput = {
    schemaVersion: "markdown-trace.validation-profile.experimental.v1",
    profileId: "section-coverage",
    interpretation: {
      language: "markdown-trace.identity.draft2",
      entityKinds: [{ name: "item", prefixes: ["ITEM"] }],
    },
    validation: {
      minEntities: 0,
      allowedRelations: [],
      rules: [{
        id: "declarations", op: "declarations", kinds: ["item"], select,
        min: 1, max: 1, minSelections: 1, matchText: false, exclusive: true,
      }],
    },
  };
  const profile = value(compileValidationProfile(JSON.stringify(input)));
  const analysis = value(analyzeDocument({ documentId: "scope.md", text }, profile, {
    maxSourceUtf8Bytes: 10_000, maxOccurrences: 100,
  }));
  return value(validateGraph(analysis, profile));
}

const direct = "[Direct](ctx://trace/entity/ITEM-1?role=definition)";
const nested = "[Nested](ctx://trace/entity/ITEM-2?role=definition)";

describe("validation source section scope", () => {
  it("checks descendant table cells and excludes sibling sections", () => {
    const select: SourceSelector = {
      target: "tableCell", section: "Checks", column: "ID",
    };
    const text = `# Checks

| ID |
| --- |
| ${direct} |

## More checks

### Detail

| ID |
| --- |
| ${nested} |

# Other

| ID |
| --- |
| Outside the selected section |
`;
    const valid = validate(text, select);
    expect(valid.status).toBe("pass");
    expect(valid.rules.find(rule => rule.id === "declarations")).toMatchObject({
      selected: 2, evaluated: 2,
    });
    const missing = text.replace(nested, "Nested");
    const failed = validate(missing, select);
    expect(failed.status).toBe("fail");
    expect(failed.diagnostics).toHaveLength(1);
    const diagnostic = failed.diagnostics[0];
    expect(diagnostic.code).toBe("trace-validation.annotation-count");
    expect(missing.slice(diagnostic.range!.start.offset, diagnostic.range!.end.offset))
      .toContain("Nested");
  });

  it("applies the same descendant scope to node selectors", () => {
    const select: SourceSelector = {
      target: "node", nodeType: "paragraph", section: "Checks",
    };
    const text = `# Checks\n\n${direct}\n\n## More checks\n\n${nested}\n\n# Other\n\nOutside the selected section.\n`;
    const valid = validate(text, select);
    expect(valid.status).toBe("pass");
    expect(valid.rules.find(rule => rule.id === "declarations")?.selected).toBe(2);
    const failed = validate(text.replace(nested, "Nested"), select);
    expect(failed.status).toBe("fail");
    expect(failed.diagnostics).toMatchObject([{
      ruleId: "declarations", code: "trace-validation.annotation-count",
    }]);
  });
});
