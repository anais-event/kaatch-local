'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
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
        <span>{currentLang.flag}</span>
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
              <span>{lang.flag}</span>
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
