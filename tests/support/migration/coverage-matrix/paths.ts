import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

export const r0DocumentPath =
  "fixtures/r0-document-local-registry/execution-spec.md";
export const r0RegistryPath =
  "fixtures/r0-document-local-registry/entity-registry.yaml";

export const r1FixtureDirectory = "fixtures/r1-link-backed-entity-syntax";
export const minimalDocumentPath = `${r1FixtureDirectory}/minimal-link-backed-execution-spec.md`;
export const minimalManualRegistryPath = `${r1FixtureDirectory}/minimal-link-backed-manual-registry.yaml`;
export const minimalTypeProfilePath = `${r1FixtureDirectory}/minimal-type-profile.yaml`;

export const codefactoryDocumentPath = `${r1FixtureDirectory}/codefactory-link-backed-spec.md`;
export const codefactoryTypeProfilePath = `${r1FixtureDirectory}/codefactory-type-profile.yaml`;
export const codefactoryGeneratedSidecarPath = `${r1FixtureDirectory}/.markdown-trace/generated/codefactory-link-backed-spec--profile-codefactory-type-profile-1d87b2e3.entity-registry.yaml`;

export const malformedProfilePath = `${r1FixtureDirectory}/malformed-type-profile.yaml`;

export const evidencePath = path.join(
  repoRoot,
  "docs/evidence/r3-r2-fixture-profile-coverage-matrix.md",
);
