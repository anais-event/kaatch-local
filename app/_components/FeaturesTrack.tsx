'use client'

import { useRef } from 'react'

const BODY = 'var(--font-body)'
const SAGE_DARK = '#2d3228'
const TEXT_MID = '#5a5549'
const SAGE_MUTED = '#5e6654'
const CREAM = '#f5f0e8'
const CREAM_MID = '#ece6db'
const WHITE = '#fffdf9'
const SAGE = '#4a5240'

function MockupFairePart() {
  return (
    <svg viewBox="0 0 380 208" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="380" height="208" fill="#f0ebe1" />
      {/* Envelope */}
      <rect x="60" y="30" width="260" height="148" rx="8" fill="#ece6db" stroke="#d4cfc6" strokeWidth="1" />
      {/* Envelope flap */}
      <path d="M60 38 L190 110 L320 38" fill="none" stroke="#c8c2b8" strokeWidth="1.5" />
      {/* Card inside */}
      <rect x="90" y="50" width="200" height="110" rx="6" fill={WHITE} />
      <text x="190" y="82" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fill={SAGE} fontStyle="italic">Sophie &amp; Thomas</text>
      <text x="190" y="100" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fill="#9a9490">vous invitent à leur mariage</text>
      <rect x="130" y="112" width="60" height="1" fill={CREAM_MID} />
      <text x="190" y="128" textAnchor="middle" fontFamily="sans-serif" fontSize="7.5" fill={TEXT_MID}>14 juin 2025 · Château de Vaux</text>
      {/* Petals */}
      <ellipse cx="85" cy="45" rx="6" ry="3" fill="#d4b8a8" opacity="0.7" transform="rotate(-30 85 45)" />
      <ellipse cx="295" cy="55" rx="5" ry="2.5" fill="#e8c4b0" opacity="0.6" transform="rotate(20 295 55)" />
      <ellipse cx="310" cy="150" rx="4" ry="2" fill="#d4b8a8" opacity="0.5" transform="rotate(-10 310 150)" />
      <ellipse cx="70" cy="155" rx="5" ry="2.5" fill="#e8c4b0" opacity="0.6" transform="rotate(15 70 155)" />
      {/* RSVP badge */}
      <rect x="248" y="148" width="62" height="22" rx="11" fill={SAGE} />
      <text x="279" y="163" textAnchor="middle" fontFamily="sans-serif" fontSize="8.5" fill={WHITE} fontWeight="600">Je confirme ✓</text>
    </svg>
  )
}

function MockupAlbum() {
  const photos = [
    { x: 8,   y: 8,  w: 76, h: 58, color: '#c8bfb2' },
    { x: 92,  y: 8,  w: 76, h: 58, color: '#b8c0b0' },
    { x: 176, y: 8,  w: 76, h: 58, color: '#c4bab2' },
    { x: 8,   y: 74, w: 76, h: 58, color: '#b2bab8' },
    { x: 92,  y: 74, w: 76, h: 58, color: '#c8c0b4' },
    { x: 176, y: 74, w: 76, h: 58, color: '#b8bfb0' },
    { x: 8,   y: 140, w: 76, h: 58, color: '#bfc8c0' },
    { x: 92,  y: 140, w: 76, h: 58, color: '#c4bab0' },
    { x: 176, y: 140, w: 76, h: 58, color: '#b8c2b8' },
  ]
  const icons = ['💍', '🌸', '🥂', '🎶', '💐', '🤍', '🌿', '✨', '🥳']
  return (
    <svg viewBox="0 0 268 208" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="268" height="208" fill="#f0ebe1" />
      {photos.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="5" fill={p.color} />
          <text x={p.x + p.w / 2} y={p.y + p.h / 2 + 6} textAnchor="middle" fontSize="18">{icons[i]}</text>
        </g>
      ))}
      {/* Upload fab */}
      <circle cx="234" cy="174" r="20" fill={SAGE} />
      <text x="234" y="179" textAnchor="middle" fontSize="16" fill={WHITE}>+</text>
      {/* Count badge */}
      <rect x="8" y="174" width="80" height="22" rx="11" fill="rgba(45,50,40,0.7)" />
      <text x="48" y="189" textAnchor="middle" fontFamily="sans-serif" fontSize="8.5" fill={WHITE}>127 photos ✓</text>
    </svg>
  )
}

