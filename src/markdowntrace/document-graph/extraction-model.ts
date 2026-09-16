import type { EngineNode } from "@jasonbelmonti/markdown-engine";
import type { Diagnostic, SourceRange } from "./contracts/source.js";

export interface Token {
  identifier: string;
  role: "definition" | "reference";
  kind: string;
  range: SourceRange;
}
export interface NodeInfo {
  node: EngineNode;
  range: SourceRange;
  depth: number;
  parent?: NodeInfo;
  container?: NodeInfo;
}
export interface Block extends NodeInfo {
  tokens: Token[];
  id: string;
  header: boolean;
}
export interface Extraction {
  blocks: Block[];
  diagnostics: Diagnostic[];
  exclusions: { range: SourceRange; reason: string }[];
}
export interface Atom {
  char: string;
  start: number;
  end: number;
  leaf: number;
  code?: { text: string; range: SourceRange };
  token?: Token;
}
