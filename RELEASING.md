# Releasing BASE

The release process is **prepared but not active**: publishing to npm needs governance sign-off on
who may cut a release and the `NPM_TOKEN` secret. Until both exist, BASE ships as source on GitHub.

There is one source of truth, not two:

- **The step-by-step checklist** (gates, then publish with provenance + SBOM): [`specs/RELEASE.md`](specs/RELEASE.md).
- **Who may release, and succession**: [`GOVERNANCE.md`](GOVERNANCE.md).
- **The publish mechanism**: the manual-only `.github/workflows/release.yml` (dispatch with
  `confirm=PUBLISH`; otherwise a dry run). It fails closed without the token and re-runs every gate.

Why this exists before we publish: a framework whose thesis is *human-verifiable, sovereign* work
must ship an artifact you can verify at install time, so the path is auditable from day one (clean
~520-file surface, Sigstore provenance, CycloneDX SBOM, `npm audit` gate, fail-closed `smoke:pack`).
