import Link from 'next/link'
import { getAllInspirations, categoryLabel, categoryColor, categoryBg, type InspirationCategory } from '@/lib/inspirations'
import type { Metadata } from 'next'
import PublicNav from '@/app/_components/PublicNav'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Inspirations — Kaatch',
  description: 'Astuces, bons plans et conseils pour organiser votre mariage sereinement.',
}

const DISPLAY = 'var(--font-display)'
const GREEN = '#2C3B2E'
const CREAM = '#f5f0e8'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function InspirationsPage() {
  const all = getAllInspirations()
  const articles = all.filter(i => i.category === 'article')
  const shorts = all.filter(i => i.category !== 'article')

  return (
    <main style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228', background: CREAM, minHeight: '100vh' }}>

      <PublicNav active="inspirations" />

      <div className="pt-28 pb-24 px-6 max-w-5xl mx-auto">

        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontWeight: 500, color: GREEN }}>
            Inspirations
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em', color: GREEN }}
              className="mb-4">
            Conseils, astuces,<br />bons plans.
          </h1>
          <p className="text-stone-500 max-w-lg" style={{ fontSize: '1rem', lineHeight: 1.8 }}>
            Tout ce qu&apos;on aurait aimé savoir avant d&apos;organiser un mariage.
          </p>
        </div>

        {articles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xs tracking-[0.2em] uppercase mb-6 text-stone-400" style={{ fontWeight: 500 }}>
              Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {articles.map(item => (
                <Link key={item.slug} href={`/inspirations/${item.slug}`}
                      className="group bg-white rounded-2xl p-7 border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all block"
                      style={{ boxShadow: '0 2px 12px rgba(44,59,46,0.05)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{ background: categoryBg[item.category], color: categoryColor[item.category] }}>
                      {categoryLabel[item.category]}
                    </span>
                    <span className="text-xs text-stone-400">{item.readTime}</span>
                  </div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: GREEN }}
                      className="mb-3 group-hover:opacity-80 transition">
                    {item.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                    {item.excerpt}
                  </p>
                  <p className="text-xs text-stone-400 mt-5" style={{ fontWeight: 300 }}>
                    {formatDate(item.date)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {shorts.length > 0 && (
          <section>
            <h2 className="text-xs tracking-[0.2em] uppercase mb-6 text-stone-400" style={{ fontWeight: 500 }}>
              Astuces &amp; bons plans
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {shorts.map(item => (
                <Link key={item.slug} href={`/inspirations/${item.slug}`}
                      className="group rounded-2xl p-6 border border-stone-100 hover:shadow-md transition-all block"
                      style={{ background: categoryBg[item.category as InspirationCategory] }}>
                  <div className="mb-3">
                    <span className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{ background: 'white', color: categoryColor[item.category] }}>
                      {categoryLabel[item.category]}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.35, color: GREEN }}
                      className="mb-2 group-hover:opacity-80 transition">
                    {item.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed line-clamp-3" style={{ fontWeight: 300 }}>
                    {item.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
