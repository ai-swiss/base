# Release checklist

Run this top to bottom from a clean checkout before tagging a release. Every step is reproducible
locally and mirrors CI; if a step is red, the release is not ready. Durations are rough (Apple
silicon) so you know what "normal" looks like.

## 1. Clean state

```bash
git status --short        # → empty (no tracked changes, no stray artifacts)
git switch main && git pull
```

If `tools/studio/ui/e2e/.run` or `coverage/` exist from a prior run, they are ignored and the scanner
skips them — but a truly clean tree is the baseline.

## 2. Core + packages (~5s)

```bash
npm test                  # node:test suite (core, CLI, packages, studio) → all green
npm run test:coverage     # + gate 90/80/90 lines/branches/functions
npm run typecheck         # tsc --checkJs over tools/ + packages/ → 0 errors
npm run smoke:pack        # tarballs install; CLI + public exports resolve
npm run bench:index -- --sizes 100,1000   # scale smoke (no fragile thresholds)
npm audit --omit=dev --audit-level=high
```

## 3. The BASE itself, dogfooded (~3s)

```bash
node tools/base.mjs validate --root .                 # → "BASE valide."
node tools/base.mjs route-test --root .               # → routes stable
node tools/base.mjs entretien --root .                # → no open markers, no missing descriptions
node tools/base.mjs markers --root .                  # → "Aucun marqueur ouvert."
npm run spec:check                                    # → spec discipline: matrix, IDs, leaf, markers, statusless, em-dash
node tools/spec/check-ids.mjs --base origin/main      # → IDs immutable vs the base branch
node tools/spec/requirements-matrix.mjs --ratchet --base origin/main   # → weak/gap counts did not rise
node tools/base.mjs docs validate --root .            # → docs model: 0 broken links, 0 errors
```

Every example referenced by CI must route cleanly (a guard test also enforces fixtures exist):

```bash
for ex in routage-pme assistant-devis assistant-devis-demo assistant-communication \
          assistant-rh assistant-projet \
          assistant-courrier assistant-reunion \
          assistant-reflexion assistant-enseignant \
          agence-multi-clients/clients/dupont-conseil agence-multi-clients/clients/martin-digital; do
  node tools/base.mjs route-test --root "exemples/$ex"
done
for ex in exemples/*/; do node tools/base.mjs validate --root "$ex"; done
```

## 4. Derived artifacts are fresh (regenerate + diff)

```bash
node tools/base.mjs index --root . && git diff --exit-code base.manifest.json
node tools/base.mjs build --write --root . \
  && git diff --exit-code AGENTS.md .ai/tools.md CLAUDE.md BASE_BOOTSTRAP.md .cursor/rules/assistant.mdc
```

## 5. MCP server (~20s, has dependencies)

```bash
cd mcp && npm ci && npm audit --omit=dev --audit-level=high && npm run build && npm run test:coverage && npm run smoke:pack && cd ..
```

## 6. Studio UI (~1min)

```bash
cd tools/studio/ui && npm ci
npm run test:coverage     # component/hook tests + UI coverage gate
npm run build             # tsc --strict + vite
npm run e2e               # Playwright journeys + axe accessibility (installs Chrome on first run)
cd ../../..
```

## 7. Version + changelog + spec freeze (git tag)

- Bump versions per [SemVer](../docs/reference/versions-et-stabilite.md) (core + any changed package).
- Update `CHANGELOG.md` (and each package's, if changed): promote `[Unreleased]` to the new version.
- Freeze the spec: in `specs/current/CHANGELOG.md` move `[Unreleased]` to `[X.Y.Z] - <date>`. The git tag **is** the frozen spec — no `specs/vX.Y.Z/` tree is copied (read a past spec with `git show vX.Y.Z:specs/current/...`).
- Confirm no em-dashes in French public content; specs/docs updated for any behaviour change.
- Tag, then let CI re-run the same gates across Node 18/20/22/24.

## 8. Publish, with verifiable provenance (governance-gated)

A release is **not** automatic. It needs (a) sign-off from a release owner named in
[`GOVERNANCE.md`](../GOVERNANCE.md) and (b) the `NPM_TOKEN` secret. Until both exist, BASE ships as
source on GitHub and is not offered on npm.

- The publish path is the **Release (manual)** GitHub Action (`.github/workflows/release.yml`):
  dispatch it by hand, with input `confirm=PUBLISH` (anything else is a dry run). It re-runs the
  gates above, emits a CycloneDX SBOM artifact (`sbom.cdx.json`), and publishes with
  `npm publish --provenance` (a Sigstore attestation linking the tarball to this repo, commit and
  workflow). `prepublishOnly` runs `smoke:pack` as a final fail-closed check.
- Surface sanity before tagging: `npm pack --dry-run` is ~520 files / < 1 MB, with no
  `node_modules`, e2e `.run*`, or test files (enforced by `tests/smoke-pack.mjs`).
- Hardening items still open before a public 1.0 (pinning GitHub Actions to commit SHAs, a second
  named release owner) are tracked in the CHANGELOG's "Orientations" section, not inlined here: this
  page is present-tense procedure, the backlog is trajectory.

The full test architecture behind these gates is mapped in [`TESTING.md`](TESTING.md).
