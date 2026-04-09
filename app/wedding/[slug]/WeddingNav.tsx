'use client'

import { usePathname } from 'next/navigation'

export default function WeddingNav({ slug, weddingName, weddingId }: { slug: string; weddingName: string; weddingId: string }) {
  const pathname = usePathname()

  const tabs = [
    { label: 'Accueil', href: `/wedding/${slug}` },
    { label: 'Programme', href: `/wedding/${slug}/programme` },
    { label: 'Invités', href: `/wedding/${slug}/guests` },
    { label: 'Photos', href: `/wedding/${slug}/photos` },
    { label: 'Messages', href: `/wedding/${slug}/messagerie` },
    { label: 'Contacts', href: `/wedding/${slug}/contacts` },
  ]

  const isActive = (href: string) => {
    if (href === `/wedding/${slug}`) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-12">
        <a href={`/wedding/${slug}`}
           style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.1rem', fontStyle: 'italic' }}
           className="text-[#2d3228] shrink-0">
          {weddingName}
        </a>
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <a key={tab.href} href={tab.href}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition ${
                isActive(tab.href)
                  ? 'bg-[#4a5240] text-white'
                  : 'text-stone-500 hover:text-[#4a5240]'
              }`}
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}>
              {tab.label}
            </a>
          ))}
          <a href={`/invité/${slug}`}
            className="px-3 py-1 rounded-full text-xs whitespace-nowrap transition border border-[#4a5240] text-[#4a5240] hover:bg-[#4a5240] hover:text-white ml-2"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}>
            👁 Vue invité
          </a>
        </div>
      </div>
    </nav>
  )
}
