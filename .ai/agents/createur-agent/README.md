# Créateur d'agent

Un méta-agent qui accompagne chacun dans la création de son propre assistant IA métier. Plutôt que de lire la documentation et de remplir des templates à la main, vous décrivez vos besoins et le créateur d'agent bâtit le reste pour vous.

## Pourquoi ce méta-agent existe

Créer un bon agent IA demande un savoir-faire: décomposer un besoin en workflows, repérer les connaissances métier à capturer, structurer les documents types. Ce savoir-faire est inscrit dans les skills (processes et compétences) de ce méta-agent, qui le met à la portée de tous au fil de la conversation.

## Comment ça fonctionne

```
"J'aimerais un assistant pour mon cabinet d'architecte"
    │
    ▼
AGENT.md (créateur d'agent)
    │
    ├── Cerne votre métier (questions ouvertes)
    ├── Repère vos workflows → futurs processes (SKILL.md)
    ├── Repère vos connaissances → futures compétences (SKILL.md)
    ├── Repère vos documents → futurs templates
    │
    ▼
Crée un agent complet, prêt à l'emploi
```

## Comment l'utiliser

Dites simplement:
> «J'aimerais créer un assistant pour [votre métier]»

Le méta-agent vous guide pas à pas. Aucune connaissance technique n'est requise.

## Ce qu'il produit

Au terme de la conversation, vous disposerez:
- D'un nouveau dossier dans `.ai/agents/` réunissant votre agent complet (AGENT.md, skills, templates)
- De dossiers métier à la racine pour vos données
- De la configuration de votre outil IA (Claude Code, Cursor, Codex, etc.), afin que l'agent se charge selon l'outil
- Des compétences standard (marqueurs, journal, communication), déjà installées

## Trois modes

1. **Diagnostiquer**: repérer les meilleures opportunités IA pour votre métier
2. **Créer**: bâtir un nouvel agent de zéro
3. **Améliorer**: enrichir ou remanier un agent existant

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
