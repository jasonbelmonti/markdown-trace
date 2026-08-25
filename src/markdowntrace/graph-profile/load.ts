import { readFile } from "node:fs/promises";

import { parseAllDocuments } from "yaml";

import {
  graphProfileError,
  type GraphProfileDiagnosticStage,
  type GraphProfileResult,
} from "./diagnostics.js";
import { validateGraphProfile } from "./validate.js";

export async function loadGraphProfile(profilePath: string): Promise<GraphProfileResult> {
  let profileText: string;

  try {
    profileText = await readFile(profilePath, "utf8");
  } catch {
    return failure("read", `${profilePath} cannot be read`, profilePath);
  }

  let documents: ReturnType<typeof parseAllDocuments>;
  try {
    documents = parseAllDocuments(profileText);
  } catch {
    return failure("yaml", `${profilePath} contains invalid YAML`, profilePath);
  }

  if (documents.length !== 1) {
    return failure("yaml", `${profilePath} must contain exactly one YAML document`, profilePath);
  }
  const [document] = documents;
  if (document.errors.length > 0) {
    return failure("yaml", `${profilePath} contains invalid YAML`, profilePath);
  }

  let profileData: unknown;
  try {
    profileData = document.toJSON();
  } catch {
    return failure("yaml", `${profilePath} contains invalid YAML`, profilePath);
  }

  return validateGraphProfile(profileData, profilePath);
}

function failure(
  stage: Exclude<GraphProfileDiagnosticStage, "schema">,
  message: string,
  source: string,
): GraphProfileResult {
  return Object.freeze({
    ok: false,
    diagnostics: Object.freeze([graphProfileError(stage, message, { source })]),
  });
}
