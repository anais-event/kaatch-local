'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

const DISPLAY = 'var(--font-display)'
const BODY = 'var(--font-body)'
const CREAM = '#f5f0e8'
const GREEN = '#2C3B2E'

const features = [
  { icon: '💌', label: 'Faire-parts & RSVP',   desc: 'Invitations animées, réponses en direct',       href: '/fonctionnalites/faire-part-rsvp' },
  { icon: '🪑', label: 'Plan de table',          desc: 'Glisser-déposer, ajusté jusqu\'à la veille',   href: '/fonctionnalites/plan-de-table' },
  { icon: '📸', label: 'Album photo partagé',    desc: 'Toutes les photos, un seul endroit',           href: '/fonctionnalites/album-photo' },
  { icon: '📅', label: 'Programme jour J',       desc: 'Le déroulé complet pour vos invités',          href: '/fonctionnalites/programme-jour-j' },
  { icon: '🔗', label: 'Espace invités',         desc: 'Sans compte, sans friction',                   href: '/fonctionnalites/espace-invites' },
  { icon: '📝', label: "Livre d'or",             desc: 'Mots doux et souvenirs pour toujours',         href: '/fonctionnalites/livre-dor' },
]

const navLinks = [
  { label: 'Studio',       sub: 'Créatif',  href: '/#studio' },
  { label: 'Calculette',   sub: 'Budget',   href: '/calculette' },
  { label: 'Inspirations', sub: 'Le Blog',  href: '/inspirations' },
  { label: 'Entre nous',   sub: 'Le Forum', href: '/entre-nous' },
]

export default function PublicNav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileFeatsOpen, setMobileFeatsOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setDropOpen(false); setOpen(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <nav
      style={{ background: `${CREAM}f5`, backdropFilter: 'blur(12px)' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/60"
    >
      <div className="max-w-5xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => { setOpen(false); setDropOpen(false) }}>
          <Image src="/logo.png" alt="Kaatch" width={30} height={30} className="rounded-lg" />
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: GREEN }}>
            Kaatch
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">

          {/* Fonctionnalités dropdown */}
          <div
            ref={dropRef}
            className="relative"
            onMouseEnter={() => setDropOpen(true)}
            onMouseLeave={() => setDropOpen(false)}
          >
            <button
              onClick={() => setDropOpen(o => !o)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition hover:bg-stone-100"
              aria-expanded={dropOpen}
            >
              <span className="text-sm leading-tight" style={{ fontFamily: BODY, fontWeight: 300, color: '#78716c' }}>
                Découvrir
              </span>
              <span className="text-[10px] leading-tight text-stone-400 -mt-0.5" style={{ fontFamily: BODY, fontWeight: 300 }}>
                Kaatch
              </span>
              <svg
                width="10" height="10" viewBox="0 0 10 10" fill="none"
                className={`transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
                style={{ color: '#a8a29e' }}
              >
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[460px] bg-white rounded-2xl border border-stone-100 p-3"
                style={{ boxShadow: '0 8px 32px rgba(44,59,46,0.12), 0 2px 8px rgba(44,59,46,0.06)' }}
              >
                <div className="grid grid-cols-2 gap-1">
                  {features.map(f => (
                    <Link
                      key={f.href}
                      href={f.href}
                      onClick={() => setDropOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f5f0e8] transition"
                    >
                      <span className="text-lg mt-0.5 shrink-0">{f.icon}</span>
                      <div>
                        <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.82rem', color: GREEN }}>{f.label}</p>
                        <p style={{ fontWeight: 300, fontSize: '0.72rem', color: '#78716c', lineHeight: 1.4, fontFamily: BODY }}>{f.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-stone-100 px-3">
                  <Link
                    href="/#comment-ca-marche"
                    onClick={() => setDropOpen(false)}
                    className="text-xs text-stone-400 hover:text-[#2C3B2E] transition"
                    style={{ fontWeight: 300, fontFamily: BODY }}
                  >
                    Voir comment ça marche →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center px-3 py-1.5 rounded-lg transition hover:bg-stone-100 ${active === l.href.slice(1) ? 'bg-stone-100' : ''}`}
            >
              <span className="text-sm leading-tight" style={{ fontFamily: BODY, fontWeight: 300, color: '#78716c' }}>
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Desktop CTAs */}
          <Link
            href="/rejoindre"
            className="text-sm border border-stone-300 text-stone-600 px-4 py-2 rounded-full hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition hidden md:block"
            style={{ fontFamily: BODY, fontWeight: 400 }}
          >
            Invité ?
          </Link>
          <Link
            href="/auth"
            className="text-sm bg-[#2C3B2E] text-white px-4 py-2 rounded-full hover:bg-[#1a2419] transition hidden md:block"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            Connexion
          </Link>

          {/* Mobile primary CTA */}
          <Link
            href="/auth"
            className="md:hidden text-sm bg-[#2C3B2E] text-white px-4 py-2 rounded-full hover:bg-[#1a2419] transition"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            Commencer →
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl hover:bg-stone-100 transition ml-1"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <span className={`block w-5 h-0.5 bg-[#2C3B2E] transition-all duration-200 ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[#2C3B2E] mt-1.5 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[#2C3B2E] mt-1.5 transition-all duration-200 ${open ? '-rotate-45 -translate-y-3' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-200/60 bg-[#f5f0e8]">
          <div className="px-5 py-4 space-y-1">

            {/* Fonctionnalités — expandable */}
            <button
              onClick={() => setMobileFeatsOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-stone-100 transition"
            >
              <span style={{ fontFamily: BODY, fontWeight: 400, fontSize: '0.95rem', color: GREEN }}>Découvrir Kaatch</span>
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`transition-transform duration-200 ${mobileFeatsOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 4L6 8L10 4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {mobileFeatsOpen && (
              <div className="ml-3 space-y-0.5 pb-1">
                {features.map(f => (
                  <Link
                    key={f.href}
                    href={f.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-stone-100 transition"
                  >
                    <span className="text-base shrink-0">{f.icon}</span>
                    <span style={{ fontFamily: BODY, fontWeight: 400, fontSize: '0.9rem', color: GREEN }}>{f.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-stone-100 transition"
              >
                <span style={{ fontFamily: BODY, fontWeight: 400, fontSize: '0.95rem', color: GREEN }}>{l.label}</span>
                {l.sub && (
                  <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full" style={{ fontFamily: BODY, fontWeight: 300 }}>
                    {l.sub}
                  </span>
                )}
              </Link>
            ))}

            <div className="pt-3 border-t border-stone-200 flex gap-2">
              <Link
                href="/rejoindre"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm border border-stone-300 text-stone-600 py-2.5 rounded-full hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition"
                style={{ fontFamily: BODY, fontWeight: 400 }}
              >
                Invité ?
              </Link>
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm bg-[#2C3B2E] text-white py-2.5 rounded-full hover:bg-[#1a2419] transition"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                Connexion
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
