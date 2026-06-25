// Vitest setup: register jest-dom matchers (toBeInTheDocument, toBeDisabled, …) and reset the DOM +
// mocks between tests so each test is isolated.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
