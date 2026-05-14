'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type ProgrammeStep = { id: string; title: string; time: string | null; description: string | null }
type Table = { id: string; name: string; capacity: number; guests: string[] }

type ReceptionState = {
  programme: { enabled: boolean; qty: number }
  planTable: { enabled: boolean }
  numerosTable: { enabled: boolean }
}

export default function ReceptionClient({
  slug, weddingName, weddingDate, weddingLocation,
  programmeSteps, tables,
}: {
  slug: string
  weddingName: string
  weddingDate: string | null
  weddingLocation: string | null
  programmeSteps: ProgrammeStep[]
  tables: Table[]
}) {
  const router = useRouter()
  const storageKey = `studio_recep_${slug}`

  const totalGuests = tables.reduce((acc, t) => acc + t.guests.length, 0)

  const [state, setState] = useState<ReceptionState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return {
      programme: { enabled: programmeSteps.length > 0, qty: Math.max(totalGuests, 1) },
      planTable: { enabled: tables.length > 0 },
      numerosTable: { enabled: tables.length > 0 },
    }
  })

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(storageKey, JSON.stringify(state)), 800)
    return () => clearTimeout(t)
  }, [state, storageKey])

  function toggle(key: keyof ReceptionState, field: string, val: boolean | number) {
    setState(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }))
  }

  const dateStr = weddingDate
    ? new Date(weddingDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const anySelected = state.programme.enabled || state.planTable.enabled || state.numerosTable.enabled

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
          <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase mb-1">04 · Éléments de réception</p>
          <h1 style={{ fontWeight: 600, fontSize: '1.3rem' }} className="text-[#2d3228] mb-1">Complétez votre collection</h1>
          <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500">
            Les pièces du jour J — pré-remplies depuis votre programme et plan de table.
          </p>
        </div>

        {/* ── Section A : Programme ── */}
        <Section
          enabled={state.programme.enabled}
          onToggle={v => toggle('programme', 'enabled', v)}
          icon="📋"
          title="Programme de cérémonie"
          badge={programmeSteps.length > 0 ? `${programmeSteps.length} étapes` : 'Non configuré'}
          badgeOk={programmeSteps.length > 0}
        >
          {programmeSteps.length > 0 ? (
            <div className="flex flex-col gap-2 mb-4">
              {programmeSteps.map((s, i) => (
                <div key={s.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4a5240] mt-1" />
                    {i < programmeSteps.length - 1 && <div className="w-px flex-1 bg-stone-100 mt-1" style={{ minHeight: 16 }} />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-baseline gap-2">
                      {s.time && <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400 flex-shrink-0">{s.time}</span>}
                      <span style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-700">{s.title}</span>
                    </div>
                    {s.description && <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mt-0.5 leading-snug">{s.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-amber-700">
                Aucun programme configuré.{' '}
                <a href={`/mariage/${slug}/programme`} className="underline hover:text-amber-800">
                  Créer le programme →
                </a>
              </p>
            </div>
          )}

          {state.programme.enabled && (
            <div className="flex items-center gap-3 pt-1">
              <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-500">Quantité :</span>
              <button onClick={() => toggle('programme', 'qty', Math.max(1, state.programme.qty - 1))}
                className="w-7 h-7 rounded-full border border-stone-200 text-stone-400 hover:border-[#4a5240]/50 flex items-center justify-center transition-all"
                style={{ fontSize: '1rem' }}>−</button>
              <input
                type="number"
                value={state.programme.qty}
                onChange={e => toggle('programme', 'qty', parseInt(e.target.value) || 1)}
                min={1}
                className="w-14 text-center border border-stone-200 rounded-lg py-1 focus:outline-none focus:border-[#4a5240]/50"
                style={{ fontWeight: 600, fontSize: '0.9rem', color: '#4a5240' }}
              />
              <button onClick={() => toggle('programme', 'qty', state.programme.qty + 1)}
                className="w-7 h-7 rounded-full border border-stone-200 text-stone-400 hover:border-[#4a5240]/50 flex items-center justify-center transition-all"
                style={{ fontSize: '1rem' }}>+</button>
              <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">exemplaires</span>
            </div>
          )}
        </Section>

        {/* ── Section B : Plan de table ── */}
        <Section
          enabled={state.planTable.enabled}
          onToggle={v => toggle('planTable', 'enabled', v)}
          icon="🗺️"
          title="Plan de table"
          badge={tables.length > 0 ? `${tables.length} tables · ${totalGuests} placés` : 'Non configuré'}
          badgeOk={tables.length > 0}
          fixedQty="1 affiche grand format"
        >
          {tables.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {tables.slice(0, 8).map(t => (
                <div key={t.id} className="bg-stone-50 rounded-lg p-2.5">
                  <p style={{ fontWeight: 500, fontSize: '0.75rem' }} className="text-stone-700 mb-1">{t.name}</p>
                  <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400 leading-snug">
                    {t.guests.length > 0
                      ? t.guests.slice(0, 3).join(', ') + (t.guests.length > 3 ? ` +${t.guests.length - 3}` : '')
                      : 'Aucun invité'}
                  </p>
                </div>
              ))}
              {tables.length > 8 && (
                <div className="bg-stone-50 rounded-lg p-2.5 flex items-center justify-center">
                  <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                    +{tables.length - 8} tables
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-amber-700">
                Plan de table non configuré.{' '}
                <a href={`/mariage/${slug}/tables`} className="underline hover:text-amber-800">
                  Créer le plan de table →
                </a>
              </p>
            </div>
          )}
        </Section>

        {/* ── Section C : Numéros de table ── */}
        <Section
          enabled={state.numerosTable.enabled}
          onToggle={v => toggle('numerosTable', 'enabled', v)}
          icon="🔢"
          title="Numéros de table"
          badge={tables.length > 0 ? `${tables.length} numéros` : 'Non configuré'}
          badgeOk={tables.length > 0}
          fixedQty={`${tables.length || '—'} supports`}
        >
          {tables.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tables.map(t => (
                <div key={t.id}
                  className="px-3 py-1.5 bg-stone-50 rounded-lg border border-stone-100 text-center min-w-[44px]">
                  <span style={{ fontWeight: 500, fontSize: '0.78rem' }} className="text-stone-700">{t.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 mb-3">
              Les numéros seront générés d'après votre plan de table.
            </p>
          )}
        </Section>

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
              disabled={!anySelected}
              style={{ fontWeight: 400, fontSize: '0.8rem', letterSpacing: '0.03em' }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all
                ${anySelected ? 'bg-[#4a5240] text-white hover:bg-[#2d3228]' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}>
              Finaliser ma collection →
            </button>
          </div>
        </div>
        <div className="h-safe-bottom" />
      </div>
    </div>
  )
}

// ── Composant Section réutilisable ────────────────────────────────────────────

function Section({
  enabled, onToggle, icon, title, badge, badgeOk, fixedQty, children,
}: {
  enabled: boolean
  onToggle: (v: boolean) => void
  icon: string
  title: string
  badge: string
  badgeOk: boolean
  fixedQty?: string
  children?: React.ReactNode
}) {
  return (
    <div className={`bg-white rounded-xl border transition-all duration-150 overflow-hidden
      ${enabled ? 'border-[#4a5240]/30 shadow-sm' : 'border-stone-100 opacity-70'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-stone-50">
        <button onClick={() => onToggle(!enabled)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${enabled ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300 hover:border-[#4a5240]/60 bg-white'}`}>
          {enabled && (
            <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
              <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <span className="text-lg">{icon}</span>
        <div className="flex-1">
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-[#2d3228]">{title}</span>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${badgeOk ? 'bg-[#4a5240]/10 text-[#4a5240]' : 'bg-amber-50 text-amber-600'}`}
            style={{ fontWeight: 300, fontSize: '0.65rem' }}>
            {badge}
          </span>
        </div>
        {fixedQty && enabled && (
          <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 flex-shrink-0">{fixedQty}</span>
        )}
      </div>
      {/* Corps */}
      {enabled && children && (
        <div className="p-4">{children}</div>
      )}
    </div>
  )
}
