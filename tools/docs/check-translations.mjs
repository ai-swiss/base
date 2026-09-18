#!/usr/bin/env node
// check-translations.mjs — French is authoritative, and translations cannot drift silently.
//
// French is the authoritative language of BASE's documentation; each translation must say so, at the
// top, by linking back to the French source it mirrors (CONTRIBUTING: "La version française fait foi ;
// chaque traduction le rappelle en tête de fichier."). This gate enforces that, language-agnostically:
// the head of every known translation must contain a Markdown link to its French source.
//
// It also offers an opt-in staleness check: a translation may record the French source's git blob hash
// at last sync as `<!-- fr-synced: <hash> -->`. When present, the gate recomputes the source's hash and
// fails if the source has changed since, so a maintainer is told to re-sync (a watched, opt-in signal,
// not a noisy guess).
//
// The per-language word tables (tools/core/lang/) are translations in exactly the same sense as a
// docs mirror: en.mjs, de.mjs and it.mjs hold every key of fr.mjs with only the words changed. They
// are covered here rather than left to review, because a reworded fr.mjs otherwise leaves every
// table silently stale and nothing fails. Their marker is the same one, spelled as a JS line
// comment (`// fr-synced: <hash>`), hashed against tools/core/lang/fr.mjs. A table this build does
// not carry yet is not a failure; one that exists must declare what it was translated from.
//
//   node tools/docs/check-translations.mjs        # exit 1 on a missing attribution or a stale sync
import { execFileSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const HEAD_LINES = 8;

// Each translation and the French source it mirrors.
const TRANSLATIONS = [
  { file: "README.md", source: "README.fr.md" },
  { file: "MANIFESTO.en.md", source: "MANIFESTO.md" },
  { file: "MANIFESTO.de.md", source: "MANIFESTO.md" },
  { file: "MANIFESTO.it.md", source: "MANIFESTO.md" },
];

// Docs translations live as locale mirrors: docs/en/<path> shadows docs/<path>. They are body-only
// (no head link, since the site shows the authority and offers the language toggle), so the contract
// here is the fr-synced marker: mandatory, and verified fresh against the French source.
const LOCALE_MIRROR_DIRS = ["docs/en", "docs/de", "docs/it"];

// The per-language word tables: same keys as fr.mjs, only the words change. Same contract as a
// locale mirror (fr-synced mandatory, verified fresh), and the same list of locales.
const LANG_TABLE_SOURCE = "tools/core/lang/fr.mjs";
const LANG_TABLES = ["en", "de", "it"].map((locale) => ({ file: `tools/core/lang/${locale}.mjs`, source: LANG_TABLE_SOURCE }));

async function discoverMirrors() {
  const out = [];
  async function walk(relDir) {
    const entries = await fs.readdir(path.join(ROOT, relDir), { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const rel = `${relDir}/${entry.name}`;
      if (entry.isDirectory()) await walk(rel);
      else if (entry.isFile() && entry.name.endsWith(".md")) {
        out.push({ file: rel, source: `docs/${rel.replace(/^docs\/(en|de|it)\//, "")}` });
      }
    }
  }
  for (const dir of LOCALE_MIRROR_DIRS) await walk(dir);
  return out.sort((a, b) => a.file.localeCompare(b.file));
}

/** True if the head text links to the French source (e.g. `(README.md)`), the authority reminder. */
export function linksToSource(headText, source) {
  return headText.includes(`(${source})`);
}

/**
 * The recorded sync hash. Markdown declares it as `<!-- fr-synced: <hash> -->`; a source file, which
 * has no HTML comments, declares it as `// fr-synced: <hash>`. One marker, two spellings, so a
 * language table records what it was translated from the way a page does.
 */
export function recordedSyncHash(text) {
  const m = text.match(/<!--\s*fr-synced:\s*([0-9a-f]{7,40})\s*-->|\/\/\s*fr-synced:\s*([0-9a-f]{7,40})/);
  return m ? (m[1] ?? m[2]) : null;
}

/** Whether `recorded` still names the current blob hash (a short prefix counts). */
function syncIsFresh(recorded, current) {
  return !current || current.startsWith(recorded) || recorded.startsWith(current.slice(0, recorded.length));
}

function gitBlobHash(relPath) {
  try {
    return execFileSync("git", ["hash-object", relPath], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

async function main() {
  const failures = [];
  let synced = 0;
  for (const { file, source } of TRANSLATIONS) {
    const text = await fs.readFile(path.join(ROOT, file), "utf8").catch(() => null);
    if (text === null) continue; // a not-yet-created translation is not a failure
    const head = text.split("\n").slice(0, HEAD_LINES).join("\n");
    if (!linksToSource(head, source)) {
      failures.push(`${file}: the head must link to its French source (${source}) and state that French is authoritative.`);
    }
    const recorded = recordedSyncHash(text);
    if (recorded) {
      if (!syncIsFresh(recorded, gitBlobHash(source))) {
        failures.push(`${file}: ${source} changed since the recorded fr-synced:${recorded}. Re-sync the translation and update the marker (or confirm it is still accurate).`);
      } else {
        synced++;
      }
    }
  }
  // Locale mirrors: body-only, so fr-synced is mandatory (it stands in for the head authority link).
  const mirrors = await discoverMirrors();
  for (const { file, source } of mirrors) {
    const text = await fs.readFile(path.join(ROOT, file), "utf8").catch(() => null);
    if (text === null) continue;
    const sourceExists = await fs.access(path.join(ROOT, source)).then(() => true).catch(() => false);
    if (!sourceExists) {
      failures.push(`${file}: no French source at ${source} (a mirror must shadow an existing page).`);
      continue;
    }
    const recorded = recordedSyncHash(text);
    if (!recorded) {
      failures.push(`${file}: a docs translation must carry <!-- fr-synced: <hash> -->, recording the French source it mirrors.`);
      continue;
    }
    if (!syncIsFresh(recorded, gitBlobHash(source))) {
      failures.push(`${file}: ${source} changed since fr-synced:${recorded}. Re-translate and update the marker.`);
    } else {
      synced++;
    }
    // English mirrors hold the project's English typography: straight quotes, no em-dash, no
    // guillemets, no curly quotes. The French content gates skip docs/en/, so this guards it here.
    // (Other locales set their own typography; only docs/en/ is checked.)
    if (file.startsWith("docs/en/")) {
      if (/[«»]/.test(text)) failures.push(`${file}: contains guillemets « » (English uses straight quotes).`);
      if (/—/.test(text)) failures.push(`${file}: contains an em-dash (use commas, colons, or parentheses).`);
      if (/[‘’“”]/.test(text)) failures.push(`${file}: contains curly quotes (use straight quotes).`);
    }
  }
  // The word tables: a table that exists must say which fr.mjs it was translated from, and stay
  // fresh against it. A locale with no table yet is simply absent, never a failure.
  let tables = 0;
  for (const { file, source } of LANG_TABLES) {
    const text = await fs.readFile(path.join(ROOT, file), "utf8").catch(() => null);
    if (text === null) continue;
    tables++;
    const recorded = recordedSyncHash(text);
    if (!recorded) {
      failures.push(`${file}: a language table must carry // fr-synced: <hash>, recording the ${source} it translates (git hash-object ${source}).`);
      continue;
    }
    if (!syncIsFresh(recorded, gitBlobHash(source))) {
      failures.push(`${file}: ${source} changed since fr-synced:${recorded}. Re-translate the reworded keys and update the marker.`);
    } else {
      synced++;
    }
  }

  if (synced) console.log(`check-translations: ${synced} translation(s) carry an up-to-date fr-synced marker.`);
  if (failures.length) {
    console.error("check-translations: FAIL —");
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`check-translations: pass — ${TRANSLATIONS.length} root translation(s) + ${mirrors.length} docs mirror(s) + ${tables} language table(s); French stays authoritative.`);
}

if (process.argv[1] && process.argv[1].endsWith("check-translations.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
