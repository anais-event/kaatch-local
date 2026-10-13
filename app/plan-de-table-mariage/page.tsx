import type { Metadata } from 'next'
import PlanDeTable from './PlanDeTable'
import SeoContent, { PLAN_DE_TABLE_JSON_LD } from './SeoContent'
import PublicNav from '@/app/_components/PublicNav'

export const metadata: Metadata = {
  title: 'Plan de table mariage gratuit en ligne — Glisser-déposer | Kaatch',
  description: "Créez votre plan de table mariage gratuitement en ligne : ajoutez vos invités, créez vos tables, placez chacun par glisser-déposer. Méthode en 5 étapes, nombre d'invités par table, erreurs à éviter. Sauvegarde auto, export PDF, sans inscription.",
  keywords: [
    'plan de table mariage',
    'plan de table mariage gratuit',
    'plan de table mariage en ligne',
    'créer un plan de table mariage',
    'logiciel plan de table mariage',
    'comment faire un plan de table mariage',
    'placement invités mariage',
    'plan de table mariage excel',
    'modèle plan de table mariage',
    'nombre invités par table mariage',
    'plan de salle mariage',
  ],
  openGraph: {
    title: 'Plan de table mariage gratuit en ligne — Glisser-déposer | Kaatch',
    description: "Ajoutez vos invités, créez vos tables, glissez-déposez pour placer chacun. Méthode, conseils et FAQ. Gratuit, sans inscription.",
    url: 'https://kaatch.fr/plan-de-table-mariage',
    type: 'website',
    images: [{ url: 'https://kaatch.fr/og-image.png', width: 1200, height: 630, alt: 'Plan de table mariage gratuit — Kaatch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan de table mariage gratuit en ligne',
    description: "Glisser-déposer, méthode en 5 étapes, export PDF. Gratuit, sans inscription.",
  },
  alternates: { canonical: 'https://kaatch.fr/plan-de-table-mariage' },
}

export default function PlanDeTablePage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PLAN_DE_TABLE_JSON_LD) }}
      />
      <PublicNav active="plan-de-table-mariage" />

      {/* Outil interactif */}
      <PlanDeTable />

      {/* Contenu éditorial SEO — server-rendered */}
      <SeoContent />
    </main>
  )
}
