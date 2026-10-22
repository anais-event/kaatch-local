# C1 — Protection des tokens + signature des cookies (livrable)

Rien déployé, aucune migration appliquée. Socle code préparé (`lib/guest-session.ts`, `lib/supabase-service.ts`). À valider avant production.

## Décisions intégrées
- Signature des cookies **dans C1**.
- Secret **dédié `GUEST_COOKIE_SECRET`** (à configurer dans Vercel, voir §Config). Non généré dans le code, valeur non demandée ici.
- Bascule **service_role** (strictement serveur) des lookups de token.

## Architecture retenue : 2 cookies + gate au layout (changement borné)
26 fichiers lisent `guest_[slug]`/`vendor_[slug]`. Pour ne pas réécrire ces 26 lecteurs :
- Le cookie **`guest_[slug]` reste au format JSON** (lecteurs existants inchangés).
- On ajoute un cookie **signature `__sig_guest_[slug]`** (httpOnly) = HMAC du payload.
- Les **layouts** `invite/[slug]` et `vendor/[slug]` vérifient la paire (`getGuestSession`/`getVendorSession`) et **redirigent** si invalide ⇒ un cookie forgé sans signature valide ne rend aucune page enfant.
- La **lecture du token** (faire-part) vérifie aussi la session puis lit `invite_token` via service_role scopé à l'id de confiance.

> Les server actions (écritures) postéés hors layout seront durcies en C4 ; en C1 elles ne servent pas à lire les tokens, et les écritures sensibles (RSVP) passent déjà par la RPC `guest_rsvp` scopée par token.

## Fichiers concernés
**Nouveaux (déjà écrits)**
- `lib/guest-session.ts` — `buildSessionCookies()`, `getGuestSession()`, `getVendorSession()` (HMAC, timingSafeEqual).
- `lib/supabase-service.ts` — `createServiceClient()` (service_role, serveur only, throw si clé absente).

**Émetteurs de cookie → poser payload + signature (httpOnly) + lookup service_role**
- `app/i/[token]/route.ts` (lookup déjà service_role ; ajouter signature + httpOnly).
- `app/api/guest-auth/route.ts` (ajouter signature).
- `app/v/[token]/route.ts` (lookup `invite_token` → service_role ; ajouter signature).
- `app/api/vendor-code/route.ts` (lookup `vendor_code` → service_role ; ajouter signature).
- `app/api/guest-token-auth/route.ts` (lookup `invite_token` → service_role).

**Vérification (gate)**
- `app/invite/[slug]/layout.tsx` — `getGuestSession(slug)` ; invalide ⇒ redirection existante (`/p/[share_code]`).
- `app/vendor/[slug]/layout.tsx` — `getVendorSession(slug)` ; invalide ⇒ redirection `/`.

**Lecture du token déplacée côté serveur**
- `app/invite/[slug]/faire-part/page.tsx` — vérifier session puis lire `invite_token` via `createServiceClient()` `where id = session.id` (plus de lecture anon de `invite_token`).

## Logique de signature/vérification
- Cookie payload = JSON `{ id, firstName?, lastName? }` (guest) / `{ id, name?, category? }` (vendor).
- Signature = `HMAC_SHA256(GUEST_COOKIE_SECRET, payloadJSON)` en base64url, stockée dans `__sig_*`.
- Vérification : recalcul HMAC + `timingSafeEqual` ; échec ⇒ session nulle. httpOnly + Secure + SameSite=Lax.

## Migration SQL envisagée (préparée, NON appliquée) — APRÈS la bascule code
```sql
-- guests : retirer invite_token de l'accès anon
REVOKE SELECT ON public.guests FROM anon;
GRANT SELECT (
  id, wedding_id, first_name, last_name, nickname, family_name, created_at,
  relation, category, guest_type, gender, rsvp_status, rsvp_at, invited_at,
  invite_sent_at, plus_one, plus_one_count, dietary_restrictions, dietary_notes,
  table_id, guest_message, invited_parts
) ON public.guests TO anon;  -- invite_token retiré

-- wedding_vendors : retirer invite_token + vendor_code de l'accès anon
REVOKE SELECT ON public.wedding_vendors FROM anon;
GRANT SELECT (
  id, wedding_id, name, category, permissions, is_suspended, created_at
) ON public.wedding_vendors TO anon;  -- invite_token, vendor_code retirés
```
Rollback : re-GRANT en réincluant `invite_token` (+ `vendor_code`).

