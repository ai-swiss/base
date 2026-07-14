<!-- Généré par `base build routing-index`. Ne pas éditer: régénéré depuis les AGENT.md/SKILL.md. -->

# Créateur d'agent — process disponibles

**Quand utiliser cet agent**: Expert en création d'assistants IA métier: concevoir, améliorer, diagnostiquer et entretenir des agents BASE.

Choisissez le process dont le «Quand l'utiliser» couvre la demande. Respectez «Éviter si».

## Process

### Activer le routage — [`activer-routage`](skills/processes/activer-routage/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut activer, installer, brancher ou configurer le routage BASE, la CLI `base route`, le serveur MCP ou `route_request`. — Activer le routage BASE — Brancher route_request — Installer le serveur MCP pour choisir le bon agent — Configurer base route
**Éviter si**: Créer un nouvel assistant métier. — Auditer ou nettoyer un BASE existant. — Comprendre ou expliquer comment fonctionne le routage (c'est quoi, comment ça marche).

### Activer la Voie 2 (routage par embeddings) — [`activer-voie2`](skills/processes/activer-voie2/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut activer la Voie 2, brancher des embeddings et un raffineur Ollama, ou affiner le choix de process sur un grand catalogue. — Activer la Voie 2 avec des embeddings Ollama — Brancher des embeddings et un raffineur Ollama sur le choix de process — Installer Ollama pour mieux choisir parmi beaucoup de process — Mon catalogue est grand, affiner le choix avec un modèle d'embedding — Configurer le modèle d'embedding et le raffineur Ollama
**Éviter si**: Brancher le serveur MCP, route_request ou la CLI base route. — Créer un nouvel assistant métier de zéro. — Auditer ou nettoyer un BASE existant.

### Améliorer un agent — [`ameliorer-agent`](skills/processes/ameliorer-agent/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut ajouter un workflow, corriger un comportement, enrichir les connaissances ou faire évoluer un agent. — Je veux améliorer mon assistant — Ajouter un workflow à un agent existant — Corriger le comportement de mon agent
**Éviter si**: Créer un nouvel agent de zéro. — Auditer ou entretenir un BASE existant.

### Créer un agent — [`creer-agent`](skills/processes/creer-agent/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut créer un nouvel assistant IA métier, construire un agent ou adapter l'IA à son activité. — Je veux créer un assistant pour mon métier — Construire un agent pour mon entreprise — J'aimerais un assistant IA pour mon activité
**Éviter si**: Je ne sais pas quel choix faire en premier. — Audit entretien vérification publication readiness d'un BASE existant. — Review audit harden an existing BASE after implementation.

### Diagnostic IA métier — [`diagnostic`](skills/processes/diagnostic/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut identifier les meilleures opportunités IA pour son métier, choisir par où commencer ou prioriser une première tâche à automatiser. — Aide-moi à savoir par où commencer avec l'IA — Quelles tâches de mon métier valent la peine d'automatiser ? — Je ne sais pas quel assistant créer en premier
**Éviter si**: Verifie audit revue architecture securite publication readiness maintenance depot BASE en detail ligne par ligne.

### Entretien BASE — [`entretien-base`](skills/processes/entretien-base/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut auditer, vérifier, nettoyer, préparer à la publication ou évaluer la readiness d'un BASE local. — Audit complet du framework BASE courant — Vérifie si ce BASE est prêt à publier — Fais une revue architecture et sécurité — Vérifie tout en détail, ligne par ligne — Revue de code détaillée comme un architecte senior — Prépare ce dossier pour une équipe — Est-ce que ce BASE est propre et maintenable ? — Review and adapt every issue after implementation — Audit and harden this BASE before release
**Éviter si**: Créer un nouvel assistant métier à partir de zéro. — Améliorer le comportement d'un agent métier précis.

### Importer l'existant — [`importer-l-existant`](skills/processes/importer-l-existant/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut partir de ses documents existants: «importe mes procédures», «transforme ce mode d'emploi en process», «j'ai déjà tout dans un wiki». — Importer mes procédures existantes — Transformer ce document en process — J'ai déjà un wiki, comment le réutiliser ?
**Éviter si**: Question de définition d'un process. — Ajouter un workflow à un agent déjà en place. — Créer un agent de zéro sans matériau existant. — Signaler un dysfonctionnement de l'assistant.

### Promotion de ressource — [`promotion-ressource`](skills/processes/promotion-ressource/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut promouvoir une ressource personnelle en ressource d'équipe, la rendre réutilisable ou partagée. — Promouvoir ce process pour l'équipe — Rendre cette ressource réutilisable par mes collègues — Partager ce fichier personnel avec mon équipe
**Éviter si**: Publier ou diffuser BASE publiquement (open source, releases).
