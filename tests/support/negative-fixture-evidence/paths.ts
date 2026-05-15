import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

export const displayRegistryPath = "fixtures/r0-document-local-registry/entity-registry.yaml";
export const displayDocumentPath = "fixtures/r0-document-local-registry/execution-spec.md";

export const registryPath = path.join(repoRoot, displayRegistryPath);
export const documentPath = path.join(repoRoot, displayDocumentPath);
export const evidencePath = path.join(repoRoot, "docs/evidence/negative-fixture-report.md");
