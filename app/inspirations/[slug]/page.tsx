import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllSlugs, getInspiration, categoryLabel, categoryColor } from '@/lib/inspirations'
import type { Metadata } from 'next'

const DISPLAY = 'var(--font-display)'
const GREEN = '#2C3B2E'
const CREAM = '#f5f0e8'

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = getInspiration(slug)
  if (!item) return {}
  return {
    title: `${item.title} — Kaatch`,
    description: item.excerpt,
    openGraph: {
      title: item.title,
      description: item.excerpt,
      url: `https://kaatch.fr/inspirations/${slug}`,
      siteName: "Kaatch",
      locale: "fr_FR",
      type: "article",
      publishedTime: item.date,
      images: [{ url: "https://kaatch.fr/og-image.png", width: 1200, height: 630, alt: item.title }],
    },
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Callout({ type, children }: { type?: string; children: React.ReactNode }) {
  const styles: Record<string, { bg: string; border: string; color: string }> = {
    tip:     { bg: '#eef1ec', border: GREEN,      color: GREEN },
    info:    { bg: '#eef6fb', border: '#3b82f6',  color: '#1e40af' },
    warning: { bg: '#fefce8', border: '#eab308',  color: '#854d0e' },
  }
  const s = styles[type || 'tip'] || styles.tip
  return (
    <div style={{
      background: s.bg,
      borderLeft: `4px solid ${s.border}`,
      borderRadius: '0 1rem 1rem 0',
      padding: '1.25rem 1.5rem',
      margin: '2rem 0',
      color: s.color,
      fontSize: '0.9rem',
      lineHeight: 1.8,
      fontWeight: 400,
    }}>
      {children}
    </div>
  )
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: 1.2, letterSpacing: '-0.02em', color: GREEN, marginTop: '2.5rem', marginBottom: '1rem' }}
        {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.15rem', color: GREEN, marginTop: '2.5rem', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}
        {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '1rem', color: GREEN, marginTop: '1.75rem', marginBottom: '0.5rem' }}
        {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p style={{ fontSize: '0.95rem', lineHeight: 1.9, fontWeight: 300, marginBottom: '1rem' }}
       className="text-stone-500" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul style={{ marginBottom: '1rem' }} className="space-y-2" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li style={{ fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 300 }}
        className="flex items-start gap-3 text-stone-500">
      <span style={{ color: GREEN, fontWeight: 600, marginTop: 2, flexShrink: 0 }}>–</span>
      <span {...props} />
    </li>
  ),
  hr: () => (
    <hr style={{ borderColor: '#e7e5e4', margin: '2rem 0' }} />
  ),
  blockquote: ({ children }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <div style={{ background: '#eef1ec', borderLeft: `4px solid ${GREEN}`, borderRadius: '0 1rem 1rem 0', padding: '1.25rem 1.5rem', margin: '2rem 0' }}>
      <div style={{ fontSize: '0.9rem', lineHeight: 1.8, fontWeight: 400, color: GREEN }}>
        {children}
      </div>
    </div>
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong style={{ fontWeight: 600, color: '#44403c' }} {...props} />
  ),
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} style={{ color: GREEN, textDecoration: 'underline', fontWeight: 400 }}
       target={href?.startsWith('http') ? '_blank' : undefined}
       rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
       {...props}>
      {children}
    </a>
  ),
  Callout,
  CTA: ({ title, description, buttonText, buttonLink }: {
    title?: string
    description?: string
    buttonText?: string
    buttonLink?: string
  }) => (
    <div className="mt-16 rounded-2xl bg-white p-8 border border-stone-100 text-center"
         style={{ boxShadow: '0 2px 16px rgba(44,59,46,0.06)' }}>
      <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.1rem', color: GREEN, marginBottom: 8 }}>
        {title ?? 'Envie de tout gérer au même endroit ?'}
      </p>
      <p className="text-stone-500 text-sm mb-6" style={{ fontWeight: 300 }}>
        {description ?? 'Kaatch vous aide à organiser votre mariage de A à Z — invités, plan de table, budget, photos.'}
      </p>
      <Link href={buttonLink ?? '/auth'}
            className="inline-block text-white px-8 py-3.5 rounded-xl hover:opacity-90 transition text-sm"
            style={{ background: GREEN, fontWeight: 500 }}>
        {buttonText ?? 'Créer mon espace gratuitement →'}
      </Link>
    </div>
  ),
}

export default async function InspirationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = getInspiration(slug)
  if (!item) notFound()

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": item.title,
    "description": item.excerpt,
    "datePublished": item.date,
    "dateModified": item.date,
    "inLanguage": "fr",
    "url": `https://kaatch.fr/inspirations/${slug}`,
    "image": "https://kaatch.fr/og-image.png",
    "author": {
      "@type": "Organization",
      "name": "Kaatch",
      "url": "https://kaatch.fr",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kaatch",
      "url": "https://kaatch.fr",
      "logo": { "@type": "ImageObject", "url": "https://kaatch.fr/logo.png" },
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://kaatch.fr/inspirations/${slug}` },
  }

  return (
    <main className="min-h-screen" style={{ background: CREAM }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
           style={{ background: 'rgba(245,240,232,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(44,59,46,0.08)' }}>
        <Link href="/" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.1rem', color: GREEN }}>
          Kaatch
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/inspirations" className="text-sm text-stone-500 hover:text-stone-700 transition" style={{ fontWeight: 300 }}>
            Inspirations
          </Link>
          <Link href="/auth"
                className="text-sm px-4 py-2 rounded-xl border transition hover:opacity-80"
                style={{ borderColor: GREEN, color: GREEN, fontWeight: 500 }}>
            Mon espace
          </Link>
        </div>
      </nav>

      <article className="pt-28 pb-24 px-6">
        <div className="max-w-2xl mx-auto">

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background: '#eef1ec', color: categoryColor[item.category] }}>
                {categoryLabel[item.category]}
              </span>
              <span className="text-xs text-stone-400">{item.readTime}</span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-400">{formatDate(item.date)}</span>
            </div>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', lineHeight: 1.15, letterSpacing: '-0.02em', color: GREEN }}
                className="mb-5">
              {item.title}
            </h1>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#78716c', fontWeight: 300 }}>
              {item.excerpt}
            </p>
          </div>

          <hr className="border-stone-200 mb-10" />

          <div>
            <MDXRemote source={item.content} components={mdxComponents} />
          </div>

          <div className="mt-16 rounded-2xl bg-white p-8 border border-stone-100 text-center"
               style={{ boxShadow: '0 2px 16px rgba(44,59,46,0.06)' }}>
            <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.1rem', color: GREEN, marginBottom: 8 }}>
              Envie de tout gérer au même endroit ?
            </p>
            <p className="text-stone-500 text-sm mb-6" style={{ fontWeight: 300 }}>
              Kaatch vous aide à organiser votre mariage de A à Z — invités, plan de table, budget, photos.
            </p>
            <Link href="/auth"
                  className="inline-block text-white px-8 py-3.5 rounded-xl hover:opacity-90 transition text-sm"
                  style={{ background: GREEN, fontWeight: 500 }}>
              Créer mon espace gratuitement →
            </Link>
          </div>

          <div className="mt-10 text-center">
            <Link href="/inspirations" className="text-sm text-stone-400 hover:text-stone-600 transition" style={{ fontWeight: 300 }}>
              ← Voir toutes les inspirations
            </Link>
          </div>

        </div>
      </article>

    </main>
  )
}
