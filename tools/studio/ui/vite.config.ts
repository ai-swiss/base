/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The dev server proxies /api to the Studio API server (tools/studio/server.mjs), so the UI and the
// broker run as one seamless app in development. Ports are env-overridable so an isolated instance
// (e.g. the Playwright E2E run) can coexist with a normal `npm run dev` on the defaults.
const uiPort = Number(process.env.STUDIO_UI_PORT) || 5174;
const apiPort = process.env.STUDIO_API_PORT || "4319";

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind IPv4 loopback explicitly: the API and docs site both use 127.0.0.1, and `dev.mjs`
    // advertises 127.0.0.1 — without this Vite defaults to `localhost`, which resolves to `::1`
    // (IPv6) on dual-stack machines, so the printed URL would refuse the connection.
    host: "127.0.0.1",
    port: uiPort,
    proxy: {
      "/api": `http://127.0.0.1:${apiPort}`,
    },
  },
  // Component / hook tests run in jsdom against the real components, with `fetch` stubbed at the
  // api.ts boundary. End-to-end tests (Playwright) live under e2e/ and are not part of this run.
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/test-setup.ts", "src/**/*.test.{ts,tsx}", "src/vite-env.d.ts"],
      reporter: ["text-summary", "text"],
      // Floors sit just under the measured baseline so any regression fails loudly (the project's
      // one-honest-number-per-stack doctrine, same as the backend/mcp gates). Several feature
      // components (FileCard, TerrainPile, RunCard, ModelPicker, DoctorBanner) are covered by the
      // Playwright E2E suite (e2e/*.spec.ts) rather than jsdom unit tests, which is why the unit floor
      // is below the ~99% that the originally unit-tested surface reached. Backfilling unit tests for
      // those components is the way to ratchet these floors back up; v8 also counts every inline
      // closure as a "function", so that metric reads low even at high line coverage.
      thresholds: { lines: 82, statements: 82, branches: 83, functions: 64 },
    },
  },
});
