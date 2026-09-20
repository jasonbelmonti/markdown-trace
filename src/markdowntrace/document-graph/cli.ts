#!/usr/bin/env node
import { runDocumentCommand } from "./command.js";

process.exitCode = await runDocumentCommand(process.argv.slice(2), {
  stdout: text => { process.stdout.write(text); },
  stderr: text => { process.stderr.write(text); },
});
