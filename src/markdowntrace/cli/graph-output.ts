import { stat } from "node:fs/promises";
import path from "node:path";

interface GraphOutputPaths {
  readonly outputPath: string;
  readonly inputPaths: readonly string[];
}

export async function rejectGraphOutputInputAlias(
  paths: GraphOutputPaths,
): Promise<void> {
  const outputPath = path.resolve(paths.outputPath);

  for (const candidate of paths.inputPaths) {
    const inputPath = path.resolve(candidate);

    if (outputPath === inputPath || await pathsReferenceSameFile(outputPath, inputPath)) {
      throw new Error(`graph-validate output path aliases input path ${inputPath}`);
    }
  }
}

async function pathsReferenceSameFile(left: string, right: string): Promise<boolean> {
  const [leftIdentity, rightIdentity] = await Promise.all([
    fileIdentity(left),
    fileIdentity(right),
  ]);

  return leftIdentity !== undefined &&
    rightIdentity !== undefined &&
    leftIdentity.device === rightIdentity.device &&
    leftIdentity.inode === rightIdentity.inode;
}

async function fileIdentity(
  filePath: string,
): Promise<{ readonly device: number; readonly inode: number } | undefined> {
  try {
    const file = await stat(filePath);
    return { device: file.dev, inode: file.ino };
  } catch (error) {
    if (isMissingPath(error)) {
      return undefined;
    }

    throw error;
  }
}

function isMissingPath(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
