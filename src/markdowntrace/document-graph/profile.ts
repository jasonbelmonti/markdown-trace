import type { ProfileInput, TraceProfile } from "./contracts/profile.js";
import type { Outcome } from "./contracts/source.js";
import { ProfileError, readProfile } from "./profile-input.js";
import { canonical, failure, freeze, sha256 } from "./value.js";

const profiles = new WeakMap<TraceProfile, ProfileInput>();
export const profileData = (profile: TraceProfile): ProfileInput | undefined =>
  profiles.get(profile);
export function issueProfile(
  data: ProfileInput,
  validation: unknown = data.validation,
): TraceProfile {
  const profile = freeze({
    profileId: data.profileId,
    interpretationHash: sha256(canonical(data.interpretation)),
    validationHash: sha256(canonical(validation)),
  }) as TraceProfile;
  profiles.set(profile, freeze(data));
  return profile;
}
export function compileProfile(input: unknown): Outcome<TraceProfile> {
  try {
    return freeze({ ok: true, value: issueProfile(readProfile(input)) });
  } catch (error) {
    return profileFailure(error);
  }
}
export function profileFailure(error: unknown): Outcome<never> {
  if (!(error instanceof ProfileError)) throw error;
  const code = error.version ? "unsupported-version" : "invalid-profile";
  return failure(code, `${error.field}: ${error.message}`, [
    {
      code: `markdown-trace.profile.${code}`,
      severity: "error",
      message: `${error.field}: ${error.message}`,
      identifiers: [],
      sourceRanges: [],
    },
  ]);
}
