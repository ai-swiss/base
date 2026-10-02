<!-- BASE:generated · Généré par `base build routing-index`. Ne pas éditer: régénéré depuis les AGENT.md/SKILL.md. -->

# Concierge BASE: process disponibles

**Quand utiliser cet agent**: Accueillir, orienter et dépanner l'usage de BASE, notamment recueillir une erreur vécue avec un assistant, puis passer la main au bon process.

Choisissez le process dont le «Quand l'utiliser» couvre la demande. Respectez «Éviter si».

## Process

### Accueil BASE: [`accueil`](skills/processes/accueil/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur demande le menu d'aide BASE ou la liste de ses options dans BASE. Quelles sont mes options dans BASE ? Montre-moi le menu d'aide BASE
**Éviter si**: Créer un nouvel assistant métier. Auditer ou nettoyer un BASE existant. Question précise sur un concept BASE.

### Partir de ce que vous avez: [`adopter-ce-dossier`](skills/processes/adopter-ce-dossier/SKILL.md)
**Quand l'utiliser**: Quand une personne montre ce qu'elle a (une discussion ou un compte rendu sur ses besoins, un dossier de documents, des procédures, un CLAUDE.md ou des règles déjà écrites pour l'IA) et veut voir ce qu'un assistant pourrait faire pour elle avant que quoi que ce soit s'écrive. Voici le compte rendu de nos besoins, aide-moi à concevoir une structure de fichiers pour que l'IA y réponde; Voici le compte rendu de notre réunion, dis-moi ce que l'IA pourrait faire pour nous; Voici nos procédures, regarde ce que tu en ferais avant d'écrire quoi que ce soit; On a déjà un CLAUDE.md et des règles, regarde ce qu'on peut en faire; J'ai un dossier plein de documents, qu'est-ce que BASE en ferait? Regarde mon répertoire et propose-moi une structure; Montre à mon équipe ce qu'un assistant pourrait faire ou non pour elle; Évalue mes fichiers avant d'installer quoi que ce soit; Voici mes réponses à la fiche de proposition; J'ai rempli la fiche de proposition, voici l'export; Here is what we have. Show me what an assistant could do for us.
**Éviter si**: Plan de création approuvé, construis-le maintenant. Construis l'assistant avec mes réponses. Carte d'import validée, convertis chaque ressource en diff. Corpus déjà en service, liens morts, frictions ouvertes, abstentions récurrentes. Consigner un dysfonctionnement précis survenu à l'instant. Audit de publication: est-ce prêt à partager, sûr et maintenable.

### Améliorer mes process: [`ameliorer-mes-process`](skills/processes/ameliorer-mes-process/SKILL.md)
**Quand l'utiliser**: Quand une personne dont le BASE fonctionne déjà demande ce qui pourrait aller mieux dans ses process, son routage ou ses fiches. Qu'est-ce qui pourrait aller mieux dans mes process? Mes process sont-ils encore bons? Fais le point sur mon BASE et propose des améliorations; Des frictions traînent depuis des semaines, qu'en faire?
**Éviter si**: Un répertoire plein de fichiers Word, sans rien d'installé encore. Partir de documents existants, avant toute installation, pour bâtir une première structure. Consigner un dysfonctionnement précis qui vient de se produire. C'est quoi un agent, une compétence, un process: une question de vocabulaire, pas un examen du dossier.

### Comprendre BASE: [`comprendre-base`](skills/processes/comprendre-base/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut comprendre comment BASE fonctionne, sa vision, son architecture, le routage, les permissions, ou les racines et workspaces. Explique l'architecture de BASE; Comment fonctionne le routage dans BASE ? Comment marchent les permissions ? Pourquoi BASE existe ? Explique la vision de BASE pour un débutant; Comment marchent les racines et les workspaces ?
**Éviter si**: Créer un nouvel assistant métier. Auditer ou entretenir un BASE existant. Installer ou configurer le routage et le MCP. Définition courte d'un seul terme.

### Dépannage BASE: [`depannage-base`](skills/processes/depannage-base/SKILL.md)
**Quand l'utiliser**: Quand quelque chose ne fonctionne pas dans BASE: un agent introuvable, une mauvaise racine, le MCP non connecté, route_request qui échoue, ou un outil qui ne voit pas les fichiers. Le MCP ne trouve pas mes agents; BASE dit aucun agent trouvé; Mauvaise racine sélectionnée; route_request échoue; Cursor ne voit pas mes fichiers
**Éviter si**: Question de définition sur ce qu'est une racine. Créer un nouvel assistant métier. Première installation du routage à partir de zéro. Auditer la cohérence globale d'un BASE sain.

### FAQ BASE: [`faq-base`](skills/processes/faq-base/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur pose une question simple de définition sur BASE: c'est quoi un agent, un process, une racine, un workspace, le MCP, ou si ses données sont privées. Quelle est la définition d'un agent ? C'est quoi un process ? C'est quoi un agent et un process ? C'est quoi une racine BASE ? C'est quoi un workspace ? Que fait le MCP ? Mes données sont-elles privées avec BASE ? C'est quoi BASE en deux phrases ?
**Éviter si**: Créer un nouvel assistant métier. Auditer ou entretenir un BASE. Installer ou configurer le routage et le MCP. Explication longue d'architecture ou de design.

### Fiche de décision: [`fiche-de-decision`](skills/processes/fiche-de-decision/SKILL.md)
**Quand l'utiliser**: Quand plusieurs choix sont ouverts en même temps et qu'il faut les trancher d'un coup, plutôt qu'un par un dans la conversation. Crée-moi une fiche de décision pour trancher ces points; Aide-moi à arbitrer entre plusieurs options en une fois; Rassemble mes choix et mes accords sur une liste de points ouverts; J'ai plusieurs choix ouverts, fais-moi une fiche interactive
**Éviter si**: Ce qu'un assistant pourra faire ou non pour une équipe, d'après un entretien ou des documents. Réponses à une fiche de proposition, construis l'assistant. Fiche remplie et renvoyée, construire maintenant. Une seule décision, déjà prise, à formaliser en note. Un changement déjà décidé qu'il faut appliquer. Enregistrer durablement une décision unique.

### Intégrer BASE à un outil: [`integrer-un-outil`](skills/processes/integrer-un-outil/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut intégrer BASE à un outil ou une plateforme précis, faire tourner un agent planifié ou autonome, ou connecter BASE à une suite IA. Comment intégrer BASE à mon outil ? Faire tourner un agent planifié à partir d'un process BASE; Connecter BASE à ma plateforme d'agents; Mettre en place un agent autonome avec BASE
**Éviter si**: Comprendre la vision ou la méthode de BASE en général.

### Par où commencer selon votre profil: [`par-ou-commencer`](skills/processes/par-ou-commencer/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut savoir par où commencer avec BASE, en disant ou non qui il est (particulier, PME, indépendant, développeur, institution publique, curieux); sans profil connu, la première étape le demande. Par quoi je commence dans BASE ? Je suis une PME, par où commencer avec BASE ? Je suis développeur, comment commencer avec BASE ? Je suis un particulier, par où commencer avec BASE ? Je travaille dans une administration, par où commencer ?
**Éviter si**: Menu général des options BASE sans profil précis. Créer un assistant métier précis tout de suite. Identifier quelle opportunité IA automatiser dans son activité.

### Signaler une friction: [`signaler-une-friction`](skills/processes/signaler-une-friction/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur exprime un problème avec son assistant lui-même: «ça n'a pas marché», «mon assistant s'est trompé», «le process donne un mauvais résultat», «le barème cité est faux». Mon assistant s'est trompé; Ça n'a pas marché comme prévu; Le process devis donne un mauvais montant; Signaler un problème avec l'assistant
**Éviter si**: Question de définition d'un process. Demander de l'aide pour réaliser une tâche métier. Créer ou améliorer un agent (c'est le créateur d'agent). Vérifier, auditer ou publier un BASE (c'est l'entretien du créateur d'agent).