**Ordre strict** : (1) `GUEST_COOKIE_SECRET` configuré en prod+preview ; (2) déploiement du code ; (3) vérifier zéro lecture anon de ces colonnes ; (4) migration.

## Config Vercel requise (action manuelle de ta part)
- Ajouter `GUEST_COOKIE_SECRET` (valeur aléatoire ≥ 32 octets) en **Production + Preview**. Je ne génère pas la valeur et ne la vois pas. Le code lève une erreur explicite si absente (donc à configurer AVANT déploiement).

## Tests de sécurité (synthétiques, sans PII réelle)
1. anon `SELECT invite_token FROM guests` → DENIED ; `wedding_vendors.invite_token/vendor_code` → DENIED (après migration).
2. Cookie `guest_[slug]` forgé sans `__sig_` valide → layout redirige, aucune page rendue, aucun token lu.
3. Cookie forgé pour un autre invité/mariage → signature invalide → rejeté.
4. `/i/[token]`, `/v/[token]` token invalide → redirection, aucun cookie.
5. Cross-mariage : session A ne lit aucun token de B.

## Tests de non-régression
6. Lien invité valide → cookies signés posés → faire-part + QR OK (token via service_role).
7. `/p/[code]` + nom valide → accès.
8. `/v/[token]` valide → espace prestataire OK.
9. RSVP, programme, photos, livre d'or, playlist OK.
10. Owner / co-owner inchangés.

## Risques de régression
- Déployer sans `GUEST_COOKIE_SECRET` ⇒ erreurs. (Config d'abord.)
- Anciens cookies non signés ⇒ invalides ⇒ re-clic du lien (UX mineure, pas de perte de données, pas de compte).
- Retirer les colonnes avant la bascule code ⇒ /i, /v, guest-token-auth, faire-part cassés. (Ordre strict.)
- Server actions non gatées par le layout ⇒ durcissement en C4 (hors périmètre token de C1).

---

## Vérification des 3 inconnues (read-only)
- **T1 Storage — 🔴 à traiter (remonte en C2)** : le bucket `vendor-documents` a `Public read vendor-documents` (SELECT public) **et** `Public insert vendor-documents` (INSERT public). Combiné à `vendor_documents.file_url` lisible par anon ⇒ **n'importe qui peut télécharger (et uploader) des documents prestataires**. Ce n'est pas qu'un problème de suppression : les documents **ne sont pas réellement privés**. À corriger en C2 (bucket privé + URLs signées + policies scopées).
- **T2 Inserts anon — 🟡 théorique (C5)** : `guestbook_entries`, `messages`, `playlist_songs`, `photos`, `message_groups` ont des INSERT `WITH CHECK(true)`. Le `wedding_id` vient en général d'un lookup serveur par slug, mais un appel API direct pourrait insérer dans un autre mariage (spam/vandalisme, pas d'exfiltration). À scoper en C5.
- **T3 RPC `guest_rsvp` — 🟢 correctement protégée** : `SECURITY DEFINER`, `search_path=public`, met à jour **uniquement** la ligne `where invite_token = p_token`, valide le statut, borne `plus_one_count`, assainit `dietary`. Pas d'injection. Sa sûreté dépend du secret du token ⇒ **renforcée par C1**.

## Ordre proposé (ajusté)
C1 (tokens + cookies signés) → **C2 (vendor_documents : table + bucket Storage privé — priorité relevée par T1)** → C3 (photos UPDATE) → C4 (durcissement cookies sur actions/pages) → C5 (lectures globales, parcours par parcours).

**En attente de validation pour : (a) la config `GUEST_COOKIE_SECRET` dans Vercel, (b) l'application de C1 (code puis migration).**
