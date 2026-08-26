export interface RuntimeMetadata {
  readonly packageVersion: "0.1.0";
  readonly markdownEngineVersion: "2.0.0";
  readonly runtimeVersion: string;
}

export function runtimeMetadata(): RuntimeMetadata {
  return {
    packageVersion: "0.1.0",
    markdownEngineVersion: "2.0.0",
    runtimeVersion: process.version,
  };
}
