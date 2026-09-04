'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { track } from '@vercel/analytics'

const BODY = 'var(--font-lato)'
const GREEN = '#4a5240'
const GREEN_DARK = '#2d3228'

type ItemType = 'fixe' | 'par_invite' | 'pourcentage'
type Level = 'eco' | 'classique' | 'premium' | 'skip'

interface LineItemData {
  id: string
  emoji: string
  type: ItemType
  actif: boolean
  featureHref?: string
  horsTotal?: boolean
}

interface CountryRegion {
  key: string
  name: string
  mult: number
}

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

const lineItemData: LineItemData[] = [
  { id: 'venue', emoji: '🏛️', type: 'fixe', actif: true, featureHref: '/fonctionnalites/plan-de-table' },
  { id: 'catering', emoji: '🍽️', type: 'par_invite', actif: true },
  { id: 'drinks', emoji: '🍾', type: 'par_invite', actif: true },
  { id: 'cake', emoji: '🎂', type: 'par_invite', actif: true },
  { id: 'photographer', emoji: '📸', type: 'fixe', actif: true, featureHref: '/fonctionnalites/album-photo' },
  { id: 'dj', emoji: '🎵', type: 'fixe', actif: true, featureHref: '/fonctionnalites/playlist-collaborative' },
  { id: 'flowers', emoji: '💐', type: 'fixe', actif: true },
  { id: 'dress_bride', emoji: '👗', type: 'fixe', actif: true },
  { id: 'dress_groom', emoji: '🤵', type: 'fixe', actif: true },
  { id: 'rings', emoji: '💍', type: 'fixe', actif: true },
  { id: 'beauty', emoji: '💄', type: 'fixe', actif: true },
  { id: 'stationery', emoji: '✉️', type: 'par_invite', actif: true, featureHref: '/fonctionnalites/faire-part-rsvp' },
  { id: 'gifts', emoji: '🎁', type: 'par_invite', actif: true },
  { id: 'transport', emoji: '🚗', type: 'fixe', actif: true },
  { id: 'accommodation', emoji: '🏨', type: 'fixe', actif: true, featureHref: '/fonctionnalites/espace-invites' },
  { id: 'kids', emoji: '👶', type: 'fixe', actif: false },
  { id: 'admin', emoji: '📜', type: 'fixe', actif: true },
  { id: 'honeymoon', emoji: '🌴', type: 'fixe', actif: false, horsTotal: true },
  { id: 'contingency', emoji: '🎲', type: 'pourcentage', actif: true },
]

