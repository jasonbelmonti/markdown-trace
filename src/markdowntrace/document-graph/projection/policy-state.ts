import type { ProjectionPolicy, ProjectionPolicyInput } from "./contracts.js";

interface IssuedPolicyData {
  readonly raw: string;
  readonly input: ProjectionPolicyInput;
}
const policies = new WeakMap<ProjectionPolicy, IssuedPolicyData>();

export const projectionPolicyData = (policy: ProjectionPolicy): IssuedPolicyData | undefined =>
  policies.get(policy);

export const issueProjectionPolicy = (
  policy: ProjectionPolicy,
  data: IssuedPolicyData,
): void => { policies.set(policy, data); };
