import type { Metadata } from 'next'
import ChecklistMariage from './ChecklistMariage'
import PublicNav from '@/app/_components/PublicNav'

export const metadata: Metadata = {
  title: 'Checklist mariage gratuite 2025 — Toutes les étapes | Kaatch',
  description: "Checklist mariage complète et gratuite : toutes les étapes mois par mois, de 18 mois avant à J+1. Cases cochées sauvegardées automatiquement. Sans inscription.",
  keywords: [
    'checklist mariage',
    'liste taches mariage',
    'planning mariage',
    'checklist mariage 2025',
    'to do list mariage',
    'organiser mariage',
    'etapes organisation mariage',
    'checklist mariage gratuite',
  ],
  openGraph: {
    title: 'Checklist mariage gratuite — Toutes les étapes mois par mois | Kaatch',
    description: "Toutes les étapes pour organiser votre mariage, mois par mois. Gratuit, sans inscription, avec sauvegarde automatique.",
    url: 'https://kaatch.fr/checklist-mariage',
    type: 'website',
    images: [{ url: 'https://kaatch.fr/og-image.png', width: 1200, height: 630, alt: 'Checklist mariage — Kaatch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checklist mariage gratuite 2025',
    description: "Toutes les étapes mois par mois — gratuit, sans inscription.",
  },
  alternates: {
    canonical: 'https://kaatch.fr/checklist-mariage',
  },
}

export default function ChecklistPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <PublicNav active="checklist-mariage" />
      <ChecklistMariage />
    </main>
  )
}
