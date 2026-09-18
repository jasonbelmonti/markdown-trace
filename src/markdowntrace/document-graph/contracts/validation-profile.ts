import type {
  AllowedRelation,
  InterpretationPolicy,
  TraceProfile,
} from "./profile.js";
import type { EntityKind, NonEmpty, RelationKind } from "./source.js";

export type SourceSelector =
  | {
      readonly target: "tableCell";
      readonly section?: string;
      readonly column: string;
    }
  | {
      readonly target: "node";
      readonly section?: string;
      readonly nodeType: "heading" | "paragraph" | "listItem" | "blockquote";
    };

interface CountRule {
  readonly id: string;
  readonly min: number;
  readonly max: number | null;
}
interface SourceRule extends CountRule {
  readonly select: SourceSelector;
  readonly minSelections: number;
  readonly matchText: boolean;
  readonly exclusive: boolean;
}
export type GraphValidationRule =
  | (SourceRule & {
      readonly op: "declarations";
      readonly kinds: NonEmpty<EntityKind>;
    })
  | (SourceRule & {
      readonly op: "references";
      readonly relation: RelationKind;
    })
  | (CountRule & {
      readonly op: "require-relation";
      readonly kinds: NonEmpty<EntityKind>;
      readonly direction: "incoming" | "outgoing";
      readonly relation: RelationKind;
      readonly relatedKinds: NonEmpty<EntityKind>;
    })
  | (CountRule & {
      readonly op: "entity-count";
      readonly kinds: NonEmpty<EntityKind>;
    });

export interface ValidationProfileInput {
  readonly schemaVersion: "markdown-trace.validation-profile.experimental.v1";
  readonly profileId: string;
  readonly interpretation: InterpretationPolicy;
  readonly validation: {
    readonly minEntities: number;
    readonly allowedRelations: readonly AllowedRelation[];
    readonly rules: readonly GraphValidationRule[];
  };
}
declare const validationProfile: unique symbol;
export interface TraceValidationProfile extends TraceProfile {
  readonly [validationProfile]: true;
}
