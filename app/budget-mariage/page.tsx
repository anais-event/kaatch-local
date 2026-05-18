import type { Metadata } from 'next'
import BudgetCalculator from './BudgetCalculator'

export const metadata: Metadata = {
  title: 'Calcul budget mariage 2026 : estimez le coût de votre mariage gratuitement',
  description:
    "Calculez le budget de votre mariage gratuitement. Estimation réaliste selon le nombre d'invités, la région et le niveau de gamme.",
  keywords:
    'calcul budget mariage, budget mariage 2026, estimateur mariage, coût mariage france, prix mariage',
  openGraph: {
    title: 'Calcul budget mariage 2026',
    description: 'Estimez le coût réel de votre mariage gratuitement',
    url: 'https://kaatch.fr/budget-mariage',
    type: 'website',
    images: [
      {
        url: 'https://kaatch.fr/og-budget-mariage.png',
        width: 1200,
        height: 630,
        alt: 'Calcul budget mariage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calcul budget mariage 2026',
    description: 'Estimez le coût réel de votre mariage gratuitement',
    images: ['https://kaatch.fr/og-budget-mariage.png'],
  },
}

export default function BudgetCalculatorPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#faf8f3] border-b border-stone-200 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-stone-800 mb-4" style={{ fontFamily: 'var(--font-lato)' }}>
            Calculez le budget de votre mariage
          </h1>
        </div>
      </div>

      {/* Calculator */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <BudgetCalculator />
      </div>

    </main>
  )
}
