import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { loadTypeProfile, parseTypeProfileData } from "../src/markdowntrace/profiles/loader.js";
import { TYPE_PROFILE_VERSION } from "../src/markdowntrace/profiles/model.js";
import {
  DERIVED_EDGE_RELATIONSHIP,
  deriveRegistryResultFromMarkdown,
  deriveRegistryResultFromMarkdownText,
} from "../src/markdowntrace/registry/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDirectory = "fixtures/r1-link-backed-entity-syntax";
const codefactoryDocument = `${fixtureDirectory}/codefactory-link-backed-spec.md`;
const codefactoryProfile = path.join(repoRoot, fixtureDirectory, "codefactory-type-profile.yaml");
const codefactoryComponentPattern = "^codefactory\\.component\\.[a-z0-9.-]+$";
const codefactoryComponentProfile = {
  profileVersion: TYPE_PROFILE_VERSION,
  entityTypes: {
    codefactory_component: {
      labelPrefixes: ["CF-COMP"],
      canonicalPattern: codefactoryComponentPattern,
    },
  },
} as const;

describe("R1 type profiles", () => {
  it("loads a local markdown-trace type profile as typed profile data", async () => {
    const profile = await loadTypeProfile(codefactoryProfile);

    expect(profile).toEqual({
      profileVersion: TYPE_PROFILE_VERSION,
      entityTypes: {
        codefactory_component: {
          labelPrefixes: ["CF-COMP"],
          canonicalPattern: codefactoryComponentPattern,
        },
        codefactory_decision: {
          labelPrefixes: ["CF-DEC"],
          canonicalPattern: "^codefactory\\.decision\\.[a-z0-9.-]+$",
        },
      },
    });
  });

  it.each([
    {
      name: "root value",
      data: [],
      message: "bad profile must be a YAML mapping",
    },
    {
      name: "profile version",
      data: { profileVersion: "markdown-trace.type-profile.v0", entityTypes: { work: {} } },
      message: `bad profile profileVersion must be ${TYPE_PROFILE_VERSION}`,
    },
    {
      name: "entity types",
      data: { profileVersion: TYPE_PROFILE_VERSION, entityTypes: {} },
      message: "bad profile entityTypes must be a non-empty mapping",
    },
    {
      name: "type name",
      data: { profileVersion: TYPE_PROFILE_VERSION, entityTypes: { Work: {} } },
      message: "bad profile entity type 'Work' is invalid",
    },
    {
      name: "label prefixes",
      data: {
        profileVersion: TYPE_PROFILE_VERSION,
        entityTypes: { work_package: { labelPrefixes: [""] } },
      },
      message:
        "bad profile entityTypes.work_package.labelPrefixes must be a non-empty string list",
    },
    {
      name: "canonical pattern",
      data: {
        profileVersion: TYPE_PROFILE_VERSION,
        entityTypes: { work_package: { canonicalPattern: "[" } },
      },
      message: "bad profile entityTypes.work_package.canonicalPattern must be a valid RegExp",
    },
  ])("fails deterministically for malformed profile $name", ({ data, message }) => {
    expect(() => parseTypeProfileData(data, "bad profile")).toThrow(message);
  });

  it("fails when non-R0 ctx trace documents omit an active profile", () => {
    expect(() =>
      deriveRegistryResultFromMarkdownText(
        [
          "# Mission Plan",
          "",
          "### [WP-1](ctx://trace/entity/exec.wp.1?type=work_package): Build parser",
        ].join("\n"),
        { documentPath: "mission.md" },
      ),
    ).toThrow("mission.md:3:5 requires a type profile for ctx://trace entity links");
  });

  it("fails unknown entity types against the active closed profile", () => {
    expect(() =>
      deriveRegistryResultFromMarkdownText(
        [
          "# Mission Plan",
          "",
          "### [CF-COMP-1](ctx://trace/entity/codefactory.component.parser?type=unknown_component): Parser",
        ].join("\n"),
        {
          documentPath: "mission.md",
          typeProfile: codefactoryComponentProfile,
        },
      ),
    ).toThrow("entity type 'unknown_component' is not declared by the active profile");
  });

  it("fails declared label-prefix violations deterministically", () => {
    expect(() =>
      deriveRegistryResultFromMarkdownText(
        [
          "# Mission Plan",
          "",
          "### [CF-DEC-1](ctx://trace/entity/codefactory.component.parser?type=codefactory_component): Parser",
        ].join("\n"),
        {
          documentPath: "mission.md",
          typeProfile: codefactoryComponentProfile,
        },
      ),
    ).toThrow("label 'CF-DEC-1' does not match type 'codefactory_component' label prefixes");
  });

  it("fails declared canonical-ID pattern violations deterministically", () => {
    expect(() =>
      deriveRegistryResultFromMarkdownText(
        [
          "# Mission Plan",
          "",
          "### [CF-COMP-1](ctx://trace/entity/exec.wp.1?type=codefactory_component): Parser",
        ].join("\n"),
        {
          documentPath: "mission.md",
          typeProfile: codefactoryComponentProfile,
        },
      ),
    ).toThrow(
      "canonical id 'exec.wp.1' does not match type 'codefactory_component' pattern",
    );
  });

  it("derives CODEFACTORY-style fixtures without Markdown Trace core type changes", async () => {
    const { registry, diagnostics } = await deriveRegistryResultFromMarkdown(
      path.join(repoRoot, codefactoryDocument),
      {
        documentPath: codefactoryDocument,
        typeProfilePath: codefactoryProfile,
      },
    );

    expect(diagnostics).toEqual([]);
    expect(registry.document).toMatchObject({
      id: "markdown-trace.r1.fixture.codefactory-link-backed",
      title: "CODEFACTORY R1 Link-Backed Fixture",
      path: codefactoryDocument,
      fixtureFamily: "r1-link-backed-entity-syntax",
    });
    expect(registry.entities.map((entity) => [entity.id, entity.label, entity.type])).toEqual([
      ["codefactory.component.parser", "CF-COMP-1", "codefactory_component"],
      ["codefactory.decision.profile-contract", "CF-DEC-1", "codefactory_decision"],
    ]);
    expect(
      registry.entitiesById.get("codefactory.component.parser")?.expectedReferences,
    ).toEqual({
      labels: ["CF-DEC-1"],
      ranges: [],
    });
    expect(registry.edges).toEqual([
      {
        source: "codefactory.component.parser",
        relationship: DERIVED_EDGE_RELATIONSHIP,
        target: "codefactory.decision.profile-contract",
      },
    ]);
  });
});
