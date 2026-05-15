import type { MarkdownDiagnostic } from "@jasonbelmonti/markdown-engine";

import type { DerivedRegistryDiagnostic } from "./derived-model.js";
import { RegistryLoadError } from "./model.js";

export function toDerivedDiagnostics(
  stage: DerivedRegistryDiagnostic["stage"],
  diagnostics: readonly MarkdownDiagnostic[],
): readonly DerivedRegistryDiagnostic[] {
  return diagnostics.map((diagnostic) => ({
    stage,
    code: diagnostic.code,
    message: diagnostic.message,
    severity: diagnostic.severity,
  }));
}

export function rejectErrorDiagnostics(
  documentPath: string | undefined,
  diagnostics: readonly DerivedRegistryDiagnostic[],
): void {
  const errorDiagnostic = diagnostics.find((diagnostic) => diagnostic.severity === "error");

  if (errorDiagnostic === undefined) {
    return;
  }

  const source = documentPath === undefined ? "markdown text" : documentPath;
  throw new RegistryLoadError(
    `${source} has ${errorDiagnostic.stage} diagnostic ${errorDiagnostic.code}: ${errorDiagnostic.message}`,
  );
}
