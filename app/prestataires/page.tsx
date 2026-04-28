import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '../_components/ContactForm'

export const metadata: Metadata = {
  title: 'Prestataires — Kaatch',
  description: 'Vous êtes professionnel du mariage ? Kaatch connecte les couples avec les meilleurs prestataires de leur région.',
}

const DISPLAY = 'var(--font-display)'
const GREEN = '#2C3B2E'
const CREAM = '#f5f0e8'

const metiers = [
  { icon: '📸', label: 'Photographe & vidéaste' },
  { icon: '🍽️', label: 'Traiteur' },
  { icon: '🎵', label: 'DJ & musiciens' },
  { icon: '💐', label: 'Fleuriste & décoration' },
  { icon: '🏡', label: 'Salle & domaine' },
  { icon: '🎂', label: 'Pâtissier & wedding cake' },
  { icon: '💄', label: 'Coiffure & maquillage' },
  { icon: '📋', label: 'Wedding planner' },
  { icon: '🚗', label: 'Transport & voiture' },
  { icon: '🖨️', label: 'Faire-parts & papeterie' },
]

export default function PrestatairesPage() {
  return (
    <main style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228', background: CREAM, minHeight: '100vh' }}>

      <nav style={{ background: `${CREAM}f2`, backdropFilter: 'blur(12px)' }}
           className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"
                style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: GREEN }}>
            Kaatch
          </Link>
          <Link href="/auth"
                className="text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition text-white"
                style={{ background: GREEN, fontWeight: 500 }}>
            Mon espace
          </Link>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-6 max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontWeight: 500, color: GREEN }}>
            Prestataires
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em', color: GREEN }}
              className="mb-5">
            Vous faites partie du<br />grand jour de quelqu&apos;un.
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto" style={{ fontSize: '1.05rem', lineHeight: 1.85 }}>
            Kaatch est une app d&apos;organisation de mariage utilisée par des milliers de couples. On réfléchit à des façons de mieux connecter les mariés avec les bons prestataires — sans spam, sans annuaire générique.
          </p>
        </div>

        {/* Ce qu'on imagine */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {[
            {
              icon: '🎯',
              title: 'Des couples qui cherchent activement',
              desc: 'Les utilisateurs de Kaatch organisent un vrai mariage, avec une vraie date. Pas des curieux — des gens qui ont besoin de vous.',
            },
            {
              icon: '📍',
              title: 'Un ancrage local',
              desc: 'On veut connecter les couples avec des prestataires de leur région, pas leur proposer des résultats à 500 km.',
            },
            {
              icon: '🤝',
              title: 'Pas un annuaire de plus',
              desc: 'L\'idée n\'est pas de vous noyer dans une liste. C\'est de vous mettre en avant au bon moment, auprès des bonnes personnes.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 border border-stone-100"
                 style={{ boxShadow: '0 2px 12px rgba(44,59,46,0.05)' }}>
              <div className="text-2xl mb-4">{item.icon}</div>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: GREEN, marginBottom: 8 }}>
                {item.title}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Métiers */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase mb-6 text-center text-stone-400" style={{ fontWeight: 500 }}>
            Pour qui ?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {metiers.map(m => (
              <span key={m.label}
                    className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-stone-100 text-sm text-stone-600"
                    style={{ fontWeight: 300, boxShadow: '0 1px 6px rgba(44,59,46,0.05)' }}>
                <span>{m.icon}</span>{m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Formulaire d'intérêt */}
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', lineHeight: 1.2, letterSpacing: '-0.02em', color: GREEN }}
                className="mb-3">
              On fait connaissance ?
            </h2>
            <p className="text-stone-500 text-sm" style={{ fontWeight: 300, lineHeight: 1.8 }}>
              Laissez-nous vos coordonnées. On revient vers vous dès qu&apos;on ouvre l&apos;espace prestataires — et votre avis nous aide à bien le construire.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-stone-100"
               style={{ boxShadow: '0 2px 16px rgba(44,59,46,0.06)' }}>
            <ContactForm preset="prestataire" />
          </div>
          <p className="text-center text-xs text-stone-400 mt-4" style={{ fontWeight: 300 }}>
            Ou directement par mail :{' '}
            <a href="mailto:bonjour@kaatch.fr?subject=Prestataire%20-%20Prise%20de%20contact"
               className="hover:text-stone-600 transition" style={{ color: GREEN }}>
              bonjour@kaatch.fr
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}
