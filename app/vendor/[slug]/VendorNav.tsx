'use client'

import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export default function VendorNav({ slug, vendorName, vendorCategory }: {
  slug: string
  vendorName: string
  vendorCategory: string
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)

  type NavItem = { label: string; href: string; emoji: string } | { section: string }

  const tabs: NavItem[] = [
    { label: 'Tableau de bord', href: `/vendor/${slug}`, emoji: '📊' },
    { section: 'Infos du mariage' },
    { label: 'Plan de table',     href: `/vendor/${slug}/tables`, emoji: '🪑' },
    { label: 'Programme',         href: `/vendor/${slug}/programme`, emoji: '⏰' },
    { label: 'Lieux et adresses', href: `/vendor/${slug}/lieux`, emoji: '📍' },
    { section: 'Échanges' },
    { label: 'Documents',    href: `/vendor/${slug}/documents`, emoji: '📄' },
    { label: 'Messagerie',   href: `/vendor/${slug}/messagerie`, emoji: '💬' },
  ]

  const isActive = (href: string) => {
    if (href === `/vendor/${slug}`) return pathname === href
    return pathname.startsWith(href)
  }

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    function handleScroll() {
      const current = window.scrollY
      if (current < 10) setNavHidden(false)
      else if (current > lastScrollY.current + 5) setNavHidden(true)
      else if (current < lastScrollY.current - 5) setNavHidden(false)
      lastScrollY.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-stone-100 z-50">
        <div className="px-5 py-5 border-b border-stone-100">
          <a href={`/vendor/${slug}`} className="flex items-center gap-2">
            <img src="/logo.png" alt="Kaatch" className="w-7 h-7 object-contain" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem' }}
              className="text-[#2d3228] leading-tight">Kaatch</span>
          </a>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.12em' }}
            className="text-stone-400 uppercase mt-1 tracking-widest">
            Espace prestataire
          </p>
          <div className="mt-3 bg-stone-50 rounded-xl px-3 py-2">
            <p style={{ fontWeight: 400, fontSize: '0.8rem' }} className="text-[#2d3228] truncate">{vendorName}</p>
            <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">{vendorCategory}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {tabs.map((tab, i) => {
            if ('section' in tab) {
              return (
                <p key={tab.section}
                   className="text-[10px] text-stone-400 uppercase tracking-wider px-3 pt-4 pb-1"
                   style={{ fontWeight: 400, letterSpacing: '0.1em' }}>
                  {tab.section}
                </p>
              )
            }
            const active = isActive(tab.href)
            return (
              <a key={tab.href} href={tab.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition mb-0.5 ${
                  active
                    ? 'bg-[#4a5240] text-white'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-[#4a5240]'
                }`}
                style={{ fontFamily: 'var(--font-lato)', fontWeight: active ? 500 : 400 }}>
                <span className="text-base">{tab.emoji}</span>
                <span className="flex-1">{tab.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="border-t border-stone-100 px-4 py-3">
          <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300">
            Accès en lecture seule
          </p>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm transition-transform duration-300 ${navHidden ? '-translate-y-full' : ''}`}>
        <div className="flex items-center justify-between px-4 h-12">
          <a href={`/vendor/${slug}`} className="flex items-center gap-2">
            <img src="/logo.png" alt="Kaatch" className="w-6 h-6 object-contain" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}
              className="text-[#2d3228]">Kaatch</span>
          </a>
          <div className="flex items-center gap-2">
            <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">{vendorName}</span>
            <button onClick={() => setMobileOpen(o => !o)}
              className="p-1.5 rounded-md text-stone-500 hover:text-[#4a5240] transition cursor-pointer"
              aria-label="Menu">
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="bg-white border-t border-stone-100 shadow-lg">
            {tabs.map((tab, i) => {
              if ('section' in tab) {
                return (
                  <p key={tab.section}
                     className="text-[10px] text-stone-400 uppercase tracking-wider px-5 pt-3 pb-1"
                     style={{ fontWeight: 400, letterSpacing: '0.1em' }}>
                    {tab.section}
                  </p>
                )
              }
              const active = isActive(tab.href)
              return (
                <a key={tab.href} href={tab.href}
                  className={`flex items-center gap-3 px-5 py-3 border-b border-stone-50 ${
                    active ? 'text-[#4a5240] bg-[#f5f0e8]' : 'text-stone-600'
                  }`}
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: active ? 400 : 300, fontSize: '0.9rem' }}>
                  <span>{tab.emoji}</span>
                  <span className="flex-1">{tab.label}</span>
                </a>
              )
            })}
          </div>
        )}
      </nav>
    </>
  )
}
