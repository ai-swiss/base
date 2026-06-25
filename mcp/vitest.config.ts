import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // Type-only modules are erased at compile time (imported solely via `import type`), so they
      // carry no runtime to cover: counting them in the denominator is meaningless and would let a
      // pure-types extraction silently sink the gate. Exclude them explicitly. If you add another
      // type-only file, list it here.
      exclude: ["src/types.ts"],
      // Floors sit just under the measured baseline so any regression fails loudly,
      // mirroring the backend 90/80/90 gate philosophy (one honest number per stack).
      thresholds: {
        lines: 74,
        statements: 74,
        branches: 80,
        functions: 82,
      },
    },
  },
});
