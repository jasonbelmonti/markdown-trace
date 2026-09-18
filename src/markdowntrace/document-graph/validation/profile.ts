import type { Outcome } from "../contracts/source.js";
import type {
  TraceValidationProfile,
  ValidationProfileInput,
} from "../contracts/validation-profile.js";
import { issueProfile, profileFailure } from "../profile.js";
import { ProfileError, readProfile } from "../profile-input.js";
import { freeze } from "../value.js";
import { checkRules, object } from "./schema.js";

const profiles = new WeakMap<TraceValidationProfile, ValidationProfileInput>();
export const validationProfileData = (profile: TraceValidationProfile) =>
  profiles.get(profile);

export function compileValidationProfile(
  json: string,
): Outcome<TraceValidationProfile> {
  try {
    if (typeof json !== "string")
      throw new ProfileError("profile", "Supply profile JSON text.");
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch {
      throw new ProfileError("profile", "Invalid profile JSON.");
    }
    object(data, [
      "schemaVersion",
      "profileId",
      "interpretation",
      "validation",
    ]);
    if (
      data.schemaVersion !== "markdown-trace.validation-profile.experimental.v1"
    )
      throw new ProfileError(
        "schemaVersion",
        "Unsupported validation profile version.",
        true,
      );
    object(data.validation, ["minEntities", "allowedRelations", "rules"]);
    const base = readProfile({
      schemaVersion: "markdown-trace.document-profile.v1",
      profileId: data.profileId,
      interpretation: data.interpretation,
      validation: { ...data.validation, rules: [] },
    });
    checkRules(
      data.validation.rules,
      base.interpretation.entityKinds.map((kind) => kind.name),
      base.validation.allowedRelations.map((relation) => relation.kind),
    );
    const captured = freeze(data as unknown as ValidationProfileInput);
    const profile = issueProfile(
      base,
      captured.validation,
    ) as TraceValidationProfile;
    profiles.set(profile, captured);
    return freeze({ ok: true, value: profile });
  } catch (error) {
    return profileFailure(error);
  }
}
