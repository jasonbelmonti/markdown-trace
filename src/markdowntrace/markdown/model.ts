import type { SourceRange } from "@jasonbelmonti/markdown-engine";

export const MARKDOWN_ENGINE_PACKAGE = {
  name: "@jasonbelmonti/markdown-engine",
  version: "2.0.0",
} as const;

export interface MarkdownAdapterMetadata {
  readonly enginePackage: typeof MARKDOWN_ENGINE_PACKAGE;
  readonly documentVersion: string;
  readonly sourcePath: string;
}

export interface MarkdownAdapterDiagnostic {
  readonly stage: "parse" | "normalize";
  readonly code: string;
  readonly message: string;
  readonly severity: string;
  readonly sourceRange?: SourceRange;
}

export interface MarkdownDefinitionFact {
  readonly entityId: string;
  readonly label: string;
  readonly kind: string;
  readonly text: string;
  readonly targetId: string;
  readonly sectionTargetId?: string;
  readonly sourceRange?: SourceRange;
}

export interface MarkdownLabelReferenceFact {
  readonly sourceEntityId: string;
  readonly label: string;
  readonly targetId: string;
  readonly text: string;
  readonly sourceRange?: SourceRange;
}

export interface MarkdownRangeReferenceFact {
  readonly sourceEntityId: string;
  readonly labelFamily: string;
  readonly start: string;
  readonly end: string;
  readonly declared: boolean;
  readonly expandsTo: readonly string[];
  readonly targetId: string;
  readonly text: string;
  readonly sourceRange?: SourceRange;
}

export interface MarkdownAdapterFacts {
  readonly metadata: MarkdownAdapterMetadata;
  readonly diagnostics: readonly MarkdownAdapterDiagnostic[];
  readonly definitions: readonly MarkdownDefinitionFact[];
  readonly labelReferences: readonly MarkdownLabelReferenceFact[];
  readonly rangeReferences: readonly MarkdownRangeReferenceFact[];
}
