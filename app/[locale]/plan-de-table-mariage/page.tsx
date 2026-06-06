import type { Metadata } from 'next'
import PlanDeTable from '@/app/plan-de-table-mariage/PlanDeTable'
import PublicNav from '@/app/_components/PublicNav'

export const metadata: Metadata = {
  title: 'Plan de table mariage gratuit et interactif | Kaatch',
  description: 'Créez votre plan de table mariage en ligne, gratuitement et sans inscription. Ajoutez vos invités, créez vos tables, glissez-déposez. Sauvegarde automatique, export PDF.',
  keywords: [
    'plan de table mariage',
    'plan de table mariage gratuit',
    'logiciel plan de table mariage',
    'plan de table mariage en ligne',
    'créer plan de table mariage',
    'plan de table mariage interactif',
  ],
  openGraph: {
    title: 'Plan de table mariage — Gratuit & Interactif | Kaatch',
    description: 'Créez votre plan de table mariage en quelques minutes. Gratuit, sans inscription, sauvegarde automatique.',
    url: 'https://kaatch.fr/plan-de-table-mariage',
    type: 'website',
    images: [
      {
        url: 'https://kaatch.fr/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Plan de table mariage — Kaatch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan de table mariage gratuit et interactif',
    description: 'Placez vos invités en glisser-déposer. Gratuit, sans inscription.',
  },
  alternates: {
    canonical: 'https://kaatch.fr/plan-de-table-mariage',
  },
}

export default function PlanDeTablePage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <PublicNav active="plan-de-table-mariage" />
      <PlanDeTable />
    </main>
  )
}
