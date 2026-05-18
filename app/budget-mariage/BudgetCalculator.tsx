'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'

const BODY = 'var(--font-lato)'
const GREEN = '#4a5240'
const GREEN_DARK = '#2d3228'

type ItemType = 'fixe' | 'par_invite' | 'pourcentage'
type Level = 'eco' | 'classique' | 'premium' | 'skip'

interface LineItem {
  id: string
  emoji: string
  nom: string
  description: string
  type: ItemType
  actif: boolean
  conseil: string
  messageDesactivation: string
  niveaux: {
    eco: { label: string; base: number }
    classique: { label: string; base: number }
    premium: { label: string; base: number }
  }
  feature?: { label: string; href: string }
  horsTotal?: boolean
}

const lineItems: LineItem[] = [
  {
    id: 'venue', emoji: '🏛️', nom: 'Lieu de réception',
    description: 'Location salle, château, domaine, parc',
    type: 'fixe', actif: true,
    conseil: "Vérifiez ce qui est inclus : tables, chaises, cuisine, sono... ça change tout au prix final !",
    messageDesactivation: "Vous recevez chez vous ou dans la famille ? Parfait, ce poste passe à 0 € 🏡",
    niveaux: {
      eco: { label: 'Salle municipale / gîte', base: 800 },
      classique: { label: 'Domaine / propriété', base: 4000 },
      premium: { label: 'Château / lieu prestige', base: 10000 },
    },
    feature: { label: '✨ Plan de table sur Kaatch', href: '/fonctionnalites/plan-de-table' },
  },
  {
    id: 'catering', emoji: '🍽️', nom: 'Traiteur & repas',
    description: 'Cocktail, dîner, brunch lendemain',
    type: 'par_invite', actif: true,
    conseil: "En moyenne : 100 €/invité pour un repas assis classique. À Paris, comptez +20-30 %.",
    messageDesactivation: "Vous gérez vous-même la restauration ? Chapeau ! 🙌",
    niveaux: {
      eco: { label: 'Buffet / food truck', base: 40 },
      classique: { label: 'Repas assis traiteur', base: 100 },
      premium: { label: 'Gastronomique / chef', base: 150 },
    },
  },
  {
    id: 'drinks', emoji: '🍾', nom: 'Boissons & alcool',
    description: 'Vins, champagne, bar, softs',
    type: 'par_invite', actif: true,
    conseil: "Vérifiez si votre traiteur inclut les boissons. Sinon, achetez direct en cave pour économiser !",
    messageDesactivation: "Inclus dans le traiteur ? Pensez à le vérifier dans votre contrat ✅",
    niveaux: {
      eco: { label: 'Vin & softs achat direct', base: 18 },
      classique: { label: 'Bar classique (vin, bière, softs)', base: 28 },
      premium: { label: 'Open bar + cocktails', base: 50 },
    },
  },
  {
    id: 'cake', emoji: '🎂', nom: 'Wedding cake & desserts',
    description: 'Pièce montée, candy bar, dessert',
    type: 'par_invite', actif: true,
    conseil: "La pièce montée classique reste la plus économique. Le wedding cake sur mesure, c'est beau mais comptez 10-20 €/pers.",
    messageDesactivation: "",
    niveaux: {
      eco: { label: 'Pièce montée boulangerie', base: 4 },
      classique: { label: 'Wedding cake pâtissier', base: 8 },
      premium: { label: 'Cake artiste + candy bar', base: 18 },
    },
  },
  {
    id: 'photographer', emoji: '📸', nom: 'Photo & vidéo',
    description: 'Photographe, vidéaste, drone, album',
    type: 'fixe', actif: true,
    conseil: "Le photographe, c'est ce qui reste quand la fête est terminée. À ne pas sacrifier !",
    messageDesactivation: "Un proche s'en charge ? Pensez quand même à briefer plusieurs personnes avec des smartphones 📱",
    niveaux: {
      eco: { label: 'Photographe junior / étudiant', base: 900 },
      classique: { label: 'Photographe pro', base: 2000 },
      premium: { label: 'Photo + vidéo + drone', base: 5500 },
    },
    feature: { label: '✨ Album partagé invités', href: '/fonctionnalites/album-photo' },
  },
  {
    id: 'dj', emoji: '🎵', nom: 'Animation & musique',
    description: 'DJ, groupe, cérémonie laïque, animations',
    type: 'fixe', actif: true,
    conseil: "N'oubliez pas la cérémonie laïque si vous en prévoyez une (officiant : 400-1 500 €)",
    messageDesactivation: "Playlist Spotify et ambiance DIY, ça marche aussi très bien ! 🎶",
    niveaux: {
      eco: { label: 'DJ amateur / sono DIY', base: 400 },
      classique: { label: 'DJ professionnel', base: 1200 },
      premium: { label: 'Groupe live + DJ soirée', base: 4000 },
    },
    feature: { label: '✨ Playlist collaborative', href: '/fonctionnalites/playlist-collaborative' },
  },
  {
    id: 'flowers', emoji: '💐', nom: 'Décoration & fleurs',
    description: 'Bouquets, centres de table, scénographie',
    type: 'fixe', actif: true,
    conseil: "Pensez à : bouquet mariée, boutonnière, arche cérémonie, centres de table, chemin de table, pétales...",
    messageDesactivation: "",
    niveaux: {
      eco: { label: 'DIY + fleurs marché', base: 500 },
      classique: { label: 'Fleuriste classique', base: 1700 },
      premium: { label: 'Scénographe floral', base: 5000 },
    },
  },
  {
    id: 'dress_bride', emoji: '👗', nom: 'Tenue de la mariée',
    description: 'Robe, chaussures, accessoires, retouches',
    type: 'fixe', actif: true,
    conseil: "N'oubliez pas les retouches (+100-400 €) et les accessoires : voile, chaussures, bijoux...",
    messageDesactivation: "",
    niveaux: {
      eco: { label: 'Robe seconde main / location', base: 400 },
      classique: { label: 'Boutique mariage', base: 1800 },
      premium: { label: 'Créateur / sur mesure', base: 4000 },
    },
  },
  {
    id: 'dress_groom', emoji: '🤵', nom: 'Tenue du marié',
    description: 'Costume, chaussures, accessoires',
    type: 'fixe', actif: true,
    conseil: "Location = 150-400 €. Achat = conservez-le pour d'autres occasions !",
    messageDesactivation: "",
    niveaux: {
      eco: { label: 'Location costume', base: 250 },
      classique: { label: 'Costume prêt-à-porter', base: 600 },
      premium: { label: 'Sur mesure / smoking', base: 2000 },
    },
  },
  {
    id: 'rings', emoji: '💍', nom: 'Alliances & bijoux',
    description: 'Alliances, bijoux du jour J',
    type: 'fixe', actif: true,
    conseil: "Prix pour LA PAIRE d'alliances. Comptez 500-1 500 € pour de l'or classique.",
    messageDesactivation: "",
    niveaux: {
      eco: { label: 'Argent / plaqué or', base: 350 },
      classique: { label: 'Or classique', base: 1000 },
      premium: { label: 'Or + diamants / sur mesure', base: 3000 },
    },
  },
  {
    id: 'beauty', emoji: '💄', nom: 'Beauté',
    description: 'Coiffure, maquillage, manucure, essais',
    type: 'fixe', actif: true,
    conseil: "Prévoyez les essais (souvent payants) et le déplacement à domicile le jour J (supplément fréquent) !",
    messageDesactivation: "",
    niveaux: {
      eco: { label: 'Coiffure OU maquillage', base: 220 },
      classique: { label: 'Coiffure + maquillage + essais', base: 700 },
      premium: { label: 'Équipe beauté complète', base: 1400 },
    },
  },
  {
    id: 'stationery', emoji: '✉️', nom: 'Papeterie & faire-part',
    description: 'Faire-part, save the date, menus, plan de table',
    type: 'par_invite', actif: true,
    conseil: "Timbres : 1,16 €/lettre. N'oubliez pas menus, plan de table, marque-places, livre d'or !",
    messageDesactivation: "Envoi digital uniquement ? Pratique et écolo ! 🌱",
    niveaux: {
      eco: { label: 'Digital + impressions simples', base: 2 },
      classique: { label: 'Faire-part imprimé + menus', base: 6 },
      premium: { label: 'Papeterie créateur sur mesure', base: 12 },
    },
    feature: { label: '✨ Faire-part animés Kaatch', href: '/fonctionnalites/faire-part-rsvp' },
  },
  {
    id: 'gifts', emoji: '🎁', nom: 'Cadeaux & dragées',
    description: 'Invités, témoins, parents',
    type: 'par_invite', actif: true,
    conseil: "Ajoutez ~300 € pour les cadeaux témoins (2-6 pers.) et parents (souvent oubliés dans le budget !)",
    messageDesactivation: "",
    niveaux: {
      eco: { label: 'Dragées classiques', base: 3 },
      classique: { label: 'Dragées + emballage soigné', base: 6 },
      premium: { label: 'Cadeau personnalisé', base: 12 },
    },
  },
  {
    id: 'transport', emoji: '🚗', nom: 'Transport & logistique',
    description: 'Voiture mariés, navettes invités, parking',
    type: 'fixe', actif: true,
    conseil: "Si votre lieu est isolé, les navettes invités sont souvent indispensables (et très appréciées !)",
    messageDesactivation: "",
    niveaux: {
      eco: { label: 'Voiture décorée (proche)', base: 100 },
      classique: { label: 'Location voiture + navettes', base: 1200 },
      premium: { label: 'Voiture prestige + navettes', base: 2500 },
    },
  },
  {
    id: 'accommodation', emoji: '🏨', nom: 'Hébergement',
    description: 'Nuit mariés, chambres invités/famille',
    type: 'fixe', actif: true,
    conseil: "Beaucoup de lieux incluent la nuit des mariés. Vérifiez votre contrat !",
    messageDesactivation: "Nuit incluse dans le lieu ? Super, économie directe ! 🎉",
    niveaux: {
      eco: { label: "Chambre d'hôtel classique", base: 200 },
      classique: { label: 'Suite + quelques chambres famille', base: 800 },
      premium: { label: 'Bloc hôtel / gîte entier', base: 2000 },
    },
    feature: { label: '✨ Espace invités Kaatch', href: '/fonctionnalites/espace-invites' },
  },
  {
    id: 'kids', emoji: '👶', nom: 'Enfants',
    description: 'Vêtements, baby-sitter, menus spécifiques',
    type: 'fixe', actif: false,
    conseil: "Un espace kids bien pensé = des parents qui profitent vraiment de la soirée 🙌",
    messageDesactivation: "Pas d'enfants invités ? Très bien aussi ! 😄",
    niveaux: {
      eco: { label: 'Menus enfants uniquement', base: 200 },
      classique: { label: 'Menus + baby-sitter', base: 500 },
      premium: { label: 'Menus + animateur + espace kids', base: 1000 },
    },
  },
  {
    id: 'admin', emoji: '📜', nom: 'Administratif & impressions',
    description: 'Frais de dossier, impressions, officiant',
    type: 'fixe', actif: true,
    conseil: "Le dossier mairie est GRATUIT. La grosse dépense ici : l'officiant laïque si cérémonie civile + religieuse.",
    messageDesactivation: "",
    niveaux: {
      eco: { label: 'Impressions basiques', base: 100 },
      classique: { label: 'Impressions + signalétique', base: 300 },
      premium: { label: 'Officiant laïque + tout compris', base: 1500 },
    },
  },
  {
    id: 'honeymoon', emoji: '🌴', nom: 'Voyage de noces',
    description: 'Destination, hôtel, vols',
    type: 'fixe', actif: false, horsTotal: true,
    conseil: "Ce montant est HORS budget mariage. On l'affiche séparément pour votre vision globale.",
    messageDesactivation: "Voyage reporté ? Vous avez toute la vie pour ça ! 💛",
    niveaux: {
      eco: { label: 'France / Europe 1 semaine', base: 2000 },
      classique: { label: 'Long-courrier (Maroc, Thaïlande...)', base: 4000 },
      premium: { label: 'Maldives / Bali / Caraïbes', base: 8000 },
    },
  },
  {
    id: 'contingency', emoji: '🎲', nom: 'Divers & imprévus',
    description: 'Parapluies, médicaments, trousse de secours, imprévus divers',
    type: 'pourcentage', actif: true,
    conseil: "En moyenne, les mariés dépensent 7 % de plus que prévu. Mieux vaut l'anticiper que le subir !",
    messageDesactivation: "",
    niveaux: {
      eco: { label: 'Je suis très organisé(e) 😎', base: 5 },
      classique: { label: 'Soyons prudents 🙂', base: 8 },
      premium: { label: 'Je préfère dormir tranquille 😅', base: 12 },
    },
  },
]

