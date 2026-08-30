import { spawnSync } from "node:child_process";

export function run(command, arguments_, options = {}) {
  const result = spawnSync(command, arguments_, {
    encoding: "utf8",
    ...options,
  });

  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      [
        `command failed (${result.status}): ${command} ${arguments_.join(" ")}`,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return result;
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
