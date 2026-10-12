# Row-scoping invité — Livrable de décision (avant toute migration)

Projet Supabase : **KAATCH** `jbnhkyleqtbftpqqqluz`. Aucune migration de row-scoping appliquée. Ce document = vérification P0 + cartographie + architecture proposée. **En attente de validation avant implémentation.**

---

## 1. Vérification des 5 migrations déjà appliquées (P0)

Point PostgreSQL vérifié : **un REVOKE colonne n'enlève pas un SELECT table-level** — j'avais donc fait `REVOKE SELECT ON table` + `GRANT SELECT (colonnes autorisées)`.

**Grants table-level (anon)** : plus aucun `SELECT` sur `guests, weddings, promo_codes, promo_code_uses, wedding_vendors`. `PUBLIC` n'a aucun grant sur ces tables. (anon conserve INSERT/UPDATE/DELETE table-level — défaut Supabase, gated par RLS, voir §3.)

**Grants colonne (anon) effectifs** :
- `guests` : tout SAUF email, telephone, rsvp_token, notes, metadata.
- `weddings` : tout SAUF guest_password, guest_code, co_owner_email.
- `wedding_vendors` : tout SAUF email, phone.
- `promo_codes`, `promo_code_uses` : **aucune colonne**.

**Test sous le rôle `anon` réel** (aucune donnée retournée) :
```
guests.email=DENIED  telephone=DENIED  rsvp_token=DENIED  notes=DENIED  metadata=DENIED  first_name=ALLOWED
weddings.guest_password=DENIED  guest_code=DENIED  co_owner_email=DENIED  name=ALLOWED  share_code=ALLOWED
wedding_vendors.email=DENIED  phone=DENIED  name=ALLOWED
promo_codes.code=DENIED  promo_code_uses.code_id=DENIED
```
✅ **Mitigation confirmée effective en production.** RLS toujours active sur toutes les tables.

---

## 2. Flow faire-part & validation des liens (mécanisme réel)

```
Mariés /wedding/invitations → bouton 💌 → /i/[invite_token]
  /i/[token]/route.ts (Route Handler) :
    - lookup guests WHERE invite_token = token  (service_role si clé, sinon anon)
    - pose cookie guest_[slug] = { firstName, lastName, id }  (NON httpOnly, NON signé)
    - redirect /invite/[slug]/faire-part
Autre porte : /p/[share_code] → GuestAuthForm → /api/guest-auth (match prénom+nom) → cookie (httpOnly)
Prestataire : /v/[invite_token] et /api/vendor-code (vendor_code) → espace /vendor/[slug]
```
- **Credential racine invité** = `guests.invite_token` (uuid). **Credential vendor** = `wedding_vendors.invite_token` / `vendor_code`.
- **« Session » invité** = cookie `guest_[slug]` non signé → **forgeable** ; aujourd'hui la confiance repose sur la RLS ouverte + l'uuid.
- Toutes les lectures/écritures de l'espace invité = rôle **anon** via `createSupabaseServerClient()`.

---

## 3. Matrice d'accès par rôle (tables cœur)

Légende exposition : 🔴 trop permissif · 🟠 à scoper · 🟢 ok.

| Table | Contenu | Lecture anon nécessaire ? | Écriture anon nécessaire ? | Exposition actuelle | Correction visée |
|---|---|---|---|---|---|
| `weddings` | infos mariage | Oui (le SIEN) | Non | 🔴 SELECT `USING(true)` = tous les mariages | SELECT scopé par mariage autorisé |
| `guests` | invités + PII | Oui (son mariage, sans email/tel) | Oui (sa propre ligne : RSVP, message) | 🔴 SELECT tous invités + **invite_token** lisible → usurpation | SELECT scopé mariage ; UPDATE scopé à SA ligne |
| `photos` | album | Oui (son mariage) | INSERT oui ; **UPDATE `true`** 🔴 | 🔴 anon peut renommer n'importe quelle photo | SELECT/INSERT/UPDATE scopés mariage |
| `program_steps` | programme | Oui (visible_to_guests) | Non | 🟠 SELECT tous | SELECT scopé mariage |
| `messages` | messagerie | Oui (son mariage) | INSERT oui | 🟠 SELECT/INSERT tous mariages | scoper par groupe/mariage |
| `message_groups` | groupes | Oui | **UPDATE/DELETE si `auth.uid() IS NULL`** 🔴 | 🔴 anon peut modifier/supprimer groupes d'autrui | retirer la branche `OR auth.uid() IS NULL` |
| `playlist_songs` | playlist | Oui | INSERT oui | 🟠 SELECT/INSERT tous | scoper par mariage |
| `guestbook_entries` | livre d'or | Oui | INSERT oui | 🟠 INSERT sans scope wedding | scoper INSERT par mariage |
| `photo_comments` / `photo_likes` | interactions | Oui | INSERT oui | 🟠 tous | scoper via photo→mariage |
| `wedding_vendors` | prestataires (PII retirée) | Oui (vendor : le sien) | **INSERT/UPDATE/DELETE `true`** 🔴 | 🔴 anon peut créer/modifier/supprimer n'importe quel prestataire | writes → owner-only ; SELECT scopé |
| `vendor_documents` | docs privés | Oui (vendor concerné) | INSERT oui ; **DELETE `true`** 🔴 | 🔴 `file_url` de tous + suppression anon | SELECT/DELETE scopés mariage/vendor |
| `accommodations`, `seating_tables`, `wedding_rules` | contenu mariage | Oui | Non (owner ALL) | 🟠 SELECT tous | SELECT scopé mariage |

