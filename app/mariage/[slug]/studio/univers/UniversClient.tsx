'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Ambiance = {
  id: string
  emoji: string
  name: string
  tagline: string
  palette: { name: string; hex: string }[]
  accent: string
  bg: string
  tag?: string
}

const AMBIANCES: Ambiance[] = [
  {
    id: 'campagne',
    emoji: '🌾',
    name: 'Maison de campagne',
    tagline: 'Lumière naturelle, lin froissé, eucalyptus.',
    palette: [
      { name: 'Blé', hex: '#e8dcc8' },
      { name: 'Terre', hex: '#c4a882' },
      { name: 'Sauge', hex: '#7a8c6e' },
      { name: 'Humus', hex: '#5c4a3a' },
    ],
    accent: '#7a8c6e',
    bg: '#f7f2ea',
    tag: 'Nature & Poésie',
  },
  {
    id: 'editorial',
    emoji: '🏛️',
    name: 'Élégance éditoriale',
    tagline: 'Épuré, architectural, intemporel.',
    palette: [
      { name: 'Ivoire', hex: '#f8f6f1' },
      { name: 'Graphite', hex: '#2c2c2c' },
      { name: 'Cendre', hex: '#888888' },
      { name: 'Or', hex: '#c9a96e' },
    ],
    accent: '#2c2c2c',
    bg: '#f8f6f1',
    tag: 'Bestseller',
  },
  {
    id: 'italien',
    emoji: '🌅',
    name: "Dîner italien d'été",
    tagline: 'Ocre chaud, terrasse en pierre, citronniers.',
    palette: [
      { name: 'Terracotta', hex: '#c4622d' },
      { name: 'Citron', hex: '#e8c547' },
      { name: 'Méditerranée', hex: '#4a7fa5' },
      { name: 'Pierre', hex: '#d4c5a9' },
    ],
    accent: '#c4622d',
    bg: '#fdf6ed',
    tag: 'Chaleur & Joie',
  },
  {
    id: 'romance',
    emoji: '🌸',
    name: 'Modern romance',
    tagline: 'Doux mais graphique, romantique mais contemporain.',
    palette: [
      { name: 'Rose poudré', hex: '#e8c4c4' },
      { name: 'Nude', hex: '#d4a89a' },
      { name: 'Cuivre', hex: '#b87333' },
      { name: 'Crème', hex: '#f5ede8' },
    ],
    accent: '#b87333',
    bg: '#fdf4f0',
    tag: 'Romance & Style',
  },
  {
    id: 'chateau',
    emoji: '🕯️',
    name: 'Château contemporain',
    tagline: 'Luxe discret, détails précieux, élégance intemporelle.',
    palette: [
      { name: 'Navy', hex: '#1a2744' },
      { name: 'Ivoire', hex: '#f5f0e4' },
      { name: 'Or vieilli', hex: '#b5962a' },
      { name: 'Ardoise', hex: '#4a4e5a' },
    ],
    accent: '#b5962a',
    bg: '#f5f0e4',
    tag: 'Prestige',
  },
]

type UniversState = {
  ambianceId: string | null
  customColors: Record<string, string>
  typoIndex: number
}

const TYPO_OPTIONS = [
  { label: 'Classique & raffiné',    display: 'Cormorant Garamond',  body: 'Lato' },
  { label: 'Moderne & épuré',        display: 'Playfair Display',    body: 'Montserrat' },
  { label: 'Romantique & aéré',      display: 'IM Fell English',     body: 'Raleway' },
]

