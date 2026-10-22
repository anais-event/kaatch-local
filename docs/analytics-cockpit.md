# Cockpit Analytics interne — Kaatch

> **MàJ 1B (2026-10-13)** : cockpit restructuré en 4 sections orientées pilotage + séparation
> de l'espace admin. Voir §9 et §10 en bas.


> Mission 1. Interface privée de pilotage acquisition & conversion, intégrée à l'app.
> Branche de travail : `claude/c2-doc-resultats` (à renommer en PR dédiée analytics).

## 1. Principe

On **ne duplique pas** GA4/Vercel. GA4 (`G-JZGV5T58NL`) et Vercel Analytics restent la source
pour `page_view`, source/medium, referrer, pages — ils tournent déjà dans [`app/layout.tsx`](../app/layout.tsx).

Ce qui manquait : un **funnel custom** (plan de table → inscription → activation) reliable, et la
possibilité de croiser **source → utilisateur activé**, que GA4 gratuit ne fait pas bien sur des events
maison. On ajoute donc un **store first-party minimal** dans Supabase (`analytics_events`), alimenté par
`trackEvent()`, lu par un cockpit admin. Pas de GA4 Data API (= compte de service Google à gérer →
disproportionné pour le trafic actuel).

```
Client (trackEvent)
   ├──> GA4 (gtag)                       → rapports d'acquisition natifs
   └──> POST /api/track (service_role)   → table analytics_events → cockpit /admin/analytics
```

## 2. Composants livrés

| Fichier | Rôle |
|---|---|
| `lib/attribution.ts` | visitor_id anonyme (UUID), session_id, canal first/last-touch normalisé. **Sans fingerprint, sans PII.** |
| `lib/analytics.ts` | `trackEvent(name, props)` : whitelist events + params, anti-PII, double envoi GA4 + `/api/track`. |
| `app/api/track/route.ts` | Ingestion serveur : whitelist events, anti-PII, caps taille, insert via **service_role**. No-op si clé absente. |
| `app/_components/AnalyticsInit.tsx` | Capture l'attribution + `session_start` (1x/session), monté globalement. |
| `app/admin/analytics/page.tsx` | Cockpit admin-gaté : vue d'ensemble, acquisition, funnel, pages, qualité des données. |
| `app/mariage/[slug]/WeddingDashboardTracker.tsx` | `wedding_created` (sur `?created=1`) + `dashboard_first_view`. |
| migration `analytics_events` | Table + index. RLS **ON, 0 policy** → inaccessible anon/authenticated. |

## 3. Dictionnaire d'événements (ceux réellement instrumentés)

| Event | Déclencheur réel | Params (jamais de PII) |
|---|---|---|
| `session_start` | 1re vue de la session | — |
| `seating_plan_viewed` | Montage de l'outil `/plan-de-table-mariage` | `tool_version` |
| `seating_plan_started` | 1re interaction (1er invité OU 1re table) | `tool_version` |
| `guest_added` | Ajout d'invité(s) dans l'outil | `guest_count`, `bulk`, `tool_version` |
| `table_created` | Création d'une table | `table_count`, `tool_version` |
| `guest_seated` | Invité placé à une table | `tool_version` |
| `seating_plan_completed` | Tous les invités placés (≥ 2 invités) | `guest_count`, `table_count` |
| `seating_plan_pdf_downloaded` | Export PDF | `guest_count`, `table_count`, `seated_count` |
| `seating_plan_cta_clicked` | Clic CTA « Essayer / Organiser » | `cta_location`, `guest_count` |
| `signup_started` | Soumission du formulaire d'inscription | — |
| `signup_completed` | Session créée immédiatement (email-confirm off) | — |
| `wedding_created` | Espace mariage créé (redirect `?created=1`) | — |
| `dashboard_first_view` | 1re vue d'un dashboard mariage (1x/visiteur) | — |
| `feature_used` | 1re action significative dans l'espace (ajout d'invité côté mariés) = **activation** | `feature` |

**Définition d'activation retenue :** `wedding_created` **+** au moins un `feature_used`.
Aujourd'hui `feature_used` est émis sur l'ajout d'invité côté mariés (signal fort, composant client déjà
présent). À étendre à d'autres actions clés (upload photo, génération faire-part) quand utile.

## 4. Métriques réellement disponibles dans le cockpit

