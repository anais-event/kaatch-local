# Audit sécurité restant (READ-ONLY) — risques, priorités, corrections minimales

Aucune migration appliquée. Analyse du code, des policies et des permissions effectives. Priorité : clôturer le périmètre sécurité sans casser les parcours, puis revenir au produit (Analytics, plan de table).

---

## 1. Risques confirmés (reproductibles au niveau policy/grant)

| # | Risque | Mécanisme | Gravité |
|---|---|---|---|
| R1 | **Vol de tokens invité → usurpation** | `guests` SELECT `USING(true)` + colonne `invite_token` lisible par anon ⇒ un anonyme peut lister les `invite_token` de **tous** les invités et forger `/i/[token]` pour entrer dans **n'importe quel** espace invité. | 🔴 Critique |
| R2 | **Vol de tokens prestataire → usurpation** | `wedding_vendors` SELECT `USING(true)` + `invite_token`/`vendor_code` lisibles par anon ⇒ accès à **n'importe quel** espace prestataire via `/v/[token]` ou `/api/vendor-code`. | 🔴 Critique |
| R3 | **Énumération globale des mariages/invités** | SELECT `USING(true)` sur `weddings`, `guests`, `program_steps`, etc. ⇒ noms, dates, lieux, invités de tous les mariages lisibles via l'API anon. (PII/RGPD) | 🟠 Élevé |
| R4 | **Suppression de documents prestataire d'autrui** | `vendor_documents` DELETE `USING(true)` ; `deleteDocument` fait `delete().eq('id', docId)` sans scope ⇒ anon supprime **n'importe quel** document. | 🟠 Élevé (destructif) |
| R5 | **Insertion de documents dans un autre mariage** | `vendor_documents` INSERT `WITH CHECK(true)` ; `wedding_id`/`vendor_id` viennent du **formulaire** (client). | 🟠 Moyen |
| R6 | **Modification de photos d'autrui** | `photos` UPDATE `USING/ WITH CHECK (true)` ; `invite/photos` met à jour `uploaded_by_name` par `photo_id` sans scope ⇒ anon renomme une photo de **n'importe quel** mariage. | 🟡 Faible (champ d'affichage) |
| R7 | **Cookie session invité/vendor forgeable** | `guest_[slug]` / `vendor_[slug]` = JSON **non signé** ; `/i/[token]` pose même un cookie non-httpOnly. Combiné à R1–R3, permet d'agir comme un invité/vendor arbitraire via l'UI. | 🟠 Élevé (amplificateur) |

Note : R4–R6 sont exploitables **directement via l'API Supabase anon** (clé publique), indépendamment de l'UI — le cookie n'est pas la barrière, la RLS l'est.

## 2. Risques théoriques à vérifier (non démontrés ici)

| # | À vérifier | Comment |
|---|---|---|
| T1 | Bucket Storage `wedding-photos` / `vendor-documents` : RLS des objets (lecture/suppression anon des fichiers eux-mêmes, au-delà des lignes) | inspecter `storage.objects` policies |
| T2 | Écritures anon légitimes non scopées côté INSERT (guestbook, messages, playlist, photos insert) : `wedding_id` depuis le client ⇒ insertion dans un autre mariage | revue ciblée + test synthétique |
| T3 | RPC `guest_rsvp` (SECURITY DEFINER, exécutable anon) : vérifier qu'elle valide bien le token et ne permet pas de modifier un autre invité | lire la définition de la fonction |

## 3. Comparaison de gravité & priorité

**Lectures/tokens (R1, R2, R3) > écritures destructives (R4, R5) > écriture mineure (R6).**
- Un vol de token (R1/R2) donne un **accès complet en lecture et en action** à un espace entier : plus grave qu'une suppression ponctuelle de document.
- R3 est une exposition massive de données personnelles (RGPD).
- R4 est destructif mais localisé ; R6 est cosmétique.

**Point clé — une seule correction couvre plusieurs risques :**
La lecture légitime de `invite_token` est **uniquement** « l'invité lit SA propre ligne » (`faire-part` : `.eq('id', guestData.id)`). Si on déplace cette lecture **côté serveur** (service_role, scopée à l'id du cookie validé) puis qu'on **retire `invite_token` à anon**, on neutralise R1 **sans** toucher au reste. Même schéma pour `wedding_vendors.invite_token/vendor_code` (R2). Ces deux retraits de colonnes ferment les deux usurpations critiques avec un changement minime.

