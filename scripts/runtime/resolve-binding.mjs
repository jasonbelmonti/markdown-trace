import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveBinding } from "../../skills/markdown-trace/scripts/resolve-runtime.mjs";

// Preserve the installer entry point; the portable skill owns C-2 selection.
export { resolveBinding };

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    console.log(await resolveBinding());
  } catch (error) {
    console.error(`Runtime binding failed: ${error.message}`);
    process.exitCode = 1;
  }
}
