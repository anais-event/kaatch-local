'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type Guest = {
  id: string
  first_name: string
  last_name: string | null
  guest_type?: string | null
  rsvp_status?: string | null
}

type Product = { key: string; label: string }

type Selection = Record<string, Record<string, boolean>>

const PRODUCTS: Product[] = [
  { key: 'save_the_date', label: 'Save the date' },
  { key: 'faire_part',    label: 'Faire-part' },
  { key: 'menu',          label: 'Menu' },
  { key: 'marque_place',  label: 'Marque-place' },
  { key: 'programme',     label: 'Programme' },
]

function cleanName(n: string | null | undefined) {
  if (!n) return ''
  return n.split(' ').filter(p => p && p !== 'null').join(' ')
}

function groupByFoyer(guests: Guest[]): { foyer: string; members: Guest[] }[] {
  const map = new Map<string, Guest[]>()
  for (const g of guests) {
    const key = cleanName(g.last_name) || 'Sans nom'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(g)
  }
  return Array.from(map.entries()).map(([foyer, members]) => ({ foyer, members }))
}

function CheckCircle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer
        ${checked ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300 hover:border-[#4a5240]/60 bg-white'}`}
    >
      {checked && (
        <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
          <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

export default function DestinatairesClient({
  slug,
  weddingName,
  guests,
}: {
  slug: string
  weddingName: string
  guests: Guest[]
}) {
  const router = useRouter()
  const storageKey = `studio_dest_${slug}`
  const foyers = useMemo(() => groupByFoyer(guests), [guests])

  const [selection, setSelection] = useState<Selection>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    const init: Selection = {}
    for (const g of guests) {
      init[g.id] = { save_the_date: false, faire_part: false, menu: true, marque_place: true, programme: true }
    }
    return init
  })

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(storageKey, JSON.stringify(selection)), 800)
    return () => clearTimeout(t)
  }, [selection, storageKey])

  function toggle(guestId: string, product: string) {
    setSelection(prev => ({ ...prev, [guestId]: { ...prev[guestId], [product]: !prev[guestId]?.[product] } }))
  }

  // Sélection foyer entière : 1 clic = bascule tous les produits de tous les membres
  function toggleFoyerAll(members: Guest[]) {
    const allFullyChecked = members.every(m => PRODUCTS.every(p => selection[m.id]?.[p.key]))
    setSelection(prev => {
      const next = { ...prev }
      for (const m of members) {
        next[m.id] = Object.fromEntries(PRODUCTS.map(p => [p.key, !allFullyChecked]))
      }
      return next
    })
  }

  // Sélection colonne entière
  function toggleCol(product: string) {
    const allChecked = guests.every(g => selection[g.id]?.[product])
    setSelection(prev => {
      const next = { ...prev }
      for (const g of guests) next[g.id] = { ...next[g.id], [product]: !allChecked }
      return next
    })
  }

  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const p of PRODUCTS) t[p.key] = guests.filter(g => selection[g.id]?.[p.key]).length
    return t
  }, [selection, guests])

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* En-tête */}
      <div className="max-w-5xl mx-auto px-4 py-8 pb-4">
        <a href={`/mariage/${slug}/studio`}
          className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 transition-colors mb-5"
          style={{ fontWeight: 300, fontSize: '0.75rem' }}>
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Studio créatif
        </a>
        <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase mb-1">02 · Vos destinataires</p>
        <h1 style={{ fontWeight: 600, fontSize: '1.3rem', lineHeight: 1.2 }} className="text-[#2d3228] mb-1">Personnalisez vos envois</h1>
        <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500">
          Cliquez sur <strong style={{ fontWeight: 500 }}>Famille [Nom]</strong> pour sélectionner tout le foyer. Cliquez sur un en-tête de colonne pour tout sélectionner.
        </p>
      </div>

      {/* Tableau */}
      <div className="max-w-5xl mx-auto px-0 sm:px-4 pb-40">
        <div className="bg-white border-y border-stone-100 sm:rounded-xl sm:border sm:shadow-sm overflow-hidden">

          {/* Header colonnes sticky */}
          <div className="sticky top-0 z-10 bg-white border-b border-stone-100">
            <div className="flex items-end min-w-0">
              <div className="flex-1 min-w-[140px] px-4 py-3">
                <span style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.15em' }} className="text-stone-400 uppercase">
                  Invité
                </span>
              </div>
              {PRODUCTS.map(p => {
                const allChecked = guests.every(g => selection[g.id]?.[p.key])
                return (
                  <button
                    key={p.key}
                    onClick={() => toggleCol(p.key)}
                    className="group flex flex-col items-center gap-1.5 px-2 py-3 flex-shrink-0"
                    style={{ width: 'clamp(68px, 14vw, 100px)' }}
                    title={`Tout sélectionner : ${p.label}`}
                  >
                    <span style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.04em' }}
                      className="text-stone-400 group-hover:text-[#4a5240] transition-colors text-center leading-tight block">
                      {p.label}
                    </span>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                      ${allChecked ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-200 group-hover:border-[#4a5240]/50'}`}>
                      {allChecked && (
                        <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                          <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Foyers et membres */}
          {foyers.map(({ foyer, members }, fi) => {
            const allFullyChecked = members.every(m => PRODUCTS.every(p => selection[m.id]?.[p.key]))
            const someChecked = members.some(m => PRODUCTS.some(p => selection[m.id]?.[p.key]))

            return (
              <div key={foyer} className={fi > 0 ? 'border-t border-stone-100' : ''}>

                {/* Ligne foyer — clic = bascule tout */}
                <button
                  onClick={() => toggleFoyerAll(members)}
                  className="w-full flex items-center bg-stone-50/80 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex-1 min-w-[140px] px-4 py-2 flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${allFullyChecked
                        ? 'bg-[#4a5240] border-[#4a5240]'
                        : someChecked
                          ? 'border-[#4a5240]/50 bg-[#4a5240]/10'
                          : 'border-stone-300'}`}>
                      {allFullyChecked && (
                        <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                          <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {!allFullyChecked && someChecked && (
                        <div className="w-1.5 h-0.5 bg-[#4a5240] rounded-full" />
                      )}
                    </div>
                    <span style={{ fontWeight: 500, fontSize: '0.75rem' }} className="text-stone-600">
                      Famille {foyer}
                    </span>
                    {members.length > 1 && (
                      <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400">
                        {members.length} personnes
                      </span>
                    )}
                  </div>
                  {/* Indicateurs visuels par colonne */}
                  {PRODUCTS.map(p => {
                    const colChecked = members.filter(m => selection[m.id]?.[p.key]).length
                    return (
                      <div key={p.key} className="flex items-center justify-center flex-shrink-0 py-2"
                        style={{ width: 'clamp(68px, 14vw, 100px)' }}>
                        {colChecked > 0 && (
                          <span style={{ fontWeight: 300, fontSize: '0.62rem' }} className="text-[#4a5240]">
                            {colChecked}/{members.length}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </button>

                {/* Membres */}
                {members.map((guest, gi) => (
                  <div
                    key={guest.id}
                    className={`flex items-center hover:bg-stone-50/40 transition-colors
                      ${gi < members.length - 1 ? 'border-b border-stone-50' : ''}`}
                  >
                    <div className="flex-1 min-w-[140px] px-4 py-2.5 flex items-center gap-2 pl-10">
                      <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-700">
                        {cleanName(guest.first_name)}
                        {cleanName(guest.last_name) && (
                          <span className="text-stone-400"> {cleanName(guest.last_name)}</span>
                        )}
                      </span>
                      {guest.guest_type === 'enfant' && (
                        <span style={{ fontWeight: 300, fontSize: '0.6rem' }}
                          className="text-stone-300 border border-stone-200 rounded-full px-1.5 py-0.5">
                          enfant
                        </span>
                      )}
                    </div>
                    {PRODUCTS.map(p => (
                      <div key={p.key} className="flex items-center justify-center flex-shrink-0"
                        style={{ width: 'clamp(68px, 14vw, 100px)' }}>
                        <CheckCircle
                          checked={!!selection[guest.id]?.[p.key]}
                          onChange={() => toggle(guest.id, p.key)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          })}

          {/* Totaux */}
          <div className="flex items-center border-t border-stone-200 bg-stone-50">
            <div className="flex-1 min-w-[140px] px-4 py-3">
              <span style={{ fontWeight: 400, fontSize: '0.72rem', letterSpacing: '0.1em' }} className="text-stone-500 uppercase">
                Total
              </span>
            </div>
            {PRODUCTS.map(p => (
              <div key={p.key} className="flex items-center justify-center flex-shrink-0 py-3"
                style={{ width: 'clamp(68px, 14vw, 100px)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }} className="text-[#4a5240]">
                  {totals[p.key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Récap */}
        <div className="px-4 sm:px-0 mt-4">
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-50">
              <p style={{ fontWeight: 600, fontSize: '0.88rem' }} className="text-[#2d3228]">
                Récapitulatif
              </p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-2">
              {PRODUCTS.filter(p => totals[p.key] > 0).map(p => (
                <div key={p.key} className="flex items-center justify-between">
                  <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-600">
                    {totals[p.key]} × {p.label}
                  </span>
                  <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-400">— €</span>
                </div>
              ))}
              {grandTotal === 0 && (
                <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-300 text-center py-1">
                  Aucune sélection
                </p>
              )}
            </div>
            {grandTotal > 0 && (
              <div className="px-5 py-3 border-t border-stone-50 flex justify-between bg-stone-50/50">
                <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                  {grandTotal} créations sélectionnées
                </span>
                <span style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-500">
                  Total à définir
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barre bas */}
      <div className="fixed bottom-0 left-0 right-0 md:left-56 z-40 bg-white/95 backdrop-blur border-t border-stone-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push(`/mariage/${slug}/studio`)}
            style={{ fontWeight: 300, fontSize: '0.82rem' }}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors">
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour au studio
          </button>
          <div className="flex items-center gap-3">
            <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300 hidden sm:block">
              Sauvegardé automatiquement
            </span>
            <button
              onClick={() => router.push(`/mariage/${slug}/studio`)}
              disabled={grandTotal === 0}
              style={{ fontWeight: 400, fontSize: '0.8rem', letterSpacing: '0.03em' }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-all
                ${grandTotal > 0 ? 'bg-[#4a5240] text-white hover:bg-[#2d3228]' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}>
              Valider mes envois
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="h-safe-bottom" />
      </div>
    </div>
  )
}
