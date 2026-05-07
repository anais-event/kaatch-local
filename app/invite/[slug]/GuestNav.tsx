'use client'

import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useBadges } from './NotificationBadges'

export default function GuestNav({ slug, isPreview }: { slug: string; isPreview?: boolean }) {
  const pathname = usePathname()
  const badges = useBadges()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('kaatch-sidebar-collapsed')
    if (saved === 'true') { setCollapsed(true); document.documentElement.classList.add('sidebar-collapsed') }
  }, [])

  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('kaatch-sidebar-collapsed', String(next))
    document.documentElement.classList.toggle('sidebar-collapsed', next)
  }

  const tabs = [
    { label: 'Faire-part',   href: `/invite/${slug}/faire-part`,    emoji: '💌' },
    { label: 'Messagerie',   href: `/invite/${slug}/groupes`,        emoji: '💬', badge: badges.messages },
    { label: 'Programme',    href: `/invite/${slug}/programme`,      emoji: '📋' },
    { label: 'Musique',      href: `/invite/${slug}/musique`,        emoji: '🎵' },
    { label: 'Photos',       href: `/invite/${slug}/photos`,         emoji: '📸', badge: badges.photos },
    { label: 'Inspirations', href: `/invite/${slug}/inspirations`,   emoji: '✨' },
    { label: 'Surprises',    href: `/invite/${slug}/surprises`,      emoji: '🎉' },
    { label: "Livre d'Or",   href: `/invite/${slug}/livre-dor`,      emoji: '📖' },
    { label: 'Hébergements', href: `/invite/${slug}/hebergements`,   emoji: '🏡' },
    { label: 'Mon compte',   href: `/invite/${slug}/compte`,         emoji: '👤' },
  ]

  const isActive = (href: string) => pathname.startsWith(href)

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
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="sidebar-panel hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-stone-100 z-50">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-stone-100 flex items-start justify-between">
          <div>
            <a href={`/invite/${slug}`} className="flex items-center gap-2">
              <img src="/logo.png" alt="Kaatch" className="w-7 h-7 object-contain" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem' }}
                className="text-[#2d3228] leading-tight">Kaatch</span>
            </a>
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.12em' }}
              className="text-stone-400 uppercase mt-1 tracking-widest">
              Espace invités
            </p>
          </div>
          <button onClick={toggleCollapse}
            className="mt-0.5 p-1 rounded text-stone-300 hover:text-stone-500 hover:bg-stone-50 transition cursor-pointer"
            title="Réduire">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {tabs.map(tab => {
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
                {tab.badge && !active && (
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                )}
              </a>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-stone-100 px-2 py-3 space-y-0.5">
          {isPreview && (
            <a href={`/mariage/${slug}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#4a5240] border border-[#4a5240]/20 hover:bg-[#4a5240] hover:text-white transition mb-1"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Espace mariés
            </a>
          )}
          <a href={`/invite/${slug}`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-stone-600 hover:bg-stone-100 hover:text-[#4a5240] transition"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 400 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Accueil
          </a>
        </div>
      </aside>

      {/* ─── REOPEN BUTTON (desktop, sidebar collapsed) ─── */}
      {collapsed && (
        <button onClick={toggleCollapse}
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 items-center justify-center w-5 h-10 bg-white border border-stone-100 border-l-0 rounded-r-lg shadow-sm text-stone-400 hover:text-[#4a5240] hover:bg-stone-50 transition cursor-pointer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* ─── MOBILE TOP BAR ─── */}
      <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm transition-transform duration-300 ${navHidden ? '-translate-y-full' : ''}`}>
        <div className="flex items-center justify-between px-4 h-12">
          <a href={`/invite/${slug}`} className="flex items-center gap-2">
            <img src="/logo.png" alt="Kaatch" className="w-6 h-6 object-contain" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}
              className="text-[#2d3228]">Kaatch</span>
          </a>
          <div className="flex items-center gap-2">
            {(badges.messages || badges.photos) && (
              <span className="w-2 h-2 rounded-full bg-red-400" />
            )}
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

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="bg-white border-t border-stone-100 shadow-lg max-h-[80vh] overflow-y-auto">
            {tabs.map(tab => {
              const active = isActive(tab.href)
              return (
                <a key={tab.href} href={tab.href}
                  className={`flex items-center gap-3 px-5 py-3 border-b border-stone-50 ${
                    active ? 'text-[#4a5240] bg-[#f5f0e8]' : 'text-stone-600'
                  }`}
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: active ? 400 : 300, fontSize: '0.9rem' }}>
                  <span>{tab.emoji}</span>
                  <span className="flex-1">{tab.label}</span>
                  {tab.badge && !active && (
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                  )}
                </a>
              )
            })}
            {isPreview && (
              <div className="border-t border-stone-100 px-5 py-3">
                <a href={`/mariage/${slug}`}
                  className="text-sm text-[#4a5240]"
                  style={{ fontWeight: 300 }}>
                  ← Espace mariés
                </a>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
