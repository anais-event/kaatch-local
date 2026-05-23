'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const FLAGS: Record<string, string> = {
  fr: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 3 2%22><rect fill=%22%23002395%22 width=%221%22 height=%222%22/><rect fill=%22white%22 x=%221%22 width=%221%22 height=%222%22/><rect fill=%22%23ED2939%22 x=%222%22 width=%221%22 height=%222%22/></svg>',
  en: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 30%22><rect fill=%22%23012169%22 width=%2260%22 height=%2230%22/><path d=%22M0 0L60 30M60 0L0 30%22 stroke=%22white%22 stroke-width=%226%22/><path d=%22M0 0L60 30M60 0L0 30%22 stroke=%22%23C8102E%22 stroke-width=%224%22 clip-path=%22polygon(30 15,60 30,60 0,30 15,0 0,0 30)%22/><path d=%22M30 0v30M0 15h60%22 stroke=%22white%22 stroke-width=%2210%22/><path d=%22M30 0v30M0 15h60%22 stroke=%22%23C8102E%22 stroke-width=%226%22/></svg>',
  es: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 3 2%22><rect fill=%22%23AA151B%22 width=%223%22 height=%222%22/><rect fill=%22%23F1BF00%22 y=%220.5%22 width=%223%22 height=%221%22/></svg>',
  it: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 3 2%22><rect fill=%22%23009246%22 width=%221%22 height=%222%22/><rect fill=%22white%22 x=%221%22 width=%221%22 height=%222%22/><rect fill=%22%23CE2B37%22 x=%222%22 width=%221%22 height=%222%22/></svg>',
  de: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 5 3%22><rect fill=%22%23000%22 width=%225%22 height=%221%22/><rect fill=%22%23D00%22 y=%221%22 width=%225%22 height=%221%22/><rect fill=%22%23FFCE00%22 y=%222%22 width=%225%22 height=%221%22/></svg>',
}

const LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const buildHref = (newLocale: string) => {
    // Remove locale prefix from pathname
    let cleanPath = pathname

    // If pathname starts with /[locale], remove it
    for (const lang of LANGUAGES) {
      if (pathname.startsWith(`/${lang.code}`)) {
        cleanPath = pathname.slice(3) || '/'
        break
      }
    }

    // If pathname is just / or empty, keep it as /
    if (!cleanPath || cleanPath === '') cleanPath = '/'

    // Add new locale prefix (no prefix for French)
    return newLocale === 'fr' ? cleanPath : `/${newLocale}${cleanPath}`
  }

  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0]

  return (
    <div ref={dropRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 transition text-sm"
        style={{ fontWeight: 500, color: '#44403c' }}
      >
        <img src={FLAGS[currentLang.code]} alt="" width={20} height={14} className="rounded-sm" style={{ display: 'inline-block' }} />
        <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg border border-stone-100 py-1 z-50"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
          {LANGUAGES.map(lang => (
            <Link
              key={lang.code}
              href={buildHref(lang.code)}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 transition ${
                locale === lang.code ? 'bg-stone-100' : 'hover:bg-stone-50'
              }`}
            >
              <img src={FLAGS[lang.code]} alt="" width={20} height={14} className="rounded-sm" style={{ display: 'inline-block' }} />
              <span style={{ fontSize: '0.9rem', color: locale === lang.code ? '#2C3B2E' : '#44403c' }}>
                {lang.name}
              </span>
              {locale === lang.code && (
                <span className="ml-auto text-xs text-stone-400">✓</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
