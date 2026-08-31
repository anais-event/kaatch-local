import type { Metadata } from 'next'
import ChecklistMariage from '@/app/checklist-mariage/ChecklistMariage'
import PublicNav from '@/app/_components/PublicNav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Checklist mariage gratuite 2025 — Toutes les étapes | Kaatch',
  description: "Checklist mariage complète et gratuite : toutes les étapes mois par mois, de 18 mois avant à J+1. Cases cochées sauvegardées automatiquement. Sans inscription.",
  keywords: [
    'checklist mariage',
    'liste taches mariage',
    'planning mariage',
    'checklist mariage 2025',
    'to do list mariage',
    'organiser mariage',
    'etapes organisation mariage',
    'checklist mariage gratuite',
    'que faire avant mariage',
    'oublier mariage',
  ],
  openGraph: {
    title: 'Checklist mariage gratuite 2025 — Toutes les étapes | Kaatch',
    description: "Toutes les étapes pour organiser votre mariage, mois par mois. Gratuit, sans inscription, avec sauvegarde automatique.",
    url: 'https://kaatch.fr/checklist-mariage',
    type: 'website',
    images: [{ url: 'https://kaatch.fr/og-image.png', width: 1200, height: 630, alt: 'Checklist mariage — Kaatch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checklist mariage gratuite 2025',
    description: "Toutes les étapes mois par mois — gratuit, sans inscription.",
  },
  alternates: { canonical: 'https://kaatch.fr/checklist-mariage' },
}

const FAQ_ITEMS = [
  {
    q: "Quelle est la checklist complète pour organiser un mariage ?",
    a: "Une checklist mariage complète couvre toutes les étapes de J-18 mois à J+1 : fixer la date et réserver la salle (18 à 12 mois avant), choisir les prestataires clés — traiteur, photographe, DJ (12 à 9 mois), envoyer les save-the-dates et les faire-part (6 à 3 mois), gérer les RSVP et finaliser le plan de table (3 à 1 mois), préparer les détails de cérémonie et les discours (dernier mois), puis ranger les souvenirs et envoyer les remerciements après le mariage.",
  },
  {
    q: "Combien de temps faut-il pour organiser un mariage ?",
    a: "Idéalement 12 à 18 mois pour un mariage avec salle de réception, traiteur et photographe. Les lieux les plus demandés sont souvent réservés 18 à 24 mois à l'avance. Il est possible d'organiser un mariage en 6 mois si vous restez flexibles sur les prestataires et la date, mais le choix sera plus limité.",
  },
  {
    q: "Quelles sont les premières choses à faire quand on se fiance ?",
    a: "Les 4 priorités dans les premières semaines : (1) fixer la date en vérifiant la disponibilité des familles proches, (2) définir un budget global même approximatif, (3) faire la liste des invités (version réaliste), (4) réserver la date à la mairie pour la cérémonie civile. Ensuite, visitez au moins 3 salles de réception avant de signer.",
  },
  {
    q: "Peut-on personnaliser cette checklist avec ses propres tâches ?",
    a: "Oui — vous pouvez ajouter vos propres tâches personnalisées dans chaque section de la checklist. Elles sont sauvegardées automatiquement dans votre navigateur. Aucun compte requis.",
  },
  {
    q: "Comment ne rien oublier pour son mariage ?",
    a: "La méthode la plus efficace : travailler par phases temporelles (18 mois avant, 12 mois, 6 mois...) plutôt que par thème. Cochez au fur et à mesure et revenez régulièrement. Les détails souvent oublies : les tenues des témoins, la coordination des prestataires le jour J, les carnets pour le livre d'or, la disposition des cadeaux invités, et l'organisation du départ en fin de soirée.",
  },
  {
    q: "La checklist est-elle gratuite et sans inscription ?",
    a: "Oui, complètement gratuite et sans inscription. Vos cases cochées sont sauvegardées automatiquement dans votre navigateur (localStorage). Pour aller plus loin — gestion des invités, espace collaboratif avec votre partenaire, faire-part numériques — Kaatch propose un espace mariage complet, également gratuit.",
  },
]

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Checklist mariage Kaatch",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
      "description": "Checklist mariage complète et interactive — toutes les étapes mois par mois, de 18 mois avant à J+1. Cases cochées sauvegardées automatiquement.",
      "url": "https://kaatch.fr/checklist-mariage",
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "127" },
    },
    {
      "@type": "FAQPage",
      "mainEntity": FAQ_ITEMS.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": { "@type": "Answer", "text": item.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Kaatch", "item": "https://kaatch.fr" },
        { "@type": "ListItem", "position": 2, "name": "Outils gratuits", "item": "https://kaatch.fr/outils" },
        { "@type": "ListItem", "position": 3, "name": "Checklist mariage", "item": "https://kaatch.fr/checklist-mariage" },
      ],
    },
  ],
}

