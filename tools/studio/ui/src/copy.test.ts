import { describe, expect, it } from "vitest";
import { COPY, PROVIDER_ERRORS, providerErrorText, copyFor } from "./copy";

describe("copy catalog — the formatters with real logic", () => {
  it("formats a successful test with latency, and with the URL when present", () => {
    expect(COPY.settings.provider.testOk(42, "http://x")).toBe("OK, 42 ms (http://x)");
    expect(COPY.settings.provider.testOk(42)).toBe("OK, 42 ms");
  });

  it("renders a known failure code as actionable French, and falls back to the raw error otherwise", () => {
    expect(COPY.settings.provider.testFail({ code: "llm.config", env: "ANTHROPIC_API_KEY" })).toMatch(
      /clé absente: exportez ANTHROPIC_API_KEY/,
    );
    expect(COPY.settings.provider.testFail({ code: "llm.auth", env: "OPENAI_API_KEY" })).toMatch(/clé refusée/);
    // Unknown code and no code both fall through to the raw server message — never hidden.
    expect(COPY.settings.provider.testFail({ code: "llm.brand_new", error: "weird" })).toBe("échec: weird");
    expect(COPY.settings.provider.testFail({ error: "ECONNREFUSED" })).toBe("échec: ECONNREFUSED");
  });

  it("providerErrorText is the shared mapper for both the Réglages test and the chat error path", () => {
    expect(providerErrorText({ code: "llm.config", env: "ANTHROPIC_API_KEY" })).toMatch(/clé absente: exportez ANTHROPIC_API_KEY/);
    expect(providerErrorText({ code: "llm.config" })).toMatch(/clé absente: exportez la variable d'environnement/); // no env: generic but still actionable
    expect(providerErrorText({ code: "llm.unknown", error: "raw" })).toBe("raw"); // unknown code: raw message, never hidden
    expect(providerErrorText({ error: "ECONNREFUSED" })).toBe("ECONNREFUSED");
    expect(providerErrorText({})).toBe("erreur inconnue");
  });

  it("maps every base-llm failure code Studio can surface", () => {
    for (const code of ["llm.config", "llm.auth", "llm.rate_limit", "llm.network", "llm.timeout", "llm.response"]) {
      expect(typeof PROVIDER_ERRORS[code]).toBe("function");
      expect(PROVIDER_ERRORS[code]("X")).toBeTruthy();
    }
  });

  it("labels every provider type with a human name", () => {
    for (const t of ["openai-compatible", "ollama", "anthropic", "google"] as const) {
      expect(COPY.settings.providerType[t]).toBeTruthy();
    }
  });

  // The Studio copy lives in code, so the .md punctuation gates never see it (copy.ts header says so).
  // This makes the tight Swiss-romand rule a mechanism here too: a space before : ; ! ? in any COPY
  // string fails the build. Functions are formatters whose dynamic parts (URLs, env names) make a
  // static scan unreliable; their output shape is asserted by the formatter tests above instead.
  it("keeps every COPY string tight: no space before : ; ! ?", () => {
    const offenders: string[] = [];
    const scan = (value: unknown, at: string) => {
      if (typeof value === "string") {
        if (/ [:;!?]/.test(value)) offenders.push(`${at} = ${JSON.stringify(value)}`);
      } else if (value && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) scan(v, `${at}.${k}`);
      }
    };
    scan(COPY, "COPY");
    expect(offenders, `tighten the punctuation in these COPY strings:\n${offenders.join("\n")}`).toEqual([]);
  });
});

describe("bilingual catalog — the Studio language switch", () => {
  it("returns French or English strings by language", () => {
    expect(copyFor("fr").common.add).toBe("Ajouter");
    expect(copyFor("en").common.add).toBe("Add");
    expect(copyFor("fr").settings.title).toBe("Réglages");
    expect(copyFor("en").settings.title).toBe("Settings");
    expect(copyFor("fr").picker.configure).toBe("Configurer les fournisseurs…");
    expect(copyFor("en").picker.configure).toBe("Configure providers…");
  });

  it("localizes provider errors and the connection-test formatter", () => {
    expect(providerErrorText({ code: "llm.config", env: "OPENAI_API_KEY" }, "en")).toMatch(/key missing: export OPENAI_API_KEY/);
    expect(providerErrorText({ code: "llm.config", env: "OPENAI_API_KEY" }, "fr")).toMatch(/clé absente: exportez OPENAI_API_KEY/);
    expect(copyFor("en").settings.provider.testFail({ code: "llm.auth" })).toMatch(/^failed: key rejected/);
    expect(copyFor("fr").settings.provider.testFail({ code: "llm.auth" })).toMatch(/^échec: clé refusée/);
    expect(providerErrorText({ error: "x" }, "en")).toBe("x"); // unknown code: raw message, never hidden
    expect(providerErrorText({}, "en")).toBe("unknown error");
  });

  it("keeps the English catalog in English typography: no guillemets, em-dash, or curly quotes", () => {
    const bad: string[] = [];
    const scan = (value: unknown, at: string) => {
      if (typeof value === "string") {
        if (/[«»—‘’“”]/.test(value)) bad.push(`${at} = ${JSON.stringify(value)}`);
      } else if (value && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) scan(v, `${at}.${k}`);
      }
    };
    scan(copyFor("en"), "EN");
    expect(bad, `English copy must use straight quotes and no em-dash:\n${bad.join("\n")}`).toEqual([]);
  });
});
