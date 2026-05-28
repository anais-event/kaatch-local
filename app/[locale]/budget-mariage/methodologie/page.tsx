import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import PublicNav from '@/app/_components/PublicNav'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('budget')
  return {
    title: t('meta.methoTitle'),
    description: t('meta.methoDescription'),
    keywords: t('methodologie.methoKeywords'),
  }
}

export default async function MethodologiePage() {
  const t = await getTranslations('budget.methodologie')

  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <PublicNav active="budget-mariage" />

      {/* Header */}
      <div className="pt-24 pb-10 md:pt-28 md:pb-14 px-5 md:px-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/budget-mariage" className="text-sm text-stone-600 hover:text-stone-800 mb-6 inline-block">
            {t('back')}
          </Link>
          <h1 className="text-[#2C3B2E] mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            {t('title')}
          </h1>
          <p className="text-stone-500 max-w-xl" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '1rem' }}>
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <article className="space-y-12">
          {/* Intro */}
          <section className="space-y-4 bg-white border border-stone-100 rounded-2xl p-6">
            <p className="text-stone-700 text-lg leading-relaxed">{t('introP1')}</p>
            <p className="text-stone-700 leading-relaxed">{t('introP2')}</p>
          </section>

          {/* 3 sources */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">{t('sourcesTitle')}</h3>
            <p className="text-stone-700">{t('sourcesIntro')}</p>

            <div className="space-y-6">
              <div className="bg-white border border-stone-100 rounded-xl p-6">
                <h4 className="font-medium text-stone-800 mb-3 text-lg">{t('source1Title')}</h4>
                <p className="text-stone-700 text-sm mb-3">{t('source1Intro')}</p>
                <ul className="space-y-2 text-stone-700 text-sm">
                  <li>{t('source1Item1')}</li>
                  <li>{t('source1Item2')}</li>
                  <li>{t('source1Item3')}</li>
                </ul>
              </div>

              <div className="bg-white border border-stone-100 rounded-xl p-6">
                <h4 className="font-medium text-stone-800 mb-3 text-lg">{t('source2Title')}</h4>
                <p className="text-stone-700 text-sm mb-4">{t('source2Intro')}</p>
                <ul className="space-y-1 text-stone-700 text-sm list-disc list-inside">
                  <li>{t('source2Item1')}</li>
                  <li>{t('source2Item2')}</li>
                  <li>{t('source2Item3')}</li>
                  <li>{t('source2Item4')}</li>
                  <li>{t('source2Item5')}</li>
                </ul>
                <p className="text-stone-700 text-sm mt-4 italic">{t('source2Note')}</p>
              </div>

              <div className="bg-white border border-stone-100 rounded-xl p-6">
                <h4 className="font-medium text-stone-800 mb-3 text-lg">{t('source3Title')}</h4>
                <p className="text-stone-700 text-sm">{t('source3Text')}</p>
              </div>
            </div>
          </section>

          {/* Architecture */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">{t('calcTitle')}</h3>
            <p className="text-stone-700">{t('calcIntro')}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="text-left py-3 px-4 font-medium text-stone-800 border-b border-stone-200">{t('tierHeader')}</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-800 border-b border-stone-200">{t('tierMeaning')}</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-800 border-b border-stone-200">{t('tierExample')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-3 px-4 text-stone-700 font-medium">{t('tierEcoName')}</td>
                    <td className="py-3 px-4 text-stone-700">{t('tierEcoMeaning')}</td>
                    <td className="py-3 px-4 text-stone-700">{t('tierEcoExample')}</td>
                  </tr>
                  <tr className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-3 px-4 text-stone-700 font-medium">{t('tierClassiqueName')}</td>
                    <td className="py-3 px-4 text-stone-700">{t('tierClassiqueMeaning')}</td>
                    <td className="py-3 px-4 text-stone-700">{t('tierClassiqueExample')}</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-3 px-4 text-stone-700 font-medium">{t('tierPremiumName')}</td>
                    <td className="py-3 px-4 text-stone-700">{t('tierPremiumMeaning')}</td>
                    <td className="py-3 px-4 text-stone-700">{t('tierPremiumExample')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-stone-700">{t('calcNote')}</p>

            <div className="bg-white border border-stone-100 rounded-xl p-6 space-y-4 mt-6">
              <h4 className="font-medium text-stone-800 text-lg">{t('featuresTitle')}</h4>
              <ul className="space-y-2 text-stone-700 text-sm list-disc list-inside">
                <li>{t('feature1')}</li>
                <li>{t('feature2')}</li>
                <li>{t('feature3')}</li>
                <li>{t('feature4')}</li>
                <li>{t('feature5')}</li>
                <li>{t('feature6')}</li>
                <li>{t('feature7')}</li>
              </ul>
            </div>
          </section>

          {/* Régions */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">{t('regionsTitle')}</h3>
            <p className="text-stone-700">{t('regionsIntro')}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-stone-100 rounded-lg p-4">
                <p className="text-stone-700 font-medium">{t('regionIDF')}</p>
                <p className="text-2xl font-light text-[#4a5240] mt-1">{t('regionIDF_pct')}</p>
                <p className="text-stone-600 text-sm mt-2">{t('regionIDF_note')}</p>
              </div>
              <div className="bg-white border border-stone-100 rounded-lg p-4">
                <p className="text-stone-700 font-medium">{t('regionProvence')}</p>
                <p className="text-2xl font-light text-[#4a5240] mt-1">{t('regionProvence_pct')}</p>
                <p className="text-stone-600 text-sm mt-2">{t('regionProvence_note')}</p>
              </div>
              <div className="bg-white border border-stone-100 rounded-lg p-4">
                <p className="text-stone-700 font-medium">{t('regionMetro')}</p>
                <p className="text-2xl font-light text-[#4a5240] mt-1">{t('regionMetro_pct')}</p>
                <p className="text-stone-600 text-sm mt-2">{t('regionMetro_note')}</p>
              </div>
              <div className="bg-white border border-stone-100 rounded-lg p-4">
                <p className="text-stone-700 font-medium">{t('regionRural')}</p>
                <p className="text-2xl font-light text-[#4a5240] mt-1">{t('regionRural_pct')}</p>
                <p className="text-stone-600 text-sm mt-2">{t('regionRural_note')}</p>
              </div>
            </div>

            <p className="text-stone-700 mt-4">{t('regionsNote')}</p>
          </section>

          {/* Updates */}
          <section className="space-y-6 bg-white border border-stone-100 rounded-xl p-6">
            <h3 className="text-2xl font-light text-stone-800">{t('updatesTitle')}</h3>
            <p className="text-stone-700 font-medium">{t('updatesFreq')}</p>
            <p className="text-stone-700">{t('updatesText')}</p>
            <p className="text-stone-700 text-sm text-stone-500 mt-4"><em>{t('lastUpdate')}</em></p>
          </section>

          {/* Limites */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">{t('limitsTitle')}</h3>
            <p className="text-stone-700"><strong>{t('limitsIntro')}</strong></p>

            <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 space-y-4">
              <p className="font-medium text-stone-800">{t('limitsWhy')}</p>
              <ul className="space-y-2 text-stone-700 list-disc list-inside">
                <li>{t('limit1')}</li>
                <li>{t('limit2')}</li>
                <li>{t('limit3')}</li>
                <li>{t('limit4')}</li>
                <li>{t('limit5')}</li>
              </ul>
            </div>

            <p className="text-stone-700 font-medium">{t('limitsConclusion')}</p>
          </section>

          {/* Pourquoi gratuit */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">{t('whyFreeTitle')}</h3>
            <p className="text-stone-700">
              {t('whyFreeP1')}{' '}
              <Link href="/" className="text-[#4a5240] hover:underline font-medium">{t('whyFreeLink')}</Link>
            </p>
            <p className="text-stone-700">{t('whyFreeP2')}</p>
          </section>

          {/* Feedback */}
          <section className="space-y-6 bg-white border border-stone-100 rounded-xl p-6">
            <h3 className="text-2xl font-light text-stone-800">{t('feedbackTitle')}</h3>
            <p className="text-stone-700">{t('feedbackP1')}</p>
            <p className="text-stone-700">{t('feedbackP2')}</p>
            <p className="text-stone-700 text-sm mt-3">{t('feedbackP3')}</p>
          </section>

          {/* Footer */}
          <div className="pt-12 border-t border-stone-200">
            <p className="text-stone-600 text-sm"><em>{t('lastUpdate')}</em></p>
            <div className="mt-8 flex gap-4 flex-wrap">
              <Link href="/budget-mariage" className="px-6 py-3 bg-[#4a5240] text-white rounded-lg font-medium hover:bg-[#2d3228] transition-colors">
                {t('goToCalculator')}
              </Link>
              <Link href="/dashboard" className="px-6 py-3 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition-colors">
                {t('goToKaatch')}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
