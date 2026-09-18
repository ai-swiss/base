// The language resolver for everything BASE writes into a user's folder.
//
// One entry point, `stringsFor(language)`, and one rule: French is the floor. The merge is
// KEY-LEVEL (`{ ...FR, ...TABLE[language] }`), not table-level, so a table that translates half the
// strings yields a file that is half translated and half French — readable — rather than a file with
// holes in it. Adding one more language therefore means adding an object here and nothing else; no
// renderer changes, no key has to be translated before it can ship.
//
// An unknown language returns French instead of throwing. A root names its language in its own
// config, and a typo there, or a root written against a newer BASE that knows more languages than
// this one, must never make the root unloadable: a wrong-language entry point is a nuisance, an
// unloadable root is an outage.
//
// This directory is also where these strings can live at all: tests/architecture.test.mjs caps every
// tools/core/*.mjs at 450 lines and reads that directory NON-recursively, so a table that will grow
// one object per language belongs one level down, not beside perimeter.mjs.

import { FR } from "./fr.mjs";
import { EN } from "./en.mjs";
import { DE } from "./de.mjs";
import { IT } from "./it.mjs";

/** The default and the fallback. A root that declares nothing gets this. */
export const DEFAULT_LANGUAGE = "fr";

/** Every language BASE can write today. One more language = one more entry. */
const TABLE = {
  fr: FR,
  en: EN,
  de: DE,
  it: IT,
};

/** The languages this build knows, for a caller that wants to offer a choice. */
export function availableLanguages() {
  return Object.keys(TABLE);
}

/**
 * The primary subtag of a language tag, lowercased: `de-CH` → `de`, `EN_GB` → `en`, ` fr ` → `fr`.
 *
 * Normalising in ONE place is what lets the config, the renderers and the CLI agree on which table
 * a root meant. A table is written per language, not per region: `de-CH` and `de-AT` want the same
 * German words, and keeping the region would turn every regional tag into an unknown language.
 * @param {unknown} tag @returns {string} the primary subtag, or "" for an empty tag
 */
export function normalizeLanguage(tag) {
  return String(tag ?? "").trim().toLowerCase().split(/[-_]/)[0];
}

/** Whether this build carries a table for `language`. A caller says so; it never changes what renders. */
export function isKnownLanguage(language) {
  return Object.hasOwn(TABLE, normalizeLanguage(language));
}

/**
 * The same key, in every language this build carries. A DETECTOR needs this: a check that looks for
 * the scaffold's own sentence to say «this card was never rewritten» must recognise that sentence in
 * whichever language the scaffold was written in, or it goes quietly blind on every root BASE did
 * not write in French. Asking the tables is the only reading that cannot drift from what they emit.
 * @param {string} key @returns {any[]} one value per language, in table order
 */
export function everyLanguage(key) {
  return Object.values(TABLE).map((table) => table[key]).filter((value) => value !== undefined);
}

/**
 * The strings for `language`, French-backed key by key.
 * @param {string} [language] a language tag; unknown or absent yields French.
 * @returns {typeof FR} a complete table — every key of FR is present.
 */
export function stringsFor(language = DEFAULT_LANGUAGE) {
  return { ...FR, ...(TABLE[normalizeLanguage(language)] ?? {}) };
}
