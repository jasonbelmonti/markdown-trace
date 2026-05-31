import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

export const fixtureDirectory = "fixtures/r1-link-backed-entity-syntax";
export const documentPath = `${fixtureDirectory}/minimal-link-backed-execution-spec.md`;
export const manualRegistryPath = `${fixtureDirectory}/minimal-link-backed-manual-registry.yaml`;
export const typeProfilePath = `${fixtureDirectory}/minimal-type-profile.yaml`;
export const generatedSidecarPath =
  `${fixtureDirectory}/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml`;
export const evidencePath = path.join(
  repoRoot,
  "docs/evidence/r3-no-write-migration-check-failures.md",
);

export const migrationCheckCommand = [
  "markdown-trace migration-check",
  `--document ${documentPath}`,
  `--manual-registry ${manualRegistryPath}`,
  `--type-profile ${typeProfilePath}`,
].join(" ");