## 4. Fonctionnalités concernées

- R1/R3 : faire-part, accueil invité, RSVP, programme, photos, livre d'or, playlist (toutes lisent via anon).
- R2/R4/R5 : espace prestataire (documents).
- R6 : renommage de photo côté invité.

## 5. Corrections minimales recommandées (Option C — frontière serveur)

Principe commun (par flux, avant tout service_role) : **valider le token/cookie côté serveur → identifier le `wedding_id` autorisé → limiter les données à ce mariage → distinguer lecture/écriture → ignorer tout `wedding_id`/`id` fourni par le client**. service_role reste **strictement serveur**, jamais exposé.

**C1 — Tokens (R1, R2) [priorité 1]**
- `faire-part` : lire `invite_token` du guest via un helper serveur service_role scopé à `guestData.id` issu du cookie validé → puis **REVOKE `invite_token` à anon** sur `guests`.
- Idem `wedding_vendors.invite_token/vendor_code` pour le QR/validation vendor → **REVOKE à anon**.
- Validation : le token n'est jamais lu globalement ; un cookie ne donne accès qu'à sa propre ligne.

**C2 — vendor_documents (R4, R5) [priorité 2]**
- `deleteDocument` / `uploadDocument` : côté serveur, vérifier que le `vendor_id` du cookie est bien autorisé sur le `wedding_id` du slug, et que le `docId` appartient à ce couple (wedding_id, vendor_id) **avant** suppression ; ne pas faire confiance au `wedding_id` du formulaire.
- Resserrer RLS `vendor_documents` INSERT/DELETE (plus de `true`) : écritures via le chemin serveur validé.
- Documents privés : confirmer bucket privé + URLs signées (déjà le cas en lecture ; vérifier T1).

**C3 — photos UPDATE (R6) [priorité 3]**
- `updatePhotoName` : vérifier côté serveur que `photo_id` appartient au `wedding_id` du slug du cookie ; restreindre RLS UPDATE `photos` au contexte (plus de `true`), limiter aux champs autorisés (`uploaded_by_name`/`caption`).

**C4 — Cookies (R7) [priorité transverse]**
- Signer les cookies `guest_[slug]`/`vendor_[slug]` (HMAC) + httpOnly partout. Empêche la forgerie d'identité côté UI.

**C5 — Lectures globales restantes (R3) [priorité 4, plus gros]**
- Basculer progressivement les lectures invité vers des helpers serveur scopés par `wedding_id` validé, puis remplacer les SELECT `USING(true)` par des policies scopées. C'est le gros morceau — à faire parcours par parcours, après C1–C4.

## 6. Tests nécessaires (synthétiques, sans PII réelle)

- R1/R2 : après C1, anon ne peut plus lire `invite_token`/`vendor_code` ; faire-part et QR fonctionnent toujours (parcours réel).
- R4/R5 : anon DELETE/INSERT `vendor_documents` d'un autre mariage refusé ; le prestataire légitime upload/supprime SES docs.
- R6 : anon UPDATE photo d'un autre mariage refusé ; invité renomme SA photo.
- Non-régression : RSVP, photos, programme, livre d'or, playlist, espaces vendor/owner/co-owner.

## 7. Risques de régression

- Retirer `invite_token` à anon **sans** avoir déplacé la lecture faire-part côté serveur ⇒ QR/faire-part cassé. (Ordre strict : déplacer la lecture d'abord.)
- Resserrer `vendor_documents`/`photos` writes sans router par le helper validé ⇒ upload/suppression/renommage cassés.
- C5 (SELECT global) : risque élevé si fait d'un bloc ⇒ obligatoirement parcours par parcours.

## 8. Ordre de correction proposé

1. **C1 — tokens** (ferme R1+R2, changement minime, impact sécurité max)
2. **C2 — vendor_documents** (R4+R5, destructif)
3. **C3 — photos UPDATE** (R6)
4. **C4 — cookies signés** (R7, transverse)
5. **C5 — lectures globales** (R3, gros chantier, parcours par parcours) — à cadrer séparément
6. Vérifs théoriques T1–T3 à intégrer au passage.

> Après C1–C4, le risque critique (usurpation) et les écritures destructives sont traités. C5 peut être étalé. **On pourra alors revenir au produit (cockpit Analytics + WOW plan de table)** pendant que C5 avance par petits lots.

Aucune de ces corrections n'est appliquée. En attente de validation du périmètre et de l'ordre.
