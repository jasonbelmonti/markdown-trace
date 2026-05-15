import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export async function withTemporaryFile<T>(
  prefix: string,
  fileName: string,
  text: string,
  callback: (file: string) => Promise<T>,
): Promise<T> {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), prefix));

  try {
    const file = path.join(temporaryDirectory, fileName);
    await writeFile(file, text, "utf8");
    return await callback(file);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

export function replaceRequired(text: string, search: string, replacement: string): string {
  if (!text.includes(search)) {
    throw new Error(`fixture text did not contain ${search}`);
  }

  return text.replace(search, replacement);
}
