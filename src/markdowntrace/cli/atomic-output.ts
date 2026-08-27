import { randomUUID } from "node:crypto";
import { mkdir, open, rename, unlink, type FileHandle } from "node:fs/promises";
import path from "node:path";

export async function writeOutputAtomically(
  outputPath: string,
  output: string,
): Promise<void> {
  const resolvedOutputPath = path.resolve(outputPath);
  const outputDirectory = path.dirname(resolvedOutputPath);
  const temporaryPath = path.join(
    outputDirectory,
    `.markdown-trace-${process.pid}-${randomUUID()}.tmp`,
  );
  let temporaryFile: FileHandle | undefined;
  let temporaryCreated = false;
  let committed = false;

  try {
    await mkdir(outputDirectory, { recursive: true });
    temporaryFile = await open(temporaryPath, "wx", 0o666);
    temporaryCreated = true;
    await temporaryFile.writeFile(output, "utf8");
    await temporaryFile.sync();
    await temporaryFile.close();
    temporaryFile = undefined;
    await rename(temporaryPath, resolvedOutputPath);
    committed = true;
  } finally {
    try {
      await closeIfOpen(temporaryFile);
    } finally {
      if (temporaryCreated && !committed) {
        await removeIfPresent(temporaryPath);
      }
    }
  }
}

async function closeIfOpen(file: FileHandle | undefined): Promise<void> {
  if (file !== undefined) {
    await file.close();
  }
}

async function removeIfPresent(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (error) {
    if (!isMissingPath(error)) {
      throw error;
    }
  }
}

function isMissingPath(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error &&
    "code" in error &&
    (error.code === "ENOENT" || error.code === "ENOTDIR");
}
