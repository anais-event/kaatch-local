# Cockpit Analytics interne — Kaatch

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
