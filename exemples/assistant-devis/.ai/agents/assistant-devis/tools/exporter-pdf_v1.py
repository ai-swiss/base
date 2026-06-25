#!/usr/bin/env python3
"""
Exporter un devis en PDF professionnel.

Genere un PDF A4 a partir d'un devis JSON (format devis_v1.json).
Le PDF est cree au meme emplacement que le JSON, avec l'extension .pdf.

Dependance : fpdf2 (pip install fpdf2)

Usage :
  python exporter-pdf_v1.py devis/DEV-2026-001.json
  python exporter-pdf_v1.py devis/DEV-2026-001.json --output mon-devis.pdf
"""

import json
import sys
from pathlib import Path

try:
    from fpdf import FPDF
except ImportError:
    print(
        "Erreur : la bibliotheque fpdf2 est necessaire.\n"
        "\n"
        "Pour l'installer :\n"
        "  pip install fpdf2\n"
        "\n"
        "(C'est du Python pur, rien d'autre a installer.)",
        file=sys.stderr,
    )
    sys.exit(1)

FONT = "Helvetica"

# Helvetica = latin-1 uniquement.
# On remplace les caracteres hors latin-1 les plus courants.
_UNICODE_REPLACEMENTS = {
    "\u2014": "-",    # em dash
    "\u2013": "-",    # en dash
    "\u2018": "'",    # guillemet simple gauche
    "\u2019": "'",    # apostrophe typographique
    "\u201c": '"',    # guillemet double gauche
    "\u201d": '"',    # guillemet double droit
    "\u2026": "...",  # points de suspension
    "\u00a0": " ",    # espace insecable
}

NX = "LMARGIN"
NY = "NEXT"


def safe_text(text: str) -> str:
    """Rend le texte compatible avec la police Helvetica."""
    for char, repl in _UNICODE_REPLACEMENTS.items():
        text = text.replace(char, repl)
    return text


# --- Formatage suisse ---


def fmt_chf(montant: float) -> str:
    """Formate en CHF suisse : 1'500.00 CHF."""
    if montant < 0:
        return f"-{fmt_chf(-montant)}"
    parties = f"{montant:,.2f}".replace(",", "'")
    return f"{parties} CHF"


# --- Construction du PDF ---


