import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs — Kaatch | À partir de 45, paiement unique',
  description: 'Plan Découverte pour commencer, plan Mariage à 45 (paiement unique, en euros). Sans abonnement, sans surprise.',
}

const DISPLAY = 'var(--font-display)'
const LATO = 'var(--font-lato)'
const GREEN = '#4a5240'
const GREEN_DARK = '#2d3228'
const SHADOW = '0 4px 24px rgba(44,59,46,0.08), 0 1px 4px rgba(44,59,46,0.04)'

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Kaatch — Application organisation mariage",
  "description": "Plateforme tout-en-un pour organiser son mariage : invités, faire-part animés, RSVP, plan de table, album photo, budget, programme, messagerie. Espace invités sans compte.",
  "url": "https://kaatch.fr",
  "brand": { "@type": "Brand", "name": "Kaatch" },
  "offers": [
    {
      "@type": "Offer",
      "name": "Plan Découverte",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "description": "1 mariage, 30 invités, 20 photos, accès 3 mois. Programme jour J, faire-part digital, RSVP basique.",
      "url": "https://kaatch.fr/pricing",
    },
    {
      "@type": "Offer",
      "name": "Plan Mariage",
      "price": "45",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "description": "Invités sans limite, 200 photos incluses, faire-part animé, plan de table, budget, RSVP complet, musique, livre d'or. Paiement unique, en euros.",
      "url": "https://kaatch.fr/pricing",
    },
  ],
}