**Colonnes sensibles explicitement demandées :**
| Colonne | Garder accessible anon ? | Condition |
|---|---|---|
| `weddings.notification_email` | Non idéalement | lu par livre-dor/photos pour notifier le couple → déplacer cette lecture côté serveur autorisé, puis retirer d'anon |
| `weddings.share_code` | Oui, temporairement | sert aux redirections `/p/[code]` ; à terme lecture serveur only |
| `guests.invite_token` | **Non à terme** (fuite majeure) | nécessaire au faire-part (lit le SIEN) → doit être scopé à la ligne de l'invité, pas lisible globalement |
| `wedding_vendors.invite_token` / `vendor_code` | **Non à terme** | credentials vendor → validation serveur only |
| `vendor_documents.file_url` | Oui pour le vendor concerné | scoper au mariage/vendor autorisé |

---

## 4. Architecture de correction — évaluation (ne pas choisir à l'aveugle)

Le cœur du problème : la RLS a besoin d'un **signal d'autorisation fiable par requête**. Un slug/token **dans l'URL n'est pas** une claim fiable : il doit être **validé côté serveur contre la BDD**, puis transformé en autorisation que Supabase peut vérifier.

### Option A — JWT invité signé + RLS par claim
- À l'entrée (`/i/[token]`, `guest-auth`) : valider le token/nom en BDD, puis **émettre un JWT signé** (secret JWT du projet) `role=anon` + claims `wedding_id`, `guest_id`, `exp` court. Cookie **httpOnly signé**. Le client invité l'utilise comme `access_token`.
- RLS : `USING (wedding_id = (auth.jwt() ->> 'wedding_id')::uuid)` en lecture ; `WITH CHECK` idem en écriture ; self-update invité via `id = (auth.jwt() ->> 'guest_id')::uuid`.
- **Empêcher l'accès croisé** : la claim `wedding_id` est posée par le serveur après validation, jamais depuis l'URL → un token d'un mariage ne peut pas lire un autre.
- **Lecture/écriture séparées** : policies SELECT vs INSERT/UPDATE/DELETE distinctes par claim.
- **Révocation** : `exp` court (ex. 24 h) + re-mint au clic sur le lien ; rotation d'`invite_token` côté mariés invalide les futurs mint. (Révocation immédiate d'un JWT déjà émis = non triviale → garder exp court.)
- **Dépendance infra** : nécessite le **secret JWT** du projet côté serveur (à confirmer dispo).
- Changements code : **faibles** (les `select` existants restent ; seul le client invité change + réécriture des policies).

### Option B — SECURITY DEFINER RPC scopées par token
- Fonctions SQL `get_wedding(token)`, `list_guests(token)`… valident le token et ne renvoient que le bon mariage ; base tables verrouillées owner-only.
- Réécriture de **chaque** lecture invité en appel RPC (SQL) → **lourd**, risque de ré-exposition si une RPC oublie un filtre.

### Option C — Frontière d'autorisation serveur (Route Handler/Server Action + service_role server-only)
- Les pages invité sont déjà server-side. Un helper `getGuestContext(slug)` lit le cookie, **valide** qu'il correspond au mariage, renvoie `{ weddingId, guestId }` ou 403.
- Les lectures invité passent par des helpers qui **forcent** `.eq('wedding_id', weddingId)` via un client **service_role strictement serveur** ; base tables verrouillées owner-only.
- service_role **jamais** exposé au client. Réutilise le cookie/token existant, pas de nouveau système de tokens, pas de JWT.
- Risque : discipline — toute requête doit passer par le helper scopant (sinon service_role renverrait tout). Mitigé par un wrapper unique.
- Changements code : **moyens** (bascule des lectures invité vers le helper, mais requêtes restent en TS).

