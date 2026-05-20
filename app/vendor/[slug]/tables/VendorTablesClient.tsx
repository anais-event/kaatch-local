'use client'

import { useState } from 'react'

type Table = { id: string; name: string; capacity: number }
type Guest = { name: string; type: string; restriction: string; tableId: string | null }

type Props = {
  slug: string
  weddingDate: string | null
  tables: Table[]
  guests: Guest[]
}

const W = 900
const H = 560
const R = 44

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

function hasSpecial(tableGuests: Guest[]) {
  return tableGuests.some(g => g.type === 'Enfant' || g.type === 'Animal' || g.restriction)
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${color}`} style={{ fontWeight: 300 }}>
      {label}
    </span>
  )
}

export default function VendorTablesClient({ slug, weddingDate, tables, guests }: Props) {
  const [view, setView] = useState<'list' | '2d'>('list')

  const guestsByTable = (tableId: string) => guests.filter(g => g.tableId === tableId)
  const unassigned = guests.filter(g => !g.tableId)

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <a href={`/vendor/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
           style={{ fontWeight: 300 }}>
          {"←"} Retour au tableau de bord
        </a>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem' }}
                className="text-[#2d3228] mb-1">Plan de table</h1>
            {weddingDate && (
              <p className="text-stone-400" style={{ fontWeight: 300, fontSize: '0.85rem' }}>
                {weddingDate}
              </p>
            )}
          </div>

          {/* Toggle */}
          <div className="flex bg-white rounded-xl border border-stone-100 overflow-hidden shadow-sm">
            <button
              onClick={() => setView('list')}
              className={`px-3.5 py-2 text-xs transition cursor-pointer ${
                view === 'list' ? 'bg-[#4a5240] text-white' : 'text-stone-500 hover:bg-stone-50'
              }`}
              style={{ fontWeight: view === 'list' ? 500 : 300 }}
            >
              Liste
            </button>
            <button
              onClick={() => setView('2d')}
              className={`px-3.5 py-2 text-xs transition cursor-pointer ${
                view === '2d' ? 'bg-[#4a5240] text-white' : 'text-stone-500 hover:bg-stone-50'
              }`}
              style={{ fontWeight: view === '2d' ? 500 : 300 }}
            >
              Vue 2D
            </button>
          </div>
        </div>

        {tables.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-200 py-16 text-center">
            <div className="text-4xl mb-3">🪑</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 300 }}
               className="text-stone-300 mb-2">Aucune table</p>
            <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
              Les tables seront visibles une fois configurées par les mariés.
            </p>
          </div>
        ) : view === 'list' ? (
          <ListView tables={tables} guestsByTable={guestsByTable} unassigned={unassigned} />
        ) : (
          <PlanView tables={tables} guestsByTable={guestsByTable} />
        )}
      </div>
    </div>
  )
}