function MockupPlanTable() {
  const tables = [
    { cx: 80,  cy: 70,  r: 28, name: 'Table 1', n: 8 },
    { cx: 190, cy: 70,  r: 28, name: 'Table 2', n: 6 },
    { cx: 300, cy: 70,  r: 28, name: 'Table 3', n: 8 },
    { cx: 80,  cy: 155, r: 28, name: 'Table 4', n: 7 },
    { cx: 190, cy: 155, r: 28, name: 'Table 5', n: 6 },
    { cx: 300, cy: 155, r: 28, name: 'Table 6', n: 8 },
  ]
  const seatAngles = (n: number) => Array.from({ length: n }, (_, i) => (360 / n) * i)
  return (
    <svg viewBox="0 0 380 208" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="380" height="208" fill="#f0ebe1" />
      {tables.map((t, i) => (
        <g key={i}>
          {seatAngles(t.n).map((a, j) => {
            const rad = (a * Math.PI) / 180
            const sx = t.cx + (t.r + 10) * Math.sin(rad)
            const sy = t.cy - (t.r + 10) * Math.cos(rad)
            return <circle key={j} cx={sx} cy={sy} r="5" fill={CREAM_MID} stroke="#c4bfb8" strokeWidth="0.8" />
          })}
          <circle cx={t.cx} cy={t.cy} r={t.r} fill={WHITE} stroke={CREAM_MID} strokeWidth="1.5" />
          <text x={t.cx} y={t.cy - 4} textAnchor="middle" fontFamily="sans-serif" fontSize="7.5" fill={SAGE_DARK} fontWeight="600">{t.name}</text>
          <text x={t.cx} y={t.cy + 8} textAnchor="middle" fontFamily="sans-serif" fontSize="7" fill={TEXT_MID}>{t.n} pers.</text>
        </g>
      ))}
      {/* Drag hint */}
      <rect x="148" y="92" width="84" height="24" rx="12" fill="rgba(74,82,64,0.85)" />
      <text x="190" y="108" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill={WHITE}>↔ Déplacer</text>
    </svg>
  )
}

function MockupRSVP() {
  const rows = [
    { name: 'Marie Dupont',   status: 'Confirmé',  color: '#4a8c5c', diet: '–' },
    { name: 'Jean Martin',    status: 'Confirmé',  color: '#4a8c5c', diet: 'Végan' },
    { name: 'Sophie Leroy',   status: 'En attente', color: '#b8883a', diet: '–' },
    { name: 'Paul Bernard',   status: 'Confirmé',  color: '#4a8c5c', diet: 'Sans gluten' },
    { name: 'Claire Moreau',  status: 'Décliné',   color: '#9a4a4a', diet: '–' },
    { name: 'Lucas Petit',    status: 'Confirmé',  color: '#4a8c5c', diet: '–' },
  ]
  return (
    <svg viewBox="0 0 380 208" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="380" height="208" fill="#f0ebe1" />
      {/* Header counts */}
      {[
        { label: 'Confirmés', val: '42', x: 30 },
        { label: 'En attente', val: '8',  x: 160 },
        { label: 'Total',      val: '56', x: 280 },
      ].map(s => (
        <g key={s.label}>
          <rect x={s.x} y="8" width="90" height="38" rx="8" fill={WHITE} />
          <text x={s.x + 45} y="26" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill={SAGE_DARK} fontWeight="700">{s.val}</text>
          <text x={s.x + 45} y="40" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fill={TEXT_MID}>{s.label}</text>
        </g>
      ))}
      {/* Table header */}
      <rect x="8" y="54" width="364" height="18" rx="0" fill={CREAM_MID} />
      {['Invité', 'Statut', 'Régime'].map((h, i) => (
        <text key={h} x={i === 0 ? 20 : i === 1 ? 180 : 300} y="67" fontFamily="sans-serif" fontSize="7.5" fill={SAGE_MUTED} fontWeight="600">{h}</text>
      ))}
      {rows.map((r, i) => (
        <g key={i}>
          <rect x="8" y={72 + i * 22} width="364" height="22" fill={i % 2 === 0 ? WHITE : 'rgba(255,253,249,0.5)'} />
          <text x="20"  y={87 + i * 22} fontFamily="sans-serif" fontSize="8.5" fill={SAGE_DARK}>{r.name}</text>
          <rect x="168" y={76 + i * 22} width="58" height="14" rx="7" fill={r.color + '22'} />
          <text x="197" y={87 + i * 22} textAnchor="middle" fontFamily="sans-serif" fontSize="7" fill={r.color} fontWeight="600">{r.status}</text>
          <text x="295" y={87 + i * 22} fontFamily="sans-serif" fontSize="7.5" fill={TEXT_MID}>{r.diet}</text>
        </g>
      ))}
    </svg>
  )
}

