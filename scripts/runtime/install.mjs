import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { activate, rollback, stage, status, verify } from "./installed-release.mjs";

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { root: { type: "string" }, candidate: { type: "string" }, release: { type: "string" } },
  });
  const [action] = positionals;
  if (positionals.length !== 1 || !values.root) throw new Error("Usage: install.mjs <stage|verify|activate|rollback|status> --root DIRECTORY [--candidate DIRECTORY|--release ID]");
  const root = resolve(values.root);
  let result;
  switch (action) {
    case "stage":
      if (!values.candidate || values.release) throw new Error("stage requires --candidate only");
      result = await stage(root, values.candidate); break;
    case "verify":
      if (!values.release || values.candidate) throw new Error("verify requires --release only");
      { const slot = await verify(root, values.release);
        result = { id: slot.id, launcher: slot.launcher, identity: slot.descriptor.identity }; }
      break;
    case "activate":
      if (!values.release || values.candidate) throw new Error("activate requires --release only");
      result = await activate(root, values.release); break;
    case "rollback":
      if (!values.release || values.candidate) throw new Error("rollback requires --release only");
      result = await rollback(root, values.release); break;
    case "status":
      if (values.release || values.candidate) throw new Error("status accepts only --root");
      result = await status(root); break;
    default: throw new Error("Unknown installer action");
  }
  console.log(JSON.stringify(result));
} catch (error) {
  console.error(`Runtime installation failed: ${error.message}`);
  process.exitCode = 1;
}
