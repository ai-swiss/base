import { compareByCodePoint } from "./ordering.mjs";

export function formatValidationResult(result) {
  const lines = [];
  lines.push(result.ok ? "BASE valide." : "BASE invalide.");
  lines.push(`Ressources analysees: ${result.resources.length}`);

  if (result.errors.length > 0) {
    lines.push("\nErreurs:");
    for (const error of result.errors) lines.push(`- ${error.path}: ${error.message}`);
  }

  if (result.warnings.length > 0) {
    lines.push("\nAvertissements:");
    for (const warning of result.warnings) lines.push(`- ${warning.path}: ${warning.message}`);
  }

  return lines.join("\n");
}

export function formatSearchResults(results, query) {
  if (results.length === 0) return `Aucune ressource trouvee pour "${query}".`;
  // A section hit is a passage, so it is shown as one: the citable ref, the heading path that says
  // where it sits, then the passage itself. A reader checks the quote before using it.
  if (results[0]?.section) {
    return [
      `Passages trouvés pour "${query}":`,
      ...results.flatMap((hit) => [
        `- ${hit.ref} [score ${hit.score}; ${(hit.reasons ?? []).join(", ")}] -> ${hit.path}`,
        `  ${hit.heading_path}`,
        `  ${hit.passage}`,
      ]),
    ].join("\n");
  }
  return [
    `Ressources trouvees pour "${query}":`,
    ...results.map((resource) => `- ${resource.id} (${resource.type}) - ${resource.title} [score ${resource.score}; ${resource.reasons.join(", ")}] -> ${resource.path}`),
  ].join("\n");
}

export function formatRouteResult(result) {
  const head = `Routage "${result.request}": ${result.status}${result.reason_code ? ` (${result.reason_code})` : ""}`;
  const lines = [head];
  // On competing_intents the router did NOT pick an agent: `result.agent` carries the top of two
  // too-close agents for JSON consumers, and printing it unlabelled invites a harness to load exactly
  // what the abstention forbids («ne devine pas»). The explanation below already names both agents.
  // When an agent IS committed to, print the PATHS: the harness reads this text — give it what to open.
  if (result.agent && result.reason_code !== "competing_intents") {
    lines.push(`Agent: ${result.agent.id}${result.agent.path ? ` (${result.agent.path})` : ""}${result.process ? ` -> Process: ${result.process.id}${result.process.path ? ` (${result.process.path})` : ""}` : ""}`);
  }
  if (result.explanation) lines.push(result.explanation);
  if (result.next_question) lines.push(`Question: ${result.next_question}`);
  // Honest abstention, friendly exit: the status above stays truthful, but a human reading this should
  // see an open door, not a rejection. The machine-readable pointer line is kept for tooling and tests.
  if (result.fallback) {
    lines.push("Pas de route directe ; je vous oriente vers l'accueil de BASE.");
    // The path matters when the target is not in this root: the harness reads this text, and a
    // framework process sits outside the working folder. Say where it is, once, in full.
    const from = result.fallback.source === "framework" ? " (cadre BASE)" : "";
    lines.push(`Fallback${from}: ${result.fallback.agent.id} -> ${result.fallback.process.id} (${result.fallback.process.path})`);
  }
  // Never silently drop a workspace root: a declared root that could not be routed is surfaced here,
  // not only in --json, so a human sees that one root was skipped rather than a false clean success.
  if (Array.isArray(result.unreachable_roots) && result.unreachable_roots.length > 0) {
    lines.push(`Attention: racine(s) injoignable(s) ignorée(s): ${result.unreachable_roots.map((r) => r.id).join(", ")}`);
  }
  if (result.candidates.length > 0) {
    lines.push("", "Candidats:");
    for (const candidate of result.candidates) {
      lines.push(`- ${candidate.resource.id} (${candidate.route_scope}) [score ${candidate.score}; ${candidate.reasons.join(", ")}] -> ${candidate.resource.path}`);
    }
  }
  return lines.join("\n");
}

export const ROUTE_BENCH_ROLE =
  "Ce banc mesure le plancher lexical: il sert les appels sans modèle (script, intégration, CI) et garde stables les routes promises. Dans une conversation, la carte est l'index et c'est le modèle qui route.";

const SUITE_LABELS = { fixtures: "fixtures", examples: "exemples déclarés" };

