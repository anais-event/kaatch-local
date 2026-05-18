'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'

const BODY = 'var(--font-lato)'
const GREEN = '#4a5240'
const GREEN_DARK = '#2d3228'

const lineItems = [
  { id: 'venue', label: '🏛️ Lieu de réception', details: 'Location salle, château, domaine, parc', intimate: 2500, convivial: 5000, grandiose: 9000, perGuest: false, feature: { label: '✨ Plan de table sur Kaatch', href: '/guide' } },
  { id: 'catering', label: '🍽️ Traiteur & repas', details: 'Cocktail, dîner, brunch lendemain', intimate: 25, convivial: 50, grandiose: 85, perGuest: true },
  { id: 'drinks', label: '🍾 Boissons & alcool', details: 'Vins, champagne, bar, softs', intimate: 6, convivial: 12, grandiose: 20, perGuest: true },
  { id: 'cake', label: '🎂 Wedding cake & desserts', details: 'Pièce montée, candy bar, dessert', intimate: 150, convivial: 400, grandiose: 900, perGuest: false },
  { id: 'photographer', label: '📸 Photo & vidéo', details: 'Photographe, vidéaste, drone, album', intimate: 1200, convivial: 2200, grandiose: 4000, perGuest: false, feature: { label: '✨ Album partagé invités', href: '/guide' } },
  { id: 'dj', label: '🎵 Animation & musique', details: 'DJ, groupe, cérémonie laïque, animations', intimate: 400, convivial: 800, grandiose: 1800, perGuest: false, feature: { label: '✨ Playlist collaborative', href: '/guide' } },
  { id: 'flowers', label: '💐 Décoration & fleurs', details: 'Bouquets, centres de table, scénographie', intimate: 300, convivial: 800, grandiose: 1800, perGuest: false },
  { id: 'dress_bride', label: '👗 Tenue de la mariée', details: 'Robe, chaussures, accessoires, retouches', intimate: 600, convivial: 1200, grandiose: 2500, perGuest: false },
  { id: 'dress_groom', label: '🤵 Tenue du marié', details: 'Costume, chaussures, accessoires', intimate: 300, convivial: 600, grandiose: 1200, perGuest: false },
  { id: 'rings', label: '💍 Alliances & bijoux', details: 'Alliances, bijoux du jour J', intimate: 300, convivial: 700, grandiose: 1500, perGuest: false },
  { id: 'beauty', label: '💄 Beauté', details: 'Coiffure, maquillage, manucure, essais', intimate: 100, convivial: 250, grandiose: 500, perGuest: false },
  { id: 'stationery', label: '✉️ Papeterie & faire-part', details: 'Faire-part, save the date, menus, plan de table', intimate: 100, convivial: 300, grandiose: 600, perGuest: false, feature: { label: '✨ Studio créatif Kaatch', href: '/guide' } },
  { id: 'gifts', label: '🎁 Cadeaux & dragées', details: 'Invités, témoins, parents', intimate: 100, convivial: 300, grandiose: 700, perGuest: false },
  { id: 'transport', label: '🚗 Transport & logistique', details: 'Voiture mariés, navettes invités, parking', intimate: 200, convivial: 500, grandiose: 1000, perGuest: false },
  { id: 'accommodation', label: '🏨 Hébergement', details: 'Nuit mariés, chambres invités/famille', intimate: 0, convivial: 600, grandiose: 1500, perGuest: false, feature: { label: '✨ Hébergements invités', href: '/guide' } },
  { id: 'kids', label: '👶 Enfants', details: 'Vêtements, chaussures, baby-sitter, menus spécifiques', intimate: 0, convivial: 200, grandiose: 500, perGuest: false },
  { id: 'admin', label: '📜 Administratif & impressions', details: 'Livret de cérémonie, signalétique, impressions', intimate: 50, convivial: 150, grandiose: 300, perGuest: false },
  { id: 'honeymoon', label: '🌴 Voyage de noces', details: 'Voyage, hébergement, activités', intimate: 1000, convivial: 3000, grandiose: 6000, perGuest: false },
  { id: 'contingency', label: '🎲 Divers & imprévus', details: 'Parapluies, médicaments, trousse de secours, bouteilles d\'eau, etc.', intimate: 400, convivial: 1000, grandiose: 2000, perGuest: false },
] as const

