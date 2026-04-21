'use client'
import { usePathname } from 'next/navigation'

export default function GuestNav({ slug, isPreview }: { slug: string; isPreview?: boolean }) {
  const pathname = usePathname()
  const tabs = [
    { label: 'Accueil', short: 'Accueil', href: `/invite/${slug}` },
    { label: 'Programme', short: 'Programme', href: `/invite/${slug}/programme` },
    { label: 'Photos', short: 'Photos', href: `/invite/${slug}/photos` },
    { label: 'Messagerie', short: 'Chat', href: `/invite/${slug}/groupes` },
    { label: '🎉 Surprises', short: '🎉', href: `/invite/${slug}/surprises` },
    { label: 'Prestataires', short: 'Contacts', href: `/invite/${slug}/contacts` },
  ]
  const isActive = (href: string) => {
    if (href === `/invite/${slug}`) return pathname === href
    return pathname.startsWith(href)
  }
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-12">

        {/* Logo / Accueil — gauche */}
        <a href={`/invite/${slug}`}
           style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1rem', fontStyle: 'italic' }}
           className="text-[#2d3228] shrink-0">
          ✦
        </a>

        {/* Tabs — droite */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {tabs.filter(t => t.href !== `/invite/${slug}`).map(tab => (
            <a key={tab.href} href={tab.href}
              className={`text-xs whitespace-nowrap px-2.5 py-1.5 rounded-md transition-colors ${
                isActive(tab.href)
                  ? 'bg-[#4a5240] text-white'
                  : 'text-stone-400 hover:text-[#4a5240]'
              }`}
              style={{ fontWeight: 400, letterSpacing: '0.04em' }}>
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </a>
          ))}
          {isPreview && (
            <a href={`/wedding/${slug}`}
              className="text-xs text-[#4a5240] border border-[#4a5240] px-2.5 py-1.5 rounded-md hover:bg-[#4a5240] hover:text-white transition whitespace-nowrap shrink-0 ml-1"
              style={{ fontWeight: 300, letterSpacing: '0.04em' }}>
              ← Mariés
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