### Recommandation
- **Si le secret JWT est disponible : Option A** — meilleure sûreté (RLS DB-enforced), corrige la forgeabilité du cookie, le moins de changements sur les requêtes.
- **Sinon : Option C** — pragmatique, service_role server-only, réutilise l'existant, pas de nouvelle crypto. Requiert un wrapper de scoping discipliné.
- **Option B écartée** (trop lourde, surface d'erreur élevée).

Dans les deux cas retenus : **cookie à signer/httpOnly** et base tables **verrouillées owner-only** en fin de parcours (après bascule des lectures).

---

## 5. Migrations correctives à ajouter (nouvelles, non rétroactives) — À VALIDER

Par étapes, versionnées, testées une par une. Ordre proposé (du moins risqué au plus) :

1. **Colmater les writes destructifs anon** (gain sécu immédiat, risque faible) :
   - `wedding_vendors` : remplacer les policies INSERT/UPDATE/DELETE `USING true` par owner-only (`wedding_id IN (select id from weddings where couple_id = auth.uid())`).
   - `vendor_documents` : DELETE/INSERT → scoper (owner, ou vendor autorisé).
   - `message_groups` : retirer la branche `OR auth.uid() IS NULL` des UPDATE/DELETE.
   - `photos` UPDATE : restreindre (au lieu de `true`).
   → À vérifier d'abord : l'espace invité/vendor n'effectue pas ces écritures en anon (sinon prévoir le chemin autorisé).
2. **Mettre en place le contexte d'autorisation** (Option A ou C) sans encore retirer les `USING(true)` (compatibilité).
3. **Basculer les lectures invité** parcours par parcours vers le contexte autorisé.
4. **Verrouiller les SELECT** `USING(true)` → scopés, parcours par parcours.
5. **Retirer d'anon** `invite_token`, `share_code`, `notification_email`, `wedding_vendors.invite_token/vendor_code`, `vendor_documents.file_url` une fois les lectures scopées.

---

## 6. Tests d'autorisation prévus (reproductibles, sans PII réelle)

1. Invité lien valide → accès à SON mariage, sans compte. ✅ attendu
2. Token invalide → refus.
3. Invité tentant un AUTRE mariage (slug/token croisé) → refus.
4. Anonyme sans autorisation → aucun accès global mariages/invités/tokens.
5. Propriétaire connecté → parcours inchangé.
6. Autre utilisateur connecté → refus sur mariage d'autrui.
7. Prestataire autorisé → son espace uniquement.
8. Prestataire non autorisé → refus docs/données d'autres mariages.
9. Parcours invité complet : consultation, RSVP, photos, programme, livre d'or, playlist.
10. Absence d'exposition email/téléphone/tokens hors contexte.

Méthode : requêtes sous rôle `anon` + JWT/claims simulés renvoyant DENIED/ALLOWED et des **comptes**, jamais de données personnelles ; plus tests parcours via dev server.

---

## 7. Risques de régression

- Retirer `USING(true)` sans avoir basculé toutes les lectures → **espace invité cassé** (écran vide/erreur). → bascule parcours par parcours, compat maintenue.
- Writes anon légitimes (RSVP, upload photo, suggestion playlist, livre d'or) : s'assurer qu'ils passent par le chemin autorisé avant de resserrer les policies write.
- Option A : secret JWT manquant → bloquant ; mauvaise claim → refus massif. Option C : requête oubliant le scope → fuite (mitigée par wrapper).
- `/i/[token]` en fallback anon si `SERVICE_ROLE_KEY` absent — clé confirmée présente en prod+preview, à utiliser **serveur only**.

## 8. Ordre d'exécution proposé

P0 ✅ vérif mitigation · **P1** colmater writes destructifs anon (migration ciblée) · **P2** contexte d'autorisation (A ou C) · **P3** bascule lectures + verrouillage SELECT par parcours · **P4** retrait colonnes tokens/PII restantes · **P5** cookie signé/httpOnly · puis PR SEO #3, Analytics, WOW.

---

### Décision attendue
1. **Option A (JWT)** ou **Option C (frontière serveur)** ? (dépend notamment de la dispo du secret JWT du projet)
2. OK pour commencer par **P1 — colmater les writes destructifs anon** (migration ciblée, faible risque), que je prépare et fais valider avant application ?