class DevisPDF(FPDF):
    """PDF pour un devis professionnel A4."""

    def __init__(self, devis: dict):
        super().__init__("P", "mm", "A4")
        self.devis = devis
        self.set_auto_page_break(auto=True, margin=25)

    # --- En-tete et pied de page ---

    def header(self):
        ent = self.devis.get("entreprise", {})
        nom = ent.get("nom", "")
        if nom:
            self.set_font(FONT, "B", 16)
            self.cell(
                0, 8, safe_text(nom),
                new_x=NX, new_y=NY,
            )

        lignes = []
        if ent.get("adresse"):
            lignes.append(ent["adresse"])
        if ent.get("numero_ide"):
            lignes.append(f"IDE : {ent['numero_ide']}")
        contacts = []
        if ent.get("email"):
            contacts.append(ent["email"])
        if ent.get("telephone"):
            contacts.append(ent["telephone"])
        if contacts:
            lignes.append(" | ".join(contacts))

        self.set_font(FONT, "", 9)
        for ligne in lignes:
            self.cell(
                0, 4, safe_text(ligne),
                new_x=NX, new_y=NY,
            )

        self.ln(4)
        self.set_draw_color(200, 200, 200)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-20)
        self.set_font(FONT, "I", 8)
        self.set_text_color(150, 150, 150)
        meta = self.devis.get("devis", {})
        numero = meta.get("numero", "")
        page = f"{self.page_no()}/{{nb}}"
        txt = f"{numero} - Page {page}"
        self.cell(0, 5, txt, align="C")

    # --- Sections du devis ---

    def ajouter_info_devis(self):
        meta = self.devis.get("devis", {})
        self.set_font(FONT, "B", 14)
        titre = f"Devis {meta.get('numero', '')}"
        self.cell(0, 8, titre, new_x=NX, new_y=NY)
        self.ln(2)

        self.set_font(FONT, "", 10)
        champs = [
            ("Date :", meta.get("date_emission", "")),
            ("Validite :", meta.get("date_validite", "")),
            ("Objet :", meta.get("objet", "")),
        ]
        for label, valeur in champs:
            if valeur:
                self.cell(40, 5, label)
                self.cell(
                    0, 5, safe_text(valeur),
                    new_x=NX, new_y=NY,
                )
        self.ln(4)

    def ajouter_client(self):
        client = self.devis.get("client", {})
        if not client.get("nom"):
            return

        self.set_font(FONT, "B", 11)
        self.cell(0, 6, "Client", new_x=NX, new_y=NY)
        self.ln(1)

        self.set_font(FONT, "", 10)
        infos = [
            client.get("nom", ""),
            client.get("adresse", ""),
        ]
        contact = client.get("personne_contact", "")
        if contact:
            infos.append(f"Contact : {contact}")
        if client.get("email"):
            infos.append(client["email"])

        for info in infos:
            if info:
                self.cell(
                    0, 5, safe_text(info),
                    new_x=NX, new_y=NY,
                )
        self.ln(4)

    def ajouter_prestations(self):
        prestations = self.devis.get("prestations", [])
        if not prestations:
            return

        self.set_font(FONT, "B", 11)
        self.cell(
            0, 6, "Prestations",
            new_x=NX, new_y=NY,
        )
        self.ln(2)

        # Largeurs de colonnes
        cw = [10, 80, 20, 20, 30, 30]
        headers = [
            "#", "Description", "Qte",
            "Unite", "Prix unit.", "Total",
        ]

        # En-tete du tableau
        self.set_font(FONT, "B", 9)
        self.set_fill_color(240, 240, 240)
        for i, h in enumerate(headers):
            align = "R" if i >= 2 else "L"
            self.cell(
                cw[i], 7, h,
                border=1, fill=True, align=align,
            )
        self.ln()

        # Lignes de prestations
        self.set_font(FONT, "", 9)
        for p in prestations:
            vals = [
                (cw[0], str(p.get("numero", "")), "L"),
                (cw[1], safe_text(
                    p.get("description", ""),
                )[:50], "L"),
                (cw[2], str(p.get("quantite", "")), "R"),
                (cw[3], p.get("unite", ""), "R"),
                (cw[4], fmt_chf(
                    p.get("prix_unitaire_chf", 0),
                ), "R"),
                (cw[5], fmt_chf(
                    p.get("total_chf", 0),
                ), "R"),
            ]
            for w, txt, align in vals:
                self.cell(
                    w, 6, txt,
                    border=1, align=align,
                )
            self.ln()

        self.ln(4)

    def ajouter_recapitulatif(self):
        fin = self.devis.get("financier", {})
        if not fin:
            return

        self.set_font(FONT, "B", 11)
        self.cell(
            0, 6, "Recapitulatif",
            new_x=NX, new_y=NY,
        )
        self.ln(2)

        label_w = 60
        val_w = 40
        x_start = 90

        def ligne(label, montant, bold=False):
            self.set_x(x_start)
            style = "B" if bold else ""
            bord = "TB" if bold else "B"
            self.set_font(FONT, style, 10)
            self.cell(
                label_w, 6, safe_text(label),
                border=bord,
            )
            self.cell(
                val_w, 6, fmt_chf(montant),
                border=bord, align="R",
            )
            self.ln()

        ligne(
            "Sous-total HT",
            fin.get("sous_total_ht_chf", 0),
        )

        remise = fin.get("remise", {})
        if remise.get("montant_chf", 0) > 0:
            r_type = remise.get("type", "")
            label = f"Remise {r_type}".strip()
            ligne(label, -remise["montant_chf"])
            ligne(
                "Sous-total apres remise",
                fin.get("sous_total_apres_remise_chf", 0),
            )

        tva = fin.get("tva", {})
        taux = tva.get("taux_pourcent", 0)
        ligne(
            f"TVA ({taux}%)",
            tva.get("montant_chf", 0),
        )
        ligne(
            "Total TTC",
            fin.get("total_ttc_chf", 0),
            bold=True,
        )

        self.ln(4)

    def ajouter_conditions(self):
        cond = self.devis.get("conditions", {})
        if not any(cond.values()):
            return

        self.set_font(FONT, "B", 11)
        self.cell(
            0, 6, "Conditions",
            new_x=NX, new_y=NY,
        )
        self.ln(1)

        self.set_font(FONT, "", 10)
        champs = [
            ("Acompte", cond.get("acompte", "")),
            ("Paiement", cond.get("delai_paiement", "")),
            ("Garantie", cond.get("garantie", "")),
        ]
        for label, valeur in champs:
            if valeur:
                txt = f"{label} : {valeur}"
                self.cell(
                    0, 5, safe_text(txt),
                    new_x=NX, new_y=NY,
                )
        self.ln(4)

    def ajouter_signatures(self):
        ent = self.devis.get("entreprise", {})
        cli = self.devis.get("client", {})
        nom_ent = ent.get("nom", "")
        nom_cli = cli.get("nom", "")

        if self.get_y() > 240:
            self.add_page()

        self.ln(8)
        self.set_font(FONT, "B", 11)
        self.cell(0, 6, "Signatures", new_x=NX, new_y=NY)
        self.ln(4)

        self.set_font(FONT, "", 9)
        w = 90
        lbl_ent = f"Pour {nom_ent}" if nom_ent else ""
        lbl_cli = f"Pour {nom_cli}" if nom_cli else ""

        if lbl_ent or lbl_cli:
            self.cell(w, 5, safe_text(lbl_ent))
            self.cell(w, 5, safe_text(lbl_cli))
            self.ln(15)

        tirets = "_________________"
        self.cell(w, 5, f"Lieu, date : {tirets}")
        self.cell(w, 5, f"Lieu, date : {tirets}")
        self.ln(10)

        self.cell(w, 5, f"Signature : {tirets}")
        self.cell(w, 5, f"Signature : {tirets}")
        self.ln()


