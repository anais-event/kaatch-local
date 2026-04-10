'use client'
import { usePathname } from 'next/navigation'

export default function GuestNav({ slug, isPreview }: { slug: string; isPreview?: boolean }) {
  const pathname = usePathname()
  const tabs = [
    { label: 'Accueil', short: 'Accueil', href: `/invite/${slug}` },
    { label: 'Programme', short: 'Programme', href: `/invite/${slug}/programme` },
    { label: 'Photos', short: 'Photos', href: `/invite/${slug}/photos` },
    { label: 'Messagerie', short: 'Chat', href: `/invite/${slug}/groupes` },
    { label: 'Prestataires', short: 'Contacts', href: `/invite/${slug}/contacts` },
  ]
  const isActive = (href: string) => {
    if (href === `/invite/${slug}`) return pathname === href
    return pathname.startsWith(href)
  }
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-12">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
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
        </div>
        {isPreview && (
          <a href={`/wedding/${slug}`}
            className="text-xs text-[#4a5240] border border-[#4a5240] px-3 py-1 rounded-md hover:bg-[#4a5240] hover:text-white transition whitespace-nowrap shrink-0 ml-2"
            style={{ fontWeight: 300, letterSpacing: '0.04em' }}>
            ← Mode mariés
          </a>
        )}
      </div>
    </nav>
  )
}
