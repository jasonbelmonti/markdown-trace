export function parseTraceUrl(url) {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  const pathSegments = parsed.pathname.split("/").filter(Boolean);

  if (parsed.protocol !== "ctx:" || parsed.hostname !== "trace") {
    return undefined;
  }

  if (pathSegments.length === 2 && pathSegments[0] === "entity") {
    const canonicalId = decodeURIComponent(pathSegments[1]);
    const type = parsed.searchParams.get("type") ?? undefined;

    if (canonicalId.trim() === "" || type === "") {
      return undefined;
    }

    return {
      kind: "entity",
      canonicalId,
      type,
    };
  }

  if (pathSegments.length === 3 && pathSegments[0] === "range") {
    const start = decodeURIComponent(pathSegments[1]);
    const end = decodeURIComponent(pathSegments[2]);

    if (start.trim() === "" || end.trim() === "") {
      return undefined;
    }

    return {
      kind: "range",
      start,
      end,
    };
  }

  return undefined;
}

export function traceUrlFallbackLabel(parsedUrl) {
  if (parsedUrl.kind === "entity") {
    return parsedUrl.canonicalId;
  }

  return `${parsedUrl.start} through ${parsedUrl.end}`;
}
