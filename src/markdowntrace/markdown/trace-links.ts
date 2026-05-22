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

export interface TraceRangeUrl {
  readonly start: string;
  readonly end: string;
}

export interface TraceEntityDefinitionLink {
  readonly canonicalId: string;
  readonly label: string;
  readonly type?: string;
  readonly headingText: string;
  readonly sectionTargetId?: string;
  readonly sourceRange?: SourceRange;
  readonly definitionSourceRange?: SourceRange;
}

export interface TraceEntityReferenceLink {
  readonly sourceCanonicalId: string;
  readonly canonicalId: string;
  readonly label: string;
  readonly type?: string;
  readonly sourceRange?: SourceRange;
  readonly definitionSourceRange?: SourceRange;
}

export interface TraceRangeReferenceLink {
  readonly sourceCanonicalId: string;
  readonly label: string;
  readonly start: string;
  readonly end: string;
  readonly sourceRange?: SourceRange;
  readonly definitionSourceRange?: SourceRange;
}

interface TraceEntityLinkMatch {
  readonly label: string;
  readonly url: TraceEntityUrl;
  readonly sourceRange?: SourceRange;
  readonly definitionSourceRange?: SourceRange;
}

interface TraceBodyLink {
  readonly sourceCanonicalId: string;
  readonly url: string;
  readonly label?: string;
  readonly sourceRange?: SourceRange;
  readonly definitionSourceRange?: SourceRange;
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

export function parseTraceRangeUrl(url: string): TraceRangeUrl | undefined {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  const pathSegments = parsed.pathname.split("/").filter((segment) => segment !== "");
  const start = pathSegments[1] === undefined ? undefined : decodeURIComponent(pathSegments[1]);
  const end = pathSegments[2] === undefined ? undefined : decodeURIComponent(pathSegments[2]);

  if (
    parsed.protocol !== "ctx:" ||
    parsed.hostname !== "trace" ||
    pathSegments.length !== 3 ||
    pathSegments[0] !== "range" ||
    start === undefined ||
    start.trim() === "" ||
    end === undefined ||
    end.trim() === ""
  ) {
    return undefined;
  }

  return { start, end };
}

export function collectTraceEntityDefinitions(
  headings: readonly EngineNode[],
  sections: readonly EngineSection[],
  linkReferences: readonly EngineLinkReference[] = [],
): readonly TraceEntityDefinitionLink[] {
  return headings.flatMap((heading) => {
    const link = findHeadingTraceEntityLink(heading, linkReferences);

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
        definitionSourceRange: link.definitionSourceRange,
      },
    ];
  });
}

export function collectTraceEntityReferences(
  document: EngineDocument,
  definitions: readonly TraceEntityDefinitionLink[],
): readonly TraceEntityReferenceLink[] {
  return collectTraceBodyLinks(document, definitions).flatMap((link) => {
    const url = parseTraceEntityUrl(link.url);

    if (url === undefined) {
      return [];
    }

    return [
      {
        sourceCanonicalId: link.sourceCanonicalId,
        canonicalId: url.canonicalId,
        label: link.label ?? url.canonicalId,
        type: url.type,
        sourceRange: link.sourceRange,
        definitionSourceRange: link.definitionSourceRange,
      },
    ];
  });
}

export function collectTraceRangeReferences(
  document: EngineDocument,
  definitions: readonly TraceEntityDefinitionLink[],
): readonly TraceRangeReferenceLink[] {
  return collectTraceBodyLinks(document, definitions).flatMap((link) => {
    const url = parseTraceRangeUrl(link.url);

    if (url === undefined) {
      return [];
    }

    return [
      {
        sourceCanonicalId: link.sourceCanonicalId,
        label: link.label ?? `${url.start} through ${url.end}`,
        start: url.start,
        end: url.end,
        sourceRange: link.sourceRange,
        definitionSourceRange: link.definitionSourceRange,
      },
    ];
  });
}

function collectTraceBodyLinks(
  document: EngineDocument,
  definitions: readonly TraceEntityDefinitionLink[],
): readonly TraceBodyLink[] {
  const linkReferences = documentQueries.linkReferences(document);

  return definitions.flatMap((definition) =>
    sectionBodySourceSlicesForTarget(document, definition.sectionTargetId).flatMap((slice) =>
      linkReferences.flatMap((link) => {
        if (
          link.url === undefined ||
          !isSupportedReferenceLink(link) ||
          !sourceRangeContains(slice.range, link.sourceRange)
        ) {
          return [];
        }

        return [
          {
            sourceCanonicalId: definition.canonicalId,
            url: link.url,
            label: link.text ?? link.label,
            sourceRange: link.sourceRange,
            definitionSourceRange: link.definitionTarget?.sourceRange,
          },
        ];
      }),
    ),
  );
}

function findHeadingTraceEntityLink(
  heading: EngineNode,
  linkReferences: readonly EngineLinkReference[],
): TraceEntityLinkMatch | undefined {
  for (const child of heading.children ?? []) {
    const link = findTraceEntityLink(child, linkReferences);

    if (link !== undefined) {
      return link;
    }
  }

  return undefined;
}

function findTraceEntityLink(
  node: EngineNode,
  linkReferences: readonly EngineLinkReference[],
): TraceEntityLinkMatch | undefined {
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

  const linkReference = findNodeLinkReference(node, linkReferences);

  if (linkReference?.url !== undefined) {
    const referenceUrl = parseTraceEntityUrl(linkReference.url);

    if (referenceUrl !== undefined) {
      return {
        label: linkReference.text ?? linkReference.label ?? referenceUrl.canonicalId,
        url: referenceUrl,
        sourceRange: linkReference.sourceRange ?? node.sourceRange,
        definitionSourceRange: linkReference.definitionTarget?.sourceRange,
      };
    }
  }

  for (const child of node.children ?? []) {
    const link = findTraceEntityLink(child, linkReferences);

    if (link !== undefined) {
      return link;
    }
  }

  return undefined;
}

function isSupportedReferenceLink(link: EngineLinkReference): boolean {
  return link.kind === "link" || link.kind === "linkReference";
}

function findNodeLinkReference(
  node: EngineNode,
  linkReferences: readonly EngineLinkReference[],
): EngineLinkReference | undefined {
  const targetId = node.target?.id;

  if (targetId === undefined) {
    return undefined;
  }

  return linkReferences.find((link) => link.target.id === targetId);
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
