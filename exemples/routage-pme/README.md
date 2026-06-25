# Exemple: routage d'une PME

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«prépare une proposition commerciale pour Dupont»**
3. Vous devriez voir: le routage vers l'assistant commercial et son process «nouveau-devis», puis un devis rédigé (besoin, lignes chiffrées, conditions) avec un point de décision «Je suis prêt à enregistrer le devis. Confirmez-vous?». Rien n'est écrit ni envoyé sans vous.

Un exemple **centré sur le routage**, distinct des assistants métier complets. Il montre comment BASE
choisit le bon agent et le bon process face à des demandes réalistes: synonymes, paraphrases,
demandes ambiguës, hors périmètre et **contre-exemples**.

## Le piège que cet exemple illustre

Deux agents, cinq process, dont plusieurs sont **volontairement proches**:

| Agent | Process | Se déclenche sur | Surtout pas sur |
|---|---|---|---|
| `commercial` | `nouveau-devis` | créer une offre, chiffrer | une facture contestée, une relance |
| `commercial` | `relance-client` | devis sans réponse, facture impayée | créer un devis, une contestation |
| `commercial` | `contestation-facture` | le client conteste une facture émise | créer un devis, relancer |
| `support` | `ticket-incident` | «ça ne marche plus», panne, bug | une demande d'amélioration |
| `support` | `demande-evolution` | «ce serait bien si…», fonctionnalité | une panne |

«Faire une offre» et «le client conteste sa facture» partagent le mot *facture*, mais ne vont pas
au même process. C'est le rôle de `use_when` (signal positif) et `routing.avoid_when` (signal négatif).

## Essayer

```bash
# Router une demande (raisons de score incluses avec --json)
node ../../tools/base.mjs route "le client conteste le montant de sa facture" --root .
node ../../tools/base.mjs route "ce serait bien d'ajouter un export PDF" --root .

# Rejouer les fixtures de routage (paraphrases + contre-exemples + hors périmètre)
node ../../tools/base.mjs route-test --root .
```

`base.config.json` ajoute le `semanticHybrid` zéro-dépendance (alias *proposition → offre/devis*,
*incident → panne/bug*). Pour des embeddings réels, branchez `@ai-swiss/base-ranker-semantic` dans un
`base.config.mjs`; voir le quickstart `docs/guides/routage-semantique-quickstart.md` à la racine du dépôt.

## Ce qu'il faut regarder

- **`use_when`** sur chaque process: la phrase d'intention, premier maillon du `route_text`.
- **`routing.examples`**: des paraphrases réelles, indexées comme signal de routage.
- **`routing.avoid_when`**: les contre-exemples qui *annulent* un score, la clé de la désambiguïsation.
- **`.ai/routing/route-tests.json`**: les routes attendues, protégées en CI comme un test.

Aucune table de routage maintenue à la main: tout est dérivé des fichiers.

---

BASE est un framework par [AI Swiss](https://a-i.swiss).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
