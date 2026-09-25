/** Experimental graph analysis, validation and direct queries. */
export { compileProfile } from "./profile.js";
export { analyzeDocument } from "./analyze.js";
export { lookupIdentifier, findIncoming, findOutgoing } from "./queries.js";
export { traverseGraph } from "./traverse.js";
export { exportMermaid } from "./export/mermaid.js";
export { compileValidationProfile } from "./validation/profile.js";
export { validateGraph } from "./validation/validate.js";
export type * from "./contracts/source.js";
export type * from "./contracts/profile.js";
export type * from "./contracts/analysis.js";
export type * from "./contracts/query.js";
export type * from "./contracts/validation-profile.js";
export type * from "./contracts/validation.js";
