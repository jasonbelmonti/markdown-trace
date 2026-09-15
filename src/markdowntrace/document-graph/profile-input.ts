import type { ProfileInput } from "./contracts/profile.js";
import { slugPattern } from "./value.js";

type Data = Record<string, unknown>;
export class ProfileError extends Error {
  constructor(
    readonly field: string,
    message: string,
    readonly version = false,
  ) {
    super(message);
  }
}
function fail(field: string, message: string): never {
  throw new ProfileError(field, message);
}
function object(value: unknown, keys: string[], field: string): Data {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(field, "Expected an object");
  const d = value as Data;
  if (
    Object.keys(d).some((k) => !keys.includes(k)) ||
    keys.some((k) => !Object.hasOwn(d, k))
  )
    fail(field, "Missing or unknown field");
  return d;
}
function array(value: unknown, field: string, nonempty = false): unknown[] {
  if (
    !Array.isArray(value) ||
    (nonempty && !value.length) ||
    Object.keys(value).length !== value.length ||
    Object.keys(value).some((key, i) => key !== String(i))
  )
    fail(field, "Expected an array");
  return value;
}
function name(value: unknown, field: string, pattern = slugPattern): string {
  if (typeof value !== "string" || !pattern.test(value))
    fail(field, "Invalid name");
  return value;
}
function bound(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0)
    fail(field, "Expected a nonnegative safe integer");
  return value as number;
}
function unique(values: string[], field: string): void {
  if (new Set(values).size !== values.length) fail(field, "Duplicate value");
}
// Reject non-data objects and accessors before cloning or hashing them.
function plainData(value: unknown, ancestors = new Set<object>()): void {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (typeof value !== "object" || value === null || ancestors.has(value))
    fail("profile", "Expected acyclic JSON data");
  if (
    !Array.isArray(value) &&
    ![Object.prototype, null].includes(Object.getPrototypeOf(value))
  )
    fail("profile", "Expected plain data");
  if (Object.getOwnPropertySymbols(value).length)
    fail("profile", "Symbol fields are unsupported");
  const next = new Set(ancestors).add(value);
  for (const [key, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(value),
  )) {
    if (Array.isArray(value) && key === "length") continue;
    if (!descriptor.enumerable || !("value" in descriptor))
      fail("profile", "Accessors and hidden fields are unsupported");
    plainData(descriptor.value, next);
  }
}
export function readProfile(input: unknown): ProfileInput {
  plainData(input);
  if (
    input &&
    typeof input === "object" &&
    "schemaVersion" in input &&
    input.schemaVersion !== "markdown-trace.document-profile.v1"
  ) {
    throw new ProfileError(
      "schemaVersion",
      "Unsupported profile version",
      true,
    );
  }
  const root = object(
    input,
    ["schemaVersion", "profileId", "interpretation", "validation"],
    "profile",
  );
  if (root.schemaVersion !== "markdown-trace.document-profile.v1")
    throw new ProfileError(
      "schemaVersion",
      "Unsupported profile version",
      true,
    );
  if (typeof root.profileId !== "string" || !root.profileId.trim())
    fail("profileId", "Expected a nonempty label");
  const interpretation = object(
    root.interpretation,
    ["language", "entityKinds"],
    "interpretation",
  );
  if (interpretation.language !== "markdown-trace.identity.draft1")
    throw new ProfileError(
      "interpretation.language",
      "Unsupported identity language",
      true,
    );
  const prefixes: string[] = [];
  const kinds = array(interpretation.entityKinds, "entityKinds", true).map(
    (v, i) => {
      const d = object(v, ["name", "prefixes"], `entityKinds[${i}]`);
      prefixes.push(
        ...array(d.prefixes, "prefixes", true).map((x) =>
          name(x, "prefixes", /^[A-Z][A-Z0-9]*$/),
        ),
      );
      return name(d.name, "entityKinds.name");
    },
  );
  unique(kinds, "entityKinds");
  unique(prefixes, "prefixes");
  const selectedKinds = (v: unknown, field: string) => {
    const names = array(v, field, true).map((x) => name(x, field));
    unique(names, field);
    if (names.some((x) => !kinds.includes(x)))
      fail(field, "Unknown entity kind");
  };
  const validation = object(
    root.validation,
    ["minEntities", "allowedRelations", "rules"],
    "validation",
  );
  bound(validation.minEntities, "minEntities");
  unique(
    array(validation.allowedRelations, "allowedRelations").map((v) => {
      const d = object(v, ["kind", "from", "to"], "allowedRelations");
      selectedKinds(d.from, "allowedRelations.from");
      selectedKinds(d.to, "allowedRelations.to");
      return name(d.kind, "allowedRelations.kind");
    }),
    "allowedRelations",
  );
  unique(
    array(validation.rules, "rules").map((v, i) => {
      const field = `validation.rules[${i}]`;
      if (!v || typeof v !== "object") fail(field, "Expected a rule");
      const op = (v as Data).op;
      if (op !== "entity-count" && op !== "require-relation")
        fail(`${field}.op`, "Unsupported operator");
      const count = op === "entity-count";
      const d = object(
        v,
        count
          ? ["id", "op", "kinds", "min", "max"]
          : [
              "id",
              "op",
              "sourceKinds",
              "relation",
              "targetKinds",
              "minTargets",
              "maxTargets",
            ],
        field,
      );
      selectedKinds(d[count ? "kinds" : "sourceKinds"], `${field}.kinds`);
      if (!count) {
        name(d.relation, `${field}.relation`);
        selectedKinds(d.targetKinds, `${field}.targetKinds`);
      }
      const min = bound(d[count ? "min" : "minTargets"], `${field}.min`),
        max = d[count ? "max" : "maxTargets"];
      if (max !== null && bound(max, `${field}.max`) < min)
        fail(field, "Maximum is below minimum");
      if (typeof d.id !== "string" || !d.id.trim())
        fail(`${field}.id`, "Expected a rule ID");
      return d.id;
    }),
    "rules.id",
  );
  return structuredClone(input) as ProfileInput;
}