type ItemId = typeof lineItems[number]['id']
type Level = 'intimate' | 'convivial' | 'grandiose' | 'skip'

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
  if (style === 'intimate') return 'intimate'
  if (style === 'convivial') return 'convivial'
  return 'grandiose'
}

const chartColors = ['#4a5240', '#78716c', '#d4cfc7', '#a89f99', '#c9a877', '#6b7461', '#9c8e77', '#5a6350', '#8a7c6b', '#b5a48e', '#3d4536', '#a8a29e', '#7c8572', '#c4b89c', '#505d44', '#8b8072', '#607055', '#b0a090', '#6a7560']

export default function BudgetCalculator() {
  const [guestCount, setGuestCount] = useState(100)
  const [city, setCity] = useState('')
  const [style, setStyle] = useState('intimate')
  const [selections, setSelections] = useState<Record<ItemId, Level>>(
    Object.fromEntries(lineItems.map(i => [i.id, 'intimate'])) as Record<ItemId, Level>
  )
  const [enabled, setEnabled] = useState<Record<ItemId, boolean>>(
    Object.fromEntries(lineItems.map(i => [i.id, true])) as Record<ItemId, boolean>
  )
  const [customBudgets, setCustomBudgets] = useState<Record<ItemId, number | null>>(
    Object.fromEntries(lineItems.map(i => [i.id, null])) as Record<ItemId, number | null>
  )
  const [openDetail, setOpenDetail] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const regionMult = useMemo(() => getRegionMult(city), [city])
  const styleMult = useMemo(() => getStyleMult(style), [style])

  const getAmount = useCallback((item: typeof lineItems[number]) => {
    if (!enabled[item.id]) return 0
    const sel = selections[item.id]
    if (sel === 'skip') return 0
    if (customBudgets[item.id] !== null) return customBudgets[item.id]!
    let amount = item[sel]
    if (item.perGuest) amount *= guestCount
    return Math.round(amount * regionMult * styleMult)
  }, [enabled, selections, customBudgets, guestCount, regionMult, styleMult])

  const breakdown = useMemo(() => {
    return lineItems
      .filter(item => enabled[item.id] && selections[item.id] !== 'skip')
      .map(item => ({ id: item.id, label: item.label, amount: getAmount(item) }))
      .filter(b => b.amount > 0)
  }, [getAmount, enabled, selections])

  const total = useMemo(() => breakdown.reduce((s, b) => s + b.amount, 0), [breakdown])

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

    breakdown.forEach((b, i) => {
      const slice = (b.amount / total) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(cx, cy, r, startAngle, startAngle + slice)
      ctx.arc(cx, cy, inner, startAngle + slice, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = chartColors[i % chartColors.length]
      ctx.fill()
      startAngle += slice
    })
  }, [breakdown, total])

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
    setCustomBudgets(Object.fromEntries(lineItems.map(i => [i.id, null])) as Record<ItemId, number | null>)
  }

  const setLevel = (id: ItemId, level: Level) => {
    setSelections(prev => ({ ...prev, [id]: level }))
    setCustomBudgets(prev => ({ ...prev, [id]: null }))
  }

  const toggleItem = (id: ItemId) => {
    setEnabled(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const setCustom = (id: ItemId, value: string) => {
    const num = parseFloat(value)
    setCustomBudgets(prev => ({ ...prev, [id]: isNaN(num) || num < 0 ? null : num }))
  }

  const handleCopy = () => {
    const text = `Mon mariage : ~${Math.round(total).toLocaleString()}€ pour ${guestCount} invités (${Math.round(total / guestCount)}€/personne)`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    const text = `Mon mariage : ~${Math.round(total).toLocaleString()}€ pour ${guestCount} invités via le simulateur Kaatch`
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
    doc.text(`Total : ${Math.round(total).toLocaleString()}€`, w / 2, y + 13, { align: 'center' })
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
      const item = lineItems.find(i => i.id === b.id)!
      const sel = selections[b.id as ItemId]
      const levelLabel = sel === 'intimate' ? 'Économique' : sel === 'convivial' ? 'Standard' : 'Premium'

      doc.setTextColor(45, 50, 40)
      doc.text(item.label.replace(/^.{1,2}\s/, ''), 22, y)
      doc.setTextColor(120, 113, 108)
      doc.text(levelLabel, 110, y)
      doc.setTextColor(74, 82, 64)
      doc.text(`${Math.round(b.amount).toLocaleString()}€`, w - 22, y, { align: 'right' })
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
    doc.text(`Total : ${Math.round(total).toLocaleString()}€`, w - 22, y, { align: 'right' })
    doc.setFontSize(10)
    doc.setTextColor(120, 113, 108)
    doc.text(`≈ ${Math.round(total / guestCount)}€ par invité`, 22, y)

    y += 16
    doc.setFontSize(8)
    doc.setTextColor(168, 162, 153)
    doc.text('Estimation indicative — kaatch.fr', w / 2, y, { align: 'center' })

    doc.save('budget-mariage.pdf')
  }

  const pillClass = (id: ItemId, level: Level) =>
    `px-3 py-1 text-xs rounded-full border transition cursor-pointer whitespace-nowrap ${
      selections[id] === level
        ? 'bg-[#4a5240] text-white border-[#4a5240]'
        : 'bg-white text-stone-600 border-stone-200 hover:border-[#4a5240]'
    }`

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
                className="w-20 text-2xl border-none bg-transparent outline-none"
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

      {/* Main grid: table + summary */}
      <div className="grid lg:grid-cols-[70%_1fr] gap-8">
        {/* Table */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="px-6 md:px-10 pt-8 pb-4">
            <h2 className="text-xl" style={{ fontFamily: BODY, fontWeight: 400, color: GREEN_DARK }}>
              Détail des postes
            </h2>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: BODY }}>
              <thead>
                <tr className="bg-[#f5f0e8] border-b-[3px] border-[#4a5240]">
                  <th className="py-3 px-3 text-left w-8" style={{ fontWeight: 400, fontSize: '0.85rem' }}>☐</th>
                  <th className="py-3 px-3 text-left" style={{ fontWeight: 400, fontSize: '0.85rem' }}>Poste</th>
                  <th className="py-3 px-3 text-center" style={{ fontWeight: 400, fontSize: '0.8rem' }}>Économique</th>
                  <th className="py-3 px-3 text-center" style={{ fontWeight: 400, fontSize: '0.8rem' }}>Standard</th>
                  <th className="py-3 px-3 text-center" style={{ fontWeight: 400, fontSize: '0.8rem' }}>Premium</th>
                  <th className="py-3 px-3 text-center" style={{ fontWeight: 400, fontSize: '0.8rem' }}>—</th>
                  <th className="py-3 px-3 text-right" style={{ fontWeight: 400, fontSize: '0.85rem' }}>Votre budget</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => {
                  const amount = getAmount(item)
                  const isEnabled = enabled[item.id]
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-stone-100 transition ${idx % 2 === 1 ? 'bg-[#faf8f3]' : ''} ${!isEnabled ? 'opacity-40' : 'hover:bg-stone-50/50'}`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => toggleItem(item.id)}
                          className="w-4 h-4 accent-[#4a5240] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontWeight: 400 }}>{item.label}</span>
                          <button
                            onClick={() => setOpenDetail(openDetail === item.id ? null : item.id)}
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-stone-200 text-stone-500 text-[0.6rem] leading-none hover:bg-stone-300 transition flex-shrink-0"
                            title={item.details}
                          >
                            ?
                          </button>
                        </div>
                        {openDetail === item.id && (
                          <div className="text-xs text-stone-400 mt-1 pl-0.5">{item.details}</div>
                        )}
                        {'feature' in item && item.feature && (
                          <a
                            href={item.feature.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-1 px-2 py-0.5 bg-[rgba(74,82,64,0.1)] text-[#4a5240] text-[0.7rem] rounded-full hover:bg-[rgba(74,82,64,0.2)] transition"
                            style={{ fontWeight: 400 }}
                          >
                            {item.feature.label}
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button className={pillClass(item.id, 'intimate')} onClick={() => setLevel(item.id, 'intimate')} disabled={!isEnabled}>
                          Économique
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button className={pillClass(item.id, 'convivial')} onClick={() => setLevel(item.id, 'convivial')} disabled={!isEnabled}>
                          Standard
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button className={pillClass(item.id, 'grandiose')} onClick={() => setLevel(item.id, 'grandiose')} disabled={!isEnabled}>
                          Premium
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button className={pillClass(item.id, 'skip')} onClick={() => setLevel(item.id, 'skip')} disabled={!isEnabled}>
                          —
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          value={customBudgets[item.id] !== null ? customBudgets[item.id]! : amount}
                          onChange={e => setCustom(item.id, e.target.value)}
                          disabled={!isEnabled}
                          className="w-20 px-2 py-1 border border-stone-200 rounded text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5240] focus:border-transparent"
                          style={{ fontFamily: BODY, fontWeight: 300, color: GREEN }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden px-4 pb-4">
            {lineItems.map(item => {
              const amount = getAmount(item)
              const isEnabled = enabled[item.id]
              return (
                <div key={item.id} className={`border border-stone-100 rounded-xl p-4 mb-3 ${!isEnabled ? 'opacity-40' : ''}`}>
                  <label className="flex items-center gap-3 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 accent-[#4a5240]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm" style={{ fontWeight: 400 }}>{item.label}</span>
                        <button
                          onClick={e => { e.preventDefault(); setOpenDetail(openDetail === item.id ? null : item.id) }}
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-stone-200 text-stone-500 text-[0.6rem] leading-none"
                        >
                          ?
                        </button>
                      </div>
                      {openDetail === item.id && (
                        <div className="text-xs text-stone-400 mt-1">{item.details}</div>
                      )}
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex gap-1 flex-wrap">
                      {(['intimate', 'convivial', 'grandiose', 'skip'] as Level[]).map(level => (
                        <button
                          key={level}
                          className={`flex-1 py-1 text-[0.7rem] rounded-full border transition ${
                            selections[item.id] === level
                              ? 'bg-[#4a5240] text-white border-[#4a5240]'
                              : 'bg-white text-stone-500 border-stone-200'
                          }`}
                          onClick={() => setLevel(item.id, level)}
                          disabled={!isEnabled}
                        >
                          {level === 'intimate' ? 'Éco' : level === 'convivial' ? 'Std' : level === 'grandiose' ? 'Prm' : '—'}
                        </button>
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-[0.7rem] text-stone-400 mb-1">Budget</div>
                      <input
                        type="number"
                        value={customBudgets[item.id] !== null ? customBudgets[item.id]! : amount}
                        onChange={e => setCustom(item.id, e.target.value)}
                        disabled={!isEnabled}
                        className="w-full px-2 py-1 border border-stone-200 rounded text-right text-sm"
                        style={{ fontFamily: BODY, fontWeight: 300, color: GREEN }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="lg:sticky lg:top-5 h-fit">
          <div
            className="bg-gradient-to-br from-[#f5f0e8] to-white border-2 border-[#4a5240] rounded-2xl p-8"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div className="text-sm text-stone-500 mb-2">Budget total estimé</div>
            <div className="text-4xl mb-1" style={{ fontFamily: BODY, fontWeight: 300, color: GREEN }}>
              {Math.round(total).toLocaleString()}€
            </div>
            <div className="text-sm text-stone-600 mb-6 pb-6 border-b border-stone-200">
              ≈ <strong>{guestCount > 0 ? Math.round(total / guestCount) : 0}€</strong> par invité
            </div>

            <div className="flex justify-center mb-6">
              <canvas ref={canvasRef} width={220} height={220} style={{ width: 220, height: 220 }} />
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
