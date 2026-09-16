import type { ProfileInput } from "../contracts/index.js";
export const profileInput = {
  schemaVersion: "markdown-trace.document-profile.v1",
  profileId: "implementation-spec",
  interpretation: {
    language: "markdown-trace.identity.draft2",
    entityKinds: [
      { name: "requirement", prefixes: ["REQ"] },
      { name: "work", prefixes: ["WP"] },
      { name: "validation", prefixes: ["VAL"] },
    ],
  },
  validation: {
    minEntities: 1,
    allowedRelations: [
      { kind: "references", from: ["work"], to: ["requirement"] },
      { kind: "implements", from: ["work"], to: ["requirement"] },
      { kind: "verifies", from: ["validation"], to: ["work"] },
    ],
    rules: [
      { id: "work-exists", op: "entity-count", kinds: ["work"], min: 1, max: null },
      { id: "work-has-requirement", op: "require-relation", sourceKinds: ["work"],
        relation: "implements", targetKinds: ["requirement"], minTargets: 1, maxTargets: null },
    ],
  },
} as const satisfies ProfileInput;
