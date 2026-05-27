'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import ScrollReveal from '../../_components/ScrollReveal'
import FeatureTicker from '../../_components/FeatureTicker'
import PublicNav from '../../_components/PublicNav'
import ContactForm from '../../_components/ContactForm'

const DISPLAY = 'var(--font-display)'
const SHADOW = '0 4px 24px rgba(44,59,46,0.08), 0 1px 4px rgba(44,59,46,0.04)'

function FAQ({ t }: { t: any }) {
  const items = [
    { q: t('landing.faq.items.0.q'), a: t('landing.faq.items.0.a') },
    { q: t('landing.faq.items.1.q'), a: t('landing.faq.items.1.a') },
    { q: t('landing.faq.items.2.q'), a: t('landing.faq.items.2.a') },
    { q: t('landing.faq.items.3.q'), a: t('landing.faq.items.3.a') },
    { q: t('landing.faq.items.4.q'), a: t('landing.faq.items.4.a') },
  ]

  return (
    <section className="py-28 px-10 bg-white border-t border-stone-100">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>
          {t('landing.faq.tagline')}
        </p>
        <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
            className="text-[#2C3B2E] mb-12">
          {t('landing.faq.title')}
        </h2>
        <div className="divide-y divide-stone-100">
          {items.map((item, i) => (
            <details key={i} className="group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between gap-4 list-none" style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.95rem', color: '#2C3B2E' }}>
                {item.q}
                <span className="shrink-0 w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 group-open:rotate-45 transition-transform text-xs">+</span>
              </summary>
              <p className="mt-3 text-stone-500 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function LandingClient() {
  const t = useTranslations()

  return (
    <>
      <PublicNav />

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-8 md:px-10 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>
              {t('landing.hero.tagline')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#2d3228] mb-6">
              {t('landing.hero.title')}
              <span style={{ fontStyle: 'italic' }} className="text-[#4a5240]"> {t('landing.hero.titleAccent')}</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-stone-600 max-w-2xl mb-8" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
              {t('landing.hero.body1')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <p className="text-stone-500 max-w-2xl mb-12" style={{ fontSize: '1rem', lineHeight: 1.8 }}>
              {t('landing.hero.body2')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 max-w-sm">
              <a href="/auth" className="text-center bg-[#4a5240] text-white px-8 py-4 rounded-2xl hover:bg-[#2d3228] transition text-sm" style={{ fontWeight: 500 }}>
                {t('landing.hero.ctaSignup')}
              </a>
              <a href="/p/rejoindre" className="text-center border-2 border-[#4a5240] text-[#4a5240] px-8 py-4 rounded-2xl hover:bg-[#4a5240]/5 transition text-sm" style={{ fontWeight: 500 }}>
                {t('landing.hero.ctaGuest')}
              </a>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.5}>
            <div className="flex items-center gap-2.5 mt-6">
              <span className="text-[#2C3B2E]" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.1rem' }}>4.9/5</span>
              <span className="flex gap-0.5 text-amber-400" style={{ fontSize: '1rem' }}>{'★★★★★'}</span>
              <span className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>{t('landing.hero.ratedBy')}</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WHY KAATCH */}
      <section className="py-24 px-8 md:px-10 bg-white border-t border-stone-100">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>
              {t('landing.whyKaatch.tagline')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#2d3228] mb-6 max-w-3xl">
              {t('landing.whyKaatch.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-stone-500 max-w-2xl mb-10" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
              {t('landing.whyKaatch.intro')}
            </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
            <ScrollReveal delay={0.3}>
              <div>
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.3rem', color: '#4a5240' }} className="mb-2">
                  {t('landing.whyKaatch.goodCatch')}
                </p>
                <p className="text-stone-600" style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
                  {t('landing.whyKaatch.goodCatchDesc')}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <div>
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.3rem', color: '#4a5240' }} className="mb-2">
                  {t('landing.whyKaatch.catchUp')}
                </p>
                <p className="text-stone-600" style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
                  {t('landing.whyKaatch.catchUpDesc')}
                </p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.5}>
            <p className="text-stone-500 max-w-2xl mt-12" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
              {t('landing.whyKaatch.body')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* TWO ACCESS */}
      <section className="py-24 px-8 md:px-10 bg-[#f5f0e8] border-t border-stone-100">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>
              {t('landing.twoAccess.tagline')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#2d3228] mb-6">
              {t('landing.twoAccess.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-stone-500 mb-16 max-w-2xl" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
              {t('landing.twoAccess.desc')}
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* BACKSTAGE */}
            <ScrollReveal delay={0.3}>
              <div>
                <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.85rem', color: '#4a5240', letterSpacing: '0.05em' }} className="uppercase text-xs tracking-widest">
                  {t('landing.twoAccess.backstage.label')} · {t('landing.twoAccess.backstage.sublabel')}
                </span>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' }} className="text-[#2d3228] my-4">
                  {t('landing.twoAccess.backstage.title')}
                </h3>
                <ul className="space-y-4">
                  {(t.raw('landing.twoAccess.backstage.items') as any[]).map((item, i) => {
                    const Tag = item.href ? 'a' : 'div'
                    return (
                    <li key={i}>
                      <Tag {...(item.href ? { href: item.href } : {})} className={`flex gap-3${item.href ? ' hover:bg-stone-50 rounded-lg p-1 -m-1 transition cursor-pointer' : ''}`}>
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div>
                        <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.9rem' }} className="text-[#2d3228] mb-1">
                          {item.label}{item.href ? ' →' : ''}
                        </p>
                        <p className="text-stone-500 text-sm" style={{ fontWeight: 300 }}>
                          {item.detail}
                        </p>
                      </div>
                      </Tag>
                    </li>
                    )
                  })}
                </ul>
              </div>
            </ScrollReveal>

            {/* SCENE */}
            <ScrollReveal delay={0.4}>
              <div>
                <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.85rem', color: '#4a5240', letterSpacing: '0.05em' }} className="uppercase text-xs tracking-widest">
                  {t('landing.twoAccess.scene.label')} · {t('landing.twoAccess.scene.sublabel')}
                </span>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' }} className="text-[#2d3228] my-4">
                  {t('landing.twoAccess.scene.title')}
                </h3>
                <p className="text-stone-500 mb-6 text-sm" style={{ fontWeight: 300 }}>
                  {t('landing.twoAccess.scene.desc')}
                </p>
                <ul className="space-y-4 mb-6">
                  {(t.raw('landing.twoAccess.scene.items') as any[]).map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div>
                        <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.9rem' }} className="text-[#2d3228] mb-1">
                          {item.label}
                        </p>
                        <p className="text-stone-500 text-sm" style={{ fontWeight: 300 }}>
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-stone-400 italic" style={{ fontWeight: 300 }}>
                  {t('landing.twoAccess.scene.footerNote')}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ALBUM */}
      <section className="py-24 px-8 md:px-10 bg-white border-t border-stone-100">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>
              {t('landing.album.tagline')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#2d3228] mb-8 max-w-3xl">
              {t('landing.album.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-stone-600 max-w-2xl mb-6" style={{ fontSize: '1rem', lineHeight: 1.8 }}>
              {t('landing.album.body1')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <p className="text-stone-500 max-w-2xl mb-12" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
              {t('landing.album.body2')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <div className="flex flex-wrap gap-4">
              {(t.raw('landing.album.badges') as string[]).map((badge, i) => (
                <span key={i} className="px-6 py-3 bg-[#f5f0e8] text-[#4a5240] rounded-full text-sm" style={{ fontWeight: 500 }}>
                  {badge}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* OFFERS */}
      <section className="py-24 px-8 md:px-10 bg-[#f5f0e8] border-t border-stone-100">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>
              {t('landing.offers.tagline')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#2d3228] mb-4">
              {t('landing.offers.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-stone-500 max-w-2xl mx-auto mb-8" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
              {t('landing.offers.desc')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="bg-[#2d3228] text-white text-center py-3 px-6 rounded-lg inline-block mb-12">
              <p style={{ fontSize: '0.88rem', fontWeight: 400 }}>
                {t('landing.offers.launchBanner')}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* DISCOVERY */}
            <ScrollReveal delay={0.4}>
              <div className="bg-white rounded-2xl border border-stone-100 p-8 text-left flex flex-col h-full" style={{ boxShadow: SHADOW }}>
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-2" style={{ fontWeight: 500 }}>
                  {t('landing.offers.discovery.label')}
                </p>
                <p className="text-stone-400 text-xs mb-4" style={{ fontWeight: 300 }}>
                  {t('landing.offers.discovery.subtitle')}
                </p>
                <div className="flex items-end gap-1 mb-3">
                  <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '2.5rem', lineHeight: 1, letterSpacing: '-0.02em' }} className="text-[#2d3228]">
                    {t('landing.offers.discovery.price')}
                  </span>
                </div>
                <p className="text-stone-400 text-sm mb-6" style={{ fontWeight: 300 }}>
                  {t('landing.offers.discovery.priceNote')}
                </p>
                <ul className="space-y-2 flex-1 mb-6">
                  {(t.raw('landing.offers.discovery.features') as string[]).map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-stone-600" style={{ fontWeight: 300 }}>
                      <span className="text-[#4a5240] shrink-0" style={{ fontWeight: 600 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/auth" className="w-full text-center border-2 border-stone-200 text-stone-500 px-6 py-3 rounded-2xl hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm" style={{ fontWeight: 500 }}>
                  {t('landing.offers.discovery.cta')}
                </a>
              </div>
            </ScrollReveal>

            {/* WEDDING */}
            <ScrollReveal delay={0.5}>
              <div className="rounded-2xl p-8 text-left flex flex-col h-full relative" style={{ background: '#4a5240', boxShadow: '0 8px 40px rgba(74,82,64,0.25)' }}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#f5f0e8] text-[#4a5240] text-xs px-4 py-1.5 rounded-full whitespace-nowrap" style={{ fontWeight: 600 }}>
                    {t('landing.offers.wedding.badge')}
                  </span>
                </div>
                <p className="text-xs tracking-widest uppercase text-white/70 mb-2 mt-2" style={{ fontWeight: 500 }}>
                  {t('landing.offers.wedding.label')}
                </p>
                <p className="text-white/55 text-xs mb-4" style={{ fontWeight: 300 }}>
                  {t('landing.offers.wedding.subtitle')}
                </p>
                <div className="flex items-end gap-1 mb-3">
                  <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '2.5rem', lineHeight: 1, letterSpacing: '-0.02em' }} className="text-white">
                    {t('landing.offers.wedding.price')}
                  </span>
                </div>
                <p className="text-white/65 text-sm mb-6" style={{ fontWeight: 300 }}>
                  {t('landing.offers.wedding.priceNote')}
                </p>
                <ul className="space-y-2 flex-1 mb-6">
                  {(t.raw('landing.offers.wedding.features') as string[]).map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/85" style={{ fontWeight: 300 }}>
                      <span className="text-white/80 shrink-0" style={{ fontWeight: 600 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/auth" className="w-full text-center bg-white text-[#4a5240] px-6 py-3 rounded-2xl hover:bg-[#f5f0e8] transition text-sm" style={{ fontWeight: 600 }}>
                  {t('landing.offers.wedding.cta')}
                </a>
              </div>
            </ScrollReveal>

            {/* PREMIUM */}
            <ScrollReveal delay={0.6}>
              <div className="bg-white rounded-2xl p-8 text-left flex flex-col h-full relative" style={{ boxShadow: SHADOW, border: '1.5px solid #c4a87c' }}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#c4a87c] text-white text-xs px-4 py-1.5 rounded-full whitespace-nowrap" style={{ fontWeight: 600 }}>
                    {t('landing.offers.premium.badge')}
                  </span>
                </div>
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-2 mt-2" style={{ fontWeight: 500 }}>
                  {t('landing.offers.premium.label')}
                </p>
                <p className="text-stone-400 text-xs mb-4" style={{ fontWeight: 300 }}>
                  {t('landing.offers.premium.subtitle')}
                </p>
                <div className="flex items-end gap-1 mb-3">
                  <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '2.5rem', lineHeight: 1, letterSpacing: '-0.02em' }} className="text-[#2d3228]">
                    99
                  </span>
                </div>
                <p className="text-stone-400 text-sm mb-6" style={{ fontWeight: 300 }}>
                  {t('landing.offers.premium.badge')}
                </p>
                <ul className="space-y-2 flex-1 mb-6">
                  {(t.raw('landing.offers.premium.features') as string[]).map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-stone-500" style={{ fontWeight: 300 }}>
                      <span className="text-[#c4a87c] shrink-0" style={{ fontWeight: 600 }}>🔜</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.7}>
            <p className="text-center mt-8 text-xs text-stone-400" style={{ fontWeight: 300 }}>
              {t('landing.offers.footer')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CREATIVE STUDIO */}
      <section className="py-24 px-8 md:px-10 bg-white border-t border-stone-100">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>
              {t('landing.creativeStudio.tagline')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#2d3228]">
              {t('landing.creativeStudio.title')}
              <span style={{ fontStyle: 'italic' }} className="text-[#4a5240]"> {t('landing.creativeStudio.subtitle')}</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-stone-500 max-w-2xl my-8" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
              {t('landing.creativeStudio.desc')}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <FeatureTicker />
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="mt-24 bg-[#f5f0e8] rounded-2xl p-12 text-center relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-[#c4a87c] text-white text-xs px-4 py-1.5 rounded-full whitespace-nowrap" style={{ fontWeight: 600 }}>
                  {t('landing.creativeStudio.ctaSection.badge')}
                </span>
              </div>
              <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>
                {t('landing.creativeStudio.ctaSection.tagline')}
              </p>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#2d3228] mb-4">
                {t('landing.creativeStudio.ctaSection.title')}
              </h3>
              <p className="text-stone-500 mb-8 max-w-lg mx-auto" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
                {t('landing.creativeStudio.ctaSection.desc')}
              </p>
              <p className="text-xs text-stone-400 mb-3" style={{ fontWeight: 300 }}>
                {t('landing.creativeStudio.ctaSection.notifyLabel')}
              </p>
              <form
                action="mailto:bonjour@kaatch.fr"
                method="GET"
                className="flex gap-2 max-w-sm mx-auto"
              >
                <input
                  type="email"
                  name="subject"
                  placeholder={t('landing.creativeStudio.ctaSection.notifyPlaceholder')}
                  className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-600 placeholder:text-stone-300 outline-none focus:border-[#4a5240]"
                  style={{ fontWeight: 300 }}
                />
                <button
                  type="submit"
                  className="text-sm bg-[#4a5240] text-white px-4 py-2.5 rounded-xl hover:bg-[#2d3228] transition shrink-0"
                  style={{ fontWeight: 500 }}
                >
                  {t('landing.creativeStudio.ctaSection.notifyBtn')}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <FAQ t={t} />

      {/* CTA FINAL */}
      <section className="py-28 px-8 md:px-10 bg-[#f5f0e8] border-t border-stone-100 text-center">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>
              {t('landing.ctaFinal.tagline')}
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#2d3228] mb-6">
              {t('landing.ctaFinal.title')}
            </h2>
            <p className="text-stone-500 mb-10" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
              {t('landing.ctaFinal.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <a href="/auth" className="text-center bg-[#4a5240] text-white px-8 py-4 rounded-2xl hover:bg-[#2d3228] transition text-sm" style={{ fontWeight: 500 }}>
                {t('landing.ctaFinal.cta')}
              </a>
              <a href="/p/rejoindre" className="text-center border-2 border-[#4a5240] text-[#4a5240] px-8 py-4 rounded-2xl hover:bg-[#4a5240]/5 transition text-sm" style={{ fontWeight: 500 }}>
                {t('landing.ctaFinal.ctaGuest')}
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-8 md:px-10 bg-white border-t border-stone-100">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-5 text-center" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>
              {t('landing.contact.tagline')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#2d3228] mb-4 text-center">
              {t('landing.contact.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-stone-500 text-center mb-12" style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
              {t('landing.contact.desc')}
            </p>
          </ScrollReveal>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
