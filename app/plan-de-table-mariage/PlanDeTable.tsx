'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'
const BODY = 'var(--font-body)'

type Guest = { id: string; name: string; tableId: string | null }
type WeddingTable = { id: string; name: string; capacity: number; shape: 'round' | 'rect' }

function sanitize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x00-\x7E]/g, '')
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const STORAGE_KEY = 'kaatch-pdtm-v1'

const DEFAULT_TABLES: WeddingTable[] = [
  { id: 't1', name: 'Table 1', capacity: 8, shape: 'round' },
  { id: 't2', name: 'Table 2', capacity: 8, shape: 'round' },
  { id: 't3', name: 'Table 3', capacity: 8, shape: 'round' },
]

function RoundIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function RectIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
      <rect x="1" y="1" width="12" height="9" rx="1.5" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

export default function PlanDeTable() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [tables, setTables] = useState<WeddingTable[]>(DEFAULT_TABLES)
  const [mounted, setMounted] = useState(false)

  const [guestInput, setGuestInput] = useState('')
  const [bulkMode, setBulkMode] = useState(false)
  const [addTableOpen, setAddTableOpen] = useState(false)
  const [newTableName, setNewTableName] = useState('')
  const [newTableCap, setNewTableCap] = useState(8)
  const [newTableShape, setNewTableShape] = useState<'round' | 'rect'>('round')

  const [selectedGuest, setSelectedGuest] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [editingTableId, setEditingTableId] = useState<string | null>(null)
  const [editingTableName, setEditingTableName] = useState('')
  const [ctaDismissed, setCtaDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as { guests?: Guest[]; tables?: WeddingTable[] }
        if (saved.guests) setGuests(saved.guests)
        if (saved.tables?.length) setTables(saved.tables)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ guests, tables })) } catch {}
  }, [guests, tables, mounted])

  const unassigned = guests.filter(g => g.tableId === null)
  const totalSeated = guests.filter(g => g.tableId !== null).length
  const pct = guests.length === 0 ? 0 : Math.round((totalSeated / guests.length) * 100)
  const selectedGuestObj = selectedGuest ? guests.find(g => g.id === selectedGuest) : null

  const addGuests = useCallback(() => {
    const names = guestInput.split('\n').map(s => s.trim()).filter(Boolean)
    if (!names.length) return
    setGuests(prev => [...prev, ...names.map(name => ({ id: uid(), name, tableId: null }))])
    setGuestInput('')
    setBulkMode(false)
  }, [guestInput])

  const removeGuest = useCallback((id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id))
    setSelectedGuest(s => s === id ? null : s)
  }, [])

  const unassignGuest = useCallback((id: string) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, tableId: null } : g))
  }, [])

  const assignGuest = useCallback((guestId: string, tableId: string) => {
    setGuests(prev => {
      const table = tables.find(t => t.id === tableId)
      if (!table) return prev
      const seated = prev.filter(g => g.tableId === tableId && g.id !== guestId).length
      if (seated >= table.capacity) return prev
      return prev.map(g => g.id === guestId ? { ...g, tableId } : g)
    })
    setSelectedGuest(null)
  }, [tables])

  const addTable = useCallback(() => {
    const name = newTableName.trim() || `Table ${tables.length + 1}`
    setTables(prev => [...prev, { id: uid(), name, capacity: newTableCap, shape: newTableShape }])
    setNewTableName('')
    setNewTableCap(8)
    setNewTableShape('round')
    setAddTableOpen(false)
  }, [newTableName, newTableCap, newTableShape, tables.length])

  const deleteTable = useCallback((tableId: string) => {
    setGuests(prev => prev.map(g => g.tableId === tableId ? { ...g, tableId: null } : g))
    setTables(prev => prev.filter(t => t.id !== tableId))
  }, [])

  const startEditTable = useCallback((table: WeddingTable) => {
    setEditingTableId(table.id)
    setEditingTableName(table.name)
  }, [])

  const saveEditTable = useCallback(() => {
    if (!editingTableId) return
    const name = editingTableName.trim()
    if (name) setTables(prev => prev.map(t => t.id === editingTableId ? { ...t, name } : t))
    setEditingTableId(null)
  }, [editingTableId, editingTableName])

  const reset = useCallback(() => {
    if (window.confirm('Remettre tout à zéro ?')) {
      setGuests([])
      setTables(DEFAULT_TABLES)
      setSelectedGuest(null)
    }
  }, [])

  const onDragStart = (guestId: string) => setDragging(guestId)
  const onDragEnd = () => { setDragging(null); setDragOver(null) }

  const onDropTable = useCallback((tableId: string) => {
    if (dragging) assignGuest(dragging, tableId)
    setDragging(null); setDragOver(null)
  }, [dragging, assignGuest])

  const onDropUnassigned = useCallback(() => {
    if (dragging) unassignGuest(dragging)
    setDragging(null); setDragOver(null)
  }, [dragging, unassignGuest])

  const downloadPDF = useCallback(async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      let y = 20
      doc.setFontSize(22); doc.setTextColor(45, 50, 40)
      doc.text('Plan de table', 20, y); y += 8
      doc.setFontSize(10); doc.setTextColor(120, 113, 108)
      doc.text(sanitize(`${guests.length} invites - ${totalSeated} places - ${tables.length} tables`), 20, y); y += 5
      doc.text('kaatch.fr/plan-de-table-mariage', 20, y); y += 14

      for (const table of tables) {
        if (y > 250) { doc.addPage(); y = 20 }
        const tGuests = guests.filter(g => g.tableId === table.id)
        doc.setFontSize(13); doc.setTextColor(74, 82, 64)
        doc.text(sanitize(`${table.name}  (${tGuests.length}/${table.capacity} places)`), 20, y); y += 7
        doc.setFontSize(9)
        if (tGuests.length === 0) {
          doc.setTextColor(160, 160, 155)
          doc.text('  Aucun invite assigne', 26, y); y += 6
        } else {
          doc.setTextColor(87, 83, 78)
          for (const g of tGuests) {
            if (y > 272) { doc.addPage(); y = 20 }
            doc.text(sanitize(`  - ${g.name}`), 26, y); y += 5
          }
        }
        y += 4
      }

      if (unassigned.length > 0) {
        if (y > 250) { doc.addPage(); y = 20 }
        doc.setFontSize(13); doc.setTextColor(160, 155, 150)
        doc.text(sanitize(`Non places (${unassigned.length})`), 20, y); y += 7
        doc.setFontSize(9); doc.setTextColor(170, 165, 160)
        for (const g of unassigned) {
          if (y > 272) { doc.addPage(); y = 20 }
          doc.text(sanitize(`  - ${g.name}`), 26, y); y += 5
        }
      }

      doc.setFontSize(8); doc.setTextColor(180, 180, 180)
      doc.text('Genere par Kaatch - kaatch.fr/plan-de-table-mariage', 20, 287)
      doc.save('plan-de-table-mariage-kaatch.pdf')
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'pdf_download', { tool: 'plan-de-table', guests: guests.length })
      }
    } catch (e) { console.error(e) }
  }, [guests, tables, totalSeated, unassigned])

  const showCTA = mounted && guests.length >= 15 && !ctaDismissed

  return (
    <div style={{ fontFamily: BODY }} className="pt-24 pb-20 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#2C3B2E] mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            Outils gratuits · Kaatch
          </p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[#2C3B2E] mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Plan de table
              </h1>
              <p className="text-stone-500 text-base max-w-xl leading-relaxed" style={{ fontWeight: 300 }}>
                Ajoutez vos invités, créez vos tables, glissez-déposez pour placer chacun.
                Sauvegarde automatique, export PDF inclus.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-600 text-sm hover:border-stone-300 transition"
                style={{ fontWeight: 300 }}
              >
                📄 Exporter PDF
              </button>
              {mounted && (guests.length > 0 || tables.length !== DEFAULT_TABLES.length) && (
                <button
                  onClick={reset}
                  className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-400 text-xs hover:border-stone-300 hover:text-stone-600 transition"
                  style={{ fontWeight: 300 }}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {mounted && guests.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 mb-5 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-2xl" style={{ color: SAGE, fontWeight: 500 }}>{totalSeated}</p>
                <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>placés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl text-stone-600" style={{ fontWeight: 300 }}>{guests.length}</p>
                <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>invités</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl ${unassigned.length > 0 ? 'text-amber-500' : 'text-stone-300'}`} style={{ fontWeight: 300 }}>
                  {unassigned.length}
                </p>
                <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>non placés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl text-stone-400" style={{ fontWeight: 300 }}>{tables.length}</p>
                <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>tables</p>
              </div>
            </div>
            <div className="flex-1 min-w-[140px] max-w-xs">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>Avancement</span>
                <span className="text-xs" style={{ color: SAGE, fontWeight: 500 }}>{pct}%</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${SAGE} 0%, #6b7c5e 100%)` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Selected guest hint */}
        {selectedGuestObj && (
          <div
            className="mb-5 px-5 py-3 rounded-xl flex items-center justify-between gap-4"
            style={{ background: SAGE, color: 'white' }}
          >
            <p className="text-sm" style={{ fontWeight: 300 }}>
              <span style={{ fontWeight: 500 }}>{selectedGuestObj.name}</span> — cliquez sur une table pour placer
            </p>
            <button
              onClick={() => setSelectedGuest(null)}
              className="text-white/60 hover:text-white transition text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* CTA banner */}
        {showCTA && (
          <div className="mb-5 rounded-2xl p-5 flex items-center justify-between gap-4" style={{ background: SAGE_DARK }}>
            <div>
              <p className="text-white text-sm mb-0.5" style={{ fontWeight: 500 }}>Votre plan prend forme 🎊</p>
              <p className="text-stone-300 text-xs" style={{ fontWeight: 300 }}>
                Kaatch gère aussi invitations, RSVP, photos et programme — tout au même endroit, gratuitement.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/auth" className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-stone-100 transition whitespace-nowrap" style={{ color: SAGE_DARK }}>
                Essayer →
              </Link>
              <button onClick={() => setCtaDismissed(true)} className="text-stone-400 hover:text-white text-xl leading-none transition" aria-label="Fermer">×</button>
            </div>
          </div>
        )}

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── LEFT PANEL: guests ── */}
          <div className="lg:w-72 lg:shrink-0 space-y-4">

            {/* Add guests */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="text-sm text-stone-700 mb-3" style={{ fontWeight: 500 }}>Ajouter des invités</p>
              {bulkMode ? (
                <>
                  <textarea
                    value={guestInput}
                    onChange={e => setGuestInput(e.target.value)}
                    placeholder={"Un prénom par ligne\nMarie Dupont\nPierre Martin\nSophie & Thomas"}
                    className="w-full text-sm text-stone-700 bg-stone-50 rounded-xl border border-stone-200 px-3 py-2.5 resize-none focus:outline-none focus:border-[#4a5240] transition"
                    style={{ fontWeight: 300, minHeight: '100px' }}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={addGuests}
                      className="flex-1 py-2 text-sm text-white rounded-xl transition"
                      style={{ background: SAGE, fontWeight: 400 }}
                    >
                      Ajouter tous
                    </button>
                    <button
                      onClick={() => { setBulkMode(false); setGuestInput('') }}
                      className="px-3 py-2 text-xs text-stone-400 rounded-xl border border-stone-200 hover:text-stone-600 transition"
                      style={{ fontWeight: 300 }}
                    >
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={guestInput}
                      onChange={e => setGuestInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addGuests() }}
                      placeholder="Prénom Nom"
                      className="flex-1 text-sm text-stone-700 bg-stone-50 rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-[#4a5240] transition"
                      style={{ fontWeight: 300 }}
                    />
                    <button
                      onClick={addGuests}
                      className="px-3 py-2 text-white text-base rounded-xl transition shrink-0 leading-none"
                      style={{ background: SAGE }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => setBulkMode(true)}
                    className="mt-2 text-xs text-stone-400 hover:text-stone-600 transition"
                    style={{ fontWeight: 300 }}
                  >
                    + Ajouter en liste
                  </button>
                </>
              )}
            </div>

            {/* Unassigned guests zone */}
            <div
              className={`bg-white rounded-2xl border shadow-sm p-4 min-h-[120px] transition-all ${
                dragOver === 'unassigned' ? 'border-[#4a5240] ring-2 ring-[#4a5240]/20' : 'border-stone-100'
              }`}
              style={{ backgroundColor: dragOver === 'unassigned' ? `${SAGE}08` : undefined }}
              onDragOver={e => { e.preventDefault(); setDragOver('unassigned') }}
              onDragLeave={e => {
                if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return
                setDragOver(null)
              }}
              onDrop={onDropUnassigned}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-stone-700" style={{ fontWeight: 500 }}>Non placés</p>
                {mounted && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: unassigned.length > 0 ? '#fef3c7' : '#f5f5f4',
                      color: unassigned.length > 0 ? '#92400e' : '#a8a29e',
                      fontWeight: 300
                    }}
                  >
                    {unassigned.length}
                  </span>
                )}
              </div>

              {!mounted ? null : unassigned.length === 0 && guests.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4" style={{ fontWeight: 300 }}>
                  Ajoutez des invités ci-dessus
                </p>
              ) : unassigned.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-lg mb-1">🎉</p>
                  <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>Tout le monde est placé</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {unassigned.map(guest => (
                    <div
                      key={guest.id}
                      draggable
                      onDragStart={() => onDragStart(guest.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => setSelectedGuest(s => s === guest.id ? null : guest.id)}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border cursor-grab active:cursor-grabbing transition select-none ${
                        selectedGuest === guest.id
                          ? 'border-[#4a5240]'
                          : dragging === guest.id
                          ? 'border-stone-200 opacity-40'
                          : 'border-stone-100 hover:border-stone-300'
                      }`}
                      style={{
                        backgroundColor: selectedGuest === guest.id ? `${SAGE}12` : undefined
                      }}
                    >
                      <span
                        className="text-sm text-stone-700 truncate"
                        style={{ fontWeight: selectedGuest === guest.id ? 500 : 300 }}
                      >
                        {guest.name}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); removeGuest(guest.id) }}
                        className="text-stone-300 hover:text-red-400 transition shrink-0 leading-none text-base"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT: Tables ── */}
          <div className="flex-1 min-w-0">

            {/* Tables toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500" style={{ fontWeight: 300 }}>
                {tables.length} table{tables.length !== 1 ? 's' : ''}
                {mounted && tables.reduce((s, t) => s + t.capacity, 0) > 0 && (
                  <span className="text-stone-400">
                    {' '}· {tables.reduce((s, t) => s + t.capacity, 0)} places au total
                  </span>
                )}
              </p>
              <button
                onClick={() => setAddTableOpen(o => !o)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-xl transition"
                style={{ background: addTableOpen ? SAGE_DARK : SAGE, fontWeight: 400 }}
              >
                {addTableOpen ? '× Annuler' : '+ Ajouter une table'}
              </button>
            </div>

            {/* Add table form */}
            {addTableOpen && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 mb-4">
                <p className="text-sm text-stone-700 mb-3" style={{ fontWeight: 500 }}>Nouvelle table</p>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[130px]">
                    <label className="text-xs text-stone-400 block mb-1" style={{ fontWeight: 300 }}>Nom</label>
                    <input
                      value={newTableName}
                      onChange={e => setNewTableName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addTable() }}
                      placeholder={`Table ${tables.length + 1}`}
                      className="w-full text-sm bg-stone-50 rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-[#4a5240] transition"
                      style={{ fontWeight: 300 }}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1" style={{ fontWeight: 300 }}>Capacité</label>
                    <select
                      value={newTableCap}
                      onChange={e => setNewTableCap(Number(e.target.value))}
                      className="text-sm bg-stone-50 rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-[#4a5240]"
                      style={{ fontWeight: 300 }}
                    >
                      {[4, 6, 8, 10, 12, 14, 16, 20].map(n => (
                        <option key={n} value={n}>{n} pers.</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1" style={{ fontWeight: 300 }}>Forme</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setNewTableShape('round')}
                        className={`p-2.5 rounded-xl border transition ${newTableShape === 'round' ? 'border-[#4a5240]' : 'border-stone-200 hover:border-stone-300'}`}
                        style={{ backgroundColor: newTableShape === 'round' ? `${SAGE}12` : undefined }}
                        title="Ronde"
                      >
                        <RoundIcon color={newTableShape === 'round' ? SAGE : '#a8a29e'} />
                      </button>
                      <button
                        onClick={() => setNewTableShape('rect')}
                        className={`p-2.5 rounded-xl border transition ${newTableShape === 'rect' ? 'border-[#4a5240]' : 'border-stone-200 hover:border-stone-300'}`}
                        style={{ backgroundColor: newTableShape === 'rect' ? `${SAGE}12` : undefined }}
                        title="Rectangulaire"
                      >
                        <RectIcon color={newTableShape === 'rect' ? SAGE : '#a8a29e'} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={addTable}
                    className="px-5 py-2 text-sm text-white rounded-xl transition self-end"
                    style={{ background: SAGE, fontWeight: 400 }}
                  >
                    Créer
                  </button>
                </div>
              </div>
            )}

            {/* Tables grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {tables.map(table => {
                const tableGuests = guests.filter(g => g.tableId === table.id)
                const seated = tableGuests.length
                const full = mounted && seated >= table.capacity
                const isDropTarget = dragOver === table.id
                const isClickTarget = !!selectedGuest && !full

                return (
                  <div
                    key={table.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                      isDropTarget
                        ? 'border-[#4a5240] shadow-md'
                        : isClickTarget
                        ? 'border-[#4a5240]/50 cursor-pointer hover:border-[#4a5240]'
                        : 'border-stone-100'
                    }`}
                    style={{
                      backgroundColor: isDropTarget ? `${SAGE}08` : undefined,
                      boxShadow: isDropTarget ? `0 0 0 3px ${SAGE}25` : undefined,
                    }}
                    onDragOver={e => { e.preventDefault(); if (!full) setDragOver(table.id) }}
                    onDragLeave={e => {
                      if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return
                      setDragOver(null)
                    }}
                    onDrop={() => { onDropTable(table.id); }}
                    onClick={() => { if (selectedGuest && !full) assignGuest(selectedGuest, table.id) }}
                  >
                    {/* Card header */}
                    <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="shrink-0 mt-0.5">
                          {table.shape === 'round'
                            ? <RoundIcon color={SAGE} />
                            : <RectIcon color={SAGE} />
                          }
                        </span>
                        {editingTableId === table.id ? (
                          <input
                            value={editingTableName}
                            onChange={e => setEditingTableName(e.target.value)}
                            onBlur={saveEditTable}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEditTable()
                              if (e.key === 'Escape') setEditingTableId(null)
                            }}
                            className="flex-1 text-sm bg-stone-50 rounded-lg border border-stone-300 px-2 py-0.5 focus:outline-none focus:border-[#4a5240]"
                            style={{ fontWeight: 500 }}
                            autoFocus
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); startEditTable(table) }}
                            className="text-sm text-stone-800 text-left truncate hover:text-[#4a5240] transition"
                            style={{ fontWeight: 500 }}
                            title="Cliquer pour renommer"
                          >
                            {table.name}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            fontWeight: 300,
                            background: full ? '#f5f5f4' : `${SAGE}12`,
                            color: full ? '#a8a29e' : SAGE
                          }}
                        >
                          {seated}/{table.capacity}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); deleteTable(table.id) }}
                          className="text-stone-200 hover:text-red-400 transition leading-none"
                          aria-label="Supprimer la table"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="mx-4 mb-3 h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: mounted ? `${(seated / table.capacity) * 100}%` : '0%',
                          backgroundColor: full ? '#d6d3d1' : SAGE
                        }}
                      />
                    </div>

                    {/* Guests in table */}
                    <div className="px-3 pb-3 space-y-1">
                      {tableGuests.map(guest => (
                        <div
                          key={guest.id}
                          draggable
                          onDragStart={e => { e.stopPropagation(); onDragStart(guest.id) }}
                          onDragEnd={onDragEnd}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-stone-50 group cursor-grab active:cursor-grabbing"
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="text-xs text-stone-600 truncate" style={{ fontWeight: 300 }}>
                            {guest.name}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); unassignGuest(guest.id) }}
                            className="text-stone-300 hover:text-stone-500 transition leading-none opacity-0 group-hover:opacity-100 shrink-0 text-sm"
                            aria-label="Retirer"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {/* Drop zone / click zone */}
                      {!full && (
                        <div
                          className={`mt-1.5 px-2.5 py-2.5 rounded-xl border-2 border-dashed text-center transition-all ${
                            isDropTarget
                              ? 'border-[#4a5240]'
                              : isClickTarget
                              ? 'border-[#4a5240]/40'
                              : 'border-stone-100'
                          }`}
                          style={{
                            backgroundColor: isDropTarget ? `${SAGE}08` : undefined
                          }}
                        >
                          <p
                            className="text-xs"
                            style={{
                              fontWeight: 300,
                              color: isDropTarget || isClickTarget ? SAGE : '#d6d3d1'
                            }}
                          >
                            {isDropTarget
                              ? 'Déposer ici'
                              : isClickTarget
                              ? 'Cliquer pour placer'
                              : `${table.capacity - seated} place${table.capacity - seated > 1 ? 's' : ''} libre${table.capacity - seated > 1 ? 's' : ''}`
                            }
                          </p>
                        </div>
                      )}
                      {full && (
                        <div className="mt-1.5 px-2.5 py-1.5 text-center">
                          <p className="text-xs text-stone-300" style={{ fontWeight: 300 }}>Table complète</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {tables.length === 0 && (
                <div className="col-span-full bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 p-10 text-center">
                  <p className="text-stone-400 mb-4" style={{ fontWeight: 300 }}>Aucune table créée</p>
                  <button
                    onClick={() => setAddTableOpen(true)}
                    className="text-sm px-5 py-2.5 rounded-xl text-white"
                    style={{ background: SAGE }}
                  >
                    + Ajouter la première table
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl p-7 text-center" style={{ background: SAGE_DARK }}>
          <p className="text-white text-xl mb-2" style={{ fontWeight: 300 }}>
            Le plan de table, c'est bien. Tout au même endroit, c'est mieux.
          </p>
          <p className="text-stone-300 text-sm mb-5 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
            Kaatch centralise invités, faire-part, plan de table, photos et programme — tout ça, gratuitement, pour vous et vos invités.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 bg-white rounded-xl text-sm font-medium hover:bg-stone-100 transition"
            style={{ color: SAGE_DARK }}
          >
            Organiser mon mariage sur Kaatch →
          </Link>
        </div>

      </div>
    </div>
  )
}
