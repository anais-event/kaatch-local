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
  perPerson: boolean
}

type CollectionState = Record<string, { checked: boolean; qty: number; printQty: number; download: boolean }>

export default function CollectionClient({
  slug, weddingName, guestCount, familleCount, tableCount, savedData, onSave,
}: {
  slug: string; weddingName: string; guestCount: number; familleCount: number; tableCount: number
  savedData: unknown; onSave: (data: unknown, progress: number) => Promise<void>
}) {
  const router = useRouter()
  const storageKey = `studio_coll_${slug}`
  const [saving, setSaving] = useState(false)

  const ITEMS: Item[] = [
    { key: 'save_the_date', label: 'Save the date',   icon: '📅', desc: '1 par famille — annonce en avant-première', defaultQty: familleCount,            qtyLabel: 'familles', perPerson: false },
    { key: 'faire_part',   label: 'Faire-part',        icon: '💌', desc: '1 par famille — invitation officielle',    defaultQty: familleCount,            qtyLabel: 'familles', perPerson: false },
    { key: 'menu',         label: 'Menu',              icon: '🍽️', desc: '1 par personne',                           defaultQty: guestCount,              qtyLabel: 'pers.',    perPerson: true  },
    { key: 'marque_place', label: 'Marque-place',      icon: '🏷️', desc: '1 par personne',                           defaultQty: guestCount,              qtyLabel: 'pers.',    perPerson: true  },
    { key: 'programme',   label: 'Programme',          icon: '📋', desc: 'Déroulé de cérémonie',                     defaultQty: Math.max(guestCount, 1), qtyLabel: 'ex.',      perPerson: true  },
    { key: 'plan_table',  label: 'Plan de table',      icon: '🗺️', desc: 'Affiche grand format',                     defaultQty: 1,                       qtyLabel: 'affiche',  perPerson: false },
    { key: 'numeros_table',label: 'Numéros de table',  icon: '🔢', desc: `${tableCount || '?'} tables`,              defaultQty: tableCount || 1,         qtyLabel: 'tables',   perPerson: false },
  ]

  const [state, setState] = useState<CollectionState>(() => {
    if (savedData && typeof savedData === 'object') return savedData as CollectionState
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return Object.fromEntries(
      ITEMS.map(i => [i.key, { checked: true, qty: i.defaultQty, printQty: i.defaultQty, download: false }])
    )
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
  function setPrintQty(key: string, qty: number) {
    setState(prev => ({ ...prev, [key]: { ...prev[key], printQty: Math.max(0, qty) } }))
  }
  function toggleDownload(key: string) {
    setState(prev => ({ ...prev, [key]: { ...prev[key], download: !prev[key]?.download } }))
  }

  const selected = ITEMS.filter(i => state[i.key]?.checked)

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-36 space-y-6">

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
            Sélectionnez les pièces et ajustez les quantités. Pré-rempli depuis votre liste d'invités.
          </p>
        </div>

        {/* ── Section 1 : Sélection ── */}
        <div>
          <p style={{ fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase mb-3">
            Vos créations
          </p>
          <div className="flex flex-col gap-2.5">
            {ITEMS.map(item => {
              const s = state[item.key] ?? { checked: true, qty: item.defaultQty, printQty: item.defaultQty, download: false }
              return (
                <div
                  key={item.key}
                  className={`bg-white rounded-xl border transition-all duration-150 overflow-hidden
                    ${s.checked ? 'border-[#4a5240]/25 shadow-sm' : 'border-stone-100 opacity-55'}`}
                >
                  <div className="flex items-center gap-4 p-4">
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{item.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }} className="text-[#2d3228]">{item.label}</span>
                      </div>
                      <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mt-0.5">{item.desc}</p>
                    </div>

                    {s.checked && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setQty(item.key, s.qty - 1)}
                          className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-[#4a5240]/50 hover:text-[#4a5240] transition-all"
                          style={{ fontSize: '1rem', lineHeight: 1 }}>−</button>
                        <div className="text-center" style={{ minWidth: 52 }}>
                          <input
                            type="number"
                            value={s.qty}
                            onChange={e => setQty(item.key, parseInt(e.target.value) || 0)}
                            className="w-12 text-center border border-stone-200 rounded-lg py-1 focus:outline-none focus:border-[#4a5240]/50"
                            style={{ fontWeight: 600, fontSize: '0.88rem', color: '#4a5240' }}
                            min={0}
                          />
                          <p style={{ fontWeight: 300, fontSize: '0.58rem' }} className="text-stone-300 mt-0.5">{item.qtyLabel}</p>
                        </div>
                        <button onClick={() => setQty(item.key, s.qty + 1)}
                          className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-[#4a5240]/50 hover:text-[#4a5240] transition-all"
                          style={{ fontSize: '1rem', lineHeight: 1 }}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Section 2 : Tableau impression / téléchargement ── */}
        {selected.length > 0 && (
          <div>
            <p style={{ fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase mb-3">
              Imprimer ou télécharger
            </p>
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="grid border-b border-stone-100" style={{ gridTemplateColumns: '1fr 160px 120px' }}>
                <div className="px-4 py-2.5">
                  <span style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Création</span>
                </div>
                <div className="px-3 py-2.5 border-l border-stone-100 text-center">
                  <span style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Imprimer</span>
                </div>
                <div className="px-3 py-2.5 border-l border-stone-100 text-center">
                  <span style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">PDF</span>
                </div>
              </div>

              {/* Rows */}
              {selected.map((item, idx) => {
                const s = state[item.key]
                return (
                  <div
                    key={item.key}
                    className={`grid items-center ${idx < selected.length - 1 ? 'border-b border-stone-50' : ''}`}
                    style={{ gridTemplateColumns: '1fr 160px 120px' }}
                  >
                    {/* Produit */}
                    <div className="flex items-center gap-2 px-4 py-3">
                      <span className="text-base leading-none">{item.icon}</span>
                      <span style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">{item.label}</span>
                    </div>

                    {/* Qty imprimer */}
                    <div className="flex items-center justify-center gap-1.5 px-3 py-2 border-l border-stone-50">
                      <button onClick={() => setPrintQty(item.key, (s?.printQty ?? s?.qty ?? 0) - 1)}
                        className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-[#4a5240]/50 hover:text-[#4a5240] transition-all flex-shrink-0"
                        style={{ fontSize: '0.9rem' }}>−</button>
                      <input
                        type="number"
                        value={s?.printQty ?? s?.qty ?? 0}
                        onChange={e => setPrintQty(item.key, parseInt(e.target.value) || 0)}
                        className="w-10 text-center border border-stone-200 rounded-md py-0.5 focus:outline-none focus:border-[#4a5240]/50"
                        style={{ fontWeight: 600, fontSize: '0.82rem', color: '#4a5240' }}
                        min={0}
                      />
                      <button onClick={() => setPrintQty(item.key, (s?.printQty ?? s?.qty ?? 0) + 1)}
                        className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-[#4a5240]/50 hover:text-[#4a5240] transition-all flex-shrink-0"
                        style={{ fontSize: '0.9rem' }}>+</button>
                    </div>

                    {/* Télécharger PDF */}
                    <div className="flex flex-col items-center justify-center gap-1 px-3 py-2 border-l border-stone-50">
                      <button
                        onClick={() => toggleDownload(item.key)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all border
                          ${s?.download
                            ? 'bg-[#4a5240] text-white border-[#4a5240]'
                            : 'bg-white text-stone-500 border-stone-200 hover:border-[#4a5240]/40'}`}
                        style={{ fontWeight: s?.download ? 500 : 300, fontSize: '0.7rem' }}
                      >
                        <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 flex-shrink-0">
                          <path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {s?.download ? 'Sélectionné' : 'Télécharger'}
                      </button>
                      {s?.download && (
                        <span style={{ fontWeight: 300, fontSize: '0.55rem' }} className="text-stone-300 text-center leading-tight">
                          hors destinataires
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Récap */}
        {selected.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
            <p style={{ fontWeight: 600, fontSize: '0.82rem' }} className="text-[#2d3228] mb-3">Votre sélection</p>
            <div className="flex flex-col gap-1.5">
              {selected.map(i => {
                const s = state[i.key]
                return (
                  <div key={i.key} className="flex justify-between items-center">
                    <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-600">
                      {i.icon} {i.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 500, fontSize: '0.78rem' }} className="text-stone-500">
                        {s?.qty ?? i.defaultQty} {i.qtyLabel}
                      </span>
                      {s?.download && (
                        <span style={{ fontWeight: 300, fontSize: '0.6rem' }} className="text-[#4a5240] border border-[#4a5240]/30 rounded-full px-1.5 py-0.5">
                          PDF
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
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
          <button
            onClick={async () => {
              if (selected.length === 0) return
              setSaving(true)
              const progress = selected.length >= 3 ? 100 : Math.round((selected.length / 7) * 100)
              await onSave(state, progress)
              router.push(`/mariage/${slug}/studio`)
            }}
            disabled={selected.length === 0 || saving}
            style={{ fontWeight: 400, fontSize: '0.8rem', letterSpacing: '0.03em' }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all
              ${selected.length > 0 && !saving ? 'bg-[#4a5240] text-white hover:bg-[#2d3228]' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}>
            {saving ? 'Sauvegarde…' : 'Valider ma sélection →'}
          </button>
        </div>
        <div className="h-safe-bottom" />
      </div>
    </div>
  )
}
