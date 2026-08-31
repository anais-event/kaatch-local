import type { Metadata } from 'next'
import GenerateurDiscours from '@/app/discours-mariage/GenerateurDiscours'
import PublicNav from '@/app/_components/PublicNav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Générateur de discours mariage gratuit — IA | Kaatch',
  description: "Générez un discours de mariage personnalisé en quelques secondes grâce à l'IA. Témoin, parents, vœux des mariés — structure, points clés ou discours complet. Gratuit, sans inscription.",
  keywords: [
    'discours mariage',
    'discours témoin mariage',
    'discours témoin mariage original',
    'voeux mariage originaux',
    'discours parents mariage',
    'générateur discours mariage',
    'exemple discours mariage',
    'discours mariage humoristique',
    'discours mariage émouvant',
    'comment écrire discours mariage',
    'discours témoin humour',
  ],
  openGraph: {
    title: 'Générateur de discours mariage — IA gratuite | Kaatch',
    description: "Créez votre discours de mariage en quelques secondes. Témoin, vœux, parents — personnalisé, éditable, export PDF.",
    url: 'https://kaatch.fr/discours-mariage',
    type: 'website',
    images: [{ url: 'https://kaatch.fr/og-image.png', width: 1200, height: 630, alt: 'Générateur de discours mariage — Kaatch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Générateur de discours mariage gratuit — IA',
    description: "Discours témoin, vœux, parents — généré en direct, éditable, sans inscription.",
  },
  alternates: { canonical: 'https://kaatch.fr/discours-mariage' },
}

const FAQ_ITEMS = [
  {
    q: "Comment écrire un discours de mariage original et émouvant ?",
    a: "Un bon discours de mariage repose sur 3 piliers : (1) une ouverture originale — évitez absolument 'En ce jour si spécial' ou 'Nous sommes réunis aujourd'hui', (2) une ou deux anecdotes vraiment personnelles qui révèlent quelque chose de touchant sur les mariés, (3) une conclusion avec toast mémorable qui les nomme directement. Parlez à la première personne, restez authentique, et relisez à voix haute avant le jour J.",
  },
  {
    q: "Combien de temps doit durer un discours de mariage ?",
    a: "La durée idéale dépend du rôle : 2 à 3 minutes pour un toast ou remerciements (300-400 mots), 4 à 6 minutes pour un discours de témoin (600-800 mots), 8 à 12 minutes pour un discours des parents ou des vœux complets (1000-1500 mots). Au-delà de 10 minutes, même le meilleur discours perd son audience. Mieux vaut un discours court et mémorable qu'un long et dilué.",
  },
  {
    q: "Que dire dans un discours de témoin de mariage ?",
    a: "Structure recommandée pour un discours de témoin : ouverture originale (comment vous vous êtes rencontré·e·s avec le marié/la mariée), 1-2 anecdotes révélatrices sur la personne, l'histoire du couple vue de votre côté, ce que vous admirez dans leur relation, un message à l'autre moitié du couple, et un toast final. Évitez les histoires trop embarrassantes et les références à des ex.",
  },
  {
    q: "Discours de mariage humour ou émotion — lequel choisir ?",
    a: "Les meilleurs discours alternent les deux. Commencez par une accroche légère pour détendre l'assistance, glissez vers l'émotion au milieu quand vous parlez de ce que vous admirez dans le couple, revenez à une note légère juste avant le toast pour finir sur une énergie positive. L'humour pur peut sembler léger, l'émotion pure peut être épuisant sur la durée — l'équilibre est ce qui reste en mémoire.",
  },
  {
    q: "Comment personnaliser un discours généré par IA ?",
    a: "Le générateur produit une base de qualité — la structure, le ton et les transitions. Personnalisez ensuite les passages entre crochets [TON ANECDOTE ICI] avec vos souvenirs réels. Ajoutez les prénoms, les lieux, les détails qui vous appartiennent. Lisez-le à voix haute : si une phrase ne vous ressemble pas, reformulez-la dans vos mots. L'authenticité vient de vous, pas de l'IA.",
  },
  {
    q: "Le générateur de discours mariage est-il vraiment gratuit ?",
    a: "Oui, entièrement gratuit et sans inscription. L'IA génère le discours en temps réel directement dans votre navigateur. Vous pouvez éditer le texte, l'exporter en PDF et le réutiliser autant de fois que vous voulez.",
  },
]

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Générateur de discours mariage Kaatch",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
      "description": "Génération de discours mariage par IA — témoin, vœux, parents, toast. Structure, points clés ou discours complet. Éditable, export PDF.",
      "url": "https://kaatch.fr/discours-mariage",
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "203" },
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
        { "@type": "ListItem", "position": 3, "name": "Générateur de discours mariage", "item": "https://kaatch.fr/discours-mariage" },
      ],
    },
  ],
}

const SAGE_DARK = '#2d3228'

const OTHER_TOOLS = [
  { href: '/checklist-mariage', emoji: '✅', label: 'Checklist mariage', desc: 'Toutes les étapes mois par mois' },
  { href: '/budget-mariage', emoji: '💰', label: 'Calculateur de budget', desc: 'Estimez le coût de votre mariage' },
  { href: '/plan-de-table-mariage', emoji: '🪑', label: 'Plan de table', desc: 'Glisser-déposer, export PDF' },
]

export default function DiscoursPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <PublicNav active="discours-mariage" />

      {/* Outil interactif */}
      <GenerateurDiscours />

      {/* Section SEO — contenu server-rendered */}
      <div className="px-5 md:px-10 pb-20" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="max-w-3xl mx-auto">

          {/* Intro SEO */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
            <h2
              className="text-[#2C3B2E] mb-3"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.01em' }}
            >
              L&apos;IA qui génère des discours de mariage authentiques
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-3" style={{ fontWeight: 300 }}>
              Témoin sans inspiration, parents qui cherchent leurs mots, mariés qui veulent des vœux originaux — le générateur produit un discours complet en quelques secondes, adapté à votre rôle, votre ton et la durée souhaitée.
            </p>
            <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
              Trois niveaux de détail : structure pour vous guider, points clés semi-rédigés, ou discours complet prêt à lire à voix haute. Chaque discours est éditable et exportable en PDF.
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
              Bien plus qu&apos;un générateur de discours
            </p>
            <p className="text-stone-300 text-sm mb-5 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              Kaatch centralise tout l&apos;organisation du mariage : invités, photos, programme, budget, messagerie — avec un espace dédié pour vos invités. Gratuit.
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
