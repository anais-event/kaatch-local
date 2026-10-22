# Audit Kaatch — Plan de table comme moteur d'acquisition

> Phase 0 (audit). Aucune modification de code n'a été faite. État réel du dépôt, branche `claude/invitations-live`, Next.js **16.2.2**.

## Rappels d'architecture (réalité du code, pas l'hypothèse de départ)

- **Next.js 16.2.2** App Router (pas 14), Supabase (`@supabase/ssr`), Tailwind, shadcn/radix, Stripe, Resend, `@react-pdf/renderer` + jsPDF, `next-intl`, blog MDX (`next-mdx-remote`, `gray-matter`).
- **i18n `next-intl`** : locales `fr, en, es, it, de`, `defaultLocale: 'fr'`, `localePrefix: 'as-needed'`, `localeDetection: false`. → Le **FR est servi sans préfixe** par le segment `app/[locale]/…`. Les locales étrangères sous `/en`, `/es`, `/it`, `/de`.
- **Analytics** : GA4 `G-JZGV5T58NL` via `@next/third-parties/google` **+** Vercel Analytics (`@vercel/analytics`), tous deux montés dans `app/layout.tsx`.
- **Outil plan de table réel** : `app/plan-de-table-mariage/PlanDeTable.tsx` (760 lignes, client) — importé par `app/[locale]/plan-de-table-mariage/page.tsx`. Persistance `localStorage` (clé `kaatch-pdtm-v1`), **sans inscription**. C'est déjà le bon modèle produit.

---

## A. Ce qui fonctionne déjà

1. **L'outil plan de table est un vrai produit gratuit, pas une page marketing.** Il tourne sans compte : ajout d'invités (simple + bulk), tables (capacité + forme ronde/rect), **drag & drop**, compteurs « invités / non placés », **export PDF** (jsPDF), sauvegarde auto `localStorage`. L'hypothèse 2 est déjà à moitié validée dans le code.
2. **SEO on-page de la page pilier déjà bon** : `title`/`description` ciblés, `canonical` absolu, OpenGraph + Twitter, **JSON-LD** riche (`SoftwareApplication` + `FAQPage` avec réponses directes + `BreadcrumbList`). Le format « réponse directe » demandé en Phase 11 est déjà appliqué dans la FAQ.
3. **Infra IA/GEO déjà posée** : `robots.txt` autorise explicitement GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Bingbot… + `public/llms.txt` et `llms-full.txt` propres et factuels. Cohérent avec le canal « AI Assistant » déjà visible dans GA4/Vercel.
4. **Sitemap dynamique** (`app/sitemap.ts`) : pages stratégiques + hreflang + articles MDX inclus automatiquement.
5. **Écosystème d'outils gratuits** déjà là : budget, checklist, liste invités, programme, discours — matière à cluster et maillage.
6. **10 articles** dans `content/inspirations/*.mdx`.

## B. Ce qui est insuffisant

1. **Tracking funnel quasi inexistant.** Un seul event custom (`pdf_download`) via `window.gtag` inline. **Aucun** `plan_table_started`, `guest_added`, `table_created`, `guest_moved`, `signup_*`, `wedding_created`. → On ne sait pas ce que font les visiteurs ni quel canal produit des utilisateurs activés (= **hypothèse 5 confirmée** : le problème n'est pas le trafic mais l'aveuglement).
2. **Pas d'util `trackEvent()` centralisé** : gtag copié-collé dans 3 fichiers (`PlanDeTable`, `budget-mariage/PDFDownloadButton`, `checklist-mariage`). Nommage non garanti, pas de params normalisés, pas d'anti-PII.
3. **L'outil n'a pas le flow « WOW » cible** : pas d'écran d'entrée « Combien d'invités ? » avec génération auto de tables, pas de **mode démo** (« Voir un exemple »), pas de **validation intelligente** (tables en surcharge, tables vides, incohérences), pas d'import CSV dans la version gratuite (l'import xlsx existe côté app connectée seulement).
4. **`llms.txt` ne mentionne pas `/plan-de-table-mariage`** — l'actif d'acquisition n°1 est absent du fichier censé le mettre en avant auprès des IA.
5. **Attribution UTM non normalisée** : aucune capture `utm_*` → stockage first/last source. `chatgpt.com` arrive en referrer brut, pas rangé en canal `chatgpt`.

## C. Problèmes critiques

1. **Fuite de pages privées dans l'index (confidentialité + SEO).**
   `robots.txt` interdit `/wedding/` **qui n'existe pas** : la vraie route privée est **`/mariage/[slug]`**, et elle n'est ni dans robots.txt ni en `noindex`. `/invité/[slug]` (avec accent) n'est pas couvert non plus. → Des espaces mariage (noms d'invités, infos privées) sont **indexables par Google**. À corriger en priorité absolue.
