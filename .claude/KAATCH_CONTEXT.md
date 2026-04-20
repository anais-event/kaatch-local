# Kaatch — Contexte projet pour nouvelles conversations

## C'est quoi
App de gestion de mariage. Deux espaces distincts :
- **Mariés** (`/wedding/[slug]/…`) — dashboard de gestion complet
- **Invités** (`/invite/[slug]/…`) — espace invité accessible sans compte

## Stack technique
- **Next.js App Router** (version avec breaking changes — lire `node_modules/next/dist/docs/` avant de toucher aux APIs)
- **Supabase** — base de données + storage (`wedding-photos`) + auth
- **TypeScript** strict — les erreurs de type font planter le build Vercel
- **Tailwind CSS** — utilitaires uniquement, pas de CSS custom
- **Vercel** — déploiement auto depuis GitHub (`anais-event/kaatch-local`, branche `master`)

## Design system
```
Couleurs principales :
  fond crème   → bg-[#f5f0e8]
  vert sauge   → #4a5240  (boutons primaires, accents)
  vert foncé   → #2d3228  (hover, titres)
  texte        → text-stone-700 / text-stone-400

Polices (variables CSS) :
  --font-cormorant  → titres, italiques, style éditorial
  --font-lato       → corps, labels, fontWeight: 300 partout

Règle d'or : fontWeight: 300 sur TOUT le texte Lato
Style cards : bg-white, rounded-2xl, border border-stone-100, shadow-sm
```

## Auth & sessions
- **Mariés** : auth Supabase classique (email/password)
- **Invités** : cookie `guest_[slug]` contenant `{ firstName, lastName, id }` — PAS de compte
  - Accès via `/p/[code]` (code de partage) → pose le cookie → redirige vers `/invite/[slug]`
  - ⚠️ `last_name` peut être stocké comme string `"null"` en BDD → toujours filtrer avec `.filter(v => v && v !== 'null')` ou `cleanName()`

## Structure des fichiers clés

### Côté mariés (`/wedding/[slug]/`)
```
page.tsx              → dashboard principal
layout.tsx            → WeddingNav (nav du haut)
edit/page.tsx         → édition infos mariage (nom, date, lieu, message, cover)
guests/
  page.tsx            → liste invités avec server actions
  GuestList.tsx       → tableau invités, RSVP, statut invitation
  AddGuestForm.tsx    → formulaire ajout invité
  ExportGuestsButton.tsx → export Excel/CSV (lib xlsx)
  ImportGuests.tsx    → import CSV
invitations/
  page.tsx            → liste invités + bouton partage individuel
  CopyLinkButton.tsx  → dropdown Partager (copier, WhatsApp, Email, aperçu faire-part)
photos/
  page.tsx            → fetch photos + moments + guestNames → passe à PhotoGallery
  PhotoGallery.tsx    → galerie complète (upload, lightbox, select, ZIP, delete, search, filter)
  PhotoFeed.tsx       → (ancien composant, probablement déprecié)
partager/
  page.tsx            → code de partage + lien + QR code
  CopyButton.tsx      → boutons WhatsApp/Email/SMS avec message pré-rempli
  QRCodeDisplay.tsx   → QR code imprimable
programme/
  page.tsx            → gestion programme jour J
  ProgrammeClient.tsx → éditeur d'étapes (drag & drop)
tables/
  page.tsx            → plan de table
  SeatingBoard.tsx    → UI d'assignation des tables
messagerie/
  page.tsx            → liste groupes de discussion
budget/
  page.tsx            → suivi budget
```

### Côté invités (`/invite/[slug]/`)
```
layout.tsx            → GuestNav + BottomNavGuest
page.tsx              → accueil invité (compte à rebours, infos mariage)
photos/
  page.tsx            → server actions (addLike, addComment, uploadPhoto) → GuestPhotoFeed
  GuestPhotoFeed.tsx  → galerie invité (upload FAB, lightbox, like, comment, select, ZIP)
programme/page.tsx    → programme jour J (lecture seule)
groupes/              → messagerie par groupe
contacts/page.tsx     → contacts utiles
hebergements/page.tsx → hébergements suggérés
```

### Routes d'entrée
```
/p/[code]             → saisie code partage → pose cookie → redirect /invite/[slug]
/rsvp/[slug]          → formulaire RSVP invité
/rejoindre            → rejoindre un mariage existant (mariés)
/dashboard            → dashboard mariés (liste mariages)
/auth                 → login/register
```

## Base de données (tables principales)
```
weddings          id, slug, name, date, location, cover_image_url, couple_message, share_code, user_id
guests            id, wedding_id, first_name, last_name, nickname, email, phone, relation, guest_type, rsvp_status, invite_sent_at
photos            id, wedding_id, url, uploaded_by_name, moment_tag, tagged_guests (text[]), created_at
photo_likes       id, photo_id, liker_name
photo_comments    id, photo_id, author_name, content, created_at
program_steps     id, wedding_id, title, description, time, location, position
messages          id, wedding_id, group_id, author_name, content, created_at
tables            id, wedding_id, name, capacity
table_guests      id, table_id, guest_id
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

## Workflow de déploiement
```bash
git add "app/wedding/[slug]/photos/PhotoGallery.tsx"   # chemins avec [] nécessitent les guillemets
git commit -m "..."
git push   # → Vercel déploie automatiquement sur kaatch-app.vercel.app
```
