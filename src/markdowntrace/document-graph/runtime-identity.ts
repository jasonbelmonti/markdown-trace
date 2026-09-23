import { SOURCE_COMMIT } from "../generated/build-source.js";
import { runtimeMetadata } from "../runtime-metadata.js";
import { ANALYZER_VERSION } from "./versions.js";

/** Build identity is immutable data; identity mode never reads files or invokes Git. */
export function documentRuntimeInfo() {
  const metadata = runtimeMetadata();
  return {
    schemaVersion: "markdown-trace.runtime-info.v1",
    package: "@jasonbelmonti/markdown-trace",
    packageVersion: metadata.packageVersion,
    sourceCommit: SOURCE_COMMIT,
    markdownEngineVersion: metadata.markdownEngineVersion,
    analyzerVersion: ANALYZER_VERSION,
    languageVersion: "markdown-trace.identity.draft2",
    validationProfileVersion: "markdown-trace.validation-profile.experimental.v1",
    graphVersion: "markdown-trace.document-graph.v1",
    validationResultVersion: "markdown-trace.validation-result.experimental.v1",
    nodeVersion: metadata.runtimeVersion,
  };
}
