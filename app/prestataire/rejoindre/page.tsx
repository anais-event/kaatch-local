import type { Metadata } from 'next'
import Link from 'next/link'
import VendorCodeForm from './VendorCodeForm'

export const metadata: Metadata = {
  title: "Espace prestataire — Kaatch",
  description: "Vous êtes prestataire de mariage ? Entrez le code donné par les mariés pour accéder à votre espace dédié.",
}

export default function VendorJoinPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-4" style={{ fontFamily: 'var(--font-lato)' }}>

      <Link href="/" className="mb-10">
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#2C3B2E' }}>
          Kaatch
        </span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f0e8] flex items-center justify-center mx-auto mb-5">
            <span className="text-xl">🤝</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.5rem', color: '#2C3B2E' }} className="mb-2">
            Espace prestataire
          </h1>
          <p style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.6 }} className="text-stone-500 mb-6">
            Entrez le code fourni par les mariés pour accéder aux informations de leur mariage.
          </p>

          <VendorCodeForm />
        </div>

        <div className="text-center mt-6 space-y-2">
          <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400">
            Vous avez reçu un lien ? Cliquez directement dessus.
          </p>
          <Link href="/gestion-prestataires" style={{ fontWeight: 400, fontSize: '0.78rem' }} className="text-[#4a5240] hover:underline">
            En savoir plus sur l'espace prestataire →
          </Link>
        </div>
      </div>
    </main>
  )
}
