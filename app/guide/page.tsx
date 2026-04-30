import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Guide — Kaatch | Rétro-planning mariage, RSVP, plan de table',
  description: 'Tout ce qu\'il faut savoir pour organiser son mariage avec Kaatch : rétro-planning, gestion des invités, faire-parts, plan de table et album photo partagé.',
  keywords: 'rétro-planning mariage, checklist mariage, organiser mariage, guide mariage',
}

const sections = [
  {
    emoji: '📅',
    title: '18 à 12 mois avant',
    slug: 'un-an-avant',
    items: [
      'Fixer la date et le lieu de la cérémonie',
      'Définir le budget global',
      'Choisir le type de mariage (civil, religieux, laïc…)',
      'Commencer la liste des invités',
      'Choisir ses témoins',
      'Visiter et réserver le lieu de réception',
      'Réserver le photographe',
      'Commencer à chercher la robe / le costume',
    ],
  },
  {
    emoji: '🌿',
    title: '12 à 9 mois avant',
    slug: 'neuf-mois-avant',
    items: [
      'Réserver le traiteur',
      'Réserver le DJ ou le groupe de musique',
      'Choisir le thème et les couleurs',
      'Ouvrir sa liste de mariage',
      'Réserver les hébergements pour les invités venant de loin',
      'Penser aux faire-parts',
      'Réserver le fleuriste',
    ],
  },
  {
    emoji: '💌',
    title: '9 à 6 mois avant',
    slug: 'six-mois-avant',
    items: [
      'Envoyer les faire-parts (ou save the date)',
      'Finaliser la liste des invités',
      'Organiser le plan de table',
      'Choisir le menu avec le traiteur',
      'Réserver le coiffeur et le maquilleur',
      'Choisir les alliances',
      'Penser au voyage de noces',
    ],
  },
  {
    emoji: '🎶',
    title: '6 à 3 mois avant',
    slug: 'trois-mois-avant',
    items: [
      'Créer l\'espace Kaatch — programme, invités, album 😉',
      'Finaliser les détails avec chaque prestataire',
      'Organiser les essayages de robe / costume',
      'Préparer la cérémonie laïque (si applicable)',
      'Choisir la musique pour chaque moment',
      'Planifier les animations et jeux',
      'Penser aux cadeaux pour les témoins et les parents',
    ],
  },
  {
    emoji: '🗓️',
    title: 'Le dernier mois',
    slug: 'dernier-mois',
    items: [
      'Confirmer les présences finales',
      'Finaliser le plan de table',
      'Préparer les enveloppes / paiements prestataires',
      'Répétition de la cérémonie',
      'Préparer le sac de survie du jour J (aiguilles, sparadraps, rouge à lèvres…)',
      'Envoyer le programme détaillé aux témoins',
      'Déléguer, déléguer, déléguer !',
    ],
  },
  {
    emoji: '✨',
    title: 'La semaine J',
    slug: 'semaine-j',
    items: [
      'Reconfirmer chaque prestataire',
      'Préparer les petits cadeaux et la décoration',
      'Dormir (si possible 😅)',
      'Prendre soin de soi',
      'Avoir le numéro de chaque prestataire sous la main',
      'Confier le planning du jour J à un témoin de confiance',
    ],
  },
]

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228' }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.4rem' }}
             className="text-[#2d3228]">Kaatch</a>
          <a href="/auth"
             className="text-sm bg-[#4a5240] text-white px-5 py-2 rounded-xl hover:bg-[#2d3228] transition"
             style={{ fontWeight: 300 }}>
            Créer mon espace →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-4" style={{ fontWeight: 300 }}>Guide pratique</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.15 }}
              className="text-[#2d3228] mb-5">
            Le guide des futurs mariés (un peu) débordés
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.9 }} className="text-stone-500 max-w-xl">
            Un mariage, ça se prépare sur des mois. Voici tout ce à quoi penser,
            dans l'ordre, pour ne rien oublier — et profiter de chaque étape.
          </p>
        </div>
      </section>

      {/* Sommaire */}
      <section className="px-6 pb-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 flex flex-wrap gap-3">
            {sections.map(s => (
              <a key={s.slug} href={`#${s.slug}`}
                 className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#4a5240] transition"
                 style={{ fontWeight: 300 }}>
                <span>{s.emoji}</span>{s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto space-y-12">
          {sections.map((section) => (
            <div key={section.slug} id={section.slug} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{section.emoji}</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.5rem' }}
                    className="text-[#2d3228]">
                  {section.title}
                </h2>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 divide-y divide-stone-50">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 px-5 py-3.5">
                    <span className="text-[#4a5240] mt-0.5 shrink-0 text-sm">✓</span>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }} className="text-stone-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white border-t border-stone-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2rem' }}
              className="text-[#2d3228] mb-4">
            Prêt à passer à l'action ?
          </h2>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.8 }} className="text-stone-500 mb-8">
            Kaatch centralise tout — invités, programme, photos, messagerie — pour que le jour J soit aussi beau que vous l'imaginez.
          </p>
          <a href="/auth"
             className="inline-block bg-[#4a5240] text-white px-10 py-3.5 rounded-xl hover:bg-[#2d3228] transition text-sm"
             style={{ fontWeight: 300 }}>
            Créer son espace gratuitement →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8 px-6 bg-[#f5f0e8] text-center">
        <a href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.3rem' }}
           className="text-stone-400">Kaatch</a>
      </footer>
    </main>
  )
}
