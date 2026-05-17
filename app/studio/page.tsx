import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Studio Créatif — Bientôt disponible | Kaatch',
  description: "Le Studio Créatif Kaatch arrive bientôt. Créez votre collection de papeterie de mariage personnalisée.",
}

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-400 mb-4" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          Kaatch Studio
        </p>
        <h1 className="text-stone-800 mb-6" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.08, letterSpacing: '-0.02em' }}>
          Bientôt disponible
        </h1>
        <div className="w-12 h-px bg-stone-300 mx-auto mb-6" />
        <p className="text-stone-500 leading-relaxed mb-10" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          Faire-parts, menus, marque-places, plan de table&nbsp;— votre papeterie de mariage sur-mesure arrive très bientôt.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full text-sm text-white"
          style={{ background: '#4a5240', fontFamily: 'var(--font-lato)', fontWeight: 300 }}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
