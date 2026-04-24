'use client'

import { useState } from 'react'

type Table = { id: string; name: string; capacity: number }
type Guest = { id: string; first_name: string; last_name: string; table_id: string | null; guest_type: string; rsvp_status: string | null }

export default function SeatingBoard({
  slug,
  tables,
  guests,
  unassignedGuests,
  createTable,
  deleteTable,
  assignGuest,
  updateTableName,
}: {
  slug: string
  tables: Table[]
  guests: Guest[]
  unassignedGuests: Guest[]
  createTable: (f: FormData) => Promise<void>
  deleteTable: (f: FormData) => Promise<void>
  assignGuest: (f: FormData) => Promise<void>
  updateTableName: (f: FormData) => Promise<void>
}) {
  const [newTableName, setNewTableName] = useState('')
  const [newTableCap, setNewTableCap] = useState(8)
  const [creating, setCreating] = useState(false)
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [draggingGuest, setDraggingGuest] = useState<Guest | null>(null)
  const [dragOverTable, setDragOverTable] = useState<string | null>(null)

  const guestsAtTable = (tableId: string) => guests.filter(g => g.table_id === tableId)

  const filteredUnassigned = unassignedGuests.filter(g =>
    `${g.first_name} ${g.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  const guestInitials = (g: Guest) =>
    `${g.first_name[0] ?? ''}${g.last_name?.[0] ?? ''}`.toUpperCase()

  const guestLabel = (g: Guest) =>
    [g.first_name, g.last_name].filter(Boolean).join(' ')

  async function handleCreateTable(e: React.FormEvent) {
    e.preventDefault()
    if (!newTableName.trim() || creating) return
    setCreating(true)
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('name', newTableName.trim())
    fd.set('capacity', String(newTableCap))
    await createTable(fd)
    setNewTableName('')
    setNewTableCap(8)
    setCreating(false)
  }

  // Drag & drop
  function handleDragStart(guest: Guest) {
    setDraggingGuest(guest)
  }

  async function handleDropOnTable(tableId: string) {
    if (!draggingGuest) return
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('guest_id', draggingGuest.id)
    fd.set('table_id', tableId)
    await assignGuest(fd)
    setDraggingGuest(null)
    setDragOverTable(null)
  }

  async function handleDropOnUnassigned() {
    if (!draggingGuest || !draggingGuest.table_id) return
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('guest_id', draggingGuest.id)
    fd.set('table_id', '')
    await assignGuest(fd)
    setDraggingGuest(null)
    setDragOverTable(null)
  }

  async function handleRemoveFromTable(guest: Guest) {
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('guest_id', guest.id)
    fd.set('table_id', '')
    await assignGuest(fd)
  }

  async function handleQuickAssign(guest: Guest, tableId: string) {
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('guest_id', guest.id)
    fd.set('table_id', tableId)
    await assignGuest(fd)
  }

  return (
    <div className="flex gap-4 min-h-[600px]">

      {/* ── Tables (zone principale) ── */}
      <div className="flex-1 min-w-0">

        {/* Créer une table */}
        <form onSubmit={handleCreateTable} className="flex gap-2 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Nom de la table… ex : Table des mariés"
            value={newTableName}
            onChange={e => setNewTableName(e.target.value)}
            className="flex-1 min-w-[160px] border border-stone-200 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
            style={{ fontWeight: 300 }} />
          <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-4 py-2.5 bg-white">
            <span className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>Places</span>
            <input
              type="number" min={1} max={30}
              value={newTableCap}
              onChange={e => setNewTableCap(parseInt(e.target.value))}
              className="w-10 text-center outline-none text-stone-700 text-sm bg-transparent"
              style={{ fontWeight: 300 }} />
          </div>
          <button type="submit" disabled={!newTableName.trim() || creating}
            className="bg-[#4a5240] text-white px-5 py-2.5 rounded-xl hover:bg-[#2d3228] transition text-sm cursor-pointer disabled:opacity-40"
            style={{ fontWeight: 300 }}>
            {creating ? '…' : '+ Table'}
          </button>
        </form>

        {tables.length === 0 ? (
          <div className="text-center py-20 text-stone-300">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.5rem' }}>
              Aucune table encore
            </p>
            <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="mt-1">
              Créez votre première table ci-dessus
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map(table => {
              const seated = guestsAtTable(table.id)
              const isFull = seated.length >= table.capacity
              const isOver = dragOverTable === table.id

              return (
                <div
                  key={table.id}
                  onDragOver={e => { e.preventDefault(); setDragOverTable(table.id) }}
                  onDragLeave={() => setDragOverTable(null)}
                  onDrop={() => handleDropOnTable(table.id)}
                  className={`bg-white rounded-2xl border-2 transition-all ${
                    isOver ? 'border-[#4a5240] shadow-lg scale-[1.01]' : 'border-stone-100'
                  }`}>

                  {/* En-tête table */}
                  <div className="px-4 pt-4 pb-3 border-b border-stone-50">
                    {editingTable === table.id ? (
                      <form action={updateTableName} onSubmit={() => setEditingTable(null)} className="flex gap-2">
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="id" value={table.id} />
                        <input type="text" name="name" defaultValue={table.name}
                          className="flex-1 text-sm border-b border-[#4a5240] outline-none bg-transparent text-stone-700 pb-0.5"
                          style={{ fontWeight: 400 }} autoFocus />
                        <input type="number" name="capacity" defaultValue={table.capacity}
                          min={1} max={30}
                          className="w-10 text-xs text-center border border-stone-200 rounded px-1 outline-none"
                          style={{ fontWeight: 300 }} />
                        <button type="submit"
                          className="text-xs text-[#4a5240] cursor-pointer" style={{ fontWeight: 400 }}>
                          OK
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 style={{ fontWeight: 500, fontSize: '0.95rem' }}
                              className="text-[#2d3228]">{table.name}</h3>
                          <p style={{ fontWeight: 300, fontSize: '0.72rem' }}
                             className={`mt-0.5 ${isFull ? 'text-amber-500' : 'text-stone-400'}`}>
                            {seated.length} / {table.capacity} places
                            {isFull && ' · complète'}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => setEditingTable(table.id)}
                            className="text-stone-300 hover:text-[#4a5240] transition cursor-pointer"
                            title="Renommer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <form action={deleteTable} className="inline">
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="id" value={table.id} />
                            <button type="submit"
                              className="text-stone-300 hover:text-red-400 transition cursor-pointer"
                              title="Supprimer la table"
                              onClick={e => { if (!confirm(`Supprimer "${table.name}" ?`)) e.preventDefault() }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </form>
                        </div>
                      </div>
                    )}

                    {/* Barre de remplissage */}
                    <div className="mt-2 h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isFull ? 'bg-amber-400' : 'bg-[#4a5240]'}`}
                        style={{ width: `${Math.min(100, (seated.length / table.capacity) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Liste invités assis */}
                  <div className="px-3 py-2 space-y-1 min-h-[60px]">
                    {seated.map(guest => (
                      <div key={guest.id}
                        draggable
                        onDragStart={() => handleDragStart(guest)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 group cursor-grab active:cursor-grabbing transition">
                        <div className="w-6 h-6 rounded-full bg-[#4a5240]/10 flex items-center justify-center shrink-0">
                          <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '0.65rem' }}
                                className="text-[#4a5240]">
                            {guestInitials(guest)}
                          </span>
                        </div>
                        <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-600 flex-1 truncate">
                          {guestLabel(guest)}
                        </span>
                        <button onClick={() => handleRemoveFromTable(guest)}
                          className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition cursor-pointer">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {seated.length === 0 && (
                      <p style={{ fontWeight: 300, fontSize: '0.75rem' }}
                         className="text-stone-300 italic text-center py-3">
                        Glissez des invités ici
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Panneau latéral — invités sans table ── */}
      <div
        className="w-72 shrink-0 hidden md:flex flex-col"
        onDragOver={e => { e.preventDefault(); setDragOverTable('unassigned') }}
        onDragLeave={() => setDragOverTable(null)}
        onDrop={handleDropOnUnassigned}>

        <div className={`flex-1 flex flex-col bg-white rounded-2xl border-2 transition-all ${
          dragOverTable === 'unassigned' ? 'border-[#4a5240]' : 'border-stone-100'
        }`}>
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-stone-50">
            <h3 style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-[#2d3228] mb-2">
              Sans table
              <span style={{ fontWeight: 300, fontSize: '0.78rem' }}
                    className="text-stone-400 ml-2">
                ({unassignedGuests.length})
              </span>
            </h3>
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-700 outline-none focus:border-[#4a5240] transition"
              style={{ fontWeight: 300 }} />
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {filteredUnassigned.length === 0 ? (
              <p style={{ fontWeight: 300, fontSize: '0.78rem' }}
                 className="text-stone-300 italic text-center py-6">
                {unassignedGuests.length === 0 ? '🎉 Tout le monde est placé !' : 'Aucun résultat'}
              </p>
            ) : (
              filteredUnassigned.map(guest => (
                <div key={guest.id}
                  draggable
                  onDragStart={() => handleDragStart(guest)}
                  className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-stone-50 cursor-grab active:cursor-grabbing transition">
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '0.7rem' }}
                          className="text-stone-500">
                      {guestInitials(guest)}
                    </span>
                  </div>
                  <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-600 flex-1 truncate">
                    {guestLabel(guest)}
                  </span>

                  {/* Assigner rapidement via dropdown au hover */}
                  {tables.length > 0 && (
                    <select
                      onChange={e => e.target.value && handleQuickAssign(guest, e.target.value)}
                      defaultValue=""
                      className="opacity-0 group-hover:opacity-100 text-[10px] border border-stone-200 rounded px-1 py-0.5 outline-none cursor-pointer bg-white text-stone-500 max-w-[90px] transition"
                      style={{ fontWeight: 300 }}>
                      <option value="" disabled>Table…</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 border-t border-stone-50">
            <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 text-center">
              Glissez vers une table · ou utilisez le menu
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
