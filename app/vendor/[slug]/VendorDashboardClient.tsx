'use client'

import { useState } from 'react'
import { hasPermission } from '@/lib/vendor-permissions'
import type { VendorPermissions } from '@/lib/vendor-permissions'

type Props = {
  slug: string
  vendor: { name: string; category: string }
  wedding: { name: string; date: string | null; location: string | null }
  permissions: VendorPermissions
  data: {
    guestCount: number
    confirmedCount: number
    pendingCount: number
    declinedCount: number
    guestNames: { name: string; rsvp: string }[]
    dietaryInfo: { name: string; info: string; table: string | null }[]
    menuBreakdown: { type: string; count: number }[]
    programSteps: { title: string; time: string; location: string; description: string }[]
    songs: { title: string; artist: string; moment: string }[]
    tables: { name: string; capacity: number; guests: string[] }[]
  }
}

const RSVP_LABELS: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmé', color: 'text-emerald-600 bg-emerald-50' },
  present: { label: 'Présent', color: 'text-emerald-600 bg-emerald-50' },
  declined: { label: 'Décliné', color: 'text-red-400 bg-red-50' },
  absent: { label: 'Absent', color: 'text-red-400 bg-red-50' },
  pending: { label: 'En attente', color: 'text-amber-500 bg-amber-50' },
}

function getRsvp(status: string) {
  return RSVP_LABELS[status] ?? RSVP_LABELS.pending
}

