'use client'

import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { logoutMaried } from './logout-action'
import KaatchChat from './KaatchChat'
import { createClient } from '@supabase/supabase-js'

type NavItem = { label: string; href: string; sub?: string; target?: string }
type NavSection = { label: string; href?: string; items?: NavItem[] }
type LogEntry = { message: string; icon: string; time: string }
type Toast = { id: number; message: string; icon: string }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function WeddingNav({ slug, weddingName, weddingId }: { slug: string; weddingName: string; weddingId: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)
  const mounted = useRef(false)
  const navRef = useRef<HTMLDivElement>(null)

  // Realtime notifications
  useEffect(() => {
    if (!weddingId) return
    mounted.current = true

    function addToast(icon: string, message: string) {
      if (!mounted.current) return
      const id = ++toastId.current
      setToasts(t => [...t, { id, message, icon }])
      setLog(l => [{ message, icon, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }, ...l.slice(0, 19)])
      setUnread(n => n + 1)
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
    }

    const channel = supabase
      .channel(`wedding-${weddingId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: `wedding_id=eq.${weddingId}` },
        (payload) => addToast('📸', `${(payload.new as any).uploaded_by_name || 'Quelqu\'un'} a ajouté une photo`))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `wedding_id=eq.${weddingId}` },
        (payload) => addToast('💬', `${(payload.new as any).author_name || 'Quelqu\'un'} a envoyé un message`))
      .subscribe()

    return () => { mounted.current = false; supabase.removeChannel(channel) }
  }, [weddingId])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null)
        setMobileOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileOpen(false); setOpen(null) }, [pathname])

  const sections: NavSection[] = [
    { label: 'Accueil', href: `/wedding/${slug}` },
    {
      label: 'Préparatifs',
      items: [
        { label: 'Invités', sub: 'Faire-part & RSVP', href: `/wedding/${slug}/guests` },
        { label: 'Plan de table', sub: 'Placement & récap', href: `/wedding/${slug}/tables` },
        { label: 'Budget', sub: 'Devis, dépenses & prestataires', href: `/wedding/${slug}/budget` },
      ],
    },
    {
      label: 'Jour J',
      items: [
        { label: 'Programme', sub: 'Déroulé de la journée', href: `/wedding/${slug}/programme` },
        { label: 'Hébergements', sub: 'Options aux alentours', href: `/wedding/${slug}/hebergements` },
        { label: 'QR Code', sub: 'Accès rapide jour J', href: `/wedding/${slug}/partager` },
      ],
    },
    { label: 'Photos', href: `/wedding/${slug}/photos` },
    { label: 'Messagerie', href: `/wedding/${slug}/messagerie` },
    {
      label: 'Compte',
      items: [
        { label: 'Vue invités', sub: 'Aperçu de votre espace', href: `/invite/${slug}`, target: '_blank' },
        { label: 'Paramètres', sub: 'Infos du mariage', href: `/wedding/${slug}/edit` },
        { label: 'Règles & message', sub: 'Mot des mariés', href: `/wedding/${slug}/regles` },
      ],
    },
  ]

  const isActive = (section: NavSection): boolean => {
    if (section.href) {
      if (section.href === `/wedding/${slug}`) return pathname === section.href
      return pathname.startsWith(section.href)
    }
    return section.items?.some(item => pathname.startsWith(item.href)) ?? false
  }

  return (
    <>
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-12">

        {/* Logo */}
        <a href={`/wedding/${slug}`}
           style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.1rem', fontStyle: 'italic' }}
           className="text-[#2d3228] shrink-0 mr-4">
          {weddingName}
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {sections.map(section => {
            const active = isActive(section)

            if (!section.items) {
              return (
                <a key={section.label} href={section.href}
                   className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition ${
                     active ? 'bg-[#4a5240] text-white' : 'text-stone-500 hover:text-[#4a5240]'
                   }`}
                   style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}>
                  {section.label === 'Messagerie' ? (
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                      {section.label}
                    </span>
                  ) : section.label}
                </a>
              )
            }

            const isOpen = open === section.label
            return (
              <div key={section.label} className="relative">
                <button
                  onClick={() => setOpen(isOpen ? null : section.label)}
                  className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                    active ? 'bg-[#4a5240] text-white' : 'text-stone-500 hover:text-[#4a5240]'
                  }`}
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}>
                  {section.label}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                       className={`w-2.5 h-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-stone-100 py-1.5 min-w-[200px] z-50">
                    {section.items.map(item => {
                      const itemActive = pathname.startsWith(item.href)
                      return (
                        <a key={item.href} href={item.href} target={item.target}
                           onClick={() => setOpen(null)}
                           className={`flex flex-col px-4 py-2.5 hover:bg-[#f5f0e8] transition ${itemActive ? 'bg-[#f5f0e8]' : ''}`}>
                          <span style={{ fontFamily: 'var(--font-lato)', fontWeight: itemActive ? 400 : 300, fontSize: '0.82rem' }}
                                className={itemActive ? 'text-[#4a5240]' : 'text-stone-700'}>
                            {item.label}
                          </span>
                          {item.sub && (
                            <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">{item.sub}</span>
                          )}
                        </a>
                      )
                    })}
                    {section.label === 'Compte' && (
                      <>
                        <div className="border-t border-stone-100 my-1" />
                        <form action={logoutMaried} className="px-4 py-2">
                          <button type="submit"
                            className="text-xs text-stone-400 hover:text-red-400 transition cursor-pointer w-full text-left"
                            style={{ fontWeight: 300 }}>
                            Déconnexion
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Cloche + hamburger */}
        <div className="flex items-center gap-1 ml-auto md:ml-2">

          {/* 🔔 Cloche notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(o => !o); setUnread(0) }}
              className="p-1.5 rounded-md text-stone-400 hover:text-[#4a5240] transition relative cursor-pointer"
              title="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-stone-100 z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500 uppercase tracking-wider" style={{ fontWeight: 300 }}>Activité récente</span>
                  <button onClick={() => setNotifOpen(false)} className="text-stone-300 hover:text-stone-500 text-lg leading-none cursor-pointer">×</button>
                </div>
                {log.length === 0 ? (
                  <div className="px-4 py-6 text-center text-stone-400 text-sm" style={{ fontWeight: 300 }}>Aucune activité pour l'instant</div>
                ) : (
                  <ul className="max-h-64 overflow-y-auto divide-y divide-stone-50">
                    {log.map((entry, i) => (
                      <li key={i} className="px-4 py-2.5 flex items-start gap-2.5 hover:bg-stone-50 transition">
                        <span className="text-base shrink-0">{entry.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-stone-700 leading-snug" style={{ fontWeight: 300 }}>{entry.message}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">{entry.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-1.5 rounded-md text-stone-500 hover:text-[#4a5240] transition cursor-pointer"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 shadow-lg max-h-[80vh] overflow-y-auto">
          {sections.map(section => (
            <div key={section.label}>
              {!section.items ? (
                <a href={section.href}
                   className={`flex items-center px-5 py-3 text-sm border-b border-stone-50 ${
                     isActive(section) ? 'text-[#4a5240] bg-[#f5f0e8]' : 'text-stone-600'
                   }`}
                   style={{ fontWeight: isActive(section) ? 400 : 300 }}>
                  {section.label}
                </a>
              ) : (
                <>
                  <p className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-widest text-stone-300" style={{ fontWeight: 300 }}>{section.label}</p>
                  {section.items.map(item => (
                    <a key={item.href} href={item.href} target={item.target}
                       className={`flex flex-col px-6 py-2.5 border-b border-stone-50 ${
                         pathname.startsWith(item.href) ? 'bg-[#f5f0e8] text-[#4a5240]' : 'text-stone-600'
                       }`}>
                      <span style={{ fontWeight: 300, fontSize: '0.85rem' }}>{item.label}</span>
                      {item.sub && <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">{item.sub}</span>}
                    </a>
                  ))}
                  {section.label === 'Compte' && (
                    <form action={logoutMaried} className="px-6 py-3 border-b border-stone-50">
                      <button type="submit" className="text-sm text-red-400 cursor-pointer" style={{ fontWeight: 300 }}>Déconnexion</button>
                    </form>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>

    {/* Toasts realtime (centre bas) */}
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[100] pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id}
          className="flex items-center gap-2 bg-[#2d3228] text-white text-sm px-4 py-2.5 rounded-full shadow-lg pointer-events-auto"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          <span>{toast.icon}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>

    <KaatchChat />
    </>
  )
}
