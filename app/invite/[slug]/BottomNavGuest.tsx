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
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      label: 'Photos',
      href: `/invite/${slug}/photos`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      label: 'Accueil',
      href: `/invite/${slug}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      center: true,
    },
    {
      label: 'Chat',
      href: `/invite/${slug}/groupes`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      label: 'Contacts',
      href: `/invite/${slug}/contacts`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
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
                <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-5 shadow-md transition-all ${
                  active
                    ? 'bg-[#2d3228] text-white'
                    : 'bg-[#4a5240] text-white hover:bg-[#2d3228]'
                }`}>
                  {tab.icon}
                </div>
              ) : (
                <span className={`transition-colors ${active ? 'text-[#4a5240]' : 'text-stone-400'}`}>
                  {tab.icon}
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