- Visiteurs uniques, sessions, visiteurs **IA** (ChatGPT/Perplexity/Claude/Gemini…).
- Inscriptions, espaces créés (+ **cross-check** vs nombre réel de `weddings` en BDD), activés.
- Téléchargements de plan, visiteurs de l'outil.
- Taux visiteur→inscrit, inscrit→activé.
- **Acquisition par canal** (first-touch normalisé, à partir de nos données first-party).
- **Funnel** visiteurs uniques, avec % de perte par étape.
- Pages les plus vues, pages d'entrée, landing → inscription.
- **Qualité** : dernière collecte, nb d'events, % canal inconnu, events attendus mais absents, détail par event.
- Filtres **7 / 28 / 90 jours**.

## 5. Métriques non mesurables (honnêteté)

- **`guest_import_started/completed`** : l'outil gratuit n'a pas d'import CSV (seulement collage en liste →
  couvert par `guest_added` + `bulk:true`). L'import CSV existe côté app connectée uniquement. Non instrumenté
  pour ne pas créer d'event fictif.
- **`wedding_setup_started/completed`** : pas d'étape « setup » distincte dans le produit → non créée.
- **Rétention J+1/J+7/J+30** : calculable dès que l'historique le permet (retours d'un même `visitor_id`
  sur plusieurs jours). Non affichée tant que la fenêtre de données est trop courte — ne pas montrer de
  rétention fabriquée. À ajouter au cockpit quand ≥ 30 j de collecte réelle existent.
- **Détail fin des sources organiques Google** (requêtes, impressions) : relève de Search Console / GA4,
  pas du store first-party.
- **`signup_completed` en flow email-confirmation** : la vraie complétion se fait au callback serveur
  (`/auth/callback`, Route Handler sans client gtag). On capte alors `dashboard_first_view` comme proxy de
  compte actif. Si l'email-confirm est désactivé côté Supabase, `signup_completed` est émis directement.

## 6. Confidentialité (RGPD + règles projet)

- **Jamais** transmis : nom des mariés/invités, email, téléphone, token, URL privée, contenu de mariage.
  Garde-fous : whitelist de params **côté client ET serveur** + regex anti-PII (email/téléphone) qui jette
  toute valeur suspecte.
- `visitor_id` = UUID aléatoire (localStorage), sert **uniquement** à dédupliquer. **Pas de fingerprint.**
- `landing_page`/`page_path` = **path only** (la query, qui peut porter des IDs/tokens, est retirée).
- Cohérent avec le bandeau cookies « techniques uniquement » : mesure d'audience first-party, anonyme.
- Accès cockpit réservé à `anais@kaatch.fr` (même garde que `/admin`), **pas** une simple URL obscure.
- Table `analytics_events` : RLS activée, **aucune policy** → ni `anon` ni `authenticated` ne lisent/écrivent.
  Seul le `service_role` (serveur) y accède. Vérifié : anon `can_read=false`, `can_write=false`.

## 7. Dépendance d'environnement

`SUPABASE_SERVICE_ROLE_KEY` doit être défini côté serveur (déjà le cas en prod Vercel depuis C2 —
documents prestataires privés). **En local, s'il est absent, `/api/track` fait no-op** (aucune écriture
anon, jamais de crash) et le cockpit affiche un bandeau d'avertissement explicite.

## 8. Reste à faire manuellement (hors code)

- GA4 : marquer `signup_completed`, `wedding_created`, `feature_used`, `seating_plan_pdf_downloaded` comme
  **conversions** ; créer une exploration funnel + une exploration par canal.
- Après ~30 j de collecte : activer le panneau **rétention J+1/J+7/J+30** dans le cockpit.

---

## 9. MàJ 1B — Cockpit restructuré (pilotage produit)

Objectif : comprendre en < 30 s si Kaatch attire, d'où, si l'outil sert, si ça convertit, et quelle étape travailler.

- **Bandeau « En bref »** : 5 réponses directes (visiteurs, source principale, usage outil, conversions, étape prioritaire = plus grosse perte relative).
- **4 sections** : A. Acquisition · B. Plan de table · C. Conversion produit · D. Pages & sources.
- **Diagnostic technique replié** (`<details>` « Diagnostic du suivi ») — plus en page principale.
- Logique d'agrégation extraite dans [`lib/analytics-cockpit.ts`](../lib/analytics-cockpit.ts) (testable, page = présentation).

