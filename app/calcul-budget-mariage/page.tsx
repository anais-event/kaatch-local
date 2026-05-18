import type { Metadata } from 'next'
import BudgetCalculator from './BudgetCalculator'

export const metadata: Metadata = {
  title: 'Simulateur de budget mariage gratuit | Calculez votre budget en 30s — Kaatch',
  description:
    "Combien va coûter votre mariage ? Notre simulateur gratuit calcule votre budget en fonction du nombre d'invités, de la région et du niveau de gamme. Estimation réaliste en 30 secondes.",
  keywords:
    'simulateur budget mariage, calculateur mariage, coût mariage, budget mariage france, calculateur cout mariage',
  openGraph: {
    title: 'Simulateur de budget mariage gratuit',
    description: 'Estimez le coût de votre mariage en 30 secondes',
    url: 'https://kaatch.fr/calcul-budget-mariage',
    type: 'website',
    images: [
      {
        url: 'https://kaatch.fr/og-calcul-budget-mariage.png',
        width: 1200,
        height: 630,
        alt: 'Simulateur de budget mariage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulateur de budget mariage gratuit',
    description: 'Estimez le coût de votre mariage en 30 secondes',
    images: ['https://kaatch.fr/og-calcul-budget-mariage.png'],
  },
}

export default function BudgetCalculatorPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#faf8f3] border-b border-stone-200 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-stone-800 mb-4" style={{ fontFamily: 'var(--font-lato)' }}>
            Simulateur de budget mariage
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl font-light">
            Estimez le coût de votre mariage en 30 secondes. Gratuit, sans inscription, basé sur les tarifs réels du marché français.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <BudgetCalculator />
      </div>

      {/* FAQ */}
      <div className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-stone-800 mb-12">Questions fréquentes</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                q: 'Comment ces chiffres sont-ils calculés ?',
                a: 'Nous avons analysé les tarifs réels pratiqués par les prestataires français (2024-2025). Chaque poste correspond à un coût moyen par invité ou coût fixe selon la gamme choisie.',
              },
              {
                q: 'Les prix varient vraiment autant selon la région ?',
                a: 'Oui. Paris et l\'Île-de-France sont 25% plus chers que la province. Les grandes villes et la Côte d\'Azur, +15%. Ces pourcentages sont appliqués à tous les postes.',
              },
              {
                q: 'Et les acomptes ? Les délais de paiement ?',
                a: 'Ce simulateur donne le coût total. Sur Kaatch, vous suivez les acomptes en temps réel : devis, versements, remboursements, soldes restants.',
              },
              {
                q: 'C\'est quoi inclus dans "Divers" ?',
                a: 'Faire-part, cadeaux invités, signalétique, remerciements, louer un parking... Les petits coûts qui s\'ajoutent.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-stone-50 p-6 rounded-xl">
                <h3 className="font-medium text-stone-800 mb-3">{faq.q}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