function MockupBudget() {
  const items = [
    { label: 'Traiteur',      pct: 0.38, spent: '7 600', total: '8 000' },
    { label: 'Photographe',   pct: 0.72, spent: '2 160', total: '3 000' },
    { label: 'Salle',         pct: 1.00, spent: '4 500', total: '4 500' },
    { label: 'Musique',       pct: 0.50, spent: '750',   total: '1 500' },
    { label: 'Fleuriste',     pct: 0.20, spent: '300',   total: '1 500' },
  ]
  return (
    <svg viewBox="0 0 380 208" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="380" height="208" fill="#f0ebe1" />
      {/* Total card */}
      <rect x="8" y="8" width="364" height="44" rx="10" fill={WHITE} />
      <text x="24" y="26" fontFamily="sans-serif" fontSize="8" fill={TEXT_MID}>Budget total</text>
      <text x="24" y="44" fontFamily="sans-serif" fontSize="16" fill={SAGE_DARK} fontWeight="700">18 500 €</text>
      <text x="340" y="26" textAnchor="end" fontFamily="sans-serif" fontSize="8" fill={TEXT_MID}>Dépensé</text>
      <text x="340" y="44" textAnchor="end" fontFamily="sans-serif" fontSize="13" fill={SAGE} fontWeight="600">15 310 €</text>
      {/* Bars */}
      {items.map((item, i) => (
        <g key={i}>
          <text x="20" y={82 + i * 28} fontFamily="sans-serif" fontSize="8.5" fill={SAGE_DARK}>{item.label}</text>
          <text x="360" y={82 + i * 28} textAnchor="end" fontFamily="sans-serif" fontSize="7.5" fill={TEXT_MID}>{item.spent} / {item.total} €</text>
          <rect x="20" y={86 + i * 28} width="340" height="7" rx="3.5" fill={CREAM_MID} />
          <rect x="20" y={86 + i * 28} width={340 * item.pct} height="7" rx="3.5" fill={item.pct >= 1 ? '#4a8c5c' : SAGE} />
        </g>
      ))}
    </svg>
  )
}

function MockupProgramme() {
  const steps = [
    { time: '11h00', title: 'Cérémonie civile',   lieu: 'Mairie de Lyon',         done: true  },
    { time: '14h00', title: 'Cérémonie laïque',   lieu: 'Jardin des Dombes',      done: true  },
    { time: '16h00', title: 'Vin d\'honneur',     lieu: 'Terrasse du château',     done: false },
    { time: '19h30', title: 'Dîner',              lieu: 'Salle des Lumières',      done: false },
    { time: '22h00', title: 'Soirée dansante',    lieu: 'Même salle',             done: false },
  ]
  return (
    <svg viewBox="0 0 380 208" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="380" height="208" fill="#f0ebe1" />
      {steps.map((s, i) => {
        const y = 16 + i * 38
        const active = i === 2
        return (
          <g key={i}>
            {/* Line */}
            {i < steps.length - 1 && (
              <line x1="50" y1={y + 18} x2="50" y2={y + 38} stroke={CREAM_MID} strokeWidth="1.5" strokeDasharray="3 3" />
            )}
            {/* Dot */}
            <circle cx="50" cy={y + 10} r="8" fill={s.done ? SAGE : active ? SAGE : WHITE} stroke={s.done || active ? SAGE : CREAM_MID} strokeWidth="1.5" />
            {s.done && <text x="50" y={y + 14} textAnchor="middle" fontSize="9" fill={WHITE}>✓</text>}
            {!s.done && !active && <circle cx="50" cy={y + 10} r="3" fill={CREAM_MID} />}
            {active && <circle cx="50" cy={y + 10} r="4" fill={WHITE} />}
            {/* Content */}
            <rect x="70" y={y} width="298" height="30" rx="6" fill={active ? WHITE : 'rgba(255,253,249,0.5)'} stroke={active ? CREAM_MID : 'none'} strokeWidth="1" />
            <text x="84" y={y + 12} fontFamily="sans-serif" fontSize="8" fill={TEXT_MID} fontWeight="500">{s.time}</text>
            <text x="130" y={y + 12} fontFamily="sans-serif" fontSize="9" fill={SAGE_DARK} fontWeight="600">{s.title}</text>
            <text x="84" y={y + 24} fontFamily="sans-serif" fontSize="7.5" fill={TEXT_MID}>{s.lieu}</text>
          </g>
        )
      })}
    </svg>
  )
}

