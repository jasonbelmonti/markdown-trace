import {
  documentQueries,
  type EngineDocument,
  type EngineLinkReference,
  type EngineNode,
  type EngineSection,
  type SourceRange,
} from "@jasonbelmonti/markdown-engine";

import { sectionBodySourceSlicesForTarget } from "./source-slices.js";

export interface TraceEntityUrl {
  readonly canonicalId: string;
  readonly type?: string;
}

export interface TraceEntityDefinitionLink {
  readonly canonicalId: string;
  readonly label: string;
  readonly type?: string;
  readonly headingText: string;
  readonly sectionTargetId?: string;
  readonly sourceRange?: SourceRange;
}

export interface TraceEntityReferenceLink {
  readonly sourceCanonicalId: string;
  readonly canonicalId: string;
  readonly label: string;
  readonly type?: string;
  readonly sourceRange?: SourceRange;
}

interface TraceEntityLinkMatch {
  readonly label: string;
  readonly url: TraceEntityUrl;
  readonly sourceRange?: SourceRange;
}

export function parseTraceEntityUrl(url: string): TraceEntityUrl | undefined {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  const pathSegments = parsed.pathname.split("/").filter((segment) => segment !== "");
  const canonicalId =
    pathSegments[1] === undefined ? undefined : decodeURIComponent(pathSegments[1]);
  const type = parsed.searchParams.get("type") ?? undefined;

  if (
    parsed.protocol !== "ctx:" ||
    parsed.hostname !== "trace" ||
    pathSegments.length !== 2 ||
    pathSegments[0] !== "entity" ||
    canonicalId === undefined ||
    canonicalId.trim() === "" ||
    (type !== undefined && type.trim() === "")
  ) {
    return undefined;
  }

  return {
    canonicalId,
    ...(type === undefined ? {} : { type }),
  };
}

export function collectTraceEntityDefinitions(
  headings: readonly EngineNode[],
  sections: readonly EngineSection[],
): readonly TraceEntityDefinitionLink[] {
  return headings.flatMap((heading) => {
    const link = findHeadingTraceEntityLink(heading);

    if (link === undefined) {
      return [];
    }

    const section = sections.find(
      (candidate) => candidate.headingTarget.id === heading.target?.id,
    );

    return [
      {
        canonicalId: link.url.canonicalId,
        label: link.label,
        type: link.url.type,
        headingText: heading.source?.text ?? headingTextFallback(heading),
        sectionTargetId: section?.target.id,
        sourceRange: link.sourceRange,
      },
    ];
  });
}

export function collectTraceEntityReferences(
  document: EngineDocument,
  definitions: readonly TraceEntityDefinitionLink[],
): readonly TraceEntityReferenceLink[] {
  const linkReferences = documentQueries.linkReferences(document);

  return definitions.flatMap((definition) =>
    sectionBodySourceSlicesForTarget(document, definition.sectionTargetId).flatMap((slice) =>
      linkReferences.flatMap((link) => {
        if (!isSupportedReferenceLink(link) || !sourceRangeContains(slice.range, link.sourceRange)) {
          return [];
        }

        const url = link.url === undefined ? undefined : parseTraceEntityUrl(link.url);

        if (url === undefined) {
          return [];
        }

        return [
          {
            sourceCanonicalId: definition.canonicalId,
            canonicalId: url.canonicalId,
            label: link.text ?? link.label ?? url.canonicalId,
            type: url.type,
            sourceRange: link.sourceRange,
          },
        ];
      }),
    ),
  );
}

function findHeadingTraceEntityLink(heading: EngineNode): TraceEntityLinkMatch | undefined {
  for (const child of heading.children ?? []) {
    const link = findTraceEntityLink(child);

    if (link !== undefined) {
      return link;
    }
  }

  return undefined;
}

function findTraceEntityLink(node: EngineNode): TraceEntityLinkMatch | undefined {
  if (node.type === "link" && typeof node.attributes?.url === "string") {
    const url = parseTraceEntityUrl(node.attributes.url);

    if (url !== undefined) {
      return {
        label: node.text ?? url.canonicalId,
        url,
        sourceRange: node.sourceRange,
      };
    }
  }

  for (const child of node.children ?? []) {
    const link = findTraceEntityLink(child);

    if (link !== undefined) {
      return link;
    }
  }

  return undefined;
}

function isSupportedReferenceLink(link: EngineLinkReference): boolean {
  return link.kind === "link" || link.kind === "linkReference";
}

function sourceRangeContains(
  container: SourceRange,
  candidate: SourceRange | undefined,
): boolean {
  const containerStart = container.start.offset;
  const containerEnd = container.end.offset;
  const candidateStart = candidate?.start.offset;
  const candidateEnd = candidate?.end.offset;

  return (
    containerStart !== undefined &&
    containerEnd !== undefined &&
    candidateStart !== undefined &&
    candidateEnd !== undefined &&
    candidateStart >= containerStart &&
    candidateEnd <= containerEnd
  );
}

function headingTextFallback(heading: EngineNode): string {
  const depth = typeof heading.attributes?.depth === "number" ? heading.attributes.depth : 1;
  return `${"#".repeat(depth)} ${heading.text ?? ""}`.trim();
}
