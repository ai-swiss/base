// tools/core/rankers.mjs — the Ranker port. Zero dependencies.
//
// The default `lexicalRanker` is NEUTRAL: field-weighted substring scoring with an explainable
// reason per hit, and NO business vocabulary. Projects that need stronger routing can compose it
// with `semanticHybridRanker`: still a Ranker, still explainable, but able to use aliases, fuzzy
// similarity and optional precomputed embeddings supplied by an index/adapter.
//
// This module also exports `keywordIntentRanker(rules)`: a config-only, opt-in ranker that boosts
// resources matching declared business-vocabulary rules. It is NOT in the dogfooded default pipeline
// (which is `[lexicalRanker, ...config.rankers]`); a project adds it via `base.config`.
//
// A Ranker is `(resource, terms, ctx) => { score: number, reasons: string[] } | Promise<...>`.
//
// Resources may carry an optional `route_text` field, populated by the Router from `use_when`,
// description, etc. When present it scores as the highest-signal routing field (reason `route:<term>`);
// when absent (general discovery via `searchResources`) it contributes nothing — fully backward-compatible.

export function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** @type {[string, number, string][]} */
const FIELD_WEIGHTS = [
  ["id", 80, "id"],
  ["route_text", 70, "route"],
  ["title", 50, "title"],
  ["description", 30, "description"],
  ["keywords", 25, "keywords"],
  ["path", 10, "path"],
  ["body", 5, "text"],
];

const HYBRID_FIELDS = [
  ["route_text", 40, "route"],
  ["title", 36, "title"],
  ["description", 34, "description"],
  ["keywords", 28, "keywords"],
  ["body", 16, "text"],
  ["id", 12, "id"],
  ["path", 8, "path"],
];

export function lexicalRanker(resource, terms) {
  const hay = {
    id: normalize(resource.id),
    route_text: normalize(resource.route_text),
    title: normalize(resource.title),
    description: normalize(resource.description),
    keywords: normalize((resource.keywords ?? []).join(" ")),
    path: normalize(resource.path),
    body: normalize(resource.body),
  };
  // A short term (≤ 3 chars) must match a WHOLE word, not a bare substring — otherwise «me» fires
  // inside «commerciale», «ca»/«va» inside «publication»/«evaluer», manufacturing a route
  // from noise. Longer terms keep substring recall, so «calcule» still matches «calculer»
  // (morphology without a stemmer). This is the same protection routeAvoidReasons already applies to
  // the avoid-text, brought to the forward match. Tokenise the fields ONLY when a short term exists
  // (most requests have none), so the common path skips seven tokenisations per resource.
  const hasShortTerm = terms.some((term) => term.length <= 3);
  /** @type {Record<string, Set<string>>} */
  const hayTokens = {};
  if (hasShortTerm) {
    for (const field of Object.keys(hay)) hayTokens[field] = new Set(hay[field].split(/[^a-z0-9]+/).filter(Boolean));
  }
  let score = 0;
  const reasons = [];
  for (const term of terms) {
    const short = term.length <= 3;
    for (const [fieldName, weight, label] of FIELD_WEIGHTS) {
      const hit = short ? hayTokens[fieldName].has(term) : hay[fieldName].includes(term);
      if (hit) {
        score += weight;
        reasons.push(`${label}:${term}`);
      }
    }
  }
  return { score, reasons };
}

function termsInclude(terms, list) {
  return Array.isArray(list) && list.some((w) => terms.includes(normalize(w)));
}

// rules: { "<reasonLabel>": { when?: (terms)=>bool, whenIncludes?: string[], require?: string[], boost: number } }
// A `require` clause matches if ANY of its `|`-separated alternatives appears in the resource's
// normalized keywords+description haystack. The boost applies iff `when` is true AND every clause matches.
export function keywordIntentRanker(rules) {
  const entries = Object.entries(rules ?? {});
  return (resource, terms) => {
    const hay = normalize([(resource.keywords ?? []).join(" "), resource.description].filter(Boolean).join(" "));
    let score = 0;
    const reasons = [];
    for (const [label, rule] of entries) {
      const when = typeof rule.when === "function" ? !!rule.when(terms) : termsInclude(terms, rule.whenIncludes);
      if (!when) continue;
      const clauses = rule.require ?? [];
      const ok = clauses.every((clause) => clause.split("|").some((alt) => hay.includes(normalize(alt))));
      if (!ok) continue;
      score += rule.boost ?? 0;
      reasons.push(label);
    }
    return { score, reasons };
  };
}

export function semanticHybridRanker(options = {}) {
  const aliases = normalizeAliases(options.aliases ?? {});
  const fields = options.fields ?? HYBRID_FIELDS;
  const fuzzyThreshold = options.fuzzyThreshold ?? 0.34;
  const aliasWeight = options.aliasWeight ?? 48;
  const tokenWeight = options.tokenWeight ?? 22;
  const fuzzyWeight = options.fuzzyWeight ?? 42;
  const embeddingWeight = options.embeddingWeight ?? 120;

  return (resource, terms, ctx = {}) => {
    const queryTerms = [...new Set(terms.map(normalize).filter(Boolean))];
    const queryText = normalize(queryTerms.join(" "));
    let score = 0;
    const reasons = [];

    for (const [fieldName, fieldWeight, label] of fields) {
      const fieldText = fieldValue(resource, fieldName);
      if (!fieldText) continue;
      const normalizedField = normalize(fieldText);
      const fieldTokens = tokenize(normalizedField);

      const overlap = tokenOverlap(queryTerms, fieldTokens);
      if (overlap > 0) {
        score += Math.round(tokenWeight * fieldWeight * overlap);
        reasons.push(`semantic:token:${label}`);
      }

      for (const term of queryTerms) {
        for (const alias of aliases.get(term) ?? []) {
          // Match an alias as an exact phrase OR as a token subset, so a multi-word alias like
          // "fin relation" still fires on "fin de relation de travail" (intervening words tolerated).
          const aliasTokens = alias.split(/\s+/).filter(Boolean);
          const matched = normalizedField.includes(alias)
            || (aliasTokens.length > 0 && aliasTokens.every((token) => fieldTokens.has(token)));
          if (matched) {
            score += aliasWeight;
            reasons.push(`semantic:alias:${term}->${label}`);
            break;
          }
        }
      }

      const similarity = diceCoefficient(queryText, normalizedField);
      if (similarity >= fuzzyThreshold) {
        score += Math.round(fuzzyWeight * fieldWeight * similarity);
        reasons.push(`semantic:fuzzy:${label}`);
      }
    }

    const embeddingScore = embeddingSimilarity(resource, ctx);
    if (embeddingScore !== null) {
      score += Math.round(embeddingWeight * embeddingScore);
      reasons.push("semantic:embedding");
    }

    return { score, reasons: [...new Set(reasons)] };
  };
}

