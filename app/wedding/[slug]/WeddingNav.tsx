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

export default function WeddingNav({ slug, weddingName, weddingId, userEmail, plan }: {
  slug: string; weddingName: string; weddingId: string; userEmail: string; plan?: string | null
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)
  const [unread, setUnread] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)
  const mounted = useRef(false)

  const sections: NavSection[] = [
    { label: '🏠 Accueil', href: `/wedding/${slug}` },
    {
      label: 'Préparatifs',
      items: [
        { label: 'Invités', sub: 'Liste, RSVP & faire-part', href: `/wedding/${slug}/guests` },
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

  // Auto-expand the active section in sidebar
  const activeSection = sections.find(s =>
    s.items?.some(item => pathname.startsWith(item.href))
  )?.label ?? null
  const [sidebarExpanded, setSidebarExpanded] = useState<string | null>(activeSection)

  const isItemActive = (href: string) =>
    href === `/wedding/${slug}` ? pathname === href : pathname.startsWith(href)
  const isSectionActive = (section: NavSection) => {
    if (section.href) return isItemActive(section.href)
    return section.items?.some(item => isItemActive(item.href)) ?? false
  }

  // Realtime
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
    const channel = supabase.channel(`wedding-${weddingId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: `wedding_id=eq.${weddingId}` },
        (p) => addToast('📸', `${(p.new as any).uploaded_by_name || 'Quelqu\'un'} a ajouté une photo`))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `wedding_id=eq.${weddingId}` },
        (p) => addToast('💬', `${(p.new as any).author_name || 'Quelqu\'un'} a envoyé un message`))
      .subscribe()
    return () => { mounted.current = false; supabase.removeChannel(channel) }
  }, [weddingId])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Hide mobile top bar on scroll
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
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-stone-100 z-50">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-stone-100">
          <a href={`/wedding/${slug}`}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }}
            className="text-[#2d3228] block leading-tight">
            {weddingName}
          </a>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.12em' }}
            className="text-stone-400 uppercase mt-0.5 tracking-widest">
            Espace mariés
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {sections.map(section => {
            const active = isSectionActive(section)

            if (!section.items) {
              return (
                <a key={section.label} href={section.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition mb-0.5 ${
                    active
                      ? 'bg-[#4a5240] text-white'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-[#4a5240]'
                  }`}
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: active ? 400 : 300 }}>
                  {section.label}
                </a>
              )
            }

            const isExpanded = sidebarExpanded === section.label

            return (
              <div key={section.label} className="mb-0.5">
                <button
                  onClick={() => setSidebarExpanded(isExpanded ? null : section.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                    active && !isExpanded
                      ? 'bg-[#f5f0e8] text-[#4a5240]'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-[#4a5240]'
                  }`}
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  <span>{section.label}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    className={`w-3 h-3 text-stone-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="ml-3 pl-3 border-l border-stone-100 mt-0.5 mb-1 space-y-0.5">
                    {section.items.map(item => {
                      const itemActive = isItemActive(item.href)
                      return (
                        <a key={item.href} href={item.href}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
                            itemActive
                              ? 'bg-[#4a5240] text-white'
                              : 'text-stone-500 hover:bg-stone-50 hover:text-[#4a5240]'
                          }`}
                          style={{ fontFamily: 'var(--font-lato)', fontWeight: itemActive ? 400 : 300 }}>
                          {item.label}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom — Mon espace */}
        <div className="border-t border-stone-100 px-2 py-3 space-y-0.5">
          <a href={`/invite/${slug}`} target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-stone-500 hover:bg-stone-50 hover:text-[#4a5240] transition"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Vue invités
          </a>
          {/* Dropdown Paramètres */}
          <div>
            <button
              onClick={() => setSettingsOpen(o => !o)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs transition cursor-pointer ${settingsOpen ? 'bg-stone-50 text-[#4a5240]' : 'text-stone-500 hover:bg-stone-50 hover:text-[#4a5240]'}`}
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              <span className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Paramètres
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className={`w-3 h-3 text-stone-300 transition-transform ${settingsOpen ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {settingsOpen && (
              <div className="ml-3 pl-3 border-l border-stone-100 mt-1 mb-1 space-y-3 py-2">
                {/* Infos du mariage */}
                <a href={`/wedding/${slug}/edit`}
                  className="flex items-center gap-2 text-xs text-stone-500 hover:text-[#4a5240] transition"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Infos du mariage
                </a>

                {/* Formule */}
                <div>
                  <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.1em' }}
                    className="text-stone-300 uppercase mb-1">Formule</p>
                  {plan === 'mariage' || plan === 'pro' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[#4a5240]/10 text-[#4a5240] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>Mariage ✓</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full inline-block" style={{ fontWeight: 500 }}>Gratuite — 20 invités</span>
                      <a href={`https://kaatch-mariage.lemonsqueezy.com/checkout/buy/a9a7912e-a499-41a4-83ee-a885e4d3855c?checkout[custom][wedding_id]=${weddingId}&checkout[custom][plan]=mariage`}
                        className="block text-center bg-[#4a5240] text-white text-[10px] px-2 py-1.5 rounded-lg hover:bg-[#2d3228] transition"
                        style={{ fontWeight: 400 }}>
                        Passer à Mariage →
                      </a>
                    </div>
                  )}
                </div>

                {/* Identifiants */}
                {userEmail && (
                  <div>
                    <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.1em' }}
                      className="text-stone-300 uppercase mb-1">Connexion</p>
                    <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                      className="text-stone-400 truncate mb-1">{userEmail}</p>
                    <a href={`/wedding/${slug}/compte`}
                      className="text-[10px] text-[#4a5240] hover:underline"
                      style={{ fontWeight: 300 }}>
                      Gérer mon compte →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activité */}
          {log.length > 0 && (
            <div className="px-3 py-2">
              <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.12em' }}
                className="text-stone-300 uppercase mb-1.5">Activité récente</p>
              <ul className="space-y-1.5 max-h-24 overflow-y-auto">
                {log.slice(0, 3).map((entry, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-xs shrink-0">{entry.icon}</span>
                    <p style={{ fontWeight: 300, fontSize: '0.68rem', lineHeight: 1.4 }}
                      className="text-stone-400 truncate">{entry.message}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form action={logoutMaried} className="px-1">
            <button type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-stone-400 hover:text-red-400 hover:bg-red-50 transition cursor-pointer"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* ─── MOBILE TOP BAR ─── */}
      <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm transition-transform duration-300 ${navHidden ? '-translate-y-full' : ''}`}>
        <div className="flex items-center justify-between px-4 h-12">
          <a href={`/wedding/${slug}`}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }}
            className="text-[#2d3228]">
            {weddingName}
          </a>
          <div className="flex items-center gap-2">
            {unread > 0 && <span className="w-2 h-2 rounded-full bg-red-400" />}
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
            {sections.map(section => (
              <div key={section.label}>
                {!section.items ? (
                  <a href={section.href}
                    className={`flex items-center px-5 py-3 text-sm border-b border-stone-50 ${
                      isSectionActive(section) ? 'text-[#4a5240] bg-[#f5f0e8]' : 'text-stone-600'
                    }`}
                    style={{ fontWeight: isSectionActive(section) ? 400 : 300 }}>
                    {section.label}
                  </a>
                ) : (
                  <>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === section.label ? null : section.label)}
                      className={`w-full flex items-center justify-between px-5 py-3 text-sm border-b border-stone-50 cursor-pointer transition ${
                        isSectionActive(section) ? 'text-[#4a5240] bg-[#f5f0e8]' : 'text-stone-600'
                      }`}
                      style={{ fontWeight: isSectionActive(section) ? 400 : 300 }}>
                      <span>{section.label}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                        className={`w-3.5 h-3.5 text-stone-300 transition-transform ${mobileExpanded === section.label ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {mobileExpanded === section.label && section.items.map(item => (
                      <a key={item.href} href={item.href}
                        className={`flex flex-col px-6 py-2.5 border-b border-stone-50 ${
                          isItemActive(item.href) ? 'bg-[#f5f0e8] text-[#4a5240]' : 'text-stone-600'
                        }`}>
                        <span style={{ fontWeight: 300, fontSize: '0.85rem' }}>{item.label}</span>
                        {item.sub && <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">{item.sub}</span>}
                      </a>
                    ))}
                  </>
                )}
              </div>
            ))}
            <div className="border-t border-stone-100">
              <a href={`/invite/${slug}`} target="_blank" className="flex flex-col px-6 py-2.5 border-b border-stone-50 text-stone-600">
                <span style={{ fontWeight: 300, fontSize: '0.85rem' }}>Vue invités</span>
              </a>
              <a href={`/wedding/${slug}/edit`} className="flex flex-col px-6 py-2.5 border-b border-stone-50 text-stone-600">
                <span style={{ fontWeight: 300, fontSize: '0.85rem' }}>Paramètres</span>
              </a>
              {userEmail && (
                <div className="px-6 py-2.5 border-b border-stone-50">
                  <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">{userEmail}</p>
                </div>
              )}
              <form action={logoutMaried} className="px-6 py-3">
                <button type="submit" className="text-sm text-red-400 cursor-pointer" style={{ fontWeight: 300 }}>
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        )}
      </nav>

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[100] pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id}
            className="flex items-center gap-2 bg-[#2d3228] text-white text-sm px-4 py-2.5 rounded-full shadow-lg pointer-events-auto"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>
            <span>{toast.icon}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <KaatchChat />
    </>
  )
}
