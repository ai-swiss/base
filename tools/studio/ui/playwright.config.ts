import { defineConfig, devices } from "@playwright/test";

// Thin end-to-end layer: drives the real UI + Studio API + broker (booted by e2e/serve.mjs on isolated
// ports 5199/4399 against a throwaway copy of the example). Uses the installed Google Chrome via the
// "chrome" channel, so there is no chromium download. One worker: a shared, mutating backend.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "list" : "list",
  use: {
    baseURL: "http://localhost:5199",
    trace: "on-first-retry",
    reducedMotion: "reduce", // animations are a flourish; audits and assertions must not race them
  },
  projects: [{ name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: {
    command: "node e2e/serve.mjs",
    url: "http://localhost:5199",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
