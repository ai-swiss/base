# Créateur d'agent

Un méta-agent qui guide les utilisateurs dans la création de leur propre assistant IA métier. Au lieu de lire de la documentation et de remplir des templates manuellement, l'utilisateur décrit ses besoins et le créateur d'agent construit tout pour lui.

## Pourquoi ce méta-agent existe

Créer un bon agent IA demande un savoir-faire: comprendre comment décomposer un besoin en workflows, identifier les connaissances métier à capturer, structurer les documents types. Ce savoir-faire est encodé dans les skills (processes et compétences) de ce méta-agent, le rendant accessible à n'importe qui par la conversation.

## Comment ça fonctionne

```
"J'aimerais un assistant pour mon cabinet d'architecte"
    │
    ▼
AGENT.md (créateur d'agent)
    │
    ├── Comprend votre métier (questions ouvertes)
    ├── Identifie vos workflows → futurs processes (SKILL.md)
    ├── Identifie vos connaissances → futures compétences (SKILL.md)
    ├── Identifie vos documents → futurs templates
    │
    ▼
Crée un agent complet, prêt à l'emploi
```

## Comment l'utiliser

Dites simplement:
> «J'aimerais créer un assistant pour [votre métier]»

Le méta-agent vous guidera pas à pas. Aucune connaissance technique n'est requise.

## Ce qu'il produit

À la fin de la conversation, vous aurez:
- Un nouveau dossier dans `.ai/agents/` avec votre agent complet (AGENT.md, skills, templates)
- Des dossiers métier à la racine pour vos données
- La configuration de votre outil IA (Claude Code, Cursor, Codex, etc.) pour que l'agent se charge selon l'outil
- Les compétences standard (marqueurs, journal, communication) installées

## Trois modes

1. **Diagnostiquer**: identifier les meilleures opportunités IA pour votre métier
2. **Créer**: construire un nouvel agent de zéro
3. **Améliorer**: enrichir ou modifier un agent existant

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
