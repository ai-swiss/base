## Summary

<!-- What changes, and why. Link any related issue. -->

## Type

- [ ] Fix
- [ ] Feature
- [ ] Docs
- [ ] Refactor / tests / tooling

## Checklist

- [ ] `npm test` green (core + packages)
- [ ] `npm run typecheck` clean
- [ ] `node tools/base.mjs validate --root .` → "BASE valide."
- [ ] `node tools/base.mjs route-test --root .` stable (and the example fixtures, if routing changed)
- [ ] Derived artifacts regenerated if needed (`npm run index`, `base build --write`)
- [ ] MCP touched? `cd mcp && npm run build && npm test` (the build runs `tsc`; vitest alone does not type-check)
- [ ] Studio touched? `cd tools/studio/ui && npm test && npm run build` (and `npm run e2e` for user flows)
- [ ] No em-dashes in French public content; specs/docs updated if behaviour changed
- [ ] A test accompanies any change to verifiable behaviour

<!-- See CONTRIBUTING.md and specs/TESTING.md for the full baseline. -->
