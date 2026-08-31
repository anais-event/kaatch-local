import type { Metadata } from 'next'
import PlanDeTable from './PlanDeTable'
import PublicNav from '@/app/_components/PublicNav'

export const metadata: Metadata = {
  title: 'Plan de table mariage gratuit — Glisser-déposer | Kaatch',
  description: "Créez votre plan de table mariage en ligne gratuitement. Ajoutez vos invités, créez vos tables, placez chacun par glisser-déposer. Sauvegarde automatique, export PDF. Sans inscription.",
  keywords: [
    'plan de table mariage',
    'plan de table mariage gratuit',
    'créer plan de table mariage',
    'logiciel plan de table mariage',
    'plan de table en ligne',
    'placement invités mariage',
    'tableau placement mariage',
  ],
  openGraph: {
    title: 'Plan de table mariage gratuit — Glisser-déposer | Kaatch',
    description: "Créez votre plan de table en ligne : ajoutez vos invités, créez vos tables, glissez-déposez. Gratuit, sans inscription.",
    url: 'https://kaatch.fr/plan-de-table-mariage',
    type: 'website',
    images: [{ url: 'https://kaatch.fr/og-image.png', width: 1200, height: 630, alt: 'Plan de table mariage — Kaatch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan de table mariage gratuit',
    description: "Glisser-déposer, sauvegarde auto, export PDF. Gratuit, sans inscription.",
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
