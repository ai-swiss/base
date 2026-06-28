<!-- fr-synced: 86b4a62cddb75aab9ef25365a895578a40f33061 -->

# Wo Sie beginnen

Das Repository kann auf den ersten Blick dicht wirken, denn es vereint drei Dinge gleichzeitig: ein nutzbares Framework, fachliche Beispiele und eine überprüfbare technische Grundlage. Diese Seite erspart Ihnen, alles zu lesen, indem sie Ihnen die Lesereihenfolge gibt, die zu Ihrer Situation passt, ob Sie allein sind, in einem KMU, in einem Grossunternehmen oder im öffentlichen Sektor.

Sie ist zugleich die Quelle der Wahrheit für die Lesepfade. Andere Dokumente können einen kurzen Kompass übernehmen, aber dieses behält die vollständige Hierarchie nach Profil.

## Wenn Sie eine Einzelperson sind

Ziel: schnell ausprobieren, genug verstehen, Ihre Dateien lesbar halten.

Lesen Sie in dieser Reihenfolge:

1. `README.md`, um die allgemeine Idee zu verstehen.
2. `docs/learn/co-penser-avec-lia.md`, um zu verstehen, *warum* BASE notwendig ist (die Methode, kurz gefasst).
3. **`docs/tutoriel/index.md`**, das Tutorial «Lernen durch Tun»: der empfohlene Pfad, Schritt für Schritt und auf jeder Stufe überprüft (Entdeckung ohne Installation, Praktiker, Team).
4. `docs/start/quickstart.md`, um es in wenigen Minuten auszuprobieren (oder `docs/start/essayer-sans-installer.md`, wenn Sie nur einen Browser haben, ohne etwas zu installieren).
5. Die Demo `exemples/assistant-devis-demo/`, dann der Ordner `exemples/assistant-devis/`, wenn Sie von Ihren eigenen Daten ausgehen möchten.
6. `docs/learn/comprendre.md` nur, wenn Sie die Methode vertiefen möchten.
7. `docs/trust/evidence.md`, wenn Sie die Versprechen und ihre Grenzen prüfen möchten.

Am Anfang können Sie ignorieren:

- `mcp/`;
- `tools/`;
- `tests/`;
- `base.schema.json`;
- `base.manifest.json`;
- `docs/reference/specification-v0.md`.

Auf dieser Ebene kann BASE sehr einfach bleiben: ein Assistent, ein paar Markdown-Dateien, explizite menschliche Entscheidungen.

Wenn Sie nicht weiterwissen, sagen Sie einfach «Hilfe» oder «Ich bin verloren». Mit aktiviertem Routing empfängt BASE Sie (`concierge-base`), statt Sie ohne Anschluss zu lassen; andernfalls laden Sie `.ai/agents/concierge-base/AGENT.md`.

## Wenn Sie ein KMU oder ein kleines Team sind

Ziel: von einer individuellen Nutzung zu einem geteilten Arbeitsgedächtnis übergehen.

Lesen Sie in dieser Reihenfolge:

1. `README.md` für die Intuition und die Beispiele.
2. `docs/learn/co-penser-avec-lia.md` für das Warum: die Überprüfung, die vier Verluste, die Methode.
3. `docs/start/quickstart.md` für den lokalen Start und die Befehle.
4. `docs/audiences/kit-demarrage-pme-suisse.md`, um die Teamregeln festzulegen: Daten, Validierung, Versionierung, Pflege.
5. `docs/audiences/pour-qui.md`, um Ihr Adoptionsniveau einzuordnen.
6. `docs/reference/framework-public.md`, um die stabilen Abstraktionen zu verstehen.
7. `docs/reference/routage-process-et-ressources.md`, um die Kette Agent -> Process -> Ressourcen zu verstehen.
8. `docs/guides/routage-semantique-quickstart.md`, um zu verstehen, wie BASE Agent und Process auswählt.
9. `docs/learn/pratiques-co-pensee.md`, um die schlechten Nutzungen der KI zu vermeiden.
10. `docs/reference/documentation-interactive.md`, wenn Sie eine lebendige Dokumentation bereitstellen oder ausliefern möchten, ohne die Quellen zu duplizieren.

Auf dieser Ebene sind die wichtigen Dateien:

- `.ai/agents/` für die Agenten und Skills;
- `exemples/`, um eine fachliche Basis zu kopieren;
- `tools/`, um zu validieren, zu indexieren, zu entdecken und zu pflegen;
- `base.schema.json`, um die geteilten Metadaten zu stabilisieren.

