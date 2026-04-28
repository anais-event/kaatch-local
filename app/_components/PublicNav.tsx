'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const DISPLAY = 'var(--font-display)'
const BODY = 'var(--font-body)'
const CREAM = '#f5f0e8'
const GREEN = '#2C3B2E'

const links = [
  { label: 'Comment ça marche', sub: null,       href: '/#comment-ca-marche' },
  { label: 'Offres',            sub: null,       href: '/#offres' },
  { label: 'Inspirations',      sub: 'Le Blog',  href: '/inspirations' },
  { label: 'Entre nous',        sub: 'Le Forum', href: '/entre-nous' },
]

export default function PublicNav({ active }: { active?: 'inspirations' | 'entre-nous' }) {
  const [open, setOpen] = useState(false)

  return (
    <nav
      style={{ background: `${CREAM}f5`, backdropFilter: 'blur(12px)' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/60"
    >
      <div className="max-w-5xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="Kaatch" width={30} height={30} className="rounded-lg" />
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: GREEN }}>
            Kaatch
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`flex flex-col items-center px-3 py-1.5 rounded-lg transition hover:bg-stone-100 ${active === l.href.slice(1) ? 'bg-stone-100' : ''}`}>
              <span className="text-sm leading-tight"
                style={{ fontFamily: BODY, fontWeight: 300, color: '#78716c' }}>
                {l.label}
              </span>
              {l.sub && (
                <span className="text-[10px] leading-tight text-stone-400" style={{ fontFamily: BODY, fontWeight: 300 }}>
                  {l.sub}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Right CTAs + hamburger */}
        <div className="flex items-center gap-2">
          <Link href="/rejoindre"
            className="text-sm border border-stone-300 text-stone-600 px-4 py-2 rounded-full hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition hidden sm:block"
            style={{ fontFamily: BODY, fontWeight: 400 }}>
            Invité ?
          </Link>
          <Link href="/auth"
            className="text-sm bg-[#2C3B2E] text-white px-4 py-2 rounded-full hover:bg-[#1a2419] transition"
            style={{ fontFamily: BODY, fontWeight: 500 }}>
            Connexion
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl hover:bg-stone-100 transition ml-1"
            aria-label="Menu"
          >
            <span className={`block w-5 h-0.5 bg-[#2C3B2E] transition-all duration-200 ${open ? 'rotate-45 translate-y-1' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[#2C3B2E] mt-1 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[#2C3B2E] mt-1 transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-stone-200/60 bg-[#f5f0e8]">
          <div className="px-5 py-4 space-y-1">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-stone-100 transition">
                <span style={{ fontFamily: BODY, fontWeight: 400, fontSize: '0.95rem', color: GREEN }}>
                  {l.label}
                </span>
                {l.sub && (
                  <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full"
                    style={{ fontFamily: BODY, fontWeight: 300 }}>
                    {l.sub}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-3 border-t border-stone-200 flex gap-2">
              <Link href="/rejoindre" onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm border border-stone-300 text-stone-600 py-2.5 rounded-full hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition"
                style={{ fontFamily: BODY, fontWeight: 400 }}>
                Invité ?
              </Link>
              <Link href="/auth" onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm bg-[#2C3B2E] text-white py-2.5 rounded-full hover:bg-[#1a2419] transition"
                style={{ fontFamily: BODY, fontWeight: 500 }}>
                Connexion
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
