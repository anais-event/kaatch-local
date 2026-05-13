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

type Product = {
  key: string
  label: string
  short: string
}

type Selection = Record<string, Record<string, boolean>>

const PRODUCTS: Product[] = [
  { key: 'save_the_date', label: 'Save the date', short: 'STD' },
  { key: 'faire_part', label: 'Faire-part', short: 'FP' },
  { key: 'menu', label: 'Menu', short: 'Menu' },
  { key: 'marque_place', label: 'Marque-place', short: 'M.P.' },
  { key: 'programme', label: 'Programme', short: 'Prog.' },
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

function CheckCircle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-150 flex-shrink-0
        ${checked
          ? 'bg-[#4a5240] border-[#4a5240]'
          : 'border-stone-300 hover:border-[#4a5240]/50 bg-white'
        } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {checked && (
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
          <path d="M2 6l2.5 2.5L10 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
    // Défaut : tout coché sauf save_the_date (1 par foyer)
    const init: Selection = {}
    for (const g of guests) {
      init[g.id] = {
        save_the_date: false,
        faire_part: false,
        menu: true,
        marque_place: true,
        programme: true,
      }
    }
    return init
  })

  // Sauvegarder dans localStorage avec debounce
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(selection))
    }, 800)
    return () => clearTimeout(t)
  }, [selection, storageKey])

  function toggle(guestId: string, product: string) {
    setSelection(prev => ({
      ...prev,
      [guestId]: {
        ...prev[guestId],
        [product]: !prev[guestId]?.[product],
      },
    }))
  }

  function toggleFoyer(members: Guest[], product: string) {
    const allChecked = members.every(m => selection[m.id]?.[product])
    setSelection(prev => {
      const next = { ...prev }
      for (const m of members) {
        next[m.id] = { ...next[m.id], [product]: !allChecked }
      }
      return next
    })
  }

  function toggleAll(product: string) {
    const allChecked = guests.every(g => selection[g.id]?.[product])
    setSelection(prev => {
      const next = { ...prev }
      for (const g of guests) {
        next[g.id] = { ...next[g.id], [product]: !allChecked }
      }
      return next
    })
  }

  // Totaux par produit
  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const p of PRODUCTS) {
      t[p.key] = guests.filter(g => selection[g.id]?.[p.key]).length
    }
    return t
  }, [selection, guests])

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="max-w-5xl mx-auto px-0 sm:px-4 py-10 pb-40">

        {/* En-tête */}
        <div className="px-4 sm:px-0 mb-8">
          <a
            href={`/mariage/${slug}/studio`}
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors mb-6"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Studio créatif
          </a>

          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            02 · Vos destinataires
          </p>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(1.7rem, 4vw, 2.4rem)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#2d3228',
            lineHeight: 1.1,
          }}>
            Personnalisez vos envois
          </h1>
          <p className="text-stone-500 text-sm mt-2 leading-relaxed"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Cochez les créations à attribuer à chaque invité. Cliquez sur un nom de famille pour sélectionner tout le foyer.
          </p>
        </div>

        {/* Tableau */}
        <div className="bg-white border-y border-stone-100 sm:rounded-2xl sm:border sm:shadow-sm overflow-hidden">

          {/* Header colonnes — sticky */}
          <div className="sticky top-0 z-10 bg-white border-b border-stone-100">
            <div className="flex items-stretch">
              {/* Colonne invité */}
              <div className="flex-1 min-w-[160px] px-4 py-3 flex items-end">
                <span className="text-[10px] tracking-[0.15em] uppercase text-stone-400"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  Invité
                </span>
              </div>

              {/* Colonnes produits */}
              {PRODUCTS.map(p => (
                <div key={p.key} className="w-[72px] sm:w-20 flex flex-col items-center justify-end px-1 py-3 gap-2">
                  <button
                    onClick={() => toggleAll(p.key)}
                    className="group flex flex-col items-center gap-1.5"
                    title={`Tout sélectionner : ${p.label}`}
                  >
                    <span
                      className="text-[9px] sm:text-[10px] tracking-wide text-center text-stone-400 group-hover:text-[#4a5240] transition-colors leading-tight"
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
                    >
                      {p.short}
                    </span>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all
                      ${guests.every(g => selection[g.id]?.[p.key])
                        ? 'bg-[#4a5240] border-[#4a5240]'
                        : 'border-stone-200 group-hover:border-[#4a5240]/40'}`}
                    >
                      {guests.every(g => selection[g.id]?.[p.key]) && (
                        <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                          <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Corps — foyers et membres */}
          {foyers.map(({ foyer, members }, fi) => (
            <div key={foyer} className={fi > 0 ? 'border-t border-stone-50' : ''}>

              {/* Ligne foyer */}
              <div className="flex items-center bg-[#f5f0e8]/50">
                <button
                  onClick={() => PRODUCTS.forEach(p => toggleFoyer(members, p.key))}
                  className="flex-1 min-w-[160px] px-4 py-2 text-left flex items-center gap-2 group"
                >
                  <span className="text-[10px] tracking-[0.12em] uppercase text-stone-500 group-hover:text-[#4a5240] transition-colors"
                    style={{ fontFamily: 'var(--font-lato)', fontWeight: 400 }}>
                    Foyer {foyer}
                  </span>
                  {members.length > 1 && (
                    <span className="text-[9px] text-stone-300" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                      {members.length} pers.
                    </span>
                  )}
                </button>

                {/* Checkboxes foyer par colonne */}
                {PRODUCTS.map(p => {
                  const allChecked = members.every(m => selection[m.id]?.[p.key])
                  const someChecked = members.some(m => selection[m.id]?.[p.key])
                  return (
                    <div key={p.key} className="w-[72px] sm:w-20 flex items-center justify-center px-1 py-2">
                      <button
                        onClick={() => toggleFoyer(members, p.key)}
                        className={`w-4 h-4 rounded border transition-all
                          ${allChecked
                            ? 'bg-[#4a5240]/20 border-[#4a5240]/30'
                            : someChecked
                              ? 'border-[#4a5240]/20 bg-[#4a5240]/5'
                              : 'border-stone-200'}`}
                        title={`Tout le foyer : ${p.label}`}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Lignes membres */}
              {members.map((guest, gi) => {
                const firstName = cleanName(guest.first_name)
                const lastName = cleanName(guest.last_name)
                return (
                  <div
                    key={guest.id}
                    className={`flex items-center hover:bg-stone-50/50 transition-colors
                      ${gi < members.length - 1 ? 'border-b border-stone-50' : ''}`}
                  >
                    {/* Nom */}
                    <div className="flex-1 min-w-[160px] px-4 py-3 flex items-center gap-2">
                      <span
                        className="text-sm text-stone-700 leading-tight"
                        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
                      >
                        {firstName}
                        {lastName && <span className="text-stone-400"> {lastName}</span>}
                      </span>
                      {guest.guest_type === 'enfant' && (
                        <span className="text-[9px] text-stone-300 border border-stone-200 rounded-full px-1.5 py-0.5"
                          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                          enfant
                        </span>
                      )}
                    </div>

                    {/* Checkboxes */}
                    {PRODUCTS.map(p => (
                      <div key={p.key} className="w-[72px] sm:w-20 flex items-center justify-center px-1">
                        <CheckCircle
                          checked={!!selection[guest.id]?.[p.key]}
                          onChange={() => toggle(guest.id, p.key)}
                        />
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Ligne totaux */}
          <div className="flex items-center border-t border-stone-200 bg-[#f5f0e8]/30">
            <div className="flex-1 min-w-[160px] px-4 py-3">
              <span className="text-[10px] tracking-[0.15em] uppercase text-stone-400"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                Total
              </span>
            </div>
            {PRODUCTS.map(p => (
              <div key={p.key} className="w-[72px] sm:w-20 flex items-center justify-center px-1 py-3">
                <span
                  className="text-sm text-[#4a5240] font-medium"
                  style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem' }}
                >
                  {totals[p.key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Récapitulatif prix */}
        <div className="px-4 sm:px-0 mt-6">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-50">
              <h3
                className="text-stone-700"
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem', fontWeight: 500 }}
              >
                Récapitulatif de votre collection
              </h3>
            </div>
            <div className="px-6 py-4 flex flex-col gap-2.5">
              {PRODUCTS.map(p => (
                totals[p.key] > 0 && (
                  <div key={p.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-sm text-stone-600"
                        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
                      >
                        {totals[p.key]} × {p.label}
                      </span>
                    </div>
                    <span
                      className="text-sm text-stone-400"
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
                    >
                      — €
                    </span>
                  </div>
                )
              ))}

              {grandTotal === 0 && (
                <p className="text-stone-300 text-sm text-center py-2"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  Aucune sélection pour l'instant
                </p>
              )}
            </div>

            {grandTotal > 0 && (
              <div className="px-6 py-4 border-t border-stone-50 flex items-center justify-between bg-[#f5f0e8]/30">
                <span
                  className="text-xs tracking-[0.15em] uppercase text-stone-400"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
                >
                  {grandTotal} créations sélectionnées
                </span>
                <span
                  className="text-stone-700"
                  style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem' }}
                >
                  Total à définir
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Barre bas fixe */}
      <div className="fixed bottom-0 left-0 right-0 md:left-56 z-40 bg-white/95 backdrop-blur border-t border-stone-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push(`/mariage/${slug}/studio`)}
            className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour au studio
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-300 hidden sm:block"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              Sauvegardé automatiquement
            </span>
            <button
              onClick={() => router.push(`/mariage/${slug}/studio`)}
              disabled={grandTotal === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all duration-200
                ${grandTotal > 0
                  ? 'bg-[#4a5240] text-white hover:bg-[#2d3228] shadow-sm'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}
            >
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
