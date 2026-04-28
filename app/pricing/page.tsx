import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs — Kaatch | À partir de 45€, paiement unique',
  description: 'Plan gratuit jusqu\'à 30 invités, plan Mariage à 45€ (paiement unique, invités illimités, photos illimitées). Aucun abonnement caché.',
}

const DISPLAY = 'var(--font-cormorant)'
const LATO = 'var(--font-lato)'
const GREEN = '#4a5240'
const GREEN_DARK = '#2d3228'
const SHADOW = '0 4px 24px rgba(44,59,46,0.08), 0 1px 4px rgba(44,59,46,0.04)'

export default function PricingPage() {
  const gratuitFeatures = [
    '1 mariage',
    "Jusqu'à 50 invités",
    'Programme & faire-part',
    '50 photos maximum',
    'Messagerie de groupe',
    'Accès 3 mois',
  ]

  const mariageFeatures = [
    '1 mariage',
    'Invités illimités',
    'Toutes les fonctionnalités',
    'Budget & prestataires',
    'Plan de table',
    'Rétro-planning',
    'Photos illimitées',
    'Export Excel invités',
    'Accès à vie',
  ]

  return (
    <main
      className="min-h-screen bg-[#f5f0e8]"
      style={{ fontFamily: LATO, fontWeight: 300, color: GREEN_DARK }}
    >
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-8 md:px-10 h-16 flex items-center justify-between">
          <a
            href="/"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}
            className="text-[#2d3228]"
          >
            Kaatch
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="/#comment" className="text-sm text-stone-500 hover:text-[#4a5240] transition" style={{ fontWeight: 400 }}>
              Comment ça marche
            </a>
            <a href="/pricing" className="text-sm text-[#4a5240] transition" style={{ fontWeight: 500 }}>
              Tarifs
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/auth" className="text-sm text-stone-500 hover:text-[#2d3228] transition hidden sm:block" style={{ fontWeight: 400 }}>
              Connexion
            </a>
            <a
              href="/dashboard"
              className="text-sm bg-[#4a5240] text-white px-5 py-2.5 rounded-2xl hover:bg-[#2d3228] transition"
              style={{ fontWeight: 500 }}
            >
              Mon espace
            </a>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="pt-36 pb-16 px-8 text-center">
        <p
          className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5"
          style={{ fontWeight: 500 }}
        >
          Tarifs
        </p>
        <h1
          style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.01em', fontStyle: 'italic' }}
          className="text-[#2d3228] mb-5"
        >
          Simple. Transparent. Sans surprise.
        </h1>
        <p
          className="text-stone-500 max-w-md mx-auto"
          style={{ fontSize: '1rem', lineHeight: 1.85 }}
        >
          Un paiement unique pour votre mariage. Pas d&apos;abonnement, pas de renouvellement.
        </p>
      </section>

      {/* CARDS */}
      <section className="pb-24 px-8">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 items-start">

          {/* Gratuit */}
          <div
            className="bg-white rounded-2xl border border-stone-100 p-8 flex flex-col"
            style={{ boxShadow: SHADOW }}
          >
            <div className="mb-7">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-3" style={{ fontWeight: 500 }}>
                Gratuit
              </p>
              <div className="flex items-end gap-1 mb-2">
                <span
                  style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '3rem', lineHeight: 1, letterSpacing: '-0.02em' }}
                  className="text-[#2d3228]"
                >
                  0 €
                </span>
              </div>
              <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>
                Pour découvrir Kaatch
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {gratuitFeatures.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-stone-600" style={{ fontWeight: 300 }}>
                  <span className="text-[#4a5240] mt-0.5 shrink-0" style={{ fontWeight: 600 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/auth"
              className="w-full text-center border-2 border-stone-200 text-stone-500 px-6 py-3.5 rounded-2xl hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm"
              style={{ fontWeight: 500 }}
            >
              Commencer gratuitement
            </a>
          </div>

          {/* Mariage */}
          <div
            className="rounded-2xl p-8 flex flex-col relative"
            style={{ background: GREEN, boxShadow: '0 8px 40px rgba(74,82,64,0.25), 0 2px 8px rgba(74,82,64,0.12)' }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span
                className="bg-[#f5f0e8] text-[#4a5240] text-xs px-4 py-1.5 rounded-full whitespace-nowrap border border-[#4a5240]/20"
                style={{ fontWeight: 600 }}
              >
                Recommandé
              </span>
            </div>

            <div className="mb-7">
              <p className="text-xs tracking-widest uppercase text-white/70 mb-3" style={{ fontWeight: 500 }}>
                Mariage
              </p>
              <div className="flex items-end gap-1 mb-2">
                <span
                  style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '3rem', lineHeight: 1, letterSpacing: '-0.02em' }}
                  className="text-white"
                >
                  45 €
                </span>
              </div>
              <p className="text-white/65 text-sm" style={{ fontWeight: 300 }}>
                Paiement unique · Accès à vie
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {mariageFeatures.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/85" style={{ fontWeight: 300 }}>
                  <span className="text-white/80 mt-0.5 shrink-0" style={{ fontWeight: 600 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/auth"
              className="w-full text-center bg-white text-[#4a5240] px-6 py-3.5 rounded-2xl hover:bg-[#f5f0e8] transition text-sm"
              style={{ fontWeight: 600 }}
            >
              Choisir cette offre →
            </a>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-stone-400" style={{ fontWeight: 300 }}>
          Aucune carte bleue requise pour le plan gratuit · Paiement sécurisé · Accès immédiat
        </p>
      </section>

      {/* QUESTIONS */}
      <section className="py-20 px-8 bg-white border-t border-stone-100">
        <div className="max-w-xl mx-auto text-center">
          <p
            className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-4"
            style={{ fontWeight: 500 }}
          >
            Questions
          </p>
          <h2
            style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2, fontStyle: 'italic' }}
            className="text-[#2d3228] mb-4"
          >
            Vous avez une question ?
          </h2>
          <p className="text-stone-500 mb-8" style={{ fontSize: '0.95rem', lineHeight: 1.85 }}>
            On vous répond dans la journée. Écrivez-nous via le formulaire de contact ou directement par email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/#contact"
              className="inline-block border border-stone-200 text-stone-600 px-7 py-3 rounded-2xl hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm"
              style={{ fontWeight: 400 }}
            >
              Formulaire de contact
            </a>
            <a
              href="mailto:bonjour@kaatch.fr"
              className="inline-block text-sm text-[#4a5240] hover:text-[#2d3228] transition px-7 py-3"
              style={{ fontWeight: 400 }}
            >
              bonjour@kaatch.fr →
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 py-10 px-8 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}
            className="text-stone-400"
          >
            Kaatch
          </span>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            {[
              { label: 'Accueil', href: '/' },
              { label: 'Tarifs', href: '/pricing' },
              { label: 'Espace invités', href: '/rejoindre' },
            ].map(l => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-stone-400 hover:text-[#4a5240] transition"
                style={{ fontWeight: 300 }}
              >
                {l.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
            © 2025 Kaatch
          </p>
        </div>
      </footer>
    </main>
  )
}