const regions = [
  { value: '', label: 'Choisir une région...' },
  { value: 'paris', label: 'Paris & Île-de-France' },
  { value: 'provence', label: "Provence & Côte d'Azur" },
  { value: 'lyon', label: 'Lyon & Rhône-Alpes' },
  { value: 'toulouse', label: 'Toulouse' },
  { value: 'bordeaux', label: 'Bordeaux' },
  { value: 'autres', label: 'Autres régions' },
]

function getRegionMult(city: string) {
  if (city.includes('paris')) return 1.30
  if (['provence', 'alpes', 'azur'].some(r => city.includes(r))) return 1.18
  if (['lyon', 'toulouse', 'bordeaux'].some(c => city.includes(c))) return 1.12
  return 1.00
}

function getStyleMult(style: string) {
  return ({ intimate: 0.70, convivial: 1.00, grandiose: 1.50 } as Record<string, number>)[style] ?? 1.00
}

function styleToLevel(style: string): Level {
  if (style === 'intimate') return 'eco'
  if (style === 'convivial') return 'classique'
  return 'premium'
}

const levelLabels: Record<Level, string> = {
  eco: 'Économique',
  classique: 'Classique',
  premium: 'Premium',
  skip: '—',
}

const levelIcons: Record<string, string> = {
  eco: '€',
  classique: '€€',
  premium: '€€€',
}

