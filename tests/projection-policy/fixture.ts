import { readFileSync } from "node:fs";
import type { ProjectionPolicyInput } from "../../docs/design/projection-policy/contracts.js";
import { projectionOracle } from "./oracle.js";

export const fixtureSource = readFileSync("tests/projection-policy/single-task.md", "utf8");
export const fixtureProfileJson = readFileSync("tests/projection-policy/profile.json", "utf8");
export const fixturePolicyJson = readFileSync("tests/projection-policy/policy.json", "utf8");
export const fixturePolicy = JSON.parse(fixturePolicyJson) as ProjectionPolicyInput;
export { projectionOracle };
