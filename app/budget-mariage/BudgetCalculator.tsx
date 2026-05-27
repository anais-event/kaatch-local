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
  eco: '★',
  classique: '★★',
  premium: '★★★',
  skip: '—',
}

const levelIcons: Record<string, string> = {
  eco: '★',
  classique: '★★',
  premium: '★★★',
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
  const [customItems, setCustomItems] = useState<LineItem[]>([])
  const [showInfoId, setShowInfoId] = useState<string | null>(null)
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

  const allItems = useMemo(() => [...lineItems, ...customItems], [customItems])
  const orderedItems = useMemo(() => {
    const map = new Map(allItems.map(i => [i.id, i]))
    return itemOrder.map(id => map.get(id)!).filter(Boolean)
  }, [itemOrder, allItems])
  const mainItems = orderedItems
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

  const addCustomItem = () => {
    const id = `custom_${Date.now()}`
    const newItem: LineItem = {
      id, emoji: '➕', nom: 'Nouveau poste',
      description: 'Cliquez pour personnaliser',
      type: 'fixe', actif: true,
      conseil: '', messageDesactivation: '',
      niveaux: {
        eco: { label: 'Budget mini', base: 200 },
        classique: { label: 'Budget moyen', base: 500 },
        premium: { label: 'Budget maxi', base: 1500 },
      },
    }
    setCustomItems(prev => [...prev, newItem])
    setItemOrder(prev => [...prev.filter(i => i !== 'contingency'), id, 'contingency'])
    setSelections(prev => ({ ...prev, [id]: 'classique' }))
    setEnabled(prev => ({ ...prev, [id]: true }))
    setCustomBudgets(prev => ({ ...prev, [id]: null }))
    setExpandedId(id)
  }

  const removeCustomItem = (id: string) => {
    setCustomItems(prev => prev.filter(i => i.id !== id))
    setItemOrder(prev => prev.filter(i => i !== id))
    setSelections(prev => { const n = { ...prev }; delete n[id]; return n })
    setEnabled(prev => { const n = { ...prev }; delete n[id]; return n })
    setCustomBudgets(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const updateCustomItemName = (id: string, nom: string) => {
    setCustomItems(prev => prev.map(i => i.id === id ? { ...i, nom } : i))
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

  const fmtEUR = (n: number) =>
    new Intl.NumberFormat('fr-FR').format(Math.round(n)).replace(/ | /g, ' ') + ' €'

  const styleLabel = { intimate: 'Intime', convivial: 'Convivial', grandiose: 'Grandiose' }[style] ?? style
  const regionLabel = regions.find(r => r.value === city)?.label ?? 'Non précisée'

  const handlePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-10000px'
    container.style.top = '0'
    container.style.width = '794px'
    container.style.padding = '48px'
    container.style.backgroundColor = '#ffffff'
    container.style.fontFamily = 'Helvetica, Arial, sans-serif'
    container.style.color = '#2d3228'
    container.style.fontWeight = '300'

    const rows = breakdown.map(b => {
      const item = [...lineItems, ...customItems].find(i => i.id === b.id)
      const sel = selections[b.id]
      const lvl = customBudgets[b.id] !== null ? 'Devis' : (levelLabels[sel] || '—')
      const name = item?.nom ?? b.label
      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #eee5d8;font-size:13px;color:#2d3228;">${name}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee5d8;font-size:13px;color:#9c8e77;text-align:center;">${lvl}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee5d8;font-size:13px;color:#4a5240;text-align:right;font-variant-numeric:tabular-nums;">${fmtEUR(b.amount)}</td>
        </tr>`
    }).join('')

    container.innerHTML = `
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:11px;letter-spacing:0.25em;color:#a8a29e;text-transform:uppercase;margin-bottom:8px;">Estimation budget</div>
        <h1 style="font-size:30px;font-weight:300;margin:0;color:#2d3228;letter-spacing:-0.01em;">Mon mariage</h1>
        <div style="font-size:13px;color:#78716c;margin-top:10px;">
          ${guestCount} invités &nbsp;·&nbsp; ${regionLabel} &nbsp;·&nbsp; Style ${styleLabel}
        </div>
      </div>

      <div style="background:#f5f0e8;border-radius:14px;padding:28px;text-align:center;margin-bottom:28px;">
        <div style="font-size:11px;letter-spacing:0.2em;color:#9c8e77;text-transform:uppercase;margin-bottom:8px;">Budget total estimé</div>
        <div style="font-size:42px;font-weight:300;color:#4a5240;font-variant-numeric:tabular-nums;">${fmtEUR(total)}</div>
        <div style="font-size:13px;color:#78716c;margin-top:6px;">≈ ${fmtEUR(total / Math.max(guestCount, 1))} par invité</div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;font-size:10px;letter-spacing:0.18em;color:#a8a29e;text-transform:uppercase;font-weight:400;border-bottom:1.5px solid #d4cfc7;">Poste</th>
            <th style="text-align:center;padding:8px;font-size:10px;letter-spacing:0.18em;color:#a8a29e;text-transform:uppercase;font-weight:400;border-bottom:1.5px solid #d4cfc7;width:90px;">Style</th>
            <th style="text-align:right;padding:8px;font-size:10px;letter-spacing:0.18em;color:#a8a29e;text-transform:uppercase;font-weight:400;border-bottom:1.5px solid #d4cfc7;width:120px;">Montant</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:14px 8px 4px;font-size:13px;color:#78716c;border-top:1.5px solid #4a5240;">Total</td>
            <td style="padding:14px 8px 4px;font-size:16px;color:#4a5240;text-align:right;font-variant-numeric:tabular-nums;border-top:1.5px solid #4a5240;">${fmtEUR(total)}</td>
          </tr>
        </tfoot>
      </table>

      ${honeymoonAmount > 0 ? `
        <div style="font-size:12px;color:#a8a29e;margin-bottom:24px;padding:12px;background:#faf9f6;border-radius:8px;">
          + Voyage de noces (hors total) : <span style="color:#78716c;">${fmtEUR(honeymoonAmount)}</span>
        </div>` : ''}

      <div style="border-top:1px solid #eee5d8;padding-top:16px;margin-top:32px;text-align:center;">
        <div style="font-size:11px;color:#a8a29e;line-height:1.6;">
          Estimation indicative — les prix réels varient selon vos prestataires et la saison.<br/>
          Généré sur <span style="color:#4a5240;">kaatch.fr</span> le ${new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
    `

    document.body.appendChild(container)
    try {
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW
      const imgH = (canvas.height * imgW) / canvas.width
      let heightLeft = imgH
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
      heightLeft -= pageH
      while (heightLeft > 0) {
        position -= pageH
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
        heightLeft -= pageH
      }
      pdf.save('budget-mariage.pdf')
    } finally {
      document.body.removeChild(container)
    }
  }

  const handleExcel = async () => {
    const XLSX = await import('xlsx')
    const headerRows: (string | number)[][] = [
      ['Budget Mariage'],
      [`${guestCount} invités · ${regionLabel} · Style ${styleLabel}`],
      [],
      ['Poste', 'Style', 'Montant (€)'],
    ]
    const dataRows: (string | number)[][] = breakdown.map(b => {
      const item = [...lineItems, ...customItems].find(i => i.id === b.id)
      const sel = selections[b.id]
      const lvl = customBudgets[b.id] !== null ? 'Devis' : (levelLabels[sel] || '—')
      return [item?.nom ?? b.label, lvl, Math.round(b.amount)]
    })
    const totalRow: (string | number)[] = ['Total', '', Math.round(total)]
    const perGuestRow: (string | number)[] = [`Par invité (≈ ${guestCount} pers.)`, '', Math.round(total / Math.max(guestCount, 1))]
    const honeymoonRows: (string | number)[][] = honeymoonAmount > 0
      ? [[], ['Voyage de noces (hors total)', '', Math.round(honeymoonAmount)]]
      : []

    const aoa = [...headerRows, ...dataRows, [], totalRow, perGuestRow, ...honeymoonRows]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = [{ wch: 36 }, { wch: 12 }, { wch: 16 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Budget')
    XLSX.writeFile(wb, 'budget-mariage.xlsx')
  }

  const handleOrganiserKaatch = (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const payload = {
        version: 1,
        createdAt: new Date().toISOString(),
        guestCount,
        region: regionLabel,
        style: styleLabel,
        total: Math.round(total),
        honeymoon: Math.round(honeymoonAmount),
        items: orderedItems
          .filter(item => enabled[item.id] && selections[item.id] !== 'skip')
          .map(item => {
            const amount = item.type === 'pourcentage'
              ? getAmount(item, subtotalBeforePercent)
              : getAmount(item)
            const sel = selections[item.id]
            return {
              id: item.id,
              nom: item.nom,
              emoji: item.emoji,
              level: sel,
              levelLabel: customBudgets[item.id] !== null ? 'Devis' : levelLabels[sel],
              amount: Math.round(amount),
              horsTotal: !!item.horsTotal,
            }
          })
          .filter(x => x.amount > 0),
      }
      localStorage.setItem('kaatch_budget_simulation', JSON.stringify(payload))
    } catch {}
    window.location.href = '/dashboard?from=budget-simulation'
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
        className={`group relative transition-all ${dragId === item.id ? 'opacity-20 scale-[0.98]' : ''} ${dragOverId === item.id && dragId !== item.id ? 'translate-y-0.5' : ''}`}
      >
        <div
          className={`flex items-center gap-3 px-5 py-3 cursor-pointer rounded-xl transition-colors ${isExpanded ? 'bg-stone-100/60' : 'hover:bg-stone-50/80'} ${!isEnabled ? 'opacity-35' : ''}`}
          onClick={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <span
            className="cursor-grab active:cursor-grabbing text-stone-200 group-hover:text-stone-400 flex-shrink-0 select-none text-xs transition-colors"
            onMouseDown={e => e.stopPropagation()}
          >⠿</span>
          <label className="flex-shrink-0" onClick={e => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={() => toggleItem(item.id)}
              className="sr-only peer"
            />
            <div className="w-[18px] h-[18px] rounded-[5px] border border-stone-300 peer-checked:bg-[#4a5240] peer-checked:border-[#4a5240] transition-all flex items-center justify-center cursor-pointer">
              {isEnabled && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
          </label>
          <span className="text-base flex-shrink-0 leading-none">{item.emoji}</span>
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            {item.id.startsWith('custom_') ? (
              <input
                type="text"
                value={item.nom}
                onChange={e => { e.stopPropagation(); updateCustomItemName(item.id, e.target.value) }}
                onClick={e => e.stopPropagation()}
                className="text-[0.82rem] tracking-[-0.01em] bg-transparent border-b border-dashed border-stone-300 focus:border-[#4a5240] outline-none w-full"
                style={{ fontFamily: BODY, fontWeight: 400, color: GREEN_DARK }}
              />
            ) : (
              <span className="text-[0.82rem] tracking-[-0.01em]" style={{ fontFamily: BODY, fontWeight: 400, color: GREEN_DARK }}>{item.nom}</span>
            )}
            {item.description && !isExpanded && (
              <button
                onClick={e => { e.stopPropagation(); setShowInfoId(showInfoId === item.id ? null : item.id) }}
                className="flex-shrink-0 w-4 h-4 rounded-full bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600 text-[0.55rem] flex items-center justify-center transition"
              >?</button>
            )}
            {item.id.startsWith('custom_') && (
              <button
                onClick={e => { e.stopPropagation(); removeCustomItem(item.id) }}
                className="flex-shrink-0 w-4 h-4 rounded-full text-stone-300 hover:text-red-400 text-[0.65rem] flex items-center justify-center transition"
              >✕</button>
            )}
          </div>
          {showInfoId === item.id && !isExpanded && (
            <div className="absolute left-16 right-16 mt-12 z-10 bg-white border border-stone-100 rounded-lg px-3 py-2 shadow-md text-[0.72rem] text-stone-500" style={{ fontWeight: 300 }}>
              {item.description}
              {item.horsTotal && <span className="block text-stone-400 mt-1 text-[0.65rem]">⚠️ Non inclus dans le total principal</span>}
            </div>
          )}
          {!isExpanded && isEnabled && sel !== 'skip' && (
            <span className="text-[0.65rem] tracking-wide uppercase text-stone-400 hidden sm:inline" style={{ fontWeight: 300 }}>
              {hasCustom ? 'devis' : levelLabels[sel]}
            </span>
          )}
          <span className="text-[0.82rem] tabular-nums min-w-[72px] text-right tracking-tight" style={{ fontFamily: BODY, fontWeight: 300, color: isEnabled && sel !== 'skip' ? GREEN : '#c4b8a8' }}>
            {isEnabled && sel !== 'skip' ? `${Math.round(amount).toLocaleString()} €` : '—'}
          </span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            className={`flex-shrink-0 transition-transform duration-300 ease-out ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#c4b8a8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {isExpanded && (
          <div className="mx-5 mt-1 mb-3 rounded-xl bg-[#faf9f6] p-5 space-y-4" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)' }}>
            {item.conseil && (
              <p className="text-[0.72rem] text-stone-400 leading-relaxed" style={{ fontWeight: 300 }}>
                💡 {item.conseil}
              </p>
            )}

            {!isEnabled && item.messageDesactivation && (
              <p className="text-[0.72rem] text-stone-400 italic">{item.messageDesactivation}</p>
            )}

            {isEnabled && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {(['eco', 'classique', 'premium'] as const).map(level => {
                    const active = sel === level && !hasCustom
                    return (
                      <button
                        key={level}
                        onClick={() => setLevel(item.id, level)}
                        className={`relative px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                          active
                            ? 'bg-white shadow-sm ring-1 ring-[#4a5240]/30'
                            : 'bg-white/50 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <div className="text-[0.8rem] tracking-wider mb-1" style={{ fontWeight: 400, color: active ? GREEN : '#a8a29e' }}>
                          {levelLabels[level]}
                        </div>
                        <div className="text-[0.68rem] text-stone-400 leading-snug mb-2" style={{ fontWeight: 300 }}>{item.niveaux[level].label}</div>
                        <div className="text-[0.82rem] tabular-nums" style={{ fontWeight: 400, color: GREEN }}>
                          {item.type === 'pourcentage'
                            ? `${item.niveaux[level].base} %`
                            : item.type === 'par_invite'
                              ? `${item.niveaux[level].base} €/pers.`
                              : `${item.niveaux[level].base.toLocaleString()} €`
                          }
                        </div>
                      </button>
                    )
                  })}
                </div>

                {item.type !== 'pourcentage' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] text-stone-300 uppercase tracking-wider">ou</span>
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="number"
                        placeholder="Mon devis"
                        value={customBudgets[item.id] !== null ? customBudgets[item.id]! : ''}
                        onChange={e => setCustom(item.id, e.target.value)}
                        className="w-full max-w-[140px] px-3 py-2 bg-white rounded-lg text-[0.82rem] text-right tabular-nums placeholder:text-stone-300 focus:outline-none focus:ring-1 focus:ring-[#4a5240]/40 transition"
                        style={{ fontFamily: BODY, fontWeight: 300, color: GREEN }}
                      />
                      <span className="text-[0.72rem] text-stone-300">€</span>
                    </div>
                    {hasCustom && (
                      <button
                        onClick={() => setCustomBudgets(prev => ({ ...prev, [item.id]: null }))}
                        className="text-[0.65rem] text-stone-400 hover:text-stone-600 transition"
                      >✕</button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[0.65rem] text-stone-300 tracking-wide" style={{ fontWeight: 300 }}>
                    {item.type === 'par_invite' && 'par invité'}
                    {item.type === 'fixe' && 'forfait'}
                    {item.type === 'pourcentage' && '% du total'}
                  </span>
                  {item.feature && (
                    <a
                      href={item.feature.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.65rem] text-[#4a5240]/60 hover:text-[#4a5240] transition"
                      style={{ fontWeight: 300 }}
                    >{item.feature.label} →</a>
                  )}
                </div>
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
      <div className="bg-white rounded-2xl border border-stone-100 p-6 md:p-8 mb-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[0.65rem] uppercase tracking-wider text-stone-400 mb-3" style={{ fontWeight: 300 }}>
              Invités
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={guestCount}
              onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setGuestCount(v) }}
              className="w-20 text-2xl bg-transparent outline-none tabular-nums mb-3 border-b border-transparent focus:border-[#4a5240] transition cursor-text"
              style={{ fontFamily: BODY, fontWeight: 300, color: GREEN }}
            />
            <input
              type="range"
              min={10}
              max={300}
              value={Math.min(guestCount, 300)}
              onChange={e => setGuestCount(parseInt(e.target.value))}
              className="w-full accent-[#4a5240]"
            />
            <div className="flex justify-between text-[0.6rem] text-stone-300 mt-1">
              <span>10</span><span>300+</span>
            </div>
          </div>

          <div>
            <label className="block text-[0.65rem] uppercase tracking-wider text-stone-400 mb-3" style={{ fontWeight: 300 }}>
              Région
            </label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border-0 rounded-xl text-[0.82rem] focus:outline-none focus:ring-1 focus:ring-[#4a5240]/30 transition appearance-none cursor-pointer"
              style={{ fontFamily: BODY, fontWeight: 300, color: GREEN_DARK }}
            >
              {regions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[0.65rem] uppercase tracking-wider text-stone-400 mb-3" style={{ fontWeight: 300 }}>
              Style
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
                  className={`py-2.5 rounded-xl text-[0.75rem] transition-all ${
                    style === s.id
                      ? 'bg-[#4a5240] text-white shadow-sm'
                      : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                  }`}
                  style={{ fontWeight: style === s.id ? 400 : 300 }}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Accordion */}
        <div>
          <div className="bg-white rounded-2xl border border-stone-100 py-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="px-5 pt-4 pb-2">
              <h2 className="text-[0.82rem] tracking-[-0.01em]" style={{ fontFamily: BODY, fontWeight: 400, color: GREEN_DARK }}>
                Détail des postes
              </h2>
            </div>
            {mainItems.map(item => renderRow(item))}
            <div className="px-5 py-3">
              <button
                onClick={addCustomItem}
                className="w-full py-2.5 rounded-xl border border-dashed border-stone-200 text-[0.75rem] text-stone-400 hover:border-stone-300 hover:text-stone-500 transition-all"
                style={{ fontWeight: 300 }}
              >
                + Ajouter un poste
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 bg-white rounded-2xl border border-stone-100 p-6 flex items-center justify-between" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div>
              <div className="text-[0.82rem]" style={{ fontWeight: 400, color: GREEN_DARK }}>Prêt à organiser ?</div>
              <div className="text-[0.72rem] text-stone-400" style={{ fontWeight: 300 }}>Transformez cette estimation en plan d&apos;action</div>
            </div>
            <a
              href="/dashboard?from=budget-simulation"
              onClick={handleOrganiserKaatch}
              className="px-5 py-2.5 bg-[#4a5240] text-white rounded-xl text-[0.75rem] hover:bg-[#2d3228] transition-all flex-shrink-0"
              style={{ fontWeight: 400 }}
            >
              ✨ Organiser sur Kaatch
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div>
              <div className="text-[0.65rem] uppercase tracking-wider text-stone-400 mb-1" style={{ fontWeight: 300 }}>Budget estimé</div>
              <div className="text-3xl tabular-nums tracking-tight" style={{ fontFamily: BODY, fontWeight: 300, color: GREEN }}>
                {Math.round(total).toLocaleString()} €
              </div>
              <div className="text-[0.72rem] text-stone-400 mt-0.5" style={{ fontWeight: 300 }}>
                ≈ {guestCount > 0 ? Math.round(total / guestCount) : 0} € par invité
              </div>
            </div>

            {honeymoonAmount > 0 && (
              <div className="text-[0.72rem] text-stone-400 pt-3 border-t border-stone-100" style={{ fontWeight: 300 }}>
                + Voyage de noces : <span className="text-stone-500">{Math.round(honeymoonAmount).toLocaleString()} €</span>
                <span className="block text-stone-300 mt-0.5">non inclus dans le total</span>
              </div>
            )}

            <div className="flex justify-center relative pt-2">
              <canvas
                ref={canvasRef}
                width={220}
                height={220}
                style={{ width: 200, height: 200, cursor: hoveredSlice !== null ? 'pointer' : 'default' }}
                onMouseMove={e => {
                  const rect = canvasRef.current!.getBoundingClientRect()
                  const x = e.clientX - rect.left - 100
                  const y = e.clientY - rect.top - 100
                  const dist = Math.sqrt(x * x + y * y)
                  if (dist < 50 || dist > 85) { setHoveredSlice(null); return }
                  let angle = Math.atan2(y, x)
                  if (angle < -Math.PI / 2) angle += Math.PI * 2
                  const idx = segmentsRef.current.findIndex(s => angle >= s.startAngle && angle < s.endAngle)
                  setHoveredSlice(idx >= 0 ? idx : null)
                }}
                onMouseLeave={() => setHoveredSlice(null)}
              />
              {hoveredSlice !== null && breakdown[hoveredSlice] && (
                <div
                  className="absolute pointer-events-none bg-white/95 backdrop-blur-sm border border-stone-100 rounded-lg px-3 py-2 shadow-md text-[0.72rem]"
                  style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 4, whiteSpace: 'nowrap' }}
                >
                  <span style={{ fontWeight: 400, color: GREEN_DARK }}>{breakdown[hoveredSlice].label}</span>
                  <span className="ml-2 text-stone-400">{Math.round(breakdown[hoveredSlice].amount).toLocaleString()} € · {Math.round(breakdown[hoveredSlice].amount / total * 100)} %</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopy}
                  className={`py-2.5 rounded-xl text-[0.75rem] transition-all ${copied ? 'bg-[#4a5240]/5 text-[#4a5240]' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}
                  style={{ fontWeight: 300 }}
                >
                  {copied ? '✓ Copié' : 'Copier'}
                </button>
                <button
                  onClick={handleShare}
                  className="py-2.5 rounded-xl text-[0.75rem] bg-stone-50 text-stone-500 hover:bg-stone-100 transition-all"
                  style={{ fontWeight: 300 }}
                >
                  Partager
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePDF}
                  className="py-2.5 bg-[#4a5240] text-white rounded-xl text-[0.75rem] hover:bg-[#2d3228] transition-all"
                  style={{ fontWeight: 400 }}
                >
                  PDF
                </button>
                <button
                  onClick={handleExcel}
                  className="py-2.5 bg-stone-100 text-[#4a5240] rounded-xl text-[0.75rem] hover:bg-stone-200 transition-all"
                  style={{ fontWeight: 400 }}
                >
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
