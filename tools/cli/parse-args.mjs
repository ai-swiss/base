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
    golden: "",
    write: false,
    check: false,
    public: false,
    yes: false,
    ollama: false,
    examples: false,
    scaffold: false,
    shell: false,
    grain: "",
    scope: "",
    section: "",
    lang: "",
    tools: /** @type {string[]} */ ([]),
    about: "",
    language: "",
    egress: "",
    out: "",
    keepDays: /** @type {number | undefined} */ (undefined),
    channel: /** @type {string | undefined} */ (undefined),
    strategy: /** @type {string | undefined} */ (undefined),
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
      if (!["metadata", "instructions", "full", "outline", "source"].includes(next)) throw new Error("--projection must be metadata, instructions, full, outline, or source.");
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

    if (item === "--strategy") {
      if (!next || next.startsWith("--")) throw new Error("--strategy requires a value (lexical or production).");
      args.strategy = next;
      index++;
      continue;
    }

    if (item === "--channel") {
      if (!next || next.startsWith("--")) throw new Error("--channel requires a value (stable or main).");
      args.channel = next;
      index++;
      continue;
    }
    if (item === "--ollama") {
      args.ollama = true;
      continue;
    }
    if (item === "--examples") {
      args.examples = true;
      continue;
    }
    // Section grain: the same two words the MCP tools use, so a person checks on the CLI exactly what
    // a remote client will get.
    if (item === "--grain") {
      if (!next || next.startsWith("--")) throw new Error("--grain requires a value (resource or section).");
      if (!["resource", "section"].includes(next)) throw new Error("--grain must be resource or section.");
      args.grain = next;
      index++;
      continue;
    }
    if (item === "--scope") {
      if (!next || next.startsWith("--")) throw new Error("--scope requires a folder prefix.");
      args.scope = next;
      index++;
      continue;
    }
    if (item === "--section") {
      if (!next || next.startsWith("--")) throw new Error("--section requires an anchor.");
      args.section = next;
      index++;
      continue;
    }
    if (item === "--lang") {
      if (!next || next.startsWith("--")) throw new Error("--lang requires a two-letter code.");
      args.lang = next;
      index++;
      continue;
    }
    if (item === "--shell") {
      args.shell = true;
      continue;
    }
    if (item === "--scaffold") {
      args.scaffold = true;
      continue;
    }

    // `base init` intake: which tool reads this folder, and one sentence about the work. Repeatable
    // or comma-separated (`--tool claude-code,cursor`) for a team that genuinely uses two.
    if (item === "--tool") {
      if (!next || next.startsWith("--")) throw new Error("--tool requires a value (claude-code, cursor, agents-md, autre).");
      args.tools = [...args.tools, ...next.split(",").map((s) => s.trim()).filter(Boolean)];
      index++;
      continue;
    }
    if (item === "--about") {
      if (!next || next.startsWith("--")) throw new Error("--about requires a sentence, in quotes.");
      args.about = next;
      index++;
      continue;
    }
    // The language of the files `base init` writes, recorded in base.config.json. Distinct from
    // `--lang`, which picks the EDITION of a resource `base open` returns: one decides which words
    // BASE writes, the other which of the author's translations to read. Any tag is accepted here —
    // a language this build has no table for is recorded and rendered in French, never refused.
    if (item === "--language") {
      if (!next || next.startsWith("--")) throw new Error("--language requires a language code (fr, en, …).");
      args.language = next;
      index++;
      continue;
    }
    if (item === "--egress") {
      if (!["local-only", "any"].includes(next)) throw new Error("--egress accepts local-only or any.");
      args.egress = next;
      index++;
      continue;
    }
    if (item === "--golden") {
      if (!next || next.startsWith("--")) throw new Error("--golden requires a file path.");
      args.golden = next;
      index++;
      continue;
    }

    // Unknown --flags fail loudly (NFR-CORE-004): a typo like `--comfirmed` must not be swallowed
    // into positional and silently ignored. Non-flag tokens still accumulate as positional.
    if (item.startsWith("--")) throw new Error(`Unknown flag: ${item}.`);
    args.positional.push(item);
  }

  return args;
}