export function mergeScore(a, b) {
  return { score: a.score + b.score, reasons: [...new Set([...a.reasons, ...b.reasons])] };
}

// A ranker that throws (synchronously or via a rejected promise) must NOT abort routing — it degrades
// to a zero contribution, so the lexical floor and any healthy ranker survive. The whole composition is
// therefore FAIL-CLOSED: with a broken optional ranker (corrupt alias, undefined ctx, unreadable
// embedding), routing falls back to exactly what the deterministic floor decided, never an exception.
function safeRank(ranker, resource, terms, ctx) {
  try {
    const result = ranker(resource, terms, ctx);
    return isPromiseLike(result) ? Promise.resolve(result).catch(() => rankerFailure(ranker)) : result;
  } catch {
    return rankerFailure(ranker);
  }
}

function rankerFailure(ranker) {
  return { score: 0, reasons: [`ranker:error:${ranker?.name || "anonymous"}`] };
}

export function composeRankers(rankers) {
  return (resource, terms, ctx) => {
    let acc = /** @type {{ score: number, reasons: string[] }} */ ({ score: 0, reasons: [] });
    let chain = null;
    for (const ranker of rankers) {
      if (chain) {
        chain = chain.then(async (current) => mergeScore(current, await safeRank(ranker, resource, terms, ctx)));
        continue;
      }
      const result = safeRank(ranker, resource, terms, ctx);
      if (isPromiseLike(result)) {
        chain = Promise.resolve(result).then((resolved) => mergeScore(acc, resolved));
      } else {
        acc = mergeScore(acc, result);
      }
    }
    return chain ?? acc;
  };
}

function isPromiseLike(value) {
  return value && typeof value.then === "function";
}

function fieldValue(resource, fieldName) {
  const value = resource[fieldName];
  if (Array.isArray(value)) return value.join(" ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

function tokenize(text) {
  return new Set(normalize(text).split(/[^a-z0-9]+/).filter((token) => token.length >= 2));
}

function tokenOverlap(terms, tokens) {
  if (terms.length === 0 || tokens.size === 0) return 0;
  let hits = 0;
  for (const term of terms) {
    if (tokens.has(term)) hits++;
  }
  return hits / terms.length;
}

function normalizeAliases(rawAliases) {
  const aliases = new Map();
  for (const [term, values] of Object.entries(rawAliases ?? {})) {
    const key = normalize(term);
    const normalizedValues = (Array.isArray(values) ? values : [values])
      .map(normalize)
      .filter(Boolean);
    aliases.set(key, normalizedValues);
  }
  return aliases;
}

function ngrams(text, size = 3) {
  const compact = `  ${normalize(text).replace(/[^a-z0-9]+/g, " ")}  `;
  if (compact.length <= size) return new Set([compact.trim()].filter(Boolean));
  const grams = new Set();
  for (let index = 0; index <= compact.length - size; index++) {
    grams.add(compact.slice(index, index + size));
  }
  return grams;
}

function diceCoefficient(a, b) {
  if (!a || !b) return 0;
  const left = ngrams(a);
  const right = ngrams(b);
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const gram of left) {
    if (right.has(gram)) intersection++;
  }
  return (2 * intersection) / (left.size + right.size);
}

function embeddingSimilarity(resource, ctx) {
  // cosineSimilarity validates both sides (non-empty numeric vectors of equal length) and returns null
  // when there is no comparable signal, so we do not re-check here. A zero vector yields null (no
  // signal), distinct from a real but orthogonal match (0).
  const sim = cosineSimilarity(
    ctx.queryEmbedding ?? ctx.query_embedding,
    resource.embedding
      ?? resource.routing_embedding
      ?? resource.metadata?.embedding
      ?? resource.metadata?.routing_embedding
      ?? resource.metadata?.routing?.embedding,
  );
  return sim === null ? null : Math.max(0, sim);
}

// Deliberate zero-dependency copy of @ai-swiss/base-ranker-semantic's `vectors.mjs`. The opt-in
// `semanticHybrid` ranker is part of the dependency-free core (it runs with bare `node`), so it cannot
// import the optional companion package. The two copies are kept behaviourally identical, and
// `tests/base-rankers.test.mjs` asserts that parity at the edges (empty, zero-norm, length mismatch).
export function vectorFrom(value) {
  return Array.isArray(value) && value.length > 0 && value.every((n) => typeof n === "number" && Number.isFinite(n))
    ? value
    : null;
}

export function cosineSimilarity(a, b) {
  const left = vectorFrom(a);
  const right = vectorFrom(b);
  if (!left || !right || left.length !== right.length) return null;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index++) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  if (leftNorm === 0 || rightNorm === 0) return null;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}