2. **Aucun `noindex` programmatique** sur `/mariage`, `/dashboard`, `/invite`, `/rsvp`, `/invité`. On ne s'appuie que sur robots.txt (qui, lui, est faux). Défense en profondeur absente.
3. **`aggregateRating` potentiellement fictif** dans le JSON-LD de la page plan de table : `ratingValue 4.8 / reviewCount 89`. Si ces avis n'existent pas réellement, c'est une **fausse donnée structurée** → risque de pénalité Google **et** violation de la règle « ne pas fabriquer de fausses informations ». À retirer ou à justifier par de vrais avis.

## D. Problèmes importants

1. **Routes dupliquées legacy** (pré-i18n), non servies mais polluantes : `app/{plan-de-table-mariage,budget-mariage,checklist-mariage,liste-invites-mariage,programme-mariage,pricing,studio}/page.tsx` doublonnent `app/[locale]/…`. Risque de confusion/maintenance et de divergence de métadonnées. **Nuance** : `app/plan-de-table-mariage/PlanDeTable.tsx` (le composant) reste utilisé — ne supprimer que les `page.tsx` doublons, pas le composant.
2. **Sitemap pointe une URL 404** : `/confidentialite` alors que la route réelle est `/politique-de-confidentialite`. `/faq` est listé et existe, OK.
3. **`metadataBase` absent** → warning Next + résolution d'URLs OG/canonical relatives fragile (actuellement masqué car URLs écrites en absolu).
4. **hreflang vers 4 locales** (`en/es/it/de`) dans le sitemap alors que la priorité est FR. Si les traductions sont partielles/thin, ces alternates diluent et peuvent générer du duplicate international. À vérifier avant d'entretenir.
5. **CTA / mesure signup** : le passage outil → `/auth` → création de mariage n'émet aucun événement → impossible de relier une source au compte créé.

## E. Quick wins (fort impact, faible risque)

1. Corriger `robots.txt` : remplacer `/wedding/` par `/mariage/`, ajouter `/invité/`, `/admin`, `/vendor/`, `/prestataire/` si privé. **(sécurité)**
2. Ajouter `metadata.robots = { index: false }` sur les layouts/pages privées (`/mariage`, `/dashboard`, `/invite`, `/invité`, `/rsvp`). **(sécurité)**
3. Corriger le sitemap : `/confidentialite` → `/politique-de-confidentialite`.
4. Retirer (ou rendre véridique) l'`aggregateRating` inventé.
5. Ajouter `/plan-de-table-mariage` (+ autres outils) dans `llms.txt`.
6. Ajouter `metadataBase: new URL('https://kaatch.fr')` dans le layout racine.
7. Créer `lib/analytics.ts` avec `trackEvent(name, params)` (garde anti-PII) et remplacer les 3 gtag inline.

## F. Modifications à éviter

- Ne pas supprimer `PlanDeTable.tsx` ni casser la persistance `localStorage` (c'est l'actif).
- Ne pas refondre la homepage « parce qu'elle existe » (Phase 14).
- Ne pas ajouter un 3ᵉ système analytics ni dupliquer les `page_view` (GA4 via `@next/third-parties` les envoie déjà automatiquement).
- Ne pas générer en masse les 11 pages SEO listées — valider intention/cannibalisation une par une.
- Ne pas lancer de SEO anglais ni traduire tout le site maintenant.
- Ne pas imposer l'inscription avant la première valeur.
- Ne pas présenter `llms.txt` comme un facteur de classement.

