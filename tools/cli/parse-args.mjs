// The CLI argument parser: argv (string[]) -> a flat options object. Pure and dependency-free, so
// it is unit-testable in isolation and carries no knowledge of the broker. Each flag validates its
// own value eagerly (a missing/another-flag value throws here, not three calls deep). Unknown,
// non-flag tokens accumulate in `positional` in order; command dispatch lives in base.mjs.

export function parseArgs(argv) {
  const args = {
    root: "",
    workspace: "",
    rootId: "",
    json: false,
    limit: /** @type {number | undefined} */ (undefined),
    projection: "full",
    execute: false,
    confirmed: false,
    grantToken: "",
    purpose: "",
    from: "",
    to: "",
    write: false,
    check: false,
    public: false,
    yes: false,
    out: "",
    keepDays: /** @type {number | undefined} */ (undefined),
    positional: /** @type {string[]} */ ([]),
  };

  for (let index = 0; index < argv.length; index++) {
    const item = argv[index];
    const next = argv[index + 1];

    if (item === "--root") {
      if (!next || next.startsWith("--")) throw new Error("--root requires a value.");
      args.root = next;
      index++;
      continue;
    }

    if (item === "--workspace") {
      if (!next || next.startsWith("--")) throw new Error("--workspace requires a value.");
      args.workspace = next;
      index++;
      continue;
    }

    if (item === "--root-id") {
      if (!next || next.startsWith("--")) throw new Error("--root-id requires a value.");
      args.rootId = next;
      index++;
      continue;
    }

    if (item === "--json") {
      args.json = true;
      continue;
    }

    if (item === "--yes") {
      args.yes = true;
      continue;
    }

    if (item === "--limit") {
      if (!next || next.startsWith("--")) throw new Error("--limit requires a value.");
      const parsed = Number(next);
      if (!Number.isInteger(parsed) || parsed < 1) throw new Error("--limit must be a positive integer.");
      args.limit = parsed;
      index++;
      continue;
    }

    if (item === "--config") {
      if (!next || next.startsWith("--")) throw new Error("--config requires a value.");
      args.config = next;
      index++;
      continue;
    }

    if (item === "--projection") {
      if (!next || next.startsWith("--")) throw new Error("--projection requires a value.");
      if (!["metadata", "instructions", "full"].includes(next)) throw new Error("--projection must be metadata, instructions, or full.");
      args.projection = next;
      index++;
      continue;
    }

    if (item === "--execute") {
      args.execute = true;
      continue;
    }

    if (item === "--confirmed") {
      args.confirmed = true;
      continue;
    }

    if (item === "--grant-token") {
      if (!next || next.startsWith("--")) throw new Error("--grant-token requires a value.");
      args.grantToken = next;
      index++;
      continue;
    }

    if (item === "--write") {
      args.write = true;
      continue;
    }

    if (item === "--check") {
      args.check = true;
      continue;
    }

    if (item === "--public") {
      args.public = true;
      continue;
    }

    if (item === "--purpose") {
      if (!next || next.startsWith("--")) throw new Error("--purpose requires a value.");
      args.purpose = next;
      index++;
      continue;
    }

    if (item === "--from") {
      if (!next || next.startsWith("--")) throw new Error("--from requires a file path.");
      args.from = next;
      index++;
      continue;
    }

    if (item === "--to") {
      if (!next || next.startsWith("--")) throw new Error("--to requires a scope value.");
      args.to = next;
      index++;
      continue;
    }

    if (item === "--out") {
      if (!next || next.startsWith("--")) throw new Error("--out requires a directory path.");
      args.out = next;
      index++;
      continue;
    }

    if (item === "--keep-days") {
      if (!next || next.startsWith("--")) throw new Error("--keep-days requires a value.");
      const parsed = Number(next);
      if (!Number.isInteger(parsed) || parsed < 0) throw new Error("--keep-days must be a non-negative integer.");
      args.keepDays = parsed;
      index++;
      continue;
    }

    args.positional.push(item);
  }

  return args;
}
