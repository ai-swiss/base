# Installer Cursor pour vos agents BASE

Pour faire travailler vos agents BASE, il vous faut un poste où l'IA lit vos fichiers, en écrit et exécute des commandes sous votre contrôle: cette page en met un en place avec Cursor, prêt à l'emploi. Au bout, vous aurez ouvert un exemple, fait votre première demande, et vous saurez quoi faire si quelque chose coince. Cela suppose d'installer un logiciel et de créer un compte chez l'éditeur. Cursor n'est qu'une porte d'entrée: d'autres outils IA capables de lire vos fichiers conviennent aussi (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code); choisissez celui qui vous convient.

Cursor est un espace de travail IA avec interface graphique.

## 1. Installer Cursor

**Télécharger:** [cursor.com](https://cursor.com)

| OS | Instructions |
| --- | --- |
| **Windows** | Télécharger `.exe`, lancer l'installateur |
| **macOS** | Télécharger `.dmg`, ouvrir, glisser dans Applications (version ARM64 pour puces M) |
| **Linux** | Télécharger l'AppImage, rendre exécutable (`chmod +x`), lancer |

**Au premier lancement:**

1. Créer un compte ou se connecter (requis pour accéder aux modèles IA)
2. Choisir un thème (modifiable plus tard)
3. Importer des réglages VS Code existants (optionnel)

## 2. Configurer la confidentialité

1. Ouvrir **Settings** (icône d'engrenage en haut à droite)
2. Aller dans **General**, section **Privacy**
3. Sélectionner **Privacy Mode**

Ce réglage vise à limiter l'utilisation de vos données pour l'entraînement des modèles, selon les conditions de l'outil, que vous devez vérifier vous-même. Il offre une protection partielle: pour des données personnelles, clients ou réglementées, faites valider l'usage par une revue juridique ou sécurité.

## 3. Ouvrir un exemple BASE

1. Copiez le dossier d'un exemple (par exemple `exemples/assistant-devis/`) dans votre espace de travail
2. Ouvrez-le dans Cursor (Fichier → Ouvrir un dossier)
3. Le fichier `.cursor/rules/assistant.mdc` donne à Cursor les règles de chargement de l'agent

Pas encore le dépôt? Voir [Obtenir BASE](obtenir-base.md).

## 4. Première demande

Dites dans le chat:

> «Bonjour, je voudrais configurer mon activité»

L'assistant vous guide, propose des fichiers et attend votre validation pour les décisions importantes. La suite du parcours (premier devis, marqueurs `[A VALIDER]`) est dans le [démarrage express](quickstart.md).

## 5. Lire vos PDF, Word et Excel (optionnel)

L'IA lit nativement le texte (Markdown, TXT, code). Les PDF, Word et Excel sont des formats binaires qui demandent un outil. L'extension **Office Viewer** (panneau Extensions, `Cmd/Ctrl + Shift + X`) permet déjà de les visualiser dans Cursor. Pour que l'IA les lise, deux options qui peuvent coexister:

**Option A, convertir en Markdown avec [Docling](https://docling-project.github.io/docling/)** (documents de référence, usage fréquent):

```bash
pip install docling   # ou: uv tool install docling
docling --to md --output "/chemin/sortie/" "/chemin/document.pdf"
```

Le fichier `.md` généré conserve titres et tableaux. Pour automatiser, ajoutez la commande en exemple dans `Cursor Settings > General > Rules and Commands`, puis dites simplement «Convertis ce fichier [chemin]».

**Option B, serveur MCP [Document Loader](https://awslabs.github.io/mcp/servers/document-loader-mcp-server)** (lecture ponctuelle, extraction à la volée):

1. Installer `uv`: `curl -LsSf https://astral.sh/uv/install.sh | sh` (macOS/Linux) ou `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` (Windows). Vérifier avec `uvx --version`.
2. Dans `Cursor Settings > MCP`, cliquer «Add MCP Server» et ajouter:

```json
{
  "mcpServers": {
    "awslabs.document-loader-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.document-loader-mcp-server@latest"],
      "env": { "FASTMCP_LOG_LEVEL": "ERROR" }
    }
  }
}
```

3. N'activez que `read_document`. L'outil `read_image` interfère avec la lecture native d'images des LLM.
4. Testez: «Lis ce PDF [chemin] et résume-le.» Sur macOS, si `uvx` n'est pas trouvé, indiquez son chemin complet (`/usr/local/bin/uvx` ou `~/.local/bin/uvx`).

## Dépannage de base

| Symptôme | Piste |
| --- | --- |
| L'explorateur est vide | Rouvrir le bon dossier (Fichier → Ouvrir un dossier) |
| L'IA ne trouve pas un fichier | Clic droit sur le fichier → **Copy Path**, coller le chemin exact dans le chat |
| Un PDF reste illisible | Reprendre l'option A ou B ci-dessus |
| Blocage sur une étape technique | Demander à l'IA elle-même: «J'ai cette erreur: [coller l'erreur]. Que se passe-t-il?» Précisez votre niveau si besoin. |

Astuces de chat: `Cmd/Ctrl + V` colle une URL comme contexte (si l'IA a accès au web); `Cmd/Ctrl + Shift + V` colle le contenu texte de l'URL, utile si le site bloque les robots.

Pour vérifier l'installation: glissez un `.md` dans le chat et demandez un résumé, puis «Crée un fichier test.md avec Hello», puis «Liste mes fichiers avec la commande ls dans un terminal». Si tout passe, l'IA voit, lit, écrit et exécute. Référence complète: [docs.cursor.com](https://docs.cursor.com).

Cursor excelle pour le travail itératif sur fichiers. Pour la recherche web approfondie (Deep Research, Perplexity), la génération d'images (Midjourney, Ideogram) ou de vidéos (Veo, Runway), utilisez des outils spécialisés.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
