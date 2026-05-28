import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import BudgetCalculator from '@/app/budget-mariage/BudgetCalculator'
import PublicNav from '@/app/_components/PublicNav'

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

export default async function BudgetCalculatorPage() {
  const t = await getTranslations('budget.page')

  return (
    <main className="min-h-screen bg-[#f5f0e8]">
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
      <div className="mx-auto max-w-7xl px-5 md:px-10 pb-20">
        <BudgetCalculator />
      </div>
    </main>
  )
}