function ListView({ tables, guestsByTable, unassigned }: {
  tables: Table[]
  guestsByTable: (id: string) => Guest[]
  unassigned: Guest[]
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {tables.map(table => {
          const tg = guestsByTable(table.id)
          const special = hasSpecial(tg)
          return (
            <div key={table.id}
              className={`bg-white rounded-2xl border px-5 py-4 shadow-sm ${
                special ? 'border-amber-200' : 'border-stone-100'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#2d3228]" style={{ fontWeight: 500 }}>
                  {table.name}
                </p>
                <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
                  {tg.length}/{table.capacity}
                </span>
              </div>
              {tg.length === 0 ? (
                <p className="text-xs text-stone-300" style={{ fontWeight: 300 }}>Aucun invité</p>
              ) : (
                <div className="space-y-1">
                  {tg.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-stone-600 flex-1 truncate" style={{ fontWeight: 300 }}>{g.name}</span>
                      <div className="flex gap-1 shrink-0">
                        {g.type === 'Enfant' && <Badge label="Enfant" color="bg-blue-50 text-blue-500" />}
                        {g.type === 'Animal' && <Badge label="Animal" color="bg-orange-50 text-orange-500" />}
                        {g.restriction && <Badge label={g.restriction} color="bg-red-50 text-red-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {unassigned.length > 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-stone-200 px-5 py-4 shadow-sm">
          <p className="text-sm text-stone-400 mb-2" style={{ fontWeight: 400 }}>
            Non placés ({unassigned.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {unassigned.map((g, i) => (
              <span key={i} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full"
                    style={{ fontWeight: 300 }}>
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded-full bg-amber-200" />
          <span className="text-[11px] text-stone-400" style={{ fontWeight: 300 }}>Table avec besoins spéciaux</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge label="Enfant" color="bg-blue-50 text-blue-500" />
        </div>
        <div className="flex items-center gap-1.5">
          <Badge label="Animal" color="bg-orange-50 text-orange-500" />
        </div>
        <div className="flex items-center gap-1.5">
          <Badge label="Restriction" color="bg-red-50 text-red-400" />
        </div>
      </div>
    </>
  )
}

function PlanView({ tables, guestsByTable }: {
  tables: Table[]
  guestsByTable: (id: string) => Guest[]
}) {
  const positions = autoLayout(tables)

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 600, maxHeight: '70vh' }}>
        {/* Grid dots */}
        {Array.from({ length: Math.floor(W / 40) }).map((_, i) =>
          Array.from({ length: Math.floor(H / 40) }).map((_, j) => (
            <circle key={`${i}-${j}`} cx={20 + i * 40} cy={20 + j * 40} r={0.8} fill="#e5e1db" />
          ))
        )}

        {tables.map(table => {
          const pos = positions[table.id]
          if (!pos) return null
          const tg = guestsByTable(table.id)
          const special = hasSpecial(tg)
          const seatCount = Math.max(table.capacity, tg.length, 1)

          return (
            <g key={table.id}>
              {/* Table circle */}
              <circle cx={pos.x} cy={pos.y} r={R}
                fill={special ? '#fef9ee' : '#faf8f4'}
                stroke={special ? '#f0c674' : '#d6d0c6'}
                strokeWidth={1.5}
              />

              {/* Table name */}
              <text x={pos.x} y={pos.y - 6} textAnchor="middle"
                fill="#2d3228" fontSize={11} fontWeight={500}
                style={{ fontFamily: 'var(--font-lato)' }}>
                {table.name}
              </text>

              {/* Count */}
              <text x={pos.x} y={pos.y + 10} textAnchor="middle"
                fill="#a09a90" fontSize={9} fontWeight={300}
                style={{ fontFamily: 'var(--font-lato)' }}>
                {tg.length}/{table.capacity}
              </text>

              {/* Guest seats around table */}
              {tg.map((g, i) => {
                const angle = (2 * Math.PI * i) / seatCount - Math.PI / 2
                const seatR = R + 22
                const sx = pos.x + Math.cos(angle) * seatR
                const sy = pos.y + Math.sin(angle) * seatR
                const isSpecial = g.type === 'Enfant' || g.type === 'Animal' || !!g.restriction
                return (
                  <g key={i}>
                    <circle cx={sx} cy={sy} r={6}
                      fill={isSpecial ? '#fef3c7' : '#f0ede8'}
                      stroke={isSpecial ? '#f0c674' : '#c8c2b8'}
                      strokeWidth={1}
                    />
                    <text x={sx} y={sy + 16} textAnchor="middle"
                      fill="#78736a" fontSize={7} fontWeight={300}
                      style={{ fontFamily: 'var(--font-lato)' }}>
                      {g.name.length > 14 ? g.name.slice(0, 12) + "..." : g.name}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>

      {/* 2D Legend */}
      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#fef9ee] border border-[#f0c674]" />
          <span className="text-[11px] text-stone-400" style={{ fontWeight: 300 }}>Table avec besoins spéciaux</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#fef3c7] border border-[#f0c674]" />
          <span className="text-[11px] text-stone-400" style={{ fontWeight: 300 }}>Invité spécial (enfant/animal/restriction)</span>
        </div>
      </div>
    </div>
  )
}
