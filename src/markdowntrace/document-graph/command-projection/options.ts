import { parseArgs } from "node:util";

export interface ProjectionCommandOptions {
  readonly manifestPath: string;
  readonly packetPath?: string;
}

/** Parse only the new adapter flags so legacy options fail in projection mode. */
export function parseProjectionCommandOptions(args: string[]): ProjectionCommandOptions {
  const { values } = parseArgs({ args, options: {
    "projection-manifest": { type: "string" },
    "verify-projection": { type: "string" },
  } });
  const manifestPath = values["projection-manifest"];
  const packetPath = values["verify-projection"];
  if (typeof manifestPath !== "string" || manifestPath.trim().length === 0)
    throw new Error("Projection commands require --projection-manifest PATH.");
  if (packetPath !== undefined && (typeof packetPath !== "string" || packetPath.trim().length === 0))
    throw new Error("--verify-projection requires a packet path.");
  return { manifestPath, ...(packetPath === undefined ? {} : { packetPath }) };
}
