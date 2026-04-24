'use client'

import { usePathname } from 'next/navigation'

export default function GuestNav({ slug, isPreview }: { slug: string; isPreview?: boolean }) {
  const pathname = usePathname()

  const tabs = [
    { emoji: '📋', label: 'Programme',  href: `/invite/${slug}/programme` },
    { emoji: '📸', label: 'Photos',     href: `/invite/${slug}/photos` },
    { emoji: '💬', label: 'Messagerie', href: `/invite/${slug}/groupes` },
    { emoji: '🏡', label: 'Hébergements', href: `/invite/${slug}/hebergements` },
    { emoji: '💌', label: 'Faire-part', href: `/invite/${slug}/faire-part` },
    { emoji: '📖', label: 'Livre d\'Or', href: `/invite/${slug}/livre-dor` },
    { emoji: '🎉', label: 'Surprises',  href: `/invite/${slug}/surprises` },
    { emoji: '👤', label: 'Mon compte', href: `/invite/${slug}/compte` },
  ]

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-12">

        {/* Logo */}
        <a href={`/invite/${slug}`}
           style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1rem', fontStyle: 'italic' }}
           className="text-[#2d3228] shrink-0">
          ✦
        </a>

        {/* Tabs scrollables */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1 ml-2">
          {tabs.map(tab => (
            <a key={tab.href} href={tab.href}
              className={`whitespace-nowrap px-2 py-1.5 rounded-md transition-colors shrink-0 flex items-center gap-1 ${
                isActive(tab.href)
                  ? 'bg-[#4a5240] text-white'
                  : 'text-stone-400 hover:text-[#4a5240]'
              }`}
              style={{ fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.02em' }}>
              <span>{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </a>
          ))}
          {isPreview && (
            <a href={`/wedding/${slug}`}
              className="text-xs text-[#4a5240] border border-[#4a5240] px-2.5 py-1.5 rounded-md hover:bg-[#4a5240] hover:text-white transition whitespace-nowrap shrink-0 ml-1"
              style={{ fontWeight: 300 }}>
              ← Mariés
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
