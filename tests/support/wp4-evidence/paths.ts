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

export const determinismEvidencePath = path.join(
  repoRoot,
  "docs/evidence/determinism-repeat-report.md",
);
export const issueKeyCollisionEvidencePath = path.join(
  repoRoot,
  "docs/evidence/issue-key-collision-report.md",
);
export const localSafetyEvidencePath = path.join(
  repoRoot,
  "docs/evidence/local-safety-report.md",
);
