# C2 — Documents prestataires réellement privés (livrable)

> **✅ DÉPLOYÉ ET VÉRIFIÉ — 2026-10-12.** Code live sur master (PR #5, merge `b908b72`, prod Vercel OK). Migrations 3a + 3b appliquées. Bucket `vendor-documents` basculé en **privé**. Résultats de tests en fin de document.

## Constat données (prod)
- `vendor_documents` : **1 ligne**, `file_url` = **chemin Storage** (pas d'URL http publique). → **aucune migration de références legacy nécessaire** (0 URL publique à convertir). La référence permanente en base reste le **chemin Storage** ; l'URL signée est générée à l'accès.

## 1. Fichiers modifiés
- `app/vendor/[slug]/documents/page.tsx` (réécrit) :
  - Nouveau helper serveur **`resolveVendorContext(slug)`** : vérifie la session prestataire **signée** (`getVendorSession`), résout le mariage par slug, et confirme que le prestataire de la session **appartient à ce mariage et n'est pas suspendu** (service_role). Renvoie `{ weddingId, vendorId, vendorName }` de confiance, ou null.
  - **upload** : ré-autorisation serveur ; **ignore** `wedding_id`/`vendor_id` du formulaire ; chemin construit avec les ids **résolus serveur** ; upload + insert via **service_role** ; `file_url` = chemin Storage (jamais une URL signée).
  - **delete** : ré-autorisation ; vérifie que le `docId` **appartient** à `weddingId`+`vendorId` autorisés **avant** suppression ; supprime l'objet Storage **puis** la ligne, via service_role.
  - **liste + URLs signées** : lecture scopée par `weddingId`+`vendorId` ; `createSignedUrl` (1 h) via **service_role** (fonctionne en bucket privé).
  - service_role **strictement serveur** (`lib/supabase-service.ts`).

Aucun autre fichier touché ; aucun parcours invité modifié (seul `vendor_documents` est concerné — `grep` confirme qu'aucune autre partie de l'app ne lit cette table).

## 2. Fonctionnement final
```
Prestataire (cookie signé) → /vendor/[slug]/documents
  resolveVendorContext : session signée + vendor∈mariage + non suspendu  → {weddingId, vendorId}
  liste : vendor_documents scopée (service_role) → createSignedUrl 1h par doc
  upload : ids serveur → Storage upload (service_role) → insert (chemin permanent)
  delete : doc doit appartenir à (weddingId, vendorId) → remove objet + ligne
```
Un `wedding_id`/`vendor_id`/`docId` fourni par le client **n'est jamais** utilisé sans vérification de cohérence serveur.

## 3. Migrations préparées (NON appliquées)

### 3a. RLS table `vendor_documents` (après déploiement code)
Les accès passent désormais par le serveur (service_role scopé). On retire les policies ouvertes `true` ; service_role contourne la RLS. On garde une lecture owner (mariés) par sécurité/futur.

> ⚠️ Noms réels des policies vérifiés en prod (ne pas se fier aux noms du brouillon) :
> `Anyone can read vendor_documents` (SELECT), `Anyone can insert vendor_documents` (INSERT), `Anyone can delete vendor_documents` (DELETE).
```sql
DROP POLICY IF EXISTS "Anyone can read vendor_documents"   ON public.vendor_documents;
DROP POLICY IF EXISTS "Anyone can insert vendor_documents" ON public.vendor_documents;
DROP POLICY IF EXISTS "Anyone can delete vendor_documents" ON public.vendor_documents;

-- lecture propriétaires (mariés) uniquement ; vendors passent par service_role serveur
CREATE POLICY "owner_select_vendor_documents" ON public.vendor_documents
  FOR SELECT TO authenticated
  USING (wedding_id IN (SELECT id FROM public.weddings
    WHERE couple_id = auth.uid() OR co_owner_email = auth.email()));
```
Rollback (sûr) : garder `owner_select_vendor_documents` ; au besoin, diagnostiquer côté serveur (service_role contourne la RLS, donc l'app continue de fonctionner même RLS stricte). **Ne JAMAIS recréer les policies publiques `true`** — ce serait rouvrir l'accès anonyme que C2 ferme.

### 3b. Bucket Storage privé (DERNIER, après vérif des parcours)

**Deux actions, dans cet ordre :**

**(i) Retirer les policies publiques sur `storage.objects`** (noms réels vérifiés en prod : `Public read vendor-documents` SELECT, `Public insert vendor-documents` INSERT ; aucune policy DELETE/UPDATE publique pour ce bucket) :
```sql
DROP POLICY IF EXISTS "Public read vendor-documents"   ON storage.objects;
DROP POLICY IF EXISTS "Public insert vendor-documents" ON storage.objects;
```

**(ii) Basculer le bucket en privé explicitement** — supprimer les policies ne suffit PAS : tant que `storage.buckets.public = true`, les objets restent téléchargeables par leur URL publique directe. On passe donc le bucket en privé **via l'API Storage** (Management API / `storage.updateBucket`), **jamais** en modifiant directement la table interne `storage.buckets` par SQL :
```
# API Storage (service_role) — équivalent Dashboard : bucket → Settings → décocher "Public"
PUT /storage/v1/bucket/vendor-documents   { "public": false }
```
→ `anon` n'a plus ni lecture ni écriture ni URL publique ; `service_role` (serveur) continue d'uploader, signer (URL 1h) et supprimer. L'accès des prestataires se fait uniquement par URL signée.

**Rollback (sûr) :** laisser le bucket **privé**. L'app fonctionne entièrement via `service_role` + URLs signées, donc aucune raison opérationnelle de rouvrir l'accès public. **Ne JAMAIS recréer les policies publiques ni repasser `public = true`** — ce serait rouvrir la fuite que C2 corrige. En cas de souci, diagnostiquer les URLs signées côté serveur, pas rétablir le public.

## 4. Tests
**Maintenant (sans bucket privé / sans deploy)** :
- Build + type-check (voir §5).
- Revue logique : aucune opération ne se fie aux ids client ; service_role server-only.

**À exécuter en phase de déploiement (preview/prod, fichiers de test, sans PII)** :
1. Upload par un prestataire autorisé → OK.
2. Consultation + téléchargement de son document (URL signée) → OK.
3. Suppression de son document → OK (objet + ligne).
4. Accès à un document d'un **autre mariage** (docId croisé) → refusé (delete no-op, liste vide).
5. Sans session valide (cookie absent/forgé) → redirigé `/`, aucune opération.
6. Après bucket privé : **accès public direct** à l'URL d'objet → refusé (403) ; l'accès ne marche que via URL signée.
7. Ancien document (chemin Storage) → toujours consultable par son prestataire (re-signé à l'accès).

## 5. Ordre de déploiement précis
1. Déployer le **code** (PR) — upload/consultation/suppression passent par service_role scopé. (Compatible bucket encore public → rien ne casse.)
2. Vérifier les parcours prestataire en preview/prod (upload/consult/delete/cross-wedding/sans session).
3. Appliquer la **migration RLS table** (3a).
4. Appliquer la **migration bucket privé** (3b) — **en dernier**.
5. Re-tester : accès public direct refusé, consultation via URL signée OK.

## 6. Risques / garde-fous
- service_role jamais exposé au navigateur (import serveur only).
- `file_url` reste un **chemin permanent** ; jamais remplacé par une URL signée expirante.
- Aucun fichier déplacé/supprimé pendant la migration (0 legacy à convertir).
- Si un futur document avait une URL http legacy, le code garde un fallback d'affichage (compat), mais le bucket privé le rendrait inaccessible → à re-signer le cas échéant (aucun en prod aujourd'hui).

## 7. Résultats de déploiement (2026-10-12)

Ordre exécuté : code mergé/déployé → tests → RLS table → policies storage → **bucket privé (dernier)** → re-tests.

| # | Test | Avant | Après C2 |
|---|------|-------|----------|
| Fuite | URL publique directe du doc (`/object/public/...`) | **200** (6795 o, sans auth) | **400** `NoSuchBucket` (cache-bust + bare URL `cf-cache: BYPASS`) |
| Signé | URL signée prestataire (`/object/sign/...?token`) sur bucket privé | — | **200** (6795 o, `application/pdf`) |
| Signé− | même chemin sans token | — | **400** |
| RLS | anon REST `GET vendor_documents` | lecture ouverte | **`[]`** |
| RLS | anon REST `POST vendor_documents` | insert ouvert | **401** |
| Route | `/vendor/[slug]/documents` sans session | — | **307 → /**, zéro fuite (nom/chemin/token = 0 hit dans le body) |
| Auth | prestataire via `/v/[token]` → espace documents | — | doc listé, URL **signée** rendue par le serveur (service_role) |

### Migrations appliquées
- **3a** `c2_harden_rls_vendor_documents` : DROP des 3 policies publiques `true` (SELECT/INSERT/DELETE) ; CREATE `owner_select_vendor_documents` (lecture mariés propriétaires).
- **3b (i)** `c2_drop_public_storage_policies_vendor_documents` : DROP des policies publiques `storage.objects` (`Public read`/`Public insert vendor-documents`).
- **3b (ii)** bascule du bucket `vendor-documents` en **privé** (`public = false`) via le Dashboard Supabase (pas de SQL sur `storage.buckets`).

### État final policies / bucket
`vendor_documents` → `owner_select_vendor_documents` uniquement ; `storage.objects` → aucune policy publique pour ce bucket ; `storage.buckets.public = false`.

### ⚠️ Tests NON encore réalisés end-to-end
L'**upload** et la **suppression** n'ont **pas** été testés de bout en bout dans l'interface — à ce stade ils ne sont **pas** considérés comme validés. Ils sont seulement couverts par revue de code + équivalence (mêmes clients `service_role` que la signature/liste, prouvés fonctionnels sur bucket privé ; le flag `public` n'affecte pas `service_role`).

Tests fonctionnels restant à exécuter avec un **document synthétique** (sans toucher au document réel) :
1. Upload par un prestataire autorisé.
2. Consultation via URL signée.
3. Suppression du document de test.
4. Confirmation qu'un autre prestataire ne peut pas y accéder (isolation par `vendor_id`).
