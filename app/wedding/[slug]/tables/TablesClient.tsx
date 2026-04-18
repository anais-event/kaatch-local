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

export default function TablesClient({
  slug, weddingId, weddingName, tables, guests,
  createTable, deleteTable, assignGuest, updateTableName,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedTableId, setSelectedTableId] = useState<string | null>(tables[0]?.id ?? null)
  const [search, setSearch] = useState('')
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unassigned'>('unassigned')

  function run(action: () => Promise<void>, after?: () => void) {
    startTransition(async () => {
      await action()
      router.refresh()
      after?.()
    })
  }

  const unassigned = guests.filter(g => !g.table_id)
  const selectedTable = tables.find(t => t.id === selectedTableId)
  const tableGuests = guests.filter(g => g.table_id === selectedTableId)

  const filteredGuests = guests.filter(g => {
    const name = `${g.first_name} ${g.last_name ?? ''}`.toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) || (g.relation ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || !g.table_id
    return matchSearch && matchFilter
  })

  const totalSeated = guests.filter(g => g.table_id).length

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.8rem', fontStyle: 'italic' }}
                className="text-[#2d3228]">Plan de table</h1>
            <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400">
              {totalSeated} / {guests.length} invités placés · {unassigned.length} sans table
              {isPending && <span className="ml-2 text-[#4a5240]">Enregistrement…</span>}
            </p>
          </div>
          <button
            onClick={() => window.open(`/wedding/${slug}/tables/recap`, '_blank')}
            className="flex items-center gap-2 bg-[#4a5240] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2d3228] transition cursor-pointer"
            style={{ fontWeight: 300 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Récap imprimable
          </button>
        </div>

        <div className="flex gap-4 items-start">

          {/* ── Colonne gauche : tables ── */}
          <div className="w-64 shrink-0 space-y-2">
            <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.2em' }}
               className="text-stone-400 uppercase mb-3">Tables ({tables.length})</p>

            {tables.map(table => {
              const seated = guests.filter(g => g.table_id === table.id).length
              const isFull = seated >= table.capacity
              const isSelected = selectedTableId === table.id
              return (
                <button key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#4a5240] border-[#4a5240] text-white'
                      : 'bg-white border-stone-100 text-stone-700 hover:border-[#4a5240]/40'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1rem' }}>
                      {table.name}
                    </span>
                    <span style={{ fontWeight: 300, fontSize: '0.7rem' }}
                          className={isSelected ? 'text-white/70' : isFull ? 'text-amber-500' : 'text-stone-400'}>
                      {seated}/{table.capacity}
                    </span>
                  </div>
                  {isFull && (
                    <p style={{ fontWeight: 300, fontSize: '0.65rem' }}
                       className={isSelected ? 'text-white/60' : 'text-amber-400'}>Table complète</p>
                  )}
                </button>
              )
            })}

            {/* Ajouter une table */}
            {showCreateForm ? (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  run(async () => { await createTable(fd) }, () => setShowCreateForm(false))
                }}
                className="bg-white rounded-xl border border-stone-200 p-3 space-y-2">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="wedding_id" value={weddingId} />
                <input name="name" placeholder="Nom de la table" autoFocus required
                  className="w-full text-sm border border-stone-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#4a5240]"
                  style={{ fontWeight: 300 }} />
                <div className="flex items-center gap-2">
                  <label style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 shrink-0">Capacité</label>
                  <input name="capacity" type="number" min={1} max={30} defaultValue={8}
                    className="w-full text-sm border border-stone-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#4a5240]"
                    style={{ fontWeight: 300 }} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowCreateForm(false)}
                    className="flex-1 text-xs text-stone-400 py-1.5 border border-stone-200 rounded-lg hover:border-stone-300 transition cursor-pointer"
                    style={{ fontWeight: 300 }}>Annuler</button>
                  <button type="submit" disabled={isPending}
                    className="flex-1 text-xs bg-[#4a5240] text-white py-1.5 rounded-lg hover:bg-[#2d3228] transition cursor-pointer disabled:opacity-50"
                    style={{ fontWeight: 300 }}>Créer</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowCreateForm(true)}
                className="w-full text-sm text-stone-400 border border-dashed border-stone-200 rounded-xl py-3 hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer"
                style={{ fontWeight: 300 }}>
                + Nouvelle table
              </button>
            )}
          </div>

          {/* ── Colonne droite ── */}
          <div className="flex-1 min-w-0">

            {selectedTable ? (
              <div className="bg-white rounded-xl border border-stone-100 mb-4">
                {editingTable === selectedTable.id ? (
                  <form
                    onSubmit={e => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      run(async () => { await updateTableName(fd) }, () => setEditingTable(null))
                    }}
                    className="flex items-center gap-2 px-5 py-4 border-b border-stone-100">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={selectedTable.id} />
                    <input name="name" defaultValue={selectedTable.name} autoFocus required
                      className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#4a5240]"
                      style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem' }} />
                    <input name="capacity" type="number" min={1} max={30} defaultValue={selectedTable.capacity}
                      className="w-16 text-sm border border-stone-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#4a5240]"
                      style={{ fontWeight: 300 }} />
                    <button type="submit" disabled={isPending}
                      className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg hover:bg-[#2d3228] transition cursor-pointer disabled:opacity-50"
                      style={{ fontWeight: 300 }}>OK</button>
                    <button type="button" onClick={() => setEditingTable(null)}
                      className="text-xs text-stone-400 hover:text-stone-600 transition cursor-pointer"
                      style={{ fontWeight: 300 }}>✕</button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.3rem' }}
                          className="text-[#2d3228]">{selectedTable.name}</h2>
                      <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                        {tableGuests.length} / {selectedTable.capacity} places
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setEditingTable(selectedTable.id)}
                        className="text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer"
                        style={{ fontWeight: 300 }}>Renommer</button>
                      <button
                        disabled={isPending}
                        onClick={() => {
                          if (!confirm(`Supprimer "${selectedTable.name}" ?`)) return
                          const fd = new FormData()
                          fd.append('slug', slug)
                          fd.append('id', selectedTable.id)
                          run(async () => { await deleteTable(fd) }, () => setSelectedTableId(null))
                        }}
                        className="text-xs text-stone-300 hover:text-red-400 transition cursor-pointer disabled:opacity-50"
                        style={{ fontWeight: 300 }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}

                {/* Invités à cette table */}
                <div className="divide-y divide-stone-50">
                  {tableGuests.length === 0 ? (
                    <p style={{ fontWeight: 300, fontStyle: 'italic', fontSize: '0.85rem' }}
                       className="text-stone-300 px-5 py-6 text-center">
                      Utilisez la liste ci-dessous pour ajouter des invités
                    </p>
                  ) : (
                    tableGuests.map(g => (
                      <div key={g.id} className="flex items-center gap-3 px-5 py-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${RSVP_DOT[g.rsvp_status] ?? 'bg-stone-300'}`} />
                        <span style={{ fontWeight: 300, fontSize: '0.85rem' }} className="flex-1 text-stone-700">
                          {g.first_name} {g.last_name ?? ''}
                          {g.relation && <span className="text-stone-400 ml-1.5 text-xs">· {g.relation}</span>}
                        </span>
                        <button
                          disabled={isPending}
                          onClick={() => {
                            const fd = new FormData()
                            fd.append('slug', slug)
                            fd.append('guest_id', g.id)
                            fd.append('table_id', '')
                            run(() => assignGuest(fd))
                          }}
                          className="text-xs text-stone-300 hover:text-red-400 transition cursor-pointer disabled:opacity-50"
                          style={{ fontWeight: 300 }}>
                          Retirer
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-stone-100 px-6 py-10 text-center mb-4">
                <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem' }}
                   className="text-stone-300">Crée une table pour commencer</p>
              </div>
            )}

            {/* Liste invités */}
            <div className="bg-white rounded-xl border border-stone-100">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-stone-100 flex-wrap">
                <input
                  type="text"
                  placeholder="Rechercher un invité…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 min-w-[140px] text-sm border border-stone-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#4a5240]"
                  style={{ fontWeight: 300 }} />
                <div className="flex text-xs rounded-lg overflow-hidden border border-stone-200">
                  {(['unassigned', 'all'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 cursor-pointer transition ${filter === f ? 'bg-[#4a5240] text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                      style={{ fontWeight: 300 }}>
                      {f === 'unassigned' ? `Sans table (${unassigned.length})` : `Tous (${guests.length})`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-stone-50 max-h-96 overflow-y-auto">
                {filteredGuests.length === 0 ? (
                  <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-300 px-5 py-6 text-center">
                    {filter === 'unassigned' ? '🎉 Tous les invités sont placés !' : 'Aucun invité trouvé'}
                  </p>
                ) : (
                  filteredGuests.map(g => {
                    const currentTable = tables.find(t => t.id === g.table_id)
                    const isInSelected = g.table_id === selectedTableId
                    return (
                      <div key={g.id} className="flex items-center gap-3 px-5 py-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${RSVP_DOT[g.rsvp_status] ?? 'bg-stone-300'}`} />
                        <div className="flex-1 min-w-0">
                          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-700 truncate">
                            {g.first_name} {g.last_name ?? ''}
                            {g.relation && <span className="text-stone-400 ml-1.5 text-xs">· {g.relation}</span>}
                          </p>
                          {currentTable && (
                            <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-[#4a5240]">
                              → {currentTable.name}
                            </p>
                          )}
                        </div>
                        {selectedTable && (
                          <button
                            disabled={isPending}
                            onClick={() => {
                              const fd = new FormData()
                              fd.append('slug', slug)
                              fd.append('guest_id', g.id)
                              fd.append('table_id', isInSelected ? '' : selectedTable.id)
                              run(() => assignGuest(fd))
                            }}
                            className={`text-xs px-3 py-1 rounded-lg border transition cursor-pointer disabled:opacity-40 ${
                              isInSelected
                                ? 'border-stone-200 text-stone-400 hover:text-red-400 hover:border-red-200'
                                : 'border-[#4a5240] text-[#4a5240] hover:bg-[#4a5240] hover:text-white'
                            }`}
                            style={{ fontWeight: 300 }}>
                            {isInSelected ? 'Retirer' : 'Ajouter'}
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
