'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type ProgrammeStep = { id: string; title: string; time: string | null; description: string | null }
type Table = { id: string; name: string; capacity: number; guests: string[] }

type ReceptionState = {
  programme: { enabled: boolean; qty: number }
  planTable: { enabled: boolean; qty: number }
  numerosTable: { enabled: boolean; qty: number }
}

export default function ReceptionClient({
  slug, weddingDate, weddingLocation,
  programmeSteps, tables, savedData, onSave,
}: {
  slug: string
  weddingName: string
  weddingDate: string | null
  weddingLocation: string | null
  programmeSteps: ProgrammeStep[]
  tables: Table[]
  savedData: unknown
  onSave: (data: unknown, progress: number) => Promise<void>
}) {
  const router = useRouter()
  const storageKey = `studio_recep_${slug}`
  const [saving, setSaving] = useState(false)

  const totalGuests = tables.reduce((acc, t) => acc + t.guests.length, 0)

  const [state, setState] = useState<ReceptionState>(() => {
    if (savedData && typeof savedData === 'object') return savedData as ReceptionState
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return {
      programme:    { enabled: programmeSteps.length > 0, qty: Math.max(totalGuests, 1) },
      planTable:    { enabled: tables.length > 0, qty: 1 },
      numerosTable: { enabled: tables.length > 0, qty: tables.length || 1 },
    }
  })

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(storageKey, JSON.stringify(state)), 800)
    return () => clearTimeout(t)
  }, [state, storageKey])

  function setEnabled(key: keyof ReceptionState, val: boolean) {
    setState(prev => ({ ...prev, [key]: { ...prev[key], enabled: val } }))
  }
  function setQty(key: keyof ReceptionState, val: number) {
    setState(prev => ({ ...prev, [key]: { ...prev[key], qty: Math.max(1, val) } }))
  }

  const anySelected = state.programme.enabled || state.planTable.enabled || state.numerosTable.enabled

  const items = [
    {
      key: 'programme' as const,
      icon: '📋',
      title: 'Programme de cérémonie',
      format: 'A5 · 4 pages',
      hint: programmeSteps.length > 0
        ? `${programmeSteps.length} étapes configurées`
        : null,
      warning: programmeSteps.length === 0
        ? { text: 'Programme non configuré', href: `/mariage/${slug}/programme`, cta: 'Créer le programme →' }
        : null,
      defaultQty: Math.max(totalGuests, 1),
      qtyLabel: 'exemplaires',
      preview: programmeSteps.length > 0
        ? programmeSteps.slice(0, 3).map(s => (s.time ? `${s.time} · ` : '') + s.title)
        : null,
    },
    {
      key: 'planTable' as const,
      icon: '🗺️',
      title: 'Plan de table',
      format: 'A2 · portrait · affiche',
      hint: tables.length > 0
        ? `${tables.length} tables · ${totalGuests} invités placés`
        : null,
      warning: tables.length === 0
        ? { text: 'Plan de table non configuré', href: `/mariage/${slug}/tables`, cta: 'Créer le plan de table →' }
        : null,
      defaultQty: 1,
      qtyLabel: 'affiche(s)',
      preview: tables.length > 0
        ? tables.slice(0, 4).map(t => `${t.name} (${t.guests.length})`)
        : null,
    },
    {
      key: 'numerosTable' as const,
      icon: '🔢',
      title: 'Numéros de table',
      format: 'A5 · chevalet',
      hint: tables.length > 0
        ? `${tables.length} numéros à imprimer`
        : null,
      warning: tables.length === 0
        ? { text: 'Aucune table configurée', href: `/mariage/${slug}/tables`, cta: 'Créer le plan de table →' }
        : null,
      defaultQty: tables.length || 1,
      qtyLabel: 'numéros',
      preview: tables.length > 0
        ? tables.map(t => t.name)
        : null,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-36">

        {/* En-tête minimal */}
        <a href={`/mariage/${slug}/studio`}
          className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 transition-colors mb-5"
          style={{ fontWeight: 300, fontSize: '0.75rem' }}>
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Studio créatif
        </a>
        <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase mb-1">04 · Éléments de réception</p>
        <h1 style={{ fontWeight: 600, fontSize: '1.3rem' }} className="text-[#2d3228] mb-5">
          Pièces du jour J
        </h1>

        <div className="flex flex-col gap-3">
          {items.map(item => {
            const s = state[item.key]
            return (
              <div
                key={item.key}
                className="bg-white rounded-xl border overflow-hidden transition-all duration-200"
                style={{ borderColor: s.enabled ? 'rgba(74,82,64,0.3)' : '#e7e5e4' }}
              >
                {/* ── Ligne principale ── */}
                <div className="flex items-center gap-4 px-4 py-4">
                  {/* Icône produit */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: s.enabled ? '#f0e9d8' : '#f5f5f4' }}
                  >
                    {item.icon}
                  </div>

                  {/* Info produit */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-[#2d3228]">
                        {item.title}
                      </span>
                      {item.hint && (
                        <span
                          className="rounded-full px-2 py-0.5"
                          style={{
                            background: s.enabled ? 'rgba(74,82,64,0.1)' : '#f5f5f4',
                            color: s.enabled ? '#4a5240' : '#a8a29e',
                            fontWeight: 300,
                            fontSize: '0.62rem',
                          }}
                        >
                          {item.hint}
                        </span>
                      )}
                    </div>
                    <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400 mt-0.5">
                      {item.format}
                    </p>
                  </div>

                  {/* Toggle inclure/exclure */}
                  <button
                    onClick={() => setEnabled(item.key, !s.enabled)}
                    className={`relative flex-shrink-0 rounded-full transition-all duration-200`}
                    style={{
                      width: 44, height: 24,
                      background: s.enabled ? '#4a5240' : '#d6d3d1',
                    }}
                    aria-label={s.enabled ? 'Exclure' : 'Inclure'}
                  >
                    <span
                      className="absolute rounded-full bg-white shadow-sm transition-all duration-200"
                      style={{
                        width: 18, height: 18,
                        top: 3,
                        left: s.enabled ? 23 : 3,
                      }}
                    />
                  </button>
                </div>

                {/* ── Avertissement si non configuré ── */}
                {item.warning && s.enabled && (
                  <div className="mx-4 mb-3 px-3 py-2.5 bg-amber-50 rounded-lg border border-amber-100">
                    <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-amber-700">
                      {item.warning.text}{' '}
                      <a href={item.warning.href} className="underline font-medium hover:text-amber-800">
                        {item.warning.cta}
                      </a>
                    </p>
                  </div>
                )}

                {/* ── Aperçu contenu (si configuré) ── */}
                {item.preview && s.enabled && (
                  <div className="px-4 pb-3">
                    <div className="bg-stone-50 rounded-lg px-3 py-2 flex flex-wrap gap-1.5">
                      {item.preview.map((p, i) => (
                        <span
                          key={i}
                          style={{ fontWeight: 300, fontSize: '0.65rem' }}
                          className="text-stone-500 bg-white rounded-md px-2 py-0.5 border border-stone-100"
                        >
                          {p}
                        </span>
                      ))}
                      {item.key === 'planTable' && tables.length > 4 && (
                        <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400 self-center">
                          +{tables.length - 4} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Quantité (toujours visible si enabled) ── */}
                {s.enabled && (
                  <div
                    className="flex items-center justify-between px-4 py-3 border-t"
                    style={{ borderColor: 'rgba(74,82,64,0.1)', background: 'rgba(74,82,64,0.03)' }}
                  >
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.75rem' }} className="text-stone-600">
                        Combien en voulez-vous ?
                      </p>
                      <p style={{ fontWeight: 300, fontSize: '0.62rem' }} className="text-stone-400 mt-0.5">
                        Suggestion basée sur vos données : {item.defaultQty} {item.qtyLabel}
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setQty(item.key, s.qty - 1)}
                        className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-[#4a5240]/50 hover:text-[#4a5240] transition-all"
                        style={{ fontSize: '1.1rem', lineHeight: 1 }}
                      >
                        −
                      </button>
                      <div className="text-center" style={{ minWidth: 50 }}>
                        <input
                          type="number"
                          value={s.qty}
                          onChange={e => setQty(item.key, parseInt(e.target.value) || 1)}
                          min={1}
                          className="w-12 text-center border border-stone-200 rounded-lg py-1.5 focus:outline-none focus:border-[#4a5240]/50"
                          style={{ fontWeight: 700, fontSize: '1rem', color: '#4a5240' }}
                        />
                        <p style={{ fontWeight: 300, fontSize: '0.58rem' }} className="text-stone-400 mt-0.5">
                          {item.qtyLabel}
                        </p>
                      </div>
                      <button
                        onClick={() => setQty(item.key, s.qty + 1)}
                        className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-[#4a5240]/50 hover:text-[#4a5240] transition-all"
                        style={{ fontSize: '1.1rem', lineHeight: 1 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Récap sélection */}
        {anySelected && (
          <div className="mt-4 bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-50">
              <p style={{ fontWeight: 600, fontSize: '0.82rem' }} className="text-[#2d3228]">Récapitulatif</p>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2">
              {items.filter(i => state[i.key].enabled).map(i => (
                <div key={i.key} className="flex items-center justify-between">
                  <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-600">
                    {i.icon} {i.title}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.82rem' }} className="text-[#4a5240]">
                    {state[i.key].qty} {i.qtyLabel}
                  </span>
                </div>
              ))}
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
              onClick={async () => {
                if (!anySelected || saving) return
                setSaving(true)
                await onSave(state, 100)
                router.push(`/mariage/${slug}/studio`)
              }}
              disabled={!anySelected || saving}
              style={{ fontWeight: 400, fontSize: '0.8rem', letterSpacing: '0.03em' }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all
                ${anySelected && !saving ? 'bg-[#4a5240] text-white hover:bg-[#2d3228]' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}>
              {saving ? 'Sauvegarde…' : 'Valider →'}
            </button>
          </div>
        </div>
        <div className="h-safe-bottom" />
      </div>
    </div>
  )
}