export default function UniversClient({
  slug, weddingName, savedData, onSave,
}: {
  slug: string; weddingName: string
  savedData: unknown; onSave: (data: unknown, progress: number) => Promise<void>
}) {
  const router = useRouter()
  const storageKey = `studio_univers_${slug}`
  const [saving, setSaving] = useState(false)

  const [state, setState] = useState<UniversState>(() => {
    if (savedData && typeof savedData === 'object') return savedData as UniversState
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return { ambianceId: null, customColors: {}, typoIndex: 0 }
  })

  const [step, setStep] = useState<'ambiance' | 'palette' | 'typo'>('ambiance')

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(storageKey, JSON.stringify(state)), 800)
    return () => clearTimeout(t)
  }, [state, storageKey])

  const selectedAmbiance = AMBIANCES.find(a => a.id === state.ambianceId)

  function selectAmbiance(id: string) {
    setState(prev => ({ ...prev, ambianceId: id, customColors: {} }))
    setStep('palette')
  }

  function setColor(name: string, hex: string) {
    setState(prev => ({ ...prev, customColors: { ...prev.customColors, [name]: hex } }))
  }

  function setTypo(index: number) {
    setState(prev => ({ ...prev, typoIndex: index }))
  }

  const isComplete = !!state.ambianceId

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
          <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase mb-1">03 · Univers visuel</p>
          <h1 style={{ fontWeight: 600, fontSize: '1.3rem' }} className="text-[#2d3228] mb-1">Choisissez votre ambiance</h1>
          <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500">
            L'esthétique qui unira toutes vos créations en une signature unique.
          </p>
        </div>

        {/* Nav étapes */}
        <div className="flex gap-2">
          {(['ambiance', 'palette', 'typo'] as const).map((s, i) => (
            <button key={s} onClick={() => state.ambianceId || s === 'ambiance' ? setStep(s) : null}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs
                ${step === s
                  ? 'bg-[#4a5240] text-white border-[#4a5240]'
                  : 'border-stone-200 text-stone-400 hover:border-stone-300'}`}
              style={{ fontWeight: step === s ? 500 : 300 }}>
              <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]" style={{ fontWeight: 600 }}>{i + 1}</span>
              {s === 'ambiance' ? 'Ambiance' : s === 'palette' ? 'Palette' : 'Typographie'}
            </button>
          ))}
        </div>

        {/* Étape 1 — Ambiances */}
        {step === 'ambiance' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AMBIANCES.map(a => {
              const selected = state.ambianceId === a.id
              return (
                <button key={a.id} onClick={() => selectAmbiance(a.id)}
                  className={`bg-white rounded-xl border text-left p-4 transition-all duration-200 hover:shadow-sm
                    ${selected ? 'border-[#4a5240] shadow-sm ring-1 ring-[#4a5240]/20' : 'border-stone-100'}`}>
                  {/* Preview couleurs */}
                  <div className="flex gap-1 mb-3">
                    {a.palette.map(c => (
                      <div key={c.name} className="flex-1 h-8 rounded-md" style={{ background: c.hex }} />
                    ))}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span>{a.emoji}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }} className="text-[#2d3228]">{a.name}</span>
                      </div>
                      <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 leading-snug">{a.tagline}</p>
                    </div>
                    {a.tag && (
                      <span style={{ fontWeight: 400, fontSize: '0.6rem', whiteSpace: 'nowrap' }}
                        className="px-2 py-0.5 bg-stone-50 text-stone-400 rounded-full border border-stone-100 flex-shrink-0">
                        {a.tag}
                      </span>
                    )}
                  </div>
                  {selected && (
                    <div className="mt-2 flex items-center gap-1 text-[#4a5240]">
                      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                        <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontWeight: 400, fontSize: '0.68rem' }}>Sélectionné</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Étape 2 — Palette */}
        {step === 'palette' && selectedAmbiance && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
              <p style={{ fontWeight: 600, fontSize: '0.85rem' }} className="text-[#2d3228] mb-1">
                {selectedAmbiance.emoji} {selectedAmbiance.name}
              </p>
              <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 mb-4">{selectedAmbiance.tagline}</p>
              <div className="flex flex-col gap-3">
                {selectedAmbiance.palette.map(c => {
                  const current = state.customColors[c.name] ?? c.hex
                  return (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-stone-100 overflow-hidden relative">
                        <div className="w-full h-full" style={{ background: current }} />
                        <input
                          type="color"
                          value={current}
                          onChange={e => setColor(c.name, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Changer la couleur"
                        />
                      </div>
                      <div className="flex-1">
                        <span style={{ fontWeight: 400, fontSize: '0.8rem' }} className="text-stone-700">{c.name}</span>
                        <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400">{current}</p>
                      </div>
                      {state.customColors[c.name] && (
                        <button onClick={() => setColor(c.name, c.hex)}
                          style={{ fontWeight: 300, fontSize: '0.65rem' }}
                          className="text-stone-300 hover:text-stone-500 transition-colors">
                          Réinitialiser
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <button onClick={() => setStep('typo')}
              className="w-full py-2.5 bg-[#4a5240] text-white rounded-xl hover:bg-[#2d3228] transition-colors"
              style={{ fontWeight: 400, fontSize: '0.82rem' }}>
              Continuer vers la typographie →
            </button>
          </div>
        )}

        {/* Étape 3 — Typographie */}
        {step === 'typo' && (
          <div className="space-y-3">
            {TYPO_OPTIONS.map((t, i) => (
              <button key={i} onClick={() => setTypo(i)}
                className={`w-full bg-white rounded-xl border text-left p-4 transition-all
                  ${state.typoIndex === i ? 'border-[#4a5240] ring-1 ring-[#4a5240]/20 shadow-sm' : 'border-stone-100 hover:border-stone-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }} className="text-[#2d3228]">{t.label}</span>
                  {state.typoIndex === i && (
                    <svg viewBox="0 0 12 12" fill="none" className="w-4 h-4 text-[#4a5240]">
                      <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {/* Preview typo */}
                <div className="border-t border-stone-50 pt-2 mt-1">
                  <p style={{ fontFamily: t.display, fontSize: '1.1rem', fontWeight: 400 }} className="text-stone-700">
                    Marguerite & Thomas
                  </p>
                  <p style={{ fontFamily: t.body, fontSize: '0.72rem', fontWeight: 300 }} className="text-stone-400">
                    Samedi 14 juin 2025 · Château de Vaux
                  </p>
                </div>
                <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 mt-1">
                  {t.display} + {t.body}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Récap si complet */}
        {isComplete && selectedAmbiance && step === 'typo' && (
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
            <p style={{ fontWeight: 600, fontSize: '0.82rem' }} className="text-[#2d3228] mb-2">Votre univers</p>
            <div className="flex gap-1 mb-2">
              {selectedAmbiance.palette.map(c => (
                <div key={c.name} className="flex-1 h-6 rounded" style={{ background: state.customColors[c.name] ?? c.hex }} />
              ))}
            </div>
            <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-500">
              {selectedAmbiance.emoji} {selectedAmbiance.name} · {TYPO_OPTIONS[state.typoIndex]?.label}
            </p>
          </div>
        )}
      </div>

      {/* Barre bas */}
      <div className="fixed bottom-0 left-0 right-0 md:left-56 z-40 bg-white/95 backdrop-blur border-t border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => step === 'ambiance' ? router.push(`/mariage/${slug}/studio`) : setStep(step === 'typo' ? 'palette' : 'ambiance')}
            style={{ fontWeight: 300, fontSize: '0.82rem' }}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors">
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {step === 'ambiance' ? 'Retour' : 'Étape précédente'}
          </button>
          <div className="flex items-center gap-3">
            <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300 hidden sm:block">Sauvegardé auto.</span>
            <button
              onClick={async () => {
                if (step !== 'typo') {
                  setStep(step === 'ambiance' ? 'palette' : 'typo')
                } else {
                  if (!isComplete || saving) return
                  setSaving(true)
                  await onSave(state, 100)
                  router.push(`/mariage/${slug}/studio`)
                }
              }}
              disabled={(!isComplete && step === 'ambiance') || saving}
              style={{ fontWeight: 400, fontSize: '0.8rem', letterSpacing: '0.03em' }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all
                ${(isComplete || step !== 'ambiance') && !saving
                  ? 'bg-[#4a5240] text-white hover:bg-[#2d3228]'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}>
              {saving ? 'Sauvegarde…' : step === 'typo' ? 'Valider mon univers →' : 'Continuer →'}
            </button>
          </div>
        </div>
        <div className="h-safe-bottom" />
      </div>
    </div>
  )
}
