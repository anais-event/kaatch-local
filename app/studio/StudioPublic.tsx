'use client'

import { useState, useRef, useEffect } from 'react'

const DISPLAY = 'var(--font-display)'
const BODY = 'var(--font-lato)'

const AMBIANCES = [
  { id: 'boheme',      name: 'Bohème',      tag: 'Nature & liberté',       bg: '#e4ddd3', cardBg: '#ede6db', text: '#5c4f3a', accent: '#a8936a', dark: false },
  { id: 'classique',   name: 'Classique',   tag: 'Élégance intemporelle',  bg: '#e5e8e2', cardBg: '#eef0eb', text: '#2d3228', accent: '#4a5240', dark: false },
  { id: 'champetre',   name: 'Champêtre',   tag: 'Douceur & fleurs',       bg: '#ece6dc', cardBg: '#f5efe5', text: '#4a3728', accent: '#8b6e5c', dark: false },
  { id: 'art-deco',    name: 'Art Déco',    tag: 'Glamour des années 20',  bg: '#1a1610', cardBg: '#252018', text: '#e8d9b8', accent: '#c8a84b', dark: true  },
  { id: 'minimaliste', name: 'Minimaliste', tag: 'Épuré & moderne',        bg: '#eeeceb', cardBg: '#fafaf9', text: '#1c1c1c', accent: '#888888', dark: false },
]

type Ambiance = typeof AMBIANCES[0]

type Product = {
  id: string; icon: string; name: string; desc: string; detail: string
  price: number; needs_perso: boolean; shape: 'portrait' | 'portrait-sm' | 'landscape' | 'poster'
}

const PRODUCTS: Product[] = [
  { id: 'save_the_date', icon: '📅', name: 'Save the date',     desc: "Annoncez la date en avance — vos invités bloqueront leur agenda.",           detail: 'Carte A6 · 350g/m² · Recto',        price: 2.50, needs_perso: true,  shape: 'portrait-sm' },
  { id: 'faire_part',    icon: '💌', name: 'Faire-part',        desc: "L’invitation officielle, personnalisée au nom de chaque invité.",         detail: 'Carte A5 · 350g/m² · Recto-verso',  price: 3.50, needs_perso: true,  shape: 'portrait'    },
  { id: 'menu',          icon: '🍽️', name: 'Menu',              desc: "Par convive — adaptable aux régimes et menus enfant.",                         detail: 'Carte A5 · 300g/m² · Recto-verso',  price: 2.80, needs_perso: true,  shape: 'portrait'    },
  { id: 'marque_place',  icon: '🪧', name: 'Marque-place',      desc: "Au nom de chaque invité, avec son numéro de table.",                           detail: 'Chevalet A6 · 350g/m²',             price: 1.80, needs_perso: true,  shape: 'landscape'   },
  { id: 'numero_table',  icon: '🔢', name: 'Numéro de table',   desc: "Un chevalet élégant par table, dans votre ambiance.",                          detail: 'Chevalet A5 · 350g/m²',             price: 4.50, needs_perso: false, shape: 'landscape'   },
  { id: 'plan_ceremonie',icon: '⛪', name: 'Plan de cérémonie', desc: "Grand format — chaque invité sait exactement où il s’asseoit.",           detail: 'Affiche A2 · 200g/m²',              price: 18,   needs_perso: false, shape: 'poster'      },
  { id: 'plan_table',    icon: '🗺️', name: 'Plan de table',     desc: "Vue générale posée à l’entrée de la salle — tout le monde trouve sa place.", detail: 'Affiche A2 · 200g/m²',            price: 18,   needs_perso: false, shape: 'poster'      },
]

// ── Mockup preview ───────────────────────────────────────────────────────────

