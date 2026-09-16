import type { EntityKind, NonEmpty, RelationKind, Sha256 } from "./source.js";
declare const compiledProfile: unique symbol;
export interface EntityKindDeclaration {
  readonly name: EntityKind;
  readonly prefixes: NonEmpty<string>;
}
export interface InterpretationPolicy {
  readonly language: "markdown-trace.identity.draft2";
  readonly entityKinds: NonEmpty<EntityKindDeclaration>;
}
export interface AllowedRelation {
  readonly kind: RelationKind;
  readonly from: NonEmpty<EntityKind>;
  readonly to: NonEmpty<EntityKind>;
}
export type ValidationRule =
  | {
      readonly id: string;
      readonly op: "entity-count";
      readonly kinds: NonEmpty<EntityKind>;
      readonly min: number;
      readonly max: number | null;
    }
  | {
      readonly id: string;
      readonly op: "require-relation";
      readonly sourceKinds: NonEmpty<EntityKind>;
      readonly relation: RelationKind;
      readonly targetKinds: NonEmpty<EntityKind>;
      readonly minTargets: number;
      readonly maxTargets: number | null;
    };
export interface ValidationPolicy {
  readonly minEntities: number;
  readonly allowedRelations: readonly AllowedRelation[];
  readonly rules: readonly ValidationRule[];
}
export interface ProfileInput {
  readonly schemaVersion: "markdown-trace.document-profile.v1";
  readonly profileId: string;
  readonly interpretation: InterpretationPolicy;
  readonly validation: ValidationPolicy;
}
export interface TraceProfile {
  readonly [compiledProfile]: true;
  readonly profileId: string;
  readonly interpretationHash: Sha256;
  readonly validationHash: Sha256;
}
