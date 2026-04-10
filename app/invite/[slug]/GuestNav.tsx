'use client'
import { usePathname } from 'next/navigation'

export default function GuestNav({ slug, isPreview }: { slug: string; isPreview?: boolean }) {
  const pathname = usePathname()
  const tabs = [
    { label: 'Accueil', href: `/invite/${slug}` },
    { label: 'Programme', href: `/invite/${slug}/programme` },
    { label: 'Photos', href: `/invite/${slug}/photos` },
    { label: 'Messagerie', href: `/invite/${slug}/groupes` },
    { label: 'Prestataires', href: `/invite/${slug}/contacts` },
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
              className={`pb-0 text-xs whitespace-nowrap px-2 py-1 rounded-md transition-colors ${
                isActive(tab.href)
                  ? 'bg-[#4a5240] text-white'
                  : 'text-stone-400 hover:text-[#4a5240]'
              }`}
              style={{ fontWeight: 400, letterSpacing: '0.04em' }}>
              {tab.label}
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
