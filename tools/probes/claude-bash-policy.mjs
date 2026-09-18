#!/usr/bin/env node

import * as path from "node:path";
import { pathToFileURL } from "node:url";

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();

async function main() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  let event;
  try {
    event = JSON.parse(input);
  } catch {
    deny("Commande refusée: entrée du hook invalide.");
  }
  const command = event?.tool_input?.command;
  if (typeof command !== "string" || !isAllowedBaseCommand(command)) {
    deny("Seules les commandes BASE de validation, construction, revue et écriture médiée sont autorisées dans ce probe.");
  }
}

function isAllowedBaseCommand(command, cwd = process.cwd()) {
  const unwrapped = unwrapCwdPrefix(command.trim(), cwd);
  if (unwrapped === null || /[\\;&|`$()<>\r\n]/u.test(unwrapped)) return false;
  if (/(?:^|[\s"'])(?:\/|~\/|\.\.(?:\/|\\|$))/u.test(unwrapped)) return false;
  if (/--root(?:=|\s+)(?!\.(?:\s|$))/u.test(unwrapped)) return false;
  const entry = String.raw`(?:base|node\s+\.ai/base\.mjs)`;
  const operation = String.raw`(?:validate|doctor|route-test|changes|propose|commit|build\s+routing-index|docs\s+build)`;
  return new RegExp(`^${entry}\\s+${operation}(?:\\s+[^\\r\\n]*)?$`, "u").test(unwrapped);
}

function unwrapCwdPrefix(command, cwd) {
  const wrapper = /^cd\s+(?:"([^"]+)"|'([^']+)'|([^\s;&|]+))\s+&&\s+(.+)$/u.exec(command);
  if (!wrapper) return command;
  const target = wrapper[1] ?? wrapper[2] ?? wrapper[3];
  return path.resolve(target) === path.resolve(cwd) ? wrapper[4].trim() : null;
}

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

export { isAllowedBaseCommand };
