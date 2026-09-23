import { spawnSync } from "node:child_process";
import { resolveBinding } from "./resolve-runtime.mjs";

try {
  const executable = await resolveBinding();
  const result = spawnSync(executable, process.argv.slice(2), { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.signal) process.kill(process.pid, result.signal);
  else process.exitCode = result.status ?? 2;
} catch (error) {
  console.error(`Trace runtime unavailable: ${error.message}`);
  process.exitCode = 2;
}
