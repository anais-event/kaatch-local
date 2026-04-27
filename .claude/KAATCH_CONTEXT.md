# Kaatch — Contexte projet pour nouvelles conversations

## C'est quoi
App de gestion de mariage. Deux espaces distincts :
- **Mariés** (`/wedding/[slug]/…`) — dashboard de gestion complet
- **Invités** (`/invite/[slug]/…`) — espace invité accessible sans compte

## Stack technique
- **Next.js App Router 16.2.2** (breaking changes — lire `node_modules/next/dist/docs/` avant de toucher aux APIs)
- **Supabase** — base de données + storage (`wedding-photos`) + auth
- **TypeScript** strict — les erreurs de type font planter le build Vercel
- **Tailwind CSS** — utilitaires uniquement, pas de CSS custom
- **Vercel** — déploiement auto depuis GitHub (`anais-event/kaatch-local`, branche `master`)
  - Projet Vercel : `kaatch-app` (prj_BP3pTxmjyU2pKZqIbPitCLkpDGUi, team_kxnENq3HZ2zO2G8AzKGJV5RU)
  - ⚠️ Les apostrophes droites `'` dans des strings JS délimitées par `'` cassent Turbopack (ex: `d'invités`)

## Design system
```
Couleurs principales :
  fond crème   → bg-[#f5f0e8]
  vert sauge   → #4a5240  (boutons primaires, accents)
  vert foncé   → #2d3228  (hover, titres)
  texte        → text-stone-700 / text-stone-400

Polices (variables CSS) :
  --font-cormorant  → titres, italiques, style éditorial (faire-part, noms de mariages)
  --font-lato       → corps, labels, fontWeight: 300 partout

Règle d'or : fontWeight: 300 sur TOUT le texte Lato
Style cards : bg-white, rounded-2xl, border border-stone-100, shadow-sm
```

## Auth & sessions
- **Mariés** : auth Supabase classique (email/password)
- **Invités** : cookie `guest_[slug]` contenant `{ firstName, lastName, id }` — PAS de compte
  - Accès via `/i/[token]` (lien personnel) → Route Handler pose le cookie → redirige vers `/invite/[slug]/faire-part`
  - Accès via `/p/[code]` (code de partage) → pose le cookie → redirige vers `/invite/[slug]`
  - ⚠️ `last_name` peut être stocké comme string `"null"` en BDD → toujours filtrer avec `.filter(v => v && v !== 'null')` ou `cleanName()`
  - ⚠️ Écrire un cookie dans un **Server Component** est INTERDIT en Next.js 16 → utiliser une **Route Handler** (`route.ts`) ou une **Server Action**

## Structure des fichiers clés

### Côté mariés (`/wedding/[slug]/`)
```
page.tsx              → dashboard principal
layout.tsx            → WeddingNav + BottomNav + OnboardingModal
WeddingNav.tsx        → nav mariés (sections: Préparatifs, Jour J, Photos, Livre d'Or, Messagerie)
edit/page.tsx         → édition infos mariage (nom, date, lieu, message couple, cover image)
guests/
  page.tsx            → liste invités avec server actions
  GuestList.tsx       → tableau invités, RSVP, statut invitation
  AddGuestForm.tsx    → formulaire ajout invité
  ExportGuestsButton.tsx → export Excel/CSV (lib xlsx)
  ImportGuests.tsx    → import CSV
invitations/
  page.tsx            → liste invités + génération tokens + envoi faire-part
  InvitationsList.tsx → par invité: QR toggle, copier lien, WhatsApp, bouton "💌 Faire-part"
                        + téléchargement PNG individuel via drawFairePartCanvas()
  CopyLinkButton.tsx  → (legacy) dropdown Partager
photos/
  page.tsx            → fetch photos + moments + guestNames → passe à PhotoGallery
  PhotoGallery.tsx    → galerie complète (upload, lightbox, select, ZIP, delete, search, filter)
partager/
  page.tsx            → code de partage + lien + QR code
programme/
  page.tsx            → gestion programme jour J
  ProgrammeClient.tsx → éditeur d'étapes (drag & drop)
  recap/page.tsx      → page impression/PDF du programme (PrintButton.tsx client component)
tables/
  page.tsx            → plan de table
  SeatingBoard.tsx    → UI d'assignation des tables
messagerie/
  page.tsx            → liste groupes de discussion
budget/
  page.tsx            → suivi budget
musique/
  page.tsx            → playlist + suggestions invités (côté mariés — lecture)
livre-dor/
  page.tsx            → livre d'or (utilise createSupabaseServerClient normal, PAS service role)
```

