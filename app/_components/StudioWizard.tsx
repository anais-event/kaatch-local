'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import StudioEditor, { defaultElements, type TextEl, type EditorColors } from './StudioEditor'

// ── Types ────────────────────────────────────────────────────────────────────

type Palette = { name: string; hex: string }
type Ambiance = { id: string; name: string; tag: string; palette: Palette[]; dark: boolean }
type TypoStyle = { id: string; label: string; displayFamily: string; bodyFamily: string; displayWeight: number; displayItalic: boolean; spacing: string }
type Product = { id: string; icon: string; name: string; desc: string; format: string; basePrice: number; packOf?: number; perPerson: boolean }
type WeddingInfo = { name1: string; name2: string; date: string; lieu: string; guestCount: number; events: string[] }

export type StudioWizardProps = {
  mode: 'public' | 'wedding'
  initialInfo?: Partial<WeddingInfo>
  initialGuests?: string[]
  initialTables?: string[]
  slug?: string
}

// ── Data ─────────────────────────────────────────────────────────────────────

const AMBIANCES: Ambiance[] = [
  { id: 'campagne',  name: 'Maison de campagne',   tag: 'Nature & Poésie',   dark: false, palette: [{ name: 'Fond', hex: '#f7f2ea' }, { name: 'Doux', hex: '#c4a882' }, { name: 'Accent', hex: '#7a8c6e' }, { name: 'Texte', hex: '#5c4a3a' }] },
  { id: 'classique', name: 'Classique intemporel',  tag: 'Raffiné & Épuré',   dark: false, palette: [{ name: 'Fond', hex: '#f8f6f1' }, { name: 'Doux', hex: '#e8e4d8' }, { name: 'Accent', hex: '#c9a96e' }, { name: 'Texte', hex: '#2c2c2c' }] },
  { id: 'boheme',    name: 'Bohème chaleureux',     tag: 'Ocre & Liberté',    dark: false, palette: [{ name: 'Fond', hex: '#fdf6ed' }, { name: 'Doux', hex: '#d4c5a9' }, { name: 'Accent', hex: '#c4622d' }, { name: 'Texte', hex: '#3d2b1f' }] },
  { id: 'romance',   name: 'Modern Romance',        tag: 'Doux & Graphique',  dark: false, palette: [{ name: 'Fond', hex: '#fdf4f0' }, { name: 'Doux', hex: '#e8c4c4' }, { name: 'Accent', hex: '#b87333' }, { name: 'Texte', hex: '#3a2020' }] },
  { id: 'artdeco',   name: 'Art Déco prestige',     tag: 'Glamour & Luxe',    dark: true,  palette: [{ name: 'Fond', hex: '#1a1814' }, { name: 'Doux', hex: '#2c2820' }, { name: 'Accent', hex: '#c8a84b' }, { name: 'Texte', hex: '#e8d9b8' }] },
]

const TYPO_STYLES: TypoStyle[] = [
  { id: 'serif',     label: 'Élégant serif',          displayFamily: 'var(--font-cormorant)', bodyFamily: 'var(--font-lato)', displayWeight: 700, displayItalic: false, spacing: '-0.01em' },
  { id: 'editorial', label: 'Éditorial compact',      displayFamily: 'var(--font-cormorant)', bodyFamily: 'var(--font-lato)', displayWeight: 600, displayItalic: false, spacing: '0.03em'  },
  { id: 'minimal',   label: 'Minimaliste sans-serif',  displayFamily: 'var(--font-lato)',      bodyFamily: 'var(--font-lato)', displayWeight: 300, displayItalic: false, spacing: '0.12em'  },
]