def generer_pdf(devis: dict) -> FPDF:
    """Assemble le PDF complet."""
    pdf = DevisPDF(devis)
    pdf.add_page()
    pdf.ajouter_info_devis()
    pdf.ajouter_client()
    pdf.ajouter_prestations()
    pdf.ajouter_recapitulatif()
    pdf.ajouter_conditions()
    pdf.ajouter_signatures()
    return pdf


# --- Erreurs ---


def erreur(message: str) -> None:
    """Affiche une erreur et quitte."""
    print(f"Erreur : {message}", file=sys.stderr)
    sys.exit(1)


# --- CLI ---


def main() -> None:
    args = sys.argv[1:]

    if not args or "--help" in args or "-h" in args:
        print(__doc__.strip())
        sys.exit(0)

    fichier = Path(args[0])

    if not fichier.exists():
        erreur(f"fichier introuvable - {fichier}")

    # Fichier de sortie
    if "--output" in args:
        idx = args.index("--output")
        if idx + 1 >= len(args):
            erreur(
                "--output necessite un chemin. "
                "Exemple : --output mon-devis.pdf"
            )
        sortie = Path(args[idx + 1])
    else:
        sortie = fichier.with_suffix(".pdf")

    try:
        contenu = fichier.read_text(encoding="utf-8")
        devis = json.loads(contenu)
    except json.JSONDecodeError as e:
        erreur(
            f"le fichier JSON est mal forme - {e.msg} "
            f"(ligne {e.lineno})"
        )

    if "devis" not in devis or "financier" not in devis:
        erreur(
            "ce fichier ne ressemble pas a un devis. "
            "Utilisez un fichier au format devis_v1.json."
        )

    pdf = generer_pdf(devis)
    pdf.output(str(sortie))

    taille = sortie.stat().st_size / 1024
    print(f"PDF genere : {sortie}")
    print(f"  {taille:.1f} Ko")


if __name__ == "__main__":
    main()
