'use client'

import { usePathname } from 'next/navigation'

export default function BottomNavGuest({ slug }: { slug: string }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === `/invite/${slug}`) return pathname === href
    return pathname.startsWith(href)
  }

  const tabs = [
    {
      label: 'Programme',
      href: `/invite/${slug}/programme`,
      emoji: '📋',
    },
    {
      label: 'Photos',
      href: `/invite/${slug}/photos`,
      emoji: '📸',
    },
    {
      label: 'Accueil',
      href: `/invite/${slug}`,
      emoji: '🏡',
      center: true,
    },
    {
      label: 'Chat',
      href: `/invite/${slug}/groupes`,
      emoji: '💬',
    },
    {
      label: 'Faire-part',
      href: `/invite/${slug}/faire-part`,
      emoji: '💌',
    },
  ]

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-t border-stone-200">
      <div className="flex items-end justify-around px-2 h-16">
        {tabs.map(tab => {
          const active = isActive(tab.href)
          return (
            <a
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-all"
            >
              {tab.center ? (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-5 shadow-md transition-all text-xl ${
                  active ? 'bg-[#2d3228]' : 'bg-[#4a5240] hover:bg-[#2d3228]'
                }`}>
                  {tab.emoji}
                </div>
              ) : (
                <span className={`text-xl transition-all ${active ? 'scale-110' : 'opacity-60'}`}>
                  {tab.emoji}
                </span>
              )}
              <span
                className={`text-[10px] transition-colors ${active ? 'text-[#4a5240]' : 'text-stone-400'}`}
                style={{ fontWeight: active ? 500 : 300, letterSpacing: '0.04em' }}
              >
                {tab.label}
              </span>
            </a>
          )
        })}
      </div>
      <div className="h-safe-bottom bg-[#f5f0e8]/95" />
    </nav>
  )
}
