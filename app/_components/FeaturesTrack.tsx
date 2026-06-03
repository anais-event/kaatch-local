'use client'

import { useRef } from 'react'

const BODY = 'var(--font-body)'
const SAGE_DARK = '#2d3228'
const TEXT_MID = '#5a5549'
const SAGE_MUTED = '#5e6654'
const CREAM = '#f5f0e8'
const CREAM_MID = '#ece6db'
const WHITE = '#fffdf9'

const features = [
  {
    tag: 'Faire-part digital',
    title: 'Le faire-part que personne ne jette à la poubelle',
    desc: "Chaque invité reçoit un lien personnel. Il ouvre une enveloppe animée, lit votre message, et répond \"présent\" en un tap. Vous, vous regardez les RSVP tomber en direct. C'est un peu addictif.",
    img: '/images/landing/fairpart-preview.png',
    placeholder: 'Faire-part animé — enveloppe, pétales, message personnalisé',
  },
  {
    tag: 'Album partagé',
    title: '800 photos, zéro "tu m\'envoies les tiennes ?"',
    desc: "Un QR code sur les tables. Vos invités scannent, déposent, et tout arrive au même endroit. Le lendemain, votre mariage vu sous 80 angles différents vous attend au réveil.",
    img: '/images/landing/album-preview.png',
    placeholder: 'Galerie photo — uploads invités, tri par moment',
  },
  {
    tag: 'Plan de table',
    title: 'Déplacer des gens sans vexer personne',
    desc: "Glisser-déposer, refaire, encore refaire. Les régimes alimentaires suivent automatiquement — votre traiteur sait en un clic que la table 7 a deux végans et un sans gluten.",
    img: '/images/landing/plantable-preview.png',
    placeholder: 'Plan de table — drag and drop, régimes alimentaires',
  },
  {
    tag: 'Invités et RSVP',
    title: 'Savoir qui vient. Avant le jour J.',
    desc: "La liste complète, les réponses en temps réel, les préférences alimentaires, et le nombre exact pour le traiteur. Import et export inclus, pour les amateurs de tableurs.",
    img: '/images/landing/rsvp-preview.png',
    placeholder: 'Tableau RSVP — statuts, compteurs, filtres',
  },
  {
    tag: 'Budget',
    title: "Où passe l'argent (et est-ce qu'il en reste)",
    desc: "Vos postes de dépenses, vos prestataires, vos devis. Plus clair qu'un compte commun, moins stressant qu'un tableur à 47 onglets que personne ne comprend.",
    img: '/images/landing/budget-preview.png',
    placeholder: 'Budget — catégories, prestataires, progression',
  },
  {
    tag: 'Programme du jour',
    title: "Pour ne plus répondre 43 fois \"c'est à quelle heure\"",
    desc: "Le déroulé complet, partagé automatiquement. Vos témoins respirent, le DJ sait quand lancer la musique, et votre photographe ne rate pas la sortie de cérémonie.",
    img: '/images/landing/programme-preview.png',
    placeholder: 'Programme — timeline, horaires, lieux',
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
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative',
            }}>
              <img
                src={f.img}
                alt={f.placeholder}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
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
