'use client'

import { usePathname } from 'next/navigation'

export default function WeddingNav({ slug, weddingName }: { slug: string; weddingName: string; weddingId: string }) {
  const pathname = usePathname()

  const tabs = [
    { label: 'Tableau de bord', href: `/wedding/${slug}` },
    { label: 'Photos', href: `/wedding/${slug}/photos` },
    { label: 'Messagerie', href: `/wedding/${slug}/messagerie` },
    { label: 'Le mot des mariés', href: `/wedding/${slug}/regles` },
  ]

  const isActive = (href: string) => {
    if (href === `/wedding/${slug}`) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-12">

        {/* Nom — gauche */}
        <a href={`/wedding/${slug}`}
           style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.05rem', fontStyle: 'italic' }}
           className="text-[#2d3228] shrink-0">
          {weddingName}
        </a>

        {/* Tabs — centrés */}
        <div className="flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {tabs.map(tab => (
            <a key={tab.href} href={tab.href}
              className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition ${
                isActive(tab.href) ? 'bg-[#4a5240] text-white' : 'text-stone-500 hover:text-[#4a5240]'
              }`}
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}>
              {tab.label}
            </a>
          ))}
        </div>

        {/* Vue invité — droite */}
        <a href={`/invite/${slug}`} target="_blank" rel="noopener noreferrer"
          className="px-3 py-1 rounded-md text-xs whitespace-nowrap border border-[#4a5240] text-[#4a5240] hover:bg-[#4a5240] hover:text-white transition shrink-0"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.04em' }}>
          Vue invité ↗
        </a>
      </div>
    </nav>
  )
}
