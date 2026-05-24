import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import BudgetCalculator from './BudgetCalculator'
import PublicNav from '@/app/_components/PublicNav'
import messages from '@/messages/fr.json'

export const dynamic = 'force-dynamic'

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
    <NextIntlClientProvider locale="fr" messages={messages}>
    <main className="min-h-screen bg-[#f5f0e8]">
      <PublicNav active="budget-mariage" />

      {/* Header */}
      <div className="pt-24 pb-10 md:pt-28 md:pb-14 px-5 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p
            className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Simulateur budget
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
            Calculez le budget de votre mariage
          </h1>
          <p className="text-stone-500 max-w-xl" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '1rem' }}>
            Ajustez chaque poste selon vos envies. Téléchargez le PDF quand vous êtes prêts.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="mx-auto max-w-7xl px-5 md:px-10 pb-20">
        <BudgetCalculator />
      </div>
    </main>
    </NextIntlClientProvider>
  )
}