## G. Funnel recommandé (à instrumenter)

```
SOURCE (utm/referrer normalisé: chatgpt, google, perplexity, direct…)
  → landing_view (/plan-de-table-mariage)
  → plan_table_started        (1ʳᵉ interaction réelle)
  → guest_added / table_created / guest_moved   (usage)
  → plan_table_completed       (tous placés / plan cohérent)
  → pdf_exported               (valeur délivrée)
  → signup_cta_clicked → signup_started → signup_completed
  → wedding_created
  → first_feature_used → second_feature_used   (activation/rétention)
```
KPI cœur : **SOURCE → UTILISATEUR ACTIVÉ**, pas le trafic brut.

## H. Architecture SEO recommandée

- **Pilier** : `/plan-de-table-mariage` (déjà fort). Le muscler côté produit (flow WOW) sans alourdir.
- **Cluster plan de table**, créé *un par un* après validation d'intention : « combien de personnes par table », « comment placer les invités », « 100 invités », « enfants », « conflit familial ». Chacun : réponse directe en tête → détail → CTA contextuel → liens entrants/sortants.
- **Maillage** : pilier ↔ articles du cluster ↔ outil. Aucun contenu orphelin. `/outils` comme hub.
- **Technique** : un seul jeu d'URLs canoniques (consolider les doublons), sitemap propre, pages privées hors index.
- **International** : geler `en/es/it/de` tant que les traductions ne sont pas réelles ; sinon retirer les alternates.

## I. Architecture de tracking recommandée

- **`lib/analytics.ts`** : `trackEvent(name, params)` → `window.gtag('event', name, params)` avec whitelist de params (`guest_count`, `table_count`, `unplaced_guest_count`, `remaining_capacity`, `cta_location`, `tool_version`, `source`, `landing_page`, `device_category`) et **blocage strict de toute PII** (jamais de nom/email/téléphone d'invité).
- **Attribution** : capter `utm_*` à l'entrée, normaliser (`chatgpt.com`→`chatgpt`), persister first-touch + last-touch en cookie/localStorage, joindre à `signup_completed` / `wedding_created`.
- **Conversions GA4** (à marquer côté interface GA, livré en « reste à faire manuellement ») : `signup_completed`, `wedding_created`, `first_table_plan_created`, `first_feature_used` ; `pdf_exported` en conversion secondaire.
- **Pas de doublon `page_view`** : GA4 third-parties gère déjà ; n'ajouter que des events custom.

---

## Ordre d'implémentation proposé

| Prio | Lot | Risque |
|------|-----|--------|
| **P0** | Audit (ce document) | — |
| **P1** | Sécurité/SEO critiques : robots `/mariage`, `noindex` privé, sitemap 404, aggregateRating, metadataBase | faible |
| **P2** | `lib/analytics.ts` + instrumentation funnel plan de table (events B/G) | faible |
| **P3** | Flow WOW outil : écran « Combien d'invités ? » + génération auto, mode démo, validation intelligente, (import CSV) | moyen |
| **P4** | Attribution UTM + normalisation canaux | faible |
| **P5** | `llms.txt` + structured data honnête + nettoyage doublons routes | faible |
| **P6** | 1ᵉʳ contenu cluster plan de table (1–2 articles à forte intention) + maillage | faible |
| **P7+** | Contenus suivants validés un par un | — |

## Reste à faire manuellement (hors code)

- Google Search Console : vérifier propriété, soumettre `sitemap.xml`, surveiller l'indexation des pages privées (demander leur **désindexation** si déjà indexées).
- GA4 : marquer les events-clés comme **conversions**, créer une exploration **funnel** et une exploration **par canal**.
- Confirmer la réalité des avis (aggregateRating) et l'état des traductions `en/es/it/de`.
