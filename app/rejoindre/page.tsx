import type { Metadata } from 'next'
import JoindreForm from './JoindreForm'

export const metadata: Metadata = {
  title: 'Rejoindre un mariage — Kaatch',
  description: 'Vous êtes invité(e) à un mariage ? Entrez votre code d\'invitation pour accéder à votre espace personnel : programme, RSVP, album photo.',
  robots: { index: false, follow: false },
}

export default function RejoindrePage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs tracking-[0.4em] uppercase text-[#4a5240] mb-2"
           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          Bienvenue
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '3rem' }}
            className="text-[#2d3228] mb-2">
          Rejoindre un mariage
        </h1>
        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
           className="text-stone-400 mb-10">
          Entrez le code partagé par les mariés ou scannez le QR code.
        </p>

        <JoindreForm />

        <a href="/" className="mt-8 inline-block text-sm text-stone-400 hover:text-[#4a5240] transition"
           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          ← Retour
        </a>
      </div>
    </div>
  )
}