Wenn Sie **mehrere BASE-Wurzeln** verwalten (zum Beispiel mehrere Kunden), deklariert eine `base.workspace.json` mehrere Wurzeln: `base route --workspace <fichier>` sucht zwischen ihnen und `--root-id <id>` zielt auf eine bestimmte Wurzel (jedes Lesen und Schreiben bleibt auf die gewählte Wurzel beschränkt). Siehe [Routing, Process und Ressourcen](../reference/routage-process-et-ressources.md) und `specs/current/10_core/cli.md`.

Sie brauchen keine schwere Plattform. Sie brauchen klare Konventionen, eine lokale Validierung, lesbare Beschreibungen und eine regelmässige Pflege.

## Wenn Sie ein Grossunternehmen sind

Ziel: BASE als Strukturierungssprache und Integrationsgrundlage bewerten, nicht als vollständige Compliance-Plattform.

Lesen Sie in dieser Reihenfolge:

1. `docs/learn/co-penser-avec-lia.md` für das *Warum* (allen Profilen gemeinsam): die Überprüfung, die vier Verluste, die Methode.
2. `docs/reference/framework-public.md` für das öffentliche Modell.
3. `docs/reference/base-et-vos-outils-ia.md`, um zu verstehen, wie BASE mit Ihren KI-Tools und -Plattformen koexistiert (und einen geplanten Agenten darin integriert), dann `docs/reference/positionnement.md`, um BASE Kategorie für Kategorie in der Tool-Landschaft von 2026 einzuordnen.
4. `docs/reference/etat-implementation.md`, um Geliefertes, Geplantes und ausserhalb des Geltungsbereichs zu unterscheiden.
5. `docs/guides/choisir-provider-embeddings.md`, um lokal, Cloud, Gateway und internes Modell zu vergleichen.
6. `docs/trust/securite-donnees-routage.md`, um die an die Provider gesendeten Daten einzugrenzen.
7. `docs/learn/comprendre-echelle.md` und `docs/guides/benchmarks-echelle.md`, um den optionalen Index zu beurteilen.
8. `docs/reference/specification-v0.md` für die langfristige Architektur.
9. `mcp/README.md` für die Integration in KI-Plattformen.
10. `docs/trust/securite-et-limites.md` für das Sicherheitsmodell und seine Grenzen.
11. `docs/audiences/kit-enterprise.md` für die Bereitstellungsmodi, die strikte Konfiguration und die Enterprise-Grenzen.
12. `docs/trust/souverainete-et-confiance.md`, um die Wahl zu rechtfertigen (Souveränität, nDSG, Lizenz, Governance) auf einer Seite.
13. `base.schema.json`, um den maschinenlesbaren Vertrag zu inspizieren.
14. `tests/`, um zu sehen, was überprüft wird.

Auf dieser Ebene muss BASE mit den Systemen der Organisation verbunden werden: IAM, SSO, RBAC, DLP, SIEM, Aufbewahrung, Klassifizierung, rechtliche Prüfung, Geheimnisverwaltung und Trennung der Umgebungen.

Die richtige Lesart ist also:

```text
BASE public = structure lisible + broker local + MCP + tests
Entreprise = gouvernance, sécurité et intégration autour de cette structure
```

## Wenn Sie eine öffentliche Institution sind

Ziel: BASE bewerten, ohne lokale, local-first-Komponente, institutionelle Compliance und Anbieterpolitik zu vermischen.

Lesen Sie in dieser Reihenfolge:

1. `docs/learn/co-penser-avec-lia.md` für das *Warum*: menschliche Überprüfung, Verantwortung und Gedächtnis.
2. `docs/trust/souverainete-et-confiance.md` für die Zusammenfassung zu nDSG, Lizenz, Sicherheit und Governance.
3. `docs/audiences/kit-administration-secteur-public.md`, um Bürgerdaten, Klassifizierung, Barrierefreiheit, Archivierung und öffentliche Beschaffung einzugrenzen.
4. `docs/trust/securite-et-limites.md`, um sichtbar zu halten, was BASE nicht allein durchsetzt.
5. `docs/audiences/kit-enterprise.md` für die strikte Konfiguration und die Bereitstellungsmodi.
6. `mcp/README.md`, wenn die Institution BASE mit einer KI-Plattform verbinden möchte.
7. `specs/current/README.md`, `base.schema.json` und `tests/` für die technische Prüfung.

Auf dieser Ebene ist BASE eine auditierbare Komponente. Die Compliance bleibt in Ihren institutionellen Entscheidungen: Rechtsgrundlage, Verzeichnis der Verarbeitungstätigkeiten, IAM, DLP, Archivierung, Beschaffung, Modellanbieter und rechtliche Prüfung.

## Was jeder Ordner bedeutet

