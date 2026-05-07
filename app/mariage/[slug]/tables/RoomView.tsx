'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type Table = {
  id: string
  name: string
  capacity: number
  pos_x: number | null
  pos_y: number | null
}

type Guest = {
  id: string
  first_name: string
  last_name: string | null
  rsvp_status: string
  table_id: string | null
  guest_type: string
}

type RoomObject = {
  id: string
  type: string
  label: string | null
  pos_x: number
  pos_y: number
  width: number
  height: number
}

type Props = {
  tables: Table[]
  guests: Guest[]
  weddingId: string
  roomObjects: RoomObject[]
}

const W = 1000
const H = 620
const R = 46

// Palette d'objets disponibles
const OBJECT_PALETTE: { type: string; label: string; emoji: string; w: number; h: number; fill: string; stroke: string }[] = [
  { type: 'scene',      label: 'Scène',           emoji: '🎭', w: 200, h: 55,  fill: '#ede8df', stroke: '#b8b0a4' },
  { type: 'dancefloor', label: 'Piste de danse',  emoji: '💃', w: 150, h: 150, fill: '#e8e4f0', stroke: '#a09ab8' },
  { type: 'bar',        label: 'Bar',             emoji: '🍹', w: 110, h: 50,  fill: '#f0ede8', stroke: '#b8b0a4' },
  { type: 'cocktail',   label: 'Cocktail',        emoji: '🥂', w: 110, h: 50,  fill: '#f0ede8', stroke: '#b8b0a4' },
  { type: 'dj',         label: 'DJ / Orchestre',  emoji: '🎵', w: 110, h: 55,  fill: '#f0ede8', stroke: '#b8b0a4' },
  { type: 'photobooth', label: 'Photobooth',      emoji: '📸', w: 85,  h: 85,  fill: '#f0ede8', stroke: '#b8b0a4' },
  { type: 'entrance',   label: 'Entrée',          emoji: '🚪', w: 55,  h: 18,  fill: '#e8f0e4', stroke: '#8faa80' },
  { type: 'garden',     label: 'Jardin / Terrasse',emoji: '🌿', w: 160, h: 80,  fill: '#e8f0e4', stroke: '#8faa80' },
  { type: 'toilettes',  label: 'Toilettes',       emoji: '🚻', w: 70,  h: 55,  fill: '#e8eef5', stroke: '#7fa8c0' },
  { type: 'custom',     label: 'Personnalisé',    emoji: '✏️', w: 120, h: 55,  fill: '#f5f5f0', stroke: '#b0aba0' },
]

function getPalette(type: string) {
  return OBJECT_PALETTE.find(p => p.type === type) ?? OBJECT_PALETTE[0]
}

function autoLayout(tables: Table[]): Record<string, { x: number; y: number }> {
  const cols = Math.ceil(Math.sqrt(tables.length))
  const colW = (W - 120) / Math.max(cols, 1)
  const rows = Math.ceil(tables.length / cols)
  const rowH = (H - 120) / Math.max(rows, 1)
  const result: Record<string, { x: number; y: number }> = {}
  tables.forEach((t, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    result[t.id] = { x: 80 + col * colW + colW / 2, y: 80 + row * rowH + rowH / 2 }
  })
  return result
}

