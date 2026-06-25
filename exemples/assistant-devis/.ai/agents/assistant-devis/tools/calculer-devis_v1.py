#!/usr/bin/env python3
"""
Calculer les montants d'un devis.

Recalcule automatiquement tous les montants d'un devis JSON :
  - Total par ligne (quantite x prix unitaire)
  - Sous-total HT (somme des lignes)
  - Sous-total apres remise
  - Montant TVA
  - Total TTC

Arrondi au centime (0.01 CHF) par defaut.
Arrondi au 5 centimes avec --arrondi-5.

Usage :
  python calculer-devis_v1.py devis/DEV-2026-001.json
  python calculer-devis_v1.py devis/DEV-2026-001.json --arrondi-5
  python calculer-devis_v1.py devis/DEV-2026-001.json --apercu
"""

import json
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path


# --- Arrondi monetaire suisse ---


def arrondir_centime(montant: Decimal) -> Decimal:
    """Arrondit au centime (0.01 CHF)."""
    return montant.quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP,
    )


def arrondir_5_centimes(montant: Decimal) -> Decimal:
    """Arrondit au 5 centimes (0.05 CHF)."""
    arrondi = (montant * 20).quantize(
        Decimal("1"), rounding=ROUND_HALF_UP,
    )
    return arrondi / 20


# --- Calculs ---


def calculer_total_ligne(prestation: dict) -> Decimal:
    """Quantite x prix unitaire."""
    quantite = Decimal(str(prestation.get("quantite", 0)))
    prix = Decimal(str(prestation.get("prix_unitaire_chf", 0)))
    return quantite * prix


def calculer_devis(devis: dict, arrondi_5: bool = False) -> dict:
    """Recalcule tous les montants du devis."""
    arrondir = arrondir_5_centimes if arrondi_5 else arrondir_centime

    prestations = devis.get("prestations", [])
    financier = devis.get("financier", {})

    # Total par ligne
    sous_total_ht = Decimal("0")
    for prestation in prestations:
        total_ligne = calculer_total_ligne(prestation)
        prestation["total_chf"] = float(arrondir(total_ligne))
        sous_total_ht += total_ligne

    sous_total_ht = arrondir(sous_total_ht)

    # Remise
    remise = financier.get("remise", {})
    montant_remise = Decimal(str(remise.get("montant_chf", 0)))
    montant_remise = arrondir(montant_remise)

    # Sous-total apres remise
    sous_total_apres_remise = arrondir(
        sous_total_ht - montant_remise,
    )

    # TVA
    tva = financier.get("tva", {})
    taux_tva = Decimal(str(tva.get("taux_pourcent", 0)))
    montant_tva = arrondir(
        sous_total_apres_remise * taux_tva / Decimal("100"),
    )

    # Total TTC
    total_ttc = arrondir(sous_total_apres_remise + montant_tva)

    # Ecriture des resultats
    financier["sous_total_ht_chf"] = float(sous_total_ht)
    remise["montant_chf"] = float(montant_remise)
    financier["remise"] = remise
    financier["sous_total_apres_remise_chf"] = float(
        sous_total_apres_remise,
    )
    tva["montant_chf"] = float(montant_tva)
    financier["tva"] = tva
    financier["total_ttc_chf"] = float(total_ttc)
    devis["financier"] = financier

    return devis


def afficher_resume(fichier: Path, devis: dict) -> None:
    """Affiche un resume lisible des montants."""
    f = devis["financier"]
    print(f"Devis recalcule : {fichier.name}")
    ht = f["sous_total_ht_chf"]
    print(f"  Sous-total HT  : {ht:>10.2f} CHF")
    if f["remise"]["montant_chf"] > 0:
        rem = f["remise"]["montant_chf"]
        apr = f["sous_total_apres_remise_chf"]
        print(f"  Remise          : -{rem:>9.2f} CHF")
        print(f"  Apres remise    : {apr:>10.2f} CHF")
    taux = f["tva"]["taux_pourcent"]
    m_tva = f["tva"]["montant_chf"]
    ttc = f["total_ttc_chf"]
    print(f"  TVA ({taux}%)     : {m_tva:>10.2f} CHF")
    print(f"  Total TTC       : {ttc:>10.2f} CHF")


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
    arrondi_5 = "--arrondi-5" in args
    apercu = "--apercu" in args or "--dry-run" in args

    if not fichier.exists():
        erreur(f"fichier introuvable - {fichier}")

    if fichier.suffix != ".json":
        erreur(
            f"le fichier doit etre un JSON, "
            f"recu : {fichier.suffix}"
        )

    try:
        contenu = fichier.read_text(encoding="utf-8")
        devis = json.loads(contenu)
    except json.JSONDecodeError as e:
        erreur(
            f"le fichier JSON est mal forme - {e.msg} "
            f"(ligne {e.lineno})"
        )

    if "financier" not in devis:
        erreur(
            "ce fichier ne ressemble pas a un devis "
            "(section 'financier' manquante)"
        )

    devis = calculer_devis(devis, arrondi_5=arrondi_5)

    if apercu:
        print(json.dumps(devis, indent=2, ensure_ascii=False))
        return

    resultat = json.dumps(devis, indent=2, ensure_ascii=False)
    fichier.write_text(resultat + "\n", encoding="utf-8")
    afficher_resume(fichier, devis)


if __name__ == "__main__":
    main()
