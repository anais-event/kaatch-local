import type { Metadata } from 'next'
import GenerateurDiscours from '@/app/discours-mariage/GenerateurDiscours'
import PublicNav from '@/app/_components/PublicNav'

export const metadata: Metadata = {
  title: 'Générateur de discours mariage gratuit — IA | Kaatch',
  description: 'Générez un discours de mariage personnalisé en quelques secondes grâce à l\'IA. Témoin, parents, vœux des mariés — structure, points clés ou discours complet. Gratuit, sans inscription.',
  keywords: [
    'discours mariage',
    'discours témoin mariage',
    'discours témoin mariage original',
    'vœux mariage originaux',
    'discours parents mariage',
    'générateur discours mariage',
    'exemple discours mariage',
    'discours mariage humoristique',
    'discours mariage émouvant',
  ],
  openGraph: {
    title: 'Générateur de discours mariage — IA gratuite | Kaatch',
    description: 'Créez votre discours de mariage en quelques secondes. Témoin, vœux, parents — personnalisé, éditable, export PDF.',
    url: 'https://kaatch.fr/discours-mariage',
    type: 'website',
    images: [
      {
        url: 'https://kaatch.fr/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Générateur de discours mariage — Kaatch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Générateur de discours mariage gratuit — IA',
    description: 'Discours témoin, vœux, parents — généré en direct, éditable, sans inscription.',
  },
  alternates: {
    canonical: 'https://kaatch.fr/discours-mariage',
  },
}

export default function DiscoursPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <PublicNav active="discours-mariage" />
      <GenerateurDiscours />
    </main>
  )
}
