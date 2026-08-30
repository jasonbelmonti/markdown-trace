import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

describe("public package exports", () => {
  it(
    "packs a bounded root-only API for a clean consumer",
    () => {
      const result = spawnSync(
        "npm",
        ["run", "check:package-exports", "--silent"],
        {
          cwd: repositoryRoot,
          encoding: "utf8",
          timeout: 60_000,
        },
      );

      expect(result.error).toBeUndefined();
      expect(result.status, [result.stdout, result.stderr].join("\n")).toBe(0);
      expect(result.stdout).toContain(
        "package: @jasonbelmonti/markdown-trace@0.1.0",
      );
      expect(result.stdout).toContain("declaration closure: self-contained");
      expect(result.stdout).toContain("root API: pass");
      expect(result.stdout).toContain("deep imports: rejected");
      expect(result.stdout).toContain("package exports contract: PASS");
    },
    60_000,
  );
});
