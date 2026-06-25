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
  return [
    `Ressources trouvees pour "${query}":`,
    ...results.map((resource) => `- ${resource.id} (${resource.type}) - ${resource.title} [score ${resource.score}; ${resource.reasons.join(", ")}] -> ${resource.path}`),
  ].join("\n");
}

export function formatRouteResult(result) {
  const head = `Routage "${result.request}": ${result.status}${result.reason_code ? ` (${result.reason_code})` : ""}`;
  const lines = [head];
  if (result.agent) {
    lines.push(`Agent: ${result.agent.id}${result.process ? ` -> Process: ${result.process.id}` : ""}`);
  }
  if (result.explanation) lines.push(result.explanation);
  if (result.next_question) lines.push(`Question: ${result.next_question}`);
  // Honest abstention, friendly exit: the status above stays truthful, but a human reading this should
  // see an open door, not a rejection. The machine-readable pointer line is kept for tooling and tests.
  if (result.fallback) {
    lines.push("Pas de route directe ; je vous oriente vers l'accueil de BASE.");
    lines.push(`Fallback: ${result.fallback.agent.id} -> ${result.fallback.process.id}`);
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

export function formatRouteTestResult(result) {
  const lines = [`Tests de routage: ${result.passed}/${result.total} OK.`];
  for (const failure of result.failures) {
    lines.push(`- [${failure.index}] "${failure.request}"`);
    for (const mismatch of failure.mismatches) lines.push(`    ${mismatch}`);
  }
  if (result.ok) lines.push("Toutes les routes attendues sont stables.");
  return lines.join("\n");
}

export function formatMaintenanceReport(report) {
  const lines = [
    "Entretien BASE",
    `- Ressources: ${report.summary.resources}`,
    `- Erreurs: ${report.summary.errors}`,
    `- Avertissements: ${report.summary.warnings}`,
    `- Fichiers avec marqueurs ouverts: ${report.summary.placeholders}`,
    `- Fichiers avec marqueurs d'action: ${report.summary.actionable_placeholders}`,
    `- Descriptions manquantes: ${report.summary.missing_descriptions}`,
    `- Processes a signal de routage faible: ${report.summary.weak_routing ?? 0}`,
    `- Ressources orphelines: ${report.summary.orphans ?? 0}`,
    `- Marqueurs dormants: ${report.summary.stale_markers ?? 0}`,
    `- Evenements de trace: ${report.summary.trace_events}`,
    "",
    "Recommandations:",
    ...report.recommendations.map((item) => `- ${item}`),
  ];

  const structural = report.structural ?? { weak_routing: [], orphans: [] };
  if (structural.weak_routing.length > 0) {
    lines.push("", "Routage a signal faible (ni use_when ni exemples):");
    for (const item of structural.weak_routing.slice(0, 20)) lines.push(`- ${item}`);
  }
  if (structural.orphans.length > 0) {
    lines.push("", "Ressources orphelines (referencees par aucun agent ni process):");
    for (const item of structural.orphans.slice(0, 20)) lines.push(`- ${item}`);
  }
  if ((structural.stale_markers ?? []).length > 0) {
    lines.push("", "Marqueurs dormants (fichier non touche depuis 30 jours ou plus):");
    for (const item of structural.stale_markers.slice(0, 20)) lines.push(`- ${item.path} (${item.days} jours)`);
  }

  if (report.validation.errors.length > 0) {
    lines.push("", "Erreurs a traiter:");
    for (const error of report.validation.errors.slice(0, 20)) {
      lines.push(`- ${error.path}: ${error.message}`);
    }
  }

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

export function formatTracePrune(result) {
  const scope = result.cutoff ? `anterieurs a ${result.cutoff}` : "tous";
  if (result.removed_count === 0) {
    return `Aucun fichier de trace a supprimer (${scope}). ${result.kept} conserve(s).`;
  }
  return `${result.removed_count} fichier(s) de trace supprime(s) (${scope}). ${result.kept} conserve(s).`;
}