export default function RoomView({ tables, guests, weddingId, roomObjects: initialObjects }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Table positions ---
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const auto = autoLayout(tables)
    const result: Record<string, { x: number; y: number }> = {}
    tables.forEach(t => {
      result[t.id] = (t.pos_x != null && t.pos_y != null) ? { x: t.pos_x, y: t.pos_y } : auto[t.id]
    })
    return result
  })

  // --- Room objects ---
  const [objects, setObjects] = useState<RoomObject[]>(initialObjects)

  // --- Drag state: { kind: 'table'|'object', id, ox, oy } ---
  const [dragging, setDragging] = useState<{ kind: 'table' | 'object'; id: string; ox: number; oy: number } | null>(null)

  // --- Selection ---
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedObj, setSelectedObj] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [addingObj, setAddingObj] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [customLabelInput, setCustomLabelInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [exporting, setExporting] = useState(false)
  const svgWrapRef = useRef<HTMLDivElement>(null)

  const svgPoint = useCallback((e: MouseEvent | Touch): { x: number; y: number } | null => {
    const svg = svgRef.current
    if (!svg) return null
    const pt = svg.createSVGPoint()
    pt.x = 'clientX' in e ? e.clientX : (e as Touch).clientX
    pt.y = 'clientY' in e ? e.clientY : (e as Touch).clientY
    const { x, y } = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    return { x, y }
  }, [])

  const saveTablePos = useCallback((id: string, x: number, y: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaving(true)
    saveTimer.current = setTimeout(async () => {
      await fetch('/api/table-position', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: id, x, y }),
      })
      setSaving(false)
    }, 600)
  }, [])

  const saveObjPos = useCallback((id: string, x: number, y: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaving(true)
    saveTimer.current = setTimeout(async () => {
      await fetch('/api/room-object', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pos_x: x, pos_y: y }),
      })
      setSaving(false)
    }, 600)
  }, [])

  // --- Global mouse/touch handlers ---
  useEffect(() => {
    function clampTable(v: number, max: number) { return Math.max(R + 5, Math.min(max - R - 5, v)) }
    function clampObj(v: number, size: number, max: number) { return Math.max(size / 2 + 5, Math.min(max - size / 2 - 5, v)) }

    function onMouseMove(e: MouseEvent) {
      if (!dragging) return
      const pt = svgPoint(e)
      if (!pt) return
      if (dragging.kind === 'table') {
        const x = clampTable(pt.x + dragging.ox, W)
        const y = clampTable(pt.y + dragging.oy, H)
        setPositions(prev => ({ ...prev, [dragging.id]: { x, y } }))
      } else {
        const obj = objects.find(o => o.id === dragging.id)
        const x = clampObj(pt.x + dragging.ox, obj?.width ?? 120, W)
        const y = clampObj(pt.y + dragging.oy, obj?.height ?? 80, H)
        setObjects(prev => prev.map(o => o.id === dragging.id ? { ...o, pos_x: x, pos_y: y } : o))
      }
    }

    function onMouseUp(e: MouseEvent) {
      if (!dragging) return
      const pt = svgPoint(e)
      if (pt) {
        if (dragging.kind === 'table') {
          const x = clampTable(pt.x + dragging.ox, W)
          const y = clampTable(pt.y + dragging.oy, H)
          saveTablePos(dragging.id, x, y)
        } else {
          const obj = objects.find(o => o.id === dragging.id)
          const x = clampObj(pt.x + dragging.ox, obj?.width ?? 120, W)
          const y = clampObj(pt.y + dragging.oy, obj?.height ?? 80, H)
          saveObjPos(dragging.id, x, y)
        }
      }
      setDragging(null)
    }

    function onTouchMove(e: TouchEvent) {
      if (!dragging) return
      e.preventDefault()
      const pt = svgPoint(e.touches[0])
      if (!pt) return
      if (dragging.kind === 'table') {
        const x = clampTable(pt.x + dragging.ox, W)
        const y = clampTable(pt.y + dragging.oy, H)
        setPositions(prev => ({ ...prev, [dragging.id]: { x, y } }))
      } else {
        const obj = objects.find(o => o.id === dragging.id)
        const x = clampObj(pt.x + dragging.ox, obj?.width ?? 120, W)
        const y = clampObj(pt.y + dragging.oy, obj?.height ?? 80, H)
        setObjects(prev => prev.map(o => o.id === dragging.id ? { ...o, pos_x: x, pos_y: y } : o))
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (!dragging) return
      const touch = e.changedTouches[0]
      if (touch) {
        const pt = svgPoint(touch)
        if (pt) {
          if (dragging.kind === 'table') {
            const x = clampTable(pt.x + dragging.ox, W)
            const y = clampTable(pt.y + dragging.oy, H)
            saveTablePos(dragging.id, x, y)
          } else {
            const obj = objects.find(o => o.id === dragging.id)
            const x = clampObj(pt.x + dragging.ox, obj?.width ?? 120, W)
            const y = clampObj(pt.y + dragging.oy, obj?.height ?? 80, H)
            saveObjPos(dragging.id, x, y)
          }
        }
      }
      setDragging(null)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [dragging, svgPoint, saveTablePos, saveObjPos, objects])

  function startDragTable(e: React.MouseEvent | React.TouchEvent, id: string) {
    e.stopPropagation()
    const pt = svgPoint('touches' in e ? (e.touches[0] as unknown as Touch) : e.nativeEvent as MouseEvent)
    if (!pt) return
    const pos = positions[id] ?? { x: W / 2, y: H / 2 }
    setDragging({ kind: 'table', id, ox: pos.x - pt.x, oy: pos.y - pt.y })
    setSelectedTable(id)
    setSelectedObj(null)
  }

  function startDragObj(e: React.MouseEvent | React.TouchEvent, obj: RoomObject) {
    e.stopPropagation()
    const pt = svgPoint('touches' in e ? (e.touches[0] as unknown as Touch) : e.nativeEvent as MouseEvent)
    if (!pt) return
    setDragging({ kind: 'object', id: obj.id, ox: obj.pos_x - pt.x, oy: obj.pos_y - pt.y })
    setSelectedObj(obj.id)
    setSelectedTable(null)
  }

  async function addObject(type: string, labelOverride?: string) {
    const def = OBJECT_PALETTE.find(p => p.type === type)!
    setAddingObj(true)
    setShowPalette(false)
    setShowCustomInput(false)
    setCustomLabelInput('')
    try {
      const res = await fetch('/api/room-object', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          type,
          pos_x: W / 2,
          pos_y: H / 2,
          width: def.w,
          height: def.h,
          label: labelOverride ?? def.label,
        }),
      })
      const obj = await res.json()
      if (obj.id) setObjects(prev => [...prev, obj])
    } finally {
      setAddingObj(false)
    }
  }

  async function exportPDF() {
    const svg = svgRef.current
    if (!svg) return
    setExporting(true)
    try {
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = url
      })
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = svg.clientWidth * scale
      canvas.height = svg.clientHeight * scale
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const imgData = canvas.toDataURL('image/png')
      const { jsPDF } = await import('jspdf')
      // Landscape A4
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const W_mm = pdf.internal.pageSize.getWidth()
      const H_mm = pdf.internal.pageSize.getHeight()
      // Fit image maintaining aspect ratio
      const imgRatio = canvas.width / canvas.height
      const pageRatio = W_mm / H_mm
      let iw = W_mm, ih = H_mm
      if (imgRatio > pageRatio) { ih = W_mm / imgRatio } else { iw = H_mm * imgRatio }
      const ox = (W_mm - iw) / 2
      const oy = (H_mm - ih) / 2
      pdf.addImage(imgData, 'PNG', ox, oy, iw, ih)
      pdf.setFontSize(6)
      pdf.setTextColor(200, 200, 200)
      pdf.text('Plan de table — Kaatch', W_mm - 4, H_mm - 3, { align: 'right' })
      pdf.save('plan-de-table.pdf')
    } finally {
      setExporting(false)
    }
  }

  async function deleteObject(id: string) {
    setObjects(prev => prev.filter(o => o.id !== id))
    setSelectedObj(null)
    await fetch('/api/room-object', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  function resetLayout() {
    const auto = autoLayout(tables)
    setPositions(auto)
    tables.forEach(t => {
      const pos = auto[t.id]
      saveTablePos(t.id, pos.x, pos.y)
    })
  }

  const selTable = selectedTable ? tables.find(t => t.id === selectedTable) : null
  const selTableGuests = selectedTable ? guests.filter(g => g.table_id === selectedTable) : []
  const selObj = selectedObj ? objects.find(o => o.id === selectedObj) : null
  const unassigned = guests.filter(g => !g.table_id)

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-500">
            {guests.length - unassigned.length} / {guests.length} invités placés
          </span>
          {unassigned.length > 0 && (
            <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-amber-500">
              · {unassigned.length} sans table
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300">Sauvegarde…</span>
          )}
          {/* Add object button */}
          <div className="relative">
            <button
              onClick={() => { setShowPalette(p => !p); setShowCustomInput(false) }}
              disabled={addingObj}
              style={{ fontWeight: 300, fontSize: '0.78rem', fontFamily: 'var(--font-lato)' }}
              className="flex items-center gap-1.5 bg-[#4a5240] text-white px-3 py-1.5 rounded-xl hover:bg-[#2d3228] transition cursor-pointer disabled:opacity-50">
              {addingObj ? '…' : '+ Élément'}
            </button>

            {showPalette && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-stone-100 rounded-2xl shadow-lg z-50 p-3 w-64">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                   className="text-stone-400 uppercase mb-2.5">Ajouter un élément</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {OBJECT_PALETTE.filter(o => o.type !== 'custom').map(obj => (
                    <button key={obj.type}
                      onClick={() => addObject(obj.type)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-[#f5f0e8] transition text-left cursor-pointer"
                      style={{ fontWeight: 300, fontSize: '0.78rem', color: '#44403c' }}>
                      <span>{obj.emoji}</span>
                      <span>{obj.label}</span>
                    </button>
                  ))}
                </div>
                {/* Custom element */}
                <div className="mt-2 pt-2 border-t border-stone-50">
                  {showCustomInput ? (
                    <div className="flex gap-1.5">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Nom de l'élément…"
                        value={customLabelInput}
                        onChange={e => setCustomLabelInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && customLabelInput.trim()) addObject('custom', customLabelInput.trim())
                          if (e.key === 'Escape') { setShowCustomInput(false); setCustomLabelInput('') }
                        }}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 outline-none focus:border-[#4a5240]"
                        style={{ fontWeight: 300 }}
                      />
                      <button
                        onClick={() => customLabelInput.trim() && addObject('custom', customLabelInput.trim())}
                        disabled={!customLabelInput.trim()}
                        className="px-2.5 py-1.5 rounded-lg bg-[#4a5240] text-white text-xs disabled:opacity-40 cursor-pointer"
                        style={{ fontWeight: 300 }}>
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCustomInput(true)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-[#f5f0e8] transition text-left cursor-pointer"
                      style={{ fontWeight: 300, fontSize: '0.78rem', color: '#44403c' }}>
                      <span>✏️</span>
                      <span>Personnalisé…</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={exportPDF} disabled={exporting}
            style={{ fontWeight: 300, fontSize: '0.72rem' }}
            className="text-stone-400 hover:text-[#4a5240] transition cursor-pointer border border-stone-200 px-3 py-1.5 rounded-xl hover:border-[#4a5240]/30 disabled:opacity-50">
            {exporting ? '…' : '↓ Exporter PDF'}
          </button>

          <button onClick={resetLayout}
            style={{ fontWeight: 300, fontSize: '0.72rem' }}
            className="text-stone-400 hover:text-[#4a5240] transition cursor-pointer border border-stone-200 px-3 py-1.5 rounded-xl hover:border-[#4a5240]/30">
            Réorganiser
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-start">

        {/* SVG Room */}
        <div className="flex-1 min-w-0">
          <div ref={svgWrapRef} className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-sm"
               style={{ cursor: dragging ? 'grabbing' : 'default' }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              style={{ width: '100%', display: 'block', userSelect: 'none' }}
              onClick={() => { setSelectedTable(null); setSelectedObj(null); setShowPalette(false) }}>

              {/* Background */}
              <rect width={W} height={H} fill="#faf9f7" />

              {/* Grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ece9e4" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width={W} height={H} fill="url(#grid)" />

              {/* Room border */}
              <rect x="20" y="20" width={W - 40} height={H - 40}
                fill="none" stroke="#ddd8d0" strokeWidth="1.5" strokeDasharray="6 4" rx="8" />

              {/* ─── Room Objects (rectangles) ─── */}
              {objects.map(obj => {
                const def = getPalette(obj.type)
                const w = obj.width
                const h = obj.height
                const x = obj.pos_x - w / 2
                const y = obj.pos_y - h / 2
                const isSel = selectedObj === obj.id
                const isDraggingThis = dragging?.id === obj.id && dragging.kind === 'object'

                return (
                  <g key={obj.id}
                    style={{ cursor: isDraggingThis ? 'grabbing' : 'grab' }}
                    onMouseDown={e => startDragObj(e, obj)}
                    onTouchStart={e => startDragObj(e, obj)}
                    onClick={e => { e.stopPropagation(); if (!isDraggingThis) { setSelectedObj(obj.id); setSelectedTable(null) } }}>

                    {/* Shadow */}
                    <rect x={x + 2} y={y + 3} width={w} height={h} rx="6" fill="rgba(0,0,0,0.06)" />

                    {/* Body */}
                    <rect x={x} y={y} width={w} height={h} rx="6"
                      fill={isSel ? '#4a5240' : def.fill}
                      stroke={isSel ? '#4a5240' : def.stroke}
                      strokeWidth={isSel ? 2 : 1.5} />

                    {/* Emoji */}
                    <text x={obj.pos_x - (h > 60 ? 0 : w / 2 - 14)} y={obj.pos_y - (h > 60 ? 8 : 0)}
                      textAnchor="middle" dominantBaseline="middle"
                      style={{ fontSize: h > 60 ? '20px' : '14px', pointerEvents: 'none' }}>
                      {def.emoji}
                    </text>

                    {/* Label */}
                    <text x={obj.pos_x} y={obj.pos_y + (h > 60 ? 14 : 0)}
                      textAnchor="middle" dominantBaseline="middle"
                      style={{ fontFamily: 'var(--font-lato)', fontSize: h > 60 ? '11px' : '10px',
                               fontWeight: 300, fill: isSel ? 'rgba(255,255,255,0.85)' : '#78716c',
                               pointerEvents: 'none' }}>
                      {obj.label ?? def.label}
                    </text>
                  </g>
                )
              })}

              {/* ─── Tables (circles) ─── */}
              {tables.map(table => {
                const pos = positions[table.id] ?? { x: W / 2, y: H / 2 }
                const tableGuests = guests.filter(g => g.table_id === table.id)
                const pct = table.capacity > 0 ? tableGuests.length / table.capacity : 0
                const isFull = tableGuests.length >= table.capacity
                const isSel = selectedTable === table.id
                const isDraggingThis = dragging?.id === table.id && dragging.kind === 'table'

                const fillColor = isSel ? '#4a5240' : isFull ? '#f5f0e8' : 'white'
                const strokeColor = isSel ? '#4a5240' : isFull ? '#c9c0b3' : '#d6d3d1'
                const textColor = isSel ? 'white' : '#2d3228'
                const countColor = isSel ? 'rgba(255,255,255,0.7)' : '#a8a29e'

                return (
                  <g key={table.id}
                    style={{ cursor: isDraggingThis ? 'grabbing' : 'grab' }}
                    onMouseDown={e => startDragTable(e, table.id)}
                    onTouchStart={e => startDragTable(e, table.id)}
                    onClick={e => { e.stopPropagation(); if (!isDraggingThis) { setSelectedTable(table.id); setSelectedObj(null) } }}>

                    <circle cx={pos.x + 2} cy={pos.y + 3} r={R} fill="rgba(0,0,0,0.06)" />
                    <circle cx={pos.x} cy={pos.y} r={R}
                      fill={fillColor} stroke={strokeColor}
                      strokeWidth={isSel ? 2 : 1.5} />

                    {pct > 0 && pct < 1 && (
                      <circle cx={pos.x} cy={pos.y} r={R - 4}
                        fill="none" stroke="#4a5240" strokeWidth="3" strokeOpacity="0.25"
                        strokeDasharray={`${pct * 2 * Math.PI * (R - 4)} ${2 * Math.PI * (R - 4)}`}
                        strokeDashoffset={Math.PI * (R - 4) / 2}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${pos.x} ${pos.y})`} />
                    )}
                    {isFull && (
                      <circle cx={pos.x} cy={pos.y} r={R - 4}
                        fill="none" stroke="#4a5240" strokeWidth="3" strokeOpacity="0.3" />
                    )}

                    <text x={pos.x} y={pos.y - 5} textAnchor="middle" dominantBaseline="middle"
                      style={{ fontFamily: 'var(--font-lato)', fontSize: '13px', fontWeight: 500, fill: textColor, pointerEvents: 'none' }}>
                      {table.name.length > 10 ? table.name.slice(0, 9) + '…' : table.name}
                    </text>
                    <text x={pos.x} y={pos.y + 13} textAnchor="middle"
                      style={{ fontFamily: 'var(--font-lato)', fontSize: '11px', fontWeight: 300, fill: countColor, pointerEvents: 'none' }}>
                      {tableGuests.length}/{table.capacity}
                    </text>
                  </g>
                )
              })}

              {tables.length === 0 && objects.length === 0 && (
                <text x={W / 2} y={H / 2} textAnchor="middle"
                  style={{ fontFamily: 'var(--font-lato)', fontSize: '14px', fontWeight: 300, fill: '#c7c3c0' }}>
                  Créez des tables dans l'onglet Organisation · ajoutez des éléments avec le bouton ci-dessus
                </text>
              )}
            </svg>
          </div>
          <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 text-center mt-2">
            Glissez pour repositionner · Cliquez pour sélectionner · Bouton + pour ajouter scène, bar, piste…
          </p>
        </div>

        {/* Side panel */}
        <div className="w-64 shrink-0 space-y-3">

          {/* Selected table */}
          {selTable && (
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-50 flex items-center justify-between">
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-[#2d3228]">{selTable.name}</p>
                  <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mt-0.5">
                    {selTableGuests.length} / {selTable.capacity} places
                  </p>
                </div>
                <button onClick={() => setSelectedTable(null)} className="text-stone-300 hover:text-stone-500 cursor-pointer text-lg leading-none">×</button>
              </div>
              <div className="px-4 py-2">
                {selTableGuests.length === 0 ? (
                  <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300 py-3 text-center italic">Table vide</p>
                ) : (
                  <ul className="divide-y divide-stone-50">
                    {selTableGuests.map(g => (
                      <li key={g.id} className="flex items-center gap-2 py-2">
                        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                          <span style={{ fontWeight: 500, fontSize: '0.6rem' }} className="text-stone-500">{g.first_name[0]?.toUpperCase()}</span>
                        </div>
                        <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-700 truncate">
                          {g.first_name}{g.last_name ? ` ${g.last_name}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Selected object */}
          {selObj && (
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPalette(selObj.type).emoji}</span>
                  <p style={{ fontWeight: 400, fontSize: '0.88rem' }} className="text-[#2d3228]">
                    {selObj.label ?? getPalette(selObj.type).label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteObject(selObj.id)}
                    className="text-xs text-red-300 hover:text-red-500 transition cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50"
                    style={{ fontWeight: 300 }}>
                    Retirer
                  </button>
                  <button onClick={() => setSelectedObj(null)} className="text-stone-300 hover:text-stone-500 cursor-pointer text-lg leading-none">×</button>
                </div>
              </div>
            </div>
          )}

          {/* Default state */}
          {!selTable && !selObj && (
            <div className="bg-white rounded-2xl border border-stone-100 p-4">
              <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 text-center">
                Cliquez sur une table ou un élément pour le sélectionner
              </p>
            </div>
          )}

          {/* Unassigned guests — visually distinct section */}
          {unassigned.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)', border: '1.5px dashed #f59e0b' }}>
              <div className="px-4 py-3 flex items-center gap-2 border-b border-amber-100">
                <span className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                  <span style={{ fontWeight: 700, fontSize: '0.6rem', color: 'white', lineHeight: 1 }}>{unassigned.length}</span>
                </span>
                <div className="flex-1">
                  <p style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-amber-700">Invités à placer</p>
                  <p style={{ fontWeight: 300, fontSize: '0.62rem' }} className="text-amber-400">
                    Assignez-les via l'onglet Organisation
                  </p>
                </div>
              </div>
              <ul className="px-3 py-1.5 max-h-52 overflow-y-auto space-y-0.5">
                {unassigned.map(g => (
                  <li key={g.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                         style={{ background: '#fde68a', border: '1px solid #f59e0b' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.6rem', color: '#92400e' }}>{g.first_name[0]?.toUpperCase()}</span>
                    </div>
                    <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-amber-900 truncate">
                      {g.first_name}{g.last_name ? ` ${g.last_name}` : ''}
                    </span>
                    {g.guest_type === 'enfant' && (
                      <span style={{ fontSize: '0.6rem' }} className="text-amber-400 shrink-0">🧒</span>
                    )}
                    {g.guest_type === 'animal' && (
                      <span style={{ fontSize: '0.6rem' }} className="text-amber-400 shrink-0">🐾</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legend */}
          <div className="bg-white rounded-xl border border-stone-100 p-3 space-y-2">
            <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.15em' }} className="text-stone-300 uppercase mb-1">Légende</p>
            {[
              { color: 'bg-white border border-stone-200', label: 'Table — places libres', round: true },
              { color: 'bg-[#f5f0e8] border border-stone-300', label: 'Table — complète', round: true },
              { color: 'bg-[#4a5240]', label: 'Élément sélectionné', round: true },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <span className={`w-4 h-4 shrink-0 ${l.round ? 'rounded-full' : 'rounded'} ${l.color}`} />
                <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">{l.label}</span>
              </div>
            ))}
            <div className="pt-1 space-y-1.5">
              <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.15em' }} className="text-stone-300 uppercase">Éléments</p>
              {OBJECT_PALETTE.slice(0, 4).map(obj => (
                <div key={obj.type} className="flex items-center gap-2">
                  <span className="w-4 h-3 rounded shrink-0" style={{ background: obj.fill, border: `1px solid ${obj.stroke}` }} />
                  <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">{obj.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
