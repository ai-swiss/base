---
schema_version: base.resource.v1
id: installer-claude-code
type: document
title: Installer Claude Code
description: Installez Claude Code, lancez-le dans un exemple BASE et faites votre première demande, avec un dépannage des erreurs courantes. Pour qui est à l'aise dans un terminal.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
compatibility: [cli]
keywords: [installer, claude code, cli, terminal, anthropic, npm, demarrer]
---

# Installer Claude Code

À la fin de cette page, vous disposerez d'un assistant qui lit et modifie vos fichiers sous votre contrôle, prêt à travailler sur vos vrais documents: BASE cesse alors d'être un texte qu'on lit pour devenir un cadre qui agit. Il faut pour cela être à l'aise dans un terminal et posséder un compte Anthropic. En quelques minutes, vous installez Claude Code, vous le lancez dans un exemple BASE et vous faites une première demande; vous saurez aussi comment réagir en cas de blocage.

Claude Code, l'agent IA d'Anthropic en ligne de commande, n'est qu'une porte d'entrée parmi d'autres: la plupart des outils IA capables de lire et de modifier vos fichiers font l'affaire. Cette page décrit Claude Code; pour les autres, reportez-vous à leur installateur.

Il vous faut un compte Anthropic (abonnement Claude ou accès API). L'installateur natif ne réclame aucune autre dépendance.

## 1. Installer Claude Code

**macOS / Linux / WSL:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

Si vous disposez déjà de Node 18 ou d'une version plus récente, `npm install -g @anthropic-ai/claude-code` convient également. Les commandes exactes peuvent évoluer: dans le doute, fiez-vous à la [documentation officielle](https://code.claude.com/docs).

Vérifiez avec `claude --version`. Au premier lancement, `claude` vous invite à vous connecter à votre compte.

## 2. Lancer `claude` dans un exemple

1. Copiez le dossier d'un exemple (par exemple `exemples/assistant-devis/`) dans votre espace de travail
2. Ouvrez un terminal dans ce dossier
3. Lancez `claude`

Le fichier `CLAUDE.md` placé à la racine de l'exemple fournit à Claude Code son contexte de départ via `@import`: l'agent se charge sans autre configuration.

Vous n'avez pas encore le dépôt? Voir [Obtenir BASE](obtenir-base.md).

## 3. Première demande

Tapez:

> «Bonjour, je voudrais configurer mon activité»

L'assistant vous guide, propose des fichiers et attend votre validation pour les décisions importantes. La suite du parcours (premier devis, marqueurs `[A VALIDER]`) figure dans le [démarrage express](quickstart.md).

## Dépannage de base

| Symptôme | Piste |
| --- | --- |
| `claude: command not found` | Fermer puis rouvrir le terminal; sinon, ajouter à votre PATH le chemin indiqué par l'installateur |
| Problème de connexion au compte | Lancer `claude`, puis taper `/login` |
| L'agent ne se charge pas | Vérifier que `claude` tourne bien dans le dossier de l'exemple, celui qui contient `CLAUDE.md` (`pwd` pour s'en assurer) |
| Besoin d'aide dans la session | Taper `/help` |
| Blocage sur une étape technique | Interroger Claude Code lui-même: «J'ai cette erreur: [coller l'erreur]. Que se passe-t-il?» Précisez votre niveau au besoin. |

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
