'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type Item = {
  key: string
  label: string
  icon: string
  desc: string
  defaultQty: number
  qtyLabel: string
  fixed?: boolean
}

type CollectionState = Record<string, { checked: boolean; qty: number }>

export default function CollectionClient({
  slug, weddingName, guestCount, foyerCount, tableCount, programmeCount,
}: {
  slug: string; weddingName: string; guestCount: number; foyerCount: number; tableCount: number; programmeCount: number
}) {
  const router = useRouter()
  const storageKey = `studio_coll_${slug}`

  const ITEMS: Item[] = [
    { key: 'save_the_date', label: 'Save the date',  icon: '📅', desc: '1 par foyer — annonce en avant-première',  defaultQty: foyerCount,  qtyLabel: 'foyers', fixed: false },
    { key: 'faire_part',    label: 'Faire-part',      icon: '💌', desc: '1 par foyer — invitation officielle',      defaultQty: foyerCount,  qtyLabel: 'foyers', fixed: false },
    { key: 'menu',          label: 'Menu',            icon: '🍽️', desc: '1 par personne',                           defaultQty: guestCount,  qtyLabel: 'pers.',  fixed: false },
    { key: 'marque_place',  label: 'Marque-place',    icon: '🏷️', desc: '1 par personne',                           defaultQty: guestCount,  qtyLabel: 'pers.',  fixed: false },
    { key: 'programme',     label: 'Programme',       icon: '📋', desc: 'Déroulé de cérémonie',                     defaultQty: Math.max(guestCount, 1), qtyLabel: 'ex.',   fixed: false },
    { key: 'plan_table',    label: 'Plan de table',   icon: '🗺️', desc: 'Affiche grand format',                     defaultQty: 1,           qtyLabel: 'affiche', fixed: true },
    { key: 'numeros_table', label: 'Numéros de table',icon: '🔢', desc: `${tableCount || '?'} tables`,              defaultQty: tableCount || 1, qtyLabel: 'tables', fixed: true },
  ]

  const [state, setState] = useState<CollectionState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return Object.fromEntries(ITEMS.map(i => [i.key, { checked: true, qty: i.defaultQty }]))
  })

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(storageKey, JSON.stringify(state)), 800)
    return () => clearTimeout(t)
  }, [state, storageKey])

  function toggleItem(key: string) {
    setState(prev => ({ ...prev, [key]: { ...prev[key], checked: !prev[key]?.checked } }))
  }
  function setQty(key: string, qty: number) {
    setState(prev => ({ ...prev, [key]: { ...prev[key], qty: Math.max(0, qty) } }))
  }

  const selected = ITEMS.filter(i => state[i.key]?.checked)
  const totalItems = selected.reduce((acc, i) => acc + (state[i.key]?.qty ?? i.defaultQty), 0)

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-36 space-y-5">

        {/* En-tête */}
        <div>
          <a href={`/mariage/${slug}/studio`}
            className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 transition-colors mb-5"
            style={{ fontWeight: 300, fontSize: '0.75rem' }}>
            <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Studio créatif
          </a>
          <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase mb-1">01 · Votre collection</p>
          <h1 style={{ fontWeight: 600, fontSize: '1.3rem' }} className="text-[#2d3228] mb-1">Que souhaitez-vous créer ?</h1>
          <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500">
            Sélectionnez les pièces et ajustez les quantités. Pré-rempli d'après votre liste d'invités.
          </p>
        </div>

        {/* Liste items */}
        <div className="flex flex-col gap-3">
          {ITEMS.map(item => {
            const s = state[item.key] ?? { checked: true, qty: item.defaultQty }
            return (
              <div
                key={item.key}
                className={`bg-white rounded-xl border transition-all duration-150 overflow-hidden
                  ${s.checked ? 'border-[#4a5240]/30 shadow-sm' : 'border-stone-100 opacity-60'}`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleItem(item.key)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${s.checked ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300 hover:border-[#4a5240]/60 bg-white'}`}
                  >
                    {s.checked && (
                      <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                        <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  {/* Icône + texte */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{item.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-[#2d3228]">{item.label}</span>
                    </div>
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mt-0.5">{item.desc}</p>
                  </div>

                  {/* Quantité */}
                  {s.checked && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!item.fixed && (
                        <button onClick={() => setQty(item.key, s.qty - 1)}
                          className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-[#4a5240]/50 hover:text-[#4a5240] transition-all"
                          style={{ fontSize: '1rem', lineHeight: 1 }}>−</button>
                      )}
                      <div className="text-center min-w-[52px]">
                        {item.fixed ? (
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-[#4a5240]">{s.qty}</span>
                        ) : (
                          <input
                            type="number"
                            value={s.qty}
                            onChange={e => setQty(item.key, parseInt(e.target.value) || 0)}
                            className="w-12 text-center border border-stone-200 rounded-lg py-1 focus:outline-none focus:border-[#4a5240]/50"
                            style={{ fontWeight: 600, fontSize: '0.9rem', color: '#4a5240' }}
                            min={0}
                          />
                        )}
                        <p style={{ fontWeight: 300, fontSize: '0.6rem' }} className="text-stone-300">{item.qtyLabel}</p>
                      </div>
                      {!item.fixed && (
                        <button onClick={() => setQty(item.key, s.qty + 1)}
                          className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-[#4a5240]/50 hover:text-[#4a5240] transition-all"
                          style={{ fontSize: '1rem', lineHeight: 1 }}>+</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Récap */}
        {selected.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
            <p style={{ fontWeight: 600, fontSize: '0.82rem' }} className="text-[#2d3228] mb-3">Votre sélection</p>
            <div className="flex flex-col gap-1.5">
              {selected.map(i => (
                <div key={i.key} className="flex justify-between">
                  <span style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-600">
                    {i.icon} {i.label}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-500">
                    {state[i.key]?.qty ?? i.defaultQty} {i.qtyLabel}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-stone-50 flex justify-between">
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Total créations</span>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }} className="text-[#4a5240]">{totalItems}</span>
            </div>
          </div>
        )}
      </div>

      {/* Barre bas */}
      <div className="fixed bottom-0 left-0 right-0 md:left-56 z-40 bg-white/95 backdrop-blur border-t border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.push(`/mariage/${slug}/studio`)}
            style={{ fontWeight: 300, fontSize: '0.82rem' }}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors">
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </button>
          <div className="flex items-center gap-3">
            <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300 hidden sm:block">Sauvegardé auto.</span>
            <button
              onClick={() => router.push(`/mariage/${slug}/studio`)}
              disabled={selected.length === 0}
              style={{ fontWeight: 400, fontSize: '0.8rem', letterSpacing: '0.03em' }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all
                ${selected.length > 0 ? 'bg-[#4a5240] text-white hover:bg-[#2d3228]' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}>
              Valider ma sélection →
            </button>
          </div>
        </div>
        <div className="h-safe-bottom" />
      </div>
    </div>
  )
}
