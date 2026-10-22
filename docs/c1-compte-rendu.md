# C1 — Compte rendu final (prêt à appliquer, rien déployé)

Aucun déploiement, aucune migration de production. Build vert. En attente de ta validation pour : (1) config `GUEST_COOKIE_SECRET` dans Vercel, (2) déploiement code, (3) migration de retrait des colonnes tokens.

## 1. Modifications effectuées

**Nouveaux fichiers**
- `lib/guest-session.ts` — cookies de session signés HMAC-SHA256. Signature liée au **type** (guest/vendor), au **slug du mariage** et au **payload** ; payload porte `exp` (expiration **vérifiée côté serveur**) ; comparaison `timingSafeEqual`. Secret : `GUEST_COOKIE_SECRET` (serveur only). Exporte `buildSessionCookies`, `getGuestSession`, `getVendorSession`.
- `lib/supabase-service.ts` — `createServiceClient()` service_role **strictement serveur** (throw si clé absente).

**Émetteurs de cookie (signé + httpOnly) + lookup token en service_role**
- `app/i/[token]/route.ts`, `app/api/guest-token-auth/route.ts`, `app/api/guest-auth/route.ts`, `app/api/guest-search/route.ts` (invité) ; `app/v/[token]/route.ts`, `app/api/vendor-code/route.ts` (prestataire).
- Les lookups par `invite_token` / `vendor_code` passent en service_role (le token/code reste l'autorisation, validé avant toute lecture).

**Vérification de session (pas seulement les layouts)**
- Layouts : `app/invite/[slug]/layout.tsx`, `app/vendor/[slug]/layout.tsx`.
- **Toutes** les pages et sous-layouts invité/vendor (32 fichiers) : remplacement de `JSON.parse(cookie)` par `getGuestSession`/`getVendorSession` (vérif signature+type+mariage+exp). Plus **aucun** accès basé sur le seul JSON du cookie (vérifié : 0 résidu).
- `app/p/[code]/page.tsx` : ne redirige que si une **session signée valide** existe (évite une boucle avec un cookie invalide).
- Déconnexions (`invite/page`, `invite/compte`) : suppriment aussi le cookie de signature `__sig_`.

**Lecture de token déplacée côté serveur**
- `app/invite/[slug]/faire-part/page.tsx` : `invite_token` lu via service_role, scopé `id = session.id AND wedding_id = wedding.id`.

**Prestataire** : `permissions` déplacées dans le **payload signé** (donc infalsifiables) ; le layout continue de re-vérifier `is_suspended` en base.

Patch complet : `docs/c1-diffs.patch` (1085 lignes).

## 2. Résultat du build et des tests
- **Build** : `✓ Compiled successfully` + type-check OK + table des routes générée (exit 0). Secret de build placeholder (le vrai doit être posé en prod).
- **Tests unitaires du scheme de cookie** (miroir exact du lib) — **8/8 PASS** :
  - cookie valide accepté ; payload falsifié rejeté ; signature forgée rejetée ;
  - cookie invité **rejoué en prestataire** rejeté ; cookie **rejoué sur un autre mariage** rejeté ;
  - cookie **expiré** rejeté ; permissions vendor signées OK ; **permissions falsifiées** rejetées.
- Couverture : `grep` confirme **0** `JSON.parse(cookie)` résiduel sur guest/vendor.

## 3. Migrations préparées (NON appliquées)
À lancer **après** déploiement du code :
```sql
REVOKE SELECT ON public.guests FROM anon;
GRANT SELECT (id, wedding_id, first_name, last_name, nickname, family_name, created_at,
  relation, category, guest_type, gender, rsvp_status, rsvp_at, invited_at, invite_sent_at,
  plus_one, plus_one_count, dietary_restrictions, dietary_notes, table_id, guest_message,
  invited_parts) ON public.guests TO anon;           -- invite_token retiré
REVOKE SELECT ON public.wedding_vendors FROM anon;
GRANT SELECT (id, wedding_id, name, category, permissions, is_suspended, created_at)
  ON public.wedding_vendors TO anon;                  -- invite_token, vendor_code retirés
```
Rollback : re-GRANT en réincluant `invite_token` (+ `vendor_code`).

## 4. Actions restantes (ordre d'application C1)
1. **Toi** : ajouter `GUEST_COOKIE_SECRET` (aléatoire ≥32 octets) dans Vercel **Production + Preview**.
2. Déployer le code (merge → Vercel). **Obligatoire avant la migration.**
3. Vérifier en preview : liens invité `/i/[token]`, code `/p/[code]`, lien prestataire `/v/[token]`, faire-part + QR, RSVP, photos, programme, livre d'or, playlist.
4. Appliquer la migration de retrait des colonnes.
5. Re-vérifier qu'aucune lecture anon de `invite_token`/`vendor_code` ne subsiste.

## 5. Risques résiduels
- **Anciens cookies non signés** → invalides après déploiement → l'invité/prestataire re-clique son lien (ou code). Pas de perte de données, pas de compte.
- Déploiement sans `GUEST_COOKIE_SECRET` → erreurs serveur (le code l'exige). → poser le secret **avant**.
- Hors périmètre C1 (traités ensuite) : **C2** documents prestataires (bucket `vendor-documents` public — téléchargement/suppression par anon), **C3** `photos` UPDATE anon, **C5** lectures globales `USING(true)` (noms/mariages encore énumérables tant que C5 n'est pas fait), inserts anon non scopés.
- *(mineur)* anon conserve des grants table INSERT/UPDATE/DELETE (inoffensifs sans policy ; à REVOKE en défense-en-profondeur).

## 6. Prochaine étape après application de C1
**C2** : rendre `vendor-documents` réellement privé (bucket privé, URLs signées via service_role après vérif de session, writes scopés au vendor/mariage autorisé, migration des `file_url` legacy).
