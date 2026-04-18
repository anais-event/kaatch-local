'use client'

import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { logoutMaried } from './logout-action'

type NavItem = { label: string; href: string; sub?: string; target?: string }
type NavSection = { label: string; href?: string; items?: NavItem[] }

export default function WeddingNav({ slug, weddingName, weddingId }: { slug: string; weddingName: string; weddingId: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const sections: NavSection[] = [
    {
      label: 'Accueil',
      href: `/wedding/${slug}`,
    },
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
        { label: 'Photos', sub: 'Album partagé', href: `/wedding/${slug}/photos` },
        { label: 'Hébergements', sub: 'Options aux alentours', href: `/wedding/${slug}/hebergements` },
      ],
    },
    {
      label: 'Messagerie',
      href: `/wedding/${slug}/messagerie`,
    },
    {
      label: 'Compte',
      items: [
        { label: 'Vue invités', sub: 'Aperçu de votre espace', href: `/invite/${slug}`, target: '_blank' },
        { label: 'Paramètres', sub: 'Infos du mariage', href: `/wedding/${slug}/edit` },
        { label: 'Partager', sub: 'Lien & QR code', href: `/wedding/${slug}/partager` },
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
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-12">

        {/* Logo / nom */}
        <a href={`/wedding/${slug}`}
           style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.1rem', fontStyle: 'italic' }}
           className="text-[#2d3228] shrink-0 mr-4">
          {weddingName}
        </a>

        {/* Sections */}
        <div className="flex items-center gap-0.5">
          {sections.map(section => {
            const active = isActive(section)

            if (!section.items) {
              // Lien simple
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

            // Dropdown
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
                        <a key={item.href} href={item.href}
                           target={item.target}
                           onClick={() => setOpen(null)}
                           className={`flex flex-col px-4 py-2.5 hover:bg-[#f5f0e8] transition ${itemActive ? 'bg-[#f5f0e8]' : ''}`}>
                          <span style={{ fontFamily: 'var(--font-lato)', fontWeight: itemActive ? 400 : 300, fontSize: '0.82rem' }}
                                className={itemActive ? 'text-[#4a5240]' : 'text-stone-700'}>
                            {item.label}
                          </span>
                          {item.sub && (
                            <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">
                              {item.sub}
                            </span>
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
      </div>
    </nav>
  )
}