function buildLineItems(t: (key: string) => string, prices: Record<string, { eco: number; classique: number; premium: number }>): LineItem[] {
  return lineItemData.map(d => {
    const p = prices[d.id] || { eco: 0, classique: 0, premium: 0 }
    return {
      id: d.id,
      emoji: d.emoji,
      nom: t(`items.${d.id}.name`),
      description: t(`items.${d.id}.desc`),
      type: d.type,
      actif: d.actif,
      conseil: t(`items.${d.id}.tip`),
      messageDesactivation: t(`items.${d.id}.off`),
      niveaux: {
        eco: { label: t(`items.${d.id}.eco`), base: p.eco },
        classique: { label: t(`items.${d.id}.classique`), base: p.classique },
        premium: { label: t(`items.${d.id}.premium`), base: p.premium },
      },
      ...(d.featureHref ? { feature: { label: t(`items.${d.id}.feature`), href: d.featureHref } } : {}),
      ...(d.horsTotal ? { horsTotal: true } : {}),
    }
  })
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

const chartColors = ['#4a5240', '#78716c', '#d4cfc7', '#a89f99', '#c9a877', '#6b7461', '#9c8e77', '#5a6350', '#8a7c6b', '#b5a48e', '#3d4536', '#a8a29e', '#7c8572', '#c4b89c', '#505d44', '#8b8072', '#607055', '#b0a090', '#6a7560']

export default function BudgetCalculator() {
  const t = useTranslations('budget')
  const prices = t.raw('prices') as Record<string, { eco: number; classique: number; premium: number }>
  const countryRegions = t.raw('countryRegions') as CountryRegion[]
  const lineItems = useMemo(() => buildLineItems(k => t(k), prices), [t, prices])
  const regions = useMemo(() => countryRegions.map(r => ({
    value: r.key,
    label: r.name,
  })), [countryRegions])

  const [guestCount, setGuestCount] = useState(100)
  const [city, setCity] = useState('')
  const [style, setStyle] = useState('intimate')
  const [selections, setSelections] = useState<Record<string, Level>>(
    Object.fromEntries(lineItemData.map(i => [i.id, 'eco'])) as Record<string, Level>
  )
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(lineItemData.map(i => [i.id, i.actif])) as Record<string, boolean>
  )
  const [customBudgets, setCustomBudgets] = useState<Record<string, number | null>>(
    Object.fromEntries(lineItemData.map(i => [i.id, null])) as Record<string, number | null>
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [itemOrder, setItemOrder] = useState<string[]>(lineItemData.map(i => i.id))
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [customItems, setCustomItems] = useState<LineItem[]>([])
  const [showInfoId, setShowInfoId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)
  const segmentsRef = useRef<{ startAngle: number; endAngle: number }[]>([])
  const [dateEvent, setDateEvent] = useState('')
  const [editableNames, setEditableNames] = useState<Record<string, string>>({})

  const regionMult = useMemo(() => {
    const found = countryRegions.find(r => r.key === city)
    return found ? found.mult : 1.0
  }, [city, countryRegions])
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
        label: `${item.emoji} ${editableNames[item.id] ?? item.nom}`,
        amount: getAmount(item, subtotalBeforePercent),
      }))
      .filter(b => b.amount > 0)
  }, [getAmount, enabled, selections, subtotalBeforePercent, mainItems, editableNames])

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
      for (const item of lineItemData) {
        if (prev[item.id] !== 'skip') {
          next[item.id] = level
        }
      }
      return next
    })
    setCustomBudgets(Object.fromEntries(lineItemData.map(i => [i.id, null])) as Record<string, number | null>)
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
      id, emoji: '➕', nom: t('ui.newPost'),
      description: t('ui.newPostDesc'),
      type: 'fixe', actif: true,
      conseil: '', messageDesactivation: '',
      niveaux: {
        eco: { label: t('ui.budgetMin'), base: 200 },
        classique: { label: t('ui.budgetMid'), base: 500 },
        premium: { label: t('ui.budgetMax'), base: 1500 },
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
    const text = `${t('shareText.myWedding')} : ~${Math.round(total).toLocaleString()} € — ${guestCount} ${t('shareText.guests')} (${Math.round(total / guestCount)} €/${t('shareText.perPerson')})`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    track('budget_copy', { total: Math.round(total), guests: guestCount })
  }

  const handleShare = () => {
    const text = `${t('shareText.myWedding')} : ~${Math.round(total).toLocaleString()} € — ${guestCount} ${t('shareText.guests')} ${t('shareText.viaKaatch')}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    track('budget_share', { total: Math.round(total), guests: guestCount })
  }

  const fmtEUR = (n: number) =>
    new Intl.NumberFormat('fr-FR').format(Math.round(n)).replace(/ | /g, ' ') + ' €'

  const styleLabel = { intimate: t('styles.intimate'), convivial: t('styles.convivial'), grandiose: t('styles.grandiose') }[style] ?? style
  const regionLabel = regions.find(r => r.value === city)?.label ?? t('ui.notSpecified')

  const sanitizePdf = (s: string): string =>
    s.replace(/['']/g, "'").replace(/[""]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/[^\x20-\xFF]/g, '')

  const handlePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()
    const ML = 14, MR = 14, TOP = 14, BOT = H - 14
    const CREAM = '#f5f0e8'
    const SAGE = '#4a5240'
    const SAGE_DARK = '#2d3228'
    const WARM = '#9c8e77'
    const LINE = '#d4cfc7'

    // background
    doc.setFillColor(CREAM)
    doc.rect(0, 0, W, H, 'F')

    // header band
    doc.setFillColor(SAGE_DARK)
    doc.rect(0, 0, W, 22, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor('#ffffff')
    doc.setCharSpace(2)
    doc.text('KAATCH.FR', W / 2, 8, { align: 'center' })
    doc.setCharSpace(0)
    doc.setFontSize(13)
    doc.text(sanitizePdf(t('pdf.title')), W / 2, 16, { align: 'center' })

    let y = 30

    // meta line: guests · date · region · style
    const dateFmt = dateEvent
      ? new Date(dateEvent + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : null
    const metaParts = [
      `${guestCount} invites`,
      dateFmt ? sanitizePdf(dateFmt) : null,
      sanitizePdf(regionLabel),
      sanitizePdf(styleLabel),
    ].filter(Boolean).join('  ·  ')
    doc.setFontSize(7)
    doc.setTextColor(WARM)
    doc.text(metaParts, W / 2, y, { align: 'center' })
    y += 9

    // total box
    const boxH = 22
    doc.setFillColor('#ffffff')
    doc.roundedRect(ML, y, W - ML - MR, boxH, 3, 3, 'F')
    doc.setFontSize(6.5)
    doc.setTextColor(WARM)
    doc.text(sanitizePdf(t('pdf.totalEstimated')).toUpperCase(), W / 2, y + 6.5, { align: 'center' })
    doc.setFontSize(18)
    doc.setTextColor(SAGE)
    doc.text(sanitizePdf(fmtEUR(total)), W / 2, y + 15, { align: 'center' })
    doc.setFontSize(6.5)
    doc.setTextColor(WARM)
    doc.text(`~ ${sanitizePdf(fmtEUR(Math.round(total / Math.max(guestCount, 1))))} / invit${guestCount > 1 ? 'e' : 'e'}`, W / 2, y + 20, { align: 'center' })
    y += boxH + 8

    // chart from canvas
    const chartCanvas = canvasRef.current
    if (chartCanvas && total > 0) {
      try {
        const chartImg = chartCanvas.toDataURL('image/png')
        const chartSize = 44
        const chartX = W / 2 - chartSize / 2
        doc.addImage(chartImg, 'PNG', chartX, y, chartSize, chartSize)
        y += chartSize + 6
      } catch { y += 4 }
    }

    // items list — 2 columns
    const COLS = 2
    const GAP = 6
    const CW = (W - ML - MR - GAP) / COLS
    const COL_X = [ML, ML + CW + GAP]
    // reserve 30mm at bottom for total row + honeymoon note + breathing room
    const ITEM_FLOOR = BOT - 30
    const itemRows = Math.ceil(breakdown.length / 2)
    const availH = ITEM_FLOOR - y - 9
    const IH = itemRows > 0 ? Math.max(5.5, Math.min(7, availH / itemRows)) : 7
    const DOT_PALETTE = [SAGE, '#7a9468', '#b5c9a8', '#c4a882', '#8fa87e', '#6b7c5e', '#4a5240', '#9cb492', '#d4b896', '#a0b890']

    doc.setDrawColor(LINE)
    doc.setLineWidth(0.25)

    // column headers
    doc.setFontSize(5.5)
    doc.setTextColor(WARM)
    const headers = [t('pdf.post'), t('pdf.amount')]
    for (let c = 0; c < COLS; c++) {
      doc.text(sanitizePdf(headers[0]).toUpperCase(), COL_X[c] + 5, y, { baseline: 'middle' })
      doc.text(sanitizePdf(headers[1]).toUpperCase(), COL_X[c] + CW - 2, y, { align: 'right', baseline: 'middle' })
    }
    y += 3
    doc.line(ML, y, W - MR, y)
    y += 3

    let col = 0
    let colY = [y, y]

    breakdown.forEach((b, i) => {
      const item = [...lineItems, ...customItems].find(ii => ii.id === b.id)
      const displayName = sanitizePdf(editableNames[b.id] ?? item?.nom ?? b.label)
      const amount = sanitizePdf(fmtEUR(b.amount))
      const pct = total > 0 ? Math.round(b.amount / total * 100) : 0
      const cx = COL_X[col]
      const cy = colY[col]

      if (cy + IH > ITEM_FLOOR) {
        return
      }

      // dot
      const dotColor = DOT_PALETTE[i % DOT_PALETTE.length]
      doc.setFillColor(dotColor)
      doc.circle(cx + 1.5, cy + IH / 2 - 1, 1.5, 'F')

      // name
      doc.setFontSize(6.8)
      doc.setTextColor(SAGE_DARK)
      doc.text(displayName, cx + 5, cy + IH / 2 - 0.5, { baseline: 'middle', maxWidth: CW - 30 })

      // pct
      doc.setFontSize(5.5)
      doc.setTextColor(WARM)
      doc.text(`${pct}%`, cx + CW - 18, cy + IH / 2 - 0.5, { align: 'right', baseline: 'middle' })

      // amount
      doc.setFontSize(6.8)
      doc.setTextColor(SAGE)
      doc.text(amount, cx + CW - 2, cy + IH / 2 - 0.5, { align: 'right', baseline: 'middle' })

      // separator line
      doc.setDrawColor(LINE)
      doc.line(cx, cy + IH - 0.5, cx + CW, cy + IH - 0.5)

      colY[col] += IH

      // alternate columns
      col = 1 - col
    })

    // honeymoon note + total row — always rendered in reserved bottom zone
    y = Math.min(Math.max(colY[0], colY[1]) + 4, BOT - 26)
    if (honeymoonAmount > 0) {
      doc.setFontSize(6.5)
      doc.setTextColor(WARM)
      doc.text(sanitizePdf(`${t('pdf.honeymoon')} : ${fmtEUR(honeymoonAmount)} (hors total)`), ML, y)
      y += 7
    }

    // total row
    doc.setDrawColor(SAGE)
    doc.setLineWidth(0.4)
    doc.line(ML, y, W - MR, y)
    y += 5
    doc.setFontSize(8)
    doc.setTextColor(SAGE_DARK)
    doc.text(sanitizePdf(t('pdf.total')), ML, y)
    doc.setFontSize(10)
    doc.setTextColor(SAGE)
    doc.text(sanitizePdf(fmtEUR(total)), W - MR, y, { align: 'right' })

    // footer
    doc.setFillColor(SAGE_DARK)
    doc.rect(0, H - 10, W, 10, 'F')
    doc.setFontSize(5.5)
    doc.setTextColor('#ffffff')
    const today = new Date().toLocaleDateString('fr-FR')
    doc.text(`kaatch.fr  ·  ${sanitizePdf(t('pdf.generatedOn'))} ${today}`, W / 2, H - 4, { align: 'center' })

    doc.save('budget-mariage.pdf')
    track('budget_pdf_download', { total: Math.round(total), guests: guestCount, style, region: city })
  }

  const handleExcel = async () => {
    const XLSX = await import('xlsx')
    const headerRows: (string | number)[][] = [
      [t('excel.title')],
      [`${guestCount} ${t('inputs.guests').toLowerCase()} · ${regionLabel} · ${t('inputs.style')} ${styleLabel}`],
      [],
      [t('pdf.post'), t('pdf.styleCol'), `${t('pdf.amount')} (€)`],
    ]
    const dataRows: (string | number)[][] = breakdown.map(b => {
      const item = [...lineItems, ...customItems].find(i => i.id === b.id)
      const sel = selections[b.id]
      const lvl = customBudgets[b.id] !== null ? t('ui.quote') : (levelLabels[sel] || '—')
      return [item?.nom ?? b.label, lvl, Math.round(b.amount)]
    })
    const totalRow: (string | number)[] = [t('pdf.total'), '', Math.round(total)]
    const perGuestRow: (string | number)[] = [`${t('excel.perGuest')} (≈ ${guestCount})`, '', Math.round(total / Math.max(guestCount, 1))]
    const honeymoonRows: (string | number)[][] = honeymoonAmount > 0
      ? [[], [t('pdf.honeymoon'), '', Math.round(honeymoonAmount)]]
      : []

    const aoa = [...headerRows, ...dataRows, [], totalRow, perGuestRow, ...honeymoonRows]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = [{ wch: 36 }, { wch: 12 }, { wch: 16 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Budget')
    XLSX.writeFile(wb, 'budget-mariage.xlsx')
    track('budget_excel_download', { total: Math.round(total), guests: guestCount, style, region: city })
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
              levelLabel: customBudgets[item.id] !== null ? t('ui.quote') : levelLabels[sel],
              amount: Math.round(amount),
              horsTotal: !!item.horsTotal,
            }
          })
          .filter(x => x.amount > 0),
      }
      localStorage.setItem('kaatch_budget_simulation', JSON.stringify(payload))
    } catch {}
    track('budget_organize_kaatch', { total: Math.round(total), guests: guestCount })
    const params = new URLSearchParams(window.location.search)
    const returnTo = params.get('return')
    if (returnTo && returnTo.startsWith('/mariage/')) {
      window.location.href = `${returnTo}?from=budget-simulation`
    } else {
      window.location.href = '/dashboard?from=budget-simulation'
    }
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
              <span className="text-[0.82rem] tracking-[-0.01em]" style={{ fontFamily: BODY, fontWeight: 400, color: GREEN_DARK }}>{editableNames[item.id] ?? item.nom}</span>
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
              {item.horsTotal && <span className="block text-stone-400 mt-1 text-[0.65rem]">⚠️ {t('ui.notIncludedMain')}</span>}
            </div>
          )}
          {!isExpanded && isEnabled && sel !== 'skip' && (
            <span className="text-[0.65rem] tracking-wide uppercase text-stone-400 hidden sm:inline" style={{ fontWeight: 300 }}>
              {hasCustom ? t('ui.quote').toLowerCase() : levelLabels[sel]}
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
            {/* Renommer la catégorie */}
            <div className="flex items-center gap-2">
              <span className="text-[0.6rem] uppercase tracking-wider text-stone-300 shrink-0" style={{ fontWeight: 300 }}>Nom</span>
              <input
                type="text"
                value={editableNames[item.id] ?? item.nom}
                onChange={e => setEditableNames(prev => ({ ...prev, [item.id]: e.target.value }))}
                onClick={e => e.stopPropagation()}
                className="flex-1 text-[0.8rem] bg-transparent border-b border-dashed border-stone-200 focus:border-[#4a5240] outline-none py-0.5 text-stone-700"
                style={{ fontFamily: BODY, fontWeight: 400 }}
              />
              {editableNames[item.id] !== undefined && editableNames[item.id] !== item.nom && (
                <button
                  onClick={e => { e.stopPropagation(); setEditableNames(prev => { const n = { ...prev }; delete n[item.id]; return n }) }}
                  className="text-stone-300 hover:text-stone-500 text-xs transition shrink-0"
                  title="Rétablir le nom par défaut"
                >↩</button>
              )}
            </div>
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
                    <span className="text-[0.65rem] text-stone-300 uppercase tracking-wider">{t('ui.or')}</span>
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="number"
                        placeholder={t('ui.myQuote')}
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
                    {item.type === 'par_invite' && t('ui.perInvite')}
                    {item.type === 'fixe' && t('ui.flat')}
                    {item.type === 'pourcentage' && t('ui.percentTotal')}
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
              {t('inputs.guests')}
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
              {t('inputs.region')}
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
              {t('inputs.style')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'intimate', emoji: '🌱', label: t('styles.intimate') },
                { id: 'convivial', emoji: '💚', label: t('styles.convivial') },
                { id: 'grandiose', emoji: '✨', label: t('styles.grandiose') },
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

        {/* Date du mariage */}
        <div className="mt-5 pt-5 border-t border-stone-100 flex items-center gap-3">
          <label className="text-[0.65rem] uppercase tracking-wider text-stone-400 shrink-0" style={{ fontWeight: 300 }}>
            Date du mariage
          </label>
          <input
            type="date"
            value={dateEvent}
            onChange={e => setDateEvent(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 rounded-xl text-[0.82rem] focus:outline-none focus:ring-1 focus:ring-[#4a5240]/30 transition text-stone-600"
            style={{ fontFamily: BODY, fontWeight: 300 }}
          />
          {dateEvent && (
            <button onClick={() => setDateEvent('')} className="text-stone-300 hover:text-stone-500 text-sm transition">×</button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Accordion */}
        <div>
          <div className="bg-white rounded-2xl border border-stone-100 py-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="px-5 pt-4 pb-2">
              <h2 className="text-[0.82rem] tracking-[-0.01em]" style={{ fontFamily: BODY, fontWeight: 400, color: GREEN_DARK }}>
                {t('ui.detailPosts')}
              </h2>
            </div>
            {mainItems.map(item => renderRow(item))}
            <div className="px-5 py-3">
              <button
                onClick={addCustomItem}
                className="w-full py-2.5 rounded-xl border border-dashed border-stone-200 text-[0.75rem] text-stone-400 hover:border-stone-300 hover:text-stone-500 transition-all"
                style={{ fontWeight: 300 }}
              >
                {t('ui.addPost')}
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 bg-white rounded-2xl border border-stone-100 p-6 flex items-center justify-between" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div>
              <div className="text-[0.82rem]" style={{ fontWeight: 400, color: GREEN_DARK }}>{t('ui.readyToOrganize')}</div>
              <div className="text-[0.72rem] text-stone-400" style={{ fontWeight: 300 }}>{t('ui.turnIntoAction')}</div>
            </div>
            <a
              href="/dashboard?from=budget-simulation"
              onClick={handleOrganiserKaatch}
              className="px-5 py-2.5 bg-[#4a5240] text-white rounded-xl text-[0.75rem] hover:bg-[#2d3228] transition-all flex-shrink-0"
              style={{ fontWeight: 400 }}
            >
              {t('ui.organizeOnKaatch')}
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div>
              <div className="text-[0.65rem] uppercase tracking-wider text-stone-400 mb-1" style={{ fontWeight: 300 }}>{t('ui.estimatedBudget')}</div>
              <div className="text-3xl tabular-nums tracking-tight" style={{ fontFamily: BODY, fontWeight: 300, color: GREEN }}>
                {Math.round(total).toLocaleString()} €
              </div>
              <div className="text-[0.72rem] text-stone-400 mt-0.5" style={{ fontWeight: 300 }}>
                ≈ {guestCount > 0 ? Math.round(total / guestCount) : 0} {t('ui.perGuest')}
              </div>
            </div>

            {honeymoonAmount > 0 && (
              <div className="text-[0.72rem] text-stone-400 pt-3 border-t border-stone-100" style={{ fontWeight: 300 }}>
                {t('ui.honeymoonPlus')} <span className="text-stone-500">{Math.round(honeymoonAmount).toLocaleString()} €</span>
                <span className="block text-stone-300 mt-0.5">{t('ui.honeymoonNote')}</span>
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
                  {copied ? t('ui.copied') : t('ui.copy')}
                </button>
                <button
                  onClick={handleShare}
                  className="py-2.5 rounded-xl text-[0.75rem] bg-stone-50 text-stone-500 hover:bg-stone-100 transition-all"
                  style={{ fontWeight: 300 }}
                >
                  {t('ui.share')}
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
