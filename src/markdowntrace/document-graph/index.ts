/** Experimental graph APIs; validation, traversal and context projection follow separately. */
export { compileProfile } from "./profile.js";
export { analyzeDocument } from "./analyze.js";
export { lookupIdentifier, findIncoming, findOutgoing } from "./queries.js";
export { exportMermaid } from "./export/mermaid.js";
export type * from "./contracts/source.js";
export type * from "./contracts/profile.js";
export type * from "./contracts/analysis.js";
export type * from "./contracts/query.js";