| Element | Rolle | Wann lesen |
| ------- | ---- | ------------ |
| `README.md` | Eingangstor | Immer |
| `BASE_BOOTSTRAP.md` | Generischer Routing-Bootstrap für KI-Harnesse | Wenn Sie BASE in ein KI-Tool integrieren |
| `.ai/agents/` | Portabler Kern der Assistenten | Wenn Sie BASE anpassen |
| `.ai/agents/concierge-base/` | Empfang und Hilfe von BASE (Rückfallziel des Routers) | Wenn Sie nicht weiterwissen oder eine Frage zu BASE haben |
| `exemples/` | Kopierbereite Assistenten | Wenn Sie ausprobieren möchten |
| `docs/` | Erklärungen, Prinzipien, Architektur | Je nach Ihrem Profil |
| `docs/start/demo-60-secondes.md` | BASE in Aktion sehen: es stützt sich auf eine Datei, nennt seine Quelle und setzt einen Validierungspunkt | Wenn Sie BASE sehen möchten, bevor Sie lesen |
| `docs/audiences/kit-demarrage-pme-suisse.md` | Praktische Regeln für ein kleines Schweizer Team | Wenn Sie einen Assistenten in einem KMU teilen |
| `docs/audiences/kit-enterprise.md` | Strikte Konfiguration, Bereitstellungsmodi und Enterprise-Grenzen | Wenn Sie BASE in einer Organisation bewerten |
| `docs/audiences/kit-administration-secteur-public.md` | Checkliste für öffentliche Institutionen | Wenn Bürgerdaten, Beschaffung oder Archivierung in den Geltungsbereich fallen |
| `docs/reference/documentation-interactive.md` | Lokale, öffentliche und auslieferbare Dokumentation, generiert aus den Quellen | Wenn Sie BASE in einem Portal lernen, veröffentlichen oder prüfen möchten |
| `docs/trust/evidence.md` | Versprechen, Mechanismen, Tests und Grenzen | Wenn Sie die Aussagen von BASE prüfen möchten |
| `docs/reference/glossaire.md` | Definitionen der Begriffe (Broker, Routing, Mechanismus, Consigne, Egress) | Wenn ein technisches Wort unklar ist |
| `docs/reference/routage-process-et-ressources.md` | Doktrin Agent -> Process -> Ressourcen | Wenn Sie das Routing aktivieren oder mehrere Workflows strukturieren |
| `tools/` | Lokale CLI und Broker | Wenn Sie überprüfen oder automatisieren möchten |
| `mcp/` | Adapter zu MCP-kompatiblen KI-Tools | Wenn Sie integrieren möchten |
| `tests/` | Überprüfbare Garantien | Wenn Sie prüfen oder beitragen |
| `specs/` | Engineering-Spezifikation (`UR/FR/NFR/AD`, Schemata) | Wenn Sie tiefgehend integrieren oder prüfen |
| `packages/` | Optionale offizielle Packages (semantischer Ranker, lokaler Index) | Im grossen Massstab, für schwierige oder grosse Korpora |
| `base.config.json` | Lokale Konfiguration: Erweiterungen und Hilfe-Rückfall (`routing.fallback`) | Wenn Sie das Routing oder einen Rückfall aktivieren |
| `base.workspace.json` | Mehrere deklarierte BASE-Wurzeln (Multi-Client) | Wenn Sie mehrere BASE-Wurzeln verwalten |
| `base.schema.json` | Vertrag der Metadaten | Wenn Sie teilen oder governieren |
| `base.manifest.json` | Generierter Index | Wenn Sie die Entdeckung inspizieren |
| `SECURITY.md` | Meldungsrichtlinie | Wenn Sie ein Risiko bewerten oder melden |
| `CHANGELOG.md` | Bemerkenswerte Änderungen | Wenn Sie die Versionen verfolgen |
| `LICENSE` | Doppellizenz | Wenn Sie wiederverwenden oder veröffentlichen |
| `docs/trust/licence.md` | Lesbare Erklärung der Lizenz | Wenn Sie die Wiederverwendung verstehen möchten |
| `CLAUDE.md` | Claude-Code-Adapter | Nur für diesen Harness |
| `.cursor/rules/` | Cursor-Adapter | Nur für Cursor |

## Was nicht der Kern ist

`CLAUDE.md` und `.cursor/rules/` existieren, um bestimmten Tools zu helfen, den richtigen Kontext zu laden. Sie definieren BASE nicht.

`base.manifest.json` wird von `base index` generiert. Es erleichtert die Entdeckung, aber es ist nicht die Quelle der Wahrheit.

`mcp/` ist eine Integration. Sie beweist die Portabilität, aber Sie können BASE ohne MCP-Server verwenden.

`tests/` und `tools/` machen das Framework glaubwürdig und wartbar. Wer nur einen Assistenten ausprobieren möchte, kann sie ignorieren.
