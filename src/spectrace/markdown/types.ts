export interface MarkdownDefinitionFact {
  readonly entityId: string;
  readonly label: string;
  readonly kind: string;
  readonly text: string;
  readonly line: number;
}

export interface MarkdownReferenceFact {
  readonly sourceEntityId: string;
  readonly label: string;
  readonly targetEntityId?: string;
  readonly line: number;
  readonly text: string;
}

export interface MarkdownRangeFact {
  readonly sourceEntityId: string;
  readonly labelFamily: string;
  readonly start: string;
  readonly end: string;
  readonly expandsTo: readonly string[];
  readonly line: number;
  readonly text: string;
}

export interface IgnoredIssueKeyFact {
  readonly key: string;
  readonly line: number;
  readonly text: string;
}

export interface MarkdownScanFacts {
  readonly documentPath: string;
  readonly definitions: readonly MarkdownDefinitionFact[];
  readonly references: readonly MarkdownReferenceFact[];
  readonly ranges: readonly MarkdownRangeFact[];
  readonly ignoredIssueKeys: readonly IgnoredIssueKeyFact[];
}
