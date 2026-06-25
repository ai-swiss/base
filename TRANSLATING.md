# Translating BASE

French is the authoritative source. Translations are mirrors that must read as if originally written
in the target language, never as a literal pass over French. This guide is the contract: the
structure, the quality bar, and the living glossary. The rationale for the locale-mirror structure is
recorded internally.

## Structure

- French is authored at the canonical path: `docs/learn/comprendre.md`.
- A translation is a **body-only mirror** at `docs/<locale>/<same-path>`: `docs/en/learn/comprendre.md`.
- The mirror has **no frontmatter**. Metadata (id, type, sensitivity, audience) is owned once by the
  French source, so it cannot drift.
- The **first line** of every mirror is the sync marker, the SHA of the French source at translation
  time:

  ```
  <!-- fr-synced: 1a2b3c4d5e6f... -->
  ```

  `check-translations` recomputes the source hash and fails the build when a translation falls behind
  its source. To refresh a translation: re-translate the changed passages, then update the hash to
  the current source SHA.
- A language may be partial. Pages without a mirror fall back to the French body with a visible note.
  A page that exists but has drifted is **not** allowed: keep it in sync or remove it.

## Adding a language

1. Add the locale to the gates' exclusion (`docs/(en|de|it)/` in `check-punctuation`,
   `check-lexique`, `check-emdash`) and to the site's `Locale` type (`i18n.ts`).
2. Translate the chrome strings and editorial in `i18n.ts` and `content.ts`.
3. Create `docs/<locale>/**` mirrors, French source first, highest-traffic pages first.

## The quality bar

Translate the way a New York Times translator would: faithful to meaning and register, idiomatic in
the target language, never inflating a claim the French does not make. The
[institutional writing bar](docs/learn/comprendre.md) applies in every language: stakes first, no
filler, every sentence earns its place. A translation that reads like a translation has failed.

For English, the target is **American English**: American spelling (organize, color, behavior,
modeling), American conventions, and plain, precise technical prose.

## House style (English)

- **Typography.** Straight quotes (`"` `'`), not French guillemets. Standard spacing (space after a
  colon, none before). Avoid the em-dash, matching the project's French discipline: use commas,
  colons, or parentheses instead.
- **Keep verbatim.** Code identifiers, file paths, commands, frontmatter keys, product names
  (`BASE`, `Studio`), and marker **tokens** (`[A VALIDER]`, `[DECISION]`) are never translated. A
  marker token is a literal string the tooling matches; translating it would break it.
- **Loanwords.** A few French terms have become BASE's own vocabulary and stay, italicised on first
  use with a short gloss. The glossary marks them "keep".
- **Acronym.** On first mention, gloss BASE once as "Build Assistants with a Structure of Expertise"
  (a rendering of the French *Bâtir des Assistants avec une Structure d'Expertise*), then use `BASE`.

## Glossary (French to English)

Living. Add a term the first time a translation needs a decision, so every later translation matches.

| French | American English | Note |
|---|---|---|
| co-pensée (humain-IA) | human-AI co-thinking | The relationship BASE structures. Never "co-thought". |
| assistant métier | domain assistant | Not "business assistant". |
| savoir métier, savoir-faire | domain knowledge, know-how | |
| routeur, routage | router, routing | |
| process | process | A workflow `SKILL.md`. Keep the word. |
| compétence | competence | The other `SKILL.md` kind. Never "skill" (overloaded by `SKILL.md`). |
| ressource | resource | |
| garde-fou | guardrail | |
| consigne | consigne | Keep, italic on first use: "a *consigne* (model-followed, so fallible)". Already used in the English specs. |
| mécanisme | mechanism | Code-enforced and tested, the counterpart of a consigne. |
| abstention, s'abstenir | abstention, to abstain | The router refusing to guess. |
| égress | egress | Data leaving for a remote model. Keep; already used in the site. |
| racine | root | A BASE root directory. |
| confinement, confiné | confinement, confined | Path confinement. |
| la frontière (local / sortant) | the boundary (local / outbound) | |
| porte d'écriture, propose puis commit | write gate, propose then commit | The two-step mediated write. |
| marqueur | marker | The concept is "marker"; the **tokens** stay literal (see house style). |
| fiche de décision | decision sheet | |
| Voie 1 / Voie 2 | Track 1 / Track 2 | Bridge to the code's terms: Track 1 = the lexical strategy, Track 2 = the embedding strategy. |
| projection (fichier dérivé) | projection | A file derived from sources, regenerable. |
| souveraineté, souverain | sovereignty, sovereign | |
| local-first | local-first | Keep. |
| collègue venu d'ailleurs, amnésique | an amnesiac colleague from elsewhere | The mental model for the assistant. Translate the image, not word for word. |
| Atelier (le Studio) | Studio | The product name. Keep. |
| devis | quote | The demo's business domain. |
| relecture, relire | review | |
