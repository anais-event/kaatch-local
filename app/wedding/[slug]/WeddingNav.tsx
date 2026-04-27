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

export default function WeddingNav({ slug, weddingName, weddingId, userEmail }: { slug: string; weddingName: string; weddingId: string; userEmail: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)
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
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileOpen(false); setOpen(null) }, [pathname])

  useEffect(() => {
    function handleScroll() {
      const current = window.scrollY
      if (current < 10) { setNavHidden(false) }
      else if (current > lastScrollY.current + 5) { setNavHidden(true) }
      else if (current < lastScrollY.current - 5) { setNavHidden(false) }
      lastScrollY.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sections: NavSection[] = [
    { label: '🏠 Accueil', href: `/wedding/${slug}` },
    {
      label: 'Préparatifs',
      items: [
        { label: 'Invités & RSVP', sub: 'Liste des invités', href: `/wedding/${slug}/guests` },
        { label: 'Faire-part', sub: 'Envoyer les invitations', href: `/wedding/${slug}/invitations` },
        { label: 'Plan de table', sub: 'Placement & récap', href: `/wedding/${slug}/tables` },
        { label: 'Budget', sub: 'Suivi des dépenses', href: `/wedding/${slug}/budget` },
        { label: 'Prestataires', sub: 'Contacts & contrats', href: `/wedding/${slug}/prestataires` },
        { label: 'Mot des mariés', sub: 'Message & règles', href: `/wedding/${slug}/regles` },
      ],
    },
    {
      label: 'Jour J',
      items: [
        { label: 'Rétro-planning', sub: 'Checklist chronologique', href: `/wedding/${slug}/retro-planning` },
        { label: 'Programme', sub: 'Déroulé de la journée', href: `/wedding/${slug}/programme` },
        { label: 'Jeux & animations', sub: 'Idées pour la fête', href: `/wedding/${slug}/jeux` },
        { label: 'Musique', sub: 'Playlist & suggestions', href: `/wedding/${slug}/musique` },
        { label: 'Hébergements', sub: 'Options aux alentours', href: `/wedding/${slug}/hebergements` },
        { label: 'QR Code', sub: 'Accès rapide jour J', href: `/wedding/${slug}/partager` },
      ],
    },
    { label: '📸 Photos', href: `/wedding/${slug}/photos` },
    { label: '📖 Livre d\'Or', href: `/wedding/${slug}/livre-dor` },
    { label: '💬 Messagerie', href: `/wedding/${slug}/messagerie` },
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
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm transition-transform duration-300 ${navHidden ? '-translate-y-full' : ''}`}>
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
                  {section.label}
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
                        {/* Activité récente */}
                        <div className="px-4 py-2">
                          <p className="text-[10px] uppercase tracking-widest text-stone-300 mb-2" style={{ fontWeight: 300 }}>Activité récente</p>
                          {log.length === 0 ? (
                            <p className="text-xs text-stone-300 italic" style={{ fontWeight: 300 }}>Aucune activité</p>
                          ) : (
                            <ul className="space-y-1.5 max-h-32 overflow-y-auto">
                              {log.slice(0, 5).map((entry, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-sm shrink-0">{entry.icon}</span>
                                  <div className="min-w-0">
                                    <p className="text-xs text-stone-600 leading-snug" style={{ fontWeight: 300 }}>{entry.message}</p>
                                    <p className="text-[10px] text-stone-400">{entry.time}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
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

        {/* Mon espace + hamburger */}
        <div className="flex items-center gap-1 ml-auto md:ml-2">

          {/* Mon espace dropdown */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setOpen(open === 'monespace' ? null : 'monespace')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs whitespace-nowrap transition cursor-pointer ${
                open === 'monespace' ? 'bg-[#4a5240] text-white' : 'text-stone-500 hover:text-[#4a5240]'
              }`}
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}>
              {unread > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />}
              Mon espace
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                   className={`w-2.5 h-2.5 transition-transform ${open === 'monespace' ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open === 'monespace' && (
              <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-stone-100 py-1.5 min-w-[220px] z-50">
                {/* Vue invités */}
                <a href={`/invite/${slug}`} target="_blank" onClick={() => setOpen(null)}
                   className="flex flex-col px-4 py-2.5 hover:bg-[#f5f0e8] transition">
                  <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-700">Vue invités</span>
                  <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">Aperçu de votre espace</span>
                </a>
                {/* Paramètres */}
                <a href={`/wedding/${slug}/edit`} onClick={() => setOpen(null)}
                   className="flex flex-col px-4 py-2.5 hover:bg-[#f5f0e8] transition">
                  <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-700">Paramètres</span>
                  <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">Infos du mariage</span>
                </a>
                <div className="border-t border-stone-100 my-1" />
                {/* Identifiants */}
                <div className="px-4 py-2.5">
                  <p style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.15em' }} className="text-stone-400 uppercase mb-2">Connexion</p>
                  {userEmail && (
                    <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-500 truncate mb-2">{userEmail}</p>
                  )}
                  <a href="/auth/update-password"
                     style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-[#4a5240] hover:underline block">
                    Changer le mot de passe →
                  </a>
                </div>
                <div className="border-t border-stone-100 my-1" />
                {/* Activité */}
                {log.length > 0 && (
                  <div className="px-4 py-2">
                    <p style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.15em' }} className="text-stone-400 uppercase mb-2">Activité récente</p>
                    <ul className="space-y-1.5 max-h-28 overflow-y-auto">
                      {log.slice(0, 4).map((entry, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-sm shrink-0">{entry.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs text-stone-600 leading-snug" style={{ fontWeight: 300 }}>{entry.message}</p>
                            <p className="text-[10px] text-stone-400">{entry.time}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {log.length > 0 && <div className="border-t border-stone-100 my-1" />}
                {/* Déconnexion */}
                <form action={logoutMaried} className="px-4 py-2">
                  <button type="submit" className="text-xs text-stone-400 hover:text-red-400 transition cursor-pointer w-full text-left" style={{ fontWeight: 300 }}>
                    Déconnexion
                  </button>
                </form>
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
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === section.label ? null : section.label)}
                    className={`w-full flex items-center justify-between px-5 py-3 text-sm border-b border-stone-50 cursor-pointer transition ${
                      isActive(section) ? 'text-[#4a5240] bg-[#f5f0e8]' : 'text-stone-600'
                    }`}
                    style={{ fontWeight: isActive(section) ? 400 : 300 }}>
                    <span>{section.label}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                         className={`w-3.5 h-3.5 text-stone-300 transition-transform ${mobileExpanded === section.label ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileExpanded === section.label && section.items.map(item => (
                    <a key={item.href} href={item.href} target={item.target}
                       className={`flex flex-col px-6 py-2.5 border-b border-stone-50 ${
                         pathname.startsWith(item.href) ? 'bg-[#f5f0e8] text-[#4a5240]' : 'text-stone-600'
                       }`}>
                      <span style={{ fontWeight: 300, fontSize: '0.85rem' }}>{item.label}</span>
                      {item.sub && <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">{item.sub}</span>}
                    </a>
                  ))}
                </>
              )}
            </div>
          ))}
          {/* Mon espace mobile */}
          <div>
            <p className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-widest text-stone-300" style={{ fontWeight: 300 }}>Mon espace</p>
            <a href={`/invite/${slug}`} target="_blank" className="flex flex-col px-6 py-2.5 border-b border-stone-50 text-stone-600">
              <span style={{ fontWeight: 300, fontSize: '0.85rem' }}>Vue invités</span>
              <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">Aperçu de votre espace</span>
            </a>
            <a href={`/wedding/${slug}/edit`} className="flex flex-col px-6 py-2.5 border-b border-stone-50 text-stone-600">
              <span style={{ fontWeight: 300, fontSize: '0.85rem' }}>Paramètres</span>
              <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">Infos du mariage</span>
            </a>
            {userEmail && (
              <div className="px-6 py-2.5 border-b border-stone-50">
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">Connecté : {userEmail}</p>
              </div>
            )}
            <form action={logoutMaried} className="px-6 py-3 border-b border-stone-50">
              <button type="submit" className="text-sm text-red-400 cursor-pointer" style={{ fontWeight: 300 }}>Déconnexion</button>
            </form>
          </div>
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
