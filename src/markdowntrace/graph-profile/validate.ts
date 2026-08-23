import { graphProfileError, type GraphProfileResult } from "./diagnostics.js";
import { parseGraphProfile } from "./validation/decode.js";
import { ProfileSchemaFailure, deepFreeze } from "./validation/primitives.js";
import { validateReferences } from "./validation/references.js";

export function validateGraphProfile(
  input: unknown,
  sourceName = "graph profile",
): GraphProfileResult {
  try {
    const profile = parseGraphProfile(input);
    validateReferences(profile);
    return Object.freeze({ ok: true, profile: deepFreeze(profile) });
  } catch (error) {
    const failure = error instanceof ProfileSchemaFailure
      ? error
      : new ProfileSchemaFailure("root", "could not be validated");
    const diagnostic = graphProfileError(
      "schema",
      `${sourceName} ${failure.path} ${failure.message}`,
      { profileRuleId: `graph-profile.schema.${failure.path}`, source: sourceName },
    );
    return Object.freeze({ ok: false, diagnostics: Object.freeze([diagnostic]) });
  }
}
