import type { Metadata } from 'next'
import PlanDeTable from '@/app/plan-de-table-mariage/PlanDeTable'
import PublicNav from '@/app/_components/PublicNav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Plan de table mariage gratuit — Glisser-déposer en ligne | Kaatch',
  description: "Créez votre plan de table mariage en ligne gratuitement. Ajoutez vos invités, créez vos tables, placez chacun par glisser-déposer. Sauvegarde automatique, export PDF. Sans inscription.",
  keywords: [
    'plan de table mariage',
    'plan de table mariage gratuit',
    'créer plan de table mariage',
    'logiciel plan de table mariage',
    'plan de table en ligne',
    'placement invités mariage',
    'tableau placement mariage',
    'plan de table mariage excel',
    'faire plan de table mariage',
  ],
  openGraph: {
    title: 'Plan de table mariage gratuit — Glisser-déposer | Kaatch',
    description: "Créez votre plan de table en ligne : ajoutez vos invités, créez vos tables, glissez-déposez. Gratuit, sans inscription.",
    url: 'https://kaatch.fr/plan-de-table-mariage',
    type: 'website',
    images: [{ url: 'https://kaatch.fr/og-image.png', width: 1200, height: 630, alt: 'Plan de table mariage — Kaatch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan de table mariage gratuit',
    description: "Glisser-déposer, sauvegarde auto, export PDF. Gratuit, sans inscription.",
  },
  alternates: { canonical: 'https://kaatch.fr/plan-de-table-mariage' },
}

const FAQ_ITEMS = [
  {
    q: "Comment faire le plan de table d'un mariage ?",
    a: "La méthode en 4 étapes : (1) listez tous vos invités avec leur table d'affinités, (2) définissez le nombre et la capacité de vos tables, (3) placez les invités en commençant par les familles proches et les personnes avec contraintes (mobilité, régimes), (4) relisez pour équilibrer l'ambiance de chaque table. Évitez de mettre tous vos amis proches ensemble — mélangez légèrement pour que chaque table soit animée.",
  },
  {
    q: "Dans quel ordre placer les tables à un mariage ?",
    a: "La table des mariés (souvent une table d'honneur allongée ou ronde centrale) est au centre ou face à la salle. Autour : les familles proches des deux côtés, puis les amis, puis les collègues et connaissances. Les enfants sont souvent regroupés à une table avec vue dégagée pour les parents. Il n'y a pas de règle absolue — l'important est que chaque convive se sente bien placé.",
  },
  {
    q: "Comment gérer les conflits familiaux dans le plan de table ?",
    a: "Placez les groupes incompatibles aux extrémités opposées de la salle. Mettez entre eux un tampon de tables neutres (amis, collègues). Évitez les longues tables qui mettent tout le monde en face à face. Si la tension est forte, confiez la gestion de l'entrée en salle à un témoin qui peut gérer les incidents sans vous solliciter.",
  },
  {
    q: "Combien d'invités par table à un mariage ?",
    a: "La configuration classique : 8 à 10 personnes pour une table ronde, 6 à 8 pour une table rectangulaire. En dessous de 6, une table peut paraître vide et l'ambiance est difficile à lancer. Au-dessus de 12, les conversations deviennent difficiles d'un bout à l'autre. Pour les enfants, prévoyez 6 à 8 places maximum par table et assurez-vous qu'elle est visible depuis les tables des parents.",
  },
  {
    q: "Peut-on modifier le plan de table après l'avoir créé ?",
    a: "Oui, à tout moment. L'outil sauvegarde automatiquement chaque modification. Vous pouvez déplacer des invités d'une table à une autre par glisser-déposer, ajouter ou supprimer des tables, et exporter le plan en PDF à n'importe quel moment.",
  },
  {
    q: "Le plan de table est-il gratuit et sans inscription ?",
    a: "Entièrement gratuit, sans inscription. Vos données (invités, tables, placements) sont sauvegardées dans votre navigateur. Pour collaborer avec votre partenaire en temps réel et partager le plan avec votre wedding planner, Kaatch propose un espace mariage complet et gratuit.",
  },
]

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Plan de table mariage Kaatch",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
      "description": "Outil plan de table mariage en ligne — ajoutez vos invités, créez vos tables, placez chacun par glisser-déposer. Sauvegarde automatique, export PDF.",
      "url": "https://kaatch.fr/plan-de-table-mariage",
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "89" },
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
        { "@type": "ListItem", "position": 3, "name": "Plan de table mariage", "item": "https://kaatch.fr/plan-de-table-mariage" },
      ],
    },
  ],
}

const SAGE_DARK = '#2d3228'

const OTHER_TOOLS = [
  { href: '/checklist-mariage', emoji: '✅', label: 'Checklist mariage', desc: 'Toutes les étapes mois par mois' },
  { href: '/budget-mariage', emoji: '💰', label: 'Calculateur de budget', desc: 'Estimez le coût de votre mariage' },
  { href: '/discours-mariage', emoji: '✨', label: 'Générateur de discours', desc: 'IA — témoin, vœux, parents' },
]

export default function PlanDeTablePage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <PublicNav active="plan-de-table-mariage" />

      {/* Outil interactif */}
      <PlanDeTable />

      {/* Section SEO — contenu server-rendered */}
      <div className="px-5 md:px-10 pb-20" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="max-w-3xl mx-auto">

          {/* Intro SEO */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
            <h2
              className="text-[#2C3B2E] mb-3"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.01em' }}
            >
              Créez votre plan de table mariage en ligne — gratuit
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-3" style={{ fontWeight: 300 }}>
              Plus de fichiers Excel à la main, de post-its sur la table du salon ou de fichiers Google Sheets partagés en lecture seule. Cet outil vous permet d&apos;ajouter vos invités, de créer vos tables (rondes ou rectangulaires) et de placer chacun par glisser-déposer.
            </p>
            <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
              Tout est sauvegardé automatiquement. Exportez le plan en PDF pour l&apos;imprimer ou le partager avec votre traiteur. Sans inscription.
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
              Gérez vos invités et votre plan en un seul endroit
            </p>
            <p className="text-stone-300 text-sm mb-5 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              Kaatch synchronise votre liste d&apos;invités et votre plan de table — avec RSVP, régimes alimentaires et espace invité. Gratuit.
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
