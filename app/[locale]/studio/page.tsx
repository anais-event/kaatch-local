'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

const DISPLAY = 'var(--font-display)'
const BODY = 'var(--font-lato)'

export default function StudioPage() {
  const t = useTranslations('studioPage')

  return (
    <main className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-6">
      <div className="fixed top-5 left-5">
        <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-[#4a5240] transition"
              style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.85rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t('back')}
        </Link>
      </div>

      <div className="max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo.png" alt="Kaatch" className="w-8 h-8 object-contain" />
          <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '1.2rem' }}
                className="text-[#2d3228]">Kaatch</span>
        </div>

        <p className="text-xs uppercase tracking-[0.25em] text-stone-400 mb-4" style={{ fontFamily: BODY, fontWeight: 300 }}>
          {t('tagline')}
        </p>
        <h1 className="text-stone-800 mb-6" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.08, letterSpacing: '-0.02em' }}>
          {t('title')}
        </h1>
        <div className="w-12 h-px bg-stone-300 mx-auto mb-6" />
        <p className="text-stone-500 leading-relaxed mb-10" style={{ fontFamily: BODY, fontWeight: 300 }}>
          {t('desc')}
        </p>

        <div className="mb-10">
          <p className="text-xs text-stone-400 mb-3" style={{ fontWeight: 300 }}>
            {t('notifyLabel')}
          </p>
          <form action="mailto:bonjour@kaatch.fr" method="GET" className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              name="subject"
              placeholder={t('notifyPlaceholder')}
              className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-600 placeholder:text-stone-300 outline-none focus:border-[#4a5240]"
              style={{ fontWeight: 300 }}
            />
            <button
              type="submit"
              className="text-sm bg-[#4a5240] text-white px-4 py-2.5 rounded-xl hover:bg-[#2d3228] transition shrink-0"
              style={{ fontWeight: 500 }}
            >
              {t('notifyBtn')}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/budget-mariage"
            className="inline-block px-6 py-3 rounded-full text-sm text-white"
            style={{ background: '#4a5240', fontFamily: BODY, fontWeight: 300 }}
          >
            {t('budgetCta')}
          </Link>
          <Link
            href="/"
            className="text-sm text-stone-400 hover:text-[#4a5240] transition"
            style={{ fontFamily: BODY, fontWeight: 300 }}
          >
            {t('backCta')}
          </Link>
        </div>
      </div>
    </main>
  )
}
