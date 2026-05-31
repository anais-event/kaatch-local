'use client'
import { toDateLocale } from '@/lib/locale-map'
import { useLocale } from 'next-intl'

import { useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Ambiance = {
  id: string
  emoji: string
  name: string
  tagline: string
  description: string
  palette: { name: string; hex: string }[]
  accent: string
  bg: string
  fontDisplay: string
  fontBody: string
  tag: string
  // Pour Gelato (garde compat avec l'ancien système)
  gelatoId: string
}

type TypoPair = {
  id: string
  display: string
  body: string
  label: string
}

type Guest = {
  id: string
  first_name: string
  last_name: string
  guest_type?: string | null
  rsvp_status?: string | null
  table_guests?: { table_id: string; tables?: { name: string }[] | null }[]
}

type Wedding = {
  slug: string
  name: string
  date: string | null
  location: string | null
  bride_name: string | null
  groom_name: string | null
}

type Quantities = {
  fairesParts: number
  menus: number
  marquePlaces: number
  numerosTable: number
  programme: number
  planTable: number
}

type ShippingForm = {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2: string
  city: string
  postCode: string
  country: string
  email: string
  phone: string
}

type Step = 'landing' | 'ambiance' | 'personnalisation' | 'contenu' | 'selection' | 'collection' | 'commander'

type ProduitCol = 'fairepart' | 'menu_adulte' | 'menu_enfant' | 'marque_place' | 'programme' | 'plan_table'

type GuestSelection = Record<string, Record<ProduitCol, boolean>> // guestId → produit → checked

type MenuSection = { titre: string; plats: string }
type EtapeProgramme = { heure: string; titre: string }

type ContenuDoc = {
  fairepart: { message: string; nomMaries: string }
  menu: { sections: MenuSection[] }
  programme: { etapes: EtapeProgramme[] }
  marquePlaces: { format: 'prenom_nom' | 'prenom' | 'prenom_NOM' }
  numerosTable: { prefixe: string }
  planTable: { titre: string }
}

// ─── Ambiances ────────────────────────────────────────────────────────────────

const AMBIANCES: Ambiance[] = [
  {
    id: 'campagne',
    emoji: '🌾',
    name: 'Maison de campagne',
    tagline: 'Lumière naturelle, lin froissé, eucalyptus.',
    description: 'Comme un dimanche en Provence. Chaleur de la terre, douceur des herbes sauvages, et cette lumière dorée de fin d\'après-midi.',
    palette: [
      { name: 'Blé', hex: '#e8dcc8' },
      { name: 'Terre', hex: '#c4a882' },
      { name: 'Sauge', hex: '#7a8c6e' },
      { name: 'Humus', hex: '#5c4a3a' },
    ],
    accent: '#7a8c6e',
    bg: '#f7f2ea',
    fontDisplay: 'Playfair Display',
    fontBody: 'Raleway',
    tag: 'Nature & Poésie',
    gelatoId: 'botanique',
  },
  {
    id: 'editorial',
    emoji: '🏛️',
    name: 'Élégance éditoriale',
    tagline: 'Épuré, architectural, intemporel.',
    description: 'Vogue rencontre Le Corbusier. La beauté du vide, la force du contraste. Un mariage dont on parlera dans dix ans.',
    palette: [
      { name: 'Ivoire', hex: '#f8f6f1' },
      { name: 'Graphite', hex: '#2c2c2c' },
      { name: 'Cendre', hex: '#888888' },
      { name: 'Or', hex: '#c9a96e' },
    ],
    accent: '#2c2c2c',
    bg: '#f8f6f1',
    fontDisplay: 'Cormorant Garamond',
    fontBody: 'Montserrat',
    tag: 'Bestseller',
    gelatoId: 'classique',
  },
  {
    id: 'italien',
    emoji: '🌅',
    name: 'Dîner italien d\'été',
    tagline: 'Ocre chaud, terrasse en pierre, citronniers.',
    description: 'La dolce vita. Le soleil qui se couche sur la mer Tyrrhénienne, le parfum du basilic, et votre toast sous les étoiles.',
    palette: [
      { name: 'Terracotta', hex: '#c4622d' },
      { name: 'Citron', hex: '#e8c547' },
      { name: 'Méditerranée', hex: '#4a7fa5' },
      { name: 'Pierre', hex: '#d4c5a9' },
    ],
    accent: '#c4622d',
    bg: '#fdf6ed',
    fontDisplay: 'Libre Baskerville',
    fontBody: 'Lato',
    tag: 'Chaleur & Joie',
    gelatoId: 'minimaliste',
  },
  {
    id: 'romance',
    emoji: '🌸',
    name: 'Modern romance',
    tagline: 'Doux mais graphique, romantique mais contemporain.',
    description: 'Le nouveau classique. Une romance qui n\'a pas peur d\'être moderne — lignes précises, fleurs douces, et une palette qui fait soupirer.',
    palette: [
      { name: 'Rose poudré', hex: '#e8c4c4' },
      { name: 'Nude', hex: '#d4a89a' },
      { name: 'Cuivre', hex: '#b87333' },
      { name: 'Crème', hex: '#f5ede8' },
    ],
    accent: '#b87333',
    bg: '#fdf4f0',
    fontDisplay: 'Bodoni Moda',
    fontBody: 'Nunito',
    tag: 'Romance & Style',
    gelatoId: 'classique',
  },
  {
    id: 'chateau',
    emoji: '🕯️',
    name: 'Château contemporain',
    tagline: 'Luxe discret, détails précieux, élégance intemporelle.',
    description: 'Grand mariage, grand style. Voûtes en pierre, chandelles, et cette impression que le temps lui-même s\'est habillé pour l\'occasion.',
    palette: [
      { name: 'Navy', hex: '#1a2744' },
      { name: 'Ivoire', hex: '#f5f0e4' },
      { name: 'Or vieilli', hex: '#b5962a' },
      { name: 'Ardoise', hex: '#4a4e5a' },
    ],
    accent: '#b5962a',
    bg: '#f5f0e4',
    fontDisplay: 'IM Fell English',
    fontBody: 'Jost',
    tag: 'Prestige',
    gelatoId: 'classique',
  },
]

const TYPO_PAIRS: Record<string, TypoPair[]> = {
  campagne: [
    { id: 'a', display: 'Cormorant', body: 'Lato', label: 'Poétique & aéré' },
    { id: 'b', display: 'Cormorant italic', body: 'Lato', label: 'Chaleureux & doux' },
    { id: 'c', display: 'Cormorant SC', body: 'Lato', label: 'Naturel & structuré' },
  ],
  editorial: [
    { id: 'a', display: 'Cormorant', body: 'Lato', label: 'Raffiné & moderne' },
    { id: 'b', display: 'Cormorant italic', body: 'Lato', label: 'Éditorial & élancé' },
    { id: 'c', display: 'Cormorant SC', body: 'Lato', label: 'Architectural & net' },
  ],
  italien: [
    { id: 'a', display: 'Cormorant italic', body: 'Lato', label: 'Solaire & festif' },
    { id: 'b', display: 'Cormorant', body: 'Lato', label: 'Méditerranéen & gai' },
    { id: 'c', display: 'Cormorant SC', body: 'Lato', label: 'Chaleureux & posé' },
  ],
  romance: [
    { id: 'a', display: 'Cormorant italic', body: 'Lato', label: 'Romantique & délicat' },
    { id: 'b', display: 'Cormorant', body: 'Lato', label: 'Doux & contemporain' },
    { id: 'c', display: 'Cormorant SC', body: 'Lato', label: 'Géométrique & précis' },
  ],
  chateau: [
    { id: 'a', display: 'Cormorant SC', body: 'Lato', label: 'Majestueux & gravé' },
    { id: 'b', display: 'Cormorant italic', body: 'Lato', label: 'Élégant & intemporel' },
    { id: 'c', display: 'Cormorant', body: 'Lato', label: 'Grand style & net' },
  ],
}

const PRODUITS = [
  { key: 'fairesParts' as keyof Quantities, label: 'Faire-parts', icon: '💌', desc: 'Format A5, 1 par foyer, enveloppe incluse', price: '~2,50€ / unité', min: 10 },
  { key: 'menus' as keyof Quantities, label: 'Menus', icon: '🍽️', desc: 'Format A5, recto-verso, papier 300g', price: '~1,20€ / unité', min: 10 },
  { key: 'marquePlaces' as keyof Quantities, label: 'Marque-places', icon: '🎴', desc: 'Prénom + numéro de table, format carte', price: '~0,40€ / unité', min: 1 },
  { key: 'numerosTable' as keyof Quantities, label: 'Numéros de table', icon: '🔢', desc: 'Format A5 ou chevalet, 1 par table', price: '~1,00€ / unité', min: 1 },
  { key: 'programme' as keyof Quantities, label: 'Programme', icon: '📋', desc: 'Déroulé de la journée, format A5', price: '~1,00€ / unité', min: 10 },
  { key: 'planTable' as keyof Quantities, label: 'Plan de table', icon: '🗺️', desc: 'Affiche A2 ou A1, tous les invités', price: '~8,00€ / unité', min: 1 },
]

// ─── SVG Previews légers ──────────────────────────────────────────────────────

function PreviewFairepart({ ambiance, wedding, fontDisplay, contenu }: {
  ambiance: Ambiance
  wedding: Wedding
  fontDisplay: string
  contenu?: ContenuDoc
}) {
  const nomMaries = contenu?.fairepart.nomMaries || wedding.name || 'Sophie & Marc'
  const date = wedding.date
    ? new Date(wedding.date).toLocaleDateString(toDateLocale('fr'), { day: 'numeric', month: 'long', year: 'numeric' })
    : '14 juin 2025'
  const lieu = wedding.location || 'Château de Villandry'
  const [c1, c2, c3, c4] = ambiance.palette.map(p => p.hex)

  return (
    <svg viewBox="0 0 280 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="280" height="400" fill={ambiance.bg} />
      <rect x="12" y="12" width="256" height="376" fill="none" stroke={c3} strokeWidth="0.8" opacity="0.4" />
      <rect x="18" y="18" width="244" height="364" fill="none" stroke={c3} strokeWidth="0.3" opacity="0.25" />
      {/* Ornement haut */}
      <line x1="60" y1="55" x2="220" y2="55" stroke={ambiance.accent} strokeWidth="0.6" opacity="0.5" />
      <circle cx="140" cy="55" r="4" fill={ambiance.accent} opacity="0.3" />
      <circle cx="60" cy="55" r="2" fill={ambiance.accent} opacity="0.3" />
      <circle cx="220" cy="55" r="2" fill={ambiance.accent} opacity="0.3" />
      {/* Vous êtes invité(e) */}
      <text x="140" y="95" textAnchor="middle" fill={c3} fontSize="8" fontFamily="Georgia, serif" opacity="0.7" letterSpacing="3">
        VOUS ÊTES INVITÉ
      </text>
      {/* Noms mariés */}
      <text x="140" y="160" textAnchor="middle" fill={c4} fontSize="28" fontFamily="Georgia, serif" fontStyle="italic">
        {nomMaries.split('&')[0]?.trim() ?? 'Sophie'}
      </text>
      <text x="140" y="185" textAnchor="middle" fill={ambiance.accent} fontSize="11" fontFamily="Georgia, serif" fontStyle="italic" opacity="0.7">
        &amp;
      </text>
      <text x="140" y="218" textAnchor="middle" fill={c4} fontSize="28" fontFamily="Georgia, serif" fontStyle="italic">
        {nomMaries.split('&')[1]?.trim() ?? 'Marc'}
      </text>
      {/* Séparateur */}
      <line x1="80" y1="240" x2="200" y2="240" stroke={ambiance.accent} strokeWidth="0.5" opacity="0.4" />
      {/* Date */}
      <text x="140" y="268" textAnchor="middle" fill={c3} fontSize="9" fontFamily="Georgia, serif" opacity="0.85">
        {date}
      </text>
      {/* Lieu */}
      <text x="140" y="288" textAnchor="middle" fill={c3} fontSize="8" fontFamily="Georgia, serif" opacity="0.6">
        {lieu}
      </text>
      {/* Ornement bas */}
      <line x1="60" y1="340" x2="220" y2="340" stroke={ambiance.accent} strokeWidth="0.6" opacity="0.5" />
      <text x="140" y="360" textAnchor="middle" fill={ambiance.accent} fontSize="7" fontFamily="Georgia, serif" letterSpacing="2" opacity="0.6">
        RSVP
      </text>
      {/* Coins décoratifs */}
      <path d={`M30 30 L45 30 L45 32 L32 32 L32 45 L30 45 Z`} fill={ambiance.accent} opacity="0.2" />
      <path d={`M250 30 L235 30 L235 32 L248 32 L248 45 L250 45 Z`} fill={ambiance.accent} opacity="0.2" />
      <path d={`M30 370 L45 370 L45 368 L32 368 L32 355 L30 355 Z`} fill={ambiance.accent} opacity="0.2" />
      <path d={`M250 370 L235 370 L235 368 L248 368 L248 355 L250 355 Z`} fill={ambiance.accent} opacity="0.2" />
    </svg>
  )
}

function PreviewMarquePlace({ ambiance, name = 'Sophie Martin' }: {
  ambiance: Ambiance
  name?: string
}) {
  const [c1, c2, c3, c4] = ambiance.palette.map(p => p.hex)
  return (
    <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="100" fill={ambiance.bg} rx="4" />
      <rect x="6" y="6" width="188" height="88" fill="none" stroke={ambiance.accent} strokeWidth="0.6" opacity="0.35" rx="2" />
      <line x1="40" y1="40" x2="160" y2="40" stroke={ambiance.accent} strokeWidth="0.5" opacity="0.3" />
      <text x="100" y="58" textAnchor="middle" fill={c4} fontSize="18" fontFamily="Georgia, serif" fontStyle="italic">
        {name}
      </text>
      <text x="100" y="74" textAnchor="middle" fill={ambiance.accent} fontSize="8" fontFamily="Georgia, serif" opacity="0.6" letterSpacing="1.5">
        TABLE 3
      </text>
      <line x1="40" y1="80" x2="160" y2="80" stroke={ambiance.accent} strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

function PreviewMenu({ ambiance, wedding, contenu }: {
  ambiance: Ambiance
  wedding: Wedding
  contenu?: ContenuDoc
}) {
  const nomMaries = contenu?.fairepart.nomMaries || wedding.name || 'Sophie & Marc'
  const sections = contenu?.menu.sections ?? [
    { titre: 'Amuse-bouche', plats: '' }, { titre: 'Entrée', plats: '' },
    { titre: 'Plat principal', plats: '' }, { titre: 'Dessert', plats: '' }, { titre: 'Mignardises', plats: '' },
  ]
  const [c1, c2, c3, c4] = ambiance.palette.map(p => p.hex)
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="280" fill={ambiance.bg} />
      <rect x="8" y="8" width="184" height="264" fill="none" stroke={c3} strokeWidth="0.6" opacity="0.3" />
      <text x="100" y="42" textAnchor="middle" fill={ambiance.accent} fontSize="7" fontFamily="Georgia, serif" letterSpacing="3" opacity="0.7">
        MENU
      </text>
      <text x="100" y="72" textAnchor="middle" fill={c4} fontSize="14" fontFamily="Georgia, serif">
        {nomMaries}
      </text>
      <line x1="40" y1="85" x2="160" y2="85" stroke={ambiance.accent} strokeWidth="0.5" opacity="0.3" />
      {sections.slice(0, 5).map((s, i) => (
        <g key={i}>
          <text x="100" y={115 + i * 30} textAnchor="middle" fill={c3} fontSize="9" fontFamily="Georgia, serif" opacity="0.7">
            {s.titre}
          </text>
          {i < 4 && <line x1="70" y1={125 + i * 30} x2="130" y2={125 + i * 30} stroke={c3} strokeWidth="0.3" opacity="0.2" />}
        </g>
      ))}
    </svg>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ImpressionsClient({
  wedding,
  guests,
  userEmail,
}: {
  wedding: Wedding
  guests: Guest[]
  userEmail: string
}) {
  const locale = useLocale()
  const [step, setStep] = useState<Step>('landing')
  const [selectedAmbiance, setSelectedAmbiance] = useState<Ambiance | null>(null)
  const nomMariesDefault = wedding.name || [wedding.bride_name, wedding.groom_name].filter(Boolean).join(' & ') || ''
  const [contenu, setContenu] = useState<ContenuDoc>({
    fairepart: {
      message: 'Nous avons la joie de vous convier à la célébration de notre mariage et serions heureux de partager ce moment unique avec vous.',
      nomMaries: nomMariesDefault,
    },
    menu: {
      sections: [
        { titre: 'Amuse-bouche', plats: 'Velouté de butternut, toast aux herbes' },
        { titre: 'Entrée', plats: 'Tartare de saumon, avocat et citron vert' },
        { titre: 'Plat principal', plats: 'Filet de bœuf, jus corsé, légumes de saison' },
        { titre: 'Fromages', plats: 'Sélection de fromages affinés' },
        { titre: 'Dessert', plats: 'Pièce montée et mignardises' },
      ],
    },
    programme: {
      etapes: [
        { heure: '14h00', titre: 'Cérémonie' },
        { heure: '16h00', titre: 'Vin d\'honneur' },
        { heure: '19h30', titre: 'Dîner' },
        { heure: '22h00', titre: 'Soirée & ouverture du bal' },
      ],
    },
    marquePlaces: { format: 'prenom_nom' },
    numerosTable: { prefixe: 'Table' },
    planTable: { titre: 'Plan de table' },
  })
  const [selectedTypo, setSelectedTypo] = useState<string>('a')
  const [palette, setPalette] = useState<string[]>([])
  // Initialisation sélection : adultes/ados pré-cochés pour tout, enfants décochés menu adulte
  const initSelection = (): GuestSelection => {
    const sel: GuestSelection = {}
    guests.forEach(g => {
      const isEnfant = g.guest_type === 'enfant'
      const hasTable = (g.table_guests?.length ?? 0) > 0
      sel[g.id] = {
        fairepart: !isEnfant, // 1 par foyer géré à l'affichage
        menu_adulte: !isEnfant,
        menu_enfant: isEnfant,
        marque_place: hasTable,
        programme: true,
        plan_table: false, // 1 seul plan de table, pas par invité
      }
    })
    return sel
  }
  const [selection, setSelection] = useState<GuestSelection>(initSelection)
  const [showOrder, setShowOrder] = useState(false)
  const [quantities, setQuantities] = useState<Quantities>({
    fairesParts: Math.max(guests.length, 10),
    menus: Math.max(guests.length, 10),
    marquePlaces: guests.length,
    numerosTable: 0,
    programme: Math.max(guests.length, 10),
    planTable: 1,
  })
  const [shipping, setShipping] = useState<ShippingForm>({
    firstName: '', lastName: '', addressLine1: '', addressLine2: '',
    city: '', postCode: '', country: 'FR', email: userEmail, phone: '',
  })
  const [orderStep, setOrderStep] = useState<'products' | 'shipping' | 'confirm'>('products')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function selectAmbiance(a: Ambiance) {
    setSelectedAmbiance(a)
    setPalette(a.palette.map(p => p.hex))
    setSelectedTypo('a')
    setStep('personnalisation')
  }

  const currentTypoPairs = selectedAmbiance ? TYPO_PAIRS[selectedAmbiance.id] : []
  const currentTypo = currentTypoPairs.find(t => t.id === selectedTypo) ?? currentTypoPairs[0]

  const ambianceWithPalette: Ambiance | null = selectedAmbiance
    ? {
        ...selectedAmbiance,
        palette: selectedAmbiance.palette.map((p, i) => ({
          ...p,
          hex: palette[i] ?? p.hex,
        })),
        accent: palette[2] ?? selectedAmbiance.accent,
        bg: palette[0] ?? selectedAmbiance.bg,
      }
    : null

  async function handleOrder() {
    if (!selectedAmbiance) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gelato/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingSlug: wedding.slug,
          designId: selectedAmbiance.gelatoId,
          quantities,
          shipping,
          selectedGuests: quantities.marquePlaces > 0 ? guests.map(g => g.id) : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Une erreur est survenue'); setLoading(false); return }
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl }
      else { setError('URL de paiement non reçue'); setLoading(false) }
    } catch {
      setError('Erreur réseau, veuillez réessayer')
      setLoading(false)
    }
  }

  // ─── Rendu par étape ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f5f0e8]">

      {/* ─── LANDING ─── */}
      {step === 'landing' && (
        <LandingStep onStart={() => setStep('ambiance')} wedding={wedding} guests={guests} />
      )}

      {/* ─── SÉLECTION AMBIANCE ─── */}
      {step === 'ambiance' && (
        <AmbianceStep
          onSelect={selectAmbiance}
          onBack={() => setStep('landing')}
        />
      )}

      {/* ─── PERSONNALISATION ─── */}
      {step === 'personnalisation' && selectedAmbiance && ambianceWithPalette && (
        <PersonnalisationStep
          ambiance={selectedAmbiance}
          ambianceWithPalette={ambianceWithPalette}
          palette={palette}
          setPalette={setPalette}
          typoPairs={currentTypoPairs}
          selectedTypo={selectedTypo}
          setSelectedTypo={setSelectedTypo}
          wedding={wedding}
          onBack={() => setStep('ambiance')}
          onNext={() => setStep('contenu')}
        />
      )}

      {/* ─── SÉLECTION INVITÉS ─── */}
      {step === 'selection' && ambianceWithPalette && (
        <SelectionStep
          ambiance={ambianceWithPalette}
          guests={guests}
          selection={selection}
          setSelection={setSelection}
          weddingSlug={wedding.slug}
          weddingId={''}
          onBack={() => setStep('contenu')}
          onNext={() => setStep('collection')}
        />
      )}

      {/* ─── CONTENU ─── */}
      {step === 'contenu' && ambianceWithPalette && (
        <ContenuStep
          ambiance={ambianceWithPalette}
          contenu={contenu}
          setContenu={setContenu}
          onBack={() => setStep('personnalisation')}
          onNext={() => setStep('selection')}
        />
      )}

      {/* ─── COLLECTION PREVIEW ─── */}
      {step === 'collection' && ambianceWithPalette && (
        <CollectionStep
          ambiance={ambianceWithPalette}
          wedding={wedding}
          guests={guests}
          contenu={contenu}
          onBack={() => setStep('contenu')}
          onCommander={() => { setShowOrder(true); setOrderStep('products') }}
        />
      )}

      {/* ─── MODAL COMMANDE ─── */}
      {showOrder && selectedAmbiance && ambianceWithPalette && (
        <OrderModal
          ambiance={ambianceWithPalette}
          wedding={wedding}
          guests={guests}
          quantities={quantities}
          setQuantities={setQuantities}
          shipping={shipping}
          setShipping={setShipping}
          step={orderStep}
          setStep={setOrderStep}
          loading={loading}
          error={error}
          onClose={() => { setShowOrder(false); setError(null) }}
          onOrder={handleOrder}
        />
      )}
    </div>
  )
}

// ─── Step : Landing ───────────────────────────────────────────────────────────

function LandingStep({ onStart, wedding, guests }: {
  onStart: () => void
  wedding: Wedding
  guests: Guest[]
}) {
  const nomMaries = wedding.name || [wedding.bride_name, wedding.groom_name].filter(Boolean).join(' & ')

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Badge Studio */}
      <div className="flex justify-center mb-8">
        <span
          className="px-4 py-1.5 rounded-full text-xs tracking-widest uppercase"
          style={{ backgroundColor: '#4a5240', color: '#f5f0e8', fontWeight: 300, letterSpacing: '0.18em' }}
        >
          Studio créatif
        </span>
      </div>

      {/* Titre émotionnel */}
      <h1
        className="text-center text-[#2d3228] mb-4 leading-tight"
        style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3rem)' }}
      >
        Créez l&apos;univers visuel<br />de votre mariage
      </h1>
      <p
        className="text-center text-stone-500 mb-12 max-w-md mx-auto leading-relaxed"
        style={{ fontWeight: 300, fontSize: '0.95rem' }}
      >
        Une ambiance. Un style. Une collection complète — faire-parts, menus, marque-places — personnalisés avec vos noms, votre date, vos invités.
      </p>

      {/* Infos mariage */}
      {nomMaries && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-5 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#4a5240]/10 flex items-center justify-center text-xl shrink-0">
            💍
          </div>
          <div className="flex-1">
            <p className="text-[#2d3228]" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem', fontWeight: 500 }}>
              {nomMaries}
            </p>
            <p className="text-stone-400 text-xs mt-0.5" style={{ fontWeight: 300 }}>
              {[
                wedding.date ? new Date(wedding.date).toLocaleDateString(toDateLocale('fr'), { day: 'numeric', month: 'long', year: 'numeric' }) : null,
                wedding.location,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[#4a5240] text-sm" style={{ fontWeight: 400 }}>{guests.length}</p>
            <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>invités</p>
          </div>
        </div>
      )}

      {/* Ce que comprend la collection */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { icon: '💌', label: 'Faire-parts', desc: 'Adressés à chaque foyer' },
          { icon: '🍽️', label: 'Menus', desc: 'À chaque couvert' },
          { icon: '🎴', label: 'Marque-places', desc: 'Chaque nom, chaque table' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl border border-stone-100 p-4 text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="text-[#2d3228] text-xs font-medium" style={{ fontWeight: 400 }}>{item.label}</p>
            <p className="text-stone-400 text-xs mt-0.5" style={{ fontWeight: 300 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={onStart}
          className="px-10 py-4 rounded-2xl text-white text-sm transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
          style={{ backgroundColor: '#4a5240', fontWeight: 300, letterSpacing: '0.05em' }}
        >
          Choisir votre ambiance →
        </button>
        <p className="text-stone-400 text-xs mt-3" style={{ fontWeight: 300 }}>
          Aperçu gratuit · Livraison à domicile disponible
        </p>
      </div>
    </div>
  )
}

// ─── Step : Ambiances ─────────────────────────────────────────────────────────

function AmbianceStep({ onSelect, onBack }: {
  onSelect: (a: Ambiance) => void
  onBack: () => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-stone-400 text-sm mb-8 hover:text-[#4a5240] transition cursor-pointer" style={{ fontWeight: 300 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Retour
      </button>

      <h2
        className="text-[#2d3228] mb-2 leading-tight"
        style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.8rem' }}
      >
        Quelle ambiance voulez-vous faire ressentir ?
      </h2>
      <p className="text-stone-400 text-sm mb-8" style={{ fontWeight: 300 }}>
        Tout votre univers visuel en découlera — couleurs, typographies, papeterie complète.
      </p>

      <div className="space-y-3">
        {AMBIANCES.map(ambiance => (
          <AmbianceCard
            key={ambiance.id}
            ambiance={ambiance}
            hovered={hovered === ambiance.id}
            onHover={() => setHovered(ambiance.id)}
            onLeave={() => setHovered(null)}
            onSelect={() => onSelect(ambiance)}
          />
        ))}
      </div>
    </div>
  )
}

function AmbianceCard({ ambiance, hovered, onHover, onLeave, onSelect }: {
  ambiance: Ambiance
  hovered: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="w-full text-left bg-white rounded-2xl border border-stone-100 overflow-hidden transition-all cursor-pointer group"
      style={{
        boxShadow: hovered ? '0 8px 32px rgba(74,82,64,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
    >
      <div className="flex items-stretch">
        {/* Palette bande */}
        <div className="flex flex-col w-16 shrink-0">
          {ambiance.palette.map(color => (
            <div key={color.hex} className="flex-1 transition-all" style={{ backgroundColor: color.hex }} />
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{ambiance.emoji}</span>
                <h3 className="text-[#2d3228]" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem' }}>
                  {ambiance.name}
                </h3>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full hidden sm:block"
                  style={{ backgroundColor: ambiance.accent + '18', color: ambiance.accent, fontWeight: 500 }}
                >
                  {ambiance.tag}
                </span>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed mb-1" style={{ fontWeight: 300 }}>
                {ambiance.tagline}
              </p>
              <p className="text-stone-400 text-xs leading-relaxed hidden sm:block" style={{ fontWeight: 300 }}>
                {ambiance.description}
              </p>
            </div>

            {/* Arrow */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 transition-all"
              style={{ backgroundColor: hovered ? ambiance.accent : ambiance.accent + '15' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={hovered ? '#fff' : ambiance.accent} strokeWidth={2} className="w-4 h-4 transition-all">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Typo hint */}
          <div className="mt-3 pt-3 border-t border-stone-50 flex items-center gap-2">
            <span className="text-stone-300 text-xs" style={{ fontWeight: 300 }}>Typographie :</span>
            <span className="text-stone-500 text-xs" style={{ fontWeight: 300 }}>{ambiance.fontDisplay}</span>
            <span className="text-stone-300 text-xs">+</span>
            <span className="text-stone-500 text-xs" style={{ fontWeight: 300 }}>{ambiance.fontBody}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Step : Personnalisation ──────────────────────────────────────────────────

function PersonnalisationStep({ ambiance, ambianceWithPalette, palette, setPalette, typoPairs, selectedTypo, setSelectedTypo, wedding, onBack, onNext }: {
  ambiance: Ambiance
  ambianceWithPalette: Ambiance
  palette: string[]
  setPalette: (p: string[]) => void
  typoPairs: TypoPair[]
  selectedTypo: string
  setSelectedTypo: (id: string) => void
  wedding: Wedding
  onBack: () => void
  onNext: () => void
}) {
  function updateColor(i: number, hex: string) {
    const next = [...palette]
    next[i] = hex
    setPalette(next)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-stone-400 text-sm mb-8 hover:text-[#4a5240] transition cursor-pointer" style={{ fontWeight: 300 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Changer d&apos;ambiance
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">{ambiance.emoji}</span>
        <div>
          <h2 className="text-[#2d3228]" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.5rem' }}>
            {ambiance.name}
          </h2>
          <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>{ambiance.tagline}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Palette */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h3 className="text-[#4a5240] mb-1" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1rem' }}>
            Votre palette
          </h3>
          <p className="text-stone-400 text-xs mb-4" style={{ fontWeight: 300 }}>Cliquez sur une couleur pour l&apos;ajuster</p>
          <div className="space-y-3">
            {ambiance.palette.map((color, i) => (
              <div key={color.name} className="flex items-center gap-3">
                <label className="cursor-pointer relative">
                  <div
                    className="w-10 h-10 rounded-lg border border-stone-100 shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: palette[i] ?? color.hex }}
                  />
                  <input
                    type="color"
                    value={palette[i] ?? color.hex}
                    onChange={e => updateColor(i, e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </label>
                <div>
                  <p className="text-[#2d3228] text-xs" style={{ fontWeight: 400 }}>{color.name}</p>
                  <p className="text-stone-400 text-xs font-mono" style={{ fontWeight: 300 }}>{(palette[i] ?? color.hex).toUpperCase()}</p>
                </div>
                {palette[i] !== color.hex && (
                  <button
                    onClick={() => updateColor(i, color.hex)}
                    className="ml-auto text-xs text-stone-300 hover:text-stone-500 transition cursor-pointer"
                    style={{ fontWeight: 300 }}
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Preview bande couleurs */}
          <div className="mt-4 h-8 rounded-lg overflow-hidden flex">
            {palette.map((hex, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
            ))}
          </div>
        </div>

        {/* Typographie */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h3 className="text-[#4a5240] mb-1" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1rem' }}>
            Votre voix typographique
          </h3>
          <p className="text-stone-400 text-xs mb-4" style={{ fontWeight: 300 }}>Choisissez la paire qui vous ressemble</p>
          <div className="space-y-3">
            {typoPairs.map(pair => (
              <button
                key={pair.id}
                onClick={() => setSelectedTypo(pair.id)}
                className="w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer"
                style={{
                  borderColor: selectedTypo === pair.id ? ambianceWithPalette.accent : '#e7e5e4',
                  backgroundColor: selectedTypo === pair.id ? ambianceWithPalette.accent + '08' : 'transparent',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>{pair.label}</span>
                  {selectedTypo === pair.id && (
                    <svg viewBox="0 0 24 24" fill="none" stroke={ambianceWithPalette.accent} strokeWidth={2.5} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <p className="text-[#2d3228] text-lg leading-tight" style={{ fontFamily: 'var(--font-cormorant)', fontStyle: pair.id === 'b' ? 'italic' : 'normal', fontVariant: pair.display.includes('SC') ? 'small-caps' : 'normal' }}>
                  {pair.label}
                </p>
                <p className="text-stone-400 text-xs mt-1" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  Cormorant + Lato
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview mini faire-part */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-8">
        <p className="text-stone-400 text-xs mb-4" style={{ fontWeight: 300 }}>Aperçu de votre ambiance</p>
        <div className="h-48 max-w-xs mx-auto">
          <PreviewFairepart ambiance={ambianceWithPalette} wedding={wedding} fontDisplay={ambiance.fontDisplay} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-stone-400 text-sm hover:text-stone-600 transition cursor-pointer" style={{ fontWeight: 300 }}>
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-xl text-white text-sm transition-all hover:shadow-md cursor-pointer"
          style={{ backgroundColor: ambianceWithPalette.accent, fontWeight: 300 }}
        >
          Voir ma collection →
        </button>
      </div>
    </div>
  )
}

// ─── Step : Collection Preview ────────────────────────────────────────────────

// ─── Step : Sélection invités ────────────────────────────────────────────────

const COLS: { id: ProduitCol; label: string; icon: string; prixUnitaire: number; parFoyer?: boolean }[] = [
  { id: 'fairepart',    label: 'Faire-part',     icon: '💌', prixUnitaire: 2.50, parFoyer: true },
  { id: 'menu_adulte',  label: 'Menu adulte',    icon: '🍽️', prixUnitaire: 1.20 },
  { id: 'menu_enfant',  label: 'Menu enfant',    icon: '🧒', prixUnitaire: 0.90 },
  { id: 'marque_place', label: 'Marque-place',   icon: '🎴', prixUnitaire: 0.40 },
  { id: 'programme',    label: 'Programme',      icon: '📋', prixUnitaire: 1.00 },
  { id: 'plan_table',   label: 'Plan de table',  icon: '🗺️', prixUnitaire: 8.00 },
]

function SelectionStep({ ambiance, guests, selection, setSelection, weddingSlug, weddingId, onBack, onNext }: {
  ambiance: Ambiance
  guests: Guest[]
  selection: GuestSelection
  setSelection: (s: GuestSelection) => void
  weddingSlug: string
  weddingId: string
  onBack: () => void
  onNext: () => void
}) {
  const [filter, setFilter] = useState<'tous' | 'adultes' | 'enfants'>('tous')
  const [addingToBudget, setAddingToBudget] = useState(false)
  const [budgetDone, setBudgetDone] = useState(false)

  // Groupes foyers pour faire-parts (même nom de famille)
  const foyers = Object.entries(
    guests.reduce<Record<string, Guest[]>>((acc, g) => {
      const key = (g.last_name || g.id).toLowerCase()
      if (!acc[key]) acc[key] = []
      acc[key].push(g)
      return acc
    }, {})
  )

  const filteredGuests = guests.filter(g => {
    if (filter === 'adultes') return g.guest_type !== 'enfant'
    if (filter === 'enfants') return g.guest_type === 'enfant'
    return true
  })

  function toggle(guestId: string, col: ProduitCol) {
    setSelection({ ...selection, [guestId]: { ...selection[guestId], [col]: !selection[guestId]?.[col] } })
  }

  function toggleAll(col: ProduitCol) {
    const filtered = filteredGuests.map(g => g.id)
    const allChecked = filtered.every(id => selection[id]?.[col])
    const next = { ...selection }
    filtered.forEach(id => { next[id] = { ...next[id], [col]: !allChecked } })
    setSelection(next)
  }

  // Comptages
  function countCol(col: ProduitCol): number {
    if (col === 'fairepart') {
      // 1 par foyer dont au moins 1 invité coché
      return foyers.filter(([, members]) => members.some(m => selection[m.id]?.fairepart)).length
    }
    if (col === 'plan_table') return Object.values(selection).some(s => s.plan_table) ? 1 : 0
    return Object.values(selection).filter(s => s[col]).length
  }

  function totalEstime(): number {
    return COLS.reduce((sum, col) => sum + countCol(col.id) * col.prixUnitaire, 0)
  }

  async function addToBudget() {
    setAddingToBudget(true)
    try {
      await fetch('/api/studio/add-to-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingSlug, montant: totalEstime(), detail: COLS.map(c => `${c.icon} ${c.label}: ${countCol(c.id)} × ${c.prixUnitaire}€`).filter((_, i) => countCol(COLS[i].id) > 0).join(', ') }),
      })
      setBudgetDone(true)
    } catch { /* silencieux */ }
    setAddingToBudget(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-stone-400 text-sm mb-8 hover:text-[#4a5240] transition cursor-pointer" style={{ fontWeight: 300 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Retour au contenu
      </button>

      <h2 className="text-[#2d3228] mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.8rem' }}>
        Sélectionnez vos invités par produit
      </h2>
      <p className="text-stone-400 text-sm mb-6" style={{ fontWeight: 300 }}>
        Cochez qui reçoit quoi. Les faire-parts sont comptés par foyer (même nom de famille = 1 envoi).
      </p>

      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        {([['tous', 'Tous'], ['adultes', 'Adultes & ados'], ['enfants', 'Enfants']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className="px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
            style={{ backgroundColor: filter === val ? ambiance.accent : '#fff', color: filter === val ? '#fff' : '#78716c', border: `1px solid ${filter === val ? ambiance.accent : '#e7e5e4'}`, fontWeight: 300 }}>
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-stone-400 self-center" style={{ fontWeight: 300 }}>
          {filteredGuests.length} invité{filteredGuests.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: ambiance.accent + '10' }}>
                <th className="text-left px-4 py-3 text-[#2d3228]" style={{ fontWeight: 500, fontFamily: 'var(--font-lato)', minWidth: 160 }}>
                  Invité
                </th>
                <th className="px-3 py-2 text-center text-stone-400 text-xs" style={{ fontWeight: 300 }}>Table</th>
                {COLS.map(col => (
                  <th key={col.id} className="px-3 py-2 text-center" style={{ minWidth: 80 }}>
                    <button onClick={() => toggleAll(col.id)} className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition w-full" title="Tout sélectionner / désélectionner">
                      <span className="text-base">{col.icon}</span>
                      <span className="text-[10px] text-stone-500 leading-tight" style={{ fontWeight: 300 }}>{col.label}</span>
                      <span className="text-[10px] font-mono" style={{ color: ambiance.accent }}>{countCol(col.id)}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((g, i) => {
                const tableName = (g.table_guests?.[0]?.tables as {name:string}[]|null)?.[0]?.name ?? null
                const isEnfant = g.guest_type === 'enfant'
                return (
                  <tr key={g.id} className={`border-t border-stone-50 ${i % 2 === 0 ? '' : 'bg-stone-50/40'}`}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {isEnfant && <span className="text-xs">🧒</span>}
                        <span className="text-[#2d3228] text-sm" style={{ fontWeight: 300 }}>
                          {g.first_name} {g.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {tableName
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500" style={{ fontWeight: 300 }}>{tableName}</span>
                        : <span className="text-xs text-stone-300">—</span>
                      }
                    </td>
                    {COLS.map(col => (
                      <td key={col.id} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={!!selection[g.id]?.[col.id]}
                          onChange={() => toggle(g.id, col.id)}
                          className="w-4 h-4 rounded cursor-pointer"
                          style={{ accentColor: ambiance.accent }}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totaux + estimation */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6">
        <h3 className="text-[#4a5240] mb-3" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1rem' }}>
          Récapitulatif de votre commande
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {COLS.filter(col => countCol(col.id) > 0).map(col => (
            <div key={col.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
              <div>
                <p className="text-xs text-[#2d3228]" style={{ fontWeight: 400 }}>{col.icon} {col.label}</p>
                <p className="text-xs text-stone-400 mt-0.5" style={{ fontWeight: 300 }}>{col.prixUnitaire.toFixed(2).replace('.', ',')}€ / unité</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#2d3228]" style={{ fontWeight: 400 }}>× {countCol(col.id)}</p>
                <p className="text-xs" style={{ color: ambiance.accent, fontWeight: 400 }}>{(countCol(col.id) * col.prixUnitaire).toFixed(0)}€</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <p className="text-sm text-[#2d3228]" style={{ fontWeight: 400 }}>Estimation totale (hors livraison)</p>
          <p className="text-lg" style={{ color: ambiance.accent, fontWeight: 600, fontFamily: 'var(--font-cormorant)' }}>
            {totalEstime().toFixed(0)}€
          </p>
        </div>
        <p className="text-xs text-stone-400 mt-1" style={{ fontWeight: 300 }}>
          Prix indicatifs — papier standard. Le prix final est calculé au checkout selon le papier choisi.
        </p>
      </div>

      {/* Budget */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={addToBudget}
          disabled={addingToBudget || budgetDone}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition cursor-pointer disabled:opacity-50"
          style={{ borderColor: budgetDone ? '#4a5240' : '#e7e5e4', color: budgetDone ? '#4a5240' : '#78716c', fontWeight: 300 }}
        >
          {budgetDone ? '✓ Ajouté au budget' : addingToBudget ? 'Ajout...' : '+ Ajouter au budget'}
        </button>
        <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
          Crée une ligne &ldquo;Papeterie&rdquo; de {totalEstime().toFixed(0)}€ dans votre budget
        </p>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-stone-400 text-sm hover:text-stone-600 transition cursor-pointer" style={{ fontWeight: 300 }}>
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-xl text-white text-sm transition-all hover:shadow-md cursor-pointer"
          style={{ backgroundColor: ambiance.accent, fontWeight: 300 }}
        >
          Voir ma collection →
        </button>
      </div>
    </div>
  )
}

// ─── Step : Contenu ──────────────────────────────────────────────────────────

function ContenuStep({ ambiance, contenu, setContenu, onBack, onNext }: {
  ambiance: Ambiance
  contenu: ContenuDoc
  setContenu: (c: ContenuDoc) => void
  onBack: () => void
  onNext: () => void
}) {
  const [activeDoc, setActiveDoc] = useState<'fairepart' | 'menu' | 'programme' | 'marquePlaces' | 'numerosTable' | 'planTable'>('fairepart')

  const docs = [
    { id: 'fairepart' as const, icon: '💌', label: 'Faire-part' },
    { id: 'menu' as const, icon: '🍽️', label: 'Menu' },
    { id: 'programme' as const, icon: '📋', label: 'Programme' },
    { id: 'marquePlaces' as const, icon: '🎴', label: 'Marque-places' },
    { id: 'numerosTable' as const, icon: '🔢', label: 'Numéros de table' },
    { id: 'planTable' as const, icon: '🗺️', label: 'Plan de table' },
  ]

  function updateFairepart(field: keyof ContenuDoc['fairepart'], val: string) {
    setContenu({ ...contenu, fairepart: { ...contenu.fairepart, [field]: val } })
  }
  function updateMenuSection(i: number, field: keyof MenuSection, val: string) {
    const sections = contenu.menu.sections.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
    setContenu({ ...contenu, menu: { sections } })
  }
  function addMenuSection() {
    setContenu({ ...contenu, menu: { sections: [...contenu.menu.sections, { titre: 'Nouvelle section', plats: '' }] } })
  }
  function removeMenuSection(i: number) {
    setContenu({ ...contenu, menu: { sections: contenu.menu.sections.filter((_, idx) => idx !== i) } })
  }
  function updateEtape(i: number, field: keyof EtapeProgramme, val: string) {
    const etapes = contenu.programme.etapes.map((e, idx) => idx === i ? { ...e, [field]: val } : e)
    setContenu({ ...contenu, programme: { etapes } })
  }
  function addEtape() {
    setContenu({ ...contenu, programme: { etapes: [...contenu.programme.etapes, { heure: '', titre: '' }] } })
  }
  function removeEtape(i: number) {
    setContenu({ ...contenu, programme: { etapes: contenu.programme.etapes.filter((_, idx) => idx !== i) } })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-stone-400 text-sm mb-8 hover:text-[#4a5240] transition cursor-pointer" style={{ fontWeight: 300 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Retour au style
      </button>

      <h2 className="text-[#2d3228] mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.8rem' }}>
        Personnalisez votre contenu
      </h2>
      <p className="text-stone-400 text-sm mb-6" style={{ fontWeight: 300 }}>
        Modifiez les textes de chaque élément de votre collection.
      </p>

      {/* Onglets docs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {docs.map(doc => (
          <button
            key={doc.id}
            onClick={() => setActiveDoc(doc.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition cursor-pointer"
            style={{
              backgroundColor: activeDoc === doc.id ? ambiance.accent : '#fff',
              color: activeDoc === doc.id ? '#fff' : '#78716c',
              border: `1px solid ${activeDoc === doc.id ? ambiance.accent : '#e7e5e4'}`,
              fontWeight: 300,
            }}
          >
            {doc.icon} {doc.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6">

        {/* ─ Faire-part ─ */}
        {activeDoc === 'fairepart' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1" style={{ fontWeight: 300 }}>Noms des mariés</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-[#2d3228] focus:outline-none focus:border-[#4a5240] transition"
                value={contenu.fairepart.nomMaries}
                onChange={e => updateFairepart('nomMaries', e.target.value)}
                style={{ fontWeight: 300 }}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1" style={{ fontWeight: 300 }}>Message d&apos;invitation</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-[#2d3228] focus:outline-none focus:border-[#4a5240] transition resize-none"
                value={contenu.fairepart.message}
                onChange={e => updateFairepart('message', e.target.value)}
                style={{ fontWeight: 300 }}
              />
              <p className="text-xs text-stone-300 mt-1" style={{ fontWeight: 300 }}>{contenu.fairepart.message.length} caractères</p>
            </div>
          </div>
        )}

        {/* ─ Menu ─ */}
        {activeDoc === 'menu' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-400 mb-2" style={{ fontWeight: 300 }}>Chaque section = un service du repas</p>
            {contenu.menu.sections.map((section, i) => (
              <div key={i} className="bg-stone-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-[#2d3228] focus:outline-none focus:border-[#4a5240] transition"
                    placeholder="Nom du service (ex: Entrée)"
                    value={section.titre}
                    onChange={e => updateMenuSection(i, 'titre', e.target.value)}
                    style={{ fontWeight: 400 }}
                  />
                  <button onClick={() => removeMenuSection(i)} className="text-stone-300 hover:text-red-400 transition cursor-pointer text-lg leading-none">×</button>
                </div>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-stone-500 focus:outline-none focus:border-[#4a5240] transition"
                  placeholder="Description du plat..."
                  value={section.plats}
                  onChange={e => updateMenuSection(i, 'plats', e.target.value)}
                  style={{ fontWeight: 300 }}
                />
              </div>
            ))}
            <button
              onClick={addMenuSection}
              className="w-full py-2.5 rounded-xl border border-dashed border-stone-300 text-stone-400 text-sm hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer"
              style={{ fontWeight: 300 }}
            >
              + Ajouter un service
            </button>
          </div>
        )}

        {/* ─ Programme ─ */}
        {activeDoc === 'programme' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-400 mb-2" style={{ fontWeight: 300 }}>Déroulé de la journée</p>
            {contenu.programme.etapes.map((etape, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  className="w-20 px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-[#2d3228] focus:outline-none focus:border-[#4a5240] transition text-center"
                  placeholder="14h00"
                  value={etape.heure}
                  onChange={e => updateEtape(i, 'heure', e.target.value)}
                  style={{ fontWeight: 300 }}
                />
                <input
                  className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-[#2d3228] focus:outline-none focus:border-[#4a5240] transition"
                  placeholder="Nom de l'étape"
                  value={etape.titre}
                  onChange={e => updateEtape(i, 'titre', e.target.value)}
                  style={{ fontWeight: 300 }}
                />
                <button onClick={() => removeEtape(i)} className="text-stone-300 hover:text-red-400 transition cursor-pointer text-lg leading-none shrink-0">×</button>
              </div>
            ))}
            <button
              onClick={addEtape}
              className="w-full py-2.5 rounded-xl border border-dashed border-stone-300 text-stone-400 text-sm hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer"
              style={{ fontWeight: 300 }}
            >
              + Ajouter une étape
            </button>
          </div>
        )}

        {/* ─ Marque-places ─ */}
        {activeDoc === 'marquePlaces' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-400 mb-4" style={{ fontWeight: 300 }}>Format du nom affiché sur chaque marque-place</p>
            {([
              { id: 'prenom_nom', label: 'Prénom Nom', example: 'Sophie Martin' },
              { id: 'prenom', label: 'Prénom seul', example: 'Sophie' },
              { id: 'prenom_NOM', label: 'Prénom NOM (majuscules)', example: 'Sophie MARTIN' },
            ] as const).map(opt => (
              <button
                key={opt.id}
                onClick={() => setContenu({ ...contenu, marquePlaces: { format: opt.id } })}
                className="w-full flex items-center justify-between p-4 rounded-xl border transition cursor-pointer text-left"
                style={{
                  borderColor: contenu.marquePlaces.format === opt.id ? ambiance.accent : '#e7e5e4',
                  backgroundColor: contenu.marquePlaces.format === opt.id ? ambiance.accent + '08' : 'transparent',
                }}
              >
                <div>
                  <p className="text-sm text-[#2d3228]" style={{ fontWeight: 400 }}>{opt.label}</p>
                  <p className="text-xs text-stone-400 mt-0.5" style={{ fontWeight: 300 }}>Exemple : {opt.example}</p>
                </div>
                {contenu.marquePlaces.format === opt.id && (
                  <svg viewBox="0 0 24 24" fill="none" stroke={ambiance.accent} strokeWidth={2.5} className="w-4 h-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ─ Numéros de table ─ */}
        {activeDoc === 'numerosTable' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-400 mb-2" style={{ fontWeight: 300 }}>Format affiché sur chaque numéro de table</p>
            <div>
              <label className="block text-xs text-stone-500 mb-1" style={{ fontWeight: 300 }}>Préfixe (optionnel)</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-[#2d3228] focus:outline-none focus:border-[#4a5240] transition"
                placeholder="Table"
                value={contenu.numerosTable.prefixe}
                onChange={e => setContenu({ ...contenu, numerosTable: { prefixe: e.target.value } })}
                style={{ fontWeight: 300 }}
              />
              <p className="text-xs text-stone-300 mt-1" style={{ fontWeight: 300 }}>
                Résultat : &ldquo;{contenu.numerosTable.prefixe} 3&rdquo; ou &ldquo;{contenu.numerosTable.prefixe} Marguerite&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* ─ Plan de table ─ */}
        {activeDoc === 'planTable' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1" style={{ fontWeight: 300 }}>Titre de l&apos;affiche</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-[#2d3228] focus:outline-none focus:border-[#4a5240] transition"
                value={contenu.planTable.titre}
                onChange={e => setContenu({ ...contenu, planTable: { titre: e.target.value } })}
                style={{ fontWeight: 300 }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button onClick={onBack} className="text-stone-400 text-sm hover:text-stone-600 transition cursor-pointer" style={{ fontWeight: 300 }}>
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-xl text-white text-sm transition-all hover:shadow-md cursor-pointer"
          style={{ backgroundColor: ambiance.accent, fontWeight: 300 }}
        >
          Voir ma collection →
        </button>
      </div>
    </div>
  )
}

// ─── Step : Collection ────────────────────────────────────────────────────────

function CollectionStep({ ambiance, wedding, guests, contenu, onBack, onCommander }: {
  ambiance: Ambiance
  wedding: Wedding
  guests: Guest[]
  contenu: ContenuDoc
  onBack: () => void
  onCommander: () => void
}) {
  const exampleGuests = ['Sophie Martin', 'Jean Dupont', 'Marie Leblanc']

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-stone-400 text-sm mb-8 hover:text-[#4a5240] transition cursor-pointer" style={{ fontWeight: 300 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Personnaliser
      </button>

      {/* Header */}
      <h2
        className="text-[#2d3228] mb-2"
        style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.8rem' }}
      >
        Votre collection prend vie ✨
      </h2>
      <p className="text-stone-500 text-sm mb-8" style={{ fontWeight: 300 }}>
        Tout est déjà personnalisé avec vos données — {guests.length} invités, votre date, votre lieu.
      </p>

      {/* Grid previews */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Faire-part */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4">
          <p className="text-xs text-stone-400 mb-3 text-center" style={{ fontWeight: 300 }}>💌 Faire-part</p>
          <div className="h-64">
            <PreviewFairepart ambiance={ambiance} wedding={wedding} fontDisplay={ambiance.fontDisplay} contenu={contenu} />
          </div>
          <p className="text-xs text-center mt-3 text-stone-400" style={{ fontWeight: 300 }}>
            1 par foyer · {guests.length} invités
          </p>
        </div>

        {/* Marque-places */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4">
          <p className="text-xs text-stone-400 mb-3 text-center" style={{ fontWeight: 300 }}>🎴 Marque-places</p>
          <div className="space-y-3">
            {exampleGuests.map(name => (
              <div key={name} className="h-16">
                <PreviewMarquePlace ambiance={ambiance} name={name} />
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-3 text-stone-400" style={{ fontWeight: 300 }}>
            {guests.length} marque-places · noms auto
          </p>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4">
          <p className="text-xs text-stone-400 mb-3 text-center" style={{ fontWeight: 300 }}>🍽️ Menu</p>
          <div className="h-64">
            <PreviewMenu ambiance={ambiance} wedding={wedding} contenu={contenu} />
          </div>
          <p className="text-xs text-center mt-3 text-stone-400" style={{ fontWeight: 300 }}>
            Format A5 · papier 300g
          </p>
        </div>
      </div>

      {/* Ambiance badge */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center gap-3"
        style={{ backgroundColor: ambiance.accent + '12' }}
      >
        <span className="text-2xl">{ambiance.emoji}</span>
        <div>
          <p className="text-sm" style={{ color: ambiance.accent, fontWeight: 500 }}>{ambiance.name}</p>
          <p className="text-xs text-stone-500" style={{ fontWeight: 300 }}>{ambiance.tagline}</p>
        </div>
        <button
          onClick={onBack}
          className="ml-auto text-xs transition cursor-pointer"
          style={{ color: ambiance.accent, fontWeight: 300 }}
        >
          Modifier
        </button>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <h3
          className="text-[#2d3228] mb-1"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem' }}
        >
          Recevoir votre collection
        </h3>
        <p className="text-stone-400 text-xs mb-4" style={{ fontWeight: 300 }}>
          Imprimé par nos ateliers partenaires · livraison chez vous · délai 5-8 jours ouvrés
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Faire-parts', qty: Math.max(guests.length, 10), price: `${(Math.max(guests.length,10) * 2.5).toFixed(0)}€` },
            { label: 'Menus', qty: Math.max(guests.length, 10), price: `${(Math.max(guests.length,10) * 1.2).toFixed(0)}€` },
            { label: 'Marque-places', qty: guests.length, price: `${(guests.length * 0.4).toFixed(0)}€` },
          ].map(item => (
            <div key={item.label} className="text-center p-3 rounded-xl bg-stone-50">
              <p className="text-[#2d3228] text-xs" style={{ fontWeight: 400 }}>{item.label}</p>
              <p className="text-stone-400 text-xs mt-0.5" style={{ fontWeight: 300 }}>{item.qty} unités</p>
              <p className="text-[#4a5240] text-sm mt-1" style={{ fontWeight: 400 }}>~{item.price}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onCommander}
          className="w-full py-4 rounded-xl text-white text-sm transition-all hover:shadow-lg cursor-pointer"
          style={{ backgroundColor: ambiance.accent, fontWeight: 300 }}
        >
          Matérialiser ma collection →
        </button>
        <p className="text-center text-xs text-stone-400 mt-2" style={{ fontWeight: 300 }}>
          Paiement sécurisé · satisfait ou remboursé 14 jours
        </p>
      </div>
    </div>
  )
}

// ─── Modal Commande (Gelato) ──────────────────────────────────────────────────

function OrderModal({ ambiance, wedding, guests, quantities, setQuantities, shipping, setShipping, step, setStep, loading, error, onClose, onOrder }: {
  ambiance: Ambiance
  wedding: Wedding
  guests: Guest[]
  quantities: Quantities
  setQuantities: (q: Quantities) => void
  shipping: ShippingForm
  setShipping: (s: ShippingForm) => void
  step: 'products' | 'shipping' | 'confirm'
  setStep: (s: 'products' | 'shipping' | 'confirm') => void
  loading: boolean
  error: string | null
  onClose: () => void
  onOrder: () => void
}) {
  const hasProducts = quantities.menus + quantities.marquePlaces + quantities.fairesParts > 0
  const shippingValid = shipping.firstName.trim() && shipping.lastName.trim() && shipping.addressLine1.trim() && shipping.city.trim() && shipping.postCode.trim() && shipping.email.trim()
  const nomMaries = wedding.name || [wedding.bride_name, wedding.groom_name].filter(Boolean).join(' & ')
  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString(toDateLocale('fr'), { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <span className="text-xl">{ambiance.emoji}</span>
            <div>
              <p className="text-xs text-stone-400 mb-0.5" style={{ fontWeight: 300 }}>Votre collection</p>
              <h2 className="text-[#2d3228]" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem' }}>
                {ambiance.name}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center px-6 py-3 border-b border-stone-50 gap-2">
          {(['products', 'shipping', 'confirm'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-6 h-px bg-stone-200" />}
              <div className="flex items-center gap-1.5">
                <span
                  className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: step === s ? ambiance.accent : i < (['products', 'shipping', 'confirm'] as const).indexOf(step) ? ambiance.accent + '30' : '#f5f5f4',
                    color: step === s ? '#fff' : i < (['products', 'shipping', 'confirm'] as const).indexOf(step) ? ambiance.accent : '#a8a29e',
                    fontWeight: 500,
                  }}
                >
                  {i + 1}
                </span>
                <span className={`text-xs hidden sm:block`} style={{ fontWeight: 300, color: step === s ? ambiance.accent : '#a8a29e' }}>
                  {s === 'products' ? 'Produits' : s === 'shipping' ? 'Livraison' : 'Récapitulatif'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {step === 'products' && (
            <div className="space-y-4">
              {/* Données auto */}
              <div className="rounded-xl p-4" style={{ backgroundColor: ambiance.accent + '0d' }}>
                <p className="text-xs font-medium mb-2" style={{ color: ambiance.accent, fontFamily: 'var(--font-cormorant)', fontSize: '0.9rem' }}>
                  Données injectées automatiquement
                </p>
                <div className="space-y-1">
                  {[
                    { label: 'Noms', value: nomMaries || '—' },
                    { label: 'Date', value: dateFormatted || 'Non renseignée' },
                    { label: 'Lieu', value: wedding.location || 'Non renseigné' },
                    { label: 'Invités', value: `${guests.length} personnes (noms + tables)` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-xs">
                      <span className="text-stone-500" style={{ fontWeight: 300 }}>{item.label}</span>
                      <span className="text-[#2d3228]" style={{ fontWeight: 400 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Produits */}
              {PRODUITS.map(product => (
                <div key={product.key} className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{product.icon}</span>
                      <div>
                        <p className="text-[#2d3228] text-sm" style={{ fontWeight: 400 }}>{product.label}</p>
                        <p className="text-stone-400 text-xs mt-0.5" style={{ fontWeight: 300 }}>{product.desc}</p>
                        <p className="text-xs mt-0.5" style={{ color: ambiance.accent, fontWeight: 400 }}>{product.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setQuantities({ ...quantities, [product.key]: Math.max(0, quantities[product.key] - (product.key === 'marquePlaces' ? 1 : 10)) })}
                        className="w-7 h-7 rounded-full bg-white border border-stone-200 text-stone-500 flex items-center justify-center hover:bg-stone-100 transition text-sm cursor-pointer"
                      >−</button>
                      <span className="w-10 text-center text-sm text-[#2d3228]" style={{ fontWeight: 400 }}>{quantities[product.key]}</span>
                      <button
                        onClick={() => setQuantities({ ...quantities, [product.key]: quantities[product.key] + (product.key === 'marquePlaces' ? 1 : 10) })}
                        className="w-7 h-7 rounded-full bg-white border border-stone-200 text-stone-500 flex items-center justify-center hover:bg-stone-100 transition text-sm cursor-pointer"
                      >+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'shipping' && (
            <div className="space-y-3">
              <p className="text-stone-500 text-xs mb-4" style={{ fontWeight: 300 }}>Adresse de livraison</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Prénom" value={shipping.firstName} onChange={v => setShipping({ ...shipping, firstName: v })} />
                <FormField label="Nom" value={shipping.lastName} onChange={v => setShipping({ ...shipping, lastName: v })} />
              </div>
              <FormField label="Adresse" value={shipping.addressLine1} onChange={v => setShipping({ ...shipping, addressLine1: v })} />
              <FormField label="Complément (optionnel)" value={shipping.addressLine2} onChange={v => setShipping({ ...shipping, addressLine2: v })} />
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Code postal" value={shipping.postCode} onChange={v => setShipping({ ...shipping, postCode: v })} />
                <FormField label="Ville" value={shipping.city} onChange={v => setShipping({ ...shipping, city: v })} />
              </div>
              <FormField label="Email de confirmation" type="email" value={shipping.email} onChange={v => setShipping({ ...shipping, email: v })} />
              <FormField label="Téléphone (optionnel)" type="tel" value={shipping.phone} onChange={v => setShipping({ ...shipping, phone: v })} />
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="rounded-xl p-4" style={{ backgroundColor: ambiance.accent + '0d' }}>
                <p className="text-xs font-medium mb-3" style={{ color: ambiance.accent, fontFamily: 'var(--font-cormorant)', fontSize: '0.9rem' }}>
                  Votre commande
                </p>
                {PRODUITS.filter(p => quantities[p.key] > 0).map(product => {
                  const unitPrice = parseFloat(product.price.replace('~','').replace('€','').replace(',','.'))
                  const lineTotal = (unitPrice * quantities[product.key]).toFixed(0)
                  return (
                    <div key={product.key} className="flex justify-between items-center py-1.5 border-b border-stone-200/40 last:border-0">
                      <span className="text-sm text-stone-600" style={{ fontWeight: 300 }}>{product.icon} {product.label} × {quantities[product.key]}</span>
                      <span className="text-sm text-[#2d3228]" style={{ fontWeight: 400 }}>~{lineTotal}€</span>
                    </div>
                  )
                })}
                {(() => {
                  const total = PRODUITS.filter(p => quantities[p.key] > 0).reduce((sum, p) => {
                    const u = parseFloat(p.price.replace('~','').replace('€','').replace(',','.'))
                    return sum + u * quantities[p.key]
                  }, 0)
                  return (
                    <div className="flex justify-between items-center pt-2 mt-1">
                      <span className="text-sm text-[#2d3228]" style={{ fontWeight: 500 }}>Estimation totale</span>
                      <span className="text-sm" style={{ color: ambiance.accent, fontWeight: 600 }}>~{total.toFixed(0)}€</span>
                    </div>
                  )
                })()}
              </div>
              <div className="bg-stone-50 rounded-xl p-4 text-xs text-stone-500" style={{ fontWeight: 300 }}>
                <p className="font-medium text-stone-600 mb-1">Livraison à</p>
                <p>{shipping.firstName} {shipping.lastName}</p>
                <p>{shipping.addressLine1}</p>
                {shipping.addressLine2 && <p>{shipping.addressLine2}</p>}
                <p>{shipping.postCode} {shipping.city}</p>
                <p className="mt-1">{shipping.email}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700" style={{ fontWeight: 300 }}>
                <p className="font-medium mb-1">💳 Paiement sécurisé via Gelato</p>
                <p>Vous serez redirigé vers le checkout Gelato pour finaliser et choisir vos options de livraison.</p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-600">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 px-6 py-4 flex items-center justify-between gap-3">
          {step === 'products' ? (
            <>
              <button onClick={onClose} className="text-sm text-stone-400 hover:text-stone-600 transition cursor-pointer" style={{ fontWeight: 300 }}>Annuler</button>
              <button
                onClick={() => setStep('shipping')}
                disabled={!hasProducts}
                className="px-5 py-2.5 rounded-xl text-sm text-white transition cursor-pointer disabled:opacity-40"
                style={{ backgroundColor: hasProducts ? ambiance.accent : '#9caa94', fontWeight: 300 }}
              >
                Continuer →
              </button>
            </>
          ) : step === 'shipping' ? (
            <>
              <button onClick={() => setStep('products')} className="text-sm text-stone-400 hover:text-stone-600 transition cursor-pointer" style={{ fontWeight: 300 }}>← Retour</button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!shippingValid}
                className="px-5 py-2.5 rounded-xl text-sm text-white transition cursor-pointer disabled:opacity-40"
                style={{ backgroundColor: shippingValid ? ambiance.accent : '#9caa94', fontWeight: 300 }}
              >
                Vérifier →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep('shipping')} className="text-sm text-stone-400 hover:text-stone-600 transition cursor-pointer" style={{ fontWeight: 300 }}>← Retour</button>
              <button
                onClick={onOrder}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm text-white transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
                style={{ backgroundColor: ambiance.accent, fontWeight: 300 }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                    </svg>
                    Envoi en cours…
                  </>
                ) : '💳 Commander via Gelato'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Form field ───────────────────────────────────────────────────────────────

function FormField({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div>
      <label className="block text-xs text-stone-500 mb-1" style={{ fontWeight: 300 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-[#2d3228] focus:outline-none focus:border-[#4a5240] transition"
        style={{ fontWeight: 300 }}
      />
    </div>
  )
}
