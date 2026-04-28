import Image from 'next/image'
import Link from 'next/link'

const DISPLAY = 'var(--font-geist-sans)'
const CREAM = '#f5f0e8'
const GREEN = '#2C3B2E'

export default function PublicNav({ active }: { active?: 'inspirations' | 'entre-nous' }) {
  return (
    <nav
      style={{ background: `${CREAM}f2`, backdropFilter: 'blur(12px)' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/60"
    >
      <div className="max-w-5xl mx-auto px-8 md:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Kaatch" width={32} height={32} className="rounded-lg" />
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: GREEN }}>
            Kaatch
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/#comment-ca-marche"
            className="text-sm text-stone-500 hover:text-[#2C3B2E] transition px-3 py-2 rounded-lg hover:bg-stone-100"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Comment ça marche
          </Link>
          <Link href="/#offres"
            className="text-sm text-stone-500 hover:text-[#2C3B2E] transition px-3 py-2 rounded-lg hover:bg-stone-100"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Offres
          </Link>

          {/* Inspirations — 2 lignes */}
          <Link href="/inspirations"
            className={`flex flex-col items-center px-3 py-1.5 rounded-lg transition hover:bg-stone-100 ${active === 'inspirations' ? 'bg-stone-100' : ''}`}>
            <span className="text-sm leading-tight" style={{ fontFamily: 'var(--font-lato)', fontWeight: active === 'inspirations' ? 500 : 300, color: active === 'inspirations' ? GREEN : '#78716c' }}>
              Inspirations
            </span>
            <span className="text-[10px] leading-tight text-stone-400" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              Le Blog
            </span>
          </Link>

          {/* Entre nous — 2 lignes */}
          <Link href="/entre-nous"
            className={`flex flex-col items-center px-3 py-1.5 rounded-lg transition hover:bg-stone-100 ${active === 'entre-nous' ? 'bg-stone-100' : ''}`}>
            <span className="text-sm leading-tight" style={{ fontFamily: 'var(--font-lato)', fontWeight: active === 'entre-nous' ? 500 : 300, color: active === 'entre-nous' ? GREEN : '#78716c' }}>
              Entre nous
            </span>
            <span className="text-[10px] leading-tight text-stone-400" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              Le Forum
            </span>
          </Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/rejoindre"
            className="text-sm border border-stone-300 text-stone-600 px-5 py-2.5 rounded-full hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition hidden sm:block"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 400 }}>
            Invité ?
          </Link>
          <Link href="/auth"
            className="text-sm bg-[#2C3B2E] text-white px-5 py-2.5 rounded-full hover:bg-[#1a2419] transition"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 500 }}>
            Connexion →
          </Link>
        </div>
      </div>
    </nav>
  )
}