const chartColors = ['#4a5240', '#78716c', '#d4cfc7', '#a89f99', '#c9a877', '#6b7461', '#9c8e77', '#5a6350', '#8a7c6b', '#b5a48e', '#3d4536', '#a8a29e', '#7c8572', '#c4b89c', '#505d44', '#8b8072', '#607055', '#b0a090', '#6a7560']

export default function BudgetCalculator() {
  const [guestCount, setGuestCount] = useState(100)
  const [city, setCity] = useState('')
  const [style, setStyle] = useState('intimate')
  const [selections, setSelections] = useState<Record<string, Level>>(
    Object.fromEntries(lineItems.map(i => [i.id, i.actif ? 'eco' : 'eco'])) as Record<string, Level>
  )
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(lineItems.map(i => [i.id, i.actif])) as Record<string, boolean>
  )
  const [customBudgets, setCustomBudgets] = useState<Record<string, number | null>>(
    Object.fromEntries(lineItems.map(i => [i.id, null])) as Record<string, number | null>
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [itemOrder, setItemOrder] = useState<string[]>(lineItems.map(i => i.id))
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)
  const segmentsRef = useRef<{ startAngle: number; endAngle: number }[]>([])

  const regionMult = useMemo(() => getRegionMult(city), [city])
  const styleMult = useMemo(() => getStyleMult(style), [style])

  const getAmount = useCallback((item: LineItem, subtotalForPercent?: number) => {
    if (!enabled[item.id]) return 0
    const sel = selections[item.id]
    if (sel === 'skip') return 0
    if (customBudgets[item.id] !== null) return customBudgets[item.id]!

    if (item.type === 'pourcentage') {
      const pct = item.niveaux[sel as 'eco' | 'classique' | 'premium'].base
      return Math.round((subtotalForPercent ?? 0) * pct / 100)
    }

    let amount = item.niveaux[sel as 'eco' | 'classique' | 'premium'].base
    if (item.type === 'par_invite') amount *= guestCount
    return Math.round(amount * regionMult * styleMult)
  }, [enabled, selections, customBudgets, guestCount, regionMult, styleMult])

  const subtotalBeforePercent = useMemo(() => {
    return lineItems
      .filter(item => !item.horsTotal && item.type !== 'pourcentage' && enabled[item.id] && selections[item.id] !== 'skip')
      .reduce((s, item) => s + getAmount(item), 0)
  }, [getAmount, enabled, selections])

  const orderedItems = useMemo(() => {
    const map = new Map(lineItems.map(i => [i.id, i]))
    return itemOrder.map(id => map.get(id)!).filter(Boolean)
  }, [itemOrder])
  const mainItems = orderedItems.filter(i => !i.horsTotal)
  const horsItems = orderedItems.filter(i => i.horsTotal)

  const handleDragStart = (id: string) => { setDragId(id); setExpandedId(null) }
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id) }
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
    setItemOrder(prev => {
      const next = [...prev]
      const fromIdx = next.indexOf(dragId)
      const toIdx = next.indexOf(targetId)
      next.splice(fromIdx, 1)
      next.splice(toIdx, 0, dragId)
      return next
    })
    setDragId(null)
    setDragOverId(null)
  }
  const handleDragEnd = () => { setDragId(null); setDragOverId(null) }

  const breakdown = useMemo(() => {
    return mainItems
      .filter(item => enabled[item.id] && selections[item.id] !== 'skip')
      .map(item => ({
        id: item.id,
        label: `${item.emoji} ${item.nom}`,
        amount: getAmount(item, subtotalBeforePercent),
      }))
      .filter(b => b.amount > 0)
  }, [getAmount, enabled, selections, subtotalBeforePercent, mainItems])

  const total = useMemo(() => breakdown.reduce((s, b) => s + b.amount, 0), [breakdown])
  const honeymoonAmount = useMemo(() => {
    const hm = horsItems[0]
    return hm ? getAmount(hm) : 0
  }, [getAmount, horsItems])

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || breakdown.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 220
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size, size)

    const cx = size / 2, cy = size / 2, r = 90, inner = 55
    let startAngle = -Math.PI / 2
    const segs: { startAngle: number; endAngle: number }[] = []

    breakdown.forEach((b, i) => {
      const slice = (b.amount / total) * Math.PI * 2
      const endAngle = startAngle + slice
      segs.push({ startAngle, endAngle })
      const isHovered = hoveredSlice === i
      const pop = isHovered ? 8 : 0
      const midAngle = startAngle + slice / 2
      const ox = Math.cos(midAngle) * pop
      const oy = Math.sin(midAngle) * pop

      ctx.beginPath()
      ctx.arc(cx + ox, cy + oy, isHovered ? r + 4 : r, startAngle, endAngle)
      ctx.arc(cx + ox, cy + oy, inner, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = chartColors[i % chartColors.length]
      ctx.globalAlpha = (hoveredSlice !== null && !isHovered) ? 0.45 : 1
      ctx.fill()
      ctx.globalAlpha = 1
      startAngle = endAngle
    })
    segmentsRef.current = segs
  }, [breakdown, total, hoveredSlice])

  const handleStyleChange = (newStyle: string) => {
    setStyle(newStyle)
    const level = styleToLevel(newStyle)
    setSelections(prev => {
      const next = { ...prev }
      for (const item of lineItems) {
        if (prev[item.id] !== 'skip') {
          next[item.id] = level
        }
      }
      return next
    })
    setCustomBudgets(Object.fromEntries(lineItems.map(i => [i.id, null])) as Record<string, number | null>)
  }

  const setLevel = (id: string, level: Level) => {
    setSelections(prev => ({ ...prev, [id]: level }))
    setCustomBudgets(prev => ({ ...prev, [id]: null }))
  }

  const toggleItem = (id: string) => {
    setEnabled(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const setCustom = (id: string, value: string) => {
    const num = parseFloat(value)
    setCustomBudgets(prev => ({ ...prev, [id]: isNaN(num) || num < 0 ? null : num }))
  }

  const handleCopy = () => {
    const text = `Mon mariage : ~${Math.round(total).toLocaleString()} € pour ${guestCount} invités (${Math.round(total / guestCount)} €/personne)`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    const text = `Mon mariage : ~${Math.round(total).toLocaleString()} € pour ${guestCount} invités via le simulateur Kaatch`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handlePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const w = doc.internal.pageSize.getWidth()
    let y = 20

    doc.setFontSize(22)
    doc.setTextColor(44, 59, 46)
    doc.text('Budget Mariage', w / 2, y, { align: 'center' })
    y += 12

    doc.setFontSize(11)
    doc.setTextColor(120, 113, 108)
    const region = regions.find(r => r.value === city)?.label ?? 'Non définie'
    doc.text(`${guestCount} invités  •  ${region}  •  Style ${style}`, w / 2, y, { align: 'center' })
    y += 14

    doc.setFillColor(245, 240, 232)
    doc.roundedRect(20, y, w - 40, 20, 3, 3, 'F')
    doc.setFontSize(16)
    doc.setTextColor(74, 82, 64)
    doc.text(`Total : ${Math.round(total).toLocaleString()} €`, w / 2, y + 13, { align: 'center' })
    y += 30

    doc.setFontSize(9)
    doc.setTextColor(120, 113, 108)
    doc.text('Poste', 22, y)
    doc.text('Niveau', 110, y)
    doc.text('Montant', w - 22, y, { align: 'right' })
    y += 2
    doc.setDrawColor(212, 207, 199)
    doc.line(20, y, w - 20, y)
    y += 6

    doc.setFontSize(10)
    breakdown.forEach(b => {
      const sel = selections[b.id]
      doc.setTextColor(45, 50, 40)
      doc.text(b.label, 22, y)
      doc.setTextColor(120, 113, 108)
      doc.text(levelLabels[sel] || '', 110, y)
      doc.setTextColor(74, 82, 64)
      doc.text(`${Math.round(b.amount).toLocaleString()} €`, w - 22, y, { align: 'right' })
      y += 7
      if (y > 270) { doc.addPage(); y = 20 }
    })

    y += 4
    doc.setDrawColor(74, 82, 64)
    doc.setLineWidth(0.5)
    doc.line(20, y, w - 20, y)
    y += 8
    doc.setFontSize(12)
    doc.setTextColor(74, 82, 64)
    doc.text(`Total : ${Math.round(total).toLocaleString()} €`, w - 22, y, { align: 'right' })
    doc.setFontSize(10)
    doc.setTextColor(120, 113, 108)
    doc.text(`≈ ${Math.round(total / guestCount)} € par invité`, 22, y)

    if (honeymoonAmount > 0) {
      y += 12
      doc.setFontSize(9)
      doc.setTextColor(168, 162, 153)
      doc.text(`+ Voyage de noces (hors total) : ${Math.round(honeymoonAmount).toLocaleString()} €`, 22, y)
    }

    y += 16
    doc.setFontSize(8)
    doc.setTextColor(168, 162, 153)
    doc.text('Estimation indicative — kaatch.fr', w / 2, y, { align: 'center' })

    doc.save('budget-mariage.pdf')
  }

  function renderRow(item: LineItem) {
    const isExpanded = expandedId === item.id
    const isEnabled = enabled[item.id]
    const sel = selections[item.id]
    const amount = item.type === 'pourcentage' ? getAmount(item, subtotalBeforePercent) : getAmount(item)
    const hasCustom = customBudgets[item.id] !== null

    return (
      <div
        key={item.id}
        draggable
        onDragStart={() => handleDragStart(item.id)}
        onDragOver={e => handleDragOver(e, item.id)}
        onDrop={() => handleDrop(item.id)}
        onDragEnd={handleDragEnd}
        className={`border-b border-stone-100 transition-all ${!isEnabled ? 'opacity-40' : ''} ${dragId === item.id ? 'opacity-30' : ''} ${dragOverId === item.id && dragId !== item.id ? 'border-t-2 border-t-[#4a5240]' : ''}`}
      >
        {/* Collapsed row */}
        <div
          className={`flex items-center gap-2 px-4 md:px-6 py-3.5 cursor-pointer transition hover:bg-stone-50/50 ${isExpanded ? 'bg-stone-50/50' : ''}`}
          onClick={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <span
            className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500 flex-shrink-0 select-none"
            onMouseDown={e => e.stopPropagation()}
            title="Glisser pour réordonner"
          >
            ⠿
          </span>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={e => { e.stopPropagation(); toggleItem(item.id) }}
            onClick={e => e.stopPropagation()}
            className="w-4 h-4 accent-[#4a5240] cursor-pointer flex-shrink-0"
          />
          <span className="text-lg flex-shrink-0">{item.emoji}</span>
          <span className="flex-1 text-sm" style={{ fontWeight: 400, color: GREEN_DARK }}>
            {item.nom}
          </span>
          {!isExpanded && isEnabled && sel !== 'skip' && (
            <span className="text-xs text-stone-400 hidden sm:inline">
              {hasCustom ? 'devis' : levelLabels[sel]}
            </span>
          )}
          {!isExpanded && !isEnabled && (
            <span className="text-xs text-stone-400 italic">désactivé</span>
          )}
          <span className="text-sm min-w-[70px] text-right" style={{ fontWeight: 400, color: isEnabled ? GREEN : '#a8a29e' }}>
            {isEnabled && sel !== 'skip' ? `${Math.round(amount).toLocaleString()} €` : '—'}
          </span>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path d="M4 6L8 10L12 6" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Expanded panel */}
        {isExpanded && (
          <div className="px-4 md:px-6 pb-5 pt-1 bg-[#faf8f3]">
            <p className="text-xs text-stone-400 mb-3">{item.description}</p>

            {/* Conseil */}
            {item.conseil && (
              <div className="flex gap-2 mb-4 bg-white rounded-lg px-3 py-2.5 border border-stone-100">
                <span className="text-sm flex-shrink-0">💡</span>
                <p className="text-xs text-stone-500 leading-relaxed">{item.conseil}</p>
              </div>
            )}

            {/* Message désactivation */}
            {!isEnabled && item.messageDesactivation && (
              <p className="text-xs text-stone-400 italic mb-3">{item.messageDesactivation}</p>
            )}

            {isEnabled && (
              <>
                {/* Level buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['eco', 'classique', 'premium'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setLevel(item.id, level)}
                      className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-lg border-2 transition text-left ${
                        sel === level && !hasCustom
                          ? 'border-[#4a5240] bg-white'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs text-stone-400">{levelIcons[level]}</span>
                        <span className="text-xs" style={{ fontWeight: 400, color: sel === level && !hasCustom ? GREEN : '#78716c' }}>
                          {levelLabels[level]}
                        </span>
                      </div>
                      <div className="text-[0.7rem] text-stone-400 leading-snug">{item.niveaux[level].label}</div>
                      <div className="text-xs mt-1" style={{ fontWeight: 400, color: GREEN }}>
                        {item.type === 'pourcentage'
                          ? `${item.niveaux[level].base} %`
                          : item.type === 'par_invite'
                            ? `${item.niveaux[level].base} €/invité`
                            : `${item.niveaux[level].base.toLocaleString()} €`
                        }
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                {item.type !== 'pourcentage' && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-stone-400">OU</span>
                    <span className="text-xs text-stone-500">✏️ J&apos;ai déjà un devis :</span>
                    <input
                      type="number"
                      placeholder="Montant"
                      value={customBudgets[item.id] !== null ? customBudgets[item.id]! : ''}
                      onChange={e => setCustom(item.id, e.target.value)}
                      className="w-28 px-3 py-1.5 border border-stone-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#4a5240] focus:border-transparent"
                      style={{ fontFamily: BODY, fontWeight: 300, color: GREEN }}
                    />
                    <span className="text-xs text-stone-400">€</span>
                    {hasCustom && (
                      <button
                        onClick={() => setCustomBudgets(prev => ({ ...prev, [item.id]: null }))}
                        className="text-xs text-stone-400 hover:text-stone-600 underline"
                      >
                        annuler
                      </button>
                    )}
                  </div>
                )}

                {/* Type info */}
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] text-stone-400">
                    {item.type === 'par_invite' && '✓ Calculé par invité'}
                    {item.type === 'fixe' && '✓ Prestataire à la journée'}
                    {item.type === 'pourcentage' && '✓ Pourcentage du budget total'}
                  </span>
                  <span className="text-sm" style={{ fontWeight: 400, color: GREEN }}>
                    {Math.round(amount).toLocaleString()} €
                  </span>
                </div>

                {/* Feature link */}
                {item.feature && (
                  <a
                    href={item.feature.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 px-3 py-1.5 bg-[rgba(74,82,64,0.1)] text-[#4a5240] text-xs rounded-full hover:bg-[rgba(74,82,64,0.2)] transition"
                    style={{ fontWeight: 400 }}
                  >
                    {item.feature.label}
                  </a>
                )}
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 md:p-10 mb-8" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <label className="block text-sm mb-3" style={{ fontFamily: BODY, fontWeight: 400, color: GREEN_DARK }}>
              Nombre d&apos;invités
            </label>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="number"
                min={1}
                max={500}
                value={guestCount}
                onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setGuestCount(v) }}
                className="w-20 text-2xl bg-transparent outline-none border border-stone-200 rounded-lg px-2 py-1 focus:border-[#4a5240] focus:ring-1 focus:ring-[#4a5240] transition cursor-text"
                style={{ fontFamily: BODY, fontWeight: 300, color: GREEN }}
              />
            </div>
            <input
              type="range"
              min={10}
              max={300}
              value={Math.min(guestCount, 300)}
              onChange={e => setGuestCount(parseInt(e.target.value))}
              className="w-full accent-[#4a5240]"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>10</span><span>300+</span>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-3" style={{ fontFamily: BODY, fontWeight: 400, color: GREEN_DARK }}>
              Région
            </label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5240] focus:border-transparent"
              style={{ fontFamily: BODY, fontWeight: 300 }}
            >
              {regions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-3" style={{ fontFamily: BODY, fontWeight: 400, color: GREEN_DARK }}>
              Style de mariage
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'intimate', emoji: '🌱', label: 'Intime' },
                { id: 'convivial', emoji: '💚', label: 'Convivial' },
                { id: 'grandiose', emoji: '✨', label: 'Grandiose' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => handleStyleChange(s.id)}
                  className={`p-3 rounded-xl border-2 transition text-center ${
                    style === s.id ? 'border-[#4a5240] bg-stone-50' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xl mb-1">{s.emoji}</div>
                  <div className="text-xs" style={{ fontWeight: 400 }}>{s.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main grid: accordion + summary */}
      <div className="grid lg:grid-cols-[70%_1fr] gap-8">
        {/* Accordion table */}
        <div>
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="px-6 md:px-10 pt-8 pb-4">
              <h2 className="text-xl" style={{ fontFamily: BODY, fontWeight: 400, color: GREEN_DARK }}>
                Détail des postes
              </h2>
            </div>
            {mainItems.map(item => renderRow(item))}
          </div>

          {/* Voyage de noces — séparé */}
          {horsItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-stone-300 overflow-hidden mt-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="px-6 pt-5 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm" style={{ fontWeight: 400, color: GREEN_DARK }}>Hors budget mariage</h3>
                  <span className="text-[0.65rem] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">Non inclus dans le total</span>
                </div>
              </div>
              {horsItems.map(item => renderRow(item))}
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="lg:sticky lg:top-5 h-fit">
          <div
            className="bg-gradient-to-br from-[#f5f0e8] to-white border-2 border-[#4a5240] rounded-2xl p-8"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div className="text-sm text-stone-500 mb-2">Budget total estimé</div>
            <div className="text-4xl mb-1" style={{ fontFamily: BODY, fontWeight: 300, color: GREEN }}>
              {Math.round(total).toLocaleString()} €
            </div>
            <div className="text-sm text-stone-600 mb-4 pb-4 border-b border-stone-200">
              ≈ <strong>{guestCount > 0 ? Math.round(total / guestCount) : 0} €</strong> par invité
            </div>

            {honeymoonAmount > 0 && (
              <div className="text-xs text-stone-400 mb-4 pb-4 border-b border-stone-200">
                + Voyage de noces : <strong className="text-stone-500">{Math.round(honeymoonAmount).toLocaleString()} €</strong>
                <span className="block mt-0.5 text-stone-400">(non inclus dans le total)</span>
              </div>
            )}

            <div className="flex justify-center mb-6 relative">
              <canvas
                ref={canvasRef}
                width={220}
                height={220}
                style={{ width: 220, height: 220, cursor: hoveredSlice !== null ? 'pointer' : 'default' }}
                onMouseMove={e => {
                  const rect = canvasRef.current!.getBoundingClientRect()
                  const x = e.clientX - rect.left - 110
                  const y = e.clientY - rect.top - 110
                  const dist = Math.sqrt(x * x + y * y)
                  if (dist < 55 || dist > 94) { setHoveredSlice(null); return }
                  let angle = Math.atan2(y, x)
                  if (angle < -Math.PI / 2) angle += Math.PI * 2
                  const idx = segmentsRef.current.findIndex(s => angle >= s.startAngle && angle < s.endAngle)
                  setHoveredSlice(idx >= 0 ? idx : null)
                }}
                onMouseLeave={() => setHoveredSlice(null)}
              />
              {hoveredSlice !== null && breakdown[hoveredSlice] && (
                <div
                  className="absolute pointer-events-none bg-white border border-stone-200 rounded-lg px-3 py-2 shadow-lg text-xs"
                  style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 4, whiteSpace: 'nowrap' }}
                >
                  <span className="font-medium" style={{ color: GREEN_DARK }}>{breakdown[hoveredSlice].label}</span>
                  <span className="ml-2 text-stone-500">{Math.round(breakdown[hoveredSlice].amount).toLocaleString()} € — {Math.round(breakdown[hoveredSlice].amount / total * 100)} %</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={handleCopy}
                className={`py-3 px-4 border rounded-lg text-sm transition ${copied ? 'border-[#4a5240] bg-[rgba(74,82,64,0.05)] text-[#4a5240]' : 'border-stone-200 hover:border-[#4a5240]'}`}
                style={{ fontWeight: 400 }}
              >
                {copied ? '✅ Copié !' : '📋 Copier'}
              </button>
              <button
                onClick={handleShare}
                className="py-3 px-4 border border-stone-200 rounded-lg text-sm hover:border-[#4a5240] transition"
                style={{ fontWeight: 400 }}
              >
                💬 Partager
              </button>
            </div>
            <button
              onClick={handlePDF}
              className="w-full py-3 bg-[#4a5240] text-white rounded-lg text-sm hover:bg-[#2d3228] transition mb-6"
              style={{ fontWeight: 400 }}
            >
              📥 Télécharger PDF
            </button>

            <div className="bg-white border-2 border-[#4a5240] rounded-xl p-5 text-center">
              <div className="text-sm mb-1" style={{ fontWeight: 400 }}>Prêt à organiser ?</div>
              <div className="text-xs text-stone-500 mb-4">Transformez cette estimation en plan d&apos;action</div>
              <a
                href="/dashboard"
                className="inline-block px-6 py-2.5 bg-[#4a5240] text-white rounded-lg text-sm hover:bg-[#2d3228] transition"
                style={{ fontWeight: 400 }}
              >
                ✨ Sur Kaatch
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
