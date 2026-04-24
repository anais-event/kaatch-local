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

        {/* Tabs — emoji uniquement, label en tooltip */}
        <div className="flex items-center gap-1 flex-1 ml-3 justify-end">
          {tabs.map(tab => (
            <a key={tab.href} href={tab.href} title={tab.label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all shrink-0 ${
                isActive(tab.href)
                  ? 'bg-[#4a5240] shadow-sm'
                  : 'hover:bg-stone-200/60'
              }`}>
              {tab.emoji}
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
