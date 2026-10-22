# Sécurité accès invité — Confinement appliqué, mapping, plan de correction

Statut : **mitigation de confinement APPLIQUÉE en prod** (grants DB, effet immédiat). Mapping terminé. Plan row-scoping **à valider avant implémentation**.

---

## 1. Confinement appliqué (migrations prod, réversibles)

Deux migrations de **privilèges colonne** sur le rôle `anon` (les mariés = `authenticated` et `service_role` ne sont pas touchés) :

### `confine_anon_pii_guests_columns_v2`
`anon` ne peut plus lire sur `public.guests` : **`email`, `telephone`, `rsvp_token`, `notes`, `metadata`**.
Colonnes conservées pour `anon` (lues par les parcours invité) : id, wedding_id, first_name, last_name, nickname, family_name, created_at, relation, category, guest_type, gender, rsvp_status, rsvp_at, invited_at, invite_sent_at, plus_one, plus_one_count, dietary_restrictions, dietary_notes, table_id, **invite_token**, guest_message, invited_parts.

### `confine_anon_secrets_weddings_columns`
`anon` ne peut plus lire sur `public.weddings` : **`guest_password`, `guest_code`, `co_owner_email`**.
(`guest_password` et `guest_code` sont par ailleurs **morts** — référencés nulle part dans le code.)

### `confine_anon_promo_and_vendor_pii`
- `public.promo_codes` : **SELECT anon retiré entièrement** (codes promo = secret business ; lus seulement par admin + mariés authentifiés).
- `public.promo_code_uses` : **SELECT anon retiré entièrement**.
- `public.wedding_vendors` : `anon` ne peut plus lire **`email`, `phone`** (PII prestataires). Conservé pour anon : id, wedding_id, name, category, permissions, is_suspended, created_at, **invite_token**, **vendor_code** (espace vendor + routes `/v/[token]` et `/api/vendor-code` qui filtrent dessus).

**Rollback** si régression :
```sql
GRANT SELECT ON public.guests          TO anon;
GRANT SELECT ON public.weddings        TO anon;
GRANT SELECT ON public.promo_codes     TO anon;
GRANT SELECT ON public.promo_code_uses TO anon;
GRANT SELECT ON public.wedding_vendors TO anon;
```

**Vérifié** : `has_column_privilege('anon', …)` = false sur les colonnes retirées, true sur les colonnes conservées ; `authenticated` conserve tout. Aucun flow invité ne lit ni ne filtre les colonnes retirées (grep exhaustif `app/{invite,invité,rsvp,vendor,p,api}`).

### Ce que le confinement NE règle pas encore (→ row-scoping)
- `anon` peut toujours lire `id, first_name, last_name, invite_token…` de **tous** les invités de **tous** les mariages (policy `USING(true)`). → énumération des noms + **vol d'`invite_token`** ⇒ usurpation possible via `/i/[token]`.
- `anon` peut toujours lire `name, date, location, couple_message, share_code, notification_email` de **tous** les mariages.
- Cookies de session invité **non signés** (forgeable), et incohérents (`/i/[token]` non-httpOnly, guest-auth httpOnly).

---

## 2. Mapping du mécanisme d'autorisation invité

### Portes d'entrée
| Porte | Route | Identifiant | Action |
|---|---|---|---|
| Lien personnel | `app/i/[token]/route.ts` (Route Handler) | `guests.invite_token` (uuid) | lookup guest → pose cookie `guest_[slug]` → redirect `/invite/[slug]/faire-part` |
| Code de partage | `app/p/[code]/page.tsx` + `GuestAuthForm` → `app/api/guest-auth/route.ts` | `weddings.share_code` puis **match nom/prénom** | vérifie identité par nom → pose cookie → `/invite/[slug]` |
| Lien vendor | `app/v/[token]/route.ts` | token prestataire | accès espace `/vendor/[slug]` |
| Token auth (API) | `app/api/guest-token-auth/route.ts` | `guests.invite_token` | renvoie slug/identité |

### Génération / transmission du token
- `invite_token` (uuid) généré/assigné côté mariés dans `app/api/send-invitation/route.ts` (`update({ invite_token })`) et exposé dans l'espace invitations.
- Transmis dans l'URL `/i/[token]` (lien, QR, WhatsApp).
- Validé par `.eq('invite_token', token)` dans `/i/[token]` et `guest-token-auth`.