function MockupCard({ productId, a, scale = 1 }: { productId: string | null; a: Ambiance; scale?: number }) {
  const shadow = a.dark
    ? '0 32px 80px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.5)'
    : '0 32px 80px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.07)'

  const base: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: shadow,
    transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
    transform: `scale(${scale})`,
  }

  if (!productId) {
    return (
      <div style={{ ...base, width: 260, height: 364, background: a.cardBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36, textAlign: 'center' }}>
        <div style={{ width: 40, height: 2, background: a.accent, marginBottom: 28, borderRadius: 1 }} />
        <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.7rem', color: a.text, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10 }}>
          Emma<br />&amp; Luc
        </p>
        <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.7rem', color: a.text, opacity: 0.55, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 28 }}>
          14 · 06 · 2026
        </p>
        <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.68rem', color: a.text, opacity: 0.45, letterSpacing: '0.08em' }}>
          Château de Vallery
        </p>
        <div style={{ width: 40, height: 2, background: a.accent, marginTop: 28, borderRadius: 1 }} />
      </div>
    )
  }

  const p = PRODUCTS.find(x => x.id === productId)!

  if (p.shape === 'portrait' || p.shape === 'portrait-sm') {
    const w = p.shape === 'portrait-sm' ? 210 : 252
    const h = p.shape === 'portrait-sm' ? 294 : 354

    if (productId === 'menu') {
      return (
        <div style={{ ...base, width: w, height: h, background: a.cardBg, padding: '30px 26px', display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.58rem', color: a.text, opacity: 0.45, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 4 }}>Menu</p>
          <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.1rem', color: a.text, letterSpacing: '-0.01em', marginBottom: 6 }}>Emma &amp; Luc</p>
          <div style={{ width: 28, height: 1.5, background: a.accent, borderRadius: 1, marginBottom: 20 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Entrée', 'Plat', 'Fromage', 'Dessert'].map((course, i) => (
              <div key={course}>
                <p style={{ fontFamily: BODY, fontWeight: 600, fontSize: '0.58rem', color: a.accent, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 5 }}>{course}</p>
                <div style={{ height: 7, background: a.text, opacity: 0.08, borderRadius: 2, width: ['82%', '68%', '58%', '74%'][i] }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${a.text}18` }}>
            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.6rem', color: a.text, opacity: 0.4, textAlign: 'center', letterSpacing: '0.08em' }}>Sophie Durand · Table 3</p>
          </div>
        </div>
      )
    }

    return (
      <div style={{ ...base, width: w, height: h, background: a.cardBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' }}>
        {productId === 'save_the_date' && (
          <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.58rem', color: a.text, opacity: 0.45, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 18 }}>Save the date</p>
        )}
        <div style={{ width: 32, height: 1.5, background: a.accent, marginBottom: 20, borderRadius: 1 }} />
        <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.55rem', color: a.text, letterSpacing: '-0.02em', lineHeight: 1.18, marginBottom: 12 }}>
          Emma<br />&amp; Luc
        </p>
        <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.65rem', color: a.text, opacity: 0.5, letterSpacing: '0.22em', marginBottom: 20 }}>14 · 06 · 2026</p>
        <div style={{ width: 32, height: 1.5, background: a.accent, borderRadius: 1, marginBottom: 20 }} />
        {productId === 'faire_part' && (
          <>
            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.63rem', color: a.text, opacity: 0.5, lineHeight: 1.7, maxWidth: 140 }}>
              Nous avons la joie de vous inviter à célébrer notre union
            </p>
            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.6rem', color: a.text, opacity: 0.35, marginTop: 14, letterSpacing: '0.08em' }}>Château de Vallery, Bourgogne</p>
          </>
        )}
        {productId === 'save_the_date' && (
          <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.6rem', color: a.text, opacity: 0.4, letterSpacing: '0.1em' }}>Château de Vallery</p>
        )}
      </div>
    )
  }

  if (p.shape === 'landscape') {
    const isNumero = productId === 'numero_table'
    return (
      <div style={{ position: 'relative', width: 320, height: 200, transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)', transform: `scale(${scale})` }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: a.text, opacity: 0.1, zIndex: 2 }} />
        <div style={{ width: '100%', height: '100%', background: a.cardBg, borderRadius: 10, boxShadow: shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          {isNumero ? (
            <>
              <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '3.2rem', color: a.text, letterSpacing: '-0.04em', lineHeight: 1 }}>3</p>
              <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.62rem', color: a.text, opacity: 0.45, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 6 }}>Table</p>
            </>
          ) : (
            <>
              <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.15rem', color: a.text, letterSpacing: '-0.01em', marginBottom: 6 }}>Sophie Durand</p>
              <div style={{ width: 26, height: 1.5, background: a.accent, borderRadius: 1, marginBottom: 6 }} />
              <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.62rem', color: a.text, opacity: 0.45, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Table 3</p>
            </>
          )}
        </div>
      </div>
    )
  }

  const isCeremonie = productId === 'plan_ceremonie'
  return (
    <div style={{ ...base, width: 228, height: 322, background: a.cardBg, padding: '26px 22px', overflow: 'hidden' }}>
      <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.53rem', color: a.text, opacity: 0.42, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 3 }}>
        {isCeremonie ? 'Plan de cérémonie' : 'Plan de table'}
      </p>
      <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.98rem', color: a.text, marginBottom: 5 }}>Emma &amp; Luc</p>
      <div style={{ width: 22, height: 1.5, background: a.accent, borderRadius: 1, marginBottom: 16 }} />
      {isCeremonie ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          {[5, 5, 5, 5, 5].map((n, row) => (
            <div key={row} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              {Array.from({ length: n }).map((_, i) => (
                <div key={i} style={{ width: 18, height: 11, borderRadius: 3, background: a.text, opacity: 0.12 }} />
              ))}
              <div style={{ width: 12 }} />
              {Array.from({ length: n }).map((_, i) => (
                <div key={i + 10} style={{ width: 18, height: 11, borderRadius: 3, background: a.text, opacity: 0.12 }} />
              ))}
            </div>
          ))}
          <div style={{ marginTop: 10, width: 38, height: 14, borderRadius: 4, background: a.accent, opacity: 0.5 }} />
          <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.48rem', color: a.text, opacity: 0.32, letterSpacing: '0.1em' }}>Autel</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <div key={n} style={{ background: a.text, opacity: 0.1, borderRadius: '50%', aspectRatio: '1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.55rem', color: a.text, opacity: 8 }}>{n}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Wizard ───────────────────────────────────────────────────────────────────

export default function StudioPublic() {
  const [ambiance, setAmbiance] = useState<string>('classique')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [livePrices, setLivePrices] = useState<Record<string, number | null>>({})

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

  const scrollRef = useRef<HTMLDivElement>(null)
  const step0Ref = useRef<HTMLDivElement>(null)
  const step1Ref = useRef<HTMLDivElement>(null)
  const step2Ref = useRef<HTMLDivElement>(null)
  const stepRefs = [step0Ref, step1Ref, step2Ref]

  const a = AMBIANCES.find(x => x.id === ambiance) ?? AMBIANCES[1]
  const selectedProducts = PRODUCTS.filter(p => (quantities[p.id] ?? 0) > 0)
  const priceOf = (p: Product) => livePrices[p.id] ?? p.price
  const total = PRODUCTS.reduce((sum, p) => sum + (quantities[p.id] ?? 0) * priceOf(p), 0)
  const hasPerso = selectedProducts.some(p => p.needs_perso)
  const previewProduct = hoveredProduct ?? (selectedProducts.length === 1 ? selectedProducts[0].id : null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const observers = stepRefs.map((ref, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i) },
        { root: container, threshold: 0.5 }
      )
      if (ref.current) obs.observe(ref.current)
      return obs
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  function scrollToStep(i: number) {
    stepRefs[i].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function setQty(id: string, delta: number) {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }))
  }

  async function handleCheckout() {
    if (selectedProducts.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/studio/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambianceId: ambiance, quantities }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Fullscreen overlay ── */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center cursor-zoom-out"
          style={{ background: a.bg }}
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute top-6 right-6 text-sm px-4 py-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: a.text, fontFamily: BODY, fontWeight: 400, border: 'none', cursor: 'pointer' }}
            onClick={() => setFullscreen(false)}
          >
            Fermer ✕
          </button>
          <MockupCard productId={previewProduct} a={a} scale={1.9} />
        </div>
      )}

      <div className="flex h-screen overflow-hidden">

        {/* ── LEFT: scrollable steps ── */}
        <div
          ref={scrollRef}
          className="w-full lg:w-1/2 h-screen overflow-y-auto"
          style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
        >

          {/* Nav top */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-10 py-4"
               style={{ background: 'rgba(250,248,245,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <a href="/" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#2d3228', textDecoration: 'none' }}>Kaatch</a>
            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.8rem', color: '#a8a29e' }}>Studio Créatif</p>
          </div>

          {/* ── Step 01 — Ambiance ── */}
          <div
            ref={step0Ref}
            style={{ scrollSnapAlign: 'start', minHeight: 'calc(100vh - 57px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 52px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: '0.68rem', background: a.accent, color: '#fff', borderRadius: 20, padding: '3px 11px', letterSpacing: '0.04em' }}>01</span>
              <p style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.75rem', color: '#a8a29e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Votre ambiance</p>
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.9rem,3vw,2.5rem)', letterSpacing: '-0.03em', color: '#2d3228', lineHeight: 1.08, marginBottom: 10 }}>
              Quel est votre style ?
            </h2>
            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.95rem', color: '#78716c', lineHeight: 1.75, marginBottom: 32 }}>
              Choisissez l&apos;univers graphique de votre collection. Il s&apos;appliquera à tous vos produits.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {AMBIANCES.map(am => (
                <button
                  key={am.id}
                  onClick={() => setAmbiance(am.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '15px 20px', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${ambiance === am.id ? am.accent : 'transparent'}`,
                    background: ambiance === am.id ? am.bg : '#f5f0e8',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: am.bg, border: `1.5px solid ${am.accent}40`, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: '#2d3228', marginBottom: 1 }}>{am.name}</p>
                      <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.72rem', color: '#78716c' }}>{am.tag}</p>
                    </div>
                  </div>
                  {ambiance === am.id && (
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: am.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => scrollToStep(1)}
              style={{ marginTop: 28, alignSelf: 'flex-start', background: '#2d3228', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 30px', fontFamily: BODY, fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Continuer →
            </button>
          </div>

          {/* ── Step 02 — Produits ── */}
          <div
            ref={step1Ref}
            style={{ scrollSnapAlign: 'start', minHeight: 'calc(100vh - 57px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 52px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: '0.68rem', background: a.accent, color: '#fff', borderRadius: 20, padding: '3px 11px', letterSpacing: '0.04em' }}>02</span>
              <p style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.75rem', color: '#a8a29e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Vos produits</p>
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.9rem,3vw,2.5rem)', letterSpacing: '-0.03em', color: '#2d3228', lineHeight: 1.08, marginBottom: 10 }}>
              Que souhaitez-vous imprimer ?
            </h2>
            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.95rem', color: '#78716c', lineHeight: 1.75, marginBottom: 28 }}>
              Survolez un produit pour le visualiser. Indiquez la quantité souhaitée.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {PRODUCTS.map(p => {
                const qty = quantities[p.id] ?? 0
                const active = qty > 0
                return (
                  <div
                    key={p.id}
                    onMouseEnter={() => setHoveredProduct(p.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '13px 16px', borderRadius: 14,
                      border: `1.5px solid ${active ? a.accent : hoveredProduct === p.id ? '#d0ccc4' : '#e7e3dc'}`,
                      background: active ? a.bg : hoveredProduct === p.id ? '#faf8f5' : '#fff',
                      transition: 'all 0.2s ease', cursor: 'default',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                        <span style={{ fontSize: '0.95rem' }}>{p.icon}</span>
                        <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.88rem', color: '#2d3228' }}>{p.name}</p>
                        {p.needs_perso && (
                          <span style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.58rem', color: '#a8a29e', background: '#f5f0e8', borderRadius: 5, padding: '1px 6px', flexShrink: 0 }}>perso.</span>
                        )}
                      </div>
                      <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.68rem', color: '#b8b0a8', paddingLeft: 26 }}>{p.detail}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 12, flexShrink: 0 }}>
                      <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.82rem', color: active ? a.accent : '#c8c2ba', minWidth: 56, textAlign: 'right' }}>
                        {qty > 0 ? `${(qty * priceOf(p)).toFixed(0)} €` : `${priceOf(p).toFixed(2)} €`}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <button
                          onClick={() => setQty(p.id, -1)}
                          disabled={qty === 0}
                          style={{ width: 26, height: 26, borderRadius: 7, border: '1.5px solid #e7e3dc', background: '#fff', cursor: qty > 0 ? 'pointer' : 'not-allowed', opacity: qty > 0 ? 1 : 0.3, color: '#2d3228', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}
                        >−</button>
                        <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: '0.88rem', color: '#2d3228', minWidth: 18, textAlign: 'center' }}>{qty}</span>
                        <button
                          onClick={() => setQty(p.id, 1)}
                          style={{ width: 26, height: 26, borderRadius: 7, border: '1.5px solid #e7e3dc', background: '#fff', cursor: 'pointer', color: '#2d3228', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}
                        >+</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {total > 0 && (
              <button
                onClick={() => scrollToStep(2)}
                style={{ marginTop: 22, alignSelf: 'flex-start', background: '#2d3228', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 30px', fontFamily: BODY, fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Voir le récapitulatif →
              </button>
            )}
          </div>

          {/* ── Step 03 — Récap + paiement ── */}
          <div
            ref={step2Ref}
            style={{ scrollSnapAlign: 'start', minHeight: 'calc(100vh - 57px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 52px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: '0.68rem', background: a.accent, color: '#fff', borderRadius: 20, padding: '3px 11px', letterSpacing: '0.04em' }}>03</span>
              <p style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.75rem', color: '#a8a29e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Votre commande</p>
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.9rem,3vw,2.5rem)', letterSpacing: '-0.03em', color: '#2d3228', lineHeight: 1.08, marginBottom: 28 }}>
              Récapitulatif
            </h2>

            {selectedProducts.length === 0 ? (
              <div style={{ padding: 24, borderRadius: 14, background: '#f5f0e8', marginBottom: 20 }}>
                <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.9rem', color: '#78716c', marginBottom: 10 }}>Aucun produit sélectionné.</p>
                <button onClick={() => scrollToStep(1)} style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.82rem', color: '#4a5240', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  ← Choisir mes produits
                </button>
              </div>
            ) : (
              <>
                <div style={{ borderRadius: 16, border: '1.5px solid #e7e3dc', overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ padding: '11px 18px', background: '#f9f7f4', borderBottom: '1px solid #e7e3dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ambiance</p>
                    <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.88rem', color: '#2d3228' }}>{a.name}</p>
                  </div>
                  {selectedProducts.map((p, i) => (
                    <div key={p.id} style={{ padding: '12px 18px', borderBottom: i < selectedProducts.length - 1 ? '1px solid #e7e3dc' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.85rem', color: '#2d3228' }}>{p.icon} {p.name}</p>
                        <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.7rem', color: '#a8a29e', marginTop: 1 }}>× {quantities[p.id]} · {p.detail}</p>
                      </div>
                      <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.92rem', color: '#2d3228' }}>{((quantities[p.id] ?? 0) * priceOf(p)).toFixed(2)} €</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.85rem', color: '#78716c' }}>Sous-total impression</p>
                  <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.2rem', color: '#2d3228' }}>{total.toFixed(2)} €</p>
                </div>
                <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.72rem', color: '#b8b0a8', marginBottom: 22, lineHeight: 1.65 }}>
                  + frais de livraison calculés au paiement · Impression 3–5 jours · Livraison 2–3 jours
                </p>

                {hasPerso && (
                  <div style={{ padding: '13px 16px', borderRadius: 12, background: '#f0f4ee', border: '1px solid #c8d4c0', marginBottom: 20 }}>
                    <p style={{ fontFamily: BODY, fontWeight: 600, fontSize: '0.8rem', color: '#4a5240', marginBottom: 4 }}>📋 Personnalisation requise</p>
                    <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.75rem', color: '#5a7050', lineHeight: 1.65 }}>
                      Après le paiement, vous renseignerez les noms de vos invités. L&apos;impression ne démarrera qu&apos;après votre validation.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  style={{ background: '#2d3228', color: '#fff', border: 'none', borderRadius: 14, padding: '16px 32px', fontFamily: BODY, fontWeight: 600, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.65 : 1, width: '100%', transition: 'all 0.2s ease' }}
                >
                  {loading ? 'Redirection…' : `Commander — ${total.toFixed(2)} €`}
                </button>
                <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.7rem', color: '#b8b0a8', textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
                  Paiement sécurisé par Stripe · Aucun compte requis · Facture envoyée par email
                </p>
              </>
            )}
          </div>

        </div>

        {/* ── RIGHT: sticky preview ── */}
        <div
          className="hidden lg:flex w-1/2 h-screen flex-col items-center justify-center relative"
          style={{ background: a.bg, transition: 'background 0.6s ease' }}
        >
          {/* Step dots */}
          <div style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <button
                key={i}
                onClick={() => scrollToStep(i)}
                style={{ width: 6, height: activeStep === i ? 26 : 6, borderRadius: 3, background: activeStep === i ? a.accent : a.text, opacity: activeStep === i ? 0.9 : 0.2, border: 'none', cursor: 'pointer', transition: 'all 0.35s ease', padding: 0 }}
              />
            ))}
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setFullscreen(true)}
            style={{ position: 'absolute', top: 22, right: 22, background: `${a.text}18`, border: 'none', borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: BODY, fontWeight: 400, fontSize: '0.72rem', color: a.text, opacity: 0.65, display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.2s' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            Plein écran
          </button>

          <MockupCard productId={previewProduct} a={a} />

          {/* Bottom label */}
          <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center' }}>
            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.68rem', color: a.text, opacity: 0.4, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              {a.name} — {a.tag}
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
