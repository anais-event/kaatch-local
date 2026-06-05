import type { Metadata } from 'next'
import ChecklistMariage from '@/app/checklist-mariage/ChecklistMariage'
import PublicNav from '@/app/_components/PublicNav'

export const metadata: Metadata = {
  title: 'Checklist Mariage 2026 — Liste complète et interactive | Kaatch',
  description: 'Checklist mariage complète et interactive, organisée mois par mois. Cochez les étapes, suivez votre avancement, téléchargez en PDF. Gratuit, sans inscription.',
  keywords: ['checklist mariage', 'liste préparation mariage', 'planning mariage étapes', 'organiser mariage', 'to do list mariage'],
  openGraph: {
    title: 'Checklist Mariage 2026 — Liste complète et interactive',
    description: 'Toutes les étapes pour organiser votre mariage, mois par mois — avec les détails auxquels on ne pense pas toujours. Gratuit.',
    url: 'https://kaatch.fr/checklist-mariage',
    type: 'website',
    images: [
      {
        url: 'https://kaatch.fr/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Checklist Mariage — Kaatch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checklist Mariage 2026 — Liste complète et interactive',
    description: 'Toutes les étapes pour organiser votre mariage, mois par mois. Gratuit.',
  },
  alternates: {
    canonical: 'https://kaatch.fr/checklist-mariage',
  },
}

export default function ChecklistMariagePage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <PublicNav active="checklist-mariage" />
      <ChecklistMariage />
    </main>
  )
}
