---
schema_version: base.resource.v1
id: remises-confidentielles
type: document
title: Remises confidentielles (Dupont Conseil)
description: Grille de remises négociées, réservée à l'interne, ne doit jamais partir vers un modèle distant.
scope: team
status: active
sensitivity: internal
confidential: true
keywords: [remises, tarifs, confidentiel, egress]
---
# Remises confidentielles de Dupont Conseil

Réservé à l'interne. Cette grille ne doit jamais quitter la machine vers un modèle distant. Le marqueur
`confidential: true` est ce que le contrôle d'egress de BASE honore: sur les chemins qu'il médie (le broker,
le serveur MCP), la ressource est retenue et le refus est explicite; en éditeur direct, aucun code n'est en
jeu, c'est à vous de ne pas la transmettre.

| Client | Remise négociée |
|--------|-----------------|
| Grands comptes (> 50 k CHF/an) | 15 % |
| Partenaires historiques | 10 % |
| Première mission | 5 % |

Ces taux sont des accords privés: ils ne figurent jamais tels quels dans un devis envoyé.
