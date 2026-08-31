import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import BudgetCalculator from '@/app/budget-mariage/BudgetCalculator'
import PublicNav from '@/app/_components/PublicNav'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('budget.meta')
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: 'https://kaatch.fr/budget-mariage',
      type: 'website',
      images: [
        {
          url: 'https://kaatch.fr/og-budget-mariage.png',
          width: 1200,
          height: 630,
          alt: t('ogTitle'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['https://kaatch.fr/og-budget-mariage.png'],
    },
  }
}

const FAQ_ITEMS = [
  {
    q: "Quel est le budget moyen d'un mariage en France en 2025 ?",
    a: "Le budget moyen d'un mariage en France est d'environ 12 000 à 15 000 € pour 80 invités, soit 150 à 200 € par personne. Il varie fortement selon la région (Paris et Île-de-France coûtent 30 à 50 % plus cher que la province), la saison (samedis de juin à septembre majorent les tarifs) et le niveau de prestation choisi. Un mariage intimiste de 30 personnes peut se faire à partir de 5 000 €, tandis qu'un grand mariage de 150 invités avec traiteur haut de gamme peut dépasser 30 000 €.",
  },
  {
    q: "Quels sont les postes de dépenses les plus importants d'un mariage ?",
    a: "Les 4 postes qui représentent 70 à 80 % du budget total : (1) le traiteur — 35 à 45 % du budget total, soit 80 à 150 € par personne selon le niveau, (2) la salle de réception — 1 500 à 8 000 € selon la région et la capacité, (3) la photographie/vidéo — 1 500 à 4 000 € pour un photographe professionnel, (4) la musique — 800 à 3 000 € pour un DJ, davantage pour un groupe live. Le reste se répartit entre robe, tenues, décoration, faire-part et voyage de noces.",
  },
  {
    q: "Comment réduire le budget de son mariage sans sacrifier l'essentiel ?",
    a: "5 leviers efficaces : (1) choisir une date hors saison (novembre à mars) ou un vendredi — les tarifs des prestataires baissent de 20 à 40 %, (2) réduire la liste des invités — chaque invité en moins économise 150 à 200 € en moyenne, (3) privilégier un buffet plutôt qu'un repas servi à table, (4) faire appel à un photographe émergent avec un beau portfolio plutôt qu'un photographe établi, (5) acheter la robe en stock ou d'occasion.",
  },
  {
    q: "Comment gérer le budget mariage à deux sans se disputer ?",
    a: "Définissez d'abord un budget global non négociable, puis listez les priorités de chacun. Chacun a 2-3 postes 'intouchables' — allouez-y le budget sans rogner. Pour le reste, cherchez les économies ensemble. Tenez un tableau partagé avec les devis, les montants engagés et ce qui reste à payer. Recalculez le total disponible à chaque nouveau devis signé.",
  },
  {
    q: "Faut-il prévoir un budget de réserve pour le mariage ?",
    a: "Oui — prévoyez systématiquement 10 à 15 % de marge sur votre budget total pour les imprévus : extras au traiteur, pourboires, transport de dernière minute, alterations de robe supplémentaires, fleurs pour les tables oubliées. Cette réserve évite le stress financier dans les dernières semaines quand les dépenses s'accélèrent.",
  },
  {
    q: "Le calculateur de budget mariage est-il gratuit ?",
    a: "Oui, entièrement gratuit et sans inscription. Le calculateur prend en compte votre région, le nombre d'invités et le niveau de prestation souhaité pour chaque poste. Vous pouvez exporter l'estimation en PDF. Pour un suivi complet avec historique et partage avec votre partenaire, Kaatch propose un espace mariage gratuit.",
  },
]

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Calculateur de budget mariage Kaatch",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
      "description": "Calculateur de budget mariage gratuit — estimez le coût de votre mariage selon votre région, nombre d'invités et niveau de prestation. Export PDF inclus.",
      "url": "https://kaatch.fr/budget-mariage",
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "341" },
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
        { "@type": "ListItem", "position": 3, "name": "Calculateur de budget mariage", "item": "https://kaatch.fr/budget-mariage" },
      ],
    },
  ],
}

const SAGE_DARK = '#2d3228'

const OTHER_TOOLS = [
  { href: '/checklist-mariage', emoji: '✅', label: 'Checklist mariage', desc: 'Toutes les étapes mois par mois' },
  { href: '/plan-de-table-mariage', emoji: '🪑', label: 'Plan de table', desc: 'Glisser-déposer, export PDF' },
  { href: '/discours-mariage', emoji: '✨', label: 'Générateur de discours', desc: 'IA — témoin, vœux, parents' },
]

export default async function BudgetCalculatorPage() {
  const t = await getTranslations('budget.page')

  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <PublicNav active="budget-mariage" />

      {/* Header */}
      <div className="pt-24 pb-10 md:pt-28 md:pb-14 px-5 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p
            className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            {t('tagline')}
          </p>
          <h1
            className="text-[#2C3B2E] mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {t('title')}
          </h1>
          <p className="text-stone-500 max-w-xl" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '1rem' }}>
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="mx-auto max-w-7xl px-5 md:px-10 pb-10">
        <BudgetCalculator />
      </div>

      {/* Section SEO — contenu server-rendered */}
      <div className="px-5 md:px-10 pb-20" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="max-w-3xl mx-auto">

          {/* Intro SEO */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
            <h2
              className="text-[#2C3B2E] mb-3"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.01em' }}
            >
              Estimez le coût réel de votre mariage
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-3" style={{ fontWeight: 300 }}>
              Chaque mariage est différent — la région, le nombre d&apos;invités, le niveau de prestation et la saison font varier le budget du simple au triple. Ce calculateur prend tous ces paramètres en compte pour vous donner une estimation réaliste, poste par poste.
            </p>
            <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
              Activez ou désactivez chaque poste selon votre projet. Exportez l&apos;estimation en PDF pour la partager avec votre partenaire ou votre wedding planner. Sans inscription.
            </p>
          </div>

          {/* FAQ */}
          <div className="mb-10">
            <h2
              className="text-[#2C3B2E] mb-5"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.01em' }}
            >
              Questions fréquentes sur le budget mariage
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
              Suivez votre budget en temps réel
            </p>
            <p className="text-stone-300 text-sm mb-5 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              Kaatch inclut un suivi de budget complet — avec devis, factures, acomptes et soldes restants — intégré à votre espace mariage. Gratuit.
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
