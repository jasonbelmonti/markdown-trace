import { ProfileError } from "../profile-input.js";
import type {
  GraphValidationRule,
  SourceSelector,
} from "../contracts/validation-profile.js";
const fail = (message: string): never => {
  throw new ProfileError("validation.rules", message);
};

export function object(
  value: unknown,
  fields: readonly string[],
  required = fields,
): asserts value is Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !fields.includes(key)) ||
    required.some((key) => !Object.hasOwn(value, key))
  )
    fail("Expected exactly these supported fields: " + fields.join(", "));
}
function text(value: unknown): asserts value is string {
  if (typeof value !== "string" || !value.trim())
    fail("Expected nonempty text.");
}
const oneOf = (value: unknown, allowed: readonly string[]): boolean =>
  typeof value === "string" && allowed.includes(value);
function bounds(min: unknown, max: unknown) {
  if (
    typeof min !== "number" ||
    !Number.isSafeInteger(min) ||
    min < 0 ||
    (max !== null &&
      (typeof max !== "number" || !Number.isSafeInteger(max) || max < min))
  )
    fail("Counts require a nonnegative integer min and a max >= min or null.");
}
function names(values: unknown, allowed: readonly string[]) {
  if (
    !Array.isArray(values) ||
    !values.length ||
    new Set(values).size !== values.length ||
    values.some((value) => !allowed.includes(value))
  )
    fail("Expected unique names from the declared vocabulary.");
}
function selector(select: unknown): asserts select is SourceSelector {
  object(select, ["target", "section", "column", "nodeType"], ["target"]);
  if (select?.target === "tableCell") {
    object(select, ["target", "section", "column"], ["target", "column"]);
    text(select.column);
  } else if (select?.target === "node") {
    object(select, ["target", "section", "nodeType"], ["target", "nodeType"]);
    if (
      !oneOf(select.nodeType, [
        "heading",
        "paragraph",
        "listItem",
        "blockquote",
      ])
    )
      fail("Unsupported node selector type.");
  } else fail("Unsupported selector target.");
  if (select.section !== undefined) text(select.section);
}

export function checkRules(
  rules: unknown,
  kinds: readonly string[],
  relations: readonly string[],
): asserts rules is readonly GraphValidationRule[] {
  if (!Array.isArray(rules)) fail("rules must be an array.");
  const ids = new Set();
  for (const rule of rules as Record<string, unknown>[]) {
    if (!rule || typeof rule !== "object" || Array.isArray(rule))
      fail("Expected a rule object.");
    if (rule?.op === "declarations" || rule?.op === "references") {
      const specific = rule.op === "declarations" ? "kinds" : "relation";
      object(rule, [
        "id",
        "op",
        "select",
        specific,
        "min",
        "max",
        "minSelections",
        "matchText",
        "exclusive",
      ]);
      selector(rule.select);
      bounds(rule.minSelections, null);
      if (
        typeof rule.matchText !== "boolean" ||
        typeof rule.exclusive !== "boolean"
      )
        fail("matchText and exclusive must be explicit booleans.");
      if (
        rule.matchText &&
        rule.select.target === "node" &&
        ["listItem", "blockquote"].includes(rule.select.nodeType)
      )
        fail(
          "matchText requires a heading, paragraph or table cell with Engine text.",
        );
      if (rule.op === "declarations") names(rule.kinds, kinds);
      else if (!oneOf(rule.relation, relations))
        fail("Reference rule uses an undeclared relation.");
    } else if (rule?.op === "require-relation") {
      object(rule, [
        "id",
        "op",
        "kinds",
        "direction",
        "relation",
        "relatedKinds",
        "min",
        "max",
      ]);
      names(rule.kinds, kinds);
      names(rule.relatedKinds, kinds);
      if (
        !oneOf(rule.direction, ["incoming", "outgoing"]) ||
        !oneOf(rule.relation, relations)
      )
        fail("Expected incoming/outgoing and a declared relation.");
    } else if (rule?.op === "entity-count") {
      object(rule, ["id", "op", "kinds", "min", "max"]);
      names(rule.kinds, kinds);
    } else fail("Unsupported rule operator: " + rule?.op);
    text(rule.id);
    if (ids.has(rule.id) || rule.id.startsWith("builtin."))
      fail("Rule IDs must be unique and outside builtin.*.");
    ids.add(rule.id);
    bounds(rule.min, rule.max);
  }
}
