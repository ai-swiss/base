// tools/core/progress.mjs — one progress convention, on STDERR. Long CLI legs (an Ollama eval, the
// embedding precompute, a large validate) must show "which stage, roughly how far" — never noise,
// never silence. stderr (not stdout) is mandatory: stdout is reserved for the RESULT, the only split
// that survives the MCP (JSON-RPC) and `--json` paths.
//
// SILENT unless attached to a TTY or BASE_PROGRESS is set — so a pipe or CI stays clean. On a TTY the
// line rewrites in place (\r); piped (with BASE_PROGRESS), each step is its own line. The render form
// `[done/total] stage · label` is the same one `tools/eval/run.mjs` already prints.

/**
 * A progress reporter for one stage. Returns `(done, total, label?) => void` that writes
 * `[done/total] stage · label` to stderr. The stream write is the only side effect.
 * @param {string} stage @param {{ stream?: NodeJS.WriteStream, env?: NodeJS.ProcessEnv }} [io]
 */
export function reportProgress(stage, { stream = process.stderr, env = process.env } = {}) {
  const tty = Boolean(stream.isTTY);
  if (!tty && !env.BASE_PROGRESS) return () => {};
  return (done, total, label) => {
    const line = `[${done}/${total}] ${stage}${label ? ` · ${label}` : ""}`;
    stream.write(tty ? `\r${line}\x1b[K${done >= total ? "\n" : ""}` : `${line}\n`);
  };
}
