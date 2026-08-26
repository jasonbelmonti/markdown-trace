import type { GraphDiagnosticRule } from "./model.js";
import { deepFreeze } from "./validation/primitives.js";

export const GRAPH_DIAGNOSTIC_RULES: readonly GraphDiagnosticRule[] = deepFreeze([
  {
    code: "markdown-trace.graph.unresolved_reference",
    severity: "error",
    blocking: true,
    repairActionKinds: ["define_missing_id", "remove_or_replace_reference"],
  },
  {
    code: "markdown-trace.graph.duplicate_primary_definition",
    severity: "error",
    blocking: true,
    repairActionKinds: ["deduplicate_primary_definition"],
  },
  {
    code: "markdown-trace.graph.invalid_range_endpoint",
    severity: "error",
    blocking: true,
    repairActionKinds: ["define_range_endpoint", "narrow_range"],
  },
  {
    code: "markdown-trace.graph.missing_matrix_coverage",
    severity: "error",
    blocking: true,
    repairActionKinds: ["add_matrix_coverage"],
  },
  {
    code: "markdown-trace.graph.missing_required_path",
    severity: "error",
    blocking: true,
    repairActionKinds: ["add_required_relationship_evidence"],
  },
  {
    code: "markdown-trace.graph.profile_error",
    severity: "error",
    blocking: true,
    repairActionKinds: ["fix_graph_profile"],
  },
]);
