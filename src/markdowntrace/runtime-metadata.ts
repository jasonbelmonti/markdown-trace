import {
  MARKDOWN_ENGINE_PACKAGE_VERSION,
  MARKDOWN_TRACE_PACKAGE_VERSION,
} from "./generated/release-metadata.js";

export interface RuntimeMetadata {
  readonly packageVersion: typeof MARKDOWN_TRACE_PACKAGE_VERSION;
  readonly markdownEngineVersion: typeof MARKDOWN_ENGINE_PACKAGE_VERSION;
  readonly runtimeVersion: string;
}

export function runtimeMetadata(): RuntimeMetadata {
  return {
    packageVersion: MARKDOWN_TRACE_PACKAGE_VERSION,
    markdownEngineVersion: MARKDOWN_ENGINE_PACKAGE_VERSION,
    runtimeVersion: process.version,
  };
}
