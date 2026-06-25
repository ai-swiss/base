// tools/core/companion.mjs — load an OPTIONAL companion package on demand.
//
// The BASE core is zero-dependency (NFR-CORE-001): the optional capabilities live in separate
// @ai-swiss/* packages, declared as OPTIONAL peers, never bundled and never on the core load path.
// This loads one on demand and, if it is absent, fails with a clear "install it" message instead of a
// raw ERR_MODULE_NOT_FOUND. The specifier is a variable on purpose — the engine's zero-dep fitness
// scans for static/literal package imports, and this on-demand seam is deliberately none.
//
// Used at the explicit opt-in entry points (build routing-embeddings, route-eval, Studio). The live
// routing path does NOT use this: it fails closed to the lexical strategy instead (route-broker.mjs).

export async function loadCompanion(specifier, feature) {
  try {
    return await import(specifier);
  } catch (error) {
    const missing =
      error?.code === "ERR_MODULE_NOT_FOUND" ||
      error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED" ||
      /Cannot find (package|module)/.test(String(error?.message ?? ""));
    if (!missing) throw error;
    throw Object.assign(
      new Error(
        `${feature} demande le paquet optionnel ${specifier}, qui n'est pas installé.\n` +
          `  Installez-le puis relancez: npm install ${specifier}`,
      ),
      { code: "BASE_COMPANION_MISSING" },
    );
  }
}