### Côté invités (`/invite/[slug]/`)
```
layout.tsx            → GuestNav + BottomNavGuest (redirige vers /p/[share_code] si pas de cookie)
page.tsx              → accueil invité (compte à rebours, infos mariage)
faire-part/
  page.tsx            → lit cookie + fetch invite_token + construit personalUrl → FairePartEnvelope
  FairePartEnvelope.tsx → animation rideau + pétales animés + carte Cormorant italic
                           "Vous êtes invité(e)" + message mariés + QR code personnel
                           + bouton téléchargement PNG
photos/
  page.tsx            → server actions (addLike, addComment, uploadPhoto) → GuestPhotoFeed
  GuestPhotoFeed.tsx  → galerie invité (upload FAB, lightbox, like, comment, select, ZIP)
programme/page.tsx    → programme jour J (lecture seule)
musique/page.tsx      → suggestions musicales par moment (cérémonie/vin d'honneur/dîner/soirée)
surprises/page.tsx    → idées surprises + section Jeux & animations (visible invités seulement)
groupes/              → messagerie par groupe
contacts/page.tsx     → contacts utiles
hebergements/page.tsx → hébergements suggérés
livre-dor/page.tsx    → livre d'or invités
compte/page.tsx       → profil invité
```

### Routes d'entrée
```
/i/[token]            → Route Handler (route.ts) — pose cookie guest_[slug] + redirect faire-part
                        ⚠️ DOIT être une Route Handler, pas un page.tsx (cookies en écriture interdits dans Server Components)
/p/[code]             → saisie code partage → pose cookie → redirect /invite/[slug]
/rsvp/[slug]          → formulaire RSVP invité (utilise invite_token, pas rsvp_token)
/rejoindre            → rejoindre un mariage existant (mariés)
/dashboard            → dashboard mariés (liste mariages)
/auth                 → login/register
```

### Landing & pages publiques
```
app/page.tsx          → landing page (FAQ, JSON-LD, prix de lancement, nav avec Connexion→/auth + Mon espace→/dashboard)
app/pricing/page.tsx  → tarifs
app/guide/page.tsx    → guide
public/sitemap.xml    → sitemap
public/robots.txt     → robots (Disallow: /i/, /rsvp/)
```

## Base de données (tables principales)
```
weddings          id, slug, name, date, location, cover_image_url, couple_message, share_code, user_id
guests            id, wedding_id, first_name, last_name, nickname, email, phone, relation,
                  guest_type, rsvp_status, invite_sent_at, invite_token, invited_at
photos            id, wedding_id, url, uploaded_by_name, moment_tag, tagged_guests (text[]), created_at
photo_likes       id, photo_id, liker_name
photo_comments    id, photo_id, author_name, content, created_at
program_steps     id, wedding_id, title, description, time, location, position
messages          id, wedding_id, group_id, author_name, content, created_at
tables            id, wedding_id, name, capacity
table_guests      id, table_id, guest_id
playlist_songs    id, wedding_id, title, artist, moment, notes, suggested_by, created_at
                  (RLS: SELECT USING(true), INSERT WITH CHECK(true))
guestbook_entries id, wedding_id, author_name, content, created_at
                  (RLS: SELECT USING(true) — pas besoin de service role)
```

## Patterns récurrents

