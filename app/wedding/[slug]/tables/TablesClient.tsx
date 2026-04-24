'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Table = {
  id: string
  name: string
  capacity: number
  position_order: number
}

type Guest = {
  id: string
  first_name: string
  last_name: string | null
  rsvp_status: string
  table_id: string | null
  relation: string | null
  guest_type: string | null
}

type Props = {
  slug: string
  weddingId: string
  weddingName: string
  tables: Table[]
  guests: Guest[]
  createTable: (formData: FormData) => Promise<void>
  deleteTable: (formData: FormData) => Promise<void>
  assignGuest: (formData: FormData) => Promise<void>
  updateTableName: (formData: FormData) => Promise<void>
}

const RSVP_DOT: Record<string, string> = {
  confirme: 'bg-emerald-400',
  decline: 'bg-red-400',
  en_attente: 'bg-stone-300',
}

type RsvpFilter = 'all' | 'confirme' | 'en_attente'

const RSVP_LABELS: Record<RsvpFilter, string> = {
  all: 'Tous',
  confirme: '✓ Confirmés',
  en_attente: '? En attente',
}

export default function TablesClient({
  slug, weddingId, weddingName, tables, guests,
  createTable, deleteTable, assignGuest, updateTableName,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null)
  const [dragOverTableId, setDragOverTableId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>('all')

  function run(action: () => Promise<void>, after?: () => void) {
    startTransition(async () => {
      await action()
      router.refresh()
      after?.()
    })
  }

  function assign(guestId: string, tableId: string | null) {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('guest_id', guestId)
      fd.append('slug', slug)
      if (tableId !== null) fd.append('table_id', tableId)
      await assignGuest(fd)
      router.refresh()
    })
  }

  const unassigned = guests.filter(g => !g.table_id)
  const totalSeated = guests.filter(g => g.table_id).length

  const filteredUnassigned = unassigned.filter(g => {
    if (rsvpFilter !== 'all' && g.rsvp_status !== rsvpFilter) return false
    if (!search) return true
    return `${g.first_name} ${g.last_name ?? ''}`.toLowerCase().includes(search.toLowerCase())
  })

  // Drag handlers
  function onDragStart(guestId: string) {
    setDraggedGuestId(guestId)
    setSelectedGuestId(null)
  }

  function onDragEnd() {
    setDraggedGuestId(null)
    setDragOverTableId(null)
  }

  function onDragOver(e: React.DragEvent, tableId: string) {
    e.preventDefault()
    setDragOverTableId(tableId)
  }

  function onDrop(e: React.DragEvent, tableId: string) {
    e.preventDefault()
    if (draggedGuestId) {
      const table = tables.find(t => t.id === tableId)
      const seated = guests.filter(g => g.table_id === tableId).length
      if (table && seated < table.capacity) {
        assign(draggedGuestId, tableId)
      }
    }
    setDraggedGuestId(null)
    setDragOverTableId(null)
  }

  function onDragLeave(e: React.DragEvent) {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverTableId(null)
    }
  }

  function handleTableClick(tableId: string) {
    if (!selectedGuestId) return
    const table = tables.find(t => t.id === tableId)
    const seated = guests.filter(g => g.table_id === tableId).length
    if (table && seated < table.capacity) {
      assign(selectedGuestId, tableId)
      setSelectedGuestId(null)
    }
  }

  function toggleSelectGuest(guestId: string) {
    setSelectedGuestId(prev => prev === guestId ? null : guestId)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.8rem', fontStyle: 'italic' }}
                className="text-[#2d3228]">Plan de table</h1>
            <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400">
              {totalSeated} / {guests.length} invités placés · {unassigned.length} sans table
              {isPending && <span className="ml-2 text-[#4a5240] animate-pulse">Enregistrement…</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-sm border border-[#4a5240] text-[#4a5240] px-4 py-2 rounded-lg hover:bg-[#4a5240] hover:text-white transition cursor-pointer"
              style={{ fontWeight: 300 }}>
              + Nouvelle table
            </button>
            <button
              onClick={() => window.open(`/wedding/${slug}/tables/recap`, '_blank')}
              className="flex items-center gap-2 bg-[#4a5240] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2d3228] transition cursor-pointer"
              style={{ fontWeight: 300 }}>
              Récap imprimable
            </button>
          </div>
        </div>

        <div className="flex gap-5 items-start">

          {/* ── Colonne gauche : invités non placés ── */}
          <div className="w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.2em' }}
                   className="text-stone-400 uppercase mb-2">Sans table ({unassigned.length})</p>
                {/* Filtres RSVP */}
                <div className="flex gap-1 mb-2 flex-wrap">
                  {(['all', 'confirme', 'en_attente'] as RsvpFilter[]).map(f => (
                    <button key={f} onClick={() => setRsvpFilter(f)}
                      className={`text-xs px-2 py-0.5 rounded-full transition cursor-pointer ${
                        rsvpFilter === f
                          ? 'bg-[#4a5240] text-white'
                          : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                      }`} style={{ fontWeight: 300 }}>
                      {RSVP_LABELS[f]}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Rechercher…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full text-xs border border-stone-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#4a5240]"
                  style={{ fontWeight: 300 }} />
              </div>
              <div className="p-3 space-y-1.5 max-h-[calc(100vh-260px)] overflow-y-auto">
                {filteredUnassigned.length === 0 && unassigned.length > 0 && (
                  <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-300 text-center py-4">Aucun résultat</p>
                )}
                {filteredUnassigned.length === 0 && unassigned.length === 0 && (
                  <p style={{ fontWeight: 300, fontSize: '0.78rem', fontStyle: 'italic' }} className="text-stone-300 text-center py-4">
                    🎉 Tous placés !
                  </p>
                )}
                {filteredUnassigned.map(g => {
                  const isSelected = selectedGuestId === g.id
                  return (
                    <div
                      key={g.id}
                      draggable
                      onDragStart={() => onDragStart(g.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => toggleSelectGuest(g.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer select-none transition ${
                        draggedGuestId === g.id
                          ? 'opacity-40'
                          : isSelected
                          ? 'border-[#4a5240] bg-[#4a5240]/10 ring-1 ring-[#4a5240]/30'
                          : 'border-stone-100 bg-[#f5f0e8] hover:border-[#4a5240]/40 hover:shadow-sm'
                      }`}>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${RSVP_DOT[g.rsvp_status] ?? 'bg-stone-300'}`} />
                      <div className="min-w-0">
                        <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-700 truncate">
                          {g.first_name} {g.last_name ?? ''}
                        </p>
                        {g.relation && (
                          <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400 truncate">{g.relation}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {selectedGuestId ? (
              <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-[#4a5240] text-center mt-3 italic">
                Tapez une table pour placer →
              </p>
            ) : (
              <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 text-center mt-3 italic">
                Glissez ou tapez un invité →
              </p>
            )}
          </div>

          {/* ── Zone tables ── */}
          <div className="flex-1 min-w-0">

            {/* Formulaire création table */}
            {showCreateForm && (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  run(async () => { await createTable(fd) }, () => setShowCreateForm(false))
                }}
                className="bg-white rounded-2xl border border-stone-200 p-4 mb-4 flex items-center gap-3 flex-wrap">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="wedding_id" value={weddingId} />
                <input name="name" placeholder="Nom de la table (ex: Table des amis)" autoFocus required
                  className="flex-1 min-w-[160px] text-sm border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#4a5240]"
                  style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem' }} />
                <div className="flex items-center gap-2">
                  <label style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 whitespace-nowrap">Capacité</label>
                  <input name="capacity" type="number" min={1} max={30} defaultValue={8}
                    className="w-16 text-sm border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#4a5240]"
                    style={{ fontWeight: 300 }} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowCreateForm(false)}
                    className="text-sm text-stone-400 px-4 py-2.5 border border-stone-200 rounded-xl hover:border-stone-300 transition cursor-pointer"
                    style={{ fontWeight: 300 }}>Annuler</button>
                  <button type="submit" disabled={isPending}
                    className="text-sm bg-[#4a5240] text-white px-4 py-2.5 rounded-xl hover:bg-[#2d3228] transition cursor-pointer disabled:opacity-50"
                    style={{ fontWeight: 300 }}>Créer</button>
                </div>
              </form>
            )}

            {tables.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-stone-200 py-16 text-center">
                <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.2rem' }}
                   className="text-stone-300 mb-2">Aucune table pour l'instant</p>
                <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
                  Cliquez sur "+ Nouvelle table" pour commencer
                </p>
              </div>
            )}

            {/* Grille de tables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map(table => {
                const tableGuests = guests.filter(g => g.table_id === table.id)
                const isFull = tableGuests.length >= table.capacity
                const isOver = dragOverTableId === table.id
                const isEditing = editingTable === table.id
                const isClickTarget = !!selectedGuestId && !isFull

                return (
                  <div
                    key={table.id}
                    onDragOver={e => onDragOver(e, table.id)}
                    onDrop={e => onDrop(e, table.id)}
                    onDragLeave={onDragLeave}
                    onClick={() => handleTableClick(table.id)}
                    className={`bg-white rounded-2xl border-2 transition-all duration-150 overflow-hidden ${
                      isOver
                        ? 'border-[#4a5240] shadow-lg scale-[1.02] bg-[#f5f0e8]/50'
                        : isClickTarget
                        ? 'border-[#4a5240]/50 shadow-md cursor-pointer'
                        : isFull
                        ? 'border-amber-200'
                        : 'border-stone-100'
                    }`}>

                    {/* En-tête table */}
                    <div className={`px-4 py-3 border-b ${isOver ? 'border-[#4a5240]/20' : 'border-stone-100'}`}>
                      {isEditing ? (
                        <form
                          onSubmit={e => {
                            e.preventDefault()
                            const fd = new FormData(e.currentTarget)
                            run(async () => { await updateTableName(fd) }, () => setEditingTable(null))
                          }}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-2">
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="id" value={table.id} />
                          <input name="name" defaultValue={table.name} autoFocus required
                            className="flex-1 text-sm border border-stone-200 rounded-lg px-2 py-1 outline-none focus:border-[#4a5240]"
                            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '0.95rem' }} />
                          <input name="capacity" type="number" min={1} max={30} defaultValue={table.capacity}
                            className="w-14 text-xs border border-stone-200 rounded-lg px-2 py-1 outline-none focus:border-[#4a5240]"
                            style={{ fontWeight: 300 }} />
                          <button type="submit" disabled={isPending}
                            className="text-xs bg-[#4a5240] text-white px-2 py-1 rounded-lg cursor-pointer"
                            style={{ fontWeight: 300 }}>OK</button>
                          <button type="button" onClick={() => setEditingTable(null)}
                            className="text-xs text-stone-400 cursor-pointer">✕</button>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            {table.position_order > 0 && (
                              <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.15em' }}
                                 className="text-stone-300 uppercase mb-0.5">N°{table.position_order}</p>
                            )}
                            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.1rem' }}
                                className="text-[#2d3228]">{table.name}</h3>
                            <p style={{ fontWeight: 300, fontSize: '0.68rem' }}
                               className={isFull ? 'text-amber-500' : 'text-stone-400'}>
                              {tableGuests.length}/{table.capacity} places
                              {isFull && ' · Table complète'}
                            </p>
                          </div>
                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setEditingTable(table.id)}
                              className="text-xs text-stone-300 hover:text-[#4a5240] transition cursor-pointer"
                              style={{ fontWeight: 300 }}>✏</button>
                            <button
                              onClick={() => {
                                if (!confirm(`Supprimer "${table.name}" ?`)) return
                                const fd = new FormData()
                                fd.append('slug', slug)
                                fd.append('id', table.id)
                                run(() => deleteTable(fd))
                              }}
                              className="text-xs text-stone-300 hover:text-red-400 transition cursor-pointer"
                              style={{ fontWeight: 300 }}>✕</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Invités dans la table */}
                    <div className={`min-h-[80px] p-2 space-y-1 ${isOver && !isFull ? 'bg-[#4a5240]/5' : ''}`}>
                      {tableGuests.length === 0 && (
                        <div className={`flex items-center justify-center h-16 rounded-xl border-2 border-dashed transition ${
                          isOver ? 'border-[#4a5240]/40 text-[#4a5240]'
                          : isClickTarget ? 'border-[#4a5240]/30 text-[#4a5240]'
                          : 'border-stone-100 text-stone-300'
                        }`}>
                          <p style={{ fontWeight: 300, fontSize: '0.75rem' }}>
                            {isOver || isClickTarget ? 'Déposer ici' : 'Glissez des invités ici'}
                          </p>
                        </div>
                      )}
                      {tableGuests.map(g => (
                        <div key={g.id}
                             className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#f5f0e8] group">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${RSVP_DOT[g.rsvp_status] ?? 'bg-stone-300'}`} />
                          <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="flex-1 text-stone-700 truncate">
                            {g.first_name} {g.last_name ?? ''}
                          </p>
                          <button
                            disabled={isPending}
                            onClick={e => { e.stopPropagation(); assign(g.id, null) }}
                            className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition cursor-pointer text-xs"
                            title="Retirer">
                            ✕
                          </button>
                        </div>
                      ))}
                      {isOver && !isFull && tableGuests.length > 0 && (
                        <div className="flex items-center justify-center h-8 rounded-lg border-2 border-dashed border-[#4a5240]/30 text-[#4a5240]">
                          <p style={{ fontWeight: 300, fontSize: '0.7rem' }}>Déposer ici</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