export default function PricingPage() {
  const decouverteFeatures = [
    '1 mariage',
    '30 invités',
    '20 photos',
    'Accès 3 mois',
    'Programme du jour J',
    'Faire-part digital',
    'RSVP (oui/non, nombre de personnes)',
    '1 groupe de discussion',
    'Page accueil invités',
  ]

  const mariageFeatures = [
    'Invités sans limite',
    '200 photos incluses',
    'Faire-part animé personnalisé',
    'RSVP complet (allergies, +1, transport)',
    'Plan de table drag-and-drop',
    'Budget et prestataires',
    'Export & import Excel/CSV invités',
    'Musique / playlist par moment',
    'Livre d\'or',
    'Messagerie groupes sans limite',
    'Hébergements, surprises, contacts',
    'Téléchargement ZIP photos',
    'QR codes invités personnalisés',
  ]

  const premiumFeatures = [
    'Tout le plan Mariage',
    'Templates faire-part exclusifs',
    'Papeterie imprimable (menus, marque-places)',
    'Design sur-mesure',
    'Espace souvenir enrichi',
    'Support prioritaire',
  ]

  return (
    <main
      className="min-h-screen bg-[#f5f0e8]"
      style={{ fontFamily: LATO, fontWeight: 300, color: GREEN_DARK }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

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
            <a href="/#comment-ca-marche" className="text-sm text-stone-500 hover:text-[#4a5240] transition" style={{ fontWeight: 400 }}>
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

      {/* BANNIÈRE PRODUCT HUNT */}
      <div className="pt-16">
        <div className="bg-[#2d3228] text-white text-center py-3.5 px-6">
          <p style={{ fontFamily: LATO, fontWeight: 400, fontSize: '0.88rem' }}>
            🚀 <strong>Lancement Product Hunt</strong> — Code promo <span className="bg-white/15 px-2 py-0.5 rounded font-mono text-sm">KAATCH2026</span> : votre plan Mariage offert · Limité aux 100 premiers inscrits
          </p>
        </div>
      </div>

      {/* HEADER */}
      <section className="pt-16 pb-10 px-8 text-center">
        <p
          className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5"
          style={{ fontWeight: 500 }}
        >
          Tarifs
        </p>
        <h1
          style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
          className="text-[#2d3228] mb-5"
        >
          Simple. Transparent. Sans surprise.
        </h1>
        <p
          className="text-stone-500 max-w-lg mx-auto"
          style={{ fontSize: '1rem', lineHeight: 1.85 }}
        >
          Moins cher qu&apos;un bouquet de mariée — et ça remplace 12 groupes WhatsApp 💐
        </p>
        <p className="text-stone-400 mt-2" style={{ fontSize: '0.9rem' }}>
          45 en euros. Paiement unique. Sans abonnement, sans surprise.
        </p>
      </section>

      {/* CARDS */}
      <section className="pb-24 px-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 items-start">

          {/* Découverte */}
          <div
            className="bg-white rounded-2xl border border-stone-100 p-8 flex flex-col"
            style={{ boxShadow: SHADOW }}
          >
            <div className="mb-7">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1" style={{ fontWeight: 500 }}>
                Découverte
              </p>
              <p className="text-stone-400 text-xs mb-3" style={{ fontWeight: 300 }}>Pour commencer à organiser</p>
              <div className="flex items-end gap-1 mb-2">
                <span
                  style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '3rem', lineHeight: 1, letterSpacing: '-0.02em' }}
                  className="text-[#2d3228]"
                >
                  0
                </span>
              </div>
              <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>
                Inclus · Sans frais
              </p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-8">
              {decouverteFeatures.map(f => (
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
              Commencer
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
              <p className="text-xs tracking-widest uppercase text-white/70 mb-1" style={{ fontWeight: 500 }}>
                💍 Mariage
              </p>
              <p className="text-white/55 text-xs mb-3" style={{ fontWeight: 300 }}>Tout pour votre mariage</p>
              <div className="flex items-end gap-1 mb-2">
                <span
                  style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '3rem', lineHeight: 1, letterSpacing: '-0.02em' }}
                  className="text-white"
                >
                  45
                </span>
              </div>
              <p className="text-white/65 text-sm" style={{ fontWeight: 300 }}>
                Paiement unique · en euros
              </p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-8">
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

          {/* Premium */}
          <div
            className="bg-white rounded-2xl p-8 flex flex-col relative"
            style={{ boxShadow: SHADOW, border: '1.5px solid #c4a87c' }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span
                className="bg-[#c4a87c] text-white text-xs px-4 py-1.5 rounded-full whitespace-nowrap"
                style={{ fontWeight: 600 }}
              >
                Bientôt disponible
              </span>
            </div>

            <div className="mb-7">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1" style={{ fontWeight: 500 }}>
                👑 Premium
              </p>
              <p className="text-stone-400 text-xs mb-3" style={{ fontWeight: 300 }}>L&apos;expérience complète</p>
              <div className="flex items-end gap-1 mb-2">
                <span
                  style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '3rem', lineHeight: 1, letterSpacing: '-0.02em' }}
                  className="text-[#2d3228]"
                >
                  99
                </span>
              </div>
              <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>
                Paiement unique · en euros
              </p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {premiumFeatures.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-stone-500" style={{ fontWeight: 300 }}>
                  <span className="text-[#c4a87c] mt-0.5 shrink-0" style={{ fontWeight: 600 }}>🔜</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Notification email */}
            <p className="text-xs text-stone-400 mb-3" style={{ fontWeight: 300 }}>
              Être notifié(e) à l&apos;ouverture :
            </p>
            <form
              action="mailto:bonjour@kaatch.fr"
              method="get"
              encType="text/plain"
              className="flex gap-2"
            >
              <input
                type="email"
                name="subject"
                placeholder="votre@email.fr"
                className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-[#f5f0e8] text-stone-600 placeholder:text-stone-300 outline-none focus:border-[#c4a87c]"
                style={{ fontWeight: 300 }}
              />
              <button
                type="submit"
                className="text-sm bg-stone-100 text-stone-500 px-4 py-2.5 rounded-xl hover:bg-stone-200 transition shrink-0"
                style={{ fontWeight: 500 }}
              >
                Me notifier
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-stone-400" style={{ fontWeight: 300 }}>
          Plan Découverte inclus sans carte bleue · Paiement sécurisé · Accès immédiat · Votre mariage mérite mieux qu&apos;un tableur Excel 💚
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
            style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2 }}
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
              { label: 'CGV', href: '/cgv' },
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
            © 2026 Kaatch
          </p>
        </div>
      </footer>
    </main>
  )
}
