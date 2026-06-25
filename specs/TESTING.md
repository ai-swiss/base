# Test architecture — what runs, what it covers, what signal it gives

A map of every automated check, so a green run means something specific and a red one points somewhere.
The shape is a pyramid: many fast unit/contract tests, fewer integration tests, a thin end-to-end layer.

## Layers

| Layer | Tool | Where | What it proves |
|---|---|---|---|
| Static types (core) | `tsc --checkJs` | `tools/` + `packages/` | the zero-dependency JS type-checks at zero errors (no build) |
| Static types (UI) | `tsc --noEmit` (strict) | `tools/studio/ui` | the React/TS app type-checks at zero errors |
| Unit + contract (backend) | `node:test` (+ `fast-check`) | `tests/`, `packages/*/tests` | broker gate, frontmatter parser/serializer (property-based), router, LLM port, eval engine, studio server + run lifecycle |
| Component + hook (UI) | Vitest + RTL + jsdom | `tools/studio/ui/src/**/*.test.tsx` | components against a stubbed `fetch`: `useResource` (cancellation/SWR), Browse, Editor (propose→commit), Monitor + Run panel, ARIA tab state |
| End-to-end + a11y (UI) | Playwright + `@axe-core/playwright` | `tools/studio/ui/e2e/*.spec.ts` | the real UI + API + broker: browse/search/filter, edit round-trip on disk, eval report + run detail, invalid-launch preflight, and a WCAG 2 A/AA audit |
| Derived-artifact freshness | CLI + `git diff` | CI | `base.manifest.json` and the projected files are regenerable and committed fresh |
| Routing stability | `base route-test` | repo + every example | the expected agent→process routes do not drift |

## Run it

```bash
# Backend — from the repo root
node --run test            # the node:test suite (broker, parser, router, LLM, eval, studio server)
node --run test:coverage   # same, with the 90/80/90 coverage gate
node --run typecheck       # tsc --checkJs over tools/ + packages/
node tools/base.mjs validate --root .      # structure + links
node tools/base.mjs route-test --root .    # routing stays stable

# Studio UI — from tools/studio/ui
npm test                   # Vitest component/hook tests (jsdom)
npm run test:coverage      # + coverage gate (92/92/78 lines/statements/branches; functions floor 65*)
npm run build              # tsc --noEmit && vite build
npm run e2e                # Playwright E2E + axe (boots an isolated stack on ports 5199/4399)
npm run e2e:report         # open the last Playwright HTML report
```

\* v8 counts every inline closure as a "function", so that metric reads low even at ~99% line
coverage; the meaningful floors are lines/statements/branches.

**Coverage gate perimeter.** The backend 90/80/90 gate covers `tools/` and the optional packages
(`node:test`). The MCP server and the Studio UI are excluded from that gate on purpose: each runs in
its own CI job with its own suite and its own coverage gate (MCP: Vitest; Studio: Vitest + Playwright
with the UI gate above). One honest number per stack beats one blended number for the whole repo.

**Requirements → tests matrix.** Test files declare what they cover with a `// Spec coverage:` header
citing requirement IDs from `specs/current/10_core/requirements.md`. `npm run spec:matrix` regenerates
`specs/current/10_core/requirements-matrix.md` (a derived artifact, never edited by hand);
`tests/requirements-matrix.test.mjs` fails when the matrix is stale or when a test cites an ID that
does not exist. Uncited requirements are listed as gaps rather than hidden.

## CI jobs (`.github/workflows/ci.yml`)

- **core** — Node 18/20/22/24 matrix: syntax check, the node:test suite, validate, route-test (repo +
  every example), the index benchmark smoke; on Node 24 also coverage, manifest + projected-artifact
  freshness, and the package-pack smoke.
- **typecheck** — `tsc --checkJs` over `tools/` + `packages/`.
- **studio-ui** — Vitest component/hook tests with the coverage gate, then the strict build.
- **studio-e2e** — Playwright journeys + the axe accessibility audit, against the real stack.
- **mcp** — the MCP server build + tests on the same Node matrix.

## Conventions

- **Test behaviour, not implementation.** UI tests stub at the `api.ts`/`fetch` boundary and assert what
  the user sees; they do not reach into component internals.
- **Isolation.** Backend integration tests use ephemeral ports and temp roots; the E2E run copies the
  example to a throwaway root (`e2e/.run/`, gitignored) so the edit→commit journey can mutate freely.
- **Accessibility is gated.** The axe audit fails the build on serious/critical WCAG violations; the
  report still lists everything for review.
- **Honest gates.** Thresholds reflect what is achieved with a small margin, not aspirational round
  numbers — a passing gate is a true signal.
