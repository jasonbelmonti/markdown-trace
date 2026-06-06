export const POLICY_VERSION = "markdown-trace.r0.raw-role-policy.v1";

const DEFINITION_HEADERS = new Set(["id", "step id"]);
const COVERAGE_HEADERS = new Set([
  "acceptance",
  "completion evidence",
  "completion horizon",
  "controls",
  "covered work",
  "covers",
  "decision gate",
  "dependencies",
  "evidence",
  "evidence artifact",
  "evidence required to retire",
  "inputs",
  "milestone",
  "milestone gate",
  "milestones",
  "package boundaries",
  "package boundary",
  "prerequisites",
  "related ids",
  "related requirements",
  "release or ops",
  "review",
  "review gate",
  "risk retired",
  "validation",
  "validation checkpoint",
  "validation or resolution plan",
  "verification",
  "work packages",
]);

export function normalizeHeader(value) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function rowKey(context) {
  return `${context.tableIndex}:${context.rowIndex}`;
}

export function cellKey(context) {
  return `${context.tableIndex}:${context.rowIndex}:${context.columnIndex}`;
}

export function isDefinitionHeader(header) {
  return DEFINITION_HEADERS.has(header);
}

export function isCoverageHeader(header) {
  return COVERAGE_HEADERS.has(header);
}

export function isCoverageMatrixTable(table, sectionTitle) {
  const normalizedTitle = normalizeHeader(sectionTitle);
  const headers = tableHeaders(table);

  return (
    normalizedTitle.includes("traceability matrix") ||
    (headers.includes("source, objective, or evidence-led claim") &&
      headers.includes("change surfaces") &&
      headers.includes("validation")) ||
    (headers.includes("requirement") && headers.includes("behavior") && headers.includes("acceptance"))
  );
}

function tableHeaders(table) {
  return (table?.cells ?? [])
    .filter((cell) => cell.header)
    .sort((left, right) => left.columnIndex - right.columnIndex)
    .map((cell) => normalizeHeader(cell.text));
}
