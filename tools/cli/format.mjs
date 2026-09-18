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

export function formatPendingChanges(pending) {
  if (!pending.length) return "Aucun changement en attente de commit.";
  return [
    `${pending.length} changement(s) en attente de commit:`,
    ...pending.map((c) => ` - ${c.change_id} (cible: ${c.target}${c.purpose ? `, ${c.purpose}` : ""})`),
  ].join("\n");
}

export function formatChangeStatus(status) {
  if (status.status === "pending") return `${status.change_id}: en attente, cible ${status.target} (propose le ${status.created_at}).`;
  return `${status.change_id}: ${status.status}.${status.note ? " " + status.note : ""}`;
}

export function formatBuildPlan(artifacts) {
  return [
    "Projection BASE (dry-run; ajoutez --write pour ecrire):",
    ...artifacts.map((artifact) => `- ${artifact.target} -> ${artifact.path} (${artifact.content.length} caracteres)`),
    "",
    "Ces artefacts sont generes depuis le noyau. Ne les editez pas a la main; regenerez-les.",
  ].join("\n");
}

// What `base build --write` did, and what it deliberately did not do. A hand-owned file (present,
// no provenance banner) is kept, so the report names it and the gesture that gives it back.
export function formatBuildWrite({ written, kept }) {
  const writtenNote = written.length ? `Artefacts écrits:\n${written.map((p) => `- ${p}`).join("\n")}` : "Aucun artefact écrit.";
  if (!kept.length) return writtenNote;
  const keptList = kept.map((p) => `- ${p}`).join("\n");
  return `${writtenNote}\n\nÉcrits à la main, donc laissés intacts:\n${keptList}\nCes fichiers ne portent pas la bannière de provenance: ils vous appartiennent. Pour que BASE les regénère, supprimez-les puis relancez.`;
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
