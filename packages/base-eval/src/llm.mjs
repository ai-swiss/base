// The message-contract boundary. base-eval is built on the @ai-swiss/base-llm port and reuses its
// canonical message model — there is no second copy of the shape. This is the SINGLE place the
// dependency is imported, by its published package specifier so the tarball resolves the same way
// in the monorepo (via the workspace symlink) and after `npm install`. base-llm is a required
// (non-optional) peer dependency — see package.json.
export { getText, getToolCalls, systemMessage, toolMessage, userMessage } from "@ai-swiss/base-llm";