const features = [
  {
    tag: 'Faire-part digital',
    title: 'Le faire-part que personne ne jette à la poubelle',
    desc: "Chaque invité reçoit un lien personnel. Il ouvre une enveloppe animée, lit votre message, et répond \"présent\" en un tap. Vous, vous regardez les RSVP tomber en direct. C'est un peu addictif.",
    Mockup: MockupFairePart,
  },
  {
    tag: 'Album partagé',
    title: '800 photos, zéro "tu m\'envoies les tiennes ?"',
    desc: "Un QR code sur les tables. Vos invités scannent, déposent, et tout arrive au même endroit. Le lendemain, votre mariage vu sous 80 angles différents vous attend au réveil.",
    Mockup: MockupAlbum,
  },
  {
    tag: 'Plan de table',
    title: 'Déplacer des gens sans vexer personne',
    desc: "Glisser-déposer, refaire, encore refaire. Les régimes alimentaires suivent automatiquement — votre traiteur sait en un clic que la table 7 a deux végans et un sans gluten.",
    Mockup: MockupPlanTable,
  },
  {
    tag: 'Invités et RSVP',
    title: 'Savoir qui vient. Avant le jour J.',
    desc: "La liste complète, les réponses en temps réel, les préférences alimentaires, et le nombre exact pour le traiteur. Import et export inclus, pour les amateurs de tableurs.",
    Mockup: MockupRSVP,
  },
  {
    tag: 'Budget',
    title: "Où passe l'argent (et est-ce qu'il en reste)",
    desc: "Vos postes de dépenses, vos prestataires, vos devis. Plus clair qu'un compte commun, moins stressant qu'un tableur à 47 onglets que personne ne comprend.",
    Mockup: MockupBudget,
  },
  {
    tag: 'Programme du jour',
    title: "Pour ne plus répondre 43 fois \"c'est à quelle heure\"",
    desc: "Le déroulé complet, partagé automatiquement. Vos témoins respirent, le DJ sait quand lancer la musique, et votre photographe ne rate pas la sortie de cérémonie.",
    Mockup: MockupProgramme,
  },
]

function ArrowBtn({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Fonctionnalité précédente' : 'Fonctionnalité suivante'}
      style={{
        width: '2.6rem', height: '2.6rem', borderRadius: '50%',
        border: `1px solid ${CREAM_MID}`, background: WHITE, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: SAGE_DARK, transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = CREAM
        e.currentTarget.style.borderColor = SAGE_DARK
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = WHITE
        e.currentTarget.style.borderColor = CREAM_MID
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'prev'
          ? <path d="M15 18l-6-6 6-6" />
          : <path d="M9 18l6-6-6-6" />
        }
      </svg>
    </button>
  )
}

export default function FeaturesTrack() {
  const trackRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'prev' | 'next') {
    if (!trackRef.current) return
    const card = trackRef.current.querySelector('[data-fcard]') as HTMLElement | null
    const cardW = card ? card.offsetWidth + 19 : 440
    trackRef.current.scrollBy({ left: dir === 'next' ? cardW : -cardW, behavior: 'smooth' })
  }

  return (
    <>
      <div style={{ padding: '0 2.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.6rem' }}>
        <ArrowBtn dir="prev" onClick={() => scroll('prev')} />
        <ArrowBtn dir="next" onClick={() => scroll('next')} />
      </div>

      <div
        ref={trackRef}
        className="features-track"
        style={{
          display: 'flex', gap: '1.2rem',
          padding: '0 2.5rem 1rem',
          overflowX: 'auto', scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
      >
        {features.map((f, i) => (
          <article
            key={i}
            data-fcard=""
            style={{
              flex: '0 0 min(82vw, 26rem)', scrollSnapAlign: 'start',
              background: CREAM, borderRadius: 14, overflow: 'hidden',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{
              height: '13rem', background: CREAM_MID,
              overflow: 'hidden', position: 'relative',
            }}>
              <f.Mockup />
            </div>
            <div style={{ padding: '1.3rem 1.4rem 1.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: SAGE_MUTED, marginBottom: '0.5rem', fontFamily: BODY }}>
                {f.tag}
              </p>
              <h3 style={{ fontWeight: 600, fontSize: '1.08rem', color: SAGE_DARK, marginBottom: '0.5rem', lineHeight: 1.3, fontFamily: BODY, letterSpacing: '-0.01em' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.84rem', fontWeight: 300, color: TEXT_MID, lineHeight: 1.65, fontFamily: BODY }}>
                {f.desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
