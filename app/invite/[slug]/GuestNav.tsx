'use client'
import { usePathname } from 'next/navigation'

export default function GuestNav({ slug }: { slug: string }) {
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
      <div className="max-w-2xl mx-auto flex justify-around px-4 pt-3 pb-0 overflow-x-auto">
        {tabs.map(tab => (
          <a key={tab.href} href={tab.href}
            className={`pb-3 text-xs whitespace-nowrap px-2 border-b-2 transition-colors ${
              isActive(tab.href)
                ? 'border-[#4a5240] text-[#4a5240]'
                : 'border-transparent text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240]'
            }`}
            style={{ fontWeight: 400, letterSpacing: '0.04em' }}>
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
