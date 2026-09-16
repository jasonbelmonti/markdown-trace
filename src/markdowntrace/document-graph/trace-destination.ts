import type { Token } from "./extraction-model.js";
import { identifierPattern, slugPattern } from "./value.js";

type Meaning = Pick<Token, "identifier" | "role" | "kind">;
type Destination = { value: Meaning } | { error: string } | null;

// Engine owns Markdown parsing. This function interprets only its resolved URI value.
export function traceDestination(destination: string): Destination {
  if (!/^ctx:/i.test(destination)) return null;
  const invalid = {
    error:
      "Expected ctx://trace/entity/ID with optional role=definition or rel=RELATION",
  };
  let url: URL;
  try {
    url = new URL(destination);
  } catch {
    return invalid;
  }
  const [, segment, identifier, ...extra] = url.pathname.split("/");
  if (
    url.protocol !== "ctx:" ||
    url.hostname !== "trace" ||
    url.username ||
    url.password ||
    url.port ||
    url.hash ||
    segment !== "entity" ||
    extra.length ||
    !identifierPattern.test(identifier ?? "")
  )
    return invalid;
  const parameters = [...url.searchParams];
  let role: Meaning["role"] = "reference",
    kind = "references",
    query = "";
  if (parameters.length === 1) {
    const [key, value] = parameters[0];
    if (key === "role" && value === "definition") role = "definition";
    else if (key === "rel" && slugPattern.test(value)) kind = value;
    else return invalid;
    query = `?${key}=${value}`;
  } else if (parameters.length) return invalid;
  // Reject normalization aliases, encoded components and empty trailing ?/# delimiters.
  if (destination !== `ctx://trace/entity/${identifier}${query}`)
    return invalid;
  return { value: { identifier, role, kind } };
}