export function formatRouteTestResult(result) {
  // Two numbers, labelled, side by side: the fixtures are the author's contract with their users,
  // the declared examples the drift guard on the cards themselves. One number for both would hide
  // which promise broke.
  const suites = result.suites ?? [];
  const head = suites.length
    ? `Tests de routage: ${suites.map((s) => `${SUITE_LABELS[s.source] ?? s.source} ${s.passed}/${s.total} OK${s.path ? ` (${s.path})` : ""}`).join(" · ")}`
    : `Tests de routage: ${result.passed}/${result.total} OK.`;
  const lines = [head];
  for (const failure of result.failures) {
    lines.push(`- [${SUITE_LABELS[failure.source] ?? failure.source ?? "cas"} ${failure.index}] "${failure.request}"`);
    for (const mismatch of failure.mismatches) lines.push(`    ${mismatch}`);
    // The WHY next to the WHAT: decision + shortlist scores, so the author can tighten
    // use_when/avoid_when/keywords without re-running `base route` per failing case.
    const got = failure.actual;
    if (got) {
      lines.push(`    obtenu: ${got.status}${got.reason_code ? ` (${got.reason_code})` : ""} → ${got.agent ?? "-"} / ${got.process ?? "-"}`);
      for (const c of (got.candidates ?? []).slice(0, 3)) {
        lines.push(`    candidat: ${c.id} [${c.score}; ${(c.reasons ?? []).slice(0, 4).join(", ")}]`);
      }
    }
  }
  if (result.ok) lines.push("Toutes les routes attendues sont stables.");
  // Say what was NOT certified, so a green line is never read as more than it is.
  for (const missing of result.absent ?? []) {
    if (missing === "fixtures") lines.push("Aucun fichier de fixtures: `base route-test --scaffold` en rédige un depuis votre corpus.");
    if (missing === "examples") lines.push("Aucun `routing.examples` déclaré: les formulations de vos fiches ne sont pas rejouées.");
  }
  // What this bench IS, said where it is read (the same sentence as the guide): a green run certifies
  // the lexical floor, which serves callers with no model; a conversation routes by reading the index.
  lines.push("", ROUTE_BENCH_ROLE);
  return lines.join("\n");
}

export function formatMarkers(markers) {
  if (markers.length === 0) return "Aucun marqueur ouvert.";
  const byType = {};
  for (const marker of markers) byType[marker.type] = (byType[marker.type] ?? 0) + 1;
  return [
    `Marqueurs ouverts: ${markers.length}`,
    ...Object.entries(byType).map(([type, count]) => `- ${type}: ${count}`),
    "",
    ...markers.map((marker) => `- [${marker.type}] ${marker.path}:${marker.line}${marker.text ? ` - ${marker.text}` : ""}`),
  ].join("\n");
}

export function formatTraceSummary(summary) {
  const operations = Object.entries(summary.by_operation)
    .sort((a, b) => compareByCodePoint(a[0], b[0]))
    .map(([op, count]) => `- ${op}: ${count}`)
    .join("\n") || "- Aucun evenement.";

  return [
    "Trace BASE",
    `- Evenements: ${summary.events}`,
    `- Refus: ${summary.denied}`,
    `- Erreurs: ${summary.errors}`,
    "",
    "Operations:",
    operations,
  ].join("\n");
}

// The retrieval planner, human-readable: what to preload (paths + notes), what stayed out and why.
// Never a body — the summary carries none by construction (summarizeContextPack).
export function formatContextPackSummary(summary, idOrPath) {
  const lines = [`Contexte a precharger pour ${idOrPath}:`];
  for (const s of summary.sections) lines.push(`- ${s.path}${s.note ? ` (${s.note})` : ""}`);
  if (summary.sections.length === 0) lines.push("(aucune reference declaree)");
  if (summary.omitted.length) lines.push(`Hors budget (a ouvrir a la demande): ${summary.omitted.join(", ")}`);
  for (const u of summary.unresolved) lines.push(`Reference introuvable: ${u.ref}${u.suggestions?.length ? ` (proche: ${u.suggestions.join(", ")})` : ""}`);
  for (const w of summary.withheld) lines.push(`Retenu (egress): ${w.path} [${w.reason}]`);
  return lines.join("\n");
}

export function formatTracePrune(result) {
  const scope = result.cutoff ? `anterieurs a ${result.cutoff}` : "tous";
  if (result.removed_count === 0) {
    return `Aucun fichier de trace a supprimer (${scope}). ${result.kept} conserve(s).`;
  }
  return `${result.removed_count} fichier(s) de trace supprime(s) (${scope}). ${result.kept} conserve(s).`;
}