### Ambiguïtés corrigées
- **Pages admin / espaces privés exclus de l'acquisition** : `isPublicPath()` écarte `/admin`, `/dashboard`,
  `/mariage`, `/invite`, `/vendor`, `/rsvp`, `/api`… Un admin qui ouvre le cockpit ne compte plus comme visiteur.
  (Les events de conversion restent comptés où qu'ils surviennent.)
- **Espaces : période vs total** : « Espaces créés (période) » vient de la table `weddings` filtrée sur la période ;
  « X au total (historique) » affiché séparément. Les espaces créés **avant** le suivi ne sont jamais présentés
  comme des créations récentes ni attribués à une source.
- **Visiteurs vs sessions** : distincts et étiquetés.
- **Comparaison période précédente** : affichée seulement si chaque période a ≥ 5 visiteurs (`MIN_COMPARE`),
  sinon « · » (donnée insuffisante). Jamais de variation trompeuse sur petits volumes.
- **Distinction zéro / n/d / insuffisant** : taux sans dénominateur = `n/d` ; sparkline vide = message explicite ;
  sections sans events = état vide utile.
- **Attribution conversions** : `signup_completed` / `wedding_created` portent le canal first-touch → section
  « Conversions par source ». Tant qu'il n'y a pas d'events de conversion, état vide honnête (pas de reconstruction).

### Clic ≠ action réussie
`seating_plan_cta_clicked` (clic) est distinct de `signup_completed` (inscription réelle). Le funnel ne confond pas les deux.

## 10. MàJ 1B — Espace admin séparé des mariages

**Cause du problème** : l'accès admin était un **email en dur** (`anais@kaatch.fr`) comparé à la session Supabase
des mariés. L'admin « roulait » donc sur un compte marié, et le raccourci vivait dans le dashboard mariés.

**Architecture retenue (changement minimal, pas de refonte d'auth)** :
- Table **`admins`** (`user_id` → `auth.users`). RLS **ON, 0 policy** → lisible via **service_role** uniquement.
  Rôle explicite, maintenable, **indépendant de tout mariage**. Aucun email admin en dur. Seed : compte Anaïs.
- [`lib/admin.ts`](../lib/admin.ts) : `isAdmin(userId)` (lecture service_role), `getAdminUser()`, `requireAdmin()`
  (redirige `/admin/login`, ou `/admin/login?denied=1` si connecté sans droits).
- **`/admin/login`** : connexion admin dédiée (Supabase `signInWithPassword`), indépendante des mariages.
- Toutes les pages & server actions `/admin/**` gatées par `isAdmin`/`requireAdmin` (plus aucun email en dur).
  Le lien admin du dashboard mariés utilise aussi `isAdmin` côté serveur.

**Trois espaces distincts** : 💍 mariés (`/dashboard`, `/mariage`) · 💌 invités/prestataires (`/invite`, `/vendor`) ·
📊 admin (`/admin`, `/admin/login`, `/admin/analytics`).

**Connexion admin** : `/admin/login` avec le compte Supabase existant (`anais@kaatch.fr`). L'autorisation vient
de la table `admins`, pas de l'email ni de l'URL.

**Sécurité** : autorisation vérifiée **côté serveur** (jamais sur l'URL/l'interface) ; `service_role` jamais exposé
au navigateur ; RLS existantes inchangées ; être marié/invité/prestataire ne donne aucun accès admin.

### Tests effectués (1B)
- Admin (`admins` table) : anais présente (`anais_is_admin=true`), aucun autre (`admin_count=1`).
- Non authentifié : `/admin` et `/admin/analytics` → redirigent vers `/admin/login` ✅ ; `/admin/login` rend le formulaire ✅.
- Mariée non-admin / invité / prestataire : `requireAdmin` → `isAdmin(false)` → `/admin/login?denied=1` (même chemin serveur, aucune dérogation URL).
- `next build` + `tsc` ✅. Cockpit v2 : agrégats validés en SQL (exclusion admin, période vs total).
- Local sans `SUPABASE_SERVICE_ROLE_KEY` : `isAdmin` renvoie `false` (jamais de fallback anon) → admin verrouillé en local, fonctionnel en prod.

---

## 11. V2 comportement — collecte first-party des pages & engagement (P1→P4)

Objectif : comprendre **le comportement** des visiteurs (pas seulement « des events existent »). Pas d'API GA4, pas de refonte.

### Collecte ajoutée (P2) — mesure d'audience anonyme
- `page_view` : 1 par **page publique** consultée, **path-only**, avec `from_path` (page interne précédente) pour les parcours. Émis par [`PageViewTracker`](../app/_components/PageViewTracker.tsx) sur changement de route.
- `page_engagement` : durée passée sur la page quittée (`duration_ms`), via Page Visibility API + `pagehide` + `sendBeacon`. **Approximative** (temps onglet actif) — documentée comme telle, cappée à 1 h.
- **Pages privées jamais tracées** (mariés/invités/prestataires/admin) : double garde client (`isPublicPath`) + serveur (rejet `from_path` privé) → aucun slug de mariage (donc aucun nom) stocké.
- Réutilise `analytics_events` (pas de nouvelle table). Aucun fingerprint, aucun contenu, aucune PII.

### Outils instrumentés (P3)
Fréquentation de **tous** les outils = dérivée gratuitement des `page_view` (par chemin). Profondeur d'usage :
- `plan-de-table` : `seating_plan_started` / `seating_plan_pdf_downloaded` (déjà là, mappés start/export).
- `budget` : `tool_export` au téléchargement PDF.
- `checklist` : `tool_started` (1re case cochée, dédup visiteur) + `tool_export` (PDF).
- `discours` : `tool_started` (génération) + `tool_export` (PDF).
- `liste-invites` & `programme` : **pages vitrines statiques** (pas d'outil interactif) → fréquentation via `page_view` uniquement, rien à instrumenter. Documenté, pas d'event fictif.

### Rapports (P1 + P4) — cockpit réorganisé autour de 6 questions métier
Qui vient · D'où · Que consultent-ils · Restent-ils/naviguent · Quels outils · Qu'est-ce qui fait découvrir l'app.
- **P1 exploité** : nouveaux vs retour (via historique `visitor_id`), sources + **UTM**, pages d'entrée — rien de perdu.
- **Tableau de pages dynamique** (toutes pages publiques réellement vues, pas de liste en dur) + **drill-down** (temps, entrées, sortie, pages avant/après).
- **Parcours** (enchaînements page→page), pages de sortie, pages/session, temps moyen, taux « 1 page ».
- **Outils** : comparatif visiteurs / démarrés / exportés.
- **Découverte** : pages vues avant une inscription, conversions par source.
- Libellés **vulgarisés en français simple** ; distinction faits / tendances / durées approximatives.

### Limites documentées (affichées dans le cockpit)
- Durées = temps onglet actif → **approximatives** (`beforeunload`/`pagehide` non garantis).
- Une visite n'est pas une visite « engagée » : le taux « 1 page » et le temps moyen le rappellent.
- `visitor_id` localStorage : sous-compte si cookies effacés, pas de cross-device.
- Rien n'est reconstitué avant le déploiement du suivi (pas de donnée historique fabriquée).

### Consentement (vérifié avant P2)
- Politique §7 : « cookies techniques uniquement, aucun traceur tiers ».
- **P2 a été conçue pour relever du cadre « mesure d'audience »** des recommandations CNIL : interne, pseudonyme, finalité limitée, pas de recoupement, pas de partage tiers, pas de fingerprinting, conservation ≤ 25 mois. **Ces caractéristiques techniques ne valent pas à elles seules confirmation juridique** de l'exemption de consentement : l'absence de nom/email dans les events ne suffit pas à l'établir. **À faire valider** (DPO/conseil) avant de considérer l'exemption acquise. En attendant, aucun popup n'a été ajouté et la politique de confidentialité informe de cette mesure.
- Paragraphe d'information ajouté à [la politique de confidentialité](../app/politique-de-confidentialite/page.tsx), formulé sans affirmer l'exemption comme acquise.

### Point distinct à résoudre (hors de cette mission) — GA4 vs politique
GA4 (Google, tiers) est chargé **sans consentement** alors que la politique §7 affirme « aucun traceur tiers ». C'est une **incohérence préexistante**, indépendante de la collecte first-party de cette mission. **À traiter séparément** : soit conditionner GA4 à un consentement, soit le retirer, soit mettre la politique en accord avec la réalité. Non investigué et non modifié ici (consigne : ne pas toucher GA4, pas de nouvel audit).
