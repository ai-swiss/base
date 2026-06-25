// CLI presentation layer: broker results -> human-readable strings (the `--json` path bypasses these
// entirely and prints the raw object). Kept apart from dispatch so the wording — which is part of the
// product's "rien n'est écrit avant commit" promise — lives in one place. Pure, except
// projectValidationResult, which reuses the broker's own metadata projection for parity with --json.
import { projectResourceMetadata } from "../base-core.mjs";

export function describeDetection(detection) {
  switch (detection.type) {
    case "collection":
      return `${detection.roots.length} BASE détectés dans ce dossier (${detection.roots.map((r) => r.dir).join(", ")}).`;
    case "loose": {
      const n = detection.markdownCount;
      const files = `${n} fichier${n > 1 ? "s" : ""} Markdown`;
      return detection.hasSkillNames
        ? `${files} — dont des SKILL.md: vous parlez déjà BASE.`
        : `${files} sans structure BASE.`;
    }
    case "empty":
      return "dossier vide — on part du point de départ minimal.";
    case "root":
      return "un BASE existant — seuls les artefacts d'outils manquants sont proposés.";
    default:
      return detection.type;
  }
}

export function projectValidationResult(result) {
  return {
    ...result,
    resources: result.resources.map(projectResourceMetadata),
  };
}

export function formatProposeResult(result) {
  return [
    `Changement prepare: ${result.change_id}`,
    `Cible: ${result.target} (${result.exists ? "modification" : "creation"})`,
    `Decision: ${result.decision.decision} - ${result.decision.reason}`,
    "",
    "Diff propose (rien n'est ecrit avant 'base commit'):",
    result.diff,
    "",
    result.decision.decision === "deny"
      ? "Cette ecriture est refusee en l'etat."
      : `Pour appliquer: base commit ${result.change_id}${result.decision.decision === "needs_approval" ? " --confirmed" : ""}`,
  ].join("\n");
}

export function formatBuildPlan(artifacts) {
  return [
    "Projection BASE (dry-run; ajoutez --write pour ecrire):",
    ...artifacts.map((artifact) => `- ${artifact.target} -> ${artifact.path} (${artifact.content.length} caracteres)`),
    "",
    "Ces artefacts sont generes depuis le noyau. Ne les editez pas a la main; regenerez-les.",
  ].join("\n");
}

export function formatPromoteResult(result) {
  return [
    `Promotion preparee: ${result.id} (${result.from} -> ${result.to})`,
    `Changement: ${result.change_id} sur ${result.target}`,
    `Decision: ${result.decision.decision} - ${result.decision.reason}`,
    "",
    "Diff propose (rien n'est ecrit avant 'base commit'):",
    result.diff,
    "",
    result.decision.decision === "deny"
      ? "Cette promotion est refusee en l'etat."
      : `Pour appliquer: base commit ${result.change_id}${result.decision.decision === "needs_approval" ? " --confirmed" : ""}`,
  ].join("\n");
}
