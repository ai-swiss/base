<!-- BASE:generated · Généré par `base build routing-index`. Ne pas éditer: régénéré depuis les AGENT.md/SKILL.md. -->

# Assistant commercial: process disponibles

**Quand utiliser cet agent**: Quand la demande concerne la vente, un devis, une offre, une relance de paiement ou une contestation de facture.

Choisissez le process dont le «Quand l'utiliser» couvre la demande. Respectez «Éviter si».

## Process

### Contestation de facture: [`contestation-facture`](skills/processes/contestation-facture/SKILL.md)
**Quand l'utiliser**: Quand un client conteste une facture déjà émise - montant, prestation ou erreur - et qu'il faut instruire le litige. le client conteste le montant de sa facture; réclamation sur une facture envoyée; le client dit qu'on a facturé une prestation non réalisée
**Éviter si**: créer un nouveau devis; chiffrer ou proposer une nouvelle prestation; relancer un paiement en retard

### Nouveau devis: [`nouveau-devis`](skills/processes/nouveau-devis/SKILL.md)
**Quand l'utiliser**: Quand l'utilisateur veut préparer une nouvelle offre commerciale, un devis ou un chiffrage pour un client. prépare une proposition commerciale pour Dupont; faire une offre pour un nouveau client; chiffrer une prestation
**Éviter si**: le client conteste une facture existante; facture contestée; relancer un paiement en retard

### Relance client: [`relance-client`](skills/processes/relance-client/SKILL.md)
**Quand l'utiliser**: Quand un devis reste sans réponse ou qu'une facture est en attente de paiement et qu'il faut relancer le client. relancer la facture impayée de Martin; le client n'a pas répondu à mon devis; envoyer un rappel de paiement
**Éviter si**: créer un nouveau devis; le client conteste le montant de sa facture; un problème vague ou non qualifié avec un client, sans mention de paiement, de retard ni de relance
