'use client'

import { useTranslations, useLocale } from 'next-intl'

const DISPLAY = 'var(--font-display)'
const LATO = 'var(--font-lato)'
const GREEN = '#4a5240'
const GREEN_DARK = '#2d3228'
const SHADOW = '0 4px 24px rgba(44,59,46,0.08), 0 1px 4px rgba(44,59,46,0.04)'

export default function PricingPage() {
  const t = useTranslations()
  const locale = useLocale()

  const decouverteFeatures = t.raw('pricing.discovery.features') as string[]
  const mariageFeatures = t.raw('pricing.wedding.features') as string[]
  const premiumFeatures = t.raw('pricing.premium.features') as string[]

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kaatch.fr'
  const localePrefix = locale === 'fr' ? '' : `/${locale}`

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": t('nav.tarifs') + " — Kaatch",
    "description": t('pricing.header.desc'),
    "url": `${baseUrl}${localePrefix}/pricing`,
    "brand": { "@type": "Brand", "name": "Kaatch" },
    "offers": [
      {
        "@type": "Offer",
        "name": t('pricing.discovery.label'),
        "price": t('pricing.discovery.price'),
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "description": t('pricing.discovery.subtitle'),
      },
      {
        "@type": "Offer",
        "name": t('pricing.wedding.label'),
        "price": t('pricing.wedding.price'),
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "description": t('pricing.wedding.subtitle'),
      },
    ],
  }

  return (
    <main
      className="min-h-screen bg-[#f5f0e8]"
      style={{ fontFamily: LATO, fontWeight: 300, color: GREEN_DARK }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-8 md:px-10 h-16 flex items-center justify-between">
          <a
            href={localePrefix ? localePrefix : '/'}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}
            className="text-[#2d3228]"
          >
            Kaatch
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href={`${localePrefix}/#comment-ca-marche`} className="text-sm text-stone-500 hover:text-[#4a5240] transition" style={{ fontWeight: 400 }}>
              {t('nav.commentCaMarche')}
            </a>
            <a href={`${localePrefix}/pricing`} className="text-sm text-[#4a5240] transition" style={{ fontWeight: 500 }}>
              {t('nav.tarifs')}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href={`${localePrefix}/auth`} className="text-sm text-stone-500 hover:text-[#2d3228] transition hidden sm:block" style={{ fontWeight: 400 }}>
              {t('nav.connexion')}
            </a>
            <a
              href={`${localePrefix}/dashboard`}
              className="text-sm bg-[#4a5240] text-white px-5 py-2.5 rounded-2xl hover:bg-[#2d3228] transition"
              style={{ fontWeight: 500 }}
            >
              {t('nav.monEspace')}
            </a>
          </div>
        </div>
      </nav>

      {/* BANNIÈRE PRODUCT HUNT */}
      <div className="pt-16">
        <div className="bg-[#2d3228] text-white text-center py-3.5 px-6">
          <p style={{ fontFamily: LATO, fontWeight: 400, fontSize: '0.88rem' }}>
            {t('pricing.banner')}
          </p>
        </div>
      </div>

      {/* HEADER */}
      <section className="pt-16 pb-10 px-8 text-center">
        <p
          className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5"
          style={{ fontWeight: 500 }}
        >
          {t('pricing.header.tagline')}
        </p>
        <h1
          style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
          className="text-[#2d3228] mb-5"
        >
          {t('pricing.header.title')}
        </h1>
        <p
          className="text-stone-500 max-w-lg mx-auto"
          style={{ fontSize: '1rem', lineHeight: 1.85 }}
        >
          {t('pricing.header.desc')}
        </p>
        <p className="text-stone-400 mt-2" style={{ fontSize: '0.9rem' }}>
          {t('pricing.header.footer')}
        </p>
      </section>

      {/* CARDS */}
      <section className="pb-24 px-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 items-start">

          {/* Découverte */}
          <div
            className="bg-white rounded-2xl border border-stone-100 p-8 flex flex-col"
            style={{ boxShadow: SHADOW }}
          >
            <div className="mb-7">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1" style={{ fontWeight: 500 }}>
                {t('pricing.discovery.label')}
              </p>
              <p className="text-stone-400 text-xs mb-3" style={{ fontWeight: 300 }}>
                {t('pricing.discovery.subtitle')}
              </p>
              <div className="flex items-end gap-1 mb-2">
                <span
                  style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '3rem', lineHeight: 1, letterSpacing: '-0.02em' }}
                  className="text-[#2d3228]"
                >
                  {t('pricing.discovery.price')}
                </span>
              </div>
              <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>
                {t('pricing.discovery.priceNote')}
              </p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-8">
              {decouverteFeatures.map((f: string) => (
                <li key={f} className="flex items-start gap-3 text-sm text-stone-600" style={{ fontWeight: 300 }}>
                  <span className="text-[#4a5240] mt-0.5 shrink-0" style={{ fontWeight: 600 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={`/${locale === 'fr' ? '' : locale}/auth`}
              className="w-full text-center border-2 border-stone-200 text-stone-500 px-6 py-3.5 rounded-2xl hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm"
              style={{ fontWeight: 500 }}
            >
              {t('pricing.discovery.cta')}
            </a>
          </div>

          {/* Mariage */}
          <div
            className="rounded-2xl p-8 flex flex-col relative"
            style={{ background: GREEN, boxShadow: '0 8px 40px rgba(74,82,64,0.25), 0 2px 8px rgba(74,82,64,0.12)' }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span
                className="bg-[#f5f0e8] text-[#4a5240] text-xs px-4 py-1.5 rounded-full whitespace-nowrap border border-[#4a5240]/20"
                style={{ fontWeight: 600 }}
              >
                {t('pricing.wedding.badge')}
              </span>
            </div>

            <div className="mb-7">
              <p className="text-xs tracking-widest uppercase text-white/70 mb-1" style={{ fontWeight: 500 }}>
                {t('pricing.wedding.label')}
              </p>
              <p className="text-white/55 text-xs mb-3" style={{ fontWeight: 300 }}>
                {t('pricing.wedding.subtitle')}
              </p>
              <div className="flex items-end gap-1 mb-2">
                <span
                  style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '3rem', lineHeight: 1, letterSpacing: '-0.02em' }}
                  className="text-white"
                >
                  {t('pricing.wedding.price')}
                </span>
              </div>
              <p className="text-white/65 text-sm" style={{ fontWeight: 300 }}>
                {t('pricing.wedding.priceNote')}
              </p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-8">
              {mariageFeatures.map((f: string) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/85" style={{ fontWeight: 300 }}>
                  <span className="text-white/80 mt-0.5 shrink-0" style={{ fontWeight: 600 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={`/${locale === 'fr' ? '' : locale}/auth`}
              className="w-full text-center bg-white text-[#4a5240] px-6 py-3.5 rounded-2xl hover:bg-[#f5f0e8] transition text-sm"
              style={{ fontWeight: 600 }}
            >
              {t('pricing.wedding.cta')}
            </a>
          </div>

          {/* Premium */}
          <div
            className="bg-white rounded-2xl p-8 flex flex-col relative"
            style={{ boxShadow: SHADOW, border: '1.5px solid #c4a87c' }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span
                className="bg-[#c4a87c] text-white text-xs px-4 py-1.5 rounded-full whitespace-nowrap"
                style={{ fontWeight: 600 }}
              >
                {t('pricing.premium.badge')}
              </span>
            </div>

            <div className="mb-7">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1" style={{ fontWeight: 500 }}>
                {t('pricing.premium.label')}
              </p>
              <p className="text-stone-400 text-xs mb-3" style={{ fontWeight: 300 }}>
                {t('pricing.premium.subtitle')}
              </p>
              <div className="flex items-end gap-1 mb-2">
                <span
                  style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '3rem', lineHeight: 1, letterSpacing: '-0.02em' }}
                  className="text-[#2d3228]"
                >
                  {t('pricing.premium.price')}
                </span>
              </div>
              <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>
                {t('pricing.premium.priceNote')}
              </p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {premiumFeatures.map((f: string) => (
                <li key={f} className="flex items-start gap-3 text-sm text-stone-500" style={{ fontWeight: 300 }}>
                  <span className="text-[#c4a87c] mt-0.5 shrink-0" style={{ fontWeight: 600 }}>🔜</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Notification email */}
            <p className="text-xs text-stone-400 mb-3" style={{ fontWeight: 300 }}>
              {t('pricing.premium.notifyLabel')}
            </p>
            <form
              action="mailto:bonjour@kaatch.fr"
              method="get"
              encType="text/plain"
              className="flex gap-2"
            >
              <input
                type="email"
                name="subject"
                placeholder={t('pricing.premium.notifyPlaceholder')}
                className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-[#f5f0e8] text-stone-600 placeholder:text-stone-300 outline-none focus:border-[#c4a87c]"
                style={{ fontWeight: 300 }}
              />
              <button
                type="submit"
                className="text-sm bg-stone-100 text-stone-500 px-4 py-2.5 rounded-xl hover:bg-stone-200 transition shrink-0"
                style={{ fontWeight: 500 }}
              >
                {t('pricing.premium.notifyBtn')}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-stone-400" style={{ fontWeight: 300 }}>
          {t('pricing.footer')}
        </p>
      </section>

      {/* QUESTIONS */}
      <section className="py-20 px-8 bg-white border-t border-stone-100">
        <div className="max-w-xl mx-auto text-center">
          <p
            className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-4"
            style={{ fontWeight: 500 }}
          >
            {t('pricing.questionsSection.tagline')}
          </p>
          <h2
            style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2 }}
            className="text-[#2d3228] mb-4"
          >
            {t('pricing.questionsSection.title')}
          </h2>
          <p className="text-stone-500 mb-8" style={{ fontSize: '0.95rem', lineHeight: 1.85 }}>
            {t('pricing.questionsSection.desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`/${locale === 'fr' ? '' : locale}/#contact`}
              className="inline-block border border-stone-200 text-stone-600 px-7 py-3 rounded-2xl hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm"
              style={{ fontWeight: 400 }}
            >
              {t('pricing.questionsSection.contactForm')}
            </a>
            <a
              href="mailto:bonjour@kaatch.fr"
              className="inline-block text-sm text-[#4a5240] hover:text-[#2d3228] transition px-7 py-3"
              style={{ fontWeight: 400 }}
            >
              {t('pricing.questionsSection.email')}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 py-10 px-8 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}
            className="text-stone-400"
          >
            Kaatch
          </span>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <a href={localePrefix ? localePrefix : '/'} className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
              {t('footer.linksBottom.0.label')}
            </a>
            <a href={`${localePrefix}/pricing`} className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
              {t('footer.linksBottom.1.label')}
            </a>
            <a href="/cgv" className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
              {t('footer.linksBottom.2.label')}
            </a>
            <a href="/rejoindre" className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
              {t('footer.linksBottom.3.label')}
            </a>
          </div>
          <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </main>
  )
}