### Server actions (pattern standard)
```tsx
// Dans page.tsx (Server Component)
async function monAction(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  // ...
  revalidatePath(`/wedding/${slug}/photos`)
}
// Passé en prop au Client Component
<MonComposant action={monAction} />
```

### Route Handler pour poser un cookie (obligatoire en Next.js 16)
```ts
// app/i/[token]/route.ts
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const cookieStore = await cookies()
  cookieStore.set(`guest_${slug}`, JSON.stringify({...}), { maxAge: ..., path: '/' })
  return NextResponse.redirect(new URL(`/invite/${slug}/faire-part`, _req.url))
}
```

### cleanName() — à utiliser partout pour les noms
```ts
function cleanName(name: string | null | undefined): string {
  if (!name) return ''
  return name.split(' ').filter(p => p && p !== 'null').join(' ')
}
```

### Récupérer le cookie invité
```ts
const cookieStore = await cookies()
const guestCookie = cookieStore.get(`guest_${slug}`)
const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: '', lastName: '', id: null }
const guestName = [guest.firstName, guest.lastName].filter(v => v && v !== 'null').join(' ')
```

### Upload photo vers Supabase Storage
```ts
const path = `${wedding.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
await supabase.storage.from('wedding-photos').upload(path, Buffer.from(bytes), { contentType: file.type })
const { data: urlData } = supabase.storage.from('wedding-photos').getPublicUrl(path)
```

### ZIP multi-photos (côté client)
```ts
const JSZip = (await import('jszip')).default  // import dynamique !
const zip = new JSZip()
await Promise.all(photos.map(async (p, i) => {
  try {
    const blob = await fetch(p.url).then(r => r.blob())  // deux lignes obligatoires (TypeScript)
    zip.file(`photo-${i + 1}.jpg`, blob)
  } catch {}
}))
```

## Pièges connus
- **`Blob | null` TypeScript** : ne jamais faire `zip.file(name, await fetch(url).then(r => r.blob()))` — splitter en deux variables
- **`last_name = "null"`** : la BDD stocke la string "null", pas SQL NULL — toujours filtrer
- **`window.print()`** : imprime la page entière — pour imprimer un élément spécifique, ouvrir dans un nouvel onglet
- **Fichiers non commités** : Vercel déploie depuis git, pas depuis le disque — toujours `git add + commit + push`
- **Server actions** : doivent être dans un Server Component ou dans un fichier séparé avec `'use server'`
- **Cookies en écriture** : INTERDITS dans les Server Components (page.tsx) en Next.js 16 → utiliser route.ts (Route Handler)
- **Apostrophes dans strings JS** : `'d'invités'` casse Turbopack → utiliser des doubles guillemets `"d'invités"`
- **SUPABASE_SERVICE_ROLE_KEY** : pas défini en prod Vercel → toujours prévoir un fallback vers `createSupabaseServerClient()`
- **Canvas `letterSpacing`** : non standard sur tous les contextes canvas — utiliser avec prudence

## Workflow de déploiement
```bash
git add "app/wedding/[slug]/photos/PhotoGallery.tsx"   # chemins avec [] nécessitent les guillemets
git commit -m "..."
git push   # → Vercel déploie automatiquement sur kaatch-app (kaatch.fr)
```

## Faire-part — flow complet
1. Marié va sur `/wedding/[slug]/invitations`
2. Pour chaque invité : bouton **💌 Faire-part** → ouvre `/i/[token]`
3. `/i/[token]` (Route Handler) : pose cookie `guest_[slug]` → redirect `/invite/[slug]/faire-part`
4. `/invite/[slug]/faire-part` (page.tsx) : lit cookie, fetch invite_token, construit `personalUrl = baseUrl/i/token`
5. `FairePartEnvelope.tsx` : animation rideau → pétales → carte Cormorant + QR code → bouton téléchargement PNG
6. QR code pointe vers `personalUrl` (lien personnel de l'invité)
