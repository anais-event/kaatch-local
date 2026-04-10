'use client'

import { usePathname } from 'next/navigation'
import { logoutMaried } from './logout-action'

export default function WeddingNav({ slug, weddingName }: { slug: string; weddingName: string; weddingId: string }) {
  const pathname = usePathname()

  const organiser = [
    { label: 'Tableau de bord', href: `/wedding/${slug}` },
    { label: 'Programme', href: `/wedding/${slug}/programme` },
    { label: 'Invités', href: `/wedding/${slug}/guests` },
    { label: 'Prestataires', href: `/wedding/${slug}/contacts` },
  ]

  const contenu = [
    { label: 'Photos', href: `/wedding/${slug}/photos` },
    { label: 'Messagerie', href: `/wedding/${slug}/messagerie` },
    { label: 'Le mot des mariés', href: `/wedding/${slug}/regles` },
  ]

  const isActive = (href: string) => {
    if (href === `/wedding/${slug}`) return pathname === href
    return pathname.startsWith(href)
  }

  const tabClass = (href: string) =>
    `px-3 py-1 rounded-md text-xs whitespace-nowrap transition cursor-pointer ${
      isActive(href) ? 'bg-[#4a5240] text-white' : 'text-stone-500 hover:text-[#4a5240]'
    }`

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-3 h-12">
        {/* Nom du mariage */}
        <a href={`/wedding/${slug}`}
           style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.05rem', fontStyle: 'italic' }}
           className="text-[#2d3228] shrink-0 mr-2">
          {weddingName}
        </a>

        {/* Groupe 1 — Organiser */}
        <div className="flex items-center gap-0.5">
          {organiser.map(tab => (
            <a key={tab.href} href={tab.href}
              className={tabClass(tab.href)}
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}>
              {tab.label}
            </a>
          ))}
        </div>

        {/* Séparateur */}
        <span className="w-px h-4 bg-stone-300 shrink-0" />

        {/* Groupe 2 — Contenu partagé */}
        <div className="flex items-center gap-0.5">
          {contenu.map(tab => (
            <a key={tab.href} href={tab.href}
              className={tabClass(tab.href)}
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}>
              {tab.label}
            </a>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Vue invité */}
        <a href={`/invite/${slug}`}
          className="px-3 py-1 rounded-md text-xs whitespace-nowrap transition border border-[#4a5240] text-[#4a5240] hover:bg-[#4a5240] hover:text-white"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}>
          Vue invité
        </a>

        {/* Déconnexion */}
        <form action={logoutMaried}>
          <button type="submit"
            className="px-3 py-1 rounded-md text-xs text-stone-400 hover:text-red-400 transition cursor-pointer"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Déconnexion
          </button>
        </form>
      </div>
    </nav>
  )
}
