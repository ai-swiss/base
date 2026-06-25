// Egress control — ONE rule where two metadata meet: where the data may go (root `egress`
// policy, per-resource `confidential` flag set by a human) and where the model runs (provider
// `locality`). A confidential resource, or any resource of a `local-only` root, never leaves
// toward a `remote` provider — and the refusal is SAID, never silent. Three consumers (context
// pack, chat, eval harness), one control point: the rule cannot diverge between surfaces.
// Zero dependencies; the policy reader is the only filesystem touch, kept separate from the pure rule.

import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * The pure rule. No taxonomy, no policy engine: locality × root policy × confidential.
 * @param {{ modelLocality: "local" | "remote", rootPolicy?: "local-only" | "any",
 * resources: Array<{ path: string, metadata?: { confidential?: boolean }, confidential?: boolean }> }} input
 * → { allowed: resource[], withheld: [{ resource, reason: "confidential" | "root_local_only" }] }
 */
export function checkEgress({ modelLocality, rootPolicy = "any", resources }) {
  if (modelLocality !== "remote") return { allowed: [...resources], withheld: [] };

  const allowed = [];
  const withheld = [];
  for (const resource of resources) {
    if (rootPolicy === "local-only") {
      withheld.push({ resource, reason: "root_local_only" });
    } else if (resource.confidential === true || resource.metadata?.confidential === true) {
      withheld.push({ resource, reason: "confidential" });
    } else {
      allowed.push(resource);
    }
  }
  return { allowed, withheld };
}

/** The explicit, actionable refusal line shared by every surface (never a silent omission). */
export function egressNotice(withheld) {
  if (!withheld.length) return "";
  const confidential = withheld.filter((w) => w.reason === "confidential").length;
  const localOnly = withheld.length - confidential;
  const parts = [];
  if (confidential) parts.push(`${confidential} document${confidential > 1 ? "s" : ""} confidentiel${confidential > 1 ? "s" : ""}`);
  if (localOnly) parts.push(`${localOnly} document${localOnly > 1 ? "s" : ""} d'un root local-only`);
  return `${withheld.length} document${withheld.length > 1 ? "s" : ""} retenu${withheld.length > 1 ? "s" : ""} (${parts.join(", ")}) : le modèle choisi est distant. Choisissez un modèle local pour les inclure.`;
}

/**
 * The root's egress policy: `egress: "local-only" | "any"` in base.config.json (default "any").
 * A workspace entry's own `egress` (if any) is the CALLER's to apply — this reads the root itself.
 */
export async function rootEgressPolicy(rootDir) {
  try {
    const raw = await readFile(path.join(rootDir, "base.config.json"), "utf8");
    const config = JSON.parse(raw);
    return config?.egress === "local-only" ? "local-only" : "any";
  } catch {
    return "any";
  }
}