const PRODUCTS: Product[] = [
  { id: 'save_the_date', icon: '📅', name: 'Save the date',   desc: '1 par famille — annoncez la date',         format: 'A5 · 350g/m² · Recto',       basePrice: 2.50, perPerson: false },
  { id: 'faire_part',    icon: '💌', name: 'Faire-part',      desc: '1 par famille — invitation personnalisée', format: 'A5 · 350g/m² · Recto-verso', basePrice: 3.50, perPerson: false },
  { id: 'menu',          icon: '🍽️', name: 'Menu',            desc: '1 par personne',                           format: 'A5 · 300g/m² · Recto',       basePrice: 2.80, perPerson: true  },
  { id: 'marque_place',  icon: '🏷️', name: 'Marque-place',    desc: '1 par personne — nom + table',             format: 'Chevalet A6 · 350g/m²',      basePrice: 1.80, perPerson: true, packOf: 10 },
  { id: 'numero_table',  icon: '🔢', name: 'Numéro de table', desc: '1 par table',                              format: 'Chevalet A5 · 350g/m²',      basePrice: 4.50, perPerson: false, packOf: 10 },
  { id: 'plan_table',    icon: '🗺️', name: 'Plan de table',   desc: 'Affiche grand format',                     format: 'Affiche A2 · 200g/m²',       basePrice: 18,   perPerson: false },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseNames(raw: string): string[] {
  return raw.split(/[\n;]/).map(s => s.trim()).filter(s => s.length > 1)
}

// ── Main Wizard ──────────────────────────────────────────────────────────────
// Steps: 0=Info, 1=Design (editor + ambiance + typo), 2=Collection, 3=Invités, 4=Commande

export default function StudioWizard({ mode, initialInfo, initialGuests, initialTables, slug }: StudioWizardProps) {

  const [step, setStep] = useState(mode === 'wedding' && initialInfo?.name1 ? 1 : 0)
  const [info, setInfo] = useState<WeddingInfo>({
    name1: '', name2: '', date: '', lieu: '', guestCount: 0,
    events: ["Cérémonie", "Vin d'honneur", "Dîner", "Soirée"],
    ...initialInfo,
  })
  const [ambianceId, setAmbianceId] = useState('classique')
  const [customColors, setCustomColors] = useState<Record<string, string>>({})
  const [typoIdx, setTypoIdx] = useState(0)
  const [designElements, setDesignElements] = useState<TextEl[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [guestRaw, setGuestRaw] = useState((initialGuests ?? []).join('\n'))
  const [guestList, setGuestList] = useState<string[]>(initialGuests ?? [])
  const [tables, setTables] = useState<string[]>(initialTables ?? ['Table des mariés', 'Table famille', 'Table amis'])
  const [coupleMessage, setCoupleMessage] = useState('')
  const [dressCode, setDressCode] = useState('')
  const [menuVege, setMenuVege] = useState(false)
  const [loading, setLoading] = useState(false)
  const [livePrices, setLivePrices] = useState<Record<string, number | null>>({})
  const [mobilePreview, setMobilePreview] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  // ── Fetch live prices ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/studio/prices?qty=50')
      .then(r => r.json())
      .then(data => {
        const prices: Record<string, number | null> = {}
        for (const [id, v] of Object.entries(data.products ?? {})) {
          prices[id] = (v as { unitPrice: number | null }).unitPrice
        }
        setLivePrices(prices)
      })
      .catch(() => {})
  }, [])

  // ── Generate default design when entering step 1 ─────────────────────────────
  useEffect(() => {
    if (step === 1 && designElements.length === 0 && infoComplete) {
      setDesignElements(defaultElements('faire_part', info, colors, typo.displayFamily, typo.displayWeight))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // ── Derived ──────────────────────────────────────────────────────────────────
  const ambiance = AMBIANCES.find(a => a.id === ambianceId) ?? AMBIANCES[1]
  const typo = TYPO_STYLES[typoIdx] ?? TYPO_STYLES[0]
  const colors = {
    fond:   customColors[ambiance.palette[0].name] ?? ambiance.palette[0].hex,
    doux:   customColors[ambiance.palette[1].name] ?? ambiance.palette[1].hex,
    accent: customColors[ambiance.palette[2].name] ?? ambiance.palette[2].hex,
    texte:  customColors[ambiance.palette[3].name] ?? ambiance.palette[3].hex,
  }
  const selectedProducts = PRODUCTS.filter(p => (quantities[p.id] ?? 0) > 0)
  const priceOf = (p: Product) => livePrices[p.id] ?? p.basePrice
  const total = PRODUCTS.reduce((sum, p) => sum + (quantities[p.id] ?? 0) * priceOf(p), 0)
  const infoComplete = !!(info.name1 && info.name2 && info.date)

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function setQty(id: string, delta: number) {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }))
  }

  function handleGuestRaw(raw: string) {
    setGuestRaw(raw)
    setGuestList(parseNames(raw))
  }

  const handleCsv = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const t = ev.target?.result as string
      const n = parseNames(t)
      setGuestList(n)
      setGuestRaw(n.join('\n'))
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  async function handleCheckout() {
    if (selectedProducts.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/studio/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambianceId,
          quantities,
          weddingInfo: info,
          personalization: { guestList, tables, coupleMessage, dressCode, menuVege },
          customColors,
          typoStyleId: typo.id,
          designElements,
        }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch { /* */ }
    setLoading(false)
  }

  // ── Steps ────────────────────────────────────────────────────────────────────
  const STEPS = ['Info', 'Design', 'Produits', 'Invités', 'Commande']
  function canGoTo(s: number) {
    if (s === 0) return true
    if (s === 1) return infoComplete
    if (s === 2) return infoComplete
    if (s === 3) return infoComplete && selectedProducts.length > 0
    if (s === 4) return infoComplete && selectedProducts.length > 0
    return false
  }

  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <>
      {/* Fullscreen preview */}
      {fullscreen && designElements.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center cursor-zoom-out" style={{ background: colors.fond }} onClick={() => setFullscreen(false)}>
          <button className="absolute top-6 right-6 text-sm px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: colors.texte, fontFamily: 'var(--font-lato)', fontWeight: 300 }} onClick={() => setFullscreen(false)}>Fermer</button>
          <StudioEditor productId="faire_part" colors={colors as EditorColors} elements={designElements} onChange={setDesignElements} />
        </div>
      )}

      <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'var(--font-lato)' }}>

        {/* ── LEFT PANEL ── */}
        <div ref={containerRef} className="w-full md:w-[55%] h-screen overflow-y-auto">

          {/* Nav bar */}
          <div className="sticky top-0 z-20" style={{ background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between px-6 py-3">
              <a href={mode === 'wedding' && slug ? `/mariage/${slug}` : '/'} className="no-underline" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 800, fontSize: '1.1rem', color: '#2d3228', letterSpacing: '-0.02em' }}>Kaatch</a>
              <span style={{ fontWeight: 300, fontSize: '0.75rem', color: '#a8a29e' }}>Studio Créatif</span>
            </div>
            <div className="flex gap-1 px-6 pb-3 overflow-x-auto">
              {STEPS.map((label, i) => (
                <button key={i} onClick={() => canGoTo(i) && setStep(i)} disabled={!canGoTo(i)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap" style={{ background: step === i ? '#4a5240' : 'transparent', color: step === i ? '#fff' : canGoTo(i) ? '#78716c' : '#d6d3d1', borderColor: step === i ? '#4a5240' : canGoTo(i) ? '#e7e5e4' : '#f5f5f4', fontWeight: step === i ? 500 : 300, fontSize: '0.72rem', cursor: canGoTo(i) ? 'pointer' : 'not-allowed' }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]" style={{ background: step === i ? 'rgba(255,255,255,0.2)' : canGoTo(i) ? '#f5f0e8' : '#fafaf9', color: step === i ? '#fff' : '#a8a29e', fontWeight: 600 }}>{i}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile preview toggle */}
          {step >= 1 && (
            <div className="md:hidden">
              <button onClick={() => setMobilePreview(v => !v)} className="w-full flex items-center justify-between px-6 py-3 border-b border-stone-100" style={{ background: `${colors.fond}60` }}>
                <span style={{ fontWeight: 300, fontSize: '0.75rem', color: colors.texte, opacity: 0.7 }}>{mobilePreview ? 'Masquer' : 'Voir'} {"l'aperçu"}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={colors.texte} strokeWidth="1.5" style={{ transform: mobilePreview ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5 }}>
                  <polyline points="2 4 6 8 10 4" />
                </svg>
              </button>
              {mobilePreview && designElements.length > 0 && (
                <div className="py-6 px-4" style={{ background: colors.fond }}>
                  <StudioEditor productId="faire_part" colors={colors as EditorColors} elements={designElements} onChange={setDesignElements} />
                </div>
              )}
            </div>
          )}

          {/* ── STEP 0: Info ── */}
          {step === 0 && (
            <div className="p-8 sm:p-12 max-w-lg">
              <h2 className="mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1.8rem', color: '#2d3228', lineHeight: 1.1 }}>Parlez-nous de vous</h2>
              <p className="mb-8" style={{ fontWeight: 300, fontSize: '0.88rem', color: '#78716c', lineHeight: 1.7 }}>Ces infos apparaîtront sur votre papeterie.</p>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Prénom 1" value={info.name1} onChange={v => setInfo(p => ({ ...p, name1: v }))} placeholder="Sophie" />
                  <Input label="Prénom 2" value={info.name2} onChange={v => setInfo(p => ({ ...p, name2: v }))} placeholder="Thomas" />
                </div>
                <Input label="Date du mariage" type="date" value={info.date} onChange={v => setInfo(p => ({ ...p, date: v }))} />
                <Input label="Lieu (optionnel)" value={info.lieu} onChange={v => setInfo(p => ({ ...p, lieu: v }))} placeholder="Château de Vallery, Bourgogne" />
                <Input label="Nombre d'invités estimé" type="number" value={info.guestCount ? String(info.guestCount) : ''} onChange={v => setInfo(p => ({ ...p, guestCount: parseInt(v) || 0 }))} placeholder="80" />
                <div>
                  <label className="block mb-2" style={{ fontWeight: 500, fontSize: '0.68rem', color: '#a8a29e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Moments de la journée</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {info.events.map((ev, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f4ee] border border-[#c8d4c0]" style={{ fontSize: '0.78rem', fontWeight: 400, color: '#4a5240' }}>
                        {ev}
                        <button onClick={() => setInfo(p => ({ ...p, events: p.events.filter((_, j) => j !== i) }))} className="text-[#a8a29e] hover:text-red-400 ml-0.5" style={{ fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input id="newEvent" placeholder="Brunch, Cocktail..." className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white focus:border-[#4a5240] outline-none transition-colors" style={{ fontWeight: 300, fontSize: '0.82rem', color: '#2d3228' }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const input = e.currentTarget; const v = input.value.trim(); if (v) { setInfo(p => ({ ...p, events: [...p.events, v] })); input.value = '' } } }} />
                    <button type="button" onClick={() => { const input = document.getElementById('newEvent') as HTMLInputElement; const v = input?.value.trim(); if (v) { setInfo(p => ({ ...p, events: [...p.events, v] })); input.value = '' } }} className="px-3 py-2 rounded-lg border border-[#c8d4c0] bg-[#f0f4ee]" style={{ fontWeight: 500, fontSize: '0.75rem', color: '#4a5240' }}>+</button>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(1)} disabled={!infoComplete} className="mt-8 px-7 py-3 rounded-xl transition-all" style={{ background: infoComplete ? '#2d3228' : '#e7e3dc', color: infoComplete ? '#fff' : '#b8b0a8', fontWeight: 500, fontSize: '0.88rem', cursor: infoComplete ? 'pointer' : 'not-allowed' }}>
                Créer mon design →
              </button>
            </div>
          )}

          {/* ── STEP 1: Design (ambiance + typo + palette) ── */}
          {step === 1 && (
            <div className="p-8 sm:p-12 max-w-xl">
              <h2 className="mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1.8rem', color: '#2d3228', lineHeight: 1.1 }}>Votre design</h2>
              <p className="mb-6" style={{ fontWeight: 300, fontSize: '0.88rem', color: '#78716c', lineHeight: 1.7 }}>Choisissez l&apos;ambiance et la typographie. Éditez les textes sur l&apos;aperçu à droite.</p>

              {/* Ambiance */}
              <p className="mb-3" style={{ fontWeight: 500, fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ambiance</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                {AMBIANCES.map(a => (
                  <button key={a.id} onClick={() => { setAmbianceId(a.id); setCustomColors({}) }} className="text-left p-3.5 rounded-xl border transition-all" style={{ background: ambianceId === a.id ? a.palette[0].hex : '#fff', border: `1.5px solid ${ambianceId === a.id ? a.palette[2].hex : '#e7e5e4'}` }}>
                    <div className="flex gap-1 mb-2.5 rounded overflow-hidden" style={{ height: 24 }}>
                      {a.palette.map(c => <div key={c.name} className="flex-1" style={{ background: c.hex }} />)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#2d3228' }}>{a.name}</p>
                        <p style={{ fontWeight: 300, fontSize: '0.68rem', color: '#78716c' }}>{a.tag}</p>
                      </div>
                      {ambianceId === a.id && <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: a.palette[2].hex }}><svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                    </div>
                  </button>
                ))}
              </div>

              {/* Palette editor */}
              <p className="mb-3" style={{ fontWeight: 500, fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Couleurs personnalisées</p>
              <div className="flex flex-col gap-2 mb-6 p-3 rounded-xl border border-stone-100 bg-white">
                {ambiance.palette.map(c => {
                  const current = customColors[c.name] ?? c.hex
                  return (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-stone-100 overflow-hidden relative flex-shrink-0">
                        <div className="w-full h-full" style={{ background: current }} />
                        <input type="color" value={current} onChange={e => setCustomColors(p => ({ ...p, [c.name]: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      </div>
                      <div className="flex-1">
                        <p style={{ fontWeight: 400, fontSize: '0.78rem', color: '#44403c' }}>{c.name}</p>
                        <p style={{ fontWeight: 300, fontSize: '0.62rem', color: '#a8a29e' }}>{current}</p>
                      </div>
                      {customColors[c.name] && <button onClick={() => setCustomColors(p => { const n = { ...p }; delete n[c.name]; return n })} style={{ fontWeight: 300, fontSize: '0.62rem', color: '#a8a29e' }}>Reset</button>}
                    </div>
                  )
                })}
              </div>

              {/* Typo */}
              <p className="mb-3" style={{ fontWeight: 500, fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Typographie</p>
              <div className="flex flex-col gap-2 mb-6">
                {TYPO_STYLES.map((t, i) => (
                  <button key={t.id} onClick={() => setTypoIdx(i)} className="text-left p-3.5 rounded-xl border transition-all" style={{ borderColor: typoIdx === i ? '#4a5240' : '#e7e5e4', background: typoIdx === i ? '#f5f7f4' : '#fff' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontWeight: 500, fontSize: '0.8rem', color: '#2d3228' }}>{t.label}</span>
                      {typoIdx === i && <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="#4a5240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <p style={{ fontFamily: t.displayFamily, fontWeight: t.displayWeight, letterSpacing: t.spacing, fontSize: '1rem', color: '#44403c' }}>
                      {info.name1 || 'Sophie'} & {info.name2 || 'Thomas'}
                    </p>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(2)} className="px-7 py-3 rounded-xl" style={{ background: '#2d3228', color: '#fff', fontWeight: 500, fontSize: '0.88rem' }}>
                Choisir mes produits →
              </button>
            </div>
          )}

          {/* ── STEP 2: Collection ── */}
          {step === 2 && (
            <div className="p-8 sm:p-12 max-w-xl">
              <h2 className="mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1.8rem', color: '#2d3228', lineHeight: 1.1 }}>Votre collection</h2>
              <p className="mb-2" style={{ fontWeight: 300, fontSize: '0.88rem', color: '#78716c', lineHeight: 1.7 }}>Votre design s&apos;adapte automatiquement à chaque format.</p>
              <p className="mb-6 px-3 py-2 rounded-lg bg-[#f0f4ee]" style={{ fontWeight: 300, fontSize: '0.75rem', color: '#4a5240' }}>
                💡 Les prix sont calculés en temps réel depuis Gelato.
              </p>

              <div className="flex flex-col gap-2.5">
                {PRODUCTS.map(p => {
                  const qty = quantities[p.id] ?? 0
                  const active = qty > 0
                  const price = priceOf(p)
                  return (
                    <div key={p.id}
                      onMouseEnter={() => setHoveredProduct(p.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                      className="rounded-xl border transition-all"
                      style={{ borderColor: active ? colors.accent : hoveredProduct === p.id ? '#d0ccc4' : '#e7e5e4', background: active ? `${colors.fond}40` : '#fff', padding: '14px 16px' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{p.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '0.92rem', color: '#2d3228' }}>{p.name}</p>
                            {p.packOf && <span className="px-1.5 py-0.5 rounded text-stone-400 bg-stone-50 border border-stone-100" style={{ fontSize: '0.55rem', fontWeight: 300 }}>lot de {p.packOf}</span>}
                          </div>
                          <p style={{ fontWeight: 300, fontSize: '0.7rem', color: '#a8a29e', marginTop: 1 }}>{p.desc}</p>
                          <p style={{ fontWeight: 300, fontSize: '0.62rem', color: '#c8c2ba', marginTop: 2 }}>{p.format}</p>
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '0.85rem', color: active ? colors.accent : '#c8c2ba', minWidth: 55, textAlign: 'right' }}>
                            {qty > 0 ? `${(qty * price).toFixed(2)} €` : `${price.toFixed(2)} €/u`}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setQty(p.id, -1)} disabled={qty === 0} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all" style={{ borderColor: '#e7e5e4', opacity: qty > 0 ? 1 : 0.3, color: '#2d3228', fontSize: '1rem' }}>−</button>
                            <span className="w-6 text-center" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3228' }}>{qty}</span>
                            <button onClick={() => setQty(p.id, 1)} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all" style={{ borderColor: '#e7e5e4', color: '#2d3228', fontSize: '1rem' }}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {total > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-white border border-stone-100">
                  <div className="flex justify-between items-baseline">
                    <p style={{ fontWeight: 300, fontSize: '0.82rem', color: '#78716c' }}>Sous-total</p>
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1.2rem', color: '#2d3228' }}>{total.toFixed(2)} €</p>
                  </div>
                  <p style={{ fontWeight: 300, fontSize: '0.65rem', color: '#b8b0a8', marginTop: 4 }}>+ livraison calculée au paiement · Impression 3–5 jours</p>
                </div>
              )}

              <button onClick={() => setStep(3)} disabled={selectedProducts.length === 0} className="mt-6 px-7 py-3 rounded-xl transition-all" style={{ background: selectedProducts.length > 0 ? '#2d3228' : '#e7e3dc', color: selectedProducts.length > 0 ? '#fff' : '#b8b0a8', fontWeight: 500, fontSize: '0.88rem', cursor: selectedProducts.length > 0 ? 'pointer' : 'not-allowed' }}>
                Vos invités →
              </button>
            </div>
          )}

          {/* ── STEP 3: Invités & options ── */}
          {step === 3 && (
            <div className="p-8 sm:p-12 max-w-xl">
              <h2 className="mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1.8rem', color: '#2d3228', lineHeight: 1.1 }}>Invités & options</h2>
              <p className="mb-6" style={{ fontWeight: 300, fontSize: '0.88rem', color: '#78716c', lineHeight: 1.7 }}>Utilisés pour personnaliser menus, marque-places et plan de table.</p>

              <Section title="Liste des invités" icon="👥">
                <p className="mb-3" style={{ fontWeight: 300, fontSize: '0.72rem', color: '#78716c', lineHeight: 1.6 }}>Un nom par ligne.</p>
                <textarea value={guestRaw} onChange={e => handleGuestRaw(e.target.value)} placeholder={"Sophie Martin\nThomas Dupont\nMarie & Jean Leroy"} rows={6} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:border-[#4a5240] outline-none transition-colors resize-y" style={{ fontWeight: 300, fontSize: '0.85rem', color: '#2d3228', lineHeight: 1.7 }} />
                <div className="flex items-center justify-between mt-2.5">
                  <p style={{ fontWeight: 300, fontSize: '0.7rem', color: guestList.length > 0 ? '#4a5240' : '#b8b0a8' }}>
                    {guestList.length > 0 ? `${guestList.length} invité${guestList.length > 1 ? 's' : ''}` : 'Aucun invité'}
                  </p>
                  <label className="px-3 py-1.5 rounded-lg border border-[#c8d4c0] bg-[#f0f4ee] cursor-pointer" style={{ fontWeight: 500, fontSize: '0.7rem', color: '#4a5240' }}>
                    Importer CSV
                    <input type="file" accept=".csv,.txt" onChange={handleCsv} className="hidden" />
                  </label>
                </div>
                {guestList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {guestList.slice(0, 8).map((name, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-[#e8f0e5]" style={{ fontWeight: 300, fontSize: '0.68rem', color: '#4a5240' }}>{name}</span>
                    ))}
                    {guestList.length > 8 && <span style={{ fontWeight: 300, fontSize: '0.68rem', color: '#a8a29e', padding: '4px 6px' }}>+{guestList.length - 8}</span>}
                  </div>
                )}
              </Section>

              {selectedProducts.some(p => p.id === 'plan_table' || p.id === 'numero_table') && (
                <Section title="Noms des tables" icon="🗂️">
                  <div className="flex flex-col gap-2">
                    {tables.map((t, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span style={{ fontWeight: 300, fontSize: '0.68rem', color: '#a8a29e', minWidth: 18, textAlign: 'right' }}>{i + 1}</span>
                        <input value={t} onChange={e => setTables(prev => prev.map((x, j) => j === i ? e.target.value : x))} placeholder={`Table ${i + 1}`} className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white focus:border-[#4a5240] outline-none transition-colors" style={{ fontWeight: 300, fontSize: '0.85rem', color: '#2d3228' }} />
                        {tables.length > 1 && <button onClick={() => setTables(prev => prev.filter((_, j) => j !== i))} className="w-7 h-7 rounded-lg border border-red-100 bg-red-50 text-red-300 flex items-center justify-center">×</button>}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setTables(prev => [...prev, `Table ${prev.length + 1}`])} className="w-full mt-2.5 py-2 rounded-lg border border-dashed border-[#c8d4c0] text-[#4a5240]" style={{ fontWeight: 400, fontSize: '0.75rem' }}>+ Ajouter une table</button>
                </Section>
              )}

              <Section title="Message des mariés" icon="💬" optional>
                <textarea value={coupleMessage} onChange={e => setCoupleMessage(e.target.value)} placeholder="Nous avons la joie de vous convier..." rows={3} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:border-[#4a5240] outline-none transition-colors resize-y" style={{ fontWeight: 300, fontSize: '0.85rem', color: '#2d3228', lineHeight: 1.7 }} />
              </Section>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-xl border border-stone-100 bg-white">
                  <p className="mb-2" style={{ fontWeight: 500, fontSize: '0.72rem', color: '#4a5240' }}>👗 Dress code</p>
                  <input value={dressCode} onChange={e => setDressCode(e.target.value)} placeholder="Chic décontracté..." className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-[#4a5240] outline-none transition-colors" style={{ fontWeight: 300, fontSize: '0.82rem', color: '#2d3228' }} />
                </div>
                <div className="p-4 rounded-xl border border-stone-100 bg-white">
                  <p className="mb-2" style={{ fontWeight: 500, fontSize: '0.72rem', color: '#4a5240' }}>🌿 Menu végé</p>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div onClick={() => setMenuVege(v => !v)} className="relative flex-shrink-0" style={{ width: 38, height: 20, borderRadius: 10, background: menuVege ? '#4a5240' : '#e7e3dc', transition: 'background 0.2s', cursor: 'pointer' }}>
                      <div style={{ position: 'absolute', width: 14, height: 14, borderRadius: 7, background: '#fff', top: 3, left: menuVege ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                    <span style={{ fontWeight: 300, fontSize: '0.75rem', color: '#78716c' }}>Proposer</span>
                  </label>
                </div>
              </div>

              <button onClick={() => setStep(4)} className="px-7 py-3 rounded-xl" style={{ background: '#2d3228', color: '#fff', fontWeight: 500, fontSize: '0.88rem' }}>
                Voir le récapitulatif →
              </button>
            </div>
          )}

          {/* ── STEP 4: Récap + Checkout ── */}
          {step === 4 && (
            <div className="p-8 sm:p-12 max-w-xl">
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1.8rem', color: '#2d3228', lineHeight: 1.1 }}>Récapitulatif</h2>

              <div className="rounded-xl border border-stone-200 overflow-hidden mb-5">
                <div className="flex justify-between items-center px-5 py-3 bg-stone-50/50 border-b border-stone-100">
                  <span style={{ fontWeight: 300, fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mariage</span>
                  <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '0.92rem', color: '#2d3228' }}>{info.name1} & {info.name2}</span>
                </div>
                <div className="flex justify-between items-center px-5 py-3 bg-stone-50/50 border-b border-stone-100">
                  <span style={{ fontWeight: 300, fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Design</span>
                  <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '0.92rem', color: '#2d3228' }}>{ambiance.name} · {typo.label}</span>
                </div>
                {guestList.length > 0 && (
                  <div className="flex justify-between items-center px-5 py-3 bg-stone-50/50 border-b border-stone-100">
                    <span style={{ fontWeight: 300, fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Invités</span>
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '0.92rem', color: '#2d3228' }}>{guestList.length} noms</span>
                  </div>
                )}
                {selectedProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < selectedProducts.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                    <div className="w-8 h-11 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: colors.fond, border: `1px solid ${colors.accent}30` }}>
                      <span style={{ fontSize: '0.8rem' }}>{p.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p style={{ fontWeight: 500, fontSize: '0.82rem', color: '#2d3228' }}>{p.name}</p>
                        <button onClick={() => setStep(2)} className="text-[#a8a29e] hover:text-[#4a5240] transition-colors" style={{ fontSize: '0.6rem', fontWeight: 300 }}>Modifier</button>
                      </div>
                      <p style={{ fontWeight: 300, fontSize: '0.65rem', color: '#a8a29e', marginTop: 1 }}>× {quantities[p.id]} · {p.format}</p>
                    </div>
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '0.92rem', color: '#2d3228', flexShrink: 0 }}>{((quantities[p.id] ?? 0) * priceOf(p)).toFixed(2)} €</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline mb-2">
                <p style={{ fontWeight: 300, fontSize: '0.88rem', color: '#78716c' }}>Sous-total impression</p>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 800, fontSize: '1.3rem', color: '#2d3228' }}>{total.toFixed(2)} €</p>
              </div>
              <p className="mb-6" style={{ fontWeight: 300, fontSize: '0.7rem', color: '#b8b0a8', lineHeight: 1.6 }}>+ frais de livraison calculés au paiement · Impression 3–5 jours · Livraison 2–3 jours</p>

              <button onClick={handleCheckout} disabled={loading} className="w-full py-4 rounded-xl transition-all" style={{ background: '#2d3228', color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.65 : 1 }}>
                {loading ? 'Redirection vers le paiement…' : `Commander — ${total.toFixed(2)} €`}
              </button>
              <p className="text-center mt-3" style={{ fontWeight: 300, fontSize: '0.68rem', color: '#b8b0a8', lineHeight: 1.5 }}>Paiement sécurisé par Stripe · Aucun compte requis · Facture envoyée par email</p>
            </div>
          )}

        </div>

        {/* ── RIGHT PANEL: Editor ── */}
        <div className="hidden md:flex w-[45%] h-screen flex-col relative" style={{ background: colors.fond, transition: 'background 0.5s ease' }}>

          {/* Step dots */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => canGoTo(i) && setStep(i)} className="transition-all" style={{ width: 4, height: step === i ? 20 : 4, borderRadius: 3, background: step === i ? colors.accent : colors.texte, opacity: step === i ? 0.9 : 0.15, border: 'none', cursor: canGoTo(i) ? 'pointer' : 'default', padding: 0 }} />
            ))}
          </div>

          {step === 0 ? (
            /* Step 0: static preview placeholder */
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="rounded-xl" style={{ width: 240, height: 338, background: colors.fond, border: `1px solid ${colors.accent}20`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 1.5, background: colors.accent }} />
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1.4rem', color: colors.texte, textAlign: 'center', lineHeight: 1.2, padding: '0 24px' }}>
                  {info.name1 || 'Prénom'}<br />& {info.name2 || 'Prénom'}
                </p>
                <div style={{ width: 32, height: 1.5, background: colors.accent }} />
              </div>
              <p style={{ fontWeight: 300, fontSize: '0.62rem', color: colors.texte, opacity: 0.4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Aperçu</p>
            </div>
          ) : (
            /* Steps 1-4: live interactive editor */
            <div className="flex-1 overflow-hidden">
              {designElements.length > 0 ? (
                <StudioEditor
                  productId="faire_part"
                  colors={colors as EditorColors}
                  elements={designElements}
                  onChange={setDesignElements}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center h-full">
                  <p style={{ fontWeight: 300, fontSize: '0.75rem', color: colors.texte, opacity: 0.4 }}>Chargement...</p>
                </div>
              )}
            </div>
          )}

          {/* Fullscreen button */}
          {designElements.length > 0 && (
            <button onClick={() => setFullscreen(true)} className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg z-10" style={{ background: `${colors.texte}12`, color: colors.texte, fontWeight: 300, fontSize: '0.62rem' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              Agrandir
            </button>
          )}
        </div>

      </div>
    </>
  )
}

// ── Reusable pieces ──────────────────────────────────────────────────────────

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontWeight: 500, fontSize: '0.68rem', color: '#a8a29e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="px-4 py-3 rounded-xl border border-stone-200 bg-white focus:border-[#4a5240] outline-none transition-colors w-full" style={{ fontWeight: 300, fontSize: '0.92rem', color: '#2d3228' }} />
    </div>
  )
}

function Section({ title, icon, optional, children }: { title: string; icon: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-6 p-5 rounded-xl border border-stone-100 bg-white">
      <p className="mb-3 flex items-center gap-2" style={{ fontWeight: 600, fontSize: '0.8rem', color: '#4a5240' }}>
        <span>{icon}</span>{title}{optional && <span style={{ fontWeight: 300, fontSize: '0.68rem', color: '#b8b0a8' }}>(optionnel)</span>}
      </p>
      {children}
    </div>
  )
}
