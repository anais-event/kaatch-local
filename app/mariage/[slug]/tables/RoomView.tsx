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

type Props = {
  tables: Table[]
  guests: Guest[]
}

const W = 1000
const H = 620
const R = 46

function autoLayout(tables: Table[]): Record<string, { x: number; y: number }> {
  const cols = Math.ceil(Math.sqrt(tables.length))
  const colW = (W - 120) / Math.max(cols, 1)
  const rows = Math.ceil(tables.length / cols)
  const rowH = (H - 120) / Math.max(rows, 1)
  const result: Record<string, { x: number; y: number }> = {}
  tables.forEach((t, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    result[t.id] = {
      x: 80 + col * colW + colW / 2,
      y: 80 + row * rowH + rowH / 2,
    }
  })
  return result
}

export default function RoomView({ tables, guests }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const auto = autoLayout(tables)
    const result: Record<string, { x: number; y: number }> = {}
    tables.forEach(t => {
      result[t.id] = (t.pos_x != null && t.pos_y != null)
        ? { x: t.pos_x, y: t.pos_y }
        : auto[t.id]
    })
    return result
  })

  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const svgPoint = useCallback((e: MouseEvent | Touch): { x: number; y: number } | null => {
    const svg = svgRef.current
    if (!svg) return null
    const pt = svg.createSVGPoint()
    const clientX = 'clientX' in e ? e.clientX : (e as Touch).clientX
    const clientY = 'clientY' in e ? e.clientY : (e as Touch).clientY
    pt.x = clientX
    pt.y = clientY
    const { x, y } = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    return { x, y }
  }, [])

  const savePosition = useCallback((id: string, x: number, y: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaving(id)
    saveTimer.current = setTimeout(async () => {
      await fetch('/api/table-position', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: id, x, y }),
      })
      setSaving(null)
    }, 600)
  }, [])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return
      const pt = svgPoint(e)
      if (!pt) return
      const x = Math.max(R + 5, Math.min(W - R - 5, pt.x + dragging.ox))
      const y = Math.max(R + 5, Math.min(H - R - 5, pt.y + dragging.oy))
      setPositions(prev => ({ ...prev, [dragging.id]: { x, y } }))
    }
    function onMouseUp(e: MouseEvent) {
      if (!dragging) return
      const pt = svgPoint(e)
      if (pt) {
        const x = Math.max(R + 5, Math.min(W - R - 5, pt.x + dragging.ox))
        const y = Math.max(R + 5, Math.min(H - R - 5, pt.y + dragging.oy))
        savePosition(dragging.id, x, y)
      }
      setDragging(null)
    }
    function onTouchMove(e: TouchEvent) {
      if (!dragging) return
      e.preventDefault()
      const pt = svgPoint(e.touches[0])
      if (!pt) return
      const x = Math.max(R + 5, Math.min(W - R - 5, pt.x + dragging.ox))
      const y = Math.max(R + 5, Math.min(H - R - 5, pt.y + dragging.oy))
      setPositions(prev => ({ ...prev, [dragging.id]: { x, y } }))
    }
    function onTouchEnd(e: TouchEvent) {
      if (!dragging) return
      const touch = e.changedTouches[0]
      if (touch) {
        const pt = svgPoint(touch)
        if (pt) {
          const x = Math.max(R + 5, Math.min(W - R - 5, pt.x + dragging.ox))
          const y = Math.max(R + 5, Math.min(H - R - 5, pt.y + dragging.oy))
          savePosition(dragging.id, x, y)
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
  }, [dragging, svgPoint, savePosition])

  function startDrag(e: React.MouseEvent | React.TouchEvent, id: string) {
    e.stopPropagation()
    const pt = svgPoint('touches' in e ? (e.touches[0] as unknown as Touch) : e.nativeEvent as MouseEvent)
    if (!pt) return
    const pos = positions[id] ?? { x: W / 2, y: H / 2 }
    setDragging({ id, ox: pos.x - pt.x, oy: pos.y - pt.y })
    setSelected(id)
  }

  const selectedGuests = selected ? guests.filter(g => g.table_id === selected) : []
  const selectedTable = selected ? tables.find(t => t.id === selected) : null
  const unassigned = guests.filter(g => !g.table_id)

  function resetLayout() {
    const auto = autoLayout(tables)
    setPositions(auto)
    tables.forEach(t => {
      const pos = auto[t.id]
      savePosition(t.id, pos.x, pos.y)
    })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
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
        <div className="flex items-center gap-3">
          {saving && (
            <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300">
              Sauvegarde…
            </span>
          )}
          <button onClick={resetLayout}
            style={{ fontWeight: 300, fontSize: '0.72rem' }}
            className="text-stone-400 hover:text-[#4a5240] transition cursor-pointer border border-stone-200 px-3 py-1.5 rounded-lg hover:border-[#4a5240]/30">
            Réorganiser
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-start">

        {/* SVG Room */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-sm"
               style={{ cursor: dragging ? 'grabbing' : 'default' }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              style={{ width: '100%', display: 'block', userSelect: 'none' }}
              onClick={() => setSelected(null)}>

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

              {/* Tables */}
              {tables.map(table => {
                const pos = positions[table.id] ?? { x: W / 2, y: H / 2 }
                const tableGuests = guests.filter(g => g.table_id === table.id)
                const pct = table.capacity > 0 ? tableGuests.length / table.capacity : 0
                const isFull = tableGuests.length >= table.capacity
                const isSelected = selected === table.id
                const isDraggingThis = dragging?.id === table.id

                const fillColor = isSelected ? '#4a5240' : isFull ? '#f5f0e8' : 'white'
                const strokeColor = isSelected ? '#4a5240' : isFull ? '#c9c0b3' : '#d6d3d1'
                const textColor = isSelected ? 'white' : '#2d3228'
                const countColor = isSelected ? 'rgba(255,255,255,0.7)' : '#a8a29e'

                return (
                  <g key={table.id}
                    style={{ cursor: isDraggingThis ? 'grabbing' : 'grab' }}
                    onMouseDown={e => startDrag(e, table.id)}
                    onTouchStart={e => startDrag(e, table.id)}
                    onClick={e => { e.stopPropagation(); if (!isDraggingThis) setSelected(table.id) }}>

                    {/* Shadow */}
                    <circle cx={pos.x + 2} cy={pos.y + 3} r={R} fill="rgba(0,0,0,0.06)" />

                    {/* Circle */}
                    <circle cx={pos.x} cy={pos.y} r={R}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2 : 1.5} />

                    {/* Progress arc — seats taken */}
                    {pct > 0 && pct < 1 && (
                      <circle cx={pos.x} cy={pos.y} r={R - 4}
                        fill="none"
                        stroke="#4a5240"
                        strokeWidth="3"
                        strokeOpacity="0.25"
                        strokeDasharray={`${pct * 2 * Math.PI * (R - 4)} ${2 * Math.PI * (R - 4)}`}
                        strokeDashoffset={Math.PI * (R - 4) / 2}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${pos.x} ${pos.y})`} />
                    )}
                    {isFull && (
                      <circle cx={pos.x} cy={pos.y} r={R - 4}
                        fill="none" stroke="#4a5240" strokeWidth="3" strokeOpacity="0.3" />
                    )}

                    {/* Table name */}
                    <text x={pos.x} y={pos.y - 5} textAnchor="middle" dominantBaseline="middle"
                      style={{ fontFamily: 'var(--font-lato)', fontSize: '13px', fontWeight: 500, fill: textColor, pointerEvents: 'none' }}>
                      {table.name.length > 10 ? table.name.slice(0, 9) + '…' : table.name}
                    </text>

                    {/* Seat count */}
                    <text x={pos.x} y={pos.y + 13} textAnchor="middle"
                      style={{ fontFamily: 'var(--font-lato)', fontSize: '11px', fontWeight: 300, fill: countColor, pointerEvents: 'none' }}>
                      {tableGuests.length}/{table.capacity}
                    </text>
                  </g>
                )
              })}

              {/* Empty state */}
              {tables.length === 0 && (
                <text x={W / 2} y={H / 2} textAnchor="middle"
                  style={{ fontFamily: 'var(--font-lato)', fontSize: '14px', fontWeight: 300, fill: '#c7c3c0' }}>
                  Créez des tables dans l'onglet Brouillon
                </text>
              )}
            </svg>
          </div>
          <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 text-center mt-2">
            Glissez les tables pour les repositionner · Cliquez pour voir les invités
          </p>
        </div>

        {/* Side panel */}
        <div className="w-64 shrink-0 space-y-3">
          {selected && selectedTable ? (
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-50 flex items-center justify-between">
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-[#2d3228]">
                    {selectedTable.name}
                  </p>
                  <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mt-0.5">
                    {selectedGuests.length} / {selectedTable.capacity} places
                  </p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="text-stone-300 hover:text-stone-500 cursor-pointer text-lg leading-none">×</button>
              </div>
              <div className="px-4 py-2">
                {selectedGuests.length === 0 ? (
                  <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300 py-3 text-center italic">
                    Table vide
                  </p>
                ) : (
                  <ul className="divide-y divide-stone-50">
                    {selectedGuests.map(g => (
                      <li key={g.id} className="flex items-center gap-2 py-2">
                        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                          <span style={{ fontWeight: 500, fontSize: '0.6rem' }} className="text-stone-500">
                            {g.first_name[0]?.toUpperCase()}
                          </span>
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
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 p-4">
              <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 text-center">
                Cliquez sur une table pour voir ses invités
              </p>
            </div>
          )}

          {/* Unassigned */}
          {unassigned.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-50">
                <p style={{ fontWeight: 500, fontSize: '0.82rem' }} className="text-amber-600">
                  Sans table · {unassigned.length}
                </p>
              </div>
              <ul className="px-4 py-1 max-h-48 overflow-y-auto divide-y divide-stone-50">
                {unassigned.map(g => (
                  <li key={g.id} className="flex items-center gap-2 py-2">
                    <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <span style={{ fontWeight: 500, fontSize: '0.6rem' }} className="text-amber-400">
                        {g.first_name[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-600 truncate">
                      {g.first_name}{g.last_name ? ` ${g.last_name}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legend */}
          <div className="bg-white rounded-xl border border-stone-100 p-3 space-y-1.5">
            {[
              { color: 'bg-white border border-stone-200', label: 'Places disponibles' },
              { color: 'bg-[#f5f0e8] border border-stone-300', label: 'Table complète' },
              { color: 'bg-[#4a5240]', label: 'Sélectionnée' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full shrink-0 ${l.color}`} />
                <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