export default function VendorDashboardClient({ slug, vendor, wedding, permissions, data }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggle(key: string) {
    setExpanded(expanded === key ? null : key)
  }

  const rows: { key: string; icon: string; label: string; value: string | number; expandable: boolean; permKey: keyof VendorPermissions }[] = []

  // Order matches nav: Invités → Plan de table → Programme → Lieux

  if (hasPermission(permissions, 'guest_count')) {
    rows.push({
      key: 'guests',
      icon: '👥',
      label: "Nombre d'invités",
      value: `${data.confirmedCount} confirmés / ${data.guestCount} total`,
      expandable: data.pendingCount > 0 || data.declinedCount > 0,
      permKey: 'guest_count',
    })
  }

  if (hasPermission(permissions, 'guest_allergies')) {
    rows.push({
      key: 'dietary',
      icon: '🥗',
      label: 'Menus & restrictions',
      value: data.menuBreakdown.length > 0
        ? data.menuBreakdown.map(m => `${m.type}: ${m.count}`).join(" · ")
        : 'Aucun',
      expandable: data.menuBreakdown.length > 0 || data.dietaryInfo.length > 0,
      permKey: 'guest_allergies',
    })
  }

  if (hasPermission(permissions, 'seating_plan')) {
    rows.push({
      key: 'tables',
      icon: '🪑',
      label: 'Plan de table',
      value: data.tables.length > 0 ? `${data.tables.length} table${data.tables.length > 1 ? 's' : ''}` : 'Non défini',
      expandable: data.tables.length > 0,
      permKey: 'seating_plan',
    })
  }

  if (hasPermission(permissions, 'programme')) {
    rows.push({
      key: 'programme',
      icon: '⏰',
      label: 'Programme du jour J',
      value: data.programSteps.length > 0 ? `${data.programSteps.length} étape${data.programSteps.length > 1 ? 's' : ''}` : 'Non défini',
      expandable: data.programSteps.length > 0,
      permKey: 'programme',
    })
  }

  if (hasPermission(permissions, 'playlist')) {
    rows.push({
      key: 'playlist',
      icon: '🎵',
      label: 'Playlist musicale',
      value: data.songs.length > 0 ? `${data.songs.length} titre${data.songs.length > 1 ? 's' : ''}` : 'Vide',
      expandable: data.songs.length > 0,
      permKey: 'playlist',
    })
  }

  if (hasPermission(permissions, 'location')) {
    rows.push({
      key: 'location',
      icon: '📍',
      label: 'Lieux et adresses',
      value: wedding.location ?? 'Non renseigné',
      expandable: false,
      permKey: 'location',
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header compact */}
        <div className="mb-6">
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.15em' }}
             className="text-stone-400 uppercase mb-1">
            Espace prestataire
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.6rem' }}
              className="text-[#2d3228]">{wedding.name}</h1>
          <div className="flex items-center gap-4 mt-1">
            {wedding.date && (
              <span className="text-sm text-stone-500" style={{ fontWeight: 300 }}>📅 {wedding.date}</span>
            )}
            {hasPermission(permissions, 'location') && wedding.location && (
              <span className="text-sm text-stone-500" style={{ fontWeight: 300 }}>📍 {wedding.location}</span>
            )}
          </div>
        </div>

        {/* Tableau principal */}
        {rows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-200 py-16 text-center">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 300 }}
               className="text-stone-300 mb-2">Aucune information partagée</p>
            <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
              Les mariés ne vous ont pas encore donné accès.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden divide-y divide-stone-50">
            {rows.map(row => {
              const isExpanded = expanded === row.key
              return (
                <div key={row.key}>
                  {/* Ligne principale */}
                  <div
                    className={`flex items-center gap-3 px-5 py-4 ${row.expandable ? 'cursor-pointer hover:bg-stone-50/50' : ''} transition`}
                    onClick={() => row.expandable && toggle(row.key)}
                  >
                    <span className="text-lg shrink-0 w-7 text-center">{row.icon}</span>
                    <span className="flex-1 text-sm text-[#2d3228]" style={{ fontWeight: 400 }}>
                      {row.label}
                    </span>
                    <span className="text-sm text-stone-500 text-right" style={{ fontWeight: 300 }}>
                      {row.value}
                    </span>
                    {row.expandable && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                           className={`w-4 h-4 text-stone-300 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>

                  {/* Détails dépliés */}
                  {isExpanded && (
                    <div className="px-5 pb-4 bg-stone-50/30">

                      {/* Guests breakdown */}
                      {row.key === 'guests' && (
                        <div className="flex gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-xs text-stone-500" style={{ fontWeight: 300 }}>
                              {data.confirmedCount} confirmé{data.confirmedCount > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-xs text-stone-500" style={{ fontWeight: 300 }}>
                              {data.pendingCount} en attente
                            </span>
                          </div>
                          {data.declinedCount > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-300" />
                              <span className="text-xs text-stone-500" style={{ fontWeight: 300 }}>
                                {data.declinedCount} décliné{data.declinedCount > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Dietary details */}
                      {row.key === 'dietary' && (
                        <div className="space-y-3">
                          {data.menuBreakdown.length > 0 && (
                            <div className="flex gap-3 flex-wrap">
                              {data.menuBreakdown.map((m, i) => (
                                <div key={i} className="bg-white rounded-lg border border-stone-100 px-3 py-1.5 flex items-center gap-2">
                                  <span className="text-xs text-[#2d3228]" style={{ fontWeight: 400 }}>{m.type}</span>
                                  <span className="text-xs text-[#4a5240]" style={{ fontWeight: 500 }}>{m.count}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {data.dietaryInfo.length > 0 && (
                            <div>
                              <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1.5" style={{ fontWeight: 400 }}>Restrictions alimentaires</p>
                              <div className="space-y-1.5">
                                {data.dietaryInfo.map((d, i) => (
                                  <div key={i} className="flex items-start gap-2 text-xs">
                                    <span className="text-stone-600 shrink-0 w-28 truncate" style={{ fontWeight: 400 }}>{d.name}</span>
                                    <span className="text-stone-400 flex-1" style={{ fontWeight: 300 }}>{d.info}</span>
                                    {d.table && (
                                      <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full shrink-0" style={{ fontWeight: 300 }}>
                                        {d.table}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Programme timeline */}
                      {row.key === 'programme' && (
                        <div className="space-y-2">
                          {data.programSteps.map((step, i) => (
                            <div key={i} className="flex gap-3 items-start">
                              <span className="text-xs text-[#4a5240] shrink-0 w-12 text-right pt-0.5" style={{ fontWeight: 500 }}>
                                {step.time}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-[#2d3228]" style={{ fontWeight: 400 }}>{step.title}</p>
                                {step.description && (
                                  <p className="text-xs text-stone-400 mt-0.5" style={{ fontWeight: 300 }}>{step.description}</p>
                                )}
                                {step.location && (
                                  <p className="text-xs text-stone-300 mt-0.5" style={{ fontWeight: 300 }}>📍 {step.location}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Playlist */}
                      {row.key === 'playlist' && (
                        <div className="space-y-1">
                          {data.songs.map((song, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="text-stone-600 flex-1 truncate" style={{ fontWeight: 400 }}>
                                {song.title}
                                <span className="text-stone-300 ml-1" style={{ fontWeight: 300 }}>— {song.artist}</span>
                              </span>
                              {song.moment && (
                                <span className="text-[10px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-full shrink-0" style={{ fontWeight: 300 }}>
                                  {song.moment}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Seating plan */}
                      {row.key === 'tables' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {data.tables.map((table, i) => (
                            <div key={i} className="bg-white rounded-lg border border-stone-100 px-3 py-2">
                              <p className="text-xs text-[#2d3228] mb-0.5" style={{ fontWeight: 400 }}>
                                {table.name}
                                <span className="text-stone-300 ml-1" style={{ fontWeight: 300 }}>
                                  ({table.guests.length}/{table.capacity})
                                </span>
                              </p>
                              {table.guests.length > 0 && (
                                <p className="text-[11px] text-stone-400 leading-relaxed" style={{ fontWeight: 300 }}>
                                  {table.guests.join(' · ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-stone-300 mt-8" style={{ fontWeight: 300 }}>
          Accès en lecture seule · Données mises à jour en temps réel
        </p>
      </div>
    </div>
  )
}
