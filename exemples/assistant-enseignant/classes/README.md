# Classes

Ce dossier contient les profils de vos classes, sous forme **anonymisée**. C'est un principe de cet assistant, pas une option: les données d'élèves sont sensibles et n'ont pas leur place dans un outil de préparation.

## Le principe d'anonymisation

Un profil de classe décrit le groupe, jamais les individus:

- **Ce qu'un profil contient**: effectif, degré, niveau général, rythme de travail, besoins de différenciation (ex. «4 élèves ont besoin de consignes simplifiées», «un petit groupe termine toujours en avance»)
- **Ce qu'un profil ne contient jamais**: noms, prénoms, initiales reconnaissables, diagnostics individuels, situations familiales, ou toute information permettant d'identifier un élève

Si une information identifiable se glisse dans une conversation, l'assistant ne l'enregistre pas et vous le signale.

## Convention de nommage

Un fichier par classe, nommé par degré et identifiant neutre:

```
classes/
├── 8e-classe-a.md
└── 10e-classe-b.md
```

## Exemple de profil

```markdown
# Classe 8e A

- Effectif : 22 élèves
- Niveau général : hétérogène, bon en calcul, fragile en résolution de problèmes
- Différenciation : 3-4 élèves ont besoin de consignes simplifiées ; 2-3 élèves demandent des prolongements
- Rythme : une notion nouvelle par semaine fonctionne bien
```