### Session invité
- « Session » = cookie **`guest_[slug]`** = `{ firstName, lastName, id }`. Pas de compte, pas de mot de passe.
- `/i/[token]` : service-role si `SUPABASE_SERVICE_ROLE_KEY` présent, **sinon fallback anon**. Cookie **non httpOnly**.
- `guest-auth` : cookie **httpOnly**, 7 jours.
- **Aucune signature** → cookie forgeable ; la confiance repose aujourd'hui sur la RLS ouverte + l'uuid de l'invité.

### Autorisation des données
- Toutes les lectures/écritures de l'espace invité passent par `createSupabaseServerClient()` = **rôle `anon`** (pas de session Supabase pour les invités).
- L'autorisation réelle = policies RLS `USING(true)` sur `guests, weddings, photos, program_steps, messages, playlist_songs, guestbook_entries`.
- Tables scopées correctement (owner) : écritures `guests/weddings/…` côté mariés via `couple_id = auth.uid()`.
- Tables RLS activée **sans policy** (= deny) : `events, guest_event_assignments, photo_tags, planning_items, practical_info, rsvp_responses`.

### Dépendances fonctionnalité ↔ policy ouverte
| Fonctionnalité invité | Tables lues (anon) | Dépend de `USING(true)` |
|---|---|---|
| Faire-part / espace accueil | weddings, guests | oui |
| RSVP | guests (+ RPC `guest_rsvp` SECURITY DEFINER) | partiel |
| Photos + tags | photos, guests | oui |
| Programme | program_steps, weddings | oui |
| Livre d'or | guestbook_entries, weddings | oui |
| Musique / playlist | playlist_songs, weddings | oui |
| Messagerie groupes | messages, guests | oui |

---

## 3. Plan de correction row-scoping (à valider — PAS encore implémenté)

Objectif : `invité avec lien valide → accès sans compte, uniquement SON mariage, uniquement les données nécessaires` ; `anon sans lien → aucun accès global` ; `couple propriétaire → inchangé`. Contraintes : réutiliser le mécanisme d'invitation, modifications minimales, pas de `service_role` côté client, pas de grosse refonte.

### Option A — JWT invité signé + RLS par claim (recommandée)
1. À l'entrée (`/i/[token]`, `guest-auth`), après validation serveur du token/nom, émettre un **JWT signé** (secret Supabase) portant `role=anon` + claims `wedding_id`, `guest_id`. Le stocker en cookie **httpOnly signé** et l'utiliser comme `access_token` du client Supabase invité.
2. Réécrire les policies RLS `USING(true)` en `USING (wedding_id = (auth.jwt() ->> 'wedding_id')::uuid)` (et équivalent via jointure pour photos/messages/…).
3. Résultat : un invité ne voit que son mariage ; `anon` nu ne voit rien ; cookie non forgeable ; **pas de service_role côté client**.
- Avantage : correction propre et complète, réutilise le transport auth Supabase.
- Coût : helper d'émission JWT + remplacement du client invité + réécriture policies. Moyen, concentré (pas 30 fichiers si on centralise le client).

### Option B — RPC `SECURITY DEFINER` scopées par token
1. Créer des fonctions `get_wedding_by_token(token)`, `list_guests_for_wedding(token)`, etc., qui valident le token et ne renvoient que les données du bon mariage.
2. Verrouiller les tables de base en owner-only (supprimer les `USING(true)`).
3. Les pages invité appellent les RPC au lieu des `select` directs.
- Avantage : contrôle fin, pas de JWT.
- Coût : beaucoup de fichiers à migrer (chaque select invité → RPC). Plus lourd.

### Recommandation
**Option A** : meilleur rapport sûreté/effort, corrige aussi la forgeabilité du cookie, et garde le parcours sans compte. À tester d'abord sur les parcours invité clés (faire-part, RSVP, photos, programme) avant de retirer les `USING(true)`.

### Étapes proposées (séquencées, avec validation)
1. Centraliser un `createGuestSupabaseClient()` (lit le cookie JWT).
2. Émettre le JWT à l'entrée (`/i/[token]` + `guest-auth`), cookie httpOnly.
3. Migrer parcours par parcours vers ce client, en gardant `USING(true)` actif (compat).
4. Une fois tous les parcours migrés + testés, basculer les policies en claim-scoped et retirer les `USING(true)`.
5. Resserrer aussi `invite_token`/`share_code`/`notification_email` au niveau colonne une fois les lectures scopées.
6. Build + tests connecté/déconnecté/mobile à chaque étape.

**Rien de l'Option A/B n'est fait. En attente de ton feu vert sur l'option et le séquencement.**
