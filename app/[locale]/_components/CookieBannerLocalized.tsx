'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export default function CookieBannerLocalized() {
  const t = useTranslations('cookies')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('kaatch-cookies-ok')) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem('kaatch-cookies-ok', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] px-4 pb-4 pointer-events-none"
      style={{ fontFamily: 'var(--font-lato)' }}
    >
      <div
        className="max-w-xl mx-auto bg-[#2C3B2E] text-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center gap-4 pointer-events-auto shadow-xl"
        style={{ boxShadow: '0 8px 32px rgba(44,59,46,0.25)' }}
      >
        <p style={{ fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.6 }} className="text-white/80 flex-1">
          {t('message')}{' '}
          <a href="/politique-de-confidentialite" className="underline hover:text-white transition text-white/70">
            {t('learnMore')}
          </a>
        </p>
        <button
          onClick={accept}
          className="shrink-0 bg-white text-[#2C3B2E] px-5 py-2 rounded-xl text-sm hover:bg-[#f5f0e8] transition cursor-pointer"
          style={{ fontWeight: 500 }}
        >
          {t('accept')}
        </button>
      </div>
    </div>
  )
}