const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'

const OTHER_TOOLS = [
  { href: '/budget-mariage', emoji: '💰', label: 'Calculateur de budget', desc: 'Estimez le coût de votre mariage' },
  { href: '/plan-de-table-mariage', emoji: '🪑', label: 'Plan de table', desc: 'Glisser-déposer, export PDF' },
  { href: '/discours-mariage', emoji: '✨', label: 'Générateur de discours', desc: 'IA — témoin, vœux, parents' },
]

export default function ChecklistPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <PublicNav active="checklist-mariage" />

      {/* Outil interactif */}
      <ChecklistMariage />

      {/* Section SEO — contenu server-rendered */}
      <div className="px-5 md:px-10 pb-20" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="max-w-3xl mx-auto">

          {/* Intro SEO */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
            <h2
              className="text-[#2C3B2E] mb-3"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.01em' }}
            >
              La checklist mariage la plus complète — gratuite
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-3" style={{ fontWeight: 300 }}>
              Organiser un mariage, c&apos;est gérer des dizaines de prestataires, de délais et de détails en même temps — sans jamais avoir fait ça avant. Cette checklist couvre toutes les étapes de J-18 mois à J+1, avec les tâches qu&apos;on oublie toujours (les tenues des témoins, la coordination des prestataires le jour J, les remerciements après).
            </p>
            <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
              Chaque case cochée est sauvegardée automatiquement dans votre navigateur. Vous pouvez ajouter vos propres tâches. Aucune inscription requise.
            </p>
          </div>

          {/* FAQ */}
          <div className="mb-10">
            <h2
              className="text-[#2C3B2E] mb-5"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.01em' }}
            >
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map(item => (
                <div key={item.q} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <p className="text-stone-800 text-sm mb-2" style={{ fontWeight: 500 }}>{item.q}</p>
                  <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Autres outils */}
          <div className="mb-8">
            <p className="text-xs text-stone-400 mb-4 uppercase tracking-widest" style={{ fontWeight: 300 }}>
              Autres outils gratuits
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {OTHER_TOOLS.map(t => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group flex items-start gap-3 bg-white rounded-2xl border border-stone-100 shadow-sm p-4 hover:border-stone-300 transition-all"
                >
                  <span className="text-xl shrink-0">{t.emoji}</span>
                  <div>
                    <p className="text-stone-800 text-sm group-hover:underline" style={{ fontWeight: 500 }}>{t.label}</p>
                    <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>{t.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl p-7 text-center" style={{ background: SAGE_DARK }}>
            <p className="text-white text-xl mb-2" style={{ fontWeight: 300 }}>
              Et si tout était au même endroit ?
            </p>
            <p className="text-stone-300 text-sm mb-5 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              Kaatch centralise checklist, invités, photos, budget et messagerie avec un espace dédié pour vos invités. Gratuit.
            </p>
            <Link
              href="/auth"
              className="inline-block px-6 py-3 bg-white rounded-xl text-sm font-medium hover:bg-stone-100 transition"
              style={{ color: SAGE_DARK }}
            >
              Créer mon espace mariage →
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
